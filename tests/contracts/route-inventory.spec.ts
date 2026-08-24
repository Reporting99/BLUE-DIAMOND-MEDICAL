import { test, expect } from "@playwright/test";
import { listRoutes, FeelStackRouteInventoryContractError } from "../../src/lib/feelstack/client";
import sitemap from "../../src/app/sitemap";

/**
 * Route-inventory contract tests.
 *
 * `listRoutes()` returned `[]` unconditionally for its entire life: the client
 * validated against a forward-declared `{ routes: [{ path, status }] }` shape
 * that FeelStack has never emitted, so `safeParse` failed on every response and
 * the `!parsed.success -> return []` branch swallowed it. Every caller — the
 * sitemap's CMS-only rows above all — silently behaved as though the CMS had no
 * routes at all.
 *
 * These tests pin the REAL contract
 * (`{ items, page, limit, hasMore }`, captured live 2026-08-24 and cross-read
 * against `routeInventory()` in the backend), the pagination loop, and the
 * distinction that matters most: an OUTAGE degrades to what we have, a CONTRACT
 * BREAK throws. A silent `[]` is no longer reachable from a malformed response.
 */

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

const HYBRID_ENV = {
  FEELSTACK_CONTENT_MODE: "hybrid",
  FEELSTACK_API_URL: "https://feelstack.example.test/api",
  FEELSTACK_SITE_KEY: "blue-diamond-medical",
};

/**
 * `cmsOnlyEntries()` reads the site config BEFORE the route inventory, so any
 * sitemap test has to serve a config body first. Defaults to
 * `sitemap.enabled: true`; the suppression case passes `false`.
 */
function siteConfig(sitemapEnabled: boolean | undefined = true) {
  return {
    siteKey: "blue-diamond-medical",
    siteName: "Blue Diamond Medical",
    defaultLocale: "en",
    supportedLocales: ["en", "ar"],
    defaultSeo: {},
    socialProfiles: {},
    contactInformation: {},
    analytics: {},
    branding: {},
    features: {},
    sitemap: sitemapEnabled === undefined ? {} : { enabled: sitemapEnabled },
    updatedAt: "2026-08-23T10:07:34.638Z",
  };
}

function row(path: string, locale = "en") {
  return { path, locale, type: "content_entry", lastModified: "2026-08-23T11:25:34.635Z" };
}

/** Serves a canned sequence of JSON bodies, recording each requested URL. */
function stubPages(bodies: unknown[]) {
  const urls: string[] = [];
  const originalFetch = global.fetch;
  global.fetch = (async (input: RequestInfo | URL) => {
    urls.push(String(input));
    const body = bodies[Math.min(urls.length - 1, bodies.length - 1)];
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  }) as typeof fetch;
  return { urls, restore: () => void (global.fetch = originalFetch) };
}

test.describe("listRoutes — real API contract", () => {
  test("parses the live single-page response and returns its rows", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const stub = stubPages([
        {
          items: [row("/aesthetics/concerns/acne-scars"), row("/medical/eye-screening")],
          page: 1,
          limit: 200,
          hasMore: false,
        },
      ]);
      try {
        const routes = await listRoutes("en");
        expect(routes.map((r) => r.path)).toEqual(["/aesthetics/concerns/acne-scars", "/medical/eye-screening"]);
      } finally {
        stub.restore();
      }
    });
  });

  test("does NOT re-filter on a status field — the server already filtered", async () => {
    // Every row the API returns is PUBLISHED and enabled by construction
    // (routeInventory queries for it and additionally drops index:false /
    // sitemapIncluded:false). A client-side `status === "published"` filter
    // against a field that is never sent drops 100% of rows.
    await withEnv(HYBRID_ENV, async () => {
      const stub = stubPages([{ items: [row("/medical/eye-screening")], page: 1, limit: 200, hasMore: false }]);
      try {
        expect(await listRoutes("en")).toHaveLength(1);
      } finally {
        stub.restore();
      }
    });
  });

  test("sends the locale on the request and keeps locales isolated", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const stub = stubPages([{ items: [row("/medical/eye-screening", "ar")], page: 1, limit: 200, hasMore: false }]);
      try {
        const routes = await listRoutes("ar");
        expect(stub.urls[0]).toContain("locale=ar");
        expect(routes.every((r) => r.locale === "ar")).toBe(true);
      } finally {
        stub.restore();
      }
    });
  });

  test("throws when the server ignores the locale parameter", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const stub = stubPages([{ items: [row("/medical/eye-screening", "en")], page: 1, limit: 200, hasMore: false }]);
      try {
        await expect(listRoutes("ar")).rejects.toThrow(FeelStackRouteInventoryContractError);
      } finally {
        stub.restore();
      }
    });
  });
});

