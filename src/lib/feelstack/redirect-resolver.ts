// src/lib/feelstack/redirect-resolver.ts
//
// GAP-4 (consumer half): look up a FeelStack-managed redirect BEFORE serving a
// final 404.
//
// FeelStack creates a 301 whenever a published entity's canonical path changes
// (see route-change-redirect.ts on the backend), but this site never asked for
// them, so a renamed entity's old URL simply 404ed.
//
// WHERE THIS SITS IN THE LADDER
// -----------------------------
//   1. canonical code route        (src/config/routes.ts, resolved by Next)
//   2. canonical CMS route         (client.ts resolveEntity)
//   3. approved legacy map         (src/lib/routing/legacy-redirects.ts, proxy.ts)
//   4. FeelStack redirect resolver (this module)
//   5. a real 404
//
// It runs from the not-found boundary, which is reached only once every rung
// above has already failed. That ordering matters: it can never shadow a live
// route, and a gated/unpublished route that deliberately 404s stays a 404,
// because no redirect exists for it.
//
// SAFETY IS ENFORCED HERE, NOT ASSUMED
// ------------------------------------
// The backend rejects loops, chains, duplicate sources and external
// destinations at creation time and scopes every lookup to this project. This
// module re-validates anyway: a redirect is an instruction to send a visitor
// somewhere, and the cost of trusting a bad one (an open redirect) is too high
// to depend on a remote service being correct.
//
// FAIL OPEN
// ---------
// Every failure mode returns null and the visitor gets the same 404 they would
// have received before. A CMS outage must never become a redirect loop or a
// wrong destination.

import { getFeelstackApiUrl, getFeelstackSiteKey, isFeelstackConfigured } from "./content-mode";
import { isLocale, type Locale } from "@/i18n/config";
import { routes } from "@/lib/routing";
import { cacheTags } from "./cache-tags";

// Deliberately tighter than the 5s content budget: this sits on the 404 path,
// so a slow answer delays a visitor who is already not getting their page.
const REDIRECT_TIMEOUT_MS = 2_000;

// Mirrors the backend's Cache-Control on this endpoint
// (public, max-age=60, stale-while-revalidate=300).
const REDIRECT_REVALIDATE_SECONDS = 60;

const MAX_DESTINATION_LENGTH = 1_024;
const MAX_PRESERVED_PARAMS = 12;

/** Query parameters worth carrying across a redirect. */
const PRESERVED_QUERY_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "ref",
]);

export interface FeelstackRedirect {
  /** Always a site-relative path beginning with a single "/". */
  destination: string;
  /** Always 301: this contract is permanent-move only. */
  statusCode: 301;
}

/**
 * Locale-scoped cache tag for one path's redirect history.
 *
 * Delegates to the central registry so the webhook's invalidation contract
 * covers it. A tag written here and nowhere else is an orphan: attached to
 * every lookup, cleared by nothing.
 */
export function redirectCacheTag(cmsPath: string, locale: Locale): string {
  const normalized = cmsPath.startsWith("/") ? cmsPath : `/${cmsPath}`;
  return cacheTags.redirect(getFeelstackSiteKey(), locale, normalized);
}

/**
 * Accepts only an unambiguously safe, same-origin path.
 *
 * Rejects absolute URLs, any scheme (`https:`, `javascript:`, `data:`),
 * protocol-relative `//host`, backslash variants `/\host` that some browsers
 * normalise to `//`, control characters, oversized values, and anything not
 * beginning with "/".
 */
export function sanitizeDestination(raw: unknown): string | null {
  if (typeof raw !== "string") return null;

  // Checked on the RAW value, deliberately before trimming: String.trim()
  // strips edge TAB/CR/LF, so trimming first would silently sanitise
  // "/new\r\n" into "/new" and accept it. CR/LF in particular is the classic
  // header-injection payload; corrupt data is refused, never guessed at.
  if (/[\u0000-\u001F\u007F]/.test(raw)) return null;

  const value = raw.trim();
  if (value.length === 0 || value.length > MAX_DESTINATION_LENGTH) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//") || value.startsWith("/\\")) return null;
  // A scheme can only appear before the first "/", so a ":" in the first
  // segment is the dangerous case.
  const firstSegment = value.slice(1).split("/", 1)[0] ?? "";
  if (firstSegment.includes(":")) return null;

  return value;
}

/** Splits "/ar/الأطباء/x" into its locale and the CMS-side, locale-free path. */
export function splitLocalePath(pathname: string): { locale: Locale | null; cmsPath: string } {
  const segments = pathname.split("/");
  const candidate = segments[1] ?? "";
  if (!isLocale(candidate)) return { locale: null, cmsPath: pathname };
  const rest = pathname.slice(candidate.length + 1);
  return { locale: candidate, cmsPath: rest.length > 0 ? rest : "/" };
}

/** Re-applies the locale prefix, so an Arabic URL redirects to an Arabic URL. */
export function withLocale(cmsPath: string, locale: Locale): string {
  const normalized = cmsPath.startsWith("/") ? cmsPath : `/${cmsPath}`;
  const prefix = `/${locale}`;
  if (normalized === "/") return prefix;
  if (normalized === prefix || normalized.startsWith(`${prefix}/`)) return normalized;
  return `${prefix}${normalized}`;
}

