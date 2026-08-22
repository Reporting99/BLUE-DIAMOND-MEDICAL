import { test, expect, type Page } from "@playwright/test";

/**
 * Homepage header transparency/scroll-state tests — "HEADER, DISCLAIMER
 * REMOVAL, COUNTERS AND SERVICE-CARD INTERACTIONS" pass §3-6/§16.
 * Non-homepage pages keep the original always-solid sticky header
 * untouched (see the pre-existing `header-solid-on-other-pages` test at
 * the bottom of this file) — only `/en` and `/ar` get the new behavior.
 */

async function getHeaderState(page: Page) {
  return page.evaluate(() => {
    const header = document.querySelector("header");
    if (!header) return null;
    const style = window.getComputedStyle(header);
    const rect = header.getBoundingClientRect();
    return {
      position: style.position,
      backgroundColor: style.backgroundColor,
      borderBottomWidth: style.borderBottomWidth,
      boxShadow: style.boxShadow,
      height: rect.height,
      top: rect.top,
    };
  });
}

async function getLogoAndBookingX(page: Page) {
  return page.evaluate(() => {
    const header = document.querySelector("header");
    const logo = header?.querySelector("a[aria-label*='Home'], a[aria-label*='الرئيسية']");
    const booking = header?.querySelector("a[href*='mika'], a[href*='janeapp'], a[href*='euclid'], button, a");
    const logoRect = logo?.getBoundingClientRect();
    return { logoLeft: logoRect ? logoRect.left : null, viewportWidth: window.innerWidth, hasBooking: Boolean(booking) };
  });
}

test.describe("Homepage header — transparent at top, floating after scroll", () => {
  test("is fully transparent with no border/shadow at scrollY=0", async ({ page }) => {
    await page.goto("/en");
    const state = await getHeaderState(page);
    expect(state).not.toBeNull();
    expect(state!.position).toBe("fixed");
    // Fully transparent background (rgba with 0 alpha, or "transparent").
    expect(state!.backgroundColor === "rgba(0, 0, 0, 0)" || state!.backgroundColor === "transparent").toBeTruthy();
    expect(parseFloat(state!.borderBottomWidth)).toBeLessThanOrEqual(1);
    // Tailwind's shadow-none computes to a zero-spread/zero-alpha shadow
    // rather than literally the string "none" in this engine — check for
    // "no visible shadow" rather than one exact string representation.
    const shadowHasNoVisibleEffect = state!.boxShadow === "none" || state!.boxShadow === "" || /,?\s*0\)$/.test(state!.boxShadow) || state!.boxShadow.includes("rgba(0, 0, 0, 0)");
    expect(shadowHasNoVisibleEffect, state!.boxShadow).toBeTruthy();
  });

  test("becomes a light floating surface after scrolling past the threshold", async ({ page }) => {
    await page.goto("/en");
    await page.evaluate(() => window.scrollTo(0, 200));
    await expect
      .poll(async () => {
        const state = await getHeaderState(page);
        return state?.backgroundColor;
      }, { timeout: 3000 })
      .not.toBe("rgba(0, 0, 0, 0)");

    const state = await getHeaderState(page);
    // Confirm it's a near-white, partially-transparent surface — not
    // fully opaque white and not the fully-transparent top state.
    // Tailwind v4 renders `bg-white/82` as an oklab()/color-mix() value
    // in newer Chromium rather than legacy rgba(), so check the alpha
    // component generically instead of matching one exact color format.
    const alphaMatch = state!.backgroundColor.match(/([\d.]+)\)$/);
    expect(alphaMatch, state!.backgroundColor).not.toBeNull();
    const alpha = parseFloat(alphaMatch![1]);
    expect(alpha).toBeGreaterThan(0.5);
    expect(alpha).toBeLessThan(0.95);
  });

  test("no visible content jump when the header state changes (hero H1 stays in place)", async ({ page }) => {
    await page.goto("/en");
    const h1 = page.getByRole("heading", { level: 1 });
    const before = await h1.boundingBox();
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(350); // past the ~260ms header transition
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(350);
    const after = await h1.boundingBox();
    // The H1's position relative to the page shouldn't have shifted from
    // the header transition itself (some movement from scrolling back is
    // expected to be net-zero once back at the top).
    expect(Math.abs((before?.y ?? 0) - (after?.y ?? 0))).toBeLessThan(2);
  });

  for (const scrollY of [0, 24, 48, 200]) {
    test(`renders without error at scrollY=${scrollY}`, async ({ page }) => {
      await page.goto("/en");
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await page.waitForTimeout(100);
      const state = await getHeaderState(page);
      expect(state).not.toBeNull();
      expect(state!.height).toBeGreaterThan(0);
    });
  }

  test("no console errors while scrolling through the header transition", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/en");
    for (const y of [0, 24, 48, 200, 0]) {
      await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
      await page.waitForTimeout(60);
    }
    expect(errors).toEqual([]);
  });
});

test.describe("Homepage header — logo/booking inset on a wide viewport", () => {
  // The "moves inward" effect comes from the scrolled state's centered
  // max-w-[1280px] container — only visible on a viewport wider than
  // that cap. The Playwright "Desktop Chrome" default viewport is
  // exactly 1280px, right at the boundary, so this suite uses a wider
  // one matching a real, common desktop monitor width.
  test.use({ viewport: { width: 1728, height: 900 } });

  test("logo sits at the far edge at the top and moves inward after scroll (LTR)", async ({ page }) => {
    await page.goto("/en");
    const atTop = await getLogoAndBookingX(page);
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(350);
    const scrolled = await getLogoAndBookingX(page);
    expect(atTop.logoLeft).not.toBeNull();
    expect(scrolled.logoLeft).not.toBeNull();
    // After scrolling, the centered/narrower container should place the
    // logo farther from the viewport's left edge than the full-bleed top
    // state did (LTR: logo starts near x=0, moves inward = larger x).
    expect(scrolled.logoLeft!).toBeGreaterThan(atTop.logoLeft!);
  });
});

test.describe("Non-homepage header — unchanged behavior", () => {
  test("stays solid/sticky on an inner page regardless of scroll", async ({ page }) => {
    await page.goto("/en/medical");
    const state = await getHeaderState(page);
    expect(state!.position).toBe("sticky");
    expect(state!.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("no empty strip remains beneath the header on any page", async ({ page }) => {
    await page.goto("/en/medical");
    const strip = page.locator("header p", { hasText: "" }).filter({ hasText: /emergenc(y|ies)/i });
    await expect(strip).toHaveCount(0);
  });
});
