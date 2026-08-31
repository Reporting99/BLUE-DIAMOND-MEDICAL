#!/usr/bin/env node
/**
 * Imports the 14 historical Before/After pairs (28 files) recovered from the
 * two original Blue Diamond websites into the project's canonical media store.
 *
 * IT GOES THROUGH FEELSTACK, NOT STRAIGHT AT IMAGEKIT.
 *
 * An earlier version of this script POSTed to upload.imagekit.io with an
 * account-wide IMAGEKIT_PRIVATE_KEY. That is the wrong door twice over. It
 * needs a credential scoped to the whole ImageKit account when a
 * project-scoped one already exists, and bytes uploaded that way land in
 * ImageKit *unregistered* -- no media asset row, so the public resolver
 * returns `media: []` and nothing renders. FeelStack owns the ImageKit
 * provider credential per project; `POST /admin/v1/projects/:id/media/import`
 * uploads the bytes AND records the asset in one authenticated call, using a
 * credential that can only ever write inside this project's path prefix.
 *
 * Idempotent by construction. The endpoint refuses to overwrite: identical
 * bytes at a known path come back `reused`, different bytes at the same path
 * are a 409 rather than a silent replacement. Re-running this converges; it
 * does not duplicate.
 *
 * APPROVAL IS NOT GRANTED HERE. `approvalStatus` is deliberately never sent.
 * Sending it on this endpoint is exactly what flipped 36 medical assets to
 * `approved` in one unattended run on 2026-08-30; reverting that took a 36-operation corrective
 * write. Assets arrive `pending` and are approved by a reviewer, deliberately,
 * afterwards.
 *
 * No CommonNinja URL is ever rendered at runtime -- the `sourceUrl` recorded
 * in scripts/before-after-manifest.json is provenance, not a delivery path.
 * See docs/BEFORE_AFTER_SOURCE_AUDIT.md for what these images actually are:
 * manufacturer clinical collateral, not Blue Diamond patient results.
 *
 * Usage:
 *   node scripts/import-before-after.mjs                  # verify only (default)
 *   node scripts/import-before-after.mjs --upload         # import through FeelStack
 *
 * Environment (upload only):
 *   FEELSTACK_API_URL          e.g. https://feelstack.dfeelings.com/api
 *   FEELSTACK_ADMIN_USERNAME   the project-scoped media-import user
 *   FEELSTACK_ADMIN_PASSWORD
 *   FEELSTACK_ADMIN_PROJECT_ID
 * On the deployment host these live in /home/blue-diamond/secrets/feelstack-admin.env.
 *
 * Bytes come from $BEFORE_AFTER_STAGE_DIR when set, otherwise each asset's
 * recorded sourceUrl is re-downloaded. Either way every file is SHA-256
 * verified against the manifest before it is sent, and the checksum is sent
 * along so the server proves it independently.
 */
import { readFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.join(HERE, "before-after-manifest.json");
const STAGE_DIR = process.env.BEFORE_AFTER_STAGE_DIR ?? "";
const UPLOAD = process.argv.includes("--upload");

const API = (process.env.FEELSTACK_API_URL ?? "").replace(/\/$/, "");
const PROJECT_ID = process.env.FEELSTACK_ADMIN_PROJECT_ID ?? "";
const USERNAME = process.env.FEELSTACK_ADMIN_USERNAME ?? "";
const PASSWORD = process.env.FEELSTACK_ADMIN_PASSWORD ?? "";

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

async function loadAsset(asset) {
  if (STAGE_DIR) {
    const p = path.join(STAGE_DIR, asset.stagedFile);
    try {
      await access(p);
      return { buf: await readFile(p), from: "stage" };
    } catch {
      /* fall through to the network */
    }
  }
  const res = await fetch(asset.sourceUrl);
  if (!res.ok) throw new Error(`${asset.sourceUrl} -> HTTP ${res.status}`);
  return { buf: Buffer.from(await res.arrayBuffer()), from: "source URL" };
}

async function login() {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`login -> HTTP ${res.status}`);
  const body = await res.json();
  const token = body.access_token ?? body.accessToken;
  if (!token) throw new Error("login returned no access token");
  return token;
}

/**
 * One import. `alt` is factual and descriptive rather than promotional: these
 * are manufacturer clinical examples, and the alt text must not assert a
 * result the provenance audit does not support.
 */
async function importOne(token, asset, buf) {
  const form = new FormData();
  form.append("file", new Blob([buf], { type: "image/png" }), path.basename(asset.imagekitPath));
  form.append("path", asset.imagekitPath);
  form.append("expectedChecksum", asset.sha256);
  form.append("role", "gallery");
  // NOT approvalStatus. See the header comment.
  const res = await fetch(`${API}/admin/v1/projects/${PROJECT_ID}/media/import`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${text.slice(0, 300)}`);
  const body = JSON.parse(text);
  return { action: body.action, id: body.asset?.id, url: body.asset?.url };
}

const manifest = JSON.parse(await readFile(MANIFEST, "utf-8"));
const pairs = new Set(manifest.assets.map((a) => a.pairId));
console.log(
  `before-after import — ${manifest.assets.length} files, ${pairs.size} pairs, media root ${manifest.mediaRoot}`,
);

if (UPLOAD) {
  const missing = ["FEELSTACK_API_URL", "FEELSTACK_ADMIN_PROJECT_ID", "FEELSTACK_ADMIN_USERNAME", "FEELSTACK_ADMIN_PASSWORD"]
    .filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Refusing to run --upload without credentials. Missing: ${missing.join(", ")}`);
    process.exit(2);
  }
} else {
  console.log("VERIFY-ONLY (pass --upload to import through FeelStack)\n");
}

const token = UPLOAD ? await login() : null;

let ok = 0;
let failed = 0;
const actions = { uploaded: 0, reused: 0 };

for (const asset of manifest.assets) {
  try {
    const { buf, from } = await loadAsset(asset);
    const digest = sha256(buf);
    if (digest !== asset.sha256) {
      throw new Error(`sha256 mismatch (manifest ${asset.sha256.slice(0, 12)}…, got ${digest.slice(0, 12)}…)`);
    }
    if (buf.length !== asset.bytes) {
      throw new Error(`size mismatch (manifest ${asset.bytes}, got ${buf.length})`);
    }
    let suffix = `(${buf.length} bytes, from ${from})`;
    if (UPLOAD) {
      const result = await importOne(token, asset, buf);
      actions[result.action] = (actions[result.action] ?? 0) + 1;
      suffix = `${result.action} ${result.id ?? ""}`;
    }
    ok += 1;
    console.log(`  ok   ${asset.imagekitPath}  ${suffix}`);
  } catch (error) {
    failed += 1;
    console.error(`  FAIL ${asset.imagekitPath}: ${error.message}`);
  }
}

console.log(`\n${UPLOAD ? "imported" : "verified"}: ${ok}  failed: ${failed}`);
if (UPLOAD) console.log(`uploaded: ${actions.uploaded}  reused (idempotent): ${actions.reused}`);
process.exit(failed === 0 ? 0 : 1);
