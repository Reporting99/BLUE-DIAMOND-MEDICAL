/**
 * Pair-integrity validation for the 14 Before/After pairs.
 *
 * Runs on the in-repo data source (src/features/aesthetics/data/before-after.ts)
 * and asserts the invariants that a silent editing mistake would break:
 * 28 distinct images, 14 pairs, every side on the correct side, and every
 * pair on the treatment its source page maps to.
 *
 * Given the original extraction folder it also re-checks the placement
 * against the extraction manifest itself:
 *
 *   node scripts/validate-before-after.mjs --source <folder with manifest.csv>
 */
import fs from "node:fs";
import path from "node:path";

const DATA = "src/features/aesthetics/data/before-after.ts";

/**
 * The approved placement, keyed by the extraction manifest's own two-digit
 * filename prefixes — the authoritative identifier for these files, since
 * the `slider-01`/`slider-02` suffixes repeat across unrelated galleries.
 */
const EXPECTED = {
  "LST-01": ["01", "02", "laser-skin-treatments"],
  "LST-02": ["03", "04", "laser-skin-treatments"],
  "LST-03": ["09", "10", "laser-skin-treatments"],
  "LST-04": ["11", "12", "laser-skin-treatments"],
  "LST-05": ["13", "14", "laser-skin-treatments"],
  "LHR-01": ["05", "06", "laser-hair-removal"],
  "LHR-02": ["07", "08", "laser-hair-removal"],
  "RF-01": ["15", "16", "radio-frequency"],
  "RF-02": ["17", "18", "radio-frequency"],
  "RF-03": ["19", "20", "radio-frequency"],
  "ULTRA-01": ["21", "22", "ultra"],
  "PRP-HAIR-01": ["23", "24", "prp-hair-restoration"],
  "POTENZA-01": ["25", "26", "rf-microneedling"],
  "POTENZA-02": ["27", "28", "rf-microneedling"],
};

const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
};

const source = fs.readFileSync(DATA, "utf8");

/** One entry per pair, in file order, with its two source URLs and paths. */
const blocks = source.split(/\r?\n {2}\{\r?\n/).slice(1);
const pairs = blocks.map((block) => ({
  pairId: block.match(/pairId: "([^"]+)"/)?.[1],
  treatmentId: block.match(/treatmentId: "([^"]+)"/)?.[1],
  approvalStatus: block.match(/approvalStatus: "([^"]+)"/)?.[1],
  sourceUrls: [...block.matchAll(/sourceUrl: "([^"]+)"/g)].map((m) => m[1]),
  imagekitPaths: [...block.matchAll(/imagekitPath: "([^"]+)"/g)].map((m) => m[1]),
}));

check(pairs.length === 14, `expected 14 pairs, found ${pairs.length}`);
check(new Set(pairs.map((p) => p.pairId)).size === pairs.length, "duplicate pairId");

const allUrls = pairs.flatMap((p) => p.sourceUrls);
const allPaths = pairs.flatMap((p) => p.imagekitPaths);
check(allUrls.length === 28, `expected 28 source images, found ${allUrls.length}`);
check(new Set(allUrls).size === 28, "the same source image is used twice");
check(new Set(allPaths).size === 28, "the same CDN path is used twice");

for (const pair of pairs) {
  check(pair.sourceUrls.length === 2, `${pair.pairId}: not exactly one before and one after`);
  check(pair.imagekitPaths.length === 2, `${pair.pairId}: not exactly two CDN paths`);
  check(
    pair.imagekitPaths[0]?.endsWith("-before.png"),
    `${pair.pairId}: first side is not the before image`,
  );
  check(
    pair.imagekitPaths[1]?.endsWith("-after.png"),
    `${pair.pairId}: second side is not the after image`,
  );
  check(pair.approvalStatus === "approved", `${pair.pairId}: not approved, so it will not render`);
}

const sourceFlagIndex = process.argv.indexOf("--source");
if (sourceFlagIndex !== -1) {
  const root = process.argv[sourceFlagIndex + 1];
  const csv = fs.readFileSync(path.join(root, "manifest.csv"), "utf8").trim().split(/\r?\n/);
  const splitCsv = (line) => {
    const fields = [];
    let current = "";
    let quoted = false;
    for (const char of line) {
      if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) {
        fields.push(current);
        current = "";
      } else current += char;
    }
    fields.push(current);
    return fields;
  };
  const urlToFile = new Map();
  for (const line of csv.slice(1)) {
    const fields = splitCsv(line);
    urlToFile.set(fields[6], path.basename(fields[7]));
  }

  const files = fs.readdirSync(path.join(root, "images"));
  check(files.length === 28, `expected 28 files in images/, found ${files.length}`);

  const placed = pairs.map((pair) => ({
    ...pair,
    before: urlToFile.get(pair.sourceUrls[0]),
    after: urlToFile.get(pair.sourceUrls[1]),
  }));

  const rows = [];
  for (const [id, [beforePrefix, afterPrefix, treatmentId]] of Object.entries(EXPECTED)) {
    const before = files.find((f) => f.startsWith(`${beforePrefix}_`));
    const after = files.find((f) => f.startsWith(`${afterPrefix}_`));
    check(before?.endsWith("_before.png") === true, `${id}: ${before} is not a before file`);
    check(after?.endsWith("_after.png") === true, `${id}: ${after} is not an after file`);
    const match = placed.find((p) => p.before === before && p.after === after);
    check(Boolean(match), `${id}: no pair in ${DATA} carries ${before} -> ${after}`);
    if (match) {
      check(
        match.treatmentId === treatmentId,
        `${id}: placed on "${match.treatmentId}", expected "${treatmentId}"`,
      );
    }
    rows.push({ pair: id, before, after, dataPairId: match?.pairId ?? "-", treatment: match?.treatmentId ?? "-" });
  }

  const used = placed.flatMap((p) => [p.before, p.after]).filter(Boolean);
  check(new Set(used).size === 28, "a source file is placed more than once");
  for (const file of files) check(used.includes(file), `source file never placed: ${file}`);

  console.table(rows);
}

if (failures.length > 0) {
  console.error(`FAILED (${failures.length}):\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("Before/After pair integrity: PASS — 28 images, 14 pairs, 6 treatments.");
