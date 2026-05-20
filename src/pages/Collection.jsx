import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products, categories } from '../data/products'

export default function Collection() {
  const [params, setParams] = useSearchParams()
  const [active, setActive] = useState(params.get('cat') || 'All')

  useEffect(() => {
    setActive(params.get('cat') || 'All')
  }, [params])

  const filtered = useMemo(() => {
    return active === 'All' ? products : products.filter((p) => p.category === active)
  }, [active])

  return (
    <div className="pt-32 md:pt-40 pb-20 px-6 md:px-10">
      {/* Title */}
      <div className="border-b hairline pb-10 mb-16">
        <p className="editorial-label text-ox mb-4">— Autumn / Winter 26</p>
        <div className="flex items-end justify-between flex-wrap gap-6">
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-tighter2 leading-none">
            The <span className="italic text-bone/70">Collection.</span>
          </h1>
          <div className="editorial-label text-bone/50">
            {String(filtered.length).padStart(2, '0')} pieces · Folio 26 / VIII
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-x-8 gap-y-3 mb-16 pb-8 border-b hairline editorial-label">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => {
              setActive(c)
              setParams(c === 'All' ? {} : { cat: c })
            }}
            className={`relative transition-colors ${
              active === c ? 'text-ox' : 'text-bone/60 hover:text-bone'
            }`}
          >
            {c}
            {active === c && (
              <span className="absolute -bottom-1 left-0 w-full h-px bg-ox" />
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
        {filtered.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  )
}
