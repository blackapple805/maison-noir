import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Shows once per session — sigil draws itself, brand fades up, then exits
export default function LoadingScreen() {
  const [show, setShow] = useState(() => {
    if (typeof window === 'undefined') return false
    return !sessionStorage.getItem('mn-loaded')
  })

  useEffect(() => {
    if (!show) return
    const timer = setTimeout(() => {
      setShow(false)
      sessionStorage.setItem('mn-loaded', '1')
    }, 2600)
    return () => clearTimeout(timer)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg grain"
        >
          {/* Top corner mark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute top-6 left-6 editorial-label"
          >
            N° 26 · Preparing the apothecary
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute top-6 right-6 editorial-label text-right"
          >
            <CountUp />
          </motion.div>

          {/* The sigil — drawn by stroke-dashoffset, then filled */}
          <svg
            width="120"
            height="120"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-fg"
          >
            <motion.path
              d="M20 1 L39 20 L20 39 L1 20 Z"
              stroke="currentColor"
              strokeWidth="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d="M20 4 L36 20 L20 20 L4 20 Z"
              fill="currentColor"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              stroke="currentColor"
              strokeWidth="0.3"
            />
            <motion.path
              d="M20 20 L28 36 L20 28 L12 36 Z"
              fill="currentColor"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              stroke="currentColor"
              strokeWidth="0.3"
            />
            <motion.circle
              cx="20"
              cy="20"
              r="1.6"
              fill="#9C1B2A"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 2, 1] }}
              transition={{ duration: 0.8, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="mt-10 text-center"
          >
            <div className="font-display text-3xl tracking-tighter2">MAISON·NOIR</div>
            <div className="editorial-label mt-2">Atelier · MMXXVI</div>
          </motion.div>

          {/* Bottom progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-6 left-6 right-6 flex items-center gap-4 editorial-label"
          >
            <span>Folio · 001</span>
            <div className="flex-1 h-px bg-fg/15 overflow-hidden relative">
              <motion.div
                className="absolute inset-y-0 left-0 bg-accent"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.4, ease: 'linear' }}
              />
            </div>
            <span>Entering</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function CountUp() {
  const [n, setN] = useState(0)
  useEffect(() => {
    const t0 = performance.now()
    const dur = 2200
    let raf
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur)
      setN(Math.floor(p * 100))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <span>{String(n).padStart(3, '0')}%</span>
}
