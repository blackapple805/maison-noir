import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

// Each spread carries its own overlay strength.
// Brighter photos need higher overlay (0.65-0.80) to keep text legible.
// Darker / moodier photos need lower overlay (0.35-0.50) so the image stays visible.
// 'side' controls which side the secondary directional gradient anchors text against.
const spreads = [
  {
    n: 'I',
    title: 'Source',
    line: 'The flower is picked before sunrise. The cold preserves the oil.',
    image: 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=2000&q=85',
    productId: 'fleur-cleansing-oil',
    overlay: 0.72, // bright cherry blossom — needs heavier darkening
    side: 'left',
  },
  {
    n: 'II',
    title: 'Distill',
    line: 'Steam carries the essence. We capture what would otherwise be lost.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=2000&q=85',
    productId: 'sérum-lumière',
    overlay: 0.60,
    side: 'right',
  },
  {
    n: 'III',
    title: 'Rest',
    line: 'A formula matures in glass for forty days before it leaves us.',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=2000&q=85',
    productId: 'huile-précieuse',
    overlay: 0.45, // amber bottle, already dim — let it breathe
    side: 'left',
  },
  {
    n: 'IV',
    title: 'Ritual',
    line: 'Apply with intention. The hands do half the work.',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=2000&q=85',
    productId: 'crème-velours',
    overlay: 0.50,
    side: 'right',
  },
]

export default function Lookbook() {
  return (
    <div className="pt-24">
      {/* Cover */}
      <section className="px-6 md:px-10 py-24 md:py-32 border-b hairline grain">
        <p className="editorial-label text-accent mb-6">— Batch 26 · The Lookbook</p>
        <h1 className="font-display text-6xl md:text-8xl lg:text-[11rem] tracking-tighter2 leading-[0.86]">
          A study <br />
          <span className="italic text-fg-muted">in skin.</span>
        </h1>
        <p className="text-fg-muted mt-10 max-w-xl leading-relaxed">
          Four chapters. One batch. Photographed in the laboratories of
          Grasse and the orchards of Provence, by morning light over three days
          in February.
        </p>
      </section>

      {spreads.map((s, i) => (
        <Spread key={s.n} spread={s} index={i} />
      ))}

      <section className="px-6 md:px-10 py-32 text-center grain">
        <p className="editorial-label text-accent mb-6">— Coda</p>
        <p className="font-display italic text-3xl md:text-5xl max-w-3xl mx-auto leading-tight text-fg-muted mb-10 text-adaptive">
          "Skin is memory. Care is repetition."
        </p>
        <Link to="/collection" className="editorial-label link-line hover:text-accent">
          View the Apothecary →
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

  // Anchor the directional gradient on the SAME side as the text content,
  // so type sits over the darker region of the image.
  const sideGradient =
    spread.side === 'right'
      ? 'linear-gradient(270deg, rgba(0,0,0,0.55) 0%, transparent 55%)'
      : 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, transparent 55%)'

  return (
    <section ref={ref} className="relative min-h-[110vh] flex items-center overflow-hidden border-b hairline bg-bg">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img
          src={spread.image}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            // Graceful fallback: hide broken image so the section never
            // collapses into a pure-black void with no visual.
            e.currentTarget.style.display = 'none'
          }}
        />
        {/* Per-spread base darkening — tuned to the photo's luminosity */}
        <div
          className="absolute inset-0"
          style={{ background: `rgba(10, 10, 10, ${spread.overlay})` }}
        />
        {/* Directional anchor — gives text a darker zone to sit against */}
        <div
          className="absolute inset-0"
          style={{ background: sideGradient }}
        />
      </motion.div>

      <div className={`relative z-10 px-6 md:px-16 w-full max-w-7xl mx-auto grid md:grid-cols-12 gap-8 items-center ${flip ? 'md:[direction:rtl]' : ''}`}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-7 md:[direction:ltr]"
        >
          <div className="editorial-label text-accent mb-4 text-adaptive">— Chapter {spread.n}</div>
          <h2 className="font-display text-6xl md:text-8xl lg:text-[10rem] tracking-tighter2 leading-[0.88] text-fg text-adaptive">
            {spread.title}
          </h2>
          <p className="font-display italic text-2xl md:text-3xl text-fg mt-8 max-w-lg leading-snug text-adaptive">
            {spread.line}
          </p>
          <Link
            to={`/product/${spread.productId}`}
            className="inline-block mt-8 editorial-label link-line text-fg hover:text-accent text-adaptive"
          >
            Study the formulation →
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between editorial-label text-adaptive">
        <span>Plate · {String(index + 1).padStart(2, '0')} / {String(spreads.length).padStart(2, '0')}</span>
        <span>Grasse · MMXXVI</span>
      </div>
    </section>
  )
}