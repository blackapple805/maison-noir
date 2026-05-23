import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartDrawer() {
  const { open, items, dispatch, total } = useCart()
  const navigate = useNavigate()

  const goToCheckout = () => {
    dispatch({ type: 'CLOSE' })
    navigate('/checkout')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50"
            onClick={() => dispatch({ type: 'CLOSE' })}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-char border-l hairline z-50 flex flex-col grain"
          >
            <div className="px-8 py-6 border-b hairline flex items-center justify-between">
              <div>
                <div className="editorial-label text-bone/50 mb-1">Folio · 003</div>
                <h2 className="font-display text-2xl tracking-tighter2">Your Bag</h2>
              </div>
              <button
                onClick={() => dispatch({ type: 'CLOSE' })}
                className="editorial-label text-bone/70 hover:text-bone link-line"
              >
                Close ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              {items.length === 0 ? (
                <div className="text-center py-20">
                  <p className="font-display italic text-2xl text-bone/60 mb-3">Empty.</p>
                  <p className="editorial-label text-bone/40">
                    The apothecary awaits your selection.
                  </p>
                </div>
              ) : (
                <ul className="space-y-8">
                  {items.map((item) => (
                    <li key={item.key} className="flex gap-4 pb-8 border-b hairline last:border-0">
                      <div className="w-24 h-32 bg-ink shrink-0 overflow-hidden">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="editorial-label text-bone/50 mb-1">
                            {item.product.category}
                          </div>
                          <h3 className="font-display text-lg leading-tight tracking-tighter2">
                            {item.product.name}
                          </h3>
                          <div className="editorial-label text-bone/50 mt-2">
                            Size {item.size}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3 editorial-label">
                            <button
                              onClick={() => dispatch({ type: 'QTY', key: item.key, qty: item.qty - 1 })}
                              className="w-6 h-6 border hairline hover:border-bone transition-colors"
                            >−</button>
                            <span className="text-bone">{item.qty}</span>
                            <button
                              onClick={() => dispatch({ type: 'QTY', key: item.key, qty: item.qty + 1 })}
                              className="w-6 h-6 border hairline hover:border-bone transition-colors"
                            >+</button>
                          </div>
                          <span className="font-mono text-sm">
                            €{(item.product.price * item.qty).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t hairline px-8 py-6 space-y-4">
                <div className="flex justify-between editorial-label">
                  <span className="text-bone/50">Subtotal</span>
                  <span className="font-mono text-bone">€{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between editorial-label">
                  <span className="text-bone/50">Shipping</span>
                  <span className="text-bone/70">Calculated at checkout</span>
                </div>
                <button onClick={goToCheckout} className="w-full py-4 bg-bone text-ink font-mono text-xs tracking-editorial uppercase hover:bg-ox hover:text-bone transition-colors duration-500">
                  Proceed to Checkout
                </button>
                <p className="editorial-label text-bone/40 text-center">
                  Complimentary worldwide delivery
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
