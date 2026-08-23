import { z } from "zod";
import { defineEntityContract, localizedBilingual } from "@/lib/feelstack/adapters";
import type { Doctor } from "./types";

/**
 * Doctor <- FeelStack `person_profile`.
 *
 * Derived from the REAL created record, not forward-declared: the shape below
 * was read back from
 * `GET /public/v1/sites/blue-diamond-medical/resolve?path=/doctors/mohamed-farhat`
 * after the first canary was written. Fixtures in
 * `tests/fixtures/feelstack/doctor-resolve-{en,ar}.json` are that exact
 * response.
 *
 * Why `person_profile` rather than a `doctor` content type: it is FeelStack's
 * first-class person model, natively routable, and already carries the fields
 * that matter here — displayName, professionalTitle, biography, plus `locale`,
 * `translationGroupId` and `seo`. Creating a parallel content type would
 * duplicate a first-class entity for no gain.
 *
 * Its cost, recorded honestly: the four Blue Diamond-specific attributes have
 * no column on `person_profile` and live in the free-form `metadata` object, so
 * the CMS cannot validate them. This schema is therefore the only thing
 * enforcing that `bookingChannel` is one of two values — which is why it is
 * strict rather than permissive.
 */

const bookingChannelSchema = z.enum(["family-doctor", "phone-medical-botox"]);
const imageStatusSchema = z.enum(["approved", "temporary", "pending", "disabled"]);

/**
 * `person_profile` exposes its columns at the top level of `data`, not under
 * `fields` — see `entityPayload()` in lib/feelstack/transport.ts.
 */
export const doctorPersonFieldsSchema = z.object({
  displayName: z.string().min(1),
  professionalTitle: z.string().nullable().optional(),
  biography: z.string().nullable().optional(),
  metadata: z.object({
    doctorId: z.string().min(1),
    routeId: z.string().min(1),
    practicesAesthetics: z.boolean(),
    bookingChannel: bookingChannelSchema,
    imagePath: z.string(),
    imageStatus: imageStatusSchema,
    photoDeclined: z.boolean().optional(),
    clinicalInterests: z.array(z.string()).optional(),
  }),
});

export type DoctorPersonFields = z.infer<typeof doctorPersonFieldsSchema>;

export const doctorCmsContract = defineEntityContract<DoctorPersonFields, Doctor>({
  contentType: "person_profile",
  fields: doctorPersonFieldsSchema,
  adapt: ({ locale, fields }) => {
    const meta = fields.metadata;
    return {
      id: meta.doctorId,
      routeId: meta.routeId,
      // One entry per locale: the requested locale is filled and the other is
      // left empty, so a stray cross-locale read shows missing text rather
      // than the wrong language.
      name: localizedBilingual(locale, fields.displayName),
      credentials: localizedBilingual(locale, fields.professionalTitle ?? ""),
      bio: localizedBilingual(locale, fields.biography ?? ""),
      ...(meta.clinicalInterests
        ? {
            clinicalInterests:
              locale === "en"
                ? { en: meta.clinicalInterests, ar: [] }
                : { en: [], ar: meta.clinicalInterests },
          }
        : {}),
      practicesAesthetics: meta.practicesAesthetics,
      image: {
        // ImageKit remains the store; FeelStack owns only the reference.
        path: meta.imagePath,
        status: meta.imageStatus,
        ...(meta.photoDeclined ? { photoDeclined: true } : {}),
      },
      bookingChannel: meta.bookingChannel,
    };
  },
});
