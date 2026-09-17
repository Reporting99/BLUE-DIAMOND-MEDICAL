#!/usr/bin/env node
/**
 * Refreshes the recorded FeelStack resolve envelopes in
 * tests/fixtures/feelstack/*-resolve-*.json from the live PUBLIC API.
 *
 *   FEELSTACK_API_URL=... FEELSTACK_SITE_KEY=... \
 *     node scripts/feelstack-refresh-fixtures.mjs [--only=<route-or-id>] [--check] [--json]
 *
 * WHY FIXTURES AT ALL, AND WHY REFRESH THEM WITH A SCRIPT
 * ------------------------------------------------------
 * The contract suite parses recorded envelopes rather than calling the CMS,
 * for the reason scripts/capture-cms-content.mjs already states: a suite that
 * calls the CMS goes red when the CMS has a bad afternoon, and a red run must
 * mean "fix the content", never "retry". The cost of that choice is that a
 * fixture is a copy, and a copy silently rots — the schemas keep passing
 * against a shape the API stopped emitting months ago.
 *
 * Hand-editing them is worse: the whole point of a recorded envelope is that a
 * server produced it. This tool re-fetches each fixture's OWN route and locale
 * — read out of the file, never from a mapping table that could drift from it —
 * and writes back only what actually changed.
 *
 * READ-ONLY AND UNCREDENTIALED. `/public/v1/sites/:siteKey/resolve` is the same
 * unauthenticated endpoint the site itself uses. No token is sent, and none is
 * needed. `_provenance` therefore records only non-secret facts: route, locale,
 * site key, fixture schema version, a content checksum and a fetch timestamp.
 * The API URL is recorded by HOST only, and no credential, header or query
 * secret is ever written to a fixture — scripts/validate-no-secrets.mjs runs
 * over these files in CI.
 *
 * FLAGS
 *   --only=<substring>  restrict to fixtures whose filename OR route matches.
 *   --check             report drift and exit 1 if any; write nothing.
 *   --json              machine-readable report.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FIXTURE_DIR = join(ROOT, "tests", "fixtures", "feelstack");

/**
 * Bumped when the SHAPE of what is stored changes (not when content changes),
 * so a fixture recorded under an older layout is identifiable rather than
 * merely old.
 */
export const FIXTURE_SCHEMA_VERSION = 1;

/** The provenance key. Underscore-prefixed so it cannot collide with an API field. */
export const PROVENANCE_KEY = "_provenance";

const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.length ? v.join("=") : "true"];
  }),
);
const ONLY = args.get("only") ?? null;
const CHECK_ONLY = args.get("check") === "true";
const AS_JSON = args.get("json") === "true";

const log = (...p) => { if (!AS_JSON) console.log(p.join(" ")); };

/**
 * Deterministic serialisation for CHECKSUMMING ONLY — recursively key-sorted,
 * so two payloads that differ only in the order the backend happened to
 * serialise them in hash identically.
 *
 * The fixture FILE keeps the API's own key order. Rewriting every fixture into
 * sorted order would produce a 10-file diff that says nothing about content,
 * and would permanently destroy the "this is what the server sent" property
 * that makes a recorded envelope worth having.
 */
export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value).sort().map((k) => [k, canonicalize(value[k])]),
    );
  }
  return value;
}

export function contentChecksum(envelope) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructuring is the omission
  const { [PROVENANCE_KEY]: _ignored, ...rest } = envelope;
  return `sha256:${createHash("sha256").update(JSON.stringify(canonicalize(rest))).digest("hex")}`;
}

/** Envelope content without provenance — what drift is measured against. */
export function withoutProvenance(envelope) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructuring is the omission
  const { [PROVENANCE_KEY]: _ignored, ...rest } = envelope;
  return rest;
}

export function hasDrifted(current, fetched) {
  return contentChecksum(current) !== contentChecksum(fetched);
}

/**
 * Provenance for one fixture. Takes the API URL only to record its HOSTNAME:
 * a full URL could carry a query string, and a query string is a place a
 * secret can hide.
 */
export function buildProvenance({ apiUrl, siteKey, route, locale, checksum, fetchedAt }) {
  let host = null;
  try { host = new URL(apiUrl).host; } catch { host = null; }
  return {
    source: "GET /public/v1/sites/:siteKey/resolve (public, unauthenticated)",
    apiHost: host,
    siteKey,
    route,
    locale,
    fixtureSchemaVersion: FIXTURE_SCHEMA_VERSION,
    contentChecksum: checksum,
    fetchedAt,
    note: "Regenerated by scripts/feelstack-refresh-fixtures.mjs. Never hand-edit; re-run the script.",
  };
}

/* ----------------------------------------------------------------- main -- */
/* Everything below needs the network; the pure helpers above are what
   tests/contracts/content-drift-gate.spec.ts exercises.

   A function, not top-level code: a module with a top-level `await` cannot be
   `require()`d, and that spec imports this module through Playwright's
   CommonJS transform. */
