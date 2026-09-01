import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  resolveDraftPreview,
  checkDraftPreviewRequest,
  PREVIEW_TYPES,
} from "../../src/lib/feelstack/draft-preview";
import {
  resolveDestination,
  isSafeInternalPath,
  HOME_SLUGS,
  type PreviewRoute,
} from "../../src/lib/feelstack/preview-source";
import {
  BD_PROJECT_ID,
  DFEELINGS_PROJECT_ID,
  TEST_SECRET,
} from "../fixtures/feelstack/webhook-envelopes";

/**
 * Draft preview, resolved against FeelStack rather than the app's static
 * registry.
 *
 * The fixture below is shaped like a real `preview/routes` response, including
 * a CMS-ONLY draft (`botox`, absent from src/config/routes.ts) and genuine
 * Arabic paths — the Arabic route is not a transliteration of the English one,
 * so a test that accepted `/ar` + the English path would pass while the feature
 * was broken.
 */
const ROUTES: PreviewRoute[] = [
  { path: "/", locale: "en", type: "page", status: "published" },
  { path: "/", locale: "ar", type: "page", status: "published" },
  { path: "/medical/eye-screening", locale: "en", type: "content_entry", status: "published" },
  { path: "/الرعاية-الطبية/فحص-العين", locale: "ar", type: "content_entry", status: "published" },
  // CMS-only draft: this is the record the previous implementation could not reach
  { path: "/aesthetics/treatments/botox", locale: "en", type: "content_entry", status: "draft" },
  { path: "/التجميل-الطبي/العلاجات/botox", locale: "ar", type: "content_entry", status: "draft" },
  { path: "/aesthetics/treatments/laser-hair-removal", locale: "en", type: "content_entry", status: "published" },
  { path: "/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر", locale: "ar", type: "content_entry", status: "published" },
  { path: "/our-team/mohamed-farhat", locale: "en", type: "person_profile", status: "published" },
  { path: "/فريقنا/محمد-فرحات", locale: "ar", type: "person_profile", status: "published" },
  { path: "/shop/lumivive-system-day-night", locale: "en", type: "content_entry", status: "draft" },
  { path: "/المتجر/lumivive-system-day-night", locale: "ar", type: "content_entry", status: "draft" },
];

const CONFIG = { expectedSecret: TEST_SECRET, expectedProjectId: BD_PROJECT_ID };

/** `route.alternates` as the resolve envelope returns them, keyed by EN path. */
const ALTERNATES: Record<string, { locale: string; path: string }[]> = {
  "/medical/eye-screening": [
    { locale: "en", path: "/medical/eye-screening" },
    { locale: "ar", path: "/الرعاية-الطبية/فحص-العين" },
  ],
  "/aesthetics/treatments/botox": [
    { locale: "en", path: "/aesthetics/treatments/botox" },
    { locale: "ar", path: "/التجميل-الطبي/العلاجات/botox" },
  ],
  "/aesthetics/treatments/laser-hair-removal": [
    { locale: "en", path: "/aesthetics/treatments/laser-hair-removal" },
    { locale: "ar", path: "/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر" },
  ],
  "/our-team/mohamed-farhat": [
    { locale: "en", path: "/our-team/mohamed-farhat" },
    { locale: "ar", path: "/فريقنا/محمد-فرحات" },
  ],
  "/shop/lumivive-system-day-night": [
    { locale: "en", path: "/shop/lumivive-system-day-night" },
    { locale: "ar", path: "/المتجر/lumivive-system-day-night" },
  ],
};

/** Status of a refusal, mirroring how the route handler narrows the union. */
function statusOf(r: { ok: false } & Record<string, unknown>): number {
  return typeof r.status === "number" ? r.status : 404;
}

function ask(overrides: Record<string, unknown> = {}, routes = ROUTES) {
  const input = {
    secret: TEST_SECRET,
    type: "medical-service",
    slug: "eye-screening",
    lang: "en",
    ...CONFIG,
    ...overrides,
  } as Parameters<typeof resolveDraftPreview>[0];

  // First pass, exactly as the route handler does it.
  const first = resolveDraftPreview(input, routes);
  if (first.ok || !("needsAlternates" in first)) return first;
  // Second pass with the alternates the handler would have fetched.
  return resolveDraftPreview(input, routes, ALTERNATES[first.cmsPathEn] ?? []);
}

