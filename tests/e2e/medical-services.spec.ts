import { test, expect } from "@playwright/test";

test.describe("Medical service pages", () => {
  test("hub links to a service detail page", async ({ page }) => {
    await page.goto("/en/medical");
    await page.getByRole("link", { name: "Eye Disease Screening" }).click();
    await expect(page).toHaveURL(/\/en\/medical\/eye-screening\/?$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Eye Disease Screening");
  });

  test("pretty Arabic medical-service URL resolves", async ({ page }) => {
    const response = await page.goto("/ar/%D8%A7%D9%84%D8%B1%D8%B9%D8%A7%D9%8A%D8%A9-%D8%A7%D9%84%D8%B7%D8%A8%D9%8A%D8%A9/%D9%81%D8%AD%D8%B5-%D8%A7%D9%84%D8%B9%D9%8A%D9%86");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("uninsured services page renders fee tables", async ({ page }) => {
    await page.goto("/en/medical/uninsured-services");
    await expect(page.getByRole("heading", { name: "No-Show Fees" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Forms" })).toBeVisible();
    await expect(page.getByText("$400")).toBeVisible();
  });

  test("a clinic-wide service page attributes itself to no single physician", async ({ page }) => {
    // This test used to click a "Dr. Bakare" link on /medical/minor-procedures
    // and assert it reached his profile. That link WAS the defect: minor
    // procedures are provided by all of our family physicians, and publishing
    // them as one doctor's service is what the 2026-09-06 CMS corrections
    // removed (OP-001..OP-004 and their Arabic counterparts).
    //
    // So the assertion is inverted, not deleted. The guard now protects the
    // approved rule instead of the retired one — if a single-physician
    // attribution ever comes back, this fails.
    await page.goto("/en/medical/minor-procedures");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // The rule is "no SINGLE physician", not "no physician". This service is
    // published clinic-wide (`relatedDoctorScope: "all-family-physicians"`),
    // so the page legitimately lists the whole roster — and Dr. Bakare appears
    // in it, correctly, as one of several.
    //
    // An earlier version of this test asserted zero "Dr. Bakare" anywhere. It
    // passed in hybrid mode only by accident: the CMS adapter does not carry
    // `relatedDoctorScope`, so no roster renders at all there. Against the
    // static record — which is what CI builds — the full roster renders and
    // the assertion failed on correct behaviour.
    //
    // So the guard is on the two things that actually encode the rule.
    //
    // 1. The PROSE names no physician. This is where the defect lived — the
    //    published summary read "…with Dr. Bakare additionally offering
    //    in-house minor skin lesion excision…", attributing a clinic-wide
    //    service to one man. Scoped to paragraphs and list items so the
    //    roster's own link text below is not mistaken for prose.
    //    The roster renders each physician as an <li> wrapping a link, so
    //    those items must be excluded or the roster's own link text reads as
    //    prose and the guard fires on correct behaviour.
    const prose = (
      await page
        .locator("article p, article li")
        .filter({ hasNot: page.locator('a[href*="/our-team/"]') })
        .allInnerTexts()
    ).join(" ");
    expect(prose, "the service copy must not attribute itself to one physician").not.toMatch(
      /Dr\. Bakare/,
    );

    // 2. Where physicians ARE listed, it is the whole roster, never one name.
    //    Dr. Bakare appearing as one of several is correct and must keep
    //    working; him appearing alone is the defect returning.
    const doctorLinks = page.locator('a[href*="/our-team/"]');
    const count = await doctorLinks.count();
    expect(count === 0 || count > 1, `expected a roster or none, got ${count}`).toBe(true);
  });

  test("after-hours-care page links to external PCN partners", async ({ page }) => {
    await page.goto("/en/medical/after-hours-care");
    await expect(page.getByRole("link", { name: "Mosaic Primary Care Network" })).toHaveAttribute(
      "href",
      "https://mosaicpcn.ca",
    );
  });
});
