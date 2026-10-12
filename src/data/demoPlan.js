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
import { DEFAULT_PRICE_LIST } from './defaultPriceList'

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
for (const c of DEFAULT_PRICE_LIST.categories) {
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
    unit: p?.unit || 'EA',
    qty: Math.max(0, Math.ceil(qty)),
    rate: p?.price ?? 0,
    basis,
    basisType: source, // 'schedule' | 'measured' | 'rule'
    inList: !!p
  }
}

// Plan elements the architectural drawing calls for but the standard price
// list has no row for — shown to the estimator so they can price them manually.
export const UNMATCHED_PLAN_ITEMS = [
  { item: 'Fire-rated door sets (D3 ×2)', note: 'Priced as solid external doors – confirm Class B fire rating with supplier' },
  { item: 'Automated garage-door opener (GD1)', note: 'No matching row in the price list' },
  { item: 'Solar collector panel for hot water', note: 'Only a standard electric geyser is listed' },
  { item: 'Door frames (pressed steel / meranti)', note: 'No frame rows in the price list' },
  { item: 'Garden-gate auto closer & latch (GG1)', note: 'No matching row in the price list' },
  { item: 'Electrical layout', note: 'Not on the architectural plan – see the separate electrical drawing' },
  { item: 'Floor / wall tile finishes', note: 'Finishes not specified on these sheets – add under Items Not on Plan' }
]

