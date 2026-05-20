import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

const spreads = [
  {
    n: 'I',
    title: 'Murmuration',
    line: 'The flock turns as a single body. One mind, in shadow.',
    image: 'https://images.unsplash.com/photo-1551048632-24e444b48a3e?w=2000&q=85',
    productId: 'crow-coat',
  },
  {
    n: 'II',
    title: 'Vespers',
    line: 'Light falls last on the cloth. We work in that light.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=2000&q=85',
    productId: 'thorn-blazer',
  },
  {
    n: 'III',
    title: 'The Cut',
    line: 'A blade through silk. The garment begins as absence.',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=2000&q=85',
    productId: 'cinder-trouser',
  },
  {
    n: 'IV',
    title: 'Reliquary',
    line: 'We do not make objects. We make instruments of memory.',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=2000&q=85',
    productId: 'reliquary-boot',
  },
]

export default function Lookbook() {
  return (
    <div className="pt-24">
      {/* Cover */}
      <section className="px-6 md:px-10 py-24 md:py-32 border-b hairline grain">
        <p className="editorial-label text-accent mb-6">— Autumn / Winter 26 · The Lookbook</p>
        <h1 className="font-display text-6xl md:text-8xl lg:text-[11rem] tracking-tighter2 leading-[0.86]">
          A study <br />
          <span className="italic text-fg-muted">in shadow.</span>
        </h1>
        <p className="text-fg-muted mt-10 max-w-xl leading-relaxed">
          Four chapters. One season. Photographed in the disused chapel of
          Saint-Médard, Paris, by available candlelight over three nights in
          February.
        </p>
      </section>

      {spreads.map((s, i) => (
        <Spread key={s.n} spread={s} index={i} />
      ))}

      <section className="px-6 md:px-10 py-32 text-center grain">
        <p className="editorial-label text-accent mb-6">— Coda</p>
        <p className="font-display italic text-3xl md:text-5xl max-w-3xl mx-auto leading-tight text-fg-muted mb-10">
          "The form is the silence after the form."
        </p>
        <Link to="/collection" className="editorial-label link-line hover:text-accent">
          View the Collection →
        </Link>
      </section>
    </div>
  )
}

function Spread({ spread, index }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.05, 1, 1.05])
  const flip = index % 2 === 1

  return (
    <section ref={ref} className="relative min-h-[110vh] flex items-center overflow-hidden border-b hairline">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img src={spread.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-bg/55" />
      </motion.div>

      <div className={`relative z-10 px-6 md:px-16 w-full max-w-7xl mx-auto grid md:grid-cols-12 gap-8 items-center ${flip ? 'md:[direction:rtl]' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-7 md:[direction:ltr]"
        >
          <div className="editorial-label text-accent mb-4">— Chapter {spread.n}</div>
          <h2 className="font-display text-6xl md:text-8xl lg:text-[10rem] tracking-tighter2 leading-[0.88]">
            {spread.title}
          </h2>
          <p className="font-display italic text-2xl md:text-3xl text-fg-muted mt-8 max-w-lg leading-snug">
            {spread.line}
          </p>
          <Link
            to={`/product/${spread.productId}`}
            className="inline-block mt-8 editorial-label link-line hover:text-accent"
          >
            Study the piece →
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between editorial-label">
        <span>Plate · {String(index + 1).padStart(2, '0')} / {String(spreads.length).padStart(2, '0')}</span>
        <span>Saint-Médard · MMXXVI</span>
      </div>
    </section>
  )
}
