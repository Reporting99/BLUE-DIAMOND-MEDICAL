import { z } from "zod";
import { defineEntityContract, localizedBilingual, adaptFaqs, entitySlug } from "@/lib/feelstack/adapters";
import { resolveSlotImage } from "@/lib/feelstack/media-slots";
import type { Technology } from "./types";

/**
 * Technology <- FeelStack `technology` content type.
 *
 * Derived from the REAL created record: read back from
 * `resolve?path=/aesthetics/technologies/elite-iq` after the canary was
 * written. Fixtures in `tests/fixtures/feelstack/technology-resolve-{en,ar}.json`
 * are that exact response.
 *
 * Ten typed fields. `relatedConcernIds` exists on the domain type but is
 * populated on 0 of 5 approved records, so no CMS field was created for it —
 * the same rule applied to concerns. It can be added via `PUT types/:id` when
 * approved content exists.
 */

export const technologyFieldsSchema = z.object({
  technology_id: z.string().min(1),
  /**
   * A device manufacturer is a proper noun and is NOT translated — the same
   * string is stored in both locale entries, matching the approved source.
   */
  manufacturer: z.string().min(1),
  summary: z.string().min(1),
  source_verified: z.boolean(),
  how_it_works: z.string().optional(),
  what_it_addresses: z.string().optional(),
  appointment_involves: z.string().optional(),
  safety_note: z.string().optional(),
  related_treatment_ids: z.array(z.string()).optional(),
  related_doctor_ids: z.array(z.string()).optional(),
});

export type TechnologyFields = z.infer<typeof technologyFieldsSchema>;

export const technologyCmsContract = defineEntityContract<TechnologyFields, Technology>({
  contentType: "technology",
  fields: technologyFieldsSchema,
  adapt: ({ locale, title, fields: f, faqs, path, media }) => {
    const tech: Technology = {
      id: f.technology_id,
      slug: entitySlug(path, locale, "/aesthetics/technologies/"),
      // Arabic public URLs stay frontend-owned; the CMS slug is ASCII.
      slugAr: "",
      title: localizedBilingual(locale, title ?? ""),
      manufacturer: f.manufacturer,
      summary: localizedBilingual(locale, f.summary),
      /**
       * Read from the typed field, with the relation rows as the CMS-side
       * graph. A contract test asserts the two agree, so a divergence fails
       * rather than rendering different cross-links than the graph describes.
       */
      relatedTreatmentIds: f.related_treatment_ids ?? [],
      sourceVerified: f.source_verified,
    };
    const optional: [keyof Technology, string | undefined][] = [
      ["howItWorks", f.how_it_works],
      ["whatItAddresses", f.what_it_addresses],
      ["appointmentInvolves", f.appointment_involves],
      ["safetyNote", f.safety_note],
    ];
    for (const [key, value] of optional) {
      if (value) Object.assign(tech, { [key]: localizedBilingual(locale, value) });
    }
    if (f.related_doctor_ids) tech.relatedDoctorIds = f.related_doctor_ids;
    if (faqs.length) tech.faqs = adaptFaqs(locale, faqs);
    // Card image from this technology's real media assignment, if one exists.
    const image = resolveSlotImage({ media, slot: ["card", "hero"] });
    if (image) tech.image = image;
    return tech;
  },
});
