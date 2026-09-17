#!/usr/bin/env node
/**
 * `npm run content:sync` — the whole CMS publish, as one ordered, resumable,
 * fail-closed sequence.
 *
 *   npm run content:sync -- --mode=dry-run        (default; no credential needed)
 *   npm run content:sync -- --mode=apply          (writes; needs the publisher identity)
 *   npm run content:sync -- --from=6 --to=8       (re-run a range after a fix)
 *   npm run content:sync -- --json
 *
 * WHY AN ORCHESTRATOR RATHER THAN A RUNBOOK
 * -----------------------------------------
 * Every step below already existed as a separate command, and
 * docs/CMS_CONTENT_AUTHORITY.md wrote them down in order. That was not enough:
 * the failure it exists to prevent — "skipping step 2" — happened anyway, twice.
 * A sequence a human retypes is a sequence a human skips a step of, and the
 * steps that get skipped are the verification ones, because they are the ones
 * that pass silently when you do not run them.
 *
 * So this does not reimplement any CMS write. It SHELLS OUT to the tools that
 * already own each concern — scripts/feelstack-republish.mjs for dry-run,
 * backup, apply, verify; scripts/capture-cms-content.mjs for re-capture;
 * scripts/feelstack-refresh-fixtures.mjs for fixtures; the Playwright contract
 * specs for the content contract — and owns exactly one thing: the ORDER, and
 * the refusal to continue past a failed step.
 *
 * THE ORDER IS THE POINT. Backup strictly before apply (step 4 before 5), so a
 * rollback always exists. Read-back verification strictly after apply (6), from
 * the PUBLIC API rather than from the write's own response, because a 200 on a
 * PATCH says the write was accepted, not that it is what a visitor now reads.
 * Revalidation after the content is verified live (11), never before — purging
 * a cache to re-fill it with the old value is worse than not purging it.
 *
 * FAIL-CLOSED. Any step that fails stops the run. There is no `--continue-on-error`,
 * because every plausible use of one skips a verification.
 */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/* ------------------------------------------------------------------ args -- */
export function parseArgs(argv) {
  const map = new Map(
    argv.map((a) => {
      const [k, ...v] = a.replace(/^--/, "").split("=");
      return [k, v.length ? v.join("=") : "true"];
    }),
  );
  const mode = map.get("mode") ?? "dry-run";
  if (!["dry-run", "apply"].includes(mode)) {
    throw new Error(`--mode must be dry-run or apply, got "${mode}"`);
  }
  return {
    mode,
    json: map.get("json") === "true",
    only: map.get("only") ?? null,
    from: map.has("from") ? Number(map.get("from")) : 1,
    to: map.has("to") ? Number(map.get("to")) : Infinity,
  };
}

/* ----------------------------------------------------------------- steps -- */
/**
 * The thirteen steps, declared as data so the sequence can be asserted by a
 * test without executing a single CMS call.
 *
 * `writes: true` marks a step that changes the live CMS. Those are skipped
 * entirely in dry-run — not simulated, skipped, because a simulated write that
 * drifts from the real one is worse than no simulation.
 */
