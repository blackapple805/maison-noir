import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LegalPage, { Section } from './LegalPage'
import { useConsent, OWNED_STORAGE_KEYS, OWNED_SESSION_KEYS } from '../context/ConsentContext'

/**
 * Cookies Policy — DRAFT
 *
 * Now includes an interactive Preferences panel beneath the policy text:
 *   - Live view of what's currently stored in the browser
 *   - Toggles for each consent category (essential, analytics, marketing)
 *   - Clear-all-storage button
 *
 * Analytics and Marketing categories are inert today — they ship "off" and
 * gate no actual scripts. When you add analytics later, wire the script's
 * initialization behind hasConsent('analytics'). UI is already in place.
 */
export default function Cookies() {
  return (
    <LegalPage
      folio="C-01"
      label="Legal · Cookies Policy"
      title="A small amount"
      italicTitle="of memory."
      lastUpdated="May 2026"
    >
      <Section n="I" title="The short version">
        <p>
          This site uses a small amount of browser storage to remember your
          theme preference, your wishlist, and your order history. It does
          not use third-party advertising trackers, social pixels, or
          cross-site cookies. Where minimal analytics are present, they are
          first-party and aggregated.
        </p>
      </Section>

      <Section n="II" title="What technologies we use">
        <p>
          The site uses two related technologies, both stored locally on
          your device:
        </p>
        <ul className="space-y-2 list-disc list-inside ml-2">
          <li>
            <strong className="text-bone/90">localStorage</strong> — a small
            key-value store that persists between visits until you clear
            your browser data.
          </li>
          <li>
            <strong className="text-bone/90">sessionStorage</strong> — a
            similar store that is cleared when you close the browser tab.
          </li>
        </ul>
        <p>
          We do not currently set HTTP cookies for tracking or analytics.
          The payment processor and certain integrated services may set
          their own cookies during checkout, governed by their own policies.
        </p>
      </Section>

      <Section n="III" title="What we store, and why">
        <div className="border hairline">
          <div className="grid grid-cols-12 editorial-label text-bone/40 px-4 py-3 border-b hairline">
            <div className="col-span-4">Key</div>
            <div className="col-span-4">Purpose</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Duration</div>
          </div>
          {[
            ['mn-theme', 'Remembers dark/light preference', 'localStorage', 'Until cleared'],
            ['mn-wishlist', 'Stores saved product IDs', 'localStorage', 'Until cleared'],
            ['mn-orders', 'Stores order history for confirmation pages', 'localStorage', 'Until cleared'],
            ['mn-consent', 'Records your cookie preferences', 'localStorage', 'Until cleared'],
            ['mn-loading', 'Suppresses the loading screen after first view', 'sessionStorage', 'Tab session'],
          ].map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-12 px-4 py-4 text-sm text-bone/80 border-b hairline last:border-b-0"
            >
              <div className="col-span-4 font-mono text-xs">{row[0]}</div>
              <div className="col-span-4">{row[1]}</div>
              <div className="col-span-2 text-bone/60 text-xs">{row[2]}</div>
              <div className="col-span-2 text-bone/60 text-xs">{row[3]}</div>
            </div>
          ))}
        </div>
        <p className="text-sm">
          None of these store personal identifiers. Order data held in
          localStorage exists only on your device and is not transmitted to
          our servers except when you place an order.
        </p>
      </Section>

      <Section n="IV" title="Third-party processors">
        <p>
          The site loads typography from Google Fonts and a small number of
          editorial photographs from Unsplash. Both services may log basic
          request data (IP, user agent) when their content is fetched.
          Their privacy practices are governed by their own policies.
        </p>
        <p>
          When you place an order, your payment service provider may set
          its own cookies as part of the checkout flow. These are necessary
          for the transaction and subject to that provider's policy.
        </p>
      </Section>

      <Section n="V" title="Your preferences">
        <p>
          You can review and change your preferences at any time below, or
          clear every key this site has written to your browser. Doing so
          will reset your theme, empty your wishlist, and remove the local
          copy of any order confirmations from this device.
        </p>
      </Section>

      {/* Live preferences panel — interactive */}
      <PreferencesPanel />

      <Section n="VI" title="Updates">
        <p>
          If we introduce new storage technologies — for example, opt-in
          analytics or a customer account system — we will update this page
          and where required by law, seek your consent before activation.
        </p>
      </Section>
    </LegalPage>
  )
}

/**
 * Preferences panel
 * -----------------
 * Three category toggles + a storage inspector + a clear-all button.
 *
 * Essential is rendered with the toggle disabled — visually obvious that
 * it's required for the site to function. Other categories are inert
 * today (no scripts gated behind them) but persist the user's choice so
 * that when they are wired, prior consent is honored.
 */
