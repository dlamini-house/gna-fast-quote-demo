// Turns the quote's confirmed quantities into a plain-English "scope of work"
// for the client. It lists WHAT the contractor will do, trade by trade, and
// never shows a price, rate or mark-up.
const GROUP_SCOPE = {
  Masonry: 'Supply and build brickwork and blockwork to external and internal walls, including lintels, damp-proofing and wall reinforcement.',
  'Concrete & Foundations': 'Supply and place foundation and floor-slab concrete, including reinforcement and under-slab membrane.',
  Roof: 'Supply and erect the roof structure and covering, including ridges, fascia boards, gutters and downpipes.',
  'Flat roof': 'Supply and install flat-roof waterproofing, insulation and drainage layers.',
  Ceilings: 'Supply and fit ceiling boards, brandering, insulation, jointing and cornices.',
  'Doors & Windows': 'Supply and install doors, door frames, windows and ironmongery as per the door and glazing schedules.',
  Plumbing: 'Supply and install water supply, waste and soil drainage, sanitary fixtures and the geyser installation.',
  Plastering: 'Supply and apply plaster to internal and external walls.',
  Painting: 'Supply and apply primer and paint to walls and ceilings.',
  Stairs: 'Supply and cast the reinforced-concrete staircase between the floors, with nosings and a stainless-steel balustrade.',
  'Floors & Screed': 'Supply and lay the damp-proof membrane and cement screed over the ground-floor slab.',
  Tiling: 'Supply and lay floor and wall tiles to wet and service areas, including adhesive, grout and waterproofing.',
  Electrical: 'Supply and install the complete electrical installation: distribution board, wiring, points, lighting, extractor fans and solar connection.',
  'External Works': 'Supply and install gates and external works as shown on the plan.'
}

const cost = (items) => items.reduce((sum, m) => sum + (parseFloat(m.qty) || 0) * (parseFloat(m.rate) || 0), 0)
const plain = (s) => String(s || '').replace(/\s+/g, ' ').trim()

function top(items, n) {
  const seen = new Set()
  const out = []
  items.forEach((m) => {
    const d = plain(m.description)
    if (!d || seen.has(d.toLowerCase())) return
    seen.add(d.toLowerCase())
    out.push(d)
  })
  const shown = out.slice(0, n)
  if (out.length > n) shown.push(`and ${out.length - n} further related items`)
  return shown
}

export function buildScope({ materials = [], extraMaterials = [], consumableLines = [], labourLines = [], labourItemLines = [], customLabourLines = [], supervisionDays = 0, fixedLines = [], labourTotal = 0, transport = 0 }) {
  const scope = []
  const groups = []
  materials.forEach((m) => {
    if (!(parseFloat(m.qty) > 0)) return
    let g = groups.find((x) => x.name === m.source)
    if (!g) groups.push((g = { name: m.source, items: [] }))
    g.items.push(m)
  })
  groups.forEach((g) => {
    scope.push({
      trade: g.name,
      summary: GROUP_SCOPE[g.name] || `Supply and install ${g.name.toLowerCase()} as shown on the plan.`,
      includes: top(g.items, 6),
      cost: cost(g.items)
    })
  })

  const extras = extraMaterials.filter((m) => parseFloat(m.qty) > 0)
  if (extras.length) {
    scope.push({
      trade: 'Additional items',
      summary: 'Additional items agreed for this project that are not shown on the plan.',
      includes: top(extras, 8),
      cost: cost(extras)
    })
  }
  if (consumableLines.length) {
    scope.push({
      trade: 'Fixings & consumables',
      summary: 'Fixings, sealants, adhesives and other consumables needed to complete the work.',
      includes: [],
      cost: cost(consumableLines)
    })
  }

  const labour = []
  labourLines.filter((l) => l.cost > 0 && l.id !== 'general').forEach((l) => labour.push(l.label))
  if (labourLines.some((l) => l.id === 'general' && l.cost > 0)) labour.push('General site labour')
  labourItemLines.forEach((l) => labour.push(plain(l.description)))
  customLabourLines.filter((l) => plain(l.label)).forEach((l) => labour.push(plain(l.label)))
  if ((parseFloat(supervisionDays) || 0) > 0) labour.push('Site supervision')
  fixedLines.filter((f) => f.amount > 0).forEach((f) => labour.push(f.label))
  if (labour.length) {
    scope.push({
      trade: 'Labour & site services',
      summary: 'All labour, supervision, site services and transport needed to complete the work above.',
      includes: [...new Set(labour)],
      cost: (parseFloat(labourTotal) || 0) + (parseFloat(transport) || 0)
    })
  }
  return scope
}

// Quote lines for the client: one priced line per piece of work. The contractor's
// mark-up is spread across every line (never shown on its own), so the lines add up
// exactly to the quote total excl. VAT.
export function buildQuoteLines(scope, subtotalBeforeMarkup, quoteTotalExVat) {
  const base = scope.reduce((sum, s) => sum + (s.cost || 0), 0)
  const factor = base > 0 ? quoteTotalExVat / base : 1
  const lines = scope.map((s) => ({
    title: s.trade === 'Labour & site services' ? 'Labour for contract' : s.trade,
    summary: s.summary,
    includes: s.includes,
    amount: Math.round((s.cost || 0) * factor * 100) / 100
  }))
  // Put any cent rounding on the largest line so the lines sum exactly to the total.
  const diff = Math.round((Math.round(quoteTotalExVat * 100) - lines.reduce((sum, l) => sum + Math.round(l.amount * 100), 0))) / 100
  if (lines.length && Math.abs(diff) > 0) {
    const big = lines.reduce((bi, l, i) => (l.amount > lines[bi].amount ? i : bi), 0)
    lines[big].amount = Math.round((lines[big].amount + diff) * 100) / 100
  }
  return lines
}
