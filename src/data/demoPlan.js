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
  { item: 'Electrical layout', note: 'Not on the architectural plan – the Electrical lines are sized from the room areas; replace them with the counts from the separate electrical drawing' },
  { item: 'Floor / wall tile finishes', note: 'Plan says "carpet or slip-free tiles as chosen by client" – wet and service areas are assumed tiled; set the quantities to the client\'s choice' },
  { item: 'New 2.1 m boundary wall', note: 'Shown on the site plan without a length – add brick and wall items under Items Not on Plan once it is measured' },
  { item: 'Staircase width and balcony balustrade length', note: 'Not dimensioned on the plan – 1.0 m stair width and the two open sides of each balcony are assumed' },
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

  // ---- Plaster (walls both faces + the ground-floor ceiling, which is the plastered slab soffit)
  const soffit = plan.areas.find((a) => a.name === 'Ground floor – main floor').area
  const plasterTotal = M.plasterArea + soffit
  L.push(line('Plastering', '11-02', 'Cement 50 kg (plaster)', plasterTotal * 0.12,
    `Plastered area ${plasterTotal.toFixed(0)} m² (walls both faces ${M.plasterArea.toFixed(0)} m² + slab soffit ${soffit} m²) × ~0.12 bag/m² at 15 mm`, 'rule'))
  L.push(line('Plastering', '11-01', 'Plaster sand (m³)', plasterTotal * 0.017 * 1.15,
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
  const ceilPaint = M.ceilingArea + soffit
  L.push(line('Painting', '10-05', 'Ceiling paint (litres)', (ceilPaint * 2) / 6, `Ceilings ${ceilPaint.toFixed(0)} m² (first-floor ceiling + ground-floor slab soffit) × 2 coats ÷ 6 m²/L`, 'rule'))
  L.push(line('Painting', '10-04', 'Exterior acrylic paint 20 L', (M.extNet * 2) / 6 / 20, `External faces ${M.extNet.toFixed(0)} m² × 2 coats ÷ 6 m²/L ÷ 20 L`, 'rule'))
  L.push(line('Painting', '10-06', 'Plaster primer (litres)', plasterTotal / 8, `Plastered area ${plasterTotal.toFixed(0)} m² ÷ 8 m²/L`, 'rule'))


  // ================= Added take-off: everything else the plan shows or implies =================
  const room = (lvl, name) => plan.rooms.find((r) => r.level === lvl && r.name === name)?.area || 0
  const patios = plan.areas.filter((a) => /patio/i.test(a.name)).reduce((acc, a) => acc + a.area, 0)
  const slabInterior = slabGround - patios // ground-floor floor area under the main roof/garage
  const EST = 'Estimated – the plan does not give this quantity directly; check before pricing'

  // ---- Foundations: hardcore, termite treatment, tying wire and spacers
  L.push(line('Concrete & Foundations', '02-08', 'Hardcore filling under ground slab (m³)', slabGround * 0.2 * 1.2,
    `Section: "filling to engineer spec" – ${slabGround.toFixed(0)} m² × ~200 mm, +20% compaction`, 'rule'))
  L.push(line('Concrete & Foundations', '02-25', 'Termite treatment chemical (litres)', slabGround * 0.5,
    `Pre-construction soil treatment under the ground slab, ≈0.5 L/m² × ${slabGround.toFixed(0)} m²`, 'rule'))
  L.push(line('Concrete & Foundations', '03-10', 'Binding wire (kg)', (slabFirst * 0.17 * 70 + footingLen * 0.12 * 40) * 0.01,
    '≈1% of the reinforcing steel weight', 'rule'))
  L.push(line('Concrete & Foundations', '03-11', 'Steel bar chairs', slabFirst * 3,
    `≈3 chairs per m² of first-floor slab (${slabFirst.toFixed(0)} m²)`, 'rule'))

  // ---- Stairs: R.C. staircase between the floors (plan note: treads min 250, risers max 200)
  const risers = Math.ceil((plan.levels[0].floorToFloor * 1000) / 200)
  const treads = risers - 1
  const stairGoing = (treads * 250) / 1000
  const stairWidth = 1.0
  const stairM3 = (stairGoing * stairWidth * 0.15 + 0.5 * (plan.levels[0].floorToFloor / risers) * 0.25 * treads * stairWidth) * 1.05
  const STAIR = `Plan note: R.C. staircase, treads min 250 mm, risers max 200 mm; ${risers} risers × 250 mm treads, width not dimensioned – ${stairWidth.toFixed(1)} m assumed`
  L.push(line('Stairs', '02-03', 'Ready-mix concrete 25 MPa – staircase (m³)', stairM3, STAIR, 'rule'))
  L.push(line('Stairs', '03-03', 'Rebar Y12, 6 m lengths – staircase', (stairM3 * 100) / 5.33, '≈100 kg of steel per m³ of staircase ÷ 5.33 kg per 6 m bar', 'rule'))
  L.push(line('Stairs', '02-17', 'Formwork plywood – staircase', Math.ceil(stairGoing * stairWidth * 2 / 2.9) + 2, 'Soffit and sides of the flight, plus landing', 'rule'))
  L.push(line('Stairs', '02-16', 'Shuttering timber – staircase props and bearers', 14, 'Props and bearers for one flight', 'rule'))
  L.push(line('Stairs', '09-27', 'Stair nosing', (treads * stairWidth) / 3, `${treads} treads × ${stairWidth.toFixed(1)} m ÷ 3 m lengths`, 'rule'))
  const stairBal = stairGoing + 2
  L.push(line('Stairs', '06-45', 'Stainless-steel balustrade – staircase (m)', stairBal,
    `Plan note: min 1 m high, max 100 mm openings. Flight ${stairGoing.toFixed(1)} m + ~2 m landing edge`, 'rule'))

  // ---- Balconies: glass balustrades (plan note: 1 m high glass, max 100 mm spacing)
  const balcony = room('First', 'Covered balcony') + room('First', 'Open balcony')
  const balcLen = 2 * Math.sqrt(room('First', 'Covered balcony')) + 2 * Math.sqrt(room('First', 'Open balcony'))
  L.push(line('Doors & Windows', '06-44', 'Glass balustrade – balconies, 1 m high (m)', balcLen,
    `Plan note: "1 m high glass balustrades". Two open sides of each balcony (${balcony} m² of balcony) – ${EST}`, 'rule'))

  // ---- Roof timbers, fixings and rainwater parts
  L.push(line('Roof', '04-02', 'SA pine wall plate (6 m lengths)', (2 * 15.7 * 1.1) / 6, 'Wall plate along both long wall tops (roof ≈15.7 m long), +10%', 'measured'))
  L.push(line('Roof', '04-23', 'Tile clips / nails (packs)', (roof.slopedArea * 10) / 200, '≈1 pack per 200 tiles', 'rule'))
  L.push(line('Roof', '04-42', 'Roofing nails (kg)', roof.slopedArea / 25, '≈1 kg per 25 m² of roof', 'rule'))
  L.push(line('Roof', '04-32', 'Roofing silicone / sealant (tubes)', 6, 'Ridge, flashings and penetrations (OVP, solar collector)', 'rule'))
  L.push(line('Roof', '04-35', 'Gutter brackets', roof.eavesPerimeter / 0.9, `≈1 per 0.9 m of the ${roof.eavesPerimeter} m gutter`, 'measured'))
  L.push(line('Roof', '04-37', 'Gutter outlets', 4, 'One per downpipe', 'rule'))
  L.push(line('Roof', '04-36', 'Downpipe bends', 8, '≈2 bends per downpipe', 'rule'))

  // ---- Flat roof: 30 mm screed to falls (plan note)
  const screedFlat = flat * 0.03
  L.push(line('Flat roof', '02-05', 'Cement 50 kg (roof-slab screed)', screedFlat * 7, `Plan note: min 30 mm screed at 1:50 fall – ${flat} m² × 30 mm = ${screedFlat.toFixed(1)} m³ at ≈7 bags of cement per m³ (1:4)`, 'rule'))
  L.push(line('Flat roof', '02-12', 'Building sand (m³, roof-slab screed)', screedFlat * 1.1, 'Screed sand, +10% bulking', 'rule'))

  // ---- Floors & screed: DPM + min 75 mm screed over the ground-floor slab (section detail)
  const screedVol = slabInterior * 0.075
  L.push(line('Floors & Screed', '02-05', 'Cement 50 kg (floor screed)', screedVol * 7, `Section: "min 75 mm conc screed" over the ${slabInterior.toFixed(0)} m² ground floor (excl. patios) = ${screedVol.toFixed(1)} m³ at ≈7 bags per m³ (1:4)`, 'rule'))
  L.push(line('Floors & Screed', '02-12', 'Building sand (m³, floor screed)', screedVol * 1.1, 'Screed sand, +10% bulking', 'rule'))
  L.push(line('Floors & Screed', '02-15', 'DPM tape', 4, 'Joints of the damp-proof membrane under the screed', 'rule'))

  // ---- Tiling: wet areas and service areas (plan: "carpet or slip-free tiles as chosen by client")
  const wetRooms = [['Ground', 'Loo'], ['Ground', 'En-suite'], ['First', 'Bathroom'], ['First', 'En-suite']]
  const serviceRooms = [['Ground', 'Kitchen'], ['Ground', 'Scullery'], ['Ground', 'Pantry'], ['Ground', 'Foyer'], ['Ground', 'Passage'], ['First', 'Passage']]
  const wetArea = sum(wetRooms, ([l, n]) => room(l, n))
  const serviceArea = sum(serviceRooms, ([l, n]) => room(l, n))
  const wallTile = sum(wetRooms, ([l, n]) => 4 * Math.sqrt(room(l, n)) * 1.2) + 4
  const tileTotal = (wetArea + serviceArea + wallTile) * 1.1
  const TILE = 'Plan leaves the finish to the client (carpet or slip-free tiles). Assumed tiled: bathrooms, loo, kitchen, scullery, pantry, foyer, passages – adjust or remove'
  L.push(line('Tiling', '09-04', 'Non-slip bathroom floor tiles (m²)', wetArea * 1.1, `${TILE}. Wet-area floors ${wetArea} m² +10%`, 'rule'))
  L.push(line('Tiling', '09-01', 'Ceramic floor tiles (m²)', serviceArea * 1.1, `Kitchen, scullery, pantry, foyer and passages ${serviceArea} m² +10%`, 'rule'))
  L.push(line('Tiling', '09-03', 'Wall tiles (m²)', wallTile * 1.1, `Wet-room walls to 1.2 m high plus a 4 m² kitchen splashback, +10%`, 'rule'))
  L.push(line('Tiling', '09-08', 'Tile adhesive standard (bags)', tileTotal / 4, '≈4 m² per 20 kg bag', 'rule'))
  L.push(line('Tiling', '09-10', 'Tile grout (bags)', tileTotal / 20, '≈20 m² per bag', 'rule'))
  L.push(line('Tiling', '09-12', 'Tile spacers (packs)', tileTotal / 25, '≈1 pack per 25 m²', 'rule'))
  L.push(line('Tiling', '09-17', 'Waterproofing membrane for wet areas (litres)', wetArea * 1.2 + 20, `Wet-area floors ${wetArea} m² × ~1.2 L/m² + shower walls ≈20 L`, 'rule'))
  L.push(line('Tiling', '09-07', 'Tile skirting (lengths)', sum(serviceRooms, ([l, n]) => 4 * Math.sqrt(room(l, n))) / 3, 'Perimeter of the service-area rooms ÷ 3 m lengths', 'rule'))

  // ---- Ceilings: hatch + primer
  L.push(line('Ceilings', '05-19', 'Ceiling hatch', 1, 'Access to the geyser and roof void', 'rule'))
  L.push(line('Ceilings', '05-22', 'Ceiling paint primer (litres)', M.ceilingArea / 8, `Gypsum ceiling ${M.ceilingArea} m² ÷ 8 m²/L`, 'rule'))

  // ---- Doors & windows: trims and hardware
  const swing = plan.doors.filter((x) => x.kind !== 'gate' && x.tag !== 'GD1' && x.tag !== 'FD1')
  const swingQty = sum(swing, (x) => x.qty)
  const internalQty = sum(plan.doors.filter((x) => x.kind === 'internal'), (x) => x.qty)
  L.push(line('Doors & Windows', '06-14', 'Door architraves (3 m lengths)', internalQty * 3, 'Both sides of each internal door, ≈3 lengths per door', 'schedule'))
  L.push(line('Doors & Windows', '06-16', 'Butt hinges (pairs)', swingQty * 1.5, '1½ pairs per swing door', 'schedule'))
  L.push(line('Doors & Windows', '06-15', 'Door stops', swingQty, 'One per swing door', 'schedule'))
  L.push(line('Doors & Windows', '06-39', 'Door thresholds (lengths)', plan.doors.filter((x) => x.kind === 'external' && x.tag !== 'GD1').reduce((acc, x) => acc + x.qty, 0), 'One per external door (D1–D3, FD1)', 'schedule'))
  L.push(line('Doors & Windows', '06-37', 'Window sills (3 m lengths)', sum(plan.windows, (w) => (w.qty * (w.w + 200)) / 1000) / 3, 'Sum of window widths + 200 mm projection ÷ 3 m', 'schedule'))
  L.push(line('Doors & Windows', '06-32', 'Window glazing sealant (tubes)', winQty / 2, '≈1 tube per 2 windows', 'rule'))

  // ---- Plumbing extras
  L.push(line('Plumbing', '07-53', 'Geyser insulation (blanket)', 1, 'One per geyser', 'rule'))
  L.push(line('Plumbing', '13-07', 'Stormwater pipe 110 mm (lengths)', 4, 'Downpipes to the street / boundary, ≈24 m assumed', 'rule'))

  // ---- Electrical: the architectural plan has no electrical layout, so this is sized from the rooms
  const ELEC = 'Estimated from room sizes – the architectural plan has no electrical layout (it refers to a separate electrical plan). Replace with the electrical drawing counts'
  const habit = plan.rooms.filter((r) => !/patio|balcony|garage|store|storage/i.test(r.name))
  const living = habit.filter((r) => /lounge|dining|bedroom|study/i.test(r.name))
  const doubles = sum(living, (r) => Math.min(8, Math.max(3, Math.ceil(r.area / 6)))) + 6 + 3 // + kitchen 6, scullery 3
  const singles = habit.length - living.length - 2 + 3 // other rooms 1 each, garage 3 singles (kitchen/scullery counted above)
  const downlights = sum(habit, (r) => Math.max(1, Math.ceil(r.area / 5)))
  const battens = Math.ceil(room('Ground', 'Double garage') / 12) + 2
  const switches1 = habit.filter((r) => r.area < 15).length + 2
  const switches2 = habit.filter((r) => r.area >= 15).length
  const lightPts = downlights + battens + 3
  const pts = lightPts + switches1 + switches2 + doubles + singles
  L.push(line('Electrical', '08-13', 'Distribution board 18-way', 1, ELEC, 'rule'))
  L.push(line('Electrical', '08-14', 'Main switch', 1, ELEC, 'rule'))
  L.push(line('Electrical', '08-15', 'Earth leakage unit', 1, ELEC, 'rule'))
  L.push(line('Electrical', '08-20', 'Surge protection device', 1, ELEC, 'rule'))
  L.push(line('Electrical', '08-16', 'MCB 10 A (lighting circuits)', 3, 'One lighting circuit per ~120 m² of floor', 'rule'))
  L.push(line('Electrical', '08-17', 'MCB 16 A (socket circuits)', 5, ELEC, 'rule'))
  L.push(line('Electrical', '08-18', 'MCB 20 A', 2, ELEC, 'rule'))
  L.push(line('Electrical', '08-19', 'MCB 32 A (stove / geyser)', 2, 'Stove and geyser/solar back-up', 'rule'))
  L.push(line('Electrical', '08-21', 'Neutral bar / earth bar', 2, ELEC, 'rule'))
  L.push(line('Electrical', '08-23', 'Double socket outlets', doubles, `${ELEC}. Living rooms by area, kitchen 6, scullery 3`, 'rule'))
  L.push(line('Electrical', '08-22', 'Single socket outlets', singles, ELEC, 'rule'))
  L.push(line('Electrical', '08-24', 'Weatherproof sockets', 4, 'Patios, balconies', 'rule'))
  L.push(line('Electrical', '08-25', 'Light switch 1 lever', switches1, ELEC, 'rule'))
  L.push(line('Electrical', '08-26', 'Light switch 2 lever', switches2, 'Larger rooms (15 m² and up)', 'rule'))
  L.push(line('Electrical', '08-29', 'LED downlights', downlights, `≈1 per 5 m² of room area (${habit.length} rooms)`, 'rule'))
  L.push(line('Electrical', '08-30', 'LED batten fittings (garage, store)', battens, 'Garage ≈1 per 12 m² + store and storage', 'rule'))
  L.push(line('Electrical', '08-31', 'Pendant light fittings', 3, 'Dining room, foyer, stair', 'rule'))
  L.push(line('Electrical', '08-32', 'Exterior bulkhead lights', 6, 'Entrance, patios, balconies, garage', 'rule'))
  L.push(line('Electrical', '08-33', 'Security floodlights', 2, 'Front and back of the house', 'rule'))
  L.push(line('Electrical', '08-47', 'Smoke detectors', 3, 'One per level + passage', 'rule'))
  L.push(line('Electrical', '08-48', 'Extractor fans', wetRooms.length, 'One per bathroom, en-suite and loo', 'schedule'))
  L.push(line('Electrical', '08-49', 'Doorbell kit', 1, 'Front entrance', 'rule'))
  L.push(line('Electrical', '08-50', 'Outdoor isolator (solar)', 1, 'Roof plan: solar panel collector', 'schedule'))
  L.push(line('Electrical', '08-51', 'Solar-ready conduit', 4, 'Roof to the geyser in the ceiling void', 'rule'))
  L.push(line('Electrical', '08-01', 'PVC conduit 20 mm', (pts * 5) / 3, `${pts} points × ≈5 m ÷ 3 m lengths`, 'rule'))
  L.push(line('Electrical', '08-02', 'PVC conduit 25 mm', 12, 'Sub-mains and risers', 'rule'))
  L.push(line('Electrical', '08-04', 'Conduit bends', pts, 'One per point', 'rule'))
  L.push(line('Electrical', '08-06', 'Conduit saddles (packs)', (pts * 5) / 3 / 10, '≈1 pack per 10 lengths of conduit', 'rule'))
  L.push(line('Electrical', '08-08', 'Junction boxes', lightPts / 4, '≈1 per 4 light points', 'rule'))
  L.push(line('Electrical', '08-10', 'Flush box 1 lever', switches1 + singles, 'For single switches and single sockets', 'rule'))
  L.push(line('Electrical', '08-11', 'Flush box 2 lever', switches2 + doubles, 'For 2-lever switches and double sockets', 'rule'))
  L.push(line('Electrical', '08-35', 'Electrical cable 1.5 mm² (m)', lightPts * 10 + switches1 * 3, 'Lighting circuits ≈10 m per light point', 'rule'))
  L.push(line('Electrical', '08-36', 'Electrical cable 2.5 mm² (m)', (doubles + singles) * 12 + 4 * 12, 'Socket circuits ≈12 m per outlet', 'rule'))
  L.push(line('Electrical', '08-38', 'Electrical cable 6 mm² (m)', 40, 'Stove and geyser/solar feed', 'rule'))
  L.push(line('Electrical', '08-39', 'Earth cable (m)', (lightPts * 10 + (doubles + singles) * 12) / 3, '≈1 m of earth per 3 m of circuit cable', 'rule'))
  L.push(line('Electrical', '08-42', 'Earthing rod', 1, 'Main earth', 'rule'))
  L.push(line('Electrical', '08-43', 'Earth clamp', 2, 'Main earth', 'rule'))
  L.push(line('Electrical', '08-44', 'Cable ties (packs)', 4, 'General', 'rule'))
  L.push(line('Electrical', '08-45', 'Insulation tape (rolls)', 6, 'General', 'rule'))
  L.push(line('Electrical', '08-41', 'TV coaxial cable (m)', 60, 'Lounge, private lounge and bedrooms', 'rule'))
  L.push(line('Electrical', '08-40', 'Telephone/data cable (m)', 80, 'Study, lounges and router point', 'rule'))

  // ---- Group the lines in the order a client reads a house quote
  const ORDER = ['Concrete & Foundations', 'Masonry', 'Stairs', 'Roof', 'Flat roof', 'Plastering', 'Floors & Screed', 'Electrical', 'Plumbing', 'Ceilings', 'Painting', 'Tiling', 'Doors & Windows', 'External Works']
  L.sort((a, b) => ORDER.indexOf(a.source) - ORDER.indexOf(b.source))

  // Labour & services lines that have no trade row on the labour step (quantities from the plan)
  const excavationM3 = Math.ceil(footingLen * 0.6 * 0.8 + slabGround * 0.15)
  const labourItems = {
    '14-01': 1,
    '14-02': 1,
    '14-03': excavationM3,
    '14-04': Math.ceil(excavationM3 * 1.3),
    '14-16': Math.round(slabInterior),
    '14-20': Math.round(flat)
  }

  return {
    lines: L,
    metrics: M,
    labourBasis: {
      brickwork: Math.round(M.netWall),
      plastering: Math.round(M.plasterArea),
      roofing: Math.round(plan.roof.slopedArea),
      painting: Math.round(M.extNet + M.intNet * 2 + ceilPaint + M.extNet),
      tiling: Math.round(tileTotal),
      plumbing: plan.fixtures.filter((f) => !/gully/i.test(f.name)).reduce((s, f) => s + f.qty, 0),
      electrical: pts,
      general: 20
    },
    labourItems,
    unmatched: UNMATCHED_PLAN_ITEMS
  }
}
