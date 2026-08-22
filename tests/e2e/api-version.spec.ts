import { test, expect } from "@playwright/test";

/**
 * /api/version is the contract the deployment relies on to prove that the
 * release it just installed is the release actually being served. Its shape
 * is therefore load-bearing, and so is what it refuses to expose: it is a
 * public, unauthenticated endpoint.
 */
test.describe("/api/version", () => {
  test("returns only a sha field, and never leaks environment data", async ({ request }) => {
    const response = await request.get("/api/version");

    // 200 with a real SHA in a deployed release; 503 in a dev/test build
    // where no .release-sha exists. Both are correct — the endpoint must
    // never invent an identity it cannot prove.
    expect([200, 503]).toContain(response.status());

    const body = await response.json();
    expect(Object.keys(body)).toEqual(["sha"]);
    expect(body.sha === null || /^[0-9a-f]{40}$/.test(body.sha)).toBe(true);

    const raw = JSON.stringify(body);
    for (const leak of [
      "FEELSTACK",
      "SECRET",
      "TOKEN",
      "PASSWORD",
      "DATABASE",
      "IMAGEKIT",
      "NODE_ENV",
      "process.env",
    ]) {
      expect(raw.toUpperCase()).not.toContain(leak);
    }
  });

  test("is never cached, so it cannot outlive the release it describes", async ({ request }) => {
    const response = await request.get("/api/version");
    expect(response.headers()["cache-control"]).toContain("no-store");
  });
});
