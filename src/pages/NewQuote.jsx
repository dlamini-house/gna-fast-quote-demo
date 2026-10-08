import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import Layout from '../components/Layout'
import {
  MOCK_EXTRACTED_MATERIALS,
  LABOUR_TRADES,
  LABOUR_FIXED,
  UNIT_OPTIONS,
  DEMO_LABOUR_RATES,
  COMPANY_LEGAL_LINE
} from '../data/mockData'
import { useAppState, canGenerateQuote, currentUser } from '../data/store'
import { LOGO_BASE64 } from '../data/logo'
import { db } from '../data/db'
import { SUPPLIERS } from '../data/suppliers'

const STEPS = [
  'Select Supplier',
  'Upload Plan',
  'Review Extracted Info',
  'Add Items Not on Plan',
  'Consumables (Optional)',
  'Pricing Engine',
  'Add Labour Rate',
  'Generate PDF Quote'
]

// Categories a plan can never tell you about — the contractor has to choose
// these themselves rather than having them auto-extracted. Surfaced as
// quick filters on the "Add Items Not on Plan" step.
const SUGGESTED_EXTRA_CATEGORIES = ['Labour & Services']

// Consumables (the price list's "12 General Fixings & Consumables" category)
// has its own optional step, so it's matched here and kept out of the
// general "Add Items Not on Plan" browser.
const isConsumablesCategory = (name) => String(name).includes('Consumables')

// Price-list category names carry a numeric prefix ("14 Labour & Services");
// show them without it, and show the consumables category simply as
// "Consumables".
function categoryLabel(name) {
  if (isConsumablesCategory(name)) return 'Consumables'
  return String(name).replace(/^\d+\s+/, '')
}

function unitLabel(unitId) {
  return UNIT_OPTIONS.find((u) => u.id === unitId)?.label || unitId
}

