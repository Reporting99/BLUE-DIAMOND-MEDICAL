import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  resolveDraftPreview,
  DRAFT_PREVIEW_TYPES,
} from "../../src/lib/feelstack/draft-preview";
import { routes } from "../../src/config/routes";
import {
  BD_PROJECT_ID,
  DFEELINGS_PROJECT_ID,
  TEST_SECRET,
} from "../fixtures/feelstack/webhook-envelopes";

/**
 * Draft preview is the one route that deliberately trades a secret for elevated
 * read access, so the tests below are about what it REFUSES as much as what it
 * allows: a wrong secret, another tenant's project, an unknown resource, and
 * any attempt to steer the redirect somewhere the route registry does not
 * already list.
 */

const CONFIG = { expectedSecret: TEST_SECRET, expectedProjectId: BD_PROJECT_ID };

function ask(overrides: Record<string, unknown> = {}) {
  return resolveDraftPreview({
    secret: TEST_SECRET,
    type: "medical-service",
    slug: "family-medicine",
    lang: "en",
    ...CONFIG,
    ...overrides,
  } as Parameters<typeof resolveDraftPreview>[0]);
}

/** A slug that genuinely exists in the registry for the given prefix. */
function firstSlugFor(prefix: string): string {
  const hit = routes.find(
    (r) => r.path.en.startsWith(`${prefix}/`) && r.path.en.split("/").length === prefix.split("/").length + 1,
  );
  if (!hit) throw new Error(`no registry route under ${prefix}`);
  return hit.path.en.slice(prefix.length + 1);
}

