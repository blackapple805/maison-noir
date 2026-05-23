import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { products } from '../data/products'

const SearchContext = createContext(null)

export function SearchProvider({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <SearchContext.Provider value={{ open, setOpen }}>
      {children}
      <SearchOverlay />
    </SearchContext.Provider>
  )
}

export const useSearch = () => useContext(SearchContext)

function SearchOverlay() {
  const { open, setOpen } = useSearch()
  const [q, setQ] = useState('')
  const inputRef = useRef(null)

  // Lock scroll, focus input, listen for Escape
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => inputRef.current?.focus(), 100)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      clearTimeout(t)
    }
  }, [open, setOpen])

  // Reset query when closed
  useEffect(() => {
    if (!open) setQ('')
  }, [open])

  const results = useMemo(() => {
    if (!q.trim()) return []
    const term = q.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.colorway.toLowerCase().includes(term) ||
        p.materials.toLowerCase().includes(term)
    )
  }, [q])

  const suggestions = ['Tailoring', 'Cashmere', 'Oxblood', 'Chelsea', 'Outerwear']

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[70] bg-bg/95 backdrop-blur-xl grain overflow-y-auto"
        >
          <div className="min-h-screen px-6 md:px-10 pt-24 pb-10">
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-6 right-6 editorial-label link-line hover:text-accent z-10"
            >
              Close · ESC
            </button>

            {/* Input */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-5xl mx-auto"
            >
              <div className="editorial-label text-accent mb-3">— Search the apothecary</div>
              <input
                ref={inputRef}
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Formulations, ingredients, rituals…"
                className="w-full bg-transparent border-b hairline pb-4 text-3xl md:text-6xl font-display tracking-tighter2 outline-none focus:border-fg transition-colors placeholder:text-fg-faint"
              />
              <div className="flex items-center justify-between mt-4 editorial-label">
                <span>
                  {q.trim() ? `${results.length} formulation${results.length === 1 ? '' : 's'}` : 'Begin typing'}
                </span>
                <span className="text-fg-dim">Press ↵ to view</span>
              </div>
            </motion.div>

            {/* Suggestions when empty */}
            {!q.trim() && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="max-w-5xl mx-auto mt-12"
              >
                <div className="editorial-label text-fg-dim mb-4">Or try</div>
                <div className="flex flex-wrap gap-3">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQ(s)}
                      className="px-4 py-2 border hairline editorial-label hover:border-accent hover:text-accent transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Results */}
            {results.length > 0 && (
              <div className="max-w-5xl mx-auto mt-12 space-y-1">
                {results.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                  >
                    <Link
                      to={`/product/${p.id}`}
                      onClick={() => setOpen(false)}
                      className="group flex items-center gap-6 py-4 border-b hairline hover:bg-fg/5 transition-colors -mx-4 px-4"
                    >
                      <div className="w-16 h-20 bg-bg-elev overflow-hidden shrink-0">
                        <img src={p.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="editorial-label text-fg-dim mb-1">{p.category}</div>
                        <div className="font-display text-2xl tracking-tighter2 truncate">{p.name}</div>
                      </div>
                      <div className="font-mono text-sm hidden md:block">
                        €{p.price.toLocaleString()}
                      </div>
                      <span className="editorial-label opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {q.trim() && results.length === 0 && (
              <div className="max-w-5xl mx-auto mt-16 text-center">
                <p className="font-display italic text-3xl text-fg-muted mb-3">Nothing found.</p>
                <p className="editorial-label">The formulation you seek is not in this archive.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
