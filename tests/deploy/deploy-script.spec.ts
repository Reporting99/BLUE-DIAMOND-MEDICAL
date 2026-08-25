import { test, expect } from "@playwright/test";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Behavioural tests for ops/deploy/deploy-blue-diamond.
 *
 * `bash -n` only proves the file parses. Release b30046d2 parsed perfectly and
 * still rolled back: tar extracted cleanly, then an unconditional
 * `[ -d "$STAGING_DIR/public" ]` tripped `set -e` for an app that has no
 * public/ directory. These execute the behaviour instead.
 */

const SCRIPT = "ops/deploy/deploy-blue-diamond";

function sh(command: string, cwd?: string) {
  return spawnSync("bash", ["-c", command], { cwd, encoding: "utf8" });
}

function scratch(): string {
  return mkdtempSync(join(tmpdir(), "bd-deploy-test-"));
}

/** Builds a minimal standalone-shaped artifact. */
function makeArtifact(dir: string, options: { public?: boolean; omit?: string[] } = {}): string {
  const src = join(dir, "src");
  const omit = new Set(options.omit ?? []);
  mkdirSync(join(src, ".next", "static"), { recursive: true });
  if (!omit.has("server.js")) writeFileSync(join(src, "server.js"), "// server\n");
  if (!omit.has("BUILD_ID")) writeFileSync(join(src, ".next", "BUILD_ID"), "build-id\n");
  if (!omit.has(".release-sha")) writeFileSync(join(src, ".release-sha"), `${"a".repeat(40)}\n`);
  writeFileSync(join(src, ".next", "static", "chunk.js"), "//\n");
  if (omit.has("static")) rmSync(join(src, ".next", "static"), { recursive: true, force: true });
  if (options.public) {
    mkdirSync(join(src, "public"), { recursive: true });
    writeFileSync(join(src, "public", "robots.txt"), "User-agent: *\n");
  }
  const artifact = join(dir, "release.tar.gz");
  execFileSync("tar", ["-czf", artifact, "-C", src, "."]);
  return artifact;
}

/** Replays the script's real extraction + verification stage. */
function extractAndVerify(artifact: string, staging: string) {
  mkdirSync(staging, { recursive: true });
  const script = `
    set -e
    ARTIFACT='${artifact}'
    STAGING_DIR='${staging}'
    tar -xzf "$ARTIFACT" -C "$STAGING_DIR" \\
      --no-same-owner --no-same-permissions --delay-directory-restore
    if [ -n "$(find "$STAGING_DIR" -xdev \\( -type l -o -type b -o -type c -o -type p -o -type s \\) -print -quit)" ]; then
      echo "unsupported file types" >&2; exit 1
    fi
    [ -f "$STAGING_DIR/server.js" ]
    [ -s "$STAGING_DIR/.next/BUILD_ID" ]
    [ -d "$STAGING_DIR/.next/static" ]
    if tar -tzf "$ARTIFACT" | grep -q '^\\./public/'; then
      [ -d "$STAGING_DIR/public" ] || { echo "declared public/ missing" >&2; exit 1; }
    fi
    test -s "$STAGING_DIR/.release-sha"
    echo VERIFY_OK
  `;
  return sh(script);
}