/** Carries only allow-listed query parameters onto the destination. */
export function preserveQuery(destination: string, search: URLSearchParams | undefined): string {
  if (!search) return destination;
  const kept = new URLSearchParams();
  let count = 0;
  for (const [key, value] of search.entries()) {
    if (!PRESERVED_QUERY_PARAMS.has(key)) continue;
    if (count >= MAX_PRESERVED_PARAMS) break;
    kept.append(key, value);
    count += 1;
  }
  const query = kept.toString();
  if (!query) return destination;
  return destination.includes("?") ? `${destination}&${query}` : `${destination}?${query}`;
}

/**
 * English-slug path -> Arabic path, for every route whose slug is localized.
 *
 * The same mapping proxy.ts redirects on. It is consulted here so a CMS
 * destination that happens to BE a static alias source is collapsed to its
 * final target in one hop, instead of being served as a 301 that the proxy
 * immediately 301s again. Two hops is a crawl-budget and Core Web Vitals cost
 * for no benefit, and a chain is exactly what the backend forbids at creation
 * time.
 */
const englishSlugToArabicPath = new Map(
  routes.filter((r) => r.path.ar !== r.path.en).map((r) => [r.path.en, r.path.ar]),
);

/** Collapses a destination that is itself a static Arabic alias source. */
export function collapseStaticAlias(cmsDestination: string, locale: Locale): string {
  if (locale !== "ar") return cmsDestination;
  return englishSlugToArabicPath.get(cmsDestination) ?? cmsDestination;
}

async function fetchRedirect(cmsPath: string, locale: Locale): Promise<unknown | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDIRECT_TIMEOUT_MS);
  // The locale is ALWAYS sent. FeelStack redirects are locale-scoped: the
  // Arabic alias of a page is frequently the live English canonical, so a
  // lookup that omits the locale either matches nothing (the locale-scoped row
  // is invisible without it) or, worse, matches a locale-neutral row and sends
  // an English visitor to an Arabic page. Verified against production: the same
  // path returns a redirect for locale=ar, nothing for locale=en, and nothing
  // at all when the parameter is absent.
  const url =
    `${getFeelstackApiUrl()}/public/v1/sites/${encodeURIComponent(getFeelstackSiteKey())}` +
    `/redirect?path=${encodeURIComponent(cmsPath)}&locale=${encodeURIComponent(locale)}`;

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: {
        revalidate: REDIRECT_REVALIDATE_SECONDS,
        tags: [redirectCacheTag(cmsPath, locale)],
      },
    });
    // 404 here means "no redirect for this path" — the common case on a
    // genuine 404, not an error worth distinguishing.
    if (!response.ok) return null;
    return (await response.json()) as unknown;
  } catch {
    // Timeout, abort, DNS, connection reset: fail open to the normal 404.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Resolves a redirect for a request path, or null when there is none.
 *
 * `locale` is passed EXPLICITLY by the caller, which reads it from its own
 * route params. It is never inferred from the response, from content, or from
 * a fallback: the locale decides which redirect row is even eligible, so
 * guessing it wrong is how an Arabic redirect ends up firing on the English
 * canonical of the same path.
 *
 * `pathname` is the full incoming path including its locale prefix, and must
 * agree with `locale`. The returned destination carries the same prefix, so an
 * Arabic URL can never redirect to an English one.
 */
export async function resolveFeelstackRedirect(
  pathname: string,
  locale: Locale,
  search?: URLSearchParams,
): Promise<FeelstackRedirect | null> {
  // Without a configured CMS there is nothing to ask; the static build has no
  // redirect history and must fall straight through to its normal 404.
  if (!isFeelstackConfigured()) return null;

  const split = splitLocalePath(pathname);
  // The caller's locale is authoritative, but a pathname that disagrees with
  // it means the caller is confused about its own request. Refusing is safer
  // than picking one of the two: the cost of being wrong here is redirecting a
  // visitor across locales.
  if (split.locale !== null && split.locale !== locale) return null;
  const cmsPath = split.locale === null ? pathname : split.cmsPath;

  const body = await fetchRedirect(cmsPath, locale);
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  if (record.enabled === false) return null;

  const destination = sanitizeDestination(record.destination);
  if (!destination) return null;

  // Collapse before localizing: the static alias map is keyed on CMS-side
  // paths, and a destination that is itself an alias source would otherwise be
  // served as a 301 the proxy immediately 301s again.
  const localized = withLocale(collapseStaticAlias(destination, locale), locale);

  // Self-redirect guard. The backend rejects loops at creation time, but a
  // destination normalising back to the request would loop the browser.
  if (localized === pathname) return null;

  // One hop only. The backend forbids chains, so a destination that is itself
  // a redirect source is a data-integrity problem; following it here would
  // paper over that and cost a second round trip on the 404 path.
  return { destination: preserveQuery(localized, search), statusCode: 301 };
}
