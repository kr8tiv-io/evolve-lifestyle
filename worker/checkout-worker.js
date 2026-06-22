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
    const r = data.result[0]; // Printful returns cheapest/standard first
    const cents = Math.round(parseFloat(r.rate) * 100);
    if (!Number.isFinite(cents) || cents < 0) return null;
    console.log("SHIPPING_RATE_OK " + JSON.stringify({ name: r.name, rate: r.rate, cents }));
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

  // IDEMPOTENCY: one Printful order per Stripe session (external_id unique per store).
  const externalId = session.id.slice(-32);
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

  const pfRes = await fetch(
    `https://api.printful.com/orders?confirm=${env.PRINTFUL_CONFIRM === "true" ? "1" : "0"}`,
    {
      method: "POST",
      headers: { ...pf, "Content-Type": "application/json" },
      body: JSON.stringify({ external_id: externalId, recipient, items }),
    }
  );

  if (!pfRes.ok) {
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
    return new Response("printful order failed", { status: 500 }); // Stripe retries; idempotency-safe
  }
  await sendOrderEmail(env, session, liJson.data, recipient); // branded confirmation (best-effort)
  return new Response("ok", { status: 200 });
}

// ---- branded order-confirmation email (optional; via Resend) ----------------
// No-op unless RESEND_API_KEY is set (Todd provides it + verifies a sending domain).
async function sendOrderEmail(env, session, lineItems, recipient) {
  try {
    const to = session.customer_details?.email;
    if (!env.RESEND_API_KEY || !to) return;
    const fmt = (c) => "$" + ((c || 0) / 100).toFixed(2);
    const rows = (lineItems || [])
      .map(
        (li) =>
          `<tr><td style="padding:6px 0;color:#cbd5e1;font-size:14px">${li.description || "Item"} &times; ${li.quantity}</td><td style="padding:6px 0;text-align:right;color:#f3f4f6;font-size:14px">${fmt(li.amount_total)}</td></tr>`
      )
      .join("");
    const r = recipient || {};
    const html = `<div style="background:#0a0a0a;color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;padding:32px;max-width:560px;margin:auto">
      <div style="color:#4ade80;font-size:13px;letter-spacing:3px;font-weight:bold">EVOLVE — ORDER CONFIRMED</div>
      <p style="color:#cbd5e1;font-size:15px;line-height:1.5">Thanks${session.customer_details?.name ? ", " + session.customer_details.name : ""} — your order is in. It's made to order; we'll get it produced and on its way.</p>
      <table style="width:100%;border-collapse:collapse;margin:18px 0">${rows}
        <tr><td style="padding-top:10px;border-top:1px solid #2a2a2a;color:#94a3b8;font-size:14px">Total paid</td><td style="padding-top:10px;border-top:1px solid #2a2a2a;text-align:right;color:#4ade80;font-weight:bold;font-size:15px">${fmt(session.amount_total)}</td></tr>
      </table>
      <p style="color:#94a3b8;font-size:13px;line-height:1.5">Shipping to:<br>${[r.name, r.address1, [r.city, r.state_code, r.zip].filter(Boolean).join(" "), r.country_code].filter(Boolean).join("<br>")}</p>
      <p style="color:#64748b;font-size:12px;margin-top:24px">EVOLVE Apparel &middot; evolveapparel.shop &middot; Earned outside.</p>
    </div>`;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.ORDER_FROM_EMAIL || "EVOLVE Apparel <orders@evolveapparel.shop>",
        to,
        subject: "Your EVOLVE order is confirmed",
        html,
      }),
    });
  } catch (e) {
    console.log("ORDER_EMAIL_FAILED " + (e && e.message));
  }
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
