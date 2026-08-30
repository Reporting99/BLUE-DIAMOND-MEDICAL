// No `import "server-only"` here deliberately — see cache-tags.ts for
// why. This module's own imports resolve down to `./client`, which does
// keep the guard, so a hypothetical "use client" import of this file
// still fails a real Next.js build; this file is only ever imported from
// Server Component page files in practice.
import { resolveEnvelope } from "./client";
import { getFeelstackContentMode, assertFeelstackEnvValid, getFeelstackSiteKey } from "./content-mode";
import { cacheTags } from "./cache-tags";
import { OUTAGE_ERROR_CODES } from "./contracts";
import { FeelStackUnavailableError, logFeelstackEvent } from "./errors";
import type { Locale } from "./contracts";
import { checkLocaleIntegrity } from "./locale-integrity";
import { toAdapterInput, type EntityContract } from "./adapters";
import { entityPayload } from "./transport";

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
export interface PreviewMediaAssignment {
  slot: string;
  path: string;
  width?: number;
  height?: number;
  alt?: Record<string, string>;
}

export type ContentResolution<T> =
  | {
      source: "cms" | "static" | "draft";
      data: T;
      /** Assignments from the CMS envelope. Populated in Draft Mode. */
      media?: readonly PreviewMediaAssignment[];
    }
  | { source: "not-found" };

export interface ResolveEntityOptions<T, F = unknown> {
  /** CMS resolve path, e.g. `/medical/${slug}`. */
  path: string;
  locale: Locale;
  /**
   * The entity's per-locale field schema plus its adapter. Supplying a contract
   * switches this path on for that entity; without one the resolver serves
   * static content and never calls the CMS, which is how entities migrate one
   * at a time instead of all at once.
   */
  contract?: EntityContract<F, T>;
  /** Local `src/content/*.ts` lookup — the source of truth in "static" mode and the fallback for not-yet-migrated entities in "hybrid" mode. */
  staticFallback: () => T | undefined;
  /**
   * Cache tags for this entity, built via `entityCacheTags()` below. These are
   * attached to the underlying fetch so the webhook's `revalidateTag()` calls
   * have something to invalidate — without them every tag in cache-tags.ts is
   * an orphan and a publish event silently no-ops (brief §17).
   */
  tags?: readonly string[];
}

