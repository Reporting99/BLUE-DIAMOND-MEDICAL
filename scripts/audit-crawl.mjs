// Public GET requests only. Crawl registry, CMS routes, sitemap, then internal links.
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
const [exportFile, output, origin = 'https://bluediamondmedical.ca'] = process.argv.slice(2);
if (!exportFile || !output) throw new Error('Usage: node scripts/audit-crawl.mjs EXPORT OUTPUT [ORIGIN]');
await fs.mkdir(output, { recursive: true, mode: 0o700 });
await fs.mkdir(path.join(output, 'html'), { recursive: true, mode: 0o700 });
const local = JSON.parse(await fs.readFile(exportFile, 'utf8'));
const api = 'https://feelstack.dfeelings.com/api/public/v1/sites/blue-diamond-medical';
async function get(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(30000), headers: { 'User-Agent': 'BlueDiamondContentAudit/1.0' } });
  return { status: r.status, finalUrl: r.url, text: await r.text() };
}
const cmsRoutes = JSON.parse((await get(`${api}/routes?locale=en`)).text).items;
await fs.writeFile(path.join(output, 'cms-routes.json'), JSON.stringify(cmsRoutes, null, 2));
const sitemap = (await get(`${origin}/sitemap.xml`)).text;
await fs.writeFile(path.join(output, 'sitemap.xml'), sitemap);
const candidates = new Map();
function add(p, source) {
  const u = new URL(p, origin);
  if (u.origin !== origin || !/^\/en(?:\/|$)/.test(u.pathname)) return;
  const route = u.pathname.replace(/\/$/, '');
  if (!candidates.has(route)) candidates.set(route, new Set());
  candidates.get(route).add(source);
}
for (const r of local.routes.routes) add('/en' + (r.path.en === '/' ? '' : r.path.en), 'registry');
for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) add(m[1], 'sitemap');
for (const r of cmsRoutes) add('/en' + (r.path === '/' ? '' : r.path), 'CMS');
add('/en/aesthetics/before-after', 'filesystem');
const browser = await chromium.launch({ headless: true });
const visited = new Set();
const pages = [];
async function parse(html, tab) {
  return tab.evaluate((html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = el => el?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const schemas = [...doc.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { return JSON.parse(s.textContent); } catch { return { parseError: true }; } });
    const links = [...doc.querySelectorAll('a[href]')].map(a => a.getAttribute('href'));
    const meta = Object.fromEntries([...doc.querySelectorAll('meta[name],meta[property]')].map(m => [m.getAttribute('name') || m.getAttribute('property'), m.content]));
    const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    const alts = [...doc.querySelectorAll('img')].map(i => ({ src: i.getAttribute('src'), alt: i.getAttribute('alt') }));
    const headings = [...doc.querySelectorAll('h1,h2,h3')].map(h => ({ level: h.tagName, text: text(h) }));
    const ui = [...doc.querySelectorAll('button,label,input,textarea,[aria-label]')].map(e => ({ tag: e.tagName, text: text(e), label: e.getAttribute('aria-label'), placeholder: e.getAttribute('placeholder') }));
    doc.querySelectorAll('script,style,noscript,svg').forEach(e => e.remove());
    const strings = [];
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) { const s = text(walker.currentNode); if (s) strings.push(s); }
    return { title: text(doc.querySelector('title')), meta, canonical, headings, alts, schemas, ui, links, strings, mainText: text(doc.querySelector('main')), fullText: text(doc.body) };
  }, html);
}
for (;;) {
  const batch = [...candidates.keys()].filter(p => !visited.has(p));
  if (!batch.length) break;
  for (let i = 0; i < batch.length; i += 4) {
    await Promise.all(batch.slice(i, i + 4).map(async route => {
      visited.add(route);
      const tab = await browser.newPage();
      try {
        const r = await get(origin + route);
        const content = await parse(r.text, tab);
        const file = route.replaceAll('/', '__') + '.html';
        await fs.writeFile(path.join(output, 'html', file), r.text);
        pages.push({ route, status: r.status, finalUrl: r.finalUrl, ...content });
        content.links.forEach(link => { try { add(new URL(link, origin + route).href, 'internal-link'); } catch {} });
      } catch (error) { pages.push({ route, error: error.message }); }
      finally { await tab.close(); }
    }));
  }
}
await browser.close();
const cms = [];
for (let i = 0; i < cmsRoutes.length; i += 4) {
  await Promise.all(cmsRoutes.slice(i, i + 4).map(async r => {
    const result = await get(`${api}/resolve?path=${encodeURIComponent(r.path)}&locale=en`);
    cms.push({ path: r.path, status: result.status, payload: JSON.parse(result.text) });
  }));
}
await fs.writeFile(path.join(output, 'cms-public.json'), JSON.stringify(cms, null, 2));
pages.sort((a, b) => a.route.localeCompare(b.route));
pages.forEach(p => { p.discoveredBy = [...candidates.get(p.route)]; });
await fs.writeFile(path.join(output, 'pages.json'), JSON.stringify(pages, null, 2));
const canonical = pages.filter(p => p.status === 200 && new URL(p.finalUrl).pathname.replace(/\/$/, '') === p.route);
await fs.writeFile(path.join(output, 'reading-copy.txt'), canonical.map(p => `${p.route}\nTITLE: ${p.title}\nDESCRIPTION: ${p.meta.description}\n${p.mainText}\n`).join('\n\n'));
console.log(JSON.stringify({ fetched: pages.length, canonical200: canonical.length, redirects: pages.filter(p => p.status === 200 && new URL(p.finalUrl).pathname !== p.route).length, cmsRecords: cms.length, errors: pages.filter(p => p.error).length, status: pages.reduce((a,p) => ({...a, [p.status]: (a[p.status] || 0) + 1}), {}) }, null, 2));
