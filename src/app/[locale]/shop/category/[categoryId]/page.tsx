import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { ProductCard } from "@/features/products/components/ProductCard";
import { isLocale, type Locale } from "@/i18n/config";
import { features } from "@/config/features";
import { availabilityNotice, productCategories, products } from "@/features/products/data";

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

  return (
    <>
      <section className="section-y">
      <Container>
        <h1 className="text-display-1 font-heading lg:text-display-1-lg">{category.name[locale]}</h1>
        {categoryProducts.length ? <p className="mt-3 text-sm text-text-secondary">{availabilityNotice[locale]}</p> : null}
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </ul>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
