/**
 * EVOLVE checkout worker — Cloudflare Worker (free tier).
 *
 *   POST /create-session  → builds a Stripe Checkout Session from the cart. Prices are
 *                           sourced SERVER-SIDE from the published catalog (never the
 *                           client). Shipping is the EXACT Printful rate for the
 *                           customer's destination (address-first; see note below).
 *   POST /webhook         → on a signature-verified `checkout.session.completed`,
 *                           idempotently creates the Printful order.
 *
 * SHIPPING — why address-first: hosted (redirect) Stripe Checkout cannot recompute
 * shipping from the address typed on Stripe's page (that's an embedded-Elements feature).
 * So the storefront collects the destination first and posts it here; we call Printful
 * /shipping/rates for the real cost and set it as a fixed shipping_option. If the rate
 * call fails we fall back to SHIPPING_FALLBACK_CENTS so checkout never breaks.
 *
 * Secrets/vars (Cloudflare → Worker → Settings → Variables and Secrets — NEVER in code):
 *   STRIPE_SECRET_KEY        (secret) restricted key: Checkout Sessions=Write, Products/Prices=Read
 *   STRIPE_WEBHOOK_SECRET    (secret) whsec_… (from the Stripe webhook on /webhook)
 *   PRINTFUL_API_KEY         (secret) Printful account token
 *   PRINTFUL_STORE_ID        (var) 18352510
 *   SITE_ORIGIN              (var) https://evolveapparel.shop  (serves /checkout-catalog.json)
 *   PRINTFUL_CONFIRM         (var) "false" = Printful drafts; "true" = auto-submit
 *   SHIPPING_FALLBACK_CENTS  (var) fallback shipping in cents if Printful rate fails (e.g. "1500")
 */

const cors = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});
const pfHeaders = (env) => ({
  Authorization: `Bearer ${env.PRINTFUL_API_KEY}`,
  "X-PF-Store-Id": env.PRINTFUL_STORE_ID,
});

// Strong random token gating the TEMPORARY /admin-email completion route (Resend domain
// status / verify / shop@ test send). Server-side only — the route never returns a secret.
// Remove this const + the route + adminEmail() once the sending domain is verified.
const ADMIN_TOKEN = "b6b5461e3629da0c00428e42522b70f2a5d4b0b39bd0185d4c3301682dcd4a50";

// ---- per-IP rate limit (Durable Object; strongly consistent; fail-open) -----
// All requests for one IP route to the same instance, so the in-memory sliding
// window is accurate. No storage needed — a reset on eviction just fails open.
export class RateLimiter {
  constructor() {
    this.hits = [];
  }
  async fetch() {
    const now = Date.now();
    const WINDOW_MS = 60000;
    const LIMIT = 30;
    this.hits = this.hits.filter((t) => now - t < WINDOW_MS);
    if (this.hits.length >= LIMIT) return new Response("limited", { status: 429 });
    this.hits.push(now);
    return new Response("ok", { status: 200 });
  }
}

// true => over the limit. Fail-OPEN: any limiter error (or missing binding) allows the request.
async function rateLimited(env, request) {
  try {
    if (!env.RL) return false;
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const res = await env.RL.get(env.RL.idFromName(ip)).fetch("https://rl/hit");
    return res.status === 429;
  } catch {
    return false;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = env.SITE_ORIGIN || "*";
    if (request.method === "OPTIONS") return new Response(null, { headers: cors(origin) });
    if (url.pathname === "/create-session" && request.method === "POST") {
      if (await rateLimited(env, request))
        return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { "Content-Type": "application/json", ...cors(origin) } });
      return createSession(request, env, origin);
    }
    if (url.pathname === "/webhook" && request.method === "POST") return handleWebhook(request, env);
    if (url.pathname === "/admin-email" && url.searchParams.get("key") === ADMIN_TOKEN) return adminEmail(env, url); // TEMP — strong-token email-completion route; remove when domain verified
    return new Response("Not found", { status: 404 });
  },
};

