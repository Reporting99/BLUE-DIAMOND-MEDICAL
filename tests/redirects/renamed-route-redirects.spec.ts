import { test, expect } from "@playwright/test";

import { renamedRouteRedirects, routes } from "@/lib/routing";

/**
 * The /doctors -> /our-team route-family rename, one test per old URL.
 *
 * The family moved wholesale: the index AND all six member pages, in both
 * locales, in the repository and in FeelStack. Every URL this build previously
 * published therefore has to keep resolving, and a rename that preserves the
 * index while dropping the members would be worse than not renaming at all —
 * six indexed physician pages 404ing.
 *
 * WHAT EACH ROW ASSERTS, and why each one is here rather than assumed:
 *
 *  - 301, not 302/307/308. A canonical rename is permanent; a temporary
 *    redirect asks crawlers to keep the old URL indexed.
 *  - EXACT source matching. Twenty-four of these keys sit underneath one of
 *    the four index keys, so a prefix rule would send every member page to the
 *    index and lose the person. `expectedTargets` below pins each member to
 *    its OWN destination, which a prefix implementation cannot satisfy.
 *  - ONE hop. Checked by re-requesting the destination with `maxRedirects: 0`
 *    and requiring 200 — a chain still lands correctly, so asserting only on
 *    the final URL would pass while shipping two round trips per visitor.
 *  - The destination renders (200) and its canonical is ITSELF. A redirect
 *    onto a page that canonicalises somewhere else just moves the problem.
 */

const entries = Object.entries(renamedRouteRedirects);

/** The rename is 7 routes x 4 old URL forms. A drop here means a form was lost. */
test("the rename covers every old URL form for every route in the family", () => {
  expect(entries).toHaveLength(28);
});

test("no old URL is also a current route path", () => {
  // A source that is still a live path would mean the redirect shadows a real
  // page rather than replacing a dead one.
  const live = new Set(routes.flatMap((r) => [`/en${r.path.en}`, `/ar${r.path.ar}`]));
  const shadowing = entries.map(([source]) => source).filter((s) => live.has(s));
  expect(shadowing, `these redirect sources are also live routes:\n${shadowing.join("\n")}`).toEqual([]);
});

for (const [source, destination] of entries) {
  test(`${source} -> ${destination}`, async ({ request }) => {
    const response = await request.get(source, { maxRedirects: 0 });

    // Permanent, and exactly one hop.
    expect(response.status(), "expected a permanent redirect").toBe(301);

    // `location` comes back percent-encoded for the Arabic destinations.
    // Decode the PATHNAME, not the raw header: `new URL(...).pathname`
    // re-encodes non-ASCII, so decoding first and parsing second hands back a
    // percent-encoded string and every Arabic destination fails a comparison
    // it actually satisfies.
    const location = response.headers()["location"] ?? "";
    expect(decodeURIComponent(new URL(location, "http://localhost").pathname)).toBe(destination);

    // The destination is a real page, not itself a redirect. This is the
    // no-chain assertion: following the hop must be the last hop.
    const landed = await request.get(destination, { maxRedirects: 0 });
    expect(landed.status(), `${destination} should be the final URL, not another redirect`).toBe(200);

    // ...and it claims itself as canonical.
    const html = await landed.text();
    const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1];
    expect(canonical, `no canonical on ${destination}`).toBeTruthy();
    expect(decodeURIComponent(new URL(canonical!).pathname)).toBe(destination);
  });
}

/**
 * The specific failure a prefix rule produces, pinned so it cannot regress
 * into one. Both of these pass trivially under exact matching and both break
 * the moment someone "simplifies" the table into a startsWith.
 */
test.describe("the index redirect must not swallow the member pages", () => {
  const expectedTargets = [
    ["/en/doctors", "/en/our-team"],
    ["/en/doctors/mohamed-farhat", "/en/our-team/mohamed-farhat"],
    ["/en/doctors/omaima-saeed", "/en/our-team/omaima-saeed"],
    ["/ar/الأطباء", "/ar/فريقنا"],
    ["/ar/الأطباء/محمد-فرحات", "/ar/فريقنا/محمد-فرحات"],
  ] as const;

  for (const [source, expected] of expectedTargets) {
    test(`${source} lands on ${expected}, not the index`, async ({ request }) => {
      const response = await request.get(source, { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      const location = response.headers()["location"] ?? "";
      expect(decodeURIComponent(new URL(location, "http://localhost").pathname)).toBe(expected);
    });
  }
});

/**
 * The bare, locale-less forms exist so a legacy link resolves in ONE hop.
 * Without them proxy.ts's locale-prefixing step would answer first, 301ing
 * /doctors/x to /en/doctors/x, which then 301s again — the chain this table
 * exists to prevent, and one that a final-URL-only assertion would not catch.
 */
test("a bare /doctors/<slug> reaches its destination without a chain", async ({ request }) => {
  const response = await request.get("/doctors/reem-hamdi", { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  const location = response.headers()["location"] ?? "";
  expect(decodeURIComponent(new URL(location, "http://localhost").pathname)).toBe("/en/our-team/reem-hamdi");
});
