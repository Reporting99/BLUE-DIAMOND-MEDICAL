import { cacheTags } from "@/lib/feelstack/cache-tags";
import { resolveListingMedia, type ListingEntity, type ListingMedia } from "@/lib/feelstack/listing-media";
import { resolveSlotImage } from "@/lib/feelstack/media-slots";
import type { Locale } from "@/lib/feelstack/contracts";
import type { ImageKitAsset } from "@/types/media";
import { CONCERN_FEATURE_SLOTS } from "./media-slots";
import type { AestheticConcern } from "./types";

/**
 * Concern imagery for the surfaces that render MANY concerns at once — the
 * homepage "By concern" section and the concerns hub, both of which are the
 * same `ConcernExplorer` component.
 *
 * WHY THIS EXISTS AS A MODULE. `resolvePageContent` resolves one entity, which
 * is what a concern detail page needs and useless for the explorer, so a
 * listing surface has to fan out for itself (`resolveListingMedia`) and then
 * translate the result into something a component can render. The products
 * family already hit this exact split and closed it the same way — see
 * `features/products/media.ts`, whose reasoning applies verbatim here. Doing it
 * per page instead would mean the homepage and the hub each deciding
 * independently which slot a concern's picture lives in, and the two answering
 * differently the first time either is edited.
 *
 * WHICH SLOT EACH SURFACE READS lives in `./media-slots`, shared with the CMS
 * contract so the explorer and the detail page cannot drift apart about it.
 */

/** Listing key for one concern. Shared so the producer and the consumer of a
 * `ListingMedia` map cannot disagree about it. */
export const concernMediaKey = (id: string) => `concern:${id}`;

/**
 * The `ListingEntity` rows for a set of concerns.
 *
 * Exposed separately from `resolveConcernListingMedia` because the homepage
 * already fans out once over every entity it features and should add concerns
 * to THAT call rather than making a second round of requests of its own.
 */
export function concernListingEntities(
  list: readonly AestheticConcern[],
): ListingEntity[] {
  return list.map((concern) => ({
    id: concernMediaKey(concern.id),
    englishPath: `/aesthetics/concerns/${concern.id}`,
  }));
}

/**
 * Fan out over `list` and return each concern's CMS media, keyed by
 * `concernMediaKey`.
 *
 * For a page whose only CMS media is its concerns (the concerns hub). Tagged
 * with `concernsIndex`, the same tag the detail pages carry, so a concern
 * publish invalidates the explorer everywhere it appears rather than leaving
 * the homepage holding a withdrawn picture until its own TTL expires.
 *
 * Inherits `resolveListingMedia`'s silent-failure rule: a CMS timeout yields an
 * empty map and the explorer renders its FacetTiles. A listing is decoration
 * around links that already work.
 */
export function resolveConcernListingMedia(
  list: readonly AestheticConcern[],
  locale: Locale,
): Promise<ListingMedia> {
  return resolveListingMedia(concernListingEntities(list), locale, [
    cacheTags.concernsIndex(process.env.FEELSTACK_SITE_KEY ?? "", locale),
  ]);
}

/**
 * The preview image for each concern the explorer renders, keyed by concern id.
 *
 * Resolved on the server so the client component receives one plain asset per
 * concern and no slot-precedence logic at all: the explorer's job is to decide
 * which concern is active, never which picture a concern owns. A concern with
 * no assignment is simply absent from the map, which is the signal the explorer
 * needs to keep rendering its FacetTile for that one alone.
 */
export function concernExplorerImages(
  media: ListingMedia,
  list: readonly AestheticConcern[],
): Record<string, ImageKitAsset> {
  const images: Record<string, ImageKitAsset> = {};
  for (const concern of list) {
    const asset = resolveSlotImage({
      media: media[concernMediaKey(concern.id)] ?? [],
      slot: CONCERN_FEATURE_SLOTS,
    });
    if (asset) images[concern.id] = asset;
  }
  return images;
}
