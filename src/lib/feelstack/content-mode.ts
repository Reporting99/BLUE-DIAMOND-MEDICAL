// No `import "server-only"` here deliberately — see cache-tags.ts for why
// (needs to be importable by tests outside Next's build pipeline). This
// module reads FEELSTACK_API_URL/FEELSTACK_SITE_KEY/FEELSTACK_CONTENT_MODE
// (configuration, not the credential) from `process.env`; the actual
// FEELSTACK_REVALIDATE_SECRET is read only in
// `src/app/api/feelstack/revalidate/route.ts`, a Next.js Route Handler,
// which the framework itself never bundles for the client. Nothing in
// this module is imported by a "use client" component.
import { FeelStackConfigurationError } from "./errors";

/**
 * Content-source mode — brief's hybrid-migration instruction (2026-08-22
 * scope decision, see docs/ARCHITECTURE.md).
 *
 *  - "static": ignore FeelStack entirely, `src/content/*.ts` is the only
 *    source. This is the default and matches this build's shipped state
 *    (docs/DEPLOYMENT.md) — nothing changes for a deployment that
 *    doesn't set this var.
 *  - "hybrid": try FeelStack first; a confirmed "this entity doesn't exist
 *    in the CMS yet" (NOT_FOUND) falls through to `src/content/*.ts`; a
 *    CMS *outage* (timeout/network/5xx/malformed) does NOT fall through —
 *    it surfaces as a controlled failure (brief: "A CMS outage must
 *    produce a controlled 503, not stale fallback content or a false
 *    404").
 *  - "cms": FeelStack is the sole source; `src/content/*.ts` is never
 *    consulted. Not used by anything yet — reserved for after full
 *    migration.
 */
export type FeelstackContentMode = "static" | "hybrid" | "cms";

const VALID_MODES: readonly FeelstackContentMode[] = ["static", "hybrid", "cms"];

function readRawMode(): string | undefined {
  return process.env.FEELSTACK_CONTENT_MODE;
}

export function getFeelstackContentMode(): FeelstackContentMode {
  const raw = readRawMode();
  if (!raw) return "static";
  if (!VALID_MODES.includes(raw as FeelstackContentMode)) {
    throw new FeelStackConfigurationError(
      `FEELSTACK_CONTENT_MODE must be one of ${VALID_MODES.join(" | ")}, got an unrecognized value.`,
    );
  }
  return raw as FeelstackContentMode;
}

export function isFeelstackConfigured(): boolean {
  return Boolean(process.env.FEELSTACK_API_URL && process.env.FEELSTACK_SITE_KEY);
}

/**
 * Startup environment validation — brief §4 ("Validate all required
 * environment variables at startup"). Call once from a server entrypoint
 * (the resolvers below call it lazily on first use, which is
 * request-startup for a serverless deployment). Throws
 * `FeelStackConfigurationError` — a configuration error must never
 * silently become a page 404 (brief §5).
 */
export function assertFeelstackEnvValid(): void {
  const mode = getFeelstackContentMode();
  if (mode === "static") return; // no FeelStack env required at all

  if (!process.env.FEELSTACK_API_URL) {
    throw new FeelStackConfigurationError(
      `FEELSTACK_CONTENT_MODE=${mode} requires FEELSTACK_API_URL to be set.`,
    );
  }
  if (!process.env.FEELSTACK_SITE_KEY) {
    throw new FeelStackConfigurationError(
      `FEELSTACK_CONTENT_MODE=${mode} requires FEELSTACK_SITE_KEY to be set.`,
    );
  }
}

export function getFeelstackSiteKey(): string {
  return process.env.FEELSTACK_SITE_KEY ?? "blue-diamond-medical";
}

export function getFeelstackApiUrl(): string | undefined {
  return process.env.FEELSTACK_API_URL;
}
