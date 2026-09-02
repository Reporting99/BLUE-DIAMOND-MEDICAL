import { cacheTags } from "@/lib/feelstack/cache-tags";
import { cmsAlt } from "@/lib/feelstack/media-slots";
import { resolveListingMedia, type ListingMedia } from "@/lib/feelstack/listing-media";
import type { Locale } from "@/lib/feelstack/contracts";
import type { Product } from "./types";

/**
 * Catalogue media for a set of products, and the per-card reference built from
 * it — the two halves of "show the real packshot in a product grid".
 *
 * WHY THIS EXISTS AS A MODULE. `resolvePageContent` resolves ONE entity, so
 * every page that renders a product *grid* has to fan out for itself
 * (`resolveListingMedia`) and then translate each result into the `resolved`
 * prop `ProductCard` accepts. The shop index did both inline; the category
 * page, the concern page and the contact page's product panel did neither.
 * The visible consequence was a product rendering its real photograph on
 * /shop and on its own detail page, and the neutral FacetTile on
 * /shop/category/moisturizers — same product, same approved assignment, three
 * different answers, because only one of the four callers had been written.
 *
 * Fixing that per page would have meant pasting the same eight lines into
 * three more files and leaving the fifth caller to repeat the omission. One
 * module means a new product surface gets the CMS packshot by calling a
 * function, and the cache tag comes with it rather than being remembered.
 *
 * `productPrimary` is the only slot read here. A product's gallery slots are a
 * detail-page concern (`resolveSlotGallery`); a grid cell shows the primary
 * packshot or it shows nothing.
 */

/**
 * The `resolved` prop `ProductCard` accepts.
 *
 * Spelled out from `Product["images"][number]` rather than imported from the
 * component: the component imports this module's siblings, and pulling its
 * props back here would close a cycle between the card and the data layer it
 * renders. Deriving both sides from `Product` keeps them in step anyway — a
 * change to the image shape breaks this line too.
 */
export type ResolvedProductImage = Pick<Product["images"][number], "path" | "status" | "alt">;

/**
 * Fan out over `products` and return their CMS media, keyed by product id.
 *
 * Tagged with `productsIndex` — the same tag the shop index already used — so
 * a catalogue publish invalidates every grid on the site at once rather than
 * leaving a category page holding a stale packshot until its own revalidation.
 *
 * Inherits `resolveListingMedia`'s silent-failure rule: a CMS timeout yields
 * an empty map and the grid renders its existing fallbacks. A listing is
 * decoration around links that already work.
 */
export function resolveProductListingMedia(
  productList: readonly Product[],
  locale: Locale,
): Promise<ListingMedia> {
  return resolveListingMedia(
    productList.map((p) => ({ id: p.id, englishPath: `/shop/${p.slug}` })),
    locale,
    [cacheTags.productsIndex(process.env.FEELSTACK_SITE_KEY ?? "", locale)],
  );
}

/**
 * One product's card image from a map `resolveProductListingMedia` returned.
 *
 * Returns `undefined` when the CMS has no `productPrimary` for it, which is
 * the signal `ProductCard` needs to fall back to the product's own static
 * record — never a sibling product's photograph.
 *
 * ALT TEXT IS NOT INVENTED HERE. `cmsAlt` reports whether the media library
 * supplied any (an import with no source alt column leaves both locales
 * empty), and the only substitute used is the product record's own alt for
 * the same image slot — a description derived from the entity the asset is
 * assigned to, per `cmsAlt`'s contract. Falling through to `{en:"",ar:""}`
 * keeps the shape valid for a product whose static record carries no image
 * either; that is a genuine absence, and `ImageKitImage` renders the labelled
 * fallback rather than an unlabelled one.
 */
export function productCardImage(
  media: ListingMedia,
  product: Product,
): ResolvedProductImage | undefined {
  const assigned = (media[product.id] ?? []).find((m) => m.slot === "productPrimary");
  if (!assigned) return undefined;
  return {
    path: assigned.path,
    status: assigned.status,
    alt: cmsAlt(assigned) ?? product.images[0]?.alt ?? { en: "", ar: "" },
  };
}
