import { test, expect } from "@playwright/test";

test.describe("Contact form", () => {
  test("shows field-level errors on empty submit", async ({ page }) => {
    await page.goto("/en/contact");
    await page.getByRole("button", { name: /send message/i }).click();
    // Native required-field validation blocks submission; the browser's
    // own constraint-validation UI takes over, so the form action never
    // fires and no server error state is shown yet.
    await expect(page.locator("input[name=name]")).toHaveJSProperty("validity.valid", false);
  });

  test("valid submission reaches the not-configured fallback state", async ({ page }) => {
    await page.goto("/en/contact");
    await page.fill("input[name=name]", "Test Patient");
    await page.fill("input[name=email]", "test@example.com");
    await page.fill("textarea[name=message]", "This is a test message for the contact form.");
    await page.getByRole("button", { name: /send message/i }).click();
    // No CONTACT_DELIVERY_PROVIDER is configured in this build — see
    // src/lib/forms/delivery.ts — so the honest fallback state is
    // shown rather than a false "sent" confirmation. Next.js's own
    // route-announcer also carries role="alert", so scope to the form's copy.
    // The number is rendered from siteConfig.clinic.phoneDisplay rather than
    // hand-typed here, so it now matches the footer's copy of it too — scope
    // the assertion to the form's own alert, not to the whole page.
    await expect(page.getByRole("alert").filter({ hasText: /connected to our inbox/ })).toContainText(
      "(825) 413-1113",
    );
  });
});
