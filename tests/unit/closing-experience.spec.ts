import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * "SEAMLESS CLOSING SECTION AND FOOTER COLOR REDESIGN" §17 — static check
 * that the closing CTA and footer route through the shared
 * SiteClosingExperience/token system rather than a separate hard-coded
 * dark background (the exact charcoal values the brief names explicitly).
 * Same walk-based approach as tests/unit/image-usage.spec.ts, for the
 * same portability reason (no shelling out to an external `grep`).
 */
const PROHIBITED_HARDCODED_DARKS = ["#1d2529", "#20282c", "#000000", "#20272c"];

const SRC_DIR = join(__dirname, "..", "..", "src");

function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  let files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files = files.concat(walk(fullPath));
    } else if (/\.(tsx?|jsx?|css)$/.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

test("Footer.tsx has no background color of its own beyond the shared surface-dark/footer tokens", () => {
  const content = readFileSync(join(SRC_DIR, "components", "layout", "Footer.tsx"), "utf-8");
  for (const hex of PROHIBITED_HARDCODED_DARKS) {
    expect(content.toLowerCase()).not.toContain(hex.toLowerCase());
  }
  // Must reference the shared tokens, not invent its own colors.
  expect(content).toContain("var(--surface-dark)");
  expect(content).toContain("var(--footer-text)");
});

test("SiteClosingExperience.tsx exists and is the single shared closing wrapper", () => {
  const content = readFileSync(join(SRC_DIR, "components", "layout", "SiteClosingExperience.tsx"), "utf-8");
  for (const hex of PROHIBITED_HARDCODED_DARKS) {
    expect(content.toLowerCase()).not.toContain(hex.toLowerCase());
  }
  expect(content).toContain("--footer-blue-bottom");
  expect(content).toContain("--closing-surface-start");
});

test("the homepage's final CTA renders through SiteClosingExperience, not a standalone bg-blue-4 block", () => {
  const content = readFileSync(join(SRC_DIR, "app", "[locale]", "page.tsx"), "utf-8");
  expect(content).toContain("<SiteClosingExperience");
  // The old flat CTA block this replaced.
  expect(content).not.toContain('className="bg-blue-4 px-4 py-[clamp(4.5rem,9vw,7.5rem)] text-center text-white');
});

test("no source file hard-codes the removed charcoal footer colors", () => {
  const offenders: string[] = [];
  for (const file of walk(SRC_DIR)) {
    const content = readFileSync(file, "utf-8").toLowerCase();
    for (const hex of ["#1d2529", "#20282c"]) {
      if (content.includes(hex)) offenders.push(`${file}: ${hex}`);
    }
  }
  expect(offenders, offenders.join("\n")).toEqual([]);
});
