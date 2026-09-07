import { test, expect, request as playwrightRequest, type APIRequestContext } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { routes } from "../../src/lib/routing";
import { features } from "../../src/config/features";
import { locales, type Locale } from "../../src/i18n/config";
import { SEO_TEST_ORIGIN } from "../support/seo-test-origin";

/**
 * The single crawl behind the pre-domain SEO audit.
 *
 * It walks the APPROVED internal URL set — every registry route that is
 * actually served, in both locales, locale-prefixed exactly as the site links
 * to it — records what each URL answers, writes the machine-readable
 * inventory to evidence/, and then asserts the invariants that inventory has
 * to satisfy.
 *
 * Crawling once and asserting many times is deliberate: the alternative
 * (a request per assertion) multiplies a ~200-URL crawl by the number of
 * properties being checked, and lets two assertions disagree about what the
 * same page said.
 *
 * `maxRedirects: 0` is the load-bearing option. Playwright's request context
 * follows redirects by default, which is exactly why the pre-existing
 * broken-link scan could report a clean run over URLs that were all answering
 * 301 — a redirect is invisible to a crawler that follows it.
 *
 * Evidence is written to evidence/, which .gitignore excludes: it is a
 * generated artifact of a specific build, not source, and it must never be
 * served as a public asset.
 */

const REPO_ROOT = join(__dirname, "..", "..");
const EVIDENCE_DIR = join(REPO_ROOT, "evidence");

const PORT = process.env.PLAYWRIGHT_PORT ?? "3457";
const BASE_URL = `http://127.0.0.1:${PORT}`;

/** A route is served only when its feature gate (if any) is on. */
function isEnabled(route: (typeof routes)[number]): boolean {
  return !route.requiresFeature || Boolean(features[route.requiresFeature as keyof typeof features]);
}

const servedRoutes = routes.filter(isEnabled);

interface RouteRecord {
  routeId: string;
  templateType: string;
  locale: Locale;
  url: string;
  status: number;
  redirectLocation: string | null;
  indexable: boolean;
  robots: string | null;
  canonical: string | null;
  expectedCanonical: string;
  hreflang: Record<string, string>;
  title: string | null;
  description: string | null;
  h1: string[];
  inSitemap: boolean;
  structuredDataTypes: string[];
  structuredDataParses: boolean;
  lastModifiedSource: string;
  internalLinks: string[];
  imageCount: number;
  imagesMissingAlt: number;
  exclusionReason: string | null;
}

