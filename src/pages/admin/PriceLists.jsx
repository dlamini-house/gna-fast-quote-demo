import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import AdminLayout from '../../components/AdminLayout'
import { useAppState, currentAdmin } from '../../data/store'
import { db } from '../../data/db'
import { SUPPLIERS } from '../../data/suppliers'
import { CATEGORY_NAMES, getDefaultPriceList } from '../../data/supplierPriceLists'

// Every supplier gets its own price-list record, keyed by its slug in
// data/suppliers.js — the same slug New Quote uses to look the list up.

// GNA now sends every supplier the same standard "Supplier Price Request"
// workbook: one "Supplier Price Form" sheet, items grouped by a Category
// column, with the product code in "Supplier SKU / Code" and pricing in
// "PRICE EX VAT" / "PRICE INCL VAT". We scan for that header row (by column
// name, not position), so a slightly different export of the same template
// still parses, and group the preview by each row's Category value.
function parseStandardTemplate(workbook) {
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: false })

    const headerIndex = rows.findIndex((row) =>
      row.some((cell) => String(cell || '').trim().toLowerCase().includes('supplier sku'))
    )
    if (headerIndex === -1) continue

    const header = rows[headerIndex].map((h) => String(h || '').trim().toLowerCase())
    const categoryCol = header.indexOf('category')
    const materialCol = header.findIndex((h) => h.startsWith('material'))
    const unitCol = header.indexOf('unit')
    const codeCol = header.findIndex((h) => h.includes('supplier sku'))
    const priceCol = header.findIndex((h) => h.includes('price ex vat'))
    const vatCol = header.findIndex((h) => h.includes('price incl vat'))

    const byCategory = {}
    const flatItems = []
    let totalItems = 0

    for (let i = headerIndex + 1; i < rows.length; i++) {
      const row = rows[i]
      const code = codeCol >= 0 ? row[codeCol] : null
      if (code === null || code === undefined || String(code).trim() === '') continue
      const price = priceCol >= 0 ? Number(row[priceCol]) : NaN
      if (Number.isNaN(price)) continue

      const category = categoryCol >= 0 ? String(row[categoryCol] || '').trim() || 'Uncategorised' : 'Uncategorised'
      const item = {
        code: String(code).trim(),
        description: materialCol >= 0 ? String(row[materialCol] || '').trim() : '',
        quantity: null,
        unit: unitCol >= 0 ? String(row[unitCol] || '').trim() : '',
        price,
        priceInclVat: vatCol >= 0 ? Number(row[vatCol]) || null : null
      }
      if (!byCategory[category]) byCategory[category] = []
      byCategory[category].push(item)
      flatItems.push({ ...item, category })
      totalItems += 1
    }

    if (totalItems > 0) {
      const categories = Object.entries(byCategory).map(([category, items]) => ({ category, items }))
      return { categories, flatItems, totalItems }
    }
  }
  return null
}

// Older-style template, kept for backward compatibility: one sheet per
// category, columns Product Code, Description, Quantity, Un, Price, Incl VAT.
function parseLegacyTemplate(workbook) {
  const categories = []
  let totalItems = 0
  const flatItems = []

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: false })

    const headerIndex = rows.findIndex(
      (row) => row.some((cell) => String(cell || '').trim().toLowerCase() === 'product code')
    )
    if (headerIndex === -1) return

    const header = rows[headerIndex].map((h) => String(h || '').trim().toLowerCase())
    const col = (name) => header.indexOf(name)
    const codeCol = col('product code')
    const descCol = col('description')
    const qtyCol = col('quantity')
    const unitCol = col('un')
    const priceCol = col('price')
    const vatCol = col('incl vat')

    const items = []
    for (let i = headerIndex + 1; i < rows.length; i++) {
      const row = rows[i]
      const code = row[codeCol]
      if (code === null || code === undefined || String(code).trim() === '') continue
      const price = Number(row[priceCol])
      if (Number.isNaN(price)) continue
      items.push({
        code: String(code).trim(),
        description: descCol >= 0 ? String(row[descCol] || '').trim() : '',
        quantity: qtyCol >= 0 ? row[qtyCol] : null,
        unit: unitCol >= 0 ? String(row[unitCol] || '').trim() : '',
        price,
        priceInclVat: vatCol >= 0 ? Number(row[vatCol]) || null : null
      })
    }

    if (items.length) {
      categories.push({ category: sheetName.trim(), items })
      items.forEach((it) => flatItems.push({ ...it, category: sheetName.trim() }))
      totalItems += items.length
    }
  })

  return { categories, flatItems, totalItems }
}

