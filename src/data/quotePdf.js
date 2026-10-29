import jsPDF from 'jspdf'
import { LOGO_BASE64 } from './logo'
import { COMPANY_LEGAL_LINE } from './mockData'

// ---------------------------------------------------------------------------
// Two client-facing PDFs are built here from plain data snapshots, so the same
// document can be produced when a quote is created and again later from the
// Quotes page:
//
//  * QUOTE  – a scope of work (by trade) with ONE total. No rates, no per-trade
//             prices and no contractor mark-up.
//  * BOQ    – the bill of quantities: every material line with quantity,
//             supplier rate and amount. The mark-up is never shown or applied.
//
// quote data = {
//   reference, dateLabel, projectName, clientName, siteAddress,
//   scope: [{ trade, summary, includes: [string] }],
//   subtotal (excl. VAT), vatLabel, vatAmount, grandTotal,
//   deposit: { amount, percent|null, balance } | null,
//   quotedBy: { company, address, email }
// }
// (Quotes saved before the scope layout existed keep `rows` and print the old table.)
//
// boq data = {
//   reference, dateLabel, projectName, clientName, siteAddress, supplierName,
//   groups: [{ title, rows: [{ code, description, unit, qty, rate, amount, noPrice }] }],
//   total, quotedBy
// }
// ---------------------------------------------------------------------------
const RED = [228, 32, 44]
const DARK = [40, 40, 40]
const GREY = [110, 110, 110]
const PAGE_BOTTOM = 280

