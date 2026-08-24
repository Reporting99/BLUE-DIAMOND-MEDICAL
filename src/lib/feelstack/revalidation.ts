// No `import "server-only"` here deliberately — see cache-tags.ts for why.
import { cacheTags, type CacheTagKey } from "./cache-tags";
import type { FeelstackContentEventData } from "./schemas";

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
  | { kind: "page" }
  | { kind: "navigation" }
  | { kind: "site-config" }
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
    return {
      kind: "backend_event_gap",
      reason:
        "payload is {relationKey, targetType, targetId} (or {relation, faqId}); " +
        "it identifies the relation TARGET, never the source entity whose page " +
        "changed, and carries no locale or path.",
    };
  }
  if (type.startsWith("content.faq.")) {
    return {
      kind: "backend_event_gap",
      reason:
        "payload is {id, status, locale} with no path and no assigned targets; " +
        "which pages embed this FAQ is not derivable from the event.",
    };
  }
  if (type === "content.taxonomy.updated") {
    return {
      kind: "backend_event_gap",
      reason:
        "payload is {termId} only; the affected entity is in the untransmitted entityId column.",
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
  site: ["configuration.settings.updated"],
  siteSettings: ["configuration.settings.updated"],
  navigation: ["configuration.navigation.updated"],
  routes: [
    "content.page.*",
    "content.entry.*",
    "content.person.*",
    "content.person_profile.*",
  ],
  sitemap: [
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
  const { siteKey, locale, cmsPath, previousCmsPath } = target;
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
      break;

    case "navigation":
      for (const l of locales) tags.add(cacheTags.navigation(siteKey, l));
      break;

    case "page":
    case "entity": {
      if (cmsPath) addPathTags(cmsPath);
      // A moved route leaves its old URL cached; invalidate both sides.
      if (previousCmsPath && previousCmsPath !== cmsPath) {
        addPathTags(previousCmsPath);
        tags.add(cacheTags.routes(siteKey));
      }
      // Publishing or unpublishing adds/removes a sitemap entry either way.
      tags.add(cacheTags.sitemap(siteKey));

      if (disposition.kind === "entity") {
        const { detail, index } = disposition.family;
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

    case "backend_event_gap":
    case "unsupported":
      break;
  }

  return Array.from(tags);
}
