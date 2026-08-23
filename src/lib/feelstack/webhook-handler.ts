// No `import "server-only"` here deliberately — see cache-tags.ts for
// why (needs to be importable by tests/security/feelstack-webhook.spec.ts
// outside Next's build pipeline). This module never reads process.env
// itself — the secret is passed in as a plain parameter by
// `src/app/api/feelstack/revalidate/route.ts`, a Next.js Route Handler,
// which the framework never bundles for the client.
import { verifyHmacSignature } from "@/lib/security/hmac";
import { routes } from "@/lib/routing";
import { getFeelstackSiteKey } from "./content-mode";
import { feelstackWebhookBodySchema } from "./schemas";
import { tagsForEvent } from "./revalidation";
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
  contentType: string | null;
  contentLength: number | null;
  signature: string | null;
  timestamp: string | null;
  rawBody: string;
}

export interface RevalidationResult {
  status: number;
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
  const { secret, contentType, contentLength, signature, timestamp, rawBody } = input;

  if (!secret) {
    return { status: 501, body: { error: "Revalidation is not configured on this deployment." } };
  }

  if (!contentType?.toLowerCase().includes("application/json")) {
    return { status: 415, body: { error: "Content-Type must be application/json." } };
  }

  if (contentLength !== null && Number.isFinite(contentLength) && contentLength > MAX_WEBHOOK_BODY_BYTES) {
    return { status: 413, body: { error: "Payload too large." } };
  }
  if (rawBody.length > MAX_WEBHOOK_BODY_BYTES) {
    return { status: 413, body: { error: "Payload too large." } };
  }

  if (!signature || !timestamp) {
    return { status: 401, body: { error: "Missing signature headers." } };
  }

  const isValid = verifyHmacSignature({ payload: rawBody, timestamp, signature, secret });
  if (!isValid) {
    // Never log the payload or signature — brief §9.
    console.warn("[feelstack-revalidate] rejected: invalid or expired signature");
    return { status: 401, body: { error: "Invalid signature." } };
  }

  if (isReplay(signature)) {
    console.warn("[feelstack-revalidate] rejected: replayed signature");
    return { status: 401, body: { error: "Request already processed." } };
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return { status: 400, body: { error: "Invalid JSON body." } };
  }

  const parsed = feelstackWebhookBodySchema.safeParse(json);
  if (!parsed.success) {
    return { status: 400, body: { error: "Unsupported or malformed event body." } };
  }

  // Legacy shape: { path } only.
  if (!("event" in parsed.data)) {
    const normalized = decodeAndNormalizePath(parsed.data.path);
    if (!normalized || !isAllowlistedPath(normalized)) {
      return { status: 400, body: { error: "Path is not on the revalidation allowlist." } };
    }
    effects.revalidatePath(normalized);
    logFeelstackEvent({ category: "OK", path: normalized, upstreamContext: "legacy path revalidation" });
    return { status: 200, body: { revalidated: true, path: normalized }, revalidatedPath: normalized };
  }

  // Structured shape: { event, siteKey, locale?, entityId?, path? }
  const { event, siteKey, locale, entityId, path } = parsed.data;
  const expectedSiteKey = getFeelstackSiteKey();
  if (siteKey !== expectedSiteKey) {
    return { status: 400, body: { error: "Unknown site key." } };
  }

  let normalizedPath: string | undefined;
  if (path) {
    const normalized = decodeAndNormalizePath(path);
    if (!normalized || !isAllowlistedPath(normalized)) {
      return { status: 400, body: { error: "Path is not on the revalidation allowlist." } };
    }
    normalizedPath = normalized;
  }

  const tags = tagsForEvent(event, { siteKey, locale, entityId, path: normalizedPath });
  tags.forEach((tag) => effects.revalidateTag(tag));
  if (normalizedPath) effects.revalidatePath(normalizedPath);

  logFeelstackEvent({
    category: "OK",
    locale,
    path: normalizedPath,
    upstreamContext: `event=${event}, tags=${tags.length}`,
  });
  return {
    status: 200,
    body: { revalidated: true, event, tags: tags.length, path: normalizedPath ?? null },
    revalidatedTags: tags,
    revalidatedPath: normalizedPath,
  };
}
