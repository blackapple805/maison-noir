import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuickView, Heart } from './QuickView'
import { useWishlist } from '../context/WishlistContext'

export default function ProductCard({ product, index = 0 }) {
  const { open } = useQuickView()
  const { has, toggle } = useWishlist()
  const saved = has(product.id)

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <div className="relative overflow-hidden bg-bg-elev aspect-[3/4] mb-5">
        {/* Amorphous hover accent — morphs in behind image edge */}
        <div
          aria-hidden="true"
          className="absolute -bottom-1/3 -right-1/3 w-2/3 h-2/3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-[1200ms]"
          style={{ filter: 'blur(40px)' }}
        >
          <svg viewBox="0 0 200 200" width="100%" height="100%">
            <path
              d="M100,25 Q140,45 150,90 Q160,140 120,170 Q85,185 60,160 Q35,130 50,95 Q70,55 100,25 Z"
              fill="var(--accent)"
              opacity="0.45"
            />
          </svg>
        </div>

        {/* Editorial caption */}
        <div className="absolute top-4 left-4 right-16 flex justify-between gap-3 editorial-label z-10 text-fg-muted pointer-events-none">
          <span className="truncate">{product.season}</span>
          <span className="truncate text-right">{product.colorway}</span>
        </div>

        <Link to={`/product/${product.id}`} className="block w-full h-full" aria-label={`View ${product.name}`}>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            style={{ filter: `grayscale(var(--image-grayscale))` }}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[1500ms] ease-out"
          />
        </Link>

        {/* Wishlist heart — always visible */}
        <button
          onClick={(e) => {
            e.preventDefault()
            toggle(product.id)
          }}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-4 right-4 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center z-20 transition-all ${
            saved
              ? 'bg-accent text-bg'
              : 'bg-bg/40 text-fg hover:bg-bg/70'
          }`}
        >
          <Heart filled={saved} size={13} />
        </button>

        {/* Quick view — appears on hover */}
        <div className="absolute bottom-4 left-4 right-4 z-20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <button
            onClick={(e) => {
              e.preventDefault()
              open(product)
            }}
            className="w-full py-3 bg-fg text-bg font-mono text-[10px] tracking-editorial uppercase hover:bg-accent transition-colors"
          >
            Quick View
          </button>
        </div>
      </div>

      <Link to={`/product/${product.id}`} className="flex items-start justify-between gap-4">
        <div>
          <div className="editorial-label text-fg-dim mb-1.5">{product.category}</div>
          <h3 className="font-display text-xl md:text-2xl tracking-tighter2 leading-none">
            {product.name}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-sm tracking-tight">
            €{product.price.toLocaleString()}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