function loadLogo(dataUrl) {
  return new Promise((resolve) => {
    if (!dataUrl) return resolve(null)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      canvas.getContext('2d').drawImage(img, 0, 0)
      resolve({ dataUrl: canvas.toDataURL('image/png'), width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

const money = (n) => 'R ' + Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

// GNA logo (left) + the contractor's company logo or name (right), then a rule.
function drawHeader(doc, companyLogoImg, companyName) {
  const gnaW = 42
  const gnaH = 22
  doc.addImage(LOGO_BASE64, 'JPEG', 14, 8, gnaW, gnaH)
  doc.setFontSize(7)
  doc.setTextColor(90, 90, 90)
  doc.text(COMPANY_LEGAL_LINE, 14, 8 + gnaH + 4)

  let bottom = 8
  if (companyLogoImg) {
    const ratio = Math.min(58 / companyLogoImg.width, 32 / companyLogoImg.height)
    const w = companyLogoImg.width * ratio
    const h = companyLogoImg.height * ratio
    doc.addImage(companyLogoImg.dataUrl, 'PNG', 196 - w, 8, w, h)
    bottom = 8 + h
  } else if (companyName) {
    doc.setFontSize(14)
    doc.setTextColor(...DARK)
    doc.text(companyName, 196, 18, { align: 'right' })
    bottom = 22
  }
  const headerBottom = Math.max(8 + gnaH, bottom) + 8
  doc.setDrawColor(...RED)
  doc.setLineWidth(0.6)
  doc.line(14, headerBottom, 196, headerBottom)
  return headerBottom
}

function drawFooter(doc) {
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(COMPANY_LEGAL_LINE, 14, 290)
    doc.text(`Page ${i} of ${pages}`, 196, 290, { align: 'right' })
  }
}

// Title, reference/date and project block shared by both PDFs.
function drawInfo(doc, headerBottom, title, data, extraRight = []) {
  const q = data.quotedBy || {}
  const infoTop = headerBottom + 9
  doc.setFontSize(18)
  doc.setTextColor(...RED)
  doc.text(title, 196, infoTop, { align: 'right' })
  doc.setFontSize(10)
  doc.setTextColor(120, 120, 120)
  doc.text(`Reference: ${data.reference}`, 196, infoTop + 7, { align: 'right' })
  doc.text(`Date: ${data.dateLabel}`, 196, infoTop + 13, { align: 'right' })
  let ry = infoTop + 13
  extraRight.forEach((t) => {
    ry += 6
    doc.text(t, 196, ry, { align: 'right' })
  })

  doc.setFontSize(11)
  doc.setTextColor(...DARK)
  doc.text(`Project: ${data.projectName || 'Untitled project'}`, 14, infoTop)
  doc.text(`Client: ${data.clientName || '-'}`, 14, infoTop + 7)
  const site = doc.splitTextToSize(`Site: ${data.siteAddress || '-'}`, 100)
  site.forEach((l, i) => doc.text(l, 14, infoTop + 14 + i * 5.5))
  let ly = infoTop + 14 + (site.length - 1) * 5.5

  let y = Math.max(ry, ly) + 10
  doc.setFontSize(8.5)
  doc.setTextColor(140, 140, 140)
  doc.text('Prepared by', 14, y)
  y += 5
  doc.setFontSize(10.5)
  doc.setTextColor(...DARK)
  doc.text(q.company || 'Independent Contractor', 14, y)
  doc.setFontSize(8.5)
  doc.setTextColor(100, 100, 100)
  if (q.address) {
    doc.splitTextToSize(q.address, 120).forEach((line) => {
      y += 4.5
      doc.text(line, 14, y)
    })
  }
  if (q.email) {
    y += 4.5
    doc.text(q.email, 14, y)
  }
  return y + 10
}

function ensure(doc, y, need, redrawHeader) {
  if (y + need <= PAGE_BOTTOM) return y
  doc.addPage()
  return redrawHeader ? redrawHeader() : 20
}

// -------------------- QUOTATION (GnA quote template) ----------------------
// Follows the GnA Quote master spreadsheet: company block, "Quotation" title with
// date / valid until / quote number / reference, Customer + Description boxes, a priced
// line per piece of work, subtotal / VAT / total, notes and terms, signature block.
const NAVY = [0, 66, 105]
const BLACK = [0, 0, 0]

async function createTemplateQuotePdf(data, logoDataUrl) {
  const logo = await loadLogo(logoDataUrl)
  const doc = new jsPDF()
  const q = data.quotedBy || {}
  const L = 14
  const R = 196
  let y = 10

  // Logos: contractor's own (left) and GNA (right).
  let logoBottom = y
  if (logo) {
    const ratio = Math.min(46 / logo.width, 24 / logo.height)
    const w = logo.width * ratio
    const h = logo.height * ratio
    doc.addImage(logo.dataUrl, 'PNG', L, y, w, h)
    logoBottom = y + h
  }
  doc.addImage(LOGO_BASE64, 'JPEG', R - 34, y, 34, 18)
  y = Math.max(logoBottom, y + 18) + 7

  // Company block (left) and title / dates (right)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...BLACK)
  doc.text(q.company || 'Independent Contractor', L, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  let ly = y + 6
  const info = []
  if (q.address) info.push(['Address:', q.address])
  if (q.phone) info.push(['Telephone:', q.phone])
  if (q.email) info.push(['Email:', q.email])
  if (q.vatNo) info.push(['VAT No:', q.vatNo])
  if (q.regNo) info.push(['Reg no:', q.regNo])
  info.forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(k, L, ly)
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(String(v), 95)
    lines.forEach((t, i) => doc.text(t, L + 24, ly + i * 4.4))
    ly += Math.max(lines.length, 1) * 4.4 + 1.4
  })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(...NAVY)
  doc.text('Quotation', R, y + 4, { align: 'right' })
  doc.setFontSize(9)
  doc.setTextColor(...BLACK)
  let ry = y + 14
  ;[
    ['Date:', data.dateLabel],
    ['Valid Until:', data.validUntilLabel || ''],
    ['Quote Number:', data.quoteNumber || data.reference],
    ['Reference:', data.reference]
  ].forEach(([k, v]) => {
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(90, 90, 90)
    doc.text(k, 140, ry)
    doc.setTextColor(...BLACK)
    doc.text(String(v), R, ry, { align: 'right' })
    doc.setDrawColor(190, 190, 190)
    doc.setLineWidth(0.2)
    doc.line(140, ry + 1.6, R, ry + 1.6)
    ry += 6.5
  })

  y = Math.max(ly, ry) + 4

  // Customer / Description boxes
  const barH = 6
  doc.setFillColor(...BLACK)
  doc.rect(L, y, 92, barH, 'F')
  doc.rect(108, y, R - 108, barH, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text('Customer:', L + 2, y + 4.2)
  doc.text('Description', 110, y + 4.2)
  y += barH
  const cust = [data.clientName || '-']
  if (data.siteAddress) doc.splitTextToSize(data.siteAddress, 86).forEach((t) => cust.push(t))
  const descLines = doc.splitTextToSize(data.projectName || 'House construction', R - 112)
  const boxH = Math.max(cust.length, descLines.length) * 4.8 + 4
  doc.setDrawColor(...BLACK)
  doc.setLineWidth(0.3)
  doc.rect(L, y, 92, boxH)
  doc.rect(108, y, R - 108, boxH)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...BLACK)
  cust.forEach((t, i) => doc.text(t, L + 2, y + 5 + i * 4.8))
  descLines.forEach((t, i) => doc.text(t, 110, y + 5 + i * 4.8))
  y += boxH + 6

  // Table
  const C = { item: L + 2, desc: L + 14, qty: 128, unit: 150, vat: 160, total: R - 1 }
  const drawTableHead = () => {
    doc.setFillColor(...BLACK)
    doc.rect(L, y, R - L, 6, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text('Item', C.item, y + 4.2)
    doc.text('Description', C.desc, y + 4.2)
    doc.text('Qty', C.qty, y + 4.2, { align: 'right' })
    doc.text('Unit Price', C.unit, y + 4.2, { align: 'right' })
    doc.text('VAT Rate', C.vat + 12, y + 4.2, { align: 'right' })
    doc.text('Line Total', C.total, y + 4.2, { align: 'right' })
    y += 6
  }
  drawTableHead()
  const vatPct = `${Number(data.vatPercent ?? 15)}%`
  data.lines.forEach((ln, i) => {
    const sum = doc.splitTextToSize(ln.summary || '', 100)
    const inc = (ln.includes || []).length ? doc.splitTextToSize(`Includes: ${ln.includes.join(', ')}.`, 100) : []
    const h = 5.2 + (sum.length + inc.length) * 3.9 + 2.5
    if (y + h > PAGE_BOTTOM - 8) {
      doc.addPage()
      y = 16
      drawTableHead()
    }
    if (i % 2 === 0) {
      doc.setFillColor(232, 232, 232)
      doc.rect(L, y, R - L, h, 'F')
    }
    doc.setTextColor(...BLACK)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(String(i + 1), C.item, y + 4.2)
    doc.setFont('helvetica', 'bold')
    doc.text(ln.title, C.desc, y + 4.2)
    doc.setFont('helvetica', 'normal')
    doc.text('1', C.qty, y + 4.2, { align: 'right' })
    doc.text(money(ln.amount), C.unit, y + 4.2, { align: 'right' })
    doc.text(vatPct, C.vat + 12, y + 4.2, { align: 'right' })
    doc.text(money(ln.amount), C.total, y + 4.2, { align: 'right' })
    doc.setFontSize(7.8)
    doc.setTextColor(90, 90, 90)
    let ty = y + 4.2
    sum.forEach((t) => {
      ty += 3.9
      doc.text(t, C.desc, ty)
    })
    inc.forEach((t) => {
      ty += 3.9
      doc.setTextColor(125, 125, 125)
      doc.text(t, C.desc, ty)
    })
    y += h
  })
  doc.setDrawColor(...BLACK)
  doc.setLineWidth(0.3)
  doc.line(L, y, R, y)
  y += 6

  // Totals
  if (y + 40 > PAGE_BOTTOM) {
    doc.addPage()
    y = 20
  }
  doc.setFontSize(9)
  doc.setTextColor(...BLACK)
  doc.text('Subtotal excl. VAT', 150, y, { align: 'right' })
  doc.text(money(data.subtotal), R, y, { align: 'right' })
  y += 6
  doc.text(`Tax/VAT (${Number(data.vatPercent ?? 15)}%)`, 150, y, { align: 'right' })
  doc.text(money(data.vatAmount), R, y, { align: 'right' })
  y += 3
  doc.setFillColor(...BLACK)
  doc.rect(120, y, R - 120, 7, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(255, 255, 255)
  doc.text('Total', 123, y + 5)
  doc.text(money(data.grandTotal), R - 2, y + 5, { align: 'right' })
  y += 7
  if (data.deposit) {
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...BLACK)
    const label = data.deposit.percent != null ? `Deposit required (${data.deposit.percent}%)` : 'Deposit required'
    doc.text(label, 150, y, { align: 'right' })
    doc.text(money(data.deposit.amount), R, y, { align: 'right' })
    y += 5.5
    doc.text('Balance due after deposit', 150, y, { align: 'right' })
    doc.text(money(data.deposit.balance), R, y, { align: 'right' })
    y += 2
  }
  y += 8

  // Special notes / terms
  const notes = [
    'Once you accept the quote bank details will be provided.',
    'Above information is not an invoice and only an estimate of services/goods described above.',
    'Payment will be collected prior to provision of services/goods described in this quote.',
    'This quote is valid for 30 days from the date above.',
    'Based on the plan supplied; final measurements must be confirmed on site before work starts.',
    'Items not shown on the plan, municipal approvals, engineering changes, abnormal site conditions and professional fees are excluded unless stated.',
    'Variations to the scope will be quoted and agreed in writing before they are carried out.'
  ]
  const noteLines = notes.flatMap((n) => doc.splitTextToSize(`•  ${n}`, 176))
  const need = 6 + noteLines.length * 4.4 + 4
  if (y + need > PAGE_BOTTOM - 40) {
    doc.addPage()
    y = 20
  }
  doc.setFillColor(...BLACK)
  doc.rect(L, y, R - L, 6, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text("Special Notes and Instructions - T'S & C'S", L + 2, y + 4.2)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(...BLACK)
  const notesTop = y
  noteLines.forEach((t) => {
    y += 4.4
    doc.text(t, L + 2, y)
  })
  y += 3
  doc.setDrawColor(...BLACK)
  doc.rect(L, notesTop, R - L, y - notesTop)
  y += 10

  // Acceptance
  if (y + 38 > PAGE_BOTTOM) {
    doc.addPage()
    y = 20
  }
  doc.setFontSize(9)
  doc.setTextColor(...BLACK)
  doc.text('Please confirm your acceptance of this quote by signing this document', L, y)
  ;['Signature', 'Print Name', 'Date'].forEach((k, i) => {
    const yy = y + i * 9
    doc.setTextColor(90, 90, 90)
    doc.text(k, 120, yy)
    doc.setDrawColor(150, 150, 150)
    doc.setLineWidth(0.3)
    doc.line(140, yy + 1.2, R, yy + 1.2)
  })
  y += 32
  doc.setTextColor(...BLACK)
  doc.text(`If you have any questions concerning this quote, contact us${q.email ? ` at ${q.email}` : ''}${q.phone ? ` or ${q.phone}` : ''}.`, 105, y, { align: 'center' })
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text('Thank you for your business!', 105, y, { align: 'center' })

  drawFooter(doc)
  return doc
}

// ------------------------------- QUOTE (scope layout, older saves) --------
export async function createQuotePdf(data, logoDataUrl) {
  if (data.lines) return createTemplateQuotePdf(data, logoDataUrl)
  if (!data.scope) return createLegacyQuotePdf(data, logoDataUrl)
  const logo = await loadLogo(logoDataUrl)
  const doc = new jsPDF()
  const q = data.quotedBy || {}
  const headerBottom = drawHeader(doc, logo, q.company)
  let y = drawInfo(doc, headerBottom, 'QUOTE', data, ['Valid for 30 days'])

  doc.setFontSize(13)
  doc.setTextColor(...DARK)
  doc.text('Scope of work', 14, y)
  y += 3
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(14, y, 196, y)
  y += 7
  doc.setFontSize(9.5)
  doc.setTextColor(80, 80, 80)
  const intro = doc.splitTextToSize(
    `${q.company || 'The contractor'} will carry out the following work for the project above, based on the plan supplied and the quantities confirmed with you.`,
    182
  )
  intro.forEach((l) => {
    doc.text(l, 14, y)
    y += 5
  })
  y += 3

  data.scope.forEach((s, idx) => {
    const sumLines = doc.splitTextToSize(s.summary || '', 176)
    const incLines = (s.includes || []).length ? doc.splitTextToSize(`Includes: ${s.includes.join(', ')}.`, 176) : []
    y = ensure(doc, y, 10 + (sumLines.length + incLines.length) * 4.6)
    doc.setFontSize(10.5)
    doc.setTextColor(...DARK)
    doc.setFont('helvetica', 'bold')
    doc.text(`${idx + 1}.  ${s.trade}`, 14, y)
    doc.setFont('helvetica', 'normal')
    y += 5.5
    doc.setFontSize(9.5)
    doc.setTextColor(70, 70, 70)
    sumLines.forEach((l) => {
      doc.text(l, 20, y)
      y += 4.6
    })
    if (incLines.length) {
      doc.setTextColor(120, 120, 120)
      doc.setFontSize(9)
      incLines.forEach((l) => {
        doc.text(l, 20, y)
        y += 4.4
      })
    }
    y += 3.5
  })

  // One price for the whole scope.
  y = ensure(doc, y, 55)
  y += 2
  doc.setDrawColor(...RED)
  doc.setLineWidth(0.8)
  doc.line(14, y, 196, y)
  y += 8
  doc.setFontSize(11)
  doc.setTextColor(...DARK)
  doc.text('Total for the work described above (excl. VAT)', 14, y)
  doc.text(money(data.subtotal), 196, y, { align: 'right' })
  y += 7
  doc.text(data.vatLabel || 'VAT', 14, y)
  doc.text(money(data.vatAmount), 196, y, { align: 'right' })
  y += 9
  doc.setFontSize(14)
  doc.setTextColor(...RED)
  doc.text('Total quote (incl. VAT)', 14, y)
  doc.text(money(data.grandTotal), 196, y, { align: 'right' })
  if (data.deposit) {
    y += 9
    doc.setFontSize(11)
    doc.setTextColor(...DARK)
    const label = data.deposit.percent != null ? `Deposit required (${data.deposit.percent}% of total)` : 'Deposit required'
    doc.text(label, 14, y)
    doc.text(money(data.deposit.amount), 196, y, { align: 'right' })
    y += 6.5
    doc.text('Balance due after deposit', 14, y)
    doc.text(money(data.deposit.balance), 196, y, { align: 'right' })
  }
  y += 12

  const block = (title, lines) => {
    y = ensure(doc, y, 8 + lines.length * 5.2)
    doc.setFontSize(11)
    doc.setTextColor(...DARK)
    doc.text(title, 14, y)
    y += 6
    doc.setFontSize(9)
    doc.setTextColor(80, 80, 80)
    lines.forEach((line) => {
      doc.splitTextToSize(`•  ${line}`, 178).forEach((l, i) => {
        doc.text(i ? `    ${l}` : l, 14, y)
        y += 4.8
      })
    })
    y += 4
  }
  block('Assumptions', [
    'Quote based on the uploaded plan and the quantities confirmed with the client.',
    'Final measurements must be confirmed on site before work starts.',
    'Materials are supplied and installed as described in the scope above.'
  ])
  block('Exclusions', [
    'Items not visible or not shown on the supplied plan are excluded.',
    'Municipal approvals, engineering changes and abnormal site conditions are excluded.',
    'Professional fees (architect, engineer, council) are not included unless stated.'
  ])
  block('Terms', [
    'This quote is valid for 30 days from the date above.',
    'Work starts once the quote is accepted and any deposit has been received.',
    'Variations to the scope will be quoted and agreed in writing before they are carried out.'
  ])

  y = ensure(doc, y, 40)
  y += 4
  doc.setFontSize(11)
  doc.setTextColor(...DARK)
  doc.text('Acceptance', 14, y)
  y += 6
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  doc.text('I accept this quote and the terms above.', 14, y)
  y += 16
  doc.setDrawColor(150, 150, 150)
  doc.setLineWidth(0.3)
  doc.line(14, y, 95, y)
  doc.line(115, y, 196, y)
  y += 5
  doc.text('Client signature', 14, y)
  doc.text('Date', 115, y)

  drawFooter(doc)
  return doc
}

// Quotes saved before the scope layout keep their old table of rows.
async function createLegacyQuotePdf(data, logoDataUrl) {
  const logo = await loadLogo(logoDataUrl)
  const doc = new jsPDF()
  const q = data.quotedBy || {}
  const headerBottom = drawHeader(doc, logo, q.company)
  let y = drawInfo(doc, headerBottom, 'QUOTE', data)
  doc.setFontSize(12)
  doc.setTextColor(...DARK)
  doc.text('Description', 14, y)
  doc.text('Amount (ZAR)', 196, y, { align: 'right' })
  y += 4
  doc.line(14, y, 196, y)
  y += 8
  doc.setFontSize(10)
  ;(data.rows || []).forEach(([label, amount]) => {
    doc.text(label, 14, y)
    doc.text(money(amount), 196, y, { align: 'right' })
    y += 8
  })
  y += 2
  doc.setLineWidth(0.8)
  doc.line(14, y, 196, y)
  y += 10
  doc.setFontSize(14)
  doc.setTextColor(...RED)
  doc.text('Grand Total:', 14, y)
  doc.text(money(data.grandTotal), 196, y, { align: 'right' })
  if (data.deposit) {
    y += 10
    doc.setFontSize(11)
    doc.setTextColor(...DARK)
    const label = data.deposit.percent != null ? `Deposit required (${data.deposit.percent}% of total)` : 'Deposit required'
    doc.text(label, 14, y)
    doc.text(money(data.deposit.amount), 196, y, { align: 'right' })
    y += 7
    doc.text('Balance due after deposit', 14, y)
    doc.text(money(data.deposit.balance), 196, y, { align: 'right' })
  }
  drawFooter(doc)
  return doc
}

export function quotePdfFileName(data) {
  return `${data.reference}-${(data.projectName || 'gna-quote').replace(/\s+/g, '-')}.pdf`
}

// -------------------------------- BOQ -------------------------------------
export const BOQ_DISCLAIMER =
  'Rates come from supplier price lists but this is an estimate only. Actual prices may vary at the time of purchase.'

export function boqEstimateLabel(data) {
  if (data.estimateLabel) return data.estimateLabel
  const name = data.supplierName || ''
  return !name || /average/i.test(name) ? 'Average Price Estimate' : `${name} Estimate`
}

export async function createBoqPdf(data, logoDataUrl) {
  const logo = await loadLogo(logoDataUrl)
  const doc = new jsPDF()
  const q = data.quotedBy || {}
  const headerBottom = drawHeader(doc, logo, q.company)
  let y = drawInfo(doc, headerBottom, 'BILL OF QUANTITIES', data)

  // Estimate banner: "<Supplier> Estimate" (or "Average Price Estimate") and the price-variation note.
  const label = boqEstimateLabel(data)
  const noteLines = doc.splitTextToSize(BOQ_DISCLAIMER, 170)
  const boxH = 10 + noteLines.length * 4.4
  doc.setFillColor(255, 244, 214)
  doc.setDrawColor(230, 170, 40)
  doc.setLineWidth(0.4)
  doc.rect(14, y - 4, 182, boxH, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(150, 90, 0)
  doc.text(label, 18, y + 2)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(110, 80, 20)
  noteLines.forEach((t, i) => doc.text(t, 18, y + 7.5 + i * 4.4))
  y += boxH + 2

  // Column x positions: code | description | unit | qty | rate | amount
  const X = { code: 14, desc: 36, unit: 112, qty: 140, rate: 166, amt: 196 }
  const tableHead = () => {
    doc.setFontSize(8.5)
    doc.setTextColor(120, 120, 120)
    doc.text('Code', X.code, y)
    doc.text('Description', X.desc, y)
    doc.text('Unit', X.unit, y)
    doc.text('Qty', X.qty, y, { align: 'right' })
    doc.text('Rate', X.rate, y, { align: 'right' })
    doc.text('Amount', X.amt, y, { align: 'right' })
    y += 2.5
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(14, y, 196, y)
    y += 5
  }
  // ensure() has already added the new page when it calls this, so only redraw the header here.
  const newPage = () => {
    y = 18
    tableHead()
    return y
  }

  let hasDemo = false
  y += 2
  tableHead()
  data.groups.forEach((g) => {
    if (!g.rows.length) return
    y = ensure(doc, y, 16, newPage)
    doc.setFontSize(10)
    doc.setTextColor(...RED)
    doc.setFont('helvetica', 'bold')
    doc.text(g.title, 14, y)
    doc.setFont('helvetica', 'normal')
    y += 5.5
    let sub = 0
    g.rows.forEach((r) => {
      const desc = doc.splitTextToSize(String(r.description || ''), 72)
      y = ensure(doc, y, desc.length * 4.2 + 2, newPage)
      doc.setFontSize(8.5)
      doc.setTextColor(...DARK)
      doc.text(String(r.code || ''), X.code, y)
      desc.forEach((l, i) => doc.text(l, X.desc, y + i * 4.2))
      doc.text(String(r.unit || ''), X.unit, y)
      doc.text(String(r.qty), X.qty, y, { align: 'right' })
      if (r.noPrice && !(r.rate > 0)) {
        doc.setTextColor(180, 90, 0)
        doc.text('No price', X.rate, y, { align: 'right' })
        doc.text('-', X.amt, y, { align: 'right' })
      } else {
        doc.text(money(r.rate) + (r.demoPrice ? ' *' : ''), X.rate, y, { align: 'right' })
        doc.text(money(r.amount), X.amt, y, { align: 'right' })
        if (r.demoPrice) hasDemo = true
      }
      sub += r.amount || 0
      y += Math.max(desc.length, 1) * 4.2 + 1.8
    })
    y = ensure(doc, y, 8, newPage)
    doc.setFontSize(9)
    doc.setTextColor(...GREY)
    doc.text(`${g.title} subtotal`, X.rate, y, { align: 'right' })
    doc.setTextColor(...DARK)
    doc.text(money(sub), X.amt, y, { align: 'right' })
    y += 8
  })

  y = ensure(doc, y, 24, newPage)
  doc.setDrawColor(...RED)
  doc.setLineWidth(0.8)
  doc.line(14, y, 196, y)
  y += 8
  doc.setFontSize(13)
  doc.setTextColor(...RED)
  doc.text('Total materials (excl. VAT)', 14, y)
  doc.text(money(data.total), 196, y, { align: 'right' })
  y += 8
  doc.setFontSize(8.5)
  doc.setTextColor(...GREY)
  const endNote = `${boqEstimateLabel(data)}: rates are price-list rates (excl. VAT) and may vary. Quantities are based on the plan and the items confirmed on the quote.`
  doc.splitTextToSize(endNote, 182).forEach((l) => {
    y = ensure(doc, y, 5, newPage)
    doc.text(l, 14, y)
    y += 4.4
  })
  if (hasDemo) {
    const demoNote = '* Demo price: this supplier has no like-for-like item for this plan line, so a demonstration price has been used. Replace it with a supplier quote before ordering.'
    doc.splitTextToSize(demoNote, 182).forEach((l) => {
      y = ensure(doc, y, 5, newPage)
      doc.text(l, 14, y)
      y += 4.4
    })
  }

  drawFooter(doc)
  return doc
}

export function boqPdfFileName(data) {
  return `${data.reference}-BOQ-${(data.projectName || 'gna-quote').replace(/\s+/g, '-')}.pdf`
}

// Re-download a saved quote / BOQ from the Quotes page.
function ownLogo(quote, user) {
  return user && user.email === quote.ownerEmail ? user.logoDataUrl : null
}

export async function downloadSavedQuote(quote, user) {
  const snap = quote.pdfData
  const data = snap || {
    reference: quote.reference || 'GNA-QUOTE',
    dateLabel: new Date(quote.createdAt).toLocaleDateString(),
    projectName: quote.projectName,
    clientName: quote.customerName,
    siteAddress: quote.siteAddress,
    // Quotes saved before itemised snapshots existed only keep their total.
    rows: [['Quote total (incl. VAT)', quote.total]],
    grandTotal: quote.total,
    deposit: null,
    quotedBy: { company: quote.ownerCompany, address: user?.companyAddress, email: quote.ownerEmail }
  }
  const doc = await createQuotePdf(data, ownLogo(quote, user))
  doc.save(quotePdfFileName(data))
}

export async function downloadSavedBoq(quote, user) {
  if (!quote.boqData) return false
  const doc = await createBoqPdf(quote.boqData, ownLogo(quote, user))
  doc.save(boqPdfFileName(quote.boqData))
  return true
}
