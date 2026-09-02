import type { Doctor } from "@/features/doctors";
import { medicalServices } from "@/features/medical-services/data";
import type { MedicalServiceContent } from "@/features/medical-services/types";
import { siteConfig } from "@/config/site";
import { getRoute } from "@/lib/routing";
import type { Locale } from "@/i18n/config";

/**
 * Deterministic entity graph — brief §13.
 *
 * Every edge here is *derived* from relationships that already exist in the
 * approved content data; none is authored in this module. Specifically, the
 * doctor -> service edge is the inverse of `MedicalServiceContent.relatedDoctorIds`
 * (src/features/medical-services/data.ts), which is itself source-verified against the
 * approved content-extraction document. Inverting an existing edge invents no
 * new clinical claim: if the content says "Chronic Disease Management is
 * delivered by Dr. Bakare", then "Dr. Bakare is related to Chronic Disease
 * Management" is the same fact read the other way.
 *
 * Doctors with no such reference simply have no related services — the callers
 * omit the section rather than filling it, matching the repository-wide rule
 * that a missing field means an omitted section, never placeholder text.
 */

/** Stable JSON-LD `@id` for the one clinic entity declared on the homepage. */
export const clinicId = `${siteConfig.url}/#clinic`;

/**
 * Stable JSON-LD `@id` for the aesthetics arm. It is a separate node, not a
 * second copy of the clinic: it operates from the same street address but
 * publishes its own telephone line and its own opening hours
 * (docs/SOURCE_CONFLICT_REGISTER.md CONF-001), and the homepage location
 * card renders those, so the graph has to be able to name it.
 */
export const aestheticsId = `${siteConfig.url}/#aesthetics`;

/** Stable JSON-LD `@id` for a doctor, so nodes can reference each other by id. */
export function doctorEntityId(doctor: Pick<Doctor, "id">): string {
  return `${siteConfig.url}/#physician-${doctor.id}`;
}

/**
 * Medical services that name this doctor in their own `relatedDoctorIds`.
 * Order follows `medicalServices` so output is deterministic across builds.
 */
export function servicesForDoctor(doctorId: string): MedicalServiceContent[] {
  return medicalServices.filter((service) => service.relatedDoctorIds.includes(doctorId));
}

/** Absolute, locale-correct URL for a medical-service detail page. */
export function serviceUrl(service: Pick<MedicalServiceContent, "id">, locale: Locale): string | undefined {
  const route = getRoute(`medical-${service.id}`);
  if (!route) return undefined;
  return `${siteConfig.url}/${locale}${route.path[locale]}`;
}
