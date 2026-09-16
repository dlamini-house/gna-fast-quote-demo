import { useState } from 'react'
import Layout from '../components/Layout'
import { PLANS, ADDITIONAL_CREDIT_PRICE } from '../data/mockData'
import { useAppState } from '../data/store'

export default function PricingCredits() {
  const [state, setState] = useAppState()
  const [creditQty, setCreditQty] = useState(1)

  function choosePlan(plan) {
    setState((s) => ({ ...s, plan }))
  }

  function buyCredits(qty) {
    setState((s) => ({ ...s, credits: s.credits + qty }))
  }

  return (
    <Layout title="Pricing & Credits">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Current plan</p>
          <p className="text-2xl font-bold">{state.plan ? state.plan.name : 'Free trial'}</p>
          <p className="text-sm text-gray-500 mb-4">
            {state.plan ? `${state.plan.quotesPerMonth} quotes / month` : '7 days or 3 quotes'}
          </p>
          <button className="btn-primary w-full">Manage plan</button>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Credits remaining</p>
          <p className="text-2xl font-bold">{state.credits} credits</p>
          <p className="text-sm text-gray-500 mb-4">Demo balance, resets on refresh clear</p>
          <button className="btn-secondary w-full">View usage</button>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Need more credits?</p>
          <p className="text-2xl font-bold text-brand-red">
            R{ADDITIONAL_CREDIT_PRICE}
            <span className="text-sm font-normal text-gray-500"> per quote</span>
          </p>
          <button className="btn-secondary w-full mt-4" onClick={() => buyCredits(1)}>
            Buy credits
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8 items-stretch">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`card flex flex-col ${plan.popular ? 'border-brand-blue border-2 relative' : ''}`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-blue text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most popular
              </span>
            )}
            <p className="text-sm text-gray-500">{plan.name}</p>
            <p className="text-3xl font-bold mb-1">
              R{plan.price}
              <span className="text-sm font-normal text-gray-500"> / month</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">{plan.quotesPerMonth} quotes per month</p>
            <ul className="text-sm space-y-2 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-brand-green">&#10003;</span> {f}
                </li>
              ))}
            </ul>
            <button
              className={plan.popular ? 'btn-primary w-full' : 'btn-secondary w-full'}
              onClick={() => choosePlan(plan)}
            >
              Choose plan
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
            className="w-full bg-brand-red text-white rounded-lg px-4 py-2 font-medium hover:bg-red-700 transition-colors"
            onClick={() => buyCredits(creditQty)}
          >
            Purchase {creditQty} credit{creditQty > 1 ? 's' : ''}
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Billing history</h2>
        <p className="text-sm text-gray-500">
          No invoices yet in this demo. Live billing history will list Paystack transactions once payments are wired up.
        </p>
      </div>
    </Layout>
  )
}