export function buildTakeoff(plan = DEMO_PLAN) {
  const M = planMetrics(plan)
  const L = []
  const walling = M.extNet * 100 + M.intNet * 50 // bricks per m²: 100 (220 wall), 50 (110 wall)
  const bricks = walling * 1.05
  const slabGround = M.groundFloor
  const slabFirst = M.firstFloor
  const footingLen = plan.walls.external.ground + plan.walls.internal.ground

  // ---- Foundations & concrete
  const concreteM3 = slabGround * 0.1 + footingLen * 0.6 * 0.2 + slabFirst * 0.17
  L.push(line('Concrete & Foundations', '9/0190894', 'Ready-mix concrete 25 MPa (cube)', concreteM3 * 1.05,
    `Ground slab ${slabGround.toFixed(2)} m² × 100 mm + strip footings ${footingLen} m × 600×200 + first-floor slab ${slabFirst.toFixed(2)} m² × 170 mm, +5% waste`, 'rule'))
  L.push(line('Concrete & Foundations', '1074225', 'Reinforcing Y12 bar 6.0 m', (slabFirst * 0.17 * 70 + footingLen * 0.12 * 40) / 5.33,
    'First-floor slab (≈70 kg/m³) and footings (≈40 kg/m³) ÷ 5.33 kg per Y12 6 m bar', 'rule'))
  L.push(line('Concrete & Foundations', '1022540', 'Welded mesh Ref 193 sheet 6.0×2.4 m', (slabGround + slabFirst) * 1.1 / 12.9,
    `Ground + first-floor slab ${(slabGround + slabFirst).toFixed(2)} m² ÷ 12.9 m² usable per sheet, +10% laps`, 'rule'))
  L.push(line('Concrete & Foundations', '2000026', 'Damp-proof membrane under ground slab', slabGround / 100,
    `Ground slab ${slabGround.toFixed(2)} m² ÷ ~100 m² per roll (plan section shows membrane under slab)`, 'rule'))
  L.push(line('Concrete & Foundations', '2000266', 'Geotextile under slab', slabGround / 100,
    'Plan slab detail shows geotextile; ~100 m² per roll', 'rule'))

  // ---- Masonry
  L.push(line('Masonry', '2000001', 'Stock bricks (plan: 220 mm external, 110 mm internal)', bricks,
    `External net ${M.extNet.toFixed(1)} m² × 100 + internal net ${M.intNet.toFixed(1)} m² × 50 bricks/m², +5% waste. Walls: ${M.extLen} m external + ${M.intLen} m internal × ${plan.walls.height} m high, less openings`, 'measured'))
  L.push(line('Masonry', '2000011', 'Cement for mortar', (bricks / 1000) * 6,
    '≈6 bags of cement per 1 000 bricks', 'rule'))
  L.push(line('Masonry', '2000013', 'Building sand for mortar (per load)', ((bricks / 1000) * 0.45) / 6,
    '≈0.45 m³ sand per 1 000 bricks ÷ 6 m³ load', 'rule'))
  L.push(line('Masonry', '2000021', 'Brickforce (per metre)', M.netWall * 3.3,
    'One layer every 4th course ≈ 3.3 m per m² of wall', 'rule'))
  L.push(line('Masonry', '1000841', 'DPC 225 mm × 40 m roll', ((plan.walls.external.ground + plan.walls.internal.ground) * 1.1) / 40,
    `Ground-floor wall length ${plan.walls.external.ground + plan.walls.internal.ground} m, +10% laps`, 'measured'))
  const winSteel = plan.windows.filter((w) => w.w >= 2000).reduce((s, w) => s + w.qty, 0)
  const steelLintels = winSteel + plan.doors.filter((d) => d.kind !== 'gate' && d.w >= 2000).reduce((s, d) => s + d.qty, 0)
  const precastLintels = M.totalWindows - winSteel + plan.doors.filter((d) => d.kind !== 'gate' && d.w < 2000).reduce((s, d) => s + d.qty, 0)
  L.push(line('Masonry', '2000024', 'Precast concrete lintels', precastLintels,
    'One per opening under 2.0 m wide (remaining windows + doors from the schedules)', 'schedule'))
  L.push(line('Masonry', '2000025', 'Steel lintels (openings 2.0 m and wider)', steelLintels,
    'Windows W1, W5, W9 plus folding doors FD1 and garage door GD1', 'schedule'))

  // ---- Plaster
  const plasterCement = M.plasterArea * 0.12
  L.push(line('Plastering', '2000012', 'Plaster cement', plasterCement,
    `Plastered area ${M.plasterArea.toFixed(0)} m² (both faces) × ~0.12 bag/m² at 15 mm`, 'rule'))
  L.push(line('Plastering', '2000014', 'Plaster sand (per load)', (M.plasterArea * 0.017 * 1.15) / 6,
    '15 mm plaster ≈ 0.017 m³/m² + 15% bulking ÷ 6 m³ load', 'rule'))

  // ---- Roof
  const roof = plan.roof
  L.push(line('Roof', '2000066', 'Prefabricated roof trusses', Math.ceil(15.7 / 1.0) + 1,
    'Roof length ≈15.7 m at 1.0 m truss spacing + 1 end truss (30° pitch)', 'measured'))
  L.push(line('Roof', '2000068', 'Concrete roof tiles', roof.slopedArea * 10 * 1.05,
    `Plan roof ${roof.planArea} m² ÷ cos 30° ≈ ${roof.slopedArea} m² × 10 tiles/m², +5%`, 'rule'))
  L.push(line('Roof', '2000062', 'Roof battens (6 m lengths)', (roof.slopedArea / 0.35 * 1.1) / 6,
    `${roof.slopedArea} m² at 350 mm batten spacing, +10%`, 'rule'))
  L.push(line('Roof', '1062572', 'Roof underlay roll 1.5×30 m', (roof.slopedArea * 1.1) / 45,
    `${roof.slopedArea} m² +10% ÷ 45 m² per roll`, 'rule'))
  L.push(line('Roof', '2000073', 'Ridge / hip / verge (per length)', 30 / 6,
    '≈30 m of ridge + hips from the roof plan ÷ 6 m lengths', 'measured'))
  L.push(line('Roof', '2000076', 'Fascia boards (6 m lengths)', roof.eavesPerimeter / 6,
    `Eaves perimeter ≈${roof.eavesPerimeter} m`, 'measured'))
  L.push(line('Roof', '2000078', 'Gutters (6 m lengths)', roof.eavesPerimeter / 6,
    'Along eaves – plan notes require gutters & downpipes to SANS 10400-M', 'measured'))
  L.push(line('Roof', '2000079', 'Downpipes', 4, '≈4 downpipes (one per ~15 m of gutter)', 'rule'))
  L.push(line('Roof', '2000067', 'Truss clips / straps / tie-downs', (Math.ceil(15.7) + 1) * 4,
    '4 fixings per truss', 'rule'))
  L.push(line('Roof', '2000100', 'Thermal insulation roll', M.ceilingArea / 20,
    `Ceiling area ${M.ceilingArea} m² ÷ ~20 m² per roll`, 'rule'))

  // ---- Ceilings
  L.push(line('Ceilings', '1304135', 'Plasterboard 6.4×1200×3000 mm', (M.ceilingArea * 1.08) / 3.6,
    `First-floor ceiling ${M.ceilingArea} m² (floor area less walls) ÷ 3.6 m² per sheet, +8%`, 'rule'))
  L.push(line('Ceilings', '2000090', 'Timber brandering (6 m lengths)', ((M.ceilingArea / 0.6) * 1.1) / 6,
    'Brandering at 600 mm centres, +10%', 'rule'))
  L.push(line('Ceilings', '2000095', 'Jointing compound', (M.ceilingArea * 1.08) / 3.6 / 25, '≈1 per 25 boards', 'rule'))
  L.push(line('Ceilings', '2000094', 'Joint tape', (M.ceilingArea * 1.08) / 3.6 / 40, '≈1 roll per 40 boards', 'rule'))
  L.push(line('Ceilings', '2000093', 'Ceiling screws', (M.ceilingArea * 1.08) / 3.6 / 20, '≈1 box per 20 boards', 'rule'))
  L.push(line('Ceilings', '2000097', 'Cornices (6 m lengths)', Math.ceil(plan.rooms.filter((r) => r.level === 'First' && !/balcony/i.test(r.name)).reduce((s, r) => s + 4 * Math.sqrt(r.area), 0) / 3),
    'Room perimeters from the first-floor room areas (≈4√area each) ÷ 3 m lengths', 'measured'))

  // ---- Doors (door schedule)
  const d = (tag) => plan.doors.find((x) => x.tag === tag)
  L.push(line('Doors & Windows', '1383507', `Doors D1, D2, D3 – external / entrance doors (D1 ×${d('D1').qty}, D2 ×${d('D2').qty}, D3 ×${d('D3').qty} fire)`,
    d('D1').qty + d('D2').qty + d('D3').qty, 'Door schedule: D1 pivot, D2 timber external, D3 fire doors ×2 (closest price-list match)', 'schedule'))
  L.push(line('Doors & Windows', '1108846', `Internal doors D4 ×${d('D4').qty} (760×2060) + D5 ×${d('D5').qty} (650×2060)`,
    d('D4').qty + d('D5').qty, 'Door schedule: D4 ×10 + D5 ×1 hollow-core internal doors', 'schedule'))
  L.push(line('Doors & Windows', '2000105', `Folding doors FD1 ×${d('FD1').qty} (4000×2100)`, d('FD1').qty, 'Door schedule: FD1 ×2 aluminium folding doors', 'schedule'))
  L.push(line('Doors & Windows', '2000106', `Garage door GD1 (4880×2425)`, d('GD1').qty, 'Door schedule: GD1 ×1 timber garage door', 'schedule'))
  L.push(line('External Works', '2000262', `Garden gates GG1 ×${d('GG1').qty} (1000×1715)`, d('GG1').qty, 'Door schedule: GG1 ×2 pedestrian garden gates', 'schedule'))
  const handled = plan.doors.filter((x) => x.kind !== 'gate' && x.tag !== 'GD1' && x.tag !== 'FD1').reduce((s, x) => s + x.qty, 0)
  L.push(line('Doors & Windows', '2000118', 'Door handles / locks / hinges sets', handled,
    'One set per swing door (D1–D5)', 'schedule'))

  // ---- Windows (glazing schedule)
  const topHung = plan.windows.filter((w) => !w.fixed)
  const fixed = plan.windows.filter((w) => w.fixed)
  const topHungQty = sum(topHung, (w) => w.qty)
  L.push(line('Doors & Windows', '1339138',
    `Aluminium top-hung + fixed windows – ${topHung.map((w) => `${w.tag}×${w.qty}`).join(', ')}`,
    topHungQty, `Glazing schedule: ${topHungQty} aluminium windows (W1–W9), glazed area ${sum(topHung, (w) => w.qty * m2(w.w, w.h)).toFixed(1)} m²`, 'schedule'))
  if (fixed.length) {
    L.push(line('Doors & Windows', '2000109', `Fixed window – ${fixed.map((w) => `${w.tag}×${w.qty}`).join(', ')}`,
      sum(fixed, (w) => w.qty), 'Glazing schedule: CW1 fixed panel 600×1800', 'schedule'))
  }
  L.push(line('Doors & Windows', '2000119', 'Window stays / handles / locks', topHungQty,
    'One set per opening window', 'schedule'))

  // ---- Plumbing (fixture tags)
  const fx = (n) => plan.fixtures.find((f) => f.name === n)?.qty || 0
  L.push(line('Plumbing', '2000134', 'WC suites', fx('WC'), 'Fixture tags on floor plans', 'schedule'))
  L.push(line('Plumbing', '2000135', 'Hand-wash basins', fx('Hand-wash basin'), 'Fixture tags on floor plans', 'schedule'))
  L.push(line('Plumbing', '2000136', 'Baths', fx('Bath'), 'Fixture tags on floor plans', 'schedule'))
  L.push(line('Plumbing', '2000137', 'Shower sets', fx('Shower'), 'Fixture tags on floor plans', 'schedule'))
  L.push(line('Plumbing', '2000139', 'Kitchen sink', fx('Kitchen sink'), 'Fixture tag on floor plan', 'schedule'))
  L.push(line('Plumbing', '2000128', '200 L geyser (hot-water storage vessel)', fx('200 L hot-water storage vessel (solar, in ceiling void)'),
    'Water reticulation sheet: 200 L vessel in ceiling void', 'schedule'))
  L.push(line('Plumbing', '2000129', 'Geyser drip tray', 1, 'One per geyser', 'rule'))
  L.push(line('Plumbing', '2000130', 'Geyser valves / vacuum breakers', 1, 'One set per geyser', 'rule'))
  L.push(line('Plumbing', '2000147', 'Garden tap', fx('Garden tap'), 'Water-reticulation sheet: tap at water meter', 'schedule'))
  L.push(line('Plumbing', '2000143', 'P-traps / bottle traps', fx('Hand-wash basin') + fx('Bath') + fx('Shower') + fx('Kitchen sink') + fx('Dishwasher point') + fx('Washing-machine point'),
    'One trap per waste fixture', 'rule'))
  L.push(line('Plumbing', '2000144', 'Inspection chambers / gully covers', fx('Floor gully'), 'Floor gully tags on GF plan', 'schedule'))
  L.push(line('Plumbing', '2000141', 'uPVC 110 mm soil / sewer pipe (lengths)', 10, 'Drainage notes: 110 mm uPVC soil pipe, ≈60 m run ÷ 6 m', 'rule'))
  L.push(line('Plumbing', '2000142', 'Soil fittings / bends / junctions', 20, 'Approx. 2 per WC / junction run', 'rule'))
  L.push(line('Plumbing', '2000124', 'Water pipe Ø20 (lengths)', 20, 'Water reticulation layout: ≈120 m hot + cold Ø20 ÷ 6 m', 'rule'))

  // ---- Painting (derived areas)
  const paintInt = (M.extNet + M.intNet * 2) + M.ceilingArea
  L.push(line('Painting', '2000203', 'Interior wall paint 5 L', (M.extNet + M.intNet * 2) * 2 / 30,
    `Internal wall faces ${(M.extNet + M.intNet * 2).toFixed(0)} m² × 2 coats ÷ 30 m² per 5 L`, 'rule'))
  L.push(line('Painting', '2000204', 'Ceiling paint 5 L', (M.ceilingArea * 2) / 30, `Ceiling ${M.ceilingArea} m² × 2 coats ÷ 30 m² per 5 L`, 'rule'))
  L.push(line('Painting', '2000206', 'Exterior wall paint 5 L', (M.extNet * 2) / 30, `External faces ${M.extNet.toFixed(0)} m² × 2 coats ÷ 30 m² per 5 L`, 'rule'))
  L.push(line('Painting', '2000208', 'Plaster primer / sealer 5 L', (M.extNet * 2 + M.intNet * 2 + M.extNet) / 60,
    'Primer coat over plastered area ÷ 60 m² per 5 L', 'rule'))
  void paintInt

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
