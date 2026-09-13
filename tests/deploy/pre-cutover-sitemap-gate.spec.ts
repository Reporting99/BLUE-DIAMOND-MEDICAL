import { test, expect } from "@playwright/test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as http from "node:http";

const execFileAsync = promisify(execFile);

/**
 * Behavioural tests for the pre-cutover SEO gate added to
 * ops/deploy/deploy-blue-diamond (verify_candidate_sitemap_and_robots).
 *
 * This is the SECOND, independent line of defence against the cold-start
 * empty-sitemap defect: even if a production build is ever produced without
 * the indexing env (deploy-production.yml's own "Verify build-time indexing
 * configuration" step should already have caught that), this gate is what
 * actually stops such a release from ever receiving traffic. It runs the
 * REAL function extracted verbatim from the script, against a real local
 * HTTP server, rather than re-implementing the logic — the same technique
 * tests/deploy/deploy-script.spec.ts already uses for extraction/verification.
 */

const SCRIPT = "ops/deploy/deploy-blue-diamond";

function extractFunction(name: string): string {
  const source = readFileSync(SCRIPT, "utf8");
  const start = source.indexOf(`${name}() {`);
  expect(start, `function ${name} not found in ${SCRIPT}`).toBeGreaterThan(-1);
  // Walk brace depth from the opening "{" to find the matching close.
  const braceStart = source.indexOf("{", start);
  let depth = 0;
  let i = braceStart;
  for (; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  return source.slice(start, i + 1);
}

/** Serves different bodies per path, so sitemap.xml and robots.txt can differ. */
function startRoutedServer(routes: Record<string, { body: string; status?: number; contentType?: string }>): Promise<{
  port: number;
  close: () => void;
}> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const route = routes[req.url ?? ""];
      if (!route) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(route.status ?? 200, { "Content-Type": route.contentType ?? "application/xml" });
      res.end(route.body);
    });
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      resolve({ port, close: () => server.close() });
    });
  });
}

const GOOD_SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from({ length: 168 }, (_, i) => `<url><loc>https://bluediamondmedical.ca/en/page-${i}</loc></url>`).join("\n")}
</urlset>`;

const GOOD_ROBOTS = `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://bluediamondmedical.ca/sitemap.xml\n`;

/**
 * Runs the gate function as a genuinely separate process, awaited
 * asynchronously rather than via spawnSync.
 *
 * The candidate/previous HTTP servers in these tests run IN THIS SAME node
 * process (Playwright's test worker). A synchronous spawnSync here would
 * block that process's event loop for the whole duration of the child
 * process — including while it is trying to connect back to the very HTTP
 * servers this process is supposed to be serving — so curl would sit waiting
 * for a response no one is around to send until it hits its own --max-time
 * and reports connection failure. Using the async execFile keeps the event
 * loop free to service those requests while this awaits the result.
 */
async function runGate(
  dir: string,
  candidatePort: number,
  previousPort: number,
): Promise<{ status: number; stdout: string; stderr: string }> {
  const fn = extractFunction("verify_candidate_sitemap_and_robots");
  const script = join(dir, "gate.sh");
  writeFileSync(
    script,
    `#!/usr/bin/env bash\nset -uo pipefail\n${fn}\nverify_candidate_sitemap_and_robots ${candidatePort} ${previousPort}\n`,
  );
  try {
    // The gate's real retry loop (5 attempts, 15s apart) exists to survive a
    // candidate's genuine warm-up lag in production; against these tests'
    // synchronous local servers there is nothing to wait for, so override to
    // a single attempt with no delay -- otherwise every rejection case would
    // take up to 75s and blow past this suite's per-test timeout.
    const { stdout, stderr } = await execFileAsync("bash", [script], {
      env: { ...process.env, SITEMAP_GATE_MAX_ATTEMPTS: "1", SITEMAP_GATE_RETRY_INTERVAL: "0" },
    });
    return { status: 0, stdout, stderr };
  } catch (error) {
    const err = error as { code?: number; stdout?: string; stderr?: string };
    return { status: err.code ?? 1, stdout: err.stdout ?? "", stderr: err.stderr ?? "" };
  }
}

