/**
 * No `import "server-only"` here deliberately — see cache-tags.ts for
 * why. This module is pure types/discriminated-union helpers with no
 * env/secret access; the real credentialed boundary is
 * `src/lib/feelstack/client.ts`.
 *
 * FeelStack result contract — brief §4/§5 ("CORRECTED DFEELINGS FAILURE
 * BEHAVIOR"). Every function that talks to FeelStack returns this
 * discriminated union instead of throwing or returning `null`, so callers
 * can tell a confirmed-absent entity (`NOT_FOUND`) apart from a CMS that is
 * merely unreachable (`TIMEOUT` / `NETWORK_ERROR` / `UPSTREAM_ERROR` /
 * `INVALID_RESPONSE`) — the distinction the recovered Dfeelings source does
 * not make (see docs/DFEELINGS_TO_BLUE_ARCHITECTURE_MAP.md §5).
 */
export type FeelStackErrorCode =
  | "NOT_FOUND"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "UPSTREAM_ERROR"
  | "INVALID_RESPONSE"
  | "INVALID_SITE"
  | "LOCALE_MISMATCH"
  | "CONFIGURATION_ERROR";

/** Error codes that represent a CMS *outage*, not a confirmed-absent page. Never silently fall back to stale/static content for these — brief's hybrid-mode instruction. */
export const OUTAGE_ERROR_CODES: readonly FeelStackErrorCode[] = [
  "TIMEOUT",
  "NETWORK_ERROR",
  "UPSTREAM_ERROR",
  "INVALID_RESPONSE",
];

/** Error codes safe to retry once (idempotent GET only) — brief §7. */
export const RETRYABLE_ERROR_CODES: readonly FeelStackErrorCode[] = ["NETWORK_ERROR", "UPSTREAM_ERROR", "TIMEOUT"];

export type FeelStackResult<T> =
  | { ok: true; data: T; requestId?: string }
  | {
      ok: false;
      error: FeelStackErrorCode;
      status?: number;
      requestId?: string;
      /** Safe, non-secret diagnostic context — never the raw upstream body. */
      message?: string;
    };

export function feelstackOk<T>(data: T, requestId?: string): FeelStackResult<T> {
  return { ok: true, data, requestId };
}

export function feelstackErr<T>(
  error: FeelStackErrorCode,
  opts?: { status?: number; requestId?: string; message?: string },
): FeelStackResult<T> {
  return { ok: false, error, ...opts };
}

/**
 * Content-model entity types this adapter resolves — brief §11 ("BLUE
 * DIAMOND CONTENT MODEL") and §8 (cache-tag registry coverage list). One
 * entry per CMS-manageable entity family; index vs. detail are tracked
 * separately since they invalidate independently.
 */
export type FeelStackEntityType =
  | "page"
  | "navigation"
  | "footer"
  | "seo"
  | "doctor"
  | "medical-service"
  | "aesthetic-treatment"
  | "concern"
  | "technology"
  | "product"
  | "health-hub-article"
  | "legal-page"
  | "booking-config";

export type Locale = "en" | "ar";
