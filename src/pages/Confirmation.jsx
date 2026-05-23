import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useOrder } from '../context/OrderContext'
import { generateInvoicePDF } from '../utils/invoice'

export default function Confirmation() {
  const { number } = useParams()
  const { lastOrder } = useOrder()
  const [order, setOrder] = useState(lastOrder)

  // If hitting this URL fresh (e.g. refresh), try to find order in localStorage
  useEffect(() => {
    if (order && order.number === number) return
    try {
      const allRaw = localStorage.getItem('mn-orders')
      const all = allRaw ? JSON.parse(allRaw) : []
      const found = all.find((o) => o.number === number)
      if (found) setOrder(found)
    } catch {
      // ignore
    }
  }, [number, order])

  if (!order) {
    return (
      <div className="pt-40 pb-40 px-6 text-center">
        <div className="editorial-label text-accent mb-4">— Folio not found</div>
        <p className="font-display italic text-4xl text-fg-muted mb-8">
          We could not locate this order.
        </p>
        <Link to="/" className="editorial-label link-line hover:text-accent">
          Return to the apothecary →
        </Link>
      </div>
    )
  }

  const placedDate = new Date(order.placedAt).toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="pt-28 md:pt-32 pb-24">
      {/* Hero confirmation block */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="px-6 md:px-10 mb-16 grain"
      >
        <div className="border-b hairline pb-12">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <p className="editorial-label text-accent mb-4">— Order Received · Folio · 005</p>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tighter2 leading-[0.92] mb-8 max-w-3xl">
                Thank you, <br />
                <span className="italic text-fg-muted">{order.shipping.firstName}.</span>
              </h1>
              <p className="text-fg-muted max-w-xl leading-relaxed">
                Your preparations are reserved from the apothecary. A copy of this confirmation
                has been sent to <span className="text-fg">{order.shipping.email}</span>.
              </p>
            </div>
            <div className="text-right editorial-label space-y-1">
              <div className="text-fg-dim">Order Number</div>
              <div className="font-mono text-fg text-base tracking-tight">{order.number}</div>
              <div className="text-fg-dim mt-3">Placed</div>
              <div className="text-fg">{placedDate}</div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={() => generateInvoicePDF(order)}
              className="px-8 py-4 bg-fg text-bg font-mono text-[10px] tracking-editorial uppercase hover:bg-accent transition-colors duration-500"
            >
              ↓ Download Invoice (PDF)
            </button>
            <Link
              to="/collection"
              className="px-8 py-4 border hairline editorial-label hover:border-fg transition-colors"
            >
              Continue Browsing
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Three-column meta */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15 }}
        className="px-6 md:px-10 mb-20 grid md:grid-cols-3 gap-10 border-b hairline pb-16"
      >
        <Block title="Estimated Delivery" label="01">
          <div className="font-display text-2xl tracking-tighter2 mb-2">
            {order.estimatedDelivery.start} — {order.estimatedDelivery.end}
          </div>
          <p className="text-fg-muted text-sm leading-relaxed">
            Tracking details will be sent when your folio is dispatched from the apothecary.
          </p>
        </Block>

        <Block title="Shipping To" label="02">
          <div className="font-display text-xl tracking-tighter2 mb-3">
            {order.shipping.firstName} {order.shipping.lastName}
          </div>
          <address className="not-italic text-fg-muted text-sm leading-relaxed">
            {order.shipping.address1}<br />
            {order.shipping.address2 && <>{order.shipping.address2}<br /></>}
            {order.shipping.postal} {order.shipping.city}<br />
            {order.shipping.country}
          </address>
        </Block>

        <Block title="Payment" label="03">
          <div className="font-display text-xl tracking-tighter2 mb-3">
            {(order.payment.brand || 'Card').toUpperCase()} ending {order.payment.last4}
          </div>
          <p className="text-fg-muted text-sm leading-relaxed">
            {order.payment.name}<br />
            Charged in full · €{order.totals.total.toLocaleString()}
          </p>
        </Block>
      </motion.section>

      {/* Items */}
      <section className="px-6 md:px-10 mb-20">
        <div className="flex items-end justify-between border-b hairline pb-6 mb-10">
          <h2 className="font-display text-3xl md:text-5xl tracking-tighter2">Your Pieces</h2>
          <span className="editorial-label">{order.items.length} item{order.items.length === 1 ? '' : 's'}</span>
        </div>

        <ul className="space-y-8">
          {order.items.map((item, i) => (
            <motion.li
              key={`${item.id}-${item.size}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.06 }}
              className="flex gap-6 pb-8 border-b hairline last:border-0"
            >
              <div className="w-24 md:w-32 aspect-[3/4] bg-bg-elev overflow-hidden shrink-0">
                <img src={item.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="editorial-label text-fg-dim mb-1">{item.category}</div>
                  <Link
                    to={`/product/${item.id}`}
                    className="font-display text-2xl md:text-3xl tracking-tighter2 leading-tight hover:text-accent transition-colors"
                  >
                    {item.name}
                  </Link>
                  <div className="editorial-label text-fg-dim mt-2">
                    Size {item.size} · {item.colorway} · MN-{item.id.toUpperCase()}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="editorial-label text-fg-dim mb-1">Qty {item.qty}</div>
                  <div className="font-mono text-base">€{item.lineTotal.toLocaleString()}</div>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* Totals */}
      <section className="px-6 md:px-10 mb-20">
        <div className="max-w-md ml-auto space-y-3 editorial-label">
          <Row label="Subtotal" value={`€${order.totals.subtotal.toLocaleString()}`} />
          <Row
            label="Shipping"
            value={order.totals.shipping === 0 ? 'Complimentary' : `€${order.totals.shipping.toLocaleString()}`}
            muted
          />
          <Row label="VAT (included)" value={`€${order.totals.vat.toLocaleString()}`} muted />
          <div className="pt-4 mt-4 border-t hairline flex justify-between items-baseline">
            <span className="editorial-label">Total Charged</span>
            <span className="font-display text-4xl tracking-tighter2">
              €{order.totals.total.toLocaleString()}
            </span>
          </div>
        </div>
      </section>

      {/* Aftercare */}
      <section className="px-6 md:px-10 grain">
        <div className="border-t hairline pt-16 grid md:grid-cols-2 gap-10 items-start">
          <div>
            <p className="editorial-label text-accent mb-6">— A note from the House</p>
            <h3 className="font-display text-3xl md:text-5xl tracking-tighter2 leading-[0.95] mb-6">
              Each preparation is hand-finished <br />
              <span className="italic text-fg-muted">and individually inspected.</span>
            </h3>
          </div>
          <div className="space-y-4 text-fg-muted leading-relaxed">
            <p>
              Should any preparation arrive in less-than-perfect condition, or you wish to
              schedule a consultation, write to our concierge.
              The apothecary maintains a perpetual record of every formulation it has made.
            </p>
            <p className="editorial-label text-fg pt-2">
              concierge@maisonnoir.apothecary · +33 1 42 60 00 00
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function Block({ title, label, children }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-5 pb-3 border-b hairline">
        <span className="font-mono text-[10px] text-accent">{label}</span>
        <span className="editorial-label">{title}</span>
      </div>
      {children}
    </div>
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