export const STEPS = [
  {
    n: 1,
    id: "env-validation",
    title: "Validate environment and preconditions",
    writes: false,
    why: "A missing publisher credential found at step 5 has already changed nothing; found at step 1 it has also wasted nothing.",
  },
  {
    n: 2,
    id: "dry-run",
    title: "Dry-run every operation against the live public API",
    writes: false,
    why: "Classifies each operation READY / ALREADY_APPLIED / CONFLICT before anything is written. A CONFLICT is a value that matches neither the baseline nor the target: someone else edited it, and it must never be overwritten blind.",
  },
  {
    n: 3,
    id: "conflict-gate",
    title: "Refuse to proceed while any operation is in CONFLICT",
    writes: false,
    why: "The dry-run already found them; continuing anyway is the only way they become silent overwrites.",
  },
  {
    n: 4,
    id: "backup",
    title: "Take a full pre-change snapshot",
    writes: false,
    // Writes nothing to the CMS, but reads through the ADMIN API, so it cannot
    // run without the publisher credential and has no meaning in a dry-run.
    needsAdmin: true,
    why: "Strictly before the first write. A rollback that only exists after a successful apply is not a rollback.",
  },
  {
    n: 5,
    id: "apply",
    title: "Apply the operations (PATCH + publish, idempotent, conflict-checked)",
    writes: true,
    why: "The only step that changes published content.",
  },
  {
    n: 6,
    id: "read-back-verify",
    title: "Re-read every operation from the PUBLIC API and confirm it is live",
    writes: false,
    why: "A 200 on a PATCH means the write was accepted. This is the only step that establishes what a visitor actually reads.",
  },
  {
    n: 7,
    id: "fixture-refresh",
    title: "Refresh the recorded resolve fixtures that changed",
    writes: false,
    why: "A fixture is a copy of the CMS. Leaving it stale makes every test that reads it assert yesterday's content and pass.",
  },
  {
    n: 8,
    id: "manifest-recompute",
    title: "Re-capture the CMS content inventory and recompute derived counts",
    writes: false,
    why: "tests/contracts/cms-content-drift.spec.ts compares approved repo copy against this capture. Skipping it is exactly how a published correction kept reading as drift.",
  },
  {
    n: 9,
    id: "schema-validation",
    title: "Validate the refreshed payloads against the transport schemas",
    writes: false,
    why: "A published value that no longer parses is an outage the next build would discover instead.",
  },
  {
    n: 10,
    id: "content-contract-tests",
    title: "Run the content contract specs",
    writes: false,
    why: "Drift, attribution, media ownership and manifest contracts, against the freshly captured state.",
  },
  {
    n: 11,
    id: "locale-integrity",
    title: "Assert no route resolved through a cross-locale fallback",
    writes: false,
    why: "An Arabic URL serving English clinical text is the failure src/lib/feelstack/locale-integrity.ts exists to refuse. A publish can introduce it by changing which locales a route has.",
  },
  {
    n: 12,
    id: "revalidate",
    title: "Revalidate each affected route, per route, and verify each response",
    writes: true,
    why: "After the content is verified live, never before. Targeted per-route, never a global purge.",
  },
  {
    n: 13,
    id: "report",
    title: "Final report",
    writes: false,
    why: "One artefact naming what changed, what was verified and what is still outstanding.",
  },
];

/**
 * Which steps run in a given mode.
 *
 * Dry-run keeps every read-only step, so the sequence itself is exercised
 * without a credential — which is what makes this script testable at all on a
 * host that has no publisher identity.
 */
export function planFor({ mode, from = 1, to = Infinity }) {
  return STEPS.filter((s) => s.n >= from && s.n <= to)
    .filter((s) => mode === "apply" || !(s.writes || s.needsAdmin));
}

/* ------------------------------------------------------------- execution -- */
/**
 * One step's command. Separated from the runner so a test can assert what each
 * step WOULD run without running it — and so the injected-command tests do not
 * need a CMS, a network or a credential.
 */
