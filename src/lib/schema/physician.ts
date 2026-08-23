import type { Doctor } from "@/features/doctors";
import { clinicId, doctorEntityId, servicesForDoctor, serviceUrl } from "@/lib/seo/entity-graph";
import type { Locale } from "@/i18n/config";
import { absoluteUrl, schemaLanguage } from "./shared";
import type { JsonLdNode } from "./types";

/**
 * `Physician` for an individual doctor profile.
 *
 * Every field traces to approved content in src/features/doctors/data.ts:
 *  - `name`        <- doctor.name
 *  - `description` <- doctor.bio
 *  - `jobTitle`    <- doctor.credentials (verbatim; the credential string is
 *                     the clinic's own wording, not a parsed/inferred claim)
 *  - `worksFor`    <- a reference to the single clinic @id, not a duplicate
 *                     clinic entity
 *  - `knowsAbout`  <- only the services whose OWN content lists this doctor in
 *                     `relatedDoctorIds` (src/lib/seo/entity-graph.ts)
 *
 * Deliberately NOT emitted, because the approved source does not carry them
 * and Google treats fabricated values here as spam: no `award`, no
 * `aggregateRating`/`review`, no `alumniOf` (bios name institutions in prose
 * but never in a form that maps cleanly to a structured degree/affiliation),
 * no `availableService` price or `medicalLicense` numbers, and no `image`
 * unless real photography has actually been approved.
 *
 * `medicalSpecialty: "FamilyPractice"` is carried over from the homepage's
 * per-doctor Physician nodes (`buildClinicGraph`), where it is already backed
 * by every doctor's credentials reading "Family Physician". It is emitted here
 * on the same basis, not newly asserted.
 */
export function buildPhysicianSchema({
  doctor,
  locale,
  path,
}: {
  doctor: Doctor;
  locale: Locale;
  path: string;
}): JsonLdNode {
  const related = servicesForDoctor(doctor.id);

  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": doctorEntityId(doctor),
    name: doctor.name[locale],
    description: doctor.bio[locale],
    jobTitle: doctor.credentials[locale],
    medicalSpecialty: "FamilyPractice",
    url: absoluteUrl(locale, path),
    inLanguage: schemaLanguage(locale),
    worksFor: { "@id": clinicId },
    // The clinic is also the physical place these physicians practise at; the
    // clinic node already carries the verified PostalAddress, so this is a
    // reference rather than a second copy of the address.
    workLocation: { "@id": clinicId },
    ...(related.length > 0
      ? {
          knowsAbout: related.map((service) => ({
            "@type": "MedicalProcedure" as const,
            name: service.title[locale],
            ...(serviceUrl(service, locale) ? { url: serviceUrl(service, locale) } : {}),
          })),
        }
      : {}),
  };
}
