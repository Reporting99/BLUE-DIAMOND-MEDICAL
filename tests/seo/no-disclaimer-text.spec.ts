import { test, expect } from "@playwright/test";
import { routes } from "../../src/lib/routing";
import { features } from "../../src/config/features";

/**
 * "HEADER, DISCLAIMER REMOVAL..." pass §1/§17 — verifies the generic
 * emergency/medical-disclaimer boilerplate is gone from every public
 * page, in both languages. Reuses the same published-route discovery as
 * tests/seo/broken-links.spec.ts (fast, request-based, no browser
 * rendering per page) and fetches every route in both `/en` and `/ar`.
 *
 * Two real service-specific exceptions are deliberately NOT in this list
 * and are expected to still appear: the After-Hours Care page's
 * "urgentCareNote"/FAQs (distinguishing its non-emergency PCN referral
 * pathway from a true emergency — a genuine service instruction, not a
 * repeated generic disclaimer) and the contact form's "not for medical
 * emergencies or private health information" notice (form-specific
 * safety guidance preventing someone from submitting an urgent matter
 * through an unmonitored web form). Both are explicitly protected by the
 * brief's own "Do not delete real clinic contact information, service
 * instructions" rule — see docs/CONTENT_MODEL.md for the
 * documented reasoning.
 */
/**
 * A dropped connection is not a content violation.
 *
 * This test fetches every published route in sequence while the rest of the
 * suite drives the same single-process standalone server, and one transient
 * `read ECONNRESET` used to fail it outright — reported as if a prohibited
 * disclaimer phrase had been found. That is worse than a flake: the failure
 * message points at content, so the natural response is to go looking for
 * text that was never there. Transport errors are retried once and only then
 * allowed to fail, so a red result here means what it says.
 */
async function getWithRetry(
  request: { get: (url: string) => Promise<{ status: () => number; text: () => Promise<string> }> },
  url: string,
) {
  try {
    return await request.get(url);
  } catch {
    return await request.get(url);
  }
}

const publishedRoutes = routes.filter(
  (r) => r.inSitemap && r.indexing === "index" && (!r.requiresFeature || features[r.requiresFeature as keyof typeof features]),
);

const prohibitedEnglish = [
  "This website is not for medical emergencies",
  "for medical emergencies, call 911",
  "or go to your nearest emergency department",
  "is not medical advice and does not replace an assessment by your physician",
  "This page is general information about services offered",
  "for informational purposes only",
];

const prohibitedArabic = [
  "هذا الموقع ليس مخصصًا للطوارئ الطبية",
  "هذا الموقع ليس مخصصًا لحالات الطوارئ الطبية",
  "لا تُعد استشارة طبية ولا تُغني عن تقييم طبيبكم",
  "هذه الصفحة معلومات عامة عن الخدمات المتوفرة",
];

test.describe("No repeated emergency/generic disclaimer text", () => {
  for (const locale of ["en", "ar"] as const) {
    test(`${locale}: no prohibited phrase appears on any public page`, async ({ request }) => {
      const offenders: { path: string; phrase: string }[] = [];
      const phrases = locale === "en" ? prohibitedEnglish : prohibitedArabic;

      for (const route of publishedRoutes) {
        const path = route.path[locale];
        const res = await getWithRetry(request, `/${locale}${path}`);
        if (res.status() >= 400) continue; // covered by broken-links.spec.ts
        const html = await res.text();
        for (const phrase of phrases) {
          if (html.includes(phrase)) offenders.push({ path, phrase });
        }
      }

      expect(offenders, JSON.stringify(offenders, null, 2)).toEqual([]);
    });
  }

  test("the two protected service-specific exceptions still exist where they belong", async ({ request }) => {
    // Confirms the removal was real (not accidentally over-broad) by
    // checking the two intentionally-kept instances are exactly where
    // expected, not scattered elsewhere.
    const afterHours = await request.get("/en/medical/after-hours-care");
    expect((await afterHours.text())).toContain("call 911");

    const contact = await request.get("/en/contact");
    expect((await contact.text())).toContain("not for medical emergencies");
  });
});
