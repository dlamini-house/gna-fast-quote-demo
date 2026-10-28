// Browser side of Paystack. Only the PUBLIC key is used here. It is read from
// the Vercel setting VITE_PAYSTACK_PUBLIC_KEY at build time. The secret key
// never appears in the app: confirming a payment is done by api/paystack-verify.js.

// The public key is designed to be visible in the browser, so the TEST one is built in as a default.
// A VITE_PAYSTACK_PUBLIC_KEY setting in Vercel overrides it (use that when you switch to the live key).
const TEST_PUBLIC_KEY = 'pk_test_6d5805369c1a9d361989731ccd705a4b93843c75'
export const PAYSTACK_PUBLIC_KEY = ((import.meta.env && import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) || TEST_PUBLIC_KEY).trim()
export const paystackConfigured = /^pk_(test|live)_[A-Za-z0-9]{20,}$/.test(PAYSTACK_PUBLIC_KEY)
export const paystackTestMode = PAYSTACK_PUBLIC_KEY.startsWith('pk_test_')

let scriptPromise = null
function loadPaystackScript() {
  if (window.PaystackPop) return Promise.resolve()
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://js.paystack.co/v1/inline.js'
      s.async = true
      s.onload = () => resolve()
      s.onerror = () => {
        scriptPromise = null
        reject(new Error('Could not load Paystack. Check your internet connection and try again.'))
      }
      document.head.appendChild(s)
    })
  }
  return scriptPromise
}

function newReference() {
  return `GNA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Opens the Paystack payment pop-up. Resolves with the payment reference once
// the customer has paid, or with null if they close the pop-up.
export async function openPaystack({ email, amountRand, metadata }) {
  if (!paystackConfigured) {
    throw new Error('Paystack is not set up yet: add VITE_PAYSTACK_PUBLIC_KEY in Vercel and redeploy.')
  }
  await loadPaystackScript()
  return new Promise((resolve) => {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: Math.round(amountRand * 100), // Paystack wants cents
      currency: 'ZAR',
      ref: newReference(),
      metadata,
      // Paystack requires plain (non-async) callbacks.
      callback: (response) => resolve(response.reference),
      onClose: () => resolve(null)
    })
    handler.openIframe()
  })
}

// Asks our server (which holds the secret key) to confirm the payment with Paystack.
export async function verifyPayment(reference) {
  let res
  try {
    res = await fetch('/api/paystack-verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference })
    })
  } catch {
    throw new Error('Could not reach the payment server.')
  }
  let json = null
  try { json = await res.json() } catch { /* not JSON */ }
  if (!res.ok || !json || !json.ok) {
    throw new Error((json && json.error) || `Payment could not be confirmed (server said ${res.status}).`)
  }
  return json
}
