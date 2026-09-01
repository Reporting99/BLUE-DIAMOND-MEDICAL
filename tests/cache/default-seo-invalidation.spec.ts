import { test, expect } from "@playwright/test";
import {
  processRevalidationRequest,
  __resetReplayGuardForTests,
} from "../../src/lib/feelstack/webhook-handler";
import { entityCacheTags } from "../../src/lib/feelstack/page-resolver";
import { cacheTags } from "../../src/lib/feelstack/cache-tags";
import { routes } from "../../src/lib/routing";
import { BD_SITE_KEY, signedRequest } from "../fixtures/feelstack/webhook-envelopes";

/**
 * `site_settings.defaultSeo` invalidation.
 *
 * FeelStack merges SEO in three layers, defaultSeo OUTERMOST:
 *
 *   mergeSeoMetadata(settings.defaultSeo, section.seo, entity.seo)
 *
 * It is a shallow spread-reduce, so every key a section and an entity leave
 * unset is inherited from defaultSeo. Two things follow, and the handler
 * previously did neither:
 *
 *   1. SITEMAP MEMBERSHIP changes. `public-route-resolver.service.ts` drops a
 *      route when the MERGED `seo.index` or `seo.sitemapIncluded` is false, so
 *      `defaultSeo.sitemapIncluded = false` empties the sitemap of every
 *      non-overriding route.
 *   2. PER-SURFACE SEO changes on every inheriting page.
 *
 * Before this change `configuration.settings.updated` purged only `site` and
 * `siteSettings`, and BOTH are tags that no fetch is filed under -- so the
 * event invalidated precisely nothing and stale output was served until TTL.
 */

const SETTINGS_EVENT = {
  type: "configuration.settings.updated",
  entityType: "site_settings",
  entityId: "5c9d1e77-2b44-4a10-9f3e-88ab12cd34ef",
  // Site-wide: the real producer (site-settings.service.ts) records no
  // locale and no path. Both must stay absent -- "no locale" is what makes
  // this mean "every locale".
  locale: null,
  path: null,
} as const;

function effects() {
  const revalidatedTags: string[] = [];
  const revalidatedPaths: string[] = [];
  return {
    revalidateTag: (tag: string) => revalidatedTags.push(tag),
    revalidatePath: (path: string) => revalidatedPaths.push(path),
    revalidatedTags,
    revalidatedPaths,
  };
}

async function runSettingsEvent(data: Record<string, unknown>) {
  const fx = effects();
  const result = await processRevalidationRequest(
    signedRequest({ ...SETTINGS_EVENT, data }),
    fx,
  );
  return { result, tags: fx.revalidatedTags, paths: fx.revalidatedPaths };
}

test.beforeEach(() => {
  __resetReplayGuardForTests();
});

test.describe("defaultSeo: sitemap membership", () => {
  test("a defaultSeo sitemap change invalidates the sitemap", async () => {
    const { result, tags } = await runSettingsEvent({
      id: SETTINGS_EVENT.entityId,
      defaultSeo: { sitemapIncluded: false },
    });
    expect(result.outcome).toBe("revalidated");
    expect(tags).toContain(cacheTags.sitemap(BD_SITE_KEY));
  });

  test("it also invalidates the routes inventory, which embeds merged per-item seo", async () => {
    const { tags } = await runSettingsEvent({
      id: SETTINGS_EVENT.entityId,
      defaultSeo: { index: false },
    });
    expect(tags).toContain(cacheTags.routes(BD_SITE_KEY));
  });
});

test.describe("defaultSeo: affected SEO surfaces", () => {
  test("a defaultSeo metadata change invalidates every inheriting route, in both locales", async () => {
    const { tags } = await runSettingsEvent({
      id: SETTINGS_EVENT.entityId,
      defaultSeo: { title: "Blue Diamond Medical Center" },
    });

    expect(routes.length).toBeGreaterThan(0);
    for (const route of routes) {
      for (const locale of ["en", "ar"] as const) {
        expect(
          tags,
          `missing seo tag for ${route.path.en} (${locale})`,
        ).toContain(cacheTags.seo(BD_SITE_KEY, locale, route.path.en));
      }
    }
  });
});

