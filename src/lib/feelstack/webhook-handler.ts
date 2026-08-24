// No `import "server-only"` here deliberately — see cache-tags.ts for
// why (needs to be importable by tests/security/feelstack-webhook.spec.ts
// outside Next's build pipeline). This module never reads process.env
// itself — the secret is passed in as a plain parameter by
// `src/app/api/feelstack/revalidate/route.ts`, a Next.js Route Handler,
// which the framework never bundles for the client.
import { verifyHmacSignature } from "@/lib/security/hmac";
import { routes } from "@/lib/routing";
import { feelstackContentEventDataSchema, feelstackWebhookEnvelopeSchema } from "./schemas";
import {
  classifyEvent,
  familyForTemplateType,
  tagsForDisposition,
  type BdLocale,
} from "./revalidation";
import { logFeelstackEvent } from "./errors";

/**
 * Pure webhook business logic, decoupled from `NextRequest`/`NextResponse`
 * — brief §18 mandatory webhook-security tests need to exercise signature
 * verification, replay/timestamp rejection, path-decoding attacks, body
 * size limits, and unsupported-event handling directly, without spinning
 * up a Next.js server or fighting `NextRequest` construction in a unit
 * test. `src/app/api/feelstack/revalidate/route.ts` is a thin HTTP
 * adapter over this function.
 */

export const MAX_WEBHOOK_BODY_BYTES = 64 * 1024;
const REPLAY_WINDOW_MS = 5 * 60 * 1000; // matches verifyHmacSignature's own freshness window

const allowedPaths = new Set(routes.flatMap((r) => [`/en${r.path.en}`, `/ar${r.path.ar}`]));

/**
 * CMS path -> route entry.
 *
 * FeelStack's `data.path` is the CMS path (e.g. "/doctors/mohamed-farhat"),
 * which is a DIFFERENT namespace from the public URL ("/en/doctors/..." or
 * the Arabic "/ar/الأطباء/..."). Passing `data.path` straight to
 * `isAllowlistedPath` would reject every real event.
 *
 * Verified across all six entity families that the CMS path a page
 * resolves with is exactly that route's English path:
 *   /medical/{slug}                  <- medicalServices.map(...path.en)
 *   /aesthetics/treatments/{slug}    <- treatments.map(...)
 *   /aesthetics/concerns/{slug}      <- concerns.map(...)
 *   /aesthetics/technologies/{slug}  <- technologies.map(...)
 *   /shop/{slug}                     <- products.map(...)
 *   /doctors/{id}                    <- literal entries; doctor.id IS the segment
 * so `route.path.en` is the correct join key, and resolving through the
 * registry (rather than string-munging a locale prefix on) is what keeps
 * the Arabic URL correct — Arabic paths are not transliterations.
 */
const routeByCmsPath = new Map(routes.map((r) => [r.path.en, r]));

/**
 * Single-instance replay guard — brief §9 "Replay protection" as a
 * concept distinct from "Timestamp validation": a freshness check alone
 * (verifyHmacSignature's 5-minute window) accepts the *same* valid
 * request replayed any number of times within that window. This tracks
 * signatures already processed and rejects a repeat. In-memory only —
 * correct for a single server instance; a multi-instance deployment needs
 * a shared store (Redis/KV) for this to hold across instances, which is a
 * documented limitation (docs/FEELSTACK.md), not something
 * fabricated here without real infrastructure to back it.
 */
const seenSignatures = new Map<string, number>();

function isReplay(signature: string): boolean {
  const now = Date.now();
  for (const [sig, expiresAt] of seenSignatures) {
    if (expiresAt <= now) seenSignatures.delete(sig);
  }
  if (seenSignatures.has(signature)) return true;
  seenSignatures.set(signature, now + REPLAY_WINDOW_MS);
  return false;
}

/** Test-only: clears the replay guard between test cases. Not exported from the package's public surface used by route.ts. */
export function __resetReplayGuardForTests(): void {
  seenSignatures.clear();
}

