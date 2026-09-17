#!/usr/bin/env node
/**
 * FeelStack republishing utility — Blue Diamond Medical.
 *
 * Applies the field-level corrections in
 * `content/feelstack/republish-operations.json` to the FeelStack CMS, which
 * owns the published text on the affected routes. This repository's own static
 * data is already correct; in `hybrid` content mode the CMS record wins, so
 * only a CMS write changes what a visitor sees.
 *
 * WHY A SCRIPT RATHER THAN HAND-EDITING IN THE ADMIN UI
 * -----------------------------------------------------
 * 59 field-level edits across 20 records in two locales, each of which must
 * land verbatim. Hand-typing approved clinical copy 55 times is exactly the
 * process that produced the drift being corrected. This utility diffs against a
 * captured baseline, refuses to overwrite anything that changed underneath it,
 * and can put every byte back.
 *
 * MODES
 *   --mode=dry-run   (default) read-only. Needs NO credentials: compares live
 *                    values against the baseline via the PUBLIC resolve API and
 *                    reports what apply would do. Safe to run anywhere.
 *   --mode=backup    admin read. Writes a full pre-change snapshot of every
 *                    affected record and FAQ.
 *   --mode=apply     admin write. Implies backup first. Per operation:
 *                    conflict-check, skip-if-already-applied, PATCH, publish.
 *   --mode=verify    read-only. Re-reads the PUBLIC resolve API and confirms
 *                    each operation is live.
 *   --mode=rollback  admin write. Restores every value from a backup file.
 *
 * FLAGS
 *   --backup-dir=<path>  default: <repo>/../blue-diamond-cms-backups
 *                        Deliberately OUTSIDE the repository, and therefore
 *                        outside `public/` (the web root) — a CMS snapshot
 *                        holds unpublished editorial text and must never be
 *                        servable or committable.
 *   --backup-file=<path> rollback only: the snapshot to restore from.
 *   --only=<OP-001,...>  restrict to specific operation ids.
 *   --route=<substring>  restrict to operations whose route matches.
 *   --json               emit a machine-readable result document.
 *
 * CREDENTIALS (server-side environment only; never committed, never logged)
 *   FEELSTACK_API_URL
 *   FEELSTACK_ADMIN_PROJECT_ID
 *   FEELSTACK_ADMIN_USERNAME
 *   FEELSTACK_ADMIN_PASSWORD
 *   FEELSTACK_SITE_KEY            (public read, used by dry-run/verify)
 *   FEELSTACK_REVALIDATE_SECRET   REQUIRED for apply/rollback
 *   FEELSTACK_PROJECT_ID          REQUIRED for apply/rollback (tenant check)
 *   SITE_URL                      REQUIRED for apply/rollback
 *
 * Write modes refuse to run when any admin variable is missing. There is no
 * flag to bypass that. Since 2026-09-17 the same is true of the revalidation
 * variables for apply/rollback: updating the CMS without purging the route
 * cache is a release that reports success and changes nothing a visitor reads.
 *
 * SAFETY PROPERTIES
 *   - Idempotent. A value already equal to its target is reported ALREADY_
 *     APPLIED and skipped, so re-running duplicates no FAQ, paragraph or bio.
 *   - Conflict-detecting. If a live value matches neither the baseline nor the
 *     target, the operation is CONFLICT and is skipped, never overwritten.
 *   - Field-preserving. Entry writes GET the record, mutate only the named key
 *     inside `data`, and PATCH the merged object back.
 *   - Rows marked `verified.no-change` (PRP provider attribution) and `manual`
 *     are never sent to the API by any mode.
 *   - Secrets are redacted from every log line and from --json output.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHmac, randomUUID } from "node:crypto";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
/**
 * The operation set, TRACKED.
 *
 * It lived under `evidence/`, which .gitignore excludes, so this script — the
 * committed, reviewable, idempotent way to make these corrections — could not
 * run at all from a fresh checkout: the one artefact it is entirely driven by
 * was never in the clone. `evidence/` is the right home for a one-off harness
 * and its output; it is the wrong home for a program's input.
 */
const OPS_FILE = join(ROOT, "content", "feelstack", "republish-operations.json");

