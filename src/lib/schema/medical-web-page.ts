import { clinicId } from "@/lib/seo/entity-graph";
import type { Locale } from "@/i18n/config";
import { absoluteUrl, schemaLanguage } from "./shared";
import type { JsonLdNode } from "./types";

/**
 * `MedicalWebPage` for individual medical-service and aesthetic-treatment
 * pages.
 *
 * Deliberately narrow: only `name`, `description`, `url`, and a reference back
 * to the one clinic `@id` already declared on the homepage are emitted — no
 * `MedicalProcedure` claims (risk, cost, preparation, outcome data), since the
 * approved source content doesn't carry that level of structured clinical
 * detail and inventing it would violate the "never fabricate structured data"
 * rule. `medicalAudience` is omitted for the same reason — the source never
 * states an age/audience restriction per service.
 */
export function buildMedicalWebPageSchema({
  locale,
  name,
  description,
  path,
}: {
  locale: Locale;
  name: string;
  description: string;
  path: string;
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name,
    description,
    url: absoluteUrl(locale, path),
    inLanguage: schemaLanguage(locale),
    publisher: { "@id": clinicId },
    about: { "@id": clinicId },
  };
}
