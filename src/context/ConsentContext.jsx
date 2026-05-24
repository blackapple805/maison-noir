import { createContext, useContext, useEffect, useState, useCallback } from 'react'

/**
 * ConsentContext
 * --------------
 * Central record of what the user has consented to. Used to gate any
 * non-essential storage or third-party scripts that get added later.
 *
 * Today the only category that's "on" is `essential`. The other
 * categories exist so that when you wire real analytics or marketing
 * tools, you call `hasConsent('analytics')` before initializing them —
 * no rewrite of consent plumbing needed.
 *
 * Adding a new category later:
 *   1. Add the key to DEFAULT_STATE below.
 *   2. Add a row to the toggles UI on the /cookies page.
 *   3. Guard the relevant initialization with `hasConsent('newKey')`.
 *
 * The shape is `{ essential: true, analytics: false, marketing: false }`.
 * Essential is always true and cannot be turned off — it covers what
 * GDPR / ePrivacy treat as strictly necessary (theme, wishlist, orders).
 */

const STORAGE_KEY = 'mn-consent'
const STORAGE_VERSION = 1 // bump if the shape ever changes

/**
 * Keys this site can write to localStorage. Used by clearAllStorage() so
 * we only ever remove our own keys — never touch other sites or extensions
 * that happen to share storage on the same origin during development.
 */
export const OWNED_STORAGE_KEYS = [
  'mn-theme',
  'mn-wishlist',
  'mn-orders',
  'mn-consent',
]
export const OWNED_SESSION_KEYS = [
  'mn-loading',
]

const DEFAULT_STATE = Object.freeze({
  essential: true,
  analytics: false,
  marketing: false,
})

const ConsentContext = createContext(null)

// All storage access is wrapped — Safari private mode and certain
// embedded contexts throw on access, and a thrown SecurityError
// shouldn't take the whole app down.
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
    /* swallow */
  }
}

function loadStored() {
  const raw = safeGet()
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.version !== STORAGE_VERSION) return null
    return parsed.state
  } catch {
    return null
  }
}

function persist(state) {
  safeSet(JSON.stringify({ version: STORAGE_VERSION, state, updatedAt: new Date().toISOString() }))
}

export function ConsentProvider({ children }) {
  const [consent, setConsentState] = useState(() => {
    const stored = loadStored()
    // Merge defaults so newly added categories appear as `false` for users
    // whose stored consent predates them.
    return { ...DEFAULT_STATE, ...(stored || {}) }
  })

  // Persist any change. Essential always forced true so a stale value
  // can never disable functional storage.
  useEffect(() => {
    persist({ ...consent, essential: true })
  }, [consent])

  const setConsent = useCallback((category, value) => {
    if (category === 'essential') return // never togglable
    setConsentState((s) => ({ ...s, [category]: Boolean(value) }))
  }, [])

  const setAll = useCallback((value) => {
    setConsentState((s) => {
      const next = { ...s }
      Object.keys(next).forEach((k) => {
        if (k !== 'essential') next[k] = Boolean(value)
      })
      return next
    })
  }, [])

  const hasConsent = useCallback(
    (category) => Boolean(consent[category]),
    [consent]
  )

  /**
   * Wipe every storage key this site has written. Safe to call from the
   * /cookies preferences page — it does not touch any keys outside the
   * allowlist above.
   */
  const clearAllStorage = useCallback(() => {
    OWNED_STORAGE_KEYS.forEach((k) => {
      try {
        localStorage.removeItem(k)
      } catch {
        /* swallow */
      }
    })
    OWNED_SESSION_KEYS.forEach((k) => {
      try {
        sessionStorage.removeItem(k)
      } catch {
        /* swallow */
      }
    })
    // Reset in-memory state to defaults so the rest of the app reflects it
    // immediately (otherwise we'd have stale values until next reload).
    setConsentState({ ...DEFAULT_STATE })
  }, [])

  return (
    <ConsentContext.Provider
      value={{ consent, setConsent, setAll, hasConsent, clearAllStorage }}
    >
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider')
  return ctx
}
