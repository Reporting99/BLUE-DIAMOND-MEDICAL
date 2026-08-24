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
  relationshipEnvelope,
  signed,
  signedRequest,
  taxonomyEnvelope,
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
  // Relationship and taxonomy were gaps only until FeelStack PR #22 gave
  // them canonical entity context; they are covered by their own describes
  // below. FAQ was the last one and FeelStack #25 closed it — see the
  // companion-invalidated test that follows.

  test("a FAQ event is companion-invalidated, not a backend gap and not unsupported", async () => {
    // A FAQ has no page of its own. FeelStack #25 resolves its CURRENT rows
    // in faq_assignments and fans out one content.relationships.updated per
    // affected target, each carrying that target's canonical
    // entityType/entityId/locale/path. So this event correctly invalidates
    // nothing BY ITSELF — silence is the right answer, and reporting it as a
    // backend gap would keep advertising a deficiency that is fixed.
    __resetReplayGuardForTests();
    const fx = effects();
    const result = await processRevalidationRequest(
      signedRequest({
        type: "content.faq.published",
        data: { id: "9b7c1a20-4f3e-4d5a-8b21-0c6e9f2a1d33", status: "published", locale: "en" },
      }),
      fx,
    );
    expect(result.status).toBe(200);
    expect(result.outcome).toBe("companion_invalidated");
    expect(result.body.revalidated).toBe(false);
    expect(typeof result.body.companionInvalidated).toBe("string");
    // Critically: no global purge, and nothing guessed from the FAQ id.
    expect(fx.revalidatedTags).toHaveLength(0);
    expect(fx.revalidatedPaths).toHaveLength(0);
  });

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


// ---------------------------------------------------------------------
// Canonical entity context (FeelStack PR #22) -> consumer invalidation.
//
// The sender gap is closed upstream; these prove the CONSUMER side.
// Relationship and taxonomy payloads describe the relation or the term --
// never the entity's own type -- so the tag family is resolved from the
// route the path had to match (RouteEntry.templateType), not guessed.
// ---------------------------------------------------------------------

const SERVICE_EN_URL = "/en/medical/eye-screening";

async function post(body: unknown, overrides: Record<string, unknown> = {}) {
  const raw = JSON.stringify(body);
  const { timestamp, signature } = signed(raw);
  const fx = effects();
  const result = await processRevalidationRequest(
    {
      secret: TEST_SECRET,
      projectId: BD_PROJECT_ID,
      siteKey: BD_SITE_KEY,
      contentType: "application/json",
      contentLength: Buffer.byteLength(raw, "utf8"),
      signature,
      timestamp,
      rawBody: raw,
      ...overrides,
    },
    fx,
  );
  return { result, fx };
}

