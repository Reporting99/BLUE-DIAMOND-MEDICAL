import { siteConfig } from "@/config/site";
import { doctors } from "@/types/doctor";
import type { Locale } from "@/i18n/config";

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
      },
      // Physician entities are emitted for every doctor regardless of photo
      // availability — schema data and image status are independent.
      ...doctors.map((doctor) => ({
        "@type": "Physician",
        name: doctor.name[locale],
        medicalSpecialty: "FamilyPractice",
        worksFor: { "@id": clinicId },
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
