<div align="center">

# MAISON·NOIR

**An editorial apothecary storefront built with React, Vite & Tailwind.**

A dark luxury skincare concept — quiet typography, slow animation, and a checkout flow treated with as much care as the product photography.

[![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055FF?logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![License](https://img.shields.io/badge/License-MIT-E8E2D5)](#license)

</div>

---

## Overview

**MAISON·NOIR** is a fictional independent apothecary — a brand concept exploring what a high-end skincare house looks like when treated like a publication rather than a product catalog. Every layout, micro-interaction, and piece of copy was designed around a single point of view: *care as ritual, the storefront as folio*.

The house composes formulations in small batches between Grasse and Lyon. Twelve formulators, seventeen stages, no rush.

This is a frontend-only project. All products, transactions, and orders are mock — but the checkout flow, validation, and PDF invoice generation are fully functional client-side.

---

## Features

### Design System
- **Dual theme** (auto-detects OS preference, manual toggle persists across sessions)
- **Custom typography stack** — Cormorant Garamond (display), Inter Tight (body), JetBrains Mono (labels)
- **CSS-variable architecture** — every color flows from `:root` tokens for true theme parity
- **Editorial details** — grain overlays, hairline borders, rotated vertical text, marquee tickers, Roman numerals, "N°" and "Folio" notation throughout
- **Ambient amorphous accents** — animated soft blobs that drift behind hero and feature sections
- **Ambient field** — global subtle texture layer for atmospheric depth
- **Theme-aware Lookbook overlays** — spread veils flip between a near-black wash (dark) and a warm bone wash (light) so editorial spreads read cleanly in either mode

### Brand Identity
- **Custom SVG sigil** — drawn from scratch as a React component, scales infinitely, inherits theme color
- **Animated brand reveal** on first session visit (path-drawn loading screen)

### Storefront
- **Cinematic hero** with staggered text reveals and parallax-ready layout
- **Filterable collection grid** with category routing via URL params
- **Product detail page** with sticky info panel, multi-image stack, full specs
- **Quick-view modal** — preview products without leaving the grid (`Esc` to close)
- **Full-screen search** — `Cmd/Ctrl + K` shortcut, live filtering across name, category, colorway, and materials
- **Wishlist** — heart icon on every card, persists across sessions via `localStorage`
- **Editorial lookbook** — parallax full-bleed spreads with scroll-triggered storytelling, per-spread overlay tuning to keep type legible against varying photography
- **Optional hover-video on product cards** — when a product defines a `video` field, the still cross-fades to a muted looping clip on hover. Lazy-mounted (no bandwidth cost until hover), automatically suppressed on touch devices and for users with `prefers-reduced-motion`. Falls back gracefully on missing video files

### House & Services Pages
The footer connects to a full set of editorial pages:

- **Atelier** — the practice of slowness, seventeen stages, twelve formulators
- **Heritage** — chronology of the house from 1947 to MMXXVI
- **Journal** — editorial spreads (alias of Lookbook)
- **Boutiques** — Paris, Grasse, and New York with hours, addresses, and coordinates
- **Made to Measure** — bespoke twelve-week commission flow with phased timeline
- **Apothecary Consultation** — three reading formats (complimentary, seasonal review, deep consultation)
- **Refill & Recycling** — circular glass programme with returns and stats
- **Concierge** — working contact form with client-side state and confirmation reference

### Cart & Checkout
- **Sliding cart drawer** with quantity controls and body-scroll lock
- **Two-column checkout** with progressive disclosure (sections unlock as previous fields validate)
- **Smart form UX:**
  - Card number auto-formats with spaces and detects brand (Visa / Mastercard / Amex / Discover)
  - Expiry auto-formats to `MM / YY` with not-in-the-past validation
  - Luhn algorithm validation for card numbers
  - CVV swaps to 4 digits when Amex is detected
  - Postal codes auto-uppercase
  - Full `autocomplete` hints for browser autofill
- **Processing animation** between submit and confirmation
- **Order confirmation** with order number, delivery estimate, address echo, and itemized breakdown
- **Real PDF invoice** generated client-side with jsPDF (lazy-loaded — only downloads when the user clicks the button)
- **Order persistence** — confirmation page works after refresh, history saved to `localStorage`

### Legal & Compliance
- **Four editorial-styled policy pages** with a shared layout component: Terms, Privacy, Cookies, Modern Slavery Statement
- **Draft-notice banner** at the top of each policy page making clear the text is for portfolio presentation and requires legal review before commercial use
- **Consent architecture** (see below) — `/cookies` includes a live preferences panel with toggles, a real-time storage inspector, and a "Clear all my data" action

### Privacy & Consent System
A first-class, deliberately understated approach to privacy — no banner, no first-visit interruption, but real infrastructure beneath:

- **`ConsentContext`** — central record of user consent by category (`essential`, `analytics`, `marketing`). Use `hasConsent('analytics')` to gate any future analytics or marketing scripts; today only `essential` is active
- **Versioned consent storage** — the stored shape carries a schema version so future migrations are safe
- **Owned-keys allowlist** — the "Clear all my data" button only ever removes keys this site has written, never touches foreign storage
- **Live storage inspector** on `/cookies` — shows the user the exact keys, scopes, and values stored on their device right now
- **Locked-on visual state** for the Essential toggle — visually communicates "on and required" rather than "off"

### Security & Defensive Coding
- **Strict Content Security Policy** — defined in both `public/_headers` (server) and `index.html` (meta) for defense in depth. Blocks framing (`frame-ancestors 'none'`), object embeds, mixed content
- **Security headers** — HSTS preload, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera/mic/geo/FLoC disabled), Cross-Origin opener/resource policies
- **ErrorBoundary** wrapping the entire app — render-time crashes show an editorial-styled fallback with reload action rather than blanking the screen
- **Hardened storage access** — every `localStorage` / `sessionStorage` call is wrapped in `try/catch`. Safari Private Browsing, embedded iframes, and storage quota errors no longer crash the app
- **Graceful image fallbacks** — broken Unsplash URLs hide silently rather than collapsing layouts with alt text in empty boxes
- **Dependency hygiene** — `jspdf` pinned to a current major to patch the legacy `dompurify` XSS chain; remaining `npm audit` warnings are documented as development-only (Vite dev server)

### Performance & Accessibility
- Lazy-loaded heavy dependencies (jsPDF)
- All images use native `loading="lazy"`
- Hover videos are lazy-mounted (zero network cost until hover)
- Theme applied before first paint (no flash of wrong theme)
- Keyboard navigation (`Cmd/Ctrl + K` for search, `Esc` closes modals)
- ARIA labels on icon-only buttons; `role="switch"` and `aria-checked` on toggle controls
- Decorative duplicate content marked `aria-hidden`
- `prefers-reduced-motion` respected by hover-video logic
- `(hover: none)` media query suppresses hover-only effects on touch devices
- 404 page for unknown routes

### SEO
- **Sitemap** (`public/sitemap.xml`) listing all public routes with appropriate priorities and change frequencies
- **robots.txt** disallowing `/checkout` and `/confirmation/` (transient, order-specific pages)
- **Open Graph** and **Twitter Card** meta tags for clean link previews on iMessage, Slack, Twitter, LinkedIn
- **Canonical URL** declared in `<head>`
- Page-specific titles and descriptions

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| **Framework** | React 18 |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3 (with CSS variable theming) |
| **Motion** | Framer Motion 11 |
| **Routing** | React Router 6 |
| **PDF Generation** | jsPDF 4 (lazy-loaded) |
| **Icons** | Lucide React + custom SVG |
| **State** | React Context + `useReducer` |
| **Persistence** | `localStorage` (theme, wishlist, orders, consent) + `sessionStorage` (loading screen) |
| **Type Safety** | Plain JS (kept simple for portfolio readability) |

---

## Setup

### Prerequisites
- **Node.js 18+** ([download](https://nodejs.org))
- **npm** (comes with Node)

### Install

```bash
# Clone
git clone https://github.com/blackapple805/maison-noir.git
cd maison-noir

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

The production build outputs to `/dist`.

---

## Project Structure

```
public/
├── _headers                       # Production security headers (Netlify / Cloudflare)
├── robots.txt
└── sitemap.xml

src/
├── components/
│   ├── Nav.jsx                    # Top navigation with theme toggle
│   ├── Hero.jsx                   # Cinematic landing hero
│   ├── Logo.jsx                   # SVG sigil + wordmark
│   ├── Marquee.jsx                # Scrolling editorial ticker
│   ├── ProductCard.jsx            # Grid card with quick-view, wishlist, hover-video
│   ├── CartDrawer.jsx             # Sliding bag panel
│   ├── QuickView.jsx              # Product preview modal
│   ├── SearchOverlay.jsx          # Cmd+K full-screen search
│   ├── ThemeToggle.jsx            # Sun/moon switcher
│   ├── LoadingScreen.jsx          # First-visit brand intro
│   ├── AmbientField.jsx           # Global atmospheric texture
│   ├── AmorphousBlob.jsx          # Animated soft accent shape
│   ├── ErrorBoundary.jsx          # Editorial fallback for render-time crashes
│   ├── Footer.jsx                 # Site footer with newsletter + links
│   └── Field.jsx                  # Reusable form input
│
├── context/
│   ├── ThemeContext.jsx           # Dark/light theme, system preference, hardened storage
│   ├── CartContext.jsx            # Cart state + reducer
│   ├── WishlistContext.jsx        # Saved pieces persistence
│   ├── OrderContext.jsx           # Order placement and history
│   └── ConsentContext.jsx         # Consent state + owned-keys allowlist
│
├── pages/
│   ├── Home.jsx                   # Landing
│   ├── Collection.jsx             # Filterable product grid
│   ├── Product.jsx                # Product detail
│   ├── Lookbook.jsx               # Editorial scroll spreads (theme-aware overlays)
│   ├── Atelier.jsx                # The practice
│   ├── Heritage.jsx               # Chronology of the house
│   ├── Boutiques.jsx              # Physical locations
│   ├── MadeToMeasure.jsx          # Bespoke commission
│   ├── ApothecaryConsultation.jsx # Reading formats
│   ├── RefillRecycling.jsx        # Circular glass programme
│   ├── Concierge.jsx              # Contact form
│   ├── Wishlist.jsx               # Saved pieces
│   ├── Checkout.jsx               # Two-column form flow
│   ├── Confirmation.jsx           # Order confirmation + PDF
│   ├── LegalPage.jsx              # Shared layout for the four policy pages
│   ├── Terms.jsx                  # Terms of Service (draft)
│   ├── Privacy.jsx                # Privacy Policy (draft, GDPR-structured)
│   ├── Cookies.jsx                # Cookies Policy + live preferences panel
│   ├── ModernSlavery.jsx          # Modern Slavery Statement (draft)
│   └── NotFound.jsx               # 404
│
├── data/
│   └── products.js                # Mock formulary
│
├── utils/
│   ├── card.js                    # Luhn, brand detection, formatters
│   └── invoice.js                 # jsPDF invoice generator
│
├── App.jsx                        # Routes + providers
├── main.jsx                       # Entry point + provider tree + ErrorBoundary
└── index.css                      # Tailwind + CSS variable tokens
```

---

## Routes

| Path | Description |
|------|-------------|
| `/` | Home |
| `/collection` | Formulary grid |
| `/collection?cat=Serums` | Filtered by category |
| `/product/:id` | Product detail |
| `/lookbook` | Editorial spreads |
| `/journal` | Alias of Lookbook |
| `/atelier` | The practice |
| `/heritage` | Chronology |
| `/boutiques` | Locations |
| `/made-to-measure` | Bespoke commission |
| `/consultation` | Apothecary consultation |
| `/refill` | Refill & recycling |
| `/concierge` | Contact form |
| `/wishlist` | Saved pieces |
| `/checkout` | Checkout flow |
| `/confirmation/:number` | Order confirmation |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/cookies` | Cookies Policy + preferences panel |
| `/modern-slavery` | Modern Slavery Statement |
| `*` | 404 |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd/Ctrl + K` | Open search |
| `Esc` | Close any modal or overlay |
| `Space` / `Enter` | Toggle a focused consent switch |

---

## Customization

### Brand name
Search the codebase for `MAISON·NOIR` and replace with your brand. Update the `<title>` in `index.html` and the favicon SVG inline.

### Color palette
Edit `src/index.css`:

```css
:root, [data-theme='dark'] {
  --bg: #0A0A0A;     /* page background */
  --fg: #E8E2D5;     /* text color */
  --accent: #9C1B2A; /* oxblood accent */
  /* ... */
}

[data-theme='light'] {
  --bg: #F2EDE2;
  --fg: #161210;
  --accent: #7A1220;
}
```

### Products
Replace mock data in `src/data/products.js`. Each product needs:

```js
{
  id: 'unique-slug',
  name: 'Display Name',
  category: 'Serums',
  season: 'Batch 26 / 01',
  price: 142,
  colorway: 'Vitamin C',
  materials: 'L-Ascorbic Acid · Ferulic Acid · Vitamin E',
  origin: 'Formulated in Lyon',
  description: 'Long-form editorial description.',
  image: 'https://path-to-image.jpg',
  // Optional — adds a hover-video swap on this card.
  // Drop the file in public/videos/ and reference it as /videos/name.mp4
  video: '/videos/serum-lumiere.mp4',
  sizes: ['30ml', '50ml'],
}
```

### Hover-video filming notes
- 3–5 seconds long, no audio, loops cleanly
- 3:4 aspect (720×960 or 1080×1440) to match the card
- Under 1.5 MB per clip — H.264 mp4, CRF 26
- Match the still's lighting and mood; the video is a continuation, not a different shot

Recommended ffmpeg command:

```bash
ffmpeg -i source.mov -t 4 -vf "scale=720:960,setsar=1" -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -an -movflags +faststart output.mp4
```

### Hero image
Edit `src/components/Hero.jsx` and replace the Unsplash URL.

### Lookbook spreads
Edit the `spreads` array in `src/pages/Lookbook.jsx`. Each spread can set its own `overlay` strength (0–1) and `side` (`'left'` / `'right'`) for the theme-aware veil system.

### Boutique locations
Edit the `boutiques` array in `src/pages/Boutiques.jsx`.

### Concierge form endpoint
The form in `src/pages/Concierge.jsx` currently captures messages client-side only. To wire it to a real backend, replace the body of `handleSubmit` with a `fetch()` call to your provider of choice (Formspree, Resend, EmailJS, or a custom endpoint).

### Adding a new consent category
1. Add the key to `DEFAULT_STATE` in `src/context/ConsentContext.jsx`
2. Add a row in the toggles UI on `src/pages/Cookies.jsx`
3. Guard the relevant initialization with `hasConsent('newKey')`

### Adding analytics later (example)
```jsx
import { useConsent } from './context/ConsentContext'

const { hasConsent } = useConsent()
useEffect(() => {
  if (hasConsent('analytics')) {
    // initialize Plausible / GA / etc. here
  }
}, [hasConsent])
```

---

## Testing the Checkout

Use these standard test card numbers (all pass Luhn validation):

| Card | Number | CVV |
|------|--------|-----|
| Visa | `4111 1111 1111 1111` | any 3 digits |
| Mastercard | `5555 5555 5555 4444` | any 3 digits |
| Amex | `3782 822463 10005` | any 4 digits |
| Discover | `6011 1111 1111 1117` | any 3 digits |

Use any future expiry date (`12 / 28` works).

No real payment is processed — the order is saved to `localStorage` and a PDF invoice is generated client-side.

---

## Deployment

### Vercel (recommended)
```bash
npm install -g vercel
vercel
```
Or connect the GitHub repo at [vercel.com/new](https://vercel.com/new) for automatic deploys on every push.

### Netlify
Build command: `npm run build`
Publish directory: `dist`

The included `public/_headers` file applies the production security headers automatically on Netlify and Cloudflare Pages.

### Before going live
- Replace `https://maison-noir.vercel.app` in `public/sitemap.xml`, `public/robots.txt`, and the meta tags in `index.html` with your real production URL
- Drop a 1200×630 share image at `public/og-image.png` (referenced by the OG / Twitter meta tags)
- Have a qualified lawyer review the four legal pages before relying on them commercially — the on-page draft notice should be removed once the text is finalised

### Other hosts
Any static host works. Build with `npm run build` and serve the `/dist` folder.

---

## Roadmap

Potential next steps if extending into a real project:

- [ ] Wire the Concierge form to a real email service (Resend / Formspree)
- [ ] Wire the newsletter subscription form to an audience provider
- [ ] Wire real analytics (Plausible / PostHog) behind the existing consent gate
- [ ] Real backend (Supabase / Firebase) for products and orders
- [ ] Real payment (Stripe Checkout or Elements)
- [ ] Customer accounts with order history
- [ ] CMS integration (Sanity, Contentful) for product editing
- [ ] Multi-language support (i18n)
- [ ] Product image galleries with zoom
- [ ] Real shipping rate API (EasyPost, ShipStation)
- [ ] Inventory management
- [ ] Real refill return label generation
- [ ] Replace placeholder hover-video clips with bespoke product footage

---

## Credits

- **Product photography** — [Unsplash](https://unsplash.com) (CC0 license)
- **Typefaces** — [Google Fonts](https://fonts.google.com)
- **Icons** — [Lucide](https://lucide.dev) + custom SVG

---

## License

MIT © 2026 — built as a portfolio piece. Free to fork, learn from, and adapt.

---

<div align="center">

**Built by [Eric Del Angel](https://github.com/blackapple805)**

</div>
