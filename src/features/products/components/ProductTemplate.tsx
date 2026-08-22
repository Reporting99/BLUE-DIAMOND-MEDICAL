import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { FaqPageSchema } from "@/components/shared/schema";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/types/pricing";
import { getRoute, href } from "@/lib/routing";
import { siteConfig } from "@/config/site";
import { MEDIA_ROOT } from "@/config/imagekit";
import { availabilityNotice, getProductById, productCategories } from "@/features/products/data";
import type { Product } from "@/features/products/types";
import type { Locale } from "@/i18n/config";

const labels = {
  en: {
    whatItIs: "What it is",
    productType: "Product type",
    routinePlacement: "Where it fits in your routine",
    skincareGoals: "Skincare goals",
    keyCharacteristics: "Key characteristics",
    texture: "Texture",
    howToUse: "How to use",
    whenToUse: "When to use",
    warnings: "Please note",
    sunSensitivity: "Sun sensitivity",
    pregnancy: "Pregnancy and lactation",
    legacyName: "About this product's name",
    alsoAvailable: "Also available in",
    relatedProducts: "You may also like",
    faqsHeading: "Questions and Answers About This Product",
    askAboutThisProduct: "Ask About This Product",
  },
  ar: {
    whatItIs: "ما هو",
    productType: "نوع المنتج",
    routinePlacement: "مكانه في روتينك",
    skincareGoals: "أهداف العناية بالبشرة",
    keyCharacteristics: "الخصائص الرئيسية",
    texture: "الملمس",
    howToUse: "طريقة الاستخدام",
    whenToUse: "متى يُستخدم",
    warnings: "يرجى الانتباه",
    sunSensitivity: "الحساسية تجاه الشمس",
    pregnancy: "الحمل والرضاعة",
    legacyName: "حول اسم هذا المنتج",
    alsoAvailable: "متوفر أيضًا في",
    relatedProducts: "قد يعجبك أيضًا",
    faqsHeading: "أسئلة وأجوبة حول هذا المنتج",
    askAboutThisProduct: "استفسري عن هذا المنتج",
  },
};

function DetailSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-h5 font-heading">{heading}</h2>
      <div className="mt-2 text-body text-text-secondary">{children}</div>
    </section>
  );
}

