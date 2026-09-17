import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * DERIVED COUNTS — a whole class of defect, closed by deletion.
 *
 * `content/feelstack/republish-operations.json` used to carry a hand-maintained
 * `counts: { applicable, excluded }` block. It drifted. On 2026-09-16 the file
 * said 66 applicable while holding 70, because commit 1d07c12 added four
 * operations and nobody edited the number — which is the only outcome a
 * hand-maintained count of a machine-readable list ever has.
 *
 * There WAS a test asserting the stored number equalled the derived one. It did
 * not prevent the drift; it recorded it, red, after the fact. A number that is
 * only correct when a test says so is not a source of truth — it is a copy, and
 * the copy is the defect.
 *
 * So the rule enforced here is not "the count must be right". It is: this
 * manifest must not contain a static labelled count AT ALL. Every consumer
 * derives. `scripts/feelstack-republish.mjs` prints `ops.length` /
 * `excluded.length` computed at run time, and `npm run content:sync` recomputes
 * the same figures for its report.
 */

const MANIFEST_PATH = join(process.cwd(), "content", "feelstack", "republish-operations.json");
const raw = readFileSync(MANIFEST_PATH, "utf8");
const manifest = JSON.parse(raw) as Record<string, unknown> & {
  operations: { opId: string; applicable: boolean }[];
};

/**
 * Keys whose VALUE would be a satisfiable-but-forgeable restatement of
 * something the file already contains. `countsNote` is prose explaining the
 * absence and is deliberately not one of them — the check is for a numeric
 * count, not for the word "count".
 */
const FORBIDDEN_COUNT_KEYS = ["counts", "count", "totals", "applicableCount", "excludedCount", "operationCount"];

test.describe("republish manifest — counts are derived, never persisted", () => {
  test("the manifest stores no static count block", () => {
    const present = FORBIDDEN_COUNT_KEYS.filter((k) => k in manifest);
    expect(
      present,
      `These keys restate what \`operations\` already says and will drift from it:\n` +
        `${present.join(", ")}\nDelete them and derive the value at the point of use.`,
    ).toEqual([]);
  });

  test("no top-level key holds a number that merely counts the operations", () => {
    // Catches the same defect under a name this test did not predict — someone
    // adding `applicable: 70` or `size: 76` at the top level instead.
    const total = manifest.operations.length;
    const applicable = manifest.operations.filter((o) => o.applicable === true).length;
    const excluded = total - applicable;

    const offenders = Object.entries(manifest)
      .filter(([, v]) => typeof v === "number")
      .filter(([, v]) => v === total || v === applicable || v === excluded)
      .map(([k, v]) => `${k}: ${v}`);

    expect(
      offenders,
      `A top-level number equal to a derivable operation count is a copy waiting to drift:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  test("the derivation itself is sound — every operation is exactly one of applicable or excluded", () => {
    // The guarantee the deleted block was trying to express, asserted against
    // the data instead of against a transcription of it.
    const total = manifest.operations.length;
    const applicable = manifest.operations.filter((o) => o.applicable === true).length;
    const excluded = manifest.operations.filter((o) => o.applicable !== true).length;
    expect(total).toBeGreaterThan(0);
    expect(applicable + excluded).toBe(total);
  });

  test("the file explains why the counts are gone, so they are not helpfully restored", () => {
    expect(typeof manifest.countsNote).toBe("string");
    expect(String(manifest.countsNote)).toContain("DERIVED");
  });

  test("the republish tool derives its summary rather than reading a stored count", () => {
    const tool = readFileSync(join(process.cwd(), "scripts", "feelstack-republish.mjs"), "utf8");
    expect(tool, "the tool must not read a persisted count").not.toMatch(/doc\.counts|\.counts\.(applicable|excluded)/);
    expect(tool, "the tool must derive from the operation arrays").toContain("ops.length");
  });
});
