import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const stats = [
  { value: '87%', label: 'Glass returned to the house since 2018' },
  { value: '12', label: 'Refill cycles per bottle, on average' },
  { value: '0', label: 'New glass commissioned in 2025' },
]

const steps = [
  {
    n: '01',
    title: 'Empty the bottle',
    body: 'Use it down to the last measure. Rinse twice in warm water — no soap. Allow to dry, uncapped, overnight.',
  },
  {
    n: '02',
    title: 'Request a return',
    body: 'A pre-paid courier label is issued from your account, or by writing to the concierge. We collect, or you may drop at any boutique.',
  },
  {
    n: '03',
    title: 'We sterilise',
    body: 'Each bottle is inspected, sterilised at the laboratory in Grasse, and returned to the formulary. Glass that cannot be re-used is melted to seed new batches.',
  },
  {
    n: '04',
    title: 'You refill',
    body: 'Order your formulation at the refill price — fifteen percent below standard. Same formula. Same hand. Same bottle, now with a quieter history.',
  },
]

export default function RefillRecycling() {
  return (
    <div className="pt-32 md:pt-40 pb-32">
      {/* Cover */}
      <section className="px-6 md:px-10 mb-24">
        <p className="editorial-label text-ox mb-6">— Refill & Recycling</p>
        <h1 className="font-display text-6xl md:text-8xl lg:text-[10rem] tracking-tighter2 leading-[0.88] max-w-6xl">
          Glass <br />
          <span className="italic text-bone/70">in conversation.</span>
        </h1>
        <p className="text-bone/70 max-w-2xl mt-12 leading-relaxed text-lg">
          The bottle is the most expensive thing in the house — heavier than
          the formulation, slower to make, longer to live. We have spent thirty
          years asking it to come home.
        </p>
      </section>

      {/* Stats band */}
      <section className="px-6 md:px-10 mb-32 border-y hairline py-20 grain">
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-7xl md:text-8xl tracking-tighter2 text-bone/90 mb-4">
                {s.value}
              </div>
              <p className="editorial-label text-bone/50 normal-case tracking-normal text-sm leading-relaxed max-w-xs mx-auto">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* The cycle */}
      <section className="px-6 md:px-10 mb-32 max-w-6xl mx-auto">
        <div className="border-b hairline pb-6 mb-16">
          <p className="editorial-label text-ox mb-3">— The cycle</p>
          <h2 className="font-display text-4xl md:text-6xl tracking-tighter2 leading-none">
            How the glass returns.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-16">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: i * 0.08 }}
              className="flex gap-8"
            >
              <div className="font-display text-5xl tracking-tighter2 text-ox shrink-0">
                {s.n}
              </div>
              <div>
                <h3 className="font-display text-2xl italic tracking-tight mb-3 text-bone/90">
                  {s.title}
                </h3>
                <p className="text-bone/70 leading-relaxed">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Image + manifesto */}
      <section className="px-6 md:px-10 mb-32 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="md:col-span-6 aspect-[4/5] overflow-hidden bg-char"
          >
            <img
              src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1600&q=85"
              alt=""
              className="w-full h-full object-cover grayscale-[20%]"
            />
          </motion.div>
          <div className="md:col-span-6">
            <p className="editorial-label text-ox mb-6">— Position</p>
            <h2 className="font-display text-4xl md:text-5xl tracking-tighter2 leading-[0.95] mb-8">
              We do not believe <br />
              <span className="italic text-bone/70">in disposable luxury.</span>
            </h2>
            <div className="space-y-6 text-bone/80 leading-relaxed">
              <p>
                A bottle holds a hundred grams of formulation and a half-century
                of intent. Throwing it away after one use is a failure of the
                house, not the customer.
              </p>
              <p>
                Since 2018 every bottle has been built for return. The label
                lifts with steam. The stopper is hand-poured tin. The glass is
                Italian, lead-free, and certified for thirty cycles.
              </p>
              <p>
                Refills are not a programme. They are how the house works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-10 max-w-4xl mx-auto text-center border-t hairline pt-24">
        <p className="editorial-label text-ox mb-6">— To begin</p>
        <h2 className="font-display text-4xl md:text-6xl tracking-tighter2 leading-[0.95] mb-8">
          Request a return label.
        </h2>
        <p className="text-bone/70 leading-relaxed max-w-xl mx-auto mb-10">
          Available worldwide. Pre-paid in twenty-three countries. Drop-off at
          any of our four boutiques at any time.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link to="/concierge" className="editorial-label link-line hover:text-ox">
            Reach the Concierge →
          </Link>
          <Link to="/boutiques" className="editorial-label link-line hover:text-ox">
            Find a boutique →
          </Link>
        </div>
      </section>
    </div>
  )
}
