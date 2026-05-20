import { motion } from 'framer-motion'

export default function Atelier() {
  return (
    <div className="pt-32 md:pt-40 pb-32">
      <section className="px-6 md:px-10 mb-32">
        <p className="editorial-label text-ox mb-6">— The House</p>
        <h1 className="font-display text-6xl md:text-8xl lg:text-[10rem] tracking-tighter2 leading-[0.88] max-w-6xl">
          A practice of <br />
          <span className="italic text-bone/70">slowness.</span>
        </h1>
        <p className="text-bone/70 max-w-2xl mt-12 leading-relaxed text-lg">
          The atelier sits on Rue de l'Université in the seventh arrondissement.
          Twelve craftsmen. Seventeen stages per garment. No collection has ever
          been rushed. No piece has ever been duplicated for haste.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-1 mb-32">
        {[
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&q=85',
          'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=85',
        ].map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="aspect-[4/5] overflow-hidden"
          >
            <img src={src} alt="" className="w-full h-full object-cover grayscale-[15%]" />
          </motion.div>
        ))}
      </section>

      <section className="px-6 md:px-10 grid md:grid-cols-3 gap-16">
        {[
          { n: '01', t: 'Pattern', d: 'Each pattern is drafted by hand on parchment, retained in the archive in perpetuity.' },
          { n: '02', t: 'Cut', d: 'Cloth is rested for forty-eight hours before cutting. Grain follows the body.' },
          { n: '03', t: 'Finish', d: 'Buttonholes hand-stitched in silk thread. The final pressing takes three hours.' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: i * 0.1 }}
          >
            <div className="editorial-label text-ox mb-4">Stage · {s.n}</div>
            <h3 className="font-display text-3xl tracking-tighter2 mb-4">{s.t}</h3>
            <p className="text-bone/70 leading-relaxed">{s.d}</p>
          </motion.div>
        ))}
      </section>
    </div>
  )
}
