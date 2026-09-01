import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveSlotImage } from "../../src/lib/feelstack/media-slots";
import type { ResolvedMedia } from "../../src/lib/feelstack/media";
import type { ImageKitAsset } from "../../src/types/media";

/**
 * Hub routes as media owners — the architecture that lets a STATIC Next route
 * (`/medical`, `/aesthetics`) consume a FeelStack MediaAssignment without a CMS
 * entry taking over the page.
 *
 * WHY THIS EXISTS. The Aesthetics pathway card used to hardcode a `FacetTile`.
 * An approved photograph assigned to the Aesthetics hub could not reach it no
 * matter what the CMS said — the placeholder was the permanent answer rather
 * than the fallback. Removing that hardcode is only safe if three things hold,
 * and each is asserted here rather than assumed:
 *
 *   1. an approved assignment wins,
 *   2. a `pending` asset never renders real bytes,
 *   3. nothing renders, and nothing throws, when there is no assignment.
 *
 * Plus the structural guarantee that makes the whole approach legitimate: the
 * hub pages read MEDIA from the CMS and never CONTENT, so a published hub page
 * cannot replace the static route beside it.
 */

const asset = (over: Partial<ResolvedMedia> = {}): ResolvedMedia => ({
  id: "asset-1",
  path: "/blue-diamond/aesthetics/aesthetics-hub-hero.png",
  width: 1672,
  height: 941,
  alt: { en: "Aesthetics hub", ar: "التجميل الطبي" },
  role: "hero",
  status: "approved",
  slot: "hero",
  sortOrder: 0,
  ...over,
});

test.describe("hub media resolution", () => {
  test("an approved assignment on the hub wins over the static fallback", () => {
    const chosen = resolveSlotImage({ media: [asset()], slot: ["hero", "card"] });
    expect(chosen?.path).toBe("/blue-diamond/aesthetics/aesthetics-hub-hero.png");
    expect(chosen?.status).toBe("approved");
  });

  test("slot precedence is hero then card, so a card-only hub still resolves", () => {
    // `role` stays a real ImageRole — "card" is a SLOT, not a role.
    const cardOnly = asset({ slot: "card", role: "treatment", path: "/blue-diamond/x/card.png" });
    expect(resolveSlotImage({ media: [cardOnly], slot: ["hero", "card"] })?.path).toBe("/blue-diamond/x/card.png");

    // With both present, hero is chosen — not merely whichever sorted first.
    const both = [cardOnly, asset({ slot: "hero", path: "/blue-diamond/x/hero.png" })];
    expect(resolveSlotImage({ media: both, slot: ["hero", "card"] })?.path).toBe("/blue-diamond/x/hero.png");
  });

  test("a pending asset is passed through unpromoted, so ImageKitImage renders the fallback", () => {
    // The resolver must NOT invent an approval. Promoting an unreviewed asset
    // here would put unreviewed imagery on a medical page — the single failure
    // this pipeline exists to prevent.
    const chosen = resolveSlotImage({ media: [asset({ status: "pending" })], slot: ["hero", "card"] });
    expect(chosen?.status).toBe("pending");
  });

  test("no assignment resolves to undefined, which is the caller's fallback signal", () => {
    expect(resolveSlotImage({ media: [], slot: ["hero", "card"] })).toBeUndefined();
  });

  test("a disabled/withdrawn override still beats an assignment", () => {
    const fallback: ImageKitAsset = {
      id: "static",
      path: "/blue-diamond/shared/placeholder.png",
      width: 1,
      height: 1,
      alt: { en: "", ar: "" },
      role: "hero",
      status: "disabled",
    };
    const chosen = resolveSlotImage({
      media: [asset()],
      slot: ["hero", "card"],
      override: { status: "disabled" },
      fallback,
    });
    expect(chosen?.status, "a withdrawn image must not come back via an assignment").toBe("disabled");
  });
});

test.describe("hub pages own media, never content", () => {
  const homepage = readFileSync(join(__dirname, "..", "..", "src/app/[locale]/page.tsx"), "utf8");
  const medicalHub = readFileSync(join(__dirname, "..", "..", "src/app/[locale]/medical/page.tsx"), "utf8");
  const aestheticsHub = readFileSync(join(__dirname, "..", "..", "src/app/[locale]/aesthetics/page.tsx"), "utf8");

  test("the Aesthetics pathway card no longer hardcodes a FacetTile as its only visual", () => {
    // The card must consume resolved media first. A FacetTile may still appear
    // in the file — as the fallback branch — but not as the sole visual.
    expect(homepage).toContain('featured("hub:aesthetics", "hero", "card")');
    const cardBlock = homepage.slice(homepage.indexOf('href={href("aesthetics-hub", locale)}'));
    const upToGradient = cardBlock.slice(0, cardBlock.indexOf("linear-gradient"));
    expect(upToGradient, "the card must render assigned media before falling back").toContain("aestheticsHubMedia ? (");
    expect(upToGradient).toContain("ImageKitImage");
  });

  test("hub routes are registered as media owners on the homepage batch", () => {
    expect(homepage).toContain('{ id: "hub:medical", englishPath: "/medical" }');
    expect(homepage).toContain('{ id: "hub:aesthetics", englishPath: "/aesthetics" }');
  });

  /**
   * The load-bearing safety property. These hub routes are static Next pages.
   * They may ask the CMS for MEDIA, but they must never resolve CMS CONTENT —
   * `resolvePageContent` on one of them would let a published CMS page replace
   * or reorder the approved static copy, which is exactly the destructive
   * duplication this architecture avoids.
   */
  for (const [label, source] of [
    ["medical hub", medicalHub],
    ["aesthetics hub", aestheticsHub],
  ] as const) {
    test(`${label} consumes CMS media only, never CMS page content`, () => {
      expect(source, `${label} must not resolve CMS content`).not.toContain("resolvePageContent");
      expect(source).not.toContain("data.blocks");
      const usesMedia = source.includes("resolveListingMedia") || source.includes("resolvePageHeroImage");
      expect(usesMedia, `${label} should resolve media`).toBe(true);
    });
  }

  test("no ImageKit URL is hardcoded anywhere in the homepage or hub pages", () => {
    for (const [label, source] of [
      ["homepage", homepage],
      ["medical hub", medicalHub],
      ["aesthetics hub", aestheticsHub],
    ] as const) {
      expect(source, `${label} must not hardcode a CDN URL`).not.toContain("ik.imagekit.io");
    }
  });
});
