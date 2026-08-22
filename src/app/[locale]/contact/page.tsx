import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
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
import { PageSchema } from "@/components/shared/schema/PageSchema";
import { getRoute } from "@/lib/routing";

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

  return (
    <>
      <PageSchema
        locale={locale}
        type="ContactPage"
        name={ownRoute.title[locale]}
        description={PAGE_DESCRIPTION[locale]}
        path={ownRoute.path[locale]}
      />
      <section className="section-y">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />

          <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{pageTitle}</h1>

          {product ? (
            <div className="mt-6 flex items-center gap-4 rounded-lg border border-border p-4">
              {product.images[0] ? (
                <div className="size-16 shrink-0 overflow-hidden rounded-md">
                  <ImageKitImage
                    path={product.images[0].path}
                    preset="thumbnail"
                    role="product"
                    status={product.images[0].status}
                    alt={product.images[0].alt}
                    locale={locale}
                    width={64}
                    height={64}
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

          <h2 className="mt-8 text-h4 font-heading">{dict.detailsHeading}</h2>
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

        <div>
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
