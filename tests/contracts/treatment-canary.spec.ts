import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { feelstackResolveEnvelopeSchema, entityPayload } from "../../src/lib/feelstack/transport";
import { checkLocaleIntegrity } from "../../src/lib/feelstack/locale-integrity";
import { toAdapterInput } from "../../src/lib/feelstack/adapters";
import { aestheticTreatmentCmsContract, treatmentFieldsSchema } from "../../src/features/aesthetics/cms-contract";
import { treatments, gatedTreatments } from "../../src/features/aesthetics/data/treatments";

/**
 * Aesthetic treatment canary — RF Micro-Needling.
 *
 * Chosen because it is the only treatment exercising all three relation
 * categories at once: a real doctor relation (target already in the CMS) plus
 * deferred concern and technology ids (families not migrated yet). Fixtures are
 * the verbatim live responses.
 */
const fixture = (locale: "en" | "ar") =>
  JSON.parse(
    readFileSync(path.join(process.cwd(), "tests", "fixtures", "feelstack", `treatment-resolve-${locale}.json`), "utf8"),
  );

const source = treatments.find((t) => t.id === "rf-microneedling")!;

const adapt = (locale: "en" | "ar") => {
  const env = feelstackResolveEnvelopeSchema.parse(fixture(locale));
  return aestheticTreatmentCmsContract.adapt(
    toAdapterInput(env, locale, treatmentFieldsSchema.parse(entityPayload(env))),
  );
};

test.describe("treatment canary — live envelope", () => {
  for (const locale of ["en", "ar"] as const) {
    test(`${locale}: own locale, no fallback, fields under data.fields`, () => {
      const env = feelstackResolveEnvelopeSchema.parse(fixture(locale));
      expect(env.type).toBe("content_entry");
      expect(env.route.usedFallback).toBe(false);
      expect(env.route.requestedLocale).toBe(locale);
      expect(env.route.resolvedLocale).toBe(locale);
      expect(checkLocaleIntegrity(env, locale).ok).toBe(true);
      expect(env.data.fields).toBeDefined();
    });
  }

  test("both locales share one translationGroupId", () => {
    expect(feelstackResolveEnvelopeSchema.parse(fixture("en")).data.translationGroupId).toBe(
      feelstackResolveEnvelopeSchema.parse(fixture("ar")).data.translationGroupId,
    );
  });

  /**
   * DELIBERATE SEMANTIC CHANGE — concerns migrated in the phase after this one.
   *
   * This test previously asserted that NO `concerns` relation existed, which was
   * correct while concerns lived only in static content: pointing a
   * ContentRelation at a non-existent entity would have required inventing a
   * placeholder, and inventing entities to satisfy a foreign key is how
   * unreviewed medical content gets into a CMS.
   *
   * Concerns are now real entries, so the deferred ids were backfilled into real
   * relation rows. The assertion is inverted rather than deleted, and made
   * STRONGER: it is no longer enough that relations exist — each one must carry
   * the stable concern id, and that set must match the typed field exactly.
   *
   * Technologies are NOT migrated yet, so their half of the original guard
   * stands unchanged.
   */
  test("concern relations are now REAL and agree with the typed field", () => {
    const env = feelstackResolveEnvelopeSchema.parse(fixture("en"));
    const items = env.relations?.items ?? [];
    const fields = entityPayload(env) as { related_concern_ids?: string[] };

    const concernRelations = items.filter((r) => r.relationKey === "concerns");
    expect(concernRelations.length).toBe(source.relatedConcernIds!.length);

    // Every relation resolves to a real migrated concern entry, not a placeholder.
    expect(concernRelations.every((r) => r.targetType === "content_entry")).toBe(true);

    // The graph and the typed field must describe the same cross-links, or the
    // page would render a different set than the CMS believes.
    const fromGraph = concernRelations.map((r) => (r.metadata as { concernId: string }).concernId).sort();
    expect(fromGraph).toEqual([...source.relatedConcernIds!].sort());
    expect([...(fields.related_concern_ids ?? [])].sort()).toEqual(fromGraph);
  });

  test("doctor relations remain real; technologies remain deferred", () => {
    const env = feelstackResolveEnvelopeSchema.parse(fixture("en"));
    const items = env.relations?.items ?? [];
    expect(items.some((r) => r.relationKey === "doctors" && r.targetType === "person_profile")).toBe(true);
    // Technologies are still a static-only family — no placeholder may appear.
    expect(items.some((r) => r.relationKey === "technologies")).toBe(false);
  });
});

test.describe("treatment adapter — parity with approved source", () => {
  for (const locale of ["en", "ar"] as const) {
    test(`${locale}: every populated source field round-trips exactly`, () => {
      const t = adapt(locale);
      expect(t.id).toBe(source.id);
      expect(t.slug).toBe(source.slug);
      expect(t.title[locale]).toBe(source.title[locale]);
      expect(t.summary[locale]).toBe(source.summary[locale]);
      expect(t.sourceVerified).toBe(source.sourceVerified);
      for (const key of ["howItWorks", "duration", "comfortLevel", "downtime", "resultTimeline", "suggestedCourse"] as const) {
        if (source[key]) expect(t[key]![locale]).toBe(source[key]![locale]);
      }
      for (const key of ["concernsTreated", "safetyContraindications"] as const) {
        if (source[key]) expect(t[key]![locale]).toEqual(source[key]![locale]);
      }
    });
  }

  test("deferred relation ids are preserved verbatim as stable frontend ids", () => {
    const t = adapt("en");
    expect(t.relatedConcernIds).toEqual(source.relatedConcernIds);
    expect(t.technologyIds).toEqual(source.technologyIds);
    expect(t.relatedDoctorIds).toEqual(source.relatedDoctorIds);
  });

  test("absent source fields stay absent — no inferred clinical content", () => {
    const t = adapt("en");
    // The approved source has no aftercare or treatment-day journey for this
    // treatment. Migration must preserve the gap, never fill it.
    if (!source.aftercare) expect(t.aftercare).toBeUndefined();
    if (!source.treatmentDayJourney) expect(t.treatmentDayJourney).toBeUndefined();
    if (!source.preparation) expect(t.preparation).toBeUndefined();
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

test.describe("gated treatments", () => {
  test("are a separate export and are NOT part of the migrated set", () => {
    const gatedIds = gatedTreatments.map((g) => g.id);
    expect(gatedIds.length).toBeGreaterThan(0);
    for (const id of gatedIds) {
      expect(treatments.some((t) => t.id === id)).toBe(false);
      expect(g(id)).toBe(true);
    }
    function g(id: string) {
      return gatedTreatments.find((x) => x.id === id)!.requiresFeature !== undefined;
    }
  });
});
