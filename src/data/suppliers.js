// Single source of truth for supplier branding used across the app (the
// Dashboard/Sign Up trust banner and the New Quote supplier picker) and for
// which suppliers currently have a live price list wired up.
//
// To bring a new supplier online once GNA has their spreadsheet: flip its
// `active` flag to true here, and give Admin -> Price Lists an upload slot
// for that supplier's slug. Nothing else needs to change — New Quote already
// keys its price-list lookup off the chosen supplier's slug.
export const SUPPLIERS = [
  { slug: 'buco', name: 'BUCO', src: './suppliers/buco.jpg', active: true },
  { slug: 'leroy-merlin', name: 'Leroy Merlin', src: './suppliers/leroy-merlin.jpg', active: false },
  { slug: 'buildit', name: 'Build it', src: './suppliers/buildit.jpg', active: false },
  { slug: 'cashbuild', name: 'Cashbuild', src: './suppliers/cashbuild.png', active: false },
  { slug: 'dreiers', name: 'Dreiers', src: './suppliers/dreiers.jpg', active: false },
  { slug: 'builders-warehouse', name: 'Builders Warehouse', src: './suppliers/builders-warehouse.png', active: false }
]
