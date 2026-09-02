import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { routes } from "@/config/routes";
import { localizedEntityRoutes } from "@/config/localized-entity-routes.generated";

/**
 * Arabic routing parity between this repository and FeelStack.
 *
 * Arabic public URLs are meaningful Arabic slugs, and `proxy.ts` can only
 * rewrite one to the English folder Next actually routes on if it holds a
 * mapping for it. Those mappings used to come exclusively from the
 * hand-maintained `src/config/routes.ts`, and only 6 of 58 CMS routes were ever
 * copied in — so 52 Arabic URLs, every treatment, concern, technology, medical
 * service and product among them, simply did not resolve. Nothing failed; they
 * were quietly unreachable.
 *
 * That is a drift class, not a one-off bug: every new treatment the client adds
 * in the CMS would arrive with the same hole. This spec closes it by asserting
 * the committed artifact against a captured CMS route inventory, so adding an
 * entity without regenerating fails here.
 *
 * The fixture is a real capture of
 * `GET /public/v1/sites/<site>/routes` plus each route's `alternates`. Refresh
 * it alongside `node scripts/generate-localized-entity-routes.mjs`.
 */

interface CmsRoute {
  en: string;
  ar: string | null;
  type: string | null;
  title: string | null;
}

const cmsRoutes: CmsRoute[] = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "tests", "fixtures", "feelstack", "cms-route-inventory.json"),
    "utf8",
  ),
);

/** Every Arabic path this build can actually rewrite, from both sources. */
const rewritable = new Map<string, string>([
  ...routes.filter((r) => r.path.ar !== r.path.en).map((r) => [r.path.en, r.path.ar] as const),
  ...localizedEntityRoutes.map((r) => [r.en, r.ar] as const),
]);

test.describe("every CMS route has an Arabic mapping this build can resolve", () => {
  test("no CMS route is missing from the registry or the generated artifact", () => {
    const missing = cmsRoutes
      .filter((route) => route.ar && route.ar !== route.en)
      .filter((route) => !rewritable.has(route.en))
      .map((route) => route.en);

    // THE REGRESSION. This started at 52.
    expect(missing, `CMS routes with no Arabic mapping:\n${missing.join("\n")}`).toEqual([]);
  });

  test("no mapped Arabic path disagrees with the CMS", () => {
    const conflicts = cmsRoutes
      .filter((route) => route.ar && rewritable.has(route.en))
      .filter((route) => rewritable.get(route.en) !== route.ar)
      .map((route) => `${route.en}\n  build: ${rewritable.get(route.en)}\n  cms  : ${route.ar}`);

    // A slug that disagrees is worse than one that is missing: the URL resolves
    // and looks right while pointing somewhere the CMS does not know about.
    expect(conflicts, `Arabic path conflicts:\n${conflicts.join("\n")}`).toEqual([]);
  });

  test("every generated Arabic slug is genuinely Arabic, never a transliteration", () => {
    // Guards against someone "fixing" a parity failure by pasting the English
    // slug into the Arabic field to make this suite pass.
    const arabic = /[؀-ۿ]/;
    const suspect = localizedEntityRoutes
      .filter((route) => !arabic.test(route.ar))
      .map((route) => `${route.en} -> ${route.ar}`);

    expect(suspect, `non-Arabic slugs:\n${suspect.join("\n")}`).toEqual([]);
  });

  test("the generated artifact never collides on either side", () => {
    const en = localizedEntityRoutes.map((r) => r.en);
    const ar = localizedEntityRoutes.map((r) => r.ar);
    expect(new Set(en).size, "duplicate English paths").toBe(en.length);
    // Two entities sharing an Arabic slug means one of them is unreachable.
    expect(new Set(ar).size, "duplicate Arabic paths").toBe(ar.length);
  });

  test("entity families that exist in the CMS are all represented", () => {
    const families = ["/aesthetics/treatments/", "/aesthetics/concerns/", "/aesthetics/technologies/", "/medical/", "/shop/", "/our-team/"];
    for (const family of families) {
      const inCms = cmsRoutes.filter((r) => r.en.startsWith(family) && r.ar);
      if (inCms.length === 0) continue;
      const mapped = inCms.filter((r) => rewritable.has(r.en));
      expect(mapped.length, `${family} — ${inCms.length - mapped.length} of ${inCms.length} unmapped`).toBe(inCms.length);
    }
  });
});