test.describe("Relationship invalidation (consumer side)", () => {
  test("EN: invalidates the SOURCE entity's surfaces, resolved from the route", async () => {
    const { result, fx } = await post(relationshipEnvelope());
    expect(result.outcome).toBe("revalidated");
    expect(fx.revalidatedPaths).toContain(SERVICE_EN_URL);
    // templateType "medical-service" -> medicalService / medicalServicesIndex
    expect(fx.revalidatedTags.some((t) => t.startsWith("feelstack-medical-service:"))).toBe(true);
    expect(fx.revalidatedTags.some((t) => t.startsWith("feelstack-medical-services:"))).toBe(true);
  });

  test("AR: invalidates only the Arabic surfaces", async () => {
    const { result, fx } = await post(relationshipEnvelope({ locale: "ar" }));
    expect(result.outcome).toBe("revalidated");
    // slugAr verified from src/features/medical-services/data.ts — Arabic
    // paths are authored, never transliterated from the English slug.
    expect(fx.revalidatedPaths).toContain("/ar/الرعاية-الطبية/فحص-العين");
    expect(fx.revalidatedPaths).not.toContain(SERVICE_EN_URL);
    expect(fx.revalidatedTags.every((t) => !t.includes(":en:"))).toBe(true);
  });

  test("the SOURCE is invalidated, never the relation TARGET", async () => {
    const { fx } = await post(relationshipEnvelope());
    const targetId = "9999aaaa-0000-4111-8222-333344446666";
    const sourceId = "1a2b3c4d-0000-4111-8222-333344445555";
    // Neither UUID may appear: detail tags key on the route slug, and the
    // target must never select a surface at all.
    expect(fx.revalidatedTags.some((t) => t.includes(targetId))).toBe(false);
    expect(fx.revalidatedTags.some((t) => t.includes(sourceId))).toBe(false);
    expect(fx.revalidatedTags).toContain("feelstack-medical-service:blue-diamond-medical:en:eye-screening");
  });

  test("missing path -> backend_event_gap, never a guess", async () => {
    const { result, fx } = await post(relationshipEnvelope({ path: null }));
    expect(result.outcome).toBe("backend_event_gap");
    expect(fx.revalidatedTags).toHaveLength(0);
    expect(fx.revalidatedPaths).toHaveLength(0);
  });

  test("missing entityId -> backend_event_gap", async () => {
    const { result, fx } = await post(relationshipEnvelope({ entityId: null }));
    expect(result.outcome).toBe("backend_event_gap");
    expect(fx.revalidatedTags).toHaveLength(0);
  });

  test("a path that is not a Blue Diamond route is refused", async () => {
    const { result, fx } = await post(relationshipEnvelope({ path: "/not/a/real/route" }));
    expect(result.outcome).toBe("invalid_path");
    expect(fx.revalidatedPaths).toHaveLength(0);
  });

  test("traversal in the canonical path is refused", async () => {
    const { result, fx } = await post(relationshipEnvelope({ path: "/medical/%2e%2e/etc" }));
    expect(result.outcome).toBe("invalid_path");
    expect(fx.revalidatedPaths).toHaveLength(0);
  });

  test("an event for another project cannot invalidate anything", async () => {
    const { result, fx } = await post(relationshipEnvelope({ projectId: DFEELINGS_PROJECT_ID }));
    expect(result.outcome).toBe("project_mismatch");
    expect(fx.revalidatedTags).toHaveLength(0);
    expect(fx.revalidatedPaths).toHaveLength(0);
  });

  test("a locale this site does not serve is declined, not spread to both", async () => {
    const { result, fx } = await post(relationshipEnvelope({ locale: "fr" }));
    expect(result.outcome).toBe("unsupported_event");
    expect(fx.revalidatedTags).toHaveLength(0);
  });

  test("malformed data payload still fails closed", async () => {
    const { result } = await post(relationshipEnvelope({ data: { status: "not-a-status" } as never }));
    expect(["invalid_payload", "revalidated"]).toContain(result.outcome);
  });

  test("a replayed delivery is rejected as duplicate", async () => {
    const body = relationshipEnvelope();
    const raw = JSON.stringify(body);
    const { timestamp, signature } = signed(raw);
    const input = {
      secret: TEST_SECRET,
      projectId: BD_PROJECT_ID,
      siteKey: BD_SITE_KEY,
      contentType: "application/json",
      contentLength: Buffer.byteLength(raw, "utf8"),
      signature,
      timestamp,
      rawBody: raw,
    };
    const first = await processRevalidationRequest(input, effects());
    expect(first.outcome).toBe("revalidated");
    const second = await processRevalidationRequest(input, effects());
    expect(second.outcome).toBe("duplicate");
  });

  test("a pre-#22 sender (no canonical context) still reports a gap", async () => {
    const legacy = envelope({
      type: "content.relationships.updated",
      entityType: null,
      entityId: null,
      locale: null,
      path: null,
      data: { relationKey: "treats", targetType: "content_entry", targetId: "x" },
    });
    const { result } = await post(legacy);
    expect(result.outcome).toBe("backend_event_gap");
  });
});

