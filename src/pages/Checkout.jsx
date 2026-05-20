import { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useOrder } from '../context/OrderContext'
import Field from '../components/Field'
import {
  formatCardNumber,
  detectBrand,
  formatExpiry,
  luhnValid,
  expiryValid,
  cvvValid,
} from '../utils/card'

const COUNTRIES = [
  'France', 'United Kingdom', 'United States', 'Italy', 'Spain',
  'Germany', 'Netherlands', 'Belgium', 'Switzerland', 'Japan', 'Canada', 'Australia',
]

export default function Checkout() {
  const { items, total, dispatch } = useCart()
  const { placeOrder } = useOrder()
  const navigate = useNavigate()

  // Form state
  const [data, setData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    postal: '',
    country: 'France',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: '',
  })
  const [touched, setTouched] = useState({})
  const [processing, setProcessing] = useState(false)

  const set = (field) => (e) => {
    let value = e.target.value
    if (field === 'cardNumber') value = formatCardNumber(value)
    if (field === 'expiry') value = formatExpiry(value)
    if (field === 'cvv') value = value.replace(/\D/g, '').slice(0, 4)
    if (field === 'postal') value = value.toUpperCase().slice(0, 12)
    setData((d) => ({ ...d, [field]: value }))
  }

  const touch = (field) => () => setTouched((t) => ({ ...t, [field]: true }))

  const brand = detectBrand(data.cardNumber)

  // Validation
  const errs = useMemo(() => {
    const e = {}
    if (touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      e.email = 'Enter a valid email address.'
    }
    if (touched.firstName && data.firstName.trim().length < 1) e.firstName = 'Required.'
    if (touched.lastName && data.lastName.trim().length < 1) e.lastName = 'Required.'
    if (touched.address1 && data.address1.trim().length < 3) e.address1 = 'Required.'
    if (touched.city && data.city.trim().length < 1) e.city = 'Required.'
    if (touched.postal && data.postal.trim().length < 3) e.postal = 'Required.'
    if (touched.cardName && data.cardName.trim().length < 2) e.cardName = 'Required.'
    if (touched.cardNumber && !luhnValid(data.cardNumber)) e.cardNumber = 'Invalid card number.'
    if (touched.expiry && !expiryValid(data.expiry)) e.expiry = 'Invalid or expired.'
    if (touched.cvv && !cvvValid(data.cvv, brand)) {
      e.cvv = brand === 'amex' ? '4 digits required.' : '3 digits required.'
    }
    return e
  }, [data, touched, brand])

  // Section completion flags (for progressive disclosure)
  const contactComplete = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
  const shippingComplete =
    contactComplete &&
    data.firstName.trim() && data.lastName.trim() &&
    data.address1.trim() && data.city.trim() && data.postal.trim()
  const paymentValid =
    luhnValid(data.cardNumber) &&
    expiryValid(data.expiry) &&
    cvvValid(data.cvv, brand) &&
    data.cardName.trim().length >= 2

  const canSubmit = contactComplete && shippingComplete && paymentValid && items.length > 0

  // Totals
  const subtotal = total
  const shipping = 0 // complimentary
  const vat = Math.round(subtotal * 0.20 * 100) / 100 // 20% included
  const grand = subtotal

  // Empty cart guard
  useEffect(() => {
    if (items.length === 0 && !processing) {
      // Don't redirect immediately — let user see the empty state
    }
  }, [items.length, processing])

  const onSubmit = async (e) => {
    e.preventDefault()
    // Force-touch all fields to show any errors
    setTouched({
      email: true, firstName: true, lastName: true,
      address1: true, city: true, postal: true,
      cardNumber: true, expiry: true, cvv: true, cardName: true,
    })
    if (!canSubmit) return

    setProcessing(true)
    // Simulate gateway delay — feels real
    await new Promise((r) => setTimeout(r, 2200))

    const order = placeOrder({
      items,
      shipping: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address1: data.address1,
        address2: data.address2,
        city: data.city,
        postal: data.postal,
        country: data.country,
      },
      payment: {
        method: 'card',
        brand,
        last4: data.cardNumber.replace(/\D/g, '').slice(-4),
        name: data.cardName,
      },
      totals: { subtotal, shipping, vat, total: grand },
    })

    // Clear cart
    items.forEach((i) => dispatch({ type: 'REMOVE', key: i.key }))
    navigate(`/confirmation/${order.number}`, { replace: true })
  }

  // Empty cart state
  if (items.length === 0 && !processing) {
    return (
      <div className="pt-40 pb-40 px-6 md:px-10 text-center">
        <div className="editorial-label text-accent mb-6">— Checkout</div>
        <p className="font-display italic text-5xl text-fg-muted mb-8">Your bag is empty.</p>
        <Link to="/collection" className="editorial-label link-line hover:text-accent">
          Enter the Collection →
        </Link>
      </div>
    )
  }

  return (
    <>
      <ProcessingOverlay show={processing} />
      <div className="pt-28 md:pt-32 pb-20 px-6 md:px-10">
        {/* Header */}
        <div className="border-b hairline pb-8 mb-12 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="editorial-label text-accent mb-3">— Folio · 004</p>
            <h1 className="font-display text-5xl md:text-7xl tracking-tighter2 leading-none">
              Checkout
            </h1>
          </div>
          <Link to="/collection" className="editorial-label link-line hover:text-accent">
            ← Continue browsing
          </Link>
        </div>

        <form onSubmit={onSubmit} className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* LEFT — Form */}
          <div className="lg:col-span-7 space-y-14">
            {/* Section 1 — Contact */}
            <Section number="01" title="Contact" complete={contactComplete}>
              <Field
                label="Email"
                type="email"
                placeholder="your.address@elsewhere.com"
                required
                autoComplete="email"
                value={data.email}
                onChange={set('email')}
                onBlur={touch('email')}
                error={errs.email}
                hint="Order confirmation and invoice will be sent here."
              />
            </Section>

            {/* Section 2 — Shipping */}
            <Section
              number="02"
              title="Shipping Address"
              complete={shippingComplete}
              locked={!contactComplete}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <Field
                  label="First Name" required autoComplete="given-name"
                  value={data.firstName} onChange={set('firstName')} onBlur={touch('firstName')}
                  error={errs.firstName}
                />
                <Field
                  label="Last Name" required autoComplete="family-name"
                  value={data.lastName} onChange={set('lastName')} onBlur={touch('lastName')}
                  error={errs.lastName}
                />
              </div>
              <Field
                label="Address" required autoComplete="address-line1"
                placeholder="Street and number"
                value={data.address1} onChange={set('address1')} onBlur={touch('address1')}
                error={errs.address1}
              />
              <Field
                label="Apt, Suite, Floor"
                autoComplete="address-line2"
                placeholder="Optional"
                value={data.address2} onChange={set('address2')}
              />
              <div className="grid md:grid-cols-3 gap-6">
                <Field
                  label="City" required autoComplete="address-level2"
                  value={data.city} onChange={set('city')} onBlur={touch('city')}
                  error={errs.city}
                />
                <Field
                  label="Postal Code" required autoComplete="postal-code"
                  value={data.postal} onChange={set('postal')} onBlur={touch('postal')}
                  error={errs.postal}
                />
                <label className="block">
                  <div className="editorial-label mb-2">Country</div>
                  <select
                    value={data.country}
                    onChange={set('country')}
                    className="w-full bg-transparent border-b hairline py-3 text-fg outline-none focus:border-fg transition-colors appearance-none cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c} className="bg-bg text-fg">{c}</option>
                    ))}
                  </select>
                </label>
              </div>
              <Field
                label="Phone"
                type="tel"
                autoComplete="tel"
                placeholder="For delivery only"
                value={data.phone} onChange={set('phone')}
              />
            </Section>

            {/* Section 3 — Payment */}
            <Section
              number="03"
              title="Payment"
              complete={paymentValid}
              locked={!shippingComplete}
            >
              <div className="bg-bg-elev/40 border hairline p-5 mb-2 flex items-center justify-between editorial-label">
                <div className="flex items-center gap-3">
                  <LockIcon /> Encrypted · PCI DSS Compliant
                </div>
                <span className="text-fg-dim hidden sm:block">Mock checkout — no real charge</span>
              </div>

              <Field
                label="Cardholder Name" required autoComplete="cc-name"
                value={data.cardName} onChange={set('cardName')} onBlur={touch('cardName')}
                error={errs.cardName}
              />
              <Field
                label="Card Number" required autoComplete="cc-number"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={data.cardNumber} onChange={set('cardNumber')} onBlur={touch('cardNumber')}
                error={errs.cardNumber}
                right={<CardBrand brand={brand} />}
              />
              <div className="grid grid-cols-2 gap-6">
                <Field
                  label="Expiry" required autoComplete="cc-exp"
                  inputMode="numeric"
                  placeholder="MM / YY"
                  value={data.expiry} onChange={set('expiry')} onBlur={touch('expiry')}
                  error={errs.expiry}
                />
                <Field
                  label={brand === 'amex' ? 'CID' : 'CVV'} required autoComplete="cc-csc"
                  inputMode="numeric"
                  placeholder={brand === 'amex' ? '0000' : '000'}
                  value={data.cvv} onChange={set('cvv')} onBlur={touch('cvv')}
                  error={errs.cvv}
                />
              </div>
            </Section>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!canSubmit || processing}
                className="w-full py-5 bg-fg text-bg font-mono text-xs tracking-editorial uppercase hover:bg-accent transition-colors duration-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing…' : `Confirm and Place Order · €${grand.toLocaleString()}`}
              </button>
              <p className="editorial-label text-fg-dim mt-4 text-center">
                By placing this order you agree to our terms of service.
              </p>
            </div>
          </div>

          {/* RIGHT — Sticky summary */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 border hairline bg-bg-elev/30 grain">
              <div className="px-6 py-5 border-b hairline flex items-center justify-between">
                <div>
                  <div className="editorial-label text-fg-dim">Your Folio</div>
                  <div className="font-display text-2xl tracking-tighter2">
                    {items.reduce((s, i) => s + i.qty, 0)} pieces
                  </div>
                </div>
                <Link to="/collection" className="editorial-label link-line hover:text-accent">
                  Edit
                </Link>
              </div>

              <ul className="px-6 py-4 space-y-4 max-h-[400px] overflow-y-auto">
                {items.map((item) => (
                  <li key={item.key} className="flex gap-4">
                    <div className="w-16 h-20 bg-bg shrink-0 overflow-hidden relative">
                      <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-fg text-bg rounded-full text-[10px] font-mono flex items-center justify-center">
                        {item.qty}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="editorial-label text-fg-dim mb-1 truncate">{item.product.category}</div>
                      <div className="font-display text-lg leading-tight tracking-tighter2 truncate">
                        {item.product.name}
                      </div>
                      <div className="editorial-label text-fg-dim mt-1">Size {item.size}</div>
                    </div>
                    <div className="font-mono text-sm whitespace-nowrap">
                      €{(item.product.price * item.qty).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="px-6 py-5 border-t hairline space-y-3 editorial-label">
                <Row label="Subtotal" value={`€${subtotal.toLocaleString()}`} />
                <Row label="Shipping" value="Complimentary" muted />
                <Row label="VAT (included)" value={`€${vat.toLocaleString()}`} muted />
              </div>

              <div className="px-6 py-5 border-t hairline flex items-baseline justify-between">
                <span className="editorial-label">Total</span>
                <span className="font-display text-3xl tracking-tighter2">€{grand.toLocaleString()}</span>
              </div>

              <div className="px-6 py-4 border-t hairline editorial-label text-fg-dim space-y-1.5">
                <p>· Delivered in 3–5 business days</p>
                <p>· Free returns within 30 days</p>
                <p>· Lifetime atelier repair</p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </>
  )
}

function Section({ number, title, children, complete, locked }) {
  return (
    <section className={`relative transition-opacity duration-500 ${locked ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex items-center gap-4 mb-6 pb-4 border-b hairline">
        <div className={`w-10 h-10 border flex items-center justify-center font-mono text-xs transition-colors ${
          complete ? 'border-accent bg-accent text-bg' : 'hairline'
        }`}>
          {complete ? '✓' : number}
        </div>
        <h2 className="font-display text-3xl md:text-4xl tracking-tighter2">{title}</h2>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

function Row({ label, value, muted }) {
  return (
    <div className="flex justify-between">
      <span className={muted ? 'text-fg-dim' : ''}>{label}</span>
      <span className={muted ? 'text-fg-muted' : 'text-fg font-mono'}>{value}</span>
    </div>
  )
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="11" width="16" height="10" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

function CardBrand({ brand }) {
  const labels = { visa: 'VISA', mastercard: 'MC', amex: 'AMEX', discover: 'DISC', diners: 'DC', card: '' }
  if (!labels[brand]) return null
  return <span className="font-mono text-xs text-fg-muted">{labels[brand]}</span>
}

function ProcessingOverlay({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-bg/95 backdrop-blur-md flex flex-col items-center justify-center grain"
        >
          <div className="relative w-24 h-24 mb-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <svg viewBox="0 0 40 40" className="w-full h-full text-fg">
                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.5" fill="none" />
                <path d="M20 2 A18 18 0 0 1 38 20" stroke="currentColor" strokeWidth="0.5" fill="none" />
              </svg>
            </motion.div>
            <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full text-fg">
              <path d="M20 4 L36 20 L20 20 L4 20 Z" fill="currentColor" />
              <path d="M20 20 L28 36 L20 28 L12 36 Z" fill="currentColor" />
              <circle cx="20" cy="20" r="1.6" fill="#9C1B2A" />
            </svg>
          </div>
          <div className="editorial-label text-accent mb-3">— Processing</div>
          <div className="font-display text-3xl italic text-fg-muted">Preparing your folio…</div>
          <div className="editorial-label mt-6 text-fg-dim max-w-xs text-center">
            Verifying payment and reserving your pieces with the atelier.
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
