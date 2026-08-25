// src/lib/feelstack/redirect-or-404.ts
//
// The last rung of the route-resolution ladder.
//
//   1. canonical code route        (src/config/routes.ts, matched by Next)
//   2. canonical CMS content       (the page's own resolver)
//   3. approved static alias map   (src/lib/routing/legacy-redirects.ts, proxy.ts)
//   4. FeelStack CMS redirect      (here)
//   5. a real 404
//
// Callers reach this only once their own content resolution has already
// missed, so a CMS redirect can never shadow a live page. Every caller passes
// its locale explicitly from its own route params -- nothing here reads
// headers(), because doing so in the not-found boundary flips statically
// prerendered routes to dynamic AT RUNTIME and this Next version turns that
// into a 500. That is how every 404 on this site once became a 500.

import { permanentRedirect, notFound } from "next/navigation";

import { resolveFeelstackRedirect } from "./redirect-resolver";
import type { Locale } from "@/i18n/config";

/**
 * Consults FeelStack's redirect history, then 404s.
 *
 * Returns `never`: both branches throw a Next control-flow signal, so nothing
 * after a call to this can execute.
 *
 * The redirect is issued with `permanentRedirect`, which emits 308 rather than
 * the 301 the CMS records. Next only offers 307/308 from a Server Component,
 * and 308 is the permanent redirect that additionally preserves the request
 * method. Search engines treat 308 as equivalent to 301 for canonicalisation,
 * so the SEO intent of the CMS row is honoured. The proxy still issues real
 * 301s for the static alias map, where it can.
 */
export async function redirectOrNotFound(
  pathname: string,
  locale: Locale,
  search?: URLSearchParams,
): Promise<never> {
  const moved = await resolveFeelstackRedirect(pathname, locale, search);
  // A CMS outage, a timeout, a malformed body or an unsafe destination all
  // return null, and the visitor gets exactly the 404 they would have had
  // before. Failing open is deliberate: a redirect is an instruction to send
  // someone somewhere, and a wrong one is worse than a missing one.
  if (moved) permanentRedirect(encodeLocation(moved.destination));
  notFound();
}

/**
 * Percent-encodes a site-relative destination for the Location header.
 *
 * HTTP header values are ASCII. `permanentRedirect` passes the string through
 * untouched, so a destination like `/ar/طازج-جديد` throws
 * ERR_INVALID_CHAR and the visitor gets a 500 instead of a redirect. The proxy
 * never hit this because `NextResponse.redirect(new URL(...))` encodes on its
 * own; this path has to do it explicitly.
 *
 * Path segments are encoded individually so "/" separators survive, and any
 * query string is left alone because URLSearchParams already encoded it.
 * Already-encoded segments are decoded first, so a value that arrives encoded
 * cannot come out double-encoded.
 */
export function encodeLocation(destination: string): string {
  const [path, query] = splitOnce(destination, "?");
  const encodedPath = path
    .split("/")
    .map((segment) => {
      if (segment.length === 0) return segment;
      let raw = segment;
      try {
        raw = decodeURIComponent(segment);
      } catch {
        // Not valid encoding; treat it as literal text.
      }
      return encodeURIComponent(raw);
    })
    .join("/");
  return query === undefined ? encodedPath : `${encodedPath}?${query}`;
}

function splitOnce(value: string, separator: string): [string, string | undefined] {
  const index = value.indexOf(separator);
  if (index === -1) return [value, undefined];
  return [value.slice(0, index), value.slice(index + separator.length)];
}

/**
 * Decodes one path segment, leaving it alone if it is not valid encoding.
 *
 * Next hands route params still percent-encoded for non-ASCII slugs, and the
 * resolver encodes again when it builds the query string. Without this step an
 * Arabic slug reaches the CMS double-encoded -- `/%D8%B7...` instead of
 * `/طازج-قديم` -- and matches nothing. Measured against a stub CMS: the ASCII
 * slug resolved and the Arabic one 404ed, which would have silently broken
 * renames for most of this site's Arabic content.
 *
 * A malformed sequence throws in decodeURIComponent; the raw segment is used
 * rather than failing the whole request, because a junk URL should 404
 * normally, not 500.
 */
function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Builds the request path from route params, without touching headers(). */
export function pathnameFrom(locale: string, segments: string[] = []): string {
  const tail = segments
    .filter((s) => s.length > 0)
    .map(decodeSegment)
    .join("/");
  return tail.length > 0 ? `/${locale}/${tail}` : `/${locale}`;
}

/** Narrows Next's `searchParams` prop into a URLSearchParams. */
export function toSearchParams(
  raw: Record<string, string | string[] | undefined> | undefined,
): URLSearchParams | undefined {
  if (!raw) return undefined;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) for (const v of value) params.append(key, v);
    else params.append(key, value);
  }
  return params;
}
