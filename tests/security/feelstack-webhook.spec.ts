import { test, expect } from "@playwright/test";
import { createHmac } from "node:crypto";
import {
  processRevalidationRequest,
  decodeAndNormalizePath,
  __resetReplayGuardForTests,
  MAX_WEBHOOK_BODY_BYTES,
} from "../../src/lib/feelstack/webhook-handler";
import {
  BD_PROJECT_ID,
  BD_SITE_KEY,
  DFEELINGS_PROJECT_ID,
  LEGACY_PATH_ONLY_BODY,
  LEGACY_STRUCTURED_BODY,
  TEST_SECRET,
  envelope,
  signed,
  signedRequest,
} from "../fixtures/feelstack/webhook-envelopes";

/**
 * Webhook security + contract tests.
 *
 * Every request here is shaped and signed exactly as FeelStack's real
 * sender does (see tests/fixtures/feelstack/webhook-envelopes.ts),
 * including the `sha256=` signature prefix — the prefix is load-bearing,
 * not decoration. See "signature scheme prefix" below.
 */

const DOCTOR_CMS_PATH = "/doctors/mohamed-farhat";
const DOCTOR_EN_URL = "/en/doctors/mohamed-farhat";
const DOCTOR_AR_URL = "/ar/الأطباء/محمد-فرحات";

function effects() {
  const revalidatedTags: string[] = [];
  const revalidatedPaths: string[] = [];
  return {
    revalidateTag: (tag: string) => revalidatedTags.push(tag),
    revalidatePath: (path: string) => revalidatedPaths.push(path),
    revalidatedTags,
    revalidatedPaths,
  };
}

test.beforeEach(() => {
  __resetReplayGuardForTests();
});

test.describe("Webhook: configuration", () => {
  for (const missing of ["secret", "projectId", "siteKey"] as const) {
    test(`501s when ${missing} is not configured — never a silent default`, async () => {
      const request = { ...signedRequest(), [missing]: undefined };
      const result = await processRevalidationRequest(request, effects());
      expect(result.status).toBe(501);
      expect(result.outcome).toBe("not_configured");
    });
  }
});

test.describe("Webhook: signature scheme prefix", () => {
  /**
   * FeelStack sends `X-FeelStack-Signature: sha256=<hex>`. Before this
   * change the handler fed the whole header to `Buffer.from(sig, "hex")`,
   * which decodes to ZERO bytes because "s" is not a hex character — so
   * every genuine delivery was rejected as an invalid signature, before
   * the body was ever parsed. This is the regression guard.
   */
  test("accepts the real `sha256=` prefixed signature", async () => {
    const result = await processRevalidationRequest(signedRequest(), effects());
    expect(result.outcome).toBe("revalidated");
    expect(result.status).toBe(200);
  });

  test("still accepts a bare hex signature (no prefix)", async () => {
    const request = signedRequest();
    const result = await processRevalidationRequest(
      { ...request, signature: request.signature.replace(/^sha256=/, "") },
      effects(),
    );
    expect(result.outcome).toBe("revalidated");
  });

  test("rejects a signature that is not a well-formed sha256 digest", async () => {
    const request = signedRequest();
    const result = await processRevalidationRequest({ ...request, signature: "sha256=not-hex" }, effects());
    expect(result.status).toBe(401);
    expect(result.outcome).toBe("invalid_signature");
  });
});

