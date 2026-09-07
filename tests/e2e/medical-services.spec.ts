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
    await expect(page.getByRole("link", { name: /Dr\. Bakare/ })).toHaveCount(0);
    await expect(page.getByText(/Dr\. Bakare/)).toHaveCount(0);
  });

  test("after-hours-care page links to external PCN partners", async ({ page }) => {
    await page.goto("/en/medical/after-hours-care");
    await expect(page.getByRole("link", { name: "Mosaic Primary Care Network" })).toHaveAttribute(
      "href",
      "https://mosaicpcn.ca",
    );
  });
});
