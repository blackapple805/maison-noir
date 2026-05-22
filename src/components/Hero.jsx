import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import AmorphousBlob from './AmorphousBlob'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-end overflow-hidden grain">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=2400&q=85"
          alt=""
          className="w-full h-full object-cover opacity-70"
          style={{ filter: `grayscale(var(--image-grayscale))` }}
        />
        {/* Theme-aware veils */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, var(--hero-veil-bottom), transparent 50%, var(--hero-veil-top))',
          }}
        />
        {/* Amorphous accent — drifts behind the headline */}
        <AmorphousBlob
          variant="draped"
          color="var(--accent)"
          size="55vw"
          opacity={0.22}
          blur={90}
          duration={26}
          style={{ bottom: '-10vw', left: '-8vw' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, var(--hero-veil-side), transparent 40%)',
          }}
        />
      </div>

      {/* Frame markings */}
      <div className="absolute top-24 left-6 md:left-10 editorial-label z-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}>
          N° 26 — Autumn / Winter
        </motion.div>
      </div>
      <div className="absolute top-24 right-6 md:right-10 editorial-label z-10 text-right">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }}>
          48° 51′ 24″ N <br /> 02° 21′ 03″ E
        </motion.div>
      </div>

      {/* Vertical text */}
      <div className="hidden md:block absolute left-6 top-1/2 -translate-y-1/2 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="editorial-label [writing-mode:vertical-rl] rotate-180"
          style={{ color: 'var(--fg-faint)' }}
        >
          Chapter One · Murmuration
        </motion.div>
      </div>

      {/* Headline */}
      <div className="relative z-10 px-6 md:px-10 pb-20 md:pb-28 w-full">
        <div className="max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="editorial-label mb-8"
            style={{ color: 'var(--accent)' }}
          >
            — A study in shadow
          </motion.p>

          <h1 className="font-display font-light leading-[0.88] tracking-tighter2 text-fg">
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="block text-6xl md:text-8xl lg:text-[10rem]"
            >
              The Silence
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="block text-6xl md:text-8xl lg:text-[10rem] italic pl-16 md:pl-40"
              style={{ color: 'var(--fg-muted)' }}
            >
              of Form.
            </motion.span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 1 }}
            className="mt-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8 max-w-3xl"
          >
            <p className="max-w-md leading-relaxed text-sm md:text-base" style={{ color: 'var(--fg-muted)' }}>
              An offering of sculpted silhouettes, hand-tailored in the
              ateliers of Florence and Paris. Each piece — a ritual.
            </p>
            <Link
              to="/collection"
              className="group inline-flex items-center gap-3 editorial-label text-fg hover:text-accent transition-colors"
            >
              <span className="link-line">Enter the Collection</span>
              <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-6 left-6 right-6 md:left-10 md:right-10 flex items-center justify-between editorial-label z-10">
        <span>Folio · 001</span>
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ color: 'var(--accent)' }}
        >
          ↓ Scroll
        </motion.span>
        <span className="hidden md:block">© MMXXVI</span>
      </div>
    </section>
  )
}
