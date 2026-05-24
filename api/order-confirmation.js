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

/**
 * Title-case a customer's name for display in the greeting. Handles
 * lowercase ("eric" → "Eric"), all-caps ("ERIC" → "Eric"), hyphenated
 * ("marie-élise" → "Marie-Élise"), apostrophes ("o'brien" → "O'Brien"),
 * and accented / non-Latin characters. The Unicode `\p{L}` class is
 * what makes the accented and non-Latin cases work.
 *
 * Why we bother: customers often type names hurriedly at checkout
 * (lowercase, all-caps, mixed). Echoing that back in a luxury receipt
 * reads as careless. A Maison takes a beat to greet you properly.
 */
function titleCase(s) {
  if (typeof s !== 'string' || !s) return ''
  return s
    .toLocaleLowerCase()
    .replace(/(^|[\s'\-])(\p{L})/gu, (_, sep, ch) => sep + ch.toLocaleUpperCase())
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
  const displayName = titleCase(firstName)
  const greeting = displayName ? `Dear ${displayName},` : `Dear friend,`
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
// HTML VERSION — adaptive (light default, dark via prefers-color-scheme)
// ---------------------------------------------------------------

/**
 * Editorial HTML email. Table-based layout because Outlook still uses
 * Word's HTML renderer, which doesn't understand modern CSS. Every style
 * is inlined because Gmail strips <style> blocks in many contexts.
 *
 * Theme strategy:
 *   - Base/inline styles are the LIGHT theme. This is what Gmail Web
 *     and Outlook Desktop will always show, because both strip or
 *     ignore @media (prefers-color-scheme).
 *   - A <style> block in <head> declares dark-mode overrides for
 *     clients that DO honor prefers-color-scheme (Apple Mail, iOS
 *     Mail, modern Outlook, Gmail mobile in some configurations).
 *   - Every element that needs to swap colors carries a CSS class
 *     in addition to its inline style. The inline style wins by
 *     default; the @media rule's class selector wins when active.
 *
 * Color systems:
 *   LIGHT (default):
 *     --bg:   #F2EDE2  (warm bone)
 *     --fg:   #161210  (deep ink)
 *     --dim:  #6C645A  (muted ink)
 *     --rule: #DDD3C0  (hairline)
 *     --ox:   #7A1220  (deeper oxblood — reads on cream)
 *
 *   DARK (via media query):
 *     --bg:   #0A0A0A
 *     --fg:   #E8E2D5
 *     --dim:  #A09A8A
 *     --rule: #2A2A2A
 *     --ox:   #9C1B2A
 *
 * Note on product images: grayscale filters can be applied in CSS,
 * but most mail clients ignore CSS filters on <img>. Images render
 * as-is; we accept this and trust the source photography.
 */
function composeReceiptHtml(order, firstName) {
  const displayName = titleCase(firstName)
  const greeting = displayName ? `Dear ${escHtml(displayName)},` : `Dear friend,`
  const placed = new Date(order.placedAt).toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const itemRows = order.items.map((it, i) => {
    const img = safeImageUrl(it.image)
    const last = i === order.items.length - 1
    // The inline border-bottom is the LIGHT value; .row-rule class
    // overrides it in dark mode. We need both because Gmail Web ignores
    // the class and only renders inline.
    return `
      <tr>
        <td class="row-cell row-rule" style="padding:20px 0;border-bottom:${last ? 'none' : '1px solid #DDD3C0'};">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td valign="top" width="80" style="padding-right:20px;">
                ${
                  img
                    ? `<img src="${escHtml(img)}" alt="${escHtml(it.name)}" width="80" height="100" class="thumb" style="display:block;width:80px;height:100px;object-fit:cover;background:#EBE5D7;border:1px solid #DDD3C0;" />`
                    : `<div class="thumb-blank" style="width:80px;height:100px;background:#EBE5D7;border:1px solid #DDD3C0;"></div>`
                }
              </td>
              <td valign="top" class="t-fg" style="color:#161210;font-family:Georgia,'Times New Roman',serif;">
                <div class="t-dim mono" style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#6C645A;margin-bottom:6px;">
                  ${escHtml(it.category || '')}
                </div>
                <div class="t-fg" style="font-size:20px;line-height:1.2;margin-bottom:6px;color:#161210;">
                  ${escHtml(it.name)}
                </div>
                <div class="t-dim mono" style="font-family:Consolas,Menlo,monospace;font-size:11px;color:#6C645A;letter-spacing:0.04em;">
                  Volume ${escHtml(it.size || '—')} · Quantity ${it.qty}
                </div>
              </td>
              <td valign="top" align="right" class="t-fg mono" style="font-family:Consolas,Menlo,monospace;font-size:13px;color:#161210;white-space:nowrap;padding-left:20px;">
                ${escHtml(fmtEur(it.lineTotal))}
              </td>
            </tr>
          </table>
        </td>
      </tr>`
  }).join('')

  const folioNumber = String(order.items.length).padStart(2, '0')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Order confirmation · ${escHtml(order.number)}</title>
<style type="text/css">
  /*
   * Adaptive theming for clients that honor prefers-color-scheme.
   * Inline styles set the LIGHT default; these rules override in dark.
   * Gmail Web ignores all of this — it sees only the light theme.
   * Apple Mail, iOS Mail, modern Outlook honor it.
   */
  :root {
    color-scheme: light dark;
    supported-color-schemes: light dark;
  }

  @media (prefers-color-scheme: dark) {
    body, .body-bg { background-color: #0A0A0A !important; }
    .t-fg { color: #E8E2D5 !important; }
    .t-dim { color: #A09A8A !important; }
    .t-ox { color: #9C1B2A !important; }
    .t-faint { color: #5C5648 !important; }
    .row-rule { border-bottom-color: #2A2A2A !important; }
    .row-rule-top { border-top-color: #2A2A2A !important; }
    .rule-top { border-top-color: #2A2A2A !important; }
    .rule-bottom { border-bottom-color: #2A2A2A !important; }
    .thumb, .thumb-blank { background-color: #1C1C1C !important; border-color: #2A2A2A !important; }
    .link { color: #E8E2D5 !important; }
    .ref-mono { color: #E8E2D5 !important; }
  }

  /*
   * Apple Mail 16+ supports light-dark(). Doesn't help most clients
   * but gives Apple users a clean toggle without media-query weight.
   */
  @supports (color: light-dark(#fff, #000)) {
    .ld-bg { background-color: light-dark(#F2EDE2, #0A0A0A); }
    .ld-fg { color: light-dark(#161210, #E8E2D5); }
    .ld-dim { color: light-dark(#6C645A, #A09A8A); }
    .ld-ox { color: light-dark(#7A1220, #9C1B2A); }
    .ld-rule { border-color: light-dark(#DDD3C0, #2A2A2A); }
  }

  /* Some clients (Outlook, mostly) reset link colors. Lock to our scheme. */
  a { text-decoration: underline; }
</style>
<!--[if mso]>
<style type="text/css">
  table, td { font-family: Georgia, serif !important; }
</style>
<![endif]-->
</head>
<body class="body-bg" style="margin:0;padding:0;background-color:#F2EDE2;-webkit-font-smoothing:antialiased;">

<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
  Your order ${escHtml(order.number)} has been received by the apothecary.
</div>

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="body-bg" style="background-color:#F2EDE2;">
  <tr>
    <td align="center" style="padding:48px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:580px;">

        <!-- Wordmark + folio line -->
        <tr>
          <td align="center" class="rule-bottom" style="padding-bottom:36px;border-bottom:1px solid #DDD3C0;">
            <div class="t-fg" style="font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:0.16em;color:#161210;margin-bottom:8px;">
              MAISON·NOIR
            </div>
            <div class="t-dim mono" style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#6C645A;">
              Apothecary · MMXXVI
            </div>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:48px 0 12px 0;">
            <div class="t-ox mono" style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#7A1220;margin-bottom:24px;">
              — Order received · Folio · ${folioNumber}
            </div>
            <div class="t-fg" style="font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:1.1;color:#161210;letter-spacing:-0.02em;">
              ${greeting}
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 0 36px 0;">
            <p class="t-dim" style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#6C645A;margin:0;">
              Thank you. Your order has been received by the apothecary
              and will be prepared with care. A copy of this confirmation
              has been kept for your records.
            </p>
          </td>
        </tr>

        <!-- Order metadata band -->
        <tr>
          <td class="rule-top rule-bottom" style="padding:24px 0;border-top:1px solid #DDD3C0;border-bottom:1px solid #DDD3C0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td valign="top" style="padding-right:16px;">
                  <div class="t-dim mono" style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#6C645A;margin-bottom:8px;">
                    Order
                  </div>
                  <div class="t-fg mono" style="font-family:Consolas,Menlo,monospace;font-size:14px;color:#161210;letter-spacing:0.04em;">
                    ${escHtml(order.number)}
                  </div>
                </td>
                <td valign="top" align="right">
                  <div class="t-dim mono" style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#6C645A;margin-bottom:8px;">
                    Placed
                  </div>
                  <div class="t-fg mono" style="font-family:Consolas,Menlo,monospace;font-size:13px;color:#161210;letter-spacing:0.02em;">
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
            <div class="t-ox mono" style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#7A1220;margin-bottom:8px;">
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
          <td class="rule-top" style="padding:24px 0;border-top:1px solid #DDD3C0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family:Consolas,Menlo,monospace;font-size:13px;">
              <tr>
                <td class="t-dim" style="padding:4px 0;color:#6C645A;">Subtotal</td>
                <td align="right" class="t-fg" style="padding:4px 0;color:#161210;">${escHtml(fmtEur(order.totals?.subtotal))}</td>
              </tr>
              <tr>
                <td class="t-dim" style="padding:4px 0;color:#6C645A;">Shipping</td>
                <td align="right" class="t-fg" style="padding:4px 0;color:#161210;">${escHtml(fmtEur(order.totals?.shipping))}</td>
              </tr>
              <tr>
                <td class="t-dim" style="padding:4px 0;color:#6C645A;">VAT (included)</td>
                <td align="right" class="t-fg" style="padding:4px 0;color:#161210;">${escHtml(fmtEur(order.totals?.vat))}</td>
              </tr>
              <tr>
                <td colspan="2" class="rule-top" style="padding-top:12px;border-top:1px solid #DDD3C0;"></td>
              </tr>
              <tr>
                <td class="t-fg" style="padding:8px 0;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#161210;">Total</td>
                <td align="right" class="t-fg" style="padding:8px 0;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#161210;">${escHtml(fmtEur(order.totals?.total))}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Delivery + shipping -->
        <tr>
          <td class="rule-top" style="padding:36px 0 0 0;border-top:1px solid #DDD3C0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td valign="top" width="50%" style="padding-right:16px;">
                  <div class="t-ox mono" style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#7A1220;margin-bottom:12px;">
                    — Estimated delivery
                  </div>
                  <div class="t-fg" style="font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#161210;margin-bottom:6px;">
                    ${escHtml(order.estimatedDelivery?.start || '—')} – ${escHtml(order.estimatedDelivery?.end || '—')}
                  </div>
                  <p class="t-dim" style="font-family:Georgia,'Times New Roman',serif;font-size:13px;line-height:1.5;color:#6C645A;margin:0;">
                    Tracking details will be sent when your folio is dispatched.
                  </p>
                </td>
                <td valign="top" width="50%" style="padding-left:16px;">
                  <div class="t-ox mono" style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#7A1220;margin-bottom:12px;">
                    — Shipping to
                  </div>
                  <div class="t-fg" style="font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.5;color:#161210;">
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
          <td class="rule-top" style="padding:36px 0;border-top:1px solid #DDD3C0;">
            <div class="t-ox mono" style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#7A1220;margin-bottom:8px;">
              — Paid
            </div>
            <div class="t-fg mono" style="font-family:Consolas,Menlo,monospace;font-size:13px;color:#161210;">
              Card ending ${escHtml(order.payment?.last4 || '••••')}
            </div>
          </td>
        </tr>

        <!-- Closing -->
        <tr>
          <td align="center" class="rule-top" style="padding:48px 0;border-top:1px solid #DDD3C0;">
            <p class="t-dim" style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:18px;line-height:1.5;color:#6C645A;margin:0 0 24px 0;max-width:420px;">
              "The smallest correspondence is held to the same standard
              as a thousand-bottle order."
            </p>
            <p class="t-dim" style="font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#6C645A;margin:0;">
              Should anything require attention, write to
              <a href="mailto:concierge@maisonnoir.apothecary" class="link" style="color:#161210;text-decoration:underline;">concierge@maisonnoir.apothecary</a>,
              quoting <span class="ref-mono mono" style="font-family:Consolas,Menlo,monospace;color:#161210;">${escHtml(order.number)}</span>.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="padding:24px 0 0 0;">
            <div class="t-fg" style="font-family:Georgia,'Times New Roman',serif;font-size:18px;letter-spacing:0.12em;color:#161210;margin-bottom:8px;">
              MAISON·NOIR
            </div>
            <div class="t-dim mono" style="font-family:Consolas,Menlo,monospace;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#6C645A;margin-bottom:24px;">
              12 Rue de l'Université · 75007 Paris
            </div>
            <div class="t-faint mono" style="font-family:Consolas,Menlo,monospace;font-size:9px;letter-spacing:0.16em;text-transform:uppercase;color:#A09A8A;">
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
      // Force-normalize to digits-only, exactly 4 chars max. Defends
      // against any malformed input from older localStorage records or
      // tampered client payloads (e.g. "VISA1111" or a leading space).
      last4: String(order.payment?.last4 || '').replace(/\D/g, '').slice(-4),
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
