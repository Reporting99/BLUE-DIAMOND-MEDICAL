import { test, expect } from "@playwright/test";

/**
 * The crawler-facing layer of the same rule: no clinic-wide service may
 * attribute itself to one physician in its metadata, and Dr. Bakare's own
 * profile must keep his name.
 *
 * tests/contracts/clinic-wide-attribution.spec.ts asserts what this repository
 * asks the CMS to STORE. This asserts what the running site EMITS — meta
 * description, Open Graph and Twitter descriptions, and JSON-LD — which is a
 * different surface and the one a search result is actually built from.
 *
 * In static content mode these come from src/features/medical-services/data.ts,
 * which was corrected first and passes today; the value of the test is that it
 * keeps passing when FEELSTACK_CONTENT_MODE is hybrid and the CMS record wins.
 * That is the mode production runs, and it is the mode in which the stale
 * descriptions were live on 2026-09-07 while every rendered sentence on the
 * page was already correct.
 */

const NAMED_PHYSICIAN = /Dr\.?\s*Bakare|الدكتور\s*باكاري|د\.\s*باكاري/u;

/** Clinic-wide services, in both locales, by the path a visitor requests. */
const CLINIC_WIDE_PAGES = [
  "/en/medical/minor-procedures",
  "/ar/الرعاية-الطبية/الإجراءات-البسيطة",
  "/en/medical/chronic-disease-management",
  "/ar/الرعاية-الطبية/إدارة-الأمراض-المزمنة",
];

/** Where his name belongs and must survive. */
const PROFILE_PAGES = [
  { path: "/en/our-team/bakare", name: /Bakare/ },
  { path: "/ar/فريقنا/باكاري", name: /باكاري/u },
];

/** Every description-shaped thing a page publishes about itself. */
async function metadataDescriptions(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const out: { source: string; value: string }[] = [];
    const push = (source: string, value: string | null | undefined) => {
      if (value) out.push({ source, value });
    };
    for (const selector of [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
    ]) {
      document.querySelectorAll(selector).forEach((el) =>
        push(selector, el.getAttribute("content")),
      );
    }
    // Structured data carries its own descriptions, and a crawler reads them.
    document.querySelectorAll('script[type="application/ld+json"]').forEach((el, i) =>
      push(`ld+json[${i}]`, el.textContent),
    );
    return out;
  });
}

for (const path of CLINIC_WIDE_PAGES) {
  test(`clinic-wide metadata names no single physician — ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status(), `${path} did not resolve`).toBeLessThan(400);

    const entries = await metadataDescriptions(page);
    // A page with no description at all would pass vacuously, which would make
    // this test worthless the day metadata generation breaks.
    expect(
      entries.some((e) => e.source === 'meta[name="description"]'),
      `${path} emitted no meta description`,
    ).toBe(true);

    const offenders = entries
      .filter((e) => NAMED_PHYSICIAN.test(e.value))
      .map((e) => `${e.source}: ${e.value.slice(0, 200)}`);
    expect(offenders, `${path} attributes clinic-wide care to one physician`).toEqual([]);
  });
}

for (const { path, name } of PROFILE_PAGES) {
  test(`his own profile keeps his name — ${path}`, async ({ page }) => {
    // The correction must not overshoot. This is the other half of the rule,
    // and the half a careless global find-and-replace would break.
    const response = await page.goto(path);
    expect(response?.status(), `${path} did not resolve`).toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(name);
    const description = await page
      .locator('meta[name="description"]')
      .first()
      .getAttribute("content");
    expect(description, `${path} lost its description`).toBeTruthy();
  });
}
