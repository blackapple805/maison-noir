import { createContext, useContext, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const QuickViewContext = createContext(null)

export function QuickViewProvider({ children }) {
  const [product, setProduct] = useState(null)
  const open = (p) => setProduct(p)
  const close = () => setProduct(null)
  return (
    <QuickViewContext.Provider value={{ product, open, close }}>
      {children}
      <QuickViewModal />
    </QuickViewContext.Provider>
  )
}

export const useQuickView = () => useContext(QuickViewContext)

function QuickViewModal() {
  const { product, close } = useQuickView()
  const { dispatch } = useCart()
  const { has, toggle } = useWishlist()
  const [size, setSize] = useState(null)
  const [err, setErr] = useState(false)

  // Reset state when product changes
  useEffect(() => {
    setSize(null)
    setErr(false)
  }, [product])

  // Lock body scroll while open
  useEffect(() => {
    if (!product) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [product])

  // Close on Escape
  useEffect(() => {
    if (!product) return
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [product, close])

  const onAdd = () => {
    if (!size) return setErr(true)
    dispatch({ type: 'ADD', product, size })
    close()
  }

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-bg/80 backdrop-blur-md z-[60]"
            onClick={close}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10 pointer-events-none"
          >
            <div className="bg-bg-elev border hairline max-w-5xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto grain relative">
              <button
                onClick={close}
                aria-label="Close quick view"
                className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full border hairline hover:border-accent transition-colors bg-bg/80 backdrop-blur"
              >
                ✕
              </button>

              <div className="grid md:grid-cols-2">
                <div className="relative aspect-[3/4] bg-bg overflow-hidden">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 right-4 flex justify-between editorial-label">
                    <span>{product.season}</span>
                    <span>{product.colorway}</span>
                  </div>
                </div>

                <div className="p-8 md:p-10 space-y-6">
                  <div>
                    <div className="editorial-label text-accent mb-3">— {product.category}</div>
                    <h2 className="font-display text-4xl md:text-5xl tracking-tighter2 leading-[0.95] mb-4">
                      {product.name}
                    </h2>
                    <p className="text-fg-muted leading-relaxed text-sm">{product.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 editorial-label border-y hairline py-5 text-xs">
                    <div className="text-fg-faint">Materials</div>
                    <div>{product.materials}</div>
                    <div className="text-fg-faint">Origin</div>
                    <div>{product.origin}</div>
                  </div>

                  <div>
                    <div className="editorial-label text-fg-dim mb-3">Select Size</div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setSize(s)
                            setErr(false)
                          }}
                          className={`min-w-[3rem] py-2.5 px-3 border editorial-label transition-all ${
                            size === s
                              ? 'border-accent bg-accent text-bg'
                              : 'hairline hover:border-fg'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {err && <p className="editorial-label text-accent mt-2">— Select a size first.</p>}
                  </div>

                  <div className="flex items-baseline justify-between pt-2">
                    <span className="editorial-label">Price</span>
                    <span className="font-display text-3xl tracking-tighter2">
                      €{product.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={onAdd}
                      className="flex-1 py-4 bg-fg text-bg font-mono text-[10px] tracking-editorial uppercase hover:bg-accent hover:text-bg transition-colors duration-500"
                    >
                      Add to Bag
                    </button>
                    <button
                      onClick={() => toggle(product.id)}
                      aria-label={has(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                      className={`w-14 border hairline flex items-center justify-center transition-colors ${
                        has(product.id) ? 'border-accent text-accent' : 'hover:border-fg'
                      }`}
                    >
                      <Heart filled={has(product.id)} />
                    </button>
                  </div>

                  <Link
                    to={`/product/${product.id}`}
                    onClick={close}
                    className="block text-center editorial-label link-line hover:text-accent"
                  >
                    Open full study →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function Heart({ filled = false, size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