test.describe("listRoutes — pagination", () => {
  test("follows hasMore across pages and does not truncate past one page", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const first = Array.from({ length: 200 }, (_, i) => row(`/shop/p${i}`));
      const second = Array.from({ length: 40 }, (_, i) => row(`/shop/q${i}`));
      const stub = stubPages([
        { items: first, page: 1, limit: 200, hasMore: true },
        { items: second, page: 2, limit: 200, hasMore: false },
      ]);
      try {
        const routes = await listRoutes("en");
        expect(routes).toHaveLength(240);
        expect(stub.urls).toHaveLength(2);
        expect(stub.urls[0]).toContain("page=1");
        expect(stub.urls[1]).toContain("page=2");
      } finally {
        stub.restore();
      }
    });
  });

  test("more than 100 routes in one locale are all returned, not silently capped", async () => {
    // The server default limit is 100; the client asks for 200 and pages.
    // Blue Diamond already has 116 entity routes across both locales and will
    // pass 100 per locale, so this is the regression that would otherwise
    // start dropping URLs from the sitemap with no error anywhere.
    await withEnv(HYBRID_ENV, async () => {
      const page1 = Array.from({ length: 200 }, (_, i) => row(`/shop/a${i}`));
      const page2 = Array.from({ length: 111 }, (_, i) => row(`/shop/b${i}`));
      const stub = stubPages([
        { items: page1, page: 1, limit: 200, hasMore: true },
        { items: page2, page: 2, limit: 200, hasMore: false },
      ]);
      try {
        expect(await listRoutes("en")).toHaveLength(311);
      } finally {
        stub.restore();
      }
    });
  });

  test("terminates on the empty page that follows an exactly-full final page", async () => {
    // hasMore is `routes.length === take` server-side, so a page that is
    // exactly full reports hasMore:true even when nothing follows.
    await withEnv(HYBRID_ENV, async () => {
      const full = Array.from({ length: 200 }, (_, i) => row(`/shop/c${i}`));
      const stub = stubPages([
        { items: full, page: 1, limit: 200, hasMore: true },
        { items: [], page: 2, limit: 200, hasMore: false },
      ]);
      try {
        expect(await listRoutes("en")).toHaveLength(200);
      } finally {
        stub.restore();
      }
    });
  });

  test("throws rather than looping forever when hasMore never clears", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const stub = stubPages([{ items: [], page: 1, limit: 200, hasMore: true }]);
      try {
        await expect(listRoutes("en")).rejects.toThrow(FeelStackRouteInventoryContractError);
      } finally {
        stub.restore();
      }
    });
  });

  test("throws when a page over-runs its own stated limit", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const stub = stubPages([
        { items: [row("/a"), row("/b"), row("/c")], page: 1, limit: 2, hasMore: false },
      ]);
      try {
        await expect(listRoutes("en")).rejects.toThrow(FeelStackRouteInventoryContractError);
      } finally {
        stub.restore();
      }
    });
  });
});

