import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import Layout from '../components/Layout'
import { TRADE_CATEGORIES, VAT_RATE, MOCK_EXTRACTED_QUANTITIES, COMPANY_LEGAL_LINE } from '../data/mockData'
import { useAppState, canGenerateQuote } from '../data/store'
import { LOGO_BASE64 } from '../data/logo'

const STEPS = ['Upload Plans', 'Review Info', 'Quote Settings', 'Add Labour', 'Generate PDF']

function emptyLineItems() {
  return TRADE_CATEGORIES.map((cat) => ({ ...cat, qty: '', unitPrice: '', discount: 0 }))
}

export default function NewQuote() {
  const [state, setState] = useAppState()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [projectName, setProjectName] = useState('')
  const [planFileName, setPlanFileName] = useState('')
  const [lineItems, setLineItems] = useState(emptyLineItems())
  const [markup, setMarkup] = useState(10)
  const [labourRate, setLabourRate] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [wasExtracted, setWasExtracted] = useState(false)

  function goToReview() {
    if (!planFileName) {
      setStep(1)
      return
    }
    // Demo-only: simulate the "assisted extraction" step described in the
    // proposal — a real build would run cad-viewer measurements here instead.
    // The contractor still has to review and confirm every value on the next
    // screen, same as the real product would require.
    setExtracting(true)
    setTimeout(() => {
      setLineItems((items) =>
        items.map((it) => {
          const found = MOCK_EXTRACTED_QUANTITIES[it.id]
          return found ? { ...it, qty: String(found.qty), unitPrice: String(found.unitPrice) } : it
        })
      )
      setExtracting(false)
      setWasExtracted(true)
      setStep(1)
    }, 1400)
  }

  const allowed = canGenerateQuote(state)

  function updateItem(id, field, value) {
    setLineItems((items) =>
      items.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    )
  }

  const subtotal = lineItems.reduce((sum, it) => {
    const qty = parseFloat(it.qty) || 0
    const price = parseFloat(it.unitPrice) || 0
    const discount = parseFloat(it.discount) || 0
    return sum + (qty * price - qty * price * (discount / 100))
  }, 0)
  const labour = parseFloat(labourRate) || 0
  const markedUp = (subtotal + labour) * (1 + (parseFloat(markup) || 0) / 100)
  const vat = markedUp * VAT_RATE
  const total = markedUp + vat

  function generatePdf() {
    const doc = new jsPDF()

    function finishAndSave(companyLogoImg) {
      // GNA Fast Quote logo — large and prominent, top-left
      doc.addImage(LOGO_BASE64, 'JPEG', 14, 8, 66, 35)
      doc.setFontSize(7.5)
      doc.setTextColor(90, 90, 90)
      doc.text(COMPANY_LEGAL_LINE, 14, 46)

      // Contractor's own company logo — top-right, if they uploaded one
      if (companyLogoImg) {
        const maxW = 42
        const maxH = 26
        const ratio = Math.min(maxW / companyLogoImg.width, maxH / companyLogoImg.height)
        const w = companyLogoImg.width * ratio
        const h = companyLogoImg.height * ratio
        doc.addImage(companyLogoImg.dataUrl, 'PNG', 196 - w, 8, w, h)
      }

      doc.setFontSize(9)
      doc.setTextColor(120, 120, 120)
      doc.setDrawColor(228, 32, 44)
      doc.setLineWidth(0.6)
      doc.line(14, 50, 196, 50)

      doc.setFontSize(11)
      doc.setTextColor(40, 40, 40)
      doc.text(`Project: ${projectName || 'Untitled project'}`, 14, 60)
      doc.text(`Customer: ${customerName || '-'}`, 14, 67)
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 74)

      let y = 88
      doc.setFontSize(12)
      doc.text('Item', 14, y)
      doc.text('Qty', 110, y)
      doc.text('Unit price', 135, y)
      doc.text('Line total', 170, y)
      y += 4
      doc.line(14, y, 196, y)
      y += 8
      doc.setFontSize(10)
      lineItems.forEach((it) => {
        const qty = parseFloat(it.qty) || 0
        const price = parseFloat(it.unitPrice) || 0
        if (qty === 0 && price === 0) return
        const lineTotal = qty * price - qty * price * ((parseFloat(it.discount) || 0) / 100)
        doc.text(it.label, 14, y, { maxWidth: 90 })
        doc.text(String(qty), 110, y)
        doc.text(`R ${price.toFixed(2)}`, 135, y)
        doc.text(`R ${lineTotal.toFixed(2)}`, 170, y)
        y += 8
      })

      y += 4
      doc.line(14, y, 196, y)
      y += 8
      doc.text(`Labour: R ${labour.toFixed(2)}`, 140, y)
      y += 7
      doc.text(`Subtotal + markup (${markup}%): R ${markedUp.toFixed(2)}`, 140, y)
      y += 7
      doc.text(`VAT (15%): R ${vat.toFixed(2)}`, 140, y)
      y += 7
      doc.setFontSize(12)
      doc.text(`Total: R ${total.toFixed(2)}`, 140, y)

      doc.save(`${(projectName || 'gna-quote').replace(/\s+/g, '-')}.pdf`)

      const newQuote = {
        id: Date.now(),
        projectName: projectName || 'Untitled project',
        customerName,
        total,
        status: 'completed',
        createdAt: new Date().toISOString()
      }
      setState((s) => ({ ...s, quotes: [...s.quotes, newQuote] }))
      navigate('/quotes')
    }

    // If the contractor uploaded their own logo (at sign-up or in Profile),
    // rasterize it to a PNG data URL via canvas first — this normalizes any
    // input format (PNG/JPEG/WEBP/SVG) into something jsPDF can embed
    // reliably, and gives us its true pixel dimensions for correct scaling.
    if (state.companyLogo?.dataUrl) {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        finishAndSave({ dataUrl: canvas.toDataURL('image/png'), width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = () => finishAndSave(null)
      img.src = state.companyLogo.dataUrl
    } else {
      finishAndSave(null)
    }
  }

  if (!allowed) {
    return (
      <Layout title="New Quote">
        <div className="card text-center">
          <h2 className="text-lg font-semibold mb-2">Your free trial has ended</h2>
          <p className="text-sm text-gray-500 mb-4">
            Choose a plan or buy credits to keep generating quotes.
          </p>
          <button className="btn-primary" onClick={() => navigate('/pricing')}>
            Go to Pricing &amp; Credits
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="New Quote">
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                i === step
                  ? 'bg-brand-blue text-white'
                  : i < step
                  ? 'bg-brand-green text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'font-semibold' : 'text-gray-500'}`}>{s}</span>
            {i < STEPS.length - 1 && <span className="text-gray-300 mx-1">&rarr;</span>}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="card max-w-xl">
          <h2 className="text-lg font-semibold mb-4">Upload plans</h2>
          <input
            className="w-full border rounded-lg px-3 py-2 mb-4"
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <input
            className="w-full border rounded-lg px-3 py-2 mb-4"
            placeholder="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer mb-4">
            <input
              type="file"
              accept=".pdf,.dxf,.dwg,image/*"
              className="hidden"
              onChange={(e) => setPlanFileName(e.target.files?.[0]?.name || '')}
            />
            <p className="text-sm text-gray-500">
              {planFileName ? `Selected: ${planFileName}` : 'Click to upload a PDF, image, or DXF plan'}
            </p>
          </label>
          <p className="text-xs text-gray-400 mb-4">
            {planFileName
              ? "Quantities will be pre-filled from the plan on the next step — you'll still review and confirm every value."
              : 'No file yet? You can also skip straight to Review Info and enter quantities manually.'}
          </p>
          <button className="btn-primary" onClick={goToReview} disabled={extracting}>
            {extracting ? 'Analyzing plan…' : 'Next: Review info'}
          </button>
          {extracting && (
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-brand-blue border-t-transparent animate-spin"></span>
              Reading plan and estimating quantities per trade category…
            </p>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">Review extracted quantities</h2>
          {wasExtracted ? (
            <p className="text-sm text-brand-blue bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-4">
              These quantities were estimated from your uploaded plan. Please review and adjust before continuing — nothing is priced until you confirm.
            </p>
          ) : (
            <p className="text-sm text-gray-500 mb-4">No plan was uploaded, so enter quantities manually below.</p>
          )}
          <div className="space-y-3">
            {lineItems.map((it) => (
              <div key={it.id} className="grid grid-cols-12 gap-3 items-center">
                <span className="col-span-5 text-sm">{it.label}</span>
                <input
                  type="number"
                  className="col-span-2 border rounded-lg px-2 py-1.5 text-sm"
                  placeholder="Qty"
                  value={it.qty}
                  onChange={(e) => updateItem(it.id, 'qty', e.target.value)}
                />
                <input
                  type="number"
                  className="col-span-3 border rounded-lg px-2 py-1.5 text-sm"
                  placeholder="Unit price (R)"
                  value={it.unitPrice}
                  onChange={(e) => updateItem(it.id, 'unitPrice', e.target.value)}
                />
                <input
                  type="number"
                  className="col-span-2 border rounded-lg px-2 py-1.5 text-sm"
                  placeholder="Disc %"
                  value={it.discount}
                  onChange={(e) => updateItem(it.id, 'discount', e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button className="btn-secondary" onClick={() => setStep(0)}>
              Back
            </button>
            <button className="btn-primary" onClick={() => setStep(2)}>
              Next: Quote settings
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card max-w-md">
          <h2 className="text-lg font-semibold mb-4">Quote settings</h2>
          <label className="block text-sm text-gray-500 mb-1">Mark-up %</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 mb-4"
            value={markup}
            onChange={(e) => setMarkup(e.target.value)}
          />
          <p className="text-sm text-gray-500 mb-4">VAT is fixed at 15%, applied automatically.</p>
          <div className="flex justify-between">
            <button className="btn-secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn-primary" onClick={() => setStep(3)}>
              Next: Add labour
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card max-w-md">
          <h2 className="text-lg font-semibold mb-4">Labour rate</h2>
          <label className="block text-sm text-gray-500 mb-1">Labour cost for contract (R)</label>
          <input
            type="number"
            className="w-full border rounded-lg px-3 py-2 mb-4"
            value={labourRate}
            onChange={(e) => setLabourRate(e.target.value)}
          />
          <div className="flex justify-between">
            <button className="btn-secondary" onClick={() => setStep(2)}>
              Back
            </button>
            <button className="btn-primary" onClick={() => setStep(4)}>
              Next: Generate PDF
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="card max-w-md">
          <h2 className="text-lg font-semibold mb-4">Quote summary</h2>
          <div className="text-sm space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Materials subtotal</span>
              <span>R {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Labour</span>
              <span>R {labour.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">After {markup}% mark-up</span>
              <span>R {markedUp.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">VAT (15%)</span>
              <span>R {vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base border-t pt-2">
              <span>Total</span>
              <span>R {total.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between">
            <button className="btn-secondary" onClick={() => setStep(3)}>
              Back
            </button>
            <button className="btn-primary" onClick={generatePdf}>
              Generate PDF quote
            </button>
          </div>
        </div>
      )}
    </Layout>
  )
}