/* ------------------------------------------------------------------ args -- */
const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, "").split("=");
    return [k, v.length ? v.join("=") : "true"];
  }),
);
const MODE = args.get("mode") ?? "dry-run";
const AS_JSON = args.get("json") === "true";
const ONLY = args.get("only")?.split(",").map((s) => s.trim()).filter(Boolean) ?? null;
const ROUTE_FILTER = args.get("route") ?? null;
const BACKUP_DIR = args.get("backup-dir") ?? resolve(ROOT, "..", "blue-diamond-cms-backups");

const VALID_MODES = ["dry-run", "backup", "apply", "verify", "rollback"];
if (!VALID_MODES.includes(MODE)) {
  console.error(`Unknown --mode=${MODE}. Expected one of: ${VALID_MODES.join(", ")}`);
  process.exit(2);
}
const NEEDS_ADMIN = MODE === "backup" || MODE === "apply" || MODE === "rollback";

/* -------------------------------------------------------------- env/redact - */
const API = (process.env.FEELSTACK_API_URL ?? "").replace(/\/$/, "");
const PROJECT_ID = process.env.FEELSTACK_ADMIN_PROJECT_ID ?? "";
const USERNAME = process.env.FEELSTACK_ADMIN_USERNAME ?? "";
const PASSWORD = process.env.FEELSTACK_ADMIN_PASSWORD ?? "";
const SITE_KEY = process.env.FEELSTACK_SITE_KEY ?? "";
const REVALIDATE_SECRET = process.env.FEELSTACK_REVALIDATE_SECRET ?? "";
/**
 * SITE_URL wins over NEXT_PUBLIC_SITE_URL, matching .env.example and the rest
 * of the app. Reading only the NEXT_PUBLIC_ alias meant a host that had
 * correctly configured SITE_URL still took the "revalidation skipped" branch.
 */
const SITE_URL = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
/**
 * The revalidate endpoint asserts the event's projectId against
 * FEELSTACK_PROJECT_ID (tenant isolation — a valid signature proves the sender
 * holds the secret, not that the event is Blue Diamond's).
 */
const REVALIDATE_PROJECT_ID = process.env.FEELSTACK_PROJECT_ID ?? process.env.FEELSTACK_ADMIN_PROJECT_ID ?? "";

/** Every secret this process holds, longest first so overlaps redact fully. */
const SECRETS = [PASSWORD, REVALIDATE_SECRET, USERNAME]
  .filter((s) => s && s.length >= 4)
  .sort((a, b) => b.length - a.length);
let BEARER = null;

/** Scrub secrets (and any bearer token acquired at runtime) from a string. */
function redact(text) {
  let out = String(text);
  for (const s of [...SECRETS, BEARER].filter(Boolean)) {
    out = out.split(s).join("«redacted»");
  }
  return out.replace(/(Bearer\s+)[A-Za-z0-9._\-]+/gi, "$1«redacted»");
}
const log = (...parts) => { if (!AS_JSON) console.log(redact(parts.join(" "))); };
const warn = (...parts) => console.error(redact(parts.join(" ")));

/* ------------------------------------------------------------------ http -- */
/**
 * `rawBody` sends a pre-serialised string verbatim. Required by the signed
 * revalidation call: an HMAC is over bytes, and re-encoding an object here
 * would sign one string and transmit another.
 */
