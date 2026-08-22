import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { concerns, getConcern } from "@/content/concerns";
import { ConcernTemplate } from "@/templates/ConcernTemplate";
import { getRouteMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return locales.flatMap((locale) => concerns.map((c) => ({ locale, concernId: c.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; concernId: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, concernId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const concern = getConcern(concernId);
  if (!concern) return {};

  return getRouteMetadata(`concern-${concern.id}`, locale, {
    description: { en: concern.summary.en, ar: concern.summary.ar },
  });
}

export default async function ConcernPage({ params }: { params: Promise<{ locale: string; concernId: string }> }) {
  const { locale: rawLocale, concernId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const concern = getConcern(concernId);
  if (!concern) notFound();

  return <ConcernTemplate concern={concern} locale={locale} />;
}
