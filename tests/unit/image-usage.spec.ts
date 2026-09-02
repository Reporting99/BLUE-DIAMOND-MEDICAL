import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { imageManifest } from "../../src/lib/media/image-manifest";

/**
 * Static-analysis checks — brief §39 items 20-21 ("Create a test that
 * fails if production components use /images/..., direct Unsplash/Pexels
 * URLs, or non-ImageKit remote image URLs"). Run via the Playwright test
 * runner rather than a separate Vitest install (no page/browser needed —
 * these are plain Node file scans), keeping one test toolchain for the
 * whole project rather than two.
 */

const SRC_DIR = join(__dirname, "..", "..", "src");

function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  let files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files = files.concat(walk(fullPath));
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

const sourceFiles = walk(SRC_DIR);

test("no component imports next/image directly (must go through ImageKitImage)", () => {
  const offenders: string[] = [];
  for (const file of sourceFiles) {
    if (file.includes("components\\media\\ImageKitImage.tsx") || file.includes("components/shared/ImageKitImage.tsx")) continue;
    const content = readFileSync(file, "utf-8");
    if (/from ["']next\/image["']/.test(content)) {
      offenders.push(file);
    }
  }
  expect(offenders, `These files import next/image directly instead of ImageKitImage:\n${offenders.join("\n")}`).toEqual([]);
});

test("no hardcoded /images/ local production image paths", () => {
  const offenders: string[] = [];
  for (const file of sourceFiles) {
    const content = readFileSync(file, "utf-8");
    if (/["'`]\/images\//.test(content)) {
      offenders.push(file);
    }
  }
  expect(offenders, `These files reference /images/...:\n${offenders.join("\n")}`).toEqual([]);
});

test("no direct Unsplash, Pexels, or other unapproved remote image hosts", () => {
  const bannedHosts = ["unsplash.com", "pexels.com", "images.unsplash.com", "cloudinary.com"];
  const offenders: string[] = [];
  for (const file of sourceFiles) {
    const content = readFileSync(file, "utf-8");
    if (bannedHosts.some((host) => content.includes(host))) {
      offenders.push(file);
    }
  }
  expect(offenders, `These files reference an unapproved external image host:\n${offenders.join("\n")}`).toEqual([]);
});

test("every ImageKitImage path used in a page has a matching entry in image-manifest.ts", () => {
  const manifestPaths = new Set(imageManifest.map((a) => a.path));
  const missing: string[] = [];
  for (const file of sourceFiles) {
    if (!file.includes("[locale]")) continue;
    const content = readFileSync(file, "utf-8");
    const matches = content.matchAll(/path="(\/[^"]+)"/g);
    for (const match of matches) {
      const p = match[1];
      if (!manifestPaths.has(p)) missing.push(`${file}: ${p}`);
    }
  }
  expect(missing, `These ImageKitImage paths have no image-manifest.ts entry:\n${missing.join("\n")}`).toEqual([]);
});

test("every literal ImageKit-style path (path=\"...\" or ogImagePath: \"...\") is rooted under /blue-diamond", () => {
  // Regression guard — found this pass: two separate places (an
  // ImageKitImage `path=` JSX literal and an `ogImagePath:` metadata
  // override) duplicated a raw path string instead of sourcing it from
  // src/lib/media/image-manifest.ts, and both silently drifted out of
  // sync with MEDIA_ROOT (src/config/imagekit.ts) when it was introduced.
  // Every literal path/ogImagePath string must start with the media root,
  // matching every entry in image-manifest.ts.
  const offenders: string[] = [];
  for (const file of sourceFiles) {
    const content = readFileSync(file, "utf-8");
    const matches = content.matchAll(/(?:\bpath|ogImagePath):\s*"(\/[^"]+)"|path="(\/[^"]+)"/g);
    for (const match of matches) {
      const p = match[1] ?? match[2];
      if (!p.startsWith("/blue-diamond/")) offenders.push(`${file}: ${p}`);
    }
  }
  expect(offenders, `These literal ImageKit paths are missing the /blue-diamond root:\n${offenders.join("\n")}`).toEqual([]);
});

/**
 * Every ImageKit path this repository states must be one the media library
 * actually holds.
 *
 * The homepage's OG image pointed at `/blue-diamond/hero/homepage-hero.jpg`
 * for months. The media library has no `hero/` directory at all, so every
 * share card for the site requested a 404 and rendered blank. It survived
 * because an OG image is not gated on approval status the way an `<img>` is:
 * `getRouteMetadata` emits the URL whatever the manifest says, so the page
 * showed a correct placeholder while its social preview was broken.
 *
 * The library is not reachable from a unit test, so this asserts the shape
 * that was wrong rather than the inventory: a path must sit under one of the
 * namespaces that exist. `hero/` is absent from that list deliberately — it is
 * the directory that never existed.
 *
 * A `pending` manifest entry is exempt. Its path names where an asset would
 * go, nothing fetches it, and a namespace that does not exist yet is the
 * normal state of a plan. An OG image is not exempt, because it is emitted
 * whatever the status says — which is the whole reason this bug reached
 * production.
 */
const MEDIA_NAMESPACES = [
  "aesthetics",
  "before-after",
  "home",
  "medical",
  "shared",
  "shop",
  // The doctor/team namespace. Four approved portraits already live under
  // /blue-diamond/team/ in the FeelStack media library, and Dr. Saeed's
  // consent-protected identity card joined them; this list is a record of the
  // directories the library actually has, and it had simply not caught up.
  "team",
  "technologies",
  "treatments",
];

test("an APPROVED manifest entry sits in a real media namespace", () => {
  // A `pending` entry is a placeholder and a plan: its path names where an
  // asset would go, nothing fetches it, and a namespace that does not exist
  // yet is normal. `approved` is the claim that bytes are there, so its
  // namespace has to be one the library actually has.
  for (const asset of imageManifest) {
    if (asset.status !== "approved") continue;
    const match = asset.path.match(/^\/blue-diamond\/([^/]+)\//);
    expect(match, `${asset.id}: "${asset.path}" is not under /blue-diamond/<namespace>/`).toBeTruthy();
    expect(
      MEDIA_NAMESPACES,
      `${asset.id}: "${match![1]}" is not a namespace the media library has`,
    ).toContain(match![1]);
  }
});

test("no ogImagePath names a namespace the library does not have", () => {
  const offenders: string[] = [];
  for (const file of walk(SRC_DIR)) {
    if (!/\.tsx?$/.test(file)) continue;
    for (const [, path] of readFileSync(file, "utf8").matchAll(/ogImagePath:\s*"([^"]+)"/g)) {
      const match = path.match(/^\/blue-diamond\/([^/]+)\//);
      if (!match || !MEDIA_NAMESPACES.includes(match[1])) offenders.push(`${file}: ${path}`);
    }
  }
  expect(offenders, offenders.join("\n")).toEqual([]);
});