export default function NewQuote() {
  const [state, setState] = useAppState()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const user = currentUser(state)

  // Step 0: which supplier's price list this quote's materials come from
  const [supplier, setSupplier] = useState(null)
  const supplierInfo = SUPPLIERS.find((s) => s.slug === supplier) || null

  // Step 1
  const [projectName, setProjectName] = useState('')
  const [clientName, setClientName] = useState('')
  const [siteAddress, setSiteAddress] = useState('')
  const [planFileName, setPlanFileName] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [wasExtracted, setWasExtracted] = useState(false)

  // Step 1: extracted material line items (qty editable, rate fixed from price list)
  const [materials, setMaterials] = useState(MOCK_EXTRACTED_MATERIALS.map((m) => ({ ...m })))
  const [priceListInfo, setPriceListInfo] = useState(null) // uploaded BUCO price list metadata, if any
  const [priceOverrides, setPriceOverrides] = useState(null) // code -> { price, description } from that upload
  const [priceCatalog, setPriceCatalog] = useState([]) // full [{ category, items }] from that upload, for browsing

  // Step 3: items the contractor adds themselves — things no plan can show,
  // like labour or general fixings/consumables — picked from the supplier's
  // full uploaded catalogue rather than extracted from the plan.
  const [extraMaterials, setExtraMaterials] = useState([])
  const [extraCategoryFilter, setExtraCategoryFilter] = useState('all')
  const [extraSearch, setExtraSearch] = useState('')
  const [extraQtyDrafts, setExtraQtyDrafts] = useState({})

  // Step 4: optional consumables — the supplier's full consumables list,
  // with a quantity per item the contractor wants.
  const [wantsConsumables, setWantsConsumables] = useState(false)
  const [consumableQtys, setConsumableQtys] = useState({}) // code -> qty string

  // Pull in whatever price list an admin has uploaded for the chosen supplier
  // (Admin → Price Lists). Materials are matched by their product code, so
  // an admin replacing that supplier's list changes the rates a contractor
  // sees here without any other code path changing.
  useEffect(() => {
    if (!supplier) return
    setPriceOverrides(null)
    setPriceListInfo(null)
    setPriceCatalog([])
    db.get('priceLists', supplier).then((record) => {
      if (!record?.items?.length) return
      const map = {}
      record.items.forEach((it) => {
        if (it.code) map[String(it.code)] = it
      })
      setPriceOverrides(map)
      setPriceListInfo(record)
      setPriceCatalog(record.categories || [])
    })
  }, [supplier])

  function addExtraItem(item, category) {
    const qty = parseFloat(extraQtyDrafts[item.code]) || 1
    setExtraMaterials((items) => [
      ...items,
      {
        id: `extra-${item.code}-${Date.now()}`,
        source: category,
        code: item.code,
        description: item.description,
        unit: item.unit,
        qty,
        rate: item.price
      }
    ])
  }

  function removeExtraItem(id) {
    setExtraMaterials((items) => items.filter((it) => it.id !== id))
  }

  function updateExtraQty(id, qty) {
    setExtraMaterials((items) => items.map((it) => (it.id === id ? { ...it, qty } : it)))
  }

  // Consumables the contractor ticked, priced straight from the supplier's list.
  const consumablesCategory = priceCatalog.find((c) => isConsumablesCategory(c.category)) || null
  const consumableLines = wantsConsumables && consumablesCategory
    ? consumablesCategory.items
        .filter((it) => (parseFloat(consumableQtys[it.code]) || 0) > 0)
        .map((it) => ({
          id: `consumable-${it.code}`,
          source: 'Consumables',
          code: it.code,
          description: it.description,
          unit: it.unit,
          qty: parseFloat(consumableQtys[it.code]),
          rate: it.price
        }))
    : []

  const allMaterials = [...materials, ...extraMaterials, ...consumableLines]
  // Step 3 browses every category except consumables (which has its own step).
  const extraCatalog = priceCatalog.filter((c) => !isConsumablesCategory(c.category))

  function withPriceListRates(items) {
    if (!priceOverrides) return items
    return items.map((m) => {
      const match = priceOverrides[String(m.code)]
      // The price list's wording is generic ("Internal doors"), the plan's
      // line is specific ("Door Hardboard Hollow Core 813x2032mm") — keep the
      // specific description and take only the rate from the list.
      return match ? { ...m, rate: match.price } : m
    })
  }

  // The price list usually loads a moment after this component mounts, so
  // re-apply it to whatever's already on screen once it arrives.
  useEffect(() => {
    if (priceOverrides) setMaterials((items) => withPriceListRates(items))
  }, [priceOverrides])

  // Step 2: pricing engine settings
  const [markup, setMarkup] = useState(15)
  const [vatPercent, setVatPercent] = useState(15)
  const [transportAllowance, setTransportAllowance] = useState(5000)

  // Step 3: labour
  const [labourRates, setLabourRates] = useState(
    Object.fromEntries(LABOUR_TRADES.map((t) => [t.id, { rate: String(DEMO_LABOUR_RATES[t.id] ?? ''), unit: t.unit }]))
  )
  const [fixedLabour, setFixedLabour] = useState(
    Object.fromEntries(LABOUR_FIXED.map((f) => [f.id, String(f.amount)]))
  )

  // Labour: the contractor's own extra line items, on top of the standard trades
  const [customLabour, setCustomLabour] = useState([]) // { id, label, unit, rate, qty }

  function addCustomLabour() {
    setCustomLabour((rows) => [...rows, { id: `custom-${Date.now()}`, label: '', unit: 'day', rate: '', qty: '1' }])
  }
  function updateCustomLabour(id, field, value) {
    setCustomLabour((rows) => rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }
  function removeCustomLabour(id) {
    setCustomLabour((rows) => rows.filter((r) => r.id !== id))
  }

  // Final step
  const [showPreview, setShowPreview] = useState(false)

  const allowed = canGenerateQuote(state)

  function goToReview() {
    setExtracting(true)
    setTimeout(() => {
      setMaterials(withPriceListRates(MOCK_EXTRACTED_MATERIALS.map((m) => ({ ...m }))))
      setExtracting(false)
      setWasExtracted(true)
      setStep(2)
    }, 1400)
  }

  function updateMaterialQty(id, qty) {
    setMaterials((items) => items.map((it) => (it.id === id ? { ...it, qty } : it)))
  }

  function updateLabourRate(id, field, value) {
    setLabourRates((rates) => ({ ...rates, [id]: { ...rates[id], [field]: value } }))
  }

  // ---- Live calculations ----
  const materialCost = allMaterials.reduce((sum, m) => sum + (parseFloat(m.qty) || 0) * m.rate, 0)

  const labourLines = LABOUR_TRADES.map((t) => {
    const rate = parseFloat(labourRates[t.id]?.rate) || 0
    const unit = labourRates[t.id]?.unit || t.unit
    return { ...t, unit, rate, cost: rate * t.basis }
  })
  const fixedLines = LABOUR_FIXED.map((f) => ({ ...f, amount: parseFloat(fixedLabour[f.id]) || 0 }))
  const customLabourLines = customLabour.map((r) => ({
    ...r,
    cost: (parseFloat(r.rate) || 0) * (parseFloat(r.qty) || 0)
  }))
  const labourCost =
    labourLines.reduce((sum, l) => sum + l.cost, 0) +
    fixedLines.reduce((sum, f) => sum + f.amount, 0) +
    customLabourLines.reduce((sum, l) => sum + l.cost, 0)

  const transport = parseFloat(transportAllowance) || 0
  const subtotal = materialCost + labourCost + transport
  const markupAmount = subtotal * ((parseFloat(markup) || 0) / 100)
  const markedUp = subtotal + markupAmount
  const vatAmount = markedUp * ((parseFloat(vatPercent) || 0) / 100)
  const grandTotal = markedUp + vatAmount

  const reference = `GNA-DEMO-${String(state.quotes.length + 1).padStart(3, '0')}`

  async function generatePdf() {
    const doc = new jsPDF()

    function finishAndSave(companyLogoImg) {
      // GNA logo: kept small and to the top-left — the contractor's own
      // branding is the bigger, more prominent logo on this quote.
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
      doc.text(`Reference: ${reference}`, 196, infoTop + 7, { align: 'right' })
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 196, infoTop + 13, { align: 'right' })

      doc.setFontSize(11)
      doc.setTextColor(40, 40, 40)
      doc.text(`Project: ${projectName || 'Untitled project'}`, 14, infoTop)
      doc.text(`Client: ${clientName || '-'}`, 14, infoTop + 7)
      doc.text(`Site: ${siteAddress || '-'}`, 14, infoTop + 14)

      // "Quoted by" block — the contractor's own company details, required
      // on the quote alongside their logo.
      let quotedByY = infoTop + 22
      doc.setFontSize(8.5)
      doc.setTextColor(140, 140, 140)
      doc.text('Quoted by', 196, quotedByY, { align: 'right' })
      quotedByY += 5
      doc.setFontSize(10.5)
      doc.setTextColor(40, 40, 40)
      doc.text(user?.company || 'Independent Contractor', 196, quotedByY, { align: 'right' })
      doc.setFontSize(8.5)
      doc.setTextColor(100, 100, 100)
      if (user?.companyAddress) {
        const addressLines = doc.splitTextToSize(user.companyAddress, 95)
        addressLines.forEach((line) => {
          quotedByY += 4.5
          doc.text(line, 196, quotedByY, { align: 'right' })
        })
      }
      if (user?.email) {
        quotedByY += 4.5
        doc.text(user.email, 196, quotedByY, { align: 'right' })
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

      const summaryRows = [
        ['Material Cost', materialCost],
        ['Labour Cost', labourCost],
        ['Transport / Location Allowance', transport],
        [`Mark-up (${markup}%)`, markupAmount],
        [`VAT (${vatPercent}%)`, vatAmount]
      ]
      summaryRows.forEach(([label, amount]) => {
        doc.text(label, 14, y)
        doc.text(`R ${amount.toFixed(2)}`, 196, y, { align: 'right' })
        y += 8
      })

      y += 2
      doc.setLineWidth(0.8)
      doc.line(14, y, 196, y)
      y += 10
      doc.setFontSize(14)
      doc.setTextColor(228, 32, 44)
      doc.text('Grand Total:', 14, y)
      doc.text(`R ${grandTotal.toFixed(2)}`, 196, y, { align: 'right' })

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

      doc.save(`${reference}-${(projectName || 'gna-quote').replace(/\s+/g, '-')}.pdf`)

      const newQuote = {
        id: Date.now(),
        reference,
        projectName: projectName || 'Untitled project',
        customerName: clientName,
        siteAddress,
        total: grandTotal,
        status: 'completed',
        createdAt: new Date().toISOString(),
        ownerEmail: user?.email || null,
        ownerCompany: user?.company || null
      }
      setState((s) => ({ ...s, quotes: [...s.quotes, newQuote] }))
      db.set('quotes', String(newQuote.id), newQuote)
      navigate('/quotes')
    }

    if (user?.logoDataUrl) {
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
      img.src = user.logoDataUrl
    } else {
      finishAndSave(null)
    }
  }

  if (!allowed) {
    return (
      <Layout title="New Quote">
        <div className="card text-center">
          <h2 className="text-lg font-semibold mb-2">Your free trial has ended</h2>
          <p className="text-sm text-gray-500 mb-4">Choose a plan or buy credits to keep generating quotes.</p>
          <button className="btn-primary" onClick={() => navigate('/pricing')}>Go to Pricing &amp; Credits</button>
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
                i === step ? 'bg-brand-blue text-white' : i < step ? 'bg-brand-green text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'font-semibold' : 'text-gray-500'}`}>{s}</span>
            {i < STEPS.length - 1 && <span className="text-gray-300 mx-1">&rarr;</span>}
          </div>
        ))}
      </div>

      {/* Step 0: Select Supplier */}
      {step === 0 && (
        <div className="card max-w-2xl">
          <h2 className="text-lg font-semibold mb-1">Select Supplier for materials</h2>
          <p className="text-sm text-gray-500 mb-6">
            Choose which supplier's price list this quote's material rates will be pulled from.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {SUPPLIERS.map((s) => {
              const isSelected = supplier === s.slug
              return (
                <button
                  key={s.slug}
                  type="button"
                  disabled={!s.active}
                  onClick={() => s.active && setSupplier(s.slug)}
                  className={`group relative h-24 border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-colors ${
                    !s.active
                      ? 'opacity-40 grayscale cursor-not-allowed border-gray-200'
                      : isSelected
                      ? 'border-brand-blue bg-blue-50 cursor-pointer'
                      : 'border-gray-200 hover:border-brand-blue cursor-pointer'
                  }`}
                >
                  <img src={s.src} alt={s.name} className="max-h-10 max-w-full object-contain" />
                  <span className="text-xs text-gray-500">{s.name}</span>
                  {!s.active && (
                    <span className="pointer-events-none absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/60 rounded-xl">
                      <span className="text-white text-[11px] font-medium px-2 text-center">Currently Unavailable</span>
                    </span>
                  )}
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-brand-blue text-white text-xs flex items-center justify-center">
                      &#10003;
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <button className="btn-primary" disabled={!supplier} onClick={() => setStep(1)}>
            Next: Upload Plan
          </button>
        </div>
      )}

      {/* Step 1: Upload Plan */}
      {step === 1 && (
        <div className="card max-w-xl">
          <h2 className="text-lg font-semibold mb-1">Upload plan</h2>
          {supplierInfo && (
            <p className="text-xs text-gray-400 mb-3">
              Materials supplier: <span className="font-medium text-gray-600">{supplierInfo.name}</span>
            </p>
          )}
          <input className="w-full border rounded-lg px-3 py-2 mb-4" placeholder="Project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          <input className="w-full border rounded-lg px-3 py-2 mb-4" placeholder="Client name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          <input className="w-full border rounded-lg px-3 py-2 mb-4" placeholder="Site address" value={siteAddress} onChange={(e) => setSiteAddress(e.target.value)} />
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer mb-4">
            <input type="file" accept=".pdf,.dxf,.dwg,image/*" className="hidden" onChange={(e) => setPlanFileName(e.target.files?.[0]?.name || '')} />
            <p className="text-sm text-gray-500">{planFileName ? `Selected: ${planFileName}` : 'Click to upload a PDF, image, or DXF plan'}</p>
          </label>
          <p className="text-xs text-gray-400 mb-4">
            Materials and labour quantities will be pre-filled on the next steps — you'll review and confirm every value before anything is priced.
          </p>
          <div className="flex justify-between items-center">
            <button className="btn-secondary" onClick={() => setStep(0)} disabled={extracting}>Back</button>
            <button className="btn-primary" onClick={goToReview} disabled={extracting}>
              {extracting ? 'Analyzing plan…' : 'Next: Review Extracted Info'}
            </button>
          </div>
          {extracting && (
            <p className="text-xs text-gray-400 mt-3 flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-brand-blue border-t-transparent animate-spin"></span>
              Mapping plan elements to price-list items…
            </p>
          )}
        </div>
      )}

      {/* Step 2: Review Extracted Info */}
      {step === 2 && (
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">Review extracted info</h2>
          <p className="text-sm text-brand-blue bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-2">
            These quantities were estimated from your uploaded plan and mapped to items in your price
            list. Adjust any quantity before continuing.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            {priceListInfo ? (
              <>
                &#10003; Rates are from the <strong>{priceListInfo.supplier}</strong> price list
                uploaded {new Date(priceListInfo.uploadedAt).toLocaleDateString('en-ZA')}.
              </>
            ) : (
              <>
                Rates are the built-in reference pricing — an admin can upload a live{' '}
                {supplierInfo?.name || 'supplier'} price list from Admin → Price Lists.
              </>
            )}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-2 font-medium">Source</th>
                  <th className="py-2 pr-2 font-medium">Code</th>
                  <th className="py-2 pr-2 font-medium">Description</th>
                  <th className="py-2 pr-2 font-medium">Qty</th>
                  <th className="py-2 pr-2 font-medium text-right">Rate</th>
                  <th className="py-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => (
                  <tr key={m.id} className="border-b border-gray-100">
                    <td className="py-2 pr-2 text-gray-500">{m.source}</td>
                    <td className="py-2 pr-2 text-gray-500">{m.code}</td>
                    <td className="py-2 pr-2">{m.description}</td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        className="w-20 border rounded px-2 py-1"
                        value={m.qty}
                        onChange={(e) => updateMaterialQty(m.id, e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-2 text-right">R {m.rate.toFixed(2)}</td>
                    <td className="py-2 text-right font-medium">R {((parseFloat(m.qty) || 0) * m.rate).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between mt-6">
            <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
            <button className="btn-primary" onClick={() => setStep(3)}>Next: Add Items Not on Plan</button>
          </div>
        </div>
      )}

      {/* Step 3: Add Items Not on Plan */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-1">Add items not on the plan</h2>
            <p className="text-sm text-gray-500 mb-4">
              Some items never show up on a drawing — labour and services are the contractor's call.
              Pick any item from the {supplierInfo?.name || 'supplier'} price list and add it to this
              quote. Consumables have their own step next.
            </p>

            {!extraCatalog.length ? (
              <p className="text-sm text-gray-400">
                No price list is loaded for {supplierInfo?.name || 'this supplier'} yet, so there's
                nothing to browse here — continue to pricing, or ask an admin to upload one from
                Admin → Price Lists.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setExtraCategoryFilter('all')}
                    className={`text-xs px-3 py-1.5 rounded-full border ${
                      extraCategoryFilter === 'all' ? 'bg-brand-blue text-white border-brand-blue' : 'border-gray-300 text-gray-600'
                    }`}
                  >
                    All categories
                  </button>
                  {SUGGESTED_EXTRA_CATEGORIES.map((label) => {
                    const match = extraCatalog.find((c) => c.category.includes(label))
                    if (!match) return null
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setExtraCategoryFilter(match.category)}
                        className={`text-xs px-3 py-1.5 rounded-full border ${
                          extraCategoryFilter === match.category
                            ? 'bg-brand-blue text-white border-brand-blue'
                            : 'border-brand-blue/40 text-brand-blue'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                  <select
                    className="text-xs border rounded-full px-3 py-1.5 text-gray-600"
                    value={extraCategoryFilter === 'all' ? '' : extraCategoryFilter}
                    onChange={(e) => setExtraCategoryFilter(e.target.value || 'all')}
                  >
                    <option value="">More categories…</option>
                    {extraCatalog.map((c) => (
                      <option key={c.category} value={c.category}>{categoryLabel(c.category)}</option>
                    ))}
                  </select>
                </div>
                <input
                  className="w-full border rounded-lg px-3 py-2 mb-3 text-sm"
                  placeholder="Search items…"
                  value={extraSearch}
                  onChange={(e) => setExtraSearch(e.target.value)}
                />
                <div className="overflow-y-auto max-h-80 border rounded-lg divide-y">
                  {extraCatalog
                    .filter((c) => extraCategoryFilter === 'all' || c.category === extraCategoryFilter)
                    .flatMap((c) => c.items.map((it) => ({ ...it, category: c.category })))
                    .filter((it) => !extraSearch || it.description.toLowerCase().includes(extraSearch.toLowerCase()))
                    .slice(0, 60)
                    .map((it) => (
                      <div key={`${it.category}-${it.code}`} className="flex items-center gap-2 px-3 py-2 text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="truncate">{it.description}</p>
                          <p className="text-xs text-gray-400">{categoryLabel(it.category)} &middot; R {it.price.toFixed(2)} / {it.unit || 'EA'}</p>
                        </div>
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          className="w-16 border rounded px-2 py-1 text-sm"
                          value={extraQtyDrafts[it.code] ?? ''}
                          onChange={(e) => setExtraQtyDrafts((d) => ({ ...d, [it.code]: e.target.value }))}
                        />
                        <button
                          type="button"
                          className="text-xs px-3 py-1.5 rounded-lg bg-brand-blue text-white font-medium shrink-0"
                          onClick={() => addExtraItem(it, it.category)}
                        >
                          Add
                        </button>
                      </div>
                    ))}
                </div>
              </>
            )}

            <div className="flex justify-between mt-6">
              <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
              <button className="btn-primary" onClick={() => setStep(4)}>Next: Consumables</button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Items added to this quote</h2>
            {extraMaterials.length === 0 ? (
              <p className="text-sm text-gray-400">
                Nothing added yet — items you pick on the left will appear here.
              </p>
            ) : (
              <div className="space-y-2">
                {extraMaterials.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm border-b border-gray-100 pb-2">
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{m.description}</p>
                      <p className="text-xs text-gray-400">{categoryLabel(m.source)} &middot; R {m.rate.toFixed(2)} / {m.unit || 'EA'}</p>
                    </div>
                    <input
                      type="number"
                      className="w-16 border rounded px-2 py-1 text-sm"
                      value={m.qty}
                      onChange={(e) => updateExtraQty(m.id, e.target.value)}
                    />
                    <span className="w-24 text-right font-medium">R {((parseFloat(m.qty) || 0) * m.rate).toFixed(2)}</span>
                    <button type="button" className="text-gray-400 hover:text-brand-red text-xs" onClick={() => removeExtraItem(m.id)}>
                      &#10005;
                    </button>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-semibold text-sm">
                  <span>Added items subtotal</span>
                  <span>R {extraMaterials.reduce((sum, m) => sum + (parseFloat(m.qty) || 0) * m.rate, 0).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Consumables (optional) */}
      {step === 4 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="card">
            <h2 className="text-lg font-semibold mb-1">Consumables</h2>
            <p className="text-sm text-gray-500 mb-4">
              Optional. Consumables (fixings, sealants, adhesives, tapes, safety gear) can't be read
              off a plan. Add them if this job needs them, or skip straight to pricing.
            </p>

            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => setWantsConsumables(true)}
                className={`flex-1 border rounded-lg px-3 py-2.5 text-sm font-medium ${
                  wantsConsumables ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-gray-200 text-gray-600'
                }`}
              >
                Yes, add consumables
              </button>
              <button
                type="button"
                onClick={() => setWantsConsumables(false)}
                className={`flex-1 border rounded-lg px-3 py-2.5 text-sm font-medium ${
                  !wantsConsumables ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-gray-200 text-gray-600'
                }`}
              >
                No, skip
              </button>
            </div>

            {wantsConsumables && !consumablesCategory && (
              <p className="text-sm text-gray-400">
                No consumables list is loaded for {supplierInfo?.name || 'this supplier'} yet — an
                admin can upload their price list from Admin → Price Lists.
              </p>
            )}

            {wantsConsumables && consumablesCategory && (
              <div className="border rounded-lg divide-y max-h-[28rem] overflow-y-auto">
                {consumablesCategory.items.map((it) => {
                  const qty = consumableQtys[it.code] ?? ''
                  const selected = (parseFloat(qty) || 0) > 0
                  return (
                    <div key={it.code} className={`flex items-center gap-3 px-3 py-2 text-sm ${selected ? 'bg-blue-50' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={(e) =>
                          setConsumableQtys((q) => ({ ...q, [it.code]: e.target.checked ? '1' : '' }))
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{it.description}</p>
                        <p className="text-xs text-gray-400">R {it.price.toFixed(2)} / {it.unit || 'EA'}</p>
                      </div>
                      <input
                        type="number"
                        min="0"
                        placeholder="Qty"
                        className="w-20 border rounded px-2 py-1 text-sm"
                        value={qty}
                        onChange={(e) => setConsumableQtys((q) => ({ ...q, [it.code]: e.target.value }))}
                      />
                      <span className="w-24 text-right text-sm font-medium">
                        {selected ? `R ${(parseFloat(qty) * it.price).toFixed(2)}` : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button className="btn-secondary" onClick={() => setStep(3)}>Back</button>
              <button className="btn-primary" onClick={() => setStep(5)}>Next: Pricing Engine</button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Consumables on this quote</h2>
            {consumableLines.length === 0 ? (
              <p className="text-sm text-gray-400">
                {wantsConsumables ? 'Tick or enter a quantity for any item on the left.' : 'Skipped — no consumables will be added.'}
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                {consumableLines.map((m) => (
                  <div key={m.id} className="flex justify-between gap-3 border-b border-gray-100 pb-2">
                    <span className="min-w-0 truncate">{m.qty} &times; {m.description}</span>
                    <span className="font-medium shrink-0">R {(m.qty * m.rate).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-semibold">
                  <span>Consumables subtotal</span>
                  <span>R {consumableLines.reduce((sum, m) => sum + m.qty * m.rate, 0).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 5: Pricing Engine */}
      {step === 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-1">Excel-based pricing engine</h2>
            <p className="text-sm text-gray-500 mb-4">
              Pricing is imported from your price list: Product Code, Description, Quantity, Unit,
              Price, Incl VAT.
            </p>
            <label className="block text-sm text-gray-500 mb-1">Mark-up %</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2 mb-4" value={markup} onChange={(e) => setMarkup(e.target.value)} />
            <label className="block text-sm text-gray-500 mb-1">VAT %</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2 mb-4" value={vatPercent} onChange={(e) => setVatPercent(e.target.value)} />
            <label className="block text-sm text-gray-500 mb-1">Transport Allowance (R)</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2 mb-6" value={transportAllowance} onChange={(e) => setTransportAllowance(e.target.value)} />
            <div className="flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(4)}>Back</button>
              <button className="btn-primary" onClick={() => setStep(6)}>Add Labour Rate &rarr;</button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Mapped material items</h2>
            <div className="overflow-y-auto max-h-72">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-2 font-medium">Source</th>
                    <th className="py-2 pr-2 font-medium">Code</th>
                    <th className="py-2 pr-2 font-medium">Qty</th>
                    <th className="py-2 pr-2 font-medium text-right">Rate</th>
                    <th className="py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {allMaterials.map((m) => (
                    <tr key={m.id} className="border-b border-gray-100">
                      <td className="py-2 pr-2 text-gray-500">{m.source}</td>
                      <td className="py-2 pr-2 text-gray-500">{m.code}</td>
                      <td className="py-2 pr-2">{m.qty}</td>
                      <td className="py-2 pr-2 text-right">R {m.rate.toFixed(2)}</td>
                      <td className="py-2 text-right">R {((parseFloat(m.qty) || 0) * m.rate).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t font-semibold">
              <span>Material Cost</span>
              <span>R {materialCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 6: Add Labour Rate */}
      {step === 6 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-1">Contractor labour rates</h2>
            <p className="text-sm text-gray-500 mb-4">Labour is contractor-controlled and added after material pricing.</p>
            <div className="space-y-3">
              {LABOUR_TRADES.map((t) => (
                <div key={t.id} className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-5 text-sm">{t.label}</span>
                  <select
                    className="col-span-3 border rounded-lg px-2 py-1.5 text-sm"
                    value={labourRates[t.id].unit}
                    onChange={(e) => updateLabourRate(t.id, 'unit', e.target.value)}
                  >
                    {UNIT_OPTIONS.map((u) => (<option key={u.id} value={u.id}>{u.label}</option>))}
                  </select>
                  <input
                    type="number"
                    className="col-span-4 border rounded-lg px-2 py-1.5 text-sm"
                    placeholder="Rate (R)"
                    value={labourRates[t.id].rate}
                    onChange={(e) => updateLabourRate(t.id, 'rate', e.target.value)}
                  />
                </div>
              ))}
              {LABOUR_FIXED.map((f) => (
                <div key={f.id} className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-5 text-sm">{f.label}</span>
                  <span className="col-span-3 text-xs text-gray-400">fixed</span>
                  <input
                    type="number"
                    className="col-span-4 border rounded-lg px-2 py-1.5 text-sm"
                    value={fixedLabour[f.id]}
                    onChange={(e) => setFixedLabour((v) => ({ ...v, [f.id]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Your own line items</h3>
                <button type="button" className="text-xs px-3 py-1.5 rounded-lg bg-brand-blue text-white font-medium" onClick={addCustomLabour}>
                  + Add line item
                </button>
              </div>
              {customLabour.length === 0 ? (
                <p className="text-xs text-gray-400">
                  Need something not listed above? Add your own labour line — a description, a unit, a rate and a quantity.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[11px] text-gray-400 px-0.5">
                    <span className="col-span-4">Description</span>
                    <span className="col-span-2">Unit</span>
                    <span className="col-span-2">Rate (R)</span>
                    <span className="col-span-2">Qty</span>
                    <span className="col-span-2"></span>
                  </div>
                  {customLabour.map((r) => (
                    <div key={r.id} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        className="col-span-4 border rounded-lg px-2 py-1.5 text-sm"
                        placeholder="e.g. Site cleanup"
                        value={r.label}
                        onChange={(e) => updateCustomLabour(r.id, 'label', e.target.value)}
                      />
                      <select
                        className="col-span-2 border rounded-lg px-1 py-1.5 text-sm"
                        value={r.unit}
                        onChange={(e) => updateCustomLabour(r.id, 'unit', e.target.value)}
                      >
                        {UNIT_OPTIONS.map((u) => (<option key={u.id} value={u.id}>{u.label}</option>))}
                      </select>
                      <input
                        type="number"
                        className="col-span-2 border rounded-lg px-2 py-1.5 text-sm"
                        placeholder="0"
                        value={r.rate}
                        onChange={(e) => updateCustomLabour(r.id, 'rate', e.target.value)}
                      />
                      <input
                        type="number"
                        className="col-span-2 border rounded-lg px-2 py-1.5 text-sm"
                        placeholder="1"
                        value={r.qty}
                        onChange={(e) => updateCustomLabour(r.id, 'qty', e.target.value)}
                      />
                      <button type="button" className="col-span-2 text-xs text-gray-400 hover:text-brand-red text-left" onClick={() => removeCustomLabour(r.id)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-between mt-6">
              <button className="btn-secondary" onClick={() => setStep(5)}>Back</button>
              <button className="btn-primary" onClick={() => setStep(7)}>Next: Generate PDF Quote</button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Live labour summary</h2>
            <div className="text-sm space-y-2">
              {labourLines.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span className="text-gray-500">{l.label}</span>
                  <span>R {l.cost.toFixed(2)}</span>
                </div>
              ))}
              {customLabourLines.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span className="text-gray-500">{l.label || 'Custom line item'}</span>
                  <span>R {l.cost.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-gray-500">Additional Costs</span>
                <span>R {fixedLines.reduce((sum, f) => sum + f.amount, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t pt-3 mt-1 text-brand-green">
                <span>Total Labour Cost</span>
                <span>R {labourCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 7: Generate PDF Quote */}
      {step === 7 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Quote summary</h2>
            <div className="text-sm space-y-2 mb-4">
              <div className="flex justify-between"><span className="text-gray-500">Material Cost</span><span>R {materialCost.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Labour Cost</span><span>R {labourCost.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Transport / Location Allowance</span><span>R {transport.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Mark-up ({markup}%)</span><span>R {markupAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">VAT ({vatPercent}%)</span><span>R {vatAmount.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-base border-t pt-2 text-brand-green">
                <span>Grand Total</span><span>R {grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-brand-blue bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-4">
              Generating this quote would deduct 1 credit from your account.
            </p>
            <div className="flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(6)}>Back</button>
              <button className="btn-primary" onClick={() => setShowPreview(true)}>Open PDF-Ready Quote</button>
            </div>
          </div>

          {showPreview && (
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <img src={LOGO_BASE64} alt="GNA Fast Quote" className="h-7 w-auto" />
                <div className="flex flex-col items-end gap-2">
                  {user?.logoDataUrl && (
                    <img src={user.logoDataUrl} alt={`${user.company} logo`} className="h-16 max-w-[130px] object-contain" />
                  )}
                  <h3 className="text-xl font-bold text-brand-red">QUOTE</h3>
                </div>
              </div>
              <div className="flex justify-between items-start text-xs text-gray-500 mb-4">
                <div className="space-y-0.5 text-sm text-gray-700">
                  <p><strong>Project:</strong> {projectName || 'Untitled project'}</p>
                  <p><strong>Client:</strong> {clientName || '-'}</p>
                  <p><strong>Site:</strong> {siteAddress || '-'}</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p>Reference: {reference}</p>
                  <p>Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-gray-400 mt-1.5">Quoted by</p>
                  <p className="font-semibold text-gray-700">{user?.company || 'Independent Contractor'}</p>
                  {user?.companyAddress && <p className="max-w-[180px]">{user.companyAddress}</p>}
                  {user?.email && <p>{user.email}</p>}
                </div>
              </div>
              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="text-left text-gray-500 border-b"><th className="py-2 font-medium">Description</th><th className="py-2 font-medium text-right">Amount (ZAR)</th></tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100"><td className="py-2">Material Cost</td><td className="py-2 text-right">R {materialCost.toFixed(2)}</td></tr>
                  <tr className="border-b border-gray-100"><td className="py-2">Labour Cost</td><td className="py-2 text-right">R {labourCost.toFixed(2)}</td></tr>
                  <tr className="border-b border-gray-100"><td className="py-2">Transport / Location Allowance</td><td className="py-2 text-right">R {transport.toFixed(2)}</td></tr>
                  <tr className="border-b border-gray-100"><td className="py-2">Mark-up ({markup}%)</td><td className="py-2 text-right">R {markupAmount.toFixed(2)}</td></tr>
                  <tr className="border-b border-gray-100"><td className="py-2">VAT ({vatPercent}%)</td><td className="py-2 text-right">R {vatAmount.toFixed(2)}</td></tr>
                </tbody>
              </table>
              <p className="text-right text-lg font-bold text-brand-red mb-4">Grand Total: R {grandTotal.toFixed(2)}</p>

              <h4 className="text-sm font-semibold mb-1">Assumptions</h4>
              <ul className="text-xs text-gray-600 list-disc pl-4 mb-3 space-y-0.5">
                <li>Quote based on uploaded plan and confirmed extracted quantities.</li>
                <li>Pricing is calculated from the supplied Excel pricing data.</li>
                <li>Final measurements must be confirmed before work starts.</li>
              </ul>
              <h4 className="text-sm font-semibold mb-1">Exclusions</h4>
              <ul className="text-xs text-gray-600 list-disc pl-4 mb-5 space-y-0.5">
                <li>Items not visible or not shown on the supplied plan are excluded.</li>
                <li>Municipal approvals, engineering changes and abnormal site conditions excluded.</li>
                <li>Professional fees (architect, engineer, council) not included unless stated.</li>
              </ul>
              <button className="btn-primary w-full" onClick={generatePdf}>Download PDF Quote</button>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
