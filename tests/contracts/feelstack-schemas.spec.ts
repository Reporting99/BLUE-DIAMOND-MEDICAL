import { test, expect } from "@playwright/test";
import {
  feelstackResolveResponseSchema,
  feelstackRoutesResponseSchema,
  cmsMedicalServiceSchema,
  feelstackWebhookBodySchema,
  type CmsDoctor,
  type CmsMedicalService,
  type CmsAestheticTreatment,
  type CmsAestheticConcern,
  type CmsTechnology,
  type CmsProduct,
  type CmsHealthHubArticle,
  type CmsLegalPage,
} from "../../src/lib/feelstack/schemas";
import type { Doctor } from "../../src/features/doctors";
import type { MedicalServiceContent } from "../../src/types/medical-service";
import type { AestheticTreatment, AestheticConcern, Technology } from "../../src/types/aesthetics";
import type { Product } from "../../src/types/product";
import type { HealthHubArticle } from "../../src/types/article";
import type { LegalPageContent } from "../../src/types/legal";

/**
 * FeelStack contract tests — brief §18 "FeelStack contracts": valid page
 * response, valid route response, malformed JSON, missing required
 * fields, invalid block type (n/a — no generic block model, see
 * docs/DFEELINGS_TO_BLUE_ARCHITECTURE_MAP.md §3), invalid locale.
 */
test.describe("FeelStack schemas", () => {
  test("accepts a valid resolve response", () => {
    const parsed = feelstackResolveResponseSchema.safeParse({
      path: "/medical/eye-screening",
      locale: "en",
      status: "published",
      title: "Eye Screening",
    });
    expect(parsed.success).toBe(true);
  });

  test("rejects an invalid locale", () => {
    const parsed = feelstackResolveResponseSchema.safeParse({
      path: "/medical/eye-screening",
      locale: "fr",
      status: "published",
    });
    expect(parsed.success).toBe(false);
  });

  test("rejects a response missing required fields", () => {
    const parsed = feelstackResolveResponseSchema.safeParse({ locale: "en", status: "published" });
    expect(parsed.success).toBe(false);
  });

  test("rejects an unexpected status enum value (invalid block/content-status type)", () => {
    const parsed = feelstackResolveResponseSchema.safeParse({
      path: "/medical/eye-screening",
      locale: "en",
      status: "archived", // not one of draft|published|disabled
    });
    expect(parsed.success).toBe(false);
  });

  test("accepts a valid routes response", () => {
    const parsed = feelstackRoutesResponseSchema.safeParse({
      routes: [{ path: "/medical/eye-screening", status: "published" }],
    });
    expect(parsed.success).toBe(true);
  });

  test("rejects malformed JSON shape for routes (not an object)", () => {
    const parsed = feelstackRoutesResponseSchema.safeParse(["not", "an", "object"]);
    expect(parsed.success).toBe(false);
  });

  test("cmsMedicalServiceSchema accepts a valid, complete entity and strips CMS-only fields", () => {
    const parsed = cmsMedicalServiceSchema.safeParse({
      id: "eye-screening",
      slug: "eye-screening",
      slugAr: "فحص-العين",
      title: { en: "Eye Screening", ar: "فحص العين" },
      summary: { en: "Summary", ar: "ملخص" },
      relatedDoctorIds: ["doctor-farhat"],
      bookingChannel: "eye-screening",
      status: "published",
      updatedAt: "2026-08-01T00:00:00Z",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty("status");
      expect(parsed.data).not.toHaveProperty("updatedAt");
      expect(parsed.data.sourceVerified).toBe(true);
    }
  });

  test("cmsMedicalServiceSchema rejects an invalid bookingChannel", () => {
    const parsed = cmsMedicalServiceSchema.safeParse({
      id: "eye-screening",
      slug: "eye-screening",
      slugAr: "فحص-العين",
      title: { en: "Eye Screening", ar: "فحص العين" },
      summary: { en: "Summary", ar: "ملخص" },
      relatedDoctorIds: [],
      bookingChannel: "not-a-real-channel",
      status: "published",
    });
    expect(parsed.success).toBe(false);
  });

  test("webhook body schema accepts the legacy {path} shape", () => {
    const parsed = feelstackWebhookBodySchema.safeParse({ path: "/en/medical/eye-screening" });
    expect(parsed.success).toBe(true);
  });

  test("webhook body schema accepts the structured {event, siteKey} shape", () => {
    const parsed = feelstackWebhookBodySchema.safeParse({
      event: "medical-service.updated",
      siteKey: "blue-diamond-medical",
      locale: "en",
      entityId: "eye-screening",
    });
    expect(parsed.success).toBe(true);
  });

  test("webhook body schema rejects an unsupported event name", () => {
    const parsed = feelstackWebhookBodySchema.safeParse({
      event: "totally-made-up-event",
      siteKey: "blue-diamond-medical",
    });
    expect(parsed.success).toBe(false);
  });

  test("webhook body schema rejects an unrecognized shape entirely", () => {
    const parsed = feelstackWebhookBodySchema.safeParse({ foo: "bar" });
    expect(parsed.success).toBe(false);
  });
});

/**
 * Compile-time contract: every CMS entity schema must `.transform()` into
 * EXACTLY the local domain type its route falls back to.
 *
 * This is the property `resolvePageContent` depends on — it takes one type
 * parameter `T` shared by the CMS branch and the `src/content/*.ts`
 * `staticFallback`, so if a schema drifts from its domain type, hybrid mode
 * stops type-checking at the call site. Asserting it here names the invariant
 * explicitly instead of leaving it as an incidental consequence, and makes a
 * drift fail in this file (with a clear message) rather than in seven pages.
 *
 * `tsc --noEmit` is the actual assertion; the runtime test body only exists so
 * the file is exercised by the suite. It caught a real defect when written:
 * cmsDoctorSchema used the site-wide bookingChannel enum, which is wider than
 * `Doctor["bookingChannel"]`, and would have let the CMS return "walk-in" for
 * a named physician.
 */
/**
 * One-directional on purpose: the CMS result must be USABLE AS the domain type.
 * Exact equality would be wrong — several schemas legitimately narrow a field
 * (e.g. `sourceVerified: true` where the domain type says `boolean`, because a
 * record only reaches "published" in FeelStack through the same editorial
 * approval the local content traces to). Narrowing is safe; widening is the
 * bug this guards against.
 */
type AssertAssignable<Cms, Domain> = [Cms] extends [Domain] ? true : never;

const _doctorMatches: AssertAssignable<CmsDoctor, Doctor> = true;
const _serviceMatches: AssertAssignable<CmsMedicalService, MedicalServiceContent> = true;
const _treatmentMatches: AssertAssignable<CmsAestheticTreatment, AestheticTreatment> = true;
const _concernMatches: AssertAssignable<CmsAestheticConcern, AestheticConcern> = true;
const _technologyMatches: AssertAssignable<CmsTechnology, Technology> = true;
const _productMatches: AssertAssignable<CmsProduct, Product> = true;
const _articleMatches: AssertAssignable<CmsHealthHubArticle, HealthHubArticle> = true;
const _legalMatches: AssertAssignable<CmsLegalPage, LegalPageContent> = true;

test.describe("CMS schema <-> domain type parity", () => {
  test("every entity schema transforms into its local domain type", () => {
    expect([
      _doctorMatches,
      _serviceMatches,
      _treatmentMatches,
      _concernMatches,
      _technologyMatches,
      _productMatches,
      _articleMatches,
      _legalMatches,
    ]).toEqual([true, true, true, true, true, true, true, true]);
  });
});
