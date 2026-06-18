import puppeteer from "puppeteer-core";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars", "--ignore-gpu-blocklist", "--enable-webgl", "--window-size=1440,900"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto("https://www.evolveecoblasting.com", { waitUntil: "networkidle2", timeout: 60000 }).catch((e) => console.log("nav:", e.message));
await sleep(5000);
await page.screenshot({ path: "C:\\Users\\lucid\\Desktop\\evolve-lifestyle\\screenshots\\REF-evolveeco.png" });
// also dump any video/canvas/background hints
const info = await page.evaluate(() => {
  const vids = [...document.querySelectorAll("video")].map((v) => v.currentSrc || v.src);
  const bg = getComputedStyle(document.body).backgroundColor;
  const heroBgImgs = [...document.querySelectorAll("section,div,header")].slice(0, 40)
    .map((e) => getComputedStyle(e).backgroundImage).filter((b) => b && b !== "none").slice(0, 6);
  return { vids, bg, heroBgImgs, title: document.title };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
