// No `import "server-only"` here deliberately — see cache-tags.ts for
// why. This module's own imports resolve down to `./client`, which does
// keep the guard, so a hypothetical "use client" import of this file
// still fails a real Next.js build; this file is only ever imported from
// Server Component page files in practice.
import { z } from "zod";
import { resolveEntity } from "./client";
import { getFeelstackContentMode, assertFeelstackEnvValid } from "./content-mode";
import { OUTAGE_ERROR_CODES } from "./contracts";
import { FeelStackUnavailableError, logFeelstackEvent } from "./errors";
import type { Locale } from "./contracts";

/**
 * Hybrid content-mode resolver — brief's hybrid-migration scope decision.
 * This is the one place page components should call into FeelStack; it
 * encodes the corrected failure semantics from brief §5/§6 so no
 * individual page has to re-implement the classification logic.
 *
 * Contract with callers:
 *  - `{ source: "cms" | "static", data }` — render normally.
 *  - `{ source: "not-found" }` — call `notFound()`.
 *  - throws `FeelStackUnavailableError` — let it propagate to
 *    `src/app/[locale]/error.tsx`; do NOT catch-and-notFound() it.
 */
export type ContentResolution<T> = { source: "cms" | "static"; data: T } | { source: "not-found" };

export interface ResolveEntityOptions<T> {
  /** CMS resolve path, e.g. `/medical/${slug}`. */
  path: string;
  locale: Locale;
  schema: z.ZodType<T>;
  /** Local `src/content/*.ts` lookup — the source of truth in "static" mode and the fallback for not-yet-migrated entities in "hybrid" mode. */
  staticFallback: () => T | undefined;
}

export async function resolvePageContent<T>(options: ResolveEntityOptions<T>): Promise<ContentResolution<T>> {
  const { path, locale, schema, staticFallback } = options;
  const mode = getFeelstackContentMode();

  if (mode === "static") {
    const data = staticFallback();
    return data ? { source: "static", data } : { source: "not-found" };
  }

  // "hybrid" or "cms" — env is required; a missing var here is a
  // deployment misconfiguration, never a silent page 404 (brief §5).
  assertFeelstackEnvValid();

  const result = await resolveEntity(path, locale, schema);

  if (result.ok) {
    logFeelstackEvent({ category: "OK", locale, path, requestId: result.requestId });
    return { source: "cms", data: result.data };
  }

  if (result.error === "NOT_FOUND") {
    if (mode === "hybrid") {
      const data = staticFallback();
      if (data) return { source: "static", data };
    }
    return { source: "not-found" };
  }

  if (OUTAGE_ERROR_CODES.includes(result.error)) {
    // Brief: "A CMS outage must produce a controlled 503, not stale
    // fallback content or a false 404" — never fall through to static
    // content here, even in hybrid mode.
    throw new FeelStackUnavailableError(result.error, { status: result.status, requestId: result.requestId });
  }

  // LOCALE_MISMATCH / INVALID_SITE — controlled failure, never a silent
  // 404 or a silent locale swap without verified equivalence.
  throw new FeelStackUnavailableError(result.error, { status: result.status, requestId: result.requestId });
}
