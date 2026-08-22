import { buildFaqPageSchema } from "@/lib/schema";
import type { FaqEntry } from "@/lib/schema";
import type { Locale } from "@/i18n/config";
import { JsonLd } from "./JsonLd";

/** FAQPage node — only render this where the same FAQs are visibly on the page. */
export function FaqPageSchema({ faqs, locale }: { faqs: FaqEntry[]; locale: Locale }) {
  return <JsonLd data={buildFaqPageSchema(faqs, locale)} />;
}
