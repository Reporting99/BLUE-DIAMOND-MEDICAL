import type { MetadataRoute } from "next";
import { hreflangAlternates, routes } from "@/lib/routing";
import { siteConfig } from "@/config/site";
import { features, type FeatureFlags } from "@/config/features";
import { isIndexingEnabled } from "@/config/launch";
import { getSiteConfig, listRoutes } from "@/lib/feelstack/client";
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
async function cmsOnlyEntries(
  knownPaths: ReadonlySet<string>,
  knownEnglishPaths: ReadonlySet<string>,
): Promise<MetadataRoute.Sitemap> {
  if (getFeelstackContentMode() === "static") return [];

  // `sitemap.enabled` is an advisory SITE-level setting the CMS exposes and
  // nothing server-side acts on, so honouring it is the frontend's job. It
  // gates only CMS-OWNED rows: the local route registry is Blue Diamond's own
  // inventory and is not FeelStack's to switch off.
  //
  // Fail OPEN — only an explicit `false` suppresses. `sitemap` is
  // `settings?.sitemap ?? {}` on the backend, so an unconfigured tenant sends
  // `{}`, and treating that absence as "off" would silently empty the CMS half
  // of the sitemap for every project that never touched the setting.
  const config = await getSiteConfig();
  if (config?.sitemap.enabled === false) return [];

  const perLocale = await Promise.all(
    locales.map(async (locale: Locale) => {
      const cmsRoutes = await listRoutes(locale);
      return cmsRoutes
        .filter((route) => !knownPaths.has(`${locale}:${route.path}`))
        /*
         * ...and not the SAME page under its ASCII CMS slug.
         *
         * `UpdatePageDto.slugSegment` is `^[a-z0-9]+(?:-[a-z0-9]+)*$`, so a
         * FeelStack *page* record is stored at the English path in BOTH
         * locales and disambiguated by `locale` — the Arabic /aesthetics page
         * is `/aesthetics`, not `/التجميل-الطبي`. `knownPaths` is keyed by the
         * app's own Arabic path, so it does not match, and publishing that
         * record would add a second, non-canonical `/ar/aesthetics` row beside
         * the canonical `/ar/التجميل-الطبي` one the registry already emits.
         *
         * Matching the English path across every locale closes that: a CMS
         * route whose path is a local route's English path is that local
         * route, whatever locale it is being listed for. CMS *content
         * entries* are unaffected — they carry real Arabic paths, which never
         * collide with an English one — so genuinely CMS-only rows still
         * appear.
         */
        .filter((route) => !knownEnglishPaths.has(route.path))
        .map((route) => {
          // Same trailing-slash normalisation as absoluteRouteUrl: a CMS route
          // whose path is "/" would otherwise put a URL in the sitemap that
          // answers a 308.
          const url = `${siteConfig.url}/${locale}${route.path}`;
          return { url: encodeSitemapUrl(url.endsWith("/") ? url.slice(0, -1) : url) };
        });
    }),
  );

  return perLocale.flat();
}

/**
 * Percent-encodes the non-ASCII parts of a sitemap URL.
 *
 * Arabic routes have Arabic slugs, so `<loc>` was emitting raw UTF-8
 * (`.../ar/الرعاية-الطبية`). The sitemap protocol requires entries to be
 * URL-escaped, and — more practically — every `<link rel="canonical">` and
 * `hreflang` tag the app renders IS percent-encoded, because Next encodes
 * them. So the sitemap and the page tags were spelling the same URL two
 * different ways. Search engines normalise both to the same address, but a
 * strict validator flags the raw form, and "the sitemap says X, the page says
 * Y" is exactly the kind of avoidable inconsistency this audit exists to
 * remove.
 *
 * `encodeURI`, not `encodeURIComponent`: the separators (`:` `/`) must
 * survive. It is a no-op on the ASCII English routes.
 */
function encodeSitemapUrl(url: string): string {
  return encodeURI(url);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // An unlaunched deployment publishes no URL inventory at all. Every entry
  // in a sitemap is an absolute URL on the launch domain, so a sitemap served
  // before launch can only ever invite crawling of a site that is not ready.
  //
  // This gate also covers "flag set but no SITE_URL": without an origin every
  // entry below would be a bare path, which is invalid in a sitemap. There is
  // no state in which this function emits a relative or placeholder URL.
  if (!isIndexingEnabled()) return [];

  const published = routes
    .filter((route) => route.inSitemap && route.indexing === "index")
    .filter((route) => !route.requiresFeature || features[route.requiresFeature as keyof FeatureFlags]);

  const localEntries = published.flatMap((route) => {
    // Same builder the page-level <link rel="alternate"> tags use, so the two
    // hreflang surfaces cannot disagree. This is why the sitemap now carries
    // x-default as well: it previously emitted only en-CA/ar-CA while
    // getRouteMetadata emitted x-default too, which is exactly the kind of
    // mismatch Search Console reports as an hreflang error.
    const languages = hreflangAlternates(route);

    const encoded = Object.fromEntries(
      Object.entries(languages).map(([key, value]) => [key, encodeSitemapUrl(value)]),
    );

    return [
      { url: encoded["en-CA"], alternates: { languages: encoded } },
      { url: encoded["ar-CA"], alternates: { languages: encoded } },
    ];
  });

  const knownPaths = new Set(published.flatMap((route) => [`en:${route.path.en}`, `ar:${route.path.ar}`]));

  const knownEnglishPaths = new Set(published.map((route) => route.path.en));

  return [...localEntries, ...(await cmsOnlyEntries(knownPaths, knownEnglishPaths))];
}
