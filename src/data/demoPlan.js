// Pre-extracted data for the primary demo plan ("Proposed New Dwelling",
// Stand 1103 Eersterust X02, 3 × A1 sheets, scale 1:100).
//
// The production CAD reader will produce this same structure automatically from
// a vector PDF. For the demo the values below were read from the actual plan:
//   - "schedule"  = counted/read directly from the plan's own schedules & tags
//   - "measured"  = geometry measured off the drawing (wall centrelines etc.)
//   - "rule"      = quantity derived from the above using a stated building rule
// Every derived line carries a `basis` sentence so the estimator can see (and
// override) how it was calculated.
import { getDefaultPriceList } from './supplierPriceLists'

export const DEMO_PLAN = {
  title: 'Proposed New Dwelling',
  owner: 'SS De Beer',
  stand: '1103 Eersterust X02',
  propertyDesc: '1/1103 Eersterust X02',
  siteArea: 348,
  zoning: 'Residential 1',
  scale: '1:100',
  sheets: 3,
  levels: [
    { name: 'Ground floor', floorToFloor: 3.06, ceiling: 2.465 },
    { name: 'First floor', floorToFloor: 3.06, ceiling: 2.465 }
  ],
  // Area schedule (m²)
  areas: [
    { name: 'Ground floor – entrance patio', area: 2.66 },
    { name: 'Ground floor – patio', area: 13.06 },
    { name: 'Ground floor – garage', area: 50.53 },
    { name: 'Ground floor – main floor', area: 138.74 },
    { name: 'Ground floor total', area: 204.99, total: true },
    { name: 'First floor – balcony', area: 15.0 },
    { name: 'First floor – main floor', area: 153.64 },
    { name: 'First floor total', area: 168.64, total: true },
    { name: 'Total building area', area: 373.63, total: true }
  ],
  rooms: [
    { level: 'Ground', name: 'Double garage', area: 46 },
    { level: 'Ground', name: 'Entrance patio', area: 2 },
    { level: 'Ground', name: 'Covered patio', area: 9 },
    { level: 'Ground', name: 'Foyer', area: 3 },
    { level: 'Ground', name: 'Lounge', area: 21 },
    { level: 'Ground', name: 'Dining room', area: 30 },
    { level: 'Ground', name: 'Kitchen', area: 12 },
    { level: 'Ground', name: 'Scullery', area: 8 },
    { level: 'Ground', name: 'Pantry', area: 2 },
    { level: 'Ground', name: 'Loo', area: 3 },
    { level: 'Ground', name: 'Passage', area: 3 },
    { level: 'Ground', name: 'Store', area: 7 },
    { level: 'Ground', name: 'Storage', area: 6 },
    { level: 'Ground', name: 'Main bedroom', area: 24 },
    { level: 'Ground', name: 'En-suite', area: 5 },
    { level: 'First', name: 'Private lounge', area: 40 },
    { level: 'First', name: 'Bedroom 2', area: 19 },
    { level: 'First', name: 'Bedroom 3', area: 22 },
    { level: 'First', name: 'Bedroom 4', area: 23 },
    { level: 'First', name: 'Study', area: 8 },
    { level: 'First', name: 'Bathroom', area: 7 },
    { level: 'First', name: 'Passage', area: 7 },
    { level: 'First', name: 'En-suite', area: 5 },
    { level: 'First', name: 'Covered balcony', area: 11 },
    { level: 'First', name: 'Open balcony', area: 13 }
  ],
  // Door schedule (qty / size from the plan's door schedule, mm)
  doors: [
    { tag: 'D1', qty: 1, w: 1600, h: 2100, type: 'Aluminium framed glass pivot door', kind: 'external' },
    { tag: 'D2', qty: 1, w: 900, h: 2100, type: 'Horizontal slatted external timber door (width not annotated – 900 assumed)', kind: 'external' },
    { tag: 'D3', qty: 2, w: 815, h: 2035, type: 'Slatted veneered class B fire door (garage-to-house)', kind: 'external' },
    { tag: 'D4', qty: 10, w: 760, h: 2060, type: 'Slatted internal hollow-core door', kind: 'internal' },
    { tag: 'D5', qty: 1, w: 650, h: 2060, type: 'Slatted internal hollow-core door', kind: 'internal' },
    { tag: 'FD1', qty: 2, w: 4000, h: 2100, type: 'Aluminium folding door, centre opening (bronze)', kind: 'external' },
    { tag: 'GG1', qty: 2, w: 1000, h: 1715, type: 'Steel-framed slatted garden gate', kind: 'gate' },
    { tag: 'GD1', qty: 1, w: 4880, h: 2425, type: 'Horizontal slatted timber garage door (automated)', kind: 'external' }
  ],
  // Glazing schedule (mm). `fixed` = fixed-only unit; others are aluminium top-hung + fixed.
  windows: [
    { tag: 'W1', qty: 2, w: 2100, h: 600 },
    { tag: 'W2', qty: 1, w: 600, h: 900 },
    { tag: 'W3', qty: 3, w: 900, h: 900 },
    { tag: 'W4', qty: 1, w: 1500, h: 900 },
    { tag: 'W5', qty: 1, w: 2400, h: 900 },
    { tag: 'W6', qty: 1, w: 1500, h: 1200 },
    { tag: 'W7', qty: 4, w: 600, h: 1500 },
    { tag: 'W8', qty: 4, w: 900, h: 1500 },
    { tag: 'W9', qty: 4, w: 2100, h: 1500 },
    { tag: 'CW1', qty: 1, w: 600, h: 1800, fixed: true }
  ],
  // Measured wall geometry (centreline lengths in metres)
  walls: {
    external: { ground: 62, first: 60, thickness: '220 mm (double skin)' },
    internal: { ground: 16, first: 20, thickness: '110 mm (single skin)' },
    height: 3.0
  },
  // Fixture tags counted on the floor plans / water reticulation sheets
  fixtures: [
    { name: 'WC', qty: 4 },
    { name: 'Hand-wash basin', qty: 4 },
    { name: 'Bath', qty: 2 },
    { name: 'Shower', qty: 2 },
    { name: 'Kitchen sink', qty: 1 },
    { name: 'Dishwasher point', qty: 1 },
    { name: 'Washing-machine point', qty: 1 },
    { name: 'Tumble-dryer point', qty: 1 },
    { name: 'Floor gully', qty: 2 },
    { name: '200 L hot-water storage vessel (solar, in ceiling void)', qty: 1 },
    { name: 'Garden tap', qty: 1 }
  ],
  roof: {
    pitch: '30°',
    covering: 'Concrete tiles on timber trusses with underlay',
    planArea: 153.64,
    slopedArea: 177,
    eavesPerimeter: 60
  }
}

