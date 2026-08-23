import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { feelstackResolveEnvelopeSchema, entityPayload } from "../../src/lib/feelstack/transport";
import { checkLocaleIntegrity } from "../../src/lib/feelstack/locale-integrity";
import { toAdapterInput } from "../../src/lib/feelstack/adapters";
import { aestheticConcernCmsContract, concernFieldsSchema } from "../../src/features/concerns/cms-contract";
import { concerns } from "../../src/features/concerns/data";

/**
 * Concern canary — Sun Damage & Pigmentation.
 *
 * Chosen because it has multiple related treatments AND carries
 * `correctedFromSource`, which records that the legacy site cross-linked this
 * concern to a treatment page whose content did not match it. That flag is
 * provenance about an editorial decision, so proving it survives the round trip
 * matters more than an extra FAQ.
 */
const fixture = (locale: "en" | "ar") =>
  JSON.parse(
    readFileSync(path.join(process.cwd(), "tests", "fixtures", "feelstack", `concern-resolve-${locale}.json`), "utf8"),
  );

const source = concerns.find((c) => c.id === "sun-damage-pigmentation")!;

const adapt = (locale: "en" | "ar") => {
  const env = feelstackResolveEnvelopeSchema.parse(fixture(locale));
  return aestheticConcernCmsContract.adapt(
    toAdapterInput(env, locale, concernFieldsSchema.parse(entityPayload(env))),
  );
};

test.describe("concern canary — live envelope", () => {
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

  test("treatment and doctor relations are REAL entries, never placeholders", () => {
    const env = feelstackResolveEnvelopeSchema.parse(fixture("en"));
    const items = env.relations?.items ?? [];
    const treatments = items.filter((r) => r.relationKey === "treatments");
    expect(treatments.length).toBe(source.relatedTreatmentIds.length);
    expect(treatments.every((r) => r.targetType === "content_entry")).toBe(true);
    expect(items.some((r) => r.relationKey === "doctors" && r.targetType === "person_profile")).toBe(true);
    // Technologies are not migrated — no placeholder may have been invented.
    expect(items.some((r) => r.relationKey === "technologies")).toBe(false);
  });

  test("the relation graph and the typed field describe the same cross-links", () => {
    const env = feelstackResolveEnvelopeSchema.parse(fixture("en"));
    const fromGraph = (env.relations?.items ?? [])
      .filter((r) => r.relationKey === "treatments")
      .map((r) => (r.metadata as { treatmentId: string }).treatmentId)
      .sort();
    const fields = entityPayload(env) as { related_treatment_ids?: string[] };
    expect([...(fields.related_treatment_ids ?? [])].sort()).toEqual(fromGraph);
  });
});

test.describe("concern adapter — parity with approved source", () => {
  for (const locale of ["en", "ar"] as const) {
    test(`${locale}: maps onto the approved record exactly`, () => {
      const c = adapt(locale);
      expect(c.id).toBe(source.id);
      expect(c.slug).toBe(source.slug);
      expect(c.title[locale]).toBe(source.title[locale]);
      expect(c.summary[locale]).toBe(source.summary[locale]);
      expect(c.relatedTreatmentIds).toEqual(source.relatedTreatmentIds);
      expect(c.sourceVerified).toBe(source.sourceVerified);
      expect(c.faqs).toHaveLength(source.faqs!.length);
      source.faqs!.forEach((q, i) => {
        expect(c.faqs![i].question[locale]).toBe(q.question[locale]);
        expect(c.faqs![i].answer[locale]).toBe(q.answer[locale]);
      });
    });
  }

  test("the editorial correction flag survives the round trip", () => {
    expect(source.correctedFromSource).toBe(true);
    expect(adapt("en").correctedFromSource).toBe(true);
    expect(adapt("ar").correctedFromSource).toBe(true);
  });

  test("fields absent from the approved source stay absent", () => {
    const c = adapt("en");
    // 0 of 9 approved concerns describe presentations or contributing factors.
    // Migration preserves that gap; it must never be inferred.
    expect(c.commonPresentations).toBeUndefined();
    expect(c.contributingFactors).toBeUndefined();
    expect(c.relatedTechnologyIds).toBeUndefined();
  });

  test("no cross-language clinical text", () => {
    const en = adapt("en");
    const ar = adapt("ar");
    expect(en.summary.ar).toBe("");
    expect(ar.summary.en).toBe("");
    expect(JSON.stringify(ar)).not.toContain(source.summary.en);
    expect(JSON.stringify(en)).not.toContain(source.summary.ar);
  });
});
