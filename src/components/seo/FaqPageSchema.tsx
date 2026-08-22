import type { Locale } from "@/i18n/config";

interface FaqEntry {
  question: { en: string; ar: string };
  answer: { en: string; ar: string };
}

/**
 * `FAQPage` JSON-LD generated from the exact same FAQ array a template
 * renders visibly — never a separate/invented list, per the brief's rule
 * "FAQ schema must exactly match visible FAQ content" and "do not add FAQ
 * schema to pages without visible FAQs" (only rendered when `faqs.length`
 * is truthy by the caller). Same pattern already used for the homepage's
 * FAQPage block, extracted here so every template with a `faqs` field can
 * reuse it instead of hand-rolling the schema shape again.
 */
export function FaqPageSchema({ faqs, locale }: { faqs: FaqEntry[]; locale: Locale }) {
  const schema = {
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

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
