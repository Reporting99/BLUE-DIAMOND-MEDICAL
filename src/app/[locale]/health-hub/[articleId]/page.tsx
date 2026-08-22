import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { healthHubArticles, getHealthHubArticle } from "@/content/health-hub-articles";
import { HealthHubArticleTemplate } from "@/templates/HealthHubArticleTemplate";
import { siteConfig } from "@/config/site";

/**
 * No articles exist yet (src/content/health-hub-articles.ts is an empty
 * array) — generateStaticParams returns nothing, and any slug 404s via
 * notFound() below. Template + type model are fully built (brief §21) so
 * the first approved, medically-reviewed article needs no new code, only
 * a new entry in the content file.
 */
export function generateStaticParams() {
  return healthHubArticles.map((a) => ({ articleId: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; articleId: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, articleId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const article = getHealthHubArticle(articleId);
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
  const article = getHealthHubArticle(articleId);
  if (!article) notFound();

  return <HealthHubArticleTemplate article={article} locale={locale} />;
}
