import { cacheTags } from "@/lib/feelstack/cache-tags";
import { resolveListingMedia, type ListingEntity, type ListingMedia } from "@/lib/feelstack/listing-media";
import { resolveSlotImage } from "@/lib/feelstack/media-slots";
import type { Locale } from "@/lib/feelstack/contracts";
import type { ImageKitAsset } from "@/types/media";
import type { Technology } from "./types";

/**
 * Device imagery for surfaces that render technologies they do not own.
 *
 * The concern page is the first of these: its results section closes with a
 * picture of the device the treatment runs on, and the concern's own
 * `resolvePageContent` call resolves the concern — not the four technologies it
 * links to. Same split the concerns explorer hit, closed the same way; see the
 * long note at the top of `features/concerns/media.ts`, which applies verbatim.
 *
 * The slot order matches `technologyCmsContract`'s own `["card", "hero"]` so a
 * device shows the same photograph here as on its detail page, plus `gallery`
 * as a last resort for a device whose only assignment is a gallery frame.
 */
export const TECHNOLOGY_CARD_SLOTS = ["card", "hero", "gallery"] as const;

/** Listing key for one technology. Shared by producer and consumer. */
export const technologyMediaKey = (id: string) => `technology:${id}`;

/** The CMS path for a technology — its English public path, unchanged. */
export const technologyCmsPath = (slug: string) => `/aesthetics/technologies/${slug}`;

export function technologyListingEntities(list: readonly Technology[]): ListingEntity[] {
  return list.map((tech) => ({
    id: technologyMediaKey(tech.id),
    englishPath: technologyCmsPath(tech.slug),
  }));
}

/**
 * Fan out over `list` and return each technology's CMS media.
 *
 * Tagged with `technologiesIndex` so a device publish invalidates every page
 * showing that device, not only its own detail page. Inherits
 * `resolveListingMedia`'s silent-failure rule: in static content mode, or on a
 * CMS timeout, this is an empty map and the device tile falls back to its
 * FacetTile exactly as an unassigned device already does.
 */
export function resolveTechnologyListingMedia(
  list: readonly Technology[],
  locale: Locale,
): Promise<ListingMedia> {
  return resolveListingMedia(technologyListingEntities(list), locale, [
    cacheTags.technologiesIndex(process.env.FEELSTACK_SITE_KEY ?? "", locale),
  ]);
}

/** One plain asset per technology, keyed by technology id. */
export function technologyCardImages(
  media: ListingMedia,
  list: readonly Technology[],
): Record<string, ImageKitAsset> {
  const images: Record<string, ImageKitAsset> = {};
  for (const tech of list) {
    const asset = resolveSlotImage({
      media: media[technologyMediaKey(tech.id)] ?? [],
      slot: TECHNOLOGY_CARD_SLOTS,
    });
    if (asset) images[tech.id] = asset;
  }
  return images;
}
