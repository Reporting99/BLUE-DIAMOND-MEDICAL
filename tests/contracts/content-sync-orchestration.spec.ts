import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
/**
 * Loaded with a dynamic import, deliberately.
 *
 * Playwright transpiles a spec to CommonJS, and a `.mjs` module is always
 * loaded as ESM by Node — so a static import of the orchestrator from here
 * fails with "exports is not defined in ES module scope" before a single
 * assertion runs. `await import()` is the one form that crosses that boundary.
 * The alternative — moving the pure logic into a `.ts` module the script
 * cannot import — would split the orchestrator in two.
 */
type SyncModule = typeof import("../../scripts/content-sync.mjs");

let STEPS: SyncModule["STEPS"];
let commandFor: SyncModule["commandFor"];
let conflictsIn: SyncModule["conflictsIn"];
let missingEnv: SyncModule["missingEnv"];
let parseArgs: SyncModule["parseArgs"];
let planFor: SyncModule["planFor"];
let runPlan: SyncModule["runPlan"];

test.beforeAll(async () => {
  ({ STEPS, commandFor, conflictsIn, missingEnv, parseArgs, planFor, runPlan } = await import(
    "../../scripts/content-sync.mjs"
  ));
});

/**
 * PROPERTIES 9, 10, 11 — `npm run content:sync` orchestration.
 *
 * Every FeelStack call is injected, so this proves the ORDER, the fail-closed
 * behaviour and the mode filtering without a CMS, a credential or a network.
 * That separation is the reason the orchestrator shells out instead of
 * reimplementing writes: the only thing left to test here is the thing that
 * kept going wrong, which is the sequence.
 */

const APPLY_ENV: NodeJS.ProcessEnv = {
  NODE_ENV: "test",
  FEELSTACK_API_URL: "https://cms.invalid/api",
  FEELSTACK_SITE_KEY: "blue-diamond-medical",
  FEELSTACK_ADMIN_PROJECT_ID: "p",
  FEELSTACK_ADMIN_USERNAME: "u",
  FEELSTACK_ADMIN_PASSWORD: "p",
  FEELSTACK_REVALIDATE_SECRET: "s",
  FEELSTACK_PROJECT_ID: "p",
  SITE_URL: "https://example.invalid",
};

/** Records every step that ran, and lets a chosen step fail. */
function recorder(failAt?: string, reports: Record<string, unknown> = {}) {
  const ran: string[] = [];
  return {
    ran,
    exec: async (_command: unknown, step: { id: string }) => {
      ran.push(step.id);
      return {
        ok: step.id !== failAt,
        detail: `stub ${step.id}`,
        report: reports[step.id],
      };
    },
  };
}

