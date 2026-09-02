import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { routes, legacyRedirects } from "../../src/lib/routing";
import { localizedEntityRoutes } from "../../src/config/localized-entity-routes.generated";

/**
 * Pre-launch route architecture invariants.
 *
 * Blue Diamond has never been published on its production domain, so a route
 * this build once served and then renamed has no inbound links, no index
 * entry and no equity to preserve. Keeping a redirect for one is not
 * conservative, it is a second address for a page that is meant to have
 * exactly one — which is the duplication this architecture pass removed.
 *
 * The distinction these tests hold, and the reason they are not simply
 * "assert no redirects exist": `legacyRedirects` maps URLs from the two OLD
 * THIRD-PARTY SITES (bluediamondmedical.ca and
 * bluediamondmedicalaesthetics.ca) that ARE live and DO have inbound links.
 * Those are a migration contract with real published URLs and must survive.
 * What must not survive is a redirect whose SOURCE is a path this build
 * itself invented during development.
 */

const REPO_ROOT = join(__dirname, "..", "..");
const read = (rel: string) => readFileSync(join(REPO_ROOT, rel), "utf8");

/** Every path this build publishes today, both locales, locale-prefixed. */
const livePaths = new Set([
  ...routes.flatMap((r) => [`/en${r.path.en}`, `/ar${r.path.ar}`]),
  ...localizedEntityRoutes.flatMap((r) => [`/en${r.en}`, `/ar${r.ar}`]),
]);

test.describe("NO_PRELAUNCH_ROUTE_ALIAS", () => {
  test("no redirect source is a path this build itself served", () => {
    // A legacy source is an old third-party URL: bare, no locale prefix, and
    // not a path this app publishes. A source carrying our own /en or /ar
    // prefix could only have come from this build.
    const ownPrefixed = Object.keys(legacyRedirects).filter(
      (source) => source.startsWith("/en/") || source.startsWith("/ar/"),
    );
    expect(ownPrefixed).toEqual([]);
  });

  test("next.config.ts declares no redirects", () => {
    // The /en/services -> /en/medical alias lived here. Nothing links to
    // /en/services; it was an illustrative URL from a brief, and aliasing it
    // gave the Medical hub a second address for no reader's benefit.
    expect(read("next.config.ts")).not.toContain("async redirects");
  });

  test("the renamed-route redirect layer is gone from the codebase", () => {
    for (const file of ["src/proxy.ts", "src/lib/routing/index.ts", "src/lib/routing/legacy-redirects.ts"]) {
      expect(read(file), file).not.toContain("renamedRouteRedirects");
    }
  });
});

test.describe("OLD_DOCTORS_ROUTES_REMAINING = 0", () => {
  test("the team family publishes only under /our-team and /فريقنا", () => {
    const team = [...livePaths].filter((p) => /our-team|فريقنا/.test(p));
    expect(team.length).toBeGreaterThan(0); // the family exists at all
    for (const path of team) {
      expect(path.startsWith("/en/our-team") || path.startsWith("/ar/فريقنا"), path).toBe(true);
    }
  });

  test("no route, generated or hand-written, still resolves under /doctors", () => {
    const doctorPaths = [...livePaths].filter((p) => p.includes("/doctors") || p.includes("الأطباء"));
    expect(doctorPaths).toEqual([]);
  });

  test("no redirect targets or sources the old doctors family", () => {
    const rows = Object.entries(legacyRedirects).filter(
      ([source, target]) =>
        source.includes("/doctors") ||
        source.includes("الأطباء") ||
        target.includes("/doctors") ||
        target.includes("الأطباء"),
    );
    expect(rows).toEqual([]);
  });
});

test.describe("ONE_CANONICAL_URL_PER_ENTITY_PER_LOCALE", () => {
  test("the registry publishes each path exactly once per locale", () => {
    for (const locale of ["en", "ar"] as const) {
      const paths = routes.map((r) => r.path[locale]);
      const seen = new Map<string, number>();
      for (const p of paths) seen.set(p, (seen.get(p) ?? 0) + 1);
      const dupes = [...seen.entries()].filter(([, n]) => n > 1).map(([p]) => p);
      expect(dupes, locale).toEqual([]);
    }
  });

  test("the generated entity artifact never contradicts the registry", () => {
    // AMBIGUOUS_ROUTE_OWNERSHIP. Entity routes appear in both
    // src/config/routes.ts (authored) and localized-entity-routes.generated.ts
    // (derived from the CMS alternates). That overlap is by design — the
    // generated file is a DERIVED VIEW, not a second authority — so the
    // invariant is not that they are disjoint but that they never disagree.
    // A conflicting EN->AR pair here means one of the two is stale and half
    // the app is resolving a different Arabic URL than the other half.
    const registry = new Map(routes.map((r) => [r.path.en, r.path.ar]));
    const conflicts = localizedEntityRoutes
      .filter((r) => registry.has(r.en) && registry.get(r.en) !== r.ar)
      .map((r) => ({ en: r.en, registry: registry.get(r.en), generated: r.ar }));
    expect(conflicts).toEqual([]);
  });

  test("a legacy redirect never shadows a live path", () => {
    // A source that is also a live path would mean the redirect intercepts a
    // real page rather than rescuing a dead old-site URL.
    const shadowing = Object.keys(legacyRedirects).filter((s) => livePaths.has(s));
    expect(shadowing).toEqual([]);
  });
});
