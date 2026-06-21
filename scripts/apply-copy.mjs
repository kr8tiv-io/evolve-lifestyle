// Apply scripts/product-copy.json (accurate names/descriptions/brand) to
// src/lib/catalog.generated.ts, fix categories + technique-accurate details,
// and regenerate slugs from the new names.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const copy = JSON.parse(readFileSync(resolve("scripts/product-copy.json"), "utf8"));
const meta = JSON.parse(readFileSync(resolve("scripts/printful-meta.json"), "utf8"));
const techById = Object.fromEntries(meta.map((m) => [m.id, m.technique]));

const catPath = resolve("src/lib/catalog.generated.ts");
const file = readFileSync(catPath, "utf8");
const start = file.indexOf("= [") + 2;
const end = file.lastIndexOf("]");
const products = JSON.parse(file.slice(start, end + 1));

const slugify = (s) => {
  let o = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (o.length > 60) o = o.slice(0, 60).replace(/-[^-]*$/, "");
  return o;
};
const seen = new Set();

for (const p of products) {
  const c = copy[p.externalId];
  if (!c) continue;
  p.name = c.name;
  p.description = c.description;
  p.brand = c.brand;
  if (c.category) p.category = c.category;
  // technique-accurate first detail line
  const tech = techById[p.externalId] === "print" ? "Printed to order" : "Embroidered to order";
  if (Array.isArray(p.details) && p.details.length) p.details[0] = `${tech} — made on demand`;
  // regenerate slug from the new name (unique)
  let s = slugify(c.name) || `product-${p.externalId}`;
  if (seen.has(s)) s = `${s}-${String(p.externalId).slice(-4)}`;
  seen.add(s);
  p.slug = s;
  // subtitle reflects category + technique
  const catLabel = { outerwear: "Outerwear", tops: "Tops", headwear: "Headwear", accessories: "Accessories" }[p.category];
  p.subtitle = `${catLabel} · ${techById[p.externalId] === "print" ? "printed" : "embroidered"}`;
}

const header = `// AUTO-GENERATED — synced from Printful, copy from scripts/product-copy.json.\nimport type { Product } from "./products";\n\nexport const PRINTFUL_PRODUCTS: Product[] = `;
writeFileSync(catPath, header + JSON.stringify(products, null, 2) + ";\n", "utf8");
console.log(`Applied copy to ${products.length} products. Sample:`);
products.slice(0, 5).forEach((p) => console.log(`  ${p.name}  [${p.brand}]  /shop/${p.slug}  (${p.subtitle})`));
