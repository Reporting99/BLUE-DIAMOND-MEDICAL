/**
 * Best-effort in-memory rate limiter for form submissions. This resets on
 * every server restart/redeploy and is NOT shared across serverless
 * instances — adequate as a first line of defense against casual abuse,
 * but a durable store (Redis/Upstash, etc.) should replace this before a
 * high-traffic production launch. Documented limitation, not a silent gap.
 */
const attempts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { allowed: true };
}
