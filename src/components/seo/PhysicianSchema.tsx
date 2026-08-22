import { siteConfig } from "@/config/site";
import type { Doctor } from "@/types/doctor";
import { clinicId, doctorEntityId, servicesForDoctor, serviceUrl } from "@/lib/seo/entity-graph";
import type { Locale } from "@/i18n/config";

/**
 * `Physician` JSON-LD for an individual doctor profile — the gap this pass
 * closes (doctor pages previously emitted no structured data at all, while
 * every other entity detail page already emitted its own node).
 *
 * Every field traces to approved content in src/types/doctor.ts:
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
 * existing per-doctor Physician nodes (src/components/seo/JsonLd.tsx), where
 * it is already backed by every doctor's credentials reading "Family
 * Physician". It is emitted here on the same basis, not newly asserted.
 */
export function PhysicianSchema({
  doctor,
  locale,
  path,
}: {
  doctor: Doctor;
  locale: Locale;
  path: string;
}) {
  const url = `${siteConfig.url}/${locale}${path}`;
  const related = servicesForDoctor(doctor.id);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": doctorEntityId(doctor),
    name: doctor.name[locale],
    description: doctor.bio[locale],
    jobTitle: doctor.credentials[locale],
    medicalSpecialty: "FamilyPractice",
    url,
    inLanguage: locale === "ar" ? "ar-CA" : "en-CA",
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

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
