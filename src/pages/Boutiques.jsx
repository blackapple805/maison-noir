import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const boutiques = [
  {
    city: 'Paris',
    address: '12 Rue de l\'Université',
    postal: '75007 Paris',
    hours: ['Tuesday — Saturday', '11h00 — 19h00'],
    phone: '+33 1 42 60 00 00',
    note: 'The original atelier. Consultations by appointment.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=85',
    coords: '48° 51′ 24″ N · 02° 21′ 03″ E',
  },
  {
    city: 'Grasse',
    address: '8 Place aux Aires',
    postal: '06130 Grasse',
    hours: ['Wednesday — Sunday', '10h00 — 18h00'],
    phone: '+33 4 93 36 00 00',
    note: 'The laboratory. Open seasonally during harvest.',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1600&q=85',
    coords: '43° 39′ 36″ N · 06° 55′ 25″ E',
  },
  {
    city: 'New York',
    address: '54 Crosby Street',
    postal: 'NY 10012',
    hours: ['Monday — Saturday', '11h00 — 19h00'],
    phone: '+1 212 000 0000',
    note: 'SoHo. Shared with the bookbinder Atelier Reliure.',
    image: 'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=1600&q=85',
    coords: '40° 43′ 24″ N · 74° 00′ 03″ W',
  },
]

export default function Boutiques() {
  return (
    <div className="pt-32 md:pt-40 pb-32">
      {/* Cover */}
      <section className="px-6 md:px-10 mb-24">
        <p className="editorial-label text-ox mb-6">— Boutiques</p>
        <h1 className="font-display text-6xl md:text-8xl lg:text-[10rem] tracking-tighter2 leading-[0.88] max-w-6xl">
          Three rooms, <br />
          <span className="italic text-bone/70">three cities.</span>
        </h1>
        <p className="text-bone/70 max-w-2xl mt-12 leading-relaxed text-lg">
          The house keeps a small footprint, by design. Each address is a
          working space — a counter, a consultation room, the formulations
          on shelves of oak and brass. Walk in. We will pour you something.
        </p>
      </section>

      {/* Boutique cards */}
      <section className="px-6 md:px-10 space-y-24 md:space-y-32 max-w-7xl mx-auto">
        {boutiques.map((b, i) => {
          const flip = i % 2 === 1
          return (
            <motion.div
              key={b.city}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={`grid md:grid-cols-12 gap-8 md:gap-16 items-center ${
                flip ? 'md:[direction:rtl]' : ''
              }`}
            >
              <div className="md:col-span-7 md:[direction:ltr]">
                <div className="aspect-[4/5] md:aspect-[5/6] overflow-hidden bg-char">
                  <img
                    src={b.image}
                    alt={b.city}
                    className="w-full h-full object-cover grayscale-[15%]"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              </div>

              <div className="md:col-span-5 md:[direction:ltr]">
                <p className="editorial-label text-ox mb-4">
                  N° 0{i + 1} — Boutique
                </p>
                <h2 className="font-display text-5xl md:text-7xl tracking-tighter2 leading-[0.9] mb-6">
                  {b.city}.
                </h2>
                <p className="font-display italic text-xl md:text-2xl text-bone/70 leading-snug mb-10 max-w-md">
                  {b.note}
                </p>

                <dl className="space-y-6 editorial-label">
                  <div>
                    <dt className="text-bone/40 mb-2">Address</dt>
                    <dd className="text-bone/90 normal-case tracking-normal text-base">
                      {b.address} <br />
                      {b.postal}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-bone/40 mb-2">Hours</dt>
                    <dd className="text-bone/90 normal-case tracking-normal text-base">
                      {b.hours.map((h) => (
                        <div key={h}>{h}</div>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-bone/40 mb-2">Telephone</dt>
                    <dd className="text-bone/90 normal-case tracking-normal text-base">
                      {b.phone}
                    </dd>
                  </div>
                  <div className="pt-2 text-bone/40">{b.coords}</div>
                </dl>
              </div>
            </motion.div>
          )
        })}
      </section>

      {/* Visit by appointment */}
      <section className="px-6 md:px-10 mt-32 max-w-4xl mx-auto text-center border-t hairline pt-24">
        <p className="editorial-label text-ox mb-6">— By appointment</p>
        <h2 className="font-display text-4xl md:text-6xl tracking-tighter2 leading-[0.95] mb-8">
          A private consultation, <br />
          <span className="italic text-bone/70">arranged in advance.</span>
        </h2>
        <p className="text-bone/70 leading-relaxed max-w-xl mx-auto mb-10">
          Each boutique offers private hours outside its standard schedule.
          Reservations through the concierge desk in Paris.
        </p>
        <Link to="/concierge" className="editorial-label link-line hover:text-ox">
          Reach the Concierge →
        </Link>
      </section>
    </div>
  )
}