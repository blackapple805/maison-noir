import LegalPage, { Section } from './LegalPage'

/**
 * Modern Slavery Statement — DRAFT
 *
 * Structured around the disclosure framework of the UK Modern Slavery Act
 * 2015 (s.54) and the French "loi sur le devoir de vigilance". Most
 * statements include: organisation structure, supply chain overview,
 * policies, due diligence, risk assessment, training, and measurement.
 * Adapt to the realities of your operation; not legal advice.
 */
export default function ModernSlavery() {
  return (
    <LegalPage
      folio="MS-01"
      label="Legal · Modern Slavery Statement"
      title="A statement"
      italicTitle="of provenance."
      lastUpdated="May 2026"
    >
      <Section n="I" title="Introduction">
        <p>
          Maison·Noir is committed to the elimination of modern slavery,
          human trafficking, forced labour, and exploitative working
          conditions from every part of its operation and supply chain.
          This statement describes the measures the house takes to ensure
          that no such practices occur in our business or among the
          partners we depend on to produce, distribute, and deliver our
          formulations.
        </p>
        <p>
          This statement is published in alignment with the disclosure
          principles of the UK Modern Slavery Act 2015 and the French law
          on the duty of vigilance, and is reviewed annually.
        </p>
      </Section>

      <Section n="II" title="Our structure">
        <p>
          Maison·Noir is an independent French apothecary founded in 1947.
          Production is concentrated in Grasse and Lyon, with retail
          operations in Paris, Grasse, and New York. The house operates a
          small, vertically integrated team and engages a limited number of
          long-standing suppliers for raw materials, packaging, and
          logistics.
        </p>
      </Section>

      <Section n="III" title="Our supply chain">
        <p>
          Our supply chain comprises three principal categories:
        </p>
        <ul className="space-y-2 list-disc list-inside ml-2">
          <li>
            <strong className="text-bone/90">Botanical and active sourcing</strong>
            — farms, distillers, and ingredient houses across France,
            Morocco, and Italy.
          </li>
          <li>
            <strong className="text-bone/90">Packaging</strong> — Italian
            glassworks, French ink and label printers, and a single tin
            stopper foundry in Birmingham.
          </li>
          <li>
            <strong className="text-bone/90">Logistics</strong> —
            international courier partners who carry our dispatch worldwide.
          </li>
        </ul>
        <p>
          We work with a small number of partners by design; depth of
          relationship is a precondition for transparency.
        </p>
      </Section>

      <Section n="IV" title="Policies">
        <p>
          We maintain internal policies that articulate our standards:
        </p>
        <ul className="space-y-2 list-disc list-inside ml-2">
          <li>A code of conduct binding employees and contractors.</li>
          <li>
            A supplier code of conduct requiring lawful employment practices,
            freely chosen labour, freedom of association, no child or forced
            labour, fair wages, and safe working conditions.
          </li>
          <li>A whistleblowing procedure with protected reporting channels.</li>
          <li>An anti-bribery and anti-corruption policy.</li>
        </ul>
      </Section>

      <Section n="V" title="Due diligence">
        <p>
          Suppliers are subject to onboarding due diligence covering legal
          status, labour practices, and ethical sourcing of any animal or
          botanical ingredients. We favour suppliers who can demonstrate
          recognised certification — including Ecocert, Fair for Life, and
          national-level labour standards audits — and we visit our
          principal partners annually.
        </p>
        <p>
          Where a supplier cannot meet our standards, we work with them on a
          time-bound remediation plan. Where remediation is refused or
          repeatedly fails, we end the relationship.
        </p>
      </Section>

      <Section n="VI" title="Risk assessment">
        <p>
          We assess modern slavery risk by reference to country, sector, and
          activity. Higher-risk activities in our supply chain — agricultural
          harvesting, low-margin manufacturing, and seasonal labour —
          receive proportionately closer attention. We use external indices
          including the Global Slavery Index and ILO country reports to
          inform our assessments.
        </p>
      </Section>

      <Section n="VII" title="Training">
        <p>
          Employees responsible for procurement, logistics, and
          supplier-facing operations receive annual training on the
          identification and reporting of modern slavery indicators. The
          training is updated to reflect emerging risks and regulatory
          expectations.
        </p>
      </Section>

      <Section n="VIII" title="Measuring effectiveness">
        <p>
          We track the following indicators on an annual basis:
        </p>
        <ul className="space-y-2 list-disc list-inside ml-2">
          <li>Number of suppliers audited and the findings of each audit.</li>
          <li>Number and nature of grievances raised through reporting channels.</li>
          <li>Completion rates for employee training.</li>
          <li>Remediation actions taken in response to identified concerns.</li>
        </ul>
        <p>
          Results are reviewed by the house's leadership and used to refine
          our approach for the year that follows.
        </p>
      </Section>

      <Section n="IX" title="Reporting concerns">
        <p>
          Anyone — employee, supplier, customer, or member of the public —
          who suspects modern slavery or labour exploitation in our
          operation or supply chain is asked to contact the concierge in
          writing. Reports may be made in confidence. Reports made in good
          faith are protected from retaliation under our policies and
          applicable law.
        </p>
      </Section>

      <Section n="X" title="Approval">
        <p>
          This statement is approved by the leadership of Maison·Noir and
          published on this page. It will be reviewed and reissued each
          financial year, with the date of the current version shown at the
          top of this page.
        </p>
      </Section>
    </LegalPage>
  )
}
