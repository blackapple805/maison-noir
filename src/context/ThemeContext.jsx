import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  // Initial: stored override > system preference > dark
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = localStorage.getItem('mn-theme')
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  // Track if the user has manually overridden — only then do we ignore system changes
  const [manual, setManual] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('mn-theme') !== null
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
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = (e) => setTheme(e.matches ? 'light' : 'dark')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [manual])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setManual(true)
    localStorage.setItem('mn-theme', next)
  }

  const resetToSystem = () => {
    localStorage.removeItem('mn-theme')
    setManual(false)
    setTheme(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle, resetToSystem, manual }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
