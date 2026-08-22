import { siteConfig } from "@/config/site";
import { doctors } from "@/types/doctor";
import { clinicHours } from "@/config/clinic-hours";
import { medicalServices } from "@/content/medical-services";
import { getRoute } from "@/config/routes";
import { doctorEntityId } from "@/lib/seo/entity-graph";
import type { Locale } from "@/i18n/config";

const SCHEMA_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/**
 * MedicalClinic + Physician + WebSite JSON-LD for the homepage. One
 * consistent clinic entity is reused (via @id) rather than re-declared per
 * page — brief §32. No reviews/ratings/awards are fabricated; only fields
 * backed by approved source content are emitted.
 *
 * No separate "Organization" node is emitted: schema.org's own type
 * hierarchy has `MedicalClinic` → `MedicalBusiness` → `LocalBusiness` →
 * `Organization`, so the MedicalClinic node below already satisfies an
 * "Organization schema" requirement without a redundant duplicate entity
 * carrying the same @id and facts.
 */
export function DoctorOrganizationSchema({ locale }: { locale: Locale }) {
  const clinicId = `${siteConfig.url}/#clinic`;

  // Only days the approved source actually confirms. src/config/clinic-hours.ts
  // records Saturday/Sunday as `null` meaning "not confirmed, closed by
  // default" — a UI default, not a verified fact. Emitting those as
  // `opens/closes` closed days would assert a business fact the source never
  // stated, and wrong hours in local search actively misdirect patients, so
  // unconfirmed days are omitted rather than published as closed.
  const openingHoursSpecification = clinicHours
    .filter((entry): entry is typeof entry & { open: string; close: string } =>
      entry.open !== null && entry.close !== null,
    )
    .map((entry) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${SCHEMA_DAYS[entry.day]}`,
      opens: entry.open,
      closes: entry.close,
    }));

  // Services the clinic's own approved content already publishes a page for.
  const availableService = medicalServices.flatMap((service) => {
    const route = getRoute(`medical-${service.id}`);
    if (!route) return [];
    return [
      {
        "@type": "MedicalProcedure" as const,
        name: service.title[locale],
        description: service.summary[locale],
        url: `${siteConfig.url}/${locale}${route.path[locale]}`,
      },
    ];
  });

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalClinic",
        "@id": clinicId,
        name: siteConfig.clinic.name,
        url: siteConfig.url,
        telephone: siteConfig.clinic.phoneDisplay,
        faxNumber: siteConfig.clinic.faxDisplay,
        address: {
          "@type": "PostalAddress",
          streetAddress: siteConfig.clinic.address.line1,
          addressLocality: siteConfig.clinic.address.city,
          addressRegion: siteConfig.clinic.address.region,
          postalCode: siteConfig.clinic.address.postalCode,
          addressCountry: siteConfig.clinic.address.country,
        },
        medicalSpecialty: ["FamilyPractice"],
        sameAs: [siteConfig.social.facebook, siteConfig.social.instagram],
        inLanguage: locale === "ar" ? "ar-CA" : "en-CA",
        areaServed: {
          "@type": "City",
          name: siteConfig.clinic.address.city,
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: siteConfig.clinic.address.region,
          },
        },
        ...(openingHoursSpecification.length > 0 ? { openingHoursSpecification } : {}),
        ...(availableService.length > 0 ? { availableService } : {}),
        // Closes the clinic -> physician direction of the graph. Each entry is a
        // reference to the same @id the doctor's own profile page emits
        // (PhysicianSchema), so the two pages describe one entity rather than
        // two look-alike copies.
        employee: doctors.map((doctor) => ({ "@id": doctorEntityId(doctor) })),
      },
      // Physician entities are emitted for every doctor regardless of photo
      // availability — schema data and image status are independent. The @id
      // matches the node on that doctor's own profile page so both resolve to
      // one entity.
      ...doctors.map((doctor) => ({
        "@type": "Physician",
        "@id": doctorEntityId(doctor),
        name: doctor.name[locale],
        jobTitle: doctor.credentials[locale],
        medicalSpecialty: "FamilyPractice",
        worksFor: { "@id": clinicId },
        ...(getRoute(doctor.routeId)
          ? { url: `${siteConfig.url}/${locale}${getRoute(doctor.routeId)!.path[locale]}` }
          : {}),
      })),
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        name: siteConfig.clinic.name,
        url: siteConfig.url,
        publisher: { "@id": clinicId },
        inLanguage: [locale === "ar" ? "ar-CA" : "en-CA"],
        // No SearchAction — the site has no internal search feature, and
        // schema.org's own guidance is not to declare potentialAction for
        // a capability that doesn't exist.
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
