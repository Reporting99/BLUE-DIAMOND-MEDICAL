import { test, expect } from "@playwright/test";
import { beforeAfterPairs } from "../../src/features/aesthetics/data/before-after";
import { attributionFor } from "../../src/features/aesthetics/before-after-types";
import { treatments, gatedTreatments } from "../../src/features/aesthetics/data/treatments";
import { concerns } from "../../src/features/concerns/data";
import { technologies } from "../../src/features/technologies/data";
import manifest from "../../scripts/before-after-manifest.json";

/**
 * Provenance contract for the 14 historical Before/After pairs recovered
 * from the two original Blue Diamond websites (closure brief §17-§26).
 *
 * These assets are third-party device-manufacturer clinical collateral.
 * They are publishable — the client decided that — but ONLY while the
 * site keeps saying what they actually are. Everything below is a rule
 * that, if it silently broke, would turn honest attribution into a claim
 * that another clinic's patient was treated at Blue Diamond. A comment
 * cannot enforce that; these assertions can.
 */

const TREATMENT_IDS = new Set([...treatments, ...gatedTreatments].map((t) => t.id));
const CONCERN_IDS = new Set(concerns.map((c) => c.id));
const TECHNOLOGY_IDS = new Set(technologies.map((t) => t.id));

test("all 14 recovered pairs are registered — none silently dropped", () => {
  expect(beforeAfterPairs).toHaveLength(14);
  expect(new Set(beforeAfterPairs.map((p) => p.pairId)).size).toBe(14);
});

test("every pair carries full, traceable provenance", () => {
  for (const pair of beforeAfterPairs) {
    expect(pair.provenance.sourceWebsite, pair.pairId).toBeTruthy();
    expect(pair.provenance.sourcePage, pair.pairId).toMatch(/^\//);
    for (const side of [pair.before, pair.after]) {
      expect(side.sourceUrl, pair.pairId).toMatch(/^https:\/\//);
      expect(side.originalFilename, pair.pairId).toBeTruthy();
      expect(side.width, pair.pairId).toBeGreaterThan(0);
      expect(side.height, pair.pairId).toBeGreaterThan(0);
      expect(side.bytes, pair.pairId).toBeGreaterThan(0);
      expect(side.imagekitPath, pair.pairId).toMatch(/^\/blue-diamond\/before-after\//);
    }
  }
});

test("every registered pair has a staged, checksummed binary in the import manifest", () => {
  const byPath = new Map(manifest.assets.map((a) => [a.imagekitPath, a]));
  expect(manifest.assets).toHaveLength(28);
  for (const pair of beforeAfterPairs) {
    for (const side of [pair.before, pair.after]) {
      const asset = byPath.get(side.imagekitPath);
      expect(asset, `${pair.pairId}: ${side.imagekitPath} missing from manifest`).toBeTruthy();
      expect(asset!.sha256).toHaveLength(64);
      expect(asset!.sourceUrl).toBe(side.sourceUrl);
      expect(asset!.bytes).toBe(side.bytes);
    }
  }
});

test("relationship ids only ever point at entities that exist", () => {
  for (const pair of beforeAfterPairs) {
    expect(TREATMENT_IDS.has(pair.treatmentId), `${pair.pairId} treatment`).toBe(true);
    if (pair.concernId) expect(CONCERN_IDS.has(pair.concernId), `${pair.pairId} concern`).toBe(true);
    if (pair.technologyId) expect(TECHNOLOGY_IDS.has(pair.technologyId), `${pair.pairId} technology`).toBe(true);
  }
});

test("a technology is claimed only where a source filename or widget names it", () => {
  // §26/§46: never guess the device from what a result looks like.
  for (const pair of beforeAfterPairs) {
    if (!pair.technologyId) continue;
    const evidence = [
      pair.before.originalFilename,
      pair.after.originalFilename,
      pair.provenance.sourceWidget ?? "",
      pair.provenance.sourcePage,
      pair.provenance.manufacturerReference ?? "",
    ]
      .join(" ")
      .toLowerCase();
    const device = pair.technologyId.replace(/-/g, "");
    expect(
      evidence.replace(/[-_]/g, "").includes(device),
      `${pair.pairId} claims technology "${pair.technologyId}" with no naming evidence in ${evidence}`,
    ).toBe(true);
  }
});

test("rights are never overstated", () => {
  for (const pair of beforeAfterPairs) {
    // Legacy public display is the only evidence that exists for these.
    // VERIFIED_REPUBLISHABLE requires a rights document — none is on file,
    // so nothing here may claim it (§22).
    expect(pair.rightsStatus, pair.pairId).toBe("LEGACY_SITE_USAGE_EVIDENCE");
  }
});

test("no pair presents itself as Blue Diamond patient photography", () => {
  const forbidden = /our patient|treated at blue diamond|blue diamond patient|result achieved by blue diamond/i;
  for (const pair of beforeAfterPairs) {
    for (const text of [
      pair.description.en,
      pair.description.ar,
      pair.before.alt.en,
      pair.after.alt.en,
      pair.sessionInfo?.en ?? "",
    ]) {
      expect(forbidden.test(text), `${pair.pairId}: "${text}"`).toBe(false);
    }
  }
});

test("a manufacturer-sourced pair always renders a manufacturer attribution", () => {
  const withMaker = beforeAfterPairs.filter((p) => p.provenance.manufacturer);
  expect(withMaker.length).toBeGreaterThan(0);
  for (const pair of withMaker) {
    const line = attributionFor(pair);
    expect(line, pair.pairId).toBeTruthy();
    expect(line!.en).toContain(pair.provenance.manufacturer!);
    expect(line!.en).toContain("Not a Blue Diamond Medical patient");
    expect(line!.ar).toContain("ليس من مرضى بلو دايموند الطبية");
  }
});

test("importing is not approving — nothing renders until its binary is on the CDN", () => {
  // §23. The editorial decision to use these assets is made; this asserts
  // the mechanical gate, so a pair can never render a CDN path that has no
  // file behind it (which would be a broken image, not a result).
  for (const pair of beforeAfterPairs) {
    if (pair.approvalStatus === "approved") {
      expect(pair.pipelineState, `${pair.pairId} approved but not published`).toBe("PUBLISHED");
    }
  }
});
