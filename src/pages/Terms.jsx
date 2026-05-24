import LegalPage, { Section } from './LegalPage'

/**
 * Terms of Service — DRAFT
 *
 * Boilerplate text based on standard e-commerce practice in the EU. Not
 * legal advice. Have counsel review specific obligations under your
 * jurisdiction's consumer protection, distance selling, and contract law
 * before relying on this for commercial transactions.
 */
export default function Terms() {
  return (
    <LegalPage
      folio="T-01"
      label="Legal · Terms of Service"
      title="The terms"
      italicTitle="of the house."
      lastUpdated="May 2026"
    >
      <Section n="I" title="Acceptance">
        <p>
          By accessing or placing an order through this website, you agree to
          be bound by these Terms of Service together with our Privacy Policy
          and Cookies Policy, which are incorporated here by reference.
        </p>
        <p>
          If you do not agree to these terms, please do not use the site or
          submit an order.
        </p>
      </Section>

      <Section n="II" title="The house">
        <p>
          References to "we", "us", "our", or "the house" refer to
          Maison·Noir, registered in France at 12 Rue de l'Université, 75007
          Paris. Communications may be addressed to the concierge at the
          address listed on the contact page.
        </p>
      </Section>

      <Section n="III" title="Eligibility">
        <p>
          To place an order you must be at least 18 years of age and legally
          capable of entering into binding contracts. By placing an order you
          confirm that these conditions are met.
        </p>
      </Section>

      <Section n="IV" title="Products and pricing">
        <p>
          Product images, descriptions, and specifications are intended to be
          accurate but may contain editorial language and minor variation.
          Photographs may not exactly represent the product received.
        </p>
        <p>
          Prices are shown in euros (€) and, where applicable, include
          VAT at the applicable rate. Shipping and any duties are calculated
          at checkout. We reserve the right to correct pricing errors before
          shipment and to cancel any order containing a manifest pricing
          error.
        </p>
      </Section>

      <Section n="V" title="Orders and acceptance">
        <p>
          An order placed through this site is an offer to purchase. A
          contract is formed only when we issue a shipment confirmation. We
          reserve the right to decline any order, including for reasons of
          stock availability, suspected fraud, or breach of these terms.
        </p>
      </Section>

      <Section n="VI" title="Payment">
        <p>
          Payment is processed by our payment service provider. Card details
          are not stored on our servers. We accept the card networks listed
          at checkout and are not responsible for charges or delays caused
          by your card issuer.
        </p>
      </Section>

      <Section n="VII" title="Delivery">
        <p>
          Estimated delivery windows are provided at checkout and in the
          shipment confirmation. We are not liable for delays caused by
          courier providers, customs authorities, or events outside our
          reasonable control.
        </p>
        <p>
          Risk in the goods passes to you on delivery; title passes when we
          have received cleared payment in full.
        </p>
      </Section>

      <Section n="VIII" title="Returns and refunds">
        <p>
          Under EU distance selling rules, you have the right to withdraw
          from your purchase within fourteen (14) days of receipt for any
          reason, subject to the conditions below. The product must be
          returned unused, in its original packaging, and with all seals
          intact.
        </p>
        <p>
          For reasons of hygiene and safety, sealed cosmetic items that have
          been opened cannot be returned once their protective seal is
          broken, except where the product is defective. Bespoke formulations
          made through the Made to Measure service are non-returnable.
        </p>
        <p>
          Refunds are issued to the original payment method within fourteen
          (14) days of our receipt of the returned goods.
        </p>
      </Section>

      <Section n="IX" title="Faulty or damaged goods">
        <p>
          Your statutory rights under EU consumer protection law remain
          unaffected by these terms. If a product arrives faulty or damaged,
          contact the concierge within seven (7) days of receipt and we will
          arrange repair, replacement, or refund as appropriate.
        </p>
      </Section>

      <Section n="X" title="Intellectual property">
        <p>
          All content on this site — including text, photography,
          illustrations, the wordmark, and the sigil — is the property of
          Maison·Noir or its licensors and is protected by copyright,
          trademark, and other intellectual property laws.
        </p>
        <p>
          You may view and print pages for personal use. You may not
          reproduce, distribute, modify, or use any part of the site for
          commercial purposes without our prior written consent.
        </p>
      </Section>

      <Section n="XI" title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, our total liability arising
          from or in connection with these terms or your use of the site is
          limited to the price paid for the product giving rise to the claim.
          Nothing in these terms limits any liability that cannot lawfully be
          limited, including for death or personal injury caused by
          negligence or for fraud.
        </p>
      </Section>

      <Section n="XII" title="Changes">
        <p>
          We may amend these terms from time to time. The current version
          will be posted on this page with a revised "last updated" date.
          Material changes will take effect upon posting; continued use of
          the site constitutes acceptance of the revised terms.
        </p>
      </Section>

      <Section n="XIII" title="Governing law">
        <p>
          These terms are governed by the laws of France. Any dispute
          arising from or in connection with them is subject to the
          non-exclusive jurisdiction of the courts of Paris, without
          prejudice to any mandatory consumer protections that apply in
          your country of residence.
        </p>
      </Section>
    </LegalPage>
  )
}
