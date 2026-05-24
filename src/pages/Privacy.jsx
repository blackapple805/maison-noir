import LegalPage, { Section } from './LegalPage'

/**
 * Privacy Policy — DRAFT
 *
 * Structured around EU GDPR data subject rights. Adapt the legal bases,
 * retention periods, and processor list to match your actual data flows.
 * Not legal advice. Have counsel review under GDPR / UK GDPR / national
 * implementations and any regional laws (CCPA, LGPD, etc.) that apply
 * to your users.
 */
export default function Privacy() {
  return (
    <LegalPage
      folio="P-01"
      label="Legal · Privacy Policy"
      title="How we hold"
      italicTitle="your data."
      lastUpdated="May 2026"
    >
      <Section n="I" title="Who we are">
        <p>
          Maison·Noir ("we", "the house") is the data controller for personal
          information collected through this website. Our registered address
          is 12 Rue de l'Université, 75007 Paris, France. The concierge desk
          handles privacy enquiries: concierge@maisonnoir.apothecary.
        </p>
      </Section>

      <Section n="II" title="What we collect">
        <p>
          We collect only what is needed to operate the house responsibly:
        </p>
        <ul className="space-y-2 list-disc list-inside ml-2">
          <li>
            <strong className="text-bone/90">Contact information</strong> —
            name, email address, postal address, telephone number when you
            place an order, contact the concierge, or subscribe to the
            dispatch.
          </li>
          <li>
            <strong className="text-bone/90">Order information</strong> —
            products purchased, delivery address, payment method (we do not
            store the full card number).
          </li>
          <li>
            <strong className="text-bone/90">Account preferences</strong> —
            wishlist contents, theme preference, recent activity, where you
            have chosen to save them.
          </li>
          <li>
            <strong className="text-bone/90">Technical information</strong> —
            IP address, browser type, device type, pages visited, collected
            via essential cookies and minimal analytics.
          </li>
          <li>
            <strong className="text-bone/90">Consultation notes</strong> —
            when you request a consultation, the information you provide
            about your skin, regimen, and preferences.
          </li>
        </ul>
      </Section>

      <Section n="III" title="How we use it">
        <p>
          We process your personal information for the following purposes,
          on the legal bases noted:
        </p>
        <ul className="space-y-2 list-disc list-inside ml-2">
          <li>
            To fulfill orders and provide consultations — <em>performance of
            contract</em>.
          </li>
          <li>
            To send transactional communications (confirmations, dispatch
            notices, support replies) — <em>performance of contract</em>.
          </li>
          <li>
            To send the quarterly dispatch and house news where you have
            subscribed — <em>consent</em>, withdrawable at any time.
          </li>
          <li>
            To prevent fraud, secure the site, and meet legal obligations —
            <em> legitimate interest and legal obligation</em>.
          </li>
          <li>
            To improve the site through minimal aggregated analytics —
            <em> legitimate interest</em>.
          </li>
        </ul>
      </Section>

      <Section n="IV" title="Who we share with">
        <p>
          We do not sell your data. We share it only with processors who
          help us run the house, bound by contractual confidentiality:
        </p>
        <ul className="space-y-2 list-disc list-inside ml-2">
          <li>Payment service providers — to process card transactions.</li>
          <li>Logistics partners — to deliver your orders.</li>
          <li>
            Email service providers — to send transactional and subscribed
            communications.
          </li>
          <li>
            Cloud hosting providers — to operate the website infrastructure.
          </li>
          <li>
            Authorities, where legally required (court order, tax obligation,
            regulatory request).
          </li>
        </ul>
      </Section>

      <Section n="V" title="International transfers">
        <p>
          Some processors operate outside the European Economic Area. Where
          this is the case, we rely on European Commission adequacy decisions
          where available, or on Standard Contractual Clauses with additional
          safeguards as required by GDPR Chapter V.
        </p>
      </Section>

      <Section n="VI" title="How long we keep it">
        <p>
          Order records are retained for ten years to meet French commercial
          and tax obligations. Marketing data is retained until you withdraw
          consent or after three years of inactivity, whichever is sooner.
          Consultation notes are held under your name until you request
          deletion. Technical logs are retained for thirty days.
        </p>
      </Section>

      <Section n="VII" title="Your rights">
        <p>Under GDPR you have the right to:</p>
        <ul className="space-y-2 list-disc list-inside ml-2">
          <li>access the personal data we hold about you;</li>
          <li>request correction of inaccurate or incomplete data;</li>
          <li>request erasure, subject to legal retention obligations;</li>
          <li>request restriction of processing;</li>
          <li>object to processing based on legitimate interest;</li>
          <li>data portability — receive your data in a structured format;</li>
          <li>withdraw consent at any time, for processing based on consent.</li>
        </ul>
        <p>
          To exercise any of these rights, contact the concierge. We will
          respond within one month, extendable to three months for complex
          requests. You may also lodge a complaint with your national data
          protection authority. In France, this is the CNIL (cnil.fr).
        </p>
      </Section>

      <Section n="VIII" title="Security">
        <p>
          We apply technical and organizational measures appropriate to the
          sensitivity of the data we process — HTTPS in transit, access
          controls, vendor due diligence, and incident response procedures.
          No system is perfectly secure; in the event of a breach affecting
          your rights, we will notify the relevant authority within seventy-
          two hours and, where required, notify you directly.
        </p>
      </Section>

      <Section n="IX" title="Children">
        <p>
          The site is not directed at children under sixteen, and we do not
          knowingly collect data from anyone under that age. If you believe
          we have inadvertently collected data from a child, contact us so
          we can delete it.
        </p>
      </Section>

      <Section n="X" title="Changes">
        <p>
          We may update this policy as our practices evolve or as the law
          requires. Material changes will be communicated through this page
          and, where practicable, by direct notice. The "last updated" date
          at the top reflects the current version.
        </p>
      </Section>
    </LegalPage>
  )
}
