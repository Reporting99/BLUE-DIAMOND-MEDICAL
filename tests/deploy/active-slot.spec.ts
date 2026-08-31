import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * The generated active-slot upstream — the one place Blue Diamond traffic is
 * steered, and the one authority on which slot is serving.
 *
 * The deploy script reads this file to decide where traffic currently goes and
 * rewrites it to move traffic; a rollback is the same one-line rewrite in the
 * opposite direction, costing a reload rather than a rebuild. What the script
 * writes and what it later parses are the two halves that can silently drift
 * apart, so the round trip is asserted here rather than assumed.
 *
 * These tests are deliberately hostname-agnostic. They previously lived
 * alongside a vhost for a temporary pre-launch webhook host that has since
 * been dropped; the switch mechanism they cover is not temporary and belongs
 * to whatever vhost the canonical domain eventually installs.
 */

const SNIPPET = "ops/nginx/blue-diamond-active-slot.conf";
const DEPLOY = "ops/deploy/deploy-blue-diamond";

const read = (p: string) => readFileSync(p, "utf8");

/** Deploy script with comments stripped, so prose cannot satisfy a guard. */
const deployCode = () =>
  read(DEPLOY)
    .split("\n")
    .filter((l) => !/^\s*#/.test(l))
    .join("\n");

test.describe("the generated upstream round-trips through the deploy script", () => {
  test("what the script writes is what the script parses", () => {
    const script = read(DEPLOY);
    const helper = script.slice(
      script.indexOf("write_active_slot_snippet() {"),
      script.indexOf("BLUE_PORT="),
    );
    const parser = script.match(/CURRENT_PORT="\$\(sed -nE '([^']+)'/)![1];

    const dir = mkdtempSync(join(tmpdir(), "bd-slot-"));
    try {
      for (const [slot, port] of [
        ["blue", "3030"],
        ["green", "3031"],
      ]) {
        const file = join(dir, "snippet.conf");
        const gen = spawnSync(
          "bash",
          ["-c", `${helper}\nwrite_active_slot_snippet "${slot}" "${port}" > "${file}"`],
          { encoding: "utf8" },
        );
        expect(gen.status, gen.stderr).toBe(0);

        const parsed = spawnSync(
          "bash",
          ["-c", `sed -nE '${parser}' "${file}" | head -n 1`],
          { encoding: "utf8" },
        );
        expect(parsed.status).toBe(0);
        expect(parsed.stdout.trim(), `${slot} must parse back to ${port}`).toBe(port);
        expect(readFileSync(file, "utf8")).toContain(`# ACTIVE_SLOT=${slot}`);
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("the committed snippet parses with the same expression", () => {
    const parser = read(DEPLOY).match(/CURRENT_PORT="\$\(sed -nE '([^']+)'/)![1];
    const r = spawnSync("bash", ["-c", `sed -nE '${parser}' "${SNIPPET}" | head -n 1`], {
      encoding: "utf8",
    });
    expect(["3030", "3031"]).toContain(r.stdout.trim());
  });

  test("the script no longer writes the old trailing-slash form", () => {
    expect(deployCode()).not.toMatch(/printf 'proxy_pass http:\/\/127\.0\.0\.1/);
  });

  test("the snippet path matches the one the vhost expects to be included", () => {
    expect(deployCode()).toMatch(/blue-diamond-active-slot\.conf/);
    expect(read(SNIPPET)).toMatch(/upstream\s+blue_diamond_app\s*\{/);
  });

  test("the generated file lands where nginx loads it at http level", () => {
    // An `upstream` block is only valid at `http` level. This host's
    // nginx.conf includes `sites-enabled/*.conf` there and nothing else;
    // `snippets/` is reached only by an explicit `include` inside a
    // `location`, which cannot hold an upstream. Writing the generated file
    // under `snippets/` would rewrite it on every switch while nginx read
    // none of it, and any vhost referencing the upstream would fail
    // `nginx -t` on an undefined upstream. That was the shipped path; this
    // pins the fix.
    const target = deployCode().match(/^NGINX_SNIPPET="([^"]+)"/m);
    expect(target, "deploy script must define NGINX_SNIPPET").toBeTruthy();
    expect(target![1]).toBe("/etc/nginx/sites-enabled/blue-diamond-active-slot.conf");
    expect(target![1]).not.toContain("/snippets/");
  });

  test("the switch is atomic: write to .new, then rename", () => {
    const code = deployCode();
    expect(code).toMatch(/> "\$\{NGINX_SNIPPET\}\.new"/);
    expect(code).toMatch(/mv -f "\$\{NGINX_SNIPPET\}\.new" "\$NGINX_SNIPPET"/);
    expect(code).toMatch(/nginx -t/);
    expect(code).toMatch(/systemctl reload nginx/);
  });
});

test.describe("the ISR prerender cache is writable by the runtime user", () => {
  /**
   * A release is owned by root and served by the `blue-diamond` user, so the
   * deploy script grants write access to exactly the prerender-cache
   * artifacts and nothing else.
   *
   * Its two finds drifted: directories were granted on any of four artifact
   * types, but only `.body`/`.meta` FILES were made writable. Next 16 rewrites
   * `.html` and `.rsc` (including `*.segment.rsc`) on revalidation, and it
   * opens the EXISTING file to do it, so a group-writable directory did not
   * help. Production logged EACCES on 163 `.html` and 813 `.rsc` files: every
   * ISR route re-rendered on every request instead of serving its cache, and
   * re-queried the CMS each time.
   */
  const grantBlock = () => {
    const source = read(DEPLOY);
    const start = source.indexOf("grant_isr_prerender_cache_write() {");
    expect(start, "the grant function must exist").toBeGreaterThan(-1);
    return source.slice(start, source.indexOf("\n}", start));
  };

  test("the same artifact list grants the directories and the files", () => {
    const block = grantBlock();
    const finds = (block.match(/find "\$app_dir"/g) ?? []).length;
    const shared = (block.match(/\$\{artifacts\[@\]\}/g) ?? []).length;
    expect(finds, "expected a directory grant and a file grant").toBe(2);
    // Both must be driven by one shared list, not two hand-kept copies --
    // two literal lists are exactly how these drifted apart.
    expect(shared, "both finds must use the shared artifact list").toBe(finds);
    expect(block, "the list must be declared once").toMatch(/local -a artifacts=\(/);
  });

  test("every artifact type Next rewrites is granted", () => {
    const block = grantBlock();
    for (const ext of ["body", "meta", "html", "rsc"]) {
      expect(block, `*.${ext} must be in the granted artifact list`).toContain(`-name '*.${ext}'`);
    }
  });

  test("the grant stays confined to the prerender cache", () => {
    // Code, static assets and server.js must remain read-only to the runtime
    // user; a writable release is a writable application.
    const block = grantBlock();
    expect(block).toContain('.next/server/app');
    expect(block).not.toMatch(/chmod[^\n]*-R/);
    expect(block).not.toContain(".next/static");
    expect(block).not.toContain("server.js");
    expect(block).not.toMatch(/\bo\+w\b|777|a\+w/);
  });
});
