import jsPDF from 'jspdf'
import { LOGO_BASE64 } from './logo'
import { COMPANY_LEGAL_LINE } from './mockData'

// Builds (and optionally saves) the client-facing quote PDF from a plain data
// snapshot, so the same document can be produced when a quote is first
// created and again later from the Quotes page.
//
// data = {
//   reference, dateLabel, projectName, clientName, siteAddress,
//   rows: [[label, amount], ...],      // line items shown to the client
//   grandTotal,
//   deposit: { amount, percent|null, balance } | null,
//   quotedBy: { company, address, email }
// }
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

export async function createQuotePdf(data, logoDataUrl) {
  const companyLogoImg = await loadLogo(logoDataUrl)
  const doc = new jsPDF()
  const q = data.quotedBy || {}

  const gnaW = 42
  const gnaH = 22
  doc.addImage(LOGO_BASE64, 'JPEG', 14, 8, gnaW, gnaH)
  doc.setFontSize(7)
  doc.setTextColor(90, 90, 90)
  doc.text(COMPANY_LEGAL_LINE, 14, 8 + gnaH + 4)

  let companyLogoBottom = 8
  if (companyLogoImg) {
    const maxW = 58
    const maxH = 32
    const ratio = Math.min(maxW / companyLogoImg.width, maxH / companyLogoImg.height)
    const w = companyLogoImg.width * ratio
    const h = companyLogoImg.height * ratio
    doc.addImage(companyLogoImg.dataUrl, 'PNG', 196 - w, 8, w, h)
    companyLogoBottom = 8 + h
  }

  const headerBottom = Math.max(8 + gnaH, companyLogoBottom) + 8
  doc.setDrawColor(228, 32, 44)
  doc.setLineWidth(0.6)
  doc.line(14, headerBottom, 196, headerBottom)

  const infoTop = headerBottom + 9
  doc.setFontSize(18)
  doc.setTextColor(228, 32, 44)
  doc.text('QUOTE', 196, infoTop, { align: 'right' })
  doc.setFontSize(10)
  doc.setTextColor(120, 120, 120)
  doc.text(`Reference: ${data.reference}`, 196, infoTop + 7, { align: 'right' })
  doc.text(`Date: ${data.dateLabel}`, 196, infoTop + 13, { align: 'right' })

  doc.setFontSize(11)
  doc.setTextColor(40, 40, 40)
  doc.text(`Project: ${data.projectName || 'Untitled project'}`, 14, infoTop)
  doc.text(`Client: ${data.clientName || '-'}`, 14, infoTop + 7)
  doc.text(`Site: ${data.siteAddress || '-'}`, 14, infoTop + 14)

  let quotedByY = infoTop + 22
  doc.setFontSize(8.5)
  doc.setTextColor(140, 140, 140)
  doc.text('Quoted by', 196, quotedByY, { align: 'right' })
  quotedByY += 5
  doc.setFontSize(10.5)
  doc.setTextColor(40, 40, 40)
  doc.text(q.company || 'Independent Contractor', 196, quotedByY, { align: 'right' })
  doc.setFontSize(8.5)
  doc.setTextColor(100, 100, 100)
  if (q.address) {
    doc.splitTextToSize(q.address, 95).forEach((line) => {
      quotedByY += 4.5
      doc.text(line, 196, quotedByY, { align: 'right' })
    })
  }
  if (q.email) {
    quotedByY += 4.5
    doc.text(q.email, 196, quotedByY, { align: 'right' })
  }

  let y = Math.max(infoTop + 14, quotedByY) + 14
  doc.setFontSize(12)
  doc.setTextColor(40, 40, 40)
  doc.text('Description', 14, y)
  doc.text('Amount (ZAR)', 196, y, { align: 'right' })
  y += 4
  doc.line(14, y, 196, y)
  y += 8
  doc.setFontSize(10)
  data.rows.forEach(([label, amount]) => {
    doc.text(label, 14, y)
    doc.text(`R ${Number(amount).toFixed(2)}`, 196, y, { align: 'right' })
    y += 8
  })

  y += 2
  doc.setLineWidth(0.8)
  doc.line(14, y, 196, y)
  y += 10
  doc.setFontSize(14)
  doc.setTextColor(228, 32, 44)
  doc.text('Grand Total:', 14, y)
  doc.text(`R ${Number(data.grandTotal).toFixed(2)}`, 196, y, { align: 'right' })

  if (data.deposit) {
    y += 10
    doc.setFontSize(11)
    doc.setTextColor(40, 40, 40)
    const label = data.deposit.percent != null ? `Deposit required (${data.deposit.percent}% of total)` : 'Deposit required'
    doc.text(label, 14, y)
    doc.text(`R ${Number(data.deposit.amount).toFixed(2)}`, 196, y, { align: 'right' })
    y += 7
    doc.text('Balance due after deposit', 14, y)
    doc.text(`R ${Number(data.deposit.balance).toFixed(2)}`, 196, y, { align: 'right' })
  }

  y += 16
  doc.setFontSize(11)
  doc.setTextColor(40, 40, 40)
  doc.text('Assumptions', 14, y)
  y += 7
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  ;[
    'Quote based on uploaded plan and confirmed extracted quantities.',
    'Pricing is calculated from the supplied Excel pricing data.',
    'Final measurements must be confirmed before work starts.'
  ].forEach((line) => {
    doc.text(`•  ${line}`, 14, y)
    y += 6
  })

  y += 4
  doc.setFontSize(11)
  doc.setTextColor(40, 40, 40)
  doc.text('Exclusions', 14, y)
  y += 7
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 80)
  ;[
    'Items not visible or not shown on the supplied plan are excluded.',
    'Municipal approvals, engineering changes and abnormal site conditions excluded.',
    'Professional fees (architect, engineer, council) not included unless stated.'
  ].forEach((line) => {
    doc.text(`•  ${line}`, 14, y)
    y += 6
  })

  return doc
}

export function quotePdfFileName(data) {
  return `${data.reference}-${(data.projectName || 'gna-quote').replace(/\s+/g, '-')}.pdf`
}

// Re-download a saved quote from the Quotes page.
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
  const logo = user && user.email === quote.ownerEmail ? user.logoDataUrl : null
  const doc = await createQuotePdf(data, logo)
  doc.save(quotePdfFileName(data))
}
