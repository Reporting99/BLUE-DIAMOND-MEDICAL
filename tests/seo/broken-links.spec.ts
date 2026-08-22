import { test, expect } from "@playwright/test";
import { routes } from "../../src/config/routes";
import { features } from "../../src/config/features";

/**
 * Crawls every live, indexable page's rendered HTML for same-origin
 * internal links and verifies each target actually resolves (not a 404) —
 * brief's "broken-link scan" requirement. Deliberately request-based (no
 * browser rendering per link) so it stays fast enough to run the full set.
 *
 * External links (mika.care, janeapp.com, tel:, mailto:, etc.) are
 * intentionally out of scope — those are covered by
 * tests/security/booking-allowlist.spec.ts instead, since verifying a
 * third party's uptime isn't this site's responsibility.
 */
const publishedRoutes = routes.filter(
  (r) => r.inSitemap && r.indexing === "index" && (!r.requiresFeature || features[r.requiresFeature as keyof typeof features]),
);

function extractInternalLinks(html: string): string[] {
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  return hrefs
    .filter((href) => href.startsWith("/en/") || href.startsWith("/ar/") || href === "/en" || href === "/ar")
    .map((href) => href.split("#")[0]) // drop in-page anchors
    .filter((href) => href.length > 0);
}

test.describe("Broken internal links", () => {
  test("every internal link discovered across live pages resolves (not 404)", async ({ request }) => {
    const discovered = new Set<string>();

    for (const route of publishedRoutes) {
      const res = await request.get(`/en${route.path.en}`);
      expect(res.status(), `/en${route.path.en} itself should be reachable`).toBeLessThan(400);
      for (const link of extractInternalLinks(await res.text())) discovered.add(link);
    }

    const broken: { link: string; status: number }[] = [];
    for (const link of discovered) {
      const res = await request.get(link);
      if (res.status() >= 400) broken.push({ link, status: res.status() });
    }

    expect(broken, JSON.stringify(broken, null, 2)).toEqual([]);
  });
});
