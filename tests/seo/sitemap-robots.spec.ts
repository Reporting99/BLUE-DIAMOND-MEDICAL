import { test, expect } from "@playwright/test";
import { routes } from "../../src/lib/routing";
import { features } from "../../src/config/features";
import { SEO_TEST_ORIGIN } from "../support/seo-test-origin";

/**
 * The published crawl surface, checked over HTTP against the running server:
 * sitemap.xml, robots.txt, llms.txt and the 404 boundary.
 *
 * The server under test runs LAUNCHED (playwright.config.ts injects the
 * reserved origin and the flag), so these assert the shape of the output an
 * operator will actually get on the day of launch. The unlaunched half of each
 * of these is asserted directly against the gate in
 * tests/unit/prelaunch-guard.spec.ts, which needs no second server.
 */

const served = routes.filter(
  (r) => !r.requiresFeature || Boolean(features[r.requiresFeature as keyof typeof features]),
);
const published = served.filter((r) => r.inSitemap && r.indexing === "index");

async function sitemapUrls(request: import("@playwright/test").APIRequestContext): Promise<string[]> {
  const body = await (await request.get("/sitemap.xml")).text();
  return [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

test.describe("sitemap.xml", () => {
  test("is well-formed XML with a urlset root", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("xml");
    const body = await response.text();
    expect(body.trimStart().startsWith("<?xml")).toBe(true);
    expect(body).toContain("<urlset");
    expect(body).toContain("</urlset>");
    // Tag balance: a truncated or badly escaped document fails here.
    const opens = (body.match(/<url>/g) ?? []).length;
    const closes = (body.match(/<\/url>/g) ?? []).length;
    expect(opens).toBe(closes);
    expect(opens).toBeGreaterThan(0);
    // Raw ampersands are the classic sitemap XML break.
    expect(body).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;|#)/);
  });

  test("every URL is absolute https on the configured origin", async ({ request }) => {
    const urls = await sitemapUrls(request);
    const wrong = urls.filter((u) => !u.startsWith(`${SEO_TEST_ORIGIN}/`));
    expect(wrong).toEqual([]);
  });

  test("contains no duplicate URLs", async ({ request }) => {
    const urls = await sitemapUrls(request);
    const seen = new Map<string, number>();
    for (const url of urls) seen.set(url, (seen.get(url) ?? 0) + 1);
    expect([...seen].filter(([, count]) => count > 1).map(([url]) => url)).toEqual([]);
  });

  test("every URL is percent-encoded, matching the canonical tags", async ({ request }) => {
    // The sitemap protocol requires URL-escaped entries, and the app's own
    // <link rel="canonical"> tags are percent-encoded because Next encodes
    // them. A raw-UTF-8 <loc> would spell the same Arabic URL a second way.
    const urls = await sitemapUrls(request);
    const raw = urls.filter((u) => /[^\u0020-\u007E]/.test(u));
    expect(raw, "every <loc> must be ASCII/percent-encoded").toEqual([]);
    // ...and still decode back to a URL the site serves.
    expect(urls.some((u) => u.includes("%D8"))).toBe(true);
  });

  test("contains no URL with a trailing slash", async ({ request }) => {
    // A trailing slash means a 308 on this app (trailingSlash: false), so such
    // an entry is a redirecting sitemap URL. See absoluteRouteUrl.
    const urls = await sitemapUrls(request);
    expect(urls.filter((u) => u.endsWith("/"))).toEqual([]);
  });

  test("contains no query strings or fragments", async ({ request }) => {
    const urls = await sitemapUrls(request);
    expect(urls.filter((u) => u.includes("?") || u.includes("#"))).toEqual([]);
  });

  test("URL count matches the published route inventory in both locales", async ({ request }) => {
    const urls = await sitemapUrls(request);
    // Local registry contributes exactly two rows per published route. CMS-only
    // rows may add more in hybrid/cms mode; the harness runs `static`, so this
    // is an equality, and a mismatch means a route silently left the sitemap.
    expect(urls.length).toBe(published.length * 2);
  });

  test("excludes API, admin, preview, error, gated and noindex routes", async ({ request }) => {
    const urls = await sitemapUrls(request);
    for (const fragment of ["/api/", "/api/draft", "/api/version", "/_next", "/404", "/500"]) {
      expect(urls.filter((u) => u.includes(fragment)), `sitemap must not list ${fragment}`).toEqual([]);
    }
    for (const route of served.filter((r) => r.indexing !== "index" || !r.inSitemap)) {
      expect(
        urls.filter((u) => u.endsWith(`/en${route.path.en}`)),
        `sitemap must not list non-indexable route ${route.id}`,
      ).toEqual([]);
    }
    for (const route of routes.filter((r) => !served.includes(r))) {
      expect(
        urls.filter((u) => u.endsWith(`/en${route.path.en}`)),
        `sitemap must not list feature-gated route ${route.id}`,
      ).toEqual([]);
    }
  });

  test("every sitemap URL answers 200 with no redirect hop", async ({ request }) => {
    const urls = await sitemapUrls(request);
    const bad: string[] = [];
    for (const url of urls) {
      // Rebased onto the test server: the origin in the document is the
      // injected one, which does not resolve by design.
      const path = url.slice(SEO_TEST_ORIGIN.length);
      const response = await request.get(path, { maxRedirects: 0 });
      if (response.status() !== 200) bad.push(`${path} -> ${response.status()}`);
    }
    expect(bad).toEqual([]);
  });

  test("carries locale alternates for every entry", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    expect(body).toContain('hreflang="en-CA"');
    expect(body).toContain('hreflang="ar-CA"');
    expect(body).toContain('hreflang="x-default"');
  });

  test("is deterministic across requests", async ({ request }) => {
    const first = await (await request.get("/sitemap.xml")).text();
    const second = await (await request.get("/sitemap.xml")).text();
    expect(first).toBe(second);
  });

  test("sets no lastmod rather than stamping every page with the build clock", async ({ request }) => {
    // No content source in this build carries a per-page modification date —
    // typed TS modules have none and FeelStack does not expose one to the
    // sitemap. Emitting build time would tell a crawler that every page
    // changed on every deploy, which is false and devalues the signal. An
    // absent lastmod is the honest state and is explicitly permitted.
    const body = await (await request.get("/sitemap.xml")).text();
    expect(body).not.toContain("<lastmod>");
  });
});

