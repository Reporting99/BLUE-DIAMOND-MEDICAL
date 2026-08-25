// No `import "server-only"` here deliberately — see cache-tags.ts for why.
import { cacheTags, type CacheTagKey } from "./cache-tags";
import type { FeelstackContentEventData } from "./schemas";
import type { TemplateType } from "@/types/route";

/**
 * Event -> cache-tag matrix, keyed on the REAL FeelStack event vocabulary.
 *
 * WHAT CHANGED AND WHY
 * --------------------
 * This module previously keyed off a 17-value enum of invented event names
 * (`doctor.updated`, `route.changed`, `booking-config.updated`, ...).
 * FeelStack emits NONE of them. Its real families, verified from the
 * producers at production commit 0e32652c, are `content.<kind>.<action>`
 * and `configuration.<thing>.updated`. Every rule below is derived from a
 * producer that actually exists.
 *
 * TWO GRAMMARS, DELIBERATELY NOT UNIFIED
 * --------------------------------------
 * FeelStack's two content paths do not agree on what the last segment
 * means, and this matters for correctness:
 *
 *   VERB grammar  (structured-content.service.ts::entryEventType)
 *     content.entry.created | .updated | .published | .unpublished | .archived
 *
 *   STATE grammar (directory-content.service.ts, interpolates entity.status)
 *     content.person_profile.draft | .published | .archived
 *     content.faq.draft | .published | .archived
 *
 * On the STATE path there is no `.updated` at all: re-saving an already
 * published doctor re-emits `content.person_profile.published`, and
 * unpublishing arrives as `.draft` or `.archived`, never `.unpublished`.
 * So a matrix that keyed doctors on `.updated` would never fire, and one
 * that treated a repeated `.published` as create-only would skip every
 * real edit.
 *
 * The resolution is to ignore the action segment entirely for entity
 * events. Every action means the same thing to a cache: this entity's
 * state changed, so invalidate it. That is correct under both grammars and
 * needs no transition inference.
 */

/** Locales Blue Diamond serves. `data.locale` is validated against these. */
export type BdLocale = "en" | "ar";
const ALL_LOCALES: readonly BdLocale[] = ["en", "ar"];

/**
 * This SITE's supported-locale policy, kept as data rather than inline string
 * comparisons so the webhook contract can be applied uniformly and a future
 * project can serve a different set without editing the handler.
 */
export const SUPPORTED_LOCALES: readonly string[] = ALL_LOCALES;

/**
 * STRUCTURAL locale validity (BCP-47-shaped), deliberately separate from the
 * supported-locale policy above. A malformed value is a producer contract
 * error; a well-formed value this site does not serve is merely declined.
 * Mirrors the same pattern FeelStack and the Dfeelings receiver apply, so all
 * three agree on what "a locale" even is.
 */
const LOCALE_PATTERN = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i;

export function isStructurallyValidLocale(value: unknown): value is string {
  return typeof value === "string" && value.length <= 35 && LOCALE_PATTERN.test(value);
}

export function isSupportedLocale(value: unknown): value is BdLocale {
  return (
    isStructurallyValidLocale(value) &&
    SUPPORTED_LOCALES.some((entry) => entry.toLowerCase() === value.toLowerCase())
  );
}

interface EntityFamily {
  readonly detail: CacheTagKey;
  readonly index: CacheTagKey;
}

/**
 * FeelStack `contentType` key -> Blue Diamond tag family.
 *
 * Keys are taken from the `contentType` field each feature's own
 * `cms-contract.ts` declares, which is the authoritative Blue Diamond side
 * of the mapping — not from memory and not from FeelStack's admin UI.
 */
export const CONTENT_TYPE_FAMILIES: Readonly<Record<string, EntityFamily>> = {
  "medical-service": {
    detail: "medicalService",
    index: "medicalServicesIndex",
  },
  "aesthetic-treatment": {
    detail: "aestheticTreatment",
    index: "aestheticTreatmentsIndex",
  },
  "aesthetic-concern": { detail: "concern", index: "concernsIndex" },
  technology: { detail: "technology", index: "technologiesIndex" },
  product: { detail: "product", index: "productsIndex" },
};

/**
 * Doctors are NOT a content type. They are FeelStack's first-class
 * `person_profile` model, written through DirectoryContentService, so they
 * never emit `content.entry.*` and carry no `contentType` in their
 * payload. The event name is the only signal.
 */
