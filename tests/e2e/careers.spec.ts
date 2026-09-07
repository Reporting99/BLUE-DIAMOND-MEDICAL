import { test, expect } from "@playwright/test";
import { siteConfig } from "../../src/config/site";

/**
 * The Careers ("Join Our Team") page.
 *
 * Runs under both Playwright projects (chromium-desktop and chromium-mobile),
 * so every assertion below is also the mobile-layout assertion.
 *
 * The load-bearing test in this file is "offers no résumé upload": this build
 * has no configured delivery provider and no private document store (see
 * src/lib/forms/delivery.ts and the header comment on the page itself), so the
 * page deliberately applies by email. If someone later adds an upload control
 * without also adding a private backend, that test fails — which is the point.
 */

const CAREERS_EMAIL = siteConfig.careersEmail;
const MAILTO = `mailto:${CAREERS_EMAIL}`;

test.describe("Careers page", () => {
  test("route responds 200", async ({ request }) => {
    const res = await request.get("/en/careers");
    expect(res.status()).toBe(200);
  });

  test("carries the approved title and description", async ({ page }) => {
    await page.goto("/en/careers");
    await expect(page).toHaveTitle("Careers at Blue Diamond Medical | Join Our Team");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "Join Blue Diamond Medical in Calgary. We welcome qualified medical professionals committed to exceptional patient care and personal well-being.",
    );
  });

  test("has exactly one H1, carrying the approved headline", async ({ page }) => {
    await page.goto("/en/careers");
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText("Build a Meaningful Career in Patient-Centred Care");
  });

  test("headings descend without skipping a level", async ({ page }) => {
    await page.goto("/en/careers");
    const levels = await page
      .locator("main h1, main h2, main h3, main h4, main h5, main h6")
      .evaluateAll((els) => els.map((el) => Number(el.tagName.slice(1))));
    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect(levels[i] - levels[i - 1], `heading ${i} jumps from h${levels[i - 1]} to h${levels[i]}`).toBeLessThanOrEqual(1);
    }
  });

  test("shows the approved recruitment copy", async ({ page }) => {
    await page.goto("/en/careers");
    await expect(page.getByText(/Blue Diamond Medical welcomes qualified medical professionals/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Join Our Team", level: 2 })).toBeVisible();
    await expect(page.getByText(/committed to providing exemplary patient care without sacrificing your well-being/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Submit Your Application", level: 2 })).toBeVisible();
    await expect(page.getByText(/used only to review and respond to your employment application/)).toBeVisible();
  });

  test("invents no vacancy, salary, or employment terms", async ({ page }) => {
    await page.goto("/en/careers");
    const body = (await page.locator("main").innerText()).toLowerCase();
    for (const forbidden of ["salary", "per hour", "full-time", "part-time", "benefits package", "apply by", "deadline", "sponsorship"]) {
      expect(body, `page must not claim "${forbidden}" — no such information was supplied`).not.toContain(forbidden);
    }
    // JobPosting requires a real vacancy with employment type and dates; none
    // was supplied, so the page must not emit one.
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(jsonLd.join(" ")).not.toContain("JobPosting");
  });

  test("applies by email, with a working mailto and no upload control", async ({ page }) => {
    await page.goto("/en/careers");

    const mailtoLinks = page.locator(`a[href="${MAILTO}"]`);
    await expect(mailtoLinks.first()).toBeVisible();
    // The address is readable text as well as a link, for a visitor with no
    // mail client wired up.
    await expect(page.getByText(CAREERS_EMAIL).first()).toBeVisible();

    // EMAIL_ONLY mode: no upload, and no form that could imply one.
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
    await expect(page.locator("main form")).toHaveCount(0);
  });

  test("the email action is reachable and focusable by keyboard", async ({ page }) => {
    await page.goto("/en/careers");
    const link = page.locator(`a[href="${MAILTO}"]`).first();
    await link.focus();
    await expect(link).toBeFocused();
  });

  test("is linked from the site footer", async ({ page }) => {
    await page.goto("/en");
    const footerLink = page.locator('footer a[href="/en/careers"]');
    await expect(footerLink).toHaveCount(1);
    await expect(footerLink).toBeVisible();
  });

  test("the Arabic route still serves its own approved Arabic, not English", async ({ page }) => {
    await page.goto("/ar/الوظائف");
    await expect(page.locator("h1")).toHaveCount(1);
    // No Arabic translation of the new English sections was supplied, so the
    // page must omit them rather than publish English copy under /ar.
    const body = await page.locator("main").innerText();
    expect(body).not.toContain("Build a Meaningful Career");
    expect(body).not.toContain("Submit Your Application");
    await expect(page.locator(`a[href="${MAILTO}"]`).first()).toBeVisible();
  });
});
