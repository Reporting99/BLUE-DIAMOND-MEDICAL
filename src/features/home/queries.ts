import { medicalServices } from "@/features/medical-services/data";
import { technologies } from "@/features/technologies/data";
import { treatments } from "@/features/aesthetics/data/treatments";
import { concerns } from "@/features/concerns/data";
import { products } from "@/features/products/data";
import type { Technology } from "@/features/technologies/types";
import type { AestheticTreatment } from "@/features/aesthetics/types";
import type { AestheticConcern } from "@/features/concerns/types";
import type { Locale } from "@/i18n/config";
import {
  homepageCopy,
  PRODUCT_SHOWCASE_IDS,
  SERVICE_CARD_ORDER,
  TECH_SHOWCASE_ORDER,
  TREATMENT_SHOWCASE_ORDER,
} from "./copy";

/**
 * Homepage showcase selection. Every entry is looked up by id in an existing
 * approved content array — the homepage never authors its own facts, it only
 * chooses which already-published entities to feature and in what order. An id
 * with no matching entity is dropped rather than rendered as a dead card.
 */
export function getHomeShowcases(locale: Locale) {
  const copy = homepageCopy[locale];

  const serviceCards = [
    ...SERVICE_CARD_ORDER.map((id) => {
      const service = medicalServices.find((s) => s.id === id);
      if (!service) return null;
      return {
        id: service.id,
        routeId: `medical-${service.id}`,
        title: service.title,
        short: service.summary,
        long: service.whoItsFor ?? service.summary,
        ctaLabel: copy.medicalCardCtas[service.id] ?? copy.medicalDepthCta,
      };
    }),
    {
      id: "uninsured-services",
      routeId: "medical-uninsured-services",
      title: copy.uninsuredServicesCard.title,
      short: copy.uninsuredServicesCard.short,
      long: copy.uninsuredServicesCard.long,
      ctaLabel: copy.medicalCardCtas["uninsured-services"] ?? copy.medicalDepthCta,
    },
  ].filter((c): c is NonNullable<typeof c> => Boolean(c));

  const techShowcase = TECH_SHOWCASE_ORDER.map((id) => technologies.find((t) => t.id === id)).filter((t): t is Technology => Boolean(t));
  const treatmentShowcase = TREATMENT_SHOWCASE_ORDER.map((id) => treatments.find((t) => t.id === id)).filter((t): t is AestheticTreatment => Boolean(t));
  const productShowcase = PRODUCT_SHOWCASE_IDS.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return { serviceCards, techShowcase, treatmentShowcase, productShowcase };
}

/** The concern whose own content lists this treatment — an existing edge, read backwards. */
export function concernForTreatment(treatmentId: string): AestheticConcern | undefined {
  return concerns.find((c) => c.relatedTreatmentIds.includes(treatmentId));
}

/** FAQPage entries built from the same array the homepage renders visibly. */
export function homeFaqSchemaEntries(locale: Locale) {
  return homepageCopy[locale].faqs.map((faq) => ({
    question: { en: faq.q, ar: faq.q },
    answer: { en: faq.a, ar: faq.a },
  }));
}