test.describe("Webhook: signature verification", () => {
  test("invalid signature is rejected with 401", async () => {
    const request = signedRequest();
    const result = await processRevalidationRequest(
      { ...request, signature: `sha256=${"0".repeat(64)}` },
      effects(),
    );
    expect(result.status).toBe(401);
    expect(result.outcome).toBe("invalid_signature");
  });

  test("signature computed with the wrong secret is rejected", async () => {
    const body = JSON.stringify(envelope());
    const { timestamp, signature } = signed(body, "a-different-secret-entirely");
    const result = await processRevalidationRequest(
      {
        secret: TEST_SECRET,
        projectId: BD_PROJECT_ID,
        siteKey: BD_SITE_KEY,
        contentType: "application/json",
        contentLength: body.length,
        signature,
        timestamp,
        rawBody: body,
      },
      effects(),
    );
    expect(result.outcome).toBe("invalid_signature");
  });

  test("malformed timestamp is distinguished from a stale one", async () => {
    const request = signedRequest();
    const result = await processRevalidationRequest({ ...request, timestamp: "not-a-number" }, effects());
    expect(result.status).toBe(401);
    expect(result.outcome).toBe("invalid_timestamp");
  });

  test("expired timestamp (>5 minutes old) is rejected as stale", async () => {
    const stale = String(Math.floor(Date.now() / 1000) - 6 * 60);
    const body = JSON.stringify(envelope());
    const { signature } = signed(body, TEST_SECRET, stale);
    const result = await processRevalidationRequest(
      {
        secret: TEST_SECRET,
        projectId: BD_PROJECT_ID,
        siteKey: BD_SITE_KEY,
        contentType: "application/json",
        contentLength: body.length,
        signature,
        timestamp: stale,
        rawBody: body,
      },
      effects(),
    );
    expect(result.status).toBe(401);
    expect(result.outcome).toBe("stale_timestamp");
  });

  test("missing signature/timestamp headers is rejected", async () => {
    const result = await processRevalidationRequest(
      { ...signedRequest(), signature: null, timestamp: null },
      effects(),
    );
    expect(result.status).toBe(401);
    expect(result.outcome).toBe("missing_headers");
  });
});

test.describe("Webhook: replay protection", () => {
  test("the same valid request replayed a second time is rejected", async () => {
    const request = signedRequest();
    const first = await processRevalidationRequest(request, effects());
    expect(first.outcome).toBe("revalidated");
    const second = await processRevalidationRequest(request, effects());
    expect(second.status).toBe(401);
    expect(second.outcome).toBe("duplicate");
  });
});

test.describe("Webhook: body limits and content type", () => {
  test("oversized body is rejected (Content-Length header)", async () => {
    const result = await processRevalidationRequest(
      { ...signedRequest(), contentLength: MAX_WEBHOOK_BODY_BYTES + 1 },
      effects(),
    );
    expect(result.status).toBe(413);
    expect(result.outcome).toBe("payload_too_large");
  });

  test("oversized actual body is rejected even if Content-Length lies", async () => {
    const huge = "x".repeat(MAX_WEBHOOK_BODY_BYTES + 10);
    const result = await processRevalidationRequest(
      { ...signedRequest(), contentLength: 10, rawBody: huge },
      effects(),
    );
    expect(result.status).toBe(413);
  });

  test("non-JSON content type is rejected", async () => {
    const result = await processRevalidationRequest({ ...signedRequest(), contentType: "text/plain" }, effects());
    expect(result.status).toBe(415);
    expect(result.outcome).toBe("invalid_content_type");
  });

  test("malformed JSON body is rejected with 400", async () => {
    const bad = "{not json";
    const { timestamp, signature } = signed(bad);
    const result = await processRevalidationRequest(
      {
        secret: TEST_SECRET,
        projectId: BD_PROJECT_ID,
        siteKey: BD_SITE_KEY,
        contentType: "application/json",
        contentLength: bad.length,
        signature,
        timestamp,
        rawBody: bad,
      },
      effects(),
    );
    expect(result.status).toBe(400);
    expect(result.outcome).toBe("invalid_json");
  });
});

