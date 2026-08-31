import { test, expect } from "@playwright/test";

/**
 * Rendering coverage for the published aesthetic price list. The price *data*
 * is guarded in tests/unit/aesthetic-pricing.spec.ts; this file checks the
 * surfaces — that prices reach both locales, that the longest table stays
 * usable on a phone, and that the clinically-held ampoule add-ons reach no
 * page at all.
 */

const PRICE = /\$[\d,]+\.\d{2} CAD/;

test.describe("Aesthetics pricing", () => {
  test("the pricing index publishes every approved price in both locales", async ({ page }) => {
    for (const [path, heading] of [
      ["/en/aesthetics/pricing", "Aesthetics Pricing"],
      ["/ar/aesthetics/pricing", "أسعار التجميل الطبي"],
    ]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      // 78 publishable rows — the 3 held ampoule add-ons are not among them.
      await expect(page.locator("dd").filter({ hasText: PRICE })).toHaveCount(78);
    }
  });

  test("a treatment page shows only its own prices", async ({ page }) => {
    await page.goto("/en/aesthetics/treatments/tempsure-vitalia");
    await expect(page.getByRole("heading", { name: "Pricing" })).toBeVisible();
    await expect(page.locator("dd").filter({ hasText: PRICE })).toHaveCount(2);

    await page.goto("/en/aesthetics/treatments/laser-hair-removal");
    await expect(page.locator("dd").filter({ hasText: PRICE })).toHaveCount(31);
  });

  test("Arabic treatment pricing renders in Arabic with LTR prices", async ({ page }) => {
    await page.goto("/ar/aesthetics/treatments/rf-microneedling");
    await expect(page.getByRole("heading", { name: "الأسعار" })).toBeVisible();
    await expect(page.getByText("الإبر الدقيقة بالترددات الراديوية — رأس عادي")).toBeVisible();
    await expect(page.locator("dd").filter({ hasText: PRICE })).toHaveCount(16);
  });

  test("clinically-held ampoule add-ons appear on no page", async ({ page }) => {
    // GAP-014: commercially approved, clinically held. No price, name or
    // suitability claim for these may render anywhere.
    for (const path of [
      "/en/aesthetics/pricing",
      "/ar/aesthetics/pricing",
      "/en/aesthetics/treatments/rf-microneedling",
      "/en/aesthetics/treatments/ultra",
    ]) {
      await page.goto(path);
      const body = (await page.locator("body").textContent()) ?? "";
      for (const held of ["Tranexamic", "حمض الترانيكساميك", "$120.00 CAD", "$60.00 CAD"]) {
        expect(body, `${held} leaked on ${path}`).not.toContain(held);
      }
    }
  });
});

/**
 * §40 — the 31-row laser hair removal table is the longest pricing surface on
 * the site and the most likely to push the layout wide on a phone. Same
 * measurement approach as tests/e2e/closing-transition.spec.ts: attempt a
 * real horizontal scroll rather than trusting scrollWidth, which reports a
 * false positive under `overflow-x: hidden`.
 */
test.describe("Pricing on a narrow viewport", () => {
  test.use({ viewport: { width: 360, height: 780 } });

  for (const path of [
    "/en/aesthetics/treatments/laser-hair-removal",
    "/ar/aesthetics/treatments/laser-hair-removal",
    "/en/aesthetics/pricing",
    "/ar/aesthetics/pricing",
  ]) {
    test(`${path} does not scroll horizontally`, async ({ page }) => {
      await page.goto(path);
      await page.evaluate(() => window.scrollTo(9999, 0));
      const scrollX = await page.evaluate(() => window.scrollX);
      expect(scrollX, `horizontal overflow on ${path}`).toBe(0);
    });
  }

  test("every price stays visible and inside the viewport", async ({ page }) => {
    await page.goto("/en/aesthetics/treatments/laser-hair-removal");
    const prices = page.locator("dd").filter({ hasText: PRICE });
    await expect(prices).toHaveCount(31);
    // Content is not hidden to make mobile shorter (§41) and no row is clipped.
    const viewportWidth = page.viewportSize()!.width;
    for (const index of [0, 15, 30]) {
      const box = await prices.nth(index).boundingBox();
      expect(box, `price ${index} has no box`).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewportWidth + 1);
    }
  });
});
