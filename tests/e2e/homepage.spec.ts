import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders hero, primary CTA, and doctor cards", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /book appointment/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /dr\.\s/i }).first()).toBeVisible();
  });

  test("has no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/en");
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test("language switch opens the Arabic homepage", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("link", { name: "العربية" }).click();
    await expect(page).toHaveURL(/\/ar\/?$/);
  });

  test("skip-to-content link is the first focusable element", async ({ page }) => {
    await page.goto("/en");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /skip to content/i })).toBeFocused();
  });
});

test.describe("Mobile homepage", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile nav opens and traps focus", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: /open menu/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});

// A real bug found this pass: [data-reveal="start"/"end"] elements sit in a
// translateX(±22px) pre-reveal state — genuinely outside the viewport
// before they scroll into view — which nothing previously clipped, so the
// page could be forced to scroll ~22px horizontally at narrow widths.
// Fixed with `overflow-x: hidden` on `body` (globals.css). `scrollWidth`
// alone isn't the right check here (it reports layout extent even when
// content is safely clipped and unreachable) — the real signal is whether
// the viewport can actually be scrolled horizontally.
test.describe("Horizontal overflow", () => {
  for (const width of [375, 768, 1024]) {
    test.describe(`at ${width}px`, () => {
      test.use({ viewport: { width, height: 900 } });
      for (const path of ["/en", "/ar"]) {
        test(`${path} never scrolls horizontally`, async ({ page }) => {
          await page.goto(path);
          await page.waitForLoadState("networkidle");
          const scrollXAfterAttempt = await page.evaluate(() => {
            window.scrollTo(9999, 0);
            return window.scrollX;
          });
          expect(scrollXAfterAttempt).toBe(0);
        });
      }
    });
  }
});
