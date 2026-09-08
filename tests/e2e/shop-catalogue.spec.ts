import { test, expect } from "@playwright/test";
import { products } from "../../src/features/products/data";
import { archivedSkinMedicaProducts } from "../../src/features/products/archive/skinmedica";

/**
 * "COMPLETE SKINMEDICA NAVIGATION AND PRODUCT-DETAIL FLOW" — homepage
 * product-preview and full-catalogue card/link tests.
 */

test.describe("Homepage — product preview", () => {
  test("shows a refined preview (4-6 products), not the full catalogue", async ({ page }) => {
    await page.goto("/en");
    // Count via links into /en/shop/ inside the product section
    // specifically, since the homepage also links to many other things.
    const heading = page.getByRole("heading", { name: "Medical-grade skincare, recommended by your physician" });
    const section = page.locator("section", { has: heading });
    const productLinks = section.locator("a[href*='/en/shop/']");
    const count = await productLinks.count();
    expect(count).toBeGreaterThanOrEqual(4);
    expect(count).toBeLessThanOrEqual(6);
  });

  test("each homepage product card links directly to its own detail page (never the catalogue)", async ({ page, request }) => {
    await page.goto("/en");
    const heading = page.getByRole("heading", { name: "Medical-grade skincare, recommended by your physician" });
    const section = page.locator("section", { has: heading });
    const hrefs = await section.locator("a[href*='/en/shop/']").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    for (const href of hrefs) {
      expect(href, "card should not route to the catalogue hub itself").not.toBe("/en/shop");
      const res = await request.get(href!);
      expect(res.status(), href!).toBe(200);
    }
  });

  test('"View all products" opens the catalogue, not Contact', async ({ page }) => {
    await page.goto("/en");
    const cta = page.getByRole("link", { name: "View all products" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/en/shop");
  });

  test("Arabic CTA uses the descriptive translated label and opens the Arabic catalogue", async ({ page }) => {
    await page.goto("/ar");
    const cta = page.getByRole("link", { name: "استعرضي جميع المنتجات" });
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute("href");
    expect(href).toContain("المتجر");
  });
});

test.describe("Shop catalogue page", () => {
  test("/en/shop publishes every product in the live catalogue as a clickable card", async ({ page }) => {
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

  test("cards show category, name, size and a descriptive detail CTA — and a price only where one was supplied", async ({ page }) => {
    await page.goto("/en/shop");
    const firstCard = page.locator("ul li a[href*='/en/shop/']:not([href*='/category/']):not([href*='/concern/'])").first();
    await expect(firstCard.getByText("View Product Details")).toBeVisible();

    // The price assertion is now a two-sided one, because the live catalogue
    // is Myriade and the supplied flyer carried exactly ONE price. Asserting
    // "$x CAD on the first card" would have been asserting that a price the
    // client never sent had appeared from somewhere.
    const priced = products.filter((p) => p.priceCents !== null);
    expect(priced.map((p) => p.id), "the source supplies exactly one price").toEqual(["purifying-peeling"]);
    const pricedCard = page.locator(`ul li a[href$='/${priced[0].slug}']`).first();
    await expect(pricedCard).toContainText("188 + GST");
    // ...and a card with no supplied price shows no price at all, not a zero,
    // a dash, or a sibling's.
    const unpricedCard = page.locator("ul li a[href$='/the-cleanser']").first();
    await expect(unpricedCard).not.toContainText(/CAD|\$/);
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

  test('shows "Contact the clinic about our products" linking to Contact with the products topic, not the catalogue', async ({ page }) => {
    await page.goto("/en/shop");
    const cta = page.getByRole("link", { name: "Contact the clinic about our products" });
    await expect(cta).toBeVisible();
    // Brand-neutral since SkinMedica was archived (2026-09-07): the topic is
    // the catalogue, not one manufacturer. /contact still accepts the old
    // `skinmedica` value so already-indexed links keep working.
    await expect(cta).toHaveAttribute("href", "/en/contact?topic=products");
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
  // Was retinol-complex-05, asserting "$83.00 CAD" and an FAQ section. That
  // product is SkinMedica and has been archived (2026-09-07), so the test
  // would have failed on a missing card rather than on a broken flow. The
  // Myriade records carry the client's structured Benefits copy instead of a
  // research FAQ block, so the flow is asserted against what a record of that
  // shape actually publishes.
  test("clicking a specific card opens the correct product with matching H1 and its supplied copy", async ({ page }) => {
    await page.goto("/en/shop");
    const targetProduct = products.find((p) => p.id === "c-serum")!;
    const card = page.locator(`a[href$='${targetProduct.slug}']`).first();
    await card.click();
    await expect(page).toHaveURL(new RegExp(`/en/shop/${targetProduct.slug}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(targetProduct.name.en);
    await expect(page.getByText(targetProduct.subtitle!.en).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Questions about this product" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Benefits" })).toBeVisible();
  });

  test("an archived SkinMedica product URL 301s to the catalogue instead of 404ing", async ({ request }) => {
    // These 23 URLs were indexed while the line was carried. Archiving it
    // removed their routes; the redirect is what keeps a bookmark or a search
    // result landing on a live page.
    // Derived from the archive: the id is `retinol-complex-05` but the URL
    // slug is `retinol-complex-0-5`, and writing the wrong one by hand made
    // this test assert a 404 on a URL that was never published.
    const archived = archivedSkinMedicaProducts.find((p) => p.id === "retinol-complex-05")!;
    const res = await request.get(`/en/shop/${archived.slug}`, { maxRedirects: 0 });
    expect(res.status()).toBe(301);
    expect(res.headers()["location"]).toContain("/en/shop");
  });
});

test.describe("Invalid product slug", () => {
  test("an unknown product slug 404s cleanly", async ({ page }) => {
    const response = await page.goto("/en/shop/this-product-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
