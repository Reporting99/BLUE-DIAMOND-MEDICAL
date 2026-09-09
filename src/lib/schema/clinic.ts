import { siteConfig } from "@/config/site";
import { doctors } from "@/features/doctors";
import { aestheticsHours, clinicHours, holidayExceptions, type DailyHours } from "@/config/clinic-hours";
import { medicalServices } from "@/features/medical-services/data";
import { getRoute } from "@/lib/routing";
import { aestheticsId, clinicId, doctorEntityId } from "@/lib/seo/entity-graph";
import type { Locale } from "@/i18n/config";
import { schemaLanguage, siteOrigin, websiteId } from "./shared";
import type { JsonLdNode } from "./types";

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
 * MedicalClinic + Physician + WebSite graph for the homepage. One consistent
 * clinic entity is reused (via @id) rather than re-declared per page. No
 * reviews/ratings/awards are fabricated; only fields backed by approved source
 * content are emitted.
 *
 * No separate "Organization" node is emitted: schema.org's own type hierarchy
 * has `MedicalClinic` → `MedicalBusiness` → `LocalBusiness` → `Organization`,
 * so the MedicalClinic node below already satisfies an "Organization schema"
 * requirement without a redundant duplicate entity carrying the same @id and
 * facts.
 */
/**
 * The schedule as OpeningHoursSpecification nodes. Days the clinic is closed
 * (`null` in src/config/clinic-hours.ts) carry no opens/closes pair, which is
 * how schema.org expresses "not open that day" — CL-009.
 */
function toOpeningHours(schedule: DailyHours[]) {
  return schedule
    .filter((entry): entry is DailyHours & { open: string; close: string } =>
      entry.open !== null && entry.close !== null,
    )
    .map((entry) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${SCHEMA_DAYS[entry.day]}`,
      opens: entry.open,
      closes: entry.close,
    }));
}

export function buildClinicGraph(locale: Locale): JsonLdNode {
  // CL-009 — the client-approved schedule: Monday–Saturday 08:00–19:00,
  // Sunday closed. Sunday is omitted rather than emitted with a zero-length
  // window, which is how schema.org expresses a closed day; the visible
  // hours block on Contact and in the footer states "Sunday — Closed"
  // explicitly, so nothing is left to inference for a human reader.
  const openingHoursSpecification = toOpeningHours(clinicHours);
  // CL-010 — dated exceptions override the weekly pattern for search
  // engines the same way they do on the page.
  const specialOpeningHoursSpecification = holidayExceptions.map((h) => ({
    "@type": "OpeningHoursSpecification",
    validFrom: h.date,
    validThrough: h.date,
    ...(h.open && h.close ? { opens: h.open, closes: h.close } : { opens: "00:00", closes: "00:00" }),
  }));
  const aestheticsOpeningHours = toOpeningHours(aestheticsHours);

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

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalClinic",
        "@id": clinicId,
        name: siteConfig.clinic.name,
        ...(siteOrigin() ? { url: siteOrigin() } : {}),
        telephone: siteConfig.clinic.phoneDisplay,
        faxNumber: siteConfig.clinic.faxDisplay,
        // Explicit ContactPoint, distinct from the aesthetics department's
        // own one below — CONF-001 (2026-09-09): the two departments have
        // separate numbers again, so this must not be inferred from a single
        // top-level `telephone` field alone.
        contactPoint: {
          "@type": "ContactPoint",
          telephone: siteConfig.clinic.phoneDisplay,
          contactType: "Medical Clinic",
          areaServed: "CA",
          availableLanguage: ["en", "ar"],
        },
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
        inLanguage: schemaLanguage(locale),
        areaServed: {
          "@type": "City",
          name: siteConfig.clinic.address.city,
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: siteConfig.clinic.address.region,
          },
        },
        ...(openingHoursSpecification.length > 0 ? { openingHoursSpecification } : {}),
        ...(specialOpeningHoursSpecification.length > 0 ? { specialOpeningHoursSpecification } : {}),
        ...(availableService.length > 0 ? { availableService } : {}),
        // Closes the clinic -> physician direction of the graph. Each entry is a
        // reference to the same @id the doctor's own profile page emits
        // (buildPhysicianSchema), so the two pages describe one entity rather
        // than two look-alike copies.
        employee: doctors.map((doctor) => ({ "@id": doctorEntityId(doctor) })),
        // The homepage location card publishes the AESTHETICS arm's contact
        // details: a different approved phone line from the medical/walk-in
        // one and different hours (09:00-17:00 vs 08:00-19:00). Declaring it
        // as a department gives that rendered NAP a node in the graph, so the
        // visible number is backed by structured data instead of appearing to
        // contradict the MedicalClinic node's telephone. Same street address,
        // genuinely distinct line — docs/SOURCE_CONFLICT_REGISTER.md CONF-001.
        department: {
          "@type": "MedicalBusiness",
          "@id": aestheticsId,
          name: siteConfig.aesthetics.name,
          ...(siteOrigin() ? { url: siteOrigin() } : {}),
          telephone: siteConfig.aesthetics.phoneDisplay,
          faxNumber: siteConfig.aesthetics.faxDisplay,
          contactPoint: {
            "@type": "ContactPoint",
            telephone: siteConfig.aesthetics.phoneDisplay,
            contactType: "Medical Aesthetics",
            areaServed: "CA",
            availableLanguage: ["en", "ar"],
          },
          address: {
            "@type": "PostalAddress",
            streetAddress: siteConfig.clinic.address.line1,
            addressLocality: siteConfig.clinic.address.city,
            addressRegion: siteConfig.clinic.address.region,
            postalCode: siteConfig.clinic.address.postalCode,
            addressCountry: siteConfig.clinic.address.country,
          },
          parentOrganization: { "@id": clinicId },
          ...(aestheticsOpeningHours.length > 0
            ? { openingHoursSpecification: aestheticsOpeningHours }
            : {}),
        },
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
        "@id": websiteId,
        name: siteConfig.clinic.name,
        ...(siteOrigin() ? { url: siteOrigin() } : {}),
        publisher: { "@id": clinicId },
        inLanguage: [schemaLanguage(locale)],
        // No SearchAction — the site has no internal search feature, and
        // schema.org's own guidance is not to declare potentialAction for
        // a capability that doesn't exist.
      },
    ],
  };
}
