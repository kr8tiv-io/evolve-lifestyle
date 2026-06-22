import puppeteer from "puppeteer-core";
import fs from "fs";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = "C:\\Users\\lucid\\Desktop\\seo-audits";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const domain = process.argv[2] || "evolveecoblasting.com";
const tag = process.argv[3] || "audit";
const safe = domain.replace(/[^a-z0-9]/gi, "_") + "_" + tag;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
let full = null, reqInfo = null;
page.on("response", async (res) => {
  if (res.url().includes("/functions/v1/seo-audit")) {
    try { full = await res.text(); const r = res.request(); reqInfo = { method: r.method(), headers: r.headers(), post: r.postData() }; } catch {}
  }
});
await page.goto("https://seaocean.io/free-seo-audit", { waitUntil: "networkidle2", timeout: 60000 }).catch(()=>{});
await sleep(2000);
await page.evaluate(() => { const i=[...document.querySelectorAll('input')].find(x=>/text|url|search/i.test(x.type||"text")&&x.offsetParent!==null); if(i){i.focus();i.value="";} });
await page.keyboard.type(domain, { delay: 25 });
await sleep(300);
await page.evaluate(() => { const b=[...document.querySelectorAll('button,[type=submit]')].find(x=>/run free audit|run audit|analyze/i.test((x.innerText||""))&&!x.closest("header,nav")&&x.offsetParent!==null); if(b)b.click(); });
for (let i=0;i<25 && !full;i++) await sleep(2000);
if (full) {
  fs.writeFileSync(`${OUT}\\${safe}.json`, full);
  try {
    const j = JSON.parse(full);
    let out = `DOMAIN: ${domain}\nSCORE: ${j.score}\n\n`;
    for (const c of (j.categories||[])) {
      out += `\n## ${c.title} (${c.id})\n`;
      for (const ch of (c.checks||[])) {
        const mark = ch.status==="pass"?"PASS":ch.status==="fail"?"FAIL":ch.status==="warning"||ch.status==="warn"?"WARN":ch.status.toUpperCase();
        out += `  [${mark}] ${ch.name} | impact=${ch.impact||"-"} | ${ch.value||""}${ch.recommendation?" | FIX: "+ch.recommendation:""}\n`;
      }
    }
    // summary of non-pass
    const bad=[]; for(const c of (j.categories||[])) for(const ch of (c.checks||[])) if(ch.status!=="pass"&&ch.status!=="info") bad.push(`${c.id}/${ch.id} [${ch.status}] ${ch.name} -> ${ch.value||""} ${ch.recommendation||""}`);
    out += `\n\n===== NON-PASS (excl info) =====\n`+(bad.length?bad.join("\n"):"(none)")+"\n";
    const info=[]; for(const c of (j.categories||[])) for(const ch of (c.checks||[])) if(ch.status==="info") info.push(`${c.id}/${ch.id} ${ch.name} ${ch.recommendation||""}`);
    out += `\n===== INFO/OPTIONAL =====\n`+info.join("\n")+"\n";
    fs.writeFileSync(`${OUT}\\${safe}_summary.txt`, out);
    console.log("SCORE", j.score, "saved", `${safe}_summary.txt`, "non-pass:", bad.length);
  } catch(e){ console.log("parse-err", e.message); }
} else { console.log("NO AUDIT RESPONSE CAPTURED"); }
fs.writeFileSync(`${OUT}\\${safe}_req.txt`, JSON.stringify(reqInfo,null,2));
await browser.close();
