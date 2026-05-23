import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { products } from '../data/products'
import { useCart } from '../context/CartContext'

export default function Product() {
  const { id } = useParams()
  const product = products.find((p) => p.id === id)
  const { dispatch } = useCart()
  const [size, setSize] = useState(null)
  const [error, setError] = useState(false)

  if (!product) return <Navigate to="/collection" replace />

  const onAdd = () => {
    if (!size) {
      setError(true)
      return
    }
    dispatch({ type: 'ADD', product, size })
    setSize(null)
  }

  return (
    <div className="pt-32 md:pt-40 pb-20">
      {/* Breadcrumb */}
      <div className="px-6 md:px-10 mb-10 editorial-label text-bone/50">
        <Link to="/collection" className="link-line hover:text-bone">Collection</Link>
        <span className="mx-3">/</span>
        <span>{product.category}</span>
        <span className="mx-3">/</span>
        <span className="text-bone">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 px-6 md:px-10">
        {/* Image stack */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[3/4] bg-char overflow-hidden grain"
          >
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute top-5 left-5 right-5 flex justify-between editorial-label text-bone/70">
              <span>{product.season}</span>
              <span>{product.colorway}</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="aspect-[3/4] bg-char overflow-hidden hidden lg:block"
          >
            <img src={product.image} alt="" className="w-full h-full object-cover scale-110 grayscale" />
          </motion.div>
        </div>

        {/* Details — sticky */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="lg:sticky lg:top-32 lg:self-start space-y-10"
        >
          <div>
            <div className="editorial-label text-ox mb-4">— {product.category}</div>
            <h1 className="font-display text-5xl md:text-7xl tracking-tighter2 leading-[0.9] mb-8">
              {product.name}
            </h1>
            <p className="text-bone/70 leading-relaxed max-w-md">
              {product.description}
            </p>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-y-5 editorial-label max-w-md border-y hairline py-8">
            <div className="text-bone/40">Reference</div>
            <div className="text-bone">MN-{product.id.toUpperCase()}</div>
            <div className="text-bone/40">Variant</div>
            <div className="text-bone">{product.colorway}</div>
            <div className="text-bone/40">Key Actives</div>
            <div className="text-bone">{product.materials}</div>
            <div className="text-bone/40">Origin</div>
            <div className="text-bone">{product.origin}</div>
            <div className="text-bone/40">Batch</div>
            <div className="text-bone">{product.season}</div>
          </div>

          {/* Volume */}
          <div>
            <div className="flex items-center justify-between mb-4 editorial-label">
              <span className="text-bone/60">Select Volume</span>
              <button className="link-line text-bone/60 hover:text-bone">Ingredients</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s)
                    setError(false)
                  }}
                  className={`min-w-[3.5rem] py-3 px-4 border editorial-label transition-all ${
                    size === s
                      ? 'border-ox bg-ox text-bone'
                      : 'hairline text-bone/80 hover:border-bone'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {error && (
              <p className="editorial-label text-ox mt-3">— Select a volume first.</p>
            )}
          </div>

          {/* Price + Add */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="editorial-label text-bone/50">Price</span>
              <span className="font-display text-4xl tracking-tighter2">
                €{product.price.toLocaleString()}
              </span>
            </div>
            <button
              onClick={onAdd}
              className="w-full py-5 bg-bone text-ink font-mono text-xs tracking-editorial uppercase hover:bg-ox hover:text-bone transition-colors duration-500"
            >
              Add to Bag
            </button>
            <button className="w-full py-5 border hairline editorial-label text-bone hover:border-bone transition-colors">
              Request Apothecary Consultation
            </button>
          </div>

          <div className="editorial-label text-bone/40 space-y-2 pt-4 border-t hairline">
            <p>· Complimentary worldwide delivery in 3–5 days.</p>
            <p>· Lifetime refill program.</p>
            <p>· Hand-finished and individually inspected.</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
