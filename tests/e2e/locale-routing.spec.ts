import { test, expect } from "@playwright/test";

test.describe("Locale routing", () => {
  test("root redirects to /en/", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en\/?$/);
  });

  test("English homepage sets lang=en and dir=ltr", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });

  test("Arabic homepage sets lang=ar and dir=rtl", async ({ page }) => {
    await page.goto("/ar");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("pretty Arabic doctor-hub URL resolves without a redirect loop", async ({ page }) => {
    const response = await page.goto("/ar/%D8%A7%D9%84%D8%A3%D8%B7%D8%A8%D8%A7%D8%A1");
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("legacy /services redirects to /en/medical", async ({ page }) => {
    await page.goto("/services");
    await expect(page).toHaveURL(/\/en\/medical\/?$/);
  });
});
