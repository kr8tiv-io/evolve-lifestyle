import puppeteer from "puppeteer-core";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--window-size=1600,900"] });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 });
await page.goto("https://www.evolveecoblasting.com", { waitUntil: "networkidle2", timeout: 60000 }).catch((e) => console.log("nav", e.message));
await sleep(4000);

const out = await page.evaluate(() => {
  const results = { pseudo: [], overlays: [], svgOverlays: [], vars: {} };
  // scan elements + their ::before/::after for line/noise backgrounds
  const els = [...document.querySelectorAll("body *")].slice(0, 600);
  for (const el of els) {
    for (const pe of ["", "::before", "::after"]) {
      const cs = getComputedStyle(el, pe || undefined);
      const bg = cs.backgroundImage;
      const op = cs.opacity;
      if (bg && bg !== "none" && (bg.includes("repeating-linear-gradient") || bg.includes("gradient") && bg.includes("transparent") || /url\(/.test(bg))) {
        const r = el.getBoundingClientRect();
        // only big overlay-ish ones
        if (r.width > 600 && r.height > 300) {
          results.pseudo.push({
            sel: el.className ? "." + String(el.className).split(" ").slice(0, 2).join(".") : el.tagName,
            pe: pe || "self",
            bg: bg.slice(0, 220),
            backgroundSize: cs.backgroundSize,
            mixBlendMode: cs.mixBlendMode,
            opacity: op,
            position: cs.position,
            zIndex: cs.zIndex,
          });
        }
      }
    }
    // full-screen fixed/absolute overlays
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if ((cs.position === "fixed" || cs.position === "absolute") && r.width > 1200 && r.height > 600 && parseFloat(cs.opacity) < 1 && parseFloat(cs.opacity) > 0) {
      results.overlays.push({ sel: el.className ? "." + String(el.className).split(" ").slice(0, 2).join(".") : el.tagName, opacity: cs.opacity, bg: cs.backgroundImage.slice(0, 120), pos: cs.position, z: cs.zIndex, mix: cs.mixBlendMode });
    }
  }
  // root css vars
  const root = getComputedStyle(document.documentElement);
  ["--lime", "--green", "--accent"].forEach((v) => { const val = root.getPropertyValue(v); if (val) results.vars[v] = val.trim(); });
  return results;
});
console.log(JSON.stringify(out, null, 1).slice(0, 4000));

// crop the right-center area to see the lines clearly
await page.screenshot({ path: "C:\\Users\\lucid\\Desktop\\evolve-lifestyle\\screenshots\\REF-lines-crop.png", clip: { x: 700, y: 200, width: 700, height: 400 } });
console.log("cropped");
await browser.close();
