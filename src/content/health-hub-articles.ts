import type { HealthHubArticle } from "@/types/article";

/**
 * Health Hub article store — brief §21. Zero entries: no article copy has
 * been supplied or medically reviewed for Blue Diamond Medical yet. The
 * type model, card rendering, and article template are fully built (see
 * src/templates/HealthHubArticleTemplate.tsx and
 * src/app/[locale]/health-hub/[articleId]/page.tsx) so publishing the
 * first article is a matter of adding one typed entry here — reviewed and
 * approved first, per brief §21 ("Do not publish machine-generated
 * medical claims without review"). See docs/CONTENT_MODEL.md.
 */
export const healthHubArticles: HealthHubArticle[] = [];

export function getHealthHubArticle(slug: string): HealthHubArticle | undefined {
  return healthHubArticles.find((a) => a.slug === slug);
}
