import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { legacyRedirects } from "@/lib/routing";
import { routes } from "@/lib/routing";
import { localizedEntityRoutes } from "@/config/localized-entity-routes.generated";
import { isSiteLaunched, PRE_LAUNCH_ROBOTS_HEADER } from "@/config/launch";

/**
 * Arabic public URLs use meaningful Arabic slugs (e.g. /ar/الأطباء/...)
 * that don't correspond to any physical folder on disk — only the English
 * slug does (app/[locale]/doctors/[doctorId]/...). This map rewrites the
 * pretty Arabic path to its canonical English-slug path internally, on
 * the same "ar" locale, so the browser's address bar keeps the Arabic URL
 * while Next's file-system router resolves it against the English folder
 * tree. See docs/ROUTING.md.
 */
const arabicToCanonicalPath = new Map<string, string>([
  ...routes
    .filter((r) => r.path.ar !== r.path.en)
    .map((r) => [r.path.ar, r.path.en] as const),
  // Entity routes -- doctors, treatments, concerns, technologies, services,
  // products -- are created in the CMS, and their Arabic slugs are authored
  // there rather than here. Only 6 of them were ever hand-copied into
  // src/config/routes.ts, so 52 of 58 CMS routes had no entry in this map and
  // every one of their Arabic URLs was unreachable: no rewrite matched, so the
  // Arabic slug never resolved to the English folder Next actually routes on.
  //
  // The generated artifact carries all of them, straight from the CMS
  // alternates, and localized-route-parity.spec.ts fails if the CMS gains a
  // route the artifact lacks. That turns "someone forgot to add the Arabic
  // path" from a silent 404 into a failing test.
  ...localizedEntityRoutes.map((r) => [r.ar, r.en] as const),
]);

/**
 * The reverse map: an ENGLISH-slug path to the approved Arabic path.
 *
 * Under /ar these English-slug paths are duplicates -- the same page reachable
 * at two Arabic URLs, one of them Latin. That is GAP-2 seen from the frontend,
 * and it is why /ar/aesthetics/concerns/acne-scars and
 * /ar/التجميل-الطبي/المخاوف-الجمالية/ندبات-حب-الشباب both answered 200.
 *
 * Redirecting them here rather than from the not-found boundary matters:
 * not-found.tsx cannot see the request URL without headers(), and reading a
 * dynamic API there flips statically prerendered routes from static to dynamic
 * at runtime, which this Next version turns into a 500. The proxy already
 * knows the URL, already runs per request, costs no dynamic rendering, and can
 * return a real 301 rather than a 308.
 *
 * Scoped to /ar only. The English canonical is untouched.
 */
const englishSlugToArabicPath = new Map(
  routes.filter((r) => r.path.ar !== r.path.en).map((r) => [r.path.en, r.path.ar]),
);

/**
 * Marks a request that this proxy has already rewritten from a pretty Arabic
 * URL onto its English-slug folder.
 *
 * Load-bearing. The rewrite target IS an English-slug path under /ar, which is
 * exactly what englishSlugToArabicPath redirects -- for all 103 localized
 * routes, not some edge case. Without a marker the rewrite re-enters the proxy,
 * gets redirected back to the Arabic URL, rewrites again, and every Arabic
 * pretty URL dies with ERR_TOO_MANY_REDIRECTS.
 *
 * The VALUE is a per-process nonce, not a constant. A constant marker is
 * client-controllable: anyone sending `x-bd-arabic-rewrite: 1` against
 * /ar/doctors was served 200 instead of the 301, resurrecting exactly the
 * duplicate Arabic URL this redirect exists to remove. The nonce is generated
 * at module load, never appears in any response, and is unguessable, so only
 * a rewrite this process itself issued can satisfy the check.
 *
 * It is set on the REQUEST headers of the rewrite only. No Server Component
 * reads it, so it cannot flip a statically prerendered route to dynamic the
 * way a headers() call in not-found.tsx did.
 */
const ARABIC_REWRITE_MARKER = "x-bd-arabic-rewrite";
const ARABIC_REWRITE_NONCE = crypto.randomUUID();

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
/**
 * True when the request path cannot be safely handed to the router.
 *
 * Two shapes, both of which produced a 500 on the deployed artifact before
 * this guard (verified 2026-08-26 against the green slot):
 *
 *   /en/%%%%    invalid percent-encoding. Never reached application code and
 *               logged nothing -- it fails inside Next's own request
 *               handling, which is why no route or error boundary could
 *               catch it.
 *   /en/a%00b   decodes to a NUL byte. Rendering SUCCEEDS and then the
 *               prerender cache write throws ERR_INVALID_ARG_VALUE, because
 *               the path becomes a filename:
 *                 "…/.next/server/app/en/a\x00b.segments"
 *               That one IS in the journal, and a 500 issued after a
 *               successful render is the clearest sign the URL should never
 *               have been routed at all.
 *
 * Both are malformed URIs, not missing pages, so this is a 400. Checked on
 * the RAW pathname before anything else looks at it, because every later step
 * -- legacy lookup, locale detection, routing -- assumes a decodable string.
 *
 * Dfeelings carries the same guard in its own proxy.ts; this is the earliest
 * layer either app can inspect the raw URI from, and the only ingress Blue
 * Diamond has at all.
 */
function isUnroutablePath(pathname: string): boolean {
  let decoded: string;
  try {
    decoded = decodeURI(pathname);
  } catch {
    return true;
  }
  // decodeURI happily produces control characters from valid escapes; %00 in
  // particular is well-formed encoding of a byte that cannot appear in a
  // path. Check after decoding, since that is the form the router uses.
  return /[\u0000-\u001F\u007F]/.test(decoded);
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Refuse before anything else looks at the path. Returning here means no
  // legacy lookup, no route match, no render and no prerender-cache write,
  // which is what makes the 500 impossible rather than merely unlikely.
  if (isUnroutablePath(pathname)) {
    return withIndexingGuard(new NextResponse(null, { status: 400 }));
  }
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

      // An English-slug path under /ar is a duplicate of the approved Arabic
      // URL, so it gets one permanent hop to the canonical. Skipped when this
      // request is our own rewrite of a pretty Arabic URL, which lands on
      // exactly such a path -- redirecting it would bounce straight back and
      // loop.
      const alreadyRewritten =
        request.headers.get(ARABIC_REWRITE_MARKER) === ARABIC_REWRITE_NONCE;
      const approvedArabic = alreadyRewritten
        ? undefined
        : englishSlugToArabicPath.get(withoutLocale);
      if (approvedArabic) {
        const url = new URL(`/ar${approvedArabic}`, request.url);
        if (search) url.search = search;
        return withIndexingGuard(NextResponse.redirect(url, 301));
      }

      const canonical = arabicToCanonicalPath.get(withoutLocale);
      if (canonical) {
        const url = new URL(`/ar${canonical}`, request.url);
        if (search) url.search = search;
        const headers = new Headers(request.headers);
        headers.set(ARABIC_REWRITE_MARKER, ARABIC_REWRITE_NONCE);
        return withIndexingGuard(
          NextResponse.rewrite(url, { request: { headers } }),
        );
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
