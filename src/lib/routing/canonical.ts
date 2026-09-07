import { siteConfig } from "@/config/site";
import type { RouteEntry } from "@/types/route";
import type { Locale } from "@/i18n/config";

/**
 * Canonical and hreflang URL construction — the single definition of what a
 * page's absolute URL is. Every route gets a *self-referencing* canonical;
 * Arabic pages are never canonicalized to their English counterpart.
 *
 * These are built from the deployment's CONFIGURED origin (`siteConfig.url`,
 * resolved from SITE_URL — see src/config/site-url.ts). Nothing here ever
 * emits a temporary or runtime hostname: when no origin is configured
 * `siteConfig.url` is "", so the result is a root-relative path.
 *
 * A relative value is NOT publishable as a canonical or hreflang href — Next
 * would resolve it against `metadataBase`, which defaults to localhost. Every
 * caller that emits these into <head> or the sitemap must therefore check
 * `siteUrlIsConfigured()` and omit the tag entirely when it is false. That is
 * enforced in src/lib/seo/metadata.ts, src/app/[locale]/layout.tsx and
 * src/app/sitemap.ts, and asserted by tests/seo/site-url-config.spec.ts.
 */
export function absoluteRouteUrl(route: Pick<RouteEntry, "path">, locale: Locale): string {
  // The homepage's registry path is "/", so a naive join produces
  // "<origin>/en/" — with a trailing slash. Next serves this app with
  // `trailingSlash: false`, so "/en/" answers a 308 to "/en".
  //
  // That made the site's single most important page canonicalise THROUGH a
  // redirect, in both locales, and put two redirecting URLs in the sitemap:
  //   <link rel="canonical" href="https://…/en/">   -> 308 -> /en
  //   hreflang en-CA / ar-CA / x-default            -> same
  // A canonical that redirects is a canonical search engines may disregard,
  // and a redirecting sitemap entry is a crawl-budget warning in Search
  // Console. Both were invisible because every OTHER route's path already
  // starts with a segment and never produced a trailing slash.
  //
  // Normalising here rather than at each call site is deliberate: this is the
  // one function that defines a page's absolute URL, and the sitemap, the
  // canonical tag and the hreflang set all read it, so they cannot disagree.
  const url = `${siteConfig.url}/${locale}${route.path[locale]}`;
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/** hreflang alternates map for a route, including the x-default pointer. */
export function hreflangAlternates(route: Pick<RouteEntry, "path">): Record<string, string> {
  const enUrl = absoluteRouteUrl(route, "en");
  const arUrl = absoluteRouteUrl(route, "ar");
  return {
    "en-CA": enUrl,
    "ar-CA": arUrl,
    "x-default": enUrl,
  };
}