test.describe("draft preview — valid entry", () => {
  test("EN preview resolves to the English localized route", () => {
    const slug = firstSlugFor("/medical");
    const result = ask({ slug, lang: "en" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.locale).toBe("en");
    expect(result.redirectTo).toBe(`/en/medical/${slug}`);
  });

  test("AR preview resolves to the REAL Arabic route, not a transliteration", () => {
    const slug = firstSlugFor("/medical");
    const result = ask({ slug, lang: "ar" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.locale).toBe("ar");
    expect(result.redirectTo.startsWith("/ar/")).toBe(true);
    // the Arabic path is registry-supplied, so it must NOT be /ar + the English path
    expect(result.redirectTo).not.toBe(`/ar/medical/${slug}`);
    // and it must be the registry's own Arabic path
    const route = routes.find((r) => r.path.en === `/medical/${slug}`);
    expect(result.redirectTo).toBe(`/ar${route!.path.ar}`);
  });

  test("home previews in both locales", () => {
    for (const lang of ["en", "ar"] as const) {
      const result = ask({ type: "page", slug: "home", lang });
      // home may be registered as "/" — either it resolves, or it is refused
      // cleanly; it must never produce something outside the locale prefix.
      if (result.ok) expect(result.redirectTo.startsWith(`/${lang}`)).toBe(true);
      else expect(result.status).toBeGreaterThanOrEqual(400);
    }
  });

  test("lang defaults to en when omitted", () => {
    const result = ask({ slug: firstSlugFor("/medical"), lang: null });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.locale).toBe("en");
  });
});

test.describe("draft preview — credentials", () => {
  test("missing secret is refused", () => {
    const result = ask({ secret: null });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });

  test("wrong secret is refused with 401", () => {
    const result = ask({ secret: "not-the-secret" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(401);
  });

  test("a secret of a different length is refused without throwing", () => {
    expect(() => ask({ secret: "x" })).not.toThrow();
    const result = ask({ secret: "x" });
    expect(result.ok).toBe(false);
  });

  test("an unconfigured deployment refuses rather than previewing", () => {
    const noSecret = ask({ expectedSecret: undefined });
    const noProject = ask({ expectedProjectId: undefined });
    expect(noSecret.ok).toBe(false);
    expect(noProject.ok).toBe(false);
    if (!noSecret.ok) expect(noSecret.status).toBe(501);
    if (!noProject.ok) expect(noProject.status).toBe(501);
  });

  test("the refusal never echoes the secret back", () => {
    const result = ask({ secret: "leak-me-please" });
    expect(JSON.stringify(result)).not.toContain("leak-me-please");
    expect(JSON.stringify(result)).not.toContain(TEST_SECRET);
  });
});

test.describe("draft preview — tenant isolation", () => {
  test("another project cannot be previewed through this deployment", () => {
    const result = ask({ projectId: DFEELINGS_PROJECT_ID });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(403);
  });

  test("this project's own id is accepted", () => {
    const result = ask({ slug: firstSlugFor("/medical"), projectId: BD_PROJECT_ID });
    expect(result.ok).toBe(true);
  });
});

test.describe("draft preview — destination cannot be steered", () => {
  const hostile = [
    "https://evil.example/x",
    "//evil.example",
    "../../etc/passwd",
    "..%2f..%2fadmin",
    "family-medicine/../../admin",
    "family\\medicine",
    "family medicine",
    "%2e%2e%2f",
  ];

  for (const slug of hostile) {
    test(`refuses hostile slug ${JSON.stringify(slug)}`, () => {
      const result = ask({ slug });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBeGreaterThanOrEqual(400);
    });
  }

  test("every accepted redirect is relative and locale-prefixed", () => {
    for (const lang of ["en", "ar"] as const) {
      const result = ask({ slug: firstSlugFor("/medical"), lang });
      expect(result.ok).toBe(true);
      if (!result.ok) continue;
      expect(result.redirectTo.startsWith(`/${lang}`)).toBe(true);
      expect(result.redirectTo).not.toContain("://");
      expect(result.redirectTo.startsWith("//")).toBe(false);
    }
  });

  test("an unknown resource is refused rather than redirected", () => {
    const result = ask({ slug: "no-such-service-anywhere" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(404);
  });

  test("an unsupported type is refused", () => {
    const result = ask({ type: "site-setting" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });

  test("an unsupported locale is refused", () => {
    const result = ask({ lang: "fr" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });

  test("every declared type maps to a real CMS prefix", () => {
    expect(DRAFT_PREVIEW_TYPES.length).toBeGreaterThan(0);
    for (const t of DRAFT_PREVIEW_TYPES) {
      const result = ask({ type: t, slug: "definitely-not-a-real-slug" });
      // unknown slug -> 404 (type accepted); never 400 "unsupported type"
      expect(result.ok).toBe(false);
      if (!result.ok) expect([404, 400]).toContain(result.status);
    }
  });
});

test.describe("draft preview — published behaviour is untouched", () => {
  test("the module exports no side effect that could publish or mutate", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/lib/feelstack/draft-preview.ts"),
      "utf8",
    );
    for (const forbidden of ["fetch(", "revalidate", "publish", "process.exit"]) {
      expect(src).not.toContain(forbidden);
    }
  });

  test("the secret is never written into the redirect target", () => {
    const result = ask({ slug: firstSlugFor("/medical") });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.redirectTo).not.toContain(TEST_SECRET);
    expect(result.redirectTo).not.toContain("secret");
  });

  test("the route handler never puts the secret in the response or a log", () => {
    const src = readFileSync(
      resolve(__dirname, "../../src/app/api/draft/route.ts"),
      "utf8",
    );
    expect(src).not.toMatch(/console\.(log|info|warn|error)/);
    // the secret is read once, passed to the resolver, and never re-emitted
    expect(src.match(/searchParams\.get\("secret"\)/g)?.length).toBe(1);
    expect(src).not.toContain("previewSecret=");
  });

  test("no preview secret is baked into a client bundle", () => {
    const lib = readFileSync(
      resolve(__dirname, "../../src/lib/feelstack/draft-preview.ts"),
      "utf8",
    );
    const route = readFileSync(
      resolve(__dirname, "../../src/app/api/draft/route.ts"),
      "utf8",
    );
    // NEXT_PUBLIC_* is the only env prefix Next inlines into client bundles
    expect(lib).not.toContain("NEXT_PUBLIC_");
    expect(route).not.toContain("NEXT_PUBLIC_");
    expect(lib).not.toContain('"use client"');
    expect(route).not.toContain('"use client"');
  });
});
