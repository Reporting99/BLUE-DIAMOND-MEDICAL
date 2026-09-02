/**
 * Public entry point for the routing layer: route lookup, localized paths,
 * canonical/hreflang URL construction, and the old-site legacy redirect map. Components import
 * from here rather than reaching into `@/config/routes` directly.
 */
export { routes } from "@/config/routes";
export type { RouteEntry } from "@/types/route";
export { getRoute, href, localePath, cmsPathForLocale, englishPathFor } from "./routes";
export { absoluteRouteUrl, hreflangAlternates } from "./canonical";
export { legacyRedirects } from "./legacy-redirects";