const PERSON_FAMILY: EntityFamily = { detail: "doctor", index: "doctorsIndex" };

/**
 * Route `templateType` -> Blue Diamond tag family.
 *
 * WHY THIS EXISTS ALONGSIDE CONTENT_TYPE_FAMILIES
 * -----------------------------------------------
 * `content.entry.*` carries `data.contentType`, so its family is known from
 * the payload. `content.relationships.updated` and
 * `content.taxonomy.updated` do NOT -- their payloads describe the relation
 * or the term, not the entity's type. All they carry (since FeelStack #22)
 * is the canonical entityType/entityId/path, and `entityType` is the coarse
 * routing type (`content_entry`), not the family.
 *
 * Rather than guess, the family is resolved from the ROUTE the path already
 * had to match: every RouteEntry declares a typed `templateType`, and the
 * path must be in the registry before anything is invalidated. This is a
 * lookup against Blue Diamond's own source of truth, not an inference.
 *
 * Template types absent here (hub, static, homepage, contact, pricing,
 * booking-hub, medical-botox) are real routes with no per-entity tag family;
 * they still get page/SEO/sitemap tags, just no detail/index pair. That is
 * correct, not a gap.
 */
export const TEMPLATE_FAMILIES: Partial<Record<TemplateType, EntityFamily>> = {
  "doctor-profile": PERSON_FAMILY,
  "medical-service": { detail: "medicalService", index: "medicalServicesIndex" },
  "aesthetic-treatment": { detail: "aestheticTreatment", index: "aestheticTreatmentsIndex" },
  concern: { detail: "concern", index: "concernsIndex" },
  technology: { detail: "technology", index: "technologiesIndex" },
  product: { detail: "product", index: "productsIndex" },
  legal: { detail: "legalPage", index: "legalPagesIndex" },
  article: { detail: "healthHubArticle", index: "healthHubIndex" },
};

/** Resolves the tag family for a route, or undefined when it has none. */
export function familyForTemplateType(templateType: TemplateType): EntityFamily | undefined {
  return TEMPLATE_FAMILIES[templateType];
}

/**
 * Both spellings are accepted for the duration of the FeelStack PR #21
 * transition. Production emitted `content.person_profile.*` before that
 * merge and `content.person.*` after it; a webhook already queued when the
 * merge lands still carries the old name, so accepting only one spelling
 * would drop events on exactly the boundary this is meant to survive.
 *
 * REMOVAL: delete the `content.person_profile.` entry once no outbox row
 * with that name can still be delivered. Nothing else depends on it.
 */
const PERSON_EVENT_PREFIXES = [
  "content.person.",
  "content.person_profile.",
] as const;

export type EventDisposition =
  | { kind: "entity"; family: EntityFamily }
  /**
   * The affected entity is identified by the CANONICAL top-level fields
   * (entityType/entityId/locale/path) rather than by the payload. Its tag
   * family is resolved from the matched route's templateType by the caller,
   * the only layer that has already validated the path against the registry.
   */
  | { kind: "source-entity" }
  | { kind: "page" }
  | { kind: "navigation" }
  | { kind: "site-config" }
  /**
   * The event is genuine and understood, and it correctly invalidates
   * NOTHING on its own, because the real invalidation arrives on separate
   * companion events. Distinct from `backend_event_gap` (we cannot act, and
   * the sender is why) and from `unsupported` (we do not care about this
   * family): here the contract is complete and the right answer is silence.
   */
  | { kind: "companion-invalidated"; reason: string }
  | { kind: "backend_event_gap"; reason: string }
  | { kind: "unsupported"; reason: string };

/**
 * Classifies a real FeelStack event type into what Blue Diamond can do
 * about it. Prefix matching mirrors FeelStack's own endpoint pattern
 * matcher (`webhook.service.ts::matches`, which supports `family.*`).
 *
 * Anything that can change rendered content but cannot be safely acted on
 * returns `backend_event_gap` — never a silent success. Per the brief:
 * report the gap rather than guess which page was affected.
 */
