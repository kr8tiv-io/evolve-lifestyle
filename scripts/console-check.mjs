import puppeteer from "puppeteer-core";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = "http://localhost:3000";
const ROUTES = ["/", "/shop", "/shop/survivors-heavyweight-hoodie", "/about", "/journal"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--ignore-gpu-blocklist", "--enable-webgl", "--window-size=1440,900"],
});

let total = 0;
for (const route of ROUTES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const msgs = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") msgs.push(`[${m.type()}] ${m.text()}`);
  });
  page.on("pageerror", (e) => msgs.push(`[pageerror] ${e.message}`));
  page.on("requestfailed", (r) =>
    msgs.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText || ""}`)
  );
  await page.goto(BASE + route, { waitUntil: "networkidle2", timeout: 60000 }).catch(() => {});
  // scroll through to trigger lazy/scroll-bound code
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 250));
    }
  });
  await sleep(1500);
  // filter noise: favicon, font preload warnings are not real errors
  const real = msgs.filter(
    (m) => !/favicon|Download the React DevTools|preloaded using link preload/i.test(m)
  );
  total += real.length;
  console.log(`\n=== ${route} (${real.length}) ===`);
  real.slice(0, 12).forEach((m) => console.log(m));
  await page.close();
}
console.log(`\nTOTAL ISSUES: ${total}`);
await browser.close();