async function http(method, url, { body, rawBody, auth = false, headers = {} } = {}) {
  const h = { ...headers };
  if (body !== undefined) h["Content-Type"] = "application/json";
  if (auth) {
    if (!BEARER) throw new Error("internal: authenticated request before login");
    h.Authorization = `Bearer ${BEARER}`;
  }
  const res = await fetch(url, {
    method,
    headers: h,
    body: rawBody !== undefined ? rawBody : body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { /* non-JSON body */ }
  if (!res.ok) {
    const detail = redact(text).slice(0, 400);
    throw new Error(`${method} ${redact(url)} -> HTTP ${res.status} ${detail}`);
  }
  return parsed;
}

async function login() {
  const body = await http("POST", `${API}/auth/login`, {
    body: { username: USERNAME, password: PASSWORD },
  });
  const token = body?.access_token ?? body?.accessToken;
  if (!token) throw new Error("login succeeded but returned no access token");
  BEARER = token;              // registered with redact() from here on
  log("authenticated as the project admin user (token redacted)");
}

const adminBase = () => `${API}/admin/v1/projects/${PROJECT_ID}/content`;
const getEntry = (id) => http("GET", `${adminBase()}/entries/${id}`, { auth: true });
const patchEntry = (id, dto) => http("PATCH", `${adminBase()}/entries/${id}`, { body: dto, auth: true });
const patchFaq = (id, dto) => http("PATCH", `${adminBase()}/faqs/${id}`, { body: dto, auth: true });
const patchPerson = (id, dto) => http("PATCH", `${adminBase()}/people/${id}`, { body: dto, auth: true });
const listFaqs = () => http("GET", `${adminBase()}/faqs`, { auth: true });
const listPeople = () => http("GET", `${adminBase()}/people`, { auth: true });

/** Public, unauthenticated read — the same endpoint the site itself uses. */
async function publicResolve(path, locale) {
  const url = `${API}/public/v1/sites/${SITE_KEY}/resolve?path=${encodeURIComponent(path)}&locale=${locale}`;
  return http("GET", url);
}

/* ------------------------------------------------------- value extraction -- */
const eq = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** Current value for an operation, taken from a resolved public payload. */
function publicValueOf(op, payload) {
  const data = payload?.data ?? {};
  switch (op.kind) {
    case "entry.field.set":
      return data.fields?.[op.field];
    case "entry.seo.set":
      // The resolver returns seo already MERGED
      // (settings.defaultSeo <- section.seo <- entity.seo), which is exactly
      // what a crawler sees and therefore the right thing to compare against.
      // It is also why applying one of these can mean CREATING an entity-level
      // override rather than editing an existing value — applyOne says so when
      // it happens.
      return payload?.seo?.[op.field];
    case "entry.partnerNote.set":
      return data.fields?.external_partners?.[op.partnerIndex]?.note;
    case "person.biography.set":
      return data.biography;
    case "person.field.set":
      return data[op.field];
    case "faq.update": {
      const f = (payload?.relations?.faqs ?? []).find((q) => q.id === op.faqId);
      return f ? f[op.field] : undefined;
    }
    case "faq.archive": {
      // Public read returns only PUBLISHED faqs, so absence == archived.
      const f = (payload?.relations?.faqs ?? []).find((q) => q.id === op.faqId);
      return f ? "published" : "archived";
    }
    default:
      return undefined;
  }
}

/** Classify one operation against the value currently live. */
function classify(op, current) {
  if (current === undefined) return "UNREADABLE";
  if (eq(current, op.to)) return "ALREADY_APPLIED";
  if (eq(current, op.from)) return "READY";
  return "CONFLICT";
}

/* ------------------------------------------------------------------ load -- */
if (!existsSync(OPS_FILE)) {
  warn(`Operations file not found: ${OPS_FILE}`);
  process.exit(2);
}
const doc = JSON.parse(readFileSync(OPS_FILE, "utf8"));
let ops = doc.operations.filter((o) => o.applicable === true);
const excluded = doc.operations.filter((o) => o.applicable !== true);
if (ONLY) ops = ops.filter((o) => ONLY.includes(o.opId));
if (ROUTE_FILTER) ops = ops.filter((o) => (o.route ?? "").includes(ROUTE_FILTER));

/* --------------------------------------------------------- preconditions -- */
function requireEnv(names) {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) {
    warn(`\nMissing required environment variable(s): ${missing.join(", ")}`);
    warn(`Mode "${MODE}" performs CMS ${NEEDS_ADMIN ? "writes" : "reads"} and will not run without them.`);
    warn("Set them in the server-side environment for the duration of the run. Never commit them.\n");
    process.exit(3);
  }
}
requireEnv(["FEELSTACK_API_URL"]);
if (NEEDS_ADMIN) requireEnv(["FEELSTACK_ADMIN_PROJECT_ID", "FEELSTACK_ADMIN_USERNAME", "FEELSTACK_ADMIN_PASSWORD"]);
else requireEnv(["FEELSTACK_SITE_KEY"]);

/**
 * Modes that CHANGE published content must also be able to make the change
 * visible. `backup` is exempt: it writes a snapshot and mutates nothing, so
 * there is nothing to purge.
 *
 * This is a PRECONDITION, checked before the first write, not a warning after
 * the last one. An apply that cannot revalidate is an incomplete release, and
 * the time to find that out is before 70 published values have been changed.
 * There is no flag to bypass it, for the same reason there is none for the
 * admin credentials.
 */
const REVALIDATION_REQUIRED = MODE === "apply" || MODE === "rollback";
if (REVALIDATION_REQUIRED) {
  const missing = [];
  if (!REVALIDATE_SECRET) missing.push("FEELSTACK_REVALIDATE_SECRET");
  if (!SITE_URL) missing.push("SITE_URL (or NEXT_PUBLIC_SITE_URL)");
  if (!REVALIDATE_PROJECT_ID) missing.push("FEELSTACK_PROJECT_ID (or FEELSTACK_ADMIN_PROJECT_ID)");
  if (missing.length) {
    warn(`\nMissing revalidation configuration: ${missing.join(", ")}`);
    warn(`Mode "${MODE}" changes PUBLISHED content. Without revalidation the CMS would be`);
    warn("updated while every page kept serving the old text — a release that reports success");
    warn("and changes nothing a visitor reads. Refusing to run.\n");
    process.exit(3);
  }
}

/* ---------------------------------------------------------------- backup -- */
function writeBackup(records) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = join(BACKUP_DIR, `feelstack-backup-${stamp}.json`);
  writeFileSync(file, JSON.stringify({
    takenAt: new Date().toISOString(),
    projectId: PROJECT_ID,
    baselineCapture: doc.baselineCapture,
    note: "Pre-change snapshot. Contains unpublished editorial text — keep outside any web root and out of git.",
    records,
  }, null, 2), "utf8");
  return file;
}

