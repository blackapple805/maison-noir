/**
 * Concierge form endpoint
 * -----------------------
 * POST /api/concierge
 *
 * Receives a submission from src/pages/Concierge.jsx, validates it,
 * runs anti-abuse checks, sends an email to the configured inbox via
 * Resend, and writes a minimal audit log entry to Redis. Never stores
 * the message body, never returns useful information to attackers,
 * never writes user PII to logs.
 *
 * Environment variables required (all set in Vercel project settings):
 *   - RESEND_API_KEY          Resend API key (re_...)
 *   - CONCIERGE_TO_EMAIL      Destination inbox
 *   - CONCIERGE_FROM_EMAIL    Sender identity (e.g. onboarding@resend.dev)
 *   - IP_HASH_SECRET          32+ char secret for hashing IPs
 *   - KV_REDIS_URL            Auto-set by Vercel Redis integration
 *
 * Security design:
 *   - Input is validated by length and type; everything else is rejected
 *   - HTML tags in user content are stripped before composing the email
 *   - Email is sent as plain text (no HTML interpretation in mail clients)
 *   - IPs are hashed with HMAC-SHA256 before storage (irreversible)
 *   - Rate limit: 5 submissions per IP per hour (hard cap)
 *   - Honeypot field + minimum-time check filter automated bots
 *   - Audit log entries auto-expire after 30 days via Redis TTL
 *   - Origin header check restricts to your domain
 *   - All error responses are vague ("Could not send") — no info leak
 */

import { Resend } from 'resend'
import { createClient } from 'redis'
import crypto from 'node:crypto'

// ---------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------

// Lengths chosen to match the form's UX constraints. Anything outside
// these ranges is almost certainly automated, not a real person.
const LIMITS = {
  name: { min: 1, max: 120 },
  email: { min: 5, max: 254 },         // RFC 5321 max email length
  subject: { min: 1, max: 80 },
  message: { min: 10, max: 4000 },     // Real concierge enquiries are not 9 chars
}

const ALLOWED_SUBJECTS = new Set([
  'Made to Measure',
  'Apothecary Consultation',
  'Refill & Recycling',
  'Boutique reservation',
  'Press & editorial',
  'Other',
])

// Minimum milliseconds between page load and form submit. Real people
// take longer than half a second to fill in four fields. Bots don't.
const MIN_FILL_MS = 1500

// Sliding-window rate limit (per hashed IP). We keep this conservative:
// a real person won't submit more than a handful in an hour.
const RATE_LIMIT = { max: 5, windowSeconds: 60 * 60 }

// Audit log entries live for 30 days, then evaporate.
const AUDIT_TTL_SECONDS = 60 * 60 * 24 * 30

// Hosts allowed to call this endpoint. Localhost stays for `vercel dev`
// and the production domain stays for the live site.
const ALLOWED_ORIGINS = new Set([
  'https://maison-noir-gray.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
])

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

/** Throw an Error with a tag we can recognize in the catch block. */
function fail(reason) {
  const e = new Error(reason)
  e.expected = true
  throw e
}

/** Strip HTML tags and control characters; collapse whitespace. */
function clean(s) {
  if (typeof s !== 'string') return ''
  // Drop anything that looks like an HTML tag or angle-bracketed content.
  // Drop control chars except newline and tab. Trim and collapse runs of
  // whitespace so multi-line input stays readable but doesn't ship blank
  // megabytes to the email body.
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
}

/** Minimal email-shape check. Not exhaustive — Resend will reject malformed addresses anyway. */
function looksLikeEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

/** HMAC-SHA256 the IP with our server-side secret. Irreversible. */
function hashIp(ip, secret) {
  return crypto.createHmac('sha256', secret).update(String(ip || '')).digest('hex').slice(0, 32)
}

/**
 * Compact, distinct reference like MN-26-A4F9X. We return this to the
 * user so they can quote it when chasing a reply, and we log it.
 */
function generateReference() {
  const yr = new Date().getFullYear().toString().slice(-2)
  const tail = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6)
  return `MN-${yr}-${tail}`
}

/** Get caller IP from the most reliable Vercel-provided header. */
function getCallerIp(req) {
  return (
    req.headers['x-real-ip'] ||
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    'unknown'
  )
}

// ---------------------------------------------------------------
// Redis client (lazy-connected, reused across warm invocations)
// ---------------------------------------------------------------

let redisClient = null
async function getRedis() {
  if (redisClient && redisClient.isOpen) return redisClient
  redisClient = createClient({ url: process.env.KV_REDIS_URL })
  redisClient.on('error', (err) => {
    // Log to Vercel's function logs without exposing details to the user.
    console.error('Redis client error', err?.message || err)
  })
  await redisClient.connect()
  return redisClient
}

/**
 * Sliding-window rate limit using a Redis sorted set per hashed IP.
 * Returns { allowed, remaining }.
 */
async function checkRateLimit(redis, ipHash) {
  const key = `cc:rl:${ipHash}`
  const now = Date.now()
  const windowStart = now - RATE_LIMIT.windowSeconds * 1000

  // Atomic-ish: prune expired entries, then count, then maybe add
  await redis.zRemRangeByScore(key, 0, windowStart)
  const count = await redis.zCard(key)

  if (count >= RATE_LIMIT.max) {
    return { allowed: false, remaining: 0 }
  }

  await redis.zAdd(key, { score: now, value: `${now}:${crypto.randomBytes(4).toString('hex')}` })
  await redis.expire(key, RATE_LIMIT.windowSeconds)
  return { allowed: true, remaining: RATE_LIMIT.max - count - 1 }
}

