import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleSubscribe(e) {
    e.preventDefault()
    setError('')
    // Lightweight email validation — same pattern as Checkout.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid address.')
      return
    }
    // No backend wired — capture locally and show confirmation. Swap
    // for an audience API (Resend, Buttondown, Klaviyo, etc.) when ready.
    setSubmitted(true)
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

          {submitted ? (
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
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) setError('')
                }}
                placeholder="your.address@elsewhere.com"
                className="flex-1 bg-transparent outline-none text-bone placeholder:text-bone/30 text-sm"
                aria-label="Email address"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'newsletter-error' : undefined}
                required
              />
              <button
                type="submit"
                className="editorial-label text-bone hover:text-ox transition-colors"
              >
                Subscribe →
              </button>
            </form>
          )}
          {error && !submitted && (
            <p
              id="newsletter-error"
              className="editorial-label text-accent mt-3 max-w-md normal-case tracking-normal"
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