/** Snapshot every record an operation set touches, via the admin API. */
async function snapshot(targetOps) {
  const entries = {}, faqs = {}, people = {};
  const allFaqs = await listFaqs();
  const allPeople = await listPeople();
  const faqById = new Map((allFaqs?.items ?? allFaqs ?? []).map((f) => [f.id, f]));
  const personById = new Map((allPeople?.items ?? allPeople ?? []).map((p) => [p.id, p]));
  for (const op of targetOps) {
    if (op.kind === "faq.update" || op.kind === "faq.archive") {
      if (!faqs[op.faqId]) faqs[op.faqId] = faqById.get(op.faqId) ?? { id: op.faqId, missing: true };
    } else if (op.kind === "person.biography.set" || op.kind === "person.field.set") {
      if (!people[op.recordId]) people[op.recordId] = personById.get(op.recordId) ?? { id: op.recordId, missing: true };
    } else if (!entries[op.recordId]) {
      entries[op.recordId] = await getEntry(op.recordId);
    }
  }
  return { entries, faqs, people };
}

/* ----------------------------------------------------------------- apply -- */
async function applyOne(op, entryCache) {
  switch (op.kind) {
    case "entry.field.set":
    case "entry.partnerNote.set": {
      let entry = entryCache.get(op.recordId);
      if (!entry) { entry = await getEntry(op.recordId); entryCache.set(op.recordId, entry); }
      // Preserve every field not named by this operation: clone `data`, mutate
      // only the target key, PATCH the merged object back.
      const data = JSON.parse(JSON.stringify(entry.data ?? {}));
      if (op.kind === "entry.field.set") {
        data[op.field] = op.to;
      } else {
        if (!Array.isArray(data.external_partners) || !data.external_partners[op.partnerIndex]) {
          throw new Error(`external_partners[${op.partnerIndex}] missing on ${op.recordId}`);
        }
        data.external_partners[op.partnerIndex].note = op.to;
      }
      const updated = await patchEntry(op.recordId, { data, status: "published" });
      entryCache.set(op.recordId, updated ?? { ...entry, data });
      return updated;
    }
    case "entry.seo.set": {
      let entry = entryCache.get(op.recordId);
      if (!entry) { entry = await getEntry(op.recordId); entryCache.set(op.recordId, entry); }
      // Same field-preserving shape as entry.field.set: clone, mutate only the
      // named key, PATCH the merged object back.
      const seo = { ...(entry.seo ?? {}) };
      if (entry.seo == null || entry.seo[op.field] === undefined) {
        // Said out loud rather than done quietly: the live value the
        // conflict-check matched came from a section or site default, so this
        // write ADDS an entity-level override. That is the intended outcome
        // for a route-specific description, but it is a different act from
        // editing a value the record already had.
        warn(`${op.opId}: no entity-level seo.${op.field} on ${op.route} — this write creates an override of the inherited value.`);
      }
      seo[op.field] = op.to;
      const updated = await patchEntry(op.recordId, { seo, status: "published" });
      entryCache.set(op.recordId, updated ?? { ...entry, seo });
      return updated;
    }
    case "faq.update":
      return patchFaq(op.faqId, { [op.field]: op.to, status: "published" });
    case "faq.archive":
      return patchFaq(op.faqId, { status: "archived" });
    case "person.biography.set":
      return patchPerson(op.recordId, { biography: op.to, status: "published" });
    case "person.field.set":
      return patchPerson(op.recordId, { [op.field]: op.to, status: "published" });
    default:
      throw new Error(`unsupported operation kind: ${op.kind}`);
  }
}

