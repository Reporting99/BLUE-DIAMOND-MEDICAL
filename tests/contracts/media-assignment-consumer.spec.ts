import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { feelstackResolveEnvelopeSchema } from "../../src/lib/feelstack/transport";
import { parseMediaAssignments, type ResolvedMedia } from "../../src/lib/feelstack/media";
import { toAdapterInput } from "../../src/lib/feelstack/adapters";
import {
  isHardOverride,
  resolveSlotGallery,
  resolveSlotImage,
  resolveSlotImageRef,
} from "../../src/lib/feelstack/media-slots";
import { medicalServiceCmsContract } from "../../src/features/medical-services/cms-contract";
import { doctorCmsContract } from "../../src/features/doctors/cms-contract";

/**
 * The consumer half of the media contract.
 *
 * `feelstack-media.spec.ts` proves the envelope PARSES. This file proves the
 * parsed result is actually CONSUMED — the gap that made a fully imported,
 * fully verified media library render zero images: every assignment reached
 * `AdapterInput.media` correctly and no entity contract ever read it.
 *
 * The primary fixture is not synthetic. It is the literal response of
 * `GET /public/v1/sites/<site>/resolve?path=/medical/eye-screening&locale=en`
 * captured from production, the one entity whose assigned asset is approved
 * and whose ImageKit URL returns 200. A test built on a hand-written envelope
 * is exactly how the previous gap survived: it asserted a shape rather than a
 * behaviour against real data.
 */

const realEnvelope = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "tests", "fixtures", "feelstack", "medical-service-media-resolve-en.json"),
    "utf8",
  ),
);

function mediaFrom(envelope: unknown): ResolvedMedia[] {
  const parsed = feelstackResolveEnvelopeSchema.parse(envelope);
  const { media, rejected } = parseMediaAssignments(parsed.media);
  expect(rejected, "captured production envelope must not contain invalid rows").toEqual([]);
  return media;
}

function assignment(over: Partial<ResolvedMedia> = {}): ResolvedMedia {
  return {
    id: "assignment-1",
    path: "/blue-diamond/shared/legacy/094975f21717-Dr.Farhat.jpg",
    width: 800,
    height: 1000,
    aspectRatio: "0.800000",
    alt: { en: "Portrait", ar: "صورة" },
    role: "doctor",
    status: "approved",
    slot: "doctorPortrait",
    sortOrder: 0,
    ...over,
  };
}

test.describe("a resolved assignment reaches the template", () => {
  test("the real production envelope yields one approved card assignment", () => {
    const media = mediaFrom(realEnvelope);
    expect(media).toHaveLength(1);
    expect(media[0].slot).toBe("card");
    // The status the CMS sent, not one this build invented.
    expect(media[0].status).toBe("approved");
    expect(media[0].path).toBe("/blue-diamond/medical/eye-screening-hero.png");
  });

  test("the medical-service contract puts that assignment on the domain object", () => {
    const envelope = feelstackResolveEnvelopeSchema.parse(realEnvelope);
    const fields = medicalServiceCmsContract.fields.parse(envelope.data.fields);
    const service = medicalServiceCmsContract.adapt(
      toAdapterInput(envelope, "en", fields, mediaFrom(realEnvelope)),
    );

    // THE REGRESSION. Before this fix `service.image` did not exist: a valid,
    // approved, 200-returning assignment produced a page with no image, so the
    // surface fell back to the FacetTile placeholder. An entity that HAS a
    // resolved assignment must never render as an unresolved one.
    expect(service.image, "a resolved assignment must reach the template").toBeDefined();
    expect(service.image!.status).toBe("approved");

    // ImageKitImage renders real bytes only for "approved" — so this asset,
    // and only an asset in this state, produces an <img> rather than a tile.
    expect(service.image!.status === "approved").toBe(true);
  });

  test("the real ImageKit path is preserved byte-for-byte", () => {
    const envelope = feelstackResolveEnvelopeSchema.parse(realEnvelope);
    const fields = medicalServiceCmsContract.fields.parse(envelope.data.fields);
    const service = medicalServiceCmsContract.adapt(
      toAdapterInput(envelope, "en", fields, mediaFrom(realEnvelope)),
    );
    // Not rebuilt from a slug, a convention, or MEDIA_ROOT + id. The path the
    // CMS assigned is the path that is requested.
    expect(service.image!.path).toBe(realEnvelope.media[0].path);
  });
});