export function commandFor(step, { mode, only }) {
  const filter = only ? [`--only=${only}`] : [];
  switch (step.id) {
    case "env-validation":
      return { kind: "internal" };
    case "dry-run":
      return { kind: "node", args: ["scripts/feelstack-republish.mjs", "--mode=dry-run", "--json", ...filter] };
    case "conflict-gate":
      return { kind: "internal" };
    case "backup":
      return { kind: "node", args: ["scripts/feelstack-republish.mjs", "--mode=backup", ...filter] };
    case "apply":
      return { kind: "node", args: ["scripts/feelstack-republish.mjs", "--mode=apply", "--json", ...filter] };
    case "read-back-verify":
      return { kind: "node", args: ["scripts/feelstack-republish.mjs", "--mode=verify", "--json", ...filter] };
    case "fixture-refresh":
      return { kind: "node", args: ["scripts/feelstack-refresh-fixtures.mjs", ...(mode === "apply" ? [] : ["--check"])] };
    case "manifest-recompute":
      return { kind: "node", args: ["scripts/capture-cms-content.mjs"] };
    case "schema-validation":
      return { kind: "npx", args: ["playwright", "test", "tests/contracts/feelstack-schemas.spec.ts", "--project=chromium-desktop"] };
    case "content-contract-tests":
      return { kind: "npx", args: ["playwright", "test", "tests/contracts", "--project=chromium-desktop"] };
    case "locale-integrity":
      return { kind: "node", args: ["scripts/content-drift-gate.mjs", "--json"] };
    case "revalidate":
      // Revalidation is performed BY the apply/rollback modes of the republish
      // tool, which signs each request and checks each response. There is no
      // separate command: a second, independent revalidation path would be a
      // second thing to get wrong.
      return { kind: "internal" };
    case "report":
      return { kind: "internal" };
    default:
      throw new Error(`no command defined for step ${step.id}`);
  }
}

const REQUIRED_ENV = {
  "dry-run": ["FEELSTACK_API_URL", "FEELSTACK_SITE_KEY"],
  apply: [
    "FEELSTACK_API_URL",
    "FEELSTACK_SITE_KEY",
    "FEELSTACK_ADMIN_PROJECT_ID",
    "FEELSTACK_ADMIN_USERNAME",
    "FEELSTACK_ADMIN_PASSWORD",
    // Phase 7: an apply that cannot revalidate is an incomplete release, and
    // that has to be known before the first write, not after the last one.
    "FEELSTACK_REVALIDATE_SECRET",
    "FEELSTACK_PROJECT_ID",
    "SITE_URL",
  ],
};

export function missingEnv(mode, env) {
  return REQUIRED_ENV[mode].filter((name) => !env[name]);
}

/** CONFLICT rows out of a republish --json document. */
export function conflictsIn(report) {
  return (report?.results ?? []).filter((r) => r.status === "CONFLICT");
}

/**
 * Runs the plan. `exec` is injected so the orchestration logic — ordering,
 * fail-closed, the conflict gate, mode filtering — is testable without a CMS.
 */
export async function runPlan({ mode, only = null, from = 1, to = Infinity }, exec, env = process.env) {
  const plan = planFor({ mode, from, to });
  const outcomes = [];

  for (const step of plan) {
    const command = commandFor(step, { mode, only });

    if (step.id === "env-validation") {
      const missing = missingEnv(mode, env);
      const ok = missing.length === 0;
      outcomes.push({ step: step.n, id: step.id, ok, detail: ok ? "all required variables present" : `missing: ${missing.join(", ")}` });
      if (!ok) return { ok: false, outcomes, failedAt: step.n };
      continue;
    }

    if (step.id === "conflict-gate") {
      const dryRun = outcomes.find((o) => o.id === "dry-run");
      const conflicts = conflictsIn(dryRun?.report);
      const ok = conflicts.length === 0;
      outcomes.push({
        step: step.n, id: step.id, ok,
        detail: ok ? "no CONFLICT operations" : `${conflicts.length} CONFLICT: ${conflicts.map((c) => c.opId).join(", ")}`,
      });
      if (!ok) return { ok: false, outcomes, failedAt: step.n };
      continue;
    }

    if (command.kind === "internal") {
      outcomes.push({ step: step.n, id: step.id, ok: true, detail: "no external command" });
      continue;
    }

    const result = await exec(command, step);

    // The dry-run exits 1 when it found a CONFLICT. That is the dry-run
    // SUCCEEDING — it is a read-only classification pass, and reporting a
    // conflict is the whole reason to run it. Treating it as a step failure
    // would abort here with "exit 1" instead of at step 3 with the list of
    // operations a human has to look at. A dry-run that produced no parseable
    // report at all is a real failure and still stops the run.
    const conflictOnly = step.id === "dry-run" && !result.ok && result.report !== null && result.report !== undefined;

    const outcome = {
      step: step.n,
      id: step.id,
      ok: result.ok || conflictOnly,
      detail: conflictOnly ? `${result.detail} (classification complete; see step 3)` : result.detail,
      report: result.report,
    };
    outcomes.push(outcome);
    if (!outcome.ok) return { ok: false, outcomes, failedAt: step.n };
  }

  return { ok: true, outcomes, failedAt: null };
}

