import { getFeelstackContentMode } from "./content-mode";
import { resolveEnvelope } from "./client";
import { parseMediaAssignments, type ResolvedMedia } from "./media";
import { checkLocaleIntegrity } from "./locale-integrity";
import { cmsPathForLocale } from "@/lib/routing";
import type { Locale } from "./contracts";

/**
 * Media for the entities on a LISTING page.
 *
 * `resolvePageContent` resolves exactly one entity, which is right for a detail
 * page and useless for an index. The consequence was visible and absurd:
 * Dr. Farhat's detail page rendered his real portrait while the doctors listing
 * one click away rendered a FacetTile for the same person, because the listing
 * reads the static module and never asks the CMS at all. Any entity family can
 * hit this — the listing is simply a different consumer of the same assignment.
 *
 * WHY THIS FANS OUT RATHER THAN BATCHING. The public contract exposes
 * `routes`, `resolve`, `config`, `navigation` and `redirect` — there is no
 * collection endpoint that returns media for many entities, so one resolve per
 * entity is the only thing the contract actually offers. That is acceptable
 * here and nowhere else: listings are small (six doctors, twenty-three
 * products), the calls run concurrently, and every one is tagged so a publish
 * webhook invalidates them exactly as it invalidates the detail page. A batch
 * endpoint would be better and is worth asking the CMS for; inventing a
 * client-side cache to fake one would not be.
 *
 * FAILURE IS ALWAYS SILENT HERE. A listing is decoration around links that
 * already work. A CMS timeout must leave the index rendering with placeholders,
 * never throw — which is the opposite of the detail-page rule, where a contract
 * violation is an outage worth surfacing. Every rejection path below returns an
 * empty map.
 */
export interface ListingEntity {
  /** Stable domain id — the key the caller will look results up by. */
  id: string;
  /** English physical CMS path, e.g. `/doctors/mohamed-farhat`. */
  englishPath: string;
  /**
   * Which of FeelStack's two route families this is, because they are slugged
   * differently and asking the wrong way returns nothing.
   *
   *  - `"entity"` (default) — a CMS content entry. Its Arabic route carries the
   *    Arabic pretty slug (`/الأطباء/محمد-فرحات`), so the request must be
   *    translated with `cmsPathForLocale` first.
   *
   *  - `"page"` — a CMS page. `UpdatePageDto.slugSegment` is constrained to
   *    `^[a-z0-9]+(?:-[a-z0-9]+)*$`, so a page CANNOT have a non-ASCII slug:
   *    FeelStack stores the Arabic /about page at `/about` too, and
   *    disambiguates the pair by locale. Translating that request produces
   *    `/من-نحن`, which no page route has, so it 404s and the hero silently
   *    falls back to its FacetTile — which is precisely what every Arabic hub
   *    and corporate page was doing.
   *
   * Verified against the live preview resolver: `preview/resolve?path=/about&
   * locale=ar` answers `resolvedLocale: "ar", usedFallback: false`, so this is
   * a real per-locale route and not a cross-locale fallback that
   * `checkLocaleIntegrity` would (correctly) refuse.
   */
  routeKind?: "entity" | "page";
}

export type ListingMedia = Record<string, ResolvedMedia[]>;

export async function resolveListingMedia(
  entities: readonly ListingEntity[],
  locale: Locale,
  tags: string[] = [],
): Promise<ListingMedia> {
  if (getFeelstackContentMode() === "static" || entities.length === 0) return {};

  const settled = await Promise.allSettled(
    entities.map(async (entity) => {
      // Ask for THIS locale's path. For a content entry the Arabic route is
      // registered under its Arabic slug, so asking with the English one
      // returns an English-fallback envelope that `checkLocaleIntegrity` then
      // correctly refuses. A page has no Arabic slug to translate to — see
      // `routeKind` above — so its English path IS its path in both locales.
      const path =
        entity.routeKind === "page"
          ? entity.englishPath
          : cmsPathForLocale(entity.englishPath, locale);
      const result = await resolveEnvelope(path, locale, tags);
      if (!result.ok) return null;
      // The same integrity rule the detail pages use, applied here too: a
      // cross-locale fallback means this locale's content is absent, and an
      // Arabic listing must not quietly borrow the English entity's imagery.
      if (!checkLocaleIntegrity(result.data, locale).ok) return null;
      const { media } = parseMediaAssignments(result.data.media);
      return media.length ? ([entity.id, media] as const) : null;
    }),
  );

  const out: ListingMedia = {};
  for (const item of settled) {
    if (item.status === "fulfilled" && item.value) out[item.value[0]] = item.value[1];
  }
  return out;
}