// ---- helpers --------------------------------------------------------------
const PRICE_BY_CODE = {}
for (const c of getDefaultPriceList('buco').categories) {
  for (const it of c.items) PRICE_BY_CODE[String(it.code)] = { ...it, category: c.category }
}
const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0)
const m2 = (w, h) => (w / 1000) * (h / 1000)

// Derived plan metrics shared by the take-off and the review screen
export function planMetrics(plan = DEMO_PLAN) {
  const extLen = plan.walls.external.ground + plan.walls.external.first
  const intLen = plan.walls.internal.ground + plan.walls.internal.first
  const windowArea = sum(plan.windows, (w) => w.qty * m2(w.w, w.h))
  const doorsIn = plan.doors.filter((d) => d.kind === 'external')
  const doorsInt = plan.doors.filter((d) => d.kind === 'internal')
  const extDoorArea = sum(doorsIn, (d) => d.qty * m2(d.w, d.h))
  const intDoorArea = sum(doorsInt, (d) => d.qty * m2(d.w, d.h))
  const extGross = extLen * plan.walls.height
  const intGross = intLen * plan.walls.height
  const extNet = Math.max(0, extGross - windowArea - extDoorArea)
  const intNet = Math.max(0, intGross - intDoorArea)
  const groundFloor = plan.areas.find((a) => a.name === 'Ground floor total').area
  const firstFloor = plan.areas.find((a) => a.name === 'First floor total').area
  const firstMain = plan.areas.find((a) => a.name === 'First floor – main floor').area
  return {
    extLen, intLen, extGross, intGross, windowArea, extDoorArea, intDoorArea, extNet, intNet,
    netWall: extNet + intNet,
    groundFloor, firstFloor, firstMain,
    totalDoors: sum(plan.doors, (d) => d.qty),
    totalWindows: sum(plan.windows, (w) => w.qty),
    ceilingArea: Math.round(firstMain * 0.9),
    // plaster: both faces of external + internal walls
    plasterArea: extNet * 2 + intNet * 2,
    paintExtArea: extNet
  }
}

