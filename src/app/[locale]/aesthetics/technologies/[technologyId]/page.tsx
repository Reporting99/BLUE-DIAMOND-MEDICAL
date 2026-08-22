import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { technologies, getTechnology } from "@/content/technologies";
import { TechnologyTemplate } from "@/templates/TechnologyTemplate";
import { getRouteMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return locales.flatMap((locale) => technologies.map((tech) => ({ locale, technologyId: tech.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; technologyId: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, technologyId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const technology = getTechnology(technologyId);
  if (!technology) return {};

  return getRouteMetadata(`technology-${technology.id}`, locale, {
    description: { en: technology.summary.en, ar: technology.summary.ar },
  });
}

export default async function TechnologyPage({
  params,
}: {
  params: Promise<{ locale: string; technologyId: string }>;
}) {
  const { locale: rawLocale, technologyId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const technology = getTechnology(technologyId);
  if (!technology) notFound();

  return <TechnologyTemplate technology={technology} locale={locale} />;
}
