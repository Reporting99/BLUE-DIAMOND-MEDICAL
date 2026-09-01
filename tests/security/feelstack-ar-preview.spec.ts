import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveDraftPreview } from "../../src/lib/feelstack/draft-preview";
import {
  resolveDestination,
  type PreviewRoute,
  type RouteAlternate,
} from "../../src/lib/feelstack/preview-source";
import { BD_PROJECT_ID, DFEELINGS_PROJECT_ID, TEST_SECRET } from "../fixtures/feelstack/webhook-envelopes";

/**
 * AR draft preview resolution.
 *
 * These fixtures are split by locale ON PURPOSE. The previous suite put EN and
 * AR routes in one array, so `routes.filter(locale === "en")` always found
 * something and every AR case passed — while production, which fetches one
 * locale per request, 404'd every AR record. A fixture that does not mirror how
 * the data is actually retrieved tests nothing.
 *
 * So: EN_ROUTES contains only EN, AR_ROUTES only AR, and no test may pass both.
 */
const EN_ROUTES: PreviewRoute[] = [
  { path: "/", locale: "en", type: "page", status: "published" },
  { path: "/our-team", locale: "en", type: "page", status: "draft" },
  { path: "/medical/eye-screening", locale: "en", type: "content_entry", status: "published" },
  { path: "/aesthetics/treatments/botox", locale: "en", type: "content_entry", status: "draft" },
  { path: "/shop/lumivive-system-day-night", locale: "en", type: "content_entry", status: "draft" },
  { path: "/our-team/mohamed-farhat", locale: "en", type: "person_profile", status: "published" },
];

/** What `previewRoutes("ar")` would return — deliberately NEVER passed to the resolver. */
const AR_ROUTES: PreviewRoute[] = [
  { path: "/", locale: "ar", type: "page", status: "published" },
  { path: "/الرعاية-الطبية/فحص-العين", locale: "ar", type: "content_entry", status: "published" },
  { path: "/التجميل-الطبي/العلاجات/botox", locale: "ar", type: "content_entry", status: "draft" },
  { path: "/فريقنا/محمد-فرحات", locale: "ar", type: "person_profile", status: "published" },
];

/** `route.alternates`, the only place FeelStack links the two locales. */
const ALTERNATES: Record<string, RouteAlternate[]> = {
  "/medical/eye-screening": [
    { locale: "en", path: "/medical/eye-screening" },
    { locale: "ar", path: "/الرعاية-الطبية/فحص-العين" },
  ],
  "/aesthetics/treatments/botox": [
    { locale: "en", path: "/aesthetics/treatments/botox" },
    { locale: "ar", path: "/التجميل-الطبي/العلاجات/botox" },
  ],
  "/shop/lumivive-system-day-night": [
    { locale: "en", path: "/shop/lumivive-system-day-night" },
    { locale: "ar", path: "/المتجر/lumivive-system-day-night" },
  ],
  "/our-team/mohamed-farhat": [
    { locale: "en", path: "/our-team/mohamed-farhat" },
    { locale: "ar", path: "/فريقنا/محمد-فرحات" },
  ],
  "/our-team": [
    { locale: "en", path: "/our-team" },
    { locale: "ar", path: "/our-team" },
  ],
};

const CONFIG = { expectedSecret: TEST_SECRET, expectedProjectId: BD_PROJECT_ID };

/** Mirrors the route handler: EN routes always, then alternates. */
function ask(overrides: Record<string, unknown> = {}) {
  const input = {
    secret: TEST_SECRET,
    type: "medical-service",
    slug: "eye-screening",
    lang: "en",
    ...CONFIG,
    ...overrides,
  } as Parameters<typeof resolveDraftPreview>[0];

  const first = resolveDraftPreview(input, EN_ROUTES);
  if (first.ok || !("needsAlternates" in first)) return first;
  return resolveDraftPreview(input, EN_ROUTES, ALTERNATES[first.cmsPathEn] ?? []);
}

function statusOf(r: { ok: false } & Record<string, unknown>): number {
  return typeof r.status === "number" ? r.status : 404;
}

test.describe("the handler resolves against EN routes whatever the locale", () => {
  test("the route handler fetches the EN list unconditionally", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/app/api/draft/route.ts"),
      "utf8",
    );
    expect(src).toContain('previewRoutes("en")');
    expect(src).not.toContain("previewRoutes(checked.locale)");
  });

  test("AR resolution fails if only AR routes are available — the production bug", () => {
    // Passing AR routes where the resolver expects EN reproduces exactly what
    // the deployed build did. This test exists so the regression cannot return.
    const r = resolveDestination("aesthetic-treatment", "botox", "ar", AR_ROUTES);
    expect(r.ok).toBe(false);
  });
});

