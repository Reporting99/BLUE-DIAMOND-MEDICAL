import { resolveListingMedia, type ListingMedia } from "./listing-media";
import { cacheTags } from "./cache-tags";
import type { ImageKitAsset } from "@/types/media";
import type { Locale } from "./contracts";

/**
 * The image a page's own hero should render, or `undefined`.
 *
 * Every route now opens with a `PageHero` (src/components/layout/PageHero.tsx),
 * and every one of those heroes wants the same thing: whatever the CMS has
 * assigned to this page's `hero` slot, falling back to its `card` assignment,
 * falling back to nothing — at which point the hero draws its branded FacetTile
 * instead. Written out per page that is six lines of `resolveListingMedia`
 * boilerplate and a cache tag, repeated across two dozen files, which is two
 * dozen chances to pass the wrong locale or forget the tag. Written once it is
 * a single call, and the tagging is uniform by construction.
 *
 * `card` is accepted after `hero` for the same reason `resolveSlotImage`
 * accepts a slot list: FeelStack only sends assignments whose asset is
 * publishable, so a page can legitimately arrive with its card filled and its
 * hero withheld. Using what was given beats rendering a placeholder next to an
 * approved photograph.
 *
 * FAILURE IS SILENT, deliberately — `resolveListingMedia`'s rule, inherited on
 * purpose. A hero is decoration around a heading that already renders; a CMS
 * timeout must leave the page opening with its FacetTile, never throw. The
 * detail-page rule (a contract violation is an outage) belongs to the content
 * those pages exist to show, not to their backdrop.
 */
export async function resolvePageHeroImage(
  englishPath: string,
  locale: Locale,
  tags: string[] = [],
): Promise<ImageKitAsset | undefined> {
  const media = await resolveListingMedia([{ id: "page", englishPath, routeKind: "page" }], locale, [
    // The page's own cache tag, so a publish of this page invalidates its hero
    // exactly as it invalidates its copy. Callers add entity-index tags on top
    // when the page also renders a listing.
    cacheTags.page(process.env.FEELSTACK_SITE_KEY ?? "", locale, englishPath),
    ...tags,
  ]);
  return heroFromListing(media);
}

/**
 * The same choice, applied to a listing map a page has already fetched.
 *
 * A page that renders a grid resolves media for every entity in it in one
 * concurrent batch (see `resolveListingMedia`); adding its own route to that
 * batch costs one more request in the same fan-out, where calling
 * `resolvePageHeroImage` separately would serialise a second round trip after
 * it. Listing pages therefore include `{ id: "page", englishPath }` in their
 * batch and pass the result here.
 */
export function heroFromListing(media: ListingMedia, key = "page"): ImageKitAsset | undefined {
  const assignments = media[key] ?? [];
  return assignments.find((m) => m.slot === "hero") ?? assignments.find((m) => m.slot === "card");
}
