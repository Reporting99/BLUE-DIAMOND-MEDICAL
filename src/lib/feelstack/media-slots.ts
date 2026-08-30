import type { ImageKitAsset, ImageStatus } from "@/types/media";
import { primaryForSlot, type ResolvedMedia } from "./media";

/**
 * The single place where "which image goes in this slot?" is decided.
 *
 * `./media.ts` validates what FeelStack sent and `./adapters.ts` hands it to an
 * entity contract as `AdapterInput.media`. Until this module existed nothing
 * read that array: every contract built its image reference from the entity's
 * own static/metadata fields, so a real, enabled, published media assignment
 * was parsed, sorted — and then dropped on the floor at the adapter boundary.
 * That is the defect this module closes, and it closes it once rather than
 * once per feature: every entity contract calls `resolveSlotImage` and no
 * template constructs an image reference of its own.
 *
 * PRECEDENCE, HIGHEST FIRST. The order is the whole point of the module:
 *
 *  1. A hard override — `status: "disabled"` or `photoDeclined: true`. This
 *     beats everything, including a perfectly valid assignment. A person who
 *     has declined photography must not acquire a portrait because an importer
 *     later attached one to their record, and a withdrawn image must not come
 *     back because a row still exists upstream. This is a consent decision, not
 *     a rendering preference, so it is evaluated before the CMS is consulted at
 *     all — see `docs/CONTENT_MODEL.md` on Dr. Omaima Saeed.
 *
 *  2. A real FeelStack assignment for the slot. FeelStack has already filtered
 *     to enabled assignments of publishable assets within this project, and
 *     `parseMediaAssignments` has already rejected anything malformed, so
 *     anything still here is a genuine editorial decision and outranks whatever
 *     the repository happened to hardcode.
 *
 *  3. The existing static fallback, unchanged. No assignment is not an error —
 *     it is the normal state for an entity whose media has not been imported,
 *     and the previous behaviour (usually a `pending` record that renders the
 *     FacetTile placeholder) is exactly the right thing to keep.
 *
 * WHAT THIS MODULE DELIBERATELY DOES NOT DO. It never rewrites a status. A
 * `pending` asset stays `pending` and therefore still renders the placeholder,
 * because `ImageKitImage` renders real bytes only for `approved`. Promoting an
 * unreviewed asset is an editorial act that belongs in the CMS, and doing it
 * here would put an unreviewed photograph on a medical page — the one failure
 * this whole pipeline is built to prevent. The status that arrives is the
 * status that renders.
 */

/**
 * An entity's own statement about its image, independent of the CMS.
 *
 * Carried by records that predate media assignments (doctors' `metadata`, the
 * static `image-manifest`). Only the two fields that can *veto* a CMS
 * assignment are modelled, because vetoing is the only authority a static
 * record still has once a real assignment exists.
 */
export interface SlotImageOverride {
  status: ImageStatus;
  /** true = the subject has explicitly declined photography. Never revisit. */
  photoDeclined?: boolean;
}

/**
 * True when a record forbids rendering any image for this slot.
 *
 * Both conditions are permanent refusals rather than "not ready yet":
 * `disabled` is a withdrawn image, `photoDeclined` is a person's decision. The
 * distinction from `pending`/`temporary` matters — those mean "no image yet",
 * which an assignment is allowed to answer.
 */
export function isHardOverride(override: SlotImageOverride | undefined): boolean {
  return override?.status === "disabled" || override?.photoDeclined === true;
}

export interface ResolveSlotImageOptions {
  /** Validated assignments for this entity, from `AdapterInput.media`. */
  media: readonly ResolvedMedia[];
  /**
   * CMS slot key, e.g. "hero", "card", "doctorPortrait", "productPrimary".
   *
   * A list expresses a PREFERENCE ORDER for a template that can render any of
   * several placements: the first slot that actually has an assignment wins.
   * This matters because FeelStack only sends assignments whose asset is
   * publishable, so an entity can legitimately arrive with its `card` filled
   * and its `hero` withheld, and the template should use what it was given
   * rather than nothing.
   */
  slot: string | readonly string[];
  /**
   * What this entity already said about its own image. Present for records
   * that carry a static reference; its only power is to veto (rule 1).
   */
  override?: SlotImageOverride;
  /** Rendered when no assignment exists. Usually the current static record. */
  fallback?: ImageKitAsset;
}

/**
 * Resolves one slot to the asset a template should render, or `undefined` when
 * there is nothing to show and no fallback was supplied.
 *
 * Returns a plain `ImageKitAsset` so templates and `ImageKitImage` keep the
 * exact contract they already have — this fix changes *which* asset reaches a
 * template, never the shape of one.
 */
export function resolveSlotImage({
  media,
  slot,
  override,
  fallback,
}: ResolveSlotImageOptions): ImageKitAsset | undefined {
  // Rule 1. Consent and withdrawal outrank the CMS. Returning the fallback
  // unchanged keeps the record's own `disabled` status, so `ImageKitImage`
  // renders the placeholder and never requests bytes.
  if (isHardOverride(override)) return fallback;

  // Rule 2. A real assignment wins over anything hardcoded in this repository.
  const assigned = firstAssigned(media, slot);
  if (assigned) return assigned;

  // Rule 3. Unchanged existing behaviour.
  return fallback;
}

/**
 * The doctor-shaped variant: `{ path, status, photoDeclined? }` rather than a
 * full `ImageKitAsset`.
 *
 * Doctors keep their own narrow image type (`features/doctors/types.ts`) and
 * their template reads `doctor.image.path` / `.status` directly, so returning
 * that shape lets the portrait start coming from a real assignment without
 * touching the template or widening the domain type.
 */
export interface SlotImageRef {
  path: string;
  status: ImageStatus;
  photoDeclined?: boolean;
}

export function resolveSlotImageRef({
  media,
  slot,
  override,
  fallback,
}: {
  media: readonly ResolvedMedia[];
  slot: string | readonly string[];
  override?: SlotImageOverride;
  fallback: SlotImageRef;
}): SlotImageRef {
  if (isHardOverride(override)) return fallback;
  const assigned = firstAssigned(media, slot);
  if (!assigned) return fallback;
  return { path: assigned.path, status: assigned.status };
}

/**
 * Every assignment across `slots`, in CMS order — the gallery counterpart to
 * `resolveSlotImage`.
 *
 * Returns an empty array rather than a fallback so the caller can decide
 * between "use the assignments" and "use my own records" wholesale. Merging the
 * two is what produces a product page showing both a real photograph and the
 * placeholder record that stood in for it, so no caller is offered that option.
 */
export function resolveSlotGallery(
  media: readonly ResolvedMedia[],
  slots: readonly string[],
  override?: SlotImageOverride,
): ResolvedMedia[] {
  if (isHardOverride(override)) return [];
  return media.filter((item) => slots.includes(item.slot));
}

/** First assignment matching any of `slot`, in the order given. */
function firstAssigned(
  media: readonly ResolvedMedia[],
  slot: string | readonly string[],
): ResolvedMedia | undefined {
  const keys = typeof slot === "string" ? [slot] : slot;
  for (const key of keys) {
    const found = primaryForSlot(media, key);
    if (found) return found;
  }
  return undefined;
}
