#!/usr/bin/env node
/**
 * Render every Journal article through src/components/ui/Markdown.tsx and
 * hash the static HTML. Existing posts have no "> " pull-outs and no
 * ":::box" info boxes, so a renderer change that only adds those blocks
 * must leave every saved hash untouched.
 *
 *   node scripts/journal-render-check.mjs           compare to the saved hashes
 *   node scripts/journal-render-check.mjs --write   write scripts/journal-render-hashes.json
 *   node scripts/journal-render-check.mjs --sample  render a sample with both new blocks
 *
 * The default run compares hashes and also renders the sample.
 */
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "package.json"));
const { transform } = require("sucrase");

// Production React keeps renderToStaticMarkup free of dev-only markup.
process.env.NODE_ENV = "production";
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const HASH_FILE = path.join(root, "scripts", "journal-render-hashes.json");
const SOURCE_EXTS = [".tsx", ".ts", ".jsx", ".js", ".mjs"];

const moduleCache = new Map();

function resolveLocal(spec, fromFile) {
  let base;
  if (spec.startsWith("@/")) base = path.join(root, "src", spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(fromFile), spec);
  else return null;

  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base;
  for (const ext of SOURCE_EXTS) {
    if (fs.existsSync(base + ext)) return base + ext;
  }
  for (const ext of SOURCE_EXTS) {
    const index = path.join(base, "index" + ext);
    if (fs.existsSync(index)) return index;
  }
  throw new Error(`Cannot resolve ${spec} from ${path.relative(root, fromFile)}`);
}

function loadSource(file) {
  if (moduleCache.has(file)) return moduleCache.get(file);
  const src = fs.readFileSync(file, "utf8");
  let code;
  try {
    code = transform(src, {
      transforms: ["typescript", "jsx", "imports"],
      jsxRuntime: "automatic",
      production: true,
      disableESTransforms: true,
      filePath: file,
    }).code;
  } catch (err) {
    throw new Error(`Transform failed for ${path.relative(root, file)}: ${err.message}`);
  }

  const localRequire = (spec) => {
    const resolved = resolveLocal(spec, file);
    if (!resolved) return require(spec);
    if (resolved.endsWith(".tsx") || resolved.endsWith(".ts") || resolved.endsWith(".jsx")) {
      return loadSource(resolved);
    }
    return require(resolved);
  };

  const module = { exports: {} };
  // Publish the exports object before execution so a cycle can see it.
  moduleCache.set(file, module.exports);
  const runner = new Function("require", "module", "exports", "__filename", "__dirname", code);
  runner(localRequire, module, module.exports, file, path.dirname(file));
  moduleCache.set(file, module.exports);
  return module.exports;
}

function loadArticles() {
  const journal = loadSource(path.join(root, "src/lib/journal.ts"));
  const articles = journal.getArticles();
  if (!Array.isArray(articles) || articles.length === 0) {
    throw new Error("getArticles() returned no articles");
  }
  return articles;
}

function loadMarkdown() {
  const mod = loadSource(path.join(root, "src/components/ui/Markdown.tsx"));
  if (typeof mod.default !== "function") {
    throw new Error("Markdown.tsx default export is not a component");
  }
  return mod.default;
}

