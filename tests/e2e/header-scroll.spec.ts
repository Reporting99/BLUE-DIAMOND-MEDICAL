import { test, expect, type Page } from "@playwright/test";

/**
 * Header state + motion tests.
 *
 * REWRITTEN for the navbar-motion brief §14-§17/§86, which supersedes the
 * behaviour two of these tests used to assert:
 *
 *  - "logo moves inward after scroll" was a PASSING test for what the new
 *    brief names as the defect ("the navbar feels too far away initially
 *    and then visibly moves/approaches the content"). The header's inner
 *    row went from full-bleed to a centred 1280px container on scroll,
 *    dragging the logo ~40px at 1440px wide and ~280px at 1920px. The
 *    replacement test asserts the opposite: ZERO horizontal travel.
 *
 *  - "non-homepage header stays sticky and never changes" was the "fixed
 *    on Home only" behaviour §16 forbids. Internal pages now run the same
 *    global header motion; the replacement test asserts that, plus the
 *    absence of any layout shift, which is what `fixed` + an in-flow
 *    spacer buys us.
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
    // The booking CTA is the only external link in the header.
    const booking = header?.querySelector("a[target='_blank']");
    const logoRect = logo?.getBoundingClientRect();
    const ctaRect = booking?.getBoundingClientRect();
    return {
      logoLeft: logoRect ? logoRect.left : null,
      ctaLeft: ctaRect ? ctaRect.left : null,
      viewportWidth: window.innerWidth,
      hasBooking: Boolean(booking),
    };
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

    // Confirm it's a near-white, partially-transparent surface — not
    // fully opaque white and not the fully-transparent top state.
    // Tailwind v4 renders `bg-white/82` as an oklab()/color-mix() value
    // in newer Chromium rather than legacy rgba(), so check the alpha
    // component generically instead of matching one exact color format.
    //
    // Polled to the SETTLED value rather than read once. The poll above
    // returns on the first frame the background is no longer transparent,
    // which is the START of the background-color transition, not its end —
    // reading immediately after it samples a partway alpha (observed 0.408
    // against a 0.94 target) and fails a header that is behaving correctly.
    // The asserted range is unchanged; only when it is sampled is.
    await expect(async () => {
      const state = await getHeaderState(page);
      const alphaMatch = state!.backgroundColor.match(/([\d.]+)\)$/);
      expect(alphaMatch, state!.backgroundColor).not.toBeNull();
      const alpha = parseFloat(alphaMatch![1]);
      expect(alpha, state!.backgroundColor).toBeGreaterThan(0.5);
      expect(alpha, state!.backgroundColor).toBeLessThan(0.95);
    }).toPass({ timeout: 3000 });
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

test.describe("Header motion — nothing translates horizontally (brief §15)", () => {
  // The old defect was only visible on a viewport wider than the 1280px
  // container cap, so this suite deliberately runs wider than Playwright's
  // 1280px "Desktop Chrome" default, which sat exactly on the boundary.
  for (const width of [1440, 1728, 1920]) {
    test(`logo and booking CTA do not move horizontally on scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/en");
      await page.waitForTimeout(200);
      const atTop = await getLogoAndBookingX(page);
      await page.evaluate(() => window.scrollTo(0, 300));
      await expect.poll(async () => (await getHeaderState(page))?.height, { timeout: 5000 }).toBe(64);
      const scrolled = await getLogoAndBookingX(page);
      expect(atTop.logoLeft).not.toBeNull();
      expect(scrolled.logoLeft).not.toBeNull();
      expect(Math.abs(scrolled.logoLeft! - atTop.logoLeft!)).toBe(0);
      expect(atTop.ctaLeft).not.toBeNull();
      expect(Math.abs(scrolled.ctaLeft! - atTop.ctaLeft!)).toBe(0);
    });
  }

  test("the height change is subtle (20px) rather than a dramatic resize", async ({ page }) => {
    await page.goto("/en");
    await expect.poll(async () => (await getHeaderState(page))?.height, { timeout: 5000 }).toBe(84);
    await page.evaluate(() => window.scrollTo(0, 300));
    // Poll rather than a fixed wait: the settled height is only reached
    // after hydration + a scroll event + a 420ms CSS transition, and on a
    // loaded CI box under mobile emulation that chain has been observed to
    // take longer than a fixed 600ms sleep — which made this fail against a
    // header that was behaving correctly (verified directly at 412px).
    await expect.poll(async () => (await getHeaderState(page))?.height, { timeout: 5000 }).toBe(64);
  });
});

test.describe("Header motion is global, not homepage-only (brief §16/§86)", () => {
  const ROUTES = [
    "/en/medical",
    "/en/aesthetics",
    "/en/aesthetics/treatments/rf-microneedling",
    "/en/aesthetics/concerns/acne-scars",
    "/en/aesthetics/technologies/potenza",
    "/en/our-team",
    "/en/about",
    "/en/contact",
    "/en/patient-resources",
  ];

  for (const route of ROUTES) {
    test(`${route} runs the same rest -> scrolled transition with no layout shift`, async ({ page }) => {
      await page.goto(route);
      await expect.poll(async () => (await getHeaderState(page))?.height, { timeout: 5000 }).toBe(84);
      const atTop = await getHeaderState(page);
      // Same global positioning as the homepage — one header, one behaviour.
      expect(atTop!.position).toBe("fixed");
      // Off the homepage the resting state is opaque, not transparent:
      // there is no full-bleed hero here to float over.
      expect(atTop!.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");

      const firstHeadingBefore = await page.evaluate(
        () => document.querySelector("h1")!.getBoundingClientRect().top + window.scrollY,
      );

      await page.evaluate(() => window.scrollTo(0, 300));
      await expect.poll(async () => (await getHeaderState(page))?.height, { timeout: 5000 }).toBe(64);

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);
      const firstHeadingAfter = await page.evaluate(
        () => document.querySelector("h1")!.getBoundingClientRect().top + window.scrollY,
      );
      // The header shrinking must not move page content by a single pixel:
      // it is `fixed`, and the flow spacer keeps the resting height.
      expect(Math.abs(firstHeadingAfter - firstHeadingBefore)).toBeLessThan(2);
    });
  }

  test("no empty strip remains beneath the header on any page", async ({ page }) => {
    await page.goto("/en/medical");
    const strip = page.locator("header p", { hasText: "" }).filter({ hasText: /emergenc(y|ies)/i });
    await expect(strip).toHaveCount(0);
  });
});