test.describe("defaultSeo: blast radius is bounded", () => {
  test("unrelated content caches are left untouched", async () => {
    const { tags } = await runSettingsEvent({
      id: SETTINGS_EVENT.entityId,
      defaultSeo: { description: "Amman-based medical and aesthetic care." },
    });

    // Nothing in these families derives from defaultSeo. A site-settings edit
    // is not a reason to refetch the whole catalogue.
    const forbidden = [
      cacheTags.doctorsIndex(BD_SITE_KEY, "en"),
      cacheTags.doctor(BD_SITE_KEY, "en", "mohamed-farhat"),
      cacheTags.productsIndex(BD_SITE_KEY, "en"),
      cacheTags.concernsIndex(BD_SITE_KEY, "en"),
      cacheTags.technologiesIndex(BD_SITE_KEY, "en"),
      cacheTags.medicalServicesIndex(BD_SITE_KEY, "en"),
      cacheTags.aestheticTreatmentsIndex(BD_SITE_KEY, "en"),
      cacheTags.footer(BD_SITE_KEY, "en"),
      cacheTags.bookingConfig(BD_SITE_KEY),
      cacheTags.navigation(BD_SITE_KEY, "en"),
    ];
    for (const tag of forbidden) {
      expect(tags, `must not purge ${tag}`).not.toContain(tag);
    }
  });

  test("no page path is force-revalidated: tag invalidation already reaches every page that used the tag", async () => {
    const { paths } = await runSettingsEvent({
      id: SETTINGS_EVENT.entityId,
      defaultSeo: { follow: false },
    });
    expect(paths).toEqual([]);
  });
});

test.describe("defaultSeo: locale isolation", () => {
  test("a site-wide event covers both locales symmetrically", async () => {
    const { tags } = await runSettingsEvent({
      id: SETTINGS_EVENT.entityId,
      defaultSeo: { title: "Blue Diamond" },
    });
    const en = tags.filter((t) => t.includes(":en:")).length;
    const ar = tags.filter((t) => t.includes(":ar:")).length;
    expect(en).toBe(routes.length);
    expect(ar).toBe(routes.length);
  });

  test("a locale-scoped content event still never crosses into the other locale", async () => {
    const fx = effects();
    // Default fixture: an English person_profile publish.
    const result = await processRevalidationRequest(signedRequest(), fx);
    expect(result.outcome).toBe("revalidated");
    expect(fx.revalidatedTags.some((t) => t.includes(":ar:"))).toBe(false);
    expect(fx.revalidatedPaths.some((p) => p.startsWith("/ar"))).toBe(false);
  });
});

test.describe("the seo tag is real", () => {
  /**
   * REGRESSION GUARD. `cacheTags.seo` used to be generated ONLY on the
   * invalidation side -- no fetch was ever filed under it -- so every
   * `revalidateTag(cacheTags.seo(...))` was a silent no-op, and the entity
   * events appeared to work only because the co-located `page` tag did the
   * real work. A site-wide defaultSeo edit has no `page`-shaped event to ride
   * on, so the fix above is worthless unless this tag actually exists.
   */
  test("entityCacheTags files the resolve envelope under its seo tag", () => {
    const tags = entityCacheTags({
      detail: cacheTags.doctor,
      index: cacheTags.doctorsIndex,
      locale: "en",
      id: "mohamed-farhat",
      path: "/our-team/mohamed-farhat",
    });
    expect(tags).toContain(cacheTags.seo(BD_SITE_KEY, "en", "/our-team/mohamed-farhat"));
    // and still files the tags it always did
    expect(tags).toContain(cacheTags.page(BD_SITE_KEY, "en", "/our-team/mohamed-farhat"));
    expect(tags).toContain(cacheTags.doctor(BD_SITE_KEY, "en", "mohamed-farhat"));
    expect(tags).toContain(cacheTags.doctorsIndex(BD_SITE_KEY, "en"));
  });
});
