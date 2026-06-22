/**
 * EVOLVE checkout worker — Cloudflare Worker (free tier).
 *
 * Two jobs, both using secrets that live ONLY here (never in the static site):
 *   POST /create-session  → builds a Stripe Checkout Session from the cart and
 *                           returns { url } for the storefront to redirect to.
 *   POST /webhook         → on Stripe `checkout.session.completed`, creates the
 *                           Printful order from the variant ids + shipping address.
 *
 * Deploy with `wrangler deploy` and set these as Worker secrets/vars:
 *   STRIPE_SECRET_KEY        sk_live_… (or sk_test_… while testing)
 *   STRIPE_WEBHOOK_SECRET    whsec_…  (from the Stripe webhook you register at /webhook)
 *   PRINTFUL_TOKEN           Printful account token (same one used by the sync script)
 *   PRINTFUL_STORE_ID        18352510 (the "Evolve" store id)
 *   SITE_ORIGIN              https://evolveapparel.shop
 *   PRINTFUL_CONFIRM         "false" to create Printful DRAFTS first (recommended); "true" to auto-submit
 *
 * Then set in the storefront build env:
 *   NEXT_PUBLIC_CHECKOUT_ENDPOINT=https://<your-worker>.workers.dev/create-session
 */

const cors = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = env.SITE_ORIGIN || "*";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors(origin) });
    }

    if (url.pathname === "/create-session" && request.method === "POST") {
      return createSession(request, env, origin);
    }
    if (url.pathname === "/webhook" && request.method === "POST") {
      return handleWebhook(request, env);
    }
    return new Response("Not found", { status: 404 });
  },
};

// ---- /create-session -------------------------------------------------------
async function createSession(request, env, origin) {
  const json = (b, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json", ...cors(origin) } });
  try {
    const payload = await request.json();
    const items = Array.isArray(payload.items) ? payload.items : [];
    if (!items.length) return json({ error: "empty_cart" }, 400);

    // Stripe wants application/x-www-form-urlencoded with array indices.
    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("success_url", `${env.SITE_ORIGIN}/?order=success`);
    form.set("cancel_url", `${env.SITE_ORIGIN}/shop?checkout=cancelled`);
    form.append("shipping_address_collection[allowed_countries][]", "CA");
    form.append("shipping_address_collection[allowed_countries][]", "US");
    form.set("phone_number_collection[enabled]", "true");

    items.forEach((it, i) => {
      form.set(`line_items[${i}][quantity]`, String(it.quantity || 1));
      form.set(`line_items[${i}][price_data][currency]`, (payload.currency || "CAD").toLowerCase());
      form.set(`line_items[${i}][price_data][unit_amount]`, String(it.unitPrice)); // cents
      form.set(`line_items[${i}][price_data][product_data][name]`, it.name || "EVOLVE item");
      form.set(
        `line_items[${i}][price_data][product_data][description]`,
        [it.color, it.size].filter(Boolean).join(" / ")
      );
      if (it.image) form.set(`line_items[${i}][price_data][product_data][images][0]`, it.image);
      // carry the Printful variant id so the webhook can fulfill
      form.set(`line_items[${i}][price_data][product_data][metadata][variantId]`, String(it.variantId));
    });
    // 5% GST as an automatic-tax-free line via Stripe tax rate is ideal; simplest:
    // add it as its own line item so the total matches the cart.
    if (payload.gst) {
      const i = items.length;
      form.set(`line_items[${i}][quantity]`, "1");
      form.set(`line_items[${i}][price_data][currency]`, (payload.currency || "CAD").toLowerCase());
      form.set(`line_items[${i}][price_data][unit_amount]`, String(payload.gst));
      form.set(`line_items[${i}][price_data][product_data][name]`, "GST (5%)");
    }

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    });
    const session = await res.json();
    if (!res.ok) return json({ error: session.error?.message || "stripe_error" }, 502);
    return json({ url: session.url });
  } catch (e) {
    return json({ error: "bad_request" }, 400);
  }
}

// ---- /webhook → Printful order --------------------------------------------
async function handleWebhook(request, env) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") || "";
  const valid = await verifyStripeSignature(body, sig, env.STRIPE_WEBHOOK_SECRET);
  if (!valid) return new Response("bad signature", { status: 400 });

  const event = JSON.parse(body);
  if (event.type !== "checkout.session.completed") return new Response("ignored", { status: 200 });

  const session = event.data.object;
  // pull line items (with product metadata) for this session
  const liRes = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items?limit=100&expand[]=data.price.product`,
    { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } }
  );
  const li = await liRes.json();
  const printfulItems = (li.data || [])
    .map((row) => ({
      sync_variant_id: Number(row.price?.product?.metadata?.variantId),
      quantity: row.quantity,
    }))
    .filter((it) => it.sync_variant_id);

  if (!printfulItems.length) return new Response("no fulfillable items", { status: 200 });

  const ship = session.shipping_details || session.customer_details || {};
  const addr = ship.address || {};
  const order = {
    recipient: {
      name: ship.name || session.customer_details?.name,
      address1: addr.line1,
      address2: addr.line2 || "",
      city: addr.city,
      state_code: addr.state,
      country_code: addr.country,
      zip: addr.postal_code,
      email: session.customer_details?.email,
      phone: session.customer_details?.phone || "",
    },
    items: printfulItems,
  };

  const pfRes = await fetch(
    `https://api.printful.com/orders?confirm=${env.PRINTFUL_CONFIRM === "true" ? "1" : "0"}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.PRINTFUL_TOKEN}`,
        "X-PF-Store-Id": env.PRINTFUL_STORE_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    }
  );
  // Always 200 the webhook so Stripe doesn't retry forever; log failures.
  if (!pfRes.ok) console.log("Printful order failed", await pfRes.text());
  return new Response("ok", { status: 200 });
}

// Stripe signature check (HMAC-SHA256) using Web Crypto (Workers-native).
async function verifyStripeSignature(payload, header, secret) {
  try {
    const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(`${parts.t}.${payload}`));
    const expected = [...new Uint8Array(sigBuf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    return expected === parts.v1;
  } catch {
    return false;
  }
}
