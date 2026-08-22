import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { treatments, getTreatment, getGatedTreatment } from "@/content/treatments";
import { AestheticTreatmentTemplate } from "@/templates/AestheticTreatmentTemplate";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { features, type FeatureFlags } from "@/config/features";
import { resolvePageContent, entityCacheTags } from "@/lib/feelstack/page-resolver";
import { cacheTags } from "@/lib/feelstack/cache-tags";
import { cmsAestheticTreatmentSchema } from "@/lib/feelstack/schemas";

// Only published treatments are statically pre-rendered. Gated treatments
// (see src/content/treatments.ts) are intentionally excluded here — if
// their feature flag is ever enabled, the page still resolves correctly
// on demand (Next.js falls back to dynamic rendering for a param combo
// outside generateStaticParams), it just isn't pre-built while disabled.
export function generateStaticParams() {
  return locales.flatMap((locale) => treatments.map((t) => ({ locale, treatmentId: t.slug })));
}


/**
 * Hybrid FeelStack resolution for this entity type, following the reference
 * pattern in medical/[serviceId]. In the default FEELSTACK_CONTENT_MODE=static
 * this never touches the network: resolvePageContent goes straight to
 * staticFallback(), so behaviour is unchanged from before this pass.
 *
 * The tags are what let the publish webhook invalidate this entry — see
 * entityCacheTags() in page-resolver.ts.
 */
async function loadTreatment(id: string, locale: Locale) {
  const cmsPath = `/aesthetics/treatments/${id}`;
  const resolution = await resolvePageContent({
    path: cmsPath,
    locale,
    schema: cmsAestheticTreatmentSchema,
    staticFallback: () => getTreatment(id),
    tags: entityCacheTags({
      detail: cacheTags.aestheticTreatment,
      index: cacheTags.aestheticTreatmentsIndex,
      locale,
      id,
      path: cmsPath,
    }),
  });
  return resolution.source === "not-found" ? undefined : resolution.data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; treatmentId: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, treatmentId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const treatment = await loadTreatment(treatmentId, locale);
  if (!treatment) return {};

  return getRouteMetadata(`treatment-${treatment.id}`, locale, {
    description: { en: treatment.summary.en, ar: treatment.summary.ar },
  });
}

export default async function TreatmentPage({
  params,
}: {
  params: Promise<{ locale: string; treatmentId: string }>;
}) {
  const { locale: rawLocale, treatmentId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  const treatment = await loadTreatment(treatmentId, locale);
  if (treatment) {
    return <AestheticTreatmentTemplate treatment={treatment} locale={locale} />;
  }

  // Fully built but feature-flagged off — see src/content/treatments.ts
  // `gatedTreatments` and docs/CONTENT_MODEL.md.
  const gated = getGatedTreatment(treatmentId);
  if (gated && features[gated.requiresFeature as keyof FeatureFlags]) {
    return <AestheticTreatmentTemplate treatment={gated} locale={locale} />;
  }

  notFound();
}

export const dynamicParams = true;
