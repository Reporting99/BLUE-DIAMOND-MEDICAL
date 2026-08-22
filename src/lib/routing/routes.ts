import { routes } from "@/config/routes";
import type { RouteEntry } from "@/types/route";
import type { Locale } from "@/i18n/config";

/**
 * Route helpers. The registry itself is data and lives in
 * `@/config/routes`; everything that *derives* something from it lives here,
 * so no component ever reimplements URL construction. Never hardcode a path
 * in a component — resolve it through `href()` or `localePath()`.
 */
export function getRoute(id: string): RouteEntry | undefined {
  return routes.find((r) => r.id === id);
}

export function localePath(id: string, locale: Locale): string {
  const route = getRoute(id);
  if (!route) throw new Error(`Unknown route id: ${id}`);
  return route.path[locale];
}

export function navRoutes(): RouteEntry[] {
  return routes.filter((r) => r.inNav);
}

/** Full locale-prefixed href for a route id, e.g. href("contact", "ar") -> "/ar/تواصل-معنا". */
export function href(id: string, locale: Locale): string {
  return `/${locale}${localePath(id, locale)}`;
}

/** Routes the sitemap is allowed to list. */
export function sitemapRoutes(): RouteEntry[] {
  return routes.filter((r) => r.inSitemap);
}

/** Routes whose registry entry marks them indexable. */
export function indexableRoutes(): RouteEntry[] {
  return routes.filter((r) => r.indexing === "index");
}
