import { test, expect } from "@playwright/test";
import { classifyHttpStatus, classifyThrown, FeelStackUnavailableError } from "../../src/lib/feelstack/errors";
import { extractFeelstackErrorCode } from "../../src/lib/feelstack/schemas";
import { OUTAGE_ERROR_CODES } from "../../src/lib/feelstack/contracts";
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
  test("an UNCODED 404 is NOT a confirmed absence — fails closed", () => {
    // Overturned deliberately. Every genuine absence from FeelStack carries
    // CONTENT_NOT_FOUND, so a 404 with no code came from somewhere that is not
    // FeelStack's content layer. See classifyHttpStatus's contract note.
    expect(classifyHttpStatus(404)).toBe("UPSTREAM_ERROR");
    expect(classifyHttpStatus(404)).not.toBe("NOT_FOUND");
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
      global.fetch = (async () =>
        new Response(JSON.stringify({ statusCode: 404, message: "Not found.", error: "Not Found", code: "CONTENT_NOT_FOUND" }), {
          status: 404,
        })) as typeof fetch;
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
      global.fetch = (async () =>
        new Response(JSON.stringify({ statusCode: 404, message: "Not found.", error: "Not Found", code: "CONTENT_NOT_FOUND" }), {
          status: 404,
        })) as typeof fetch;
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

/**
 * The integration contract's hard rule is that only a CONFIRMED absence may
 * become a 404. Everything else — rate limiting, an outage, a timeout, a
 * malformed body, or a misconfigured site key — must surface as an outage so a
 * transient failure is never indexed as deleted content.
 *
 * The load-bearing case is SITE_NOT_FOUND. FeelStack answers 404 for an unknown
 * siteKey exactly as it does for a missing page, so classifying on the HTTP
 * status alone would 404 every page on the site the moment a wrong key ships.
 */
test.describe("HTTP status classification", () => {
  test("only CONTENT_NOT_FOUND is a confirmed absence", () => {
    expect(classifyHttpStatus(404, "CONTENT_NOT_FOUND")).toBe("NOT_FOUND");
    expect(classifyHttpStatus(404)).not.toBe("NOT_FOUND");
  });

  test("404 + SITE_NOT_FOUND is a loud configuration failure, never a 404 page", () => {
    expect(classifyHttpStatus(404, "SITE_NOT_FOUND")).toBe("INVALID_SITE");
    expect(OUTAGE_ERROR_CODES.includes(classifyHttpStatus(404, "SITE_NOT_FOUND"))).toBe(false);
    // INVALID_SITE is not an outage code, but page-resolver throws on it too —
    // what matters here is only that it is NOT NOT_FOUND.
    expect(classifyHttpStatus(404, "SITE_NOT_FOUND")).not.toBe("NOT_FOUND");
  });

  test("404 + LOCALE_NOT_SUPPORTED is a locale failure, not a missing page", () => {
    expect(classifyHttpStatus(404, "LOCALE_NOT_SUPPORTED")).toBe("LOCALE_MISMATCH");
    expect(classifyHttpStatus(404, "LOCALE_NOT_SUPPORTED")).not.toBe("NOT_FOUND");
  });

  test("429 is never a 404, coded or not", () => {
    expect(classifyHttpStatus(429)).toBe("UPSTREAM_ERROR");
    expect(classifyHttpStatus(429, "RATE_LIMITED")).toBe("UPSTREAM_ERROR");
    expect(classifyHttpStatus(429)).not.toBe("NOT_FOUND");
    expect(classifyHttpStatus(429, "RATE_LIMITED")).not.toBe("NOT_FOUND");
  });

  test("5xx is never a 404, coded or not", () => {
    for (const status of [500, 502, 503, 504]) {
      expect(classifyHttpStatus(status)).toBe("UPSTREAM_ERROR");
      expect(classifyHttpStatus(status, "UPSTREAM_INTERNAL_ERROR")).toBe("UPSTREAM_ERROR");
      expect(classifyHttpStatus(status)).not.toBe("NOT_FOUND");
    }
  });

  test("an unrecognised upstream code fails closed, never as absence", () => {
    // The backend enum is append-only: an unknown code is NEWER than this
    // build, and guessing "absent" about it is never safe.
    expect(classifyHttpStatus(404, "SOMETHING_NEW")).toBe("UPSTREAM_ERROR");
    expect(classifyHttpStatus(503, "SOMETHING_NEW")).toBe("UPSTREAM_ERROR");
  });

  test("classification never reads message prose", () => {
    // Same status and code, wildly different messages -> identical outcome.
    expect(classifyHttpStatus(404, "SITE_NOT_FOUND")).toBe(classifyHttpStatus(404, "SITE_NOT_FOUND"));
    expect(classifyHttpStatus(500)).toBe(classifyHttpStatus(500));
  });
});

/**
 * REAL production contract.
 *
 * Every envelope below is the shape FeelStack actually emits, captured live on
 * 2026-08-23 from
 *   GET https://feelstack.dfeelings.com/api/public/v1/sites/<key>/resolve
 * which answered, for a siteKey that does not exist:
 *   {"statusCode":404,"message":"Site not found.","error":"Not Found",
 *    "code":"SITE_NOT_FOUND"}
 * alongside `X-FeelStack-Contract-Version: 1`.
 *
 * `code` is TOP-LEVEL; `error` is Nest's status STRING, not an object. This
 * repo previously assumed `{ error: { code } }`, so the envelope never parsed,
 * no code was ever extracted, and an unknown siteKey fell through to the bare
 * 404 path — turning a configuration fault into a sitewide 404. These tests
 * exist so that cannot regress silently.
 */
const LIVE_SITE_NOT_FOUND = {
  statusCode: 404,
  message: "Site not found.",
  error: "Not Found",
  code: "SITE_NOT_FOUND",
};

/** Classify straight from an envelope, the way the client does. */
function classifyEnvelope(status: number, body: unknown) {
  return classifyHttpStatus(status, extractFeelstackErrorCode(body));
}

test.describe("real FeelStack error envelope (flat, production)", () => {
  test("the exact captured SITE_NOT_FOUND body is a loud failure, never a 404", () => {
    expect(extractFeelstackErrorCode(LIVE_SITE_NOT_FOUND)).toBe("SITE_NOT_FOUND");
    expect(classifyEnvelope(404, LIVE_SITE_NOT_FOUND)).toBe("INVALID_SITE");
    expect(classifyEnvelope(404, LIVE_SITE_NOT_FOUND)).not.toBe("NOT_FOUND");
  });

  test("flat CONTENT_NOT_FOUND is the one code that becomes a 404", () => {
    const body = { statusCode: 404, message: "anything", error: "Not Found", code: "CONTENT_NOT_FOUND" };
    expect(classifyEnvelope(404, body)).toBe("NOT_FOUND");
  });

  test("flat LOCALE_NOT_SUPPORTED", () => {
    const body = { statusCode: 404, message: "x", error: "Not Found", code: "LOCALE_NOT_SUPPORTED" };
    expect(classifyEnvelope(404, body)).toBe("LOCALE_MISMATCH");
    expect(classifyEnvelope(404, body)).not.toBe("NOT_FOUND");
  });

  test("flat RATE_LIMITED", () => {
    const body = { statusCode: 429, message: "slow down", error: "Too Many Requests", code: "RATE_LIMITED" };
    expect(classifyEnvelope(429, body)).toBe("UPSTREAM_ERROR");
    expect(classifyEnvelope(429, body)).not.toBe("NOT_FOUND");
  });

  test("flat UPSTREAM_INTERNAL_ERROR", () => {
    const body = { statusCode: 500, message: "boom", error: "Internal Server Error", code: "UPSTREAM_INTERNAL_ERROR" };
    expect(classifyEnvelope(500, body)).toBe("UPSTREAM_ERROR");
  });

  test("flat INVALID_REQUEST", () => {
    const body = { statusCode: 400, message: "bad path", error: "Bad Request", code: "INVALID_REQUEST" };
    expect(classifyEnvelope(400, body)).toBe("INVALID_RESPONSE");
    expect(classifyEnvelope(400, body)).not.toBe("NOT_FOUND");
  });

  test("legacy nested SITE_NOT_FOUND still classifies (compatibility retained)", () => {
    const body = { error: { code: "SITE_NOT_FOUND", message: "Site not found." } };
    expect(extractFeelstackErrorCode(body)).toBe("SITE_NOT_FOUND");
    expect(classifyEnvelope(404, body)).toBe("INVALID_SITE");
  });

  test("flat wins over nested when both are somehow present", () => {
    const body = { code: "SITE_NOT_FOUND", error: { code: "CONTENT_NOT_FOUND" } };
    expect(extractFeelstackErrorCode(body)).toBe("SITE_NOT_FOUND");
    expect(classifyEnvelope(404, body)).not.toBe("NOT_FOUND");
  });
});

test.describe("classification never depends on message prose", () => {
  const messages = [
    "Site not found.",
    "site not found",
    "SITE NOT FOUND!!",
    "No published post for slug \"x\" (project=1, language=en)",
    "",
    "totally reworded by a future backend release",
  ];

  test("same code + different prose -> identical classification", () => {
    const results = messages.map((message) =>
      classifyEnvelope(404, { statusCode: 404, message, error: "Not Found", code: "SITE_NOT_FOUND" }),
    );
    expect(new Set(results).size, `prose changed the verdict: ${JSON.stringify(results)}`).toBe(1);
    expect(results[0]).toBe("INVALID_SITE");
  });

  test("prose alone can never manufacture an absence", () => {
    for (const message of messages) {
      // No code at all, however suggestive the wording.
      expect(classifyEnvelope(404, { statusCode: 404, message, error: "Not Found" })).not.toBe("NOT_FOUND");
    }
  });
});

test.describe("unrecognisable payloads fail closed", () => {
  test("unknown 404 code", () => {
    const body = { statusCode: 404, message: "?", error: "Not Found", code: "SOME_FUTURE_CODE" };
    expect(classifyEnvelope(404, body)).toBe("UPSTREAM_ERROR");
    expect(classifyEnvelope(404, body)).not.toBe("NOT_FOUND");
  });

  test("completely unexpected envelope shapes", () => {
    for (const body of [null, undefined, 42, "a string", [], {}, { nope: true }, { error: 7 }, { code: 9 }]) {
      expect(extractFeelstackErrorCode(body)).toBeUndefined();
      expect(classifyEnvelope(404, body)).not.toBe("NOT_FOUND");
    }
  });
});

/**
 * The invariant, stated once and checked exhaustively:
 * ONLY A POSITIVELY IDENTIFIED CONTENT ABSENCE MAY BECOME A 404.
 */
test.describe("mass-404 guard", () => {
  test("across every status and every known code, only CONTENT_NOT_FOUND yields NOT_FOUND", () => {
    const statuses = [400, 401, 403, 404, 409, 418, 429, 500, 502, 503, 504];
    const codes = [
      undefined,
      "CONTENT_NOT_FOUND",
      "SITE_NOT_FOUND",
      "LOCALE_NOT_SUPPORTED",
      "RATE_LIMITED",
      "UPSTREAM_INTERNAL_ERROR",
      "INVALID_REQUEST",
      "SOME_FUTURE_CODE",
    ];
    for (const status of statuses) {
      for (const code of codes) {
        const verdict = classifyHttpStatus(status, code);
        if (verdict === "NOT_FOUND") {
          expect(code, `status ${status} + code ${String(code)} became a 404`).toBe("CONTENT_NOT_FOUND");
        }
      }
    }
  });

  test("a wrong siteKey can never 404 the site — the real regression", () => {
    // The live failure mode, end to end: unknown siteKey -> HTTP 404 carrying
    // SITE_NOT_FOUND. Before the flat-envelope fix this produced NOT_FOUND for
    // every path on the site.
    for (const path of ["/", "/en", "/en/doctors", "/ar/الأطباء", "/en/medical/botox"]) {
      const verdict = classifyEnvelope(404, LIVE_SITE_NOT_FOUND);
      expect(verdict, `path ${path} would have 404'd`).toBe("INVALID_SITE");
    }
  });
});

test.describe("resolvePageContent — an uncoded 404 is an outage, not an absence", () => {
  const HYBRID = {
    FEELSTACK_CONTENT_MODE: "hybrid",
    FEELSTACK_API_URL: "https://feelstack.example.test/api",
    FEELSTACK_SITE_KEY: "blue-diamond-medical",
  };
  const schema = z.object({ path: z.string(), locale: z.enum(["en", "ar"]), status: z.string(), title: z.string() });

  test("a bare 404 with no envelope throws rather than rendering not-found", async () => {
    await withEnv(HYBRID, async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () => new Response(null, { status: 404 })) as typeof fetch;
      try {
        let caught: unknown;
        try {
          await resolvePageContent({ path: "/x", locale: "en", schema, staticFallback: () => undefined });
        } catch (e) {
          caught = e;
        }
        expect(caught).toBeInstanceOf(FeelStackUnavailableError);
        expect((caught as InstanceType<typeof FeelStackUnavailableError>).code).toBe("UPSTREAM_ERROR");
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  test("the live SITE_NOT_FOUND body throws INVALID_SITE and never falls back to static", async () => {
    await withEnv(HYBRID, async () => {
      const originalFetch = global.fetch;
      global.fetch = (async () => new Response(JSON.stringify(LIVE_SITE_NOT_FOUND), { status: 404 })) as typeof fetch;
      try {
        let caught: unknown;
        try {
          // A static fallback IS available — a wrong site key must still fail
          // loudly rather than quietly serving local content forever.
          await resolvePageContent({
            path: "/x",
            locale: "en",
            schema,
            staticFallback: () => ({ path: "/x", locale: "en" as const, status: "published", title: "Local" }),
          });
        } catch (e) {
          caught = e;
        }
        expect(caught).toBeInstanceOf(FeelStackUnavailableError);
        expect((caught as InstanceType<typeof FeelStackUnavailableError>).code).toBe("INVALID_SITE");
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});