async function main() {
  const API = (process.env.FEELSTACK_API_URL ?? "").replace(/\/$/, "");
  const SITE_KEY = process.env.FEELSTACK_SITE_KEY ?? "";
  if (!API || !SITE_KEY) {
    console.error("FEELSTACK_API_URL and FEELSTACK_SITE_KEY are required (public read; no credential needed).");
    process.exit(3);
  }

  const files = readdirSync(FIXTURE_DIR)
    .filter((f) => /-resolve-(en|ar)\.json$/.test(f))
    .sort();

  const report = [];
  let drifted = 0;
  let written = 0;

  for (const file of files) {
    const path = join(FIXTURE_DIR, file);
    const current = JSON.parse(readFileSync(path, "utf8"));

    // The fixture's route and locale come from the fixture itself. A separate
    // filename->route table is one more copy to drift, and it would let a
    // fixture be refreshed from the WRONG route without anything noticing.
    const route = current?.route?.path;
    const locale = current?.route?.locale;
    if (!route || !locale) {
      report.push({ file, status: "SKIPPED", reason: "no route.path/route.locale in the fixture" });
      continue;
    }
    if (ONLY && !file.includes(ONLY) && !route.includes(ONLY)) continue;

    const resolveOnce = async (path) => {
      const url = `${API}/public/v1/sites/${SITE_KEY}/resolve?path=${encodeURIComponent(path)}&locale=${locale}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    };

    let fetched;
    let effectiveRoute = route;
    try {
      fetched = await resolveOnce(route);

      // CROSS-LOCALE FALLBACK. FeelStack answers a request for a locale it has
      // no route for by serving the DEFAULT-locale route and saying so
      // (src/lib/feelstack/locale-integrity.ts). Recording that would put
      // English content in an Arabic fixture, and every test reading it would
      // then assert that the wrong language is correct.
      //
      // Before refusing, follow the envelope's own `alternates` to the path
      // this locale is actually published under. Three Arabic fixtures here
      // were recorded when the CMS still served Arabic under the English path;
      // it now publishes them under Arabic paths, which is a ROUTE change, not
      // a content change, and re-resolving is the honest way to record it.
      if (fetched?.route?.usedFallback === true || fetched?.route?.resolvedLocale !== locale) {
        const alternate = (fetched?.route?.alternates ?? []).find((a) => a.locale === locale);
        if (alternate?.path && alternate.path !== route) {
          fetched = await resolveOnce(alternate.path);
          effectiveRoute = alternate.path;
        }
      }
    } catch (e) {
      report.push({ file, route, locale, status: "FETCH_FAILED", reason: e.message });
      log(`  ${basename(file).padEnd(38)} FETCH_FAILED  ${e.message}`);
      continue;
    }

    // Still not this locale after following alternates: refuse. There is no
    // third option -- a fixture that records a fallback is worse than no
    // fixture, because it makes the wrong answer look verified.
    if (fetched?.route?.usedFallback === true || fetched?.route?.resolvedLocale !== locale) {
      report.push({ file, route, locale, status: "LOCALE_INTEGRITY_FAILED", reason: `resolved ${fetched?.route?.resolvedLocale}` });
      log(`  ${basename(file).padEnd(38)} LOCALE_INTEGRITY_FAILED`);
      drifted += 1;
      continue;
    }

    if (!hasDrifted(current, fetched)) {
      report.push({ file, route, locale, status: "CLEAN", checksum: contentChecksum(current) });
      log(`  ${basename(file).padEnd(38)} CLEAN`);
      continue;
    }

    drifted += 1;
    const checksum = contentChecksum(fetched);
    report.push({ file, route, locale, status: "DRIFTED", was: contentChecksum(current), now: checksum });
    log(`  ${basename(file).padEnd(38)} DRIFTED`);

    if (CHECK_ONLY) continue;

    // Only what changed is rewritten, and provenance goes LAST so the file
    // still opens on the envelope a reader came to look at.
    const next = {
      ...withoutProvenance(fetched),
      [PROVENANCE_KEY]: buildProvenance({
        apiUrl: API,
        siteKey: SITE_KEY,
        route: effectiveRoute,
        locale,
        checksum,
        fetchedAt: new Date().toISOString(),
      }),
    };
    writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    written += 1;
  }

  if (AS_JSON) {
    console.log(JSON.stringify({ drifted, written, checkOnly: CHECK_ONLY, fixtures: report }, null, 2));
  } else {
    log(`\n${files.length} fixtures examined, ${drifted} drifted, ${written} rewritten`);
  }

  const failed = report.some((r) => r.status === "FETCH_FAILED" || r.status === "LOCALE_INTEGRITY_FAILED");
  process.exit(failed || (CHECK_ONLY && drifted > 0) ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`refresh-fixtures fatal: ${error.message}`);
    process.exit(1);
  });
}
