import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { verifyHmacSignature } from "@/lib/security/hmac";

/**
 * PROPERTY 11 — a write that cannot be made visible must not run.
 *
 * Two defects, both silent by construction, both closed here:
 *
 *  1. Missing revalidation configuration logged a warning and returned
 *     success, so an apply could change 70 published values, invalidate
 *     nothing, and exit 0 while every page kept serving the old text.
 *
 *  2. The request it sent could never have worked. It used an
 *     `x-feelstack-secret` header and a `{ projectId, path }` body; the
 *     endpoint has only ever accepted an HMAC signature over
 *     `${timestamp}.${rawBody}` plus the canonical FeelStack envelope. Every
 *     call was rejected 401 before the body was parsed — and the result was
 *     never checked, so fire-and-forget hid a request that could not succeed.
 */

const TOOL = readFileSync("scripts/feelstack-republish.mjs", "utf8");

/**
 * The same file with comment lines removed. The tool documents the defect it
 * replaced in detail — including the header it used to send — and naming a
 * wrong header in prose is not sending it.
 */
const TOOL_CODE = TOOL.split("\n")
  .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
  .join("\n");

test.describe("apply refuses to start without revalidation configuration", () => {
  test("the precondition exists and covers all three variables", () => {
    expect(TOOL).toContain("REVALIDATION_REQUIRED");
    for (const name of ["FEELSTACK_REVALIDATE_SECRET", "SITE_URL", "FEELSTACK_PROJECT_ID"]) {
      expect(TOOL, `${name} is not a precondition for a write mode`).toContain(name);
    }
  });

  test("it is checked BEFORE the first write, not after the last one", () => {
    // Found at step 1 the missing variable has cost nothing; found after the
    // PATCHes it has cost a half-published release.
    const preconditionAt = TOOL.indexOf("const REVALIDATION_REQUIRED");
    const applyAt = TOOL.indexOf("async function applyOne");
    const mainAt = TOOL.indexOf("await login();");
    expect(preconditionAt).toBeGreaterThan(-1);
    expect(preconditionAt).toBeLessThan(mainAt);
    expect(applyAt).toBeGreaterThan(-1);
  });

  test("executed: apply exits non-zero when the revalidation secret is absent", () => {
    const result = spawnSync("node", ["scripts/feelstack-republish.mjs", "--mode=apply", "--only=OP-064"], {
      encoding: "utf8",
      env: {
        ...process.env,
        FEELSTACK_API_URL: "https://cms.invalid/api",
        FEELSTACK_SITE_KEY: "blue-diamond-medical",
        FEELSTACK_ADMIN_PROJECT_ID: "00000000-0000-4000-8000-000000000000",
        FEELSTACK_ADMIN_USERNAME: "u",
        FEELSTACK_ADMIN_PASSWORD: "p",
        FEELSTACK_REVALIDATE_SECRET: "",
        SITE_URL: "",
        NEXT_PUBLIC_SITE_URL: "",
        FEELSTACK_PROJECT_ID: "",
      },
    });
    expect(result.status, "an apply that cannot revalidate must refuse to run").not.toBe(0);
    expect(result.stderr).toContain("Missing revalidation configuration");
    expect(result.stderr, "it must say what goes wrong, not just that something does").toContain("old text");
  });

  test("dry-run is unaffected — it writes nothing, so there is nothing to purge", () => {
    // Requiring revalidation config for a read-only mode would make the safe
    // mode the hard one to run, which is how people stop running it.
    const result = spawnSync("node", ["scripts/feelstack-republish.mjs", "--mode=dry-run", "--only=OP-064"], {
      encoding: "utf8",
      env: { ...process.env, FEELSTACK_API_URL: "https://cms.invalid/api", FEELSTACK_SITE_KEY: "k", FEELSTACK_REVALIDATE_SECRET: "", SITE_URL: "" },
    });
    expect(result.stderr).not.toContain("Missing revalidation configuration");
  });
});

test.describe("the revalidation request is one the endpoint can actually accept", () => {
  test("it signs, rather than sending a bare secret header", () => {
    expect(TOOL_CODE, "the endpoint has never accepted this header").not.toContain("x-feelstack-secret");
    expect(TOOL).toContain("x-feelstack-signature");
    expect(TOOL).toContain("x-feelstack-timestamp");
    expect(TOOL).toContain('sha256=${signature}');
  });

  test("the signature covers the exact bytes transmitted", () => {
    // Re-stringifying the object for the body would be a second serialisation
    // that is only incidentally identical to the signed one.
    expect(TOOL).toContain("rawBody");
    expect(TOOL).toContain('`${timestamp}.${rawBody}`');
  });

  test("the scheme the tool implements verifies against the app's own verifier", () => {
    // Reproduces the tool's construction and checks it with the real
    // src/lib/security/hmac.ts, so the two cannot drift apart.
    const secret = "test-secret-value";
    const rawBody = JSON.stringify({ id: "x", type: "content.page.published" });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = `sha256=${createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex")}`;
    expect(verifyHmacSignature({ payload: rawBody, timestamp, signature, secret })).toBe(true);
    expect(verifyHmacSignature({ payload: `${rawBody} `, timestamp, signature, secret })).toBe(false);
  });

  test("the timestamp is in SECONDS — the endpoint rejects anything but ten digits", () => {
    expect(TOOL).toContain("Math.floor(Date.now() / 1000)");
  });
});

test.describe("the response is verified, not assumed", () => {
  test("a 200 carrying revalidated:false is treated as a failure", () => {
    // The endpoint answers 200 with revalidated:false for events it understood
    // and deliberately ignored. For this tool that means the page was NOT
    // purged, and calling it success is the original defect in a new place.
    expect(TOOL).toContain("body?.revalidated === true");
  });

  test("a failed revalidation marks the release incomplete and fails the run", () => {
    expect(TOOL).toContain("REVALIDATE_FAILED");
    expect(TOOL).toContain("RELEASE INCOMPLETE");
    expect(TOOL).toContain('r.status === "REVALIDATE_FAILED"');
  });

  test("revalidation is per-route and targeted, never a global purge", () => {
    expect(TOOL).toContain("for (const path of routes)");
    expect(TOOL).not.toMatch(/purge[-_ ]?all|revalidate=\*|\/purge\b/i);
  });

  test("SITE_URL wins over the NEXT_PUBLIC_ alias, matching the rest of the app", () => {
    expect(TOOL).toContain("process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL");
  });
});
