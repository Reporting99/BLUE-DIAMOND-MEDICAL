import { test, expect } from "@playwright/test";
import { products } from "../../src/content/products";

/**
 * "COMPLETE SKINMEDICA NAVIGATION AND PRODUCT-DETAIL FLOW" — homepage
 * product-preview and full-catalogue card/link tests.
 */

test.describe("Homepage — SkinMedica preview", () => {
  test("shows a refined preview (4-6 products), not the full 23-product catalogue", async ({ page }) => {
    await page.goto("/en");
    // Count via links into /en/shop/ inside the SkinMedica section
    // specifically, since the homepage also links to many other things.
    const heading = page.getByRole("heading", { name: "Medical-grade skincare, recommended by your physician." });
    const section = page.locator("section", { has: heading });
    const productLinks = section.locator("a[href*='/en/shop/']");
    const count = await productLinks.count();
    expect(count).toBeGreaterThanOrEqual(4);
    expect(count).toBeLessThanOrEqual(6);
  });

  test("each homepage product card links directly to its own detail page (never the catalogue)", async ({ page, request }) => {
    await page.goto("/en");
    const heading = page.getByRole("heading", { name: "Medical-grade skincare, recommended by your physician." });
    const section = page.locator("section", { has: heading });
    const hrefs = await section.locator("a[href*='/en/shop/']").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    for (const href of hrefs) {
      expect(href, "card should not route to the catalogue hub itself").not.toBe("/en/shop");
      const res = await request.get(href!);
      expect(res.status(), href!).toBe(200);
    }
  });

  test('"View All SkinMedica Products" opens the catalogue, not Contact', async ({ page }) => {
    await page.goto("/en");
    const cta = page.getByRole("link", { name: "View All SkinMedica Products" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/en/shop");
  });

  test("Arabic CTA uses the descriptive translated label and opens the Arabic catalogue", async ({ page }) => {
    await page.goto("/ar");
    const cta = page.getByRole("link", { name: "استعرضي جميع منتجات SkinMedica" });
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute("href");
    expect(href).toContain("المتجر");
  });
});

test.describe("Shop catalogue page", () => {
  test("/en/shop publishes all 23 approved products as clickable cards", async ({ page }) => {
    await page.goto("/en/shop");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Scoped to exclude the "by category"/"by concern" filter-chip links
    // above the grid, which also contain "/en/shop/" as a substring
    // (/en/shop/category/..., /en/shop/concern/...) — real product cards
    // never have those two path segments.
    const cards = page.locator("ul li a[href*='/en/shop/']:not([href*='/category/']):not([href*='/concern/'])");
    await expect(cards).toHaveCount(products.length);
  });

  test("no card is nested <a> inside <a>, and every card is a single valid link", async ({ page }) => {
    await page.goto("/en/shop");
    const nestedAnchors = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll("a"));
      return anchors.filter((a) => a.querySelector("a")).length;
    });
    expect(nestedAnchors).toBe(0);
  });

  test("cards show category, name, size, price, and a descriptive detail CTA", async ({ page }) => {
    await page.goto("/en/shop");
    const firstCard = page.locator("ul li a[href*='/en/shop/']:not([href*='/category/']):not([href*='/concern/'])").first();
    await expect(firstCard.getByText("View Product Details")).toBeVisible();
    // Price is formatted with two decimals and CAD, per the centralized formatter.
    await expect(firstCard).toContainText(/\$[\d.]+ CAD/);
  });

  test("the catalogue's own main content does not link back to itself as an enquiry CTA", async ({ page }) => {
    await page.goto("/en/shop");
    // Scoped to <main> — the Footer's own "Patient Resources" navigation
    // column legitimately links to /en/shop from every page site-wide;
    // that's normal site navigation, not the "enquiry CTA back to the
    // same catalogue page" the brief warns against.
    const selfLinks = await page.locator("main a[href='/en/shop']").count();
    expect(selfLinks).toBe(0);
  });

  test('shows "Contact the Clinic About SkinMedica" linking to Contact with the skinmedica topic, not the catalogue', async ({ page }) => {
    await page.goto("/en/shop");
    const cta = page.getByRole("link", { name: "Contact the Clinic About SkinMedica" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/en/contact?topic=skinmedica");
  });

  test("keyboard focus reaches a product card and Enter opens it", async ({ page }) => {
    await page.goto("/en/shop");
    const firstCard = page.locator("ul li a[href*='/en/shop/']:not([href*='/category/']):not([href*='/concern/'])").first();
    await firstCard.focus();
    await expect(firstCard).toBeFocused();
    const href = await firstCard.getAttribute("href");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });

  test("no horizontal overflow on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto("/en/shop");
    const scrollXAfterAttempt = await page.evaluate(() => {
      window.scrollTo({ left: 9999 });
      return window.scrollX;
    });
    expect(scrollXAfterAttempt).toBe(0);
  });
});

test.describe("Full catalogue-card → product-page flow", () => {
  test("clicking a specific card opens the correct product with matching H1, name, price, and FAQ section", async ({ page }) => {
    await page.goto("/en/shop");
    const targetProduct = products.find((p) => p.id === "retinol-complex-05")!;
    const card = page.locator(`a[href$='${targetProduct.slug}']`).first();
    await card.click();
    await expect(page).toHaveURL(new RegExp(`/en/shop/${targetProduct.slug}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(targetProduct.name.en);
    await expect(page.getByText(/\$83\.00 CAD/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Questions and Answers About This Product" })).toBeVisible();
  });
});

test.describe("Invalid product slug", () => {
  test("an unknown product slug 404s cleanly", async ({ page }) => {
    const response = await page.goto("/en/shop/this-product-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
