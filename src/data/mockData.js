// Real rows pulled from GNA_Constraction_price_list_App_data.xlsx — the
// "Mapped Material Items" a real CAD extraction would resolve plan elements
// against. Quantities are demo estimates standing in for real takeoff
// measurements.
export const MOCK_EXTRACTED_MATERIALS = [
  { id: 'm1', source: 'Building', code: '9/0190894', description: 'Ready Mix Concrete per Cube 25mpa', unit: 'EA', qty: 9, rate: 1635.29 },
  { id: 'm2', source: 'Building', code: '1000841', description: 'DPC 225mmx40m 375mic SABS ( 9.00sqm)', unit: 'EA', qty: 6, rate: 143.51 },
  { id: 'm3', source: 'Steel', code: '1074225', description: 'Reinforcing Y-Bar 450MPa 12mm x 6.0m', unit: 'EA', qty: 48, rate: 108.69 },
  { id: 'm4', source: 'Steel', code: '1022540', description: 'Welded Mesh Ref 193 200x200x5.6mm 6.0x2.4m Sheet', unit: 'EA', qty: 10, rate: 512.17 },
  { id: 'm5', source: 'Timber & Roof', code: '1205101', description: 'SA Pine S5P U/T 38x114 6.000m', unit: 'EA', qty: 32, rate: 183.53 },
  { id: 'm6', source: 'Timber & Roof', code: '1062572', description: 'Undertile Woven 1.50x30m ( 45sqm)', unit: 'EA', qty: 6, rate: 433.91 },
  { id: 'm7', source: 'Ceiling', code: '1304135', description: 'Plasterboard 6.4x1200x3000mm S/E Siniat', unit: 'EA', qty: 104, rate: 247.82 },
  { id: 'm8', source: 'Ceiling', code: '1020856', description: 'Rhinolite Plaster Multipurpose 40kg Gypsum', unit: 'EA', qty: 14, rate: 442.61 },
  { id: 'm9', source: 'Doors & Windows', code: '1108846', description: 'Door Hardboard Hollow Core EE 813x2032mm', unit: 'EA', qty: 16, rate: 329.56 },
  { id: 'm10', source: 'Doors & Windows', code: '1383507', description: 'Door Hardwood 8 Panel Stable 813x2032mm SD28S', unit: 'EA', qty: 4, rate: 1520.87 },
  { id: 'm11', source: 'Doors & Windows', code: '1339138', description: 'Window Aluminium Top Hung 900x900 1 Vent Bronze 28mm Casing', unit: 'EA', qty: 8, rate: 935.85 },
  { id: 'm12', source: 'Doors & Windows', code: '1025362', description: 'Window Aluminium Top Hung 1200x1200 2 Vent Bronze', unit: 'EA', qty: 8, rate: 1433.91 },
  { id: 'm13', source: 'Doors & Windows', code: '1025367', description: 'Window Aluminium Top Hung 1500x1200 2 Vent Bronze', unit: 'EA', qty: 7, rate: 1433.91 }
]

// Per-trade labour: contractor sets a rate against a plan-derived basis
// quantity (m², point count, or days), rather than one blanket markup %.
export const UNIT_OPTIONS = [
  { id: 'sqm', label: 'per m²' },
  { id: 'point', label: 'per point' },
  { id: 'day', label: 'per day' }
]

export const LABOUR_TRADES = [
  { id: 'brickwork', label: 'Brickwork Labour', unit: 'sqm', basis: 165 },
  { id: 'plastering', label: 'Plastering Labour', unit: 'sqm', basis: 180 },
  { id: 'roofing', label: 'Roofing Labour', unit: 'sqm', basis: 205 },
  { id: 'painting', label: 'Painting Labour', unit: 'sqm', basis: 180 },
  { id: 'tiling', label: 'Tiling Labour', unit: 'sqm', basis: 120 },
  { id: 'plumbing', label: 'Plumbing Labour', unit: 'point', basis: 18 },
  { id: 'electrical', label: 'Electrical Labour', unit: 'point', basis: 34 },
  { id: 'general', label: 'General Labour', unit: 'day', basis: 20 }
]

export const LABOUR_FIXED = [
  { id: 'supervision', label: 'Site Supervision', amount: 1500 },
  { id: 'projectMgmt', label: 'Project Management Fee', amount: 2000 },
  { id: 'subcontractor', label: 'Subcontractor Allowance', amount: 3000 }
]

// Demo-only starting rates matching the reference implementation's numbers
// exactly, so the Live Labour Summary reproduces R71,625.00 out of the box —
// contractors can still edit every value.
export const DEMO_LABOUR_RATES = {
  brickwork: 0,
  plastering: 75,
  roofing: 85,
  painting: 55,
  tiling: 95,
  plumbing: 120,
  electrical: 110,
  general: 350
}

export const VAT_RATE = 0.15

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 299,
    quotesPerMonth: 10,
    features: ['Access to all features', 'Create PDF quotes', 'Email support']
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 599,
    quotesPerMonth: 25,
    popular: true,
    features: ['Access to all features', 'Create PDF quotes', 'Priority support']
  },
  {
    id: 'proPlus',
    name: 'Pro Plus',
    price: 899,
    quotesPerMonth: 50,
    features: [
      'Access to all features',
      'Create PDF quotes',
      'Priority support',
      'Bulk project handling'
    ]
  }
]

export const ADDITIONAL_CREDIT_PRICE = 40

export const TRIAL_DAYS = 7
export const TRIAL_QUOTES = 3

export const COMPANY_LEGAL_LINE = '© 2026 GnA Fast Quote (Pty) Ltd   Reg No: 2026/323682/07'
