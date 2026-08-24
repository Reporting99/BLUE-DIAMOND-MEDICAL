import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseMediaAssignments } from "../../src/lib/feelstack/media";

/**
 * Cross-repository contract fixture — consumer side.
 *
 * `media-contract.fixture.json` exists byte-identically here and in FeelStack
 * (`headless-cms/src/platform/contracts/media-contract.fixture.json`). Both
 * repositories pin the same SHA-256 and the same `contractVersion`, so a
 * unilateral edit fails that repository's own build rather than quietly
 * emptying every page's media in production.
 *
 * The FeelStack side asserts the producer emits this shape. This side asserts
 * the consumer accepts it — every item survives validation, and the adapted
 * result is renderable. Together they close the loop that this integration
 * previously had open: the old route-inventory contract test asserted a shape
 * the backend never emitted and passed for the integration's entire life.
 */
const FIXTURE_SHA256 = "aded04887cef55f4055cf8c5e88e83a4cc94300da8cea5421a7f4f6f81c1a882";
const CONTRACT_VERSION = "media-contract/v1";

const FIXTURE_PATH = join(__dirname, "..", "fixtures", "feelstack", "media-contract.fixture.json");
const raw = readFileSync(FIXTURE_PATH);
const fixture = JSON.parse(raw.toString("utf8")) as {
  contractVersion: string;
  media: unknown[];
};

test.describe("cross-repository media contract fixture", () => {
  test("is byte-identical to the copy pinned in FeelStack", () => {
    expect(createHash("sha256").update(raw).digest("hex")).toBe(FIXTURE_SHA256);
  });

  test("declares the contract version both sides pin", () => {
    expect(fixture.contractVersion).toBe(CONTRACT_VERSION);
  });

  test("every producer-emitted item is accepted by this consumer", () => {
    // Zero rejections is the assertion that matters. One rejection here means
    // the backend is emitting something this build silently discards.
    const { media, rejected } = parseMediaAssignments(fixture.media);
    expect(rejected).toEqual([]);
    expect(media).toHaveLength(fixture.media.length);
  });

  test("adapts into renderable assets with both locales of alt text", () => {
    const { media } = parseMediaAssignments(fixture.media);
    for (const asset of media) {
      expect(asset.path.startsWith("/blue-diamond/")).toBe(true);
      expect(asset.width).toBeGreaterThan(0);
      expect(asset.height).toBeGreaterThan(0);
      expect(typeof asset.alt.en).toBe("string");
      expect(typeof asset.alt.ar).toBe("string");
      expect(asset.status).toBe("approved");
    }
  });

  test("keeps a decorative OG image with empty alt rather than rejecting it", () => {
    const { media } = parseMediaAssignments(fixture.media);
    const og = media.find((asset) => asset.slot === "ogImage");
    expect(og).toBeDefined();
    expect(og!.alt).toEqual({ en: "", ar: "" });
    expect(og!.role).toBe("social");
  });

  test("carries the shared product asset with its localized caption", () => {
    const { media } = parseMediaAssignments(fixture.media);
    const product = media.find((asset) => asset.slot === "productPrimary");
    expect(product).toBeDefined();
    expect(product!.caption?.en).toBe("14.2 g");
    expect(product!.caption?.ar).toBe("14.2 غرام");
    expect(product!.focalPoint).toEqual({ x: 50, y: 45 });
  });
});
