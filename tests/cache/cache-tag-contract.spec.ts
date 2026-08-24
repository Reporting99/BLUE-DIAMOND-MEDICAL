import { test, expect } from "@playwright/test";
import { cacheTags, type CacheTagKey } from "../../src/lib/feelstack/cache-tags";
import {
  CONTENT_TYPE_FAMILIES,
  TEMPLATE_FAMILIES,
  invalidationCoverage,
  unreachableTags,
  tagsForDisposition,
  type EventDisposition,
} from "../../src/lib/feelstack/revalidation";
import { getSiteConfig, listRoutes } from "../../src/lib/feelstack/client";
import { entityCacheTags, resolvePageContent } from "../../src/lib/feelstack/page-resolver";
import { defineEntityContract } from "../../src/lib/feelstack/adapters";
import { z } from "zod";

/**
 * REPOSITORY-WIDE CACHE-TAG CONTRACT.
 *
 * The predecessor of this file (`cache-tag-coverage.spec.ts`) proved only ONE
 * direction: that every tag key is either listed in `invalidationCoverage` or
 * declared in `unreachableTags`. That is a check on the INVALIDATION side
 * alone, so a tag could be revalidated forever while no fetch ever filed a
 * cache entry under it — a DEAD INVALIDATION TAG — and the suite stayed green.
 * Four tags were in exactly that state (`seo`, `site`, `siteSettings`,
 * `navigation`); every `revalidateTag` on them was a silent no-op.
 *
 * PRODUCERS ARE OBSERVED, NOT PARSED. A tag counts as produced only if it is
 * actually handed to `fetch` as a `next.tags` entry when the real code path
 * runs. This distinction is load-bearing: `src/app/[locale]/health-hub/
 * [articleId]/page.tsx` and the legal-page route both CALL
 * `entityCacheTags(...)`, so any source scan would report their tags as
 * produced — but `resolvePageContent` returns the static fallback before
 * `resolveEnvelope` when an entity has no `EntityContract`, so those tags
 * never reach a fetch at all. Reading the call site instead of the wire is the
 * same mistake that made `entityType`/`locale`/`path` look transmitted on the
 * FeelStack webhook when `deliver()` was dropping them.
 *
 * Every key must land in exactly one lawful state:
 *
 *   PRODUCED_AND_INVALIDATABLE  a fetch files it, an event can purge it
 *   PRODUCED_TTL_ONLY           a fetch files it, purge is by TTL only,
 *                               and the reason is written down
 *   INTENTIONALLY_UNREACHABLE   nothing fetches it, nothing purges it, and
 *                               `unreachableTags` says why
 *
 * and these are failures:
 *
 *   DEAD_INVALIDATION_TAG   purgeable, nothing produces it
 *   ORPHAN_PRODUCER         produced, but declared unreachable
 *   UNDECLARED_ORPHAN       neither produced nor purgeable nor declared
 */

const SITE = "blue-diamond-medical";

const HYBRID_ENV = {
  FEELSTACK_CONTENT_MODE: "hybrid",
  FEELSTACK_API_URL: "https://feelstack.example.test/api",
  FEELSTACK_SITE_KEY: SITE,
};

