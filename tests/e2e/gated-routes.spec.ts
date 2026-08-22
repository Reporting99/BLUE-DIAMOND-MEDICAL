import { test, expect } from "@playwright/test";

/**
 * Every route built but kept behind a disabled feature flag must be
 * genuinely unreachable — 404, not indexed, not linked from nav — while
 * its flag is off. See docs/MISSING_CONTENT_REPORT.md for why each of
 * these has a route/model/template but no public content.
 */
const gatedPaths = [
  "/en/aesthetics/treatments/cosmetic-botox",
  "/en/aesthetics/treatments/skin-tightening",
  "/en/medical/botox",
  "/en/medical/botox/migraine",
  "/en/medical/botox/bruxism-tmj",
  "/en/medical/botox/hyperhidrosis",
  "/en/aesthetics/pricing",
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
  for (const path of ["/en/shop", "/en/aesthetics/pricing", "/en/terms"]) {
    await expect(nav.locator(`a[href="${path}"]`)).toHaveCount(0);
  }
});
