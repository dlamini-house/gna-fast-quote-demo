import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import AdminLayout from '../../components/AdminLayout'
import { useAppState, currentAdmin } from '../../data/store'
import { db } from '../../data/db'

// The only supplier wired up for now. The data shape below (a record per
// supplier, keyed by slug) is deliberately ready for more — adding Leroy
// Merlin or Build it later is a new row in this list plus its own upload,
// not a schema change.
const SUPPLIERS = [{ slug: 'buco', name: 'BUCO' }]

// Every sheet in the client's template uses the same columns starting a
// few blank rows in: Product Code, Description, Quantity, Un, Price, Incl VAT.
// We scan for that header row rather than assuming a fixed row number, so a
// slightly different export still parses.
function parseWorkbook(arrayBuffer) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
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

export default function PriceLists() {
  const [state] = useAppState()
  const admin = currentAdmin(state)
  const [supplier] = useState(SUPPLIERS[0])
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(null) // parsed-but-not-saved upload, awaiting confirmation
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
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
          setError('No pricing rows found — check the file has a "Product Code" column header on each sheet.')
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
    setPending(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <AdminLayout
      title="Price Lists"
      subtitle="Upload and manage the material price lists that quotes are calculated from."
    >
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-start">
        <div className="card">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Suppliers</h2>
          <div className="space-y-2">
            {SUPPLIERS.map((s) => (
              <div
                key={s.slug}
                className="w-full flex items-center justify-between border rounded-lg px-3 py-2.5 border-brand-blue bg-blue-50"
              >
                <span className="font-medium text-sm">{s.name}</span>
                <span className="badge badge-verified">Active</span>
              </div>
            ))}
            <div className="w-full flex items-center justify-between border border-dashed rounded-lg px-3 py-2.5 text-gray-400">
              <span className="text-sm">More suppliers</span>
              <span className="text-xs">Coming soon</span>
            </div>
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
                No price list uploaded yet — quotes are using the built-in reference pricing.
              </p>
            )}
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold mb-2">
              {current ? `Replace the ${supplier.name} price list` : `Upload the ${supplier.name} price list`}
            </h2>
            <p className="text-xs text-gray-400 mb-3">
              .xlsx file, one sheet per category, each sheet needs a "Product Code" header row
              (matches the template GNA already uses).
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
