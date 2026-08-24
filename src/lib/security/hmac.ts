import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_REPLAY_WINDOW_SECONDS = 5 * 60;

/**
 * FeelStack sends `X-FeelStack-Signature: sha256=<hex>` — the scheme
 * prefix is part of the real header, verified in
 * `webhook.service.ts::deliver()`:
 *   headers['X-FeelStack-Signature'] = `sha256=${signature}`
 *
 * Without stripping it, `Buffer.from("sha256=<hex>", "hex")` decodes to
 * ZERO bytes (Node's hex decoder stops at the first non-hex character, and
 * "s" is not hex). The length check below then fails and EVERY genuine
 * delivery is rejected as an invalid signature — before the body is ever
 * parsed. Confirmed empirically, not inferred.
 */
const SIGNATURE_SCHEME_PREFIX = "sha256=";

/** A SHA-256 HMAC is exactly 32 bytes, i.e. 64 hex characters. */
const HEX_SHA256 = /^[0-9a-f]{64}$/i;

/**
 * Verifies an HMAC-SHA256 signed webhook payload — brief §7
 * (FeelStack revalidate endpoint protection). Constant-time comparison via
 * Node's timingSafeEqual, plus a timestamp freshness check to reject
 * replayed requests older than 5 minutes.
 */
export function verifyHmacSignature({
  payload,
  timestamp,
  signature,
  secret,
}: {
  payload: string;
  timestamp: string;
  signature: string;
  secret: string;
}): boolean {
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;

  const ageSeconds = Math.abs(Date.now() / 1000 - timestampSeconds);
  if (ageSeconds > MAX_REPLAY_WINDOW_SECONDS) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");

  const provided = signature.startsWith(SIGNATURE_SCHEME_PREFIX)
    ? signature.slice(SIGNATURE_SCHEME_PREFIX.length)
    : signature;

  // Reject anything that is not a well-formed digest up front. This is
  // strictly stronger than relying on the length check alone: previously a
  // malformed signature decoded to a short/empty buffer and was rejected
  // only incidentally.
  if (!HEX_SHA256.test(provided)) return false;

  const expectedBuffer = Buffer.from(expected, "hex");
  const providedBuffer = Buffer.from(provided, "hex");
  if (expectedBuffer.length !== providedBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, providedBuffer);
}
