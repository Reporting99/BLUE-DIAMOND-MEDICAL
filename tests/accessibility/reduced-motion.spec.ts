import { test, expect } from "@playwright/test";

/**
 * `prefers-reduced-motion: reduce` support — brief §10/§13 ("Support
 * prefers-reduced-motion"). The CSS override in globals.css
 * (`html.reveal-active [data-reveal] { opacity: 1 !important; ... }`)
 * exists so that a visitor with this preference sees below-the-fold
 * content immediately, without needing to scroll and wait for the
 * IntersectionObserver-driven reveal transition first. This test verifies
 * that behavior end-to-end rather than trusting the CSS rule exists.
 */
test.describe("prefers-reduced-motion", () => {
  for (const path of ["/en", "/ar"]) {
    test(`${path} shows scroll-reveal content immediately, without scrolling`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      // No scrolling at all — only enough time for the client bundle to
      // mount and add `reveal-active` to <html>.
      await expect
        .poll(() => page.evaluate(() => document.documentElement.classList.contains("reveal-active")), { timeout: 5000 })
        .toBe(true);

      const hiddenCount = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter((el) => {
          const style = window.getComputedStyle(el);
          return style.opacity !== "1";
        }).length,
      );
      expect(hiddenCount, "elements still hidden under reduced motion, without scrolling").toBe(0);
    });
  }

  test("animation and transition durations collapse to near-zero", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    const duration = await page.evaluate(() => {
      const probe = document.querySelector<HTMLElement>("[data-reveal]");
      if (!probe) return null;
      return window.getComputedStyle(probe).transitionDuration;
    });
    // "0.01ms" (globals.css's reduced-motion override) or "0s" — never a
    // real multi-hundred-ms transition duration.
    expect(duration === null || parseFloat(duration) <= 0.01).toBeTruthy();
  });
});
