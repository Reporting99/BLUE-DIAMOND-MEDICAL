import { z } from "zod";
import { defineEntityContract, localizedBilingual, localizedBilingualList, adaptFaqs, entitySlug } from "@/lib/feelstack/adapters";
import { resolveSlotImage } from "@/lib/feelstack/media-slots";
import type { AestheticTreatment } from "./types";

/**
 * AestheticTreatment <- FeelStack `aesthetic-treatment` content type.
 *
 * Derived from the REAL created record, not forward-declared: read back from
 * `resolve?path=/aesthetics/treatments/rf-microneedling` after the canary was
 * written. Fixtures in `tests/fixtures/feelstack/treatment-resolve-{en,ar}.json`
 * are that exact response.
 *
 * A dedicated content type rather than reusing `medical-service`: treatments
 * carry sixteen fields services do not (comfort level, downtime, result
 * timeline, treatment areas, safety contraindications, aftercare, treatment-day
 * journey...). Every one has a TYPED field definition — unlike the doctor model,
 * this entity needed no free-form `metadata` at all.
 */

/**
 * Relations to entity families that are not migrated yet.
 *
 * Concerns and technologies still live in approved static content, so there is
 * nothing in the CMS to point a ContentRelation at. Rather than invent
 * placeholder entities — which would put unreviewed medical content into the
 * CMS purely to satisfy a foreign key — their stable frontend ids are carried
 * in typed fields. Real ContentRelation rows are created only for targets that
 * already exist (doctors). When concerns and technologies migrate, these become
 * real relations and these fields can be reconsidered.
 */
const deferredIds = z.array(z.string()).optional();

export const treatmentFieldsSchema = z.object({
  treatment_id: z.string().min(1),
  summary: z.string().min(1),
  source_verified: z.boolean(),
  who_its_for: z.string().optional(),
  service_location_note: z.string().optional(),
  how_it_works: z.string().optional(),
  duration: z.string().optional(),
  preparation: z.string().optional(),
  comfort_level: z.string().optional(),
  treatment_day_journey: z.string().optional(),
  downtime: z.string().optional(),
  aftercare: z.string().optional(),
  result_timeline: z.string().optional(),
  suggested_course: z.string().optional(),
  concerns_treated: z.array(z.string()).optional(),
  treatment_areas: z.array(z.string()).optional(),
  safety_contraindications: z.array(z.string()).optional(),
  technology_ids: deferredIds,
  related_concern_ids: deferredIds,
  related_treatment_ids: deferredIds,
  related_doctor_ids: deferredIds,
});

export type TreatmentFields = z.infer<typeof treatmentFieldsSchema>;

export const aestheticTreatmentCmsContract = defineEntityContract<TreatmentFields, AestheticTreatment>({
  contentType: "aesthetic-treatment",
  fields: treatmentFieldsSchema,
  adapt: ({ locale, title, fields: f, faqs, path, media }) => {
    const t: AestheticTreatment = {
      id: f.treatment_id,
      slug: entitySlug(path, locale, "/aesthetics/treatments/"),
      // Arabic public URLs are proxy-rewritten and owned by src/config/routes.ts,
      // never by the CMS — the entry slug is ASCII by FeelStack's own rule.
      slugAr: "",
      title: localizedBilingual(locale, title ?? ""),
      summary: localizedBilingual(locale, f.summary),
      sourceVerified: f.source_verified,
    };
    const text: [keyof AestheticTreatment, string | undefined][] = [
      ["whoItsFor", f.who_its_for],
      ["serviceLocationNote", f.service_location_note],
      ["howItWorks", f.how_it_works],
      ["duration", f.duration],
      ["preparation", f.preparation],
      ["comfortLevel", f.comfort_level],
      ["treatmentDayJourney", f.treatment_day_journey],
      ["downtime", f.downtime],
      ["aftercare", f.aftercare],
      ["resultTimeline", f.result_timeline],
      ["suggestedCourse", f.suggested_course],
    ];
    for (const [key, value] of text) {
      if (value) Object.assign(t, { [key]: localizedBilingual(locale, value) });
    }
    const lists: [keyof AestheticTreatment, string[] | undefined][] = [
      ["concernsTreated", f.concerns_treated],
      ["treatmentAreas", f.treatment_areas],
      ["safetyContraindications", f.safety_contraindications],
    ];
    for (const [key, value] of lists) {
      if (value) Object.assign(t, { [key]: localizedBilingualList(locale, value) });
    }
    if (f.technology_ids) t.technologyIds = f.technology_ids;
    if (f.related_concern_ids) t.relatedConcernIds = f.related_concern_ids;
    if (f.related_treatment_ids) t.relatedTreatmentIds = f.related_treatment_ids;
    if (f.related_doctor_ids) t.relatedDoctorIds = f.related_doctor_ids;
    if (faqs.length) t.faqs = adaptFaqs(locale, faqs);
    // Lead image from this treatment's real media assignment, if one exists.
    const image = resolveSlotImage({ media, slot: ["hero", "card", "gallery"] });
    if (image) t.image = image;
    return t;
  },
});
