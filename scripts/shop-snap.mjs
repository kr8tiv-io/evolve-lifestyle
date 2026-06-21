import puppeteer from "puppeteer-core";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = "C:\\Users\\lucid\\Desktop\\evolve-lifestyle\\screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--hide-scrollbars", "--ignore-gpu-blocklist", "--enable-webgl", "--window-size=1440,900"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1300, deviceScaleFactor: 1.5 });
await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem("evolve-loaded", "1"); } catch {} });

await page.goto("http://localhost:3000/shop", { waitUntil: "networkidle2", timeout: 60000 });
await sleep(1500);
async function imgsReady() { return page.evaluate(() => [...document.querySelectorAll("img")].every((i) => i.complete)); }
for (let i = 0; i < 12; i++) { if (await imgsReady()) break; await sleep(500); }
await sleep(1500);
await page.screenshot({ path: `${OUT}\\03-shop-grid.png` });
console.log("SAVED 03-shop-grid");

// real product page
const slug = process.argv[2] || "evolve-hoodie";
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(`http://localhost:3000/shop/${slug}`, { waitUntil: "networkidle2", timeout: 60000 });
await sleep(3000);
await page.screenshot({ path: `${OUT}\\04-product.png` });
console.log("SAVED 04-product (" + slug + ")");
await browser.close();
