import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuickView, Heart } from './QuickView'
import { useWishlist } from '../context/WishlistContext'

/**
 * ProductCard
 * -----------
 * Editorial product tile with an optional hover-video swap.
 *
 * Behavior:
 *   - Always renders the still image first (fast first paint).
 *   - If `product.video` is set AND the device has hover capability AND
 *     the user hasn't requested reduced motion: cross-fade to a muted
 *     looping video while the cursor is on the card.
 *   - On mobile or reduced-motion: the video field is ignored entirely
 *     so we don't ship megabytes to users who can't see the effect.
 *   - If the image itself 404s, fall back to a typographic placeholder.
 *
 * The video element is lazy-mounted: it doesn't exist in the DOM until
 * the user actually hovers, so the network never fetches video files
 * just from loading the collection page.
 */
export default function ProductCard({ product, index = 0 }) {
  const { open } = useQuickView()
  const { has, toggle } = useWishlist()
  const saved = has(product.id)

  const [imgFailed, setImgFailed] = useState(false)
  const [videoActive, setVideoActive] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [canPlayVideo, setCanPlayVideo] = useState(false)
  const videoRef = useRef(null)

  // Detect once: can this client hover, and does the user want motion?
  // We do this in an effect so SSR is safe and matchMedia isn't called
  // during the render path.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const hasHover = window.matchMedia('(hover: hover)').matches
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      setCanPlayVideo(hasHover && !reduceMotion && Boolean(product.video))
    } catch {
      setCanPlayVideo(false)
    }
  }, [product.video])

  const showVideo = canPlayVideo && videoActive

  // Pause + reset when not active so memory frees and the loop restarts
  // cleanly on the next hover. Without this, the video keeps decoding
  // off-screen on long pages with many cards.
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    if (showVideo) {
      // Don't auto-play before the file's actually buffered enough; that
      // first-paint flash of black is what makes hover-video feel cheap.
      el.play().catch(() => {
        /* user-gesture / autoplay policy — silent, image stays visible */
      })
    } else {
      el.pause()
      try {
        el.currentTime = 0
      } catch {
        /* readyState 0 — ignore */
      }
      setVideoReady(false)
    }
  }, [showVideo])

  const handleEnter = () => canPlayVideo && setVideoActive(true)
  const handleLeave = () => setVideoActive(false)

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="relative overflow-hidden bg-bg-elev aspect-[3/4] mb-5">
        {/* Amorphous hover accent — morphs in behind image edge */}
        <div
          aria-hidden="true"
          className="absolute -bottom-1/3 -right-1/3 w-2/3 h-2/3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-[1200ms]"
          style={{ filter: 'blur(40px)' }}
        >
          <svg viewBox="0 0 200 200" width="100%" height="100%">
            <path
              d="M100,25 Q140,45 150,90 Q160,140 120,170 Q85,185 60,160 Q35,130 50,95 Q70,55 100,25 Z"
              fill="var(--accent)"
              opacity="0.45"
            />
          </svg>
        </div>

        {/* Editorial caption */}
        <div className="absolute top-4 left-4 right-16 flex justify-between gap-3 editorial-label text-adaptive z-10 text-fg-muted pointer-events-none">
          <span className="truncate">{product.season}</span>
          <span className="truncate text-right">{product.colorway}</span>
        </div>

        <Link
          to={`/product/${product.id}`}
          className="block w-full h-full"
          aria-label={`View ${product.name}`}
        >
          {imgFailed ? (
            // Graceful fallback when the still 404s.
            <div
              className="w-full h-full flex items-center justify-center px-6 text-center"
              style={{ backgroundColor: 'var(--bg-elev-2)' }}
              aria-hidden="true"
            >
              <span
                className="font-display italic text-2xl leading-tight"
                style={{ color: 'var(--fg-faint)' }}
              >
                {product.name}
              </span>
            </div>
          ) : (
            <>
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                style={{
                  filter: `grayscale(var(--image-grayscale))`,
                  // The still fades out as the video fades in. Once the
                  // video has buffered, drop the still to 0 so there's
                  // no double-render of frame-1 stutter.
                  opacity: showVideo && videoReady ? 0 : 1,
                  transition: 'opacity 600ms ease, transform 1500ms ease-out',
                }}
                className={`w-full h-full object-cover ${
                  showVideo ? '' : 'group-hover:scale-105'
                }`}
                onError={() => setImgFailed(true)}
              />

              {/* Video layer — lazy mounted only when the device can hover.
                  preload='none' on first mount, then 'auto' once active so
                  the browser doesn't fetch the file on page load. */}
              {canPlayVideo && videoActive && (
                <video
                  ref={videoRef}
                  src={product.video}
                  muted
                  loop
                  playsInline
                  preload="auto"
                  aria-hidden="true"
                  onCanPlay={() => setVideoReady(true)}
                  onError={() => {
                    // Video can't play — stay on the still, no harm done.
                    setVideoActive(false)
                  }}
                  style={{
                    filter: `grayscale(var(--image-grayscale))`,
                    opacity: videoReady ? 1 : 0,
                    transition: 'opacity 600ms ease',
                  }}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
              )}
            </>
          )}
        </Link>

        {/* Wishlist heart — always visible, sits above any video */}
        <button
          onClick={(e) => {
            e.preventDefault()
            toggle(product.id)
          }}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-4 right-4 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center z-20 transition-all ${
            saved
              ? 'bg-accent text-bg'
              : 'bg-bg/40 text-fg hover:bg-bg/70'
          }`}
        >
          <Heart filled={saved} size={13} />
        </button>

        {/* Quick view — appears on hover */}
        <div className="absolute bottom-4 left-4 right-4 z-20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
          <button
            onClick={(e) => {
              e.preventDefault()
              open(product)
            }}
            className="w-full py-3 bg-fg text-bg font-mono text-[10px] tracking-editorial uppercase hover:bg-accent transition-colors"
          >
            Quick View
          </button>
        </div>
      </div>

      <Link to={`/product/${product.id}`} className="flex items-start justify-between gap-4">
        <div>
          <div className="editorial-label text-fg-dim mb-1.5">{product.category}</div>
          <h3 className="font-display text-xl md:text-2xl tracking-tighter2 leading-none">
            {product.name}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-sm tracking-tight">
            €{product.price.toLocaleString()}
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
