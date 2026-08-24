import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { cacheTags, type CacheTagKey } from "../../src/lib/feelstack/cache-tags";
import {
  CONTENT_TYPE_FAMILIES,
  classifyEvent,
  invalidationCoverage,
  tagsForDisposition,
  unreachableTags,
} from "../../src/lib/feelstack/revalidation";

const SITE = "blue-diamond-medical";

/** Resolves an event end-to-end the way the handler does. */
function tagsFor(type: string, data: Record<string, unknown>, target: Record<string, unknown> = {}) {
  const disposition = classifyEvent(type, data as never);
  return tagsForDisposition(disposition, { siteKey: SITE, ...target } as never);
}

test.describe("Cache-tag registry completeness", () => {
  /**
   * Every tag builder must be either reachable from a real FeelStack event
   * or explicitly declared unreachable WITH a reason. The previous version
   * of this test required a rule for every key, which the old invented
   * event vocabulary satisfied trivially — a matrix can be 100% "covered"
   * by events that are never emitted. Splitting the two states is what
   * makes the guard mean something.
   */
  test("every cache-tag builder is either invalidatable or declared unreachable", () => {
    const keys = Object.keys(cacheTags) as CacheTagKey[];
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      const reachable = invalidationCoverage[key];
      const unreachable = unreachableTags[key];
      expect(
        Boolean(reachable?.length) || Boolean(unreachable),
        `cacheTags.${key} is neither invalidatable nor declared unreachable`,
      ).toBe(true);
      expect(Boolean(reachable?.length) && Boolean(unreachable), `cacheTags.${key} is declared both`).toBe(false);
    }
  });

  test("neither map references a cache-tag key that does not exist", () => {
    const valid = new Set(Object.keys(cacheTags));
    for (const key of [...Object.keys(invalidationCoverage), ...Object.keys(unreachableTags)]) {
      expect(valid.has(key), `unknown cache-tag key: ${key}`).toBe(true);
    }
  });

  test("every unreachable tag carries a non-empty reason", () => {
    for (const [key, reason] of Object.entries(unreachableTags)) {
      expect(typeof reason === "string" && reason.length > 10, `${key} has no usable reason`).toBe(true);
    }
  });
});

