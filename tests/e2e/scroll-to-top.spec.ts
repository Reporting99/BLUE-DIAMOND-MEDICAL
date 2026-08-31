import { test, expect, type Page } from "@playwright/test";

/**
 * Destination-starts-at-top behaviour — final navigation brief §2-§5, §23,
 * §67, §84, §85, §90.
 *
 * These tests exist because the behaviour they assert was BROKEN in the
 * shipped build and is invisible to a normal smoke test: every route
 * returned 200 and rendered correctly, it just rendered starting halfway
 * down. Measured against release 991e4e1 before this pass:
 *
 *   scroll to 3200 on /en, click HOME in the navbar -> scrollY 3200
 *   scroll to 3200 on /en, click the logo           -> scrollY 3200
 *   Contact at 497, click the breadcrumb Home       -> scrollY 651
 *   Arabic home at 2500, click the logo             -> scrollY 2500
 *   mobile Medical at 2000, menu -> Home            -> scrollY 1578
 *
 * Implementation: src/components/layout/RouteScrollManager.tsx plus
 * `data-scroll-behavior="smooth"` on <html> in the locale layout.
 */

async function scrollTo(page: Page, y: number) {
  await page.evaluate((v) => window.scrollTo({ top: v, behavior: "instant" as ScrollBehavior }), y);
  await page.waitForTimeout(250);
}

const scrollY = (page: Page) => page.evaluate(() => Math.round(window.scrollY));

test.describe("Every normal navigation starts the destination at the top", () => {
  // These drive the DESKTOP navbar, which is `hidden lg:flex` by design, so
  // they must run at a desktop width. Playwright runs every spec under both
  // the chromium-desktop and chromium-mobile projects; without this the
  // mobile project spent 30s per test waiting on a nav link that is
  // correctly invisible at 390px. The mobile equivalents of these journeys
  // are covered by the mobile describe block at the bottom of this file,
  // which drives the mobile menu instead.
  test.use({ viewport: { width: 1440, height: 900 } });

  test("the router opts Next.js into disabling smooth scroll during route transitions", async ({ page }) => {
    // Without this attribute, Next.js 16 leaves `scroll-behavior: smooth`
    // (set in globals.css for in-page anchors) applied during navigation,
    // so the scroll-to-top becomes an animated glide that a wheel/touch
    // event cancels part-way. See the note in [locale]/layout.tsx.
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("data-scroll-behavior", "smooth");
  });

  const CROSS_PAGE: Array<[string, string, string]> = [
    ["/en", 'header a[href="/en/medical"]', "/en/medical"],
    ["/en", 'header a[href="/en/aesthetics"]', "/en/aesthetics"],
    ["/en/medical", 'header a[href="/en/doctors"]', "/en/doctors"],
    ["/en/aesthetics", 'footer a[href="/en/contact"]', "/en/contact"],
  ];

  for (const [from, selector, to] of CROSS_PAGE) {
    test(`${from} scrolled deep -> ${to} starts at the top`, async ({ page }) => {
      await page.goto(from);
      await scrollTo(page, 2000);
      expect(await scrollY(page)).toBeGreaterThan(0);
      await page.locator(selector).first().click();
      await expect(page).toHaveURL(new RegExp(`${to.replace(/\//g, "\\/")}$`));
      await expect.poll(() => scrollY(page), { timeout: 4000 }).toBeLessThanOrEqual(2);
    });
  }

  // Brief §85, verbatim: the explicit same-page HOME test.
  const HOME_CONTROLS: Array<[string, string]> = [
    ["navbar HOME", 'header a[href="/en"]:not([aria-label])'],
    ["the logo", 'header a[aria-label*="Home"]'],
  ];

  for (const [label, selector] of HOME_CONTROLS) {
    test(`on Home, scrolled past the statistics section, ${label} returns to the hero`, async ({ page }) => {
      await page.goto("/en");
      await scrollTo(page, 3200);
      expect(await scrollY(page)).toBeGreaterThan(1000);
      await page.locator(selector).first().click();
      await expect.poll(() => scrollY(page), { timeout: 4000 }).toBeLessThanOrEqual(2);
      // Still on Home, and the H1 is back in view.
      await expect(page).toHaveURL(/\/en$/);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeInViewport();
    });
  }

  test("Arabic: the logo returns an already-open Arabic Home to the top", async ({ page }) => {
    await page.goto("/ar");
    await scrollTo(page, 2500);
    await page.locator('header a[aria-label*="الرئيسية"]').first().click();
    await expect.poll(() => scrollY(page), { timeout: 4000 }).toBeLessThanOrEqual(2);
  });

  test("Arabic: cross-page navigation starts the destination at the top", async ({ page }) => {
    await page.goto("/ar");
    await scrollTo(page, 2000);
    await page.locator('header a[href="/ar"]').first().click({ trial: true }).catch(() => {});
    await page.locator('header nav a').filter({ hasText: "الرعاية الطبية" }).first().click();
    await expect.poll(() => scrollY(page), { timeout: 4000 }).toBeLessThanOrEqual(2);
  });

  test("the language switch lands on the Arabic equivalent page, at its top", async ({ page }) => {
    await page.goto("/en/aesthetics/treatments/rf-microneedling");
    await scrollTo(page, 1500);
    await page.locator("header").getByRole("link", { name: "العربية" }).click();
    await expect(page).toHaveURL(/\/ar\//);
    // Not dumped back on the Arabic homepage (brief §69).
    await expect(page).not.toHaveURL(/\/ar\/?$/);
    await expect.poll(() => scrollY(page), { timeout: 4000 }).toBeLessThanOrEqual(2);
  });

  test("an intentional in-page anchor is still honoured, not overridden", async ({ page }) => {
    await page.goto("/en");
    // The skip link is the site's one real in-page anchor.
    await page.evaluate(() => {
      const a = document.querySelector('header a[href="#main-content"]') as HTMLAnchorElement;
      a.click();
    });
    await page.waitForTimeout(500);
    expect(page.url()).toContain("#main-content");
  });

  test("Back still restores the previous scroll position (the fix must not break history)", async ({ page }) => {
    await page.goto("/en");
    await scrollTo(page, 2000);
    await page.locator('header a[href="/en/medical"]').first().click();
    await expect(page).toHaveURL(/\/en\/medical$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/en$/);
    await expect.poll(() => scrollY(page), { timeout: 4000 }).toBeGreaterThan(1000);
  });
});

test.describe("Mobile: destination starts at the top (brief §67)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("deep on Home -> mobile menu -> Medical starts at the top", async ({ page }) => {
    await page.goto("/en");
    await scrollTo(page, 3500);
    await page.getByRole("button", { name: "Open menu" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Medical", exact: true }).click();
    // "View all medical care" is the unambiguous route into the hub: the
    // group's own header row is also labelled "Medical", same as its
    // accordion trigger.
    await dialog.getByRole("link", { name: "View all medical care" }).click();
    await expect(page).toHaveURL(/\/en\/medical$/);
    await expect.poll(() => scrollY(page), { timeout: 4000 }).toBeLessThanOrEqual(2);
  });

  test("deep on another page -> mobile menu -> Home starts at the hero", async ({ page }) => {
    await page.goto("/en/medical");
    await scrollTo(page, 2000);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Home", exact: true }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect.poll(() => scrollY(page), { timeout: 4000 }).toBeLessThanOrEqual(2);
  });
});
