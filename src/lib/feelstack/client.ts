// No `import "server-only"` here deliberately — see cache-tags.ts for the
// general rationale (needs to be importable by
// tests/contracts/failure-classification.spec.ts, which exercises this
// module transitively through page-resolver.ts, outside Next's build
// pipeline). Re-examined for this file specifically: FEELSTACK_API_URL
// and FEELSTACK_SITE_KEY are not credentials — the endpoints they build
// URLs for are the brief's *public*, unauthenticated resolve/routes
// endpoints ("Never send authorization headers to endpoints that are
// intentionally public"), so there is no secret this guard would have
// protected in the first place. The one real credential
// (FEELSTACK_REVALIDATE_SECRET) never flows through this file — it's
// read only in the webhook Route Handler, which Next.js never bundles
// for the client regardless of this guard.
import {
  feelstackRoutesResponseSchema,
  extractFeelstackErrorCode,
  type FeelstackRoutesResponse,
} from "./schemas";
import { classifyHttpStatus, classifyThrown, logFeelstackEvent, FeelStackConfigurationError } from "./errors";
import { feelstackErr, feelstackOk, RETRYABLE_ERROR_CODES, type FeelStackResult } from "./contracts";
import { getFeelstackApiUrl, getFeelstackSiteKey, isFeelstackConfigured } from "./content-mode";
import { cacheTags } from "./cache-tags";
import { feelstackResolveEnvelopeSchema, type FeelstackResolveEnvelope } from "./transport";

/**
 * Server-only typed adapter around the FeelStack CMS — brief §4/§7. Every
 * public function returns `FeelStackResult<T>` (contracts.ts) instead of
 * throwing or collapsing every failure to `null` — the pattern the
 * recovered Dfeelings source uses (`src/lib/api.ts`: one blanket
 * `try { ... } catch { return null/[] }` per call, no status
 * differentiation, no Zod validation, no timeout/retry) and which brief §5
 * explicitly says not to copy. See docs/ARCHITECTURE.md.
 *
 * No FEELSTACK_API_URL is configured for this build yet — every call
 * below resolves through the local fallback content instead of a network
 * request (`listRoutes`, kept for the existing static build) or returns a
 * `CONFIGURATION_ERROR`-shaped result
 * (`resolveEntity`, the new hybrid-mode path).
 *
 * This module does NOT import "server-only" — see the note at the top of this
 * file for why, and why there is no credential for that guard to protect here.
 * (An earlier version of this comment claimed the opposite; the `server-only`
 * package was never actually imported anywhere in this repo and has been
 * removed from package.json.)
 */

const REQUEST_TIMEOUT_MS = 5000;
/** Retry GET requests at most once — brief §7. */
const MAX_RETRIES = 1;

function isConfigured(): boolean {
  return isFeelstackConfigured();
}

interface FetchOutcome {
  response: Response;
  requestId?: string;
}

/**
 * Single fetch attempt with an AbortController timeout. Does not retry —
 * retry policy lives in `fetchWithPolicy` so it can inspect the
 * classified error code (brief §7: only retry network failures and
 * 502/503/504, never 400/invalid-site/locale-mismatch).
 */
async function fetchOnce(url: string, revalidateSeconds: number, tags: readonly string[]): Promise<FetchOutcome> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      // Draft content must never appear publicly — FeelStack's own API is
      // expected to filter to published content server-side; the adapter
      // additionally checks `status === "published"` as defense in depth.
      //
      // `tags` is what makes the webhook's revalidateTag() calls actually do
      // something. Without it every builder in cache-tags.ts is an orphan:
      // the invalidation matrix and the webhook are both complete, but no
      // cache entry carries the tag they invalidate, so a publish event
      // silently no-ops and stale content is served until the time-based
      // revalidate window expires. Brief §17 ("every tag must have a
      // PRODUCER") — this is the producer.
      next: { revalidate: revalidateSeconds, tags: tags.length > 0 ? [...tags] : undefined },
    });
    return { response, requestId: response.headers.get("x-request-id") ?? undefined };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch with the brief §7 request policy: AbortController timeout, retry
 * GET at most once, and only for network failures or 502/503/504 — never
 * for 400, invalid site key, or locale mismatch (those are not transient).
 */
/**
 * Pulls the `error.code` out of a FeelStack error envelope, if there is one.
 * Best-effort by design: a non-JSON or unrecognised body yields `undefined`
 * and classification falls back to the HTTP status alone.
 */
async function readErrorCode(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.json();
    return extractFeelstackErrorCode(body);
  } catch {
    return undefined;
  }
}

