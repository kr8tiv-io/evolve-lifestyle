// ============================================================
// COMMERCE LAYER — the seam where a fulfillment/commerce provider wires in.
// ------------------------------------------------------------
// The storefront talks to these functions, never to a provider SDK directly.
// Today they read the local placeholder catalogue (src/lib/products.ts); to go
// live, implement the three TODOs below and the rest of the app is unchanged.
// ============================================================

import { getProducts, getProduct, type Product, type ProductVariant } from "./products";
import type { CartLine } from "@/store/cart";

export type Provider = "printful" | "printify" | "shopify" | "placeholder";

export const COMMERCE: { provider: Provider; currency: string; gstRate: number } = {
  provider: "printful",
  currency: "CAD",
  gstRate: 0.05, // 5% GST applied at checkout
};

// Hosted-checkout endpoint (a Stripe Checkout session creator that holds the secret
// keys — e.g. a free Cloudflare Worker; see CHECKOUT_SETUP.md). Public URL, safe to
// ship. When set, the cart redirects to real Stripe checkout; until then it falls
// back to an email order so customers can still buy. Configure via env at build:
//   NEXT_PUBLIC_CHECKOUT_ENDPOINT=https://evolve-checkout.<sub>.workers.dev/create-session
export const CHECKOUT_ENDPOINT = process.env.NEXT_PUBLIC_CHECKOUT_ENDPOINT ?? "";

// Stripe PUBLISHABLE key (pk_…) — public, safe to embed. NOT used by the current
// hosted-checkout redirect flow (the Worker creates the session with the secret key
// and we redirect to session.url), but wired here for any future client-side Stripe.js.
// Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY at build to populate it. NEVER put a secret (sk_…) here.
export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

// Where manual/email orders go until live payments are wired.
export const ORDER_EMAIL = "todd@evolveecoblasting.com";

/** Catalogue reads — swap these bodies for a provider fetch when live. */
export async function fetchProducts(): Promise<Product[]> {
  // TODO(provider): GET store/products -> map onto the Product shape.
  return getProducts();
}

export async function fetchProduct(slug: string): Promise<Product | undefined> {
  // TODO(provider): GET store/products/{id} by mapped slug.
  return getProduct(slug);
}

/** Resolve the provider variant id the checkout API needs for a cart line. */
export function resolveVariant(
  product: Product,
  color: string,
  size: string
): ProductVariant | undefined {
  return product.variants.find((v) => v.color === color && v.size === size);
}

export interface CheckoutItem {
  variantId: string; // Printful sync_variant id — the key fulfillment needs
  sku?: string;
  quantity: number;
  name: string;
  unitPrice: number; // cents
  color: string;
  size: string;
  image: string;
}

export interface CheckoutPayload {
  provider: Provider;
  currency: string;
  items: CheckoutItem[];
  subtotal: number; // cents
  gst: number; // cents
}

/** Build the provider-agnostic payload from the cart (drives the Stripe session). */
export function buildCheckout(lines: CartLine[]): CheckoutPayload {
  const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
  return {
    provider: COMMERCE.provider,
    currency: COMMERCE.currency,
    items: lines.map((l) => ({
      variantId: l.variantId,
      quantity: l.qty,
      name: l.name,
      unitPrice: l.price,
      color: l.color,
      size: l.size,
      image: l.image,
    })),
    subtotal,
    gst: Math.round(subtotal * COMMERCE.gstRate),
  };
}

export type CheckoutResult = {
  ok: boolean;
  url?: string;
  fallback?: "email";
  error?: string;
};

/**
 * Start checkout. When CHECKOUT_ENDPOINT is configured, POST the cart to the
 * Stripe-session worker and return its hosted-checkout URL (the caller redirects).
 * Until that's wired, return a `fallback: "email"` so the cart can open a
 * pre-filled order email — customers can still buy via manual invoice.
 */
export async function startCheckout(lines: CartLine[]): Promise<CheckoutResult> {
  if (!lines.length) return { ok: false, error: "empty_cart" };
  const payload = buildCheckout(lines);

  if (CHECKOUT_ENDPOINT) {
    try {
      const res = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.ok && data.url) return { ok: true, url: data.url };
      return { ok: false, error: data.error || "checkout_unavailable" };
    } catch {
      return { ok: false, error: "network_error" };
    }
  }

  return { ok: false, fallback: "email" };
}

/** Pre-filled order email — the buy-now path until live payments are connected. */
export function buildOrderMailto(lines: CartLine[]): string {
  const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
  const fmt = (c: number) => `$${(c / 100).toFixed(2)} CAD`;
  const body = [
    "I'd like to place an order with EVOLVE:",
    "",
    ...lines.map((l) => `• ${l.name} — ${l.color} / ${l.size} ×${l.qty} — ${fmt(l.price * l.qty)}`),
    "",
    `Subtotal: ${fmt(subtotal)} (shipping + 5% GST added on the invoice)`,
    "",
    "Name:",
    "Shipping address:",
    "",
    "Please send payment instructions. Thanks!",
  ].join("\n");
  return `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent("EVOLVE order")}&body=${encodeURIComponent(body)}`;
}
