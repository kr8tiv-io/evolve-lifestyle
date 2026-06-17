// ============================================================
// PLACEHOLDER PRODUCT CATALOG
// ------------------------------------------------------------
// Shape is drop-ship ready: each product/variant carries the fields a
// Printful / Printify / Shopify sync will populate (externalId, variantId,
// sku, inventory). Swap `getProducts()` for a real fetch later — the UI
// doesn't need to change. Imagery is royalty-free outdoor stock (Unsplash),
// clearly swappable, with a graceful brand-gradient fallback in <ProductImage>.
// ============================================================

export type Category = "tops" | "outerwear" | "headwear" | "accessories";
export type Collection = "prairies" | "peaks" | "boreal" | "coast";

export interface ProductVariant {
  id: string;
  /** Printful/Printify catalog variant id — filled by sync */
  variantId?: string;
  sku?: string;
  size: string;
  color: string;
  /** hex swatch shown in the UI */
  swatch: string;
  inStock: boolean;
}

export interface Product {
  slug: string;
  name: string;
  subtitle: string;
  category: Category;
  collection: Collection;
  /** price in cents (CAD) */
  price: number;
  compareAt?: number;
  /** Printful/Printify product id — filled by sync */
  externalId?: string;
  /** brand-story line printed on the tag / shown on PDP */
  tagline: string;
  description: string;
  details: string[];
  /** gradient tones used for the brand fallback + ambient glow */
  tone: [string, string];
  images: string[];
  sizes: string[];
  variants: ProductVariant[];
  badge?: string;
}

// Local, self-hosted outdoor stock (royalty-free, swappable) in /public/images.
const ux = (id: string) => `/images/photo-${id}.jpg`;

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function buildVariants(slug: string, colors: { name: string; swatch: string }[]): ProductVariant[] {
  const variants: ProductVariant[] = [];
  colors.forEach((c) => {
    SIZES.forEach((size) => {
      variants.push({
        id: `${slug}-${c.name}-${size}`.toLowerCase().replace(/\s+/g, "-"),
        sku: `EVL-${slug.toUpperCase().slice(0, 6)}-${c.name.slice(0, 3).toUpperCase()}-${size}`,
        size,
        color: c.name,
        swatch: c.swatch,
        inStock: !(size === "XXL" && c.name === "Aurora"),
      });
    });
  });
  return variants;
}

