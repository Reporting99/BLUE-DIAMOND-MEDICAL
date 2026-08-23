import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { technologies, getTechnology } from "@/features/technologies";
import { TechnologyTemplate } from "@/features/technologies";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { resolvePageContent, entityCacheTags } from "@/lib/feelstack/page-resolver";
import { cacheTags } from "@/lib/feelstack/cache-tags";
import { cmsTechnologySchema } from "@/lib/feelstack/schemas";

export function generateStaticParams() {
  return locales.flatMap((locale) => technologies.map((tech) => ({ locale, technologyId: tech.slug })));
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
async function loadTechnology(id: string, locale: Locale) {
  const cmsPath = `/aesthetics/technologies/${id}`;
  const resolution = await resolvePageContent({
    path: cmsPath,
    locale,
    schema: cmsTechnologySchema,
    staticFallback: () => getTechnology(id),
    tags: entityCacheTags({
      detail: cacheTags.technology,
      index: cacheTags.technologiesIndex,
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
  params: Promise<{ locale: string; technologyId: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, technologyId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const technology = await loadTechnology(technologyId, locale);
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
  const technology = await loadTechnology(technologyId, locale);
  if (!technology) notFound();

  return <TechnologyTemplate technology={technology} locale={locale} />;
}
