# Paystack payments (test mode)

## What is wired up
- Pricing & Credits page opens the Paystack pop-up for: any number of credits (R40 each, 1 to 50), or a plan.
- After paying, the browser sends only the payment reference to `/api/paystack-verify` (a Vercel function).
  That function asks Paystack what was really paid and works out the credits from the money received.
- Credits go onto the signed-in contractor's own account. One quote takes one credit (free-trial quotes take none).

| Purchase | Price | Credits added |
|---|---|---|
| Credits | R40 each | 1 credit per R40 |
| Starter plan | R299 | 10 |
| Pro plan | R599 | 25 |
| Pro Plus plan | R899 | 50 |

## Vercel settings (Project > Settings > Environment Variables)
| Name | Value | Notes |
|---|---|---|
| `VITE_PAYSTACK_PUBLIC_KEY` | optional | the test public key is already built in; only set this for the live key |
| `PAYSTACK_SECRET_KEY` | `sk_test_...` | SECRET, mark as Sensitive. Never put it in the code or GitHub |

Tick Production and Preview. Redeploy after changing them (environment variables only apply to new builds).

## Test card (Paystack test mode)
Card 4084 0840 8408 4081, any future expiry, CVV 408. If asked for a PIN use 0000, and OTP 123456.