function withEnv(vars: Record<string, string | undefined>, fn: () => Promise<void> | void) {
  const original: Record<string, string | undefined> = {};
  for (const key of Object.keys(vars)) original[key] = process.env[key];
  for (const [key, value] of Object.entries(vars)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return Promise.resolve(fn()).finally(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

const ALL_KEYS = Object.keys(cacheTags) as CacheTagKey[];

/**
 * Maps a concrete tag string back to the builder that could have produced it,
 * by its namespace (everything before the first `:`). Namespaces must be
 * unique per key or invalidation would cross entity families — asserted below.
 */
function namespaceOf(tag: string): string {
  return tag.split(":")[0];
}

function buildSample(key: CacheTagKey): string {
  const builder = cacheTags[key] as (...args: string[]) => string;
  return builder(SITE, "en", "sample-id");
}

const NAMESPACE_TO_KEY = new Map<string, CacheTagKey>();
for (const key of ALL_KEYS) NAMESPACE_TO_KEY.set(namespaceOf(buildSample(key)), key);

function keysFromTags(tags: readonly string[]): Set<CacheTagKey> {
  const keys = new Set<CacheTagKey>();
  for (const tag of tags) {
    const key = NAMESPACE_TO_KEY.get(namespaceOf(tag));
    if (key) keys.add(key);
  }
  return keys;
}

/* ------------------------------------------------------------------ */
/* PRODUCERS — observed on the wire                                     */
/* ------------------------------------------------------------------ */

/** Captures every `next.tags` array handed to fetch while `run` executes. */
async function observeProducedTags(run: () => Promise<void>): Promise<string[]> {
  const seen: string[] = [];
  const originalFetch = global.fetch;
  global.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const tags = (init as { next?: { tags?: string[] } } | undefined)?.next?.tags;
    if (tags) seen.push(...tags);
    return new Response("{}", { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  try {
    await run();
  } finally {
    global.fetch = originalFetch;
  }
  return seen;
}

const PROBE_CONTRACT = defineEntityContract({
  contentType: "probe",
  fields: z.object({}).passthrough(),
  adapt: ({ locale, path }) => ({ path, locale, status: "published" as const, title: "probe" }),
});

/** Every family that has really been migrated (an entity contract exists). */
const MIGRATED_FAMILIES = [
  { detail: "doctor", index: "doctorsIndex" },
  ...Object.values(CONTENT_TYPE_FAMILIES),
] as const;

async function collectProducedKeys(): Promise<Set<CacheTagKey>> {
  const produced = new Set<CacheTagKey>();

  await withEnv(HYBRID_ENV, async () => {
    // Site config -> site, siteSettings
    for (const tag of await observeProducedTags(async () => {
      await getSiteConfig().catch(() => undefined);
    })) {
      const key = NAMESPACE_TO_KEY.get(namespaceOf(tag));
      if (key) produced.add(key);
    }

    // Route inventory -> routes, sitemap
    for (const tag of await observeProducedTags(async () => {
      await listRoutes("en").catch(() => undefined);
    })) {
      const key = NAMESPACE_TO_KEY.get(namespaceOf(tag));
      if (key) produced.add(key);
    }

    // Entity reads -> page, seo, detail, index (per migrated family)
    for (const family of MIGRATED_FAMILIES) {
      const tags = await observeProducedTags(async () => {
        await resolvePageContent({
          path: `/probe/${family.detail}`,
          locale: "en",
          contract: PROBE_CONTRACT,
          staticFallback: () => undefined,
          tags: entityCacheTags({
            detail: cacheTags[family.detail as CacheTagKey] as (s: string, l: string, i: string) => string,
            index: cacheTags[family.index as CacheTagKey] as (s: string, l: string) => string,
            locale: "en",
            id: "probe-id",
            path: `/probe/${family.detail}`,
          }),
        }).catch(() => undefined);
      });
      for (const key of keysFromTags(tags)) produced.add(key);
    }
  });

  return produced;
}

/* ------------------------------------------------------------------ */
/* CONSUMERS — every tag any disposition can really emit               */
/* ------------------------------------------------------------------ */

function collectInvalidatableKeys(): Set<CacheTagKey> {
  const emitted = new Set<CacheTagKey>();
  const families = [...Object.values(CONTENT_TYPE_FAMILIES), ...Object.values(TEMPLATE_FAMILIES)].filter(Boolean);

  const dispositions: EventDisposition[] = [
    { kind: "site-config" },
    { kind: "navigation" },
    { kind: "page" },
    ...families.map((family) => ({ kind: "entity" as const, family: family as never })),
    { kind: "source-entity" },
  ];

  for (const disposition of dispositions) {
    for (const locale of ["en", "ar"] as const) {
      for (const family of [undefined, ...families]) {
        const tags = tagsForDisposition(disposition, {
          siteKey: SITE,
          locale,
          cmsPath: "/probe/thing",
          previousCmsPath: "/probe/old",
          family: family as never,
          allCmsPaths: ["/probe/thing"],
        } as never);
        for (const key of keysFromTags(tags)) emitted.add(key);
      }
    }
  }

  // A key listed in the documented coverage map counts as invalidatable even
  // if the loop above cannot construct its exact trigger.
  for (const key of Object.keys(invalidationCoverage) as CacheTagKey[]) emitted.add(key);

  // LATENT PATHS. `TEMPLATE_FAMILIES` names families that are not migrated yet
  // (`legal`, `article`), so `tagsForDisposition` CAN construct their tags —
  // but no event can name them, because no FeelStack content type exists, and
  // no fetch produces them, because no `EntityContract` does. They are
  // declared in `unreachableTags` for exactly that reason and are excluded
  // here rather than counted as live consumers.
  //
  // This is not a loophole: the moment such a family is migrated it gains a
  // producer, and the ORPHAN_PRODUCER test below fails until the key is moved
  // out of `unreachableTags`. The two halves are forced to flip together.
  for (const key of Object.keys(unreachableTags) as CacheTagKey[]) emitted.delete(key);

  return emitted;
}

/* ------------------------------------------------------------------ */

test.describe("cache-tag contract — both directions", () => {
  test("no DEAD_INVALIDATION_TAG: every invalidatable tag has a real fetch producer", async () => {
    const produced = await collectProducedKeys();
    const invalidatable = collectInvalidatableKeys();

    const dead = [...invalidatable].filter((key) => !produced.has(key));
    expect(
      dead,
      `DEAD_INVALIDATION_TAG — these tags are purged by an event but no fetch ever files a cache ` +
        `entry under them, so every revalidateTag() on them is a silent no-op: ${dead.join(", ")}`,
    ).toEqual([]);
  });

  test("no ORPHAN_PRODUCER: nothing declared unreachable is actually produced", async () => {
    const produced = await collectProducedKeys();
    const orphans = (Object.keys(unreachableTags) as CacheTagKey[]).filter((key) => produced.has(key));
    expect(
      orphans,
      `ORPHAN_PRODUCER — declared unreachable in unreachableTags, yet a real fetch files a cache ` +
        `entry under them, so they can go stale with no way to purge: ${orphans.join(", ")}`,
    ).toEqual([]);
  });

  test("no UNDECLARED_ORPHAN: every key is produced, invalidatable, or documented", async () => {
    const produced = await collectProducedKeys();
    const invalidatable = collectInvalidatableKeys();

    const undeclared = ALL_KEYS.filter(
      (key) => !produced.has(key) && !invalidatable.has(key) && !unreachableTags[key],
    );
    expect(
      undeclared,
      `UNDECLARED_ORPHAN — a tag builder nothing produces, nothing purges, and nothing explains. ` +
        `Either wire it up or add a reason to unreachableTags: ${undeclared.join(", ")}`,
    ).toEqual([]);
  });

  test("every key resolves to exactly one lawful state", async () => {
    const produced = await collectProducedKeys();
    const invalidatable = collectInvalidatableKeys();

    const matrix = ALL_KEYS.map((key) => {
      const p = produced.has(key);
      const c = invalidatable.has(key);
      const u = Boolean(unreachableTags[key]);
      let status = "INVALID";
      if (p && c && !u) status = "PRODUCED_AND_INVALIDATABLE";
      else if (p && !c && !u) status = "PRODUCED_TTL_ONLY";
      else if (!p && !c && u) status = "INTENTIONALLY_UNREACHABLE";
      return { key, producer: p, consumer: c, unreachable: u, status };
    });

    const invalid = matrix.filter((row) => row.status === "INVALID");
    expect(
      invalid.map((r) => `${r.key}(producer=${r.producer},consumer=${r.consumer},unreachable=${r.unreachable})`),
      "every cache tag must be PRODUCED_AND_INVALIDATABLE, PRODUCED_TTL_ONLY, or INTENTIONALLY_UNREACHABLE",
    ).toEqual([]);
  });

  test("a PRODUCED_TTL_ONLY tag must carry a written justification", async () => {
    const produced = await collectProducedKeys();
    const invalidatable = collectInvalidatableKeys();
    const ttlOnly = ALL_KEYS.filter((key) => produced.has(key) && !invalidatable.has(key));
    for (const key of ttlOnly) {
      expect(
        typeof ttlOnlyJustifications[key] === "string" && ttlOnlyJustifications[key]!.length > 20,
        `${key} is produced but never invalidated and has no justification in ttlOnlyJustifications`,
      ).toBe(true);
    }
  });
});

/**
 * Tags a fetch files but no event purges, each with the reason it is safe to
 * leave to the 45s TTL. Empty today; kept so the state is expressible without
 * loosening the contract.
 */
const ttlOnlyJustifications: Partial<Record<CacheTagKey, string>> = {};

test.describe("cache-tag contract — drift", () => {
  test("no STRING DRIFT: every namespace is unique and stable", () => {
    expect(NAMESPACE_TO_KEY.size, "two cache-tag builders share a namespace; invalidation would cross families").toBe(
      ALL_KEYS.length,
    );
    for (const key of ALL_KEYS) {
      expect(buildSample(key).startsWith("feelstack-"), `${key} does not use the feelstack- namespace`).toBe(true);
    }
  });

  test("no LOCALE DRIFT: locale-scoped builders embed the locale, site-scoped ones do not", () => {
    for (const key of ALL_KEYS) {
      const builder = cacheTags[key] as (...args: string[]) => string;
      const en = builder(SITE, "en", "sample-id");
      const ar = builder(SITE, "ar", "sample-id");
      const isLocaleScoped = builder.length >= 2;
      if (isLocaleScoped) {
        expect(en, `${key} takes a locale but ignores it — an AR purge would hit the EN entry`).not.toBe(ar);
      } else {
        expect(en, `${key} is site-scoped but its output varies by locale`).toBe(ar);
      }
    }
  });

  test("no FAMILY/TAG MISMATCH: every family names real, correctly-shaped builders", () => {
    const families = [...Object.values(CONTENT_TYPE_FAMILIES), ...Object.values(TEMPLATE_FAMILIES)].filter(Boolean);
    for (const family of families) {
      const { detail, index } = family as { detail: CacheTagKey; index: CacheTagKey };
      expect(ALL_KEYS, `unknown detail tag key ${detail}`).toContain(detail);
      expect(ALL_KEYS, `unknown index tag key ${index}`).toContain(index);
      // A detail builder takes (site, locale, id); an index builder (site, locale).
      expect((cacheTags[detail] as (...a: string[]) => string).length, `${detail} is not detail-shaped`).toBe(3);
      expect((cacheTags[index] as (...a: string[]) => string).length, `${index} is not index-shaped`).toBe(2);
      expect(detail, `${detail} is used as both detail and index`).not.toBe(index);
    }
  });

  test("a key is never both invalidatable and declared unreachable", () => {
    for (const key of ALL_KEYS) {
      const both = Boolean(invalidationCoverage[key]?.length) && Boolean(unreachableTags[key]);
      expect(both, `cacheTags.${key} is declared both invalidatable and unreachable`).toBe(false);
    }
  });

  test("a declared-unreachable family is genuinely unmigrated — no producer exists", async () => {
    // The coupling that makes excluding unreachable keys from the consumer set
    // safe. If a family is migrated (its tags become produced) while still
    // declared unreachable, this and ORPHAN_PRODUCER both fail.
    const produced = await collectProducedKeys();
    for (const key of Object.keys(unreachableTags) as CacheTagKey[]) {
      expect(
        produced.has(key),
        `cacheTags.${key} is declared unreachable but a fetch now files a cache entry under it — ` +
          `move it out of unreachableTags and give it an invalidation path`,
      ).toBe(false);
    }
  });

  test("every unreachable reason is a real explanation", () => {
    for (const [key, reason] of Object.entries(unreachableTags)) {
      expect(typeof reason === "string" && reason.length > 10, `${key} has no usable reason`).toBe(true);
    }
  });
});
