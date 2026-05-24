import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

/**
 * LegalPage
 * ---------
 * Shared layout for the four policy pages (Terms, Privacy, Cookies,
 * Modern Slavery). Keeps typography, spacing, and the legal-review
 * notice consistent without duplicating markup.
 *
 * Children: a sequence of <Section> elements (also exported below) plus
 * any other content. Each <Section> renders a numbered heading and prose.
 *
 * IMPORTANT — these are draft texts for portfolio presentation only.
 * Before commercial use, have a qualified lawyer review the actual
 * obligations applicable to your jurisdiction, products, and data flows.
 */
export default function LegalPage({ folio, label, title, italicTitle, lastUpdated, children }) {
  return (
    <div className="pt-32 md:pt-40 pb-32">
      {/* Cover */}
      <section className="px-6 md:px-10 max-w-4xl mx-auto mb-16">
        <p className="editorial-label text-ox mb-6">— {label}</p>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tighter2 leading-[0.92] mb-10">
          {title} <br />
          <span className="italic text-bone/70">{italicTitle}</span>
        </h1>

        <div className="border-y hairline py-6 flex flex-col md:flex-row md:items-center justify-between gap-3 editorial-label text-bone/50">
          <span>Folio · {folio}</span>
          <span>Last updated · {lastUpdated}</span>
          <span>Maison·Noir · Paris</span>
        </div>

        {/* Draft notice — this is non-negotiable on placeholder legal pages. */}
        <div
          className="mt-10 p-6 border hairline"
          role="note"
          aria-label="Draft notice"
        >
          <p className="editorial-label text-ox mb-3">— Notice</p>
          <p className="text-bone/70 leading-relaxed text-sm">
            This document is provided as a draft for editorial presentation.
            It does not constitute legal advice and has not been reviewed by
            counsel. Before commercial use, the policy must be reviewed and
            adapted by a qualified lawyer for the jurisdictions, products, and
            data flows that apply to your operation.
          </p>
        </div>
      </section>

      {/* Body */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="px-6 md:px-10 max-w-4xl mx-auto space-y-14"
      >
        {children}
      </motion.section>

      {/* Footer band */}
      <section className="px-6 md:px-10 max-w-4xl mx-auto mt-24 border-t hairline pt-10 text-center">
        <p className="editorial-label text-ox mb-4">— Questions</p>
        <p className="text-bone/70 leading-relaxed mb-8 max-w-md mx-auto text-sm">
          Address any concerns regarding this policy to the concierge.
          Material updates will be published with a new "last updated" date.
        </p>
        <Link to="/concierge" className="editorial-label link-line hover:text-ox">
          Reach the Concierge →
        </Link>
      </section>
    </div>
  )
}

/**
 * Section
 * -------
 * Numbered policy section. Pass `n` as Roman or Arabic numeral, `title`
 * as a string, and prose as children.
 */
export function Section({ n, title, children }) {
  return (
    <article className="grid md:grid-cols-12 gap-6 md:gap-12">
      <div className="md:col-span-3">
        <div className="font-display text-3xl md:text-4xl tracking-tighter2 text-ox sticky top-32">
          {n}
        </div>
      </div>
      <div className="md:col-span-9">
        <h2 className="font-display text-2xl md:text-3xl italic tracking-tight text-bone/90 mb-5 leading-snug">
          {title}
        </h2>
        <div className="text-bone/75 leading-relaxed space-y-4 text-[15px]">
          {children}
        </div>
      </div>
    </article>
  )
}
