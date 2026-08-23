import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { feelstackResolveEnvelopeSchema, entityPayload } from "../../src/lib/feelstack/transport";
import { checkLocaleIntegrity } from "../../src/lib/feelstack/locale-integrity";
import { toAdapterInput } from "../../src/lib/feelstack/adapters";
import { technologyCmsContract, technologyFieldsSchema } from "../../src/features/technologies/cms-contract";
import { technologies } from "../../src/features/technologies/data";

/**
 * Technology canary — Elite iQ™.
 *
 * Chosen because it is the only technology carrying `appointmentInvolves` and
 * `safetyNote`; the other four leave both undefined. Migrating it first proves
 * those two fields round-trip, and proves the four records without them keep
 * that absence rather than acquiring invented copy.
 */
const fixture = (locale: "en" | "ar") =>
  JSON.parse(
    readFileSync(path.join(process.cwd(), "tests", "fixtures", "feelstack", `technology-resolve-${locale}.json`), "utf8"),
  );

const source = technologies.find((t) => t.id === "elite-iq")!;

const adapt = (locale: "en" | "ar") => {
  const env = feelstackResolveEnvelopeSchema.parse(fixture(locale));
  return technologyCmsContract.adapt(toAdapterInput(env, locale, technologyFieldsSchema.parse(entityPayload(env))));
};

test.describe("technology canary — live envelope", () => {
  for (const locale of ["en", "ar"] as const) {
    test(`${locale}: own locale, no fallback`, () => {
      const env = feelstackResolveEnvelopeSchema.parse(fixture(locale));
      expect(env.type).toBe("content_entry");
      expect(env.route.usedFallback).toBe(false);
      expect(env.route.resolvedLocale).toBe(locale);
      expect(checkLocaleIntegrity(env, locale).ok).toBe(true);
    });
  }

  test("both locales share one translationGroupId", () => {
    expect(feelstackResolveEnvelopeSchema.parse(fixture("en")).data.translationGroupId).toBe(
      feelstackResolveEnvelopeSchema.parse(fixture("ar")).data.translationGroupId,
    );
  });

  test("treatment and doctor relations are real entries", () => {
    const env = feelstackResolveEnvelopeSchema.parse(fixture("en"));
    const items = env.relations?.items ?? [];
    const treatments = items.filter((r) => r.relationKey === "treatments");
    expect(treatments.length).toBe(source.relatedTreatmentIds.length);
    expect(treatments.every((r) => r.targetType === "content_entry")).toBe(true);
    expect(items.some((r) => r.relationKey === "doctors" && r.targetType === "person_profile")).toBe(true);
  });

  test("the relation graph agrees with the typed field", () => {
    const env = feelstackResolveEnvelopeSchema.parse(fixture("en"));
    const fromGraph = (env.relations?.items ?? [])
      .filter((r) => r.relationKey === "treatments")
      .map((r) => (r.metadata as { treatmentId: string }).treatmentId)
      .sort();
    const fields = entityPayload(env) as { related_treatment_ids?: string[] };
    expect([...(fields.related_treatment_ids ?? [])].sort()).toEqual(fromGraph);
  });
});

test.describe("technology adapter — parity with approved source", () => {
  for (const locale of ["en", "ar"] as const) {
    test(`${locale}: maps onto the approved record exactly`, () => {
      const t = adapt(locale);
      expect(t.id).toBe(source.id);
      expect(t.slug).toBe(source.slug);
      expect(t.title[locale]).toBe(source.title[locale]);
      expect(t.summary[locale]).toBe(source.summary[locale]);
      expect(t.relatedTreatmentIds).toEqual(source.relatedTreatmentIds);
      expect(t.sourceVerified).toBe(source.sourceVerified);
      for (const key of ["howItWorks", "whatItAddresses", "appointmentInvolves", "safetyNote"] as const) {
        if (source[key]) expect(t[key]![locale]).toBe(source[key]![locale]);
      }
      expect(t.faqs).toHaveLength(source.faqs!.length);
    });
  }

  test("manufacturer is a proper noun and identical in both locales", () => {
    // Not translated in the approved source, and must not be translated here.
    expect(adapt("en").manufacturer).toBe(source.manufacturer);
    expect(adapt("ar").manufacturer).toBe(source.manufacturer);
  });

  test("technologies without a safety note keep that absence", () => {
    // 4 of 5 approved technologies describe no safety note or appointment
    // detail. Migration preserves the gap; it must never be inferred.
    const thin = technologies.filter((t) => !t.safetyNote);
    expect(thin.length).toBe(4);
    for (const t of thin) {
      expect(t.safetyNote).toBeUndefined();
      expect(t.appointmentInvolves).toBeUndefined();
    }
  });

  test("no cross-language technology text", () => {
    const en = adapt("en");
    const ar = adapt("ar");
    expect(en.summary.ar).toBe("");
    expect(ar.summary.en).toBe("");
    expect(JSON.stringify(ar)).not.toContain(source.summary.en);
    expect(JSON.stringify(en)).not.toContain(source.summary.ar);
  });
});