test.describe("Webhook: canonical envelope only", () => {
  async function post(body: unknown) {
    const raw = JSON.stringify(body);
    const { timestamp, signature } = signed(raw);
    return processRevalidationRequest(
      {
        secret: TEST_SECRET,
        projectId: BD_PROJECT_ID,
        siteKey: BD_SITE_KEY,
        contentType: "application/json",
        contentLength: raw.length,
        signature,
        timestamp,
        rawBody: raw,
      },
      effects(),
    );
  }

  test("the old guessed {event, siteKey, ...} body no longer validates", async () => {
    const result = await post(LEGACY_STRUCTURED_BODY);
    expect(result.status).toBe(400);
    expect(result.outcome).toBe("invalid_payload");
  });

  test("the legacy {path}-only body no longer validates", async () => {
    const result = await post(LEGACY_PATH_ONLY_BODY);
    expect(result.status).toBe(400);
    expect(result.outcome).toBe("invalid_payload");
  });

  test("a non-uuid event id is rejected", async () => {
    const result = await post(envelope({ id: "not-a-uuid" }));
    expect(result.outcome).toBe("invalid_payload");
  });

  test("a non-uuid projectId is rejected", async () => {
    const result = await post(envelope({ projectId: "nope" }));
    expect(result.outcome).toBe("invalid_payload");
  });

  test("an unparseable occurredAt is rejected", async () => {
    const result = await post(envelope({ occurredAt: "whenever" }));
    expect(result.outcome).toBe("invalid_payload");
  });

  test("a malformed event type is rejected", async () => {
    const result = await post(envelope({ type: "NotAnEventType" }));
    expect(result.outcome).toBe("invalid_payload");
  });
});

test.describe("Webhook: project isolation", () => {
  test("an event for the Dfeelings project cannot invalidate Blue Diamond", async () => {
    const fx = effects();
    const raw = JSON.stringify(envelope({ projectId: DFEELINGS_PROJECT_ID }));
    const { timestamp, signature } = signed(raw);
    const result = await processRevalidationRequest(
      {
        secret: TEST_SECRET,
        projectId: BD_PROJECT_ID,
        siteKey: BD_SITE_KEY,
        contentType: "application/json",
        contentLength: raw.length,
        signature,
        timestamp,
        rawBody: raw,
      },
      fx,
    );
    expect(result.status).toBe(403);
    expect(result.outcome).toBe("project_mismatch");
    expect(fx.revalidatedTags).toHaveLength(0);
    expect(fx.revalidatedPaths).toHaveLength(0);
  });

  test("an event for an unrelated random project is rejected", async () => {
    const raw = JSON.stringify(envelope({ projectId: "11111111-2222-4333-8444-555555555555" }));
    const { timestamp, signature } = signed(raw);
    const result = await processRevalidationRequest(
      {
        secret: TEST_SECRET,
        projectId: BD_PROJECT_ID,
        siteKey: BD_SITE_KEY,
        contentType: "application/json",
        contentLength: raw.length,
        signature,
        timestamp,
        rawBody: raw,
      },
      effects(),
    );
    expect(result.outcome).toBe("project_mismatch");
  });
});

test.describe("Webhook: path decoding / normalization", () => {
  test("single-encoded traversal is rejected", () => {
    expect(decodeAndNormalizePath("/en/%2e%2e/secret")).toBeNull();
  });
  test("double-encoded traversal is rejected", () => {
    expect(decodeAndNormalizePath("/en/%252e%252e/secret")).toBeNull();
  });
  test("a normal, unencoded path decodes to itself", () => {
    expect(decodeAndNormalizePath(DOCTOR_CMS_PATH)).toBe(DOCTOR_CMS_PATH);
  });
  test("trailing slashes are normalized away", () => {
    expect(decodeAndNormalizePath(`${DOCTOR_CMS_PATH}/`)).toBe(DOCTOR_CMS_PATH);
  });

  test("a traversal path in a signed event is rejected end-to-end", async () => {
    const fx = effects();
    const result = await processRevalidationRequest(
      signedRequest({ data: { id: "9b7c1a20-4f3e-4d5a-8b21-0c6e9f2a1d33", status: "published", locale: "en", path: "/doctors/%2e%2e/etc" } }),
      fx,
    );
    expect(result.status).toBe(400);
    expect(result.outcome).toBe("invalid_path");
    expect(fx.revalidatedPaths).toHaveLength(0);
  });

  test("a well-formed path that is not a Blue Diamond route is rejected", async () => {
    const fx = effects();
    const result = await processRevalidationRequest(
      signedRequest({ data: { id: "9b7c1a20-4f3e-4d5a-8b21-0c6e9f2a1d33", status: "published", locale: "en", path: "/not/a/real/route" } }),
      fx,
    );
    expect(result.status).toBe(400);
    expect(result.outcome).toBe("invalid_path");
    expect(fx.revalidatedTags).toHaveLength(0);
  });
});

