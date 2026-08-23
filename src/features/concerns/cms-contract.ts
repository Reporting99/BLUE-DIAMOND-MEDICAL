import { z } from "zod";
import { defineEntityContract, localizedBilingual, adaptFaqs } from "@/lib/feelstack/adapters";
import type { AestheticConcern } from "./types";

/**
 * AestheticConcern <- FeelStack `aesthetic-concern` content type.
 *
 * Derived from the REAL created record: read back from
 * `resolve?path=/aesthetics/concerns/sun-damage-pigmentation` after the canary
 * was written. Fixtures in `tests/fixtures/feelstack/concern-resolve-{en,ar}.json`
 * are that exact response.
 *
 * Six typed fields, not ten. `commonPresentations`, `contributingFactors`,
 * `relatedConcernIds` and `relatedTechnologyIds` exist on the domain type but
 * are populated on 0 of 9 approved records, so no CMS field was created for
 * them — a speculative field is how a contract starts drifting from reality.
 * They can be added with `PUT types/:id` when real approved content exists,
 * exactly as `related_doctor_ids` was added during the services phase.
 */

export const concernFieldsSchema = z.object({
  concern_id: z.string().min(1),
  summary: z.string().min(1),
  source_verified: z.boolean(),
  related_treatment_ids: z.array(z.string()).optional(),
  related_doctor_ids: z.array(z.string()).optional(),
  /**
   * Records that the legacy site cross-linked this concern to a treatment page
   * whose content did not match it, and that the link was corrected here.
   * Provenance, not decoration — it must survive the round trip intact.
   */
  corrected_from_source: z.boolean().optional(),
});

export type ConcernFields = z.infer<typeof concernFieldsSchema>;

export const aestheticConcernCmsContract = defineEntityContract<ConcernFields, AestheticConcern>({
  contentType: "aesthetic-concern",
  fields: concernFieldsSchema,
  adapt: ({ locale, title, fields: f, faqs, path }) => {
    const concern: AestheticConcern = {
      id: f.concern_id,
      slug: path.replace(/^\/aesthetics\/concerns\//, ""),
      // Arabic public URLs stay frontend-owned; the CMS slug is ASCII.
      slugAr: "",
      title: localizedBilingual(locale, title ?? ""),
      summary: localizedBilingual(locale, f.summary),
      /**
       * Read from the typed field rather than `relations.items`, keeping one
       * source of truth for routing. The relation rows are the CMS-side graph
       * and carry the same stable ids in their `metadata`; a contract test
       * asserts the two agree, so a divergence fails rather than silently
       * rendering a different set of cross-links than the graph describes.
       */
      relatedTreatmentIds: f.related_treatment_ids ?? [],
      sourceVerified: f.source_verified,
    };
    if (f.related_doctor_ids) concern.relatedDoctorIds = f.related_doctor_ids;
    if (f.corrected_from_source) concern.correctedFromSource = true;
    if (faqs.length) concern.faqs = adaptFaqs(locale, faqs);
    return concern;
  },
});
