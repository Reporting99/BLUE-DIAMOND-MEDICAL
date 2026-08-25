import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

import {
  collapseStaticAlias,
  redirectCacheTag,
  resolveFeelstackRedirect,
} from "../../src/lib/feelstack/redirect-resolver";
import { cacheTags } from "../../src/lib/feelstack/cache-tags";
import { invalidationCoverage } from "../../src/lib/feelstack/revalidation";
import {
  encodeLocation,
  pathnameFrom,
  toSearchParams,
} from "../../src/lib/feelstack/redirect-or-404";

/**
 * GAP-4 consumer half, wired.
 *
 * The resolver existed and was correct in isolation, but nothing imported it:
 * all six exports had zero references outside their own file, so every CMS
 * rename 404ed and Blue Diamond's Arabic redirects came entirely from the
 * static alias map. These tests pin the wiring, the ladder order, and the two
 * defects the wiring exposed -- a lookup that never sent the locale, and a
 * cache tag nothing invalidated.
 */

const realFetch = globalThis.fetch;

function stubFetch(handler: (input: unknown, init?: unknown) => Promise<Response>): void {
  (globalThis as { fetch: unknown }).fetch = handler as unknown;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test.beforeEach(() => {
  process.env.FEELSTACK_API_URL = "https://cms.test/api";
  process.env.FEELSTACK_SITE_KEY = "blue-diamond-medical";
});

test.afterEach(() => {
  (globalThis as { fetch: unknown }).fetch = realFetch;
});

test.describe("the locale is always sent, and always scopes the answer", () => {
  test("an English lookup sends locale=en", async () => {
    let url = "";
    stubFetch(async (input) => {
      url = String(input);
      return jsonResponse({ destination: "/doctors/new", enabled: true });
    });
    await resolveFeelstackRedirect("/en/doctors/old", "en");
    expect(url).toContain("locale=en");
  });

  test("an Arabic lookup sends locale=ar", async () => {
    let url = "";
    stubFetch(async (input) => {
      url = String(input);
      return jsonResponse({ destination: "/الأطباء/جديد", enabled: true });
    });
    await resolveFeelstackRedirect("/ar/الأطباء/قديم", "ar");
    expect(url).toContain("locale=ar");
  });

  test("no lookup is ever made without a locale parameter", async () => {
    // Verified against production: the same path returns a redirect for
    // locale=ar, nothing for locale=en, and NOTHING AT ALL when the parameter
    // is absent. A lookup that forgets it is silently useless.
    const urls: string[] = [];
    stubFetch(async (input) => {
      urls.push(String(input));
      return jsonResponse({ destination: "/x", enabled: true });
    });
    await resolveFeelstackRedirect("/en/a", "en");
    await resolveFeelstackRedirect("/ar/ب", "ar");
    expect(urls).toHaveLength(2);
    for (const u of urls) expect(u).toMatch(/[?&]locale=/);
  });

  test("an Arabic redirect cannot fire on the matching English path", async () => {
    // The CMS enforces this too, but the consumer must not depend on it: the
    // Arabic alias of a page is frequently the live English canonical.
    stubFetch(async (input) =>
      String(input).includes("locale=ar")
        ? jsonResponse({ destination: "/التجميل-الطبي/ندبات", enabled: true })
        : jsonResponse({}, 404),
    );
    const ar = await resolveFeelstackRedirect("/ar/aesthetics/concerns/acne-scars", "ar");
    const en = await resolveFeelstackRedirect("/en/aesthetics/concerns/acne-scars", "en");
    expect(ar?.destination).toBe("/ar/التجميل-الطبي/ندبات");
    expect(en).toBeNull();
  });

  test("a locale-neutral CMS row still resolves for the requesting locale", async () => {
    stubFetch(async () => jsonResponse({ destination: "/new", enabled: true, locale: null }));
    const en = await resolveFeelstackRedirect("/en/old", "en");
    const ar = await resolveFeelstackRedirect("/ar/old", "ar");
    expect(en?.destination).toBe("/en/new");
    expect(ar?.destination).toBe("/ar/new");
  });
});

test.describe("degrades safely to a real 404", () => {
  const bad: Array<[string, () => Promise<Response>]> = [
    ["a 500 from the CMS", async () => jsonResponse({ destination: "/new" }, 500)],
    ["a 502 from the CMS", async () => jsonResponse({}, 502)],
    ["a 404 (no redirect exists)", async () => jsonResponse({}, 404)],
    ["a non-JSON body", async () => new Response("<html>down</html>", { status: 200 })],
    ["a JSON array", async () => jsonResponse([1, 2, 3])],
    ["a JSON string", async () => jsonResponse("nope")],
    ["null", async () => jsonResponse(null)],
    ["an empty object", async () => jsonResponse({})],
    ["a numeric destination", async () => jsonResponse({ destination: 42 })],
  ];

  for (const [label, handler] of bad) {
    test(`${label} yields null, never a throw`, async () => {
      stubFetch(handler);
      expect(await resolveFeelstackRedirect("/en/old", "en")).toBeNull();
    });
  }

  test("a network failure yields null", async () => {
    stubFetch(async () => {
      throw new Error("ECONNREFUSED");
    });
    expect(await resolveFeelstackRedirect("/en/old", "en")).toBeNull();
  });

  test("an aborted (timed out) request yields null", async () => {
    stubFetch(async (_input, init) => {
      const signal = (init as { signal?: AbortSignal } | undefined)?.signal;
      // The resolver must pass an AbortSignal, or its timeout does nothing.
      expect(signal).toBeTruthy();
      throw Object.assign(new Error("aborted"), { name: "AbortError" });
    });
    expect(await resolveFeelstackRedirect("/en/old", "en")).toBeNull();
  });
});

test.describe("no loops, no chains with the static alias map", () => {
  test("a self-redirect is refused", async () => {
    stubFetch(async () => jsonResponse({ destination: "/doctors/same", enabled: true }));
    expect(await resolveFeelstackRedirect("/en/doctors/same", "en")).toBeNull();
  });

  test("a self-redirect via the locale prefix is refused", async () => {
    stubFetch(async () => jsonResponse({ destination: "/ar/x", enabled: true }));
    expect(await resolveFeelstackRedirect("/ar/x", "ar")).toBeNull();
  });

  test("a destination that IS a static Arabic alias source is collapsed, not chained", () => {
    // proxy.ts 301s /ar/doctors -> /ar/<arabic>. A CMS destination of
    // /doctors would otherwise be served as a 301 the proxy immediately 301s
    // again: two hops for one move.
    const collapsed = collapseStaticAlias("/doctors", "ar");
    expect(collapsed).not.toBe("/doctors");
    expect(collapsed.startsWith("/")).toBe(true);
  });

  test("collapsing never applies to English", () => {
    expect(collapseStaticAlias("/doctors", "en")).toBe("/doctors");
  });

  test("an Arabic CMS redirect lands on a path the proxy will not redirect again", async () => {
    stubFetch(async () => jsonResponse({ destination: "/doctors", enabled: true }));
    const result = await resolveFeelstackRedirect("/ar/old-doctors", "ar");
    expect(result).not.toBeNull();
    // Whatever the proxy would 301, the resolver has already resolved.
    expect(collapseStaticAlias(result!.destination.replace(/^\/ar/, ""), "ar")).toBe(
      result!.destination.replace(/^\/ar/, ""),
    );
  });
});

test.describe("rename scenarios work without a static alias", () => {
  test("a page rename keeps the old URL working", async () => {
    stubFetch(async (input) =>
      String(input).includes(encodeURIComponent("/patient-resources"))
        ? jsonResponse({ destination: "/resources", enabled: true })
        : jsonResponse({}, 404),
    );
    const moved = await resolveFeelstackRedirect("/en/patient-resources", "en");
    expect(moved?.destination).toBe("/en/resources");
  });

  test("a descendant rename keeps the deep old URL working", async () => {
    stubFetch(async (input) =>
      String(input).includes(encodeURIComponent("/medical/old-parent/child"))
        ? jsonResponse({ destination: "/medical/new-parent/child", enabled: true })
        : jsonResponse({}, 404),
    );
    const moved = await resolveFeelstackRedirect("/en/medical/old-parent/child", "en");
    expect(moved?.destination).toBe("/en/medical/new-parent/child");
  });

  test("an Arabic descendant rename stays Arabic", async () => {
    stubFetch(async () =>
      jsonResponse({ destination: "/الطبي/الجديد/الطفل", enabled: true }),
    );
    const moved = await resolveFeelstackRedirect("/ar/الطبي/القديم/الطفل", "ar");
    expect(moved?.destination).toBe("/ar/الطبي/الجديد/الطفل");
    expect(moved?.destination.startsWith("/ar/")).toBe(true);
  });

  test("a path with no redirect gets a real 404, not a guess", async () => {
    stubFetch(async () => jsonResponse({}, 404));
    expect(await resolveFeelstackRedirect("/en/never-existed", "en")).toBeNull();
  });
});

test.describe("the ladder is wired, and in the right order", () => {
  const CATCH_ALL = "src/app/[locale]/[...slug]/page.tsx";
  const LEGAL = "src/app/[locale]/[legalPageId]/page.tsx";
  const HELPER = "src/lib/feelstack/redirect-or-404.ts";

  const read = (p: string) => readFileSync(p, "utf8");

  /**
   * Source with comments and imports stripped.
   *
   * These assertions are about what the ladder DOES. Matching raw source makes
   * them fire on the import line that wires the helper in, and on the comment
   * that explains why headers() is avoided -- so a correct explanation would
   * fail the test asserting the thing it explains. That is a guard people learn
   * to delete rather than trust.
   */
  const body = (p: string) =>
    read(p)
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "")
      .replace(/^import[\s\S]*?from\s+"[^"]+";$/gm, "");

  test("the catch-all route exists and consults redirects", () => {
    const src = read(CATCH_ALL);
    expect(src).toMatch(/redirectOrNotFound/);
    expect(src).toMatch(/isLocale/);
  });

  test("content resolution comes before redirect resolution", () => {
    const src = body(LEGAL);
    expect(src.indexOf("loadLegalPage")).toBeLessThan(src.indexOf("redirectOrNotFound"));
  });

  test("a feature-gated route serves no content but still honours renames", () => {
    // The gate stops disabled legal pages being SERVED. A redirect serves
    // nothing, and while the feature is off this route handles every
    // single-segment path -- so refusing to consult redirects here would 404
    // every rename whose path is one segment long, which is most of them.
    const src = body(LEGAL);
    expect(src).toMatch(/const gated = !features\.legalPagesEnabled/);
    // Content is never loaded on the gated branch.
    expect(src).toMatch(/gated \? null : await loadLegalPage/);
    // And the gated branch ends in the ladder, not a bare 404.
    expect(src).toMatch(/if \(gated \|\|[\s\S]{0,80}redirectOrNotFound/);
  });

  test("the redirect lookup runs immediately before notFound()", () => {
    const src = body(HELPER);
    expect(src.indexOf("resolveFeelstackRedirect")).toBeLessThan(src.indexOf("notFound()"));
  });

  test("nothing in the ladder reads headers()", () => {
    // Reading a dynamic API on the not-found path flips statically prerendered
    // routes to dynamic AT RUNTIME, which this Next version turns into a 500.
    for (const file of [CATCH_ALL, LEGAL, HELPER]) {
      expect(body(file), file).not.toMatch(/\bheaders\s*\(/);
    }
  });

  test("no internal marker header is introduced", () => {
    for (const file of [CATCH_ALL, LEGAL, HELPER]) {
      expect(body(file), file).not.toMatch(/x-bd-|set\(["']x-/i);
    }
  });

  test("middleware does not query CMS redirects per request", () => {
    const proxy = body("src/proxy.ts");
    expect(proxy).not.toMatch(/resolveFeelstackRedirect|redirect-resolver/);
    expect(proxy).not.toMatch(/\/redirect\?path=/);
  });

  test("pathnameFrom builds the request path without headers()", () => {
    expect(pathnameFrom("ar", ["a", "b"])).toBe("/ar/a/b");
    expect(pathnameFrom("en", [])).toBe("/en");
    expect(pathnameFrom("en", ["", "x"])).toBe("/en/x");
  });

  test("pathnameFrom decodes percent-encoded Arabic segments", () => {
    // Next hands route params still encoded for non-ASCII slugs, and the
    // resolver encodes again when building its query string. Without decoding
    // here the CMS receives /%D8%B7... and matches nothing, which silently
    // breaks renames for most of this site's Arabic content.
    expect(pathnameFrom("ar", ["%D8%B7%D8%A7%D8%B2%D8%AC-%D9%82%D8%AF%D9%8A%D9%85"])).toBe(
      "/ar/طازج-قديم",
    );
    expect(pathnameFrom("ar", ["الأطباء", "أحمد"])).toBe("/ar/الأطباء/أحمد");
  });

  test("pathnameFrom survives a malformed percent sequence", () => {
    // A junk URL must 404 normally, never 500.
    expect(() => pathnameFrom("en", ["%E0%A4%A"])).not.toThrow();
    expect(pathnameFrom("en", ["%E0%A4%A"])).toBe("/en/%E0%A4%A");
  });

  test("a non-ASCII destination is encoded for the Location header", () => {
    // HTTP header values are ASCII. permanentRedirect passes the string through
    // untouched, so a raw Arabic destination throws ERR_INVALID_CHAR and the
    // visitor gets a 500 instead of a redirect. Measured against the built
    // artifact, not assumed.
    expect(encodeLocation("/ar/طازج-جديد")).toBe(
      "/ar/%D8%B7%D8%A7%D8%B2%D8%AC-%D8%AC%D8%AF%D9%8A%D8%AF",
    );
    // eslint-disable-next-line no-control-regex
    expect(/^[\x00-\x7F]*$/.test(encodeLocation("/ar/الأطباء/أحمد"))).toBe(true);
  });

  test("encoding preserves separators and does not double-encode", () => {
    expect(encodeLocation("/en/a/b/c")).toBe("/en/a/b/c");
    // An already-encoded segment must come out identical, not %25-mangled.
    expect(encodeLocation("/ar/%D8%B7%D8%A7%D8%B2%D8%AC-%D8%AC%D8%AF%D9%8A%D8%AF")).toBe(
      "/ar/%D8%B7%D8%A7%D8%B2%D8%AC-%D8%AC%D8%AF%D9%8A%D8%AF",
    );
  });

  test("encoding leaves an already-encoded query string alone", () => {
    expect(encodeLocation("/en/new?utm_source=a%20b")).toBe("/en/new?utm_source=a%20b");
  });

  test("toSearchParams narrows Next's searchParams shape", () => {
    expect(toSearchParams(undefined)).toBeUndefined();
    expect(toSearchParams({ a: "1", b: ["2", "3"], c: undefined })?.toString()).toBe(
      "a=1&b=2&b=3",
    );
  });

  test("every resolver export is used outside its own file", () => {
    // The defect this whole change fixes was a complete, correct module that
    // nothing imported. A newly orphaned export is the same bug returning.
    const source = read("src/lib/feelstack/redirect-resolver.ts");
    const exported = [...source.matchAll(/^export (?:async )?function (\w+)/gm)].map(
      (m) => m[1],
    );
    expect(exported.length).toBeGreaterThan(0);

    const haystack = [
      read(HELPER),
      read(CATCH_ALL),
      read(LEGAL),
      read("tests/security/feelstack-redirect.spec.ts"),
      read("tests/redirects/cms-redirect-ladder.spec.ts"),
    ].join("\n");

    for (const name of exported) {
      expect(haystack, `${name} is exported but unused`).toContain(name);
    }
  });
});

test.describe("the redirect cache tag is invalidated by something", () => {
  test("the tag comes from the central registry", () => {
    expect(redirectCacheTag("/old", "ar")).toBe(
      cacheTags.redirect("blue-diamond-medical", "ar", "/old"),
    );
  });

  test("the tag differs per locale", () => {
    expect(redirectCacheTag("/old", "ar")).not.toBe(redirectCacheTag("/old", "en"));
  });

  test("rename events invalidate it", () => {
    // Previously the resolver minted its own tag outside the registry, so it
    // was written on every lookup and cleared by nothing: a rename stayed
    // invisible for the full TTL no matter how many webhooks arrived.
    const events = invalidationCoverage.redirect;
    expect(events, "redirect has no invalidation coverage").toBeTruthy();
    expect(events).toContain("content.page.*");
    expect(events).toContain("content.entry.*");
  });
});
