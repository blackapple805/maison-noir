/**
 * Order confirmation email endpoint
 * ---------------------------------
 * POST /api/order-confirmation
 *
 * Sends a receipt-style confirmation email to the customer after a successful
 * order is placed in Checkout.jsx. Optionally BCCs the house inbox so the
 * concierge has a record.
 *
 * Called non-blocking from the client: a failure here MUST NOT prevent the
 * order from completing on the user's screen. The order still exists locally
 * either way; this endpoint only handles the email side.
 *
 * Environment variables required (set in Vercel project settings):
 *   - RESEND_API_KEY          Resend API key (re_...)
 *   - ORDERS_FROM_EMAIL       Sender identity (e.g. orders@yourdomain.com or onboarding@resend.dev)
 *   - IP_HASH_SECRET          32+ char secret for hashing IPs (reuse the existing one)
 *   - KV_REDIS_URL            Auto-set by Vercel Redis integration
 *
 * Optional environment variables:
 *   - ORDERS_BCC_EMAIL        Internal copy of every order confirmation
 *
 * Security design:
 *   - Input validated by shape, type, and length
 *   - HTML in user fields is stripped before composing the email
 *   - Email body is plain text — no HTML interpretation in client = no XSS risk
 *   - IPs are hashed with HMAC-SHA256 before storage (irreversible)
 *   - Rate limit: 10 confirmations per IP per hour (people may legitimately
 *     order more than once; bots shouldn't be hitting this at all since it
 *     requires a full order payload to even succeed)
 *   - Audit log entries auto-expire after 30 days via Redis TTL
 *   - Origin check restricts to your domain
 *   - All error responses are vague to the client — full detail in server logs
 *   - Never reflects payment details, never logs PII to console
 */

import { Resend } from 'resend'
import { createClient } from 'redis'
import crypto from 'node:crypto'

// ---------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------

const LIMITS = {
  email: { min: 5, max: 254 },
  firstName: { min: 1, max: 80 },
  lastName: { min: 1, max: 80 },
  orderNumber: { min: 8, max: 32 },        // matches MN-YY-XXXXX format
  maxItems: 50,                            // generous — a real bag rarely exceeds this
  itemNameMax: 200,
  addressLineMax: 200,
}

// Confirmation emails: more lenient than concierge because legitimate
// customers may place several orders in a short window (gifts, mistakes,
// retries). Still capped so a compromised checkout can't flood Resend quota.
const RATE_LIMIT = { max: 10, windowSeconds: 60 * 60 }

const AUDIT_TTL_SECONDS = 60 * 60 * 24 * 30

const ALLOWED_ORIGINS_EXACT = new Set([
  'https://maison-noir-gray.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
])

// Match Vercel preview deploys for this project. Vercel generates URLs
// like maison-noir-iysi6q6ek-erics-projects-2a59ff38.vercel.app on every
// push. We allow them by pattern instead of hard-coding each one.
const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/maison-noir-[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/maison-noir-[a-z0-9-]+-erics-projects-[a-z0-9]+\.vercel\.app$/,
]

function isAllowedOrigin(origin) {
  if (!origin) return true                            // same-origin requests sometimes omit the header
  if (ALLOWED_ORIGINS_EXACT.has(origin)) return true
  return ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin))
}

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

function fail(reason) {
  const e = new Error(reason)
  e.expected = true
  throw e
}

function clean(s, maxLen = 500) {
  if (typeof s !== 'string') return ''
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLen)
}

function looksLikeEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function hashIp(ip, secret) {
  return crypto.createHmac('sha256', secret).update(String(ip || '')).digest('hex').slice(0, 32)
}

function getCallerIp(req) {
  return (
    req.headers['x-real-ip'] ||
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    'unknown'
  )
}

/** Format cents-less Euro number for the receipt (€142, €1,250). */
function fmtEur(n) {
  const v = Number(n) || 0
  return '€' + v.toLocaleString('en-GB', { maximumFractionDigits: 2 })
}

/** Right-pad a string for plain-text column alignment in the receipt. */
function pad(s, len) {
  const str = String(s)
  if (str.length >= len) return str.slice(0, len)
  return str + ' '.repeat(len - str.length)
}

// ---------------------------------------------------------------
// Redis client (lazy, reused across warm invocations)
// ---------------------------------------------------------------

