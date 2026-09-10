import { test, expect } from "@playwright/test";
import { buildSrc } from "@imagekit/javascript";
import { imagekitConfig, imagePresets } from "../../src/config/imagekit";
import { adaptMediaAssignment, feelstackMediaAssignmentSchema } from "../../src/lib/feelstack/media";
import { resolveSlotImageRef } from "../../src/lib/feelstack/media-slots";
import { productCardImage } from "../../src/features/products/media";
import type { Product } from "../../src/features/products/types";

/**
 * Cache-busting for ImageKit delivery URLs (root cause: `ImageKitImage` and
 * `adaptMediaAssignment` never varied a URL with the asset's content, so a
 * replaced image kept the browser/Next/CDN cache chain serving stale bytes
 * forever — see PR description).
 *
 * The fix threads the FeelStack media assignment's own `id` — the asset
 * identity, not the slot/placement — through as a `v` query param, via the
 * `@imagekit/next`/`@imagekit/javascript` SDK's documented `queryParameters`
 * option (`ImageKitImage`'s `version` prop), never by hand-concatenating onto
 * `path`. These tests cover the two ends of that chain: the SDK-level URL
 * merge (no collision with `tr=`, no `v=undefined`), and the domain-level
 * plumbing that gets a real `id` to that call site.
 */

function mediaItem(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: "a1b2c3d4-asset-id",
    path: "/blue-diamond/treatments/rf-microneedling-hero.png",
    width: 800,
    height: 600,
    alt: { en: "RF microneedling", ar: "RF microneedling" },
    slot: "hero",
    approvalStatus: "approved",
    ...over,
  };
}

test.describe("ImageKit URL construction with a version param", () => {
  test("adds v= alongside the transformation, both present, neither corrupted", () => {
    const url = buildSrc({
      urlEndpoint: imagekitConfig.urlEndpoint,
      src: "/blue-diamond/home/hero.png",
      transformation: [imagePresets.hero],
      queryParameters: { v: "asset-123" },
    });
    const parsed = new URL(url);
    expect(parsed.searchParams.get("v")).toBe("asset-123");
    // The preset's own transformation string must survive untouched.
    expect(parsed.searchParams.get("tr")).toBe("w-1920,q-80,f-auto");
    // Exactly one `v` and one `tr` — no duplication, no second `?`.
    expect(url.match(/\?/g)?.length).toBe(1);
  });

  test("two different ids for the same path/preset yield two different URLs", () => {
    const build = (v: string) =>
      buildSrc({
        urlEndpoint: imagekitConfig.urlEndpoint,
        src: "/blue-diamond/home/hero.png",
        transformation: [imagePresets.hero],
        queryParameters: { v },
      });
    // This is the entire fix: a replaced asset (new id) must produce a
    // fetchable-as-new URL even though the library path never changes.
    expect(build("asset-123")).not.toBe(build("asset-456"));
  });

  test("no version supplied -> no v param, no crash, url unchanged from before the fix", () => {
    const withVersion = buildSrc({
      urlEndpoint: imagekitConfig.urlEndpoint,
      src: "/blue-diamond/home/hero.png",
      transformation: [imagePresets.hero],
      queryParameters: { v: "asset-123" },
    });
    const withoutVersion = buildSrc({
      urlEndpoint: imagekitConfig.urlEndpoint,
      src: "/blue-diamond/home/hero.png",
      transformation: [imagePresets.hero],
      // ImageKitImage omits `queryParameters` entirely rather than passing
      // `{ v: undefined }` when there is no version — this is the shape it
      // actually calls the SDK with in that case.
    });
    expect(new URL(withoutVersion).searchParams.has("v")).toBe(false);
    expect(withoutVersion).not.toContain("v=undefined");
    expect(withoutVersion).not.toBe(withVersion);
  });
});

test.describe("adaptMediaAssignment exposes the version identifier", () => {
  test("ResolvedMedia.id is the asset id, and .path stays byte-for-byte the CMS value", () => {
    const asset = adaptMediaAssignment(feelstackMediaAssignmentSchema.parse(mediaItem()));
    expect(asset.id).toBe("a1b2c3d4-asset-id");
    // The identity contract other consumers rely on (see
    // tests/contracts/media-assignment-consumer.spec.ts) must not be
    // disturbed by adding cache-busting — .path is never mutated.
    expect(asset.path).toBe("/blue-diamond/treatments/rf-microneedling-hero.png");
  });

  test("two assignments for the same slot/path with different ids are distinguishable", () => {
    const first = adaptMediaAssignment(feelstackMediaAssignmentSchema.parse(mediaItem({ id: "old-asset" })));
    const second = adaptMediaAssignment(feelstackMediaAssignmentSchema.parse(mediaItem({ id: "new-asset" })));
    expect(first.path).toBe(second.path);
    expect(first.id).not.toBe(second.id);
  });
});

test.describe("the version identifier reaches every render path", () => {
  test("resolveSlotImageRef (doctor portraits) forwards the assignment id", () => {
    const assigned = adaptMediaAssignment(feelstackMediaAssignmentSchema.parse(mediaItem({ slot: "doctorPortrait" })));
    const resolved = resolveSlotImageRef({
      media: [assigned],
      slot: "doctorPortrait",
      fallback: { path: "/blue-diamond/shared/legacy/fallback.jpg", status: "pending" },
    });
    expect(resolved.id).toBe("a1b2c3d4-asset-id");
  });

  test("resolveSlotImageRef falls back gracefully with no id when nothing is assigned", () => {
    const resolved = resolveSlotImageRef({
      media: [],
      slot: "doctorPortrait",
      fallback: { path: "/blue-diamond/shared/legacy/fallback.jpg", status: "pending" },
    });
    expect(resolved.id).toBeUndefined();
    expect(resolved.path).toBe("/blue-diamond/shared/legacy/fallback.jpg");
  });

  test("productCardImage forwards the assignment id for the shop grid", () => {
    const assigned = adaptMediaAssignment(
      feelstackMediaAssignmentSchema.parse(mediaItem({ slot: "productPrimary" })),
    );
    const product = {
      id: "tns-recovery-complex",
      images: [{ path: "/blue-diamond/shop/fallback.jpg", status: "pending", alt: { en: "", ar: "" } }],
    } as unknown as Product;
    const resolved = productCardImage({ [product.id]: [assigned] }, product);
    expect(resolved?.id).toBe("a1b2c3d4-asset-id");
  });
});
