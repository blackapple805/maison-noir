import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import AmorphousBlob from '../components/AmorphousBlob'

const phases = [
  {
    n: 'I',
    title: 'The interview',
    body: 'Ninety minutes in the Paris atelier, or by correspondence. We map your skin, your seasons, your tolerances, your aversions. Nothing is rushed. Nothing is assumed.',
    weeks: 'Week 1',
  },
  {
    n: 'II',
    title: 'The composition',
    body: 'Three formulators draft a proposal — actives, carrier, scent, finish. You receive a written specification, a sample card, and the option to reshape any element before formulation begins.',
    weeks: 'Weeks 2 — 4',
  },
  {
    n: 'III',
    title: 'The first batch',
    body: 'Twelve bottles, hand-numbered, made under cold conditions. The formulation rests for forty days in glass before it is dispatched.',
    weeks: 'Weeks 5 — 11',
  },
  {
    n: 'IV',
    title: 'The dispatch',
    body: 'Delivered in person where possible, by sealed courier otherwise. Your formula is archived under your name. Refills follow the same protocol — never reformulated without your written consent.',
    weeks: 'Week 12',
  },
]

export default function MadeToMeasure() {
  return (
    <div className="pt-32 md:pt-40 pb-32">
      {/* Cover */}
      <section className="relative px-6 md:px-10 mb-32 overflow-hidden">
        <AmorphousBlob
          variant="draped"
          color="var(--accent)"
          size="50vw"
          opacity={0.18}
          blur={100}
          duration={28}
          style={{ top: '-10vw', right: '-15vw' }}
        />
        <div className="relative">
          <p className="editorial-label text-ox mb-6">— Made to Measure</p>
          <h1 className="font-display text-6xl md:text-8xl lg:text-[10rem] tracking-tighter2 leading-[0.88] max-w-6xl">
            A formula <br />
            <span className="italic text-bone/70">for one skin.</span>
          </h1>
          <p className="text-bone/70 max-w-2xl mt-12 leading-relaxed text-lg">
            For three generations the house has composed bespoke formulations
            for clients whose needs sit outside our standing catalogue. Twelve
            weeks. One skin. One archive. One name on the bottle.
          </p>
        </div>
      </section>

      {/* Specification */}
      <section className="px-6 md:px-10 mb-32 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="md:col-span-6 aspect-[4/5] overflow-hidden bg-char"
          >
            <img
              src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1600&q=85"
              alt=""
              className="w-full h-full object-cover grayscale-[15%]"
            />
          </motion.div>
          <div className="md:col-span-6">
            <p className="editorial-label text-ox mb-6">— Specification</p>
            <h2 className="font-display text-4xl md:text-5xl tracking-tighter2 leading-[0.95] mb-8">
              What the service includes.
            </h2>
            <ul className="space-y-5 text-bone/80 leading-relaxed">
              {[
                'A ninety-minute consultation with two senior formulators.',
                'Up to three rounds of sample iteration before final batch.',
                'Twelve bottles of the finished formulation, hand-numbered.',
                'A written archive of your formula, held under your name in perpetuity.',
                'Priority refill scheduling — typically four to six weeks.',
                'Annual revision, should the skin or the season change.',
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <span className="editorial-label text-ox shrink-0 pt-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Phases */}
      <section className="px-6 md:px-10 mb-32 border-y hairline py-24 grain">
        <p className="editorial-label text-ox mb-12">— Twelve weeks, four phases</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto">
          {phases.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: i * 0.08 }}
            >
              <div className="font-display text-7xl tracking-tighter2 text-bone/30 mb-4">
                {p.n}
              </div>
              <div className="editorial-label text-ox mb-3">{p.weeks}</div>
              <h3 className="font-display text-2xl italic tracking-tight mb-4 text-bone/90">
                {p.title}
              </h3>
              <p className="text-bone/70 leading-relaxed text-sm">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Investment */}
      <section className="px-6 md:px-10 max-w-4xl mx-auto text-center">
        <p className="editorial-label text-ox mb-6">— Investment</p>
        <h2 className="font-display text-4xl md:text-6xl tracking-tighter2 leading-[0.95] mb-8">
          Quoted on consultation.
        </h2>
        <p className="text-bone/70 leading-relaxed max-w-xl mx-auto mb-10">
          A bespoke formulation begins at €2,400 for a twelve-bottle batch.
          Complex actives and protected botanicals are quoted individually.
          The consultation itself is offered without charge.
        </p>
        <Link to="/concierge" className="editorial-label link-line hover:text-ox">
          Request a consultation →
        </Link>
      </section>
    </div>
  )
}