test.describe("home preview resolves to the bare locale root", () => {
  test("EN home → /en exactly", () => {
    const r = ask({ type: "page", slug: "home", lang: "en" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.redirectTo).toBe("/en");
    expect(r.cmsPath).toBe("/");
  });

  test("AR home → /ar exactly", () => {
    const r = ask({ type: "page", slug: "home", lang: "ar" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.redirectTo).toBe("/ar");
    expect(r.cmsPath).toBe("/");
  });

  test("never produces /en/home", () => {
    for (const lang of ["en", "ar"] as const) {
      const r = ask({ type: "page", slug: "home", lang });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.redirectTo).not.toContain("home");
    }
  });

  test("every home alias maps to the same root", () => {
    for (const slug of HOME_SLUGS) {
      const r = ask({ type: "page", slug, lang: "en" });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.redirectTo).toBe("/en");
    }
  });
});

test.describe("CMS-only records resolve", () => {
  test("botox EN — absent from the static registry, present in FeelStack", () => {
    const r = ask({ type: "aesthetic-treatment", slug: "botox", lang: "en" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.redirectTo).toBe("/en/aesthetics/treatments/botox");
  });

  test("botox AR resolves to the Arabic route", () => {
    const r = ask({ type: "aesthetic-treatment", slug: "botox", lang: "ar" });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.redirectTo).toBe("/ar/التجميل-الطبي/العلاجات/botox");
  });

  test("botox is not in the app's static route registry", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/config/routes.ts"),
      "utf8",
    );
    // the registry has a /medical/botox hub but no aesthetic-treatment botox,
    // which is precisely why static-registry resolution 404'd it
    expect(src).not.toContain("/aesthetics/treatments/botox");
  });
});

test.describe("every required target resolves in both locales", () => {
  const cases: Array<[string, string, string, string]> = [
    ["medical-service", "eye-screening", "/en/medical/eye-screening", "/ar/الرعاية-الطبية/فحص-العين"],
    ["aesthetic-treatment", "laser-hair-removal", "/en/aesthetics/treatments/laser-hair-removal", "/ar/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر"],
    ["doctor", "mohamed-farhat", "/en/our-team/mohamed-farhat", "/ar/فريقنا/محمد-فرحات"],
    ["product", "lumivive-system-day-night", "/en/shop/lumivive-system-day-night", "/ar/المتجر/lumivive-system-day-night"],
  ];

  for (const [type, slug, en, ar] of cases) {
    test(`${type}/${slug} EN`, () => {
      const r = ask({ type, slug, lang: "en" });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.redirectTo).toBe(en);
    });
    test(`${type}/${slug} AR uses the real Arabic route`, () => {
      const r = ask({ type, slug, lang: "ar" });
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(r.redirectTo).toBe(ar);
      // an ar preview must never be /ar + the English path
      expect(r.redirectTo).not.toBe(`/ar${en.slice(3)}`);
    });
  }
});

