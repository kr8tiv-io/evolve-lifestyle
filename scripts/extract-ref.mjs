import puppeteer from "puppeteer-core";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--window-size=1600,900"] });
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 900 });
await page.goto("https://www.evolveecoblasting.com", { waitUntil: "networkidle2", timeout: 60000 }).catch((e) => console.log("nav", e.message));
await sleep(4000);

const data = await page.evaluate(() => {
  const pick = (el, props) => {
    if (!el) return null;
    const c = getComputedStyle(el);
    const o = { text: (el.textContent || "").trim().slice(0, 60), tag: el.tagName };
    props.forEach((p) => (o[p] = c.getPropertyValue(p)));
    const r = el.getBoundingClientRect();
    o.box = { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    return o;
  };
  const FONT = ["font-family", "font-size", "font-weight", "letter-spacing", "line-height", "color", "text-transform", "text-shadow"];

  // biggest heading in the hero
  const heads = [...document.querySelectorAll("h1,h2,h3")].map((e) => ({ e, fs: parseFloat(getComputedStyle(e).fontSize) }));
  heads.sort((a, b) => b.fs - a.fs);
  const h1 = heads[0]?.e;

  // find an element whose background has repeating-linear-gradient (the lines)
  let lines = null;
  for (const el of document.querySelectorAll("body *")) {
    const bg = getComputedStyle(el).backgroundImage;
    if (bg && bg.includes("repeating-linear-gradient")) { lines = pick(el, ["background-image", "background-size", "mix-blend-mode", "opacity"]); break; }
  }

  // logo image(s)
  const imgs = [...document.querySelectorAll("img")].map((i) => ({ src: i.currentSrc || i.src, w: Math.round(i.getBoundingClientRect().width), h: Math.round(i.getBoundingClientRect().height) }))
    .filter((i) => /logo|emblem|wordmark|evolve/i.test(i.src) && i.w > 40);

  // scan stylesheets for :hover rules mentioning logo
  const hoverRules = [];
  for (const ss of document.styleSheets) {
    let rules; try { rules = ss.cssRules; } catch { continue; }
    if (!rules) continue;
    for (const r of rules) {
      if (r.selectorText && /:hover/.test(r.selectorText) && /(logo|emblem|brand|hero)/i.test(r.selectorText)) {
        hoverRules.push(r.cssText.slice(0, 180));
      }
    }
  }

  const bodyFont = getComputedStyle(document.body).fontFamily;
  return {
    bodyFont,
    h1: pick(h1, FONT),
    eyebrow: pick([...document.querySelectorAll("p,span,div")].find((e) => /surface prep|media blasting/i.test(e.textContent || "") && e.textContent.length < 70), FONT),
    sub: pick([...document.querySelectorAll("p,span,div")].find((e) => /mobile dustless/i.test(e.textContent || "")), FONT),
    button: pick([...document.querySelectorAll("a,button")].find((e) => /find your fix/i.test(e.textContent || "")), ["background-color", "color", "border-radius", "font-size", "font-weight", "padding", "letter-spacing"]),
    lines,
    imgs,
    hoverRules: hoverRules.slice(0, 8),
  };
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
