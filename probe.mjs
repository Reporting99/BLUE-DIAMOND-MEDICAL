import { chromium } from "@playwright/test";
const BASE = process.env.BASE ?? "http://127.0.0.1:3031";
const PAGES = (process.env.PAGES ?? "/en,/en/shop,/en/aesthetics/before-after").split(",");
const b = await chromium.launch();
for (const p of PAGES) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const bad = [];
  page.on("response", (r) => { if (r.url().includes("imagekit") && r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
  await page.goto(BASE + p, { waitUntil: "domcontentloaded", timeout: 60000 });
  // Force every lazy image to load: walk the page, then wait for decode.
  await page.evaluate(async () => {
    for (const img of document.querySelectorAll("img")) { img.loading = "eager"; }
    let y = 0;
    while (y < document.body.scrollHeight) { window.scrollTo(0, y); y += 600; await new Promise(r => setTimeout(r, 120)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(3000);
  await page.evaluate(() => Promise.all([...document.querySelectorAll("img")].map(i => i.decode().catch(() => null))));
  const imgs = await page.$$eval("img", (els) => els.map((e) => ({
    src: e.currentSrc || e.src, nw: e.naturalWidth, complete: e.complete,
    w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height),
  })));
  const broken = imgs.filter((i) => !i.complete || i.nw === 0);
  console.log(`\n### ${p}  imgs=${imgs.length}  RENDERED_OK=${imgs.length - broken.length}  BROKEN=${broken.length}  http4xx5xx=${bad.length}`);
  for (const i of broken) console.log(`   BROKEN nw=${i.nw} complete=${i.complete} box=${i.w}x${i.h}\n          ${i.src}`);
  for (const x of bad.slice(0, 5)) console.log(`   HTTPERR ${x}`);
  await ctx.close();
}
await b.close();
