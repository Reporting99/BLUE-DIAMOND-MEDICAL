import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { readFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sitemap from "../../src/app/sitemap";
import { SEO_TEST_ORIGIN } from "../support/seo-test-origin";

/**
 * Regression test for the sitemap cold-start defect.
 *
 * The bug was never "the sitemap gate is wrong" — tests/unit/prelaunch-guard.spec.ts
 * already proves isIndexingEnabled()/sitemap() behave correctly for whatever
 * env they are given. The bug was that deploy-production.yml's build step
 * gave `next build` NO indexing env at all, so src/app/sitemap.ts — now a
 * time-based ISR route (`revalidate = 1800`) — took its FIRST snapshot with
 * isIndexingEnabled() === false and cached an empty array for up to 30
 * minutes after every deploy. This proves the actual condition that broke:
 * indexing state being available at the point the sitemap route runs, AND
 * that the workflow which builds the deployed artifact now supplies it.
 */

const WORKFLOW = ".github/workflows/deploy-production.yml";

function withEnv<T>(vars: Record<string, string | undefined>, run: () => T): T {
  const previous = Object.fromEntries(Object.keys(vars).map((k) => [k, process.env[k]]));
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return run();
  } finally {
    for (const [k, v] of Object.entries(previous)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

test.describe("REGRESSION: production build must supply indexing env for the sitemap ISR route", () => {
  test("reproduces the defect at the code level: no indexing env at render time bakes an empty sitemap", async () => {
    const entries = await withEnv(
      { SITE_LAUNCHED: undefined, INDEXING_ENABLED: undefined, SITE_URL: undefined, NEXT_PUBLIC_SITE_URL: undefined },
      () => sitemap(),
    );
    // This is exactly what shipped: a build with none of these set produces
    // 0 URLs. Left uncaught, that value is what an ISR cache would freeze in
    // for 1800 seconds after every deploy.
    expect(entries).toEqual([]);
  });

  test("with the production-equivalent build env, the sitemap is NOT empty", async () => {
    const entries = await withEnv(
      { SITE_LAUNCHED: undefined, INDEXING_ENABLED: "true", SITE_URL: SEO_TEST_ORIGIN, NEXT_PUBLIC_SITE_URL: undefined },
      () => sitemap(),
    );
    expect(entries.length).toBeGreaterThan(0);
  });

  test("revalidate is still time-based 1800s (this fix must not reintroduce force-dynamic)", () => {
    const source = readFileSync("src/app/sitemap.ts", "utf8");
    expect(source).toMatch(/export const revalidate = 1800;/);
    expect(source).not.toMatch(/force-dynamic/);
  });

  test("deploy-production.yml's build step supplies SITE_URL and INDEXING_ENABLED from repo/environment vars", () => {
    const workflow = readFileSync(WORKFLOW, "utf8");
    const buildStepStart = workflow.indexOf("- name: Build production application");
    expect(buildStepStart, "Build production application step not found").toBeGreaterThan(-1);
    const nextStepStart = workflow.indexOf("- name:", buildStepStart + 1);
    const buildStep = workflow.slice(buildStepStart, nextStepStart === -1 ? undefined : nextStepStart);

    expect(buildStep).toContain("SITE_URL: ${{ vars.SITE_URL }}");
    expect(buildStep).toContain("INDEXING_ENABLED: ${{ vars.INDEXING_ENABLED }}");
    // Must NOT be hard-coded literals — these come from the environment's own
    // configuration, never a domain baked into the workflow file.
    expect(buildStep).not.toMatch(/SITE_URL:\s*https?:\/\//);
  });

  test("a dedicated verification step fails the build closed when either value is missing", () => {
    const workflow = readFileSync(WORKFLOW, "utf8");
    const stepStart = workflow.indexOf("- name: Verify build-time indexing configuration");
    expect(stepStart, "indexing verification step not found").toBeGreaterThan(-1);
    const nextStepStart = workflow.indexOf("- name:", stepStart + 1);
    const step = workflow.slice(stepStart, nextStepStart === -1 ? undefined : nextStepStart);
    expect(step).toContain("exit 1");
    // It must run BEFORE the build step, or a failure here cannot stop the build.
    const buildStepStart = workflow.indexOf("- name: Build production application");
    expect(stepStart).toBeLessThan(buildStepStart);
  });

  test("the verification step's own bash logic actually fails closed (executed, not just pattern-matched)", () => {
    const workflow = readFileSync(WORKFLOW, "utf8");
    const stepStart = workflow.indexOf("- name: Verify build-time indexing configuration");
    const runStart = workflow.indexOf("run: |", stepStart);
    const nextStepStart = workflow.indexOf("- name:", stepStart + 1);
    const runBlock = workflow.slice(runStart + "run: |".length, nextStepStart);
    // De-indent the YAML block scalar (each line loses its leading 10 spaces).
    const script = runBlock
      .split("\n")
      .map((l) => l.replace(/^ {10}/, ""))
      .join("\n");

    const dir = mkdtempSync(join(tmpdir(), "bd-indexing-verify-"));
    const scriptPath = join(dir, "verify.sh");
    writeFileSync(scriptPath, `#!/usr/bin/env bash\n${script}\n`);

    const missing = spawnSync("bash", [scriptPath], {
      encoding: "utf8",
      env: { ...process.env, SITE_URL: "", INDEXING_ENABLED: "" },
    });
    expect(missing.status).not.toBe(0);

    const wrongScheme = spawnSync("bash", [scriptPath], {
      encoding: "utf8",
      env: { ...process.env, SITE_URL: "http://bluediamondmedical.ca", INDEXING_ENABLED: "true" },
    });
    expect(wrongScheme.status).not.toBe(0);

    const good = spawnSync("bash", [scriptPath], {
      encoding: "utf8",
      env: { ...process.env, SITE_URL: "https://bluediamondmedical.ca", INDEXING_ENABLED: "true" },
    });
    expect(good.status).toBe(0);
  });
});
