// ============================================================
// COMMERCE LAYER — the seam where Printful / Printify / Shopify wires in.
// ------------------------------------------------------------
// The storefront talks to these functions, never to a provider SDK directly.
// Today they read the local placeholder catalogue (src/lib/products.ts); to go
// live, implement the three TODOs below and the rest of the app is unchanged.
// ============================================================

import { getProducts, getProduct, type Product, type ProductVariant } from "./products";
import type { CartLine } from "@/store/cart";

export type Provider = "printful" | "printify" | "shopify" | "placeholder";

export const COMMERCE: { provider: Provider; currency: string; gstRate: number } = {
  provider: "placeholder",
  currency: "CAD",
  gstRate: 0.05, // 5% GST applied at checkout
};

/** Catalogue reads — swap these bodies for a provider fetch when live. */
export async function fetchProducts(): Promise<Product[]> {
  // TODO(printful): GET store/products -> map onto the Product shape.
  return getProducts();
}

export async function fetchProduct(slug: string): Promise<Product | undefined> {
  // TODO(printful): GET store/products/{id} by mapped slug.
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

export interface CheckoutPayload {
  provider: Provider;
  currency: string;
  items: { variantId: string; sku?: string; quantity: number }[];
  subtotal: number; // cents
  gst: number; // cents
}

/** Build the provider-agnostic payload from the cart. */
export function buildCheckout(lines: CartLine[]): CheckoutPayload {
  const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
  return {
    provider: COMMERCE.provider,
    currency: COMMERCE.currency,
    items: lines.map((l) => ({
      variantId: l.variantId,
      quantity: l.qty,
    })),
    subtotal,
    gst: Math.round(subtotal * COMMERCE.gstRate),
  };
}

/**
 * Start checkout. Today: a no-op stub. Live: POST buildCheckout(lines) to a
 * route handler that creates a Printful/Shopify order or hosted-checkout
 * session and returns a redirect URL.
 */
export async function startCheckout(lines: CartLine[]): Promise<{ url?: string; ok: boolean }> {
  // TODO(checkout): const res = await fetch('/api/checkout', { method:'POST', body: JSON.stringify(buildCheckout(lines)) })
  if (typeof window !== "undefined") {
    console.info("[EVOLVE] checkout payload (placeholder):", buildCheckout(lines));
  }
  return { ok: false };
}
