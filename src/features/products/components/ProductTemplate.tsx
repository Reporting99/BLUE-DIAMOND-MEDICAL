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
import { imagekitConfig, imagekitIsConfigured, imagePresets } from "@/config/imagekit";
// From @imagekit/javascript, not @imagekit/next: the latter's entrypoint is
// marked "use client", and importing it from a Server Component throws
// "Attempted to call buildSrc() from the server". Same reason
// src/lib/seo/metadata.ts imports it this way.
import { buildSrc } from "@imagekit/javascript";
import { availabilityNotice, getProductById, productBrands, productCategories } from "@/features/products/data";
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
    faqsHeading: "Questions about this product",
    askAboutThisProduct: "Ask about this product",
    benefits: "Benefits",
    keyFeatures: "Key features",
    kitContents: "What's in this kit",
    directions: "Directions",
    keyIngredients: "Key ingredients",
    comparison: "Manufacturer example",
    asSupplied: "As supplied by the manufacturer",
    beforeLabel: "Before",
    afterLabel: "After",
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
    benefits: "الفوائد",
    keyFeatures: "الخصائص الأساسية",
    kitContents: "محتويات هذا الطقم",
    directions: "طريقة الاستخدام",
    keyIngredients: "المكونات الرئيسية",
    comparison: "مثال من الشركة المصنّعة",
    asSupplied: "كما وردت من الشركة المصنّعة",
    beforeLabel: "قبل",
    afterLabel: "بعد",
  },
};

function DetailSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section data-reveal="up" className="mt-8">
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
  // No path. This used to build /products/skinmedica/<slug>.jpg from the slug,
  // a location no asset has ever occupied — the real packshots live under
  // /blue-diamond/shop/ and FeelStack decides which belongs to which product.
  // ImageKitImage renders the FacetTile placeholder for any non-"approved"
  // status and never requests the path, so the guess was invisible; it was
  // still a guess, and one that would 404 the moment anyone approved it.
  const coverImage = product.images[0] ?? {
    path: "",
    status: "pending" as const,
    alt: product.name,
  };

  const variant = product.variantOfId ? getProductById(product.variantOfId) : undefined;
  const relatedProducts = (detail?.relatedProductIds ?? [])
    .map(getProductById)
    .filter((p): p is Product => Boolean(p));
  const category = productCategories.find((c) => c.id === product.categoryIds[0]);
  const brand = productBrands.find((b) => b.id === product.brandId);
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
    // The brand node names THIS product's brand, and is omitted entirely
    // for a record that has none (CL-036) - hardcoding "SkinMedica"
    // published a false manufacturer for every non-SkinMedica product.
    ...(brand ? { brand: { "@type": "Brand", name: brand.name } } : {}),
    // The image lives on ImageKit, not on the canonical domain. Concatenating
    // siteConfig.url with an ImageKit path produced
    // https://bluediamondmedical.ca/blue-diamond/shop/<file>.jpg for all 19
    // photographed products — a URL that 404s, handed to every crawler reading
    // this Product schema. Built through the same ImageKit helper the OG image
    // uses, and omitted entirely when ImageKit is not configured rather than
    // emitting a link that cannot resolve.
    ...(coverImage.status === "approved" && imagekitIsConfigured
      ? {
          image: buildSrc({
            src: coverImage.path,
            urlEndpoint: imagekitConfig.urlEndpoint,
            transformation: [imagePresets["product-gallery"]],
          }),
        }
      : {}),
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
          {/* CL-037 / CL-038 - the supplied subtitle is its own line, not
              folded into the title or the description. */}
          {product.subtitle ? (
            <p className="mt-1 text-h5 font-heading text-text-secondary">{product.subtitle[locale]}</p>
          ) : null}
          {/* CL-036 - `priceLabel` publishes the client's price string exactly
              as supplied (e.g. "188 + GST"); the GST is shown, never added
              into a total. A product with no supplied price shows no price
              line at all rather than an em dash that reads as "free". */}
          {product.priceLabel ? (
            <p className="mt-2 text-h4 font-heading text-primary">{product.priceLabel}</p>
          ) : product.priceCents !== null ? (
            <p className="mt-2 text-h4 font-heading text-primary">{formatPrice(product.priceCents)}</p>
          ) : null}
          {product.sizeLabel ? <p className="mt-1 text-sm text-text-secondary">{product.sizeLabel}</p> : null}
          {/* CL-036 - a record missing an approved image or price states that
              plainly and offers no purchase action. It never enters a
              checkout path, and it makes no availability claim. */}
          {product.purchaseBlocked ? (
            <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-text-secondary">
              {product.purchaseBlocked[locale]}
            </p>
          ) : (
            <p className="mt-3 text-sm text-text-secondary">{availabilityNotice[locale]}</p>
          )}

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

      {/* CL-037 / CL-038 - Benefits and Key features are structured lists,
          never one concatenated paragraph. Rendered outside the `detail`
          block because the peel records carry no SkinMedica-style research
          `detail` and must not be given an invented one. */}
      {product.benefits || product.keyFeatures || product.kitContents || product.safetyWarnings || product.directions || product.keyIngredients || product.manufacturerComparison ? (
        <Container className="mt-4 max-w-3xl">
          {product.benefits ? (
            <DetailSection heading={t.benefits}>
              <ul className="list-disc space-y-1 ps-5">
                {product.benefits[locale].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </DetailSection>
          ) : null}
          {product.keyFeatures ? (
            <DetailSection heading={t.keyFeatures}>
              <ul className="list-disc space-y-1 ps-5">
                {product.keyFeatures[locale].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </DetailSection>
          ) : null}
          {/* CL-042 - the Myriade flyer's own Kit contents / Directions /
              Ingredients lists. Same rule as Benefits and Key features above:
              rendered outside `detail`, because these records deliberately
              carry no researched `detail` block. */}
          {product.kitContents ? (
            <DetailSection heading={t.kitContents}>
              <ul className="list-disc space-y-1 ps-5">
                {product.kitContents[locale].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </DetailSection>
          ) : null}
          {product.safetyWarnings?.[locale].length ? (
            <DetailSection heading={t.warnings}>
              <ul className="list-disc space-y-1 ps-5">
                {product.safetyWarnings[locale].map((item) => <li key={item}>{item}</li>)}
              </ul>
            </DetailSection>
          ) : null}
          {product.directions ? (
            <DetailSection heading={t.directions}>
              <ol className="list-decimal space-y-1 ps-5">
                {product.directions[locale].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </DetailSection>
          ) : null}
          {product.keyIngredients ? (
            <DetailSection heading={t.keyIngredients}>
              <ul className="list-disc space-y-1 ps-5">
                {product.keyIngredients[locale].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </DetailSection>
          ) : null}
          {/* CL-042 — a manufacturer's own before/after example, on the one
              product page that has one. The attribution and the results-vary
              qualifier render WITH the pictures, never as small print
              elsewhere: these are the manufacturer's clinical examples and
              presenting them as Blue Diamond patient photography would be a
              false claim about our own results. Ordering is fixed by the data
              shape (`before` then `after`), not by DOM position. */}
          {product.manufacturerComparison ? (
            <DetailSection heading={t.comparison}>
              {/* The manufacturer's own untouched composite, first, exactly as
                  the supplied manifest orders it (source, before, after). It
                  is shown at its natural aspect ratio and never cropped: the
                  printed labels and privacy bars inside it are part of the
                  evidence, and trimming them would turn an attributable
                  clinical example into an anonymous claim. */}
              {product.manufacturerComparison.source ? (
                <figure className="mb-4">
                  <ImageKitImage
                    path={product.manufacturerComparison.source.path}
                    preset="product"
                    role="product"
                    status="approved"
                    alt={product.manufacturerComparison.source.alt}
                    locale={locale}
                    fit="contain"
                    width={1280}
                    height={528}
                    className="w-full rounded-lg"
                  />
                  <figcaption className="mt-1 text-sm text-text-secondary">{t.asSupplied}</figcaption>
                </figure>
              ) : null}
              {/* `contain`, and the supplied files' own dimensions (160x132
                  each half, 320x132 composite, scaled 4x here). These were
                  declared 600x600 — a square frame for a 1.21:1 picture, which
                  under the default `cover` silently cropped ~17% off each side
                  of a clinical comparison. That is the one crop this section
                  must never make: what sits at the edge of a manufacturer's
                  example is the label and the attribution. */}
              <div className="grid grid-cols-2 gap-4">
                <figure>
                  <ImageKitImage
                    path={product.manufacturerComparison.before.path}
                    preset="product"
                    role="product"
                    status="approved"
                    alt={product.manufacturerComparison.before.alt}
                    locale={locale}
                    fit="contain"
                    width={640}
                    height={528}
                    className="rounded-lg"
                  />
                  <figcaption className="mt-1 text-sm text-text-secondary">{t.beforeLabel}</figcaption>
                </figure>
                <figure>
                  <ImageKitImage
                    path={product.manufacturerComparison.after.path}
                    preset="product"
                    role="product"
                    status="approved"
                    alt={product.manufacturerComparison.after.alt}
                    locale={locale}
                    fit="contain"
                    width={640}
                    height={528}
                    className="rounded-lg"
                  />
                  <figcaption className="mt-1 text-sm text-text-secondary">{t.afterLabel}</figcaption>
                </figure>
              </div>
              <p className="mt-3 text-sm text-text-secondary">
                {product.manufacturerComparison.caption[locale]}
              </p>
              <p className="text-sm text-text-secondary">
                {product.manufacturerComparison.attribution[locale]}
              </p>
              <p className="text-sm text-text-secondary">
                {product.manufacturerComparison.resultsVary[locale]}
              </p>
            </DetailSection>
          ) : null}
        </Container>
      ) : null}

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
            <section data-reveal="up" className="mt-8">
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
            <section data-reveal="up" className="mt-10 border-t border-border pt-8">
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
