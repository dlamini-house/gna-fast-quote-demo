// Vercel serverless function: confirms with Paystack that a payment really
// happened, and works out how many credits it is worth.
//
// The secret key lives ONLY here, as the Vercel environment variable
// PAYSTACK_SECRET_KEY. It is never sent to the browser.
//
// The browser sends us just a payment reference. We ask Paystack what was
// actually paid, and decide the credits from the amount PAID (never from
// anything the browser claims), so nobody can pay R40 and ask for 50 credits.
import { PLANS, ADDITIONAL_CREDIT_PRICE } from '../src/data/mockData.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Use POST' })

  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    return res.status(500).json({ ok: false, error: 'PAYSTACK_SECRET_KEY is not set on the server (Vercel > Settings > Environment Variables).' })
  }

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  const reference = body && typeof body.reference === 'string' ? body.reference.trim() : ''
  if (!/^[A-Za-z0-9._=-]{6,100}$/.test(reference)) {
    return res.status(400).json({ ok: false, error: 'Missing or invalid payment reference.' })
  }

  let data
  try {
    const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` }
    })
    const json = await r.json()
    if (!r.ok || !json.status) {
      return res.status(502).json({ ok: false, error: json.message || 'Paystack could not verify this payment.' })
    }
    data = json.data
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'Could not reach Paystack. Please try again.' })
  }

  if (data.status !== 'success') {
    return res.status(402).json({ ok: false, error: `Payment not successful (status: ${data.status}).` })
  }
  if (data.currency !== 'ZAR') {
    return res.status(400).json({ ok: false, error: `Unexpected currency ${data.currency}.` })
  }

  // What was bought is read from the metadata we attached, but the credits are
  // worked out from the money actually received.
  const meta = data.metadata || {}
  const paidRand = data.amount / 100
  let credits = 0
  let plan = null
  let description = ''

  if (meta.kind === 'plan') {
    const p = PLANS.find((x) => x.id === meta.planId)
    if (!p || paidRand !== p.price) {
      return res.status(400).json({ ok: false, error: 'Amount paid does not match the chosen plan.' })
    }
    credits = p.quotesPerMonth
    plan = { id: p.id, name: p.name, price: p.price, quotesPerMonth: p.quotesPerMonth }
    description = `${p.name} plan (${p.quotesPerMonth} credits)`
  } else if (meta.kind === 'credits') {
    const qty = paidRand / ADDITIONAL_CREDIT_PRICE
    if (!Number.isInteger(qty) || qty < 1 || qty > 50) {
      return res.status(400).json({ ok: false, error: 'Amount paid does not match a whole number of credits (1 to 50).' })
    }
    credits = qty
    description = `${qty} credit${qty === 1 ? '' : 's'}`
  } else {
    return res.status(400).json({ ok: false, error: 'Unknown purchase type.' })
  }

  return res.status(200).json({
    ok: true,
    reference: data.reference,
    amount: paidRand,
    email: data.customer && data.customer.email,
    paidAt: data.paid_at,
    kind: meta.kind,
    credits,
    plan,
    description
  })
}
