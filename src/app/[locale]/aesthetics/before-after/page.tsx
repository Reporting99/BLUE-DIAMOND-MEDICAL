import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { BeforeAfterGallery } from "@/features/aesthetics";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/lib/routing";
import { features } from "@/config/features";
import { getBeforeAfterPairs } from "@/features/aesthetics";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { resolvePageHeroImage } from "@/lib/feelstack/page-hero-media";

/**
 * Feature-flagged off (`beforeAfterEnabled`) — no approved before/after
 * photography has been supplied, and the brief explicitly forbids
 * fabricating clinical results imagery. Route/template exist so real,
 * consented photography can be added later without new code — see
 * docs/MEDIA.md.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  if (!features.beforeAfterEnabled) return {};
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("aesthetics-before-after", safeLocale, {
    description: { en: "Before and after results at Blue Diamond Medical Aesthetics.", ar: "نتائج قبل وبعد في بلو دايموند للتجميل الطبي." },
  });
}

export default async function BeforeAfterPage({ params }: { params: Promise<{ locale: string }> }) {
  if (!features.beforeAfterEnabled) notFound();

  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const aestheticsRoute = getRoute("aesthetics-hub")!;
  const title = locale === "ar" ? "قبل وبعد" : "Before & After";
  const intro =
    locale === "ar"
      ? "اسحبوا المؤشر على كل صورة للتنقّل بين حالة \"قبل\" و\"بعد\" في الإطار نفسه."
      : "Drag the handle across any image to move between the before and after state within the same frame.";
  const ownRoute = getRoute("aesthetics-before-after")!;
  const hero = await resolvePageHeroImage(ownRoute.path.en, locale);

  return (
    <>
      {/* The hero subtitle explains the interaction rather than the results:
          a comparison slider is only obvious once you have used one, and this
          is the page where every card on the screen is one. */}
      <PageHero
        locale={locale}
        title={title}
        body={intro}
        image={hero}
        /* "treatment", not "before-after": the before-after role's tint is
           deliberately neutral grey so a comparison card's placeholder never
           tints a clinical photograph's surroundings. As a full-bleed hero
           that same grey reads as a page that failed to load rather than as
           the brand. */
        imageRole="treatment"
        seed="before-after-hub"
        imageAlt={{
          en: "Medical aesthetics treatment room at Blue Diamond Medical",
          ar: "غرفة علاجات التجميل الطبي في بلو دايموند الطبية",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: aestheticsRoute.title[locale], href: href("aesthetics-hub", locale) }, { label: title }]} />}
        size="compact"
      />

      <section className="section-y">
      <Container>
        <BeforeAfterGallery pairs={getBeforeAfterPairs()} locale={locale} renderEmptyState />
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
