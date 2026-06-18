import puppeteer from "puppeteer-core";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--hide-scrollbars", "--ignore-gpu-blocklist", "--enable-webgl", "--window-size=1440,900"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem("evolve-loaded", "1"); } catch {} });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 60000 });
await sleep(9000);
// crop a bright-aurora patch (top center) to inspect the scanlines
await page.screenshot({ path: "C:\\Users\\lucid\\Desktop\\evolve-lifestyle\\screenshots\\hero-lines-crop.png", clip: { x: 560, y: 120, width: 460, height: 260 } });
console.log("cropped");
await browser.close();