function PreferencesPanel() {
  const { consent, setConsent, clearAllStorage } = useConsent()
  const [snapshot, setSnapshot] = useState(() => readStorageSnapshot())
  const [confirming, setConfirming] = useState(false)
  const [cleared, setCleared] = useState(false)

  // Refresh storage snapshot whenever consent changes (it writes mn-consent),
  // or when we clear, so the inspector reflects reality.
  const refresh = useCallback(() => setSnapshot(readStorageSnapshot()), [])

  useEffect(() => {
    refresh()
  }, [consent, refresh])

  const handleClear = () => {
    clearAllStorage()
    setCleared(true)
    setConfirming(false)
    refresh()
    // Hide the confirmation banner after a few seconds.
    setTimeout(() => setCleared(false), 4000)
  }

  return (
    <article className="grid md:grid-cols-12 gap-6 md:gap-12">
      <div className="md:col-span-3">
        <div className="font-display text-3xl md:text-4xl tracking-tighter2 text-ox sticky top-32">
          ⌥
        </div>
      </div>
      <div className="md:col-span-9 space-y-10">
        <h2 className="font-display text-2xl md:text-3xl italic tracking-tight text-bone/90 leading-snug">
          Preferences.
        </h2>

        {/* Category toggles */}
        <div className="border hairline">
          <CategoryRow
            label="Essential"
            note="Required for the site to function. Cannot be disabled."
            checked
            disabled
          />
          <CategoryRow
            label="Analytics"
            note="First-party, aggregated usage data. None active today."
            checked={consent.analytics}
            onChange={(v) => setConsent('analytics', v)}
          />
          <CategoryRow
            label="Marketing"
            note="Personalised content and campaign measurement. None active today."
            checked={consent.marketing}
            onChange={(v) => setConsent('marketing', v)}
          />
        </div>

        {/* Live storage inspector */}
        <div>
          <p className="editorial-label text-bone/40 mb-3">— Currently stored on this device</p>
          {snapshot.entries.length === 0 ? (
            <p className="text-bone/60 text-sm italic">
              Nothing is currently stored.
            </p>
          ) : (
            <div className="border hairline">
              {snapshot.entries.map((entry, i) => (
                <div
                  key={entry.key + entry.scope}
                  className={`px-4 py-3 grid grid-cols-12 gap-3 text-sm ${
                    i < snapshot.entries.length - 1 ? 'border-b hairline' : ''
                  }`}
                >
                  <div className="col-span-4 font-mono text-xs text-bone/80">
                    {entry.key}
                  </div>
                  <div className="col-span-2 editorial-label text-bone/40 text-[10px]">
                    {entry.scope}
                  </div>
                  <div className="col-span-6 text-bone/60 text-xs truncate font-mono" title={entry.value}>
                    {entry.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear button + confirmation */}
        <div className="border-t hairline pt-8">
          <AnimatePresence mode="wait">
            {cleared ? (
              <motion.div
                key="cleared"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <p className="editorial-label text-ox mb-2">— Cleared</p>
                <p className="text-bone/70 text-sm">
                  Every key this site wrote has been removed from your browser.
                </p>
              </motion.div>
            ) : confirming ? (
              <motion.div
                key="confirming"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-bone/80 mb-6 leading-relaxed">
                  This will remove your theme, wishlist, order history, and
                  consent preferences from this browser. Items currently in
                  the cart on this tab will be unaffected. Are you sure?
                </p>
                <div className="flex flex-wrap gap-6 items-center">
                  <button
                    onClick={handleClear}
                    className="editorial-label tracking-[0.32em] uppercase text-xs px-6 py-3 border hairline hover:border-bone/40 transition-colors"
                  >
                    Yes, clear everything →
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="editorial-label link-line text-bone/60 hover:text-bone"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setConfirming(true)}
                  className="editorial-label link-line text-bone/80 hover:text-ox"
                >
                  Clear all data stored by this site →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </article>
  )
}

function CategoryRow({ label, note, checked, disabled, onChange }) {
  return (
    <div className="px-4 py-5 grid grid-cols-12 gap-4 items-start border-b hairline last:border-b-0">
      <div className="col-span-10 md:col-span-9">
        <div className="editorial-label text-bone/90 mb-2">{label}</div>
        <p className="text-bone/60 text-sm leading-relaxed">{note}</p>
      </div>
      <div className="col-span-2 md:col-span-3 flex justify-end items-center pt-1">
        <Toggle
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          ariaLabel={`Toggle ${label} cookies`}
        />
      </div>
    </div>
  )
}

function Toggle({ checked, disabled, onChange, ariaLabel }) {
  const handleKey = (e) => {
    if (disabled) return
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      onChange?.(!checked)
    }
  }

  // Four visual states — the disabled+checked one matters most. It needs
  // to read as "this is on, you can't change it" rather than "this is off".
  // We achieve that with a muted-red track (lower opacity than active red)
  // and a muted knob, keeping the knob in the right-hand position.
  let trackClass
  let knobClass
  if (disabled && checked) {
    // Locked on — required setting, like Essential
    trackClass = 'bg-ox/40 cursor-not-allowed'
    knobClass = 'bg-bone/60'
  } else if (disabled && !checked) {
    // Locked off — placeholder for future categories
    trackClass = 'bg-bone/10 cursor-not-allowed'
    knobClass = 'bg-bone/30'
  } else if (checked) {
    // Actively on — bright accent
    trackClass = 'bg-ox cursor-pointer'
    knobClass = 'bg-bone'
  } else {
    // Actively off
    trackClass = 'bg-bone/20 cursor-pointer hover:bg-bone/30'
    knobClass = 'bg-bone'
  }

  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onChange?.(!checked)}
      onKeyDown={handleKey}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${trackClass}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all duration-300 ${knobClass}`}
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  )
}

/**
 * Read the *current* values of every key we own from both storage types
 * so the inspector can show truth-on-disk, not the values React happens
 * to remember.
 */
function readStorageSnapshot() {
  const entries = []
  for (const key of OWNED_STORAGE_KEYS) {
    try {
      const value = localStorage.getItem(key)
      if (value !== null) {
        entries.push({ key, scope: 'local', value: truncate(value) })
      }
    } catch {
      /* swallow */
    }
  }
  for (const key of OWNED_SESSION_KEYS) {
    try {
      const value = sessionStorage.getItem(key)
      if (value !== null) {
        entries.push({ key, scope: 'session', value: truncate(value) })
      }
    } catch {
      /* swallow */
    }
  }
  return { entries }
}

function truncate(s, n = 120) {
  if (typeof s !== 'string') return ''
  return s.length > n ? s.slice(0, n) + '…' : s
}
