import { timingSafeEqual } from "node:crypto";
import { routes } from "@/lib/routing";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { decodeAndNormalizePath } from "./webhook-handler";

/**
 * Draft preview entry — the server half of FeelStack's preview link.
 *
 * The CMS dashboard builds `/api/draft?secret=…&type=…&slug=…&lang=…` from
 * `GET /admin/v1/projects/:id/preview-target`. This module decides, with no
 * Next.js dependency so it is directly unit-testable, whether that request may
 * enable draft mode and exactly which internal path it may land on.
 *
 * Two properties are load-bearing.
 *
 * The secret never travels onward. It is compared here in constant time and
 * then dropped: it is never placed in the redirect URL, never echoed in a
 * response body, and never logged. (The platform's other implementation
 * forwards it as a query parameter on the redirect, which leaks it into browser
 * history, the Referer header and any access log along the way. Draft mode is a
 * cookie, so there is no reason to move the secret past this point.)
 *
 * The destination is resolved through the route registry rather than
 * concatenated from caller input. `routes` is the same source of truth the
 * revalidation webhook allowlists against, and it carries REAL Arabic paths —
 * `/الرعاية-الطبية/{slugAr}`, not a transliteration of the English one. So
 * resolving through it is both what makes an `ar` preview land on the correct
 * Arabic URL, and what makes an open redirect unrepresentable: the only values
 * this function can return are paths that already exist in the registry.
 */

/** Content types the CMS may ask to preview, mapped to their CMS path prefix. */
const CMS_PREFIX_BY_TYPE: Readonly<Record<string, string>> = {
  page: "",
  "medical-service": "/medical",
  "aesthetic-treatment": "/aesthetics/treatments",
  "aesthetic-concern": "/aesthetics/concerns",
  technology: "/aesthetics/technologies",
  product: "/shop",
  doctor: "/doctors",
  person_profile: "/doctors",
};

export const DRAFT_PREVIEW_TYPES = Object.keys(CMS_PREFIX_BY_TYPE);

/** A slug segment the CMS can legitimately produce. Deliberately narrow. */
const SLUG_PATTERN = /^[\p{L}\p{N}]+(?:[-_][\p{L}\p{N}]+)*$/u;

export type DraftPreviewInput = {
  secret: string | null;
  type: string | null;
  slug: string | null;
  lang: string | null;
  /** Optional caller assertion; when present it must match this deployment. */
  projectId?: string | null;
  /** Server-side configuration. */
  expectedSecret: string | undefined;
  expectedProjectId: string | undefined;
};

export type DraftPreviewDecision =
  | { ok: true; redirectTo: string; locale: Locale }
  | { ok: false; status: number; error: string };

/** Constant-time compare that cannot throw on a length mismatch. */
function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    // Still burn a comparison so the failure cost does not depend on length.
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

export function resolveDraftPreview(input: DraftPreviewInput): DraftPreviewDecision {
  const { secret, type, slug, lang, projectId, expectedSecret, expectedProjectId } = input;

  // Configuration: fail loud rather than previewing an unconfigured tenant.
  if (!expectedSecret || !expectedProjectId) {
    return { ok: false, status: 501, error: "Draft preview is not configured on this deployment." };
  }

  if (!secret || !type || !slug) {
    return { ok: false, status: 400, error: "Missing required parameters." };
  }

  if (!secretsMatch(secret, expectedSecret)) {
    // Deliberately identical to the missing-secret case in wording and status:
    // a caller learns nothing about whether the secret merely differed.
    return { ok: false, status: 401, error: "Invalid preview credentials." };
  }

  // Strictly bound to this FeelStack project. A preview link minted for another
  // tenant cannot drive this deployment even with a valid-looking secret.
  if (projectId && projectId !== expectedProjectId) {
    return { ok: false, status: 403, error: "Preview is not available for that project." };
  }

  const locale: string = lang ?? defaultLocale;
  if (!isLocale(locale)) {
    return { ok: false, status: 400, error: "Unsupported locale." };
  }

  const prefix = CMS_PREFIX_BY_TYPE[type];
  if (prefix === undefined) {
    return { ok: false, status: 400, error: "Unsupported resource type." };
  }

  // The slug is a single segment, never a path. This rejects "../", absolute
  // URLs, protocol-relative "//evil.example", backslashes and control
  // characters before they can reach path construction at all.
  if (!SLUG_PATTERN.test(slug)) {
    return { ok: false, status: 400, error: "Invalid slug." };
  }

  const cmsPath = decodeAndNormalizePath(`${prefix}/${slug}`);
  if (!cmsPath) {
    return { ok: false, status: 400, error: "Invalid slug." };
  }

  // Resolve through the registry. Anything not already a known route is not
  // previewable, which is what makes an open redirect unrepresentable here.
  const route = routes.find((r) => r.path.en === cmsPath);
  if (!route) {
    return { ok: false, status: 404, error: "No previewable route for that resource." };
  }

  const localized = route.path[locale];
  if (!localized || !localized.startsWith("/")) {
    return { ok: false, status: 404, error: "No previewable route for that locale." };
  }

  const redirectTo = localized === "/" ? `/${locale}` : `/${locale}${localized}`;
  return { ok: true, redirectTo, locale };
}