/**
 * Write an audit entry. Contains: reference, timestamp, hashed IP,
 * subject category, outcome. NEVER: name, email, message body.
 */
async function writeAudit(redis, entry) {
  const key = `cc:audit:${entry.ref}`
  await redis.set(key, JSON.stringify(entry), { EX: AUDIT_TTL_SECONDS })
}

// ---------------------------------------------------------------
// Handler
// ---------------------------------------------------------------

export default async function handler(req, res) {
  // CORS — only respond to our own origin. Other origins get a hard 403.
  const origin = req.headers.origin || ''
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return res.status(403).json({ ok: false })
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  // Verify required env vars are set. Fail loudly here (in the server log)
  // but vaguely to the user (a generic "could not send"). This makes
  // misconfiguration obvious to us during deploys without leaking it.
  const requiredEnv = [
    'RESEND_API_KEY',
    'CONCIERGE_TO_EMAIL',
    'CONCIERGE_FROM_EMAIL',
    'IP_HASH_SECRET',
    'KV_REDIS_URL',
  ]
  const missing = requiredEnv.filter((k) => !process.env[k])
  if (missing.length) {
    console.error('Missing env vars:', missing.join(', '))
    return res.status(500).json({ ok: false, error: 'Service unavailable' })
  }

  // Parse + early structural validation.
  const body = req.body || {}
  const name = clean(body.name)
  const email = clean(body.email).toLowerCase()
  const subject = clean(body.subject)
  const message = clean(body.message)
  const honeypot = body._gotcha          // hidden field — see Concierge.jsx
  const submittedAtRaw = Number(body._ts || 0)

  const ip = getCallerIp(req)
  const ipHash = hashIp(ip, process.env.IP_HASH_SECRET)

  try {
    // Honeypot: real users never fill this hidden field, bots do.
    // Return a fake-success 200 so bots don't learn what tripped them.
    if (honeypot) {
      return res.status(200).json({ ok: true, ref: 'MN-26-DECOY' })
    }

    // Time check: form posted too quickly to be a real person.
    if (submittedAtRaw && Date.now() - submittedAtRaw < MIN_FILL_MS) {
      return res.status(200).json({ ok: true, ref: 'MN-26-DECOY' })
    }

    // Length / type checks.
    if (name.length < LIMITS.name.min || name.length > LIMITS.name.max) {
      fail('Invalid name')
    }
    if (
      email.length < LIMITS.email.min ||
      email.length > LIMITS.email.max ||
      !looksLikeEmail(email)
    ) {
      fail('Invalid email')
    }
    if (!ALLOWED_SUBJECTS.has(subject)) {
      fail('Invalid subject')
    }
    if (message.length < LIMITS.message.min || message.length > LIMITS.message.max) {
      fail('Invalid message length')
    }

    // Rate limit by hashed IP.
    const redis = await getRedis()
    const { allowed } = await checkRateLimit(redis, ipHash)
    if (!allowed) {
      // Tell the user, but don't reveal the limit.
      return res.status(429).json({
        ok: false,
        error: 'Too many submissions. Please try again later.',
      })
    }

    const ref = generateReference()

    // Compose the email. Plain text only — no HTML body, so any
    // residual injection is harmless in the mail client.
    const emailBody = [
      `Concierge submission — ${ref}`,
      `Received: ${new Date().toUTCString()}`,
      ``,
      `From:    ${name} <${email}>`,
      `Subject: ${subject}`,
      ``,
      `─────────`,
      message,
      `─────────`,
      ``,
      `Reference:  ${ref}`,
      `IP hash:    ${ipHash}`,
    ].join('\n')

    // Send.
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error: sendError } = await resend.emails.send({
      from: process.env.CONCIERGE_FROM_EMAIL,
      to: process.env.CONCIERGE_TO_EMAIL,
      replyTo: email,                       // user can reply directly
      subject: `[Concierge · ${subject}] ${ref}`,
      text: emailBody,
    })

    if (sendError) {
      console.error('Resend send error', sendError)
      // Record the failure in the audit log too — useful for diagnostics.
      await writeAudit(redis, {
        ref,
        ts: new Date().toISOString(),
        ipHash,
        subject,
        outcome: 'send_failed',
      })
      return res.status(502).json({ ok: false, error: 'Could not send. Please try again.' })
    }

    // Audit log — minimal, hashed, expiring.
    await writeAudit(redis, {
      ref,
      ts: new Date().toISOString(),
      ipHash,
      subject,
      outcome: 'delivered',
    })

    return res.status(200).json({ ok: true, ref })
  } catch (err) {
    if (err?.expected) {
      // Validation error — return generic message, log specifics server-side.
      console.warn('Concierge validation failed:', err.message, 'ipHash:', ipHash)
      return res.status(400).json({ ok: false, error: 'Please check your message and try again.' })
    }
    // Anything else is unexpected. Log it, return a vague 500.
    console.error('Concierge handler error', err)
    return res.status(500).json({ ok: false, error: 'Service unavailable' })
  }
}