// One take-off line: price-list code + qty + how the qty was derived.
function line(group, code, desc, qty, basis, source) {
  const p = PRICE_BY_CODE[String(code)]
  return {
    id: `plan-${code}-${group}`.replace(/\s+/g, '-'),
    source: group,
    code: String(code),
    description: desc || p?.description || String(code),
    unit: p?.unit || 'each',
    qty: Math.max(0, Math.ceil(qty)),
    rate: p?.price ?? 0,
    basis,
    basisType: source, // 'schedule' | 'measured' | 'rule'
    inList: !!p
  }
}

// Plan elements the drawing calls for that the price list cannot price exactly.
export const UNMATCHED_PLAN_ITEMS = [
  { item: 'Window CW1 (fixed panel)', note: 'The list has no fixed-window row – priced as an aluminium top-hung window; confirm with the supplier' },
  { item: 'Folding doors FD1', note: 'Priced as aluminium sliding doors (closest row); folding gear is a separate line' },
  { item: 'Electrical layout', note: 'Not on the architectural plan – see the separate electrical drawing' },
  { item: 'Floor / wall tile finishes', note: 'Plan says "carpet or slip-free tiles as chosen by client" – add the client\'s choice under Items Not on Plan' },
  { item: 'Chimney / braai', note: 'Plan gives no size – flue components are in the price list, quantity left to the estimator' }
]

const LINTEL_SIZES = [
  [900, '01-09'], [1200, '01-10'], [1500, '01-11'], [1800, '01-12'], [2100, '01-13'], [2400, '01-14']
]

