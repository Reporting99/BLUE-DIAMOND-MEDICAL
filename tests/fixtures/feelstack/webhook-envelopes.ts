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
  data?: Record<string, unknown>;
}

export function envelope(overrides: EnvelopeOverrides = {}): Record<string, unknown> {
  return {
    id: overrides.id ?? "3f1c2e64-6b1d-4a7f-9c2e-1b8a5d4e7f00",
    type: overrides.type ?? "content.person_profile.published",
    projectId: overrides.projectId ?? BD_PROJECT_ID,
    occurredAt: overrides.occurredAt ?? new Date().toISOString(),
    data: overrides.data ?? {
      id: "9b7c1a20-4f3e-4d5a-8b21-0c6e9f2a1d33",
      status: "published",
      locale: "en",
      path: "/doctors/mohamed-farhat",
    },
  };
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
