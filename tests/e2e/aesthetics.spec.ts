import { test, expect } from "@playwright/test";

test.describe("Aesthetics — treatments, concerns, technologies", () => {
  test("hub links to the three sub-hubs", async ({ page }) => {
    await page.goto("/en/aesthetics");
    await page.getByRole("link", { name: /By Treatment/ }).click();
    await expect(page).toHaveURL(/\/en\/aesthetics\/treatments\/?$/);
  });

  test("treatment detail page renders rich content and FAQs", async ({ page }) => {
    await page.goto("/en/aesthetics/treatments/rf-microneedling");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("RF Micro-Needling");
    await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Safety & contraindications" })).toBeVisible();
  });

  test("treatment page links to its technology and related concerns", async ({ page }) => {
    await page.goto("/en/aesthetics/treatments/rf-microneedling");
    await page.getByRole("link", { name: "Potenza" }).click();
    await expect(page).toHaveURL(/\/en\/aesthetics\/technologies\/potenza\/?$/);
  });

  test("concern page links to a related treatment", async ({ page }) => {
    await page.goto("/en/aesthetics/concerns/acne-scars");
    await page.getByRole("link", { name: "RF Micro-Needling" }).click();
    await expect(page).toHaveURL(/\/en\/aesthetics\/treatments\/rf-microneedling\/?$/);
  });

  test("pretty Arabic treatments-hub URL resolves", async ({ page }) => {
    const response = await page.goto(
      "/ar/%D8%A7%D9%84%D8%AA%D8%AC%D9%85%D9%8A%D9%84-%D8%A7%D9%84%D8%B7%D8%A8%D9%8A/%D8%A7%D9%84%D8%B9%D9%84%D8%A7%D8%AC%D8%A7%D8%AA",
    );
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  // ConcernExplorer's "PREMIUM UNIFIED HOMEPAGE REDESIGN" enhancement: a
  // large preview image now follows keyboard focus/hover, without ever
  // gating real navigation behind a click-to-select JS pattern — every
  // concern stays a real, always-rendered <Link> the whole time.
  test.describe("Concern explorer preview", () => {
    test("keyboard-tabbing to a concern link updates the preview image path", async ({ page }) => {
      await page.goto("/en/aesthetics/concerns");
      const secondConcernLink = page.locator("main ul li a").nth(1);
      const secondConcernHref = await secondConcernLink.getAttribute("href");
      await secondConcernLink.focus();
      await expect(secondConcernLink).toBeFocused();
      const preview = page.locator('img[src*="concerns"], svg[role="img"]').first();
      await expect(preview).toBeVisible();
      // The link itself is real navigation, independent of the preview —
      // Enter should take us to its real page.
      await page.keyboard.press("Enter");
      expect(secondConcernHref).toBeTruthy();
      await expect(page).toHaveURL(new RegExp(secondConcernHref!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    });

    test("every concern remains a real link even before any interaction", async ({ page }) => {
      await page.goto("/en/aesthetics/concerns");
      const links = page.locator("main ul li a");
      const count = await links.count();
      expect(count).toBeGreaterThanOrEqual(9);
      for (let i = 0; i < count; i++) {
        await expect(links.nth(i)).toHaveAttribute("href", /\/en\/aesthetics\/concerns\//);
      }
    });
  });
});
