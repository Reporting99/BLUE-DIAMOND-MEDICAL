// No `import "server-only"` here deliberately — see cache-tags.ts for why.
import { cacheTags, type CacheTagKey } from "./cache-tags";
import type { FeelstackWebhookEvent } from "./schemas";

/**
 * Cache-tag invalidation matrix — brief §8 ("Every generated cache tag
 * must have an invalidation path... Add a test that enumerates all
 * cache-tag builders and proves that each has a matching invalidation
 * rule"). Inverse of the natural direction (event -> tags) so the
 * completeness test can walk `cacheTags` and assert every key appears
 * here at least once — see tests/cache/cache-tag-coverage.spec.ts.
 *
 * Rules encoded (brief §8 specifics):
 *  - Product changes invalidate product detail + shop index + sitemap
 *    (+ navigation is NOT invalidated — products aren't in nav).
 *  - Article changes invalidate article detail + Health Hub index +
 *    sitemap.
 *  - Route changes invalidate route inventory + sitemap + navigation +
 *    the affected page tag.
 *  - Locale-specific changes only invalidate that locale's tags (the
 *    webhook handler passes `locale` through to the tag builders, not
 *    handled here).
 */
export const invalidationCoverage: Record<CacheTagKey, readonly FeelstackWebhookEvent[]> = {
  site: ["site-settings.updated"],
  siteSettings: ["site-settings.updated"],
  routes: ["route.changed"],
  page: ["page.published", "page.unpublished", "page.updated", "route.changed"],
  navigation: ["navigation.updated", "route.changed"],
  footer: ["footer.updated"],
  seo: ["page.published", "page.updated"],
  sitemap: [
    "route.changed",
    "page.published",
    "page.unpublished",
    "product.updated",
    "health-hub-article.published",
    "health-hub-article.updated",
  ],
  doctorsIndex: ["doctor.updated"],
  doctor: ["doctor.updated"],
  medicalServicesIndex: ["medical-service.updated"],
  medicalService: ["medical-service.updated"],
  aestheticTreatmentsIndex: ["aesthetic-treatment.updated"],
  aestheticTreatment: ["aesthetic-treatment.updated"],
  concernsIndex: ["concern.updated"],
  concern: ["concern.updated"],
  technologiesIndex: ["technology.updated"],
  technology: ["technology.updated"],
  productsIndex: ["product.updated"],
  product: ["product.updated"],
  healthHubIndex: ["health-hub-article.published", "health-hub-article.updated"],
  healthHubArticle: ["health-hub-article.published", "health-hub-article.updated"],
  legalPagesIndex: ["legal-page.updated"],
  legalPage: ["legal-page.updated"],
  bookingConfig: ["booking-config.updated"],
};

export interface RevalidationTarget {
  siteKey: string;
  locale?: "en" | "ar";
  entityId?: string;
  path?: string;
}

/**
 * Resolves which cache tags (as concrete strings) an incoming webhook
 * event must invalidate. Deliberately per-locale, not a global purge
 * (brief §8: "Avoid global cache purges unless the event truly affects
 * the entire site") — falls back to both locales only for
 * genuinely site-wide events (route/navigation/sitemap/site-settings).
 */
export function tagsForEvent(event: FeelstackWebhookEvent, target: RevalidationTarget): string[] {
  const { siteKey, locale, entityId, path } = target;
  const locales: ("en" | "ar")[] = locale ? [locale] : ["en", "ar"];
  const tags = new Set<string>();

  const affectedKeys = (Object.keys(invalidationCoverage) as CacheTagKey[]).filter((key) =>
    invalidationCoverage[key].includes(event),
  );

  for (const key of affectedKeys) {
    switch (key) {
      case "site":
      case "siteSettings":
      case "routes":
      case "sitemap":
      case "bookingConfig":
        tags.add(cacheTags[key](siteKey));
        break;
      case "page":
        if (path) locales.forEach((l) => tags.add(cacheTags.page(siteKey, l, path)));
        break;
      case "seo":
        if (path) locales.forEach((l) => tags.add(cacheTags.seo(siteKey, l, path)));
        break;
      case "navigation":
      case "footer":
      case "doctorsIndex":
      case "medicalServicesIndex":
      case "aestheticTreatmentsIndex":
      case "concernsIndex":
      case "technologiesIndex":
      case "productsIndex":
      case "healthHubIndex":
      case "legalPagesIndex":
        locales.forEach((l) => tags.add(cacheTags[key](siteKey, l)));
        break;
      case "doctor":
      case "medicalService":
      case "aestheticTreatment":
      case "concern":
      case "technology":
      case "product":
      case "healthHubArticle":
      case "legalPage":
        if (entityId) locales.forEach((l) => tags.add(cacheTags[key](siteKey, l, entityId)));
        break;
    }
  }

  return Array.from(tags);
}
