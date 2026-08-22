import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { medicalServices, getMedicalService } from "@/content/medical-services";
import { MedicalServiceTemplate } from "@/templates/MedicalServiceTemplate";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { resolvePageContent } from "@/lib/feelstack/page-resolver";
import { cmsMedicalServiceSchema } from "@/lib/feelstack/schemas";

export function generateStaticParams() {
  return locales.flatMap((locale) => medicalServices.map((service) => ({ locale, serviceId: service.slug })));
}

/**
 * Reference implementation of the hybrid FeelStack resolution pattern —
 * see docs/FEELSTACK.md for how this generalizes to
 * doctors/products/treatments/concerns/technologies/articles/legal pages.
 * In this build's default `FEELSTACK_CONTENT_MODE=static`,
 * `resolvePageContent` never touches the network — it goes straight to
 * `staticFallback()`, so this page's behavior is unchanged from before
 * this pass.
 */
async function loadMedicalService(serviceId: string, locale: Locale) {
  const resolution = await resolvePageContent({
    path: `/medical/${serviceId}`,
    locale,
    schema: cmsMedicalServiceSchema,
    staticFallback: () => getMedicalService(serviceId),
  });
  return resolution.source === "not-found" ? undefined : resolution.data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; serviceId: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, serviceId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const service = await loadMedicalService(serviceId, locale);
  if (!service) return {};

  return getRouteMetadata(`medical-${service.id}`, locale, {
    description: { en: service.summary.en, ar: service.summary.ar },
  });
}

export default async function MedicalServicePage({
  params,
}: {
  params: Promise<{ locale: string; serviceId: string }>;
}) {
  const { locale: rawLocale, serviceId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const service = await loadMedicalService(serviceId, locale);
  if (!service) notFound();

  return <MedicalServiceTemplate service={service} locale={locale} />;
}
