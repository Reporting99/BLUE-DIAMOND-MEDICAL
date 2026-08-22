#!/usr/bin/env node
/**
 * Imports the licensed legacy-site image archive into ImageKit.
 *
 * Source: blue-diamond-original-site-images.zip (client-supplied, usage
 * rights confirmed) — a `source-map.json` describing every asset plus the
 * legacy page(s) it appeared on, and the image files themselves under
 * medical/ and aesthetics/ subfolders.
 *
 * Architecture (brief): ImageKit stores and delivers every image binary.
 * This script talks directly to the ImageKit Upload API — it never routes
 * bytes through FeelStack, and it never writes anything to /public. Run
 * without credentials, it produces a dry-run report only; with
 * IMAGEKIT_PRIVATE_KEY set (and --upload passed), it actually uploads.
 *
 * Usage:
 *   node scripts/imagekit-import.mjs                # dry run, writes a JSON report
 *   node scripts/imagekit-import.mjs --upload        # real upload (requires credentials)
 *   IMAGEKIT_IMPORT_SOURCE_DIR=/path/to/extracted/blue-diamond-site-images node scripts/imagekit-import.mjs
 */
import { readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Codex review finding: this previously fell back silently to a
// developer-specific absolute Downloads path, making the script
// workstation-dependent without saying so. It still tries that path as a
// last resort (so the one machine this was actually run on keeps working
// unattended), but now says so loudly and fails with a clear message if
// neither the env var nor the fallback path actually exists, instead of
// failing later with an opaque ENOENT deep in source-map.json parsing.
const FALLBACK_SOURCE_DIR = "C:/Users/user/Downloads/blue-diamond-original-site-images/blue-diamond-site-images";
const SOURCE_DIR = process.env.IMAGEKIT_IMPORT_SOURCE_DIR ?? FALLBACK_SOURCE_DIR;

if (!process.env.IMAGEKIT_IMPORT_SOURCE_DIR) {
  console.warn(
    `IMAGEKIT_IMPORT_SOURCE_DIR is not set — falling back to a workstation-specific default path (${FALLBACK_SOURCE_DIR}). Set the env var explicitly on any other machine.`,
  );
}

try {
  await access(path.join(SOURCE_DIR, "source-map.json"));
} catch {
  console.error(`Cannot find source-map.json under "${SOURCE_DIR}".`);
  console.error("Set IMAGEKIT_IMPORT_SOURCE_DIR to the extracted archive's directory and re-run.");
  process.exit(1);
}

const OUTPUT_REPORT = path.resolve("docs/imagekit-import-report.json");

const shouldUpload = process.argv.includes("--upload");

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "";
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ?? "";
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY ?? "";
const hasCredentials = Boolean(urlEndpoint && publicKey && privateKey);

/**
 * Identity-confirmed doctor portraits, verified by visual inspection this
 * pass (see docs/IMAGEKIT_IMPORT_REPORT.md):
 *  - medical/dr.farhat.jpg — unambiguous, filename + subject match.
 *  - medical/3p0a4127.jpg and its resized duplicate
 *    aesthetics/rs-w_388-h_388-cg_true(.webp/-m.webp) — a visible embroidered
 *    name badge on the white coat reads "Dr. Reem Ham[di]".
 * Every other "Our Team" portrait in the archive is a real, non-stock
 * physician photo but carries NO visible name — those are intentionally
 * left unmapped below rather than guessed. See the report's
 * "Unidentified physician portraits" section.
 */
// MEDIA_ROOT mirrors src/config/imagekit.ts's constant of the same name —
// duplicated here (plain .mjs, no ts-node/tsx in this project) rather than
// imported. Every destPath below and the generated one further down MUST
// stay prefixed with it, or a real upload lands at a path the site's
// manifest (src/content/media/image-manifest.ts) never looks for — found
// as a real drift bug this pass (both were missing the prefix).
const MEDIA_ROOT = "/blue-diamond";

const CONFIRMED_DOCTOR_OVERRIDES = {
  "medical/dr.farhat.jpg": { doctorId: "mohamed-farhat", destPath: `${MEDIA_ROOT}/doctors/farhat.jpg` },
  "medical/3p0a4127.jpg": { doctorId: "reem-hamdi", destPath: `${MEDIA_ROOT}/doctors/hamdi.jpg` },
  "aesthetics/rs-w_388-h_388-cg_true.webp": { doctorId: "reem-hamdi", destPath: `${MEDIA_ROOT}/doctors/hamdi.jpg`, duplicateOf: "medical/3p0a4127.jpg" },
  "aesthetics/rs-w_388-h_388-cg_true-m.webp": { doctorId: "reem-hamdi", destPath: `${MEDIA_ROOT}/doctors/hamdi.jpg`, duplicateOf: "medical/3p0a4127.jpg" },
};

/** Literal old-site UI screenshots — never real photography, never imported. */
const EXCLUDE_FILES = new Set([
  "medical/screenshot-2026-01-04-at-12.08.27-pm.png",
  "medical/screenshot-2026-01-04-at-12.21.51-pm.png",
  "medical/screenshot-2026-01-04-at-12.32.31-pm.png",
  "medical/screenshot-2026-01-04-at-12.46.43-pm.png",
  "aesthetics/screenshot-2026-02-13-at-8.45.42-am.png",
  "aesthetics/screenshot-2026-01-04-at-1.02.15-pm.png",
  // Low-res legacy wordmark — superseded by the approved logo PDF's vector geometry.
  "medical/blue-diamond-medical-logo.png",
  "aesthetics/bluediamondmedicalaesthetics-bold01.png",
]);

/** "Our Team" portraits with no visible name — real people, unconfirmed identity. */
const UNIDENTIFIED_DOCTOR_FILES = new Set([
  "medical/blob-0846d7f.png",
  "medical/whatsapp-image-2024-12-30-at-17.06.09.jpeg",
  "medical/blob-7cc2b3d.png",
]);

function classifyByPageTitles(titles) {
  const joined = titles.join(" | ").toLowerCase();
  if (joined.includes("our team")) return { role: "doctor", section: "doctors" };
  if (joined.includes("primary care network") || joined.includes("clinic policies") || joined.includes("appointment booking") || joined.includes("walk-in medical clinic") || joined.includes("family doctor, walk-in clinic")) {
    return { role: "location", section: "medical" };
  }
  if (joined.includes("botox")) return { role: "treatment", section: "botox" };
  if (joined.includes("our technologies")) return { role: "technology", section: "technologies" };
  if (joined.includes("laser hair removal")) return { role: "treatment", section: "treatments/laser-hair-removal" };
  if (joined.includes("radio frequency")) return { role: "technology", section: "technologies/tempsure" };
  if (joined.includes("rf micro-needeling") || joined.includes("microneedling")) return { role: "technology", section: "technologies/potenza" };
  if (joined.includes("ultra treatment")) return { role: "technology", section: "technologies/ultra" };
  if (joined.includes("prp therapy")) return { role: "treatment", section: "treatments/prp" };
  if (joined.includes("acne scar")) return { role: "concern", section: "concerns/acne-scars" };
  if (joined.includes("rosacea")) return { role: "concern", section: "concerns/rosacea-redness" };
  if (joined.includes("dry skin")) return { role: "concern", section: "concerns/dry-skin" };
  if (joined.includes("fineline") || joined.includes("fine line")) return { role: "concern", section: "concerns/fine-lines-wrinkles" };
  if (joined.includes("non invasive skin")) return { role: "concern", section: "concerns/skin-laxity" };
  if (joined.includes("spider vein")) return { role: "concern", section: "concerns/spider-veins" };
  if (joined.includes("sun damage")) return { role: "concern", section: "concerns/sun-damage-pigmentation" };
  if (joined.includes("skin revitalization")) return { role: "concern", section: "concerns/skin-revitalization" };
  if (joined.includes("razor bumps")) return { role: "concern", section: "concerns/razor-bumps" };
  if (joined.includes("treatments |") || joined.includes("medical aesthetics")) return { role: "treatment", section: "treatments" };
  return { role: "treatment", section: "misc" };
}

async function main() {
  const mapPath = path.join(SOURCE_DIR, "source-map.json");
  const map = JSON.parse(await readFile(mapPath, "utf8"));

  const entries = [];
  for (const asset of map.assets) {
    const filePath = path.join(SOURCE_DIR, asset.file);
    let width;
    let height;
    let format;
    try {
      const meta = await sharp(filePath).metadata();
      width = meta.width;
      height = meta.height;
      format = meta.format;
    } catch (err) {
      entries.push({ file: asset.file, error: `Could not read image: ${String(err)}` });
      continue;
    }

    const excluded = EXCLUDE_FILES.has(asset.file);
    const override = CONFIRMED_DOCTOR_OVERRIDES[asset.file];
    const unidentifiedDoctor = UNIDENTIFIED_DOCTOR_FILES.has(asset.file);
    const pageTitles = [...new Set(asset.pages.map((p) => p.title))];
    const classification = classifyByPageTitles(pageTitles);

    const destPath = override
      ? override.destPath
      : `${MEDIA_ROOT}/${asset.file.replace(/\.(png|jpe?g|webp)$/i, "")}.${format === "jpeg" ? "jpg" : format}`.replace(/\/(medical|aesthetics)\//, `/${classification.section}/`);

    entries.push({
      file: asset.file,
      bytes: asset.bytes,
      width,
      height,
      format,
      sourceUrl: asset.sourceUrl,
      pageTitles,
      reviewRequiredBySourceTool: Boolean(asset.reviewRequired),
      excluded,
      exclusionReason: excluded ? "Legacy UI screenshot or superseded low-res logo — not real photography, not imported." : undefined,
      unidentifiedDoctor,
      role: override ? "doctor" : classification.role,
      matchedDoctorId: override?.doctorId,
      duplicateOf: override?.duplicateOf,
      destinationPath: excluded ? undefined : destPath,
      approvalStatus: excluded ? "disabled" : override || !unidentifiedDoctor ? "pending" : "pending",
      needsManualMatch: unidentifiedDoctor || Boolean(asset.reviewRequired),
    });
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    sourceDir: SOURCE_DIR,
    totalAssets: entries.length,
    excluded: entries.filter((e) => e.excluded).length,
    identityConfirmedDoctorPhotos: entries.filter((e) => e.matchedDoctorId).length,
    unidentifiedDoctorPhotos: entries.filter((e) => e.unidentifiedDoctor).length,
    needsManualMatch: entries.filter((e) => e.needsManualMatch).length,
    imagekitConfigured: hasCredentials,
    uploadRequested: shouldUpload,
    uploaded: 0,
    entries,
  };

  if (shouldUpload) {
    if (!hasCredentials) {
      const missing = [
        !urlEndpoint && "NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT",
        !publicKey && "NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY",
        !privateKey && "IMAGEKIT_PRIVATE_KEY",
      ].filter(Boolean);
      console.error(`--upload requested but credentials are missing: ${missing.join(", ")}`);
      console.error("Falling back to dry-run report only. Set these in .env.local (never commit real values) and re-run.");
    } else {
      let uploaded = 0;
      for (const entry of entries) {
        if (entry.excluded || !entry.destinationPath) continue;
        const filePath = path.join(SOURCE_DIR, entry.file);
        const fileBuffer = await readFile(filePath);
        const form = new FormData();
        form.append("file", new Blob([fileBuffer]), path.basename(entry.file));
        form.append("fileName", path.basename(entry.destinationPath));
        form.append("folder", path.dirname(entry.destinationPath));
        form.append("useUniqueFileName", "false");
        const auth = Buffer.from(`${privateKey}:`).toString("base64");
        const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
          method: "POST",
          headers: { Authorization: `Basic ${auth}` },
          body: form,
        });
        if (res.ok) {
          uploaded += 1;
          entry.uploadResult = "success";
        } else {
          entry.uploadResult = `failed: ${res.status} ${await res.text()}`;
        }
      }
      summary.uploaded = uploaded;
    }
  }

  await writeFile(OUTPUT_REPORT, JSON.stringify(summary, null, 2));
  console.log(`Wrote ${OUTPUT_REPORT}`);
  console.log(
    `${summary.totalAssets} assets scanned — ${summary.excluded} excluded, ${summary.identityConfirmedDoctorPhotos} identity-confirmed doctor photos, ${summary.unidentifiedDoctorPhotos} unidentified doctor photos, ${summary.needsManualMatch} flagged for manual match, ${summary.uploaded} uploaded.`,
  );
  if (!hasCredentials) {
    console.log("Dry run only — no ImageKit credentials in the environment. See .env.example.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
