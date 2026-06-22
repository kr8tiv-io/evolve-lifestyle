// Emit public/checkout-catalog.json — the AUTHORITATIVE price map the checkout
// Worker uses so prices are never trusted from the client cart (anti-tamper). Also
// includes each variant's CATALOG variant_id (`cv`) which Printful /shipping/rates
// requires (the cart only carries the sync_variant_id; orders use that, but shipping
// rates need the blank catalog variant_id). Re-run after every Printful sync:
//   node scripts/emit-checkout-catalog.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(resolve(ROOT, "src/lib/catalog.generated.ts"), "utf8");
const start = src.indexOf("= [") + 2;
const end = src.lastIndexOf("]") + 1;
const products = JSON.parse(src.slice(start, end));

// Printful creds from .env.local (gitignored) — only used to map sync->catalog ids.
const env = Object.fromEntries(
  readFileSync(resolve(ROOT, ".env.local"), "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);
const H = { Authorization: `Bearer ${env.PRINTFUL_TOKEN}`, "X-PF-Store-Id": env.PRINTFUL_STORE_ID };

// sync_variant_id -> catalog variant_id, per product
const catId = {};
for (const p of products) {
  const res = await fetch(`https://api.printful.com/store/products/${p.externalId}`, { headers: H });
  const data = await res.json();
  for (const sv of data.result?.sync_variants || []) catId[String(sv.id)] = sv.variant_id;
}

const map = {};
for (const p of products) {
  for (const v of p.variants || []) {
    map[String(v.variantId)] = {
      price: p.price, // cents — the price the customer saw
      name: p.name,
      color: v.color,
      size: v.size,
      image: (p.images && p.images[0]) || "",
      cv: catId[String(v.variantId)] || null, // catalog variant_id for /shipping/rates
    };
  }
}

writeFileSync(resolve(ROOT, "public/checkout-catalog.json"), JSON.stringify(map));
const withCv = Object.values(map).filter((m) => m.cv).length;
console.log(`Wrote public/checkout-catalog.json — ${Object.keys(map).length} variants, ${withCv} with catalog variant_id`);
