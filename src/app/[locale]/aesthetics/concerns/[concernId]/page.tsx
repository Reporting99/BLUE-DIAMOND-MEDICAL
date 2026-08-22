import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { concerns, getConcern } from "@/features/concerns";
import { ConcernTemplate } from "@/features/concerns";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { resolvePageContent, entityCacheTags } from "@/lib/feelstack/page-resolver";
import { cacheTags } from "@/lib/feelstack/cache-tags";
import { cmsAestheticConcernSchema } from "@/lib/feelstack/schemas";

export function generateStaticParams() {
  return locales.flatMap((locale) => concerns.map((c) => ({ locale, concernId: c.slug })));
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
async function loadConcern(id: string, locale: Locale) {
  const cmsPath = `/aesthetics/concerns/${id}`;
  const resolution = await resolvePageContent({
    path: cmsPath,
    locale,
    schema: cmsAestheticConcernSchema,
    staticFallback: () => getConcern(id),
    tags: entityCacheTags({
      detail: cacheTags.concern,
      index: cacheTags.concernsIndex,
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
  params: Promise<{ locale: string; concernId: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, concernId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const concern = await loadConcern(concernId, locale);
  if (!concern) return {};

  return getRouteMetadata(`concern-${concern.id}`, locale, {
    description: { en: concern.summary.en, ar: concern.summary.ar },
  });
}

export default async function ConcernPage({ params }: { params: Promise<{ locale: string; concernId: string }> }) {
  const { locale: rawLocale, concernId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const concern = await loadConcern(concernId, locale);
  if (!concern) notFound();

  return <ConcernTemplate concern={concern} locale={locale} />;
}
