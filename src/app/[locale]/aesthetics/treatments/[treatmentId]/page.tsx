import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { treatments, getTreatment, getGatedTreatment } from "@/content/treatments";
import { AestheticTreatmentTemplate } from "@/templates/AestheticTreatmentTemplate";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { features, type FeatureFlags } from "@/config/features";

// Only published treatments are statically pre-rendered. Gated treatments
// (see src/content/treatments.ts) are intentionally excluded here — if
// their feature flag is ever enabled, the page still resolves correctly
// on demand (Next.js falls back to dynamic rendering for a param combo
// outside generateStaticParams), it just isn't pre-built while disabled.
export function generateStaticParams() {
  return locales.flatMap((locale) => treatments.map((t) => ({ locale, treatmentId: t.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; treatmentId: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, treatmentId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const treatment = getTreatment(treatmentId);
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

  const treatment = getTreatment(treatmentId);
  if (treatment) {
    return <AestheticTreatmentTemplate treatment={treatment} locale={locale} />;
  }

  // Fully built but feature-flagged off — see src/content/treatments.ts
  // `gatedTreatments` and docs/MISSING_CONTENT_REPORT.md.
  const gated = getGatedTreatment(treatmentId);
  if (gated && features[gated.requiresFeature as keyof FeatureFlags]) {
    return <AestheticTreatmentTemplate treatment={gated} locale={locale} />;
  }

  notFound();
}

export const dynamicParams = true;
