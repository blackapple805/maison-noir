/**
 * Newsletter subscribe endpoint
 * -----------------------------
 * POST /api/subscribe
 *
 * Receives an email from the Footer's newsletter form and adds it as a
 * contact in our Resend Audience. Once a subscriber is in the audience,
 * we can later compose broadcasts from the Resend dashboard and send
 * the quarterly dispatch to everyone at once.
 *
 * Same anti-abuse posture as the Concierge function:
 *   - Honeypot + minimum-time check filter automated bots
 *   - Per-hashed-IP rate limit (sliding window)
 *   - Audit log entries with hashed IPs, 30-day TTL, no PII
 *   - Generic error responses (no info leak)
 *
 * Differences from Concierge:
 *   - Only collects email; no name, subject, or message
 *   - Already-subscribed emails return a friendly success (not an error),
 *     so the form can't be used to probe whether an email is on the list
 *   - No transactional email is sent (single opt-in by design)
 *
 * Environment variables required:
 *   - RESEND_API_KEY           Resend API key (re_...)
 *   - RESEND_AUDIENCE_ID       UUID of the Resend Audience to add to
 *   - IP_HASH_SECRET           Same secret as the Concierge function
 *   - KV_REDIS_URL             Auto-set by Vercel Redis integration
 */

import { Resend } from 'resend'
import { createClient } from 'redis'
import crypto from 'node:crypto'

// ---------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------

const EMAIL_MAX = 254 // RFC 5321 max email length

const MIN_FILL_MS = 1000      // newsletter form is faster than Concierge

// Subscribes per hashed IP per hour. Lower than Concierge — a real
// person doesn't sign up to the same newsletter five times in an hour.
const RATE_LIMIT = { max: 3, windowSeconds: 60 * 60 }

const AUDIT_TTL_SECONDS = 60 * 60 * 24 * 30

const ALLOWED_ORIGINS = new Set([
  'https://maison-noir-gray.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
])

// ---------------------------------------------------------------
// Helpers (same patterns as concierge.js)
// ---------------------------------------------------------------

function clean(s) {
  if (typeof s !== 'string') return ''
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
}

function looksLikeEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function hashIp(ip, secret) {
  return crypto.createHmac('sha256', secret).update(String(ip || '')).digest('hex').slice(0, 32)
}

function generateReference() {
  const yr = new Date().getFullYear().toString().slice(-2)
  const tail = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6)
  return `MN-NL-${yr}-${tail}`
}

function getCallerIp(req) {
  return (
    req.headers['x-real-ip'] ||
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    'unknown'
  )
}

let redisClient = null
async function getRedis() {
  if (redisClient && redisClient.isOpen) return redisClient
  redisClient = createClient({ url: process.env.KV_REDIS_URL })
  redisClient.on('error', (err) => console.error('Redis error', err?.message || err))
  await redisClient.connect()
  return redisClient
}

async function checkRateLimit(redis, ipHash) {
  const key = `nl:rl:${ipHash}`
  const now = Date.now()
  const windowStart = now - RATE_LIMIT.windowSeconds * 1000
  await redis.zRemRangeByScore(key, 0, windowStart)
  const count = await redis.zCard(key)
  if (count >= RATE_LIMIT.max) return { allowed: false }
  await redis.zAdd(key, { score: now, value: `${now}:${crypto.randomBytes(4).toString('hex')}` })
  await redis.expire(key, RATE_LIMIT.windowSeconds)
  return { allowed: true }
}

async function writeAudit(redis, entry) {
  await redis.set(`nl:audit:${entry.ref}`, JSON.stringify(entry), { EX: AUDIT_TTL_SECONDS })
}

// ---------------------------------------------------------------
// Handler
// ---------------------------------------------------------------

export default async function handler(req, res) {
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

  const required = ['RESEND_API_KEY', 'RESEND_AUDIENCE_ID', 'IP_HASH_SECRET', 'KV_REDIS_URL']
  const missing = required.filter((k) => !process.env[k])
  if (missing.length) {
    console.error('Missing env vars:', missing.join(', '))
    return res.status(500).json({ ok: false, error: 'Service unavailable' })
  }

  const body = req.body || {}
  const email = clean(body.email).toLowerCase()
  const honeypot = body._gotcha
  const submittedAtRaw = Number(body._ts || 0)

  const ip = getCallerIp(req)
  const ipHash = hashIp(ip, process.env.IP_HASH_SECRET)

  try {
    // Honeypot: fake-success so bots learn nothing.
    if (honeypot) {
      return res.status(200).json({ ok: true })
    }

    // Time check: too fast = bot.
    if (submittedAtRaw && Date.now() - submittedAtRaw < MIN_FILL_MS) {
      return res.status(200).json({ ok: true })
    }

    // Validation.
    if (!email || email.length > EMAIL_MAX || !looksLikeEmail(email)) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' })
    }

    // Rate limit.
    const redis = await getRedis()
    const { allowed } = await checkRateLimit(redis, ipHash)
    if (!allowed) {
      return res.status(429).json({ ok: false, error: 'Too many attempts. Please try again later.' })
    }

    const ref = generateReference()

    // Add to Resend Audience.
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error: addError } = await resend.contacts.create({
      audienceId: process.env.RESEND_AUDIENCE_ID,
      email,
      unsubscribed: false,
    })

    // Resend returns success even if the contact already exists in the
    // audience. If we ever get a real error, it'll be a malformed audience
    // ID or auth failure — log it server-side, return a vague client error.
    // IMPORTANT: we never expose "already subscribed" — that would let
    // someone probe the list to find out if an email is on it.
    if (addError) {
      console.error('Resend audience add error', addError)
      await writeAudit(redis, {
        ref,
        ts: new Date().toISOString(),
        ipHash,
        outcome: 'add_failed',
      })
      // Friendly success regardless — the user gets the same UI whether
      // they were already subscribed or genuinely added. Privacy by design.
      return res.status(200).json({ ok: true })
    }

    await writeAudit(redis, {
      ref,
      ts: new Date().toISOString(),
      ipHash,
      outcome: 'subscribed',
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Subscribe handler error', err)
    return res.status(500).json({ ok: false, error: 'Service unavailable' })
  }
}
