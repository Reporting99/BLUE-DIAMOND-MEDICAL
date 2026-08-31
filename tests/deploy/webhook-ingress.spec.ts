import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * The webhook-only ingress.
 *
 * Blue Diamond must stay unreachable from the internet, and FeelStack must be
 * able to reach exactly one route on it -- otherwise its cache invalidation
 * never fires, which is the state that left 1301 events recorded as delivered
 * with nothing registered to receive them.
 *
 * These tests pin the two halves that can silently break: that the hostname
 * exposes nothing but the webhook, and that the generated upstream the deploy
 * script writes is the same one it later parses.
 */

const VHOST = "ops/nginx/bd-hooks.dfeelings.com.conf";
const SNIPPET = "ops/nginx/blue-diamond-active-slot.conf";
const DEPLOY = "ops/deploy/deploy-blue-diamond";

const read = (p: string) => readFileSync(p, "utf8");

/** Deploy script with comments stripped, so prose cannot satisfy a guard. */
const deployCode = () =>
  read(DEPLOY)
    .split("\n")
    .filter((l) => !/^\s*#/.test(l))
    .join("\n");

test.describe("the hostname exposes the webhook and nothing else", () => {
  const vhost = read(VHOST);

  /**
   * Brace-matched location parser.
   *
   * A `[^}]*` body regex cannot be used here: the webhook location contains a
   * nested `limit_except POST { deny all; }`, so a non-nesting match ends at
   * the wrong brace and reports locations that do not exist.
   */
  function locations(source: string): Array<{ path: string; body: string }> {
    const found: Array<{ path: string; body: string }> = [];
    const header = /location\s+(?:(=|\^~|~\*?)\s*)?([^\s{]+)\s*\{/g;
    let m: RegExpExecArray | null;
    while ((m = header.exec(source)) !== null) {
      let depth = 1;
      let i = header.lastIndex;
      for (; i < source.length && depth > 0; i += 1) {
        if (source[i] === "{") depth += 1;
        else if (source[i] === "}") depth -= 1;
      }
      found.push({ path: m[2], body: source.slice(header.lastIndex, i - 1) });
    }
    return found;
  }

  test("the only proxied location is the exact webhook path", () => {
    const proxied = locations(vhost)
      .filter((l) => /proxy_pass/.test(l.body))
      .map((l) => l.path);
    expect(proxied).toEqual(["/api/feelstack/revalidate"]);
  });

  test("the webhook location is an EXACT match, not a prefix", () => {
    // A prefix match would also serve /api/feelstack/revalidate-anything.
    expect(vhost).toMatch(/location\s+=\s+\/api\/feelstack\/revalidate\s*\{/);
  });

  test("every other path returns 404", () => {
    expect(vhost).toMatch(/location\s+\/\s*\{\s*return\s+404;\s*\}/);
  });

  test("only POST is permitted", () => {
    expect(vhost).toMatch(/limit_except\s+POST\s*\{\s*deny\s+all;\s*\}/);
  });

  test("the body size is capped", () => {
    const m = vhost.match(/client_max_body_size\s+(\d+)k;/);
    expect(m).toBeTruthy();
    expect(Number(m![1])).toBeLessThanOrEqual(256);
  });

  test("requests are rate limited with a bounded burst", () => {
    expect(vhost).toMatch(/limit_req_zone\s+\$binary_remote_addr\s+zone=bd_hooks/);
    const burst = vhost.match(/limit_req\s+zone=bd_hooks\s+burst=(\d+)/);
    expect(burst).toBeTruthy();
    expect(Number(burst![1])).toBeLessThanOrEqual(50);
  });

  test("no site root, index, or static asset handling is present", () => {
    // A `root` is permitted in exactly one place: the ACME challenge location,
    // which needs one to answer HTTP-01 renewals. Anywhere else it would start
    // serving files from this hostname.
    const rootBearing = locations(vhost).filter((l) => /^\s*root\s+/m.test(l.body));
    expect(rootBearing.map((l) => l.path)).toEqual(["/.well-known/acme-challenge/"]);

    // And no root at server level, outside any location.
    const serverLevel = vhost.replace(
      /location\s+(?:(?:=|\^~|~\*?)\s*)?[^\s{]+\s*\{[\s\S]*?\n    \}/g,
      "",
    );
    expect(serverLevel).not.toMatch(/^\s*root\s+/m);

    expect(vhost).not.toMatch(/\bindex\s+index\./);
    expect(vhost).not.toMatch(/try_files/);
    expect(vhost).not.toMatch(/\.(css|js|png|jpg|woff2)\b/);
  });

  test("the proxy_pass has NO trailing slash, so the URI survives", () => {
    // With `location = /api/feelstack/revalidate`, a trailing slash replaces
    // the matched URI with "/" and the webhook reaches the application root.
    expect(vhost).toMatch(/proxy_pass\s+http:\/\/blue_diamond_app;/);
    expect(vhost).not.toMatch(/proxy_pass\s+http:\/\/blue_diamond_app\/;/);
  });

  test("it never proxies to a slot port directly", () => {
    // Hard-coding a port here would bypass the atomic switch and pin the
    // webhook to one slot across a Blue/Green move.
    expect(vhost).not.toMatch(/proxy_pass[^\n]*127\.0\.0\.1:(3030|3031)/);
  });

  test("it is marked noindex", () => {
    expect(vhost).toMatch(/X-Robots-Tag[^\n]*noindex/);
  });

  test("HTTP is redirected to HTTPS but ACME validation still works", () => {
    expect(vhost).toMatch(/location\s+\^~\s+\/\.well-known\/acme-challenge\//);
    expect(vhost).toMatch(/return\s+301\s+https:\/\/\$host\$request_uri;/);
  });

  test("no secret appears in the configuration", () => {
    expect(vhost).not.toMatch(/secret|token|api[_-]?key|password/i);
  });
});

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
    // none of it, and bd-hooks.dfeelings.com would fail `nginx -t` with an
    // undefined upstream. That was the shipped path; this pins the fix.
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

test.describe("nginx itself accepts the configuration", () => {
  test("the vhost uses the modern http2 directive", () => {
    // `listen 443 ssl http2;` has been deprecated since nginx 1.25.1 in favour
    // of a standalone `http2 on;`. Asserted separately from the syntax check
    // below because that check has to tolerate a runner older than 1.25.1,
    // and tolerating it must not quietly stop pinning the form we ship.
    expect(read(VHOST)).toMatch(/^\s*http2 on;/m);
    expect(read(VHOST)).not.toMatch(/listen[^\n]*\bhttp2\b/);
  });

  test("the vhost and snippet pass `nginx -t`", () => {
    const nginx = spawnSync("nginx", ["-v"], { encoding: "utf8" });
    test.skip(nginx.error !== undefined, "nginx binary not available on this runner");

    // The deployment host runs 1.30.x. A CI runner may be older than 1.25.1,
    // which does not know the standalone `http2 on;` directive and fails the
    // whole file on it. Downgrading the shipped config to suit the older
    // parser would be the wrong way round -- so the directive is dropped for
    // the syntax check on such a runner, and everything else in the file is
    // still validated. The form itself is pinned by the test above.
    const version = `${nginx.stdout ?? ""}${nginx.stderr ?? ""}`;
    const parsed = version.match(/nginx\/(\d+)\.(\d+)\.(\d+)/);
    const [major, minor, patch] = parsed ? parsed.slice(1).map(Number) : [0, 0, 0];
    const knowsHttp2Directive =
      major > 1 || (major === 1 && (minor > 25 || (minor === 25 && patch >= 1)));

    const dir = mkdtempSync(join(tmpdir(), "bd-nginx-"));
    try {
      mkdirSync(join(dir, "http-level"), { recursive: true });
      mkdirSync(join(dir, "certs"), { recursive: true });

      // A throwaway self-signed pair, so `nginx -t` can load an ssl_certificate
      // without touching any real key material.
      const ssl = spawnSync(
        "openssl",
        ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1",
         "-subj", "/CN=bd-hooks.test",
         "-keyout", join(dir, "certs", "t.key"),
         "-out", join(dir, "certs", "t.crt")],
        { encoding: "utf8" },
      );
      test.skip(ssl.status !== 0, "openssl not available on this runner");

      writeFileSync(join(dir, "http-level", "blue-diamond-active-slot.conf"), read(SNIPPET));

      const vhost = read(VHOST)
        .replace(/\/etc\/nginx\/ssl-certificates\/bd-hooks\.dfeelings\.com\.crt/, join(dir, "certs", "t.crt"))
        .replace(/\/etc\/nginx\/ssl-certificates\/bd-hooks\.dfeelings\.com\.key/, join(dir, "certs", "t.key"))
        .replace(/access_log[^\n]*\n/, "")
        .replace(/error_log[^\n]*\n/, "")
        .replace(/^[ \t]*http2 on;\n/m, (match) => (knowsHttp2Directive ? match : ""));

      writeFileSync(
        join(dir, "nginx.conf"),
        [
          "events {}",
          "http {",
          `  include ${join(dir, "http-level", "blue-diamond-active-slot.conf")};`,
          vhost.replace(/limit_req_zone[^\n]*\n/, (m) => m),
          "}",
          "",
        ].join("\n"),
      );

      const r = spawnSync("nginx", ["-t", "-c", join(dir, "nginx.conf"), "-p", dir], {
        encoding: "utf8",
      });
      expect(`${r.stdout}${r.stderr}`).toContain("syntax is ok");
      expect(r.status, `${r.stdout}${r.stderr}`).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
