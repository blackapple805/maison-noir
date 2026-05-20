import { createContext, useContext, useEffect, useState } from 'react'

const WishlistContext = createContext(null)

const STORAGE_KEY = 'mn-wishlist'

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {
      // ignore quota errors
    }
  }, [ids])

  const toggle = (id) => {
    setIds((curr) => (curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]))
  }
  const has = (id) => ids.includes(id)
  const clear = () => setIds([])

  return (
    <WishlistContext.Provider value={{ ids, toggle, has, clear, count: ids.length }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
