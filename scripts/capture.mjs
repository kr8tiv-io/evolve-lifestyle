import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const OUT = "C:\\Users\\lucid\\Desktop\\evolve-lifestyle\\screenshots";
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: [
    "--no-sandbox",
    "--hide-scrollbars",
    "--force-color-profile=srgb",
    "--ignore-gpu-blocklist",
    "--enable-webgl",
    "--enable-accelerated-2d-canvas",
    "--window-size=1440,900",
  ],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.evaluateOnNewDocument(() => {
  try { sessionStorage.setItem("evolve-loaded", "1"); } catch (e) {}
});

// Wait until all <img> in viewport range have loaded (or our fallback engaged).
async function waitForImages(max = 11000) {
  const start = Date.now();
  while (Date.now() - start < max) {
    const pending = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll("img")];
      return imgs.filter((i) => !i.complete || i.naturalWidth === 0).length;
    });
    if (pending === 0) return;
    await sleep(400);
  }
}

async function go(path) {
  await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 60000 });
  await waitForImages();
  await sleep(1500);
}

async function shot(name) {
  const file = `${OUT}\\${name}.png`;
  await page.screenshot({ path: file });
  console.log("SAVED " + file);
}

// 1. HOME — cinematic hero (give software-WebGL time to build the aurora)
await go("/");
await sleep(9000);
await shot("01-home-hero");

// 2. HOME — manifesto (scroll past hero + marquee into the lit scrub text)
await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.35, behavior: "instant" }));
await sleep(2500);
await shot("02-home-manifesto");

// 3. SHOP — product grid (wait for real photography)
await go("/shop");
await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 0.95, behavior: "instant" }));
await sleep(2500);
await waitForImages();
await shot("03-shop-grid");

// 4. PRODUCT — detail page
await go("/shop/survivors-heavyweight-hoodie");
await sleep(1500);
await shot("04-product-hoodie");

// 5. ABOUT — slogan wall
await go("/about");
await page.evaluate(() => {
  const els = [...document.querySelectorAll("p,span,h2,h3")];
  const el = els.find((e) => (e.textContent || "").trim() === "What We Say");
  if (el) el.scrollIntoView({ block: "start", behavior: "instant" });
  else window.scrollTo({ top: document.body.scrollHeight * 0.62, behavior: "instant" });
});
await sleep(2000);
await shot("05-about-slogan-wall");

await browser.close();
console.log("DONE");
