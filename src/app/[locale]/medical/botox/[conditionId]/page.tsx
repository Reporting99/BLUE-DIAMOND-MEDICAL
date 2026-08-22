import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { features } from "@/config/features";
import { getMedicalBotoxCondition } from "@/content/medical-botox";
import { MedicalServiceTemplate } from "@/templates/MedicalServiceTemplate";
import { getRouteMetadata } from "@/lib/seo/metadata";

/**
 * Feature-flagged off — see src/content/medical-botox.ts. No
 * generateStaticParams here: while disabled, nothing pre-renders, and any
 * direct request 404s via notFound() below rather than exposing a
 * duplicate-content page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; conditionId: string }>;
}): Promise<Metadata> {
  if (!features.medicalBotoxDetailPagesEnabled) return {};
  const { locale: rawLocale, conditionId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const condition = getMedicalBotoxCondition(conditionId);
  if (!condition) return {};

  return getRouteMetadata(`medical-botox-${condition.id}`, locale, {
    description: { en: condition.summary.en, ar: condition.summary.ar },
  });
}

export default async function MedicalBotoxConditionPage({
  params,
}: {
  params: Promise<{ locale: string; conditionId: string }>;
}) {
  if (!features.medicalBotoxDetailPagesEnabled) notFound();

  const { locale: rawLocale, conditionId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const condition = getMedicalBotoxCondition(conditionId);
  if (!condition) notFound();

  return <MedicalServiceTemplate service={condition} locale={locale} />;
}