test.describe("the thirteen steps", () => {
  test("there are exactly thirteen, numbered 1..13, with unique ids", () => {
    expect(STEPS).toHaveLength(13);
    expect(STEPS.map((s: { n: number }) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    expect(new Set(STEPS.map((s: { id: string }) => s.id)).size).toBe(13);
  });

  test("every step says why it exists — a runbook step nobody can justify is one that gets skipped", () => {
    for (const step of STEPS as { id: string; why: string }[]) {
      expect(step.why?.length ?? 0, `step ${step.id} has no rationale`).toBeGreaterThan(40);
    }
  });

  test("the ORDER holds the invariants: backup before apply, verify after apply, revalidate after verify", () => {
    const at = (id: string) => (STEPS as { id: string; n: number }[]).find((s) => s.id === id)!.n;
    // A rollback that only exists after a successful apply is not a rollback.
    expect(at("backup")).toBeLessThan(at("apply"));
    // A 200 on a PATCH is not evidence about what a visitor reads.
    expect(at("apply")).toBeLessThan(at("read-back-verify"));
    // Purging a cache to re-fill it with the old value is worse than not purging.
    expect(at("read-back-verify")).toBeLessThan(at("revalidate"));
    // Fixtures and the capture reflect the CMS, so they follow it.
    expect(at("read-back-verify")).toBeLessThan(at("fixture-refresh"));
    expect(at("fixture-refresh")).toBeLessThan(at("manifest-recompute"));
    expect(at("manifest-recompute")).toBeLessThan(at("content-contract-tests"));
    expect(at("report")).toBe(13);
  });
});

test.describe("mode filtering", () => {
  test("dry-run runs no step that writes or needs a credential", () => {
    const plan = planFor({ mode: "dry-run" }) as { id: string; writes?: boolean; needsAdmin?: boolean }[];
    expect(plan.some((s) => s.writes)).toBe(false);
    expect(plan.some((s) => s.needsAdmin)).toBe(false);
    expect(plan.map((s) => s.id)).not.toContain("apply");
    expect(plan.map((s) => s.id)).not.toContain("backup");
  });

  test("apply runs all thirteen", () => {
    expect(planFor({ mode: "apply" })).toHaveLength(13);
  });

  test("--from/--to restrict the range without reordering it", () => {
    const plan = planFor({ mode: "apply", from: 4, to: 6 }) as { n: number }[];
    expect(plan.map((s) => s.n)).toEqual([4, 5, 6]);
  });

  test("an unknown mode is refused rather than defaulted", () => {
    expect(() => parseArgs(["--mode=publish"])).toThrow(/dry-run or apply/);
    expect(parseArgs([]).mode).toBe("dry-run");
  });
});

test.describe("preconditions", () => {
  test("apply requires the revalidation variables, not only the admin ones", () => {
    const adminOnly = { ...APPLY_ENV, FEELSTACK_REVALIDATE_SECRET: "", SITE_URL: "" };
    const missing = missingEnv("apply", adminOnly);
    expect(missing).toContain("FEELSTACK_REVALIDATE_SECRET");
    expect(missing).toContain("SITE_URL");
  });

  test("dry-run needs only the public read configuration", () => {
    expect(missingEnv("dry-run", { FEELSTACK_API_URL: "x", FEELSTACK_SITE_KEY: "y" })).toEqual([]);
  });

  test("a missing variable stops the run at step 1, before anything is touched", async () => {
    const { ran, exec } = recorder();
    const result = await runPlan({ mode: "apply" }, exec, { NODE_ENV: "test", FEELSTACK_API_URL: "x" } as NodeJS.ProcessEnv);
    expect(result.ok).toBe(false);
    expect(result.failedAt).toBe(1);
    expect(ran, "nothing may run after a failed precondition").toEqual([]);
  });
});

test.describe("fail-closed", () => {
  test("a failed step stops everything after it", async () => {
    const { ran, exec } = recorder("apply", { "dry-run": { results: [] } });
    const result = await runPlan({ mode: "apply" }, exec, APPLY_ENV);
    expect(result.ok).toBe(false);
    expect(result.failedAt).toBe(5);
    // read-back-verify, fixture-refresh, revalidate and the rest must not run.
    expect(ran).toEqual(["dry-run", "backup", "apply"]);
  });

  test("a CONFLICT found in the dry-run blocks the apply", async () => {
    const { ran, exec } = recorder(undefined, {
      "dry-run": { results: [{ opId: "OP-001", status: "CONFLICT" }, { opId: "OP-002", status: "READY" }] },
    });
    const result = await runPlan({ mode: "apply" }, exec, APPLY_ENV);
    expect(result.ok).toBe(false);
    expect(result.failedAt).toBe(3);
    expect(ran, "an operation whose live value matches neither baseline nor target must never be overwritten").not.toContain("apply");
    expect(result.outcomes.at(-1)?.detail).toContain("OP-001");
  });

  test("a clean dry-run lets the whole sequence through", async () => {
    const { ran, exec } = recorder(undefined, { "dry-run": { results: [{ opId: "OP-002", status: "READY" }] } });
    const result = await runPlan({ mode: "apply" }, exec, APPLY_ENV);
    expect(result.ok).toBe(true);
    expect(ran).toEqual([
      "dry-run",
      "backup",
      "apply",
      "read-back-verify",
      "fixture-refresh",
      "manifest-recompute",
      "schema-validation",
      "content-contract-tests",
      "locale-integrity",
    ]);
  });

  test("conflictsIn reads the republish tool's own --json shape", () => {
    expect(conflictsIn({ results: [{ opId: "A", status: "CONFLICT" }, { opId: "B", status: "APPLIED" }] })).toHaveLength(1);
    expect(conflictsIn(undefined)).toEqual([]);
  });
});

test.describe("commands", () => {
  test("each step delegates to the tool that already owns it — no CMS write is reimplemented here", () => {
    const of = (id: string) => commandFor((STEPS as { id: string }[]).find((s) => s.id === id), { mode: "apply", only: null });
    expect(of("dry-run").args).toContain("--mode=dry-run");
    expect(of("backup").args).toContain("--mode=backup");
    expect(of("apply").args).toContain("--mode=apply");
    expect(of("read-back-verify").args).toContain("--mode=verify");
    for (const id of ["dry-run", "backup", "apply", "read-back-verify"]) {
      expect(of(id).args?.[0]).toBe("scripts/feelstack-republish.mjs");
    }
  });

  test("--only is passed through to every operation-scoped step", () => {
    const cmd = commandFor((STEPS as { id: string }[]).find((s) => s.id === "apply"), { mode: "apply", only: "OP-001" });
    expect(cmd.args).toContain("--only=OP-001");
  });

  test("the orchestrator contains no HTTP call of its own", () => {
    // If it grew one, it would be a second CMS write path to keep correct.
    // Comments stripped first: the file explains at length what it delegates
    // and why, and naming `PATCH` in prose is not making a request.
    const code = readFileSync("scripts/content-sync.mjs", "utf8")
      .split("\n")
      .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
      .join("\n");
    // `PATCH` still appears in the step titles, which DESCRIBE what the tool
    // they delegate to does. Naming it is the point; performing it is not.
    expect(code, "no request is issued from here").not.toMatch(/\bfetch\s*\(/);
    expect(code, "no request is issued from here").not.toMatch(/method:\s*["']/);
    expect(code, "no endpoint is constructed here").not.toMatch(/https?:\/\//);
  });

  test("it is wired into package.json as content:sync", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    expect(pkg.scripts["content:sync"]).toBe("node scripts/content-sync.mjs");
    expect(pkg.scripts["feelstack:refresh-fixtures"]).toBe("node scripts/feelstack-refresh-fixtures.mjs");
  });
});
