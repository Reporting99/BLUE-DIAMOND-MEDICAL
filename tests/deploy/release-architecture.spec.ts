import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { readFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * BUILD ONCE, DEPLOY ONCE — the workflow half, asserted as shape.
 *
 * PROPERTIES 1, 2, 3, 7, 8, 12, 13, 14 (see docs/RELEASE_SAFETY.md).
 *
 * These are static assertions over YAML and shell, which is exactly the right
 * strength for them: the defect being prevented is a step reappearing in a
 * file, and the file is the evidence. What they cannot prove is that a real
 * deploy consumes a real artifact — that needs a live run, and
 * docs/RELEASE_SAFETY.md says which properties are in that category.
 */

const CI = readFileSync(".github/workflows/ci.yml", "utf8");
const DEPLOY = readFileSync(".github/workflows/deploy-production.yml", "utf8");
const LINT = readFileSync(".github/workflows/workflow-lint.yml", "utf8");
const PACKAGE_SCRIPT = readFileSync("scripts/package-standalone.sh", "utf8");

/** The step block starting at `name`, up to the next step. */
function stepBlock(workflow: string, name: string): string {
  const start = workflow.indexOf(`- name: ${name}`);
  expect(start, `step "${name}" not found`).toBeGreaterThan(-1);
  const next = workflow.indexOf("- name:", start + 1);
  return workflow.slice(start, next === -1 ? undefined : next);
}

test.describe("PROPERTY 1 — the deploy workflow never builds the application", () => {
  test("no build or install command survives in deploy-production.yml", () => {
    // Comment lines stripped first: this workflow discusses the removed build
    // at length, and prose must not count as a command.
    const commands = DEPLOY.split("\n").filter((l) => !l.trim().startsWith("#"));
    for (const forbidden of ["npm ci", "npm run build", "next build", "npm install", "yarn install", "pnpm install"]) {
      const hit = commands.find((l) => l.includes(forbidden));
      expect(hit, `deploy-production.yml still runs "${forbidden}": ${hit}`).toBeUndefined();
    }
  });

  test("and no setup-node step remains, since nothing there needs a toolchain", () => {
    expect(DEPLOY).not.toContain("actions/setup-node");
  });

  test("the guard script exists, is wired into Workflow Lint, and is its own job", () => {
    expect(LINT).toContain("scripts/assert-no-app-build.sh");
    // A job rather than a step, so the failure reads as "the release
    // architecture regressed" rather than as a shell-lint failure.
    expect(LINT).toMatch(/^ {2}build-once:$/m);
  });

  test("the guard actually fails on a reintroduced build (executed, not pattern-matched)", () => {
    const dir = mkdtempSync(join(tmpdir(), "bd-build-guard-"));

    const reintroduced = join(dir, "reintroduced.yml");
    writeFileSync(reintroduced, "jobs:\n  deploy:\n    steps:\n      - run: npm run build\n");
    expect(
      spawnSync("bash", ["scripts/assert-no-app-build.sh", reintroduced], { encoding: "utf8" }).status,
      "a reintroduced `npm run build` must fail the guard",
    ).not.toBe(0);

    const nextBuild = join(dir, "next-build.yml");
    writeFileSync(nextBuild, "jobs:\n  deploy:\n    steps:\n      - run: npx next build\n");
    expect(spawnSync("bash", ["scripts/assert-no-app-build.sh", nextBuild], { encoding: "utf8" }).status).not.toBe(0);

    const npmCi = join(dir, "npm-ci.yml");
    writeFileSync(npmCi, "jobs:\n  deploy:\n    steps:\n      - run: npm ci\n");
    expect(spawnSync("bash", ["scripts/assert-no-app-build.sh", npmCi], { encoding: "utf8" }).status).not.toBe(0);
  });

  test("the guard does not ban npm outright — tooling and prose still pass", () => {
    const dir = mkdtempSync(join(tmpdir(), "bd-build-guard-ok-"));

    const tooling = join(dir, "tooling.yml");
    writeFileSync(tooling, "jobs:\n  deploy:\n    steps:\n      - run: npm install -g some-cli\n      - run: npx gh-release-tool\n");
    expect(
      spawnSync("bash", ["scripts/assert-no-app-build.sh", tooling], { encoding: "utf8" }).status,
      "installing a distributed CLI tool is not an application build",
    ).toBe(0);

    const prose = join(dir, "prose.yml");
    writeFileSync(prose, "jobs:\n  deploy:\n    steps:\n      # this used to run npm run build, and must not again\n      - run: echo ok\n");
    expect(
      spawnSync("bash", ["scripts/assert-no-app-build.sh", prose], { encoding: "utf8" }).status,
      "a comment describing the removed build must not trip the guard",
    ).toBe(0);
  });

  test("the guard passes against the real deploy workflow today", () => {
    const result = spawnSync("bash", ["scripts/assert-no-app-build.sh"], { encoding: "utf8" });
    expect(result.status, result.stdout + result.stderr).toBe(0);
  });
});

test.describe("PROPERTY 2 — CI produces exactly one deployable artifact per merged SHA", () => {
  test("the release job exists, depends on validation, and runs only for main", () => {
    expect(CI).toMatch(/^ {2}release-artifact:$/m);
    const job = CI.slice(CI.indexOf("  release-artifact:"));
    expect(job).toContain("needs: validate");
    expect(job).toContain("github.event_name == 'push'");
    expect(job).toContain("github.ref == 'refs/heads/main'");
  });

  test("it packages with the SAME script the deploy workflow used to call", () => {
    // One copy of the packaging logic, reused — not a second implementation
    // that can disagree about the artifact's shape.
    expect(CI).toContain("scripts/package-standalone.sh");
    expect(DEPLOY).not.toContain("scripts/package-standalone.sh");
  });

  test("the artifact is named with the full SHA and uploaded with its checksum", () => {
    const upload = stepBlock(CI, "Upload release artifact");
    expect(upload).toContain("name: release-${{ github.sha }}");
    expect(upload).toContain("checksum_path");
    expect(upload).toContain("if-no-files-found: error");
  });

  test("the build runs in the same environment the deploy workflow used to build in", () => {
    const job = CI.slice(CI.indexOf("  release-artifact:"), CI.indexOf("  release-artifact:") + 2000);
    expect(job, "the production environment is where vars.SITE_URL/FEELSTACK_* resolve").toContain("environment: production");
  });

  test("the test build and the release build are deliberately different builds", () => {
    // The validate job must keep building against the reserved test origin —
    // the Playwright suite depends on it — and the release job must not.
    expect(CI).toContain("SITE_URL: https://seo-test.invalid");
    const releaseJob = CI.slice(CI.indexOf("  release-artifact:"));
    expect(releaseJob).not.toContain("seo-test.invalid");
    expect(releaseJob).toContain("SITE_URL: ${{ vars.SITE_URL }}");
  });
});

test.describe("PROPERTY 3 — packaging emits a verifiable checksum sidecar", () => {
  test("the sidecar is written in sha256sum format and self-verified", () => {
    expect(PACKAGE_SCRIPT).toContain('printf \'%s  %s\\n\' "$ARTIFACT_SHA256" "$ARTIFACT_NAME" > "$CHECKSUM_PATH"');
    expect(PACKAGE_SCRIPT).toContain('sha256sum -c "$CHECKSUM_NAME"');
  });

  test("it names the artifact by BARE name, so it verifies after extraction elsewhere", () => {
    // A path would bind the checksum to the producing runner's temp directory
    // and make verification on the deploy side impossible.
    expect(PACKAGE_SCRIPT).not.toContain('"$ARTIFACT_SHA256" "$ARTIFACT_PATH"');
  });

  test("the script refuses a malformed release SHA before doing any work", () => {
    const dir = mkdtempSync(join(tmpdir(), "bd-package-"));
    const result = spawnSync("bash", ["scripts/package-standalone.sh", "not-a-sha", dir], { encoding: "utf8" });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("40-character commit SHA");
  });
});

test.describe("PROPERTIES 7 & 8 — the deploy consumes, and verifies, the CI artifact", () => {
  test("it locates the CI run for the exact SHA and downloads that run's artifact", () => {
    expect(DEPLOY).toContain("head_sha=${RELEASE_SHA}");
    expect(DEPLOY).toContain("gh run download");
    expect(DEPLOY).toContain('--name "release-${RELEASE_SHA}"');
  });

  test("it verifies the checksum before uploading anything to the server", () => {
    const verify = stepBlock(DEPLOY, "Verify the artifact's checksum and SHA identity");
    expect(verify).toContain("sha256sum -c");
    const verifyAt = DEPLOY.indexOf("- name: Verify the artifact's checksum and SHA identity");
    const uploadAt = DEPLOY.indexOf("- name: Upload release artifact and deployment script");
    expect(verifyAt).toBeLessThan(uploadAt);
  });

  test("it verifies the artifact's OWN embedded release SHA, not just the filename", () => {
    const verify = stepBlock(DEPLOY, "Verify the artifact's checksum and SHA identity");
    expect(verify).toContain(".release-sha");
    expect(verify).toContain('"$EMBEDDED_SHA" != "$RELEASE_SHA"');
  });

  test("the existing ancestry and CI-conclusion gates are still in place", () => {
    expect(DEPLOY).toContain("git merge-base --is-ancestor");
    expect(DEPLOY).toContain('CONCLUSION" != "success"');
  });
});

test.describe("PROPERTY 12 — nothing downstream of the artifact changed shape", () => {
  test("the server-side orchestrator is still invoked with the same two arguments", () => {
    expect(DEPLOY).toContain("sudo -n /usr/local/sbin/deploy-blue-diamond");
    expect(DEPLOY).toContain("/home/deploy-blue-diamond/uploads/${ARTIFACT_NAME}");
  });

  test("the artifact still contains exactly what the orchestrator asserts", () => {
    // ops/deploy/deploy-blue-diamond requires server.js, .next/BUILD_ID and
    // .release-sha inside the tarball. The packaging script is the producer of
    // all three, and it is unchanged in that respect.
    const orchestrator = readFileSync("ops/deploy/deploy-blue-diamond", "utf8");
    for (const entry of ["server.js", ".next/BUILD_ID", ".release-sha"]) {
      expect(orchestrator, `orchestrator no longer requires ${entry}`).toContain(entry);
      expect(PACKAGE_SCRIPT, `packaging no longer produces ${entry}`).toContain(entry);
    }
  });

  test("the orchestrator itself builds nothing — it only consumes an artifact", () => {
    const orchestrator = readFileSync("ops/deploy/deploy-blue-diamond", "utf8")
      .split("\n")
      .filter((l) => !l.trim().startsWith("#"));
    for (const forbidden of ["npm ci", "npm install", "next build", "npm run build"]) {
      expect(orchestrator.find((l) => l.includes(forbidden))).toBeUndefined();
    }
  });
});

test.describe("PROPERTY 13 — /api/version reports the artifact's own release identity", () => {
  /**
   * MECHANISM-TESTED. Whether the DEPLOYED process answers with the deployed
   * SHA can only be proven by a real deploy. What is provable here is that the
   * mechanism is wired to the right source — the `.release-sha` the packaging
   * script writes into the artifact — rather than to a build-time constant, an
   * env var, or anything else that could report a SHA nobody shipped.
   */
  test("the route reads .release-sha from the running release directory", () => {
    const route = readFileSync("src/app/api/version/route.ts", "utf8");
    expect(route).toContain('readFileSync(path.join(process.cwd(), ".release-sha"), "utf8")');
    expect(route).toMatch(/\^\[0-9a-f\]\{40\}\$/);
    // Unreadable must be 503, not a 200 with null: a process that cannot prove
    // what it is has to be unhealthy, or the deploy check passes on nothing.
    expect(route).toContain("status: sha ? 200 : 503");
  });

  test("and the packaging script is what puts that file there, from the requested SHA", () => {
    expect(PACKAGE_SCRIPT).toContain('printf \'%s\\n\' "$RELEASE_SHA" > "$RELEASE_DIR/.release-sha"');
    expect(PACKAGE_SCRIPT).toContain('"$EXTRACTED_SHA" != "$RELEASE_SHA"');
  });

  test("the deploy re-checks the served SHA from outside the server", () => {
    const verify = stepBlock(DEPLOY, "Verify the serving slot reports this SHA");
    expect(verify).toContain("/api/version");
    expect(verify).toContain('"$SERVED" != "$RELEASE_SHA"');
  });
});

test.describe("PROPERTY 14 — the content drift gate runs before the expensive suite", () => {
  test("it is a CI step, ordered before Playwright", () => {
    const gateAt = CI.indexOf("- name: Content drift gate");
    const playwrightAt = CI.indexOf("- name: Install Playwright browsers");
    expect(gateAt, "content drift gate step not found").toBeGreaterThan(-1);
    expect(gateAt).toBeLessThan(playwrightAt);
  });

  test("an unreachable CMS does not fail the job, but drift does", () => {
    const gate = stepBlock(CI, "Content drift gate");
    // Exit 3 is "could not reach the CMS", exit 1 is "the content is wrong".
    // A hermetic suite must never go red because the CMS had a bad afternoon.
    expect(gate).toContain("3) echo \"::warning::content drift gate could not reach the CMS");
    expect(gate).toContain('*) echo "::error::content drift gate failed."; exit "$status" ;;');
  });
});
