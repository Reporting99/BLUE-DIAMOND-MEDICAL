import { test, expect } from "@playwright/test";
import { cacheTags, type CacheTagKey } from "../../src/lib/feelstack/cache-tags";
import { invalidationCoverage, tagsForEvent } from "../../src/lib/feelstack/revalidation";

/**
 * Cache-tag / invalidation-matrix tests — brief §8 ("Add a test that
 * enumerates all cache-tag builders and proves that each has a matching
 * invalidation rule") and §18 ("Cache behavior" mandatory tests).
 */
test.describe("Cache-tag registry completeness", () => {
  test("every cache-tag builder has at least one invalidation rule", () => {
    const keys = Object.keys(cacheTags) as CacheTagKey[];
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      const rules = invalidationCoverage[key];
      expect(rules, `cacheTags.${key} has no entry in invalidationCoverage`).toBeDefined();
      expect(rules.length, `cacheTags.${key} has an empty invalidation rule list`).toBeGreaterThan(0);
    }
  });

  test("invalidationCoverage references no cache-tag key that doesn't exist", () => {
    const validKeys = new Set(Object.keys(cacheTags));
    for (const key of Object.keys(invalidationCoverage)) {
      expect(validKeys.has(key)).toBe(true);
    }
  });
});

test.describe("Invalidation matrix — brief §8 specific rules", () => {
  test("page publication invalidates the page (and its SEO tag)", () => {
    const tags = tagsForEvent("page.published", { siteKey: "blue-diamond-medical", locale: "en", path: "/en/about" });
    expect(tags).toContain(cacheTags.page("blue-diamond-medical", "en", "/en/about"));
    expect(tags).toContain(cacheTags.seo("blue-diamond-medical", "en", "/en/about"));
    expect(tags).toContain(cacheTags.sitemap("blue-diamond-medical"));
  });

  test("route changes invalidate route inventory, sitemap, and navigation", () => {
    const tags = tagsForEvent("route.changed", { siteKey: "blue-diamond-medical" });
    expect(tags).toContain(cacheTags.routes("blue-diamond-medical"));
    expect(tags).toContain(cacheTags.sitemap("blue-diamond-medical"));
    expect(tags).toContain(cacheTags.navigation("blue-diamond-medical", "en"));
    expect(tags).toContain(cacheTags.navigation("blue-diamond-medical", "ar"));
  });

  test("product changes invalidate the product detail, shop index, and sitemap", () => {
    const tags = tagsForEvent("product.updated", {
      siteKey: "blue-diamond-medical",
      locale: "en",
      entityId: "lumivive-system",
    });
    expect(tags).toContain(cacheTags.product("blue-diamond-medical", "en", "lumivive-system"));
    expect(tags).toContain(cacheTags.productsIndex("blue-diamond-medical", "en"));
    expect(tags).toContain(cacheTags.sitemap("blue-diamond-medical"));
  });

  test("article changes invalidate the article, Health Hub index, and sitemap", () => {
    const tags = tagsForEvent("health-hub-article.published", {
      siteKey: "blue-diamond-medical",
      locale: "en",
      entityId: "some-article",
    });
    expect(tags).toContain(cacheTags.healthHubArticle("blue-diamond-medical", "en", "some-article"));
    expect(tags).toContain(cacheTags.healthHubIndex("blue-diamond-medical", "en"));
    expect(tags).toContain(cacheTags.sitemap("blue-diamond-medical"));
  });

  test("navigation changes invalidate navigation only for the given locale, not both", () => {
    const tags = tagsForEvent("navigation.updated", { siteKey: "blue-diamond-medical", locale: "ar" });
    expect(tags).toContain(cacheTags.navigation("blue-diamond-medical", "ar"));
    expect(tags).not.toContain(cacheTags.navigation("blue-diamond-medical", "en"));
  });

  test("an unrelated event invalidates nothing (no global purge)", () => {
    const tags = tagsForEvent("footer.updated", { siteKey: "blue-diamond-medical", locale: "en" });
    expect(tags).not.toContain(cacheTags.sitemap("blue-diamond-medical"));
    expect(tags).not.toContain(cacheTags.routes("blue-diamond-medical"));
  });
});
