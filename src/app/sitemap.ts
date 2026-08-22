import type { MetadataRoute } from "next";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { features, type FeatureFlags } from "@/config/features";
import { isSiteLaunched } from "@/config/launch";
import { listRoutes } from "@/lib/feelstack/client";
import { getFeelstackContentMode } from "@/lib/feelstack/content-mode";
import { locales, type Locale } from "@/i18n/config";

// Request-time, for the same reason as robots.ts — see src/config/launch.ts.
export const dynamic = "force-dynamic";

/**
 * CMS-owned pages that exist in FeelStack but have no entry in the local route
 * registry — brief §14. In the default `static` content mode this returns
 * nothing and makes no network request, so the sitemap is byte-identical to
 * the local-only version.
 *
 * `listRoutes` already filters to `status === "published"`, which is what keeps
 * unpublished FeelStack pages out of the sitemap. Anything the local registry
 * already covers is skipped so a page migrated to the CMS cannot appear twice.
 *
 * A CMS outage yields an empty list rather than throwing: a sitemap that is
 * briefly missing its CMS-only rows is recoverable, whereas a 500 on
 * /sitemap.xml makes Search Console drop the whole inventory.
 */
async function cmsOnlyEntries(knownPaths: ReadonlySet<string>): Promise<MetadataRoute.Sitemap> {
  if (getFeelstackContentMode() === "static") return [];

  const perLocale = await Promise.all(
    locales.map(async (locale: Locale) => {
      const cmsRoutes = await listRoutes(locale);
      return cmsRoutes
        .filter((route) => !knownPaths.has(`${locale}:${route.path}`))
        .map((route) => ({ url: `${siteConfig.url}/${locale}${route.path}` }));
    }),
  );

  return perLocale.flat();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // An unlaunched deployment publishes no URL inventory at all. Every entry
  // in a sitemap is an absolute URL on the launch domain, so a sitemap served
  // before launch can only ever invite crawling of a site that is not ready.
  if (!isSiteLaunched()) return [];

  const published = routes
    .filter((route) => route.inSitemap && route.indexing === "index")
    .filter((route) => !route.requiresFeature || features[route.requiresFeature as keyof FeatureFlags]);

  const localEntries = published.flatMap((route) => {
    const enUrl = `${siteConfig.url}/en${route.path.en}`;
    const arUrl = `${siteConfig.url}/ar${route.path.ar}`;
    const languages = { "en-CA": enUrl, "ar-CA": arUrl };

    return [
      { url: enUrl, alternates: { languages } },
      { url: arUrl, alternates: { languages } },
    ];
  });

  const knownPaths = new Set(published.flatMap((route) => [`en:${route.path.en}`, `ar:${route.path.ar}`]));

  return [...localEntries, ...(await cmsOnlyEntries(knownPaths))];
}