// ---- exact Printful shipping for a destination -----------------------------
async function computeShipping(env, address, items) {
  try {
    if (!address || !address.country || !address.line1) return null;
    if (items.some((it) => !it.cv)) {
      console.log("SHIPPING_NO_CATALOG_ID " + JSON.stringify(items));
      return null;
    }
    const res = await fetch("https://api.printful.com/shipping/rates", {
      method: "POST",
      headers: { ...pfHeaders(env), "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: {
          address1: address.line1,
          city: address.city,
          state_code: address.state || "",
          country_code: address.country,
          zip: address.zip || "",
        },
        // /shipping/rates needs the CATALOG variant_id (cv), not the sync id
        items: items.map((it) => ({ variant_id: Number(it.cv), quantity: it.quantity })),
        currency: "CAD",
      }),
    });
    const data = await res.json();
    if (!res.ok || !Array.isArray(data.result) || !data.result.length) {
      console.log(
        "SHIPPING_RATE_MISS " +
          JSON.stringify({
            status: res.status,
            body: data,
            sent_recipient: { country_code: address.country, state_code: address.state, zip: address.zip },
            sent_items: items.map((it) => ({ sync_variant_id: Number(it.variantId), quantity: it.quantity })),
          })
      );
      return null;
    }
    // charge the CHEAPEST option Printful offers (it may return several, unordered)
    const r = data.result.reduce((m, x) => (parseFloat(x.rate) < parseFloat(m.rate) ? x : m), data.result[0]);
    const cents = Math.round(parseFloat(r.rate) * 100);
    if (!Number.isFinite(cents) || cents < 0) return null;
    console.log(
      "SHIPPING_RATE_OK " +
        JSON.stringify({ chosen: { name: r.name, rate: r.rate }, all: data.result.map((x) => ({ name: x.name, rate: x.rate })) })
    );
    return { cents, name: r.name || "Shipping" };
  } catch {
    return null;
  }
}

