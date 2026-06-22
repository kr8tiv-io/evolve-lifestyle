# EVOLVE Apparel — turning on real checkout

The storefront is a **static** site (no backend), so secret keys can't live in it. The
cart is already wired to a hosted-checkout seam; you just need to stand up the small
free piece that holds the keys. Recommended path: **Stripe Checkout + a free Cloudflare
Worker** (keeps the custom store, real card payment, and **auto-creates the Printful
order** on payment).

## What's already done in the code
- `src/lib/commerce.ts` — `startCheckout()` posts the cart to `CHECKOUT_ENDPOINT` and
  redirects to the returned Stripe URL. `buildCheckout()` includes each line's Printful
  `variantId`, price, name, color, size, image.
- `src/components/cart/CartDrawer.tsx` — real **Checkout** button with loading state.
- **Until the endpoint is set, the button opens a pre-filled order email** to
  `todd@evolveecoblasting.com` so customers can still order (manual invoice / e-transfer).
- `worker/checkout-worker.js` — a deployable Cloudflare Worker: `/create-session`
  (Stripe Checkout) + `/webhook` (creates the Printful order from the variant ids).

## What Todd must provide / do (one-time)
1. **Stripe account** (Canada, CAD) → from the dashboard get:
   - **Secret key** `sk_live_…` → goes in the Worker env only (give it to me to set, or
     paste into Cloudflare yourself). Never in the website.
   - **Webhook signing secret** `whsec_…` → created when you add the webhook (step 4).
   - In Settings: turn on shipping-address collection (allow CA + US). GST is added as a
     5% line automatically by the worker.
2. **Cloudflare account** (free) — or tell me to create the Worker under yours.
3. **Printful token + store id** — same account token already used to sync products
   (store id `18352510`). Goes in the Worker env only.
4. Decide: **drafts first** (recommended — `PRINTFUL_CONFIRM=false`, you review/submit each
   order in Printful) or **auto-submit** (`true`).
5. A **payment method on file at Printful** (Printful charges you production+shipping per
   order; the customer's money lands in your Stripe).

## Deploy steps (≈15 min once you have the keys)
1. `npm i -g wrangler` → `cd worker` → `wrangler deploy checkout-worker.js`
   (set the secrets above with `wrangler secret put STRIPE_SECRET_KEY`, etc.).
2. In Stripe → Developers → Webhooks → add endpoint `https://<worker>.workers.dev/webhook`,
   event `checkout.session.completed` → copy the `whsec_…` into the Worker.
3. Rebuild the site with `NEXT_PUBLIC_CHECKOUT_ENDPOINT=https://<worker>.workers.dev/create-session`
   and redeploy. Done — the Checkout button now takes real payments and fulfills via Printful.

## Status
- **Functional now:** cart → checkout button → pre-filled order email (manual orders work today).
- **Blocked on Todd:** real card payments + automatic Printful fulfillment need the Stripe
  account + keys, a Cloudflare account for the (free) Worker, and the Printful token in the
  Worker — none of which can be created or hardcoded by me. Everything else is built and waiting.

### Alternatives (if you'd rather)
- **No code at all, ~$49 CAD/mo:** Shopify Buy Button (embeds on this site, auto-fulfills via
  the Printful↔Shopify app) — but checkout leaves the custom EVOLVE experience.
- **No compute, no monthly fee:** Stripe Payment Links (one per product) + a Make/Pabbly
  automation to Printful — fully static-safe, but a per-product "Buy now" rather than a true cart.