export function classifyEvent(
  type: string,
  data: FeelstackContentEventData,
  /**
   * True when the envelope carried BOTH a usable entityId and a path. Passed
   * in rather than read here so classification stays a pure function of the
   * event, with no knowledge of the route registry.
   */
  hasCanonicalContext = false,
): EventDisposition {
  if (PERSON_EVENT_PREFIXES.some((prefix) => type.startsWith(prefix))) {
    return { kind: "entity", family: PERSON_FAMILY };
  }

  if (type.startsWith("content.entry.")) {
    const contentType = data.contentType;
    if (!contentType) {
      return {
        kind: "backend_event_gap",
        reason:
          "content.entry.* carried no contentType, so the entity family is unknowable.",
      };
    }
    const family = CONTENT_TYPE_FAMILIES[contentType];
    if (!family) {
      return {
        kind: "unsupported",
        reason: `contentType "${contentType}" has no Blue Diamond cms-contract yet.`,
      };
    }
    return { kind: "entity", family };
  }

  if (type.startsWith("content.page.")) return { kind: "page" };
  if (type === "configuration.navigation.updated")
    return { kind: "navigation" };
  if (type === "configuration.settings.updated") return { kind: "site-config" };

  // ---- Known render-impacting families that FeelStack cannot yet describe ----
  //
  // `webhook.service.ts::deliver()` transmits only `{id, type, projectId,
  // occurredAt, data}`. The outbox columns `entityType` / `entityId` /
  // `locale` / `path` are NEVER sent. Producers that put the affected
  // entity's identity only in those columns emit events no consumer can
  // act on. Verified per producer at 0e32652c.
  if (type === "content.relationships.updated") {
    // Closed by FeelStack #22. The payload still names only the relation
    // TARGET; the SOURCE entity whose page actually changed now arrives in
    // the canonical top-level fields. The two must never be conflated --
    // invalidating the target would refresh the wrong page and leave the
    // changed one stale.
    return hasCanonicalContext
      ? { kind: "source-entity" }
      : {
          kind: "backend_event_gap",
          reason:
            "no canonical entityId/path on the envelope; the payload names " +
            "only the relation target, so the source entity is unknowable. " +
            "Sender predates FeelStack PR #22.",
        };
  }
  if (type.startsWith("content.faq.")) {
    // Closed by FeelStack #25. A FAQ has no page of its own — it renders
    // inside the entities it is assigned to — so this event correctly
    // invalidates nothing by itself. The sender now resolves the FAQ's
    // CURRENT rows in `faq_assignments` and fans out one
    // `content.relationships.updated` per affected target, each carrying that
    // target's canonical entityType/entityId/locale/path. Those arrive as
    // `source-entity` above and do the real work.
    //
    // This is deliberately NOT a `backend_event_gap` any more: treating it as
    // one would keep reporting a gap that no longer exists. It is also not a
    // reason to guess — inferring pages from the FAQ id is exactly what the
    // fan-out exists to make unnecessary.
    return {
      kind: "companion-invalidated",
      reason:
        "a FAQ has no page; its assigned targets are invalidated by the " +
        "companion content.relationships.updated events FeelStack #25 emits.",
    };
  }
  if (type === "content.taxonomy.updated") {
    // Closed by FeelStack #22: the tagged entity is now on the wire.
    // `data.termId` names the TERM, never the entity, so it is retained for
    // logging only and never used to select a surface.
    return hasCanonicalContext
      ? { kind: "source-entity" }
      : {
          kind: "backend_event_gap",
          reason:
            "no canonical entityId/path on the envelope; payload is {termId} " +
            "only. Sender predates FeelStack PR #22.",
        };
  }

  return {
    kind: "unsupported",
    reason: `event family is not consumed by Blue Diamond.`,
  };
}

/**
 * Cache-tag keys that no real FeelStack event can currently reach, each
 * with the reason. Kept explicit so the coverage test can distinguish
 * "correctly wired" from "silently orphaned" — an empty rule list would
 * look identical to a missing one.
 */
export const unreachableTags: Partial<Record<CacheTagKey, string>> = {
  navigation:
    "Navigation is frontend-owned (src/config/routes.ts); nothing fetches the CMS navigation endpoint, so no cache entry carries this tag.",
  footer: "No FeelStack event or content type maps to footer content.",
  bookingConfig: "Booking configuration is not modelled in FeelStack.",
  healthHubIndex:
    "Health Hub has no FeelStack content type yet (0 articles migrated).",
  healthHubArticle:
    "Health Hub has no FeelStack content type yet (0 articles migrated).",
  legalPagesIndex:
    "Legal pages have no cms-contract and no FeelStack content type yet.",
  legalPage:
    "Legal pages have no cms-contract and no FeelStack content type yet.",
};

