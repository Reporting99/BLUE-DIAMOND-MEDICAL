import { test, expect } from "@playwright/test";

/**
 * "Care for every stage of life" service-card interaction tests —
 * §7-10/§16 (desktop hover-card, keyboard focus-card, mobile
 * service-card tests). One representative card (Eye Disease Screening)
 * is used throughout since all cards share the same `ServiceCard`
 * component.
 */

test.describe("Desktop service cards — hover/focus reveal", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("default state shows image, title, and short summary", async ({ page }) => {
    await page.goto("/en");
    const card = page.locator("a", { has: page.getByRole("heading", { name: "Eye Disease Screening", level: 3 }) }).first();
    await expect(card).toBeVisible();
    // FacetTile placeholder (no ImageKit credentials yet) renders as an
    // <svg role="img">; a real upload would render an <img> instead —
    // either way, the image slot must be present.
    await expect(card.locator("svg[role='img'], img")).toHaveCount(1);
    await expect(card).toContainText("Eye Disease Screening");
  });

  test("the longer explanation exists in the DOM before any interaction (never display:none-only, SEO-visible)", async ({ page }) => {
    await page.goto("/en");
    const card = page.locator("a", { has: page.getByRole("heading", { name: "Eye Disease Screening", level: 3 }) }).first();
    const explanationText = await card.evaluate((el) => el.textContent);
    // whoItsFor text for eye-screening
    expect(explanationText).toContain("diabetic");
  });

  // The explanation panel is `opacity: 0`, not `display: none`, at rest —
  // deliberately, so it's always exposed to the accessibility tree (a
  // screen-reader user shouldn't need to hover to have this content
  // available). That also means Playwright's `toBeVisible()` treats it as
  // visible even at opacity 0 (it only checks display/visibility/size,
  // not opacity) — so these tests check the actual computed opacity
  // instead, which is what genuinely distinguishes "revealed" from "not."
  async function getCtaOpacity(page: import("@playwright/test").Page) {
    return page.evaluate(() => {
      const heading = [...document.querySelectorAll("h3")].find((h) => h.textContent === "Eye Disease Screening");
      const card = heading?.closest("a");
      const cta = [...(card?.querySelectorAll("span") ?? [])].find((s) => s.textContent?.includes("Explore Eye Screening"));
      return cta ? parseFloat(window.getComputedStyle(cta.parentElement!).opacity) : null;
    });
  }

  // The two reveal tests below assert THAT the CTA appears, not how fast. The
  // transition is ~400ms (see the layout-shift test's 450ms wait), and a 1s
  // poll was comfortable on an idle machine and lost on a loaded one -- it
  // flaked once in a full-suite run that took 16.7 minutes under contention.
  // Widened rather than removed: a reveal that never happens still fails.
  test("hover reveals the longer explanation and a descriptive CTA, image fades out", async ({ page, isMobile }) => {
    // Playwright's synthetic .hover() doesn't reliably produce a genuine
    // CSS :hover match on a touch-emulated device — and per the brief's
    // own "do not require hover on mobile" rule, mobile never needs it:
    // the short summary is already always visible there (tested
    // separately below). Keyboard focus (tested next) works identically
    // on both.
    test.skip(isMobile, "hover is not a meaningful interaction on touch-emulated devices");
    await page.goto("/en");
    expect(await getCtaOpacity(page)).toBe(0);
    const card = page.locator("a", { has: page.getByRole("heading", { name: "Eye Disease Screening", level: 3 }) }).first();
    await card.hover();
    await expect.poll(() => getCtaOpacity(page), { timeout: 5000 }).toBe(1);
  });

  test("keyboard focus produces the same reveal as hover", async ({ page }) => {
    await page.goto("/en");
    expect(await getCtaOpacity(page)).toBe(0);
    const card = page.locator("a", { has: page.getByRole("heading", { name: "Eye Disease Screening", level: 3 }) }).first();
    await card.focus();
    await expect.poll(() => getCtaOpacity(page), { timeout: 5000 }).toBe(1);
  });

  test("card dimensions stay fixed on hover (no layout shift to neighbors)", async ({ page }) => {
    await page.goto("/en");
    const card = page.locator("a", { has: page.getByRole("heading", { name: "Eye Disease Screening", level: 3 }) }).first();
    const before = await card.boundingBox();
    await card.hover();
    await page.waitForTimeout(450);
    const after = await card.boundingBox();
    expect(after!.width).toBeCloseTo(before!.width, 0);
    expect(after!.height).toBeCloseTo(before!.height, 0);
  });

  test("card link has a descriptive accessible name, not a bare icon", async ({ page }) => {
    await page.goto("/en");
    const link = page.locator("a", { hasText: "Eye Disease Screening" }).first();
    const accessibleName = await link.evaluate((el) => el.textContent?.trim());
    expect(accessibleName!.length).toBeGreaterThan(10);
  });
});

test.describe("Mobile service cards — descriptions always visible, no hover required", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("short summary is visible without any interaction", async ({ page }) => {
    await page.goto("/en");
    const card = page.locator("a", { has: page.getByRole("heading", { name: "Eye Disease Screening", level: 3 }) }).first();
    await card.scrollIntoViewIfNeeded();
    // The short summary text (Euclid Telehealth wording) should already
    // be visible — mobile never gates it behind hover/tap.
    await expect(card).toContainText("Euclid Telehealth");
  });

  test("the whole card is a single tappable link to the real service page", async ({ page }) => {
    await page.goto("/en");
    const card = page.locator("a", { has: page.getByRole("heading", { name: "Eye Disease Screening", level: 3 }) }).first();
    await expect(card).toHaveAttribute("href", /\/en\/medical\/eye-screening/);
  });

  test("no horizontal overflow from the card grid on a narrow viewport", async ({ page }) => {
    await page.goto("/en");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    expect(overflow).toBe(false);
  });
});

test.describe("Service cards — real destinations only", () => {
  test("every card links to a real, non-gated medical-service page", async ({ page, request }) => {
    await page.goto("/en");
    const hrefs = await page.locator("main section a[href*='/en/medical/']").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    const cardHrefs = [...new Set(hrefs)].filter((h): h is string => Boolean(h) && h !== "/en/medical");
    expect(cardHrefs.length).toBeGreaterThanOrEqual(7);
    for (const href of cardHrefs) {
      const res = await request.get(href);
      expect(res.status(), href).toBeLessThan(400);
    }
  });
});
