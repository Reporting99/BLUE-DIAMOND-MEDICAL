import { test, expect, request as pwRequest } from "@playwright/test";
import { routes } from "@/lib/routing";
import { features, type FeatureFlags } from "@/config/features";
import { listRoutes } from "@/lib/feelstack/client";
import { getFeelstackContentMode } from "@/lib/feelstack/content-mode";

/**
 * CMS_TO_SITEMAP_CONTRACT — proves /sitemap.xml matches the CURRENT
 * authoritative route state, not a frozen fixture.
 *
 * Two layers of authority, matching src/app/sitemap.ts's own architecture:
 *   - frontend-owned entity routes (concerns/treatments/technologies/medical
 *     services/doctors) come from `src/lib/routing`'s live `routes` array --
 *     imported here, so a route added/removed/reflagged in source is what
 *     this test sees, not a snapshot;
 *   - CMS-only pages come from FeelStack's own published route list, via the
 *     app's own `listRoutes()` (the exact function sitemap.ts calls) when
 *     FEELSTACK_API_URL/FEELSTACK_SITE_KEY are set. CI has neither (ci.yml
 *     builds in `static` mode), so that half is a graceful skip there and a
 *     real live check whenever credentials are available.
 *
 * All comparisons are PATH-based, not full-URL-based. `siteConfig.url` is
 * read from `process.env` at module-import time, and Playwright's
 * `webServer.env` override (a reserved seo-test.invalid origin — see
 * playwright.config.ts) applies only inside the spawned server process, not
 * this test-runner process. Comparing full URLs built from this process's
 * own `siteConfig` import against a sitemap rendered by the OTHER process's
 * `siteConfig` would silently compare against the wrong origin and turn
 * every entry into a false failure. Path-based comparison sidesteps that
 * entirely and is also the more precise thing to assert.
 */

const sitemapXml = async (): Promise<string> => {
  const ctx = await pwRequest.newContext();
  const res = await ctx.get("/sitemap.xml");
  expect(res.status(), "/sitemap.xml did not return 200").toBe(200);
  const body = await res.text();
  await ctx.dispose();
  return body;
};

const parseLocs = (xml: string): string[] => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

/** Path + query, decoded, with no trailing slash — comparable regardless of which origin rendered it. */
const pathOf = (url: string): string => {
  const u = new URL(url);
  const path = decodeURIComponent(u.pathname);
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
};

test.describe("CMS_TO_SITEMAP_CONTRACT", () => {
  test("sitemap has no duplicate URLs", async () => {
    const locs = parseLocs(await sitemapXml());
    const dupes = locs.filter((u, i) => locs.indexOf(u) !== i);
    expect(dupes, `Duplicate sitemap entries:\n${[...new Set(dupes)].join("\n")}`).toEqual([]);
  });

  test("every indexable frontend-owned route appears in the sitemap, in both locales", async () => {
    const xml = await sitemapXml();
    const paths = new Set(parseLocs(xml).map(pathOf));

    const published = routes
      .filter((r) => r.inSitemap && r.indexing === "index")
      .filter((r) => !r.requiresFeature || features[r.requiresFeature as keyof FeatureFlags]);

    const missing: string[] = [];
    for (const route of published) {
      for (const locale of ["en", "ar"] as const) {
        const expected = pathOf(`https://x.invalid/${locale}${route.path[locale]}`);
        if (!paths.has(expected)) missing.push(`${locale}: ${expected}`);
      }
    }
    expect(missing, `MISSING_FROM_SITEMAP:\n${missing.join("\n")}`).toEqual([]);
  });

  test("no non-indexable route or feature-gated-off route leaks into the sitemap", async () => {
    const xml = await sitemapXml();
    const paths = new Set(parseLocs(xml).map(pathOf));

    const excluded = routes.filter(
      (r) => !r.inSitemap || r.indexing !== "index" || (r.requiresFeature && !features[r.requiresFeature as keyof FeatureFlags]),
    );

    const leaked: string[] = [];
    for (const route of excluded) {
      for (const locale of ["en", "ar"] as const) {
        const path = pathOf(`https://x.invalid/${locale}${route.path[locale]}`);
        if (paths.has(path)) leaked.push(`${locale}: ${path}`);
      }
    }
    expect(leaked, `UNPUBLISHED_IN_SITEMAP (excluded route present anyway):\n${leaked.join("\n")}`).toEqual([]);
  });

  test("every sitemap URL is absolute HTTPS, on one single consistent host, with an en/ar locale prefix", async () => {
    const locs = parseLocs(await sitemapXml());
    expect(locs.length, "sitemap is empty").toBeGreaterThan(0);
    const origins = new Set(locs.map((u) => new URL(u).origin));
    expect([...origins], "sitemap entries do not all share one origin").toHaveLength(1);
    const [origin] = origins;
    expect(origin.startsWith("https://"), `sitemap origin is not HTTPS: ${origin}`).toBe(true);
    expect(origin, "sitemap origin looks like localhost/staging").not.toMatch(/localhost|127\.0\.0\.1|staging|preview/i);

    const bad = locs.filter((u) => {
      const path = pathOf(u);
      return !path.startsWith("/en") && !path.startsWith("/ar");
    });
    expect(bad, `WRONG_LOCALE (no /en or /ar prefix):\n${bad.join("\n")}`).toEqual([]);
  });

  test("hreflang alternates on sitemap entries always pair en-CA with ar-CA and set x-default", async () => {
    const xml = await sitemapXml();
    const urlBlocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
    const localBlocks = urlBlocks.filter((b) => {
      const loc = b.match(/<loc>([^<]+)<\/loc>/)?.[1];
      if (!loc) return false;
      const path = pathOf(loc);
      return path.startsWith("/en") || path.startsWith("/ar");
    });
    const missingAlternates = localBlocks.filter((b) => {
      const hasEn = /hreflang="en-CA"/.test(b);
      const hasAr = /hreflang="ar-CA"/.test(b);
      const hasDefault = /hreflang="x-default"/.test(b);
      return !(hasEn && hasAr && hasDefault);
    });
    expect(missingAlternates.length, "found sitemap <url> entries missing en-CA/ar-CA/x-default alternates").toBe(0);
  });

  test("CMS-only published pages appear in the sitemap (live FeelStack check)", async () => {
    test.skip(getFeelstackContentMode() === "static", "static content mode (e.g. CI build with no FEELSTACK_* env) — live CMS-route check skipped, not faked");

    const xml = await sitemapXml();
    const paths = new Set(parseLocs(xml).map(pathOf));
    const knownEnglishPaths = new Set(routes.map((r) => r.path.en));

    for (const locale of ["en", "ar"] as const) {
      const cmsRoutes = await listRoutes(locale);
      const cmsOnly = cmsRoutes.filter(
        (r) => !knownEnglishPaths.has(r.path) && !routes.some((rr) => rr.path[locale] === r.path),
      );
      const missing = cmsOnly
        .map((r) => pathOf(`https://x.invalid/${locale}${r.path}`))
        .filter((path) => !paths.has(path));
      expect(missing, `MISSING_FROM_SITEMAP (CMS-only, live, ${locale}):\n${missing.join("\n")}`).toEqual([]);
    }
  });
});
