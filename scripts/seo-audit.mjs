import puppeteer from "puppeteer-core";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = "C:\\Users\\lucid\\Desktop\\evolve-lifestyle\\screenshots";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--window-size=1440,1600"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1600, deviceScaleFactor: 1.2 });
await page.goto("https://seaocean.io/", { waitUntil: "networkidle2", timeout: 60000 }).catch((e) => console.log("nav", e.message));
await sleep(2500);

// find the URL input and type the domain
const typed = await page.evaluate(() => {
  const inputs = [...document.querySelectorAll('input[type="text"], input[type="url"], input:not([type])')];
  const el = inputs.find((i) => /url|site|domain|check/i.test((i.placeholder || "") + (i.name || "") + (i.ariaLabel || ""))) || inputs[0];
  if (!el) return false;
  el.focus();
  return true;
});
console.log("input found:", typed);
await page.keyboard.type("evolveapparel.shop", { delay: 20 });
await sleep(400);
await page.keyboard.press("Enter");
console.log("submitted, waiting for results...");

// wait for the audit to COMPLETE (Running/Scanning text gone, or 140 checks)
let score = null;
for (let i = 0; i < 45; i++) {
  await sleep(3000);
  const txt = await page.evaluate(() => document.body.innerText);
  const running = /Running SEO Audit|Scanning|of 140\+ checks completed/i.test(txt);
  const m = txt.match(/(\b\d{1,3})\s*\/\s*100\b/);
  if (!running && m) { score = m[1]; break; }
  if (i % 4 === 0) console.log(`  …${i * 3}s running=${running} partial=${m ? m[1] : "-"}`);
}
const finalTxt = await page.evaluate(() => document.body.innerText);
const fm = finalTxt.match(/(\b\d{1,3})\s*\/\s*100\b/);
console.log("FINAL SCORE:", score ?? (fm ? fm[1] : "not found"));
await page.screenshot({ path: `${OUT}\\seo-audit.png`, fullPage: true }).catch(() => page.screenshot({ path: `${OUT}\\seo-audit.png` }));
// dump failed/issue lines for fixing
const issues = await page.evaluate(() => {
  const lines = document.body.innerText.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.filter((l) => /fail|missing|error|warning|issue|not found|no \w|should|add |improve/i.test(l)).slice(0, 40);
});
console.log("--- POSSIBLE ISSUES ---\n" + issues.join("\n"));
await browser.close();