test.describe("every required record resolves in EN and AR", () => {
  const cases: Array<[string, string, string, string]> = [
    ["aesthetic-treatment", "botox", "/en/aesthetics/treatments/botox", "/ar/التجميل-الطبي/العلاجات/botox"],
    ["medical-service", "eye-screening", "/en/medical/eye-screening", "/ar/الرعاية-الطبية/فحص-العين"],
    ["product", "lumivive-system-day-night", "/en/shop/lumivive-system-day-night", "/ar/المتجر/lumivive-system-day-night"],
    ["doctor", "mohamed-farhat", "/en/our-team/mohamed-farhat", "/ar/فريقنا/محمد-فرحات"],
    ["page", "our-team", "/en/our-team", "/ar/our-team"],
  ];

  for (const [type, slug, en, ar] of cases) {
    test(`${type}/${slug} EN`, () => {
      const r = ask({ type, slug, lang: "en" });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.redirectTo).toBe(en);
    });

    test(`${type}/${slug} AR comes from alternates, never from the English slug`, () => {
      const r = ask({ type, slug, lang: "ar" });
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(r.redirectTo).toBe(ar);
      // the AR path must be the registry's own, not /ar + the English path
      const naive = `/ar${en.slice(3)}`;
      if (ar !== naive) expect(r.redirectTo).not.toBe(naive);
      // Some AR routes legitimately carry a Latin slug, so "must not contain
      // the slug" would be wrong. The real property is that the path is TAKEN
      // from alternates rather than assembled: with no alternates supplied the
      // resolver must refuse instead of inventing one.
      const withoutAlternates = resolveDestination(type, slug, "ar", EN_ROUTES, []);
      expect(withoutAlternates.ok).toBe(false);
    });
  }
});

test.describe("home stays exact", () => {
  test("home EN → /en", () => {
    const r = ask({ type: "page", slug: "home", lang: "en" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.redirectTo).toBe("/en");
  });

  test("home AR → /ar", () => {
    const r = ask({ type: "page", slug: "home", lang: "ar" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.redirectTo).toBe("/ar");
  });

  test("home needs no alternates lookup at all", () => {
    for (const lang of ["en", "ar"] as const) {
      const r = resolveDraftPreview(
        { secret: TEST_SECRET, type: "page", slug: "home", lang, ...CONFIG } as Parameters<
          typeof resolveDraftPreview
        >[0],
        EN_ROUTES,
      );
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.redirectTo).toBe(`/${lang}`);
    }
  });
});

test.describe("credentials and destination safety are unchanged", () => {
  test("missing secret refused", () => {
    const r = ask({ secret: null });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(statusOf(r)).toBe(400);
  });

  test("wrong secret refused with 401", () => {
    const r = ask({ secret: "not-the-secret" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(statusOf(r)).toBe(401);
  });

  test("cross-project refused with 403", () => {
    const r = ask({ projectId: DFEELINGS_PROJECT_ID });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(statusOf(r)).toBe(403);
  });

  test("refusal never echoes a secret", () => {
    const r = ask({ secret: "leak-me" });
    expect(JSON.stringify(r)).not.toContain("leak-me");
    expect(JSON.stringify(r)).not.toContain(TEST_SECRET);
  });

  for (const slug of [
    "https://evil.example/x",
    "//evil.example",
    "../../etc/passwd",
    "..%2f..%2fadmin",
    "botox\\admin",
  ]) {
    test(`hostile slug ${JSON.stringify(slug)} refused in AR too`, () => {
      expect(ask({ type: "aesthetic-treatment", slug, lang: "ar" }).ok).toBe(false);
    });
  }

  test("a hostile alternate from upstream is still refused", () => {
    const r = resolveDestination("aesthetic-treatment", "botox", "ar", EN_ROUTES, [
      { locale: "ar", path: "https://evil.example/x" },
    ]);
    expect(r.ok).toBe(false);
  });

  test("every accepted AR redirect is relative and locale-prefixed", () => {
    for (const [type, slug] of [
      ["aesthetic-treatment", "botox"],
      ["doctor", "mohamed-farhat"],
    ] as const) {
      const r = ask({ type, slug, lang: "ar" });
      expect(r.ok).toBe(true);
      if (!r.ok) continue;
      expect(r.redirectTo.startsWith("/ar")).toBe(true);
      expect(r.redirectTo).not.toContain("://");
      expect(r.redirectTo.startsWith("//")).toBe(false);
    }
  });
});

test.describe("the secret never leaves the server", () => {
  test("preview client stays server-only and header-authenticated", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/lib/feelstack/preview-client.ts"),
      "utf8",
    );
    expect(src).toContain('import "server-only"');
    expect(src).toContain("Authorization: `Preview ${secret}`");
    expect(src).not.toMatch(/secret=\$\{/);
    expect(src).not.toMatch(/console\.(log|info|warn|error)/);
  });

  test("no preview module reaches a client bundle", () => {
    for (const f of [
      "../../src/lib/feelstack/preview-client.ts",
      "../../src/lib/feelstack/preview-source.ts",
      "../../src/app/api/draft/route.ts",
    ]) {
      const src = readFileSync(resolve(__dirname, f), "utf8");
      expect(src).not.toContain("NEXT_PUBLIC_");
      expect(src).not.toContain('"use client"');
    }
  });
});

test.describe("non-Draft behaviour is untouched", () => {
  test("published resolution still uses the public envelope", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/lib/feelstack/page-resolver.ts"),
      "utf8",
    );
    expect(src).toContain("await resolveEnvelope(path, locale, tags)");
    expect(src).toContain("if (await isDraftModeEnabled())");
  });

  test("the draft path never falls back to static fixtures", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/lib/feelstack/page-resolver.ts"),
      "utf8",
    );
    const draftFn = src.slice(src.indexOf("async function resolveDraftContent"));
    expect(draftFn).not.toContain("staticFallback(");
  });
});
