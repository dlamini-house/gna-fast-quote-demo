# GNA Fast Quote — demo

A frontend-only demo of the GNA Fast Quote workflow: no backend, no
authentication, no cloud dependency. All data (credits, trial status, saved
quotes) lives in the browser's `localStorage`, so it's meant for walking
through the flow and showing stakeholders — not for real users yet.

## What's in here

- **Sign in** (`/`) — real GNA Fast Quote logo prominent on both the left
  hero panel and the form card. Any email/password (or none) gets you in —
  see below. Small link at the bottom for the admin side.
- **Sign up** (`/sign-up`) — logo at the top, full registration form
  including an **NHBRC Expiry Date** field (DD/MM/YYYY), a **real file
  upload** for the NHBRC certificate (PDF, JPG or PNG, max 10MB), an
  optional **company logo upload** (PNG/JPEG/WEBP/SVG, max 5MB — this is
  what appears on your generated quote PDFs), and a Terms & Conditions link
  that opens the **exact, full legal text** from
  `Terms_and_conditions_of_use_.docx` in an iframe. Submitting creates a
  real pending application in the admin portal, certificate included.
- **Admin sign-in** (`/admin-sign-in`) — demo-only picker between the three
  seeded admin accounts. Whichever you pick decides what you can see next:
  - `gavine@gnafastquote.co.za` — **Master Admin**, full access.
  - `lamu@dlaminihouse.co.za` / `support@gnafastquote.co.za` — **Admin**,
    can review/verify contractors but the "Admins" tab is hidden entirely
    (and the route itself redirects away if visited directly).
- **Contractor portal**: Dashboard, New Quote (5-step wizard), Quotes list,
  Pricing & Credits, Profile (now includes the company logo upload too),
  Terms & Conditions (same full document as sign-up).
- **Admin portal**: Potential Users, Verified Users, Rejected Profiles,
  Admins (Master Admin only). Clicking **View** on any applicant opens their
  full details — company info, NHBRC number and expiry date, and the actual
  uploaded certificate rendered inline — with Accept/Reject right there.
  Search bar removed from every admin page per your request.
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
  a real document database. Company profile info, the NHBRC certificate
  (editable from Profile, not just at sign-up), and every generated quote
  are saved through it. It's written so the calling code doesn't change if
  this gets swapped for real Firestore later — same function shapes, just
  Promises instead of local reads.
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

- Sign in doesn't check credentials. Sign up *does* create a real record,
  but nothing gates contractor access based on verification status — a
  rejected or still-pending contractor can still use the Dashboard.
- The admin "sign-in" is a picker, not real authentication — anyone can
  pick Master Admin. In production this would come from Firebase Auth
  custom claims, not a dropdown.
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
