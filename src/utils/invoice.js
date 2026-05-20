// PDF invoice — jsPDF is dynamically imported so it doesn't bloat the main bundle
export async function generateInvoicePDF(order) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()
  const margin = 48

  // ---------- HEADER ----------
  // Brand mark (drawn as vector — same sigil as the site)
  drawSigil(doc, margin, 48, 28)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('MAISON·NOIR', margin + 40, 60)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(120)
  doc.text('ATELIER · MMXXVI', margin + 40, 72)

  // Right side — invoice meta
  doc.setFontSize(9)
  doc.setTextColor(40)
  doc.text('INVOICE', w - margin, 48, { align: 'right' })
  doc.setFontSize(7)
  doc.setTextColor(120)
  doc.text(`N° ${order.number}`, w - margin, 62, { align: 'right' })
  doc.text(formatDate(order.placedAt), w - margin, 74, { align: 'right' })

  // Hairline
  doc.setDrawColor(220)
  doc.setLineWidth(0.5)
  doc.line(margin, 100, w - margin, 100)

  // ---------- ADDRESSES ----------
  let y = 130

  doc.setFontSize(7)
  doc.setTextColor(150)
  doc.text('FROM', margin, y)
  doc.text('SHIP TO', w / 2, y)

  doc.setFontSize(9)
  doc.setTextColor(20)
  doc.text(
    [
      'Maison Noir SAS',
      '12 Rue de l\'Université',
      '75007 Paris, France',
      'VAT FR 12 345 678 901',
    ],
    margin,
    y + 16,
    { lineHeightFactor: 1.5 }
  )

  const s = order.shipping
  doc.text(
    [
      `${s.firstName} ${s.lastName}`,
      s.address1,
      s.address2 || '',
      `${s.postal} ${s.city}`,
      s.country,
      s.email,
    ].filter(Boolean),
    w / 2,
    y + 16,
    { lineHeightFactor: 1.5 }
  )

  y += 130

  // ---------- LINE ITEMS ----------
  doc.setDrawColor(220)
  doc.line(margin, y, w - margin, y)
  y += 18

  doc.setFontSize(7)
  doc.setTextColor(150)
  doc.text('PIECE', margin, y)
  doc.text('SIZE', w - margin - 200, y, { align: 'right' })
  doc.text('QTY', w - margin - 130, y, { align: 'right' })
  doc.text('UNIT', w - margin - 70, y, { align: 'right' })
  doc.text('AMOUNT', w - margin, y, { align: 'right' })
  y += 8

  doc.line(margin, y, w - margin, y)
  y += 18

  doc.setFontSize(9)
  doc.setTextColor(20)
  order.items.forEach((item) => {
    doc.setFont('helvetica', 'normal')
    doc.text(item.name, margin, y)

    doc.setFontSize(7)
    doc.setTextColor(120)
    doc.text(`${item.category} · ${item.colorway} · MN-${item.id.toUpperCase()}`, margin, y + 11)

    doc.setFontSize(9)
    doc.setTextColor(20)
    doc.text(String(item.size), w - margin - 200, y, { align: 'right' })
    doc.text(String(item.qty), w - margin - 130, y, { align: 'right' })
    doc.text(`€${item.price.toLocaleString()}`, w - margin - 70, y, { align: 'right' })
    doc.text(`€${item.lineTotal.toLocaleString()}`, w - margin, y, { align: 'right' })

    y += 32
    doc.setDrawColor(240)
    doc.line(margin, y - 8, w - margin, y - 8)
  })

  // ---------- TOTALS ----------
  y += 10
  const totalsX = w - margin - 140
  const t = order.totals

  const totalRows = [
    ['Subtotal', `€${t.subtotal.toLocaleString()}`],
    ['Shipping', t.shipping === 0 ? 'Complimentary' : `€${t.shipping.toLocaleString()}`],
    ['VAT (included)', `€${t.vat.toLocaleString()}`],
  ]

  doc.setFontSize(9)
  doc.setTextColor(80)
  totalRows.forEach(([label, value]) => {
    doc.text(label, totalsX, y)
    doc.text(value, w - margin, y, { align: 'right' })
    y += 16
  })

  y += 4
  doc.setDrawColor(40)
  doc.setLineWidth(0.8)
  doc.line(totalsX, y, w - margin, y)
  y += 18

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(20)
  doc.text('TOTAL', totalsX, y)
  doc.text(`€${t.total.toLocaleString()}`, w - margin, y, { align: 'right' })

  // ---------- PAYMENT ----------
  y += 40
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(150)
  doc.text('PAYMENT', margin, y)
  y += 14
  doc.setFontSize(9)
  doc.setTextColor(20)
  const brandLabel = (order.payment.brand || 'card').toUpperCase()
  doc.text(`${brandLabel} ending ${order.payment.last4} · ${order.payment.name}`, margin, y)

  // ---------- DELIVERY ----------
  y += 28
  doc.setFontSize(7)
  doc.setTextColor(150)
  doc.text('ESTIMATED DELIVERY', margin, y)
  y += 14
  doc.setFontSize(9)
  doc.setTextColor(20)
  doc.text(`${order.estimatedDelivery.start} — ${order.estimatedDelivery.end}`, margin, y)

  // ---------- FOOTER ----------
  const footerY = doc.internal.pageSize.getHeight() - 56
  doc.setDrawColor(220)
  doc.setLineWidth(0.5)
  doc.line(margin, footerY, w - margin, footerY)

  doc.setFontSize(7)
  doc.setTextColor(140)
  doc.text(
    'Thank you for your purchase. Each piece is hand-finished and individually inspected.',
    margin,
    footerY + 16
  )
  doc.text(
    'Repairs and alterations may be requested in perpetuity at concierge@maisonnoir.atelier',
    margin,
    footerY + 28
  )
  doc.setTextColor(160)
  doc.text('© MMXXVI · Maison Noir SAS', margin, footerY + 42)
  doc.text(`Folio · ${order.number}`, w - margin, footerY + 42, { align: 'right' })

  doc.save(`Maison-Noir-${order.number}.pdf`)
}

// Draws the brand sigil at (x, y) at given size — matches the on-site SVG
function drawSigil(doc, x, y, size) {
  const u = size / 40 // unit scale
  // Outer diamond (hairline)
  doc.setDrawColor(180)
  doc.setLineWidth(0.4)
  doc.lines(
    [
      [19 * u, 19 * u],
      [-19 * u, 19 * u],
      [-19 * u, -19 * u],
    ],
    x + 20 * u,
    y + 1 * u,
    [1, 1],
    'S',
    true
  )
  // Upper plane (filled)
  doc.setFillColor(20)
  doc.lines(
    [
      [16 * u, 16 * u],
      [-16 * u, 0],
      [-16 * u, -16 * u],
    ],
    x + 20 * u,
    y + 4 * u,
    [1, 1],
    'F',
    true
  )
  // Lower blade (filled)
  doc.lines(
    [
      [8 * u, 16 * u],
      [-8 * u, -8 * u],
      [-8 * u, 16 * u],
    ],
    x + 20 * u,
    y + 20 * u,
    [1, 1],
    'F',
    true
  )
  // Oxblood vertex
  doc.setFillColor(156, 27, 42)
  doc.circle(x + 20 * u, y + 20 * u, 1.6 * u, 'F')
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
