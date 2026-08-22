import { test, expect } from "@playwright/test";
import { routes } from "../../src/config/routes";
import { features } from "../../src/config/features";

/**
 * Automated SEO validators — brief §29 ("Create automated SEO validators
 * similar to, but stronger than, Dfeelings"). Covers what's checkable
 * from the route registry and rendered HTML without a full crawl.
 */

const publishedRoutes = routes.filter(
  (r) => r.inSitemap && r.indexing === "index" && (!r.requiresFeature || features[r.requiresFeature as keyof typeof features]),
);

test.describe("Route registry integrity", () => {
  test("no duplicate English paths", () => {
    const enPaths = routes.map((r) => r.path.en);
    expect(new Set(enPaths).size).toBe(enPaths.length);
  });

  test("no duplicate Arabic paths", () => {
    const arPaths = routes.map((r) => r.path.ar);
    expect(new Set(arPaths).size).toBe(arPaths.length);
  });

  test("no duplicate route ids", () => {
    const ids = routes.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every gated route is noindex and excluded from the sitemap", () => {
    for (const route of routes) {
      if (route.requiresFeature && !features[route.requiresFeature as keyof typeof features]) {
        expect(route.indexing, `${route.id} must be noindex while its feature is disabled`).toBe("noindex");
        expect(route.inSitemap, `${route.id} must be excluded from the sitemap while its feature is disabled`).toBe(false);
      }
    }
  });
});

test.describe("Sitemap", () => {
  test("contains every published route in both locales", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();
    for (const route of publishedRoutes) {
      expect(body, `sitemap missing EN path for ${route.id}`).toContain(`/en${route.path.en}`);
      expect(body, `sitemap missing AR path for ${route.id}`).toContain(`/ar${route.path.ar}`);
    }
  });

  test("does not contain any gated route", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    const body = await response.text();
    for (const route of routes) {
      if (route.requiresFeature && !features[route.requiresFeature as keyof typeof features]) {
        expect(body).not.toContain(`/en${route.path.en}`);
      }
    }
  });
});

test.describe("robots.txt", () => {
  test("references the sitemap and disallows /api/", async ({ request }) => {
    const response = await request.get("/robots.txt");
    const body = await response.text();
    expect(body).toContain("Sitemap:");
    expect(body).toContain("/api/");
  });
});

test.describe("Canonical and hreflang tags", () => {
  test("homepage: self-referencing canonical and reciprocal hreflang", async ({ page }) => {
    await page.goto("/en");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toContain("/en");

    const enAlt = await page.locator('link[rel="alternate"][hreflang="en-CA"]').getAttribute("href");
    const arAlt = await page.locator('link[rel="alternate"][hreflang="ar-CA"]').getAttribute("href");
    expect(enAlt).toContain("/en");
    expect(arAlt).toContain("/ar");
  });

  test("Arabic homepage canonicalizes to the Arabic URL, never English", async ({ page }) => {
    await page.goto("/ar");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toContain("/ar");
  });
});

test.describe("MedicalWebPage structured data", () => {
  test("medical-service page emits a MedicalWebPage schema matching its own content", async ({ page }) => {
    await page.goto("/en/medical/eye-screening");
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const medicalWebPage = scripts.map((s) => JSON.parse(s)).find((s) => s["@type"] === "MedicalWebPage");
    expect(medicalWebPage).toBeTruthy();
    expect(medicalWebPage.url).toContain("/en/medical/eye-screening");
    const h1 = await page.locator("h1").first().textContent();
    expect(medicalWebPage.name).toBe(h1?.trim());
  });

  test("aesthetic-treatment page emits a MedicalWebPage schema matching its own content", async ({ page }) => {
    await page.goto("/en/aesthetics/treatments/rf-microneedling");
    const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    const medicalWebPage = scripts.map((s) => JSON.parse(s)).find((s) => s["@type"] === "MedicalWebPage");
    expect(medicalWebPage).toBeTruthy();
    expect(medicalWebPage.url).toContain("/en/aesthetics/treatments/rf-microneedling");
    const h1 = await page.locator("h1").first().textContent();
    expect(medicalWebPage.name).toBe(h1?.trim());
  });
});

test.describe("llms.txt", () => {
  test("is served as plain text and mentions both languages", async ({ request }) => {
    const response = await request.get("/llms.txt");
    expect(response.headers()["content-type"]).toContain("text/plain");
    const body = await response.text();
    expect(body).toContain("/en");
    expect(body).toContain("/ar");
  });
});
