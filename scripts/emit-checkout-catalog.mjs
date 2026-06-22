// Emit public/checkout-catalog.json — the AUTHORITATIVE price map the checkout
// Worker uses so prices are never trusted from the client cart (anti-tamper).
// Re-run after every Printful sync:  node scripts/emit-checkout-catalog.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(resolve(ROOT, "src/lib/catalog.generated.ts"), "utf8");

// the file is `export const CATALOG_PRODUCTS: Product[] = [ ...pure JSON... ];`
const start = src.indexOf("= [") + 2;
const end = src.lastIndexOf("]") + 1;
const products = JSON.parse(src.slice(start, end));

const map = {};
for (const p of products) {
  for (const v of p.variants || []) {
    map[String(v.variantId)] = {
      price: p.price, // cents — the price the customer saw
      name: p.name,
      color: v.color,
      size: v.size,
      image: (p.images && p.images[0]) || "",
    };
  }
}

writeFileSync(resolve(ROOT, "public/checkout-catalog.json"), JSON.stringify(map));
console.log(`Wrote public/checkout-catalog.json — ${Object.keys(map).length} variants`);
