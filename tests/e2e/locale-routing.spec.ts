import { test, expect } from "@playwright/test";

test.describe("Locale routing", () => {
  /**
   * "/" is SERVED, not redirected.
   *
   * It used to answer 301 -> /en, which put a redirect hop in front of the
   * single most-requested URL on the site — the one a visitor reaches by
   * typing the domain. The proxy now rewrites it internally, so the visitor
   * and the crawler both get the English homepage with a 200 and the URL
   * stays "/".
   *
   * The duplication that creates ("/" and "/en" serve the same page) is
   * resolved by the canonical tag, which is asserted here rather than left
   * implied: without it this would be two competing URLs instead of one page
   * with a front door.
   */
  test("root is served directly with no redirect hop", async ({ page, request }) => {
    const response = await request.get("/", { maxRedirects: 0 });
    expect(response.status(), "/ must not answer a 3xx").toBe(200);

    await page.goto("/");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    // Canonicalised to /en, so "/" and "/en" are one page, not duplicates.
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/en$/);
  });

  test("/en and /ar both remain directly reachable", async ({ request }) => {
    for (const path of ["/en", "/ar"]) {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status(), `${path} must answer 200`).toBe(200);
    }
  });

  test("an unprefixed path that is not the root still redirects once to its locale URL", async ({ request }) => {
    // Deliberately still a 301: /medical is not a URL this site publishes,
    // links to, or lists in its sitemap. Serving it 200 would mint a second
    // address for every page in the app.
    const response = await request.get("/medical", { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers()["location"]).toContain("/en/medical");
  });

  test("English homepage sets lang=en and dir=ltr", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });

  test("Arabic homepage sets lang=ar and dir=rtl", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  // /ar/\u0641\u0631\u064a\u0642\u0646\u0627 -- the team hub's pretty Arabic URL. The proxy
  // rewrites it onto the English-slug folder on the same locale, and that
  // rewrite is the exact inverse of the redirect sending /ar/our-team back
  // here, so a missing rewrite marker loops instead of rendering.
  test("pretty Arabic team-hub URL resolves without a redirect loop", async ({ page }) => {
    const response = await page.goto("/ar/%D9%81%D8%B1%D9%8A%D9%82%D9%86%D8%A7");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("h1")).toBeVisible();
  });

  // The pre-launch address of that same hub. It resolved until this pass only
  // because a rename redirect carried it; the redirect is gone, so the old URL
  // is simply not a route. Asserted rather than assumed -- a 301 reappearing
  // here would quietly give the team family a second address again.
  test("the pre-launch Arabic doctors hub is gone, with no redirect", async ({ page }) => {
    const response = await page.goto("/ar/%D8%A7%D9%84%D8%A3%D8%B7%D8%A8%D8%A7%D8%A1");
    expect(response?.status()).toBe(404);
    expect(new URL(page.url()).pathname).toBe("/ar/%D8%A7%D9%84%D8%A3%D8%B7%D8%A8%D8%A7%D8%A1");
  });

  test("legacy /services redirects to /en/medical", async ({ page }) => {
    await page.goto("/services");
    await expect(page).toHaveURL(/\/en\/medical\/?$/);
  });
});
