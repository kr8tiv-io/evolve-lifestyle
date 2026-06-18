<div align="center">

# EVOLVE — Lifestyle

### Prairies to peaks, boreal to coast.
**The Western-Canadian outdoor lifestyle brand — the apparel arm of [Evolve Eco Blasting](https://www.evolveecoblasting.com).**

*Apparel earned outside. Built for the bush, made for the long haul.*

</div>

---

## What this is

A cinematic, Awwwards-grade e-commerce storefront for **EVOLVE Lifestyle** — a
rugged outdoor apparel label rooted in the Canadian backcountry and in the
blasting company that started it all. Same name, same trademark, same brand
system as the service company; pointed outward at the country we get to call
home.

This repository is the **flagship front-end**: a runnable Next.js site with the
full design system, a cinematic hero, slick scroll-driven motion, and a
drop-ship-ready commerce layer. Products and checkout are wired as clean,
swappable placeholders so a Printful / Printify / Shopify integration drops in
without touching the UI.

> The full brand bible lives in **[`BRAND_BRIEF.md`](./BRAND_BRIEF.md)** —
> positioning, the three stories, all 20 slogans, customer, voice, visual
> identity, product lines, and naming.

---

## The brand, in three lines

**1 · Descended from Survivors.** The hardest people built the coldest country.
EVOLVE is a quiet salute to grit that doesn't brag.

**2 · One of the Largest Lands on Earth.** Prairies to mountains to boreal to
coast — getting outside isn't a hobby here, it's an identity.

**3 · Work Hard, Play Hard.** Born in the trades — strip it back, build it
stronger. Restore what the week wore down, then go earn the weekend.

**Voice:** polite until the work gets hard. Uppercase, tracked, no exclamation
points, Oxford comma. *Earned outside.*

---

## Visual identity

- **Palette:** Boreal Void `#050505` · Aurora Neon `#00ff41` · Cyber Lime
  `#39ff14` · Alloy Silver `#c9ced4`. Neon is a scalpel, not a highlighter.
- **Type:** real **Neue Montreal** (self-hosted), dramatic display scale.
- **Logo:** the metallic trees-and-summit **E** emblem + EVOLVE wordmark — the
  same trademark that goes on the garments.
- **Signature hero:** the real forest-fog footage from the service site, a fine
  scanline texture, and a **mouse-reactive green borealis aurora** that gathers
  around the cursor — composited in WebGL (react-three-fiber + bloom) over the
  footage, with only the logo and headline sitting on top.
- **Motion:** Lenis smooth scroll, GSAP ScrollTrigger (pins, parallax, splits)
  layered with Framer Motion reveals, a custom cursor, and a scroll HUD. All
  reduced-motion gated.

---

## The site

| Route | What |
|-------|------|
| `/` | Cinematic hero, manifesto, featured drop, brand pillars, pinned gallery, lookbook, slogan moments |
| `/shop` | Product grid with category + collection filters |
| `/shop/[slug]` | Product detail — gallery, variants, add-to-kit |
| `/about` | The three brand stories + the 20-slogan wall |
| `/journal` | Editorial / lookbook |
| — | Persisted cart drawer, custom cursor, scroll HUD |

**Stack:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind ·
Framer Motion · GSAP/ScrollTrigger · Three.js (react-three-fiber + postprocessing)
· Lenis · Zustand.

---

## Direction & roadmap

**Now (framework — done):** design system, cinematic hero, all key pages, motion
system, placeholder catalogue, clean commerce seam (`src/lib/commerce.ts`),
zero-console-error production build.

**Next (commerce):**
- [ ] Connect **Printful / Printify**: map catalogue → `Product`/`ProductVariant`
      (`externalId`, `variantId`, `sku`) or fetch live in `fetchProducts()`.
- [ ] Wire **checkout** (`startCheckout`) to a hosted Shopify/Printful session;
      GST + shipping at checkout.
- [ ] Real product photography to replace the swappable stock.

**Then (growth):**
- [ ] First drop merchandised (tees, hoodies, flannels, caps — see brief).
- [ ] Journal as CMS/MDX; email capture + Klaviyo flows.
- [ ] Collections mapped to the land: **Prairies / Peaks / Boreal / Coast**.
- [ ] Custom domain + analytics; conservation tie-in under review.

**Hosting:** Vercel (native Next.js, auto-deploy on push) is the planned home;
`DEPLOY.md` has the one-step setup.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start   # production
```

Node 18.18+ (built on 24). See **[`DEPLOY.md`](./DEPLOY.md)** to put it online.

---

## Real vs. placeholder

| Real | Placeholder (swappable) |
|------|-------------------------|
| Design system, all pages, motion, cinematic hero, cart | Products (`src/lib/products.ts`) |
| Real EVOLVE logo + Neue Montreal + hero footage | Imagery (royalty-free stock in `public/images`) |
| Drop-ship-ready data shape | Checkout (stubbed in `src/lib/commerce.ts`) |

---

<div align="center">

*Proud of where we came from. Hungry for where we're headed.*

**[evolveecoblasting.com](https://www.evolveecoblasting.com)** · Serving Edmonton & Greater Alberta

</div>
