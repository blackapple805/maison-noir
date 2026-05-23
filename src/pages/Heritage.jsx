import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const timeline = [
  {
    year: '1947',
    title: 'A back room in Grasse',
    body: 'Élise Marchand returns from the war and begins distilling lavender behind her father\'s pharmacy. The first formulations are made for friends — a balm for sun, a tincture for sleep. None of it is sold.',
  },
  {
    year: '1962',
    title: 'The first batch',
    body: 'Batch No. 01 leaves the house. Twelve bottles, hand-labeled in ink that still smudges. The recipe — a cold-pressed neroli oil — has not been altered since.',
  },
  {
    year: '1981',
    title: 'Paris',
    body: 'The atelier opens its second laboratory on Rue de l\'Université. The seventh arrondissement, a corner address, no signage on the door. Word of mouth carries the name across the Seine.',
  },
  {
    year: '2003',
    title: 'A vow of slowness',
    body: 'The house declines its first acquisition offer. A second follows, then a third. A document is drafted — eight pages — codifying that no formulation will ever be rushed, diluted, or reformulated for scale.',
  },
  {
    year: 'MMXXVI',
    title: 'Batch 26',
    body: 'Three generations on, the apothecary remains independent. Twelve formulators. Seventeen stages. The dispatch arrives quarterly. Everything else is the same.',
  },
]

export default function Heritage() {
  return (
    <div className="pt-32 md:pt-40 pb-32">
      {/* Cover */}
      <section className="px-6 md:px-10 mb-32">
        <p className="editorial-label text-ox mb-6">— Heritage</p>
        <h1 className="font-display text-6xl md:text-8xl lg:text-[10rem] tracking-tighter2 leading-[0.88] max-w-6xl">
          Eighty years <br />
          <span className="italic text-bone/70">of patience.</span>
        </h1>
        <p className="text-bone/70 max-w-2xl mt-12 leading-relaxed text-lg">
          The house began in a back room in Grasse and has never moved faster
          than the seasons. What follows is a chronology — not a story, because
          a story would have an ending.
        </p>
      </section>

      {/* Hero image band */}
      <section className="mb-32 px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4 }}
          className="aspect-[21/9] overflow-hidden bg-char"
        >
          <img
            src="https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=2400&q=85"
            alt=""
            className="w-full h-full object-cover grayscale-[20%]"
          />
        </motion.div>
        <p className="editorial-label text-bone/40 mt-4">
          Plate · 01 — The fields above Grasse, photographed by morning light.
        </p>
      </section>

      {/* Timeline */}
      <section className="px-6 md:px-10 max-w-5xl mx-auto">
        <p className="editorial-label text-ox mb-12">— A chronology</p>
        <div className="space-y-20">
          {timeline.map((e, i) => (
            <motion.div
              key={e.year}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, delay: 0.05 * i }}
              className="grid md:grid-cols-12 gap-8 border-b hairline pb-20 last:border-b-0"
            >
              <div className="md:col-span-3">
                <div className="font-display text-5xl md:text-6xl tracking-tighter2 text-bone/90">
                  {e.year}
                </div>
              </div>
              <div className="md:col-span-9">
                <h3 className="font-display text-3xl md:text-4xl italic text-bone/80 tracking-tight mb-4">
                  {e.title}
                </h3>
                <p className="text-bone/70 leading-relaxed max-w-2xl">
                  {e.body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Coda */}
      <section className="px-6 md:px-10 py-32 text-center grain mt-32">
        <p className="editorial-label text-ox mb-6">— Coda</p>
        <p className="font-display italic text-3xl md:text-5xl max-w-3xl mx-auto leading-tight text-bone/80 mb-10">
          "A formula is not finished when it works.
          It is finished when nothing can be removed."
        </p>
        <Link to="/atelier" className="editorial-label link-line hover:text-ox">
          Visit the Apothecary →
        </Link>
      </section>
    </div>
  )
}