test.describe("credentials", () => {
  test("missing secret is refused", () => {
    const r = ask({ secret: null });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(statusOf(r)).toBe(400);
  });

  test("wrong secret is refused with 401", () => {
    const r = ask({ secret: "not-the-secret" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(statusOf(r)).toBe(401);
  });

  test("unconfigured deployment refuses rather than previewing", () => {
    for (const o of [{ expectedSecret: undefined }, { expectedProjectId: undefined }]) {
      const r = ask(o);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(statusOf(r)).toBe(501);
    }
  });

  test("another project cannot be previewed through this deployment", () => {
    const r = ask({ projectId: DFEELINGS_PROJECT_ID });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(statusOf(r)).toBe(403);
  });

  test("refusal never echoes a secret", () => {
    const r = ask({ secret: "leak-me-please" });
    expect(JSON.stringify(r)).not.toContain("leak-me-please");
    expect(JSON.stringify(r)).not.toContain(TEST_SECRET);
  });

  test("credential check runs without any route list", () => {
    const r = checkDraftPreviewRequest({
      secret: "wrong",
      type: "page",
      slug: "home",
      lang: "en",
      ...CONFIG,
    } as Parameters<typeof checkDraftPreviewRequest>[0]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(statusOf(r)).toBe(401);
  });
});

test.describe("open redirects remain impossible", () => {
  const hostile = [
    "https://evil.example/x",
    "//evil.example",
    "../../etc/passwd",
    "..%2f..%2fadmin",
    "botox/../../admin",
    "botox\\admin",
    "botox admin",
  ];

  for (const slug of hostile) {
    test(`refuses hostile slug ${JSON.stringify(slug)}`, () => {
      const r = ask({ type: "aesthetic-treatment", slug });
      expect(r.ok).toBe(false);
    });
  }

  test("a destination FeelStack did not list cannot be reached", () => {
    const r = ask({ type: "aesthetic-treatment", slug: "not-a-real-record" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(statusOf(r)).toBe(404);
  });

  test("a hostile path injected into the route list is still refused", () => {
    const poisoned: PreviewRoute[] = [
      { path: "https://evil.example/x", locale: "en", type: "content_entry" },
    ];
    const r = resolveDestination("aesthetic-treatment", "x", "en", poisoned);
    expect(r.ok).toBe(false);
  });

  test("isSafeInternalPath rejects every non-internal shape", () => {
    for (const bad of ["https://x/y", "//x", "\\x", "/a/../b", "", "x"]) {
      expect(isSafeInternalPath(bad)).toBe(false);
    }
    expect(isSafeInternalPath("/en/medical/eye-screening")).toBe(true);
    expect(isSafeInternalPath("/الرعاية-الطبية/فحص-العين")).toBe(true);
  });

  test("every accepted redirect is relative and locale-prefixed", () => {
    for (const lang of ["en", "ar"] as const) {
      const r = ask({ type: "aesthetic-treatment", slug: "botox", lang });
      expect(r.ok).toBe(true);
      if (!r.ok) continue;
      expect(r.redirectTo.startsWith(`/${lang}`)).toBe(true);
      expect(r.redirectTo).not.toContain("://");
      expect(r.redirectTo.startsWith("//")).toBe(false);
    }
  });

  test("an unsupported type or locale is refused", () => {
    expect(ask({ type: "site-setting" }).ok).toBe(false);
    expect(ask({ lang: "fr" }).ok).toBe(false);
  });

  test("every declared type is a real CMS prefix", () => {
    expect(PREVIEW_TYPES.length).toBeGreaterThan(0);
    for (const t of PREVIEW_TYPES) {
      const r = ask({ type: t, slug: "definitely-not-a-real-slug" });
      expect(r.ok).toBe(false);
      if (!r.ok) expect([404, 400]).toContain(statusOf(r));
    }
  });
});

test.describe("the secret never leaves the server", () => {
  test("the preview client is server-only and sends Authorization: Preview", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/lib/feelstack/preview-client.ts"),
      "utf8",
    );
    expect(src).toContain('import "server-only"');
    expect(src).toContain("Authorization: `Preview ${secret}`");
    // never a query parameter, never logged
    expect(src).not.toMatch(/secret=\$\{/);
    expect(src).not.toMatch(/console\.(log|info|warn|error)/);
    expect(src).toContain('cache: "no-store"');
  });

  test("no preview module reaches a client bundle", () => {
    for (const f of [
      "../../src/lib/feelstack/preview-client.ts",
      "../../src/lib/feelstack/preview-source.ts",
      "../../src/lib/feelstack/draft-preview.ts",
      "../../src/app/api/draft/route.ts",
    ]) {
      const src = readFileSync(resolve(__dirname, f), "utf8");
      expect(src).not.toContain("NEXT_PUBLIC_");
      expect(src).not.toContain('"use client"');
    }
  });

  test("the route handler reads the secret once and never re-emits it", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/app/api/draft/route.ts"),
      "utf8",
    );
    expect(src.match(/searchParams\.get\("secret"\)/g)?.length).toBe(1);
    expect(src).not.toContain("previewSecret=");
    expect(src).not.toMatch(/console\.(log|info|warn|error)/);
  });

  test("an unauthenticated request never triggers an outbound CMS call", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/app/api/draft/route.ts"),
      "utf8",
    );
    // the credential check must appear before the route fetch
    expect(src.indexOf("checkDraftPreviewRequest")).toBeLessThan(
      src.indexOf("await previewRoutes("),
    );
  });
});

test.describe("non-draft behaviour is preserved", () => {
  test("the draft branch is entered only when Draft Mode is enabled", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/lib/feelstack/page-resolver.ts"),
      "utf8",
    );
    expect(src).toContain("if (await isDraftModeEnabled())");
    // and the draft path must never fall back to static fixtures
    const draftFn = src.slice(src.indexOf("async function resolveDraftContent"));
    expect(draftFn).not.toContain("staticFallback(");
  });

  test("published resolution still uses the public envelope", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/lib/feelstack/page-resolver.ts"),
      "utf8",
    );
    expect(src).toContain("await resolveEnvelope(path, locale, tags)");
  });
});
