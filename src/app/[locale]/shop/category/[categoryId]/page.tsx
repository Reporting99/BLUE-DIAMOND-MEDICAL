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
            <ProductCard key={product.id} product={product} locale={locale} delay={i} />
          ))}
        </ul>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