// Current GnA Fast Quote supplier workbook: one tab per category ("01 Building
// & Masonry" … "14 Labour & Services"), header row starting "Line No.", price in
// "Unit Price excl. VAT (R)". Item codes are "<tab number>-<line number>" (e.g.
// 01-02), the same codes the quote's plan take-off uses, so an uploaded list
// replaces the built-in rates line for line. Blank-price rows are skipped.
function parseSupplierWorkbook(workbook) {
  const categories = []
  const flatItems = []
  workbook.SheetNames.forEach((sheetName) => {
    const num = sheetName.trim().slice(0, 2)
    if (!/^\d\d$/.test(num)) return
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: false })
    const headerIndex = rows.findIndex((r) => String(r[0] || '').trim().toLowerCase() === 'line no.')
    if (headerIndex === -1) return
    const header = rows[headerIndex].map((h) => String(h || '').trim().toLowerCase())
    const col = (needle) => header.findIndex((h) => h.includes(needle))
    const descCol = col('material')
    const specCol = col('specification')
    const unitCol = header.indexOf('unit')
    const brandCol = col('brand')
    const exCol = col('excl. vat')
    const inclCol = col('incl. vat')
    const vatCol = header.indexOf('vat %')
    const category = CATEGORY_NAMES.find((n) => n.startsWith(num)) || sheetName.trim()
    const items = []
    for (let i = headerIndex + 1; i < rows.length; i++) {
      const row = rows[i]
      const line = Number(row[0])
      if (!Number.isFinite(line) || row[0] === null) continue
      let price = exCol >= 0 ? parseFloat(row[exCol]) : NaN
      const vat = vatCol >= 0 && Number.isFinite(Number(row[vatCol])) ? Number(row[vatCol]) : 0.15
      if (!Number.isFinite(price) && inclCol >= 0 && Number.isFinite(parseFloat(row[inclCol]))) price = parseFloat(row[inclCol]) / (1 + vat)
      if (!Number.isFinite(price)) continue
      items.push({
        code: `${num}-${String(line).padStart(2, '0')}`,
        description: String(row[descCol] || '').trim(),
        quantity: null,
        unit: unitCol >= 0 ? String(row[unitCol] || '').trim() : '',
        price,
        priceInclVat: Math.round(price * (1 + vat) * 100) / 100,
        spec: specCol >= 0 ? String(row[specCol] || '').trim() : '',
        brand: brandCol >= 0 ? String(row[brandCol] || '').trim() : ''
      })
    }
    if (items.length) {
      categories.push({ category, items })
      items.forEach((it) => flatItems.push({ ...it, category }))
    }
  })
  return flatItems.length ? { categories, flatItems, totalItems: flatItems.length } : null
}

function parseWorkbook(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  return parseSupplierWorkbook(workbook) || parseStandardTemplate(workbook) || parseLegacyTemplate(workbook)
}

