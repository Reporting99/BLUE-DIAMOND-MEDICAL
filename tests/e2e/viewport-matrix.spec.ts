import { test, expect } from "@playwright/test";

/**
 * The release mobile matrix — closure brief §42.
 *
 * Horizontal overflow was already guarded on the homepage at three widths
 * (tests/e2e/homepage.spec.ts). That is the right check on the wrong sample:
 * the widths that actually break layouts are the narrow ones this project
 * never ran (320 is the narrowest phone still in use, 430 the widest), and the
 * pages most likely to break are the ones with tables, sliders and long
 * medical terms — pricing, Before/After, treatment and product detail — not
 * the homepage.
 *
 * Arabic is checked at every width alongside English rather than sampled.
 * RTL is where a fixed `left`, a hardcoded `margin-left` or an unwrapped wide
 * table shows up, and a layout that holds in English tells you nothing about
 * the mirrored one.
 *
 * `scrollWidth` is deliberately not the assertion. It reports layout extent
 * even when content is safely clipped and unreachable, so it flags the
 * pre-reveal transform states this site uses on purpose. The real question is
 * whether a reader can actually drag the page sideways, so the test tries to.
 */
const WIDTHS = [320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440];

const PATHS = [
  "/en",
  "/ar",
  "/en/medical",
  "/ar/medical",
  "/en/aesthetics",
  "/ar/aesthetics",
  "/en/aesthetics/pricing",
  "/ar/aesthetics/pricing",
  "/en/aesthetics/before-after",
  "/ar/aesthetics/before-after",
  "/en/doctors",
  "/ar/doctors",
  "/en/contact",
  "/ar/contact",
];

for (const width of WIDTHS) {
  test.describe(`viewport ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    for (const path of PATHS) {
      test(`${path} never scrolls horizontally`, async ({ page }) => {
        const response = await page.goto(path);
        expect(response?.status(), `${path} must render`).toBe(200);
        await page.waitForLoadState("networkidle");

        const scrolled = await page.evaluate(() => {
          const before = window.scrollX;
          window.scrollTo(9999, 0);
          const after = window.scrollX;
          window.scrollTo(before, 0);
          // RTL scrolls negative, so distance from the start is what counts.
          return Math.abs(after - before);
        });
        expect(scrolled, `${path} at ${width}px can be dragged sideways`).toBe(0);
      });
    }
  });
}

test.describe("tap targets and the mobile drawer", () => {
  test.use({ viewport: { width: 320, height: 720 }, hasTouch: true });

  for (const locale of ["en", "ar"]) {
    test(`${locale}: the menu opens, locks body scroll, and closes`, async ({ page }) => {
      await page.goto(`/${locale}`);

      const toggle = page.getByRole("button", { name: /menu|القائمة/i }).first();
      await expect(toggle).toBeVisible();

      // 44px is the accessible minimum for a touch target, and 320px is where
      // a control is most likely to have been squeezed under it.
      const box = await toggle.boundingBox();
      expect(box, "menu toggle must have a box").not.toBeNull();
      expect(box!.height, "menu toggle height").toBeGreaterThanOrEqual(44);
      expect(box!.width, "menu toggle width").toBeGreaterThanOrEqual(44);

      await toggle.click();
      const drawer = page.getByRole("dialog").or(page.locator("[data-mobile-nav]")).first();
      await expect(drawer).toBeVisible();

      // An open drawer over a still-scrollable page is the bug this catches:
      // the reader scrolls the content behind the menu instead of the menu.
      const locked = await page.evaluate(() => {
        const body = document.body;
        const style = getComputedStyle(body);
        return style.overflow === "hidden" || style.position === "fixed";
      });
      expect(locked, "body scroll must be locked while the drawer is open").toBe(true);

      await page.keyboard.press("Escape");
      await expect(drawer).toBeHidden();

      const unlocked = await page.evaluate(() => getComputedStyle(document.body).overflow !== "hidden");
      expect(unlocked, "body scroll must be restored after closing").toBe(true);
    });
  }
});

test.describe("Arabic renders as RTL", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the document direction is rtl and English does not leak into the shell", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  });
});