test.describe("pre-cutover sitemap gate: extraction sanity", () => {
  test("the function exists and is wired in before the Nginx switch", () => {
    const source = readFileSync(SCRIPT, "utf8");
    const fnIndex = source.indexOf("verify_candidate_sitemap_and_robots() {");
    const callIndex = source.indexOf('verify_candidate_sitemap_and_robots "$TARGET_PORT" "$CURRENT_PORT"');
    const nginxSwitchIndex = source.indexOf('if [ "$NGINX_MANAGED" -eq 1 ]; then\n  write_active_slot_snippet');
    expect(fnIndex).toBeGreaterThan(-1);
    expect(callIndex).toBeGreaterThan(-1);
    expect(nginxSwitchIndex).toBeGreaterThan(-1);
    // The gate must run strictly BEFORE Nginx is ever repointed.
    expect(callIndex).toBeLessThan(nginxSwitchIndex);
  });
});

test.describe("pre-cutover sitemap gate: behaviour", () => {
  let dir: string;
  test.beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "bd-sitemap-gate-"));
  });
  test.afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  test("a healthy candidate (168 URLs, valid robots.txt) passes and reports the count", async () => {
    const candidate = await startRoutedServer({
      "/sitemap.xml": { body: GOOD_SITEMAP },
      "/robots.txt": { body: GOOD_ROBOTS, contentType: "text/plain" },
    });
    const previous = await startRoutedServer({
      "/sitemap.xml": { body: GOOD_SITEMAP },
    });
    try {
      const r = await runGate(dir, candidate.port, previous.port);
      expect(r.stdout).toContain("SITEMAP_GATE_OK");
      expect(r.stdout).toContain("168 URLs");
      expect(r.status).toBe(0);
    } finally {
      candidate.close();
      previous.close();
    }
  });

  test("THE ACTUAL DEFECT: an empty sitemap (0 URLs, cold-start ISR bake) is rejected", async () => {
    const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;
    const candidate = await startRoutedServer({
      "/sitemap.xml": { body: emptySitemap },
      "/robots.txt": { body: GOOD_ROBOTS, contentType: "text/plain" },
    });
    const previous = await startRoutedServer({
      "/sitemap.xml": { body: GOOD_SITEMAP },
    });
    try {
      const r = await runGate(dir, candidate.port, previous.port);
      expect(r.status).not.toBe(0);
      expect(r.stdout + r.stderr).toContain("SITEMAP_GATE_FAILED");
      expect(r.stdout + r.stderr).toContain("0 URLs");
    } finally {
      candidate.close();
      previous.close();
    }
  });

  test("a drastic unexplained collapse (>50% drop from the live slot) is rejected", async () => {
    const smallSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Array.from(
      { length: 10 },
      (_, i) => `<url><loc>https://bluediamondmedical.ca/en/page-${i}</loc></url>`,
    ).join("\n")}\n</urlset>`;
    const candidate = await startRoutedServer({
      "/sitemap.xml": { body: smallSitemap },
      "/robots.txt": { body: GOOD_ROBOTS, contentType: "text/plain" },
    });
    const previous = await startRoutedServer({
      "/sitemap.xml": { body: GOOD_SITEMAP },
    });
    try {
      const r = await runGate(dir, candidate.port, previous.port);
      expect(r.status).not.toBe(0);
      expect(r.stdout + r.stderr).toContain("SITEMAP_GATE_FAILED");
      expect(r.stdout + r.stderr).toContain("50%");
    } finally {
      candidate.close();
      previous.close();
    }
  });

  test("a modest, explainable change (well within 50%) still passes", async () => {
    const slightlySmaller = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Array.from(
      { length: 150 },
      (_, i) => `<url><loc>https://bluediamondmedical.ca/en/page-${i}</loc></url>`,
    ).join("\n")}\n</urlset>`;
    const candidate = await startRoutedServer({
      "/sitemap.xml": { body: slightlySmaller },
      "/robots.txt": { body: GOOD_ROBOTS, contentType: "text/plain" },
    });
    const previous = await startRoutedServer({
      "/sitemap.xml": { body: GOOD_SITEMAP },
    });
    try {
      const r = await runGate(dir, candidate.port, previous.port);
      expect(r.status).toBe(0);
      expect(r.stdout).toContain("SITEMAP_GATE_OK");
    } finally {
      candidate.close();
      previous.close();
    }
  });

  test("a non-200 /sitemap.xml is rejected", async () => {
    const candidate = await startRoutedServer({
      "/sitemap.xml": { body: "server error", status: 500 },
      "/robots.txt": { body: GOOD_ROBOTS, contentType: "text/plain" },
    });
    const previous = await startRoutedServer({ "/sitemap.xml": { body: GOOD_SITEMAP } });
    try {
      const r = await runGate(dir, candidate.port, previous.port);
      expect(r.status).not.toBe(0);
      expect(r.stdout + r.stderr).toContain("SITEMAP_GATE_FAILED");
    } finally {
      candidate.close();
      previous.close();
    }
  });

  test("invalid XML (no urlset) is rejected", async () => {
    const candidate = await startRoutedServer({
      "/sitemap.xml": { body: "not xml at all" },
      "/robots.txt": { body: GOOD_ROBOTS, contentType: "text/plain" },
    });
    const previous = await startRoutedServer({ "/sitemap.xml": { body: GOOD_SITEMAP } });
    try {
      const r = await runGate(dir, candidate.port, previous.port);
      expect(r.status).not.toBe(0);
      expect(r.stdout + r.stderr).toContain("not valid sitemap XML");
    } finally {
      candidate.close();
      previous.close();
    }
  });

  test("duplicate <loc> entries are rejected", async () => {
    const dupSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>https://bluediamondmedical.ca/en/a</loc></url>\n<url><loc>https://bluediamondmedical.ca/en/a</loc></url>\n</urlset>`;
    const candidate = await startRoutedServer({
      "/sitemap.xml": { body: dupSitemap },
      "/robots.txt": { body: GOOD_ROBOTS, contentType: "text/plain" },
    });
    const previous = await startRoutedServer({ "/sitemap.xml": { body: GOOD_SITEMAP } });
    try {
      const r = await runGate(dir, candidate.port, previous.port);
      expect(r.status).not.toBe(0);
      expect(r.stdout + r.stderr).toContain("duplicate");
    } finally {
      candidate.close();
      previous.close();
    }
  });

  test("a localhost URL leaking into the sitemap is rejected", async () => {
    const leaky = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>http://localhost:3030/en/a</loc></url>\n</urlset>`;
    const candidate = await startRoutedServer({
      "/sitemap.xml": { body: leaky },
      "/robots.txt": { body: GOOD_ROBOTS, contentType: "text/plain" },
    });
    const previous = await startRoutedServer({ "/sitemap.xml": { body: GOOD_SITEMAP } });
    try {
      const r = await runGate(dir, candidate.port, previous.port);
      expect(r.status).not.toBe(0);
      expect(r.stdout + r.stderr).toContain("localhost/staging");
    } finally {
      candidate.close();
      previous.close();
    }
  });

  test("a blanket 'Disallow: /' in robots.txt is rejected", async () => {
    const blockedRobots = `User-agent: *\nDisallow: /\n`;
    const candidate = await startRoutedServer({
      "/sitemap.xml": { body: GOOD_SITEMAP },
      "/robots.txt": { body: blockedRobots, contentType: "text/plain" },
    });
    const previous = await startRoutedServer({ "/sitemap.xml": { body: GOOD_SITEMAP } });
    try {
      const r = await runGate(dir, candidate.port, previous.port);
      expect(r.status).not.toBe(0);
      expect(r.stdout + r.stderr).toContain("blanket 'Disallow: /'");
    } finally {
      candidate.close();
      previous.close();
    }
  });

  test("a missing 'Sitemap:' line in robots.txt is rejected", async () => {
    const noSitemapLine = `User-agent: *\nAllow: /\n`;
    const candidate = await startRoutedServer({
      "/sitemap.xml": { body: GOOD_SITEMAP },
      "/robots.txt": { body: noSitemapLine, contentType: "text/plain" },
    });
    const previous = await startRoutedServer({ "/sitemap.xml": { body: GOOD_SITEMAP } });
    try {
      const r = await runGate(dir, candidate.port, previous.port);
      expect(r.status).not.toBe(0);
      expect(r.stdout + r.stderr).toContain("Sitemap:");
    } finally {
      candidate.close();
      previous.close();
    }
  });
});
