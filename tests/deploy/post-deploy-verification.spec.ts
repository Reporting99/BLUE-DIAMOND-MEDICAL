import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Post-deploy verification contract.
 *
 * Release 079b4a7 deployed successfully -- green served the right SHA, /en and
 * /ar both 200 -- and the workflow still went red, because the verification
 * step read /home/blue-diamond/deployments/active-release.env to learn the
 * port. That file is deliberately root:blue-diamond 0640 and the deploy user
 * is deliberately not in the runtime group, so the read failed with
 * "Permission denied".
 *
 * The fix is to stop reading it, not to widen the permissions. These tests pin
 * that: the deploy script's own stdout is the trusted channel, and it is parsed
 * strictly enough that a contradictory or malformed answer fails closed.
 */

const WORKFLOW = ".github/workflows/deploy-production.yml";
const PARSER = "scripts/parse-deploy-output.sh";
const DEPLOY_SCRIPT = "ops/deploy/deploy-blue-diamond";
const SHA = "079b4a7f6b351191a18d7b3b9cbf33ba02c11506";
const OTHER_SHA = "b30046d2802212dc170fe55f13c7630a1406e08c";

function read(p: string) {
  return readFileSync(p, "utf8");
}

/** Runs the parser against a synthetic deploy stdout. */
function parse(stdout: string, requested = SHA) {
  const dir = mkdtempSync(join(tmpdir(), "bd-parse-"));
  try {
    const file = join(dir, "stdout.txt");
    writeFileSync(file, stdout);
    return spawnSync("bash", [PARSER, file, requested], { encoding: "utf8" });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const GOOD = [
  "DEPLOYMENT_SUCCESS",
  "ACTIVE_SLOT=green",
  "ACTIVE_PORT=3031",
  `RELEASE_SHA=${SHA}`,
  "",
].join("\n");

test.describe("verification never touches the protected state file", () => {
  test("the workflow does not read active-release.env", () => {
    const source = read(WORKFLOW);
    // A comment explaining why may mention it; an actual read must not exist.
    const code = source
      .split("\n")
      .filter((l) => !/^\s*#/.test(l.trim()))
      .join("\n");
    expect(code).not.toMatch(/sed[^\n]*active-release\.env/);
    expect(code).not.toMatch(/cat[^\n]*active-release\.env/);
    expect(code).not.toMatch(/grep[^\n]*active-release\.env/);
  });

  test("the workflow takes the port from the deploy step output", () => {
    const source = read(WORKFLOW);
    expect(source).toMatch(/steps\.deploy\.outputs\.active_port/);
    expect(source).toMatch(/- name: Deploy release\n\s+id: deploy/);
  });

  test("the deploy script still writes the state file root-owned and 0640", () => {
    const source = read(DEPLOY_SCRIPT);
    // Nothing in this change may loosen the file or the group.
    expect(source).not.toMatch(/chmod\s+0?6[67][0-7]\s+.*active-release/);
    expect(source).not.toMatch(/chmod\s+0?7[0-7][0-7]\s+.*active-release/);
    expect(source).not.toMatch(/usermod[^\n]*deploy-blue-diamond/);
    expect(source).not.toMatch(/gpasswd[^\n]*deploy-blue-diamond/);
  });

  test("no step adds the deploy user to the runtime group", () => {
    const source = read(WORKFLOW);
    expect(source).not.toMatch(/usermod|gpasswd|adduser .* blue-diamond/);
  });
});

test.describe("deploy output contract: strict parsing", () => {
  test("a well-formed deploy output yields validated values", () => {
    const r = parse(GOOD);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("active_port=3031");
    expect(r.stdout).toContain("active_slot=green");
    expect(r.stdout).toContain(`release_sha=${SHA}`);
  });

  test("blue on 3030 is equally valid", () => {
    const r = parse(
      ["DEPLOYMENT_SUCCESS", "ACTIVE_SLOT=blue", "ACTIVE_PORT=3030", `RELEASE_SHA=${SHA}`, ""].join("\n"),
    );
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("active_port=3030");
  });

  const rejections: Array<[string, string]> = [
    ["empty output", ""],
    ["missing ACTIVE_PORT", `DEPLOYMENT_SUCCESS\nACTIVE_SLOT=green\nRELEASE_SHA=${SHA}\n`],
    ["missing RELEASE_SHA", "DEPLOYMENT_SUCCESS\nACTIVE_SLOT=green\nACTIVE_PORT=3031\n"],
    ["missing ACTIVE_SLOT", `DEPLOYMENT_SUCCESS\nACTIVE_PORT=3031\nRELEASE_SHA=${SHA}\n`],
    ["missing DEPLOYMENT_SUCCESS", `ACTIVE_SLOT=green\nACTIVE_PORT=3031\nRELEASE_SHA=${SHA}\n`],
    [
      "duplicated ACTIVE_PORT",
      `DEPLOYMENT_SUCCESS\nACTIVE_SLOT=green\nACTIVE_PORT=3031\nACTIVE_PORT=3030\nRELEASE_SHA=${SHA}\n`,
    ],
    [
      "duplicated RELEASE_SHA",
      `DEPLOYMENT_SUCCESS\nACTIVE_SLOT=green\nACTIVE_PORT=3031\nRELEASE_SHA=${SHA}\nRELEASE_SHA=${OTHER_SHA}\n`,
    ],
    ["port out of range", `DEPLOYMENT_SUCCESS\nACTIVE_SLOT=green\nACTIVE_PORT=8080\nRELEASE_SHA=${SHA}\n`],
    ["non-numeric port", `DEPLOYMENT_SUCCESS\nACTIVE_SLOT=green\nACTIVE_PORT=abc\nRELEASE_SHA=${SHA}\n`],
    ["malformed sha", "DEPLOYMENT_SUCCESS\nACTIVE_SLOT=green\nACTIVE_PORT=3031\nRELEASE_SHA=not-a-sha\n"],
    [
      "short sha",
      "DEPLOYMENT_SUCCESS\nACTIVE_SLOT=green\nACTIVE_PORT=3031\nRELEASE_SHA=079b4a7\n",
    ],
    ["unknown slot", `DEPLOYMENT_SUCCESS\nACTIVE_SLOT=purple\nACTIVE_PORT=3031\nRELEASE_SHA=${SHA}\n`],
    [
      "slot and port disagree",
      `DEPLOYMENT_SUCCESS\nACTIVE_SLOT=blue\nACTIVE_PORT=3031\nRELEASE_SHA=${SHA}\n`,
    ],
  ];

  for (const [label, stdout] of rejections) {
    test(`fails closed: ${label}`, () => {
      const r = parse(stdout);
      expect(r.status).not.toBe(0);
      expect(r.stdout).not.toContain("active_port=");
    });
  }

  test("a SHA that differs from the requested one is rejected", () => {
    const r = parse(GOOD, OTHER_SHA);
    expect(r.status).not.toBe(0);
    expect(r.stderr).toMatch(/but .* was requested/);
  });

  test("a value mentioned mid-sentence is not mistaken for a declaration", () => {
    const r = parse(
      [
        "note: previously ACTIVE_PORT=3030 was serving",
        "DEPLOYMENT_SUCCESS",
        "ACTIVE_SLOT=green",
        "ACTIVE_PORT=3031",
        `RELEASE_SHA=${SHA}`,
        "",
      ].join("\n"),
    );
    // The prose line is not anchored at column 0 as KEY=..., so it is ignored.
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("active_port=3031");
  });
});

test.describe("deploy exit status is never masked", () => {
  test("the deploy command is not piped", () => {
    const source = read(WORKFLOW);
    const deployStep = source.slice(source.indexOf("- name: Deploy release"));
    const block = deployStep.slice(0, deployStep.indexOf("- name: Verify"));
    // Redirected to a file and the status captured, never `| tee` or `| tail`.
    expect(block).toMatch(/> "\$DEPLOY_LOG" 2>&1/);
    expect(block).toMatch(/DEPLOY_STATUS=\$\?/);
    expect(block).not.toMatch(/deploy-blue-diamond[^\n]*\|\s*(tee|tail|head)/);
  });

  test("a non-zero deploy exit is re-raised with its own code", () => {
    const source = read(WORKFLOW);
    expect(source).toMatch(/exit "\$DEPLOY_STATUS"/);
  });

  test("no validation script pipes its command into tail", () => {
    for (const f of ["scripts/run-playwright.sh", "scripts/package-standalone.sh", PARSER]) {
      const source = read(f);
      expect(source, f).not.toMatch(/^[^#\n]*\|\s*tail/m);
    }
  });
});

test.describe("verification asserts the full contract", () => {
  const source = read(WORKFLOW);

  test("requires HTTP 200 from /api/version, /en and /ar", () => {
    expect(source).toMatch(/for path in \/api\/version \/en \/ar/);
    expect(source).toMatch(/expected 200/);
  });

  test("requires the served SHA to equal the requested SHA", () => {
    expect(source).toMatch(/if \[ "\$SERVED" != "\$RELEASE_SHA" \]/);
  });

  test("rejects a port the deploy step did not validate", () => {
    expect(source).toMatch(/3030\|3031\) ;;/);
  });

  test("prints no credentials or environment files", () => {
    const verify = source
      .slice(source.indexOf("- name: Verify the serving slot"))
      .split("- name: Remove SSH material")[0];
    // `ssh -i "$HOME/.ssh/id_ed25519"` USES the key as an identity; that is not
    // printing it. What must not happen is emitting a secret or reading a
    // production environment file, so assert on the emitting commands.
    const emitting = verify
      .split("\n")
      .filter((l) => /\b(echo|cat|printf|sed -n|grep)\b/.test(l));
    for (const line of emitting) {
      expect(line).not.toMatch(/id_ed25519|known_hosts|SECRET|TOKEN|PRIVATE_KEY/);
      expect(line).not.toMatch(/\.env\b/);
    }
  });
});

test.describe("intentional standby stop ends inactive, not failed", () => {
  const source = read(DEPLOY_SCRIPT);

  test("reset-failed is applied after a deliberate stop", () => {
    expect(source).toMatch(/systemctl reset-failed "\$PREVIOUS_SERVICE"/);
    expect(source).toMatch(/PREVIOUS_SLOT_STOPPED/);
  });

  test("only a clean stop or SIGTERM (143) is cleared", () => {
    expect(source).toMatch(/143\|0\)/);
    expect(source).toMatch(/not clearing/);
  });

  test("the stop must have taken effect before failure state is cleared", () => {
    expect(source).toMatch(/is still active after an explicit stop/);
  });

  test("the final state must not be failed", () => {
    expect(source).toMatch(/is still marked failed after reset/);
  });

  test("reset-failed never runs inside the rollback path", () => {
    const rollback = source.slice(source.indexOf("rollback() {"));
    const body = rollback.slice(0, rollback.indexOf("\n}\n"));
    expect(body).not.toContain("reset-failed");
  });

  test("a genuine target-slot failure is still surfaced", () => {
    // The target slot's own start/health checks are untouched by this change.
    expect(source).toMatch(/TARGET_STARTED/);
    expect(source).toMatch(/verify_served_sha/);
  });

  test("the rollback release and current symlink are preserved", () => {
    expect(source).toMatch(/KEEP_RELEASES=3/);
    expect(source).toMatch(/ROLLBACK_FINISHED/);
  });

  test("both slots are not kept running merely to look healthy", () => {
    // Pre-domain, exactly one slot serves: the previous one is stopped, and
    // the stop is verified to have taken effect rather than assumed.
    expect(source).toMatch(/PREVIOUS_SERVICE="\$\{APP_NAME\}@\$\{ACTIVE_SLOT\}\.service"/);
    expect(source).toMatch(/systemctl stop "\$PREVIOUS_SERVICE"/);
    expect(source).toMatch(/if systemctl is-active --quiet "\$PREVIOUS_SERVICE"/);
  });
});
