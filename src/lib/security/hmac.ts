import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_REPLAY_WINDOW_SECONDS = 5 * 60;

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

  const expectedBuffer = Buffer.from(expected, "hex");
  const providedBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== providedBuffer.length) return false;

  return timingSafeEqual(expectedBuffer, providedBuffer);
}
