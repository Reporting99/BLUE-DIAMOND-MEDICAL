import { timingSafeEqual } from "node:crypto";
import type { Locale } from "@/i18n/config";
import {
  normalizeLocale,
  resolveDestination,
  PREVIEW_TYPES,
  type PreviewRoute,
  type RouteAlternate,
} from "./preview-source";

/**
 * Draft preview entry — the server half of FeelStack's preview link.
 *
 * Two things changed from the first implementation, both because production
 * proved them wrong.
 *
 * The destination is now resolved from routes FeelStack returns for the
 * configured project, not from the app's static `src/config/routes.ts`. That
 * registry is built from local `src/features/*` data — the pre-CMS content —
 * so it could only preview records the app already knew about. A newly
 * imported CMS-only record such as `botox` 404'd, which is close to the
 * opposite of what a draft preview is for.
 *
 * Bounding the destination is still what prevents an open redirect; only the
 * bound moved, from a build-time snapshot to "paths FeelStack listed for this
 * project". The browser never supplies a destination.
 *
 * The secret is still compared here in constant time and then dropped: never
 * placed in the redirect, never echoed, never logged.
 */

export { PREVIEW_TYPES };

export type DraftPreviewInput = {
  secret: string | null;
  type: string | null;
  slug: string | null;
  lang: string | null;
  projectId?: string | null;
  expectedSecret: string | undefined;
  expectedProjectId: string | undefined;
};

export type DraftPreviewDecision =
  | { ok: true; redirectTo: string; cmsPath: string; locale: Locale }
  | { ok: false; status: number; error: string }
  /** The English route was found; this locale's path needs an alternates lookup. */
  | { ok: false; needsAlternates: true; cmsPathEn: string };

/** Constant-time compare that cannot throw on a length mismatch. */
function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

/**
 * Validate the request. Split from destination resolution so the credential
 * checks are unit-testable without any network at all.
 */
export function checkDraftPreviewRequest(
  input: DraftPreviewInput,
): { ok: true; locale: Locale; type: string; slug: string } | { ok: false; status: number; error: string } {
  const { secret, type, slug, lang, projectId, expectedSecret, expectedProjectId } = input;

  if (!expectedSecret || !expectedProjectId) {
    return { ok: false, status: 501, error: "Draft preview is not configured on this deployment." };
  }
  if (!secret || !type || slug === null || slug === undefined) {
    return { ok: false, status: 400, error: "Missing required parameters." };
  }
  if (!secretsMatch(secret, expectedSecret)) {
    // Same wording and status as a missing secret: a caller learns nothing.
    return { ok: false, status: 401, error: "Invalid preview credentials." };
  }
  if (projectId && projectId !== expectedProjectId) {
    return { ok: false, status: 403, error: "Preview is not available for that project." };
  }
  const locale = normalizeLocale(lang);
  if (!locale) {
    return { ok: false, status: 400, error: "Unsupported locale." };
  }
  return { ok: true, locale, type, slug };
}

/**
 * Full decision: credentials, then a destination chosen only from `routes`.
 * `routes` is supplied by the caller (the route handler fetches them through
 * the server-only preview client), which keeps this function pure.
 */
export function resolveDraftPreview(
  input: DraftPreviewInput,
  routes: readonly PreviewRoute[],
  alternates?: readonly RouteAlternate[],
): DraftPreviewDecision {
  const checked = checkDraftPreviewRequest(input);
  if (!checked.ok) return checked;

  const destination = resolveDestination(
    checked.type,
    checked.slug,
    checked.locale,
    routes,
    alternates,
  );
  if (!destination.ok) return destination;

  return {
    ok: true,
    redirectTo: destination.destination,
    cmsPath: destination.cmsPath,
    locale: checked.locale,
  };
}
