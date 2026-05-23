import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import ProductCard from '../components/ProductCard'
import AmorphousBlob from '../components/AmorphousBlob'
import { products } from '../data/products'

export default function Home() {
  const featured = products.slice(0, 4)
  const editorial = products[0]

  return (
    <>
      <Hero />

      <Marquee
        items={[
          'Batch No. 26',
          'Hand-blended in Grasse',
          'Cold-pressed botanicals',
          'Complimentary global delivery',
          'Apothecary consultations by request',
        ]}
      />

      {/* Editorial split */}
      <section className="relative px-6 md:px-10 py-32 md:py-44 overflow-hidden">
        <AmorphousBlob
          variant="melted"
          color="var(--accent-deep)"
          size="45vw"
          opacity={0.12}
          blur={100}
          duration={30}
          style={{ top: '20%', right: '-15vw' }}
        />
        <div className="relative grid md:grid-cols-12 gap-8 md:gap-16 items-end">
          <div className="md:col-span-5">
            <p className="editorial-label text-ox mb-8">— Chapter I</p>
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tighter2 mb-10">
              An obsession <br />
              <span className="italic text-bone/70">with the formula.</span>
            </h2>
            <p className="text-bone/70 leading-relaxed max-w-md mb-10">
              Every preparation passes through seventeen quiet stages, in
              a laboratory that has refused to rush a formulation for three
              generations. Care is method.
            </p>
            <Link
              to="/atelier"
              className="editorial-label link-line text-bone hover:text-ox transition-colors"
            >
              Visit the Apothecary →
            </Link>
          </div>

          <div className="md:col-span-7 relative">
            <motion.div
              initial={{ opacity: 0, scale: 1.05 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="aspect-[4/5] overflow-hidden bg-char"
            >
              <img
                src="https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1600&q=85"
                alt="Apothecary"
                className="w-full h-full object-cover grayscale-[15%]"
              />
            </motion.div>
            <div className="absolute -bottom-6 -left-6 md:-bottom-10 md:-left-10 bg-ox text-bone p-6 md:p-10 max-w-xs">
              <div className="editorial-label text-bone/80 mb-3">Folio · 002</div>
              <p className="font-display text-2xl md:text-3xl italic leading-tight">
                "We do not follow trends.
                We compose rituals."
              </p>
              <div className="editorial-label text-bone/80 mt-4">— The House</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured grid */}
      <section className="px-6 md:px-10 pb-32">
        <div className="flex items-end justify-between border-b hairline pb-6 mb-16">
          <div>
            <p className="editorial-label text-ox mb-3">— The Collection</p>
            <h2 className="font-display text-4xl md:text-6xl tracking-tighter2 leading-none">
              Selected Pieces
            </h2>
          </div>
          <Link to="/collection" className="editorial-label link-line text-bone hover:text-ox">
            View All ({String(products.length).padStart(2, '0')}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-16">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Editorial feature spread */}
      <section className="relative py-32 md:py-44 px-6 md:px-10 border-y hairline grain overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img
            src={editorial.image}
            alt=""
            className="w-full h-full object-cover blur-2xl scale-110"
          />
        </div>
        <div className="relative grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div>
            <p className="editorial-label text-ox mb-6">— Featured</p>
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tighter2 leading-[0.88] mb-8">
              {editorial.name.split(' ').slice(0, -1).join(' ')}
              <br />
              <span className="italic text-bone/70">{editorial.name.split(' ').slice(-1)}.</span>
            </h2>
            <p className="text-bone/70 leading-relaxed max-w-md mb-8">
              {editorial.description}
            </p>
            <div className="grid grid-cols-2 gap-6 mb-10 max-w-md editorial-label">
              <div>
                <div className="text-bone/40 mb-1">Key Actives</div>
                <div className="text-bone">{editorial.materials}</div>
              </div>
              <div>
                <div className="text-bone/40 mb-1">Origin</div>
                <div className="text-bone">{editorial.origin}</div>
              </div>
            </div>
            <Link
              to={`/product/${editorial.id}`}
              className="inline-flex items-center gap-3 editorial-label link-line text-bone hover:text-ox"
            >
              Study the formulation →
            </Link>
          </div>
          <div className="aspect-[3/4] overflow-hidden bg-ink">
            <img src={editorial.image} alt={editorial.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>
    </>
  )
}