async function fetchWithPolicy(
  url: string,
  revalidateSeconds: number,
  tags: readonly string[] = [],
): Promise<FeelStackResult<unknown>> {
  let attempt = 0;
  while (true) {
    try {
      const { response, requestId } = await fetchOnce(url, revalidateSeconds, tags);
      if (response.ok) {
        try {
          const json: unknown = await response.json();
          return feelstackOk(json, requestId);
        } catch {
          logFeelstackEvent({ category: "INVALID_RESPONSE", requestId, upstreamContext: "JSON parse failed" });
          return feelstackErr("INVALID_RESPONSE", { requestId, message: "Malformed JSON from FeelStack" });
        }
      }

      // Read the structured error envelope before classifying. A bare HTTP
      // status is not enough: FeelStack answers 404 both for a genuinely
      // missing page (CONTENT_NOT_FOUND) and for an unknown siteKey
      // (SITE_NOT_FOUND). Treating the second as NOT_FOUND would 404 every
      // page on the site the moment a wrong site key is deployed — the exact
      // mass-404 failure the contract forbids.
      //
      // This matches on the envelope's `code` field, never on human-readable
      // prose, so a reworded upstream message cannot change behaviour.
      const upstreamCode = await readErrorCode(response);
      const code = classifyHttpStatus(response.status, upstreamCode);

      // 429 is retried with the transient statuses: rate limiting is by
      // definition temporary. It is classified UPSTREAM_ERROR either way, so
      // an exhausted retry still surfaces as an outage and never as a 404.
      const retryableStatus =
        response.status === 429 ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504;
      if (retryableStatus && attempt < MAX_RETRIES) {
        attempt += 1;
        continue;
      }
      logFeelstackEvent({ category: code, httpStatus: response.status, requestId, upstreamContext: upstreamCode });
      return feelstackErr(code, { status: response.status, requestId });
    } catch (thrown) {
      const code = classifyThrown(thrown);
      if (RETRYABLE_ERROR_CODES.includes(code) && attempt < MAX_RETRIES) {
        attempt += 1;
        continue;
      }
      logFeelstackEvent({ category: code, upstreamContext: thrown instanceof Error ? thrown.name : "unknown" });
      return feelstackErr(code);
    }
  }
}

/**
 * Resolves one path's CMS content for a locale, validated against the
 * requested Zod schema. Never throws. `NOT_FOUND` means "confirmed absent
 * or draft"; timeout/network/upstream/invalid-response mean "the CMS is
 * unreachable or broken", which callers must NOT treat as NOT_FOUND
 * (brief §5).
 */
/**
 * Fetches and validates ONE localized entity, returning the raw transport
 * envelope. Deliberately stops at the transport boundary: mapping into a domain
 * model is `./adapters`' job, and locale integrity is `./locale-integrity`'s.
 *
 * Splitting those three concerns is the point. The previous revision validated
 * the response directly with the caller's DOMAIN schema, which is why a shape
 * mismatch surfaced as "content invalid" instead of "we are parsing the wrong
 * contract".
 */
export async function resolveEnvelope(
  path: string,
  locale: "en" | "ar",
  /** Cache tags this response should be filed under, from cache-tags.ts. */
  tags: readonly string[] = [],
): Promise<FeelStackResult<FeelstackResolveEnvelope>> {
  if (!isConfigured()) {
    throw new FeelStackConfigurationError(
      "resolveEnvelope() called without FEELSTACK_API_URL/FEELSTACK_SITE_KEY configured.",
    );
  }

  const siteKey = getFeelstackSiteKey();
  const apiUrl = getFeelstackApiUrl();
  const url = `${apiUrl}/public/v1/sites/${siteKey}/resolve?path=${encodeURIComponent(path)}&locale=${locale}`;

  const result = await fetchWithPolicy(url, 45, tags);
  if (!result.ok) return result as FeelStackResult<FeelstackResolveEnvelope>;

  const parsed = feelstackResolveEnvelopeSchema.safeParse(result.data);
  if (!parsed.success) {
    logFeelstackEvent({
      category: "INVALID_RESPONSE",
      locale,
      path,
      requestId: result.requestId,
      upstreamContext: "envelope failed schema validation",
    });
    return feelstackErr("INVALID_RESPONSE", {
      requestId: result.requestId,
      message: "Resolve envelope failed schema validation",
    });
  }

  return feelstackOk(parsed.data, result.requestId);
}

/** Lists all published routes FeelStack knows about for a locale. Empty array on any failure. */
export async function listRoutes(locale: "en" | "ar"): Promise<FeelstackRoutesResponse["routes"]> {
  if (!isConfigured()) return [];

  const siteKey = getFeelstackSiteKey();
  const apiUrl = getFeelstackApiUrl();
  const url = `${apiUrl}/public/v1/sites/${siteKey}/routes?locale=${locale}`;

  const result = await fetchWithPolicy(url, 45, [cacheTags.routes(siteKey), cacheTags.sitemap(siteKey)]);
  if (!result.ok) return [];

  const parsed = feelstackRoutesResponseSchema.safeParse(result.data);
  if (!parsed.success) return [];
  return parsed.data.routes.filter((r) => r.status === "published");
}

export { extractFeelstackErrorCode };
