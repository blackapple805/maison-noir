/**
 * Order confirmation email endpoint
 * ---------------------------------
 * POST /api/order-confirmation
 *
 * Sends an editorial receipt email to the customer after checkout. Email
 * is delivered as multipart/alternative — both an HTML version (for
 * modern clients) and a plain-text fallback (for clients that won't
 * render HTML, e.g. accessibility readers and some Outlook profiles).
 *
 * Called fire-and-forget from Checkout.jsx — a failure here MUST NOT
 * prevent the on-screen confirmation page from rendering.
 *
 * Environment variables required:
 *   - RESEND_API_KEY          Resend API key
 *   - ORDERS_FROM_EMAIL       Sender identity
 *   - IP_HASH_SECRET          32+ char secret for hashing IPs
 *   - KV_REDIS_URL            Auto-set by Vercel Redis integration
 *
 * Optional:
 *   - ORDERS_BCC_EMAIL        Internal BCC for record-keeping
 *
 * Security:
 *   - All user input is escaped before insertion into HTML (no XSS)
 *   - Product image URLs are pattern-validated; non-http(s) refused
 *   - IPs hashed before storage; audit entries expire after 30 days
 *   - Rate limit: 10 per IP per hour (legitimate buyers may repeat)
 *   - Origin check restricts to your domain + Vercel preview URLs
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
  orderNumber: { min: 8, max: 32 },
  maxItems: 50,
  itemNameMax: 200,
  addressLineMax: 200,
}

const RATE_LIMIT = { max: 10, windowSeconds: 60 * 60 }
const AUDIT_TTL_SECONDS = 60 * 60 * 24 * 30

const ALLOWED_ORIGINS_EXACT = new Set([
  'https://maison-noir-gray.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
])

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/maison-noir-[a-z0-9-]+\.vercel\.app$/,
  /^https:\/\/maison-noir-[a-z0-9-]+-erics-projects-[a-z0-9]+\.vercel\.app$/,
]

function isAllowedOrigin(origin) {
  if (!origin) return true
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

/**
 * HTML-escape user input before placing it inside email markup. Email
 * clients won't run scripts, but they will render injected style/markup,
 * so we treat everything as untrusted.
 */
