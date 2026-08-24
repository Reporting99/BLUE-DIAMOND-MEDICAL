import { test, expect } from "@playwright/test";
import { getSiteConfig, FeelStackSiteConfigContractError } from "../../src/lib/feelstack/client";
import { feelstackSiteConfigSchema } from "../../src/lib/feelstack/schemas";
import { cacheTags } from "../../src/lib/feelstack/cache-tags";

/**
 * Site-config contract tests.
 *
 * `getSiteConfig()` exists to be the PRODUCER for the `site` and `siteSettings`
 * cache tags. Before it, both were invalidated by
 * `configuration.settings.updated` and attached to no fetch anywhere, so every
 * purge was a silent no-op — a dead invalidation tag.
 *
 * The tenant assertion is the other half of the reason this function is not
 * just `fetch().then(json)`: FeelStack is a SHARED instance that also serves
 * Dfeelings, and another tenant's config would be well-formed, plausible, and
 * completely wrong.
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

/**
 * Captured live 2026-08-24 from
 * GET /api/public/v1/sites/blue-diamond-medical/config — including the empty
 * objects, which is what an unconfigured tenant really looks like.
 */
const LIVE_CONFIG = {
  siteKey: SITE,
  siteName: "Blue Diamond Medical",
  defaultLocale: "en",
  supportedLocales: ["en", "ar"],
  defaultSeo: {},
  socialProfiles: {},
  contactInformation: {},
  analytics: {},
  branding: {},
  features: { prelaunch: true },
  sitemap: { enabled: false },
  updatedAt: "2026-08-23T10:07:34.638Z",
};

function stubJson(body: unknown, status = 200) {
  const captured: { tags: string[] } = { tags: [] };
  const originalFetch = global.fetch;
  global.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    const tags = (init as { next?: { tags?: string[] } } | undefined)?.next?.tags;
    if (tags) captured.tags.push(...tags);
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  return { captured, restore: () => void (global.fetch = originalFetch) };
}

test.describe("site config — schema", () => {
  test("accepts the live payload, empty objects and all", () => {
    expect(feelstackSiteConfigSchema.safeParse(LIVE_CONFIG).success).toBe(true);
  });

  test("an empty defaultSeo is a legitimate value, not an error", () => {
    const parsed = feelstackSiteConfigSchema.parse(LIVE_CONFIG);
    expect(parsed.defaultSeo).toEqual({});
  });

  test("rejects a payload missing a required key", () => {
    const rest: Record<string, unknown> = { ...LIVE_CONFIG };
    delete rest.supportedLocales;
    expect(feelstackSiteConfigSchema.safeParse(rest).success).toBe(false);
  });

  test("rejects an empty supportedLocales array", () => {
    expect(feelstackSiteConfigSchema.safeParse({ ...LIVE_CONFIG, supportedLocales: [] }).success).toBe(false);
  });

  test("keeps unknown sitemap keys instead of failing on them", () => {
    const parsed = feelstackSiteConfigSchema.safeParse({
      ...LIVE_CONFIG,
      sitemap: { enabled: true, changefreq: "weekly" },
    });
    expect(parsed.success).toBe(true);
  });
});

test.describe("site config — producer", () => {
  test("files the response under the site and siteSettings tags", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const stub = stubJson(LIVE_CONFIG);
      try {
        await getSiteConfig();
        expect(stub.captured.tags).toContain(cacheTags.site(SITE));
        expect(stub.captured.tags).toContain(cacheTags.siteSettings(SITE));
      } finally {
        stub.restore();
      }
    });
  });

  test("returns the parsed config", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const stub = stubJson(LIVE_CONFIG);
      try {
        const config = await getSiteConfig();
        expect(config?.siteName).toBe("Blue Diamond Medical");
        expect(config?.sitemap.enabled).toBe(false);
      } finally {
        stub.restore();
      }
    });
  });

  test("returns undefined without a network call when FeelStack is unconfigured", async () => {
    await withEnv({ ...HYBRID_ENV, FEELSTACK_API_URL: undefined }, async () => {
      let called = false;
      const originalFetch = global.fetch;
      global.fetch = (() => {
        called = true;
        throw new Error("should not be called");
      }) as typeof fetch;
      try {
        expect(await getSiteConfig()).toBeUndefined();
        expect(called).toBe(false);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});

test.describe("site config — tenant isolation and failure", () => {
  test("REFUSES a config answered for a different tenant", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const stub = stubJson({ ...LIVE_CONFIG, siteKey: "dfeelings", siteName: "Dfeelings" });
      try {
        await expect(getSiteConfig()).rejects.toThrow(FeelStackSiteConfigContractError);
      } finally {
        stub.restore();
      }
    });
  });

  test("a cross-tenant refusal names both keys so the misconfiguration is obvious", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const stub = stubJson({ ...LIVE_CONFIG, siteKey: "dfeelings" });
      try {
        await expect(getSiteConfig()).rejects.toThrow(/blue-diamond-medical[\s\S]*dfeelings/);
      } finally {
        stub.restore();
      }
    });
  });

  test("a malformed body throws rather than degrading to defaults", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const stub = stubJson({ siteKey: SITE, unexpected: true });
      try {
        await expect(getSiteConfig()).rejects.toThrow(FeelStackSiteConfigContractError);
      } finally {
        stub.restore();
      }
    });
  });

  test("an outage degrades to undefined so an advisory setting cannot fail a render", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const stub = stubJson("down", 503);
      try {
        expect(await getSiteConfig()).toBeUndefined();
      } finally {
        stub.restore();
      }
    });
  });

  test("never sends an Authorization header to the public endpoint", async () => {
    await withEnv(HYBRID_ENV, async () => {
      let headers: HeadersInit | undefined;
      const originalFetch = global.fetch;
      global.fetch = (async (_i: RequestInfo | URL, init?: RequestInit) => {
        headers = init?.headers;
        return new Response(JSON.stringify(LIVE_CONFIG), { status: 200 });
      }) as typeof fetch;
      try {
        await getSiteConfig();
        const serialized = JSON.stringify(headers ?? {}).toLowerCase();
        expect(serialized).not.toContain("authorization");
        expect(serialized).not.toContain("bearer");
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});
