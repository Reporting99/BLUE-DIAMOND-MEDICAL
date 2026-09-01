import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

/**
 * Pure half of draft preview: which FeelStack path a preview request means,
 * and whether a destination is one this deployment is allowed to send a
 * browser to.
 *
 * Deliberately free of `server-only` and of any credential, so it is directly
 * unit-testable. The secret and the network live in `preview-client.ts`.
 *
 * The rule that makes an open redirect unrepresentable: a destination is only
 * ever chosen from the set of paths FeelStack returned for THIS project. The
 * browser never supplies a destination, and nothing is concatenated from user
 * input — a caller names a `type` and a `slug`, and the resolver looks for a
 * matching route. If FeelStack did not list it, there is no destination.
 */

/** A route as `preview/routes` returns it. */
export interface PreviewRoute {
  path: string;
  locale: string;
  type: string;
  status?: string;
}

/** CMS route prefixes, keyed by the `type` a preview link carries. */
const PREFIX_BY_TYPE: Readonly<Record<string, string>> = {
  page: "",
  "medical-service": "/medical",
  "aesthetic-treatment": "/aesthetics/treatments",
  "aesthetic-concern": "/aesthetics/concerns",
  technology: "/aesthetics/technologies",
  product: "/shop",
  doctor: "/our-team",
  person_profile: "/our-team",
};

export const PREVIEW_TYPES = Object.keys(PREFIX_BY_TYPE);

/**
 * The home page is the one route whose slug is not a path segment: FeelStack
 * lists it as "/", so `slug=home` has to map to "/" rather than to "/home".
 * Handled explicitly because the previous implementation built "/home", found
 * nothing, and 404'd the homepage — the exact bug this file replaces.
 */
export const HOME_SLUGS = new Set(["home", "", "/", "index"]);

/** Single segment. Rejects traversal, absolute URLs, "//host", backslashes. */
const SLUG_PATTERN = /^[\p{L}\p{N}]+(?:[-_][\p{L}\p{N}]+)*$/u;

export function isSafeInternalPath(path: string): boolean {
  if (typeof path !== "string" || path.length === 0) return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("\\")) return false;
  if (path.includes("://")) return false;
  // Control characters, checked by code point rather than a regex range:
  // an escaped range in a literal is easy to mangle, and a mangled one here
  // fails open. DEL (0x7f) included.
  for (let i = 0; i < path.length; i += 1) {
    const code = path.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return false;
  }
  return !path.split("/").includes("..");
}

export function normalizeLocale(lang: string | null | undefined): Locale | null {
  const value = lang ?? defaultLocale;
  return isLocale(value) ? value : null;
}

export type DestinationResult =
  | { ok: true; cmsPath: string; destination: string }
  | { ok: false; status: number; error: string }
  /**
   * The English route was found, but this locale's path lives in the resolve
   * envelope's `alternates` and has not been fetched yet.
   */
  | { ok: false; needsAlternates: true; cmsPathEn: string };

/** An entry of `route.alternates` from a resolve envelope. */
export interface RouteAlternate {
  locale: string;
  path: string;
}

/**
 * Resolve `type` + `slug` + `locale` to an internal destination.
 *
 * The caller supplies an ENGLISH slug -- that is what the CMS dashboard puts in
 * a preview link. An Arabic route's last segment is a real Arabic string
 * (`/الرعاية-الطبية/فحص-العين`), not a transliteration, so matching the slug
 * against Arabic paths finds nothing. The English route is located first and
 * the localized path is then taken from the resolve envelope's `alternates`,
 * which is the only place FeelStack links the two.
 */
export function resolveDestination(
  type: string,
  slug: string,
  locale: Locale,
  routes: readonly PreviewRoute[],
  alternates?: readonly RouteAlternate[],
): DestinationResult {
  const prefix = PREFIX_BY_TYPE[type];
  if (prefix === undefined) {
    return { ok: false, status: 400, error: "Unsupported resource type." };
  }

  if (type === "page" && HOME_SLUGS.has(slug)) {
    // "/" is home in every locale, so no alternate lookup is needed. Building
    // "/<locale>/home" here is the bug this special case exists to prevent.
    return { ok: true, cmsPath: "/", destination: `/${locale}` };
  }

  if (!SLUG_PATTERN.test(slug)) {
    return { ok: false, status: 400, error: "Invalid slug." };
  }

  const english = routes.filter((r) => r.locale === "en");
  const candidates = english.filter(
    (r) => r.path.split("/").filter(Boolean).pop() === slug,
  );
  const chosen =
    (prefix.length > 0
      ? candidates.filter((r) => r.path.startsWith(prefix))
      : candidates)[0] ?? candidates[0];

  if (!chosen) {
    return { ok: false, status: 404, error: "No previewable route for that resource." };
  }
  if (!isSafeInternalPath(chosen.path)) {
    return { ok: false, status: 400, error: "Unsafe route." };
  }

  if (locale === "en") {
    return { ok: true, cmsPath: chosen.path, destination: `/en${chosen.path}` };
  }

  if (!alternates) {
    return { ok: false, needsAlternates: true, cmsPathEn: chosen.path };
  }

  const alt = alternates.find((a) => a.locale === locale);
  if (!alt || !isSafeInternalPath(alt.path)) {
    return { ok: false, status: 404, error: "No previewable route for that locale." };
  }
  return {
    ok: true,
    cmsPath: alt.path,
    destination: `/${locale}${alt.path === "/" ? "" : alt.path}`,
  };
}
