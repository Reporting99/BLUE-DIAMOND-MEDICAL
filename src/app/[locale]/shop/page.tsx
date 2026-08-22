import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { ProductCard } from "@/components/commerce/ProductCard";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/config/routes";
import { features } from "@/config/features";
import { availabilityNotice, productCategories, productConcerns, products } from "@/content/products";
import { getRouteMetadata } from "@/lib/seo/metadata";

const copy = {
  en: {
    intro: "SkinMedica professional skincare, carried by Blue Diamond Medical. Availability and current pricing are confirmed directly with the clinic — this catalogue is informational, not an online store.",
    byCategory: "By category",
    byConcern: "By concern",
    allProducts: "All products",
    contactCta: "Contact the Clinic About SkinMedica",
  },
  ar: {
    intro: "منتجات سكين ميديكا الاحترافية للعناية بالبشرة، تقدّمها عيادة بلو دايموند الطبية. يتم تأكيد التوفر والسعر الحالي مباشرةً مع العيادة — هذا الكتالوج معلوماتي وليس متجرًا إلكترونيًا.",
    byCategory: "حسب الفئة",
    byConcern: "حسب المخاوف",
    allProducts: "جميع المنتجات",
    contactCta: "تواصلي مع العيادة للاستفسار عن SkinMedica",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  if (!features.shopEnabled) return {};
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("shop-hub", safeLocale, {
    description: {
      en: "Browse the full SkinMedica professional skincare catalogue carried by Blue Diamond Medical Clinic — 23 approved products across cleansers, serums, moisturizers, sunscreen, and more.",
      ar: "تصفّحوا كتالوج سكين ميديكا الكامل للعناية الاحترافية بالبشرة الذي تقدّمه عيادة بلو دايموند الطبية — 23 منتجًا معتمدًا بين المنظفات والسيروم والمرطبات وواقي الشمس والمزيد.",
    },
  });
}

export default async function ShopHubPage({ params }: { params: Promise<{ locale: string }> }) {
  if (!features.shopEnabled) notFound();

  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const t = copy[locale];
  const title = getRoute("shop-hub")!.title[locale];

  return (
    <>
      <section className="section-y">
      <Container>
        <h1 className="text-display-1 font-heading lg:text-display-1-lg">{title}</h1>
        <p className="mt-3 max-w-2xl text-body text-text-secondary">{t.intro}</p>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-h4 font-heading">{t.byCategory}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {productCategories.map((c) => {
                const route = getRoute(`shop-category-${c.id}`)!;
                return (
                  <li key={c.id}>
                    <Link href={`/${locale}${route.path[locale]}`} className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary">
                      {c.name[locale]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h2 className="text-h4 font-heading">{t.byConcern}</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {productConcerns.map((c) => {
                const route = getRoute(`shop-concern-${c.id}`)!;
                return (
                  <li key={c.id}>
                    <Link href={`/${locale}${route.path[locale]}`} className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary">
                      {c.name[locale]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <h2 className="mt-14 text-h4 font-heading">{t.allProducts}</h2>
        <p className="mt-2 text-sm text-text-secondary">{availabilityNotice[locale]}</p>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </ul>

        {/* Enquiry option, not a link back to this same catalogue page —
            "COMPLETE SKINMEDICA NAVIGATION..." §7. */}
        <div className="mt-12 border-t border-border pt-6 text-center">
          <Link
            href={`${href("contact", locale)}?topic=skinmedica`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            {t.contactCta}
          </Link>
        </div>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