test.describe("consent and withdrawal outrank any assignment", () => {
  test("photoDeclined beats a valid assignment", () => {
    const resolved = resolveSlotImageRef({
      media: [assignment()],
      slot: "doctorPortrait",
      override: { status: "pending", photoDeclined: true },
      fallback: { path: "", status: "disabled" },
    });
    expect(resolved.path).toBe("");
    expect(resolved.status).toBe("disabled");
  });

  test("a disabled record beats a valid assignment", () => {
    const resolved = resolveSlotImageRef({
      media: [assignment()],
      slot: "doctorPortrait",
      override: { status: "disabled" },
      fallback: { path: "", status: "disabled" },
    });
    expect(resolved.path).toBe("");
    expect(resolved.status).toBe("disabled");
  });

  test("Dr. Omaima Saeed never acquires a portrait, even if an assignment is later attached", () => {
    // Her CMS record is photoDeclined: true / imageStatus: "disabled" and
    // carries no assignment. This asserts the outcome does not change if an
    // importer ever attaches one — the failure mode this guards is a person
    // acquiring a portrait she declined.
    //
    // WHAT THIS TEST ASSERTS, AND WHY IT NO LONGER ASSERTS `status: "disabled"`
    // AND `path: ""`. Those two literals described the empty CMS `imagePath`
    // that used to be the fallback, not the guarantee. They made a CORRECT
    // change look like a consent failure: a declined doctor's fallback now
    // comes from her repository record (src/features/doctors/data.ts), which
    // carries a designed, non-photographic identity card, so the adapter
    // legitimately returns that card at `approved` instead of an empty path.
    //
    // The guarantee has never been "she renders nothing". It is that NO
    // ASSIGNMENT CAN REACH HER, and that what does render is not a likeness.
    // Asserting that directly is both stronger and stable: the checks below
    // would have passed before this change and after it, and will keep passing
    // through the next one.
    const doctor = doctorCmsContract.adapt({
      locale: "en",
      id: "ce09aa53-0f1e-4d95-b5a9-3d2a7cfed4c4",
      fields: {
        displayName: "Dr. Omaima Saeed",
        professionalTitle: "Family Physician",
        biography: "…",
        metadata: {
          doctorId: "omaima-saeed",
          routeId: "doctor-saeed",
          practicesAesthetics: false,
          bookingChannel: "family-doctor",
          imagePath: "",
          imageStatus: "disabled",
          photoDeclined: true,
        },
      },
      faqs: [],
      relations: [],
      path: "/our-team/omaima-saeed",
      media: [assignment({ path: "/blue-diamond/shared/legacy/some-portrait.jpg" })],
    });

    // 1. The refusal survives adaptation. Everything else depends on this.
    expect(doctor.image.photoDeclined).toBe(true);
    // 2. THE INVARIANT: the attached assignment did not win. Asserting the
    //    negative is the point — whatever the fallback happens to be today,
    //    a photograph handed to her record must never come back out of it.
    expect(doctor.image.path).not.toBe("/blue-diamond/shared/legacy/some-portrait.jpg");
    // 3. What she renders instead is pinned, so silently swapping the
    //    consent-safe substitute for something else is also a failure. This
    //    asset is a name-and-brand-geometry card with no likeness of any kind
    //    (see src/features/doctors/data.ts and docs/MEDIA.md).
    expect(doctor.image.path).toBe(
      "/blue-diamond/team/blue-diamond-team-dr-omaima-saeed-identity.webp",
    );
  });

  test("isHardOverride distinguishes refusal from not-ready", () => {
    expect(isHardOverride({ status: "disabled" })).toBe(true);
    expect(isHardOverride({ status: "pending", photoDeclined: true })).toBe(true);
    // "not ready yet" is a question an assignment is allowed to answer.
    expect(isHardOverride({ status: "pending" })).toBe(false);
    expect(isHardOverride({ status: "temporary" })).toBe(false);
    expect(isHardOverride(undefined)).toBe(false);
  });
});