/**
 * Event patterns that can reach each cache-tag key. Inverse direction so
 * tests/cache/cache-tag-coverage.spec.ts can walk `cacheTags` and assert
 * every key is either reachable here or explicitly listed as unreachable.
 */
export const invalidationCoverage: Partial<
  Record<CacheTagKey, readonly string[]>
> = {
  // A redirect appears precisely when something is renamed or moved, which is
  // what these events report. Without this entry the redirect cache was an
  // orphan: written on every 404 lookup, cleared by nothing.
  redirect: [
    "content.page.*",
    "content.entry.*",
    "content.person.*",
    "content.person_profile.*",
  ],
  site: ["configuration.settings.updated"],
  siteSettings: ["configuration.settings.updated"],
  routes: [
    "configuration.settings.updated",
    "content.page.*",
    "content.entry.*",
    "content.person.*",
    "content.person_profile.*",
  ],
  sitemap: [
    "configuration.settings.updated",
    "content.page.*",
    "content.entry.*",
    "content.person.*",
    "content.person_profile.*",
  ],
  page: [
    "content.page.*",
    "content.entry.*",
    "content.person.*",
    "content.person_profile.*",
  ],
  seo: [
    "configuration.settings.updated",
    "content.page.*",
    "content.entry.*",
    "content.person.*",
    "content.person_profile.*",
  ],
  doctorsIndex: ["content.person.*", "content.person_profile.*"],
  doctor: ["content.person.*", "content.person_profile.*"],
  medicalServicesIndex: ["content.entry.* (contentType=medical-service)"],
  medicalService: ["content.entry.* (contentType=medical-service)"],
  aestheticTreatmentsIndex: [
    "content.entry.* (contentType=aesthetic-treatment)",
  ],
  aestheticTreatment: ["content.entry.* (contentType=aesthetic-treatment)"],
  concernsIndex: ["content.entry.* (contentType=aesthetic-concern)"],
  concern: ["content.entry.* (contentType=aesthetic-concern)"],
  technologiesIndex: ["content.entry.* (contentType=technology)"],
  technology: ["content.entry.* (contentType=technology)"],
  productsIndex: ["content.entry.* (contentType=product)"],
  product: ["content.entry.* (contentType=product)"],
};

export interface RevalidationTarget {
  siteKey: string;
  /** From `data.locale`, which is transmitted and authoritative. */
  locale?: BdLocale;
  /** The CMS path from `data.path`, e.g. "/doctors/mohamed-farhat". */
  cmsPath?: string;
  /** `data.previousPath` when a route moved. */
  previousCmsPath?: string;
  /**
   * Tag family for a `source-entity` disposition, resolved by the caller
   * from the matched route's templateType. Only the handler has validated
   * the path against the registry, so only it can resolve this.
   */
  family?: EntityFamily;
  /**
   * Every known CMS path, supplied by the caller for `site-config` only.
   *
   * A `defaultSeo` change has no single affected path -- it is the OUTERMOST
   * layer of the CMS merge, so it reaches every surface that does not
   * override the key. The affected set is therefore "all routes", which only
   * the handler can enumerate: this module stays a pure function of the
   * event, with no knowledge of the route registry (same reason
   * `family` is passed in rather than resolved here).
   */
  allCmsPaths?: readonly string[];
}

/**
 * Detail-tag identifier for an entity.
 *
 * Derived from the LAST SEGMENT OF THE CMS PATH, never from `data.id`.
 * `data.id` is FeelStack's own UUID; Blue Diamond's detail tags are keyed
 * on the route slug (`cacheTags.doctor(siteKey, locale, "mohamed-farhat")`,
 * produced by `entityCacheTags` in page-resolver.ts from the route param).
 * A tag built from the UUID would be well-formed, plausible, and match
 * nothing — failing silently, which is precisely the class of bug this
 * whole change exists to remove. Verified: every entityCacheTags call site
 * passes `cmsPath = /prefix/${id}` with that same id as the detail id.
 */