export function buildTakeoff(plan = DEMO_PLAN) {
  const M = planMetrics(plan)
  const L = []
  const walling = M.extNet * 100 + M.intNet * 50 // bricks per m²: 100 (220 wall), 50 (110 wall)
  const bricks = walling * 1.05
  const slabGround = M.groundFloor
  const slabFirst = M.firstFloor
  const footingLen = plan.walls.external.ground + plan.walls.internal.ground
  const d = (tag) => plan.doors.find((x) => x.tag === tag)
  const fx = (n) => plan.fixtures.find((f) => f.name === n)?.qty || 0

  // ---- Foundations & concrete
  const concreteM3 = slabGround * 0.1 + footingLen * 0.6 * 0.2 + slabFirst * 0.17
  L.push(line('Concrete & Foundations', '02-03', 'Ready-mix concrete 25 MPa (m³)', concreteM3 * 1.05,
    `Ground slab ${slabGround.toFixed(2)} m² × 100 mm + strip footings ${footingLen} m × 600×200 + first-floor slab ${slabFirst.toFixed(2)} m² × 170 mm, +5% waste`, 'rule'))
  L.push(line('Concrete & Foundations', '03-03', 'Rebar Y12, 6 m lengths', (slabFirst * 0.17 * 70 + footingLen * 0.12 * 40) / 5.33,
    'First-floor slab (≈70 kg/m³) and footings (≈40 kg/m³) ÷ 5.33 kg per Y12 6 m bar', 'rule'))
  L.push(line('Concrete & Foundations', '03-07', 'Reinforcing mesh 193 sheets', (slabGround + slabFirst) * 1.1 / 12.9,
    `Ground + first-floor slab ${(slabGround + slabFirst).toFixed(2)} m² ÷ 12.9 m² usable per sheet, +10% laps`, 'rule'))
  L.push(line('Concrete & Foundations', '02-14', 'Plastic sheeting / under-slab membrane', slabGround * 1.1,
    `Ground slab ${slabGround.toFixed(2)} m² +10% laps (plan section shows damp-proof membrane under screed)`, 'rule'))
  L.push(line('Concrete & Foundations', '02-24', 'Geotextile membrane', slabGround * 1.05,
    'Plan slab detail shows geotextile', 'rule'))

  // ---- Masonry
  L.push(line('Masonry', '01-03', 'Stock bricks (plan: 220 mm external, 110 mm internal walls)', bricks,
    `External net ${M.extNet.toFixed(1)} m² × 100 + internal net ${M.intNet.toFixed(1)} m² × 50 bricks/m², +5% waste. Walls: ${M.extLen} m external + ${M.intLen} m internal × ${plan.walls.height} m high, less openings`, 'measured'))
  L.push(line('Masonry', '01-19', 'Cement 32.5N 50 kg (mortar)', (bricks / 1000) * 6, '≈6 bags of cement per 1 000 bricks', 'rule'))
  L.push(line('Masonry', '01-21', 'Building sand (m³, mortar)', (bricks / 1000) * 0.45, '≈0.45 m³ sand per 1 000 bricks', 'rule'))
  L.push(line('Masonry', '01-16', 'Brickforce 150 mm rolls (15 m)', (M.netWall * 3.3) / 15,
    'One layer every 4th course ≈ 3.3 m per m² of wall ÷ 15 m roll', 'rule'))
  L.push(line('Masonry', '01-29', 'DPC roll 375 mm (20 m)', (footingLen * 1.1) / 20,
    `Ground-floor wall length ${footingLen} m, +10% laps (20 m rolls assumed)`, 'measured'))
  // Lintels: one per opening, sized to the opening + 300 mm bearing; 2.0 m+ openings take steel lintels
  const openings = [
    ...plan.windows.map((w) => ({ tag: w.tag, qty: w.qty, w: w.w })),
    ...plan.doors.filter((x) => x.kind !== 'gate').map((x) => ({ tag: x.tag, qty: x.qty, w: x.w }))
  ]
  const precast = {}
  let steelLen = 0
  const steelTags = []
  openings.forEach((o) => {
    const need = o.w + 300
    if (o.w >= 2000) {
      steelLen += (need / 1000) * o.qty
      steelTags.push(`${o.tag}×${o.qty}`)
    } else {
      const size = LINTEL_SIZES.find(([len]) => len >= need) || LINTEL_SIZES[LINTEL_SIZES.length - 1]
      precast[size[1]] = (precast[size[1]] || 0) + o.qty
    }
  })
  LINTEL_SIZES.forEach(([len, code]) => {
    if (precast[code]) L.push(line('Masonry', code, `Precast concrete lintels ${len} mm`, precast[code],
      `One per opening (opening width + 300 mm bearing) from the window and door schedules`, 'schedule'))
  })
  L.push(line('Masonry', '03-20', 'Steel lintels (6 m lengths) for openings 2.0 m and wider', steelLen / 6,
    `${steelTags.join(', ')}: ${steelLen.toFixed(1)} m of lintel (opening + 300 mm) ÷ 6 m`, 'schedule'))

  // ---- Plaster
  L.push(line('Plastering', '11-02', 'Cement 50 kg (plaster)', M.plasterArea * 0.12,
    `Plastered area ${M.plasterArea.toFixed(0)} m² (both faces) × ~0.12 bag/m² at 15 mm`, 'rule'))
  L.push(line('Plastering', '11-01', 'Plaster sand (m³)', M.plasterArea * 0.017 * 1.15,
    '15 mm plaster ≈ 0.017 m³/m² + 15% bulking', 'rule'))

  // ---- Roof
  const roof = plan.roof
  const trusses = Math.ceil(15.7 / 1.0) + 1
  L.push(line('Roof', '04-01', 'Prefabricated roof trusses (SAP Grade 6, 760 mm c/c)', trusses,
    'Roof length ≈15.7 m at ~1.0 m truss spacing + 1 end truss (30° pitch); plan: designed + supplied by specialist', 'measured'))
  L.push(line('Roof', '04-18', 'Concrete roof tiles (double-Roman)', roof.slopedArea * 10 * 1.05,
    `Plan roof ${roof.planArea} m² ÷ cos 30° ≈ ${roof.slopedArea} m² × 10 tiles/m², +5%`, 'rule'))
  L.push(line('Roof', '04-10', 'Roof battens (6 m lengths)', (roof.slopedArea / 0.35 * 1.1) / 6,
    `${roof.slopedArea} m² at 350 mm batten spacing, +10%`, 'rule'))
  L.push(line('Roof', '04-16', 'Roofing underlay rolls (45 m²)', (roof.slopedArea * 1.1) / 45, `${roof.slopedArea} m² +10% ÷ 45 m² per roll`, 'rule'))
  L.push(line('Roof', '04-20', 'Ridge tiles', 30 * 2.5, '≈30 m of ridge + hips from the roof plan × 2.5 tiles/m', 'measured'))
  L.push(line('Roof', '04-11', 'Fascia boards (6 m lengths)', roof.eavesPerimeter / 6, `Eaves perimeter ≈${roof.eavesPerimeter} m`, 'measured'))
  L.push(line('Roof', '04-33', 'Gutters (6 m lengths)', roof.eavesPerimeter / 6, 'Along eaves – plan notes require gutters & downpipes to SANS 10400-M', 'measured'))
  L.push(line('Roof', '04-34', 'Downpipes', 4, '≈4 downpipes (one per ~15 m of gutter)', 'rule'))
  L.push(line('Roof', '04-43', 'Truss connector plates', trusses * 4, '4 fixings per truss', 'rule'))

  // ---- Flat roof slab (R.CONC roof slab with Derbigum build-up) – area is an assumption
  const flat = plan.areas.find((a) => a.name === 'Ground floor – garage').area
  const FLAT = `R.CONC roof-slab build-up from the roof notes; flat roof assumed over the garage (${flat} m²) – confirm`
  L.push(line('Flat roof', '04-44', 'Torch-on waterproofing membrane (Derbigum)', flat * 1.1, FLAT, 'rule'))
  L.push(line('Flat roof', '04-45', 'Isoboard insulation 50 mm', flat * 1.05, FLAT, 'rule'))
  L.push(line('Flat roof', '04-46', 'Dimpled drainage layer (Delta MS-8)', flat * 1.05, FLAT, 'rule'))
  L.push(line('Flat roof', '02-24', 'Geotextile membrane (roof slab)', flat * 1.05, FLAT, 'rule'))
  L.push(line('Flat roof', '02-10', 'Concrete stone 19 mm – 50 mm drainage layer (m³)', flat * 0.05 * 1.1, `${flat} m² × 50 mm +10%`, 'rule'))

  // ---- Ceilings
  const boards = (M.ceilingArea * 1.08) / 3.6
  L.push(line('Ceilings', '05-18', 'Ceiling insulation rolls (135 mm Alutherm)', M.ceilingArea / 20, `Ceiling area ${M.ceilingArea} m² ÷ ~20 m² per roll`, 'rule'))
  L.push(line('Ceilings', '05-01', 'Gypsum ceiling board 6.4 mm', boards,
    `First-floor ceiling ${M.ceilingArea} m² (floor area less walls) ÷ 3.6 m² per sheet, +8%`, 'rule'))
  L.push(line('Ceilings', '05-05', 'Ceiling brandering (6 m lengths)', ((M.ceilingArea / 0.6) * 1.1) / 6, 'Brandering at 600 mm centres, +10%', 'rule'))
  L.push(line('Ceilings', '05-13', 'Jointing compound', boards / 25, '≈1 bucket per 25 boards', 'rule'))
  L.push(line('Ceilings', '05-12', 'Jointing tape', boards / 40, '≈1 roll per 40 boards', 'rule'))
  L.push(line('Ceilings', '05-10', 'Ceiling screws', boards / 20, '≈1 box per 20 boards', 'rule'))
  const cornice = plan.rooms.filter((r) => r.level === 'First' && !/balcony/i.test(r.name)).reduce((s, r) => s + 4 * Math.sqrt(r.area), 0)
  L.push(line('Ceilings', '05-15', 'Gypsum cornice (3 m lengths)', cornice / 3,
    'Room perimeters from the first-floor room areas (≈4√area each) ÷ 3 m lengths', 'measured'))

  // ---- Doors (door schedule)
  L.push(line('Doors & Windows', '06-40', 'Door D1 – custom aluminium-framed glass pivot door (1600×2100)', d('D1').qty, 'Door schedule: D1 ×1', 'schedule'))
  L.push(line('Doors & Windows', '06-04', 'Door D2 – medium-duty horizontal slatted timber external door', d('D2').qty, 'Door schedule: D2 ×1', 'schedule'))
  L.push(line('Doors & Windows', '06-07', 'Door D3 – Class B fire door, horizontal slatted veneered (815×2035)', d('D3').qty, 'Door schedule: D3 ×2 (garage-to-house fire doors)', 'schedule'))
  L.push(line('Doors & Windows', '06-01', `Internal doors D4 ×${d('D4').qty} (760×2060) + D5 ×${d('D5').qty} (650×2060)`,
    d('D4').qty + d('D5').qty, 'Door schedule: D4 ×10 + D5 ×1 hollow-core internal doors', 'schedule'))
  L.push(line('Doors & Windows', '06-09', `Folding doors FD1 ×${d('FD1').qty} (4000×2100)`, d('FD1').qty, 'Door schedule: FD1 ×2 aluminium folding doors (priced as aluminium sliding doors)', 'schedule'))
  L.push(line('Doors & Windows', '06-43', 'Folding door gear (FD1, specialist supplied)', d('FD1').qty, 'Door schedule FD1 accessories', 'schedule'))
  L.push(line('Doors & Windows', '06-41', 'Garage door GD1 – horizontal slatted timber (4880×2425)', d('GD1').qty, 'Door schedule: GD1 ×1', 'schedule'))
  L.push(line('Doors & Windows', '06-42', 'Automated garage-door opener (GD1)', d('GD1').qty, 'Door schedule GD1 accessories: "Automated garage door opener"', 'schedule'))
  L.push(line('Doors & Windows', '06-12', 'Door frames – pressed steel (D2, D3)', d('D2').qty + d('D3').qty, 'Door schedule: frame "Pressed steel"', 'schedule'))
  L.push(line('Doors & Windows', '06-11', 'Door frames – meranti timber (D4, D5)', d('D4').qty + d('D5').qty, 'Door schedule: frame "Meranti"', 'schedule'))
  const handled = plan.doors.filter((x) => x.kind !== 'gate' && x.tag !== 'GD1' && x.tag !== 'FD1').reduce((s, x) => s + x.qty, 0)
  L.push(line('Doors & Windows', '06-17', 'Door locksets', handled, 'One lockset per swing door (D1–D5)', 'schedule'))
  L.push(line('External Works', '13-23', `Garden gates GG1 ×${d('GG1').qty} (1000×1715), steel-framed slatted`, d('GG1').qty, 'Door schedule: GG1 ×2', 'schedule'))
  L.push(line('External Works', '13-35', 'Gate spring auto-closers 250 mm (GG1)', d('GG1').qty, 'Door schedule GG1 accessories', 'schedule'))
  L.push(line('External Works', '13-36', 'Galvanised auto gate latches 127 mm (GG1)', d('GG1').qty, 'Door schedule GG1 accessories', 'schedule'))

  // ---- Windows (glazing schedule)
  const winQty = sum(plan.windows, (w) => w.qty)
  const topHungQty = sum(plan.windows.filter((w) => !w.fixed), (w) => w.qty)
  L.push(line('Doors & Windows', '06-24',
    `Aluminium windows – ${plan.windows.map((w) => `${w.tag}×${w.qty}`).join(', ')}`, winQty,
    `Glazing schedule: ${winQty} aluminium windows, glazed area ${sum(plan.windows, (w) => w.qty * m2(w.w, w.h)).toFixed(1)} m² (fixed CW1 priced as a top-hung unit)`, 'schedule'))
  L.push(line('Doors & Windows', '06-33', 'Window stays and handles', topHungQty, 'One set per opening window', 'schedule'))

  // ---- Plumbing (fixture tags)
  const wc = fx('WC'), hwb = fx('Hand-wash basin'), bath = fx('Bath'), sh = fx('Shower')
  L.push(line('Plumbing', '07-33', 'Toilet pans', wc, 'Fixture tags on floor plans', 'schedule'))
  L.push(line('Plumbing', '07-34', 'Toilet cisterns', wc, 'One per WC', 'schedule'))
  L.push(line('Plumbing', '07-35', 'Toilet seats', wc, 'One per WC', 'schedule'))
  L.push(line('Plumbing', '07-36', 'Wash-hand basins (HWB)', hwb, 'Fixture tags on floor plans', 'schedule'))
  L.push(line('Plumbing', '07-37', 'Pedestals', hwb, 'One per basin', 'schedule'))
  L.push(line('Plumbing', '07-29', 'Basin mixers', hwb, 'One per basin', 'schedule'))
  L.push(line('Plumbing', '07-39', 'Baths', bath, 'Fixture tags on floor plans', 'schedule'))
  L.push(line('Plumbing', '07-32', 'Bath mixers', bath, 'One per bath', 'schedule'))
  L.push(line('Plumbing', '07-31', 'Shower mixers', sh, 'Fixture tags on floor plans', 'schedule'))
  L.push(line('Plumbing', '07-40', 'Shower trays', sh, 'One per shower', 'schedule'))
  L.push(line('Plumbing', '07-38', 'Kitchen sink, stainless steel', fx('Kitchen sink'), 'Fixture tag on floor plan', 'schedule'))
  L.push(line('Plumbing', '07-30', 'Sink mixer', fx('Kitchen sink'), 'One per sink', 'schedule'))
  L.push(line('Plumbing', '07-70', 'Washing-machine / dishwasher / dryer connection points',
    fx('Dishwasher point') + fx('Washing-machine point') + fx('Tumble-dryer point'), 'Appliance tags on GF plan', 'schedule'))
  L.push(line('Plumbing', '07-49', 'Geyser 200 L (hot-water storage vessel)', fx('200 L hot-water storage vessel (solar, in ceiling void)'),
    'Water reticulation sheet: 200 L vessel in ceiling void', 'schedule'))
  L.push(line('Plumbing', '07-66', 'Solar panel collector (roof-mounted)', 1, 'Roof plan: "Solar panel collector on roof"', 'schedule'))
  L.push(line('Plumbing', '07-50', 'Geyser drip tray', 1, 'One per geyser', 'rule'))
  L.push(line('Plumbing', '07-51', 'Geyser safety valve set', 1, 'One set per geyser', 'rule'))
  L.push(line('Plumbing', '07-52', 'Geyser vacuum breakers', 2, 'Hot-water and cold-feed vacuum breakers', 'rule'))
  L.push(line('Plumbing', '07-26', 'PCV – pressure control valve', 1, 'Water reticulation legend: PCV', 'schedule'))
  L.push(line('Plumbing', '07-68', 'Water meter / meter box', 1, 'Site plan: water meter', 'schedule'))
  L.push(line('Plumbing', '07-28', 'Garden tap (bib tap)', fx('Garden tap'), 'Water-reticulation sheet: tap at water meter', 'schedule'))
  L.push(line('Plumbing', '07-67', 'Ø25 HDPE PN10 underground water pipe (m)', 15, 'Water reticulation: municipal connection to meter, ≈15 m assumed', 'rule'))
  L.push(line('Plumbing', '07-01', 'PPR pipe 20 mm (Ø20 hot & cold, lengths)', 20, 'Water reticulation layout: ≈120 m hot + cold Ø20 ÷ 6 m', 'rule'))
  L.push(line('Plumbing', '07-11', 'Soil pipe 110 mm (lengths)', 10, 'Drainage notes: 110 mm uPVC soil pipe, ≈60 m run ÷ 6 m', 'rule'))
  L.push(line('Plumbing', '07-10', 'Waste pipe 50 mm (lengths)', 8, 'Drainage notes: basins, sinks, baths, showers on 50 mm waste; ≈48 m ÷ 6 m', 'rule'))
  L.push(line('Plumbing', '07-19', 'PVC bends', 12, 'Approx. 1 per fixture run', 'rule'))
  L.push(line('Plumbing', '07-20', 'PVC junctions', 8, 'Approx. 2 per WC / stack junction', 'rule'))
  L.push(line('Plumbing', '07-69', 'Open vent pipe (OVP) – 110 mm through roof', 2, 'Drainage notes: OVP min 100 mm above roof (assumed 2 stacks)', 'rule'))
  L.push(line('Plumbing', '07-43', 'Gullies', fx('Floor gully'), 'Floor gully tags on GF plan', 'schedule'))
  L.push(line('Plumbing', '07-45', 'Inspection chambers', 2, 'Municipal sewer connection – assumed 2 chambers', 'rule'))

  // ---- Painting (derived areas)
  const intFaces = M.extNet + M.intNet * 2
  L.push(line('Painting', '10-02', 'Interior PVA paint 20 L', (intFaces * 2) / 6 / 20, `Internal wall faces ${intFaces.toFixed(0)} m² × 2 coats ÷ 6 m²/L ÷ 20 L`, 'rule'))
  L.push(line('Painting', '10-05', 'Ceiling paint (litres)', (M.ceilingArea * 2) / 6, `Ceiling ${M.ceilingArea} m² × 2 coats ÷ 6 m²/L`, 'rule'))
  L.push(line('Painting', '10-04', 'Exterior acrylic paint 20 L', (M.extNet * 2) / 6 / 20, `External faces ${M.extNet.toFixed(0)} m² × 2 coats ÷ 6 m²/L ÷ 20 L`, 'rule'))
  L.push(line('Painting', '10-06', 'Plaster primer (litres)', M.plasterArea / 8, `Plastered area ${M.plasterArea.toFixed(0)} m² ÷ 8 m²/L`, 'rule'))

  return {
    lines: L,
    metrics: M,
    labourBasis: {
      brickwork: Math.round(M.netWall),
      plastering: Math.round(M.plasterArea),
      roofing: Math.round(plan.roof.slopedArea),
      painting: Math.round(M.extNet + M.intNet * 2 + M.ceilingArea + M.extNet),
      tiling: 20,
      plumbing: plan.fixtures.filter((f) => !/gully/i.test(f.name)).reduce((s, f) => s + f.qty, 0),
      electrical: 34,
      general: 20
    },
    unmatched: UNMATCHED_PLAN_ITEMS
  }
}
