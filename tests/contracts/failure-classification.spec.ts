import { test, expect } from "@playwright/test";
import { classifyHttpStatus, classifyThrown, FeelStackUnavailableError } from "../../src/lib/feelstack/errors";
import { resolvePageContent } from "../../src/lib/feelstack/page-resolver";
import { z } from "zod";

/**
 * Failure-classification tests — brief §18 "Failure classification":
 * confirmed 404 calls notFound() (i.e. resolves to `{ source: "not-found"
 * }`, which every caller turns into notFound()); timeout/network
 * failure/500/malformed data do NOT become NOT_FOUND — they throw
 * `FeelStackUnavailableError` instead, so a caller can never accidentally
 * `notFound()` a CMS outage. Also covers brief §7 (timeout/retry policy).
 */

const testSchema = z.object({ path: z.string(), locale: z.enum(["en", "ar"]), status: z.string(), title: z.string() });

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

test.describe("HTTP status / thrown-error classification", () => {
  test("404 classifies as NOT_FOUND", () => {
    expect(classifyHttpStatus(404)).toBe("NOT_FOUND");
  });
  test("400 classifies as INVALID_RESPONSE, not a 404", () => {
    expect(classifyHttpStatus(400)).toBe("INVALID_RESPONSE");
  });
  test("401/403 classify as INVALID_SITE, not a 404", () => {
    expect(classifyHttpStatus(401)).toBe("INVALID_SITE");
    expect(classifyHttpStatus(403)).toBe("INVALID_SITE");
  });
  test("5xx classifies as UPSTREAM_ERROR, not a 404", () => {
    expect(classifyHttpStatus(500)).toBe("UPSTREAM_ERROR");
    expect(classifyHttpStatus(503)).toBe("UPSTREAM_ERROR");
  });
  test("AbortError classifies as TIMEOUT", () => {
    expect(classifyThrown(new DOMException("aborted", "AbortError"))).toBe("TIMEOUT");
  });
  test("TypeError (fetch network failure) classifies as NETWORK_ERROR", () => {
    expect(classifyThrown(new TypeError("fetch failed"))).toBe("NETWORK_ERROR");
  });
  test("SyntaxError (bad JSON) classifies as INVALID_RESPONSE", () => {
    expect(classifyThrown(new SyntaxError("Unexpected token"))).toBe("INVALID_RESPONSE");
  });
});