export function detailIdFromCmsPath(cmsPath: string): string | undefined {
  const segments = cmsPath.split("/").filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1] : undefined;
}

/** Resolves the concrete cache tags an event must invalidate. */
export function tagsForDisposition(
  disposition: EventDisposition,
  target: RevalidationTarget,
): string[] {
  const { siteKey, locale, cmsPath, previousCmsPath, allCmsPaths } = target;
  const locales: readonly BdLocale[] = locale ? [locale] : ALL_LOCALES;
  const tags = new Set<string>();

  const addPathTags = (path: string) => {
    for (const l of locales) {
      tags.add(cacheTags.page(siteKey, l, path));
      tags.add(cacheTags.seo(siteKey, l, path));
    }
  };

  switch (disposition.kind) {
    case "site-config":
      tags.add(cacheTags.site(siteKey));
      tags.add(cacheTags.siteSettings(siteKey));
      // `site_settings.defaultSeo` is the first argument to
      // `mergeSeoMetadata(defaultSeo, section.seo, entity.seo)`, a shallow
      // spread-reduce -- so every key a section and entity leave unset is
      // inherited from it. Two consequences the previous two tags missed:
      //
      //   1. SITEMAP MEMBERSHIP. The generator drops a route when the MERGED
      //      `seo.index` or `seo.sitemapIncluded` is false. Setting
      //      `defaultSeo.sitemapIncluded = false` empties the sitemap of
      //      every non-overriding route.
      //   2. PER-SURFACE SEO. Title, description, canonical and robots
      //      change on every inheriting page.
      //
      // The routes inventory response embeds merged per-item `seo`, so it is
      // stale too -- hence `routes` alongside `sitemap`.
      tags.add(cacheTags.sitemap(siteKey));
      tags.add(cacheTags.routes(siteKey));
      // Deliberately NOT purged: navigation, footer, bookingConfig, and the
      // family index/detail tags. None of them derive from `defaultSeo`, and
      // a site-settings edit is not a reason to refetch the whole catalogue.
      for (const path of allCmsPaths ?? []) {
        for (const l of locales) tags.add(cacheTags.seo(siteKey, l, path));
      }
      break;

    case "navigation":
      // DELIBERATE NO-OP, not an oversight. Blue Diamond's navigation is
      // frontend-owned (`src/config/routes.ts`); nothing in this app fetches
      // `/public/v1/sites/:siteKey/navigation/:slot`, so no cache entry is
      // filed under `cacheTags.navigation` and `revalidateTag` on it could
      // only ever be a silent no-op.
      //
      // Emitting the tag anyway is worse than emitting nothing: it makes the
      // webhook log a purge that did not happen, which reads as coverage.
      // When a navigation fetch producer is added, restore the purge here and
      // move `navigation` out of `unreachableTags` — the contract test in
      // tests/cache/cache-tag-contract.spec.ts fails until both move together.
      break;

    case "page":
    case "entity":
    case "source-entity": {
      if (cmsPath) addPathTags(cmsPath);
      // A moved route leaves its old URL cached; invalidate both sides.
      if (previousCmsPath && previousCmsPath !== cmsPath) {
        addPathTags(previousCmsPath);
        tags.add(cacheTags.routes(siteKey));
      }
      // Publishing or unpublishing adds/removes a sitemap entry either way.
      tags.add(cacheTags.sitemap(siteKey));

      // `entity` carries its family in the disposition (resolved from
      // data.contentType). `source-entity` has none in the payload at all, so
      // the caller resolves it from the route's templateType and passes it in.
      const family = disposition.kind === "entity" ? disposition.family : target.family;
      if (family) {
        const { detail, index } = family;
        for (const l of locales) {
          tags.add(
            (cacheTags[index] as (s: string, l: string) => string)(siteKey, l),
          );
        }
        const entityId = cmsPath ? detailIdFromCmsPath(cmsPath) : undefined;
        if (entityId) {
          for (const l of locales) {
            tags.add(
              (
                cacheTags[detail] as (
                  s: string,
                  l: string,
                  id: string,
                ) => string
              )(siteKey, l, entityId),
            );
          }
        }
      }
      break;
    }

    case "companion-invalidated":
    case "backend_event_gap":
    case "unsupported":
      break;
  }

  return Array.from(tags);
}
