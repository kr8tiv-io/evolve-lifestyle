import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = "C:\\Users\\lucid\\Desktop\\evolve-lifestyle\\screenshots";
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--ignore-gpu-blocklist", "--enable-webgl", "--window-size=1440,900"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem("evolve-loaded", "1"); } catch {} });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 60000 });
await sleep(3000);
// find the pinned gallery (data-section="The Wild") and scroll partway into its pin
const top = await page.evaluate(() => {
  const el = document.querySelector('[data-section="The Wild"]');
  if (!el) return -1;
  const r = el.getBoundingClientRect();
  return window.scrollY + r.top;
});
if (top >= 0) {
  // scroll ~1.4 viewports into the pinned region to land on a mid plate
  await page.evaluate((y) => window.scrollTo(0, y + window.innerHeight * 1.4), top);
  await sleep(2500);
  await page.screenshot({ path: `${OUT}\\06-pinned-gallery.png` });
  console.log("SAVED 06-pinned-gallery.png");
} else {
  console.log("pinned section not found");
}
await browser.close();
