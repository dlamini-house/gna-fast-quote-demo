# GNA Fast Quote — demo

A frontend-only demo of the GNA Fast Quote workflow: no backend, no
authentication, no cloud dependency. All data (credits, trial status, saved
quotes) lives in the browser's `localStorage`, so it's meant for walking
through the flow and showing stakeholders — not for real users yet.

## Signing in — how the demo's mini database works

There is still no real backend, but sign-in is no longer a blind pass-through.
The demo now has a small local "user directory" (built on the existing
applications list) with real approve → sign-in gating:

- **Sign up** (`/sign-up`) creates a real account: full name, email,
  **password**, company info, NHBRC number/expiry, NHBRC certificate upload,
  and an optional company logo upload — all saved as one record, status
  `pending`.
- An **admin must approve it** (Potential Users → View → Accept) before that
  email/password can sign in. A pending or rejected account is told exactly
  that if it tries.
- Once verified, the contractor can **sign in for real** at `/` with the
  email and password they registered with. Routes like `/dashboard`,
  `/new-quote`, `/quotes`, `/pricing` and `/profile` now redirect to Sign In
  if nobody's signed in.
- Every signed-in contractor only ever sees **their own** quotes and **their
  own** uploaded logo/certificate — nothing global is shared between
  accounts. Two ready-to-use verified demo logins:
  - `david@dcdeng.co.za` / `Contractor2026` (DCD Engineering)
  - `anel@avdesigns.co.za` / `Contractor2026` (AV Designs)
  (Both can be given their own logo from **Profile** to see it reflected on
  their next generated quote.)
- **Admin sign-in** (`/admin-sign-in`) is a real email/password form checked
  against the seeded admin accounts (demo password for all of them:
  `GnaAdmin2026`), with a quick-fill panel underneath for convenience:
  - `gavine@gnafastquote.co.za` — **Master Admin**, full access.
  - `lamu@dlaminihouse.co.za` / `support@gnafastquote.co.za` — **Admin**,
    can review/verify contractors but the "Admins" tab is hidden entirely
    (and the route itself redirects away if visited directly).
  - A Master Admin can create more admins from **Admins → Add Admin User**,
    setting that new admin's own sign-in password.
- **Contractor portal**: Dashboard, New Quote (5-step wizard), Quotes list
  (scoped to the signed-in account), Pricing & Credits, Profile (company
  info + NHBRC certificate + company logo, all tied to that account),
  Terms & Conditions.
- **Admin portal**: Potential Users, Verified Users, Rejected Profiles,
  Admins (Master Admin only). Clicking **View** on any applicant opens their
  full details — company info, NHBRC number and expiry date, the uploaded
  certificate rendered inline, and their uploaded company logo — with
  Accept/Reject right there.
- **New Quote wizard, rebuilt around real pricing**: Upload Plan → Review
  Extracted Info → Pricing Engine → Add Labour Rate → Generate PDF Quote.
  Material line items are real rows pulled from
  `GNA_Constraction_price_list_App_data.xlsx` (Product Code, Description,
  Quantity, Rate). Labour is **per-trade, not a blanket markup** — each
  trade (brickwork, plastering, roofing, painting, tiling, plumbing,
  electrical, general) gets its own rate against a plan-derived basis
  quantity (m², point count, or days), plus fixed line items (site
  supervision, project management, subcontractor allowance). Mark-up %,
  VAT %, and a Transport Allowance are all contractor-editable. The final
  step shows a live Quote Summary, an "Open PDF-Ready Quote" preview
  (Reference number, Date, Project/Client/Site, itemized totals,
  Assumptions and Exclusions), then a real downloadable PDF matching it.
- **A local database** (`src/data/db.js`): Promise-based `get`/`set`/
  `list`/`remove` over `localStorage`, collection-and-document shaped like
  a real document database. Every generated quote is saved through it,
  tagged with the owner's email so it's easy to see how this maps onto a
  real per-user `quotes` collection later. It's written so the calling code
  doesn't change if this gets swapped for real Firestore later — same
  function shapes, just Promises instead of local reads. The user
  directory itself (accounts, passwords, logos, certificates) lives in the
  main app state (`src/data/store.js`) rather than `db.js`, so every page
  updates instantly without an async round-trip — same `localStorage`
  persistence underneath either way.
- The pricing engine math: `(Material + Labour + Transport) × (1 + markup%)
  × (1 + VAT%)` — verified against the reference screenshots' numbers.
- **Generate PDF**: the GNA Fast Quote logo renders large and clear,
  top-left. If you've uploaded your own company logo (at sign-up or in
  Profile), it appears top-right, correctly scaled to its own aspect ratio.
- **Simulated plan extraction**: uploading a file in New Quote → Step 1
  shows a brief "Analyzing plan…" loading state, then pre-fills the
  material and labour quantities, flagged for the contractor to confirm.
- Free trial tracking: 7 days or 3 quotes, whichever comes first.

## What's deliberately stubbed for this demo

- Passwords are stored and compared in plain text in `localStorage` — fine
  for a client-facing demo on your own machine, but obviously not how real
  authentication would work. A real build would use Firebase Auth (or
  similar) for hashing, sessions and password resets, not a hand-rolled
  check like this.
- Plan upload doesn't actually parse the file — the "extraction" is
  simulated with fixed demo values pulled from the real price list.
- No payment gateway call — buying credits/plans just updates local state;
  the "1 credit" note on the quote summary is illustrative, not enforced.
- **The local database is per-browser, not shared.** `db.js` uses
  `localStorage`, so what you save only exists on that one device, in that
  one browser. It will NOT sync between your laptop and a client's laptop,
  or survive clearing browser data. A genuinely shared, cross-device
  database needs a real backend — the project's chosen stack is Firestore
  (see the project's decisions doc), which is a drop-in replacement for
  this module's four functions whenever that's wired up.
- Uploaded certificates, logos and documents are stored as base64, so very
  large files could hit the browser's storage limit — fine for demo-sized
  files, not how a real build would handle them (that's Cloud Storage's
  job).
- Refreshing after clearing browser storage resets everything.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Build a static bundle

```bash
npm run build
```

Output goes to `dist/`. This is a plain static site — no server required.

## Deploy

Any static host works since there's no backend to run:

- **Netlify / Vercel**: connect the repo, build command `npm run build`,
  publish directory `dist`. Both will auto-deploy on every push.
- **GitHub Pages**: push `dist/` to a `gh-pages` branch (or use the
  `gh-pages` npm package), then enable Pages on that branch in the repo
  settings. The router uses `HashRouter` and a relative `base` in
  `vite.config.js` specifically so this works without extra rewrite rules.
- **Just open it locally**: after `npm run build`, you can open
  `dist/index.html` directly in a browser for a quick look, though some
  browsers restrict `fetch`/module loading from `file://` — a static server
  (`npx serve dist`) is more reliable.
