import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ProductCard } from "@/features/products";
import { isLocale, type Locale } from "@/i18n/config";
import { features } from "@/config/features";
import { availabilityNotice, productConcerns, products } from "@/features/products";
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
 * title either, so all concern of them rendered the layout's default
 * "Blue Diamond Medical". Pre-launch the proxy's X-Robots-Tag header hid this;
 * at launch it would have put concern thin, identically-titled listing pages
 * into the index. Routing them through getRouteMetadata takes the title from
 * the registry and the noindex from the same `indexing` field that already
 * said so.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; concernId: string }>;
}): Promise<Metadata> {
  if (!features.shopEnabled) return {};
  const { locale: rawLocale, concernId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const concern = productConcerns.find((c) => c.slug === concernId);
  if (!concern) return {};

  const count = products.filter((p) => p.concernIds.includes(concern.id)).length;

  return getRouteMetadata(`shop-concern-${concern.id}`, locale, {
    description: {
      en: `${concern.name.en} — ${count} professional skincare products carried by Blue Diamond Medical Clinic.`,
      ar: `${concern.name.ar} — ${count} من منتجات العناية الاحترافية بالبشرة التي تقدّمها عيادة بلو دايموند الطبية.`,
    },
  });
}

/** Feature-flagged off (`shopEnabled`) — see src/app/[locale]/shop/page.tsx. */
export default async function ShopConcernPage({
  params,
}: {
  params: Promise<{ locale: string; concernId: string }>;
}) {
  if (!features.shopEnabled) notFound();

  const { locale: rawLocale, concernId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const concern = productConcerns.find((c) => c.slug === concernId);
  if (!concern) notFound();

  const concernProducts = products.filter((p) => p.concernIds.includes(concern.id));
  const noResultsLabel =
    locale === "ar"
      ? "لا توجد منتجات مرتبطة بهذا المخاوف بعد — سيتم إضافتها عند اعتماد محتوى الاستهداف."
      : "No products are tagged for this concern yet — targeting copy hasn't been approved for any product.";

  const shopRoute = getRoute("shop-hub")!;
  const ownRoute = getRoute(`shop-concern-${concern.id}`)!;
  const hero = await resolvePageHeroImage(ownRoute.path.en, locale);
  // Same omission the category page had: the grid asked the CMS for nothing.
  const listingMedia = await resolveProductListingMedia(concernProducts, locale);

  return (
    <>
      <PageHero
        locale={locale}
        title={concern.name[locale]}
        body={concernProducts.length ? availabilityNotice[locale] : noResultsLabel}
        image={hero}
        imageRole="concern"
        seed={concern.id}
        imageAlt={{
          en: `Skincare for ${concern.name.en} at Blue Diamond Medical`,
          ar: `العناية بالبشرة لـ${concern.name.ar} في بلو دايموند الطبية`,
        }}
        breadcrumbs={
          <Breadcrumbs
            locale={locale}
            items={[{ label: shopRoute.title[locale], href: href("shop-hub", locale) }, { label: concern.name[locale] }]}
          />
        }
        size="compact"
      />

      {concernProducts.length ? (
        <section className="section-y">
        <Container>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {concernProducts.map((product, i) => (
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
      ) : null}
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
