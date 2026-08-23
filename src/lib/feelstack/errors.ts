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

/** HTTP status -> FeelStackErrorCode. Structured, not prose-based — brief §6. */
export function classifyHttpStatus(status: number): FeelStackErrorCode {
  if (status === 404) return "NOT_FOUND";
  if (status === 400) return "INVALID_RESPONSE";
  if (status === 401 || status === 403) return "INVALID_SITE";
  if (status >= 500) return "UPSTREAM_ERROR";
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