// ---- /create-session -------------------------------------------------------
async function createSession(request, env, origin) {
  const json = (b, s = 200) =>
    new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json", ...cors(origin) } });
  try {
    const payload = await request.json();
    const items = Array.isArray(payload.items) ? payload.items : [];
    if (!items.length) return json({ error: "empty_cart" }, 400);
    if (items.length > 50) return json({ error: "too_many_items" }, 400);
    const address = payload.address || null;

    // AUTHORITATIVE prices from the published catalog — client cart prices are ignored.
    const catRes = await fetch(`${env.SITE_ORIGIN}/checkout-catalog.json`, {
      cf: { cacheTtl: 30, cacheEverything: true },
    });
    if (!catRes.ok) return json({ error: "catalog_unavailable" }, 503);
    const catalog = await catRes.json();

    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("success_url", `${env.SITE_ORIGIN}/?order=success&session_id={CHECKOUT_SESSION_ID}`);
    form.set("cancel_url", `${env.SITE_ORIGIN}/shop?checkout=cancelled`);
    form.set("phone_number_collection[enabled]", "true");

    let subtotal = 0;
    let li = 0;
    const cleanItems = [];
    for (const it of items) {
      const variantId = String(it.variantId || "");
      const cat = catalog[variantId];
      if (!cat) return json({ error: "unknown_variant", variantId }, 400);
      const qty = Math.max(1, Math.min(99, parseInt(it.quantity, 10) || 1));
      subtotal += cat.price * qty;
      cleanItems.push({ variantId, quantity: qty, cv: cat.cv });
      form.set(`line_items[${li}][quantity]`, String(qty));
      form.set(`line_items[${li}][price_data][currency]`, "cad");
      form.set(`line_items[${li}][price_data][unit_amount]`, String(cat.price));
      form.set(`line_items[${li}][price_data][product_data][name]`, cat.name);
      form.set(`line_items[${li}][price_data][product_data][description]`, [cat.color, cat.size].filter(Boolean).join(" / "));
      if (cat.image) form.set(`line_items[${li}][price_data][product_data][images][0]`, `${env.SITE_ORIGIN}${cat.image}`);
      form.set(`line_items[${li}][price_data][product_data][metadata][variantId]`, variantId);
      li++;
    }

    // 5% GST on goods, server-side.
    const gst = Math.round(subtotal * 0.05);
    if (gst > 0) {
      form.set(`line_items[${li}][quantity]`, "1");
      form.set(`line_items[${li}][price_data][currency]`, "cad");
      form.set(`line_items[${li}][price_data][unit_amount]`, String(gst));
      form.set(`line_items[${li}][price_data][product_data][name]`, "GST (5%)");
    }

    if (address) {
      // exact Printful shipping for this destination, with a safe fallback.
      const ship = await computeShipping(env, address, cleanItems);
      const shipCents = ship ? ship.cents : parseInt(env.SHIPPING_FALLBACK_CENTS || "0", 10) || 0;
      if (shipCents > 0) {
        form.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
        form.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(shipCents));
        form.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "cad");
        form.set("shipping_options[0][shipping_rate_data][display_name]", ship ? ship.name : "Shipping");
      }
      // we already have the destination → carry it for fulfillment (no double address entry)
      form.set("metadata[ship]", JSON.stringify(address).slice(0, 480));
    } else {
      // no address provided → let Stripe collect it (no exact rate; fallback applies)
      form.append("shipping_address_collection[allowed_countries][]", "CA");
      form.append("shipping_address_collection[allowed_countries][]", "US");
      const fb = parseInt(env.SHIPPING_FALLBACK_CENTS || "0", 10) || 0;
      if (fb > 0) {
        form.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
        form.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(fb));
        form.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "cad");
        form.set("shipping_options[0][shipping_rate_data][display_name]", "Shipping");
      }
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
  const pf = pfHeaders(env);

  // IDEMPOTENCY: one Printful order per Stripe session. external_id = the Stripe checkout
  // session id, truncated to Printful's 32-char max (cs_ ids are ~66 chars). Keeps the
  // recognizable cs_ prefix and is deterministic, so the duplicate guard below — which
  // derives the key the SAME way — matches on a repeated webhook and skips re-creating.
  const externalId = session.id.slice(0, 32);
  const exists = await fetch(`https://api.printful.com/orders/@${externalId}`, { headers: pf });
  if (exists.ok) return new Response("already fulfilled", { status: 200 });

  const liRes = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items?limit=100&expand[]=data.price.product`,
    { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } }
  );
  const liJson = await liRes.json();
  const items = (liJson.data || [])
    .map((row) => ({ sync_variant_id: Number(row.price?.product?.metadata?.variantId), quantity: row.quantity }))
    .filter((it) => it.sync_variant_id);
  if (!items.length) return new Response("no fulfillable items", { status: 200 });

  // destination: the address we collected up front (metadata) — or Stripe's, if it collected one.
  let ship = null;
  try {
    ship = JSON.parse(session.metadata?.ship || "null");
  } catch {}
  const sd = session.shipping_details || session.customer_details || {};
  const a = sd.address || {};
  const recipient = ship
    ? {
        name: ship.name || session.customer_details?.name,
        address1: ship.line1,
        address2: ship.line2 || "",
        city: ship.city,
        state_code: ship.state || "",
        country_code: ship.country,
        zip: ship.zip || "",
        email: session.customer_details?.email,
        phone: session.customer_details?.phone || ship.phone || "",
      }
    : {
        name: sd.name || session.customer_details?.name,
        address1: a.line1,
        address2: a.line2 || "",
        city: a.city,
        state_code: a.state || "",
        country_code: a.country,
        zip: a.postal_code || "",
        email: session.customer_details?.email,
        phone: session.customer_details?.phone || "",
      };

  let pfRes;
  try {
    pfRes = await fetch(
      `https://api.printful.com/orders?confirm=${env.PRINTFUL_CONFIRM === "true" ? "1" : "0"}`,
      {
        method: "POST",
        headers: { ...pf, "Content-Type": "application/json" },
        body: JSON.stringify({ external_id: externalId, recipient, items }),
      }
    );
  } catch (e) {
    // Printful unreachable (network/exception) — the customer is PAID. Alert operators; Stripe retries.
    const detail = { stripe_session: session.id, external_id: externalId, payment_intent: session.payment_intent, email: session.customer_details?.email, status: "network/exception", printful_error: String(e && e.message), items };
    console.error("PRINTFUL_ORDER_EXCEPTION " + JSON.stringify(detail));
    await sendFailureAlert(env, detail);
    return new Response("printful unreachable", { status: 500 }); // Stripe retries; idempotency-safe
  }

  if (!pfRes.ok) {
    const errText = await pfRes.text();
    const detail = {
      stripe_session: session.id,
      external_id: externalId,
      payment_intent: session.payment_intent,
      email: session.customer_details?.email,
      status: pfRes.status,
      printful_error: errText,
      items,
    };
    console.error("PRINTFUL_ORDER_FAILED " + JSON.stringify(detail));
    await sendFailureAlert(env, detail); // close the "charged but no order" SPOF — alert the operators
    return new Response("printful order failed", { status: 500 }); // Stripe retries; idempotency-safe
  }
  await sendOrderEmail(env, session, liJson.data, recipient); // branded confirmation (best-effort)
  return new Response("ok", { status: 200 });
}

