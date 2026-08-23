import { buildMedicalWebPageSchema } from "@/lib/schema";
import type { Locale } from "@/i18n/config";
import { JsonLd } from "./JsonLd";

/** MedicalWebPage node for medical-service and aesthetic-treatment detail pages. */
export function MedicalWebPageSchema(props: {
  locale: Locale;
  name: string;
  description: string;
  path: string;
}) {
  return <JsonLd data={buildMedicalWebPageSchema(props)} />;
}
