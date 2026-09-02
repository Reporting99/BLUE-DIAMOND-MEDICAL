import { test, expect } from "@playwright/test";

import { routes } from "@/lib/routing";

/**
 * Arabic alias redirects, and the integrity of the internal rewrite marker.
 *
 * The proxy rewrites a pretty Arabic URL onto its English-slug folder
 * (/ar/فريقنا -> /ar/our-team) and redirects an English-slug path under /ar to
 * its Arabic canonical (/ar/our-team -> /ar/فريقنا). Those two are exact
 * inverses, so the rewrite must be distinguishable from an external request or
 * every Arabic URL loops -- which is what CI #54 caught, 86 failures of
 * ERR_TOO_MANY_REDIRECTS.
 *
 * The marker that distinguishes them travels on a request header, and a
 * request header is client-controllable. A constant value was therefore
 * spoofable: sending it against /ar/our-team returned 200 instead of the 301,
 * resurrecting exactly the duplicate Arabic URL the redirect removes. The
 * value is now a per-process nonce that never appears in a response.
 */

const MARKER = "x-bd-arabic-rewrite";

const localized = routes.filter((r) => r.path.ar !== r.path.en);
/** A representative slice — one hub, one deep detail page, one doctor. */
const SAMPLES = ["/our-team", "/aesthetics/concerns/acne-scars", "/medical"].filter((en) =>
  localized.some((r) => r.path.en === en),
);

function arabicFor(englishPath: string): string {
  const entry = localized.find((r) => r.path.en === englishPath);
  if (!entry) throw new Error(`no localized route for ${englishPath}`);
  return entry.path.ar;
}

test.describe("Arabic alias redirects", () => {
  for (const en of SAMPLES) {
    test(`the Latin alias /ar${en} makes exactly one 301 to the Arabic canonical`, async ({
      request,
    }) => {
      const response = await request.get(`/ar${en}`, { maxRedirects: 0 });
      expect(response.status()).toBe(301);
      const location = decodeURIComponent(response.headers()["location"] ?? "");
      expect(location.endsWith(`/ar${arabicFor(en)}`)).toBe(true);
    });

    test(`following /ar${en} lands on a real page in one hop`, async ({ page }) => {
      const response = await page.goto(`/ar${en}`);
      expect(response?.status()).toBe(200);
      expect(decodeURIComponent(page.url())).toContain(`/ar${arabicFor(en)}`);
    });

    test(`the Arabic canonical /ar${arabicFor(en)} renders without looping`, async ({
      page,
    }) => {
      const response = await page.goto(`/ar${arabicFor(en)}`);
      expect(response?.status()).toBe(200);
    });

    test(`the English canonical /en${en} is untouched`, async ({ request }) => {
      const response = await request.get(`/en${en}`, { maxRedirects: 0 });
      expect(response.status()).toBe(200);
    });

    // The gate this suite exists for: a client must not be able to talk its
    // way out of the redirect by claiming to be an internal rewrite.
    for (const spoof of ["1", "true", "yes", "00000000-0000-4000-8000-000000000000"]) {
      test(`a client-supplied marker "${spoof}" cannot bypass the /ar${en} redirect`, async ({
        request,
      }) => {
        const response = await request.get(`/ar${en}`, {
          maxRedirects: 0,
          headers: { [MARKER]: spoof },
        });
        expect(response.status()).toBe(301);
      });
    }
  }

  test("the internal marker never leaks into a response", async ({ request }) => {
    for (const path of ["/ar/our-team", `/ar${arabicFor("/our-team")}`, "/en/our-team"]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(Object.keys(response.headers())).not.toContain(MARKER);
    }
  });

  test("every localized route's Arabic canonical resolves without a redirect loop", async ({
    request,
  }) => {
    // Cheap breadth check across all 103, since the loop affected every one of
    // them rather than a handful.
    //
    // A loop shows up as the request throwing (ERR_TOO_MANY_REDIRECTS) or as a
    // redirect status still standing after following. A 404 is NOT a loop:
    // several registry entries are deliberately gated content whose whole
    // guarantee is that they 404, so treating 4xx as failure here would assert
    // the opposite of what the gating tests require.
    const looping: string[] = [];
    for (const route of localized) {
      try {
        const response = await request.get(`/ar${route.path.ar}`, { maxRedirects: 5 });
        if ([301, 302, 307, 308].includes(response.status())) {
          looping.push(`${route.path.ar} (still ${response.status()} after following)`);
        }
      } catch (error) {
        looping.push(`${route.path.ar} (${(error as Error).message.slice(0, 60)})`);
      }
    }
    expect(looping).toEqual([]);
  });

  test("gated and unknown routes still 404 rather than 500", async ({ request }) => {
    for (const path of [
      "/en/terms",
      "/en/privacy-policy",
      "/en/nonexistent-page-xyz",
      "/ar/nonexistent-page-xyz",
    ]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(404);
    }
  });
});