// ---- branded order-confirmation email (optional; via Resend) ----------------
// No-op unless RESEND_API_KEY is set (Todd provides it + verifies a sending domain).

// Stoked-Albertan outdoor voice (synthesized from a 5-voice copy tournament).
// {name} in the headline is replaced with the buyer's first name.
const ORDER_COPY = {
  subject: "You just kitted up for the treeline",
  preheader: "Made to order, cut for cold mornings, and already in motion.",
  kicker: "You're geared up",
  headline: "Solid haul, {name}.",
  intro:
    "Thanks for kitting up with us. Every piece is made to order, so yours is getting built fresh right now — no warehouse shelf, no shortcuts — and backing a small Alberta outdoor crew means more to us than you know.",
  orderHeading: "The haul",
  shipLabel: "Headed to",
  etaLabel: "Timing",
  etaBody:
    "Made to order means we build yours fresh rather than pull it off a shelf, so give it a little runway. The moment it ships, tracking lands in your inbox so you can watch it close the distance.",
  ctaHeading: "Pull up a log",
  ctaBody:
    "Get on the list for trail-tested drops, stories from the backcountry, and the odd dispatch from the treeline. Biweekly, big sky, zero spam.",
  ctaButton: "Save me a spot",
  footerNote:
    "You're getting this because you placed an order with EVOLVE, a small Alberta outdoor brand. Questions, or just want to say hey — reply right to this email and a real person answers.",
};

async function sendOrderEmail(env, session, lineItems, recipient) {
  try {
    const to = session.customer_details?.email;
    if (!env.RESEND_API_KEY || !to) return;

    // Split the Stripe line items into products vs the GST line; derive the money
    // breakdown from the session (subtotal = products + GST; shipping = total - subtotal).
    const li = lineItems || [];
    const isGst = (row) => /^gst/i.test(row.price?.product?.name || row.description || "");
    const products = li.filter((row) => !isGst(row));
    const gstCents = li.filter(isGst).reduce((s, row) => s + (row.amount_total || 0), 0);
    const productsSubtotalCents = products.reduce((s, row) => s + (row.amount_total || 0), 0);
    const shippingCents = Math.max(0, (session.amount_total || 0) - (session.amount_subtotal || 0));

    const items = products.map((row) => ({
      name: row.price?.product?.name || row.description || "Item",
      variant: row.price?.product?.description || "",
      qty: row.quantity || 1,
      image: row.price?.product?.images?.[0] || "https://evolveapparel.shop/brand/evolve-emblem-white.png",
      amountCents: row.amount_total || 0,
    }));

    const r = recipient || {};
    const country = { CA: "Canada", US: "United States" }[r.country_code] || r.country_code || "";
    const addressLines = [
      r.name,
      r.address1,
      r.address2,
      `${[r.city, r.state_code].filter(Boolean).join(", ")}${r.zip ? "  " + r.zip : ""}`.trim(),
      country,
    ];

    const html = buildOrderEmailHtml({
      ...ORDER_COPY,
      customerName: (session.customer_details?.name || "").split(" ")[0],
      orderRef: (session.id || "").slice(-8).toUpperCase(), // cosmetic customer-facing ref
      items,
      productsSubtotalCents,
      shippingCents,
      gstCents,
      totalCents: session.amount_total || 0,
      addressLines,
      supportEmail: env.SUPPORT_EMAIL || "shop@evolveapparel.shop",
    });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.ORDER_FROM_EMAIL || "EVOLVE Apparel <shop@evolveapparel.shop>",
        to,
        reply_to: env.SUPPORT_EMAIL || "shop@evolveapparel.shop",
        subject: ORDER_COPY.subject,
        html,
      }),
    });
  } catch (e) {
    console.log("ORDER_EMAIL_FAILED " + (e && e.message));
  }
}

