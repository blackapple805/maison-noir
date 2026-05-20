import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { products } from '../data/products'
import { useWishlist } from '../context/WishlistContext'

export default function Wishlist() {
  const { ids, clear } = useWishlist()
  const saved = products.filter((p) => ids.includes(p.id))

  return (
    <div className="pt-32 md:pt-40 pb-20 px-6 md:px-10">
      <div className="border-b hairline pb-10 mb-16">
        <p className="editorial-label text-accent mb-4">— Personal Folio</p>
        <div className="flex items-end justify-between flex-wrap gap-6">
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl tracking-tighter2 leading-none">
            Saved <span className="italic text-fg-muted">Pieces.</span>
          </h1>
          <div className="editorial-label">
            {String(saved.length).padStart(2, '0')} held in keeping
            {saved.length > 0 && (
              <>
                <span className="mx-3">·</span>
                <button onClick={clear} className="link-line hover:text-accent">Clear all</button>
              </>
            )}
          </div>
        </div>
      </div>

      {saved.length === 0 ? (
        <div className="text-center py-32">
          <p className="font-display italic text-4xl md:text-5xl text-fg-muted mb-6">
            No pieces yet held.
          </p>
          <p className="editorial-label mb-10">
            Mark a piece with the heart to keep it.
          </p>
          <Link
            to="/collection"
            className="editorial-label link-line hover:text-accent"
          >
            Enter the Collection →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
          {saved.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
