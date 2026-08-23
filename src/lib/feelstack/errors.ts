import type { FeelStackErrorCode } from "./contracts";

/**
 * No `import "server-only"` here deliberately — see cache-tags.ts for
 * why. This module is pure classification logic + Error subclasses, no
 * env/secret access; the real credentialed boundary is
 * `src/lib/feelstack/client.ts`.
 *
 * Structured error classification — brief §5/§6. Maps a raw fetch outcome
 * (HTTP status, or a thrown network/abort error) to one of the typed
 * `FeelStackErrorCode`s, so nothing downstream ever has to pattern-match on
 * upstream prose (brief §6: "never require an exact human-readable error
 * sentence").
 */

/** Thrown for configuration problems (missing/invalid site key, hybrid/cms mode requested without required env vars). Never caught into a page 404 — brief §5. */
export class FeelStackConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeelStackConfigurationError";
  }
}

/**
 * Thrown by the page-resolver when a request resolves to a CMS *outage*
 * (as opposed to a confirmed-absent page). Caught by
 * `src/app/[locale]/error.tsx`. Next.js's App Router has no page-level
 * equivalent of `notFound()` for non-404 statuses (verified against
 * node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md
 * for this Next 16.3.2 build — only `notFound()` sets a real HTTP status
 * from within a Server Component); the classified code/status is logged
 * server-side before the throw so the real cause is never lost, even
 * though the boundary itself renders as a generic error page. See
 * docs/FEELSTACK.md.
 */
export class FeelStackUnavailableError extends Error {
  readonly code: FeelStackErrorCode;
  readonly status?: number;
  readonly requestId?: string;

  constructor(code: FeelStackErrorCode, opts?: { status?: number; requestId?: string; message?: string }) {
    super(opts?.message ?? `FeelStack content unavailable: ${code}`);
    this.name = "FeelStackUnavailableError";
    this.code = code;
    this.status = opts?.status;
    this.requestId = opts?.requestId;
  }
}

/**
 * FeelStack's published public error codes -> our internal classification.
 *
 * Source of truth is the backend's own append-only enum,
 * `src/platform/contracts/public-api-errors.ts` (PUBLIC_ERROR_CODES), verified
 * against the deployed instance. All six are mapped here; the last two entries
 * are aliases this repo assumed before the contract was confirmed, kept so an
 * older fixture still classifies correctly.
 *
 * CONTENT_NOT_FOUND is the ONLY code that may become a page 404. SITE_NOT_FOUND
 * is the load-bearing counter-example: FeelStack answers 404 for an unknown
 * siteKey exactly as it does for a missing page, so classifying on status alone
 * would 404 every page on the site the moment a wrong key ships.
 */
const UPSTREAM_CODE_MAP: Record<string, FeelStackErrorCode> = {
  CONTENT_NOT_FOUND: "NOT_FOUND",
  SITE_NOT_FOUND: "INVALID_SITE",
  LOCALE_NOT_SUPPORTED: "LOCALE_MISMATCH",
  RATE_LIMITED: "UPSTREAM_ERROR",
  UPSTREAM_INTERNAL_ERROR: "UPSTREAM_ERROR",
  INVALID_REQUEST: "INVALID_RESPONSE",
  // Aliases from this repo's pre-verification guess.
  INVALID_SITE: "INVALID_SITE",
  LOCALE_MISMATCH: "LOCALE_MISMATCH",
};

/**
 * Classification is CODE-FIRST. The HTTP status is only ever a fallback for a
 * response that carried no recognisable envelope at all.
 *
 * The invariant this function exists to hold:
 * **only a positively identified content absence may become a 404.**
 *
 * That is why an uncoded 404 resolves to UPSTREAM_ERROR rather than NOT_FOUND.
 * Every genuine absence from FeelStack carries CONTENT_NOT_FOUND, so a 404 with
 * no code did not come from FeelStack's content layer — it came from a proxy, a
 * gateway, a wrong base URL, or a rewritten route. Treating that as "the page
 * does not exist" is precisely how an infrastructure fault becomes a sitewide
 * de-indexing event. Failing closed costs an error page; failing open costs the
 * whole site's search presence.
 *
 * An unrecognised code fails closed for the same reason: the backend's enum is
 * append-only, so a code we do not know is a code newer than this build, and
 * guessing "absent" about it is never safe.
 */
export function classifyHttpStatus(status: number, upstreamCode?: string): FeelStackErrorCode {
  if (upstreamCode) {
    const mapped = UPSTREAM_CODE_MAP[upstreamCode];
    if (mapped) return mapped;
    return "UPSTREAM_ERROR";
  }
  if (status === 400) return "INVALID_RESPONSE";
  if (status === 401 || status === 403) return "INVALID_SITE";
  // 404, 429 and every other uncoded non-2xx: upstream trouble, never a
  // confirmed absence — an outage must not be indexed as deleted content.
  return "UPSTREAM_ERROR";
}

/** Thrown/caught error (network, abort, JSON parse) -> FeelStackErrorCode. */
export function classifyThrown(error: unknown): FeelStackErrorCode {
  if (error instanceof DOMException && error.name === "AbortError") return "TIMEOUT";
  if (error instanceof SyntaxError) return "INVALID_RESPONSE"; // JSON.parse failure
  if (error instanceof TypeError) return "NETWORK_ERROR"; // fetch() network failure
  return "NETWORK_ERROR";
}

export interface StructuredLogContext {
  category: FeelStackErrorCode | "OK";
  httpStatus?: number;
  locale?: string;
  path?: string;
  requestId?: string;
  /** Safe upstream context only — never headers, bodies, or secrets. */
  upstreamContext?: string;
}

/**
 * Structured server-side logging — brief §5 ("Add structured server-side
 * logging"). Deliberately takes a closed set of fields so a caller cannot
 * accidentally pass a secret/header/raw body through; never logs
 * Authorization values, webhook signatures, or env var values.
 */
export function logFeelstackEvent(context: StructuredLogContext): void {
  const { category, httpStatus, locale, path, requestId, upstreamContext } = context;
  const level = category === "OK" ? "log" : "warn";
  console[level](
    "[feelstack]",
    JSON.stringify({ category, httpStatus, locale, path, requestId, upstreamContext, ts: new Date().toISOString() }),
  );
}
