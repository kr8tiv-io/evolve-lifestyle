// Cross-device mobile QA — loads each page at each viewport in headless Chrome and
// MEASURES the DOM (no screenshots, which time out on the grain render loop):
//   - horizontal overflow (scrollWidth vs clientWidth) + the offending elements
//   - the header logo <img>: loaded? size? visible? (the "empty box" bug)
// Usage: node scripts/mobile-qa.mjs [baseUrl]   (default = live site)
import puppeteer from "puppeteer-core";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.argv[2] || "https://evolveapparel.shop";

const PAGES = [
  ["/", "landing"],
  ["/shop/", "shop"],
  ["/shop/anvil-heavyweight-tee/", "product"],
];
// widths the user asked for + short/tall heights + tablet + desktop control
const VPS = [
  [320, 568], [320, 667], [360, 640], [360, 800], [375, 667],
  [390, 844], [412, 915], [430, 932], [768, 1024], [1440, 900],
];
const UA_M = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36";
const UA_D = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });

for (const [path, label] of PAGES) {
  for (const [w, h] of VPS) {
    const mobile = w < 700;
    const page = await browser.newPage();
    await page.setUserAgent(mobile ? UA_M : UA_D);
    await page.setViewport({ width: w, height: h, deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile });
    try {
      await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 35000 });
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 2800)); // let above-fold images + layout settle
    const data = await page.evaluate(() => {
      const de = document.documentElement;
      const clientW = de.clientWidth;
      const scrollW = de.scrollWidth;
      const offenders = [];
      document.querySelectorAll("body *").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > clientW + 1.5 && getComputedStyle(el).position !== "fixed") {
          offenders.push({ t: el.tagName.toLowerCase(), c: (el.className && el.className.toString().slice(0, 36)) || "", right: Math.round(r.right), w: Math.round(r.width) });
        }
      });
      offenders.sort((a, b) => b.right - a.right);
      const logo = document.querySelector("header img");
      let L = null;
      if (logo) {
        const r = logo.getBoundingClientRect();
        const cs = getComputedStyle(logo);
        L = {
          loaded: logo.complete && logo.naturalWidth > 0,
          natW: logo.naturalWidth,
          src: (logo.currentSrc || logo.src || "").split("/").pop(),
          rw: Math.round(r.width), rh: Math.round(r.height), rx: Math.round(r.x), ry: Math.round(r.y),
          vis: cs.visibility, op: cs.opacity, disp: cs.display,
        };
      }
      return { clientW, scrollW, overflow: scrollW - clientW, offenders: offenders.slice(0, 3), logo: L };
    });
    const flag = (data.overflow > 1 ? " ⚠OVERFLOW" : "") + (data.logo && !data.logo.loaded ? " ⚠LOGO-NOTLOADED" : "") + (data.logo && (data.logo.rw === 0 || data.logo.rh === 0) ? " ⚠LOGO-0SIZE" : "");
    console.log(JSON.stringify({ page: label, vp: `${w}x${h}`, ...data }) + flag);
    await page.close();
  }
}
await browser.close();
