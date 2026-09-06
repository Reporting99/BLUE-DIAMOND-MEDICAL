import { test, expect } from "@playwright/test";
import { products } from "../../src/features/products/data";

/**
 * "COMPLETE SKINMEDICA NAVIGATION AND PRODUCT-DETAIL FLOW" — every
 * approved product's own detail page. The 23-product sweep is
 * request-based (fast, no browser rendering per product, matching
 * tests/seo/broken-links.spec.ts's pattern); a handful of representative
 * interactive checks use real page rendering.
 */

/**
 * CL-036/CL-037/CL-038 — two contracts, because there are two kinds of record.
 *
 * A SkinMedica record carries researched `detail` (and therefore an FAQ
 * section) and the standard availability notice. A client-supplied record
 * carries the structured copy the client actually sent — subtitle, Benefits,
 * Key features — and, while a required input is outstanding, an explicit
 * "not purchasable" note IN PLACE OF the availability notice, because it must
 * make no availability claim at all. Asserting the SkinMedica shape on both
 * would have forced an invented FAQ set onto the peels.
 */
test.describe("Every product page — English", () => {
  for (const product of products) {
    test(`${product.slug}: 200, correct H1, FAQ heading present`, async ({ request }) => {
      const res = await request.get(`/en/shop/${product.slug}`);
      expect(res.status(), product.slug).toBe(200);
      const html = await res.text();
      expect(html, `${product.slug}: H1`).toContain(product.name.en);

      if (product.purchaseBlocked) {
        expect(html, `${product.slug}: blocked-purchase note`).toContain("shown for information only");
        expect(html, `${product.slug}: must claim no availability`).not.toContain(
          "confirmed directly with Blue Diamond Medical Clinic",
        );
        expect(html, `${product.slug}: Benefits`).toContain("Benefits");
        expect(html, `${product.slug}: Key features`).toContain("Key features");
      } else {
        expect(html, `${product.slug}: FAQ heading`).toContain("Questions and Answers About This Product");
        expect(html, `${product.slug}: availability notice`).toContain("confirmed directly with Blue Diamond Medical Clinic");
      }
    });
  }
});

test.describe("Every product page — Arabic (pretty URL)", () => {
  for (const product of products) {
    test(`${product.slugAr}: 200, correct H1, FAQ heading present`, async ({ request }) => {
      const res = await request.get(`/ar/المتجر/${encodeURIComponent(product.slugAr)}`);
      expect(res.status(), product.slugAr).toBe(200);
      const html = await res.text();
      expect(html, `${product.slugAr}: H1`).toContain(product.name.ar);
      if (!product.purchaseBlocked) {
        expect(html, `${product.slugAr}: FAQ heading`).toContain("أسئلة وأجوبة حول هذا المنتج");
      }
    });
  }
});

test.describe("Product page structure", () => {
  test("breadcrumbs read Home → Products → product name", async ({ page }) => {
    await page.goto("/en/shop/retinol-complex-0-5");
    const nav = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(nav.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Products", exact: true })).toBeVisible();
    await expect(nav.getByText("Retinol Complex 0.5")).toBeVisible();
  });

  test("Arabic breadcrumbs are in RTL order and translated", async ({ page }) => {
    await page.goto("/ar/المتجر/مركب-الريتينول-٠٫٥");
    const nav = page.getByRole("navigation", { name: "مسار التصفح" });
    await expect(nav.getByRole("link", { name: "الرئيسية" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "المنتجات" })).toBeVisible();
  });

  test("FAQ schema exactly matches the visible FAQ questions", async ({ page }) => {
    await page.goto("/en/shop/retinol-complex-0-5");
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faqSchema = scripts.map((s) => JSON.parse(s)).find((s) => s["@type"] === "FAQPage");
    expect(faqSchema).toBeTruthy();
    // Scoped to <main>: the site footer now publishes the clinic's opening
    // hours as its own definition list (CL-009), so an unscoped "dl dt" would
    // sweep "Monday - Saturday" into this page's FAQ questions.
    const visibleQuestions = await page.locator("main dl dt").allTextContents();
    const schemaQuestions = faqSchema.mainEntity.map((q: { name: string }) => q.name);
    expect(schemaQuestions).toEqual(visibleQuestions);
    expect(schemaQuestions.length).toBeGreaterThanOrEqual(6);
    expect(schemaQuestions.length).toBeLessThanOrEqual(10);
  });

  test("a minimal Product schema is present with no Offer/price/InStock claim", async ({ page }) => {
    await page.goto("/en/shop/retinol-complex-0-5");
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const productSchema = scripts.map((s) => JSON.parse(s)).find((s) => s["@type"] === "Product");
    expect(productSchema).toBeTruthy();
    expect(productSchema.name).toBe("Retinol Complex 0.5");
    expect(productSchema.offers).toBeUndefined();
  });

  test("related-product cards link to their own individual pages", async ({ page, request }) => {
    await page.goto("/en/shop/retinol-complex-0-5");
    const relatedSection = page.locator("section", { has: page.getByRole("heading", { name: "You may also like" }) });
    const hrefs = await relatedSection.locator("a").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const res = await request.get(href!);
      expect(res.status(), href!).toBe(200);
    }
  });

  test('"Ask About This Product" opens the enquiry pathway with the product preselected, not the catalogue', async ({ page }) => {
    await page.goto("/en/shop/retinol-complex-0-5");
    const cta = page.getByRole("link", { name: "Ask About This Product" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/en/contact?product=retinol-complex-0-5");
  });

  test("self-referencing canonical and reciprocal hreflang on a product page", async ({ page }) => {
    await page.goto("/en/shop/retinol-complex-0-5");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toContain("/en/shop/retinol-complex-0-5");
    const enAlt = await page.locator('link[rel="alternate"][hreflang="en-CA"]').getAttribute("href");
    const arAlt = await page.locator('link[rel="alternate"][hreflang="ar-CA"]').getAttribute("href");
    const xDefault = await page.locator('link[rel="alternate"][hreflang="x-default"]').getAttribute("href");
    expect(enAlt).toContain("/en/shop/retinol-complex-0-5");
    expect(arAlt).toBeTruthy();
    expect(xDefault).toBeTruthy();
  });

  test("unique metadata (title, description) per product", async ({ page }) => {
    await page.goto("/en/shop/retinol-complex-0-5");
    const title1 = await page.title();
    await page.goto("/en/shop/facial-cleanser");
    const title2 = await page.title();
    expect(title1).not.toBe(title2);
  });
});
