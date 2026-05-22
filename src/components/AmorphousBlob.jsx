import { motion } from 'framer-motion'

/**
 * AmorphousBlob — a single drifting organic shape.
 *
 * Use as ambient atmosphere. Keep opacity LOW (0.04 – 0.18).
 * These should breathe, never demand attention.
 *
 * Props:
 *   variant  'draped' | 'droplet' | 'melted' | 'fractured'   shape family
 *   color    CSS color or var()                              default: var(--accent)
 *   size     number (px or vw string ok)                     default: 600
 *   opacity  number 0–1                                      default: 0.08
 *   blur     number (px)                                     default: 60
 *   drift    boolean                                         default: true
 *   duration seconds for one drift cycle                     default: 22
 *   className positioning utility classes
 *   style     additional inline styles (top/left/etc.)
 */
export default function AmorphousBlob({
  variant = 'draped',
  color = 'var(--accent)',
  size = 600,
  opacity = 0.08,
  blur = 60,
  drift = true,
  duration = 22,
  className = '',
  style = {},
}) {
  const paths = {
    draped:
      'M40,30 Q90,20 130,40 Q175,55 165,100 Q160,140 130,160 Q100,180 70,165 Q35,150 30,110 Q25,70 40,30 Z',
    droplet:
      'M100,25 Q140,45 150,90 Q160,140 120,170 Q85,185 60,160 Q35,130 50,95 Q70,55 100,25 Z',
    melted:
      'M35,60 Q70,30 115,45 Q165,55 170,100 Q175,140 150,160 Q120,175 85,170 Q45,168 30,135 Q20,95 35,60 Z',
    fractured:
      'M50,40 Q90,25 130,45 L155,80 Q165,120 140,150 L110,165 Q70,175 50,150 L35,115 Q30,75 50,40 Z',
  }

  const sizeStr = typeof size === 'number' ? `${size}px` : size

  const driftAnim = drift
    ? {
        x: [0, 30, -20, 10, 0],
        y: [0, -25, 15, -10, 0],
        scale: [1, 1.08, 0.95, 1.04, 1],
        rotate: [0, 8, -5, 3, 0],
      }
    : {}

  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      style={{
        width: sizeStr,
        height: sizeStr,
        opacity,
        filter: `blur(${blur}px)`,
        willChange: 'transform',
        ...style,
      }}
      animate={driftAnim}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <path d={paths[variant] || paths.draped} fill={color} />
      </svg>
    </motion.div>
  )
}
