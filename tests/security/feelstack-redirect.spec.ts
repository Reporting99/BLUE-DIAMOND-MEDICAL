import { test, expect } from "@playwright/test";

import {
  preserveQuery,
  resolveFeelstackRedirect,
  sanitizeDestination,
  splitLocalePath,
  withLocale,
} from "../../src/lib/feelstack/redirect-resolver";

/**
 * GAP-4 (consumer half). The resolver is where every safety decision lives:
 * open-redirect refusal, loop refusal, locale preservation, query handling and
 * fail-open behaviour. It is exercised directly here, rather than through a
 * rendered 404, so each rule is asserted on its own.
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
  // The resolver refuses to call out unless the CMS is configured.
  process.env.FEELSTACK_API_URL = "https://cms.test/api";
  process.env.FEELSTACK_SITE_KEY = "blue-diamond-medical";
});

test.afterEach(() => {
  (globalThis as { fetch: unknown }).fetch = realFetch;
});

test.describe("redirect resolver: pure helpers", () => {
  test("splits and restores locale prefixes", () => {
    expect(splitLocalePath("/en/doctors/old")).toEqual({ locale: "en", cmsPath: "/doctors/old" });
    expect(splitLocalePath("/ar/الأطباء/قديم")).toEqual({ locale: "ar", cmsPath: "/الأطباء/قديم" });
    expect(splitLocalePath("/ar")).toEqual({ locale: "ar", cmsPath: "/" });
    expect(splitLocalePath("/doctors/old").locale).toBeNull();

    expect(withLocale("/doctors/new", "ar")).toBe("/ar/doctors/new");
    expect(withLocale("/", "ar")).toBe("/ar");
    expect(withLocale("/ar/already", "ar")).toBe("/ar/already");
  });

  test("carries only allow-listed query parameters", () => {
    expect(preserveQuery("/en/new", undefined)).toBe("/en/new");
    expect(
      preserveQuery("/en/new", new URLSearchParams({ utm_source: "x", session: "secret" })),
    ).toBe("/en/new?utm_source=x");
  });

  test.describe("destination sanitisation", () => {
    const hostile: unknown[] = [
      "https://evil.example/phish",
      "//evil.example/phish",
      "/\\evil.example/phish",
      "javascript:alert(1)",
      "data:text/html,<script>",
      "  https://evil.example",
      "/a:b/c",
      "relative/no-leading-slash",
      "",
      "x".repeat(2000),
      "/new\u0000",
      "/new\u000A",
      "/new\u000D",
      "/new\u0009",
      42,
      null,
      undefined,
    ];
    for (const destination of hostile) {
      test(`refuses ${JSON.stringify(destination)}`, () => {
        expect(sanitizeDestination(destination)).toBeNull();
      });
    }

    test("accepts an ordinary internal path", () => {
      expect(sanitizeDestination("/doctors/new")).toBe("/doctors/new");
      expect(sanitizeDestination("/الأطباء/جديد")).toBe("/الأطباء/جديد");
    });
  });
});

test.describe("redirect resolver: resolution", () => {
  test("English old path redirects to the English canonical", async () => {
    stubFetch(async () => jsonResponse({ destination: "/doctors/new", enabled: true }));
    const result = await resolveFeelstackRedirect("/en/doctors/old", "en");
    expect(result).toEqual({ destination: "/en/doctors/new", statusCode: 301 });
  });

  test("Arabic old path redirects to the ARABIC canonical, never English", async () => {
    stubFetch(async () => jsonResponse({ destination: "/الأطباء/جديد", enabled: true }));
    const result = await resolveFeelstackRedirect("/ar/الأطباء/قديم", "ar");
    expect(result?.destination).toBe("/ar/الأطباء/جديد");
    expect(result?.destination.startsWith("/ar/")).toBe(true);
  });

  test("queries the locale-stripped, project-scoped endpoint", async () => {
    let requested = "";
    stubFetch(async (input) => {
      requested = String(input);
      return jsonResponse({ destination: "/new", enabled: true });
    });
    await resolveFeelstackRedirect("/ar/الأطباء/قديم", "ar");
    expect(requested).toContain("/sites/blue-diamond-medical/redirect");
    expect(requested).toContain(encodeURIComponent("/الأطباء/قديم"));
    expect(requested).not.toContain("/ar/");
  });

  test("a self-redirect is refused rather than looping the browser", async () => {
    stubFetch(async () => jsonResponse({ destination: "/doctors/same", enabled: true }));
    expect(await resolveFeelstackRedirect("/en/doctors/same", "en")).toBeNull();
  });

  test("a disabled redirect is ignored", async () => {
    stubFetch(async () => jsonResponse({ destination: "/new", enabled: false }));
    expect(await resolveFeelstackRedirect("/en/old", "en")).toBeNull();
  });

  test("a pathname whose locale contradicts the caller is refused", async () => {
    // Redirecting across locales is the one mistake that must never happen, so
    // a caller confused about its own request gets nothing rather than a guess
    // at which of the two is right.
    stubFetch(async () => jsonResponse({ destination: "/new", enabled: true }));
    expect(await resolveFeelstackRedirect("/ar/قديم", "en")).toBeNull();
    expect(await resolveFeelstackRedirect("/en/old", "ar")).toBeNull();
  });

  test("preserves safe query parameters and drops the rest", async () => {
    stubFetch(async () => jsonResponse({ destination: "/new", enabled: true }));
    const result = await resolveFeelstackRedirect(
      "/en/old",
      "en",
      new URLSearchParams({ utm_campaign: "spring", session: "secret" }),
    );
    expect(result?.destination).toBe("/en/new?utm_campaign=spring");
    expect(result?.destination).not.toContain("session");
  });

  test("an unconfigured CMS never calls out and never redirects", async () => {
    delete process.env.FEELSTACK_API_URL;
    let called = false;
    stubFetch(async () => {
      called = true;
      return jsonResponse({ destination: "/new", enabled: true });
    });
    expect(await resolveFeelstackRedirect("/en/old", "en")).toBeNull();
    expect(called).toBe(false);
  });

  const failureModes: Array<[string, () => Promise<Response>]> = [
    ["404 no redirect", async () => jsonResponse({}, 404)],
    ["500 outage", async () => jsonResponse({ error: "boom" }, 500)],
    ["non-JSON body", async () => new Response("not json", { status: 200 })],
    ["null body", async () => jsonResponse(null)],
    ["missing destination", async () => jsonResponse({ enabled: true })],
    ["connection reset", async () => { throw new Error("ECONNRESET"); }],
  ];
  for (const [label, handler] of failureModes) {
    test(`fails open to a normal 404: ${label}`, async () => {
      stubFetch(handler);
      expect(await resolveFeelstackRedirect("/en/old", "en")).toBeNull();
    });
  }

  test("a hanging CMS is abandoned rather than hanging the 404", async () => {
    stubFetch((_input, init) => {
      const signal = (init as { signal?: AbortSignal } | undefined)?.signal;
      return new Promise<Response>((_resolve, reject) => {
        signal?.addEventListener("abort", () => reject(new Error("aborted")));
      });
    });
    const startedAt = Date.now();
    const result = await resolveFeelstackRedirect("/en/old", "en");
    expect(result).toBeNull();
    expect(Date.now() - startedAt).toBeLessThan(4_000);
  });
});
