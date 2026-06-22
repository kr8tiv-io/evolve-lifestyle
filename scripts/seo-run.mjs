import puppeteer from "puppeteer-core";
import fs from "fs";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = "C:\\Users\\lucid\\Desktop\\seo-audits";
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const domain = process.argv[2] || "evolveecoblasting.com";
const tag = process.argv[3] || "baseline";
const safe = domain.replace(/[^a-z0-9]/gi, "_") + "_" + tag;
const auditUrl = `https://seaocean.io/audit/${domain}`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--window-size=1440,3000"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 3000, deviceScaleFactor: 1 });
console.log("navigating:", auditUrl);
try { await page.goto(auditUrl, { waitUntil: "networkidle2", timeout: 60000 }); } catch (e) { console.log("nav-warn", e.message); }

let score = null;
for (let i = 0; i < 50; i++) {
  await sleep(3000);
  const txt = await page.evaluate(() => document.body.innerText);
  const running = /Running|Scanning|Analyzing|checks completed|in progress|Loading audit|Auditing/i.test(txt);
  const m = txt.match(/(\b\d{1,3})\s*\/\s*100\b/);
  if (!running && m) { score = m[1]; break; }
  if (i % 3 === 0) console.log(`  …${i*3}s running=${running} partial=${m?m[1]:"-"}`);
}
await sleep(2500);
// try to expand any collapsed sections / "show all" so we capture every check
await page.evaluate(() => {
  document.querySelectorAll('button, [role="button"], a').forEach((b) => {
    if (/show all|view all|see all|expand|all checks|all results/i.test(b.innerText || "")) { try { b.click(); } catch {} }
  });
});
await sleep(1500);
const finalTxt = await page.evaluate(() => document.body.innerText);
const fm = finalTxt.match(/(\b\d{1,3})\s*\/\s*100\b/);
const final = score ?? (fm ? fm[1] : "not found");
console.log("FINAL SCORE:", final);
fs.writeFileSync(`${OUT}\\${safe}.txt`, `URL: ${domain}\nAUDIT: ${auditUrl}\nSCORE: ${final}\n\n===== FULL TEXT =====\n` + finalTxt);
await page.screenshot({ path: `${OUT}\\${safe}.png`, fullPage: true }).catch(() => page.screenshot({ path: `${OUT}\\${safe}.png` }));
console.log("saved:", `${OUT}\\${safe}.txt`);
await browser.close();