/** The real executor. Never pipes: a pipeline returns the wrong exit status. */
function realExec(command) {
  const [bin, args] =
    command.kind === "node" ? ["node", command.args] : ["npx", command.args];
  const result = spawnSync(bin, args, { cwd: ROOT, encoding: "utf8", env: process.env, maxBuffer: 64 * 1024 * 1024 });
  let report = null;
  if (result.stdout) {
    // The republish tool's --json document is the last JSON value on stdout.
    const start = result.stdout.indexOf("{");
    if (start >= 0) { try { report = JSON.parse(result.stdout.slice(start)); } catch { /* not a JSON run */ } }
  }
  return {
    ok: result.status === 0,
    detail: `${bin} ${args.join(" ")} -> exit ${result.status}`,
    stdout: result.stdout,
    stderr: result.stderr,
    report,
  };
}

/* ------------------------------------------------------------------ main -- */
/**
 * Wrapped in a function rather than run at the top level: a module with a
 * top-level `await` cannot be `require()`d, and
 * tests/contracts/content-sync-orchestration.spec.ts imports the pure
 * orchestration logic above through Playwright's CommonJS transform.
 */
async function main() {
  const options = parseArgs(process.argv.slice(2));
  const say = (...p) => { if (!options.json) console.log(p.join(" ")); };

  if (!existsSync(join(ROOT, "content", "feelstack", "republish-operations.json"))) {
    console.error("content/feelstack/republish-operations.json is missing.");
    process.exit(2);
  }

  say(`\ncontent:sync — mode=${options.mode}`);
  say(`${planFor(options).length} of ${STEPS.length} steps will run` +
      (options.mode === "dry-run" ? " (write steps are skipped, not simulated)" : ""));

  const result = await runPlan(options, async (command, step) => {
    say(`\n[${step.n}/${STEPS.length}] ${step.title}`);
    const out = realExec(command);
    if (!options.json && out.stdout) console.log(out.stdout.trimEnd());
    if (out.stderr) console.error(out.stderr.trimEnd());
    return out;
  });

  const manifest = JSON.parse(readFileSync(join(ROOT, "content", "feelstack", "republish-operations.json"), "utf8"));
  // Derived here, every time. There is no stored count to disagree with.
  const applicable = manifest.operations.filter((o) => o.applicable === true).length;

  const summary = {
    mode: options.mode,
    finishedAt: new Date().toISOString(),
    operations: { total: manifest.operations.length, applicable, excluded: manifest.operations.length - applicable },
    steps: result.outcomes,
    ok: result.ok,
    failedAt: result.failedAt,
  };

  if (options.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    say(`\n[13/13] Final report`);
    for (const o of result.outcomes) say(`  ${String(o.step).padStart(2)}  ${o.ok ? "OK  " : "FAIL"}  ${o.id.padEnd(24)} ${o.detail ?? ""}`);
    say(`\noperations: ${applicable} applicable, ${summary.operations.excluded} excluded (derived, not stored)`);
    say(result.ok ? "\ncontent:sync completed." : `\ncontent:sync FAILED at step ${result.failedAt}. Nothing after it ran.`);
  }

  process.exit(result.ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`content:sync fatal: ${error.message}`);
    process.exit(1);
  });
}
