import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { MediaCard } from "@/components/shared/MediaCard";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/lib/routing";
import { treatments } from "@/features/aesthetics";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { resolveListingMedia } from "@/lib/feelstack/listing-media";
import { heroFromListing } from "@/lib/feelstack/page-hero-media";
import { cacheTags } from "@/lib/feelstack/cache-tags";

/** Single source for this page's description: consumed by both generateMetadata
 * and the page's JSON-LD node, so the two can never drift apart (brief §9). */
const PAGE_DESCRIPTION = {
      en: "Physician-led aesthetic treatments at Blue Diamond Medical — laser, radio frequency, RF micro-needling, PRP, and more.",
      ar: "علاجات تجميل طبي بإشراف طبي في بلو دايموند — الليزر، والترددات الراديوية، والإبر الدقيقة، والبلازما، وغيرها.",
    } as const;

import { PageSchema } from "@/components/shared/schema";
import { siteConfig } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("aesthetics-treatments-hub", safeLocale, { description: PAGE_DESCRIPTION });
}

export default async function TreatmentsHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const aestheticsRoute = getRoute("aesthetics-hub")!;
  const title = locale === "ar" ? "العلاجات" : "Treatments";
  const intro =
    locale === "ar"
      ? "تبدأ جميع علاجاتنا باستشارة مع طبيب لمدة 20 دقيقة يستمع خلالها لمخاوفكم ويضع خطة علاج تناسب أهدافكم."
      : "Every treatment starts with a 20-minute consultation with a physician, who listens to your concerns and prescribes a treatment plan that meets your goals.";

  const ownRoute = getRoute("aesthetics-treatments-hub")!;

  // This page's own hero and every treatment card on it, in one fan-out.
  // Each treatment's detail page already renders its assigned photograph; the
  // index rendering a bordered paragraph for the same treatment is the
  // listing/detail gap this closes.
  const media = await resolveListingMedia(
    [
      { id: "page", englishPath: ownRoute.path.en },
      ...treatments.map((t) => ({ id: t.id, englishPath: `/aesthetics/treatments/${t.slug}` })),
    ],
    locale,
    [cacheTags.aestheticTreatmentsIndex(process.env.FEELSTACK_SITE_KEY ?? "", locale)],
  );
  const hero = heroFromListing(media);
  const detailsLabel = locale === "ar" ? "التفاصيل" : "Details";

  // Same array this page renders, so the structured list cannot diverge.
  const listItems = treatments.flatMap((entity) => {
    const r = getRoute(`treatment-${entity.id}`);
    return r ? [{ name: entity.title[locale], url: `${siteConfig.url}/${locale}${r.path[locale]}` }] : [];
  });

  return (
    <>
      <PageSchema
        locale={locale}
        name={title}
        description={PAGE_DESCRIPTION[locale]}
        path={ownRoute.path[locale]}
        items={listItems}
      />
      <PageHero
        locale={locale}
        title={title}
        body={intro}
        image={hero}
        imageRole="treatment"
        seed="treatments-hub"
        imageAlt={{
          en: "A physician performing an aesthetic treatment at Blue Diamond Medical",
          ar: "طبيبة تُجري علاجًا تجميليًا في بلو دايموند الطبية",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: aestheticsRoute.title[locale], href: href("aesthetics-hub", locale) }, { label: title }]} />}
      />

      <section className="section-y">
      <Container>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {treatments.map((t, i) => {
            const route = getRoute(`treatment-${t.id}`)!;
            const image = (media[t.id] ?? []).find((m) => m.slot === "hero" || m.slot === "card");
            return (
              <MediaCard
                key={t.id}
                href={`/${locale}${route.path[locale]}`}
                title={t.title[locale]}
                summary={t.summary[locale]}
                image={image}
                imageRole="treatment"
                preset="treatment"
                seed={t.id}
                imageAlt={{
                  en: `${t.title.en} at Blue Diamond Medical Aesthetics`,
                  ar: `${t.title.ar} في بلو دايموند للتجميل الطبي`,
                }}
                locale={locale}
                ctaLabel={detailsLabel}
                headingLevel="h2"
                delay={i % 3}
              />
            );
          })}
        </div>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