let redisClient = null
async function getRedis() {
  if (redisClient && redisClient.isOpen) return redisClient
  redisClient = createClient({ url: process.env.KV_REDIS_URL })
  redisClient.on('error', (err) => {
    console.error('Redis client error', err?.message || err)
  })
  await redisClient.connect()
  return redisClient
}

async function checkRateLimit(redis, ipHash) {
  const key = `oc:rl:${ipHash}`
  const now = Date.now()
  const windowStart = now - RATE_LIMIT.windowSeconds * 1000
  await redis.zRemRangeByScore(key, 0, windowStart)
  const count = await redis.zCard(key)
  if (count >= RATE_LIMIT.max) return { allowed: false, remaining: 0 }
  await redis.zAdd(key, { score: now, value: `${now}:${crypto.randomBytes(4).toString('hex')}` })
  await redis.expire(key, RATE_LIMIT.windowSeconds)
  return { allowed: true, remaining: RATE_LIMIT.max - count - 1 }
}

async function writeAudit(redis, entry) {
  const key = `oc:audit:${entry.orderNumber}`
  await redis.set(key, JSON.stringify(entry), { EX: AUDIT_TTL_SECONDS })
}

/**
 * Compose the plain-text receipt. Editorial tone, narrow column,
 * intentional whitespace, no HTML.
 */
function composeReceipt(order, firstName) {
  const greeting = firstName
    ? `Dear ${firstName},`
    : `Dear friend,`

  const itemLines = order.items.map((it) => {
    const left = `${pad(it.name, 32)} ${pad(it.size || '', 8)}`
    const right = `× ${it.qty}   ${fmtEur(it.lineTotal)}`
    return `${left}${right}`
  })

  const lines = [
    greeting,
    ``,
    `Thank you. Your order has been received by the apothecary`,
    `and will be prepared with care.`,
    ``,
    `──────────────────────────────────────────────`,
    `  ORDER  ${order.number}`,
    `  PLACED ${new Date(order.placedAt).toUTCString()}`,
    `──────────────────────────────────────────────`,
    ``,
    `Preparations`,
    ``,
    ...itemLines,
    ``,
    `──────────────────────────────────────────────`,
    `  Subtotal           ${fmtEur(order.totals?.subtotal)}`,
    `  Shipping           ${fmtEur(order.totals?.shipping)}`,
    `  VAT                ${fmtEur(order.totals?.vat)}`,
    `  ───`,
    `  Total              ${fmtEur(order.totals?.total)}`,
    `──────────────────────────────────────────────`,
    ``,
    `Estimated delivery`,
    `  ${order.estimatedDelivery?.start || '—'} – ${order.estimatedDelivery?.end || '—'}`,
    ``,
    `Shipping to`,
    `  ${order.shipping?.firstName || ''} ${order.shipping?.lastName || ''}`.trim(),
    `  ${order.shipping?.address1 || ''}`,
    order.shipping?.address2 ? `  ${order.shipping.address2}` : null,
    `  ${order.shipping?.postal || ''} ${order.shipping?.city || ''}`,
    `  ${order.shipping?.country || ''}`,
    ``,
    `Paid`,
    `  Card ending ${order.payment?.last4 || '••••'}`,
    ``,
    `──────────────────────────────────────────────`,
    ``,
    `We will write again when your folio is dispatched.`,
    `Should anything require attention, write to`,
    `concierge@maisonnoir.apothecary, quoting ${order.number}.`,
    ``,
    `With care,`,
    `The Apothecary`,
    ``,
    `Maison·Noir`,
    `12 Rue de l'Université · 75007 Paris`,
  ]

  return lines.filter((l) => l !== null).join('\n')
}

