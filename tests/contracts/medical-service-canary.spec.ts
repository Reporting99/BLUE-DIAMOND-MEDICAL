import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { feelstackResolveEnvelopeSchema, entityPayload } from "../../src/lib/feelstack/transport";
import { checkLocaleIntegrity } from "../../src/lib/feelstack/locale-integrity";
import { toAdapterInput } from "../../src/lib/feelstack/adapters";
import { medicalServiceCmsContract, medicalServiceFieldsSchema } from "../../src/features/medical-services/cms-contract";
import { medicalServices } from "../../src/features/medical-services/data";

/**
 * Medical service canary — After-Hours Care.
 *
 * Fixtures are the verbatim live responses for this record. Chosen as the
 * canary because it is the only service exercising BOTH doctor relations and
 * external partners — the two contract surfaces the doctor migration never
 * touched. Text-only fields were already proven low-risk there.
 */
const fixture = (locale: "en" | "ar") =>
  JSON.parse(
    readFileSync(
      path.join(process.cwd(), "tests", "fixtures", "feelstack", `medical-service-resolve-${locale}.json`),
      "utf8",
    ),
  );

const staticService = medicalServices.find((s) => s.id === "after-hours-care")!;

const adapt = (locale: "en" | "ar") => {
  const env = feelstackResolveEnvelopeSchema.parse(fixture(locale));
  const fields = medicalServiceFieldsSchema.parse(entityPayload(env));
  return medicalServiceCmsContract.adapt(toAdapterInput(env, locale, fields));
};

test.describe("medical service canary — live envelope", () => {
  for (const locale of ["en", "ar"] as const) {
    test(`${locale}: valid envelope, own locale, no fallback`, () => {
      const env = feelstackResolveEnvelopeSchema.parse(fixture(locale));
      expect(env.type).toBe("content_entry");
      expect(env.route.usedFallback).toBe(false);
      expect(env.route.requestedLocale).toBe(locale);
      expect(env.route.resolvedLocale).toBe(locale);
      expect(env.route.locale).toBe(locale);
      expect(checkLocaleIntegrity(env, locale).ok).toBe(true);
    });

    test(`${locale}: content_entry values live under data.fields`, () => {
      const env = feelstackResolveEnvelopeSchema.parse(fixture(locale));
      // The opposite of person_profile — proving the two families genuinely
      // differ and the doctor contract could not have been reused.
      expect(env.data.fields).toBeDefined();
      expect(entityPayload(env)).toHaveProperty("service_id");
    });
  }

  test("both locales share one translationGroupId", () => {
    const en = feelstackResolveEnvelopeSchema.parse(fixture("en"));
    const ar = feelstackResolveEnvelopeSchema.parse(fixture("ar"));
    expect(en.data.translationGroupId).toBeTruthy();
    expect(en.data.translationGroupId).toBe(ar.data.translationGroupId);
  });

  test("first-class FAQs and doctor relations both resolve", () => {
    const env = feelstackResolveEnvelopeSchema.parse(fixture("en"));
    expect(env.relations?.faqs.length).toBe(staticService.faqs!.length);

    // Relation ROWS are the CMS-side graph; the frontend routes doctors by the
    // typed `related_doctor_ids` field instead — see the long comment in
    // src/features/medical-services/cms-contract.ts explaining why the two
    // representations serve different consumers.
    //
    // This used to assert `items.length === staticService.relatedDoctorIds.length`.
    // That coupling broke on 2026-09-06 for a legitimate reason: after-hours
    // care is published clinic-wide (`relatedDoctorScope:
    // "all-family-physicians"`, so `relatedDoctorIds` is empty by design), and
    // the CMS relation rows naming two physicians cannot be removed — the
    // structured-content API exposes no DELETE for content relations, only for
    // faq-assignments. Keeping the old assertion would have made an
    // unremovable CMS artifact look like an application defect.
    //
    // So: the rows must still be well-formed, and the field the frontend
    // ACTUALLY consumes must match the approved record exactly.
    expect(env.relations?.items.every((r) => r.targetType === "person_profile")).toBe(true);
    expect(env.relations?.items.every((r) => r.relationKey === "doctors")).toBe(true);
    const fields = medicalServiceFieldsSchema.parse(entityPayload(env));
    expect(fields.related_doctor_ids ?? []).toEqual(staticService.relatedDoctorIds);
  });
});

test.describe("medical service adapter — parity with approved source", () => {
  for (const locale of ["en", "ar"] as const) {
    test(`${locale}: maps onto the approved static record exactly`, () => {
      const s = adapt(locale);
      expect(s.id).toBe(staticService.id);
      expect(s.slug).toBe(staticService.slug);
      expect(s.title[locale]).toBe(staticService.title[locale]);
      expect(s.summary[locale]).toBe(staticService.summary[locale]);
      expect(s.bookingChannel).toBe(staticService.bookingChannel);
      expect(s.sourceVerified).toBe(staticService.sourceVerified);
      expect(s.urgentCareNote![locale]).toBe(staticService.urgentCareNote![locale]);
      expect(s.relatedDoctorIds).toEqual(staticService.relatedDoctorIds);
    });

    test(`${locale}: FAQs match the approved source verbatim`, () => {
      const s = adapt(locale);
      expect(s.faqs).toHaveLength(staticService.faqs!.length);
      staticService.faqs!.forEach((q, i) => {
        expect(s.faqs![i].question[locale]).toBe(q.question[locale]);
        expect(s.faqs![i].answer[locale]).toBe(q.answer[locale]);
      });
    });

    test(`${locale}: external partners keep untranslated proper nouns and real URLs`, () => {
      const s = adapt(locale);
      expect(s.externalPartners).toHaveLength(staticService.externalPartners!.length);
      staticService.externalPartners!.forEach((p, i) => {
        expect(s.externalPartners![i].name).toBe(p.name);
        expect(s.externalPartners![i].url).toBe(p.url);
        expect(s.externalPartners![i].note[locale]).toBe(p.note[locale]);
      });
    });
  }

  test("the non-requested locale stays EMPTY — no cross-language medical text", () => {
    const en = adapt("en");
    const ar = adapt("ar");
    expect(en.summary.ar).toBe("");
    expect(ar.summary.en).toBe("");
    expect(JSON.stringify(ar)).not.toContain(staticService.summary.en);
    expect(JSON.stringify(en)).not.toContain(staticService.summary.ar);
    expect(JSON.stringify(ar)).not.toContain(staticService.faqs![0].answer.en);
  });

  test("an out-of-range booking channel is rejected rather than rendered", () => {
    const env = feelstackResolveEnvelopeSchema.parse(fixture("en"));
    const payload = { ...(entityPayload(env) as Record<string, unknown>), booking_channel: "walk-in" };
    expect(medicalServiceFieldsSchema.safeParse(payload).success).toBe(false);
  });
});
