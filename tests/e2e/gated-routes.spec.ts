import { test, expect } from "@playwright/test";

/**
 * Every route built but kept behind a disabled feature flag must be
 * genuinely unreachable — 404, not indexed, not linked from nav — while
 * its flag is off. See docs/CONTENT_MODEL.md for why each of
 * these has a route/model/template but no public content.
 */
const gatedPaths = [
  "/en/aesthetics/treatments/cosmetic-botox",
  "/en/aesthetics/treatments/skin-tightening",
  "/en/medical/botox",
  "/en/medical/botox/migraine",
  "/en/medical/botox/bruxism-tmj",
  "/en/medical/botox/hyperhidrosis",
  "/en/aesthetics/consultation",
  "/en/terms",
  "/en/privacy-policy",
  "/en/accessibility",
  "/en/medical-disclaimer",
  // /en/shop, its category/concern sub-pages, and every product page are
  // now live ("COMPLETE SKINMEDICA NAVIGATION AND PRODUCT-DETAIL FLOW"
  // pass, shopEnabled: true) — see tests/e2e/shop-catalogue.spec.ts and
  // tests/e2e/product-pages.spec.ts for their own coverage. Cart/checkout/
  // shipping-returns stay gated behind a *separate* shopCheckoutEnabled
  // flag specifically so publishing the catalogue never exposes these
  // bare, non-functional stub pages (no real cart/payment/shipping is
  // implemented or approved).
  "/en/shop/cart",
  "/en/shop/checkout",
  "/en/shop/shipping-returns",
];

/**
 * Two routes have left this list, and both are covered positively below
 * instead of being asserted unreachable.
 *
 * /en/aesthetics/pricing left when the client-approved pricing workbook was
 * published (GAP-003 resolved, aestheticPricingEnabled: true) — see
 * docs/APPROVED_AESTHETIC_PRICING_MATRIX.md and
 * tests/unit/aesthetic-pricing.spec.ts for the price-data guard.
 *
 * /en/aesthetics/before-after left when the 14 recovered pairs were imported
 * to /blue-diamond/before-after/ and approved (beforeAfterEnabled: true). The
 * flag was never editorial hesitation — it was holding the route closed while
 * the binaries were absent, because publishing then would have meant 28 broken
 * images. tests/unit/before-after-provenance.spec.ts is the guard that matters
 * here: it fails if the copy ever starts claiming these are Blue Diamond
 * patients rather than manufacturer clinical examples.
 */

for (const path of gatedPaths) {
  test(`${path} is not publicly reachable (404)`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
  });
}

test("gated routes are absent from the sitemap", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  const body = await response.text();
  for (const path of gatedPaths) {
    expect(body).not.toContain(path);
  }
});

test("gated routes are absent from main navigation", async ({ page }) => {
  await page.goto("/en");
  const nav = page.getByRole("navigation").first();
  for (const path of ["/en/shop/cart", "/en/terms"]) {
    await expect(nav.locator(`a[href="${path}"]`)).toHaveCount(0);
  }
});

test("the published pricing page is reachable and in the sitemap", async ({ page, request }) => {
  for (const path of ["/en/aesthetics/pricing", "/ar/aesthetics/pricing"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/en/aesthetics/pricing");
});

test("the pricing page is reachable from the aesthetics hub", async ({ page }) => {
  await page.goto("/en/aesthetics");
  await expect(page.locator('a[href="/en/aesthetics/pricing"]')).toHaveCount(1);
});

test("the published Before/After page is reachable in both locales", async ({ page }) => {
  for (const path of ["/en/aesthetics/before-after", "/ar/aesthetics/before-after"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
  }
});

test("Before/After is reachable but deliberately NOT indexed", async ({ page, request }) => {
  // Unlike pricing, publishing this route does not make it indexable, and that
  // asymmetry is the point. The rights position on all 14 pairs is
  // LEGACY_SITE_USAGE_EVIDENCE: Blue Diamond published them on its own site,
  // which is evidence of use and is NOT a transferable licence. Rendering
  // another clinician's patients on-page under an explicit attribution is a
  // different act from inviting image search to index them on this domain and
  // republish them stripped of it. So the route serves, and stays out of the
  // sitemap and the index, until a rights document says otherwise.
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("/aesthetics/before-after");

  await page.goto("/en/aesthetics/before-after");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});

test("Before/After renders real imagery, not placeholders", async ({ page }) => {
  await page.goto("/en/aesthetics/before-after");
  // The pairs are approved, so ImageKitImage must emit real <img> elements
  // pointing at the CDN. A FacetTile placeholder renders no <img> at all, so
  // this fails loudly if approval and the binaries ever fall out of step.
  const images = page.locator('img[src*="ik.imagekit.io"]');
  expect(await images.count()).toBeGreaterThan(0);
});

test("Before/After states its provenance on the page", async ({ page }) => {
  await page.goto("/en/aesthetics/before-after");
  // Publishing another clinician's patients as Blue Diamond results is the
  // one thing this section must never do. The disclaimer is not decoration.
  await expect(page.getByText(/not Blue Diamond Medical patients/i).first()).toBeVisible();
});
