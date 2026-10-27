import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { getDefaultPriceList, cosaveRatesFromItems, AVERAGE_SLUG } from '../data/supplierPriceLists'
import { DEMO_PLAN, buildTakeoff } from '../data/demoPlan'
import { createQuotePdf, quotePdfFileName, createBoqPdf, boqPdfFileName } from '../data/quotePdf'
import { buildScope } from '../data/quoteScope'

const STEPS = [
  'Select Supplier',
  'Upload Plan',
  'Review Extracted Info',
  'Add Items Not on Plan',
  'Consumables (Optional)',
  'Pricing Engine',
  'Add Labour Rate',
  'Review Quote',
  'Deposit & Download'
]

// Categories a plan can never tell you about — the contractor has to choose
// these themselves rather than having them auto-extracted. Surfaced as
// quick filters on the "Add Items Not on Plan" step.
const SUGGESTED_EXTRA_CATEGORIES = []

// Not a supplier: the quote uses the average of all six suppliers' prices.
const AVERAGE_OPTION = { slug: AVERAGE_SLUG, name: 'Average estimate' }
const COSAVE_SLUG = 'cosave-powerbuild'
// Labour & Services (price-list category 14) has its own block on the labour step.
const isLabourCategory = (name) => String(name).includes('Labour & Services')

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
  const supplierInfo = supplier === AVERAGE_SLUG ? AVERAGE_OPTION : SUPPLIERS.find((s) => s.slug === supplier) || null

  // Step 1
  const [projectName, setProjectName] = useState('')
  const [clientName, setClientName] = useState('')
  const [siteAddress, setSiteAddress] = useState('')
  const [planFileName, setPlanFileName] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [wasExtracted, setWasExtracted] = useState(false)
  // Plan take-off (what the CAD reader pulled from the plan) + plan-derived labour quantities
  const [takeoff, setTakeoff] = useState(null)
  const [labourBasis, setLabourBasis] = useState(Object.fromEntries(LABOUR_TRADES.map((t) => [t.id, t.basis])))

  // Step 1: extracted material line items (qty editable, rate fixed from price list)
  const [materials, setMaterials] = useState(MOCK_EXTRACTED_MATERIALS.map((m) => ({ ...m })))
  const [priceListInfo, setPriceListInfo] = useState(null) // uploaded BUCO price list metadata, if any
  const [priceOverrides, setPriceOverrides] = useState(null) // code -> { price, description } from that upload
  const [ratesOnly, setRatesOnly] = useState(false) // Cosave: plan items with no Cosave equivalent stay unpriced (R0)
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
    setExtraMaterials([])
    setExtraQtyDrafts({})
    setConsumableQtys({})
    db.get('priceLists', supplier).then((uploaded) => {
      // An admin-uploaded list wins; otherwise use the built-in demo list so
      // every supplier always has real categories, items and prices.
      const builtIn = getDefaultPriceList(supplier)
      // An upload only replaces the built-in list if it is newer than it.
      const useUpload = uploaded?.items?.length && new Date(uploaded.uploadedAt) > new Date(builtIn.uploadedAt)
      const record = useUpload ? uploaded : builtIn
      const map = {}
      if (supplier === COSAVE_SLUG) {
        // Cosave has its own catalogue: plan items are priced only where Cosave has an equivalent.
        const rates = record.rates || cosaveRatesFromItems(record.items)
        Object.keys(rates).forEach((code) => { map[code] = { price: rates[code] } })
        setRatesOnly(true)
      } else {
        record.items.forEach((it) => {
          if (it.code) map[String(it.code)] = it
        })
        setRatesOnly(false)
      }
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
  const unpricedCount = materials.filter((m) => m.noPrice && !(m.rate > 0) && (parseFloat(m.qty) || 0) > 0).length
  // Step 3 browses every category except consumables (which has its own step).
  const extraCatalog = priceCatalog.filter((c) => !isConsumablesCategory(c.category) && !isLabourCategory(c.category))

  function withPriceListRates(items) {
    if (!priceOverrides) return items
    return items.map((m) => {
      const match = priceOverrides[String(m.code)]
      // The price list's wording is generic ("Internal doors"), the plan's
      // line is specific ("Door Hardboard Hollow Core 813x2032mm") — keep the
      // specific description and take only the rate from the list.
      if (match) return { ...m, rate: match.price, noPrice: false }
      // Cosave: no like-for-like item, so leave it unpriced for the contractor to fill in.
      if (ratesOnly) return { ...m, rate: 0, noPrice: true, rateInput: '' }
      return m.noPrice ? { ...m, noPrice: false } : m
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
    Object.fromEntries(LABOUR_FIXED.filter((f) => f.id !== 'supervision').map((f) => [f.id, String(f.amount)]))
  )
  // Site supervision is days × rate per day (example values — contractor enters their own)
  const [supervisionDays, setSupervisionDays] = useState('10')
  const [supervisionRate, setSupervisionRate] = useState('500')

  // Labour & services picked from the supplier price list (category 14): qty per item,
  // plus an optional rate override (defaults to the list price).
  const [labourItemQtys, setLabourItemQtys] = useState({})
  const [labourItemRates, setLabourItemRates] = useState({})

  // Deposit (optional): off by default; a % of the quote total or a rand amount
  const [depositEnabled, setDepositEnabled] = useState(false)
  const [depositMode, setDepositMode] = useState('percent') // 'percent' | 'amount'
  const [depositPercent, setDepositPercent] = useState('50')
  const [depositAmountInput, setDepositAmountInput] = useState('')

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
      const result = buildTakeoff(DEMO_PLAN)
      setTakeoff(result)
      setMaterials(withPriceListRates(result.lines.map((m) => ({ ...m }))))
      setLabourBasis(result.labourBasis)
      // Pre-fill project details from the title block of the plan
      setProjectName((v) => v || `${DEMO_PLAN.title} – Stand ${DEMO_PLAN.stand}`)
      setClientName((v) => v || DEMO_PLAN.owner)
      setSiteAddress((v) => v || `Stand ${DEMO_PLAN.stand}`)
      setExtracting(false)
      setWasExtracted(true)
      setStep(2)
    }, 2200)
  }

  function updateMaterialRate(id, value) {
    setMaterials((items) => items.map((it) => (it.id === id ? { ...it, rate: parseFloat(value) || 0, rateInput: value } : it)))
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
    const basis = labourBasis[t.id] ?? t.basis
    return { ...t, basis, unit, rate, cost: rate * (parseFloat(basis) || 0) }
  })
  const fixedLines = LABOUR_FIXED.filter((f) => f.id !== 'supervision').map((f) => ({ ...f, amount: parseFloat(fixedLabour[f.id]) || 0 }))
  const labourCatalog = priceCatalog.find((c) => isLabourCategory(c.category)) || null
  const labourItemLines = (labourCatalog?.items || [])
    .map((it) => {
      const qty = parseFloat(labourItemQtys[it.code]) || 0
      const rate = labourItemRates[it.code] !== undefined ? parseFloat(labourItemRates[it.code]) || 0 : it.price
      return { ...it, qty, rate, cost: qty * rate }
    })
    .filter((it) => it.qty > 0)
  const supervisionCost = (parseFloat(supervisionDays) || 0) * (parseFloat(supervisionRate) || 0)
  const customLabourLines = customLabour.map((r) => ({
    ...r,
    cost: (parseFloat(r.rate) || 0) * (parseFloat(r.qty) || 0)
  }))
  const labourCost =
    labourLines.reduce((sum, l) => sum + l.cost, 0) +
    supervisionCost +
    labourItemLines.reduce((sum, l) => sum + l.cost, 0) +
    fixedLines.reduce((sum, f) => sum + f.amount, 0) +
    customLabourLines.reduce((sum, l) => sum + l.cost, 0)

  const transport = parseFloat(transportAllowance) || 0
  const subtotal = materialCost + labourCost + transport
  const markupAmount = subtotal * ((parseFloat(markup) || 0) / 100)
  const markedUp = subtotal + markupAmount
  const vatAmount = markedUp * ((parseFloat(vatPercent) || 0) / 100)
  const grandTotal = markedUp + vatAmount

  // Deposit: either a % of the grand total or the contractor's own rand value, capped at the total
  const depositRaw = !depositEnabled
    ? 0
    : depositMode === 'percent'
      ? grandTotal * ((parseFloat(depositPercent) || 0) / 100)
      : parseFloat(depositAmountInput) || 0
  const depositValue = Math.min(Math.max(depositRaw, 0), grandTotal)
  const depositInfo =
    depositEnabled && depositValue > 0
      ? {
          amount: depositValue,
          percent: depositMode === 'percent' ? parseFloat(depositPercent) || 0 : null,
          balance: grandTotal - depositValue
        }
      : null

  // Fixed for the life of this quote (numbered after the highest existing reference, so deleting a quote never repeats a number).
  const [reference] = useState(() => {
    const nums = state.quotes.map((q) => parseInt(String(q.reference || '').replace(/\D/g, ''), 10)).filter((n) => Number.isFinite(n))
    return `GNA-DEMO-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0')}`
  })

  const quotedBy = { company: user?.company, address: user?.companyAddress, email: user?.email }

  // Client quote: scope of work + ONE total. No rates, no per-trade prices, no mark-up.
  function buildQuoteData() {
    return {
      reference,
      dateLabel: new Date().toLocaleDateString(),
      projectName,
      clientName,
      siteAddress,
      scope: buildScope({
        materials,
        extraMaterials,
        consumableLines,
        labourLines,
        labourItemLines,
        customLabourLines,
        supervisionDays,
        fixedLines
      }),
      subtotal: markedUp,
      vatLabel: `VAT (${vatPercent}%)`,
      vatAmount,
      grandTotal,
      deposit: depositInfo,
      quotedBy
    }
  }

  // BOQ: every material line at the supplier's rate. The mark-up is never applied or shown.
  function buildBoqData() {
    const groups = []
    allMaterials.forEach((m) => {
      const qty = parseFloat(m.qty) || 0
      if (qty <= 0) return
      const title = categoryLabel(m.source)
      let g = groups.find((x) => x.title === title)
      if (!g) groups.push((g = { title, rows: [] }))
      g.rows.push({
        code: m.code,
        description: m.description,
        unit: m.unit || 'each',
        qty,
        rate: m.rate,
        amount: qty * m.rate,
        noPrice: !!m.noPrice
      })
    })
    return {
      reference,
      dateLabel: new Date().toLocaleDateString(),
      projectName,
      clientName,
      siteAddress,
      supplierName: supplierInfo?.name || '',
      groups,
      total: materialCost,
      quotedBy
    }
  }

  async function downloadBoqPreview() {
    const data = buildBoqData()
    const doc = await createBoqPdf(data, user?.logoDataUrl)
    doc.save(boqPdfFileName(data))
  }

  const previewScope = buildScope({ materials, extraMaterials, consumableLines, labourLines, labourItemLines, customLabourLines, supervisionDays, fixedLines })
  const [savedQuoteId, setSavedQuoteId] = useState(null)
  const [downloadedMsg, setDownloadedMsg] = useState('')

  // 'quote' | 'boq' | 'both'. The quote is saved to the Quotes page the first time.
  async function downloadFinal(which) {
    const pdfData = buildQuoteData()
    const boqData = buildBoqData()
    if (which === 'quote' || which === 'both') {
      const doc = await createQuotePdf(pdfData, user?.logoDataUrl)
      doc.save(quotePdfFileName(pdfData))
    }
    if (which === 'boq' || which === 'both') {
      const doc = await createBoqPdf(boqData, user?.logoDataUrl)
      doc.save(boqPdfFileName(boqData))
    }
    if (!savedQuoteId) {
      const newQuote = {
        id: Date.now(),
        reference,
        projectName: projectName || 'Untitled project',
        customerName: clientName,
        siteAddress,
        total: grandTotal,
        deposit: depositInfo ? depositInfo.amount : null,
        status: 'completed',
        createdAt: new Date().toISOString(),
        ownerEmail: user?.email || null,
        ownerCompany: user?.company || null,
        pdfData,
        boqData
      }
      setSavedQuoteId(newQuote.id)
      setState((st) => ({ ...st, quotes: [...st.quotes, newQuote], quotesCreated: Math.max(st.quotesCreated || 0, st.quotes.length) + 1 }))
      db.set('quotes', String(newQuote.id), newQuote)
    }
    setDownloadedMsg(
      which === 'both' ? 'Quote and BOQ downloaded.' : which === 'quote' ? 'Quote downloaded.' : 'BOQ downloaded.'
    )
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
            Choose which supplier's price list this quote's material rates will be pulled from, or pick
            Average estimate below to use the average of all 6 suppliers.
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
          <button
            type="button"
            onClick={() => setSupplier(AVERAGE_SLUG)}
            className={`relative w-full mb-6 border rounded-xl p-4 flex items-center gap-4 text-left transition-colors cursor-pointer ${
              supplier === AVERAGE_SLUG ? 'border-brand-blue bg-blue-50' : 'border-gray-200 hover:border-brand-blue'
            }`}
          >
            <span className="h-12 w-12 shrink-0 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-blue" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                <path d="M2 12h20" strokeDasharray="2 3" />
              </svg>
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold">Average estimate</span>
              <span className="block text-xs text-gray-500">Not sure which supplier yet? Prices are the average across all 6 suppliers.</span>
            </span>
            {supplier === AVERAGE_SLUG && (
              <span className="h-5 w-5 rounded-full bg-brand-blue text-white text-xs flex items-center justify-center">&#10003;</span>
            )}
          </button>
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
        <div className="space-y-6">
          {takeoff && (
            <div className="card">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-lg font-semibold">Plan read: {DEMO_PLAN.title}</h2>
                  <p className="text-xs text-gray-500">
                    Stand {DEMO_PLAN.stand} · Owner {DEMO_PLAN.owner} · Site {DEMO_PLAN.siteArea} m² · {DEMO_PLAN.zoning} · {DEMO_PLAN.sheets} sheets at {DEMO_PLAN.scale}
                  </p>
                </div>
                <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1">
                  Extracted from plan
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  ['Windows', takeoff.metrics.totalWindows, 'Glazing schedule'],
                  ['Doors & gates', takeoff.metrics.totalDoors, 'Door schedule'],
                  ['Total built area', `${DEMO_PLAN.areas.find((a) => a.name === 'Total building area').area} m²`, 'Area schedule'],
                  ['Roof (sloped)', `${DEMO_PLAN.roof.slopedArea} m²`, `${DEMO_PLAN.roof.pitch} pitch, est.`],
                  ['External walls', `${takeoff.metrics.extLen} m`, '220 mm, both floors'],
                  ['Internal walls', `${takeoff.metrics.intLen} m`, '110 mm, both floors'],
                  ['Net wall area', `${takeoff.metrics.netWall.toFixed(0)} m²`, 'after openings'],
                  ['Plumbing fixtures', DEMO_PLAN.fixtures.filter((f) => !/gully|tap/i.test(f.name)).reduce((n, f) => n + f.qty, 0), 'Fixture tags']
                ].map(([label, value, sub]) => (
                  <div key={label} className="border rounded-lg px-3 py-2">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-lg font-semibold">{value}</p>
                    <p className="text-[11px] text-gray-400">{sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <details className="border rounded-lg px-3 py-2" open>
                  <summary className="text-sm font-medium cursor-pointer">Door schedule ({takeoff.metrics.totalDoors})</summary>
                  <table className="w-full text-xs mt-2">
                    <tbody>
                      {DEMO_PLAN.doors.map((d) => (
                        <tr key={d.tag} className="border-t border-gray-100">
                          <td className="py-1 pr-2 font-medium">{d.tag}</td>
                          <td className="py-1 pr-2">×{d.qty}</td>
                          <td className="py-1 pr-2 text-gray-500">{d.w}×{d.h}</td>
                          <td className="py-1 text-gray-600">{d.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
                <details className="border rounded-lg px-3 py-2" open>
                  <summary className="text-sm font-medium cursor-pointer">Glazing schedule ({takeoff.metrics.totalWindows})</summary>
                  <table className="w-full text-xs mt-2">
                    <tbody>
                      {DEMO_PLAN.windows.map((w) => (
                        <tr key={w.tag} className="border-t border-gray-100">
                          <td className="py-1 pr-2 font-medium">{w.tag}</td>
                          <td className="py-1 pr-2">×{w.qty}</td>
                          <td className="py-1 pr-2 text-gray-500">{w.w}×{w.h}</td>
                          <td className="py-1 text-gray-600">{w.fixed ? 'Aluminium fixed panel' : 'Aluminium top-hung + fixed'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
                <details className="border rounded-lg px-3 py-2">
                  <summary className="text-sm font-medium cursor-pointer">Areas &amp; rooms</summary>
                  <table className="w-full text-xs mt-2">
                    <tbody>
                      {DEMO_PLAN.areas.map((a) => (
                        <tr key={a.name} className={`border-t border-gray-100 ${a.total ? 'font-semibold' : ''}`}>
                          <td className="py-1 pr-2">{a.name}</td>
                          <td className="py-1 text-right">{a.area.toFixed(2)} m²</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-500 mt-2">
                    {DEMO_PLAN.rooms.map((r) => `${r.name} ${r.area} m²`).join(' · ')}
                  </p>
                </details>
                <details className="border rounded-lg px-3 py-2">
                  <summary className="text-sm font-medium cursor-pointer">Fixtures, roof &amp; levels</summary>
                  <ul className="text-xs mt-2 space-y-1">
                    {DEMO_PLAN.fixtures.map((f) => (
                      <li key={f.name} className="flex justify-between border-t border-gray-100 pt-1"><span>{f.name}</span><span>×{f.qty}</span></li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">
                    Roof: {DEMO_PLAN.roof.covering}, {DEMO_PLAN.roof.pitch}. Levels: {DEMO_PLAN.levels.map((l) => `${l.name} (${l.floorToFloor} m floor-to-floor)`).join(', ')}.
                  </p>
                </details>
              </div>
              <p className="text-[11px] text-gray-400 mt-3">
                Demo mode: this plan is read from pre-extracted data. Door/window/fixture counts come straight from the
                plan's schedules; wall lengths are measured from the drawing; bricks, cement, roof tiles and similar
                quantities are rule-based estimates (see the Basis column) — adjust any of them below.
              </p>
            </div>
          )}

          <div className="card">
            <h2 className="text-lg font-semibold mb-2">Review extracted info</h2>
            <p className="text-sm text-brand-blue bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-2">
              Every plan element was paired with an item in your price list. Adjust any quantity before continuing.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {priceListInfo ? (
                <>
                  &#10003; Rates are from the <strong>{supplierInfo?.name || priceListInfo.supplier}</strong>{' '}
                  {priceListInfo.isBuiltIn
                    ? 'demo price list.'
                    : `price list uploaded ${new Date(priceListInfo.uploadedAt).toLocaleDateString('en-ZA')}.`}
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
                    <th className="py-2 pr-2 font-medium">Group</th>
                    <th className="py-2 pr-2 font-medium">Code</th>
                    <th className="py-2 pr-2 font-medium">Description</th>
                    <th className="py-2 pr-2 font-medium">Qty</th>
                    <th className="py-2 pr-2 font-medium">Unit</th>
                    <th className="py-2 pr-2 font-medium text-right">Rate</th>
                    <th className="py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m) => (
                    <tr key={m.id} className="border-b border-gray-100 align-top">
                      <td className="py-2 pr-2 text-gray-500">{m.source}</td>
                      <td className="py-2 pr-2 text-gray-500">{m.code}</td>
                      <td className="py-2 pr-2">
                        {m.description}
                        {m.basis && (
                          <span className="block text-[11px] text-gray-400">
                            <span
                              className={`inline-block rounded px-1 mr-1 ${
                                m.basisType === 'schedule' ? 'bg-green-50 text-green-700' : m.basisType === 'measured' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {m.basisType === 'schedule' ? 'From plan' : m.basisType === 'measured' ? 'Measured' : 'Estimated'}
                            </span>
                            {m.basis}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        <input
                          type="number"
                          className="w-20 border rounded px-2 py-1"
                          value={m.qty}
                          onChange={(e) => updateMaterialQty(m.id, e.target.value)}
                        />
                      </td>
                      <td className="py-2 pr-2 text-gray-500">{m.unit}</td>
                      <td className="py-2 pr-2 text-right">
                        {m.noPrice ? (
                          <>
                            <input
                              type="number"
                              min="0"
                              placeholder="Your rate"
                              className="w-24 border border-amber-300 bg-amber-50 rounded px-2 py-1 text-right"
                              value={m.rateInput ?? ''}
                              onChange={(e) => updateMaterialRate(m.id, e.target.value)}
                            />
                            {!(m.rate > 0) && <span className="block text-[11px] text-amber-700">No {supplierInfo?.name || 'supplier'} price</span>}
                          </>
                        ) : (
                          <>R {m.rate.toFixed(2)}</>
                        )}
                      </td>
                      <td className="py-2 text-right font-medium">R {((parseFloat(m.qty) || 0) * m.rate).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {unpricedCount > 0 && (
              <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {unpricedCount} line{unpricedCount === 1 ? '' : 's'} {unpricedCount === 1 ? 'has' : 'have'} no {supplierInfo?.name || 'supplier'} equivalent, so
                {unpricedCount === 1 ? ' it is' : ' they are'} at R 0.00. Enter your own rate in the highlighted box{unpricedCount === 1 ? '' : 'es'}, or choose another supplier or Average estimate.
              </p>
            )}

            {takeoff && (
              <div className="mt-5 border border-amber-200 bg-amber-50 rounded-lg px-4 py-3">
                <p className="text-sm font-medium text-amber-800 mb-1">On the plan, but not in the price list</p>
                <ul className="text-xs text-amber-800 space-y-0.5 list-disc pl-4">
                  {takeoff.unmatched.map((u) => (
                    <li key={u.item}><strong>{u.item}</strong> — {u.note}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button className="btn-primary" onClick={() => setStep(3)}>Next: Add Items Not on Plan</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Add Items Not on Plan */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-1">Add items not on the plan</h2>
            <p className="text-sm text-gray-500 mb-4">
              Some items never show up on a drawing.
              Pick any item from the {supplierInfo?.name || 'supplier'} price list and add it to this
              quote. Consumables have their own step next, and labour &amp; services are added on the labour step.
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
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={downloadBoqPreview}>Download BOQ (PDF)</button>
                <button className="btn-primary" onClick={() => setStep(5)}>Next: Pricing Engine</button>
              </div>
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
            <button className="btn-secondary w-full mt-3" onClick={downloadBoqPreview}>Download BOQ (PDF)</button>
          </div>
        </div>
      )}

      {/* Step 6: Add Labour Rate */}
      {step === 6 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-1">Contractor labour rates</h2>
            <p className="text-sm text-gray-500 mb-3">Labour is contractor-controlled and added after material pricing.</p>
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
              <strong>Please enter your own labour costs.</strong> The rates, days and amounts pre-filled below are
              examples only so you can see how the quote is calculated — replace them with your own figures before continuing.
            </p>
            <div className="space-y-3">
              {LABOUR_TRADES.map((t) => t.id === 'general' ? (
                <div key={t.id} className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-5 text-sm">
                    {t.label}
                    <span className="block text-xs text-gray-400">Total days × rate per day</span>
                  </span>
                  <label className="col-span-3 text-[11px] text-gray-400">
                    Days
                    <input
                      type="number"
                      min="0"
                      className="w-full border rounded-lg px-2 py-1.5 text-sm text-gray-900"
                      value={labourBasis.general}
                      onChange={(e) => setLabourBasis((b) => ({ ...b, general: e.target.value }))}
                    />
                  </label>
                  <label className="col-span-4 text-[11px] text-gray-400">
                    Rate per day (R)
                    <input
                      type="number"
                      min="0"
                      className="w-full border rounded-lg px-2 py-1.5 text-sm text-gray-900"
                      value={labourRates.general.rate}
                      onChange={(e) => updateLabourRate('general', 'rate', e.target.value)}
                    />
                  </label>
                </div>
              ) : (
                <div key={t.id} className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-5 text-sm">
                    {t.label}
                    <span className="block text-xs text-gray-400">
                      Plan quantity: {labourBasis[t.id]} {UNIT_OPTIONS.find((u) => u.id === t.unit)?.label.replace('per ', '') || ''}
                    </span>
                  </span>
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
              <div className="grid grid-cols-12 gap-2 items-center">
                <span className="col-span-5 text-sm">
                  Site Supervision
                  <span className="block text-xs text-gray-400">Total days × rate per day</span>
                </span>
                <label className="col-span-3 text-[11px] text-gray-400">
                  Days
                  <input
                    type="number"
                    min="0"
                    className="w-full border rounded-lg px-2 py-1.5 text-sm text-gray-900"
                    value={supervisionDays}
                    onChange={(e) => setSupervisionDays(e.target.value)}
                  />
                </label>
                <label className="col-span-4 text-[11px] text-gray-400">
                  Rate per day (R)
                  <input
                    type="number"
                    min="0"
                    className="w-full border rounded-lg px-2 py-1.5 text-sm text-gray-900"
                    value={supervisionRate}
                    onChange={(e) => setSupervisionRate(e.target.value)}
                  />
                </label>
              </div>
              {LABOUR_FIXED.filter((f) => f.id !== 'supervision').map((f) => (
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
              {(labourCatalog?.items || []).map((it) => (
                <div key={it.code} className="grid grid-cols-12 gap-2 items-center">
                  <span className="col-span-5 text-sm leading-tight">
                    {it.description}
                    <span className="block text-xs text-gray-400">Qty × rate per {it.unit}</span>
                  </span>
                  <label className="col-span-3 text-[11px] text-gray-400">
                    Qty
                    <input
                      type="number"
                      min="0"
                      className="w-full border rounded-lg px-2 py-1.5 text-sm text-gray-900"
                      placeholder="0"
                      value={labourItemQtys[it.code] || ''}
                      onChange={(e) => setLabourItemQtys((q) => ({ ...q, [it.code]: e.target.value }))}
                    />
                  </label>
                  <label className="col-span-4 text-[11px] text-gray-400">
                    Rate (R)
                    <input
                      type="number"
                      min="0"
                      className="w-full border rounded-lg px-2 py-1.5 text-sm text-gray-900"
                      value={labourItemRates[it.code] !== undefined ? labourItemRates[it.code] : it.price}
                      onChange={(e) => setLabourItemRates((r) => ({ ...r, [it.code]: e.target.value }))}
                    />
                  </label>
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
              <button className="btn-primary" onClick={() => setStep(7)}>Next: Review Quote</button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Live labour summary</h2>
            <div className="text-sm space-y-2">
              {labourLines.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span className="text-gray-500">{l.id === 'general' ? `${l.label} (${parseFloat(l.basis) || 0} days)` : l.label}</span>
                  <span>R {l.cost.toFixed(2)}</span>
                </div>
              ))}
              {customLabourLines.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span className="text-gray-500">{l.label || 'Custom line item'}</span>
                  <span>R {l.cost.toFixed(2)}</span>
                </div>
              ))}
              {labourItemLines.map((l) => (
                <div key={l.code} className="flex justify-between gap-3">
                  <span className="text-gray-500">{l.description} ({l.qty} {l.unit})</span>
                  <span className="whitespace-nowrap">R {l.cost.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-gray-500">Site Supervision ({parseFloat(supervisionDays) || 0} days)</span>
                <span>R {supervisionCost.toFixed(2)}</span>
              </div>
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

      {/* Step 7: Review quote */}
      {step === 7 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="card">
            <h2 className="text-lg font-semibold mb-1">Your costing</h2>
            <p className="text-xs text-gray-500 mb-4">For you only. The client's quote shows the scope of work and one total — never these lines or your mark-up.</p>
            <div className="text-sm space-y-2 mb-4">
              <div className="flex justify-between"><span className="text-gray-500">Materials (supplier rates)</span><span>R {materialCost.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Labour</span><span>R {labourCost.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Transport / Location Allowance</span><span>R {transport.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Mark-up ({markup}%)</span><span>R {markupAmount.toFixed(2)}</span></div>
              <div className="flex justify-between border-t pt-2"><span className="text-gray-500">Quote total (excl. VAT)</span><span>R {markedUp.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">VAT ({vatPercent}%)</span><span>R {vatAmount.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-base border-t pt-2 text-brand-green">
                <span>Grand Total</span><span>R {grandTotal.toFixed(2)}</span>
              </div>
            </div>
            {unpricedCount > 0 && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                {unpricedCount} material line{unpricedCount === 1 ? ' is' : 's are'} still at R 0.00 (no {supplierInfo?.name} price). Go back to Review Extracted Info to enter your own rate.
              </p>
            )}
            <p className="text-xs text-brand-blue bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-4">
              Generating this quote would deduct 1 credit from your account.
            </p>
            <div className="flex justify-between">
              <button className="btn-secondary" onClick={() => setStep(6)}>Back</button>
              <button className="btn-primary" onClick={() => setShowPreview(true)}>Open Quote Preview</button>
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
                  <p>Valid for 30 days</p>
                  <p className="text-gray-400 mt-1.5">Prepared by</p>
                  <p className="font-semibold text-gray-700">{user?.company || 'Independent Contractor'}</p>
                  {user?.companyAddress && <p className="max-w-[180px]">{user.companyAddress}</p>}
                  {user?.email && <p>{user.email}</p>}
                </div>
              </div>
              <h4 className="text-sm font-semibold border-b pb-1 mb-2">Scope of work</h4>
              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto pr-1">
                {previewScope.map((sc, i) => (
                  <div key={sc.trade}>
                    <p className="text-sm font-semibold">{i + 1}. {sc.trade}</p>
                    <p className="text-xs text-gray-600">{sc.summary}</p>
                    {sc.includes.length > 0 && <p className="text-[11px] text-gray-400">Includes: {sc.includes.join(', ')}.</p>}
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 text-sm space-y-1 mb-4">
                <div className="flex justify-between"><span className="text-gray-600">Total for the work described (excl. VAT)</span><span>R {markedUp.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">VAT ({vatPercent}%)</span><span>R {vatAmount.toFixed(2)}</span></div>
                <p className="flex justify-between text-lg font-bold text-brand-red pt-1"><span>Total quote (incl. VAT)</span><span>R {grandTotal.toFixed(2)}</span></p>
              </div>
              <p className="text-[11px] text-gray-400 mb-4">
                The PDF also carries assumptions, exclusions, 30-day validity terms and a client acceptance block.
              </p>
              <button className="btn-primary w-full" onClick={() => setStep(8)}>Next: Deposit &amp; Download</button>
            </div>
          )}
        </div>
      )}

      {/* Step 8: Deposit & PDF */}
      {step === 8 && (
        <div className="card max-w-xl">
          <h2 className="text-lg font-semibold mb-1">Deposit (optional)</h2>
          <p className="text-sm text-gray-500 mb-4">
            Ask the client for a deposit before work starts. Skip this if you don't want one — the quote will
            then show the grand total only.
          </p>
          <label className="flex items-center gap-2 text-sm mb-4">
            <input type="checkbox" checked={depositEnabled} onChange={(e) => setDepositEnabled(e.target.checked)} />
            Include a deposit on this quote
          </label>

          {depositEnabled && (
            <div className="border rounded-lg p-4 mb-4 space-y-3">
              <div className="flex gap-2">
                {[['percent', '% of total quote'], ['amount', 'Own amount (R)']].map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDepositMode(id)}
                    className={`text-sm px-3 py-1.5 rounded-full border ${
                      depositMode === id ? 'bg-brand-blue text-white border-brand-blue' : 'border-gray-300 text-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {depositMode === 'percent' ? (
                <label className="block text-xs text-gray-500">
                  Deposit percentage
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 mt-1"
                    value={depositPercent}
                    onChange={(e) => setDepositPercent(e.target.value)}
                  />
                </label>
              ) : (
                <label className="block text-xs text-gray-500">
                  Deposit amount (R)
                  <input
                    type="number"
                    min="0"
                    className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 mt-1"
                    placeholder="e.g. 50000"
                    value={depositAmountInput}
                    onChange={(e) => setDepositAmountInput(e.target.value)}
                  />
                </label>
              )}
              {depositRaw > grandTotal && (
                <p className="text-xs text-amber-700">The deposit can't be more than the quote total — it has been capped at R {grandTotal.toFixed(2)}.</p>
              )}
            </div>
          )}

          <div className="text-sm space-y-2 mb-5">
            <div className="flex justify-between"><span className="text-gray-500">Quote total (incl. VAT)</span><span>R {grandTotal.toFixed(2)}</span></div>
            {depositInfo && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Deposit{depositInfo.percent != null ? ` (${depositInfo.percent}%)` : ''}</span>
                  <span>R {depositInfo.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Balance due after deposit</span><span>R {depositInfo.balance.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-1">What would you like to download?</h3>
            <p className="text-xs text-gray-500 mb-3">
              The quote is the client's scope of work with one total. The BOQ lists every material with its quantity and supplier rate. Your mark-up is on neither.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <button className="btn-primary" onClick={() => downloadFinal('quote')}>Quote</button>
              <button className="btn-primary" onClick={() => downloadFinal('boq')}>BOQ</button>
              <button className="btn-primary" onClick={() => downloadFinal('both')}>Both</button>
            </div>
            {downloadedMsg && (
              <p className="text-xs text-brand-green bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                {downloadedMsg} This quote is saved on your Quotes page.
              </p>
            )}
          </div>
          <div className="flex justify-between">
            <button className="btn-secondary" onClick={() => setStep(7)}>Back</button>
            {savedQuoteId && <button className="btn-secondary" onClick={() => navigate('/quotes')}>Go to Quotes</button>}
          </div>
        </div>
      )}
    </Layout>
  )
}