test.describe("resolvePageContent — corrected failure behavior (brief §5)", () => {
  test("static mode never touches the network, even if FeelStack env vars are set", async () => {
    await withEnv(
      { FEELSTACK_CONTENT_MODE: "static", FEELSTACK_API_URL: "https://should-not-be-called.test" },
      async () => {
        let called = false;
        const originalFetch = global.fetch;
        global.fetch = (() => {
          called = true;
          throw new Error("network should not be reached in static mode");
        }) as typeof fetch;
        try {
          const resolution = await resolvePageContent({
            path: "/x",
            locale: "en",
            schema: testSchema,
            staticFallback: () => ({ path: "/x", locale: "en" as const, status: "published", title: "Local" }),
          });
          expect(resolution.source).toBe("static");
          expect(called).toBe(false);
        } finally {
          global.fetch = originalFetch;
        }
      },
    );
  });

  test("confirmed absent (404) with no static fallback resolves to not-found, never throws", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () => new Response(null, { status: 404 })) as typeof fetch;
      try {
        const resolution = await resolvePageContent({
          path: "/never-existed",
          locale: "en",
          schema: testSchema,
          staticFallback: () => undefined,
        });
        expect(resolution.source).toBe("not-found");
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  test("confirmed absent (404) in hybrid mode falls through to local static content", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () => new Response(null, { status: 404 })) as typeof fetch;
      try {
        const resolution = await resolvePageContent({
          path: "/not-yet-migrated",
          locale: "en",
          schema: testSchema,
          staticFallback: () => ({ path: "/not-yet-migrated", locale: "en" as const, status: "published", title: "Local" }),
        });
        expect(resolution.source).toBe("static");
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  test("timeout does NOT become not-found — throws FeelStackUnavailableError", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () => {
        throw new DOMException("aborted", "AbortError");
      }) as typeof fetch;
      try {
        await expect(
          resolvePageContent({
            path: "/x",
            locale: "en",
            schema: testSchema,
            staticFallback: () => ({ path: "/x", locale: "en" as const, status: "published", title: "Stale local copy" }),
          }),
        ).rejects.toThrow(FeelStackUnavailableError);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  test("network failure does NOT become not-found — throws FeelStackUnavailableError", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () => {
        throw new TypeError("fetch failed");
      }) as typeof fetch;
      try {
        let caught: unknown;
        try {
          await resolvePageContent({
            path: "/x",
            locale: "en",
            schema: testSchema,
            staticFallback: () => undefined,
          });
        } catch (e) {
          caught = e;
        }
        expect(caught).toBeInstanceOf(FeelStackUnavailableError);
        expect((caught as InstanceType<typeof FeelStackUnavailableError>).code).toBe("NETWORK_ERROR");
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  test("FeelStack 500 does NOT become not-found — throws with UPSTREAM_ERROR, no retry", async () => {
    await withEnv(HYBRID_ENV, async () => {
      let callCount = 0;
      const originalFetch = global.fetch;
      global.fetch = (async () => {
        callCount += 1;
        return new Response(null, { status: 500 });
      }) as typeof fetch;
      try {
        let caught: unknown;
        try {
          await resolvePageContent({ path: "/x", locale: "en", schema: testSchema, staticFallback: () => undefined });
        } catch (e) {
          caught = e;
        }
        expect(caught).toBeInstanceOf(FeelStackUnavailableError);
        expect((caught as InstanceType<typeof FeelStackUnavailableError>).code).toBe("UPSTREAM_ERROR");
        expect(callCount).toBe(1); // 500 is not in the retryable status list (only 502/503/504)
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  test("503 retries exactly once, then throws on continued failure", async () => {
    await withEnv(HYBRID_ENV, async () => {
      let callCount = 0;
      const originalFetch = global.fetch;
      global.fetch = (async () => {
        callCount += 1;
        return new Response(null, { status: 503 });
      }) as typeof fetch;
      try {
        await expect(
          resolvePageContent({ path: "/x", locale: "en", schema: testSchema, staticFallback: () => undefined }),
        ).rejects.toThrow(FeelStackUnavailableError);
        expect(callCount).toBe(2); // one retry, brief §7
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  test("400 is never retried", async () => {
    await withEnv(HYBRID_ENV, async () => {
      let callCount = 0;
      const originalFetch = global.fetch;
      global.fetch = (async () => {
        callCount += 1;
        return new Response(null, { status: 400 });
      }) as typeof fetch;
      try {
        await expect(
          resolvePageContent({ path: "/x", locale: "en", schema: testSchema, staticFallback: () => undefined }),
        ).rejects.toThrow(FeelStackUnavailableError);
        expect(callCount).toBe(1);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  test("malformed JSON does NOT become not-found — throws INVALID_RESPONSE", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () => new Response("not json{{{", { status: 200 })) as typeof fetch;
      try {
        let caught: unknown;
        try {
          await resolvePageContent({ path: "/x", locale: "en", schema: testSchema, staticFallback: () => undefined });
        } catch (e) {
          caught = e;
        }
        expect(caught).toBeInstanceOf(FeelStackUnavailableError);
        expect((caught as InstanceType<typeof FeelStackUnavailableError>).code).toBe("INVALID_RESPONSE");
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  test("schema-invalid (but valid JSON) response does NOT become not-found — throws INVALID_RESPONSE", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () =>
        new Response(JSON.stringify({ path: "/x" /* missing locale/status/title */ }), { status: 200 })) as typeof fetch;
      try {
        let caught: unknown;
        try {
          await resolvePageContent({ path: "/x", locale: "en", schema: testSchema, staticFallback: () => undefined });
        } catch (e) {
          caught = e;
        }
        expect(caught).toBeInstanceOf(FeelStackUnavailableError);
        expect((caught as InstanceType<typeof FeelStackUnavailableError>).code).toBe("INVALID_RESPONSE");
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  test("locale mismatch does not silently 404 or silently swap locale — throws a controlled error", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () => new Response(null, { status: 409 })) as typeof fetch; // 409 -> UPSTREAM_ERROR by current classifier
      try {
        await expect(
          resolvePageContent({ path: "/x", locale: "en", schema: testSchema, staticFallback: () => undefined }),
        ).rejects.toThrow(FeelStackUnavailableError);
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  test("published, schema-valid CMS content resolves with source 'cms'", async () => {
    await withEnv(HYBRID_ENV, async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () =>
        new Response(JSON.stringify({ path: "/x", locale: "en", status: "published", title: "From CMS" }), {
          status: 200,
        })) as typeof fetch;
      try {
        const resolution = await resolvePageContent({
          path: "/x",
          locale: "en",
          schema: testSchema,
          staticFallback: () => undefined,
        });
        expect(resolution.source).toBe("cms");
        if (resolution.source !== "not-found") expect(resolution.data.title).toBe("From CMS");
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});
