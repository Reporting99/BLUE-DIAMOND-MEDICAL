/**
 * No `import "server-only"` here deliberately: this module is pure string
 * builders with no env/secret access, and needs to be importable by
 * tests/cache/cache-tag-coverage.spec.ts outside Next's build pipeline
 * (the `server-only` package throws when loaded by a plain bundler that
 * isn't Next's own server compiler). The real credentialed boundary is
 * `src/lib/feelstack/client.ts`, which does keep the guard.
 *
 * Centralized cache-tag registry — brief §8. Every tag Blue Diamond's
 * FeelStack integration can generate is built here, and nowhere else —
 * components/pages import these builders instead of hand-writing tag
 * strings, so there is exactly one place that defines the tag namespace.
 *
 * Coverage matches the brief's minimum list: site, site settings, routes,
 * page (locale+path), navigation, footer, SEO, sitemap, doctors, medical
 * services, aesthetic treatments, concerns, technologies, products,
 * product details, Health Hub indexes, Health Hub articles, legal pages,
 * booking configuration.
 *
 * Every key here MUST have a matching entry in `invalidationCoverage`
 * (./revalidation.ts) — enforced by tests/cache/cache-tag-coverage.spec.ts.
 */
export const cacheTags = {
  site: (siteKey: string) => `feelstack-site:${siteKey}`,
  siteSettings: (siteKey: string) => `feelstack-site-settings:${siteKey}`,
  routes: (siteKey: string) => `feelstack-routes:${siteKey}`,
  page: (siteKey: string, locale: string, path: string) => `feelstack-page:${siteKey}:${locale}:${path}`,
  navigation: (siteKey: string, locale: string) => `feelstack-navigation:${siteKey}:${locale}`,
  footer: (siteKey: string, locale: string) => `feelstack-footer:${siteKey}:${locale}`,
  seo: (siteKey: string, locale: string, path: string) => `feelstack-seo:${siteKey}:${locale}:${path}`,
  sitemap: (siteKey: string) => `feelstack-sitemap:${siteKey}`,
  doctorsIndex: (siteKey: string, locale: string) => `feelstack-doctors:${siteKey}:${locale}`,
  doctor: (siteKey: string, locale: string, id: string) => `feelstack-doctor:${siteKey}:${locale}:${id}`,
  medicalServicesIndex: (siteKey: string, locale: string) => `feelstack-medical-services:${siteKey}:${locale}`,
  medicalService: (siteKey: string, locale: string, id: string) =>
    `feelstack-medical-service:${siteKey}:${locale}:${id}`,
  aestheticTreatmentsIndex: (siteKey: string, locale: string) =>
    `feelstack-aesthetic-treatments:${siteKey}:${locale}`,
  aestheticTreatment: (siteKey: string, locale: string, id: string) =>
    `feelstack-aesthetic-treatment:${siteKey}:${locale}:${id}`,
  concernsIndex: (siteKey: string, locale: string) => `feelstack-concerns:${siteKey}:${locale}`,
  concern: (siteKey: string, locale: string, id: string) => `feelstack-concern:${siteKey}:${locale}:${id}`,
  technologiesIndex: (siteKey: string, locale: string) => `feelstack-technologies:${siteKey}:${locale}`,
  technology: (siteKey: string, locale: string, id: string) => `feelstack-technology:${siteKey}:${locale}:${id}`,
  productsIndex: (siteKey: string, locale: string) => `feelstack-products:${siteKey}:${locale}`,
  product: (siteKey: string, locale: string, id: string) => `feelstack-product:${siteKey}:${locale}:${id}`,
  healthHubIndex: (siteKey: string, locale: string) => `feelstack-health-hub-index:${siteKey}:${locale}`,
  healthHubArticle: (siteKey: string, locale: string, id: string) =>
    `feelstack-health-hub-article:${siteKey}:${locale}:${id}`,
  legalPagesIndex: (siteKey: string, locale: string) => `feelstack-legal-pages:${siteKey}:${locale}`,
  legalPage: (siteKey: string, locale: string, id: string) => `feelstack-legal-page:${siteKey}:${locale}:${id}`,
  bookingConfig: (siteKey: string) => `feelstack-booking-config:${siteKey}`,
} as const;

export type CacheTagKey = keyof typeof cacheTags;
