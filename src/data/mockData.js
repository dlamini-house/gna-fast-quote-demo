// Trade-category line items, ported from GnA_Quote_master.xlsx.
// Each row is priced as qty x unitPrice, minus discount%, then VAT'd.
export const TRADE_CATEGORIES = [
  { id: 'structural', label: 'Ground and first floor building structural' },
  { id: 'foundation', label: 'Preparation of concrete slabs and foundation' },
  { id: 'stairs', label: 'Stairs' },
  { id: 'roofing', label: 'Roofing and rainwater goods' },
  { id: 'plastering', label: 'Plastering and screed' },
  { id: 'electrical', label: 'Electricity and solar system complete' },
  { id: 'plumbing', label: 'Plumbing and all accessories' },
  { id: 'ceiling', label: 'Ceiling' },
  { id: 'painting', label: 'Painting' },
  { id: 'tiling', label: 'Tiling' },
  { id: 'doorsWindows', label: 'Doors and windows' },
  { id: 'excavation', label: 'Excavation and removal to dump site' }
]

export const VAT_RATE = 0.15

// Demo-only stand-in for real plan measurements. In production this is where
// reviewed, CAD-viewer-measured quantities would land instead.
export const MOCK_EXTRACTED_QUANTITIES = {
  structural: { qty: 140, unitPrice: 275 },
  foundation: { qty: 140, unitPrice: 152 },
  stairs: { qty: 1, unitPrice: 6800 },
  roofing: { qty: 160, unitPrice: 150 },
  plastering: { qty: 280, unitPrice: 45 },
  electrical: { qty: 1, unitPrice: 18750 },
  plumbing: { qty: 1, unitPrice: 15300 },
  ceiling: { qty: 140, unitPrice: 69 },
  painting: { qty: 280, unitPrice: 26 },
  tiling: { qty: 90, unitPrice: 122 },
  doorsWindows: { qty: 14, unitPrice: 1170 },
  excavation: { qty: 140, unitPrice: 39 }
}

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