test.describe("Webhook: real event families", () => {
  test("content.person_profile.published revalidates the doctor's EN URL", async () => {
    const fx = effects();
    const result = await processRevalidationRequest(signedRequest(), fx);
    expect(result.outcome).toBe("revalidated");
    expect(fx.revalidatedPaths).toContain(DOCTOR_EN_URL);
    expect(fx.revalidatedTags.some((t) => t.startsWith("feelstack-doctor:"))).toBe(true);
    expect(fx.revalidatedTags.some((t) => t.startsWith("feelstack-doctors:"))).toBe(true);
  });

  test("content.person.* (post PR #21 rename) is accepted identically", async () => {
    const fx = effects();
    const result = await processRevalidationRequest(signedRequest({ type: "content.person.published" }), fx);
    expect(result.outcome).toBe("revalidated");
    expect(fx.revalidatedPaths).toContain(DOCTOR_EN_URL);
  });

  test("the STATE grammar has no .updated — .draft and .archived also revalidate", async () => {
    for (const state of ["draft", "archived"]) {
      __resetReplayGuardForTests();
      const fx = effects();
      const result = await processRevalidationRequest(
        signedRequest({
          type: `content.person_profile.${state}`,
          data: { id: "9b7c1a20-4f3e-4d5a-8b21-0c6e9f2a1d33", status: state, locale: "en", path: DOCTOR_CMS_PATH },
        }),
        fx,
      );
      expect(result.outcome, `state=${state}`).toBe("revalidated");
      expect(fx.revalidatedPaths).toContain(DOCTOR_EN_URL);
    }
  });

  test("an Arabic event revalidates the Arabic URL, never the English one", async () => {
    const fx = effects();
    const result = await processRevalidationRequest(
      signedRequest({
        data: { id: "9b7c1a20-4f3e-4d5a-8b21-0c6e9f2a1d33", status: "published", locale: "ar", path: DOCTOR_CMS_PATH },
      }),
      fx,
    );
    expect(result.outcome).toBe("revalidated");
    expect(fx.revalidatedPaths).toContain(DOCTOR_AR_URL);
    expect(fx.revalidatedPaths).not.toContain(DOCTOR_EN_URL);
    expect(fx.revalidatedTags.every((t) => !t.includes(":en:"))).toBe(true);
  });

  test("content.entry.published maps contentType to the right family", async () => {
    const fx = effects();
    const result = await processRevalidationRequest(
      signedRequest({
        type: "content.entry.published",
        data: {
          id: "9b7c1a20-4f3e-4d5a-8b21-0c6e9f2a1d33",
          contentType: "medical-service",
          status: "published",
          locale: "en",
          path: "/medical/eye-screening",
        },
      }),
      fx,
    );
    expect(result.outcome).toBe("revalidated");
    expect(fx.revalidatedPaths).toContain("/en/medical/eye-screening");
    expect(fx.revalidatedTags.some((t) => t.startsWith("feelstack-medical-service:"))).toBe(true);
    expect(fx.revalidatedTags.some((t) => t.startsWith("feelstack-medical-services:"))).toBe(true);
    // Never another family's tags.
    expect(fx.revalidatedTags.some((t) => t.startsWith("feelstack-doctor:"))).toBe(false);
  });

  test("content.entry.* with an unknown contentType is reported, not guessed", async () => {
    const result = await processRevalidationRequest(
      signedRequest({
        type: "content.entry.published",
        data: {
          id: "9b7c1a20-4f3e-4d5a-8b21-0c6e9f2a1d33",
          contentType: "not-a-blue-diamond-family",
          status: "published",
          locale: "en",
          path: "/medical/eye-screening",
        },
      }),
      effects(),
    );
    expect(result.outcome).toBe("unsupported_event");
  });
});