export default function PriceLists() {
  const [state] = useAppState()
  const admin = currentAdmin(state)
  const [supplier, setSupplier] = useState(SUPPLIERS[0])
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploaded, setUploaded] = useState({}) // slug -> true once that supplier has a saved list
  const [pending, setPending] = useState(null) // parsed-but-not-saved upload, awaiting confirmation
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  // Which suppliers already have a list, for the status badges on the left.
  useEffect(() => {
    Promise.all(SUPPLIERS.map((s) => db.get('priceLists', s.slug).then((r) => [s.slug, !!r]))).then((pairs) =>
      setUploaded(Object.fromEntries(pairs))
    )
  }, [])

  // Switching supplier loads that supplier's own list and clears any
  // half-finished upload from the previous one.
  useEffect(() => {
    setLoading(true)
    setPending(null)
    setError('')
    setSaved(false)
    db.get('priceLists', supplier.slug).then((record) => {
      setCurrent(record)
      setLoading(false)
    })
  }, [supplier.slug])

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setSaved(false)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = parseWorkbook(reader.result)
        if (parsed.totalItems === 0) {
          setError('No pricing rows found — check the file is GNA\u2019s standard Supplier Price Request template with a "Supplier SKU / Code" and "PRICE EX VAT" column filled in.')
          return
        }
        setPending({ ...parsed, fileName: file.name })
      } catch (err) {
        setError('Could not read that file. Make sure it’s a valid .xlsx spreadsheet.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  async function confirmSave() {
    if (!pending) return
    const record = {
      supplier: supplier.name,
      fileName: pending.fileName,
      uploadedAt: new Date().toISOString(),
      uploadedBy: admin?.email || 'unknown admin',
      categories: pending.categories,
      items: pending.flatItems,
      totalItems: pending.totalItems
    }
    const saved = await db.set('priceLists', supplier.slug, record)
    setCurrent(saved)
    setUploaded((u) => ({ ...u, [supplier.slug]: true }))
    setPending(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <AdminLayout
      title="Price Lists"
      subtitle="Upload and manage the material price lists that quotes are calculated from."
    >
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Suppliers</h2>
          <div className="space-y-2">
            {SUPPLIERS.map((s) => {
              const isSelected = s.slug === supplier.slug
              return (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => setSupplier(s)}
                  className={`w-full flex items-center gap-2.5 border rounded-lg px-3 py-2.5 text-left transition-colors ${
                    isSelected ? 'border-brand-blue bg-blue-50' : 'border-gray-200 hover:border-brand-blue'
                  }`}
                >
                  <span className="h-8 w-8 shrink-0 rounded bg-white border border-gray-100 flex items-center justify-center">
                    <img src={s.src} alt="" className="max-h-6 max-w-[26px] object-contain" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-medium text-sm leading-tight">{s.name}</span>
                    <span className={`block text-[11px] ${uploaded[s.slug] ? 'text-brand-green' : 'text-gray-400'}`}>
                      {uploaded[s.slug] ? '\u2713 Price list uploaded' : 'Using built-in demo list'}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-base font-semibold mb-1">{supplier.name} price list</h2>
            {loading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : current ? (
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="text-gray-400">File:</span> <strong>{current.fileName}</strong>
                </p>
                <p>
                  <span className="text-gray-400">Uploaded:</span>{' '}
                  {new Date(current.uploadedAt).toLocaleString('en-ZA')} by {current.uploadedBy}
                </p>
                <p>
                  <span className="text-gray-400">Items loaded:</span> {current.totalItems} across{' '}
                  {current.categories.length} categories
                </p>
                <p className="text-xs text-brand-green mt-2">
                  &#10003; New quotes automatically use these prices wherever a material's product
                  code matches.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No price list uploaded yet for {supplier.name} — quotes for this supplier use the built-in demo price list ({getDefaultPriceList(supplier.slug).totalItems} items across {getDefaultPriceList(supplier.slug).categories.length} categories) until you upload one.
              </p>
            )}
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold mb-2">
              {current ? `Replace the ${supplier.name} price list` : `Upload the ${supplier.name} price list`}
            </h2>
            <p className="text-xs text-gray-400 mb-3">
              .xlsx file in GnA's supplier price-list format — one tab per category
              (01 Building & Masonry … 14 Labour & Services), priced in the "Unit Price excl. VAT (R)"
              column. Lines with a blank price are skipped; the older single-sheet template still works too.
            </p>
            <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-brand-blue transition-colors">
              <input type="file" accept=".xlsx" className="hidden" onChange={handleFile} />
              <div className="text-brand-blue text-xl mb-1">&#8613;</div>
              <p className="text-sm text-gray-600">Drag and drop the spreadsheet here or click to browse</p>
            </label>
            {error && <p className="text-sm text-brand-red mt-3">{error}</p>}
            {saved && <p className="text-sm text-brand-green mt-3">Price list saved &#10003;</p>}
          </div>

          {pending && (
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Preview: {pending.fileName}</h2>
                <span className="text-xs text-gray-500">{pending.totalItems} items found</span>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {pending.categories.map((cat) => (
                  <div key={cat.category}>
                    <p className="text-xs font-semibold text-gray-600 mb-1.5">
                      {cat.category} <span className="text-gray-400 font-normal">({cat.items.length} items)</span>
                    </p>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-gray-400 border-b">
                          <th className="py-1 pr-2 font-medium">Code</th>
                          <th className="py-1 pr-2 font-medium">Description</th>
                          <th className="py-1 font-medium text-right">Price (excl. VAT)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.items.slice(0, 4).map((it, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="py-1 pr-2 text-gray-500">{it.code}</td>
                            <td className="py-1 pr-2">{it.description}</td>
                            <td className="py-1 text-right">R {it.price.toFixed(2)}</td>
                          </tr>
                        ))}
                        {cat.items.length > 4 && (
                          <tr>
                            <td colSpan={3} className="py-1 text-gray-400">
                              + {cat.items.length - 4} more…
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button className="btn-secondary flex-1" onClick={() => setPending(null)}>Cancel</button>
                <button className="btn-primary flex-1" onClick={confirmSave}>
                  {current ? 'Replace current price list' : 'Save as current price list'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
