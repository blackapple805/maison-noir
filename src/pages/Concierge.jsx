import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import AmorphousBlob from '../components/AmorphousBlob'

const subjects = [
  'Made to Measure',
  'Apothecary Consultation',
  'Refill & Recycling',
  'Boutique reservation',
  'Press & editorial',
  'Other',
]

export default function Concierge() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: subjects[0],
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    // No backend wired — message is captured locally and the UI confirms.
    // Replace with an API call when the dispatch endpoint is ready.
    setSubmitted(true)
  }

  return (
    <div className="pt-32 md:pt-40 pb-32">
      {/* Cover */}
      <section className="relative px-6 md:px-10 mb-24 overflow-hidden">
        <AmorphousBlob
          variant="draped"
          color="var(--accent)"
          size="45vw"
          opacity={0.16}
          blur={100}
          duration={26}
          style={{ top: '-10vw', right: '-10vw' }}
        />
        <div className="relative">
          <p className="editorial-label text-ox mb-6">— Concierge</p>
          <h1 className="font-display text-6xl md:text-8xl lg:text-[10rem] tracking-tighter2 leading-[0.88] max-w-6xl">
            A direct line <br />
            <span className="italic text-bone/70">to the house.</span>
          </h1>
          <p className="text-bone/70 max-w-2xl mt-12 leading-relaxed text-lg">
            Bespoke commissions, private appointments, refill returns,
            shipping enquiries, gifts arranged with discretion. Address the
            concierge directly. A response within one working day.
          </p>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="px-6 md:px-10 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-12 gap-12 md:gap-20">
          {/* Form */}
          <div className="md:col-span-7">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="border hairline p-10 md:p-14"
              >
                <p className="editorial-label text-ox mb-6">— Received</p>
                <h2 className="font-display text-4xl md:text-5xl italic tracking-tighter2 leading-tight text-bone/90 mb-6">
                  Thank you, {form.name.split(' ')[0] || 'friend'}.
                </h2>
                <p className="text-bone/70 leading-relaxed mb-8 max-w-md">
                  Your note has reached us. A member of the concierge will
                  reply to <span className="text-bone/90">{form.email}</span> within
                  one working day, often sooner.
                </p>
                <p className="editorial-label text-bone/40 mb-8">
                  Reference · {Math.random().toString(36).slice(2, 8).toUpperCase()}
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setForm({ name: '', email: '', subject: subjects[0], message: '' })
                  }}
                  className="editorial-label link-line text-bone hover:text-ox"
                >
                  Send another →
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10">
                <p className="editorial-label text-ox">— Address the house</p>

                <Field label="Your name">
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border-b hairline outline-none py-3 text-bone placeholder:text-bone/30 focus:border-bone/60 transition-colors"
                    placeholder="Élise Marchand"
                  />
                </Field>

                <Field label="Your address">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent border-b hairline outline-none py-3 text-bone placeholder:text-bone/30 focus:border-bone/60 transition-colors"
                    placeholder="your.address@elsewhere.com"
                  />
                </Field>

                <Field label="In reference to">
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b hairline outline-none py-3 text-bone focus:border-bone/60 transition-colors appearance-none cursor-pointer"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23a0998a' stroke-width='1'/%3E%3C/svg%3E\")",
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.5rem center',
                    }}
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s} className="bg-bg text-bone">
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Your message">
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full bg-transparent border-b hairline outline-none py-3 text-bone placeholder:text-bone/30 focus:border-bone/60 transition-colors resize-none"
                    placeholder="A few sentences. We read every line."
                  />
                </Field>

                <button
                  type="submit"
                  className="editorial-label text-bone hover:text-ox transition-colors group inline-flex items-center gap-3"
                >
                  <span className="link-line">Dispatch the message</span>
                  <span className="text-lg leading-none transform group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-5 space-y-12 md:border-l hairline md:pl-12">
            <div>
              <p className="editorial-label text-ox mb-4">— By telephone</p>
              <p className="font-display text-2xl md:text-3xl text-bone/90 mb-1">
                +33 1 42 60 00 00
              </p>
              <p className="text-bone/50 text-sm">
                Lundi — Vendredi · 10h00 — 18h00 CET
              </p>
            </div>

            <div>
              <p className="editorial-label text-ox mb-4">— By post</p>
              <p className="font-display text-2xl md:text-3xl italic text-bone/80 leading-tight mb-2">
                Maison·Noir
              </p>
              <p className="text-bone/70 leading-relaxed">
                12 Rue de l'Université <br />
                75007 Paris, France
              </p>
            </div>

            <div>
              <p className="editorial-label text-ox mb-4">— By writing</p>
              <p className="text-bone/90 break-all">
                concierge@maisonnoir.apothecary
              </p>
            </div>

            <div className="border-t hairline pt-8">
              <p className="editorial-label text-bone/40 mb-4">— Note</p>
              <p className="text-bone/60 text-sm leading-relaxed">
                We answer in the order received. Urgent matters are best
                addressed by telephone. Press enquiries are routed via the
                Paris desk.
              </p>
            </div>
          </aside>
        </div>
      </section>

      {/* Closing */}
      <section className="px-6 md:px-10 mt-32 max-w-4xl mx-auto text-center border-t hairline pt-24">
        <p className="font-display italic text-2xl md:text-3xl text-bone/70 leading-tight mb-10">
          "The smallest correspondence is held to the same standard
          as a thousand-bottle order."
        </p>
        <Link to="/boutiques" className="editorial-label link-line hover:text-ox">
          Or visit a boutique →
        </Link>
      </section>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="editorial-label text-bone/40 block mb-2">{label}</span>
      {children}
    </label>
  )
}
