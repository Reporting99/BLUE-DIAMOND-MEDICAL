import Link from "next/link";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { href } from "@/lib/routing";
import { formatPrice } from "@/types/pricing";
import { productCategories } from "@/features/products/data";
import type { Product } from "@/features/products/types";
import type { Locale } from "@/i18n/config";

const viewDetailsLabel = { en: "View Product Details", ar: "عرض تفاصيل المنتج" };

/**
 * Shared product-grid card for the shop hub, category, and concern pages —
 * one place to render a product's image/category/name/description/size/
 * price/link so the list views don't each hand-roll their own markup.
 * The entire card is one `<Link>` (never an `<a>` nested inside another,
 * per "COMPLETE SKINMEDICA NAVIGATION AND PRODUCT-DETAIL FLOW" §4) that
 * routes through the route registry (`href("shop-product-<id>", locale)`)
 * rather than a hand-built path, so it automatically resolves to the
 * pretty Arabic URL like every other cross-link on the site.
 */
export function ProductCard({
  product,
  locale,
  resolved,
  delay = 0,
}: {
  product: Product;
  locale: Locale;
  /**
   * Media resolved for this product from the CMS by the listing page.
   *
   * A listing renders many entities, and `resolvePageContent` resolves one — so
   * without this the card falls back to the static `product.images`, and the
   * shop index shows a placeholder for a product whose own detail page renders
   * a real photograph. Optional so every existing caller keeps working.
   */
  resolved?: {
    path: string;
    status: Product["images"][number]["status"];
    alt: Product["images"][number]["alt"];
    /** Cache-busting version token, when the source assignment has one — see `ResolvedMedia`. */
    version?: string;
  };
  /**
   * Stagger index within its grid, for the scroll-reveal entrance. Callers
   * pass the map index; it is taken modulo the column count by the CSS, so a
   * long catalogue does not accumulate an ever-growing delay down the page.
   */
  delay?: number;
}) {
  /* A card's picture slot is never empty. `resolved` is the CMS
     assignment, `product.images[0]` the static record — and the
     client-supplied peels (CL-037/CL-038) deliberately carry NEITHER,
     because no approved packaging photograph exists and borrowing a
     treatment photo would misrepresent the product. Without this
     fallback those two cards rendered a blank frame. The synthetic
     `pending` entry carries no path, so ImageKitImage requests no
     bytes and draws the seeded FacetTile stand-in instead — the same
     designed placeholder every unphotographed entity on the site
     already uses, and not a stock photograph of somebody's product. */
  const image = resolved ??
    product.images[0] ?? { path: "", status: "pending" as const, alt: product.name };
  const category = productCategories.find((c) => c.id === product.categoryIds[0]);

  return (
    <li className="group" data-reveal="up" data-reveal-delay={String(delay % 4)}>
      <Link
        href={href(`shop-product-${product.id}`, locale)}
        className="flex h-full flex-col rounded-lg border border-border p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <div className="aspect-square overflow-hidden rounded-lg">
          {image ? (
            <ImageKitImage
              path={image.path}
              version={image.version}
              preset="product"
              role="product"
              status={image.status}
              alt={image.alt}
              locale={locale}
              width={400}
              height={400}
              seed={product.id}
              // The card is one cell of a 1/2/3/4-column grid, so a browser
              // that is told nothing assumes full viewport width and picks a
              // needlessly large candidate for a ~300px box. Catalogue images
              // stay lazy -- no `preload` here -- because a 23-product grid
              // has no LCP candidate worth preloading.
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="h-full w-full transition-transform group-hover:scale-[1.02]"
            />
          ) : null}
        </div>
        {category ? (
          <p className="mt-3 text-xs font-semibold tracking-[0.08em] text-primary uppercase">{category.name[locale]}</p>
        ) : null}
        <p className="mt-1 text-sm font-medium text-text-body group-hover:text-primary">{product.name[locale]}</p>
        {/* CL-037 / CL-038 - the supplied subtitle, on the card as on the
            detail page. Falls back to the research overview for the
            SkinMedica records, which have no subtitle. */}
        {product.subtitle ? (
          <p className="mt-1 text-sm text-text-secondary">{product.subtitle[locale]}</p>
        ) : product.detail ? (
          <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{product.detail.overview[locale]}</p>
        ) : null}
        <div className="mt-auto pt-3">
          {product.sizeLabel ? <p className="text-xs text-text-secondary">{product.sizeLabel}</p> : null}
          {/* CL-036 - exact supplied price string when there is one; nothing
              at all when the client has not supplied a price. A card never
              shows a price this catalogue does not actually have. */}
          {product.priceLabel ? (
            <p className="mt-0.5 text-sm font-semibold text-text-body">{product.priceLabel}</p>
          ) : product.priceCents !== null ? (
            <p className="mt-0.5 text-sm font-semibold text-text-body">{formatPrice(product.priceCents)}</p>
          ) : null}
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">
            {viewDetailsLabel[locale]}
          </span>
        </div>
      </Link>
    </li>
  );
}