test.describe("a valid assignment outranks a hardcoded path", () => {
  test("the doctor portrait comes from the assignment, not metadata.imagePath", () => {
    const doctor = doctorCmsContract.adapt({
      locale: "en",
      id: "aed7273b-16fe-47a8-8742-9bdfe3ed0489",
      fields: {
        displayName: "Dr. Mohamed Farhat",
        professionalTitle: "Family Physician · Founder",
        biography: "…",
        metadata: {
          doctorId: "mohamed-farhat",
          routeId: "doctor-farhat",
          practicesAesthetics: true,
          bookingChannel: "family-doctor",
          // The stale legacy reference: not under MEDIA_ROOT, never uploaded.
          imagePath: "/doctors/farhat.jpg",
          imageStatus: "pending",
        },
      },
      faqs: [],
      relations: [],
      path: "/our-team/mohamed-farhat",
      media: [assignment()],
    });

    expect(doctor.image.path).toBe("/blue-diamond/shared/legacy/094975f21717-Dr.Farhat.jpg");
    expect(doctor.image.path).not.toBe("/doctors/farhat.jpg");
  });
});

test.describe("no assignment falls back safely", () => {
  test("the existing static record is returned untouched", () => {
    const resolved = resolveSlotImageRef({
      media: [],
      slot: "doctorPortrait",
      override: { status: "pending" },
      fallback: { path: "/blue-diamond/doctors/hamdi.jpg", status: "pending" },
    });
    expect(resolved).toEqual({ path: "/blue-diamond/doctors/hamdi.jpg", status: "pending" });
  });

  test("a slot with no assignment and no fallback resolves to nothing", () => {
    expect(resolveSlotImage({ media: [assignment()], slot: "hero" })).toBeUndefined();
  });

  test("slot preference takes the first slot that is actually assigned", () => {
    const media = mediaFrom(realEnvelope);
    // "hero" is assigned upstream but its asset is not publishable, so
    // FeelStack withheld it; the template must use the card it was given.
    expect(resolveSlotImage({ media, slot: ["hero", "card"] })?.path).toBe(
      "/blue-diamond/medical/eye-screening-hero.png",
    );
  });
});

test.describe("no global pending -> approved bypass", () => {
  test("a pending assignment stays pending through the whole consumer", () => {
    const pending = assignment({ status: "pending" });
    expect(resolveSlotImage({ media: [pending], slot: "doctorPortrait" })!.status).toBe("pending");
    expect(
      resolveSlotImageRef({
        media: [pending],
        slot: "doctorPortrait",
        fallback: { path: "", status: "disabled" },
      }).status,
    ).toBe("pending");
  });

  test("no source file promotes a status", () => {
    // A grep-level guard: the consumer must never contain a literal that turns
    // a non-approved asset into an approved one. This is the single change that
    // would put an unreviewed photograph on a medical page.
    const source = readFileSync(
      path.join(process.cwd(), "src", "lib", "feelstack", "media-slots.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/status:\s*["']approved["']/);
    expect(source).not.toMatch(/=\s*["']approved["']/);
  });

  test("every status the CMS can send survives the consumer unchanged", () => {
    for (const status of ["approved", "temporary", "pending", "disabled"] as const) {
      const resolved = resolveSlotImage({ media: [assignment({ status })], slot: "doctorPortrait" });
      expect(resolved!.status, `${status} must not be rewritten`).toBe(status);
    }
  });
});

test.describe("galleries", () => {
  test("gallery rows come back in CMS order and a hard override empties them", () => {
    const media = [
      assignment({ id: "g1", slot: "gallery", sortOrder: 0 }),
      assignment({ id: "g2", slot: "gallery", sortOrder: 1 }),
    ];
    expect(resolveSlotGallery(media, ["gallery"]).map((m) => m.id)).toEqual(["g1", "g2"]);
    expect(resolveSlotGallery(media, ["gallery"], { status: "disabled" })).toEqual([]);
  });
});
