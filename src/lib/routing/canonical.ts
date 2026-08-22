import { siteConfig } from "@/config/site";
import type { RouteEntry } from "@/types/route";
import type { Locale } from "@/i18n/config";

/**
 * Canonical and hreflang URL construction — the single definition of what a
 * page's absolute URL is. Every route gets a *self-referencing* canonical;
 * Arabic pages are never canonicalized to their English counterpart.
 *
 * These always point at the real launch domain (`siteConfig.url`): they are
 * stable, correct, and must not churn at launch. Nothing here ever emits a
 * temporary or runtime hostname.
 */
export function absoluteRouteUrl(route: Pick<RouteEntry, "path">, locale: Locale): string {
  return `${siteConfig.url}/${locale}${route.path[locale]}`;
}

export function canonicalUrl(route: Pick<RouteEntry, "path">, locale: Locale): string {
  return absoluteRouteUrl(route, locale);
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
