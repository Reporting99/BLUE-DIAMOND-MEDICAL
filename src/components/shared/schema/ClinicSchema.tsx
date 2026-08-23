import { buildClinicGraph } from "@/lib/schema";
import type { Locale } from "@/i18n/config";
import { JsonLd } from "./JsonLd";

/** MedicalClinic + Physician + WebSite graph — emitted once, on the homepage. */
export function ClinicSchema({ locale }: { locale: Locale }) {
  return <JsonLd data={buildClinicGraph(locale)} />;
}
