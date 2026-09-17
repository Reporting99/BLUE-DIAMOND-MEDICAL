#!/usr/bin/env node
/**
 * CONTENT DRIFT GATE — fails the release BEFORE the expensive suite runs.
 *
 *   FEELSTACK_API_URL=... FEELSTACK_SITE_KEY=... node scripts/content-drift-gate.mjs
 *
 * WHAT IT COMPARES, AND WHY THESE THREE
 * -------------------------------------
 * A CMS-backed field has four potential sources of truth in this project, and a
 * release is only honest when they agree:
 *
 *   A. the approved repository copy   src/features/<family>/data.ts
 *   B. the declared CMS target        content/feelstack/republish-operations.json (`op.to`)
 *   C. the live CMS value             GET /public/v1/sites/:siteKey/resolve
 *   D. the recorded fixture           tests/fixtures/feelstack/cms-content-inventory.json
 *
 * THIS SCRIPT OWNS B x C x D. It deliberately does not re-implement A x D:
 * tests/contracts/cms-content-drift.spec.ts already compares the approved repo
 * copy against the captured inventory, with real imports of the TypeScript data
 * modules, and duplicating that here in a .mjs would mean a second, weaker
 * parser of the same files — exactly the kind of copy this whole exercise is
 * about deleting.
 *
 * What it adds instead is the edge that test structurally cannot see. That test
 * compares A against D, and D is a RECORDING. If D is stale, A x D passes while
 * the site serves something else entirely: the comparison is green and
 * meaningless. C x D is the check that keeps A x D honest, and it is the reason
 * this gate must run against the live API rather than against files.
 *
 * WHY BEFORE PLAYWRIGHT. A content-authority failure is not going to be fixed
 * by a browser. Finding it after a full E2E suite costs the whole suite's
 * runtime per attempt, on a 4-vCPU shared box, for information that was
 * available in seconds.
 *
 * FIELDS IT DOES NOT FLAG. Some published fields have no repository source of
 * truth and are CMS-owned by design (docs/CMS_CONTENT_AUTHORITY.md,
 * docs/AI_EDITORIAL_POLICY.md: "CMS synchronization" is routine editorial
 * work). Flagging those would mean every legitimate CMS edit failed CI until
 * someone recorded it in the repo, which would train people to ignore the gate.
 * See CMS_OWNED_FIELDS.
 *
 * EXIT CODES
 *   0  every field the repository contract owns is CLEAN
 *   1  at least one DRIFT
 *   2  bad usage / unreadable inputs
 *   3  the CMS could not be reached (TRANSIENT — not a content verdict, and
 *      deliberately a different code so a CI step can tell them apart)
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OPS_FILE = join(ROOT, "content", "feelstack", "republish-operations.json");
const INVENTORY_FILE = join(ROOT, "tests", "fixtures", "feelstack", "cms-content-inventory.json");
const ACK_FILE = join(ROOT, "content", "feelstack", "drift-gate-acknowledged.json");

const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.length ? v.join("=") : "true"];
  }),
);
const AS_JSON = args.get("json") === "true";
const ONLY = args.get("only") ?? null;
const log = (...p) => { if (!AS_JSON) console.log(p.join(" ")); };

/**
 * Fields the CMS owns outright. No repository source exists for them, so a
 * difference is an edit, not drift.
 *
 * `seo.*` is the load-bearing entry: the repository generates SEO metadata from
 * its own route registry (src/lib/seo/metadata.ts) rather than storing the
 * CMS's `seo` object, so the two are not the same field wearing two hats. The
 * republish operations that DO target `entry.seo.set` are still checked —
 * declaring a target value is precisely how the repository takes ownership of
 * one specific field, and this list is about fields nobody declared.
 */
export const CMS_OWNED_FIELDS = new Set([
  "source_verified",
  "updatedAt",
  "publishedAt",
  "translationGroupId",
]);

/** Whitespace-normalised, the same way the drift spec compares editorial text. */
export const norm = (s) => (s ?? "").toString().replace(/\s+/g, " ").trim();

/** Per-FIELD checksum, so a report can name the field rather than the record. */
export function fieldChecksum(value) {
  if (value === undefined) return null;
  return `sha256:${createHash("sha256").update(norm(typeof value === "string" ? value : JSON.stringify(value))).digest("hex")}`.slice(0, 23);
}

