import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useSearch } from './SearchOverlay'
import { Heart } from './QuickView'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

export default function Nav() {
  const { count, dispatch } = useCart()
  const { count: wishCount } = useWishlist()
  const { setOpen: setSearchOpen } = useSearch()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Keyboard shortcut: Cmd/Ctrl + K opens search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSearchOpen])

  const onHome = pathname === '/'

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-700 ${
        scrolled || !onHome
          ? 'bg-bg/85 backdrop-blur-md border-b hairline'
          : 'bg-transparent'
      }`}
    >
      <div className="px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <Link to="/" aria-label="MAISON NOIR home">
          <Logo size={26} />
        </Link>

        <nav className="hidden md:flex items-center gap-10 editorial-label">
          <Link to="/collection" className="link-line hover:text-fg">Collection</Link>
          <Link to="/lookbook" className="link-line hover:text-fg">Lookbook</Link>
          <Link to="/atelier" className="link-line hover:text-fg">Apothecary</Link>
          <Link to="/wishlist" className="link-line hover:text-fg flex items-center gap-1.5">
            Saved <span className="opacity-50">[{String(wishCount).padStart(2, '0')}]</span>
          </Link>
        </nav>

        <div className="flex items-center gap-4 md:gap-5 editorial-label">
          <button
            onClick={() => setSearchOpen(true)}
            className="link-line hover:text-fg hidden sm:block"
            aria-label="Search (Ctrl+K)"
          >
            Search
          </button>
          <Link to="/wishlist" className="md:hidden" aria-label="Wishlist">
            <Heart filled={wishCount > 0} size={14} />
          </Link>
          <button
            onClick={() => dispatch({ type: 'OPEN' })}
            className="link-line text-fg hover:text-accent transition-colors"
          >
            Bag <span className="ml-1 opacity-50">[{String(count).padStart(2, '0')}]</span>
          </button>
          <ThemeToggle />
        </div>
      </div>
    </motion.header>
  )
}