/** Reverse of applyOne, driven entirely by a backup snapshot. */
async function rollbackOne(op, backup, entryCache) {
  switch (op.kind) {
    case "entry.field.set":
    case "entry.partnerNote.set": {
      const saved = backup.records.entries[op.recordId];
      if (!saved) throw new Error(`no backup for entry ${op.recordId}`);
      let live = entryCache.get(op.recordId);
      if (!live) { live = await getEntry(op.recordId); entryCache.set(op.recordId, live); }
      const data = JSON.parse(JSON.stringify(live.data ?? {}));
      if (op.kind === "entry.field.set") data[op.field] = saved.data?.[op.field];
      else data.external_partners[op.partnerIndex].note = saved.data?.external_partners?.[op.partnerIndex]?.note;
      const updated = await patchEntry(op.recordId, { data, status: saved.status ?? "published" });
      entryCache.set(op.recordId, updated ?? { ...live, data });
      return updated;
    }
    case "entry.seo.set": {
      const saved = backup.records.entries[op.recordId];
      if (!saved) throw new Error(`no backup for entry ${op.recordId}`);
      let live = entryCache.get(op.recordId);
      if (!live) { live = await getEntry(op.recordId); entryCache.set(op.recordId, live); }
      const seo = { ...(live.seo ?? {}) };
      const before = saved.seo?.[op.field];
      // Restoring "the field was not there" has to DELETE it, not write
      // undefined: an entity-level key set to undefined still shadows the
      // inherited value on some serializers, which would leave the record in a
      // third state that is neither before nor after.
      if (before === undefined) delete seo[op.field];
      else seo[op.field] = before;
      const updated = await patchEntry(op.recordId, { seo, status: saved.status ?? "published" });
      entryCache.set(op.recordId, updated ?? { ...live, seo });
      return updated;
    }
    case "faq.update": {
      const saved = backup.records.faqs[op.faqId];
      if (!saved) throw new Error(`no backup for faq ${op.faqId}`);
      return patchFaq(op.faqId, { [op.field]: saved[op.field], status: saved.status ?? "published" });
    }
    case "faq.archive": {
      const saved = backup.records.faqs[op.faqId];
      return patchFaq(op.faqId, { status: saved?.status ?? "published" });
    }
    case "person.biography.set":
    case "person.field.set": {
      const saved = backup.records.people[op.recordId];
      if (!saved) throw new Error(`no backup for person ${op.recordId}`);
      return patchPerson(op.recordId, { [op.field]: saved[op.field], status: saved.status ?? "published" });
    }
    default:
      throw new Error(`unsupported operation kind: ${op.kind}`);
  }
}

/* ------------------------------------------------------------ revalidate -- */
/**
 * A WRITE MODE'S REVALIDATION IS PART OF THE WRITE, NOT AN OPTIONAL EXTRA.
 *
 * Two defects lived in the previous version of this function, and both were
 * silent by construction:
 *
 *  1. IT SKIPPED. Missing config logged a warning and returned success. An
 *     apply run that changed 70 published values and invalidated nothing
 *     exited 0 and reported APPLIED for every operation, while every page kept
 *     serving the old text. "The CMS was updated" and "the site shows it" are
 *     different claims, and only the second one matters to a patient reading
 *     the page.
 *
 *  2. IT WAS UNAUTHENTICATED-BY-ACCIDENT. It sent `x-feelstack-secret` and a
 *     `{ projectId, path }` body. The endpoint
 *     (src/app/api/feelstack/revalidate/route.ts ->
 *     processRevalidationRequest) has never accepted either: it requires
 *     `x-feelstack-signature: sha256=<hex>` over `${timestamp}.${rawBody}`,
 *     an `x-feelstack-timestamp` in unix SECONDS, and the canonical FeelStack
 *     envelope. Every call this function ever made was rejected 401 before the
 *     body was parsed — and `http()` throws on a non-2xx, so the error was
 *     caught into `{ ok: false }` and then never checked by either caller.
 *     Fire-and-forget hid a request that could not have worked.
 *
 * So: for a write mode, missing revalidation configuration is a precondition
 * failure (see requireEnv below), and a route that does not come back
 * `revalidated: true` marks the release INCOMPLETE and fails the run. Targeted
 * per-route invalidation, never a global purge — the endpoint resolves each
 * path to its own cache tags.
 */
