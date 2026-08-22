import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { legacyRedirects } from "@/lib/seo/legacy-redirects";
import { routes } from "@/config/routes";
import { isSiteLaunched, PRE_LAUNCH_ROBOTS_HEADER } from "@/config/launch";

/**
 * Arabic public URLs use meaningful Arabic slugs (e.g. /ar/الأطباء/...)
 * that don't correspond to any physical folder on disk — only the English
 * slug does (app/[locale]/doctors/[doctorId]/...). This map rewrites the
 * pretty Arabic path to its canonical English-slug path internally, on
 * the same "ar" locale, so the browser's address bar keeps the Arabic URL
 * while Next's file-system router resolves it against the English folder
 * tree. See docs/EN_AR_ROUTE_MAPPING.md.
 */
const arabicToCanonicalPath = new Map(
  routes.filter((r) => r.path.ar !== r.path.en).map((r) => [r.path.ar, r.path.en]),
);

/**
 * Stamps the pre-launch noindex header on every response this proxy returns.
 *
 * This is the AUTHORITATIVE layer of the indexing guard, because it is the
 * only one evaluated per request: page metadata is baked at build time for
 * statically-generated routes, so a build made while launched would keep
 * claiming `index` even if the environment later said otherwise. The header
 * always reflects the running configuration, and where the two disagree the
 * more restrictive directive is the one that applies.
 *
 * Applied to redirects and rewrites as well as pass-throughs, since a 301 to
 * a page is itself a discoverable hop.
 *
 * Costs one env read per request and adds nothing at all once launched.
 */
function withIndexingGuard(response: NextResponse): NextResponse {
  if (!isSiteLaunched()) {
    response.headers.set("X-Robots-Tag", PRE_LAUNCH_ROBOTS_HEADER);
  }
  return response;
}

/**
 * Next.js 16 renamed the `middleware` convention to `proxy` — see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
 * This file replaces what would previously have been middleware.ts.
 *
 * Responsibilities:
 *  1. Direct 301 redirects for every legacy URL (brief §33) — checked first
 *     so an old path never round-trips through locale detection.
 *  2. `/ -> /en/` and bare-path locale prefixing, so every route in the app
 *     lives under /en/... or /ar/....
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // pathname stays percent-encoded for non-ASCII segments (confirmed
  // against Next.js 16.3 at runtime — see the Arabic-slug note below).
  // Several legacy SkinMedica sub-pages contain a literal "®" in their
  // slug (e.g. /about-skinmedica-products/f/tns®-eye-repair), so decode
  // once here and match both forms against legacyRedirects — whichever
  // form the runtime actually hands us. Falls back to the raw pathname if
  // it isn't validly encoded.
  let decodedPathname = pathname;
  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch {
    // malformed percent-encoding — fall back to the raw pathname
  }

  // 1. Legacy URL migration — exact-match, no chains (brief §33).
  const legacyTarget = legacyRedirects[decodedPathname] ?? legacyRedirects[pathname];
  if (legacyTarget) {
    const url = new URL(legacyTarget, request.url);
    if (search) url.search = search;
    return withIndexingGuard(NextResponse.redirect(url, 301));
  }

  // 1b. Safety net for the legacy SkinMedica sub-page collection
  // (/about-skinmedica-products/f/<product-slug>) — brief §3 forbids
  // leaving any discovered legacy URL as a 404. Known slugs are mapped
  // exactly above; any variant not yet discovered/registered still lands
  // on the real shop hub rather than 404ing, in one hop, no chain.
  if (
    decodedPathname.startsWith("/about-skinmedica-products/f/") ||
    pathname.startsWith("/about-skinmedica-products/f/")
  ) {
    const url = new URL("/en/shop", request.url);
    if (search) url.search = search;
    return withIndexingGuard(NextResponse.redirect(url, 301));
  }

  // Skip API routes, Next internals, and files with an extension.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/llms.txt" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return withIndexingGuard(NextResponse.next());
  }

  // 2. Locale prefixing.
  const firstSegment = pathname.split("/")[1];
  if (isLocale(firstSegment)) {
    // 2a. Rewrite pretty Arabic slugs to their canonical English-slug path
    // (same locale, invisible to the visitor) — see arabicToCanonicalPath above.
    if (firstSegment === "ar") {
      // Match against the Arabic-slug map, which is keyed by the literal
      // Arabic text as written in src/config/routes.ts — reuse the
      // decoded pathname computed above.
      const withoutLocale = decodedPathname.slice(3) || "/";
      const canonical = arabicToCanonicalPath.get(withoutLocale);
      if (canonical) {
        const url = new URL(`/ar${canonical}`, request.url);
        if (search) url.search = search;
        return withIndexingGuard(NextResponse.rewrite(url));
      }
    }
    return withIndexingGuard(NextResponse.next());
  }

  // 3. Bare-path locale prefixing. `defaultLocale` is a static constant, not
  // Accept-Language content negotiation (see src/i18n/config.ts) — the
  // mapping from an unprefixed path to its /en/... equivalent never varies
  // per visitor, so this is a genuine permanent redirect (301), not a
  // temporary one. Required explicitly for "/" -> "/en/" (brief §4).
  const url = new URL(`/${defaultLocale}${pathname}`, request.url);
  if (search) url.search = search;
  return withIndexingGuard(NextResponse.redirect(url, 301));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
