import { test, expect } from "@playwright/test";
import { createHmac } from "node:crypto";
import {
  processRevalidationRequest,
  decodeAndNormalizePath,
  __resetReplayGuardForTests,
  MAX_WEBHOOK_BODY_BYTES,
} from "../../src/lib/feelstack/webhook-handler";

/**
 * Webhook security tests — brief §9 + §18 "Webhook security": valid
 * signature accepted, invalid signature rejected, expired timestamp
 * rejected, replay rejected, encoded-path attacks rejected, oversized
 * body rejected, unsupported event rejected, no secret appears in logs.
 */

const SECRET = "test-only-fixture-secret-never-a-real-credential";

function sign(payload: string, timestamp: string, secret = SECRET): string {
  return createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
}

function noopEffects() {
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

test.describe("Webhook: not configured", () => {
  test("501s when no secret is configured, regardless of payload", async () => {
    const result = await processRevalidationRequest(
      {
        secret: undefined,
        contentType: "application/json",
        contentLength: 10,
        signature: "whatever",
        timestamp: String(Math.floor(Date.now() / 1000)),
        rawBody: "{}",
      },
      noopEffects(),
    );
    expect(result.status).toBe(501);
  });
});

test.describe("Webhook: signature verification", () => {
  test("valid signature + legacy {path} body is accepted", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({ path: "/en/about" });
    const signature = sign(body, timestamp);
    const result = await processRevalidationRequest(
      { secret: SECRET, contentType: "application/json", contentLength: body.length, signature, timestamp, rawBody: body },
      noopEffects(),
    );
    expect(result.status).toBe(200);
    expect(result.body.revalidated).toBe(true);
  });

  test("invalid signature is rejected with 401", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({ path: "/en/about" });
    const result = await processRevalidationRequest(
      {
        secret: SECRET,
        contentType: "application/json",
        contentLength: body.length,
        signature: "0".repeat(64),
        timestamp,
        rawBody: body,
      },
      noopEffects(),
    );
    expect(result.status).toBe(401);
  });

  test("signature computed with the wrong secret is rejected", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({ path: "/en/about" });
    const signature = sign(body, timestamp, "wrong-secret");
    const result = await processRevalidationRequest(
      { secret: SECRET, contentType: "application/json", contentLength: body.length, signature, timestamp, rawBody: body },
      noopEffects(),
    );
    expect(result.status).toBe(401);
  });

  test("expired timestamp (>5 minutes old) is rejected", async () => {
    const staleTimestamp = String(Math.floor(Date.now() / 1000) - 6 * 60);
    const body = JSON.stringify({ path: "/en/about" });
    const signature = sign(body, staleTimestamp);
    const result = await processRevalidationRequest(
      {
        secret: SECRET,
        contentType: "application/json",
        contentLength: body.length,
        signature,
        timestamp: staleTimestamp,
        rawBody: body,
      },
      noopEffects(),
    );
    expect(result.status).toBe(401);
  });

  test("missing signature/timestamp headers is rejected", async () => {
    const body = JSON.stringify({ path: "/en/about" });
    const result = await processRevalidationRequest(
      { secret: SECRET, contentType: "application/json", contentLength: body.length, signature: null, timestamp: null, rawBody: body },
      noopEffects(),
    );
    expect(result.status).toBe(401);
  });
});

test.describe("Webhook: replay protection", () => {
  test("the same valid request replayed a second time is rejected", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({ path: "/en/about" });
    const signature = sign(body, timestamp);
    const input = { secret: SECRET, contentType: "application/json", contentLength: body.length, signature, timestamp, rawBody: body };

    const first = await processRevalidationRequest(input, noopEffects());
    expect(first.status).toBe(200);

    const second = await processRevalidationRequest(input, noopEffects());
    expect(second.status).toBe(401);
  });
});

