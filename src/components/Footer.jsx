import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [email, setEmail] = useState('')
  // 'idle' | 'sending' | 'sent' | 'error'
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  // Honeypot — hidden from real users, irresistible to bots.
  const [honeypot, setHoneypot] = useState('')

  // Page-mount timestamp — the backend rejects forms submitted under
  // 1 second after mount (no real human types and submits that fast).
  const mountedAt = useRef(Date.now())
  useEffect(() => {
    if (status === 'idle') mountedAt.current = Date.now()
  }, [status])

  async function handleSubscribe(e) {
    e.preventDefault()
    if (status === 'sending') return
    setError('')

    // Client-side email shape check — cheap UX win, server validates again.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid address.')
      return
    }

    setStatus('sending')
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          _gotcha: honeypot,
          _ts: mountedAt.current,
        }),
      })

      let data = null
      try {
        data = await response.json()
      } catch {
        // ignore
      }

      if (response.ok && data?.ok) {
        setStatus('sent')
        return
      }

      if (response.status === 429) {
        setError('Too many attempts. Please try again later.')
      } else {
        setError(data?.error || 'Could not subscribe. Please try again.')
      }
      setStatus('error')
    } catch {
      setError('Network unavailable. Please try again.')
      setStatus('error')
    }
  }

  return (
    <footer className="border-t hairline mt-32 pt-20 pb-10 px-6 md:px-10 grain">
      <div className="grid md:grid-cols-12 gap-12 mb-20">
        <div className="md:col-span-5">
          <h2 className="font-display text-5xl md:text-7xl tracking-tighter2 leading-[0.9] mb-6">
            Receive <br />
            <span className="italic text-bone/70">the dispatch.</span>
          </h2>
          <p className="text-bone/60 max-w-md mb-8 text-sm leading-relaxed">
            Quarterly editorial. Atelier studies, private previews,
            and the occasional invitation. Unsubscribe with one breath.
          </p>

          {status === 'sent' ? (
            <div className="max-w-md">
              <p className="editorial-label text-accent mb-3">— Received</p>
              <p className="font-display italic text-2xl leading-tight text-bone/90 mb-2">
                Thank you.
              </p>
              <p className="text-bone/60 text-sm leading-relaxed">
                The next dispatch will arrive at{' '}
                <span className="text-bone/90">{email}</span>.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex items-center border-b hairline pb-2 max-w-md"
              noValidate
            >
              {/* Honeypot — hidden from real users. Wrapped in a div that
                  visually hides without using display:none (which some bots
                  detect and skip). */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  overflow: 'hidden',
                }}
              >
                <label>
                  Leave this field empty
                  <input
                    type="text"
                    name="_gotcha"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </label>
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) {
                    setError('')
                    setStatus('idle')
                  }
                }}
                placeholder="your.address@elsewhere.com"
                className="flex-1 bg-transparent outline-none text-bone placeholder:text-bone/30 text-sm"
                aria-label="Email address"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'newsletter-error' : undefined}
                autoComplete="email"
                maxLength={254}
                required
                disabled={status === 'sending'}
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                aria-busy={status === 'sending'}
                className="editorial-label text-bone hover:text-ox transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {status === 'sending' ? 'Sending…' : 'Subscribe →'}
              </button>
            </form>
          )}
          {error && status !== 'sent' && (
            <p
              id="newsletter-error"
              className="editorial-label text-accent mt-3 max-w-md normal-case tracking-normal"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
          <div>
            <h4 className="editorial-label text-bone/40 mb-5">House</h4>
            <ul className="space-y-3 text-sm text-bone/80">
              <li><Link className="link-line" to="/atelier">Atelier</Link></li>
              <li><Link className="link-line" to="/heritage">Heritage</Link></li>
              <li><Link className="link-line" to="/journal">Journal</Link></li>
              <li><Link className="link-line" to="/boutiques">Boutiques</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="editorial-label text-bone/40 mb-5">Services</h4>
            <ul className="space-y-3 text-sm text-bone/80">
              <li><Link className="link-line" to="/made-to-measure">Made to Measure</Link></li>
              <li><Link className="link-line" to="/consultation">Apothecary Consultation</Link></li>
              <li><Link className="link-line" to="/refill">Refill & Recycling</Link></li>
              <li><Link className="link-line" to="/concierge">Concierge</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="editorial-label text-bone/40 mb-5">Contact</h4>
            <ul className="space-y-3 text-sm text-bone/80">
              <li>
                <a className="link-line" href="tel:+33142600000">
                  +33 1 42 60 00 00
                </a>
              </li>
              <li>
                <a className="link-line break-all" href="mailto:concierge@maisonnoir.apothecary">
                  concierge@maisonnoir.apothecary
                </a>
              </li>
              <li className="text-bone/60 pt-2">
                12 Rue de l'Université <br />
                75007 Paris
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t hairline pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 editorial-label text-bone/40">
        <div className="font-display text-3xl tracking-tighter2 text-bone/90 normal-case">
          MAISON·NOIR
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link className="link-line" to="/terms">Terms</Link>
          <Link className="link-line" to="/privacy">Privacy</Link>
          <Link className="link-line" to="/cookies">Cookies</Link>
          <Link className="link-line" to="/modern-slavery">Modern Slavery Statement</Link>
        </div>
        <div>© MMXXVI · All Rites Reserved</div>
      </div>
    </footer>
  )
}
