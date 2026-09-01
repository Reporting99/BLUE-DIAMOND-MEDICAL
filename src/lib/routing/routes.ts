import { routes } from "@/config/routes";
import { localizedEntityRoutes } from "@/config/localized-entity-routes.generated";
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

/** Full locale-prefixed href for a route id, e.g. href("contact", "ar") -> "/ar/تواصل-معنا". */
export function href(id: string, locale: Locale): string {
  return `/${locale}${localePath(id, locale)}`;
}

/**
 * The path to ask FeelStack for, for THIS locale.
 *
 * FeelStack registers one route per locale, and the Arabic route's path is the
 * Arabic pretty slug (`/الأطباء/محمد-فرحات`), not the English physical one. A
 * page whose Next.js segment is the English slug must therefore translate
 * before it asks the CMS, or it asks for a path that only exists in English.
 *
 * What happened when it did not: `resolve(path=/doctors/mohamed-farhat,
 * locale=ar)` answers `resolvedLocale: "en", usedFallback: true` — the backend
 * correctly reporting "I have no Arabic route at that path, here is the English
 * one". `locale-integrity` then correctly refuses it, because rendering English
 * biography text on an Arabic medical page is worse than rendering nothing. The
 * page fell back to static content, and every Arabic page lost its CMS media.
 *
 * The fix is to ask the right question, NOT to relax that check. This looks the
 * locale's real path up in the same registry that generates the public URLs, so
 * the CMS request and the address bar always agree, and it costs no extra
 * request — the alternative, resolving in English first to read
 * `route.alternates`, would double CMS load on every Arabic page.
 *
 * Falls back to the English path when the route is not in the registry, which
 * preserves today's behaviour for anything unregistered rather than throwing.
 */
export function cmsPathForLocale(englishPath: string, locale: Locale): string {
  if (locale === "en") return englishPath;
  const route = routes.find((r) => r.path.en === englishPath);
  if (route) return route.path[locale];
  // Entity routes live in the generated CMS artifact rather than the
  // hand-maintained registry -- see localized-entity-routes.generated.ts.
  const entity = localizedEntityRoutes.find((r) => r.en === englishPath);
  return entity ? entity.ar : englishPath;
}

/**
 * The inverse of `cmsPathForLocale`: the English physical path for a path in
 * any locale.
 *
 * An adapter receives `path` already localized — the Arabic entry's path is
 * the Arabic pretty slug — and several of them need the ASCII English slug
 * back out of it (see `entitySlug` in lib/feelstack/adapters.ts). Deriving it
 * by transliteration is not possible and not permitted; the Arabic slugs were
 * authored in the CMS, so the only correct answer is the same lookup table
 * that produced them, read the other way round.
 *
 * Returns `path` unchanged when nothing matches, which is the right answer for
 * an English path (it is already English) and the safe one for a route the
 * registry has not caught up with yet.
 */
export function englishPathFor(path: string, locale: Locale): string {
  if (locale === "en") return path;
  const route = routes.find((r) => r.path[locale] === path);
  if (route) return route.path.en;
  const entity = localizedEntityRoutes.find((r) => r.ar === path);
  return entity ? entity.en : path;
}
