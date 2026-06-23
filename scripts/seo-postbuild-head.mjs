// Post-build SEO: reorder each out/**/*.html <head> so the high-value tags
// (<title>, meta description, canonical, OG/Twitter) appear EARLY — right after
// charset + viewport, BEFORE the ~10 font/image preload <link> tags Next emits.
// Some crawlers (e.g. seaocean's fetcher) read only the first ~545 chars of the
// document and miss a late <title>, producing a false-low score. Run after
// `next build` (static export):  node scripts/seo-postbuild-head.mjs
import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "out";

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

function reorderHead(html) {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  if (!headMatch) return html;
  let head = headMatch[1];

  // pull a single tag out of head (first match) and return it
  const grab = (re) => {
    const m = head.match(re);
    if (!m) return "";
    head = head.replace(m[0], "");
    return m[0];
  };
  // pull all matching tags out of head and return them concatenated
  const grabAll = (re) => {
    const found = [];
    head = head.replace(re, (m) => (found.push(m), ""));
    return found.join("");
  };

  const charset = grab(/<meta[^>]*charset[^>]*>/i);
  const viewport = grab(/<meta[^>]*name=["']viewport["'][^>]*>/i);
  const title = grab(/<title[^>]*>[\s\S]*?<\/title>/i);
  const desc = grab(/<meta[^>]*name=["']description["'][^>]*>/i);
  const canonical = grab(/<link[^>]*rel=["']canonical["'][^>]*>/i);
  const og = grabAll(/<meta[^>]*property=["']og:[^"']*["'][^>]*>/gi);
  const tw = grabAll(/<meta[^>]*name=["']twitter:[^"']*["'][^>]*>/gi);

  // Preload the header logo so it wins the resource race against the heavy WebGL
  // hero on narrow/slow devices (fixes the "empty logo box" before-paint bug).
  const logoPreload =
    '<link rel="preload" as="image" href="/brand/evolve-wordmark-white.png" fetchpriority="high"/>';

  const priority = [charset, viewport, title, desc, canonical, logoPreload, og, tw].filter(Boolean).join("");
  return html.replace(headMatch[0], `<head>${priority}${head}</head>`);
}

const files = walk(ROOT);
let changed = 0;
for (const f of files) {
  const html = readFileSync(f, "utf8");
  const out = reorderHead(html);
  if (out !== html) {
    writeFileSync(f, out);
    changed++;
  }
}
console.log(`head-reorder: processed ${files.length} html files, rewrote ${changed}`);
