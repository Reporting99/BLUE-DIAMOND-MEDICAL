/**
 * Public entry point for the routing layer: route lookup, localized paths,
 * canonical/hreflang URL construction, and legacy redirects. Components import
 * from here rather than reaching into `@/config/routes` directly.
 */
export { routes } from "@/config/routes";
export type { RouteEntry } from "@/types/route";
export { getRoute, href, localePath, cmsPathForLocale } from "./routes";
export { absoluteRouteUrl, hreflangAlternates } from "./canonical";
export { legacyRedirects } from "./legacy-redirects";