export interface RevalidationRequestInput {
  secret: string | undefined;
  /**
   * The FeelStack project UUID this deployment is allowed to accept events
   * for, and the site key its cache tags are built from. Both are passed
   * in explicitly rather than read here, so a missing one fails LOUDLY at
   * 501 instead of silently defaulting.
   *
   * This deliberately bypasses `getFeelstackSiteKey()`, which falls back to
   * "blue-diamond-medical" when FEELSTACK_SITE_KEY is unset. On the read
   * path that fallback is unreachable (`assertFeelstackEnvValid()` throws
   * first), but the webhook path is gated only on the secret — so a
   * deployment with a webhook secret and no site key would have accepted
   * events for a tenant nobody configured.
   */
  projectId: string | undefined;
  siteKey: string | undefined;
  contentType: string | null;
  contentLength: number | null;
  signature: string | null;
  timestamp: string | null;
  rawBody: string;
}

/** Structured outcome codes. Stable; asserted by tests. */
export type RevalidationOutcome =
  | "not_configured"
  | "invalid_content_type"
  | "payload_too_large"
  | "missing_headers"
  | "invalid_timestamp"
  | "stale_timestamp"
  | "invalid_signature"
  | "duplicate"
  | "invalid_json"
  | "invalid_payload"
  | "project_mismatch"
  | "invalid_path"
  | "unsupported_event"
  | "backend_event_gap"
  | "companion_invalidated"
  | "revalidated";

export interface RevalidationResult {
  status: number;
  outcome: RevalidationOutcome;
  body: Record<string, unknown>;
  /** Tags actually invalidated — exposed for tests, not for the HTTP response. */
  revalidatedTags?: string[];
  revalidatedPath?: string;
}

/**
 * Decodes a path up to three times (brief §9: "three-pass path decoding
 * and normalization") to defeat double/triple percent-encoded traversal
 * attempts, then normalizes `//`, `.`, and `..` segments. Returns null if
 * the result still contains a traversal segment or a decode error occurs
 * — callers must reject rather than best-effort it.
 */
export function decodeAndNormalizePath(rawPath: string): string | null {
  let decoded = rawPath;
  for (let pass = 0; pass < 3; pass += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      return null;
    }
  }

  if (!decoded.startsWith("/")) return null;

  const segments = decoded.split("/").filter((s) => s.length > 0 && s !== ".");
  if (segments.some((s) => s === "..")) return null; // no traversal, at any decode depth

  const normalized = `/${segments.join("/")}`;
  return normalized === "/" ? "/" : normalized.replace(/\/+$/, "");
}

export function isAllowlistedPath(path: string): boolean {
  return allowedPaths.has(path);
}

