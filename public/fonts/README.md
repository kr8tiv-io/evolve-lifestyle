# Fonts — Neue Montreal (REAL FONT GOES HERE)

The brand typeface is **Neue Montreal** (Pangram Pangram Foundry). It is a
licensed font and is **not** bundled in this repo.

## Drop the real files here

From the Evolve Drive brand assets — **"Neue Montreal.zip"** — unzip and place
the `woff2` (and optionally `woff`) files in this folder with these exact names:

```
public/fonts/
  NeueMontreal-Regular.woff2
  NeueMontreal-Medium.woff2
  NeueMontreal-Bold.woff2
  NeueMontreal-Italic.woff2
```

If your zip only ships `.otf`/`.ttf`, convert to `woff2` first (e.g.
https://transfonter.org or `fonttools`), or update the `@font-face` `src`
paths in `src/app/globals.css` to point at the formats you have.

The `@font-face` blocks in `globals.css` already reference the names above.

## Until the real files are present

The site renders with a **fallback grotesque stack** (`var(--font-mono-fallback)` /
system grotesque) so the framework is fully runnable. Visually it is close but
**not** Neue Montreal — drop the real files in and the whole site upgrades with
zero code changes. The brief mandates the real font; this is the only piece that
needs Matt's licensed files.
