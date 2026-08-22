import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";

/**
 * `MedicalWebPage` JSON-LD for individual medical-service and
 * aesthetic-treatment pages — the gap tracked as "not yet implemented" in
 * docs/SEO_SCHEMA_SUMMARY.md, closed in this remediation pass.
 *
 * Deliberately narrow: only `name`, `description`, `url`, and a reference
 * back to the one clinic `@id` already declared on the homepage
 * (`DoctorOrganizationSchema`) are emitted — no `MedicalProcedure` claims
 * (risk, cost, preparation, outcome data), since the approved source
 * content doesn't carry that level of structured clinical detail and
 * inventing it would violate the brief's "never fabricate structured
 * data" rule. `medicalAudience` is omitted for the same reason — the
 * source never states an age/audience restriction per service.
 */
export function MedicalWebPageSchema({
  locale,
  name,
  description,
  path,
}: {
  locale: Locale;
  name: string;
  description: string;
  path: string;
}) {
  const clinicId = `${siteConfig.url}/#clinic`;
  const url = `${siteConfig.url}/${locale}${path}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name,
    description,
    url,
    inLanguage: locale === "ar" ? "ar-CA" : "en-CA",
    publisher: { "@id": clinicId },
    about: { "@id": clinicId },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