test.describe("listRoutes — silent empty fallback is removed", () => {
  test("a malformed envelope throws instead of returning []", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const stub = stubPages([{ routes: [{ path: "/medical/eye-screening", status: "published" }] }]);
      try {
        await expect(listRoutes("en")).rejects.toThrow(FeelStackRouteInventoryContractError);
      } finally {
        stub.restore();
      }
    });
  });

  test("an OUTAGE still degrades to [] rather than 500-ing the sitemap", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () => new Response("upstream exploded", { status: 503 })) as typeof fetch;
      try {
        expect(await listRoutes("en")).toEqual([]);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  test("returns [] without a network call when FeelStack is not configured", async () => {
    await withEnv({ ...HYBRID_ENV, FEELSTACK_API_URL: undefined }, async () => {
      let called = false;
      const originalFetch = global.fetch;
      global.fetch = (() => {
        called = true;
        throw new Error("should not be called");
      }) as typeof fetch;
      try {
        expect(await listRoutes("en")).toEqual([]);
        expect(called).toBe(false);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});

/**
 * The whole point of the fix: with a working `listRoutes()`, a page that lives
 * ONLY in the CMS finally reaches the sitemap. Before this change
 * `cmsOnlyEntries()` received `[]` on every call, so a migrated page could be
 * published in FeelStack, appear in the route inventory, and still never be
 * advertised to a crawler — with no error logged anywhere.
 */
test.describe("sitemap — CMS-only pages", () => {
  test("a CMS-only route reaches the sitemap once launched", async () => {
    await withEnv({ ...HYBRID_ENV, SITE_LAUNCHED: "true" }, async () => {
      const stub = stubPages([
        siteConfig(true),
        { items: [row("/health-hub/winter-skin-barrier")], page: 1, limit: 200, hasMore: false },
        { items: [row("/health-hub/winter-skin-barrier", "ar")], page: 1, limit: 200, hasMore: false },
      ]);
      try {
        const entries = await sitemap();
        const urls = entries.map((e) => e.url);
        expect(urls.some((u) => u.includes("/en/health-hub/winter-skin-barrier"))).toBe(true);
        expect(urls.length).toBeGreaterThan(0);
      } finally {
        stub.restore();
      }
    });
  });

  test("a CMS route that duplicates a local registry route is not listed twice", async () => {
    await withEnv({ ...HYBRID_ENV, SITE_LAUNCHED: "true" }, async () => {
      // One body per locale: sitemap() calls listRoutes("en") then
      // listRoutes("ar"), and a row whose locale does not match the request is
      // a contract break by design.
      const stub = stubPages([
        siteConfig(true),
        { items: [row("/doctors")], page: 1, limit: 200, hasMore: false },
        { items: [row("/doctors", "ar")], page: 1, limit: 200, hasMore: false },
      ]);
      try {
        const urls = (await sitemap()).map((e) => e.url);
        const doctorsEn = urls.filter((u) => u.endsWith("/en/doctors"));
        expect(doctorsEn.length).toBeLessThanOrEqual(1);
      } finally {
        stub.restore();
      }
    });
  });

  test("an unlaunched build still publishes no inventory at all", async () => {
    await withEnv({ ...HYBRID_ENV, SITE_LAUNCHED: undefined }, async () => {
      const stub = stubPages([
        siteConfig(true),
        { items: [row("/health-hub/anything")], page: 1, limit: 200, hasMore: false },
      ]);
      try {
        expect(await sitemap()).toEqual([]);
      } finally {
        stub.restore();
      }
    });
  });

  test("sitemap.enabled=false suppresses CMS rows but keeps the local registry", async () => {
    await withEnv({ ...HYBRID_ENV, SITE_LAUNCHED: "true" }, async () => {
      const stub = stubPages([
        siteConfig(false),
        { items: [row("/health-hub/winter-skin-barrier")], page: 1, limit: 200, hasMore: false },
      ]);
      try {
        const urls = (await sitemap()).map((e) => e.url);
        expect(urls.some((u) => u.includes("/health-hub/winter-skin-barrier"))).toBe(false);
        expect(urls.length, "the local route registry is Blue Diamond's own and is not gated").toBeGreaterThan(0);
      } finally {
        stub.restore();
      }
    });
  });

  test("an unset sitemap setting fails OPEN — {} must not empty the CMS half", async () => {
    await withEnv({ ...HYBRID_ENV, SITE_LAUNCHED: "true" }, async () => {
      const stub = stubPages([
        siteConfig(undefined),
        { items: [row("/health-hub/winter-skin-barrier")], page: 1, limit: 200, hasMore: false },
        { items: [row("/health-hub/winter-skin-barrier", "ar")], page: 1, limit: 200, hasMore: false },
      ]);
      try {
        const urls = (await sitemap()).map((e) => e.url);
        expect(urls.some((u) => u.includes("/health-hub/winter-skin-barrier"))).toBe(true);
      } finally {
        stub.restore();
      }
    });
  });

  test("a CMS outage leaves the local inventory intact instead of throwing", async () => {
    await withEnv({ ...HYBRID_ENV, SITE_LAUNCHED: "true" }, async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () => new Response("down", { status: 503 })) as typeof fetch;
      try {
        const entries = await sitemap();
        expect(entries.length).toBeGreaterThan(0);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});
