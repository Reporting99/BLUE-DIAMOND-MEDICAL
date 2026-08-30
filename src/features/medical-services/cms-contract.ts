import { z } from "zod";
import { defineEntityContract, localizedBilingual, localizedBilingualList, adaptFaqs } from "@/lib/feelstack/adapters";
import { resolveSlotImage } from "@/lib/feelstack/media-slots";
import type { BookingChannel } from "@/config/booking";
import type { MedicalServiceContent } from "./types";

/**
 * MedicalServiceContent <- FeelStack `medical-service` content type.
 *
 * Derived from the REAL created record, not forward-declared: the shape below
 * was read back from
 * `GET /public/v1/sites/blue-diamond-medical/resolve?path=/medical/after-hours-care`
 * after the canary was written. Fixtures in
 * `tests/fixtures/feelstack/medical-service-resolve-{en,ar}.json` are that
 * exact response.
 *
 * Unlike doctors, this is a `content_entry`, so its values arrive under
 * `data.fields` rather than at the top level of `data` — the two families
 * genuinely differ, which is why the doctor contract was not reused.
 * `entityPayload()` in lib/feelstack/transport.ts picks the right half.
 *
 * A structured content type was created rather than reusing a first-class
 * model: a medical service is neither a person nor a location, so nothing
 * first-class fits. Every field below is a TYPED field definition on that type
 * (text / rich_text / select / boolean / json / multiple-text) — deliberately
 * not one free-form metadata blob.
 */

const bookingChannelSchema = z.enum(["family-doctor", "eye-screening", "phone-medical-botox"]);

export const medicalServiceFieldsSchema = z.object({
  service_id: z.string().min(1),
  summary: z.string().min(1),
  booking_channel: bookingChannelSchema,
  source_verified: z.boolean(),
  who_its_for: z.string().optional(),
  whats_included: z.array(z.string()).optional(),
  how_appointments_work: z.string().optional(),
  urgent_care_note: z.string().optional(),
  contact_note: z.string().optional(),
  /**
   * Stable doctor ids, carried as a typed field rather than read from
   * `relations.items`.
   *
   * The relation rows exist and are correct — they are the CMS-side graph, and
   * FeelStack resolves them by `targetType: person_profile`. But their
   * `targetId` is a person_profile UUID, and the frontend routes doctors by
   * stable slug (`/doctors/reem-hamdi`). Resolving UUID -> slug would need a
   * second CMS request per service, which the locale-specific fetch model
   * deliberately avoids. The two representations serve different consumers
   * rather than duplicating one.
   */
  related_doctor_ids: z.array(z.string()).optional(),
  external_partners: z
    .array(z.object({ name: z.string(), url: z.string(), note: z.string() }))
    .optional(),
});

export type MedicalServiceFields = z.infer<typeof medicalServiceFieldsSchema>;

export const medicalServiceCmsContract = defineEntityContract<MedicalServiceFields, MedicalServiceContent>({
  contentType: "medical-service",
  fields: medicalServiceFieldsSchema,
  adapt: ({ locale, title, fields, faqs, path, media }) => {
    const f = fields;
    const service: MedicalServiceContent = {
      id: f.service_id,
      // The English slug is the canonical physical route; the Arabic pretty URL
      // is proxy-rewritten and owned by src/config/routes.ts, never the CMS.
      slug: path.replace(/^\/medical\//, ""),
      slugAr: "",
      title: localizedBilingual(locale, title ?? ""),
      summary: localizedBilingual(locale, f.summary),
      relatedDoctorIds: f.related_doctor_ids ?? [],
      bookingChannel: f.booking_channel as BookingChannel,
      sourceVerified: f.source_verified,
    };
    if (f.who_its_for) service.whoItsFor = localizedBilingual(locale, f.who_its_for);
    if (f.whats_included) service.whatsIncluded = localizedBilingualList(locale, f.whats_included);
    if (f.how_appointments_work) service.howAppointmentsWork = localizedBilingual(locale, f.how_appointments_work);
    if (f.urgent_care_note) service.urgentCareNote = localizedBilingual(locale, f.urgent_care_note);
    if (f.contact_note) service.contactNote = localizedBilingual(locale, f.contact_note);
    if (f.external_partners?.length) {
      service.externalPartners = f.external_partners.map((p) => ({
        // A partner's name is a proper noun and is not translated — it is the
        // same string in both locales, matching the approved source.
        name: p.name,
        url: p.url,
        note: localizedBilingual(locale, p.note),
      }));
    }
    // First-class FAQs, already locale-filtered by the backend.
    if (faqs.length) service.faqs = adaptFaqs(locale, faqs);
    // Lead image from the real media assignment. `hero` is the intended
    // placement; `card` is accepted because FeelStack withholds assignments
    // whose asset is not publishable, so a service can arrive with only the
    // card image approved. No static fallback: a service with no assignment
    // renders no image, exactly as it does today.
    const image = resolveSlotImage({ media, slot: ["hero", "card"] });
    if (image) service.image = image;
    return service;
  },
});
