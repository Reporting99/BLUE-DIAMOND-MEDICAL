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
  "/en/aesthetics/before-after",
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
 * /en/aesthetics/pricing left this list when the client-approved pricing
 * workbook was published (GAP-003 resolved, aestheticPricingEnabled: true).
 * It is covered positively below instead of being asserted unreachable — see
 * docs/APPROVED_AESTHETIC_PRICING_MATRIX.md and
 * tests/unit/aesthetic-pricing.spec.ts for the price-data guard.
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
