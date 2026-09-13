import { test, expect } from "@playwright/test";
import * as http from "node:http";
import sitemap from "../../src/app/sitemap";
import { SEO_TEST_ORIGIN } from "../support/seo-test-origin";

/**
 * REGRESSION for the sitemap cold-start defect that tripped the new
 * pre-cutover gate (GH Actions run 34754182679, commit 5e84193): a schema/
 * contract-validation failure or configuration error thrown out of
 * `cmsOnlyEntries()`'s FeelStack calls (`getSiteConfig()`, `listRoutes()`)
 * was never caught, so it escaped the whole `sitemap()` metadata route and
 * Next rendered a generic error page instead of `/sitemap.xml` — taking down
 * even the LOCAL-registry half that had nothing to do with the CMS.
 *
 * `src/lib/feelstack/client.ts` already degrades pure network failures
 * (timeout/5xx/malformed JSON) to `undefined`/`[]` inside `fetchWithPolicy`.
 * What it does NOT swallow is a genuine contract break —
 * `FeelStackSiteConfigContractError` / `FeelStackRouteInventoryContractError`
 * — which is thrown deliberately (see client.ts) because a permanent wrong
 * answer must be loud, unlike a transient outage. `cmsOnlyEntries()` must
 * still never let that throw escape: the fix wraps its body in try/catch and
 * degrades to an empty CMS contribution, matching the outage behaviour the
 * rest of the file already has.
 *
 * These tests run a real local HTTP server (same technique as
 * tests/deploy/pre-cutover-sitemap-gate.spec.ts) and point
 * FEELSTACK_API_URL/FEELSTACK_SITE_KEY at it, so `getSiteConfig()`/
 * `listRoutes()` execute their REAL schema validation against a REAL
 * malformed response, rather than mocking the throw.
 */

const SITE_KEY = "blue-diamond-medical";

function startServer(routes: Record<string, { body: string; status?: number }>): Promise<{
  port: number;
  close: () => void;
}> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      const route = routes[url.pathname];
      if (!route) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: { code: "NOT_FOUND" } }));
        return;
      }
      res.writeHead(route.status ?? 200, { "Content-Type": "application/json" });
      res.end(route.body);
    });
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({ port, close: () => server.close() });
    });
  });
}

function withEnv<T>(vars: Record<string, string | undefined>, run: () => Promise<T>): Promise<T> {
  const previous = Object.fromEntries(Object.keys(vars).map((k) => [k, process.env[k]]));
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  return run().finally(() => {
    for (const [k, v] of Object.entries(previous)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });
}

const BASE_ENV = {
  SITE_LAUNCHED: undefined,
  INDEXING_ENABLED: "true",
  SITE_URL: SEO_TEST_ORIGIN,
  NEXT_PUBLIC_SITE_URL: undefined,
  FEELSTACK_CONTENT_MODE: "hybrid",
  FEELSTACK_SITE_KEY: SITE_KEY,
};

test.describe("CMS_SITEMAP_ERROR_RESILIENCE: cmsOnlyEntries() must never crash sitemap()", () => {
  test("baseline: with no FeelStack server configured, sitemap() returns only local entries (control)", async () => {
    const entries = await withEnv({ ...BASE_ENV, FEELSTACK_API_URL: undefined, FEELSTACK_CONTENT_MODE: undefined }, () =>
      sitemap(),
    );
    expect(entries.length).toBeGreaterThan(0);
  });

  test("a site config response that fails schema validation does not crash sitemap() — CMS half degrades to empty", async () => {
    const server = await startServer({
      // Missing every required field of FeelstackSiteConfig -> safeParse fails
      // -> getSiteConfig() throws FeelStackSiteConfigContractError.
      [`/public/v1/sites/${SITE_KEY}/config`]: { body: JSON.stringify({ not: "a valid site config" }) },
      [`/public/v1/sites/${SITE_KEY}/routes`]: {
        body: JSON.stringify({ items: [], page: 1, limit: 200, hasMore: false }),
      },
    });
    try {
      const baseline = await withEnv({ ...BASE_ENV, FEELSTACK_API_URL: undefined, FEELSTACK_CONTENT_MODE: undefined }, () =>
        sitemap(),
      );

      let thrown: unknown;
      let entries: Awaited<ReturnType<typeof sitemap>> = [];
      try {
        entries = await withEnv({ ...BASE_ENV, FEELSTACK_API_URL: `http://127.0.0.1:${server.port}` }, () => sitemap());
      } catch (error) {
        thrown = error;
      }

      // The defect: this used to throw and crash the whole route.
      expect(thrown, "sitemap() must never throw, even on a FeelStack contract break").toBeUndefined();
      // The fix: the local-registry half is fully intact, CMS half is empty.
      expect(entries.length).toBe(baseline.length);
    } finally {
      server.close();
    }
  });

  test("a route inventory page that fails schema validation does not crash sitemap() — CMS half degrades to empty", async () => {
    const server = await startServer({
      [`/public/v1/sites/${SITE_KEY}/config`]: {
        body: JSON.stringify({ siteKey: SITE_KEY, sitemap: {} }),
      },
      // Missing { items, page, limit, hasMore } shape entirely.
      [`/public/v1/sites/${SITE_KEY}/routes`]: { body: JSON.stringify({ nonsense: true }) },
    });
    try {
      const baseline = await withEnv({ ...BASE_ENV, FEELSTACK_API_URL: undefined, FEELSTACK_CONTENT_MODE: undefined }, () =>
        sitemap(),
      );

      let thrown: unknown;
      let entries: Awaited<ReturnType<typeof sitemap>> = [];
      try {
        entries = await withEnv({ ...BASE_ENV, FEELSTACK_API_URL: `http://127.0.0.1:${server.port}` }, () => sitemap());
      } catch (error) {
        thrown = error;
      }

      expect(thrown, "sitemap() must never throw, even on a FeelStack contract break").toBeUndefined();
      expect(entries.length).toBe(baseline.length);
    } finally {
      server.close();
    }
  });

  test("revalidate is still time-based 1800s and force-dynamic was not (re)introduced by this fix", async () => {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("src/app/sitemap.ts", "utf8");
    expect(source).toMatch(/export const revalidate = 1800;/);
    expect(source).not.toMatch(/force-dynamic/);
  });
});
