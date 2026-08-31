import type { Metadata } from "next";
import { cmsPathForLocale } from "@/lib/routing";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { features } from "@/config/features";
import { getProduct, products } from "@/features/products";
import { ProductTemplate } from "@/features/products";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { resolvePageContent, entityCacheTags } from "@/lib/feelstack/page-resolver";
import { cacheTags } from "@/lib/feelstack/cache-tags";
import { productCmsContract } from "@/features/products/cms-contract";

/**
 * Statically generates params for every product/locale pair — 46 pages
 * (23 products × 2 locales), all live now that `shopEnabled` is true.
 */
export function generateStaticParams() {
  return locales.flatMap((locale) => products.map((p) => ({ locale, productId: p.slug })));
}

/**
 * Unique per-product title/description/canonical/hreflang — was entirely
 * missing before this pass (every product page silently inherited the
 * root layout's generic site-wide metadata; a real gap, only surfaced
 * once the catalogue went live and its SEO was actually tested). Routes
 * through the same `getRouteMetadata` utility every other page uses, so
 * canonical/hreflang/x-default derive from the single route-registry
 * source of truth exactly like everywhere else — the route's own title
 * is the product name, and the description is the product's own
 * answer-first overview, never a generic shop-wide description repeated
 * across all 23 pages.
 */

/**
 * Hybrid FeelStack resolution for this entity type, following the reference
 * pattern in medical/[serviceId]. In the default FEELSTACK_CONTENT_MODE=static
 * this never touches the network: resolvePageContent goes straight to
 * staticFallback(), so behaviour is unchanged from before this pass.
 *
 * The tags are what let the publish webhook invalidate this entry — see
 * entityCacheTags() in page-resolver.ts.
 */
async function loadProduct(id: string, locale: Locale) {
  // FeelStack registers the Arabic route under its Arabic slug, so ask
  // for THIS locale's path rather than the English one. See cmsPathForLocale.
  const cmsPath = cmsPathForLocale(`/shop/${id}`, locale);
  const resolution = await resolvePageContent({
    path: cmsPath,
    locale,
    contract: productCmsContract,
    staticFallback: () => getProduct(id),
    tags: entityCacheTags({
      detail: cacheTags.product,
      index: cacheTags.productsIndex,
      locale,
      id,
      path: cmsPath,
    }),
  });
  return resolution.source === "not-found" ? undefined : resolution.data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; productId: string }>;
}): Promise<Metadata> {
  if (!features.shopEnabled) return {};
  const { locale: rawLocale, productId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const product = await loadProduct(productId, locale);
  if (!product) return {};

  return getRouteMetadata(`shop-product-${product.id}`, locale, {
    description: product.detail?.overview ?? {
      en: `${product.name.en} — SkinMedica professional skincare, carried by Blue Diamond Medical Clinic.`,
      ar: `${product.name.ar} — من منتجات سكين ميديكا الاحترافية، تقدّمها عيادة بلو دايموند الطبية.`,
    },
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; productId: string }>;
}) {
  if (!features.shopEnabled) notFound();

  const { locale: rawLocale, productId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const product = await loadProduct(productId, locale);
  if (!product) notFound();

  return <ProductTemplate product={product} locale={locale} />;
}