function renderArticle(Markdown, article) {
  return renderToStaticMarkup(
    React.createElement(Markdown, {
      body: article.body,
      images: article.inlineImages,
      tone: article.tone,
      hideCaptions: article.hideCaptions,
    })
  );
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Existing bodies must not already contain the new block types, or a hash
 * match would not prove the old markup was left alone.
 */
function assertNoNewBlocks(articles) {
  const problems = [];
  for (const article of articles) {
    const blocks = article.body.split(/\n\n+/);
    for (const block of blocks) {
      const lines = block.split("\n");
      if (lines.length > 0 && lines.every((line) => line.startsWith("> "))) {
        problems.push(`${article.slug}: pull-out block already present`);
      }
    }
    if (article.body.includes(":::box")) {
      problems.push(`${article.slug}: :::box already present`);
    }
  }
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
}

function hashArticles(Markdown, articles) {
  const hashes = {};
  for (const article of articles) {
    hashes[article.slug] = sha256(renderArticle(Markdown, article));
  }
  return hashes;
}

const SAMPLE_BODY = [
  "Banff in December rewards an early start on the Bow River.",
  "",
  "A temperature below zero is the normal state of the valley.",
  "",
  ":::box Plan it",
  "",
  "- **Best for:** a long weekend in town",
  "- **When:** December 5 to 7",
  "- **Getting there:** drive the Trans-Canada from [Calgary](https://www.banfflakelouise.com/)",
  "",
  ":::",
  "",
  "> December light on the Bow lasts about eight hours, and the ice is already loud.",
  "> The second line keeps **bold** and a [park page](/journal/best-national-parks-canada/).",
  "",
  "The rest of the day is yours.",
].join("\n");

function renderSample(Markdown) {
  const html = renderToStaticMarkup(
    React.createElement(Markdown, {
      body: SAMPLE_BODY,
      images: [],
      tone: ["#0d3b1f", "#4ade80"],
    })
  );
  const blockquote = html.match(/<blockquote\b[\s\S]*?<\/blockquote>/);
  const aside = html.match(/<aside\b[\s\S]*?<\/aside>/);
  const problems = [];
  if (!blockquote) problems.push("missing <blockquote>");
  if (!aside) problems.push("missing <aside>");
  if (aside && !aside[0].includes('aria-label="Plan it"')) problems.push("aside aria-label is not the title");
  if (aside && !aside[0].includes("Best for")) problems.push("box dropped a bullet across a blank line");
  if (aside && !aside[0].includes("December 5 to 7")) problems.push("box dropped a later bullet");
  if (aside && !aside[0].includes("https://www.banfflakelouise.com/")) problems.push("box link did not render");
  if (aside && !aside[0].includes("<strong")) problems.push("box bold did not render");
  if (blockquote && !blockquote[0].includes("December light on the Bow")) problems.push("pull-out text missing");
  if (blockquote && !blockquote[0].includes("<strong")) problems.push("pull-out bold did not render");
  if (blockquote && !blockquote[0].includes('href="/journal/best-national-parks-canada/"')) {
    problems.push("pull-out link did not render");
  }
  if (blockquote && (blockquote[0].includes("“") || blockquote[0].includes("”") || blockquote[0].includes("&quot;"))) {
    problems.push("pull-out added quotation marks");
  }
  if (html.includes(":::")) problems.push("info-box fence leaked into HTML");
  if (html.includes("&gt;")) problems.push("pull-out marker leaked into HTML");
  // A plain paragraph that mentions a greater-than sign must stay a paragraph.
  if (!html.includes("<p") || !html.includes("below zero")) problems.push("ordinary paragraph was swallowed");
  return { html, blockquote, aside, problems };
}

function printSample(Markdown) {
  const { html, blockquote, aside, problems } = renderSample(Markdown);
  if (problems.length) {
    console.error("sample render failed:");
    for (const problem of problems) console.error(`  - ${problem}`);
    console.error(html);
    process.exit(1);
  }
  console.log("sample: <blockquote> and <aside aria-label> rendered; links and bold kept; no added quote marks");
}

function main() {
  const write = process.argv.includes("--write");
  const sampleOnly = process.argv.includes("--sample");
  const Markdown = loadMarkdown();

  if (sampleOnly) {
    printSample(Markdown);
    return;
  }

  const articles = loadArticles();
  // Posts written after the hash file was saved may use the new blocks; only
  // the posts that have a saved hash must be free of them.
  const savedForCheck = fs.existsSync(HASH_FILE) ? JSON.parse(fs.readFileSync(HASH_FILE, "utf8")).hashes ?? {} : {};
  assertNoNewBlocks(write ? articles : articles.filter((a) => a.slug in savedForCheck));
  const hashes = hashArticles(Markdown, articles);
  const slugs = Object.keys(hashes).sort();

  if (write) {
    const payload = { algorithm: "sha256", count: slugs.length, hashes };
    fs.writeFileSync(HASH_FILE, JSON.stringify(payload, null, 2) + "\n");
    console.log(`wrote ${slugs.length} hashes to ${path.relative(root, HASH_FILE)}`);
    for (const slug of slugs) console.log(`${hashes[slug]}  ${slug}`);
    return;
  }

  if (!fs.existsSync(HASH_FILE)) {
    console.error(`No hash file at ${path.relative(root, HASH_FILE)}. Run with --write first.`);
    process.exit(1);
  }
  const saved = JSON.parse(fs.readFileSync(HASH_FILE, "utf8"));
  const savedHashes = saved.hashes ?? {};
  const savedSlugs = Object.keys(savedHashes).sort();
  let failed = 0;

  for (const slug of savedSlugs) {
    if (!(slug in hashes)) {
      console.error(`MISSING  ${slug}`);
      failed += 1;
      continue;
    }
    if (hashes[slug] === savedHashes[slug]) {
      console.log(`identical  ${savedHashes[slug]}  ${slug}`);
    } else {
      console.error(`CHANGED   ${slug}`);
      console.error(`  saved ${savedHashes[slug]}`);
      console.error(`  now   ${hashes[slug]}`);
      failed += 1;
    }
  }
  for (const slug of slugs) {
    if (!(slug in savedHashes)) console.log(`new       ${hashes[slug]}  ${slug}`);
  }

  if (failed) {
    console.error(`${failed} existing slug(s) changed HTML`);
    process.exit(1);
  }
  console.log(`${savedSlugs.length} existing slugs unchanged`);
  printSample(Markdown);
}

main();