// ---------------------------------------------------------------
// Handler
// ---------------------------------------------------------------

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  if (!isAllowedOrigin(origin)) {
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

  const requiredEnv = ['RESEND_API_KEY', 'ORDERS_FROM_EMAIL', 'IP_HASH_SECRET', 'KV_REDIS_URL']
  const missing = requiredEnv.filter((k) => !process.env[k])
  if (missing.length) {
    console.error('order-confirmation: missing env vars:', missing.join(', '))
    return res.status(500).json({ ok: false, error: 'Service unavailable' })
  }

  const ip = getCallerIp(req)
  const ipHash = hashIp(ip, process.env.IP_HASH_SECRET)

  try {
    const body = req.body || {}
    const order = body.order || {}
    const shipping = order.shipping || {}
    const items = Array.isArray(order.items) ? order.items : []

    // Structural validation
    const email = clean(shipping.email, LIMITS.email.max).toLowerCase()
    const firstName = clean(shipping.firstName, LIMITS.firstName.max)
    const lastName = clean(shipping.lastName, LIMITS.lastName.max)
    const orderNumber = clean(order.number, LIMITS.orderNumber.max)

    if (
      email.length < LIMITS.email.min ||
      email.length > LIMITS.email.max ||
      !looksLikeEmail(email)
    ) {
      fail('Invalid customer email')
    }
    if (firstName.length < LIMITS.firstName.min) fail('Missing first name')
    if (lastName.length < LIMITS.lastName.min) fail('Missing last name')
    if (orderNumber.length < LIMITS.orderNumber.min) fail('Invalid order number')
    if (items.length === 0) fail('Order has no items')
    if (items.length > LIMITS.maxItems) fail('Order has too many items')

    // Sanitize each item — they go into the email body
    const safeItems = items.map((it) => ({
      name: clean(it?.name, LIMITS.itemNameMax),
      size: clean(it?.size, 24),
      qty: Math.max(1, Math.min(99, Number(it?.qty) || 1)),
      lineTotal: Number(it?.lineTotal) || 0,
    }))

    // Sanitize shipping fields used in the receipt
    const safeShipping = {
      firstName,
      lastName,
      email,
      address1: clean(shipping.address1, LIMITS.addressLineMax),
      address2: clean(shipping.address2, LIMITS.addressLineMax),
      city: clean(shipping.city, LIMITS.addressLineMax),
      postal: clean(shipping.postal, 32),
      country: clean(shipping.country, 80),
    }

    // Sanitize payment summary (only safe metadata reaches us, but defend anyway)
    const safePayment = {
      last4: clean(order.payment?.last4, 4),
    }

    // Reconstruct a clean order object for the receipt
    const safeOrder = {
      number: orderNumber,
      placedAt: order.placedAt || new Date().toISOString(),
      items: safeItems,
      shipping: safeShipping,
      payment: safePayment,
      totals: {
        subtotal: Number(order.totals?.subtotal) || 0,
        shipping: Number(order.totals?.shipping) || 0,
        vat: Number(order.totals?.vat) || 0,
        total: Number(order.totals?.total) || 0,
      },
      estimatedDelivery: order.estimatedDelivery || null,
    }

    // Rate limit by hashed IP
    const redis = await getRedis()
    const { allowed } = await checkRateLimit(redis, ipHash)
    if (!allowed) {
      return res.status(429).json({
        ok: false,
        error: 'Too many confirmation requests. Please try again later.',
      })
    }

    const receipt = composeReceipt(safeOrder, firstName)

    const resend = new Resend(process.env.RESEND_API_KEY)
    const sendPayload = {
      from: process.env.ORDERS_FROM_EMAIL,
      to: email,
      subject: `Order confirmation · ${orderNumber} · Maison·Noir`,
      text: receipt,
      replyTo: 'concierge@maisonnoir.apothecary',
    }
    if (process.env.ORDERS_BCC_EMAIL) {
      sendPayload.bcc = process.env.ORDERS_BCC_EMAIL
    }

    const { error: sendError } = await resend.emails.send(sendPayload)

    if (sendError) {
      console.error('order-confirmation: Resend send error', sendError)
      await writeAudit(redis, {
        orderNumber,
        ts: new Date().toISOString(),
        ipHash,
        outcome: 'send_failed',
      })
      return res.status(502).json({ ok: false, error: 'Could not send confirmation.' })
    }

    await writeAudit(redis, {
      orderNumber,
      ts: new Date().toISOString(),
      ipHash,
      outcome: 'delivered',
      itemCount: safeItems.length,
      total: safeOrder.totals.total,
    })

    return res.status(200).json({ ok: true, orderNumber })
  } catch (err) {
    if (err?.expected) {
      console.warn('order-confirmation validation failed:', err.message, 'ipHash:', ipHash)
      return res.status(400).json({ ok: false, error: 'Invalid order payload.' })
    }
    console.error('order-confirmation handler error', err)
    return res.status(500).json({ ok: false, error: 'Service unavailable' })
  }
}
