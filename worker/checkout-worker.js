/**
 * EVOLVE checkout worker — Cloudflare Worker (free tier).
 *
 *   POST /create-session  → builds a Stripe Checkout Session from the cart (prices
 *                           sourced SERVER-SIDE from the published catalog, never the
 *                           client) and returns { url } to redirect to.
 *   POST /webhook         → on a signature-verified `checkout.session.completed`,
 *                           idempotently creates the Printful order from the variant
 *                           ids + shipping address.
 *
 * Secrets/vars (set in Cloudflare → Worker → Settings → Variables and Secrets — NEVER in code):
 *   STRIPE_SECRET_KEY        (secret) sk_live_… / sk_test_…  — prefer a RESTRICTED key:
 *                            Checkout Sessions = Write, Products = Read, Prices = Read.
 *   STRIPE_WEBHOOK_SECRET    (secret) whsec_…  (from the Stripe webhook on /webhook)
 *   PRINTFUL_API_KEY         (secret) Printful account token
 *   PRINTFUL_STORE_ID        (var) 18352510  — the "EVOLVE" store that holds the products
 *   SITE_ORIGIN              (var) https://evolveapparel.shop  — also serves /checkout-catalog.json
 *   PRINTFUL_CONFIRM         (var) "false" = Printful DRAFTS (recommended at first); "true" = auto-submit
 *
 * Storefront build env:  NEXT_PUBLIC_CHECKOUT_ENDPOINT=https://<worker>.workers.dev/create-session
 * Prices come from <SITE_ORIGIN>/checkout-catalog.json (re-emitted by
 * scripts/emit-checkout-catalog.mjs after each Printful sync, then redeploy).
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
    if (request.method === "OPTIONS") return new Response(null, { headers: cors(origin) });
    if (url.pathname === "/create-session" && request.method === "POST") return createSession(request, env, origin);
    if (url.pathname === "/webhook" && request.method === "POST") return handleWebhook(request, env);
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

    // AUTHORITATIVE prices from the published catalog — the client cart's prices are
    // ignored entirely, so a tampered cart can't change what gets charged.
    const catRes = await fetch(`${env.SITE_ORIGIN}/checkout-catalog.json`, {
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!catRes.ok) return json({ error: "catalog_unavailable" }, 503);
    const catalog = await catRes.json();

    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("success_url", `${env.SITE_ORIGIN}/?order=success&session_id={CHECKOUT_SESSION_ID}`);
    form.set("cancel_url", `${env.SITE_ORIGIN}/shop?checkout=cancelled`);
    form.append("shipping_address_collection[allowed_countries][]", "CA");
    form.append("shipping_address_collection[allowed_countries][]", "US");
    form.set("phone_number_collection[enabled]", "true");

    let subtotal = 0;
    let li = 0;
    for (const it of items) {
      const variantId = String(it.variantId || "");
      const cat = catalog[variantId];
      if (!cat) return json({ error: "unknown_variant", variantId }, 400); // reject anything not in the catalog
      const qty = Math.max(1, Math.min(99, parseInt(it.quantity, 10) || 1));
      subtotal += cat.price * qty;
      form.set(`line_items[${li}][quantity]`, String(qty));
      form.set(`line_items[${li}][price_data][currency]`, "cad");
      form.set(`line_items[${li}][price_data][unit_amount]`, String(cat.price)); // server-side cents
      form.set(`line_items[${li}][price_data][product_data][name]`, cat.name);
      form.set(
        `line_items[${li}][price_data][product_data][description]`,
        [cat.color, cat.size].filter(Boolean).join(" / ")
      );
      if (cat.image) form.set(`line_items[${li}][price_data][product_data][images][0]`, `${env.SITE_ORIGIN}${cat.image}`);
      form.set(`line_items[${li}][price_data][product_data][metadata][variantId]`, variantId);
      li++;
    }

    // 5% GST computed server-side from the authoritative subtotal, as its own line.
    const gst = Math.round(subtotal * 0.05);
    if (gst > 0) {
      form.set(`line_items[${li}][quantity]`, "1");
      form.set(`line_items[${li}][price_data][currency]`, "cad");
      form.set(`line_items[${li}][price_data][unit_amount]`, String(gst));
      form.set(`line_items[${li}][price_data][product_data][name]`, "GST (5%)");
    }

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    const session = await res.json();
    if (!res.ok) return json({ error: session.error?.message || "stripe_error" }, 502);
    return json({ url: session.url });
  } catch {
    return json({ error: "bad_request" }, 400);
  }
}

// ---- /webhook → Printful order --------------------------------------------
async function handleWebhook(request, env) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") || "";
  if (!(await verifyStripeSignature(body, sig, env.STRIPE_WEBHOOK_SECRET))) {
    return new Response("invalid signature", { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("bad json", { status: 400 });
  }
  if (event.type !== "checkout.session.completed") return new Response("ignored", { status: 200 });

  const session = event.data.object;
  const pf = { Authorization: `Bearer ${env.PRINTFUL_API_KEY}`, "X-PF-Store-Id": env.PRINTFUL_STORE_ID };

  // IDEMPOTENCY: one Printful order per Stripe session. external_id is unique per
  // store, so a duplicate webhook either finds the existing order (skip) or its
  // create is rejected by Printful's uniqueness constraint — never double-fulfilled.
  const externalId = session.id.slice(-32); // <=32 chars, valid id chars, unique per session
  const exists = await fetch(`https://api.printful.com/orders/@${externalId}`, { headers: pf });
  if (exists.ok) return new Response("already fulfilled", { status: 200 });

  // line items (with the variantId we stored on the inline product)
  const liRes = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items?limit=100&expand[]=data.price.product`,
    { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } }
  );
  const liJson = await liRes.json();
  const items = (liJson.data || [])
    .map((row) => ({ sync_variant_id: Number(row.price?.product?.metadata?.variantId), quantity: row.quantity }))
    .filter((it) => it.sync_variant_id);
  if (!items.length) return new Response("no fulfillable items", { status: 200 });

  const ship = session.shipping_details || session.customer_details || {};
  const addr = ship.address || {};
  const order = {
    external_id: externalId,
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
    items,
  };

  const pfRes = await fetch(
    `https://api.printful.com/orders?confirm=${env.PRINTFUL_CONFIRM === "true" ? "1" : "0"}`,
    { method: "POST", headers: { ...pf, "Content-Type": "application/json" }, body: JSON.stringify(order) }
  );

  if (!pfRes.ok) {
    // Fail LOUD and retryable so a paid order is never silently lost: 500 → Stripe
    // retries (idempotency above makes retries safe); the log captures everything
    // needed to create the order by hand if it never recovers.
    const errText = await pfRes.text();
    console.error(
      "PRINTFUL_ORDER_FAILED " +
        JSON.stringify({
          stripe_session: session.id,
          external_id: externalId,
          payment_intent: session.payment_intent,
          email: session.customer_details?.email,
          status: pfRes.status,
          printful_error: errText,
          items,
        })
    );
    return new Response("printful order failed", { status: 500 });
  }
  return new Response("ok", { status: 200 });
}

// ---- Stripe signature: HMAC-SHA256 + 5-min replay window + constant-time --------
async function verifyStripeSignature(payload, header, secret, toleranceSec = 300) {
  try {
    if (!secret || !header) return false;
    const kv = header.split(",").map((p) => p.split("="));
    const t = kv.find((p) => p[0] === "t")?.[1];
    const sigs = kv.filter((p) => p[0] === "v1").map((p) => p[1]);
    if (!t || !sigs.length) return false;
    // replay protection: reject events outside the tolerance window
    if (Math.abs(Math.floor(Date.now() / 1000) - Number(t)) > toleranceSec) return false;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const buf = await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${payload}`));
    const expected = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
    return sigs.some((s) => timingSafeEqual(expected, s));
  } catch {
    return false;
  }
}

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
