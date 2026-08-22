import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { imageManifest } from "../../src/content/media/image-manifest";

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
    if (file.includes("components\\media\\ImageKitImage.tsx") || file.includes("components/media/ImageKitImage.tsx")) continue;
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
  // src/content/media/image-manifest.ts, and both silently drifted out of
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