function attr(html: string, tag: RegExp): string | null {
  const match = html.match(tag);
  return match ? decodeEntities(match[1]) : null;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/**
 * Percent-decoded form of a URL, for comparison only.
 *
 * Arabic routes have Arabic slugs, and Next percent-encodes them in every
 * emitted href — `/ar/%D8%A7%D9%84%D8%B1...` — while the route registry holds
 * the raw `/ar/الرعاية-الطبية`. The two are the SAME URL; comparing them
 * literally reports a mismatch on every Arabic page. Normalise both sides
 * before comparing, and keep the raw value for the evidence file.
 */
function normalizeUrl(value: string): string {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

/** Strips tags and collapses whitespace, so an H1 with nested spans compares cleanly. */
function textOf(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function parseJsonLd(html: string): { types: string[]; ok: boolean } {
  const blocks = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  const types: string[] = [];
  let ok = true;
  for (const [, raw] of blocks) {
    try {
      const parsed = JSON.parse(raw);
      const collect = (node: unknown): void => {
        if (Array.isArray(node)) return node.forEach(collect);
        if (node && typeof node === "object") {
          const type = (node as Record<string, unknown>)["@type"];
          if (typeof type === "string") types.push(type);
          else if (Array.isArray(type)) type.forEach((t) => typeof t === "string" && types.push(t));
          const graph = (node as Record<string, unknown>)["@graph"];
          if (graph) collect(graph);
        }
      };
      collect(parsed);
    } catch {
      ok = false;
    }
  }
  return { types: [...new Set(types)].sort(), ok };
}

/**
 * Same-origin links as a crawler would see them. Fragment-only and non-HTTP
 * schemes (tel:, mailto:) are not navigable URLs and are covered elsewhere —
 * tests/security/booking-allowlist.spec.ts owns external destinations.
 */
function internalLinks(html: string): string[] {
  return [
    ...new Set(
      [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)]
        .map((m) => decodeEntities(m[1]))
        .filter((href) => href.startsWith("/"))
        .map((href) => href.split("#")[0])
        .filter(Boolean),
    ),
  ];
}

const records: RouteRecord[] = [];
let api: APIRequestContext;

test.describe.configure({ mode: "serial" });

test.beforeAll(async () => {
  // Reset first. Playwright may run both projects (desktop and mobile) in the
  // same worker without re-importing this module, in which case a second
  // beforeAll would APPEND to the previous project's records — every URL would
  // then appear twice and the duplicate-title/description assertions would
  // fail on the same page compared with itself.
  records.length = 0;
  api = await playwrightRequest.newContext({ baseURL: BASE_URL });

  for (const route of servedRoutes) {
    for (const locale of locales) {
      // Trailing slash stripped for the same reason absoluteRouteUrl strips
      // it: the homepage's registry path is "/", so a naive join gives
      // "/en/", which this app answers with a 308 to "/en". Crawling the
      // un-normalised form would record the site's front page as a redirect
      // and compare its canonical against a URL the site never emits.
      const joined = `/${locale}${route.path[locale]}`;
      const path = joined.endsWith("/") ? joined.slice(0, -1) : joined;
      // No redirect following: a 3xx must be recorded, not resolved away.
      const response = await api.get(path, { maxRedirects: 0 });
      const status = response.status();
      const html = status < 400 && status >= 300 ? "" : await response.text();

      // CASE-INSENSITIVE, and both attribute orders. React renders the JSX
      // prop name, so the served HTML says `hrefLang="en-CA"`, not
      // `hreflang=`. HTML attribute names are case-insensitive so crawlers
      // read it correctly — but a case-sensitive regex here finds nothing and
      // reports every page as missing its hreflang tags.
      const hreflang: Record<string, string> = {};
      for (const [, lang, href] of html.matchAll(
        /<link[^>]+rel="alternate"[^>]+hreflang="([^"]+)"[^>]+href="([^"]+)"/gi,
      )) {
        hreflang[lang] = decodeEntities(href);
      }
      for (const [, href, lang] of html.matchAll(
        /<link[^>]+rel="alternate"[^>]+href="([^"]+)"[^>]+hreflang="([^"]+)"/gi,
      )) {
        hreflang[lang] ??= decodeEntities(href);
      }

      const jsonLd = parseJsonLd(html);
      const images = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);

      records.push({
        routeId: route.id,
        templateType: route.templateType,
        locale,
        url: path,
        status,
        redirectLocation: response.headers()["location"] ?? null,
        indexable: route.indexing === "index",
        robots: attr(html, /<meta[^>]+name="robots"[^>]+content="([^"]*)"/i),
        canonical: attr(html, /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i),
        expectedCanonical: `${SEO_TEST_ORIGIN}${path}`,
        hreflang,
        title: attr(html, /<title[^>]*>([\s\S]*?)<\/title>/)?.trim() ?? null,
        description: attr(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i),
        h1: [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => textOf(m[1])),
        inSitemap: route.inSitemap,
        structuredDataTypes: jsonLd.types,
        structuredDataParses: jsonLd.ok,
        // No page in this build carries a truthful per-page modification
        // timestamp: content lives in typed TS modules and in FeelStack, and
        // neither exposes one the sitemap could quote. Recorded honestly
        // rather than filled with the build clock.
        lastModifiedSource: "none — no per-page modification date is tracked",
        internalLinks: internalLinks(html),
        imageCount: images.length,
        imagesMissingAlt: images.filter((img) => !/\balt="/.test(img)).length,
        exclusionReason: route.indexing === "index" ? null : "route registry: indexing = noindex",
      });
    }
  }
});

test.afterAll(async () => {
  await api?.dispose();
});

test("writes the machine-readable route inventory to evidence/", async () => {
  mkdirSync(EVIDENCE_DIR, { recursive: true });

  const excluded = routes.filter((r) => !isEnabled(r));
  const inventory = {
    generatedBy: "tests/seo/crawl-inventory.spec.ts",
    // The injected reserved origin, recorded so a reader knows the canonical
    // column is a validation value and not a configured production domain.
    crawlOrigin: SEO_TEST_ORIGIN,
    totals: {
      registryRoutes: routes.length,
      servedRoutes: servedRoutes.length,
      featureGatedRoutes: excluded.length,
      crawledUrls: records.length,
      indexableUrls: records.filter((r) => r.indexable).length,
      nonIndexableUrls: records.filter((r) => !r.indexable).length,
      inSitemapUrls: records.filter((r) => r.inSitemap && r.indexable).length,
    },
    excludedFromIndexAndSitemap: [
      ...excluded.map((r) => ({
        routeId: r.id,
        path: r.path,
        reason: `feature flag "${r.requiresFeature}" is off — the page calls notFound()`,
      })),
      ...routes
        .filter((r) => isEnabled(r) && r.indexing !== "index")
        .map((r) => ({ routeId: r.id, path: r.path, reason: "route registry: indexing = noindex" })),
      { routeId: "api/*", path: { en: "/api/*", ar: "/api/*" }, reason: "API surface — not a page" },
      { routeId: "api/draft", path: { en: "/api/draft", ar: "/api/draft" }, reason: "CMS draft-preview entry point" },
      { routeId: "api/version", path: { en: "/api/version", ar: "/api/version" }, reason: "deploy health/debug endpoint" },
      { routeId: "not-found", path: { en: "(404 boundary)", ar: "(404 boundary)" }, reason: "error page" },
    ],
    routes: records,
  };

  writeFileSync(join(EVIDENCE_DIR, "seo-route-inventory.json"), `${JSON.stringify(inventory, null, 2)}\n`);

  const columns = [
    "routeId", "locale", "url", "status", "indexable", "robots", "canonical",
    "hreflangEn", "hreflangAr", "hreflangXDefault", "title", "description",
    "h1", "inSitemap", "structuredDataTypes", "redirectLocation",
    "lastModifiedSource", "exclusionReason",
  ];
  const escape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = records.map((r) =>
    [
      r.routeId, r.locale, r.url, r.status, r.indexable, r.robots, r.canonical,
      r.hreflang["en-CA"], r.hreflang["ar-CA"], r.hreflang["x-default"],
      r.title, r.description, r.h1.join(" | "), r.inSitemap,
      r.structuredDataTypes.join(" "), r.redirectLocation,
      r.lastModifiedSource, r.exclusionReason,
    ].map(escape).join(","),
  );
  writeFileSync(
    join(EVIDENCE_DIR, "seo-route-inventory.csv"),
    `${[columns.join(","), ...rows].join("\n")}\n`,
  );

  expect(records.length).toBeGreaterThan(0);
});

test("every approved URL answers 200 — no route in the published set is a redirect", () => {
  const notOk = records.filter((r) => r.status !== 200);
  expect(
    notOk.map((r) => `${r.url} -> ${r.status}${r.redirectLocation ? ` ${r.redirectLocation}` : ""}`),
  ).toEqual([]);
});

test("REDIRECT_COUNT = 0 across the approved internal URL set", () => {
  const redirecting = records.filter((r) => r.status >= 300 && r.status < 400);
  expect(redirecting.map((r) => `${r.url} -> ${r.redirectLocation}`)).toEqual([]);
});

test("the site root is served, not redirected", async () => {
  const response = await api.get("/", { maxRedirects: 0 });
  expect(response.status(), "/ must answer 200 via an internal rewrite, never a 3xx").toBe(200);
  const html = await response.text();
  // Served as the English homepage, and canonicalised to /en so the two URLs
  // are not competing duplicates.
  expect(html).toContain('<html lang="en"');
  expect(attr(html, /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i)).toBe(`${SEO_TEST_ORIGIN}/en`);
});

test("every indexable page has exactly one H1", () => {
  const wrong = records
    .filter((r) => r.status === 200 && r.indexable)
    .filter((r) => r.h1.length !== 1)
    .map((r) => `${r.url} has ${r.h1.length} H1s`);
  expect(wrong).toEqual([]);
});

test("no indexable page is missing a title or description", () => {
  const missing = records
    .filter((r) => r.status === 200 && r.indexable)
    .filter((r) => !r.title?.trim() || !r.description?.trim())
    .map((r) => `${r.url}: title=${JSON.stringify(r.title)} description=${JSON.stringify(r.description)}`);
  expect(missing).toEqual([]);
});

/**
 * Duplicate titles and descriptions are compared WITHIN a locale.
 *
 * Across locales they are not a duplicate-content signal: /en/x and /ar/x are
 * declared alternates of one another via hreflang, they target different
 * queries, and they never compete. Comparing across locales would report every
 * page whose translation is still pending as an SEO defect, which is a
 * localisation finding, not this one — see the untranslated-title test below.
 */
function duplicatesWithinLocale(
  pick: (r: RouteRecord) => string | null,
): { value: string; urls: string[] }[] {
  const out: { value: string; urls: string[] }[] = [];
  for (const locale of locales) {
    const byValue = new Map<string, string[]>();
    for (const r of records.filter((r) => r.status === 200 && r.indexable && r.locale === locale)) {
      const value = pick(r);
      if (!value) continue;
      byValue.set(value, [...(byValue.get(value) ?? []), r.url]);
    }
    for (const [value, urls] of byValue) if (urls.length > 1) out.push({ value, urls });
  }
  return out;
}

/**
 * Content duplicates that exist in the approved catalogue data and cannot be
 * fixed from the metadata layer.
 *
 * Both have the same root cause: the Aesthetics IA merged the concern and
 * treatment catalogues into one URL space, and two subjects ended up published
 * from both source lists.
 *
 *  - TempSure Vitalia is in BOTH the treatments and the technologies data, so
 *    it publishes two indexable pages with the same name and the same H1.
 *  - "Hair Loss" (a concern) reuses the summary of "PRP Hair Restoration"
 *    (a treatment), so the two pages share a meta description.
 *
 * Resolving either means deciding which page owns the subject — consolidate,
 * or canonicalise one to the other. That is a content/IA decision on approved
 * clinical copy, not a title rewrite, so it is recorded here rather than
 * papered over: these tests still fail on any NEW duplicate.
 */
const KNOWN_CONTENT_DUPLICATE_TITLES = ["TempSure Vitalia", "تمبشور فيتاليا"];
const KNOWN_CONTENT_DUPLICATE_DESCRIPTION_ROUTES = ["treatment-prp-hair-restoration", "concern-hair-loss"];

test("no two indexable pages in the same locale share a title", () => {
  const unexpected = duplicatesWithinLocale((r) => r.title)
    .filter(({ value }) => !KNOWN_CONTENT_DUPLICATE_TITLES.some((known) => value.startsWith(known)))
    .map(({ value, urls }) => `${value}: ${urls.join(", ")}`);
  expect(unexpected).toEqual([]);
});

test("the known duplicate-title pair has not grown", () => {
  // Pins the exception so it cannot quietly become a licence for more.
  const known = duplicatesWithinLocale((r) => r.title).filter(({ value }) =>
    KNOWN_CONTENT_DUPLICATE_TITLES.some((k) => value.startsWith(k)),
  );
  for (const { value, urls } of known) {
    expect(urls.length, `${value} should be exactly the two known pages`).toBe(2);
  }
});

test("no two indexable pages in the same locale share a meta description", () => {
  const knownUrls = new Set(
    records
      .filter((r) => KNOWN_CONTENT_DUPLICATE_DESCRIPTION_ROUTES.includes(r.routeId))
      .map((r) => r.url),
  );
  const unexpected = duplicatesWithinLocale((r) => r.description)
    .filter(({ urls }) => !urls.every((url) => knownUrls.has(url)))
    .map(({ value, urls }) => `${value}: ${urls.join(", ")}`);
  expect(unexpected).toEqual([]);
});

/**
 * A localisation check, not a duplicate-content one.
 *
 * An Arabic page whose <title> is byte-identical to its English counterpart
 * has not been translated. That is currently true of the 31 Myriade
 * catalogue products, whose names, subtitles and slugs were imported in
 * English only — an Arabic visitor gets a fully English product title on an
 * otherwise Arabic page. Brand names are proper nouns and are legitimately
 * untranslated, but a whole title is not a brand name.
 *
 * The gap is deliberate and already recorded, in prose and in a contract
 * test — verified 2026-09-07:
 *
 *   src/features/products/data.ts:921, :1047  "ARABIC IS A CLIENT DEPENDENCY:
 *       no approved Arabic rendering was supplied, so every `ar` field repeats
 *       the approved English... It is not a translation and must not be
 *       presented as one."
 *   tests/unit/skinmedica-catalogue.spec.ts:369  asserts name.ar === name.en
 *       for every Myriade product, so the day real Arabic arrives that test
 *       says where it has to go.
 *
 * What is still missing is a MACHINE-READABLE marker. `Product` has no field
 * distinguishing "Arabic supplied and identical" from "Arabic never supplied",
 * and the records carry `approvalStatus: "approved"`, which asserts the record
 * is fine as it stands. A comment cannot be queried and does not travel with
 * the data into the CMS.
 *
 * This test covers the angle the other two do not: they pin the shop
 * catalogue from the data side, this one watches the RENDERED output of the
 * whole site and fails if an untranslated Arabic title appears on any page
 * outside the shop.
 *
 * Bounded rather than asserted-to-zero: translating product copy is a content
 * decision, so this pins the gap to the catalogue it currently covers and
 * fails if it spreads to any page outside the shop.
 */
test("untranslated Arabic titles are confined to the shop catalogue", () => {
  const englishByRoute = new Map(
    records.filter((r) => r.locale === "en").map((r) => [r.routeId, r.title]),
  );
  const untranslated = records
    .filter((r) => r.status === 200 && r.indexable && r.locale === "ar")
    .filter((r) => r.title && r.title === englishByRoute.get(r.routeId))
    .map((r) => r.routeId);

  const outsideShop = untranslated.filter((routeId) => !routeId.startsWith("shop-product-"));
  expect(outsideShop, "an untranslated Arabic title outside the shop is a new regression").toEqual([]);
});

test("every indexable page self-references its canonical on the configured origin", () => {
  const wrong = records
    .filter((r) => r.status === 200 && r.indexable)
    .filter((r) => normalizeUrl(r.canonical ?? "") !== normalizeUrl(r.expectedCanonical))
    .map((r) => `${r.url}: canonical=${r.canonical} expected=${r.expectedCanonical}`);
  expect(wrong).toEqual([]);
});

test("hreflang is reciprocal and complete on every indexable page", () => {
  const problems: string[] = [];
  for (const r of records.filter((r) => r.status === 200 && r.indexable)) {
    for (const key of ["en-CA", "ar-CA", "x-default"]) {
      if (!r.hreflang[key]) problems.push(`${r.url} is missing hreflang ${key}`);
    }
    const counterpart = records.find(
      (other) => other.routeId === r.routeId && other.locale !== r.locale,
    );
    if (!counterpart) continue;
    const expectedForCounterpart = counterpart.locale === "en" ? "en-CA" : "ar-CA";
    if (
      normalizeUrl(r.hreflang[expectedForCounterpart] ?? "") !==
      normalizeUrl(counterpart.expectedCanonical)
    ) {
      problems.push(
        `${r.url} points ${expectedForCounterpart} at ${r.hreflang[expectedForCounterpart]}, ` +
          `but its counterpart is ${counterpart.expectedCanonical}`,
      );
    }
    // x-default must follow the approved default-language route.
    const english = records.find((o) => o.routeId === r.routeId && o.locale === "en");
    if (
      english &&
      normalizeUrl(r.hreflang["x-default"] ?? "") !== normalizeUrl(english.expectedCanonical)
    ) {
      problems.push(`${r.url} x-default=${r.hreflang["x-default"]} expected ${english.expectedCanonical}`);
    }
  }
  expect(problems).toEqual([]);
});

test("no hreflang or canonical URL points at a route that is not served", () => {
  const served = new Set(
    records.filter((r) => r.status === 200).map((r) => normalizeUrl(`${SEO_TEST_ORIGIN}${r.url}`)),
  );
  const dangling: string[] = [];
  for (const r of records.filter((r) => r.status === 200 && r.indexable)) {
    for (const [lang, href] of Object.entries(r.hreflang)) {
      if (!served.has(normalizeUrl(href))) dangling.push(`${r.url} ${lang} -> ${href}`);
    }
  }
  expect(dangling).toEqual([]);
});

test("every structured-data block on every page parses", () => {
  const broken = records.filter((r) => r.status === 200 && !r.structuredDataParses).map((r) => r.url);
  expect(broken).toEqual([]);
});

test("non-indexable served routes carry a noindex robots tag", () => {
  const leaking = records
    .filter((r) => r.status === 200 && !r.indexable)
    .filter((r) => !r.robots?.includes("noindex"))
    .map((r) => `${r.url}: robots=${r.robots}`);
  expect(leaking).toEqual([]);
});

test("no internal link on any page answers a redirect", async () => {
  const discovered = new Set<string>();
  for (const r of records) for (const link of r.internalLinks) discovered.add(link);

  const bad: string[] = [];
  for (const link of discovered) {
    // Non-page assets and the API surface are not navigation.
    if (link.startsWith("/_next") || link.startsWith("/api")) continue;
    const response = await api.get(link, { maxRedirects: 0 });
    if (response.status() !== 200) {
      bad.push(`${link} -> ${response.status()} ${response.headers()["location"] ?? ""}`.trim());
    }
  }
  expect(bad, "every internal link must resolve directly to a 200, with no 3xx hop").toEqual([]);
});

test("no page links to a locale it does not belong to", () => {
  /**
   * EN pages link EN, AR pages link AR. The ONE legitimate exception is the
   * language switcher, which points at this page's own counterpart — so that
   * single URL is allowed and everything else is a locale leak (an English
   * page dropping a visitor into Arabic mid-journey, or vice versa).
   *
   * Comparison is percent-decoded: Arabic hrefs are encoded in the HTML and
   * raw in the route registry.
   */
  const leaks: string[] = [];
  for (const r of records.filter((r) => r.status === 200)) {
    const other = r.locale === "en" ? "ar" : "en";
    const counterpart = records.find((o) => o.routeId === r.routeId && o.locale !== r.locale);
    const allowed = new Set(
      [counterpart?.url, `/${other}`].filter(Boolean).map((u) => normalizeUrl(u as string)),
    );

    const foreign = r.internalLinks
      .map(normalizeUrl)
      .map((link) => link.replace(/\/$/, "") || "/")
      .filter((link) => link === `/${other}` || link.startsWith(`/${other}/`))
      .filter((link) => !allowed.has(link));

    if (foreign.length) leaks.push(`${r.url} -> ${[...new Set(foreign)].join(", ")}`);
  }
  expect(leaks, "only the language switcher may cross locales").toEqual([]);
});

test("no rendered URL contains a temporary, localhost or preview hostname", () => {
  const forbidden = [
    "localhost", "127.0.0.1", "0.0.0.0", "pages.dev", "workers.dev",
    "vercel.app", "netlify.app", "ngrok", ":3457", ":3000", ":3030", ":3031",
  ];
  const leaks: string[] = [];
  for (const r of records) {
    const surfaces = [r.canonical, ...Object.values(r.hreflang)].filter(Boolean) as string[];
    for (const value of surfaces) {
      for (const needle of forbidden) {
        if (value.includes(needle)) leaks.push(`${r.url}: ${value} contains ${needle}`);
      }
    }
  }
  expect(leaks).toEqual([]);
});
