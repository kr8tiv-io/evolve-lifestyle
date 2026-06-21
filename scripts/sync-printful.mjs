// Sync the Evolve Printful store into src/lib/catalog.generated.ts
// Reads PRINTFUL_TOKEN + PRINTFUL_STORE_ID from .env.local (gitignored).
// Run: node scripts/sync-printful.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(".");
const env = Object.fromEntries(
  readFileSync(resolve(ROOT, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);
const TOKEN = env.PRINTFUL_TOKEN;
const STORE = env.PRINTFUL_STORE_ID;
const H = { Authorization: `Bearer ${TOKEN}`, "X-PF-Store-Id": STORE };
const IMG_DIR = resolve(ROOT, "public/products");
mkdirSync(IMG_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (s) => {
  let out = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (out.length > 60) out = out.slice(0, 60).replace(/-[^-]*$/, ""); // no mid-word cut
  return out.replace(/^-|-$/g, "");
};

const COLOR_HEX = {
  black: "#0a0a0a", white: "#ece9e2", navy: "#1f2a3d", "navy blazer": "#20283a",
  red: "#8a2b1e", maroon: "#5a2418", "heather": "#8a9099", grey: "#5b5f63",
  gray: "#5b5f63", "carbon grey": "#44474a", "dark grey heather": "#3a3d41",
  "sport grey": "#9aa0a4", "athletic heather": "#b9bdc0", "dark heather": "#3f4347",
  charcoal: "#2a2e31", asphalt: "#3b3f43", ash: "#cfd2d4", "forest green": "#1f3d2b",
  "forrest green": "#1f3d2b", "military green": "#3d4a2b", "army": "#4b5320",
  olive: "#3d4a2b", green: "#2f5d3a", kelly: "#2e7d4f", "irish green": "#2e9e5b",
  royal: "#1f3d7a", "true royal": "#1f3d7a", sand: "#cdbb9a", natural: "#e6dcc6",
  bone: "#e9e4d8", oatmeal: "#d8cdb5", stone: "#cfc6b5", "true navy": "#20283a",
  "steel blue": "#4a6378", denim: "#3b5168", "stealth": "#16181a", camo: "#4b5320",
  "camouflage": "#4b5320", silver: "#c9ced4", tan: "#c2a878", brown: "#5a4332",
};
const colorHex = (c) => {
  if (!c) return "#3d4a2b";
  const k = c.toLowerCase().trim();
  if (COLOR_HEX[k]) return COLOR_HEX[k];
  for (const key of Object.keys(COLOR_HEX)) if (k.includes(key)) return COLOR_HEX[key];
  return "#3d4a2b";
};

const classify = (name) => {
  const n = name.toLowerCase();
  if (/(hat|cap|snapback|trucker|beanie|toque)/.test(n)) return "headwear";
  if (/(mug|tumbler|bottle|sticker|tote|bag|patch|pin)/.test(n)) return "accessories";
  if (/(hoodie|sweatshirt|jacket|zip|crewneck|fleece)/.test(n)) return "outerwear";
  return "tops"; // tees, shirts, tanks, long sleeve, v-neck
};
const COLLECTIONS = ["boreal", "peaks", "prairies", "coast"];
const TONES = {
  boreal: ["#0d3b1f", "#00ff41"], peaks: ["#13233a", "#4ade80"],
  prairies: ["#3a2f12", "#39ff14"], coast: ["#0c2c33", "#00ff41"],
};
const SLOGANS = [
  "Descended from survivors.", "Built for the bush. Made for the long haul.",
  "Earned outside.", "Canadian-built. Weather-tested.", "Strip it back. Build it stronger.",
  "Cold and free beats warm and bored.", "Where the signal dies, we come alive.",
  "Work hard. Play harder. Get outside.", "Restore what the week wore down.",
  "Tougher than the winters that made us.", "From the wheat to the water.",
  "Some things should never change. Get outside.",
];
// Cooler, on-brand names keyed by Printful product id (override the generic ones).
const COOL_NAMES = {
  "441089440": "Treeline Camo Trucker",
  "441089080": "Longhaul Hoodie",
  "441087767": "Coldfront Champion Long-Sleeve",
  "441087198": "Driftwood Hooded Long-Sleeve",
  "441085408": "Summit Full-Zip Hoodie",
  "441085023": "Heritage Classic Tee",
  "441084646": "Deepwoods Heavyweight Hoodie",
  "441084360": "Nightfall Snapback",
  "441084054": "Whiteout Organic Tee",
  "441083649": "Ridgeline Snapback",
  "441082795": "Stormcheck Packable Jacket",
  "441082547": "Backcountry Trucker",
  "441082269": "Outpost Ringer Tee",
  "440709618": "Wildmark Organic Tee",
  "440708831": "Trailhead Tank",
  "440708024": "Whitewood Forest Snapback",
  "440613219": "Frontier Trucker",
  "440612780": "Boreal Standard Hoodie",
  "440612001": "Whiteout V-Neck",
  "440610853": "Woodsmoke Premium Crew",
  "440610516": "Blackout Hoodie",
  "440609882": "Anvil Heavyweight Tee",
  "440609698": "Trapline Hunting Hoodie",
  "440609155": "Halfday Raglan",
  "440608834": "Northcut V-Neck",
  "440607891": "Great White North Tumbler",
  "440607292": "Stealth Original Snapback",
  "440606458": "Stealth Denim Cap",
  "440605056": "Wanderlust Cuff Beanie",
  "440601843": "Borealis Camp Mug",
  "440600277": "Stealth Full-Zip Hoodie",
  "440597762": "Hearth Fleece Zip",
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "OS", "One size"];
const sizeRank = (s) => {
  const i = SIZE_ORDER.indexOf(s);
  return i < 0 ? 99 : i;
};

async function getJSON(url) {
  const res = await fetch(url, { headers: H });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}
async function download(url, file) {
  try {
    if (existsSync(file)) return true; // already pulled — keep re-syncs fast
    const res = await fetch(url);
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) return false;
    writeFileSync(file, buf);
    return true;
  } catch {
    return false;
  }
}

const list = (await getJSON(`https://api.printful.com/store/products?limit=100`)).result;
console.log(`Found ${list.length} products. Syncing…`);

const products = [];
const seenSlugs = new Set();
let idx = 0;
for (const item of list) {
  const detail = (await getJSON(`https://api.printful.com/store/products/${item.id}`)).result;
  const sp = detail.sync_product;
  const svs = (detail.sync_variants || []).filter((v) => !v.is_ignored);
  if (!svs.length) continue;

  const name = COOL_NAMES[String(sp.id)] || sp.name;
  const category = classify(sp.name); // classify on the original (always has the type word)
  const collection = COLLECTIONS[idx % COLLECTIONS.length];
  let sname = slug(name) || `product-${sp.id}`;
  if (seenSlugs.has(sname)) sname = `${sname}-${String(sp.id).slice(-4)}`;
  seenSlugs.add(sname);

  // variants
  const colorsSeen = new Map();
  const variants = svs.map((v) => {
    const swatch = colorHex(v.color);
    if (v.color && !colorsSeen.has(v.color)) {
      const prev = (v.files || []).find((f) => f.type === "preview");
      colorsSeen.set(v.color, prev?.preview_url || sp.thumbnail_url);
    }
    return {
      id: slug(`${sname}-${v.color || "os"}-${v.size || "os"}`),
      variantId: String(v.id), // Printful sync_variant id — used for orders
      sku: v.sku || "",
      size: v.size || "OS",
      color: v.color || "Standard",
      swatch,
      inStock: true,
    };
  });

  const sizes = [...new Set(svs.map((v) => v.size || "OS"))].sort(
    (a, b) => sizeRank(a) - sizeRank(b)
  );
  const prices = svs.map((v) => parseFloat(v.retail_price)).filter((n) => !isNaN(n));
  const price = Math.round(Math.min(...prices) * 100);

  // images — unique color previews, downloaded locally (cap 3)
  const urls = [...new Set([sp.thumbnail_url, ...colorsSeen.values()].filter(Boolean))].slice(0, 3);
  const images = [];
  let n = 0;
  for (const url of urls) {
    const ext = (url.split("?")[0].match(/\.(png|jpg|jpeg|webp)$/i)?.[1] || "png").toLowerCase();
    // id-based filename so re-syncs stay stable (no orphans when names change)
    const file = `p${sp.id}-${n}.${ext}`;
    const ok = await download(url, resolve(IMG_DIR, file));
    images.push(ok ? `/products/${file}` : url);
    n++;
  }
  if (!images.length) images.push(sp.thumbnail_url);

  const colourCount = colorsSeen.size || 1;
  const catLabel = { outerwear: "Outerwear", tops: "Tops", headwear: "Headwear", accessories: "Accessories" }[category];
  products.push({
    slug: sname,
    name,
    subtitle: `${catLabel} · made to order`,
    category,
    collection,
    price,
    externalId: String(sp.id), // Printful sync_product id
    tagline: SLOGANS[idx % SLOGANS.length],
    description: `${name} — ${SLOGANS[idx % SLOGANS.length]} Printed and embroidered to order, then shipped across Canada and the continent.`,
    details: [
      "Made to order",
      "Ships across Canada & North America",
      `${colourCount} colourway${colourCount > 1 ? "s" : ""} · sizes ${sizes.join(", ")}`,
      "EVOLVE artwork — earned outside",
    ],
    tone: TONES[collection],
    images,
    sizes,
    variants,
    badge: category === "outerwear" && idx % 4 === 0 ? "Flagship" : undefined,
  });
  console.log(`  ✓ ${name}  (was: ${sp.name})`);
  idx++;
  await sleep(150);
}

const header = `// AUTO-GENERATED by scripts/sync-printful.mjs — do not edit by hand.
// Source: Printful "Evolve" store. Re-run the script to refresh.
import type { Product } from "./products";

export const CATALOG_PRODUCTS: Product[] = `;
writeFileSync(
  resolve(ROOT, "src/lib/catalog.generated.ts"),
  header + JSON.stringify(products, null, 2) + ";\n",
  "utf8"
);
console.log(`\nWrote ${products.length} products to src/lib/catalog.generated.ts`);