function signedRevalidationRequest(cmsPath) {
  const envelope = {
    id: randomUUID(),
    type: "content.page.published",
    projectId: REVALIDATE_PROJECT_ID,
    occurredAt: new Date().toISOString(),
    path: cmsPath,
    data: { path: cmsPath },
  };
  // The signature covers the EXACT bytes that are sent. Serialise once and
  // transmit that string verbatim — re-stringifying the object for the request
  // body would be a second serialisation that is only incidentally identical.
  const rawBody = JSON.stringify(envelope);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = createHmac("sha256", REVALIDATE_SECRET).update(`${timestamp}.${rawBody}`).digest("hex");
  return {
    rawBody,
    headers: {
      "Content-Type": "application/json",
      "x-feelstack-timestamp": timestamp,
      "x-feelstack-signature": `sha256=${signature}`,
    },
  };
}

async function revalidate(routes, { required }) {
  if (!REVALIDATE_SECRET || !SITE_URL || !REVALIDATE_PROJECT_ID) {
    const missing = [
      REVALIDATE_SECRET ? null : "FEELSTACK_REVALIDATE_SECRET",
      SITE_URL ? null : "SITE_URL (or NEXT_PUBLIC_SITE_URL)",
      REVALIDATE_PROJECT_ID ? null : "FEELSTACK_PROJECT_ID",
    ].filter(Boolean);
    if (required) {
      // Reached only if requireEnv was bypassed; kept as a second gate because
      // this is the branch that used to make an incomplete release look clean.
      throw new Error(`revalidation is required for this mode but ${missing.join(", ")} is unset`);
    }
    warn(`revalidate: skipped — ${missing.join(", ")} unset.`);
    warn("           Pages will serve cached text until the route cache expires.");
    return { skipped: true, ok: true, results: [] };
  }

  const results = [];
  for (const path of routes) {
    try {
      const { rawBody, headers } = signedRevalidationRequest(path);
      const body = await http("POST", `${SITE_URL}/api/feelstack/revalidate`, { rawBody, headers });
      // 200 is not success. The endpoint answers 200 with
      // `revalidated: false` for an event it understood and deliberately
      // ignored (unsupported locale, companion-invalidated, backend event
      // gap) — which for this tool means the page was NOT purged.
      const ok = body?.revalidated === true;
      results.push({
        path,
        ok,
        tags: body?.tags,
        reason: ok ? undefined : (body?.ignored ?? body?.backendEventGap ?? body?.companionInvalidated ?? "revalidated:false"),
      });
      if (!ok) warn(`  revalidate ${path}: NOT revalidated (${results.at(-1).reason})`);
    } catch (e) {
      results.push({ path, ok: false, reason: redact(e.message) });
      warn(`  revalidate ${path}: ERROR ${redact(e.message)}`);
    }
  }
  return { skipped: false, ok: results.every((r) => r.ok), results };
}

/* ------------------------------------------------------------------ main -- */
const results = [];
const started = new Date().toISOString();

async function readCurrentPublic(op) {
  try {
    const payload = await publicResolve(op.route, op.locale);
    return publicValueOf(op, payload);
  } catch {
    return undefined;
  }
}

