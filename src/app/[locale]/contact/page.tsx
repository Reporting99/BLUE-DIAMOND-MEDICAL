import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { ContactForm } from "@/features/contact";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";
import { getOpenStatus, statutoryHolidayNotice } from "@/config/clinic-hours";
import { getProduct } from "@/features/products";

/** Single source for this page's description: consumed by both generateMetadata
 * and the page's JSON-LD node, so the two can never drift apart (brief §9). */
const PAGE_DESCRIPTION = {
      en: "Contact Blue Diamond Medical Clinic in West Springs, Calgary — address, phone, fax, and hours.",
      ar: "تواصلوا مع عيادة بلو دايموند الطبية في ويست سبرينغز، كالغاري — العنوان والهاتف والفاكس وساعات العمل.",
    } as const;

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageSchema } from "@/components/shared/schema";
import { getRoute } from "@/lib/routing";
import { resolvePageHeroImage } from "@/lib/feelstack/page-hero-media";
import { productCardImage, resolveProductListingMedia } from "@/features/products/media";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("contact", safeLocale, { description: PAGE_DESCRIPTION });
}

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string; topic?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const status = getOpenStatus();

  // Validated against the real product registry — an unrecognized,
  // malformed, or injected value is silently ignored (no error shown, no
  // dynamic page created for it), per "COMPLETE SKINMEDICA NAVIGATION..."
  // §8: "If the product slug is invalid: Ignore the invalid value safely.
  // Show the general contact page." `getProduct` does an exact-match
  // lookup against known slugs, so nothing beyond a known slug string
  // ever reaches rendering — no way for an arbitrary/injected value to
  // affect output.
  const { product: productSlug, topic } = await searchParams;
  const product = productSlug ? getProduct(productSlug) : undefined;
  const isSkinMedicaTopic = topic === "skinmedica" && !product;

  const dict = {
    en: {
      title: "Contact Us",
      formHeading: "Send us a message",
      detailsHeading: "Clinic details",
      askAboutProduct: (name: string) => `Ask About ${name}`,
      skinMedicaTitle: "Ask About SkinMedica",
      productContextNotice: "This enquiry concerns product availability — current pricing and stock are confirmed directly with the clinic, not through this form.",
      messagePrefill: (name: string) => `I'd like to ask about ${name}.`,
      skinMedicaPrefill: "I'd like to ask about the SkinMedica products available at the clinic.",
    },
    ar: {
      title: "تواصل معنا",
      formHeading: "أرسلوا لنا رسالة",
      detailsHeading: "تفاصيل العيادة",
      askAboutProduct: (name: string) => `استفسري عن ${name}`,
      skinMedicaTitle: "استفسري عن سكين ميديكا",
      productContextNotice: "يتعلق هذا الاستفسار بتوفر المنتج — يتم تأكيد السعر والتوفر الحاليين مباشرةً مع العيادة، وليس عبر هذا النموذج.",
      messagePrefill: (name: string) => `أرغب في الاستفسار عن ${name}.`,
      skinMedicaPrefill: "أرغب في الاستفسار عن منتجات سكين ميديكا المتوفرة في العيادة.",
    },
  }[locale];

  const pageTitle = product ? dict.askAboutProduct(product.name[locale]) : isSkinMedicaTopic ? dict.skinMedicaTitle : dict.title;
  const defaultMessage = product ? dict.messagePrefill(product.name[locale]) : isSkinMedicaTopic ? dict.skinMedicaPrefill : undefined;

  const ownRoute = getRoute("contact")!;
  const hero = await resolvePageHeroImage(ownRoute.path.en, locale);
  /* The product tile in the enquiry panel below. `?product=` makes this page
     context-specific -- the heading, the prefilled message and this tile all
     name one product -- so the tile showing the neutral FacetTile while that
     product's own page showed its packshot made the context look broken at
     exactly the moment the visitor is deciding to ask about it.

     One entity, so this is `resolveProductListingMedia` over a single-element
     list rather than a second resolver: same fan-out, same productsIndex tag,
     same silent-failure rule. Skipped entirely when no product is in context,
     which is the common case for /contact and costs nothing there. */
  const productMedia = product
    ? productCardImage(await resolveProductListingMedia([product], locale), product)
    : undefined;
  const productImage = productMedia ?? product?.images[0];

  return (
    <>
      <PageSchema
        locale={locale}
        type="ContactPage"
        name={ownRoute.title[locale]}
        description={PAGE_DESCRIPTION[locale]}
        path={ownRoute.path[locale]}
      />
      {/* Compact, and carrying the clinic's own exterior as its visual: this
          is the page a visitor opens to find the building, so the picture is
          part of the answer rather than decoration around it. `pageTitle`
          still varies with the product/SkinMedica context the route can carry,
          so the hero says what the page is for in every one of those cases. */}
      <PageHero
        locale={locale}
        title={pageTitle}
        body={PAGE_DESCRIPTION[locale]}
        image={hero}
        imageRole="location"
        seed="contact"
        imageAlt={{
          en: "Blue Diamond Medical Clinic, West Springs, Calgary",
          ar: "عيادة بلو دايموند الطبية، ويست سبرينغز، كالغاري",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />}
        size="compact"
      />

      <section className="section-y">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div data-reveal="up">
          {product ? (
            <div className="flex items-center gap-4 rounded-lg border border-border p-4">
              {productImage ? (
                <div className="size-16 shrink-0 overflow-hidden rounded-md">
                  <ImageKitImage
                    path={productImage.path}
                    preset="thumbnail"
                    role="product"
                    status={productImage.status}
                    alt={productImage.alt}
                    locale={locale}
                    width={64}
                    height={64}
                    seed={product.id}
                    className="h-full w-full"
                  />
                </div>
              ) : null}
              <div>
                <p className="font-medium">{product.name[locale]}</p>
                {product.sizeLabel ? <p className="text-sm text-text-secondary">{product.sizeLabel}</p> : null}
              </div>
            </div>
          ) : null}

          {product || isSkinMedicaTopic ? (
            <p className="mt-4 rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-secondary">{dict.productContextNotice}</p>
          ) : null}

          {/* `first:mt-0` because the product-context card and notice above are
              both conditional: with a product in context this heading needs the
              gap, without one it is the column's first element and must not
              start indented from the form beside it. */}
          <h2 className="mt-8 text-h4 font-heading first:mt-0">{dict.detailsHeading}</h2>
          <dl className="mt-4 space-y-3 text-body">
            <div>
              <dt className="text-sm text-text-secondary">{locale === "ar" ? "العنوان" : "Address"}</dt>
              <dd>
                {siteConfig.clinic.address.line1}, {siteConfig.clinic.address.city}{" "}
                {siteConfig.clinic.address.region} {siteConfig.clinic.address.postalCode}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">{locale === "ar" ? "الهاتف" : "Phone"}</dt>
              <dd>
                <a className="ltr-run hover:text-primary" href={`tel:${siteConfig.clinic.phone}`}>
                  {siteConfig.clinic.phoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">{locale === "ar" ? "الفاكس" : "Fax"}</dt>
              <dd className="ltr-run">{siteConfig.clinic.faxDisplay}</dd>
            </div>
            <div>
              <dt className="text-sm text-text-secondary">{locale === "ar" ? "ساعات العمل" : "Hours"}</dt>
              <dd>
                {status.label[locale]} · {statutoryHolidayNotice[locale]}
              </dd>
            </div>
          </dl>
        </div>

        <div data-reveal="up" data-reveal-delay="1">
          <h2 className="text-h4 font-heading">{dict.formHeading}</h2>
          <div className="mt-4">
            <ContactForm locale={locale} defaultMessage={defaultMessage} />
          </div>
        </div>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
