import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Static checks over the deployment layer.
 *
 * A deploy script is the one piece of code whose first real execution happens
 * against production, as root, with traffic depending on it. Everything about
 * it that can be asserted without running it, is asserted here.
 */
const repoRoot = path.resolve(__dirname, "..", "..");
const deployScript = path.join(repoRoot, "ops", "deploy", "deploy-blue-diamond");
const installScript = path.join(repoRoot, "ops", "deploy", "install-blue-diamond-deploy-script");

function read(file: string): string {
  return readFileSync(file, "utf8");
}

test.describe("shell syntax", () => {
  for (const script of [deployScript, installScript]) {
    test(`${path.basename(script)} parses`, () => {
      expect(() => execFileSync("bash", ["-n", script])).not.toThrow();
    });
  }
});

test.describe("Blue/Green slot configuration", () => {
  test("uses the audited loopback ports and nothing else", () => {
    const source = read(deployScript);
    expect(source).toContain('BLUE_PORT="3030"');
    expect(source).toContain('GREEN_PORT="3031"');
    // Ports belonging to other tenants on the shared host must never appear.
    for (const foreign of ["3009", "3011", "3000", "3012", "4005", "4006"]) {
      expect(source, `deploy script must not reference port ${foreign}`).not.toContain(
        `:${foreign}`,
      );
    }
  });

  test("health-checks and verifies over loopback only", () => {
    const source = read(deployScript);
    expect(source).toContain("http://127.0.0.1:${TARGET_PORT}/api/version");
    expect(source).not.toContain("0.0.0.0");
  });

  test("does not reuse another tenant's OS users or paths", () => {
    const source = read(deployScript);
    expect(source).toContain('RUNTIME_USER="blue-diamond"');
    expect(source).toContain("/home/blue-diamond/");
    expect(source).not.toContain("dfeelings");
  });
});

test.describe("release safety", () => {
  test("requires an exact 40-character commit SHA", () => {
    expect(read(deployScript)).toContain("^[0-9a-f]{40}$");
  });

  test("verifies the served SHA matches the release before reporting success", () => {
    const source = read(deployScript);
    expect(source).toContain("verify_served_sha");
    expect(source).toContain(".release-sha");
  });

  test("takes a deployment lock so two releases cannot interleave", () => {
    expect(read(deployScript)).toContain("flock -n 9");
  });

  test("installs an ERR/INT/TERM trap that rolls back", () => {
    const source = read(deployScript);
    expect(source).toContain("trap 'rollback $?' ERR INT TERM");
    expect(source).toContain("ROLLBACK_FINISHED");
  });

  test("retains previous releases so a rollback has something to return to", () => {
    expect(read(deployScript)).toContain("KEEP_RELEASES=3");
  });

  test("rejects an artifact containing links or path escapes", () => {
    const source = read(deployScript);
    expect(source).toContain("Artifact contains an unsafe path.");
    expect(source).toContain("Artifact contains links or unsupported file types.");
  });
});

test.describe("ISR prerender-cache permission grant", () => {
  const source = read(deployScript);

  test("grants write access only to prerender cache artifacts", () => {
    expect(source).toContain("grant_isr_prerender_cache_write");
    // Only .body/.meta files themselves become group-writable.
    expect(source).toContain("-name '*.body' -o -name '*.meta'");
  });

  test("never widens permissions to other users", () => {
    // g+w / g+ws only. A world-writable bit anywhere in a release directory
    // on a shared multi-tenant host would expose it to every other account.
    expect(source).not.toContain("chmod o+w");
    expect(source).not.toContain("chmod 777");
    expect(source).not.toContain("chmod -R 777");
    expect(source).not.toContain("chmod a+w");
  });

  test("leaves compiled code read-only", () => {
    // The grant is scoped to .next/server/app cache artifacts; there is no
    // blanket recursive chmod of the release tree after the base
    // `chmod -R u=rwX,g=rX,o=`.
    expect(source).toContain("chmod -R u=rwX,g=rX,o=");
    expect(source).not.toContain("chmod -R g+w");
  });

  test("runs before the release is made active", () => {
    const grantIndex = source.indexOf("grant_isr_prerender_cache_write\n");
    const activateIndex = source.indexOf('mv -Tf "$NEW_LINK" "$CURRENT_LINK"');
    expect(grantIndex).toBeGreaterThan(-1);
    expect(activateIndex).toBeGreaterThan(-1);
    expect(grantIndex).toBeLessThan(activateIndex);
  });
});

test.describe("privilege boundary", () => {
  test("the sudoers grant is limited to the two deployment commands", () => {
    const sudoers = read(
      path.join(repoRoot, "ops", "deploy", "sudoers.d", "zz-deploy-blue-diamond"),
    );
    const grants = sudoers
      .split("\n")
      .filter((line) => line.trim() && !line.trim().startsWith("#"));

    expect(grants).toHaveLength(2);
    for (const forbidden of ["cp", "tee", "bash", "sh", "ALL)", "*"]) {
      for (const grant of grants) {
        expect(
          grant.includes(` ${forbidden} `),
          `sudoers must not grant ${forbidden}`,
        ).toBe(false);
      }
    }
    // The trailing "" pins the installer to zero arguments.
    expect(sudoers).toContain('install-blue-diamond-deploy-script ""');
  });
});

test.describe("deploy workflow", () => {
  const workflow = read(
    path.join(repoRoot, ".github", "workflows", "deploy-production.yml"),
  );

  test("is manual only — no automatic production deploy yet", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toContain("workflow_run:");
    expect(workflow).not.toMatch(/^\s+push:/m);
  });

  test("verifies the SHA is on main and that CI passed for that exact SHA", () => {
    expect(workflow).toContain("git merge-base --is-ancestor");
    expect(workflow).toContain("head_sha=${RELEASE_SHA}");
    expect(workflow).toContain('CONCLUSION" != "success"');
  });

  test("deploys only through the orchestrator, never by restarting the app directly", () => {
    expect(workflow).toContain("sudo -n /usr/local/sbin/deploy-blue-diamond");
    expect(workflow).not.toContain("systemctl restart");
    expect(workflow).not.toContain("pm2 ");
  });
});
