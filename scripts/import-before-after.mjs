#!/usr/bin/env node
/**
 * Uploads the 14 historical Before/After pairs (28 files) recovered from the
 * two original Blue Diamond websites into the approved ImageKit endpoint.
 *
 * Why this is a separate script from scripts/imagekit-import.mjs: that one
 * imports the client-supplied legacy image ZIP and is driven by that
 * archive's own source-map.json. These assets did not come from the ZIP —
 * they were recovered from the live sites' embedded CommonNinja
 * before/after widgets, and carry a different provenance and rights story
 * (docs/BEFORE_AFTER_SOURCE_AUDIT.md). Mixing them into one script would
 * blur exactly the distinction the closure brief §22 asks us to keep.
 *
 * Bytes go straight to ImageKit. Nothing is written to /public, and no
 * CommonNinja URL is ever rendered at runtime — the sourceUrl recorded in
 * scripts/before-after-manifest.json and in the pair data is provenance,
 * not a delivery path (§33).
 *
 * Usage:
 *   node scripts/import-before-after.mjs                 # verify only
 *   node scripts/import-before-after.mjs --upload        # needs IMAGEKIT_PRIVATE_KEY
 *
 * Source of the binaries, in order of preference:
 *   1. $BEFORE_AFTER_STAGE_DIR (a directory of the staged files)
 *   2. each asset's recorded sourceUrl, re-downloaded
 * Either way every file is SHA-256 verified against the manifest before it
 * is uploaded, so a silently-changed upstream asset fails loudly instead of
 * being published as if it were the audited one.
 *
 * After a successful upload, flip each pair's `approvalStatus` to
 * "approved" in src/features/aesthetics/data/before-after.ts and set
 * `features.beforeAfterEnabled = true`. That step is deliberately manual:
 * this script moves bytes, it does not grant editorial approval (§23).
 */
import { readFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.join(HERE, "before-after-manifest.json");
const STAGE_DIR = process.env.BEFORE_AFTER_STAGE_DIR ?? "";
const UPLOAD = process.argv.includes("--upload");
const PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY ?? "";

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

async function loadAsset(asset) {
  if (STAGE_DIR) {
    const p = path.join(STAGE_DIR, asset.stagedFile);
    try {
      await access(p);
      return { buf: await readFile(p), from: p };
    } catch {
      /* fall through to the network */
    }
  }
  const res = await fetch(asset.sourceUrl);
  if (!res.ok) throw new Error(`${asset.sourceUrl} -> HTTP ${res.status}`);
  return { buf: Buffer.from(await res.arrayBuffer()), from: asset.sourceUrl };
}

async function uploadOne(asset, buf) {
  const form = new FormData();
  form.append("file", new Blob([buf]), path.basename(asset.imagekitPath));
  form.append("fileName", path.basename(asset.imagekitPath));
  form.append("folder", path.dirname(asset.imagekitPath));
  form.append("useUniqueFileName", "false");
  form.append("overwriteFile", "true");
  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${PRIVATE_KEY}:`).toString("base64")}` },
    body: form,
  });
  if (!res.ok) throw new Error(`upload ${asset.imagekitPath} -> HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

const manifest = JSON.parse(await readFile(MANIFEST, "utf-8"));
console.log(`before-after import — ${manifest.assets.length} files, media root ${manifest.mediaRoot}`);
if (UPLOAD && !PRIVATE_KEY) {
  console.error("IMAGEKIT_PRIVATE_KEY is not set. Refusing to run --upload without credentials.");
  process.exit(2);
}
if (!UPLOAD) console.log("VERIFY-ONLY (pass --upload to actually upload)\n");

let ok = 0;
let failed = 0;
for (const asset of manifest.assets) {
  try {
    const { buf, from } = await loadAsset(asset);
    const digest = sha256(buf);
    if (digest !== asset.sha256) {
      throw new Error(`sha256 mismatch (manifest ${asset.sha256.slice(0, 12)}…, got ${digest.slice(0, 12)}…)`);
    }
    if (UPLOAD) await uploadOne(asset, buf);
    ok += 1;
    console.log(`  ok   ${asset.imagekitPath}  (${buf.length} bytes, from ${from.startsWith("http") ? "source URL" : "stage"})`);
  } catch (error) {
    failed += 1;
    console.error(`  FAIL ${asset.imagekitPath}: ${error.message}`);
  }
}
console.log(`\n${UPLOAD ? "uploaded" : "verified"}: ${ok}  failed: ${failed}`);
process.exit(failed === 0 ? 0 : 1);
