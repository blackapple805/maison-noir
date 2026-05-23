import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'mn-theme'

/**
 * Safari Private Browsing throws on localStorage access. Mobile browsers
 * also throw on cross-origin iframes. Every read and write is wrapped so
 * a single thrown SecurityError can't take down the whole app.
 */
function safeGet() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}
function safeSet(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* swallow quota / security errors */
  }
}
function safeRemove() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* swallow */
  }
}

function prefersLight() {
  try {
    return window.matchMedia('(prefers-color-scheme: light)').matches
  } catch {
    return false
  }
}

export function ThemeProvider({ children }) {
  // Initial: stored override > system preference > dark
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = safeGet()
    if (stored === 'dark' || stored === 'light') return stored
    return prefersLight() ? 'light' : 'dark'
  })

  // Track if the user has manually overridden — only then do we ignore system changes
  const [manual, setManual] = useState(() => {
    if (typeof window === 'undefined') return false
    return safeGet() !== null
  })

  // Apply to <html>
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.style.colorScheme = theme
  }, [theme])

  // Listen for system theme changes — only follow if user hasn't overridden
  useEffect(() => {
    if (manual) return
    let mq
    try {
      mq = window.matchMedia('(prefers-color-scheme: light)')
    } catch {
      return
    }
    const onChange = (e) => setTheme(e.matches ? 'light' : 'dark')
    // addEventListener is the modern API; older Safari needs addListener
    if (mq.addEventListener) {
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    } else if (mq.addListener) {
      mq.addListener(onChange)
      return () => mq.removeListener(onChange)
    }
  }, [manual])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setManual(true)
    safeSet(next)
  }

  const resetToSystem = () => {
    safeRemove()
    setManual(false)
    setTheme(prefersLight() ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle, resetToSystem, manual }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
