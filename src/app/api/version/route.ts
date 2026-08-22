/**
 * GET /api/version — the release identity this process is serving.
 *
 * Exists to close a deployment-verification blind spot that HTTP 200 cannot:
 * a 200 proves *some* backend answered, not that the proxy is serving the
 * release that was just deployed. A slot-wiring mistake lets the previous
 * build keep answering 200 while every deploy reports success, indefinitely
 * and silently.
 *
 * `ops/deploy/deploy-blue-diamond` asserts
 * `served SHA === release SHA` against this endpoint before it will report
 * success, and rolls back on mismatch. The deploy workflow re-checks it
 * independently.
 *
 * Deliberately minimal: the SHA and nothing else. This is a public,
 * unauthenticated endpoint, so every additional field would be public too —
 * no environment values, no build metadata, no branch name, no timestamps.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
// Never cached and never prerendered: the answer is a property of the running
// release, and a cached copy could outlive the release it describes.
export const dynamic = "force-dynamic";

function readReleaseSha(): string | null {
  try {
    const raw = readFileSync(path.join(process.cwd(), ".release-sha"), "utf8").trim();
    // Shape-checked, so a truncated or garbage file can never be reported as a
    // release identity that a deploy check would then compare against.
    return /^[0-9a-f]{40}$/.test(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function GET(): Response {
  const sha = readReleaseSha();

  // 503 when unreadable: the process is running but cannot prove what it is,
  // which a deployment health check must treat as unhealthy rather than as
  // "no version available". In local development there is no .release-sha, so
  // this endpoint reporting 503 there is correct and expected.
  return Response.json(
    { sha },
    { status: sha ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
