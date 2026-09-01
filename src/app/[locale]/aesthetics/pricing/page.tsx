import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/lib/routing";
import { features } from "@/config/features";
import { aestheticsPricingGroups, PricingTable } from "@/features/aesthetics";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { resolvePageHeroImage } from "@/lib/feelstack/page-hero-media";

/**
 * The published aesthetic price list — every `publicDisplay` row of the
 * client-approved pricing workbook, grouped by treatment. The same records
 * render on each treatment page via `getTreatmentPricing()`; this page is an
 * index over them, not a second copy. See
 * docs/APPROVED_AESTHETIC_PRICING_MATRIX.md.
 *
 * Still gated on `aestheticPricingEnabled` so the whole price list can be
 * withdrawn with one boolean if the clinic revises the sheet.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  if (!features.aestheticPricingEnabled) return {};
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("aesthetics-pricing", safeLocale, {
    description: {
      en: "Pricing for medical aesthetics treatments at Blue Diamond Medical.",
      ar: "أسعار علاجات التجميل الطبي في بلو دايموند الطبية.",
    },
  });
}

export default async function AestheticsPricingPage({ params }: { params: Promise<{ locale: string }> }) {
  if (!features.aestheticPricingEnabled) notFound();

  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const aestheticsRoute = getRoute("aesthetics-hub")!;
  const title = locale === "ar" ? "أسعار التجميل الطبي" : "Aesthetics Pricing";
  const intro =
    locale === "ar"
      ? "تختلف الأسعار حسب منطقة العلاج والخيارات المختارة. جميع الأسعار بالدولار الكندي وتشمل الجلسة الواحدة."
      : "Pricing varies by treatment area and the options selected. All prices are in Canadian dollars and are per session.";
  const packagesNote =
    locale === "ar"
      ? "تتوفر باقات علاجية مخصّصة حسب احتياجات كل عميل. يُرجى التواصل مع فريقنا للحصول على خطة علاجية وأسعار باقات مخصّصة."
      : "Customized treatment packages are available based on individual client needs. Please contact our team for a personalized treatment plan and package pricing.";
  const ownRoute = getRoute("aesthetics-pricing")!;
  const hero = await resolvePageHeroImage(ownRoute.path.en, locale);

  return (
    <>
      {/* Compact: a price list is a reference document, and a full-height
          hero above it puts the first row of prices below the fold. */}
      <PageHero
        locale={locale}
        title={title}
        body={intro}
        image={hero}
        imageRole="treatment"
        seed="aesthetics-pricing"
        imageAlt={{
          en: "Consultation room at Blue Diamond Medical Aesthetics",
          ar: "غرفة الاستشارات في بلو دايموند للتجميل الطبي",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: aestheticsRoute.title[locale], href: href("aesthetics-hub", locale) }, { label: title }]} />}
        size="compact"
      />

      <section className="section-y">
      <Container>
        {/* Not reveal-animated: this is a 78-row reference table several
            screens tall, and fading in a document someone came to read is
            friction, not polish. */}
        <PricingTable groups={aestheticsPricingGroups} locale={locale} headingLevel={2} />

        <p data-reveal="up" className="mt-8 max-w-prose text-sm text-text-secondary">{packagesNote}</p>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