test.describe("Invalidation matrix — real FeelStack events", () => {
  test("a doctor publish invalidates the doctor, the index, and the sitemap", () => {
    const tags = tagsFor(
      "content.person_profile.published",
      { status: "published", locale: "en", path: "/doctors/mohamed-farhat" },
      { locale: "en", cmsPath: "/doctors/mohamed-farhat" },
    );
    expect(tags).toContain(cacheTags.doctor(SITE, "en", "mohamed-farhat"));
    expect(tags).toContain(cacheTags.doctorsIndex(SITE, "en"));
    expect(tags).toContain(cacheTags.sitemap(SITE));
  });

  test("the detail id comes from the path, never from the FeelStack UUID", () => {
    const uuid = "9b7c1a20-4f3e-4d5a-8b21-0c6e9f2a1d33";
    const tags = tagsFor(
      "content.person_profile.published",
      { id: uuid, status: "published", locale: "en", path: "/doctors/mohamed-farhat" },
      { locale: "en", cmsPath: "/doctors/mohamed-farhat" },
    );
    expect(tags).toContain(cacheTags.doctor(SITE, "en", "mohamed-farhat"));
    expect(tags.some((t) => t.includes(uuid))).toBe(false);
  });

  test("every migrated content type maps to its own family and no other", () => {
    for (const [contentType, family] of Object.entries(CONTENT_TYPE_FAMILIES)) {
      const disposition = classifyEvent("content.entry.published", { contentType } as never);
      expect(disposition.kind, contentType).toBe("entity");
      if (disposition.kind !== "entity") continue;
      expect(disposition.family.detail, contentType).toBe(family.detail);
    }
  });

  test("invalidation is per-locale — an Arabic event never touches English tags", () => {
    const tags = tagsFor(
      "content.person_profile.published",
      { status: "published", locale: "ar", path: "/doctors/mohamed-farhat" },
      { locale: "ar", cmsPath: "/doctors/mohamed-farhat" },
    );
    expect(tags).toContain(cacheTags.doctor(SITE, "ar", "mohamed-farhat"));
    expect(tags).not.toContain(cacheTags.doctor(SITE, "en", "mohamed-farhat"));
  });

  test("a renamed route invalidates both the old and the new path", () => {
    const tags = tagsFor(
      "content.entry.updated",
      { contentType: "medical-service", locale: "en", path: "/medical/eye-screening" },
      { locale: "en", cmsPath: "/medical/eye-screening", previousCmsPath: "/medical/old-slug" },
    );
    expect(tags).toContain(cacheTags.page(SITE, "en", "/medical/eye-screening"));
    expect(tags).toContain(cacheTags.page(SITE, "en", "/medical/old-slug"));
    expect(tags).toContain(cacheTags.routes(SITE));
  });

  test("a navigation change invalidates NOTHING, because nothing fetches CMS navigation", () => {
    // Overturned deliberately. This test used to assert
    // `revalidateTag(cacheTags.navigation(...))`, and it passed — but no fetch
    // in this app ever filed a cache entry under that tag, so the purge was a
    // silent no-op that merely LOOKED like coverage. Blue Diamond's navigation
    // is frontend-owned (src/config/routes.ts).
    //
    // Emitting nothing is the truthful behaviour. When a CMS navigation fetch
    // producer is added, this assertion flips back and `navigation` moves out
    // of `unreachableTags` — tests/cache/cache-tag-contract.spec.ts fails until
    // both happen together.
    const tags = tagsFor("configuration.navigation.updated", {}, { locale: "ar" });
    expect(tags).toEqual([]);
  });

  test("gapped and unsupported events invalidate nothing — no global purge", () => {
    for (const type of ["content.relationships.updated", "content.faq.published", "content.taxonomy.updated", "content.casestudy.published"]) {
      expect(tagsFor(type, {}, { locale: "en" }), type).toEqual([]);
    }
  });

  test("relationship and taxonomy events without canonical context are gaps, not unsupported", () => {
    // These two are only actionable when the sender puts the affected entity
    // on the envelope (FeelStack #22). Without it the payload names the
    // relation TARGET or the TERM, never the entity whose page changed.
    for (const type of ["content.relationships.updated", "content.taxonomy.updated"]) {
      const disposition = classifyEvent(type, {} as never);
      expect(disposition.kind, type).toBe("backend_event_gap");
    }
  });

  test("a FAQ event is companion-invalidated, no longer a backend gap", () => {
    // Closed by FeelStack #25: a FAQ has no page of its own, and the sender
    // now fans out one content.relationships.updated per currently-assigned
    // target. Silence here is the CORRECT answer, not a missing capability —
    // continuing to call it a gap would keep reporting one that is fixed.
    const disposition = classifyEvent("content.faq.published", {} as never);
    expect(disposition.kind).toBe("companion-invalidated");
    expect(tagsFor("content.faq.published", {}, { locale: "en" })).toEqual([]);
  });
});

/**
 * Producer coverage. The rest of this file proves every tag has an
 * INVALIDATOR; this proves every entity route is a PRODUCER.
 *
 * That gap is not theoretical. medical/[serviceId] — the original reference
 * implementation — called resolvePageContent without `tags` for a long time,
 * so `medicalService` and `medicalServicesIndex` had a complete invalidation
 * matrix, a webhook that referenced them, and a passing coverage test, while
 * no cache entry ever carried them. A publish would have silently no-opped.
 * Consumer-side coverage alone cannot see this.
 */
test.describe("cache tag producers", () => {
  test("every route that resolves CMS content also attaches cache tags", () => {
    const appDir = path.join(process.cwd(), "src", "app");
    const offenders: string[] = [];

    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (statSync(full).isDirectory()) {
          walk(full);
        } else if (entry === "page.tsx") {
          const source = readFileSync(full, "utf8");
          if (source.includes("resolvePageContent") && !source.includes("entityCacheTags")) {
            offenders.push(path.relative(appDir, full));
          }
        }
      }
    };
    walk(appDir);

    expect(offenders, `these routes resolve CMS content but attach no cache tags: ${offenders.join(", ")}`).toEqual([]);
  });
});
