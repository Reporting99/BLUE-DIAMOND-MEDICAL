import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { ProductCard } from "@/features/products";
import { isLocale, type Locale } from "@/i18n/config";
import { features } from "@/config/features";
import { availabilityNotice, productConcerns, products } from "@/features/products";

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

  return (
    <>
      <section className="section-y">
      <Container>
        <h1 className="text-display-1 font-heading lg:text-display-1-lg">{concern.name[locale]}</h1>
        {concernProducts.length ? (
          <>
          <p className="mt-3 text-sm text-text-secondary">{availabilityNotice[locale]}</p>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {concernProducts.map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </ul>
          </>
        ) : (
          <p className="mt-8 text-body text-text-secondary">{noResultsLabel}</p>
        )}
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
