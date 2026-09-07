import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ProductCard } from "@/features/products";
import { isLocale, type Locale } from "@/i18n/config";
import { features } from "@/config/features";
import { availabilityNotice, productCategories, products } from "@/features/products";
import { getRoute, href } from "@/lib/routing";
import { resolvePageHeroImage } from "@/lib/feelstack/page-hero-media";
import { productCardImage, resolveProductListingMedia } from "@/features/products/media";
import { getRouteMetadata } from "@/lib/seo/metadata";

/**
 * These listing pages are registry-`noindex` (src/config/routes.ts) and out of
 * the sitemap: they are filtered views of the catalogue, and every product on
 * them has its own canonical detail page.
 *
 * They had NO generateMetadata at all, which meant the intent was recorded in
 * the registry and never reached the HTML: no `<meta name="robots">`, and no
 * title either, so all 22 category of them rendered the layout's default
 * "Blue Diamond Medical". Pre-launch the proxy's X-Robots-Tag header hid this;
 * at launch it would have put 22 category thin, identically-titled listing pages
 * into the index. Routing them through getRouteMetadata takes the title from
 * the registry and the noindex from the same `indexing` field that already
 * said so.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; categoryId: string }>;
}): Promise<Metadata> {
  if (!features.shopEnabled) return {};
  const { locale: rawLocale, categoryId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const category = productCategories.find((c) => c.slug === categoryId);
  if (!category) return {};

  // Derived from what the page actually lists — no claim the page does not make.
  const count = products.filter((p) => p.categoryIds.includes(category.id)).length;

  return getRouteMetadata(`shop-category-${category.id}`, locale, {
    description: {
      en: `${category.name.en} — ${count} professional skincare products carried by Blue Diamond Medical Clinic.`,
      ar: `${category.name.ar} — ${count} من منتجات العناية الاحترافية بالبشرة التي تقدّمها عيادة بلو دايموند الطبية.`,
    },
  });
}

/** Feature-flagged off (`shopEnabled`) — see src/app/[locale]/shop/page.tsx. */
export default async function ShopCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; categoryId: string }>;
}) {
  if (!features.shopEnabled) notFound();

  const { locale: rawLocale, categoryId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const category = productCategories.find((c) => c.slug === categoryId);
  if (!category) notFound();

  const categoryProducts = products.filter((p) => p.categoryIds.includes(category.id));
  const shopRoute = getRoute("shop-hub")!;
  const ownRoute = getRoute(`shop-category-${category.id}`)!;
  const hero = await resolvePageHeroImage(ownRoute.path.en, locale);
  // Catalogue media for the cards below. Without it every product in this
  // category rendered the neutral FacetTile while the same product showed its
  // real packshot on /shop and on its own detail page -- see
  // src/features/products/media.ts.
  const listingMedia = await resolveProductListingMedia(categoryProducts, locale);

  return (
    <>
      {/* This page had no breadcrumb trail at all -- a product category two
          levels deep with no way back up but the browser's Back button. The
          hero adds one alongside the visual. */}
      <PageHero
        locale={locale}
        title={category.name[locale]}
        body={categoryProducts.length ? availabilityNotice[locale] : undefined}
        image={hero}
        imageRole="product"
        seed={category.id}
        imageAlt={{
          en: `${category.name.en} skincare at Blue Diamond Medical`,
          ar: `${category.name.ar} للعناية بالبشرة في بلو دايموند الطبية`,
        }}
        breadcrumbs={
          <Breadcrumbs
            locale={locale}
            items={[{ label: shopRoute.title[locale], href: href("shop-hub", locale) }, { label: category.name[locale] }]}
          />
        }
        size="compact"
      />

      <section className="section-y">
      <Container>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categoryProducts.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
              delay={i}
              resolved={productCardImage(listingMedia, product)}
            />
          ))}
        </ul>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
