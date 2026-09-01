import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { ProductCard } from "@/features/products";
import { resolveListingMedia } from "@/lib/feelstack/listing-media";
import { cmsAlt } from "@/lib/feelstack/media-slots";
import { cacheTags } from "@/lib/feelstack/cache-tags";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/lib/routing";
import { features } from "@/config/features";
import { availabilityNotice, productCategories, productConcerns, products } from "@/features/products";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageSchema } from "@/components/shared/schema";
import { heroFromListing } from "@/lib/feelstack/page-hero-media";
import { siteConfig } from "@/config/site";

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

  // Catalogue media. The shop index renders 23 products while the single-entity
  // page resolver handles one at a time, so without this every card falls back
  // to the static record while each product's own detail page renders its real
  // packshot. Tagged with productsIndex so a publish invalidates the catalogue
  // exactly as it invalidates the detail pages.
  const listingMedia = await resolveListingMedia(
    [
      // The catalogue's own page, resolved in the SAME fan-out as its products
      // so its hero costs no extra round trip. It was missing entirely, which
      // made `heroFromListing(listingMedia)` below dead code -- it looked up
      // the key "page" in a map that could never contain it, so the shop hero
      // could only ever render the FacetTile no matter what the CMS held.
      { id: "page", englishPath: getRoute("shop-hub")!.path.en, routeKind: "page" as const },
      ...products.map((p) => ({ id: p.id, englishPath: `/shop/${p.slug}` })),
    ],
    locale,
    [cacheTags.productsIndex(process.env.FEELSTACK_SITE_KEY ?? "", locale)],
  );
  const t = copy[locale];
  const ownRoute = getRoute("shop-hub")!;
  const title = ownRoute.title[locale];
  // Same `products` array the catalogue grid below renders, so the structured
  // list and the visible list cannot diverge.
  const listItems = products.flatMap((product) => {
    const route = getRoute(`shop-product-${product.id}`);
    return route ? [{ name: product.name[locale], url: `${siteConfig.url}/${locale}${route.path[locale]}` }] : [];
  });

  return (
    <>
      <PageSchema
        locale={locale}
        name={title}
        description={t.intro}
        path={ownRoute.path[locale]}
        items={listItems}
      />
      <PageHero
        locale={locale}
        title={title}
        body={t.intro}
        image={heroFromListing(listingMedia)}
        /* "hero", not "product": the product role's tint is deliberately
           neutral grey so a catalogue tile reads as packaging on a white
           sweep. Stretched full-bleed behind a page title that grey is not a
           backdrop, it is an absence. */
        imageRole="hero"
        seed="shop"
        imageAlt={{
          en: "SkinMedica physician-dispensed skincare at Blue Diamond Medical",
          ar: "منتجات العناية بالبشرة سكين ميديكا المصروفة بإشراف طبي في بلو دايموند الطبية",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />}
        size="compact"
      />

      <section className="section-y">
      <Container>
        <div className="grid gap-8 sm:grid-cols-2">
          <div data-reveal="up">
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
          <div data-reveal="up" data-reveal-delay="1">
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

        <h2 data-reveal="up" className="mt-14 text-h4 font-heading">{t.allProducts}</h2>
        <p data-reveal="up" className="mt-2 text-sm text-text-secondary">{availabilityNotice[locale]}</p>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
              delay={i}
              resolved={(() => {
                const m = (listingMedia[product.id] ?? []).find((x) => x.slot === "productPrimary");
                if (!m) return undefined;
                return { path: m.path, status: m.status, alt: cmsAlt(m) ?? product.images[0]?.alt ?? { en: "", ar: "" } };
              })()}
            />
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
