import puppeteer from "puppeteer-core";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = "C:\\Users\\lucid\\Desktop\\evolve-lifestyle\\screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--ignore-gpu-blocklist", "--enable-webgl", "--window-size=1440,900"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.evaluateOnNewDocument(() => { try { sessionStorage.setItem("evolve-loaded", "1"); } catch {} });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle2", timeout: 60000 });
await sleep(9000); // let aurora build + video play
await page.screenshot({ path: `${OUT}\\01-home-hero.png` });
console.log("SAVED hero");
await browser.close();
