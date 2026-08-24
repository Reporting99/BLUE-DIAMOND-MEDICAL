import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { feelstackResolveEnvelopeSchema } from "../../src/lib/feelstack/transport";
import { parseMediaAssignments, toImageStatus } from "../../src/lib/feelstack/media";

/**
 * Cross-repository contract fixture — consumer side.
 *
 * `media-contract.fixture.json` exists byte-identically here and in FeelStack
 * (`headless-cms/src/platform/contracts/media-contract.fixture.json`). Both
 * repositories pin the same SHA-256 and the same `contractVersion`, so a
 * unilateral edit fails that repository's own build rather than quietly
 * emptying every page's media in production.
 *
 * Three sections, three different obligations for this side:
 *   published      — must ALL be accepted; zero rejections.
 *   neverPublished — the producer withholds these, but if one ever arrives it
 *                    must degrade toward the placeholder, never to "approved".
 *   malformed      — must be dropped individually, and must not stop the
 *                    envelope from parsing or the page from rendering.
 *
 * The FeelStack side asserts the producer emits and withholds correctly. This
 * side asserts the consumer accepts and degrades correctly. Together they close
 * the loop this integration previously had open: the old route-inventory
 * contract test asserted a shape the backend never emitted and passed for the
 * integration's entire life.
 */
const FIXTURE_SHA256 = "4ee82fe268819382393df0a44893fe185e7e156124e9e0ece3f0253f43e323ba";
const CONTRACT_VERSION = "media-contract/v2";

const FIXTURE_PATH = join(__dirname, "..", "fixtures", "feelstack", "media-contract.fixture.json");
const raw = readFileSync(FIXTURE_PATH);
const fixture = JSON.parse(raw.toString("utf8")) as {
  contractVersion: string;
  published: unknown[];
  neverPublished: Array<{ case: string; record: Record<string, unknown> }>;
  malformed: Array<{ case: string; record: unknown }>;
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
    const { media, rejected } = parseMediaAssignments(fixture.published);
    expect(rejected).toEqual([]);
    expect(media).toHaveLength(fixture.published.length);
  });

  test("adapts into renderable assets with both locales of alt text", () => {
    const { media } = parseMediaAssignments(fixture.published);
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
    const { media } = parseMediaAssignments(fixture.published);
    const og = media.find((asset) => asset.slot === "ogImage");
    expect(og).toBeDefined();
    expect(og!.alt).toEqual({ en: "", ar: "" });
    expect(og!.role).toBe("social");
  });

  test("carries the shared product asset with its localized caption and focal point", () => {
    const { media } = parseMediaAssignments(fixture.published);
    const product = media.find((asset) => asset.slot === "productPrimary");
    expect(product).toBeDefined();
    expect(product!.caption?.en).toBe("14.2 g");
    expect(product!.caption?.ar).toBe("14.2 غرام");
    expect(product!.focalPoint).toEqual({ x: 50, y: 45 });
  });

  test("preserves the producer's aspect ratio rather than recomputing a different one", () => {
    const { media } = parseMediaAssignments(fixture.published);
    const hero = media.find((asset) => asset.slot === "hero");
    expect(hero!.aspectRatio).toBe("1.776833");
  });

  test("exposes a multi-asset slot in sort order", () => {
    const { media } = parseMediaAssignments(fixture.published);
    const gallery = media.filter((asset) => asset.slot === "gallery");
    expect(gallery).toHaveLength(2);
    expect(gallery.map((asset) => asset.sortOrder)).toEqual([0, 1]);
  });

  test("never promotes a non-publishable record to approved", () => {
    // The producer withholds these. If one ever reaches this build anyway --
    // a filter regression, a older producer, a cached response -- it must
    // render the placeholder. On a medical site the failure direction matters
    // more than the failure rate.
    for (const entry of fixture.neverPublished) {
      const status = toImageStatus(entry.record.approvalStatus as string);
      expect(status).not.toBe("approved");
    }
  });

  test("an unknown future approval status degrades to pending, not approved", () => {
    const unknown = fixture.neverPublished.find(
      (entry) => entry.record.approvalStatus === "awaiting_legal_review",
    );
    expect(unknown).toBeDefined();
    expect(toImageStatus(unknown!.record.approvalStatus as string)).toBe("pending");
  });

  test("drops every malformed record and keeps every sound one", () => {
    const mixed = [...fixture.published, ...fixture.malformed.map((entry) => entry.record)];
    const { media, rejected } = parseMediaAssignments(mixed);

    expect(media).toHaveLength(fixture.published.length);
    expect(rejected).toHaveLength(fixture.malformed.length);
    // Every rejection names the index it came from, so a real one is
    // diagnosable from the log line alone.
    for (const reason of rejected) {
      expect(reason).toMatch(/^media\[\d+\]: /);
    }
  });

  test("a malformed record never turns the page into a 404", () => {
    // The whole safety property. If `media` were strictly typed inside the
    // envelope schema, this safeParse would fail, and page-resolver treats an
    // unparseable envelope as an unusable response.
    const envelope = {
      type: "content_entry",
      route: {
        id: "route-1",
        path: "/aesthetics/treatments/rf-microneedling",
        locale: "en",
        requestedLocale: "en",
        resolvedLocale: "en",
        usedFallback: false,
      },
      data: { id: "entry-1", title: "RF Micro-Needling", fields: {} },
      relations: { items: [], faqs: [], sections: [], taxonomies: [] },
      media: [...fixture.malformed.map((entry) => entry.record), ...fixture.published],
    };

    const parsed = feelstackResolveEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);

    const { media, rejected } = parseMediaAssignments(parsed.success ? parsed.data.media : []);
    expect(media).toHaveLength(fixture.published.length);
    expect(rejected).toHaveLength(fixture.malformed.length);
  });

  test("rejects a cross-project path even though every other field is valid", () => {
    const leak = fixture.malformed.find(
      (entry) => entry.case === "path outside the project prefix",
    );
    expect(leak).toBeDefined();
    const { media, rejected } = parseMediaAssignments([leak!.record]);
    expect(media).toEqual([]);
    expect(rejected[0]).toContain("path");
  });
});