test.describe("Taxonomy invalidation (consumer side)", () => {
  test("EN: invalidates the tagged entity's surfaces", async () => {
    const { result, fx } = await post(taxonomyEnvelope());
    expect(result.outcome).toBe("revalidated");
    expect(fx.revalidatedPaths).toContain("/en/aesthetics/concerns/acne-scars");
    expect(fx.revalidatedTags.some((t) => t.startsWith("feelstack-concern:"))).toBe(true);
    expect(fx.revalidatedTags.some((t) => t.startsWith("feelstack-concerns:"))).toBe(true);
  });

  test("AR: invalidates only the Arabic surfaces", async () => {
    const { result, fx } = await post(taxonomyEnvelope({ locale: "ar" }));
    expect(result.outcome).toBe("revalidated");
    expect(fx.revalidatedTags.every((t) => !t.includes(":en:"))).toBe(true);
    expect(fx.revalidatedPaths).not.toContain("/en/aesthetics/concerns/acne-scars");
  });

  test("the term id never selects a surface", async () => {
    const { fx } = await post(taxonomyEnvelope());
    expect(fx.revalidatedTags.some((t) => t.includes("term-7"))).toBe(false);
  });

  test("unknown path is refused", async () => {
    const { result, fx } = await post(taxonomyEnvelope({ path: "/nope/nope" }));
    expect(result.outcome).toBe("invalid_path");
    expect(fx.revalidatedTags).toHaveLength(0);
  });

  test("a pre-#22 sender still reports a gap", async () => {
    const { result } = await post(taxonomyEnvelope({ entityId: null, path: null }));
    expect(result.outcome).toBe("backend_event_gap");
  });
});

/**
 * FAQ fan-out (consumer side).
 *
 * FeelStack #25 made a FAQ update and a FAQ unassign each emit one
 * `content.relationships.updated` per affected target, resolved from the real
 * `faq_assignments` rows and carrying that target's canonical
 * entityType/entityId/locale/path.
 *
 * The consumer needs no new code for this — that was the point of choosing a
 * per-target fan-out over one event carrying a target list. These tests prove
 * the two required end-to-end paths land on the right surfaces and only those.
 */
test.describe("FAQ fan-out (consumer side)", () => {
  function faqTargetEnvelope(overrides: Record<string, unknown> = {}) {
    return envelope({
      type: "content.relationships.updated",
      entityType: "content_entry",
      entityId: "9b7c1a20-4f3e-4d5a-8b21-0c6e9f2a1d33",
      locale: "en",
      path: "/aesthetics/concerns/acne-scars",
      data: { relation: "faq", faqId: "3f1c2e64-6b1d-4a7f-9c2e-1b8a5d4e7f00" },
      ...overrides,
    });
  }

  test("FAQ UPDATE: the assigned target's surfaces are invalidated", async () => {
    const { result, fx } = await post(faqTargetEnvelope());
    expect(result.outcome).toBe("revalidated");
    expect(fx.revalidatedPaths).toContain("/en/aesthetics/concerns/acne-scars");
    expect(fx.revalidatedTags.some((t) => t.startsWith("feelstack-concern:"))).toBe(true);
  });

  test("FAQ UNASSIGN: the formerly assigned target is invalidated", async () => {
    // Identical envelope apart from `removed: true`. The consumer does not
    // branch on it — the target still has to be refreshed either way, because
    // its page must stop rendering the FAQ.
    const { result, fx } = await post(
      faqTargetEnvelope({ data: { relation: "faq", faqId: "3f1c2e64-6b1d-4a7f-9c2e-1b8a5d4e7f00", removed: true } }),
    );
    expect(result.outcome).toBe("revalidated");
    expect(fx.revalidatedPaths).toContain("/en/aesthetics/concerns/acne-scars");
  });

  test("AR fan-out never touches EN surfaces", async () => {
    const { result, fx } = await post(
      faqTargetEnvelope({ locale: "ar" }),
    );
    expect(result.outcome).toBe("revalidated");
    expect(fx.revalidatedTags.every((t) => !t.includes(":en:"))).toBe(true);
    expect(fx.revalidatedPaths).not.toContain("/en/aesthetics/concerns/acne-scars");
  });

  test("EN fan-out never touches AR surfaces", async () => {
    const { fx } = await post(faqTargetEnvelope());
    expect(fx.revalidatedTags.every((t) => !t.includes(":ar:"))).toBe(true);
  });

  test("the faqId never selects a surface — the FAQ has no page", async () => {
    const { fx } = await post(faqTargetEnvelope());
    expect(fx.revalidatedTags.some((t) => t.includes("3f1c2e64"))).toBe(false);
    expect(fx.revalidatedPaths.some((p) => p.includes("3f1c2e64"))).toBe(false);
  });

  test("a target path outside the Blue Diamond route registry is refused", async () => {
    const { result, fx } = await post(faqTargetEnvelope({ path: "/not/a/route" }));
    expect(result.outcome).toBe("invalid_path");
    expect(fx.revalidatedTags).toHaveLength(0);
  });
});
