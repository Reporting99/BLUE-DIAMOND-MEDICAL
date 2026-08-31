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
  resolved?: { path: string; status: Product["images"][number]["status"]; alt: Product["images"][number]["alt"] };
}) {
  const image = resolved ?? product.images[0];
  const category = productCategories.find((c) => c.id === product.categoryIds[0]);

  return (
    <li className="group">
      <Link
        href={href(`shop-product-${product.id}`, locale)}
        className="flex h-full flex-col rounded-lg border border-border p-4 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <div className="aspect-square overflow-hidden rounded-lg">
          {image ? (
            <ImageKitImage
              path={image.path}
              preset="product"
              role="product"
              status={image.status}
              alt={image.alt}
              locale={locale}
              width={400}
              height={400}
              className="h-full w-full transition-transform group-hover:scale-[1.02]"
            />
          ) : null}
        </div>
        {category ? (
          <p className="mt-3 text-xs font-semibold tracking-[0.08em] text-primary uppercase">{category.name[locale]}</p>
        ) : null}
        <p className="mt-1 text-sm font-medium text-text-body group-hover:text-primary">{product.name[locale]}</p>
        {product.detail ? (
          <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{product.detail.overview[locale]}</p>
        ) : null}
        <div className="mt-auto pt-3">
          {product.sizeLabel ? <p className="text-xs text-text-secondary">{product.sizeLabel}</p> : null}
          <p className="mt-0.5 text-sm font-semibold text-text-body">{formatPrice(product.priceCents)}</p>
          <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">
            {viewDetailsLabel[locale]}
          </span>
        </div>
      </Link>
    </li>
  );
}
