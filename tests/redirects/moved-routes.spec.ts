import { test, expect } from "@playwright/test";

import { movedRoutes, legacyRedirects } from "@/lib/routing";
import { concerns } from "@/features/concerns/data";

/**
 * The concern-page move, end to end.
 *
 * When Aesthetics became concern-first, skin concerns stopped being a parallel
 * /aesthetics/concerns branch and became the Treatments entry points
 * themselves. Every concern page therefore changed address, in both locales.
 *
 * Those old URLs are not disposable. Nine of them are the live destinations of
 * legacy 301s from the previous aesthetics site (/acne-scar-removal,
 * /sun-damage, …) and carry whatever equity those pages passed on. This suite
 * asserts the three things that keeps honest:
 *
 *   1. every old URL still answers, with a 301 rather than a 404;
 *   2. it lands on a real 200 in ONE hop, never a chain and never a loop;
 *   3. the legacy table was re-pointed at the new URLs rather than left aimed
 *      at the old ones, so an inbound visitor from the old site still arrives
 *      in a single redirect.
 */

test.describe("moved concern routes", () => {
  test("every moved URL is a single 301 to its declared target", async ({ request }) => {
    for (const [from, to] of Object.entries(movedRoutes)) {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status(), `${from} should redirect`).toBe(301);
      // Decode AFTER taking .pathname, not before: URL.pathname re-encodes
      // non-ASCII, so decoding first and reading .pathname hands back the
      // percent-encoded form again and never matches an Arabic target.
      const location = response.headers()["location"] ?? "";
      const pathname = decodeURIComponent(new URL(location, "http://localhost").pathname);
      expect(pathname, `${from} target`).toBe(to);
    }
  });

  test("each redirect target is a live page, so no hop lands on a 404 or another redirect", async ({
    request,
  }) => {
    for (const to of new Set(Object.values(movedRoutes))) {
      const response = await request.get(to, { maxRedirects: 0 });
      expect(response.status(), `${to} should be a live page, not a further hop`).toBe(200);
    }
  });

  test("the English and Arabic URL of every concern moved", () => {
    for (const concern of concerns) {
      expect(movedRoutes[`/en/aesthetics/concerns/${concern.slug}`]).toBe(
        `/en/aesthetics/treatments/${concern.slug}`,
      );
      expect(movedRoutes[`/ar/التجميل-الطبي/المخاوف-الجمالية/${concern.slugAr}`]).toBe(
        `/ar/التجميل-الطبي/العلاجات/${concern.slugAr}`,
      );
    }
  });

  test("no legacy redirect still points into the retired /aesthetics/concerns branch", () => {
    // A legacy entry aimed at an old URL would still work — it would just cost
    // the visitor two hops instead of one, which is exactly the chaining the
    // legacy table exists to avoid.
    const chained = Object.entries(legacyRedirects).filter(([, to]) =>
      to.includes("/aesthetics/concerns"),
    );
    expect(chained, `legacy redirects that would now chain:\n${chained.join("\n")}`).toEqual([]);
  });
});