export const PRODUCTS: Product[] = [
  {
    slug: "survivors-heavyweight-hoodie",
    name: "Survivors Heavyweight Hoodie",
    subtitle: "480 GSM brushed-back fleece",
    category: "outerwear",
    collection: "boreal",
    price: 12800,
    tagline: "Descended from survivors.",
    description:
      "The anchor of the range. A 480 GSM heavyweight built to outlive the winters that made us — boxed shoulders, double-lined hood, and a weight that settles like armour the moment you pull it on.",
    details: [
      "480 GSM brushed-back organic cotton fleece",
      "Boxed, dropped shoulder for a heavier drape",
      "Embroidered EVOLVE wordmark, tonal",
      "Garment-dyed — every piece weathers its own way",
    ],
    tone: ["#0d3b1f", "#00ff41"],
    images: [ux("1441974231531-c6227db76b6e"), ux("1518611012118-696072aa579a"), ux("1483728642387-6c3bdd6c93e5")],
    sizes: SIZES,
    variants: buildVariants("survivors-hoodie", [
      { name: "Boreal Void", swatch: "#0a0a0a" },
      { name: "Aurora", swatch: "#1f3d2b" },
      { name: "Alloy", swatch: "#9aa3ab" },
    ]),
    badge: "Flagship",
  },
  {
    slug: "prairies-to-peaks-tee",
    name: "Prairies to Peaks Tee",
    subtitle: "Heavyweight 240 GSM cotton",
    category: "tops",
    collection: "prairies",
    price: 5400,
    tagline: "From the wheat to the water.",
    description:
      "A clean, heavyweight tee that carries the whole country across the chest — wheat to water, flatland to summit. Cut a touch longer so it stays put when the work starts.",
    details: [
      "240 GSM combed ring-spun cotton",
      "Side-seamed, pre-shrunk",
      "Screen-printed back graphic, water-based ink",
      "Relaxed, slightly long body",
    ],
    tone: ["#3a2f12", "#39ff14"],
    images: [ux("1469474968028-56623f02e42e"), ux("1506905925346-21bda4d32df4"), ux("1470770841072-f978cf4d019e")],
    sizes: SIZES,
    variants: buildVariants("p2p-tee", [
      { name: "Boreal Void", swatch: "#0a0a0a" },
      { name: "Bone", swatch: "#e9e4d8" },
      { name: "Field Olive", swatch: "#3d4a2b" },
    ]),
    badge: "New Drop",
  },
  {
    slug: "boreal-flannel-overshirt",
    name: "Boreal Flannel Overshirt",
    subtitle: "Brushed heavy flannel",
    category: "outerwear",
    collection: "boreal",
    price: 14600,
    tagline: "Built for the bush. Made for the long haul.",
    description:
      "A heavy brushed flannel that works as a shirt in October and a jacket in November. Chest pockets, horn-tone buttons, and a fit that layers clean over a hoodie.",
    details: [
      "Brushed cotton-twill flannel, midweight-heavy",
      "Twin chest pockets with flap",
      "Corozo-look buttons",
      "Layering fit — sized to go over fleece",
    ],
    tone: ["#3a1c14", "#4ade80"],
    images: [ux("1473773508845-188df298d2d1"), ux("1551698618-1dfe5d97d256"), ux("1454496522488-7a8e488e8606")],
    sizes: SIZES,
    variants: buildVariants("boreal-flannel", [
      { name: "Ember Plaid", swatch: "#5a2418" },
      { name: "Pine Plaid", swatch: "#1f3326" },
    ]),
  },
  {
    slug: "caribou-trucker-cap",
    name: "Caribou Trucker Cap",
    subtitle: "Structured 5-panel, rope front",
    category: "headwear",
    collection: "peaks",
    price: 4200,
    tagline: "Bears, caribou, and the rest of us.",
    description:
      "A structured trucker with a low-profile front and a breathable mesh back. Embroidered caribou crest, rope detail, snap-back for everyone at camp.",
    details: [
      "Cotton-twill front, breathable mesh back",
      "3D-embroidered caribou crest",
      "Adjustable snapback",
      "Pre-curved visor with rope accent",
    ],
    tone: ["#16302a", "#00ff41"],
    images: [ux("1521369909029-2afed882baee"), ux("1556306535-0f09a537f0a3"), ux("1588850561407-ed78c282e89b")],
    sizes: ["OS"],
    variants: [
      { id: "caribou-cap-black-os", sku: "EVL-CARIB-BLK-OS", size: "OS", color: "Boreal Void", swatch: "#0a0a0a", inStock: true },
      { id: "caribou-cap-olive-os", sku: "EVL-CARIB-OLV-OS", size: "OS", color: "Field Olive", swatch: "#3d4a2b", inStock: true },
      { id: "caribou-cap-sand-os", sku: "EVL-CARIB-SND-OS", size: "OS", color: "Sand", swatch: "#cdbb9a", inStock: true },
    ],
    badge: "Best Seller",
  },
  {
    slug: "long-haul-thermal",
    name: "Long Haul Waffle Thermal",
    subtitle: "Waffle-knit base layer",
    category: "tops",
    collection: "peaks",
    price: 7200,
    tagline: "Cold and free beats warm and bored.",
    description:
      "The first layer on the coldest mornings. A waffle-knit thermal with a tall collar and thumb-loop cuffs that disappears under everything else and keeps doing its job.",
    details: [
      "Cotton-poly waffle knit, midweight",
      "Tall ribbed collar, thumb-loop cuffs",
      "Flatlock seams — no chafe under packs",
      "Tonal sleeve hit",
    ],
    tone: ["#13233a", "#4ade80"],
    images: [ux("1483985988355-763728e1935b"), ux("1434389677669-e08b4cac3105"), ux("1487222477894-8943e31ef7b2")],
    sizes: SIZES,
    variants: buildVariants("long-haul-thermal", [
      { name: "Slate", swatch: "#33414d" },
      { name: "Boreal Void", swatch: "#0a0a0a" },
      { name: "Rust", swatch: "#8a3b1e" },
    ]),
  },
  {
    slug: "coast-rain-shell",
    name: "Coast Packable Shell",
    subtitle: "Seam-sealed 2.5L shell",
    category: "outerwear",
    collection: "coast",
    price: 18900,
    compareAt: 21500,
    tagline: "Where the signal dies, we come alive.",
    description:
      "A packable, seam-sealed shell for the coast — where the rain doesn't ask permission. Packs into its own chest pocket, opens up into full storm coverage.",
    details: [
      "2.5-layer seam-sealed waterproof shell",
      "Packs into chest pocket",
      "Adjustable storm hood + hem",
      "Reflective EVOLVE hit at back yoke",
    ],
    tone: ["#0c2c33", "#00ff41"],
    images: [ux("1501785888041-af3ef285b470"), ux("1465056836041-7f43ac27dcb5"), ux("1426604966848-d7adac402bff")],
    sizes: SIZES,
    variants: buildVariants("coast-shell", [
      { name: "Storm", swatch: "#2a3338" },
      { name: "Aurora", swatch: "#1f3d2b" },
    ]),
    badge: "Limited",
  },
  {
    slug: "weather-tested-beanie",
    name: "Weather-Tested Cuff Beanie",
    subtitle: "Ribbed merino-blend",
    category: "headwear",
    collection: "boreal",
    price: 3600,
    tagline: "Canadian-built. Weather-tested.",
    description:
      "A tight ribbed cuff beanie in a merino blend that holds heat without the itch. Woven label, real fold, no slouch gimmicks.",
    details: ["Merino-acrylic rib knit", "Woven EVOLVE label", "True double-layer cuff", "One size, holds shape"],
    tone: ["#2c1b3a", "#4ade80"],
    images: [ux("1576871337622-98d48d1cf531"), ux("1473773508845-188df298d2d1"), ux("1487222477894-8943e31ef7b2")],
    sizes: ["OS"],
    variants: [
      { id: "beanie-black-os", sku: "EVL-BEAN-BLK-OS", size: "OS", color: "Boreal Void", swatch: "#0a0a0a", inStock: true },
      { id: "beanie-neon-os", sku: "EVL-BEAN-NEO-OS", size: "OS", color: "Aurora Neon", swatch: "#00ff41", inStock: true },
      { id: "beanie-oat-os", sku: "EVL-BEAN-OAT-OS", size: "OS", color: "Oat", swatch: "#d8cdb5", inStock: false },
    ],
  },
  {
    slug: "trapline-work-tee",
    name: "Trapline Pocket Tee",
    subtitle: "Heavy 260 GSM pocket tee",
    category: "tops",
    collection: "prairies",
    price: 5800,
    tagline: "Restore what the week wore down.",
    description:
      "A heavy pocket tee built around the blasting roots — strip it back, build it stronger. Reinforced pocket, tonal stitch, the kind of tee you reach for first.",
    details: ["260 GSM heavy cotton", "Reinforced chest pocket", "Twin-needle hems", "Tonal contrast stitch"],
    tone: ["#2f2f12", "#39ff14"],
    images: [ux("1503342217505-b0a15ec3261c"), ux("1521572163474-6864f9cf17ab"), ux("1500534623283-312aade485b7")],
    sizes: SIZES,
    variants: buildVariants("trapline-tee", [
      { name: "Boreal Void", swatch: "#0a0a0a" },
      { name: "Ash", swatch: "#5b5f63" },
      { name: "Bone", swatch: "#e9e4d8" },
    ]),
  },
];

export function getProducts(): Product[] {
  return PRODUCTS;
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getFeatured(): Product[] {
  return PRODUCTS.filter((p) => p.badge).slice(0, 4);
}

export const CATEGORY_LABELS: Record<Category, string> = {
  tops: "Tops",
  outerwear: "Outerwear",
  headwear: "Headwear",
  accessories: "Accessories",
};

export const COLLECTION_LABELS: Record<Collection, string> = {
  prairies: "Prairies",
  peaks: "Peaks",
  boreal: "Boreal",
  coast: "Coast",
};
