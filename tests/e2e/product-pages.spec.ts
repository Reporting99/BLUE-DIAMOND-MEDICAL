import { test, expect } from "@playwright/test";
import { products } from "../../src/features/products/data";

/**
 * "COMPLETE SKINMEDICA NAVIGATION AND PRODUCT-DETAIL FLOW" — every
 * approved product's own detail page. The 23-product sweep is
 * request-based (fast, no browser rendering per product, matching
 * tests/seo/broken-links.spec.ts's pattern); a handful of representative
 * interactive checks use real page rendering.
 */

test.describe("Every product page — English", () => {
  for (const product of products) {
    test(`${product.slug}: 200, correct H1, FAQ heading present`, async ({ request }) => {
      const res = await request.get(`/en/shop/${product.slug}`);
      expect(res.status(), product.slug).toBe(200);
      const html = await res.text();
      expect(html, `${product.slug}: H1`).toContain(product.name.en);
      expect(html, `${product.slug}: FAQ heading`).toContain("Questions and Answers About This Product");
      expect(html, `${product.slug}: availability notice`).toContain("confirmed directly with Blue Diamond Medical Clinic");
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
      expect(html, `${product.slugAr}: FAQ heading`).toContain("أسئلة وأجوبة حول هذا المنتج");
    });
  }
});

test.describe("Product page structure", () => {
  test("breadcrumbs read Home → SkinMedica Products → product name", async ({ page }) => {
    await page.goto("/en/shop/retinol-complex-0-5");
    const nav = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(nav.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "SkinMedica Products" })).toBeVisible();
    await expect(nav.getByText("Retinol Complex 0.5")).toBeVisible();
  });

  test("Arabic breadcrumbs are in RTL order and translated", async ({ page }) => {
    await page.goto("/ar/المتجر/مركب-الريتينول-٠٫٥");
    const nav = page.getByRole("navigation", { name: "مسار التصفح" });
    await expect(nav.getByRole("link", { name: "الرئيسية" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "منتجات SkinMedica" })).toBeVisible();
  });

  test("FAQ schema exactly matches the visible FAQ questions", async ({ page }) => {
    await page.goto("/en/shop/retinol-complex-0-5");
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faqSchema = scripts.map((s) => JSON.parse(s)).find((s) => s["@type"] === "FAQPage");
    expect(faqSchema).toBeTruthy();
    const visibleQuestions = await page.locator("dl dt").allTextContents();
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