export function ProductTemplate({ product, locale }: { product: Product; locale: Locale }) {
  const t = labels[locale];
  const shopRoute = getRoute("shop-hub")!;
  const detail = product.detail;
  // Fall back to a synthetic "pending" entry rather than rendering a blank
  // box when a product has no image yet — ImageKitImage already renders
  // the FacetTile placeholder for any non-"approved" status, so this keeps
  // every product card visually consistent even before real photography
  // is supplied.
  const coverImage = product.images[0] ?? {
    // Matches the same /products/skinmedica/<slug>.jpg convention every
    // real product image uses (src/features/products/data.ts `pendingImage`) —
    // previously diverged to a different path shape, which would never
    // have matched a real uploaded asset had this fallback ever fired.
    path: `${MEDIA_ROOT}/products/skinmedica/${product.slug}.jpg`,
    status: "pending" as const,
    alt: product.name,
  };

  const variant = product.variantOfId ? getProductById(product.variantOfId) : undefined;
  const relatedProducts = (detail?.relatedProductIds ?? [])
    .map(getProductById)
    .filter((p): p is Product => Boolean(p));
  const category = productCategories.find((c) => c.id === product.categoryIds[0]);
  const askAboutHref = `${href("contact", locale)}?product=${encodeURIComponent(product.slug)}`;

  // Minimal, safe Product schema — name/image/description/brand/category
  // only, deliberately no `offers`/price/availability sub-schema (brief:
  // "Do not add Offer schema unless public availability and CAD currency
  // are verified" — they aren't; that's the entire reason
  // `availabilityNotice` exists and directs visitors to confirm with the
  // clinic instead).
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name[locale],
    description: detail?.overview[locale] ?? product.description?.[locale],
    category: category?.name[locale],
    brand: { "@type": "Brand", name: "SkinMedica" },
    ...(coverImage.status === "approved" ? { image: `${siteConfig.url}${coverImage.path}` } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <article className="section-y">
      <Container className="grid gap-10 lg:grid-cols-[5fr_7fr]">
        <div>
          <Breadcrumbs locale={locale} items={[{ label: shopRoute.title[locale], href: href("shop-hub", locale) }, { label: product.name[locale] }]} />
        </div>
      </Container>
      <Container className="mt-6 grid gap-10 lg:grid-cols-[5fr_7fr]">
        <div className="aspect-square overflow-hidden rounded-lg">
          <ImageKitImage
            path={coverImage.path}
            preset="product"
            role="product"
            status={coverImage.status}
            alt={coverImage.alt}
            locale={locale}
            width={600}
            height={600}
            className="h-full w-full"
          />
        </div>
        <div>
          {category ? <p className="text-xs font-semibold tracking-[0.08em] text-primary uppercase">{category.name[locale]}</p> : null}
          <h1 className="mt-2 text-display-1 font-heading lg:text-display-1-lg">{product.name[locale]}</h1>
          <p className="mt-2 text-h4 font-heading text-primary">{formatPrice(product.priceCents)}</p>
          {product.sizeLabel ? <p className="mt-1 text-sm text-text-secondary">{product.sizeLabel}</p> : null}
          <p className="mt-3 text-sm text-text-secondary">{availabilityNotice[locale]}</p>

          {variant ? (
            <p className="mt-3 text-sm">
              {t.alsoAvailable}{" "}
              <Link href={href(`shop-product-${variant.id}`, locale)} className="font-medium text-primary underline underline-offset-2">
                {variant.sizeLabel ?? variant.name[locale]}
              </Link>
            </p>
          ) : null}

          {detail?.overview ? <p className="mt-6 text-body text-text-secondary">{detail.overview[locale]}</p> : product.description ? (
            <p className="mt-6 text-body text-text-secondary">{product.description[locale]}</p>
          ) : null}

          {/* Opens the enquiry pathway with the product preselected — never
              back to the catalogue. Validated server-side on the Contact
              page against the real product registry, not trusted blindly
              from the URL. */}
          <Button size="lg" className="mt-6" render={<Link href={askAboutHref} />}>
            {t.askAboutThisProduct}
          </Button>
        </div>
      </Container>

      {detail ? (
        <Container className="mt-4 max-w-3xl">
          <DetailSection heading={t.whatItIs}>
            <p>{detail.whatItIs[locale]}</p>
          </DetailSection>

          <DetailSection heading={t.productType}>
            <p>{detail.productType[locale]}</p>
          </DetailSection>

          <DetailSection heading={t.routinePlacement}>
            <p>{detail.routinePlacement[locale]}</p>
          </DetailSection>

          {detail.skincareGoals ? (
            <DetailSection heading={t.skincareGoals}>
              <p>{detail.skincareGoals[locale]}</p>
            </DetailSection>
          ) : null}

          {detail.keyCharacteristics ? (
            <DetailSection heading={t.keyCharacteristics}>
              <ul className="list-disc space-y-1 ps-5">
                {detail.keyCharacteristics[locale].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </DetailSection>
          ) : null}

          {detail.texture ? (
            <DetailSection heading={t.texture}>
              <p>{detail.texture[locale]}</p>
            </DetailSection>
          ) : null}

          <DetailSection heading={t.howToUse}>
            <p>{detail.howToUse[locale]}</p>
          </DetailSection>

          {detail.whenToUse ? (
            <DetailSection heading={t.whenToUse}>
              <p>{detail.whenToUse[locale]}</p>
            </DetailSection>
          ) : null}

          {detail.warnings ? (
            <DetailSection heading={t.warnings}>
              <ul className="list-disc space-y-1 ps-5">
                {detail.warnings[locale].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </DetailSection>
          ) : null}

          {detail.sunSensitivityWarning ? (
            <DetailSection heading={t.sunSensitivity}>
              <p>{detail.sunSensitivityWarning[locale]}</p>
            </DetailSection>
          ) : null}

          {detail.pregnancyWarning ? (
            <DetailSection heading={t.pregnancy}>
              <p>{detail.pregnancyWarning[locale]}</p>
            </DetailSection>
          ) : null}

          {detail.legacyNameNote ? (
            <DetailSection heading={t.legacyName}>
              <p>{detail.legacyNameNote[locale]}</p>
            </DetailSection>
          ) : null}

          {relatedProducts.length ? (
            <section className="mt-8">
              <h2 className="text-h5 font-heading">{t.relatedProducts}</h2>
              <ul className="mt-3 flex flex-wrap gap-3">
                {relatedProducts.map((rp) => (
                  <li key={rp.id}>
                    <Link
                      href={href(`shop-product-${rp.id}`, locale)}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
                    >
                      {rp.name[locale]} <ArrowRight className="size-3.5 rtl:rotate-180" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {detail.faqs.length ? (
            <section className="mt-10 border-t border-border pt-8">
              <h2 className="text-h4 font-heading">{t.faqsHeading}</h2>
              <dl className="mt-4 space-y-4">
                {detail.faqs.map((faq) => (
                  <div key={faq.question[locale]}>
                    <dt className="font-medium">{faq.question[locale]}</dt>
                    <dd className="mt-1 text-sm text-text-secondary">{faq.answer[locale]}</dd>
                  </div>
                ))}
              </dl>
              <FaqPageSchema faqs={detail.faqs} locale={locale} />
            </section>
          ) : null}
        </Container>
      ) : null}
      </article>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
