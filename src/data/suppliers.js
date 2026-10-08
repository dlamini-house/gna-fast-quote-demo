// Single source of truth for supplier branding used across the app (the
// Dashboard/Sign Up trust banner and the New Quote supplier picker) and for
// which suppliers currently have a live price list wired up.
//
// All six suppliers are active. Each has its own upload section in
// Admin -> Price Lists (keyed by `slug`), and New Quote looks up the chosen
// supplier's uploaded list by that same slug. A supplier with no upload yet
// falls back to the built-in reference pricing. To take one offline again,
// set its `active` flag to false.
export const SUPPLIERS = [
  { slug: 'buco', name: 'BUCO', src: './suppliers/buco.jpg', active: true },
  { slug: 'leroy-merlin', name: 'Leroy Merlin', src: './suppliers/leroy-merlin.jpg', active: true },
  { slug: 'buildit', name: 'Build it', src: './suppliers/buildit.jpg', active: true },
  { slug: 'cashbuild', name: 'Cashbuild', src: './suppliers/cashbuild.png', active: true },
  { slug: 'cosave-powerbuild', name: 'Cosave Powerbuild & Wholesalers', src: './suppliers/cosave-powerbuild.jpg', active: true },
  { slug: 'builders-warehouse', name: 'Builders Warehouse', src: './suppliers/builders-warehouse.png', active: true }
]
