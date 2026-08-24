import { test, expect } from "@playwright/test";
import { feelstackResolveEnvelopeSchema } from "../../src/lib/feelstack/transport";
import {
  adaptMediaAssignment,
  bySlot,
  feelstackMediaAssignmentSchema,
  parseMediaAssignments,
  primaryForSlot,
  toImageRole,
  toImageStatus,
} from "../../src/lib/feelstack/media";
import { toAdapterInput } from "../../src/lib/feelstack/adapters";

/**
 * REAL FeelStack media contract.
 *
 * Every fixture below mirrors what `PublicRouteResolverService.publicMedia`
 * actually emits in the FeelStack backend — an array of
 * `PublicMediaAssignment` objects hanging off the envelope's top-level `media`
 * key, NOT nested under `relations`. The sibling FeelStack spec
 * (`public-route-resolver.media.spec.ts`) asserts the producing side against
 * the same shape, so a change on either side breaks a test rather than
 * silently breaking production. That pairing is the point: this repo has
 * previously shipped a contract test that asserted a shape the backend never
 * emitted, and it passed for the integration's entire life.
 */

function mediaItem(over: Record<string, unknown> = {}) {
  return {
    id: "3f7c1a9e-0000-4000-8000-000000000001",
    path: "/blue-diamond/treatments/rf-microneedling-hero.png",
    width: 1672,
    height: 941,
    aspectRatio: 1.776833,
    alt: {
      en: "RF Micro-Needling at Blue Diamond Medical",
      ar: "الإبر الدقيقة بالترددات الراديوية في بلو دايموند الطبية",
    },
    role: "hero",
    slot: "hero",
    approvalStatus: "approved",
    sortOrder: 0,
    localeMode: "shared",
    ...over,
  };
}

test.describe("media assignment schema", () => {
  test("accepts the real resolver shape", () => {
    const parsed = feelstackMediaAssignmentSchema.safeParse(mediaItem());
    expect(parsed.success).toBe(true);
  });

  test("rejects a path outside the Blue Diamond media root", () => {
    // A path outside /blue-diamond/ is either a cross-project leak or a
    // misconfigured prefix. Either way this build must never request it.
    const parsed = feelstackMediaAssignmentSchema.safeParse(
      mediaItem({ path: "/other-tenant/shop/x.jpg" }),
    );
    expect(parsed.success).toBe(false);
  });

  test("rejects an asset without usable dimensions", () => {
    // No dimensions means no reserved layout space, which means guaranteed
    // layout shift. Dropping the image is the better failure.
    for (const broken of [{ width: 0 }, { height: 0 }, { width: -1 }]) {
      expect(feelstackMediaAssignmentSchema.safeParse(mediaItem(broken)).success).toBe(false);
    }
  });

  test("requires both locales of alt text", () => {
    expect(
      feelstackMediaAssignmentSchema.safeParse(mediaItem({ alt: { en: "only english" } })).success,
    ).toBe(false);
  });
});

test.describe("invalid media never fails the page", () => {
  test("drops bad rows, keeps good ones, and reports why", () => {
    const result = parseMediaAssignments([
      mediaItem(),
      mediaItem({ id: "bad-1", height: 0, slot: "card" }),
      mediaItem({ id: "bad-2", path: "/elsewhere/x.png", slot: "section" }),
      mediaItem({ id: "3f7c1a9e-0000-4000-8000-000000000002", slot: "card" }),
    ]);

    expect(result.media).toHaveLength(2);
    expect(result.rejected).toHaveLength(2);
    expect(result.rejected[0]).toContain("media[1]");
    expect(result.rejected[1]).toContain("media[2]");
  });

  test("a completely malformed media array yields empty media, not a throw", () => {
    for (const hostile of [null, "not-an-array", 42, { media: [] }]) {
      const result = parseMediaAssignments(hostile);
      expect(result.media).toEqual([]);
    }
    // undefined is "the CMS sent no media", which is normal and not a defect.
    expect(parseMediaAssignments(undefined).rejected).toEqual([]);
  });

  test("an envelope carrying broken media still parses as a valid envelope", () => {
    // This is the whole safety property. If `media` were strictly typed inside
    // the envelope schema, this safeParse would fail and the page resolver
    // would render a 404 for a missing image.
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
      media: [{ garbage: true }, mediaItem()],
    };

    const parsed = feelstackResolveEnvelopeSchema.safeParse(envelope);
    expect(parsed.success).toBe(true);

    const { media, rejected } = parseMediaAssignments(parsed.success ? parsed.data.media : []);
    expect(media).toHaveLength(1);
    expect(rejected).toHaveLength(1);
  });
});