export async function processRevalidationRequest(
  input: RevalidationRequestInput,
  effects: { revalidateTag: (tag: string) => void; revalidatePath: (path: string) => void },
): Promise<RevalidationResult> {
  const { secret, projectId, siteKey, contentType, contentLength, signature, timestamp, rawBody } = input;

  // ---- configuration: fail loud, never assume a tenant -------------------
  if (!secret || !projectId || !siteKey) {
    return {
      status: 501,
      outcome: "not_configured",
      body: { error: "Revalidation is not configured on this deployment." },
    };
  }

  if (!contentType?.toLowerCase().includes("application/json")) {
    return { status: 415, outcome: "invalid_content_type", body: { error: "Content-Type must be application/json." } };
  }

  if (contentLength !== null && Number.isFinite(contentLength) && contentLength > MAX_WEBHOOK_BODY_BYTES) {
    return { status: 413, outcome: "payload_too_large", body: { error: "Payload too large." } };
  }
  if (Buffer.byteLength(rawBody, "utf8") > MAX_WEBHOOK_BODY_BYTES) {
    return { status: 413, outcome: "payload_too_large", body: { error: "Payload too large." } };
  }

  if (!signature || !timestamp) {
    return { status: 401, outcome: "missing_headers", body: { error: "Missing signature headers." } };
  }

  // Distinguish a malformed timestamp from a stale one so operators can tell
  // "sender is misconfigured" from "delivery was delayed or replayed".
  // verifyHmacSignature still performs its own freshness check afterwards —
  // this is an additional discriminator, never a replacement.
  if (!/^\d{10}$/.test(timestamp)) {
    return { status: 401, outcome: "invalid_timestamp", body: { error: "Malformed timestamp." } };
  }
  if (Math.abs(Date.now() - Number(timestamp) * 1000) > REPLAY_WINDOW_MS) {
    return { status: 401, outcome: "stale_timestamp", body: { error: "Timestamp outside the accepted window." } };
  }

  // ---- signature over the RAW bytes, exactly as FeelStack signed them ----
  // HMAC-SHA256(secret, `${timestamp}.${rawBody}`). rawBody is never
  // re-serialized before verification; JSON.parse happens only after.
  const isValid = verifyHmacSignature({ payload: rawBody, timestamp, signature, secret });
  if (!isValid) {
    // Never log the payload or signature — brief §9.
    console.warn("[feelstack-revalidate] rejected: invalid or expired signature");
    return { status: 401, outcome: "invalid_signature", body: { error: "Invalid signature." } };
  }

  if (isReplay(signature)) {
    console.warn("[feelstack-revalidate] rejected: replayed signature");
    return { status: 401, outcome: "duplicate", body: { error: "Request already processed." } };
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return { status: 400, outcome: "invalid_json", body: { error: "Invalid JSON body." } };
  }

  const envelope = feelstackWebhookEnvelopeSchema.safeParse(json);
  if (!envelope.success) {
    return { status: 400, outcome: "invalid_payload", body: { error: "Unsupported or malformed event envelope." } };
  }
  const {
    id: eventId,
    type,
    projectId: eventProjectId,
    entityId: canonicalEntityId,
    locale: canonicalLocale,
    path: canonicalPath,
    data,
  } = envelope.data;

  // ---- tenant isolation --------------------------------------------------
  // A signature proves the sender holds THIS endpoint's secret; it does not
  // prove the event belongs to this project. FeelStack scopes delivery by
  // project already, but a misconfigured endpoint row would otherwise let
  // another tenant's content invalidate Blue Diamond's cache.
  if (eventProjectId !== projectId) {
    logFeelstackEvent({ category: "INVALID_SITE", upstreamContext: `project_mismatch event=${type}` });
    return { status: 403, outcome: "project_mismatch", body: { error: "Event does not belong to this project." } };
  }

  const parsedData = feelstackContentEventDataSchema.safeParse(data);
  if (!parsedData.success) {
    return { status: 400, outcome: "invalid_payload", body: { error: "Malformed event data." } };
  }
  const eventData = parsedData.data;

  // ---- canonical entity context (FeelStack PR #22) ----------------------
  // Prefer the top-level columns over the payload. For page/entry events the
  // two agree; for relationships/taxonomy ONLY the columns exist, which is
  // exactly what #22 fixed. Falling back keeps a pre-#22 sender working.
  const effectivePath = canonicalPath ?? eventData.path ?? undefined;
  const rawLocale = canonicalLocale ?? eventData.locale ?? undefined;

  // A locale this site does not serve is an event to DECLINE and report, not
  // a parse failure and not an excuse to invalidate both locales.
  if (rawLocale !== undefined && rawLocale !== "en" && rawLocale !== "ar") {
    logFeelstackEvent({
      category: "LOCALE_MISMATCH",
      upstreamContext: `unsupported locale event=${type}`,
    });
    return {
      status: 200,
      outcome: "unsupported_event",
      body: { revalidated: false, event: type, eventId, ignored: "locale is not served by this site." },
    };
  }

  // `source-entity` events (relationships, taxonomy) are only actionable when
  // BOTH an entity id and a path arrived. Without them the affected surface
  // is unknowable and the event must be reported as a gap, never guessed.
  const hasCanonicalContext = Boolean(canonicalEntityId) && Boolean(effectivePath);

  const disposition = classifyEvent(type, eventData, hasCanonicalContext);

  if (disposition.kind === "companion-invalidated") {
    // A genuine, understood event that correctly invalidates nothing itself:
    // the real work arrives on separate companion events. Reported with its
    // own outcome rather than as a gap, so the response and the logs stop
    // claiming a backend deficiency that FeelStack #25 fixed — and rather
    // than as `unsupported_event`, which would wrongly imply Blue Diamond
    // does not consume this family.
    logFeelstackEvent({
      category: "COMPANION_INVALIDATED",
      upstreamContext: `event=${type}: ${disposition.reason}`,
    });
    return {
      status: 200,
      outcome: "companion_invalidated",
      body: { revalidated: false, event: type, eventId, companionInvalidated: disposition.reason },
    };
  }

  if (disposition.kind === "backend_event_gap") {
    // NOT a silent 200. FeelStack can emit this event but does not transmit
    // enough to identify the affected surface, so acting on it would mean
    // guessing. Recorded explicitly so the gap is visible in logs and in
    // the response rather than looking like a successful no-op.
    logFeelstackEvent({ category: "BACKEND_EVENT_GAP", upstreamContext: `event=${type}: ${disposition.reason}` });
    return {
      status: 200,
      outcome: "backend_event_gap",
      body: { revalidated: false, event: type, eventId, backendEventGap: disposition.reason },
    };
  }

  if (disposition.kind === "unsupported") {
    logFeelstackEvent({ category: "OK", upstreamContext: `unsupported event=${type}: ${disposition.reason}` });
    return {
      status: 200,
      outcome: "unsupported_event",
      body: { revalidated: false, event: type, eventId, ignored: disposition.reason },
    };
  }

  // ---- locale: taken from the payload, never inferred --------------------
  // `data.locale` is transmitted by every content producer and is
  // authoritative. Site-wide events carry none, which correctly means
  // "both locales".
  const locale = rawLocale as BdLocale | undefined;

  // ---- path: CMS path -> registry route -> public URL --------------------
  let cmsPath: string | undefined;
  let previousCmsPath: string | undefined;
  const revalidatedPaths: string[] = [];

  let resolvedFamily: ReturnType<typeof familyForTemplateType>;

  const needsPath =
    disposition.kind === "page" ||
    disposition.kind === "entity" ||
    disposition.kind === "source-entity";
  if (needsPath) {
    if (!effectivePath) {
      return {
        status: 400,
        outcome: "invalid_payload",
        body: { error: "Event requires data.path but none was supplied." },
      };
    }
    const normalized = decodeAndNormalizePath(effectivePath);
    if (!normalized || !routeByCmsPath.has(normalized)) {
      logFeelstackEvent({ category: "INVALID_RESPONSE", upstreamContext: `invalid_path event=${type}` });
      return { status: 400, outcome: "invalid_path", body: { error: "Path is not a known Blue Diamond route." } };
    }
    cmsPath = normalized;

    // Family for a source-entity event. Relationship and taxonomy payloads
    // carry no contentType -- `entityType` is the coarse routing type
    // (`content_entry`), not the family -- so it is resolved from the route
    // that this path already had to match. Registry lookup, not inference.
    if (disposition.kind === "source-entity") {
      const route = routeByCmsPath.get(normalized);
      resolvedFamily = route ? familyForTemplateType(route.templateType) : undefined;
    }

    if (eventData.previousPath) {
      const normalizedPrevious = decodeAndNormalizePath(eventData.previousPath);
      // A previous path that no longer resolves is expected after a rename
      // and must not fail the whole delivery — the NEW path is what matters.
      if (normalizedPrevious && routeByCmsPath.has(normalizedPrevious)) {
        previousCmsPath = normalizedPrevious;
      }
    }

    // Public URLs are resolved through the registry, per locale. Only the
    // event's own locale is revalidated, so an English edit can never
    // invalidate the Arabic page or vice versa.
    const localesToRevalidate: BdLocale[] = locale ? [locale] : ["en", "ar"];
    for (const candidate of [cmsPath, previousCmsPath]) {
      if (!candidate) continue;
      const route = routeByCmsPath.get(candidate);
      if (!route) continue;
      for (const l of localesToRevalidate) {
        const publicPath = `/${l}${route.path[l]}`;
        if (!isAllowlistedPath(publicPath)) continue;
        if (!revalidatedPaths.includes(publicPath)) revalidatedPaths.push(publicPath);
      }
    }
  }

  const tags = tagsForDisposition(disposition, {
    siteKey,
    locale,
    cmsPath,
    previousCmsPath,
    family: resolvedFamily,
    // Only `site-config` needs the full path set, and only this module can
    // supply it -- `revalidation.ts` is kept free of registry knowledge. The
    // keys of `routeByCmsPath` ARE the CMS paths (the map is built from
    // `r.path.en`), so this is the same registry every other path in this
    // handler is validated against, not a second source of truth.
    allCmsPaths:
      disposition.kind === "site-config"
        ? Array.from(routeByCmsPath.keys())
        : undefined,
  });
  tags.forEach((tag) => effects.revalidateTag(tag));
  revalidatedPaths.forEach((publicPath) => effects.revalidatePath(publicPath));

  logFeelstackEvent({
    category: "OK",
    locale,
    path: cmsPath,
    upstreamContext: `event=${type}, tags=${tags.length}, paths=${revalidatedPaths.length}`,
  });

  return {
    status: 200,
    outcome: "revalidated",
    body: {
      revalidated: true,
      event: type,
      eventId,
      tags: tags.length,
      paths: revalidatedPaths.length,
    },
    revalidatedTags: tags,
    revalidatedPath: revalidatedPaths[0],
  };
}
