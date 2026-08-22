import { buildPhysicianSchema } from "@/lib/schema";
import type { Doctor } from "@/features/doctors";
import type { Locale } from "@/i18n/config";
import { JsonLd } from "./JsonLd";

/** Physician node for an individual doctor profile page. */
export function PhysicianSchema(props: { doctor: Doctor; locale: Locale; path: string }) {
  return <JsonLd data={buildPhysicianSchema(props)} />;
}
