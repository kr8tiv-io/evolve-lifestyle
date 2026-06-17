# EVOLVE — Lifestyle Storefront (Framework)

The flagship e-commerce / lifestyle site for **EVOLVE**, the Western-Canadian
outdoor apparel arm of Evolve Eco Blasting. Dark, cinematic, Awwwards-grade —
*prairies to peaks, boreal to coast.*

This repo is the **framework build**: a runnable, gorgeous front-end with the
full design system, all key pages, a cinematic Three.js hero, and slick motion —
wired with placeholder products and structured so Printful / Shopify checkout
drops in later.

> **Read the brand brief first:** [`BRAND_BRIEF.md`](./BRAND_BRIEF.md) — essence,
> positioning, the three stories, all 20 slogans, customer, voice, visual
> identity, product lines, and open decisions to sort.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build && npm run start
```

> Tip: don't run `npm run build` while `npm run dev` is live — they share the
> `.next` folder. Stop dev first.

Requirements: Node 18.18+ (built on Node 24). Windows/macOS/Linux.

---

## Tech

- **Next.js 14** (App Router) · **React 18** · **TypeScript** · **Tailwind CSS**
- **Framer Motion** — page transitions, scroll reveals, magnetic UI
- **Three.js** via **react-three-fiber** + custom GLSL — the cinematic hero
  (flowing aurora + displaced boreal terrain + drifting particle field)
- **Lenis** — smooth scroll · **Zustand** — cart state (persisted)

## Pages

| Route | What |
|-------|------|
| `/` | Cinematic 3D hero, manifesto (scroll-scrub), featured drop, brand pillars, slogan moments, horizontal lookbook, footer |
| `/shop` | Product grid with category + collection filters and sort |
| `/shop/[slug]` | Product detail — gallery, colour/size variants, add-to-kit, drop-ship-ready data |
| `/about` | Brand story — the three pillars, slogan wall, links back to the service company |
| `/journal` | Editorial / lookbook grid (placeholder, CMS/MDX-ready) |
| Cart drawer | Slide-out, persisted, with a placeholder checkout handoff |

## Architecture

```
src/
  app/            routes (layout, home, shop, shop/[slug], about, journal, 404)
  components/
    providers/    SmoothScroll (Lenis), PageTransition, Preloader
    layout/       Header, Footer
    three/        Hero3D  (r3f scene + GLSL shaders)
    sections/     Hero, Manifesto, FeaturedDrop, BrandPillars, SloganMoment, Lookbook
    ui/           EvolveLogo, Magnetic, Reveal, Marquee, ProductImage, ProductCard
    cart/         CartDrawer
  lib/            products.ts (catalogue), slogans.ts, utils.ts
  store/          cart.ts (zustand, persisted)
```

---

## Real vs. placeholder

| Piece | Status | To finish |
|-------|--------|-----------|
| Design system (colour, type scale, motion, layout) | **Real / locked** | — |
| Page architecture, components, cart, transitions, 3D hero | **Real** | — |
| **Neue Montreal** font | **Placeholder fallback** | Drop the licensed files into `public/fonts/` — see [`public/fonts/README.md`](./public/fonts/README.md). Site upgrades with zero code changes. |
| **EVOLVE logo** | **SVG wordmark placeholder** | Drop the real chrome/white logo into `public/brand/` and swap `EvolveLogo.tsx` to an `<img>`. |
| **Imagery** | **Placeholder** (royalty-free Unsplash, swappable) | Replace with owned/commissioned photography. `ProductImage` falls back to an on-brand gradient if any image is slow/unavailable, so the page never breaks. |
| **Products** | **Placeholder catalogue** (`lib/products.ts`) | Shape is drop-ship-ready (externalId / variantId / sku). Swap `getProducts()` for a Printful/Printify/Shopify fetch — UI unchanged. |
| **Checkout** | **Stubbed** | Wire `CartDrawer` checkout button to Printful/Shopify. Cart data is already structured for it. |

## Wiring up checkout later (drop-ship)

1. Connect Printful/Printify, map their catalogue ids onto `Product.externalId`
   and `ProductVariant.variantId` in `lib/products.ts` (or fetch them live).
2. On "Checkout," POST the Zustand cart lines (`useCart`) to your order
   endpoint / Shopify cart, then redirect to hosted checkout.
3. That's it — the grid, PDP, variants, and cart already speak the right shape.

---

## Notes

- Fully responsive; respects `prefers-reduced-motion`.
- Footer and About link back to **evolveecoblasting.com** (the service company).
- Brand voice rules (uppercase tracked headings, no exclamation points, Oxford
  comma) are baked into the copy — keep them when you extend it.

*Proud of where we came from. Hungry for where we're headed.*