// OPERATOR ALERT — fires when a PAID order fails to create in Printful, so a
// "charged but no order" can never go unnoticed. Best-effort; never throws.
// Goes to BOTH operators from the brand domain; if the domain isn't verified yet,
// falls back to Resend's universal sender so at least the account owner is alerted.
async function sendFailureAlert(env, info) {
  try {
    if (!env.RESEND_API_KEY) return;
    const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const itemsStr = (info.items || []).map((it) => `${it.sync_variant_id} ×${it.quantity}`).join(", ");
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;max-width:560px">
      <h2 style="color:#b00020;margin:0 0 8px">⚠️ Order PAID but Printful order FAILED</h2>
      <p>A customer was charged but the Printful order was not created. Investigate and create/resubmit it manually in Printful.</p>
      <table cellpadding="5" style="border-collapse:collapse;font-size:13px;border:1px solid #eee">
        <tr><td><b>Stripe session</b></td><td>${esc(info.stripe_session)}</td></tr>
        <tr><td><b>Payment intent</b></td><td>${esc(info.payment_intent)}</td></tr>
        <tr><td><b>External id</b></td><td>${esc(info.external_id)}</td></tr>
        <tr><td><b>Customer email</b></td><td>${esc(info.email)}</td></tr>
        <tr><td><b>Items (sync_variant ×qty)</b></td><td>${esc(itemsStr)}</td></tr>
        <tr><td><b>Printful status</b></td><td>${esc(info.status)}</td></tr>
        <tr><td valign="top"><b>Printful error</b></td><td><pre style="white-space:pre-wrap;margin:0">${esc(info.printful_error)}</pre></td></tr>
      </table>
      <p style="color:#777;font-size:12px">EVOLVE checkout worker · automated alert</p>
    </div>`;
    const subject = "⚠️ EVOLVE: order PAID but Printful FAILED — action needed";
    const post = (from, to) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, subject, html }),
      });
    const r = await post(env.ORDER_FROM_EMAIL || "EVOLVE Apparel <shop@evolveapparel.shop>", ["todd@evolveecoblasting.com", "lucidbloks@gmail.com"]);
    if (!r.ok) {
      // sending domain not verified yet → guarantee at least the account owner is alerted
      await post("EVOLVE Alerts <onboarding@resend.dev>", ["lucidbloks@gmail.com"]);
    }
  } catch (e) {
    console.log("ALERT_SEND_FAILED " + (e && e.message));
  }
}

// TEMPORARY hardened email-completion route (strong ADMIN_TOKEN). Returns ONLY Resend
// API responses (domain status / verify result / email id) — never a secret. Actions:
//   ?action=status[&id=<domainId>]  -> GET /domains (or /domains/{id}) — verification state
//   ?action=verify&id=<domainId>    -> POST /domains/{id}/verify
//   ?action=testsend                -> send the real branded email from shop@ to the owner
async function adminEmail(env, url) {
  const json = (o) => new Response(JSON.stringify(o, null, 2), { status: 200, headers: { "Content-Type": "application/json" } });
  if (!env.RESEND_API_KEY) return json({ error: "RESEND_API_KEY not set" });
  const h = { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" };
  const action = url.searchParams.get("action") || "status";
  const id = url.searchParams.get("id") || "";
  if (action === "status") {
    const r = await fetch(id ? `https://api.resend.com/domains/${id}` : "https://api.resend.com/domains", { headers: h });
    return json({ action, status: r.status, body: await r.json().catch(() => null) });
  }
  if (action === "verify") {
    const r = await fetch(`https://api.resend.com/domains/${id}/verify`, { method: "POST", headers: h });
    return json({ action, status: r.status, body: await r.json().catch(() => null) });
  }
  if (action === "testsend") {
    const html = buildOrderEmailHtml({
      ...ORDER_COPY,
      customerName: "Matt",
      orderRef: "VERIFYTEST",
      items: [{ name: "Longhaul Hoodie", variant: "Carbon Grey / S", qty: 1, image: "https://evolveapparel.shop/products/p441089080-0-v4.png", amountCents: 5450 }],
      productsSubtotalCents: 5450,
      shippingCents: 1349,
      gstCents: 273,
      totalCents: 7072,
      addressLines: ["Matt Reagan", "1042 Aurora Way", "Edmonton, AB  T5J 0N3", "Canada"],
      supportEmail: env.SUPPORT_EMAIL || "shop@evolveapparel.shop",
    });
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: h,
      body: JSON.stringify({
        from: env.ORDER_FROM_EMAIL || "EVOLVE Apparel <shop@evolveapparel.shop>",
        to: "lucidbloks@gmail.com",
        reply_to: env.SUPPORT_EMAIL || "shop@evolveapparel.shop",
        subject: ORDER_COPY.subject,
        html,
      }),
    });
    return json({ action, status: r.status, body: await r.json().catch(() => null) });
  }
  if (action === "testalert") {
    // live-proof the H2 fulfillment-failure alert path with clearly-marked TEST data
    await sendFailureAlert(env, {
      stripe_session: "cs_TEST_alert_ignore",
      payment_intent: "pi_TEST",
      external_id: "cs_TEST_alert_ignore",
      email: "test@example.com",
      status: "TEST — ignore",
      printful_error: "TEST ALERT — verifying the fulfillment-failure alert path. This is NOT a real failure.",
      items: [{ sync_variant_id: 5362674524, quantity: 1 }],
    });
    return json({ action, dispatched: true, note: "test alert sent best-effort (see inbox)" });
  }
  return json({ error: "unknown action" });
}