try {
  log(`\nFeelStack republish — mode=${MODE}`);
  log(`operations: ${ops.length} applicable` +
      (excluded.length ? `, ${excluded.length} excluded (manual / verified-no-change, never written)` : ""));

  if (MODE === "dry-run" || MODE === "verify") {
    for (const op of ops) {
      const current = await readCurrentPublic(op);
      const state = classify(op, current);
      const status = MODE === "verify"
        ? (state === "ALREADY_APPLIED" ? "VERIFIED_LIVE" : state === "CONFLICT" ? "CONFLICT" : "NOT_LIVE")
        : state;
      results.push({ opId: op.opId, route: op.route, locale: op.locale, field: op.field, kind: op.kind, status });
      log(`  ${op.opId}  ${status.padEnd(16)} ${op.locale}  ${op.field}  ${op.route}`);
    }
  } else {
    await login();
    log(`taking pre-change snapshot -> ${BACKUP_DIR}`);
    const snap = await snapshot(ops);
    const backupFile = writeBackup(snap);
    log(`backup written: ${backupFile}`);

    if (MODE === "backup") {
      results.push({ backupFile, records: Object.keys(snap.entries).length + Object.keys(snap.faqs).length + Object.keys(snap.people).length });
    } else if (MODE === "apply") {
      const entryCache = new Map();
      for (const op of ops) {
        const current = await readCurrentPublic(op);
        const state = classify(op, current);
        if (state !== "READY") {
          results.push({ opId: op.opId, route: op.route, locale: op.locale, field: op.field, status: state });
          log(`  ${op.opId}  ${state.padEnd(16)} SKIPPED  ${op.route}`);
          continue;
        }
        try {
          const updated = await applyOne(op, entryCache);
          results.push({
            opId: op.opId, route: op.route, locale: op.locale, field: op.field, status: "APPLIED",
            revisionId: updated?.id ?? op.recordId ?? op.faqId,
            revisionUpdatedAt: updated?.updatedAt ?? updated?.publishedAt ?? new Date().toISOString(),
          });
          log(`  ${op.opId}  APPLIED          ${op.locale}  ${op.field}  ${op.route}`);
        } catch (e) {
          results.push({ opId: op.opId, route: op.route, status: "ERROR", error: redact(e.message) });
          warn(`  ${op.opId}  ERROR  ${redact(e.message)}`);
        }
      }
      const routes = [...new Set(ops.map((o) => o.route))];
      const rv = await revalidate(routes, { required: REVALIDATION_REQUIRED });
      log(`revalidated ${rv.results.filter((r) => r.ok).length}/${routes.length} routes`);
      for (const r of rv.results) {
        results.push({ opId: `REVALIDATE:${r.path}`, route: r.path, status: r.ok ? "REVALIDATED" : "REVALIDATE_FAILED", error: r.reason });
      }
      if (!rv.ok) {
        warn("\nRELEASE INCOMPLETE: the CMS was updated but one or more routes were not revalidated.");
        warn("Visitors will keep seeing the previous text on those routes until the cache expires.");
      }
      log(`\nbackup for rollback: ${backupFile}`);
    } else if (MODE === "rollback") {
      const file = args.get("backup-file");
      if (!file) { warn("--mode=rollback requires --backup-file=<path>"); process.exit(2); }
      const backup = JSON.parse(readFileSync(file, "utf8"));
      const entryCache = new Map();
      for (const op of ops) {
        try {
          await rollbackOne(op, backup, entryCache);
          results.push({ opId: op.opId, route: op.route, status: "ROLLED_BACK" });
          log(`  ${op.opId}  ROLLED_BACK      ${op.route}`);
        } catch (e) {
          results.push({ opId: op.opId, route: op.route, status: "ERROR", error: redact(e.message) });
          warn(`  ${op.opId}  ERROR  ${redact(e.message)}`);
        }
      }
      const rbRoutes = [...new Set(ops.map((o) => o.route))];
      const rbRv = await revalidate(rbRoutes, { required: REVALIDATION_REQUIRED });
      for (const r of rbRv.results) {
        results.push({ opId: `REVALIDATE:${r.path}`, route: r.path, status: r.ok ? "REVALIDATED" : "REVALIDATE_FAILED", error: r.reason });
      }
      if (!rbRv.ok) warn("\nROLLBACK INCOMPLETE: values were restored but one or more routes were not revalidated.");
    }
  }

  const tally = results.reduce((acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; }, {});
  if (AS_JSON) {
    console.log(JSON.stringify({ mode: MODE, started, finished: new Date().toISOString(), tally, results }, null, 2));
  } else {
    log("\nsummary: " + (Object.entries(tally).map(([k, v]) => `${k}=${v}`).join("  ") || "nothing to do"));
    if (excluded.length) {
      log(`\nnever written by this tool (${excluded.length}):`);
      for (const e of excluded) log(`  ${e.opId}  ${e.kind.padEnd(18)} ${e.locale}  ${e.route}`);
    }
  }
  // REVALIDATE_FAILED counts. A release whose content never became visible did
  // not succeed, whatever the PATCHes reported.
  const bad = results.filter(
    (r) => r.status === "ERROR" || r.status === "CONFLICT" || r.status === "REVALIDATE_FAILED",
  ).length;
  process.exit(bad ? 1 : 0);
} catch (e) {
  warn(`\nfatal: ${redact(e.message)}`);
  process.exit(1);
}