test.describe("vocabulary mapping", () => {
  test("maps CMS roles onto this build's ImageRole", () => {
    expect(toImageRole("productPrimary")).toBe("product");
    expect(toImageRole("doctorPortrait")).toBe("doctor");
    expect(toImageRole("ogImage")).toBe("social");
    expect(toImageRole("technology")).toBe("technology");
  });

  test("an unknown role degrades to a neutral one rather than invalidating the asset", () => {
    expect(toImageRole("someFutureRole")).toBe("hero");
    expect(toImageRole(undefined)).toBe("hero");
  });

  test("an unknown approval status is never treated as approved", () => {
    // The direction of this failure is the point: an unrecognised status must
    // render the placeholder, never promote an unreviewed image onto a
    // medical page.
    expect(toImageStatus("approved")).toBe("approved");
    expect(toImageStatus("pending")).toBe("pending");
    expect(toImageStatus("rejected")).toBe("disabled");
    expect(toImageStatus("awaiting_legal_review")).toBe("pending");
    expect(toImageStatus("")).toBe("pending");
  });
});

test.describe("adaptation to the domain model", () => {
  test("produces an ImageKitAsset the existing component can render", () => {
    const asset = adaptMediaAssignment(feelstackMediaAssignmentSchema.parse(mediaItem()));
    expect(asset.path).toBe("/blue-diamond/treatments/rf-microneedling-hero.png");
    expect(asset.width).toBe(1672);
    expect(asset.height).toBe(941);
    expect(asset.aspectRatio).toBe("1.776833");
    expect(asset.status).toBe("approved");
    expect(asset.role).toBe("hero");
    expect(asset.alt.ar.length).toBeGreaterThan(0);
  });

  test("one binary serves both locales — alt differs, path does not", () => {
    const shared = mediaItem();
    const en = adaptMediaAssignment(feelstackMediaAssignmentSchema.parse(shared));
    const ar = adaptMediaAssignment(feelstackMediaAssignmentSchema.parse(shared));
    expect(en.path).toBe(ar.path);
    expect(en.alt.en).not.toBe(en.alt.ar);
  });

  test("omits caption entirely when the CMS has none", () => {
    const asset = adaptMediaAssignment(feelstackMediaAssignmentSchema.parse(mediaItem()));
    expect(asset.caption).toBeUndefined();
  });

  test("carries a focal point through when present", () => {
    const asset = adaptMediaAssignment(
      feelstackMediaAssignmentSchema.parse(mediaItem({ focalPoint: { x: 40, y: 25 } })),
    );
    expect(asset.focalPoint).toEqual({ x: 40, y: 25 });
  });
});

test.describe("slot access", () => {
  test("groups by slot in sort order", () => {
    const { media } = parseMediaAssignments([
      mediaItem({ id: "3f7c1a9e-0000-4000-8000-00000000000a", slot: "gallery", sortOrder: 1 }),
      mediaItem({ id: "3f7c1a9e-0000-4000-8000-00000000000b", slot: "gallery", sortOrder: 0 }),
      mediaItem({ id: "3f7c1a9e-0000-4000-8000-00000000000c", slot: "hero", sortOrder: 0 }),
    ]);

    const grouped = bySlot(media);
    expect(Object.keys(grouped).sort()).toEqual(["gallery", "hero"]);
    expect(grouped.gallery.map((item) => item.sortOrder)).toEqual([0, 1]);
    expect(primaryForSlot(media, "hero")?.slot).toBe("hero");
    expect(primaryForSlot(media, "doctorPortrait")).toBeUndefined();
  });
});

test.describe("adapter input", () => {
  test("defaults media to empty so an un-migrated entity is unaffected", () => {
    const envelope = feelstackResolveEnvelopeSchema.parse({
      type: "content_entry",
      route: {
        id: "route-1",
        path: "/medical/eye-screening",
        locale: "en",
        requestedLocale: "en",
        resolvedLocale: "en",
        usedFallback: false,
      },
      data: { id: "entry-1", title: "Eye Screening", fields: {} },
    });
    expect(toAdapterInput(envelope, "en", {}).media).toEqual([]);
  });

  test("passes validated media through to the adapter", () => {
    const envelope = feelstackResolveEnvelopeSchema.parse({
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
      media: [mediaItem()],
    });
    const { media } = parseMediaAssignments(envelope.media);
    const input = toAdapterInput(envelope, "en", {}, media);
    expect(input.media).toHaveLength(1);
    expect(input.media[0].slot).toBe("hero");
  });
});
