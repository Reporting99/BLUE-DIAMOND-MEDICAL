import { test, expect } from "@playwright/test";

/**
 * "COMPLETE SKINMEDICA NAVIGATION AND PRODUCT-DETAIL FLOW" §6/§8 — the
 * Contact page's product-preselection query param, validated server-side
 * against the real product registry (never trusting the URL directly).
 */

test.describe("Valid product query param", () => {
  test("shows the selected product's name, image, availability notice, and prefills the message", async ({ page }) => {
    await page.goto("/en/contact?product=retinol-complex-0-5");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ask About Retinol Complex 0.5");
    await expect(page.getByText("Retinol Complex 0.5", { exact: true })).toBeVisible();
    await expect(page.getByText(/enquiry concerns product availability/i)).toBeVisible();
    const message = page.locator("textarea#message");
    await expect(message).toHaveValue(/Retinol Complex 0\.5/);
  });

  test("does not imply an order, delivery, or online payment", async ({ page }) => {
    await page.goto("/en/contact?product=retinol-complex-0-5");
    const bodyText = await page.locator("main").innerText();
    for (const forbidden of ["order has been placed", "delivery", "payment"]) {
      expect(bodyText.toLowerCase()).not.toContain(forbidden.toLowerCase());
    }
  });

  test("does not collect medical information — only name, email, phone, message", async ({ page }) => {
    await page.goto("/en/contact?product=retinol-complex-0-5");
    const inputNames = await page.locator("form input, form textarea").evaluateAll((els) => els.map((e) => (e as HTMLInputElement).name));
    // React's useActionState wires the server action via its own hidden
    // $ACTION_* inputs (form serialization plumbing, not user-facing and
    // never collects anything from the visitor) — filtered out to check
    // only the real, named fields a person can actually fill in.
    const realFieldNames = inputNames.filter((name) => !name.startsWith("$"));
    expect(realFieldNames.sort()).toEqual(["companyWebsite", "email", "message", "name", "phone"].sort());
  });

  test("Arabic product enquiry page is fully translated", async ({ page }) => {
    await page.goto("/ar/تواصل-معنا?product=retinol-complex-0-5");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("استفسري عن مركب الريتينول 0.5");
  });
});

test.describe("Invalid product query param", () => {
  test("an unknown product slug is ignored safely — generic contact page, no error", async ({ page }) => {
    const response = await page.goto("/en/contact?product=this-does-not-exist");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Contact Us");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/error|exception|stack/i);
  });

  test("an injection attempt in the query param is neutralized, not reflected", async ({ page }) => {
    const response = await page.goto('/en/contact?product=%3Cscript%3Ealert(1)%3C%2Fscript%3E');
    expect(response?.status()).toBe(200);
    const html = await page.content();
    expect(html).not.toContain("<script>alert(1)</script>");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Contact Us");
  });

  test("a malformed/arbitrary product value never creates a dynamic page for it", async ({ request }) => {
    // Confirms this is a query param on the one real /contact page, not a
    // dynamic route matching arbitrary slugs.
    const res = await request.get("/en/contact?product=totally-arbitrary-value-12345");
    expect(res.status()).toBe(200);
    const finalUrl = res.url();
    expect(finalUrl).toContain("/en/contact");
  });
});

test.describe("SkinMedica topic (no specific product)", () => {
  test("shows the generic SkinMedica enquiry framing, not a specific product", async ({ page }) => {
    await page.goto("/en/contact?topic=skinmedica");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ask About SkinMedica");
    await expect(page.getByText(/enquiry concerns product availability/i)).toBeVisible();
  });
});

test.describe("Contact form itself is unchanged for a plain visit", () => {
  test("no product context appears without the query param", async ({ page }) => {
    await page.goto("/en/contact");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Contact Us");
    await expect(page.getByText(/enquiry concerns product availability/i)).toHaveCount(0);
  });
});
