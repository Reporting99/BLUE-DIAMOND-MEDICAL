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
              <ProductCard key={product.id} product={product} locale={locale} delay={i} />
            ))}
          </ul>
        </Container>
        </section>
      ) : null}
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
