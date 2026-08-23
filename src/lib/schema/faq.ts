import type { Locale } from "@/i18n/config";
import type { FaqEntry, JsonLdNode } from "./types";

/**
 * `FAQPage` built from the exact same FAQ array a template renders visibly —
 * never a separate/invented list, per the brief's rule "FAQ schema must exactly
 * match visible FAQ content". Callers are responsible for not emitting this on
 * a page with no visible FAQs.
 */
export function buildFaqPageSchema(faqs: FaqEntry[], locale: Locale): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question[locale],
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer[locale],
      },
    })),
  };
}
