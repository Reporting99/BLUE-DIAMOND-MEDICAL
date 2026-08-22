import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { healthHubArticles, getHealthHubArticle } from "@/features/health-hub/data";
import { HealthHubArticleTemplate } from "@/features/health-hub/components/HealthHubArticleTemplate";
import { siteConfig } from "@/config/site";
import { resolvePageContent, entityCacheTags } from "@/lib/feelstack/page-resolver";
import { cacheTags } from "@/lib/feelstack/cache-tags";
import { cmsHealthHubArticleSchema } from "@/lib/feelstack/schemas";

/**
 * No articles exist yet (src/features/health-hub/data.ts is an empty
 * array) — generateStaticParams returns nothing, and any slug 404s via
 * notFound() below. Template + type model are fully built (brief §21) so
 * the first approved, medically-reviewed article needs no new code, only
 * a new entry in the content file.
 */
export function generateStaticParams() {
  return healthHubArticles.map((a) => ({ articleId: a.slug }));
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
async function loadArticle(id: string, locale: Locale) {
  const cmsPath = `/health-hub/${id}`;
  const resolution = await resolvePageContent({
    path: cmsPath,
    locale,
    schema: cmsHealthHubArticleSchema,
    staticFallback: () => getHealthHubArticle(id),
    tags: entityCacheTags({
      detail: cacheTags.healthHubArticle,
      index: cacheTags.healthHubIndex,
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
  params: Promise<{ locale: string; articleId: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, articleId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const article = await loadArticle(articleId, locale);
  if (!article) return {};

  const enUrl = `${siteConfig.url}/en/health-hub/${article.slug}`;
  const arUrl = `${siteConfig.url}/ar/health-hub/${article.slugAr}`;

  return {
    title: article.title[locale],
    description: article.summary[locale],
    alternates: {
      canonical: locale === "ar" ? arUrl : enUrl,
      languages: { "en-CA": enUrl, "ar-CA": arUrl, "x-default": enUrl },
    },
  };
}

export default async function HealthHubArticlePage({
  params,
}: {
  params: Promise<{ locale: string; articleId: string }>;
}) {
  const { locale: rawLocale, articleId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const article = await loadArticle(articleId, locale);
  if (!article) notFound();

  return <HealthHubArticleTemplate article={article} locale={locale} />;
}