function escHtml(s) {
  if (s === null || s === undefined) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Validate a product image URL. Returns the URL if it's http(s), null
 * otherwise. Used to avoid embedding javascript: or data: URLs that
 * could ship malicious content through the inbox.
 */
function safeImageUrl(url) {
  if (!url || typeof url !== 'string') return null
  if (!/^https?:\/\//i.test(url)) return null
  if (url.length > 1000) return null
  return url
}

function fmtEur(n) {
  const v = Number(n) || 0
  return '€' + v.toLocaleString('en-GB', { maximumFractionDigits: 2 })
}

function pad(s, len) {
  const str = String(s)
  if (str.length >= len) return str.slice(0, len)
  return str + ' '.repeat(len - str.length)
}

// ---------------------------------------------------------------
// Redis
// ---------------------------------------------------------------

let redisClient = null
async function getRedis() {
  if (redisClient && redisClient.isOpen) return redisClient
  redisClient = createClient({ url: process.env.KV_REDIS_URL })
  redisClient.on('error', (err) => console.error('Redis error', err?.message || err))
  await redisClient.connect()
  return redisClient
}

async function checkRateLimit(redis, ipHash) {
  const key = `oc:rl:${ipHash}`
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
  await redis.set(`oc:audit:${entry.orderNumber}`, JSON.stringify(entry), { EX: AUDIT_TTL_SECONDS })
}

// ---------------------------------------------------------------
// PLAIN-TEXT VERSION (fallback for clients that won't render HTML)
// ---------------------------------------------------------------

function composeReceiptText(order, firstName) {
  const greeting = firstName ? `Dear ${firstName},` : `Dear friend,`
  const itemLines = order.items.map((it) => {
    const left = `${pad(it.name, 32)} ${pad(it.size || '', 8)}`
    const right = `× ${it.qty}   ${fmtEur(it.lineTotal)}`
    return `${left}${right}`
  })

  return [
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
  ].filter((l) => l !== null).join('\n')
}

// ---------------------------------------------------------------
// HTML VERSION (the editorial one)
// ---------------------------------------------------------------

/**
 * Editorial HTML email. Table-based layout because Outlook still uses
 * Word's HTML renderer, which doesn't understand modern CSS. Every style
 * is inlined because Gmail strips <style> blocks in many contexts.
 *
 * Type system:
 *   Display: Georgia, serif fallback — approximates Cormorant in clients
 *            that don't load web fonts (most of them)
 *   Body:    -apple-system, Helvetica Neue, Helvetica, Arial — clean sans
 *   Mono:    Consolas, Menlo, monospace — for labels
 *
 * Color system:
 *   --bg:  #0A0A0A  (near-black)
 *   --fg:  #E8E2D5  (warm bone)
 *   --dim: #A09A8A  (60% bone)
 *   --rule:#2A2A2A  (hairline)
 *   --ox:  #9C1B2A  (accent oxblood)
 *
 * The email is set to its own color-scheme to prevent Gmail/Apple Mail
 * from inverting colors in dark mode. We design dark-on-dark intentionally.
 */
function composeReceiptHtml(order, firstName) {
  const greeting = firstName ? `Dear ${escHtml(firstName)},` : `Dear friend,`
  const placed = new Date(order.placedAt).toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const itemRows = order.items.map((it, i) => {
    const img = safeImageUrl(it.image)
    const last = i === order.items.length - 1
    return `
      <tr>
        <td style="padding:20px 0;border-bottom:${last ? 'none' : '1px solid #2A2A2A'};">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td valign="top" width="80" style="padding-right:20px;">
                ${
                  img
                    ? `<img src="${escHtml(img)}" alt="${escHtml(it.name)}" width="80" height="100" style="display:block;width:80px;height:100px;object-fit:cover;background:#1C1C1C;border:1px solid #2A2A2A;" />`
                    : `<div style="width:80px;height:100px;background:#1C1C1C;border:1px solid #2A2A2A;"></div>`
                }
              </td>
              <td valign="top" style="color:#E8E2D5;font-family:Georgia,'Times New Roman',serif;">
                <div style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#A09A8A;margin-bottom:6px;">
                  ${escHtml(it.category || '')}
                </div>
                <div style="font-size:20px;line-height:1.2;margin-bottom:6px;color:#E8E2D5;">
                  ${escHtml(it.name)}
                </div>
                <div style="font-family:Consolas,Menlo,monospace;font-size:11px;color:#A09A8A;letter-spacing:0.04em;">
                  Volume ${escHtml(it.size || '—')} · Quantity ${it.qty}
                </div>
              </td>
              <td valign="top" align="right" style="font-family:Consolas,Menlo,monospace;font-size:13px;color:#E8E2D5;white-space:nowrap;padding-left:20px;">
                ${escHtml(fmtEur(it.lineTotal))}
              </td>
            </tr>
          </table>
        </td>
      </tr>`
  }).join('')

  // Roman numeral for the Folio number (purely decorative)
  const folioNumber = String(order.items.length).padStart(2, '0')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>Order confirmation · ${escHtml(order.number)}</title>
<!--[if mso]>
<style type="text/css">
  table, td { font-family: Georgia, serif !important; }
</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background:#0A0A0A;color:#E8E2D5;-webkit-font-smoothing:antialiased;">

<!-- Preheader (hidden, but shown in the inbox preview line) -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
  Your order ${escHtml(order.number)} has been received by the apothecary.
</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#0A0A0A;">
  <tr>
    <td align="center" style="padding:48px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:580px;">

        <!-- Wordmark + folio line -->
        <tr>
          <td align="center" style="padding-bottom:36px;border-bottom:1px solid #2A2A2A;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:0.16em;color:#E8E2D5;margin-bottom:8px;">
              MAISON·NOIR
            </div>
            <div style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#A09A8A;">
              Apothecary · MMXXVI
            </div>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:48px 0 12px 0;">
            <div style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#9C1B2A;margin-bottom:24px;">
              — Order received · Folio · ${folioNumber}
            </div>
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:1.1;color:#E8E2D5;letter-spacing:-0.02em;">
              ${greeting}
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 0 36px 0;">
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#A09A8A;margin:0;">
              Thank you. Your order has been received by the apothecary
              and will be prepared with care. A copy of this confirmation
              has been kept for your records.
            </p>
          </td>
        </tr>

        <!-- Order metadata band -->
        <tr>
          <td style="padding:24px 0;border-top:1px solid #2A2A2A;border-bottom:1px solid #2A2A2A;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td valign="top" style="padding-right:16px;">
                  <div style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#A09A8A;margin-bottom:8px;">
                    Order
                  </div>
                  <div style="font-family:Consolas,Menlo,monospace;font-size:14px;color:#E8E2D5;letter-spacing:0.04em;">
                    ${escHtml(order.number)}
                  </div>
                </td>
                <td valign="top" align="right">
                  <div style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#A09A8A;margin-bottom:8px;">
                    Placed
                  </div>
                  <div style="font-family:Consolas,Menlo,monospace;font-size:13px;color:#E8E2D5;letter-spacing:0.02em;">
                    ${escHtml(placed)}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Items -->
        <tr>
          <td style="padding:36px 0 0 0;">
            <div style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#9C1B2A;margin-bottom:8px;">
              — Preparations
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${itemRows}
            </table>
          </td>
        </tr>

        <!-- Totals -->
        <tr>
          <td style="padding:24px 0;border-top:1px solid #2A2A2A;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family:Consolas,Menlo,monospace;font-size:13px;color:#E8E2D5;">
              <tr>
                <td style="padding:4px 0;color:#A09A8A;">Subtotal</td>
                <td align="right" style="padding:4px 0;">${escHtml(fmtEur(order.totals?.subtotal))}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#A09A8A;">Shipping</td>
                <td align="right" style="padding:4px 0;">${escHtml(fmtEur(order.totals?.shipping))}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#A09A8A;">VAT (included)</td>
                <td align="right" style="padding:4px 0;">${escHtml(fmtEur(order.totals?.vat))}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top:12px;border-top:1px solid #2A2A2A;"></td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#E8E2D5;">Total</td>
                <td align="right" style="padding:8px 0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#E8E2D5;">${escHtml(fmtEur(order.totals?.total))}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Delivery + shipping -->
        <tr>
          <td style="padding:36px 0 0 0;border-top:1px solid #2A2A2A;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td valign="top" width="50%" style="padding-right:16px;">
                  <div style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#9C1B2A;margin-bottom:12px;">
                    — Estimated delivery
                  </div>
                  <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#E8E2D5;margin-bottom:6px;">
                    ${escHtml(order.estimatedDelivery?.start || '—')} – ${escHtml(order.estimatedDelivery?.end || '—')}
                  </div>
                  <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;line-height:1.5;color:#A09A8A;margin:0;">
                    Tracking details will be sent when your folio is dispatched.
                  </p>
                </td>
                <td valign="top" width="50%" style="padding-left:16px;">
                  <div style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#9C1B2A;margin-bottom:12px;">
                    — Shipping to
                  </div>
                  <div style="font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.5;color:#E8E2D5;">
                    ${escHtml(`${order.shipping?.firstName || ''} ${order.shipping?.lastName || ''}`.trim())}<br>
                    ${escHtml(order.shipping?.address1 || '')}<br>
                    ${order.shipping?.address2 ? escHtml(order.shipping.address2) + '<br>' : ''}
                    ${escHtml(order.shipping?.postal || '')} ${escHtml(order.shipping?.city || '')}<br>
                    ${escHtml(order.shipping?.country || '')}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Payment -->
        <tr>
          <td style="padding:36px 0;border-top:1px solid #2A2A2A;">
            <div style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#9C1B2A;margin-bottom:8px;">
              — Paid
            </div>
            <div style="font-family:Consolas,Menlo,monospace;font-size:13px;color:#E8E2D5;">
              Card ending ${escHtml(order.payment?.last4 || '••••')}
            </div>
          </td>
        </tr>

        <!-- Closing -->
        <tr>
          <td align="center" style="padding:48px 0;border-top:1px solid #2A2A2A;">
            <p style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:18px;line-height:1.5;color:#A09A8A;margin:0 0 24px 0;max-width:420px;">
              "The smallest correspondence is held to the same standard
              as a thousand-bottle order."
            </p>
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#A09A8A;margin:0;">
              Should anything require attention, write to
              <a href="mailto:concierge@maisonnoir.apothecary" style="color:#E8E2D5;text-decoration:underline;">concierge@maisonnoir.apothecary</a>,
              quoting <span style="font-family:Consolas,Menlo,monospace;color:#E8E2D5;">${escHtml(order.number)}</span>.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:24px 0 0 0;">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:18px;letter-spacing:0.12em;color:#E8E2D5;margin-bottom:8px;">
              MAISON·NOIR
            </div>
            <div style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#A09A8A;margin-bottom:24px;">
              12 Rue de l'Université · 75007 Paris
            </div>
            <div style="font-family:Consolas,Menlo,monospace;font-size:9px;letter-spacing:0.16em;text-transform:uppercase;color:#5C5648;">
              © MMXXVI · All Rites Reserved
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

</body>
</html>`
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

    // Sanitize each item. Includes image + category this time (HTML uses them).
    const safeItems = items.map((it) => ({
      name: clean(it?.name, LIMITS.itemNameMax),
      category: clean(it?.category, 60),
      image: safeImageUrl(it?.image),
      size: clean(it?.size, 24),
      qty: Math.max(1, Math.min(99, Number(it?.qty) || 1)),
      lineTotal: Number(it?.lineTotal) || 0,
    }))

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

    const safePayment = {
      last4: clean(order.payment?.last4, 4),
    }

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

    const redis = await getRedis()
    const { allowed } = await checkRateLimit(redis, ipHash)
    if (!allowed) {
      return res.status(429).json({ ok: false, error: 'Too many confirmation requests.' })
    }

    // Send both HTML and plain text — clients pick whichever they render.
    const text = composeReceiptText(safeOrder, firstName)
    const html = composeReceiptHtml(safeOrder, firstName)

    const resend = new Resend(process.env.RESEND_API_KEY)
    const sendPayload = {
      from: process.env.ORDERS_FROM_EMAIL,
      to: email,
      subject: `Order confirmation · ${orderNumber} · Maison·Noir`,
      html,
      text,
      replyTo: 'concierge@maisonnoir.apothecary',
    }
    if (process.env.ORDERS_BCC_EMAIL) {
      sendPayload.bcc = process.env.ORDERS_BCC_EMAIL
    }

    const { error: sendError } = await resend.emails.send(sendPayload)

    if (sendError) {
      console.error('order-confirmation: Resend send error', sendError)
      await writeAudit(redis, { orderNumber, ts: new Date().toISOString(), ipHash, outcome: 'send_failed' })
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
