#!/usr/bin/env node
/**
 * Build the AI-readable layer and the Journal RSS feed from the static
 * export and the source catalog. Titles are taken from visible H1s so
 * llms.txt stays in lockstep with the page. These files are not linked
 * from the visible UI, except the RSS feed (rel=alternate).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");
const publicDir = path.join(root, "public");
const SITE = "https://evolveapparel.shop";

if (!fs.existsSync(path.join(outDir, "index.html"))) {
  console.error("out/index.html missing. Run NEXT_EXPORT=1 npm run build first.");
  process.exit(1);
}

function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html) {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function visibleText(html) {
  return decode(
    html
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function firstMatch(html, re, asText = false) {
  const m = html.match(re);
  if (!m) return "";
  return asText ? visibleText(m[1]) : decode(m[1]);
}

function readPage(rel) {
  const file = path.join(outDir, rel);
  if (!fs.existsSync(file)) return null;
  const html = fs.readFileSync(file, "utf8");
  const h1 = firstMatch(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i, true);
  const title = firstMatch(html, /<title>([\s\S]*?)<\/title>/i, true);
  // Prefer main, else article
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]
    || html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1]
    || "";
  const text = stripTags(main);
  const desc = firstMatch(html, /<meta\s+name="description"\s+content="([^"]*)"/i)
    || firstMatch(html, /<meta\s+property="og:description"\s+content="([^"]*)"/i);
  const modified = firstMatch(html, /"dateModified"\s*:\s*"([^"]+)"/)
    || firstMatch(html, /<time[^>]*dateTime="([^"]+)"/i);
  const published = firstMatch(html, /"datePublished"\s*:\s*"([^"]+)"/);
  return { html, h1, title, text, desc, modified, published, file };
}

function urlFromOutRel(rel) {
  // journal/slug/index.html -> /journal/slug/
  const cleaned = rel.replace(/index\.html$/, "").replace(/\\/g, "/");
  return `${SITE}/${cleaned}`;
}

function walkHtml(dir, prefix = "") {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (e.name === "_next" || e.name === "images" || e.name === "products" || e.name === "video" || e.name === "audio" || e.name === "brand" || e.name === "fonts") continue;
      files.push(...walkHtml(path.join(dir, e.name), rel));
    } else if (e.name === "index.html") {
      files.push(rel);
    }
  }
  return files;
}

function mdFor(page, url) {
  const title = page.h1 || page.title || url;
  const lines = [`# ${title}`, "", `Source: ${url}`, ""];
  if (page.desc) lines.push(page.desc, "");
  if (page.published) lines.push(`Published: ${page.published}`);
  if (page.modified) lines.push(`Updated: ${page.modified}`);
  if (page.published || page.modified) lines.push("");
  // Keep a useful but bounded excerpt of visible body text
  const body = page.text.replace(/\s+/g, " ").trim();
  const excerpt = body.length > 8000 ? `${body.slice(0, 8000).trim()}…` : body;
  lines.push(excerpt, "");
  return lines.join("\n");
}

function writeBoth(relFromPublic, contents) {
  const targets = [path.join(outDir, relFromPublic), path.join(publicDir, relFromPublic)];
  for (const dest of targets) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, contents);
  }
}

const pages = walkHtml(outDir).sort();
const journal = [];
const products = [];
const core = [];

for (const rel of pages) {
  const page = readPage(rel);
  if (!page || !page.h1) continue;
  const url = urlFromOutRel(rel);
  const dir = rel === "index.html" ? "" : rel.replace(/\/index\.html$/, "");
  const record = { rel, url, page, dir };

  if (dir.startsWith("journal/") && dir !== "journal") {
    journal.push(record);
    writeBoth(`${dir}.md`, mdFor(page, url));
  } else if (dir.startsWith("shop/") && dir !== "shop") {
    products.push(record);
    writeBoth(`${dir}.md`, mdFor(page, url));
  } else if (["", "shop", "journal", "about", "terms", "privacy"].includes(dir)) {
    const name = dir === "" ? "index" : dir;
    // Core mirrors use a stable filename at the section root
    if (dir === "") writeBoth("index.md", mdFor(page, url));
    else writeBoth(`${dir}.md`, mdFor(page, url));
    core.push({ ...record, name });
  }
}

journal.sort((a, b) => a.url.localeCompare(b.url));
products.sort((a, b) => a.url.localeCompare(b.url));

function bullet(rec) {
  const title = rec.page.h1;
  const dek = rec.page.desc ? `: ${rec.page.desc}` : "";
  return `- [${title}](${rec.url})${dek}`;
}

const llms = [
  "# EVOLVE Apparel",
  "",
  "> Western-Canadian outdoor lifestyle apparel. Heavyweight hoodies, tees, caps, and a few things for the trail, made to order and shipped across Canada and the United States. The Evolve Journal publishes researched guides to getting outside in Canada.",
  "",
  "EVOLVE Apparel is an online shop at https://evolveapparel.shop. It is the apparel arm of Evolve Eco Blasting and a KR8TIV company. Prices are in CAD. All sales are final, except manufacturing defects reported within 14 days of delivery, which are exchanged or remade. The full policy is at https://evolveapparel.shop/terms/. Contact: 780-915-5471 or kr8tiv@kr8tiv.io.",
  "",
  "Markdown copies of these pages live at the same path with a .md extension, for example https://evolveapparel.shop/journal/best-hot-springs-western-canada.md. They are provided for readers and tools that prefer plain text. They are not advertised on the website.",
  "",
  "## Site",
  "",
  ...core.map(bullet),
  "",
  "## Shop",
  "",
  ...products.map(bullet),
  "",
  "## Journal",
  "",
  ...journal.map(bullet),
  "",
].join("\n");

writeBoth("llms.txt", llms);

// RSS for the Journal only
const rssItems = journal
  .slice()
  .sort((a, b) => (b.page.published || b.page.modified || "").localeCompare(a.page.published || a.page.modified || ""))
  .map((rec) => {
    const title = rec.page.h1.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const desc = (rec.page.desc || rec.page.text.slice(0, 280)).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const pub = rec.page.published || rec.page.modified || "2026-11-23T19:00:00-06:00";
    return [
      "    <item>",
      `      <title>${title}</title>`,
      `      <link>${rec.url}</link>`,
      `      <guid isPermaLink="true">${rec.url}</guid>`,
      `      <pubDate>${new Date(pub).toUTCString()}</pubDate>`,
      `      <description>${desc}</description>`,
      "    </item>",
    ].join("\n");
  })
  .join("\n");

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>EVOLVE Journal</title>
    <link>${SITE}/journal/</link>
    <description>Researched guides to getting outside in Canada, from EVOLVE Apparel.</description>
    <language>en-ca</language>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${rssItems}
  </channel>
</rss>
`;
writeBoth("feed.xml", rss);

console.log(`layer: ${core.length} core, ${products.length} products, ${journal.length} journal guides, RSS ${journal.length} items`);