/** Value equality on the normalised form — a reflowed paragraph is not drift. */
export function sameValue(a, b) {
  if (a === undefined || b === undefined) return false;
  if (typeof a === "string" || typeof b === "string") return norm(a) === norm(b);
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Verdict for one field from the three values this gate can see.
 *
 * `undefined` means "this source has nothing to say", which is not the same as
 * disagreeing. A field with only one opinion cannot be in conflict with
 * anything, and calling that DRIFT would flag every CMS-only field on the site.
 */
export function verdictFor({ declared, live, fixture }) {
  const known = [declared, live, fixture].filter((v) => v !== undefined);
  if (known.length < 2) return { verdict: "UNCHECKED", reason: "only one source has a value" };

  const mismatches = [];
  if (declared !== undefined && live !== undefined && !sameValue(declared, live)) mismatches.push("declared!=live");
  if (live !== undefined && fixture !== undefined && !sameValue(live, fixture)) mismatches.push("live!=fixture");
  if (declared !== undefined && fixture !== undefined && !sameValue(declared, fixture)) mismatches.push("declared!=fixture");

  return mismatches.length === 0
    ? { verdict: "CLEAN", reason: "all known sources agree" }
    : { verdict: "DRIFT", reason: mismatches.join(", ") };
}

/** The live value an operation targets, read out of a resolved public payload. */
export function liveValueOf(op, payload) {
  const data = payload?.data ?? {};
  switch (op.kind) {
    case "entry.field.set": return data.fields?.[op.field];
    case "entry.seo.set": return payload?.seo?.[op.field];
    case "entry.partnerNote.set": return data.fields?.external_partners?.[op.partnerIndex]?.note;
    case "person.biography.set": return data.biography;
    case "person.field.set": return data[op.field];
    case "faq.update": {
      const f = (payload?.relations?.faqs ?? []).find((q) => q.id === op.faqId);
      return f ? f[op.field] : undefined;
    }
    default: return undefined;
  }
}

/** The same field as recorded in the captured inventory, if it recorded one. */
export function fixtureValueOf(op, inventory) {
  const entry = inventory.find((e) => e.cmsPath === op.route);
  if (!entry) return undefined;
  switch (op.kind) {
    case "entry.field.set": return entry.fields?.[op.field];
    case "person.biography.set": return entry.fields?.biography;
    case "faq.update": {
      const f = (entry.faqs ?? []).find((q) => q.id === op.faqId);
      return f ? f[op.field] : undefined;
    }
    // The inventory records editorial FIELDS only -- not seo, not partner
    // notes. Returning undefined is honest: it has no opinion, so it is not
    // counted as a disagreeing source.
    default: return undefined;
  }
}

/* ----------------------------------------------------------------- main -- */
/**
 * A function, not top-level code: a module with a top-level `await` cannot be
 * `require()`d, and tests/contracts/content-drift-gate.spec.ts imports the pure
 * comparison helpers above through Playwright's CommonJS transform.
 */
async function main() {
  const API = (process.env.FEELSTACK_API_URL ?? "").replace(/\/$/, "");
  const SITE_KEY = process.env.FEELSTACK_SITE_KEY ?? "";
  if (!API || !SITE_KEY) {
    console.error("FEELSTACK_API_URL and FEELSTACK_SITE_KEY are required (public read; no credential needed).");
    process.exit(2);
  }

  const doc = JSON.parse(readFileSync(OPS_FILE, "utf8"));
  const inventory = JSON.parse(readFileSync(INVENTORY_FILE, "utf8"));

  let ops = doc.operations.filter((o) => o.applicable === true);
  if (ONLY) ops = ops.filter((o) => o.opId === ONLY || (o.route ?? "").includes(ONLY) || o.field === ONLY);

  // One resolve per (route, locale), not per operation: 70 operations cover far
  // fewer routes, and hammering the CMS is how a gate becomes the outage it was
  // meant to detect.
  const payloads = new Map();
  const unreachable = [];
  for (const key of new Set(ops.map((o) => `${o.locale} ${o.route}`))) {
    const [locale, route] = key.split(" ");
    const url = `${API}/public/v1/sites/${SITE_KEY}/resolve?path=${encodeURIComponent(route)}&locale=${locale}`;
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      payloads.set(key, await res.json());
    } catch (e) {
      unreachable.push({ route, locale, reason: e.message });
    }
  }

  const rows = [];
  for (const op of ops) {
    if (CMS_OWNED_FIELDS.has(op.field)) {
      rows.push({ opId: op.opId, route: op.route, locale: op.locale, field: op.field, verdict: "CMS_OWNED" });
      continue;
    }
    const payload = payloads.get(`${op.locale} ${op.route}`);
    if (!payload) {
      rows.push({ opId: op.opId, route: op.route, locale: op.locale, field: op.field, verdict: "UNREACHABLE" });
      continue;
    }

    const declared = op.to;
    const live = liveValueOf(op, payload);
    const fixture = fixtureValueOf(op, inventory);
    const { verdict, reason } = verdictFor({ declared, live, fixture });

    rows.push({
      opId: op.opId, route: op.route, locale: op.locale, field: op.field, verdict, reason,
      checksums: {
        declared: fieldChecksum(declared),
        live: fieldChecksum(live),
        fixture: fieldChecksum(fixture),
      },
    });
  }

  /**
   * ACKNOWLEDGED DRIFT — the same device as KNOWN_CMS_DRIFT in
   * tests/contracts/cms-content-drift.spec.ts, and for the same reason: NEW
   * drift must fail immediately rather than be lost inside a long-standing red.
   *
   * It is not a mute. `resolvedButStillListed` below fails the gate when an
   * acknowledged field stops drifting, so the list can only shrink, and every
   * entry names a real record with a written reason.
   */
  let acknowledged = new Map();
  try {
    const ack = JSON.parse(readFileSync(ACK_FILE, "utf8"));
    acknowledged = new Map((ack.acknowledged ?? []).map((a) => [a.opId, a]));
  } catch { /* absent = nothing acknowledged, the strictest state */ }

  for (const row of rows) {
    if (row.verdict === "DRIFT" && acknowledged.has(row.opId)) {
      row.verdict = "ACKNOWLEDGED";
      row.acknowledgedReason = acknowledged.get(row.opId).reason;
    }
  }

  const resolvedButStillListed = rows
    .filter((r) => r.verdict === "CLEAN" && acknowledged.has(r.opId))
    .map((r) => r.opId);

  const drift = rows.filter((r) => r.verdict === "DRIFT");
  const tally = rows.reduce((acc, r) => { acc[r.verdict] = (acc[r.verdict] ?? 0) + 1; return acc; }, {});

  if (AS_JSON) {
    console.log(JSON.stringify({ tally, unreachable, rows }, null, 2));
  } else {
    log(`\ncontent drift gate — ${rows.length} repo-owned fields across ${payloads.size} resolved routes\n`);
    for (const r of rows) {
      log(`  ${r.opId.padEnd(22)} ${r.verdict.padEnd(11)} ${r.locale}  ${r.field.padEnd(20)} ${r.route}` +
          (r.reason && r.verdict === "DRIFT" ? `\n      ${r.reason}` +
            `\n      declared ${r.checksums.declared ?? "-"}\n      live     ${r.checksums.live ?? "-"}\n      fixture  ${r.checksums.fixture ?? "-"}` : ""));
    }
    log(`\nsummary: ${Object.entries(tally).map(([k, v]) => `${k}=${v}`).join("  ")}`);
    if (unreachable.length) log(`\nunreachable routes (${unreachable.length}): ${unreachable.map((u) => `${u.locale} ${u.route}`).join(", ")}`);
  }

  // A CMS that could not be reached is not a content verdict. Exiting 1 for it
  // would make "the CMS had a bad afternoon" indistinguishable from "the
  // content is wrong", which is the confusion every hermetic test in this
  // repository was written to avoid.
  if (unreachable.length > 0 && drift.length === 0) {
    console.error(`\ncontent drift gate: ${unreachable.length} route(s) unreachable; no verdict.`);
    process.exit(3);
  }
  if (resolvedButStillListed.length > 0) {
    console.error(`\nThese fields no longer drift — remove them from ${ACK_FILE}:`);
    for (const id of resolvedButStillListed) console.error(`  ${id}`);
    process.exit(1);
  }
  if (drift.length > 0) {
    console.error(`\nCONTENT DRIFT: ${drift.length} field(s) disagree across repo-declared target, live CMS and fixture.`);
    console.error("Publish, re-capture (node scripts/capture-cms-content.mjs), or correct the operation --");
    console.error("see docs/CMS_CONTENT_AUTHORITY.md. Not fixable by re-running.");
    process.exit(1);
  }
  const ackCount = rows.filter((r) => r.verdict === "ACKNOWLEDGED").length;
  log(
    ackCount === 0
      ? "\nCLEAN — every repo-owned field agrees across every source that has an opinion."
      : `\nNO NEW DRIFT — ${ackCount} field(s) still drift and are acknowledged in ` +
        `content/feelstack/drift-gate-acknowledged.json. That file is not a pass; it is a backlog.`,
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`content drift gate fatal: ${error.message}`);
    process.exit(2);
  });
}
