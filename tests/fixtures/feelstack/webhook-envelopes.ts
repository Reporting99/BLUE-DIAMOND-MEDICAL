import { createHmac } from "node:crypto";

/**
 * Webhook fixtures shaped from the REAL FeelStack sender.
 *
 * Copied from `headless-cms/src/platform/services/webhook.service.ts::deliver()`
 * at FeelStack production commit 0e32652c:
 *
 *   const body = JSON.stringify({
 *     id: event.eventId, type: event.eventType, projectId: event.projectId,
 *     occurredAt: event.createdAt, data: event.payload,
 *   });
 *   const timestamp = Math.floor(Date.now() / 1000).toString();
 *   const signature = createHmac('sha256', secret)
 *     .update(`${timestamp}.${body}`).digest('hex');
 *   headers['X-FeelStack-Signature'] = `sha256=${signature}`;
 *
 * The `sha256=` header prefix is reproduced deliberately — omitting it in a
 * fixture is what would let the prefix-handling regression back in.
 *
 * `data` shapes come from the producers, not from imagination:
 *   directory-content.service.ts  -> { id, status, locale, path }
 *   structured-content.service.ts -> { id, contentType, status, locale, path, previousPath? }
 *
 * No real credential appears here; the secret is a test-only string.
 */

export const TEST_SECRET = "test-only-fixture-secret-never-a-real-credential";

/** The real Blue Diamond FeelStack project. */
export const BD_PROJECT_ID = "d1a870a4-a514-4719-bf71-6cff26b18dcb";
export const BD_SITE_KEY = "blue-diamond-medical";

/** Dfeelings' project — used to prove cross-tenant events are refused. */
export const DFEELINGS_PROJECT_ID = "a6ca8114-32f5-40f7-8c07-5c66f32e6cf8";

export interface EnvelopeOverrides {
  id?: string;
  type?: string;
  projectId?: string;
  occurredAt?: string;
  /**
   * Canonical entity context, live on the wire since FeelStack PR #22
   * (6c2c3c97). Explicit `null` is preserved so a test can assert the
   * "producer recorded none" case; omitting a key uses the default.
   */
  entityType?: string | null;
  entityId?: string | null;
  locale?: string | null;
  path?: string | null;
  data?: Record<string, unknown>;
}

const has = (o: EnvelopeOverrides, k: keyof EnvelopeOverrides) => Object.hasOwn(o, k);

export function envelope(overrides: EnvelopeOverrides = {}): Record<string, unknown> {
  return {
    id: overrides.id ?? "3f1c2e64-6b1d-4a7f-9c2e-1b8a5d4e7f00",
    type: overrides.type ?? "content.person_profile.published",
    projectId: overrides.projectId ?? BD_PROJECT_ID,
    occurredAt: overrides.occurredAt ?? new Date().toISOString(),
    entityType: has(overrides, "entityType") ? overrides.entityType : "person_profile",
    entityId: has(overrides, "entityId")
      ? overrides.entityId
      : "9b7c1a20-4f3e-4d5a-8b21-0c6e9f2a1d33",
    // Derived from `data` when not explicitly overridden, because that is
    // what the real sender does: recordContentEvent populates the outbox
    // COLUMNS and the payload from the same entity, so they always agree.
    // Hard-coding a default here instead would let a fixture silently
    // contradict its own payload and mask what a test is trying to assert.
    locale: has(overrides, "locale")
      ? overrides.locale
      : ((overrides.data?.locale as string | undefined) ?? "en"),
    path: has(overrides, "path")
      ? overrides.path
      : ((overrides.data?.path as string | undefined) ?? "/doctors/mohamed-farhat"),
    data: overrides.data ?? {
      id: "9b7c1a20-4f3e-4d5a-8b21-0c6e9f2a1d33",
      status: "published",
      locale: "en",
      path: "/doctors/mohamed-farhat",
    },
  };
}

/** A relationship event as FeelStack really emits it since PR #22. */
export function relationshipEnvelope(overrides: EnvelopeOverrides = {}) {
  return envelope({
    type: "content.relationships.updated",
    entityType: "content_entry",
    entityId: "1a2b3c4d-0000-4111-8222-333344445555",
    locale: "en",
    path: "/medical/eye-screening",
    // Payload names the relation TARGET only -- never the source.
    data: {
      relationKey: "treats",
      targetType: "content_entry",
      targetId: "9999aaaa-0000-4111-8222-333344446666",
    },
    ...overrides,
  });
}

/** A taxonomy event as FeelStack really emits it since PR #22. */
export function taxonomyEnvelope(overrides: EnvelopeOverrides = {}) {
  return envelope({
    type: "content.taxonomy.updated",
    entityType: "content_entry",
    entityId: "1a2b3c4d-0000-4111-8222-333344445555",
    locale: "en",
    path: "/aesthetics/concerns/acne-scars",
    data: { termId: "term-7" },
    ...overrides,
  });
}

/** Signs a body exactly as FeelStack does, prefix included. */
export function signed(body: string, secret = TEST_SECRET, timestamp = String(Math.floor(Date.now() / 1000))) {
  const hex = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  return { timestamp, signature: `sha256=${hex}`, rawBody: body };
}

/** A complete, correctly-signed request input for the handler. */
export function signedRequest(overrides: EnvelopeOverrides = {}, opts: { secret?: string } = {}) {
  const body = JSON.stringify(envelope(overrides));
  const { timestamp, signature, rawBody } = signed(body, opts.secret ?? TEST_SECRET);
  return {
    secret: TEST_SECRET,
    projectId: BD_PROJECT_ID,
    siteKey: BD_SITE_KEY,
    contentType: "application/json",
    contentLength: Buffer.byteLength(rawBody, "utf8"),
    signature,
    timestamp,
    rawBody,
  };
}

/** The pre-alignment body shape. Must NEVER validate again. */
export const LEGACY_STRUCTURED_BODY = {
  event: "medical-service.updated",
  siteKey: BD_SITE_KEY,
  locale: "en",
  entityId: "eye-screening",
};

export const LEGACY_PATH_ONLY_BODY = { path: "/en/medical/eye-screening" };
