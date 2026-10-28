import { useState } from 'react'
import Layout from '../components/Layout'
import { PLANS, ADDITIONAL_CREDIT_PRICE } from '../data/mockData'
import { useAppState, currentUser, userBilling, applyPayment } from '../data/store'
import { openPaystack, verifyPayment, paystackConfigured, paystackTestMode } from '../data/paystack'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

export default function PricingCredits() {
  const [state, setState] = useAppState()
  const user = currentUser(state)
  const { plan, credits, payments } = userBilling(state)
  const [creditQty, setCreditQty] = useState(1)
  const [busy, setBusy] = useState(null) // what is being paid for right now
  const [notice, setNotice] = useState(null) // { type: 'success' | 'error', text }

  // One payment flow for everything: open Paystack, then have the server confirm it, then add the credits.
  async function pay(key, amountRand, metadata) {
    if (!user || busy) return
    setNotice(null)
    setBusy(key)
    let reference = null
    try {
      reference = await openPaystack({ email: user.email, amountRand, metadata })
      if (!reference) return // pop-up closed without paying
      const result = await verifyPayment(reference)
      if (result.email && result.email.toLowerCase() !== user.email.toLowerCase()) {
        throw new Error('This payment was made with a different email address.')
      }
      applyPayment(setState, user.email, result)
      setNotice({
        type: 'success',
        text: `Payment received: ${result.description}. ${result.credits} credit${result.credits === 1 ? '' : 's'} added to your account. Reference ${result.reference}.`
      })
    } catch (e) {
      setNotice({
        type: 'error',
        text: `${e.message}${reference ? ` If you were charged, quote reference ${reference} to support.` : ''}`
      })
    } finally {
      setBusy(null)
    }
  }

  const buyCredits = (qty) => pay('credits', qty * ADDITIONAL_CREDIT_PRICE, { kind: 'credits', quantity: qty })
  const choosePlan = (p) => pay(`plan-${p.id}`, p.price, { kind: 'plan', planId: p.id })

  return (
    <Layout title="Pricing & Credits">
      {!paystackConfigured && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
          Payments are not switched on yet: the Paystack public key is missing from this deployment.
        </p>
      )}
      {paystackConfigured && paystackTestMode && (
        <p className="text-sm text-blue-800 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-6">
          <strong>Test mode:</strong> no real money moves. Pay with test card <strong>4084 0840 8408 4081</strong>, any future expiry date, CVV <strong>408</strong>.
        </p>
      )}
      {notice && (
        <p
          className={`text-sm rounded-lg px-4 py-3 mb-6 border ${
            notice.type === 'success' ? 'text-green-800 bg-green-50 border-green-200' : 'text-red-800 bg-red-50 border-red-200'
          }`}
        >
          {notice.text}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Current plan</p>
          <p className="text-2xl font-bold">{plan ? plan.name : 'Free trial'}</p>
          <p className="text-sm text-gray-500 mb-4">
            {plan ? `${plan.quotesPerMonth} credits per month` : '7 days or 3 quotes'}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Credits remaining</p>
          <p className="text-2xl font-bold">{credits} credit{credits === 1 ? '' : 's'}</p>
          <p className="text-sm text-gray-500 mb-4">1 credit = 1 quote</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Need more credits?</p>
          <p className="text-2xl font-bold text-brand-red">
            R{ADDITIONAL_CREDIT_PRICE}
            <span className="text-sm font-normal text-gray-500"> per quote</span>
          </p>
          <button className="btn-secondary w-full mt-4 disabled:opacity-50" disabled={!!busy} onClick={() => buyCredits(1)}>
            {busy === 'credits' ? 'Opening payment…' : 'Buy 1 credit'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8 items-stretch">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className={`card flex flex-col ${p.popular ? 'border-brand-blue border-2 relative' : ''}`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most popular
              </span>
            )}
            <p className="text-sm text-gray-500">{p.name}</p>
            <p className="text-3xl font-bold mb-1">
              R{p.price}
              <span className="text-sm font-normal text-gray-500"> / month</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">{p.quotesPerMonth} quotes per month</p>
            <ul className="text-sm space-y-2 mb-6 flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-brand-green">&#10003;</span> {f}
                </li>
              ))}
            </ul>
            <button
              className={`${p.popular ? 'btn-primary' : 'btn-secondary'} w-full disabled:opacity-50`}
              disabled={!!busy}
              onClick={() => choosePlan(p)}
            >
              {busy === `plan-${p.id}` ? 'Opening payment…' : plan && plan.id === p.id ? 'Renew plan' : 'Choose plan'}
            </button>
          </div>
        ))}

        <div className="card bg-red-50 border-red-100">
          <p className="text-sm text-gray-500 mb-1">Bulk credit top-up</p>
          <p className="text-xs text-gray-500 mb-3">Buy 1 to 50 additional credits instantly at R{ADDITIONAL_CREDIT_PRICE} each.</p>
          <div className="flex items-center gap-2 mb-3">
            <button
              className="btn-secondary px-3 py-1"
              onClick={() => setCreditQty((q) => Math.max(1, q - 1))}
            >
              -
            </button>
            <span className="flex-1 text-center border rounded-lg py-1">{creditQty} credit{creditQty > 1 ? 's' : ''}</span>
            <button
              className="btn-secondary px-3 py-1"
              onClick={() => setCreditQty((q) => Math.min(50, q + 1))}
            >
              +
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-1">Total cost</p>
          <p className="text-xl font-bold text-brand-red mb-3">
            R{(creditQty * ADDITIONAL_CREDIT_PRICE).toFixed(2)}
          </p>
          <button
            className="w-full bg-brand-red text-white rounded-lg px-4 py-2 font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={!!busy}
            onClick={() => buyCredits(creditQty)}
          >
            {busy === 'credits' ? 'Opening payment…' : `Purchase ${creditQty} credit${creditQty > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Billing history</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-gray-500">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Item</th>
                  <th className="py-2 font-medium">Credits</th>
                  <th className="py-2 font-medium">Amount</th>
                  <th className="py-2 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.reference} className="border-b last:border-0">
                    <td className="py-3">{formatDate(p.paidAt)}</td>
                    <td className="py-3">{p.description}</td>
                    <td className="py-3">+{p.credits}</td>
                    <td className="py-3">R {Number(p.amount).toFixed(2)}</td>
                    <td className="py-3 text-gray-500">{p.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
