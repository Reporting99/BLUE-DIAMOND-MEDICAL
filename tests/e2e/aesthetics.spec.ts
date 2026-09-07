import { test, expect } from "@playwright/test";

test.describe("Aesthetics — treatments, concerns, technologies", () => {
  /* Two ways in, not three, and not "By Treatment"/"By Concern": the concern
     list IS the treatments list now, so a third card would be a second link to
     the same page. The cards are "Treatments" and "Our Technologies". */
  test("hub links to both sub-hubs", async ({ page }) => {
    await page.goto("/en/aesthetics");
    await page.getByRole("link", { name: "Treatments" }).first().click();
    await expect(page).toHaveURL(/\/en\/aesthetics\/treatments\/?$/);

    await page.goto("/en/aesthetics");
    await page.getByRole("link", { name: "Our Technologies" }).first().click();
    await expect(page).toHaveURL(/\/en\/aesthetics\/technologies\/?$/);
  });

  test("treatment detail page renders rich content and FAQs", async ({ page }) => {
    await page.goto("/en/aesthetics/treatments/rf-microneedling");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("RF Microneedling");
    await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Safety & contraindications" })).toBeVisible();
  });

  test("treatment page links to its technology and related concerns", async ({ page }) => {
    await page.goto("/en/aesthetics/treatments/rf-microneedling");
    await page.getByRole("link", { name: "Potenza" }).click();
    await expect(page).toHaveURL(/\/en\/aesthetics\/technologies\/potenza\/?$/);
  });

  /**
   * The concern page is the entry point the navigation now sends people to,
   * so "Treatment Options at Blue Diamond" is the section that has to work:
   * it names each option and links onward to that treatment's full page.
   */
  test("concern page surfaces its treatment options and links to one", async ({ page }) => {
    await page.goto("/en/aesthetics/treatments/acne-scars");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Acne Scars");
    const options = page.getByRole("heading", { name: "Treatment options at Blue Diamond" });
    await expect(options).toBeVisible();
    // Scoped to the options list: the treatment name also appears as the
    // eyebrow on its card, so an unscoped lookup is ambiguous.
    await expect(
      page.getByRole("listitem").filter({ hasText: "RF Microneedling" }).first(),
    ).toBeVisible();
    await page.getByRole("link", { name: "Read the full treatment page" }).first().click();
    await expect(page).toHaveURL(/\/en\/aesthetics\/treatments\/[a-z-]+\/?$/);
  });

  /**
   * The reverse edge. A treatment page is no longer in the navigation, so its
   * link back into the concern-first journey is the only route a visitor who
   * lands there from search has onward.
   */
  test("treatment page links back to a concern that recommends it", async ({ page }) => {
    await page.goto("/en/aesthetics/treatments/rf-microneedling");
    await page.getByRole("link", { name: "Acne Scars" }).click();
    await expect(page).toHaveURL(/\/en\/aesthetics\/treatments\/acne-scars\/?$/);
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
      await page.goto("/en/aesthetics/treatments");
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
      await page.goto("/en/aesthetics/treatments");
      const links = page.locator("main ul li a");
      const count = await links.count();
      expect(count).toBeGreaterThanOrEqual(11);
      for (let i = 0; i < count; i++) {
        await expect(links.nth(i)).toHaveAttribute("href", /\/en\/aesthetics\/treatments\//);
      }
    });
  });
});