test.describe("Webhook: backend event gaps", () => {
  const gapped: Array<[string, Record<string, unknown>]> = [
    ["content.relationships.updated", { relationKey: "treats", targetType: "content_entry", targetId: "x" }],
    ["content.faq.published", { id: "9b7c1a20-4f3e-4d5a-8b21-0c6e9f2a1d33", status: "published", locale: "en" }],
    ["content.taxonomy.updated", { termId: "abc" }],
  ];

  for (const [type, data] of gapped) {
    test(`${type} returns backend_event_gap, not a silent success`, async () => {
      __resetReplayGuardForTests();
      const fx = effects();
      const result = await processRevalidationRequest(signedRequest({ type, data }), fx);
      expect(result.status).toBe(200);
      expect(result.outcome).toBe("backend_event_gap");
      expect(result.body.revalidated).toBe(false);
      expect(typeof result.body.backendEventGap).toBe("string");
      expect(fx.revalidatedTags).toHaveLength(0);
      expect(fx.revalidatedPaths).toHaveLength(0);
    });
  }

  test("an event family Blue Diamond does not consume is ignored deliberately", async () => {
    const result = await processRevalidationRequest(
      signedRequest({ type: "content.casestudy.published", data: { id: "9b7c1a20-4f3e-4d5a-8b21-0c6e9f2a1d33" } }),
      effects(),
    );
    expect(result.status).toBe(200);
    expect(result.outcome).toBe("unsupported_event");
    expect(result.body.revalidated).toBe(false);
  });
});

test.describe("Webhook: no secret in logs", () => {
  test("a rejected request never logs the configured secret or the signature value", async () => {
    const lines: string[] = [];
    const originalWarn = console.warn;
    const originalLog = console.log;
    console.warn = (...args: unknown[]) => lines.push(args.map(String).join(" "));
    console.log = (...args: unknown[]) => lines.push(args.map(String).join(" "));
    try {
      const request = signedRequest();
      await processRevalidationRequest({ ...request, signature: `sha256=${"0".repeat(64)}` }, effects());
    } finally {
      console.warn = originalWarn;
      console.log = originalLog;
    }
    const joined = lines.join("\n");
    expect(joined).not.toContain(TEST_SECRET);
    expect(joined).not.toContain("0".repeat(64));
  });
});

test.describe("Webhook: signed-bytes contract", () => {
  test("the signature is computed over the RAW body, not a re-serialization", async () => {
    // Same object, different byte layout. Signing one and sending the other
    // must fail — proving the handler never re-serializes before verifying.
    const canonical = JSON.stringify(envelope());
    const respaced = JSON.stringify(JSON.parse(canonical), null, 2);
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = `sha256=${createHmac("sha256", TEST_SECRET).update(`${timestamp}.${canonical}`).digest("hex")}`;
    const result = await processRevalidationRequest(
      {
        secret: TEST_SECRET,
        projectId: BD_PROJECT_ID,
        siteKey: BD_SITE_KEY,
        contentType: "application/json",
        contentLength: respaced.length,
        signature,
        timestamp,
        rawBody: respaced,
      },
      effects(),
    );
    expect(result.outcome).toBe("invalid_signature");
  });
});
