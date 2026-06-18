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
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem("evolve-loaded", "1"); } catch {} });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 60000 });
await sleep(3500);
const H = await page.evaluate(() => document.body.scrollHeight);
const vh = 900;
// sample a few boundary regions down the page
const fracs = [0.14, 0.27, 0.4, 0.62, 0.8];
let i = 1;
for (const f of fracs) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(H * f - vh / 2));
  await sleep(1600);
  await page.screenshot({ path: `${OUT}\\blend-${String(i).padStart(2, "0")}.png` });
  console.log("blend", i, "@", Math.round(f * 100) + "%");
  i++;
}
await browser.close();
console.log("done");