export async function resolvePageContent<T, F = unknown>(
  options: ResolveEntityOptions<T, F>,
): Promise<ContentResolution<T>> {
  const { path, locale, contract, staticFallback, tags = [] } = options;
  const mode = getFeelstackContentMode();

  // Draft Mode: FeelStack is the ONLY source. Falling through to
  // `staticFallback()` here is what made a preview silently render the local
  // fixture instead of the CMS draft an operator was trying to review -- the
  // page looked fine and the draft was invisible. A draft that cannot be read
  // is reported as not-found rather than papered over with static content.
  // Non-draft requests never reach this branch, so published behaviour is
  // untouched.
  if (await isDraftModeEnabled()) {
    const draft = await resolveDraftContent<T, F>(options);
    if (draft) return draft;
    return { source: "not-found" };
  }

  if (mode === "static") {
    const data = staticFallback();
    return data ? { source: "static", data } : { source: "not-found" };
  }

  // An entity with no contract yet is not migrated yet. Serving its approved
  // static content is correct; guessing its CMS field shape is how this
  // integration got a forward-declared contract in the first place.
  if (!contract) {
    const data = staticFallback();
    return data ? { source: "static", data } : { source: "not-found" };
  }

  // "hybrid" or "cms" — env is required; a missing var here is a
  // deployment misconfiguration, never a silent page 404 (brief §5).
  assertFeelstackEnvValid();

  const result = await resolveEnvelope(path, locale, tags);

  if (result.ok) {
    const envelope = result.data;

    // Locale integrity BEFORE anything is read out of the payload, so wrong-
    // language content cannot reach a domain model, a template, metadata or
    // JSON-LD. A cross-locale fallback means this locale's content is absent —
    // it is never a reason to render the other language.
    const integrity = checkLocaleIntegrity(envelope, locale);
    if (!integrity.ok) {
      logFeelstackEvent({
        category: "LOCALE_MISMATCH",
        locale,
        path,
        requestId: result.requestId,
        upstreamContext: `${integrity.reason}: resolved ${integrity.resolved}`,
      });
      if (mode === "hybrid") {
        const data = staticFallback();
        if (data) return { source: "static", data };
      }
      return { source: "not-found" };
    }

    const fields = contract.fields.safeParse(entityPayload(envelope));
    if (!fields.success) {
      // A contract error is an outage, not an absence: the CMS answered, we
      // simply cannot trust what it said. Falling back to static here would
      // hide a broken content model behind content that still looks fine.
      logFeelstackEvent({
        category: "INVALID_RESPONSE",
        locale,
        path,
        requestId: result.requestId,
        upstreamContext: "entity fields failed schema validation",
      });
      throw new FeelStackUnavailableError("INVALID_RESPONSE", { requestId: result.requestId });
    }

    logFeelstackEvent({ category: "OK", locale, path, requestId: result.requestId });
    return { source: "cms", data: contract.adapt(toAdapterInput(envelope, locale, fields.data)) };
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

/**
 * Builds the standard tag set for one entity page: its own detail tag, its
 * listing tag, and the page tag for the resolved path. Callers pass the
 * `cacheTags` builders rather than raw strings so the tag namespace stays
 * defined in exactly one place.
 *
 * Every key used here is covered by `invalidationCoverage`
 * (./revalidation.ts) and enforced by tests/cache/cache-tag-coverage.spec.ts,
 * so a tag produced here always has a matching invalidation event.
 */
export function entityCacheTags(options: {
  detail: (siteKey: string, locale: string, id: string) => string;
  index: (siteKey: string, locale: string) => string;
  locale: Locale;
  id: string;
  path: string;
}): string[] {
  const siteKey = getFeelstackSiteKey();
  const { detail, index, locale, id, path } = options;
  return [
    detail(siteKey, locale, id),
    index(siteKey, locale),
    cacheTags.page(siteKey, locale, path),
    // The resolve envelope carries this surface's MERGED SEO
    // (`public-route-resolver.service.ts` merges
    // `settings.defaultSeo -> section.seo -> entity.seo`), so the response is
    // SEO data as much as it is page data. Filing it under the `seo` tag too
    // is what makes `revalidateTag(cacheTags.seo(...))` mean anything: before
    // this, `seo` was produced only on the invalidation side, so every purge
    // of it was a silent no-op and only the co-located `page` tag did real
    // work. A site-wide `defaultSeo` edit has no `page`-shaped event to ride
    // on, so it needed this tag to actually exist.
    cacheTags.seo(siteKey, locale, path),
  ];
}


/**
 * Whether Next's Draft Mode cookie is set for this request.
 *
 * Imported lazily so that modules which pull in the resolver outside a request
 * scope (tests, build-time helpers) do not fail on `next/headers`.
 */
async function isDraftModeEnabled(): Promise<boolean> {
  try {
    const { draftMode } = await import("next/headers");
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

/**
 * Read one entity through FeelStack's preview surface.
 *
 * Returns `null` when preview is unconfigured or the CMS has nothing for this
 * path, which the caller turns into a not-found. It never returns static
 * content: in Draft Mode the CMS is the authority, and a fallback here would
 * reintroduce exactly the substitution this function exists to stop.
 */
async function resolveDraftContent<T, F = unknown>(
  options: ResolveEntityOptions<T, F>,
): Promise<ContentResolution<T> | null> {
  const { path, locale, contract } = options;
  if (!contract) return null;

  const { isPreviewConfigured, previewResolve } = await import("./preview-client");
  if (!isPreviewConfigured()) return null;

  const envelope = (await previewResolve(path, locale)) as
    | (Record<string, unknown> & { media?: PreviewMediaAssignment[] })
    | null;
  if (!envelope) return null;

  const integrity = checkLocaleIntegrity(envelope as never, locale);
  if (!integrity.ok) return null;

  const fields = contract.fields.safeParse(
    entityPayload(envelope as { type: string; data: Record<string, unknown> }),
  );
  if (!fields.success) return null;

  return {
    source: "draft",
    data: contract.adapt(toAdapterInput(envelope as never, locale, fields.data)),
    media: Array.isArray(envelope.media) ? envelope.media : [],
  };
}
