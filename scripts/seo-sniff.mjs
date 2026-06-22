import puppeteer from "puppeteer-core";
import fs from "fs";
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const OUT = "C:\\Users\\lucid\\Desktop\\seo-audits";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const domain = process.argv[2] || "evolveecoblasting.com";

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new", args: ["--no-sandbox", "--window-size=1440,2200"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 2200 });
const hits = [];
page.on("response", async (res) => {
  try {
    const url = res.url(); const ct = res.headers()["content-type"] || "";
    if (ct.includes("json") && !/get_public_audit_count|get_recent_audits|supabase\.co\/auth/i.test(url)) {
      const body = await res.text();
      if (/score|audit|check|meta|og|h1|grade|result/i.test(body)) hits.push({ url, status: res.status(), len: body.length, body: body.slice(0, 6000) });
    }
  } catch {}
});

await page.goto("https://seaocean.io/free-seo-audit", { waitUntil: "networkidle2", timeout: 60000 }).catch((e)=>console.log("nav",e.message));
await sleep(2500);
// the hero input is the first text/url input in <main>; type into it
await page.evaluate((d) => {
  const inp = [...document.querySelectorAll('input')].find(i => /text|url|search/i.test(i.type||"text") && i.offsetParent !== null);
  if (inp) { inp.focus(); inp.value=""; }
}, domain);
await page.keyboard.type(domain, { delay: 30 });
await sleep(300);
// click the submit button that is NOT in the header nav
const clicked = await page.evaluate(() => {
  const inHeader = (el) => !!el.closest("header,nav");
  const cands = [...document.querySelectorAll('button,[type=submit],a')].filter(x => /run free audit|run audit|analyze|audit now|get audit|start audit/i.test((x.innerText||"").trim()) && !inHeader(x) && x.offsetParent !== null);
  if (cands.length){ cands[0].click(); return (cands[0].innerText||"").trim(); }
  // else submit the form
  const f=document.querySelector('form'); if(f){f.requestSubmit?f.requestSubmit():f.submit();return "form-submit";}
  return null;
});
console.log("clicked:", clicked);
let score="-";
for(let i=0;i<18;i++){ await sleep(3000); const t=await page.evaluate(()=>document.body.innerText); const m=t.match(/(\b\d{1,3})\s*\/\s*100\b/g); console.log(`  ${i*3}s url=${page.url()} scores=${m?m.join(","):"-"}`); }
const txt = await page.evaluate(()=>document.body.innerText);
fs.writeFileSync(`${OUT}\\sniff_url.txt`, "FINAL URL: "+page.url()+"\n\nHITS("+hits.length+"):\n"+JSON.stringify(hits,null,2).slice(0,16000));
fs.writeFileSync(`${OUT}\\sniff_page.txt`, "URL:"+page.url()+"\n\n"+txt);
await page.screenshot({path:`${OUT}\\sniff.png`,fullPage:true}).catch(()=>{});
console.log("FINAL URL:", page.url(), "hits:", hits.length);
hits.forEach(h=>console.log(h.status, h.url));
await browser.close();