test.describe("Webhook: path decoding / normalization", () => {
  test("single-encoded traversal is rejected", () => {
    expect(decodeAndNormalizePath("/en/%2e%2e/%2e%2e/etc/passwd")).toBeNull();
  });
  test("double-encoded traversal is rejected", () => {
    expect(decodeAndNormalizePath("/en/%252e%252e/%252e%252e/secret")).toBeNull();
  });
  test("triple-encoded traversal is rejected", () => {
    expect(decodeAndNormalizePath("/en/%25252e%25252e/x")).toBeNull();
  });
  test("a normal, unencoded path decodes to itself", () => {
    expect(decodeAndNormalizePath("/en/about")).toBe("/en/about");
  });
  test("trailing slashes are normalized away", () => {
    expect(decodeAndNormalizePath("/en/about///")).toBe("/en/about");
  });
  test("a path not on the allowlist is rejected end-to-end even with a valid signature", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({ path: "/en/not-a-real-route" });
    const signature = sign(body, timestamp);
    const result = await processRevalidationRequest(
      { secret: SECRET, contentType: "application/json", contentLength: body.length, signature, timestamp, rawBody: body },
      noopEffects(),
    );
    expect(result.status).toBe(400);
  });
});

test.describe("Webhook: body limits and content type", () => {
  test("oversized body is rejected (Content-Length header)", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = "x";
    const signature = sign(body, timestamp);
    const result = await processRevalidationRequest(
      {
        secret: SECRET,
        contentType: "application/json",
        contentLength: MAX_WEBHOOK_BODY_BYTES + 1,
        signature,
        timestamp,
        rawBody: body,
      },
      noopEffects(),
    );
    expect(result.status).toBe(413);
  });

  test("oversized actual body is rejected even if Content-Length lies", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({ path: "/en/about", padding: "a".repeat(MAX_WEBHOOK_BODY_BYTES) });
    const signature = sign(body, timestamp);
    const result = await processRevalidationRequest(
      { secret: SECRET, contentType: "application/json", contentLength: 10, signature, timestamp, rawBody: body },
      noopEffects(),
    );
    expect(result.status).toBe(413);
  });

  test("non-JSON content type is rejected", async () => {
    const result = await processRevalidationRequest(
      {
        secret: SECRET,
        contentType: "text/plain",
        contentLength: 2,
        signature: "sig",
        timestamp: String(Math.floor(Date.now() / 1000)),
        rawBody: "{}",
      },
      noopEffects(),
    );
    expect(result.status).toBe(415);
  });
});

test.describe("Webhook: event validation", () => {
  test("unsupported event name is rejected", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({ event: "not-a-real-event", siteKey: "blue-diamond-medical" });
    const signature = sign(body, timestamp);
    const result = await processRevalidationRequest(
      { secret: SECRET, contentType: "application/json", contentLength: body.length, signature, timestamp, rawBody: body },
      noopEffects(),
    );
    expect(result.status).toBe(400);
  });

  test("unknown site key is rejected", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({ event: "navigation.updated", siteKey: "some-other-tenant" });
    const signature = sign(body, timestamp);
    const result = await processRevalidationRequest(
      { secret: SECRET, contentType: "application/json", contentLength: body.length, signature, timestamp, rawBody: body },
      noopEffects(),
    );
    expect(result.status).toBe(400);
  });

  test("a valid structured event invalidates the expected tags", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = JSON.stringify({
      event: "medical-service.updated",
      siteKey: "blue-diamond-medical",
      locale: "en",
      entityId: "eye-screening",
    });
    const signature = sign(body, timestamp);
    const effects = noopEffects();
    const result = await processRevalidationRequest(
      { secret: SECRET, contentType: "application/json", contentLength: body.length, signature, timestamp, rawBody: body },
      effects,
    );
    expect(result.status).toBe(200);
    expect(effects.revalidatedTags.length).toBeGreaterThan(0);
  });

  test("malformed JSON body is rejected with 400", async () => {
    const timestamp = String(Math.floor(Date.now() / 1000));
    const body = "{not valid json";
    const signature = sign(body, timestamp);
    const result = await processRevalidationRequest(
      { secret: SECRET, contentType: "application/json", contentLength: body.length, signature, timestamp, rawBody: body },
      noopEffects(),
    );
    expect(result.status).toBe(400);
  });
});

test.describe("Webhook: no secret in logs", () => {
  test("a rejected request never logs the configured secret or the signature value", async () => {
    const logs: string[] = [];
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    };
    try {
      await processRevalidationRequest(
        {
          secret: SECRET,
          contentType: "application/json",
          contentLength: 2,
          signature: "deadbeef",
          timestamp: String(Math.floor(Date.now() / 1000)),
          rawBody: "{}",
        },
        noopEffects(),
      );
    } finally {
      console.warn = originalWarn;
    }
    for (const line of logs) {
      expect(line).not.toContain(SECRET);
      expect(line).not.toContain("deadbeef");
    }
  });
});
