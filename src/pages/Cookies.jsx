import LegalPage, { Section } from './LegalPage'

/**
 * Cookies Policy — DRAFT
 *
 * Honest about what the site actually does today: a small amount of
 * localStorage for theme, wishlist, and orders; no analytics or third-
 * party trackers. If you later add analytics (Plausible, GA, etc.) or
 * marketing pixels, update the tables here accordingly.
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

      <Section n="IV" title="Managing your preferences">
        <p>
          You can clear all browser storage for this site through your
          browser's privacy settings. Doing so will reset your theme
          preference, empty your wishlist, and remove the local copy of any
          order confirmations.
        </p>
        <p>
          Most modern browsers offer per-site controls for cookies and
          storage. Consult your browser documentation:
        </p>
        <ul className="space-y-1 list-disc list-inside ml-2 text-sm">
          <li>Chrome — Settings → Privacy and security → Site settings</li>
          <li>Safari — Settings → Privacy → Manage Website Data</li>
          <li>Firefox — Settings → Privacy & Security → Cookies and Site Data</li>
          <li>Edge — Settings → Cookies and site permissions</li>
        </ul>
      </Section>

      <Section n="V" title="Third-party processors">
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