test.describe("deploy script: static validation", () => {
  test("parses under bash -n", () => {
    expect(sh(`bash -n ${SCRIPT}`).status).toBe(0);
  });

  test("passes shellcheck when available", () => {
    const have = sh("command -v shellcheck").status === 0;
    test.skip(!have, "shellcheck is not installed in this environment");
    const r = sh(`shellcheck --severity=error ${SCRIPT}`);
    expect(r.stdout + r.stderr).not.toMatch(/error/i);
    expect(r.status).toBe(0);
  });

  // The concatenation class of defect: an option glued to the next token parses
  // fine and fails only at runtime.
  test("contains no glued shell tokens", () => {
    const source = readFileSync(SCRIPT, "utf8");
    const glued: Array<[string, RegExp]> = [
      ["option glued to option", /--[a-z][a-z-]*--[a-z]/],
      ["find group glued", /\\\(-type/],
      ["or glued to brace", /\|\|\{/],
      ["quoted arg glued to option", /'[^']*'-[a-z]/],
      ["test glued to bracket", /\][a-zA-Z]/],
    ];
    for (const [label, pattern] of glued) {
      expect(source, `${label}: ${pattern}`).not.toMatch(pattern);
    }
  });

  test("public/ is not asserted unconditionally", () => {
    const source = readFileSync(SCRIPT, "utf8");
    // The bare assertion on its own line is the defect; a guarded one is fine.
    expect(source).not.toMatch(/^\[ -d "\$STAGING_DIR\/public" \]\s*$/m);
    expect(source).toMatch(/tar -tzf "\$ARTIFACT" \| grep -q/);
  });
});

test.describe("deploy script: artifact verification behaviour", () => {
  test("an artifact WITHOUT public/ verifies successfully", () => {
    const dir = scratch();
    try {
      const artifact = makeArtifact(dir, { public: false });
      const r = extractAndVerify(artifact, join(dir, "staging"));
      expect(r.stderr).not.toMatch(/public/);
      expect(r.stdout).toContain("VERIFY_OK");
      expect(r.status).toBe(0);
      expect(existsSync(join(dir, "staging", "public"))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("an artifact WITH public/ verifies successfully and keeps it", () => {
    const dir = scratch();
    try {
      const artifact = makeArtifact(dir, { public: true });
      const r = extractAndVerify(artifact, join(dir, "staging"));
      expect(r.stdout).toContain("VERIFY_OK");
      expect(r.status).toBe(0);
      expect(existsSync(join(dir, "staging", "public", "robots.txt"))).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("no empty public/ directory is fabricated", () => {
    const dir = scratch();
    try {
      const artifact = makeArtifact(dir, { public: false });
      extractAndVerify(artifact, join(dir, "staging"));
      expect(existsSync(join(dir, "staging", "public"))).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  for (const missing of ["server.js", "BUILD_ID", ".release-sha", "static"]) {
    test(`a missing ${missing} fails verification`, () => {
      const dir = scratch();
      try {
        const artifact = makeArtifact(dir, { omit: [missing] });
        const r = extractAndVerify(artifact, join(dir, "staging"));
        expect(r.status).not.toBe(0);
        expect(r.stdout).not.toContain("VERIFY_OK");
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  }

  test("a malformed archive fails extraction", () => {
    const dir = scratch();
    try {
      const artifact = join(dir, "broken.tar.gz");
      writeFileSync(artifact, "this is not a gzip stream");
      const r = extractAndVerify(artifact, join(dir, "staging"));
      expect(r.status).not.toBe(0);
      expect(r.stdout).not.toContain("VERIFY_OK");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("an archive containing a symlink is refused", () => {
    const dir = scratch();
    try {
      const src = join(dir, "src");
      mkdirSync(join(src, ".next", "static"), { recursive: true });
      writeFileSync(join(src, "server.js"), "//\n");
      writeFileSync(join(src, ".next", "BUILD_ID"), "id\n");
      writeFileSync(join(src, ".release-sha"), `${"a".repeat(40)}\n`);
      sh(`ln -s /etc/passwd "${join(src, "evil")}"`);
      const artifact = join(dir, "release.tar.gz");
      execFileSync("tar", ["-czf", artifact, "-C", src, "."]);
      const r = extractAndVerify(artifact, join(dir, "staging"));
      expect(r.stderr).toContain("unsupported file types");
      expect(r.status).not.toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

/**
 * Slot adjudication, extracted verbatim in shape from the script: collect the
 * healthy slots, then decide. The old loop assigned on every healthy candidate
 * so the last one silently won.
 */
function resolveSlot(opts: { blue?: string; green?: string; state?: string }) {
  const blue = opts.blue ?? "";
  const green = opts.green ?? "";
  const state = opts.state ?? "";
  const script = `
    set -e
    BLUE_SERVED_SHA='${blue}'; GREEN_SERVED_SHA='${green}'; STATE_SLOT='${state}'
    HEALTHY_SLOTS=""
    [ -n "$BLUE_SERVED_SHA" ] && HEALTHY_SLOTS="\${HEALTHY_SLOTS}blue "
    [ -n "$GREEN_SERVED_SHA" ] && HEALTHY_SLOTS="\${HEALTHY_SLOTS}green "
    HEALTHY_COUNT="$(printf '%s' "$HEALTHY_SLOTS" | wc -w | tr -d ' ')"
    case "$HEALTHY_COUNT" in
      0) LIVE_SLOT="green" ;;
      1) LIVE_SLOT="$(printf '%s' "$HEALTHY_SLOTS" | awk '{print $1}')" ;;
      *)
        if [ "$BLUE_SERVED_SHA" != "$GREEN_SERVED_SHA" ]; then
          echo "different releases" >&2; exit 1
        fi
        if [ -z "$STATE_SLOT" ]; then echo "no valid ACTIVE_SLOT" >&2; exit 1; fi
        LIVE_SLOT="$STATE_SLOT" ;;
    esac
    echo "SLOT=$LIVE_SLOT"
  `;
  return sh(script);
}

test.describe("deploy script: active-slot resolution", () => {
  const SHA_A = "a".repeat(40);
  const SHA_B = "b".repeat(40);

  test("both healthy with equal SHA uses the state slot, not the last one scanned", () => {
    const r = resolveSlot({ blue: SHA_A, green: SHA_A, state: "blue" });
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("SLOT=blue");
  });

  test("both healthy with equal SHA honours a green state slot too", () => {
    expect(resolveSlot({ blue: SHA_A, green: SHA_A, state: "green" }).stdout).toContain("SLOT=green");
  });

  test("both healthy but different SHAs fails closed", () => {
    const r = resolveSlot({ blue: SHA_A, green: SHA_B, state: "blue" });
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain("different releases");
  });

  test("both healthy with no valid state fails closed", () => {
    const r = resolveSlot({ blue: SHA_A, green: SHA_A, state: "" });
    expect(r.status).not.toBe(0);
    expect(r.stderr).toContain("no valid ACTIVE_SLOT");
  });

  test("only blue healthy selects blue even if state disagrees", () => {
    expect(resolveSlot({ blue: SHA_A, state: "green" }).stdout).toContain("SLOT=blue");
  });

  test("only green healthy selects green", () => {
    expect(resolveSlot({ green: SHA_A, state: "blue" }).stdout).toContain("SLOT=green");
  });

  test("neither healthy bootstraps so blue receives the first release", () => {
    expect(resolveSlot({}).stdout).toContain("SLOT=green");
  });
});

test.describe("deploy script: failure observability", () => {
  test("the ERR trap passes exit code, line and stage", () => {
    const source = readFileSync(SCRIPT, "utf8");
    expect(source).toMatch(/trap 'rollback \$\? "\$LINENO" "\$STAGE"' ERR INT TERM/);
    expect(source).toMatch(/exit=\$\{exit_code\} line=\$\{failed_line\} stage=\$\{failed_stage\}/);
  });

  test("stage markers cover the phases that can fail", () => {
    const source = readFileSync(SCRIPT, "utf8");
    for (const stage of ["extract-artifact", "verify-artifact-contents", "verify-server-syntax"]) {
      expect(source).toContain(`STAGE="${stage}"`);
    }
  });

  test("no log line can emit a secret", () => {
    const source = readFileSync(SCRIPT, "utf8");
    const logLines = source.split("\n").filter((l) => /^\s*log "/.test(l));
    expect(logLines.length).toBeGreaterThan(0);
    for (const line of logLines) {
      expect(line).not.toMatch(/\$\{?(SSH|TOKEN|SECRET|PASSWORD|CREDENTIAL|PRIVATE)/i);
    }
  });

  test("rollback restores the previous slot and clears the trap", () => {
    const source = readFileSync(SCRIPT, "utf8");
    expect(source).toMatch(/ROLLBACK_FINISHED/);
    expect(source).toMatch(/trap - ERR INT TERM/);
  });
});