// Polished EVOLVE-branded confirmation email (table-based, inline styles, email-safe).
// Keep in sync with C:\tmp\gen-email.mjs (the preview generator).
function buildOrderEmailHtml(d) {
  const fmt = (c) => "$" + ((c || 0) / 100).toFixed(2);
  const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const LOGO = "https://evolveapparel.shop/brand/evolve-lockup-white.png";
  const name = esc(d.customerName || "friend");
  const headline = (d.headline || "Thanks, {name}.").replace("{name}", name);
  const items = (d.items || [])
    .map(
      (it) => `
      <tr>
        <td width="64" valign="top" style="padding:18px 0 0 0">
          <table role="presentation" cellpadding="0" cellspacing="0" style="background:#15191b;border:1px solid #262b2e;border-radius:5px">
            <tr><td align="center" valign="middle" style="width:54px;height:64px">
              <img src="${it.image}" alt="" width="50" style="display:block;width:50px;height:auto;max-height:62px;border:0;outline:none" />
            </td></tr>
          </table>
        </td>
        <td valign="top" style="padding:18px 0 0 16px">
          <div style="color:#ededed;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;line-height:1.35">${esc(it.name)}</div>
          <div style="color:#8a929a;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;padding-top:4px">${esc(it.variant)} &nbsp;&middot;&nbsp; Qty ${it.qty}</div>
        </td>
        <td valign="top" align="right" style="padding:18px 0 0 0;color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;font-size:14px;white-space:nowrap">${fmt(it.amountCents)}</td>
      </tr>`
    )
    .join("");

  const totalRow = (label, val, opts = {}) =>
    `<tr>
      <td style="padding:${opts.top || 7}px 0 0 0;${opts.border ? "border-top:1px solid #202426;" : ""}color:${opts.strong ? "#f5f5f5" : "#9aa3ab"};font-family:Arial,Helvetica,sans-serif;font-size:${opts.strong ? 16 : 13}px;${opts.strong ? "font-weight:bold;" : ""}">${label}</td>
      <td align="right" style="padding:${opts.top || 7}px 0 0 0;${opts.border ? "border-top:1px solid #202426;" : ""}color:${opts.strong ? "#4ade80" : "#cbd5e1"};font-family:Arial,Helvetica,sans-serif;font-size:${opts.strong ? 18 : 13}px;${opts.strong ? "font-weight:bold;" : ""}">${val}</td>
    </tr>`;

  return `
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#050505;font-size:1px;line-height:1px">${d.preheader || ""}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#050505;margin:0;padding:0">
  <tr><td align="center" style="padding:30px 12px">

    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#0a0a0a;border:1px solid #1b1b1b;border-radius:8px;overflow:hidden">

      <tr><td align="center" style="padding:40px 32px 24px 32px">
        <img src="${LOGO}" alt="EVOLVE" width="172" style="display:block;width:172px;max-width:62%;height:auto;border:0;outline:none" />
      </td></tr>

      <tr><td style="padding:0 32px">
        <div style="height:2px;line-height:2px;font-size:0;background:#4ade80">&nbsp;</div>
      </td></tr>

      <tr><td style="padding:32px 36px 4px 36px">
        <div style="color:#4ade80;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase">${d.kicker || "Order Confirmed"}</div>
        <h1 style="margin:13px 0 0 0;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:bold;line-height:1.25">${headline}</h1>
        <p style="margin:15px 0 0 0;color:#9aa3ab;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7">${d.intro || ""}</p>
        <div style="margin:18px 0 0 0;color:#6b7280;font-family:'Courier New',Courier,monospace;font-size:12px;letter-spacing:1.5px">ORDER REF &nbsp;&middot;&nbsp; #${d.orderRef}</div>
      </td></tr>

      <tr><td style="padding:26px 36px 0 36px">
        <div style="color:#6b7280;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;padding-bottom:8px;border-bottom:1px solid #1f1f1f">${d.orderHeading || "Your order"}</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${items}
        </table>
      </td></tr>

      <tr><td style="padding:20px 36px 0 36px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #1f1f1f">
          ${totalRow("Subtotal", fmt(d.productsSubtotalCents), { top: 16 })}
          ${totalRow("Shipping", fmt(d.shippingCents))}
          ${totalRow("GST (5%)", fmt(d.gstCents))}
          ${totalRow("Total", fmt(d.totalCents), { top: 14, border: true, strong: true })}
        </table>
      </td></tr>

      <tr><td style="padding:28px 36px 0 36px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td valign="top" width="50%" style="padding-right:12px">
              <div style="color:#6b7280;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase">${d.shipLabel || "Shipping to"}</div>
              <div style="color:#c3cad1;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.75;padding-top:9px">${(d.addressLines || []).filter(Boolean).map(esc).join("<br/>")}</div>
            </td>
            <td valign="top" width="50%" style="padding-left:12px">
              <div style="color:#6b7280;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase">${d.etaLabel || "Estimated"}</div>
              <div style="color:#c3cad1;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.75;padding-top:9px">${d.etaBody || ""}</div>
            </td>
          </tr>
        </table>
      </td></tr>

      <tr><td style="padding:30px 36px 6px 36px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0e140e;border:1px solid #1f2c1f;border-radius:7px">
          <tr><td align="center" style="padding:28px 28px 30px 28px">
            <div style="color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold">${d.ctaHeading || "Join the list"}</div>
            <p style="margin:11px auto 20px auto;max-width:400px;color:#9aa3ab;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.65">${d.ctaBody || ""}</p>
            <a href="https://evolveapparel.shop/journal" style="display:inline-block;background:#4ade80;color:#06140a;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;text-decoration:none;padding:14px 32px;border-radius:999px">${d.ctaButton || "Join the list"} &rarr;</a>
          </td></tr>
        </table>
      </td></tr>

      <tr><td align="center" style="padding:30px 36px 38px 36px">
        <div style="color:#4ade80;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:bold;letter-spacing:2.5px;text-transform:uppercase">Earned Outside. Built For The Long Haul.</div>
        <p style="margin:15px 0 0 0;color:#7a828a;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.85">
          <a href="https://evolveapparel.shop" style="color:#9aa3ab;text-decoration:none">evolveapparel.shop</a><br/>
          <a href="mailto:${d.supportEmail}" style="color:#9aa3ab;text-decoration:none">${d.supportEmail}</a> &nbsp;&middot;&nbsp; 780-915-5471
        </p>
        <p style="margin:17px 0 0 0;color:#52585f;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.65">${d.footerNote || ""}</p>
      </td></tr>

    </table>

  </td></tr>
</table>`;
}

// ---- Stripe signature: HMAC-SHA256 + 5-min replay window + constant-time --------
async function verifyStripeSignature(payload, header, secret, toleranceSec = 300) {
  try {
    if (!secret || !header) return false;
    const kv = header.split(",").map((p) => p.split("="));
    const t = kv.find((p) => p[0] === "t")?.[1];
    const sigs = kv.filter((p) => p[0] === "v1").map((p) => p[1]);
    if (!t || !sigs.length) return false;
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
