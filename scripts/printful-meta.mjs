// Fetch accurate per-product metadata from Printful: blank brand/model/type and
// the actual decoration technique (embroidery vs DTG print) -> printful-meta.json
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const env = Object.fromEntries(
  readFileSync(resolve(".env.local"), "utf8").split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const H = { Authorization: `Bearer ${env.PRINTFUL_TOKEN}`, "X-PF-Store-Id": env.PRINTFUL_STORE_ID };
const get = async (u) => (await fetch(u, { headers: H })).json();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const list = (await get(`https://api.printful.com/store/products?limit=100`)).result;
const catalogCache = {};
const out = [];

for (const item of list) {
  const detail = (await get(`https://api.printful.com/store/products/${item.id}`)).result;
  const sp = detail.sync_product;
  const sv = (detail.sync_variants || []).find((v) => !v.is_ignored) || detail.sync_variants[0];
  const productId = sv?.product?.product_id;

  // decoration technique from the design files across all variants
  const fileTypes = new Set();
  for (const v of detail.sync_variants || []) {
    for (const f of v.files || []) fileTypes.add(f.type);
    for (const o of v.options || []) if (o.id) fileTypes.add("opt:" + o.id);
  }
  const ft = [...fileTypes];
  const isEmbroidery = ft.some((t) => /embroider/i.test(t));

  // catalog blank brand/model/type
  let cat = catalogCache[productId];
  if (productId && !cat) {
    cat = (await get(`https://api.printful.com/products/${productId}`)).result;
    catalogCache[productId] = cat;
    await sleep(120);
  }
  const cp = cat?.product || {};
  const techniques = (cp.techniques || []).map((t) => t.key || t.display_name);

  out.push({
    id: String(sp.id),
    printfulName: sp.name,
    blankType: cp.type_name || cp.type || "",
    brand: cp.brand || "",
    model: cp.model || "",
    techniques,
    fileTypes: ft,
    technique: isEmbroidery ? "embroidery" : (techniques.includes("embroidery") && !techniques.includes("dtg") ? "embroidery" : "print"),
    colors: [...new Set((detail.sync_variants || []).map((v) => v.color).filter(Boolean))],
    sizes: [...new Set((detail.sync_variants || []).map((v) => v.size).filter(Boolean))],
    minPrice: Math.min(...(detail.sync_variants || []).map((v) => parseFloat(v.retail_price)).filter((n) => !isNaN(n))),
  });
  console.log(`  ${sp.name}  [${cp.brand || "?"} ${cp.model || ""}]  type=${cp.type_name || "?"}  technique=${out[out.length - 1].technique}`);
  await sleep(120);
}

writeFileSync(resolve("scripts/printful-meta.json"), JSON.stringify(out, null, 2));
console.log(`\nWrote ${out.length} products to scripts/printful-meta.json`);