test.describe("robots.txt (launched shape)", () => {
  test("allows crawling, blocks the API surface, and advertises the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("Allow: /");
    expect(body).toContain("Disallow: /api/");
    expect(body).toContain(`Sitemap: ${SEO_TEST_ORIGIN}/sitemap.xml`);
  });

  test("never blocks the assets a renderer needs", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    for (const asset of ["/_next/", "*.css", "*.js", "/_next/static", "/_next/image"]) {
      expect(body, `robots.txt must not block ${asset}`).not.toContain(`Disallow: ${asset}`);
    }
  });
});

test.describe("HTTP status behaviour", () => {
  test("a missing page returns a real 404, not a soft 404", async ({ request }) => {
    const response = await request.get("/en/this-route-does-not-exist", { maxRedirects: 0 });
    expect(response.status()).toBe(404);
  });

  test("the 404 response itself is noindex", async ({ request }) => {
    // Asserted against the SERVER response, not a hydrated page: this is what
    // a crawler receives, and it is the part that decides indexability.
    const response = await request.get("/en/this-route-does-not-exist", { maxRedirects: 0 });
    expect(response.status()).toBe(404);
    expect(await response.text()).toMatch(/<meta name="robots" content="[^"]*noindex/);
  });

  test("the 404 page offers a way back once rendered", async ({ page }) => {
    /**
     * KNOWN GAP, asserted honestly rather than hidden.
     *
     * src/app/[locale]/not-found.tsx renders a bilingual 404 with "English
     * home" / "الصفحة الرئيسية" buttons, but it does NOT appear in the
     * server-rendered HTML: every 404 on this site is served as Next's bare
     * built-in error document (`<html id="__next_error__">`) with an empty
     * body and zero anchors, and the custom boundary only materialises after
     * client-side hydration.
     *
     * So this waits for the link instead of counting immediately — the
     * previous version counted straight after goto() and passed on desktop
     * only because hydration happened to win the race, then flaked on mobile.
     * A test whose result depends on that race is worse than no test.
     *
     * The consequence is a real defect, recorded in the audit: a visitor with
     * slow or blocked JS gets a blank page, and a crawler fetching the 404
     * sees no route back into the site. It does not affect indexability —
     * status and robots above are both correct — so it is a pre-launch
     * usability fix, not a launch blocker.
     */
    const response = await page.goto("/en/this-route-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.locator('a[href="/en"]').first()).toBeVisible();
    await expect(page.locator('a[href="/ar"]').first()).toBeVisible();
  });

  test("the 404 body is empty before hydration — the gap this audit records", async ({ request }) => {
    // Pins the defect so that fixing it fails this test and forces the note
    // above to be removed, rather than leaving a stale "known gap" comment.
    const html = await (await request.get("/en/this-route-does-not-exist")).text();
    expect(html).toContain("__next_error__");
    expect(html.match(/<a\b/g) ?? []).toEqual([]);
  });

  test("an unknown Arabic route 404s rather than falling back to English", async ({ request }) => {
    const response = await request.get("/ar/this-route-does-not-exist", { maxRedirects: 0 });
    expect(response.status()).toBe(404);
  });

  test("API routes are not part of the indexable surface", async ({ request }) => {
    const urls = await sitemapUrls(request);
    expect(urls.filter((u) => u.includes("/api"))).toEqual([]);
  });
});
