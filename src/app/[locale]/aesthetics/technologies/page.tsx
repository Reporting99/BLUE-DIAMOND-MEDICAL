import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { MediaCard } from "@/components/shared/MediaCard";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/lib/routing";
import { technologies } from "@/features/technologies";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { resolveListingMedia } from "@/lib/feelstack/listing-media";
import { heroFromListing } from "@/lib/feelstack/page-hero-media";
import { cacheTags } from "@/lib/feelstack/cache-tags";

/** Single source for this page's description: consumed by both generateMetadata
 * and the page's JSON-LD node, so the two can never drift apart (brief §9). */
const PAGE_DESCRIPTION = {
      en: "World-class Cynosure equipment at Blue Diamond Medical Aesthetics — Elite iQ, Potenza, TempSure, Ultra, and TempSure Vitalia.",
      ar: "معدات عالمية من Cynosure في بلو دايموند للتجميل الطبي — Elite iQ وPotenza وTempSure وUltra وTempSure Vitalia.",
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
  return getRouteMetadata("aesthetics-technologies-hub", safeLocale, { description: PAGE_DESCRIPTION });
}

export default async function TechnologiesHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const aestheticsRoute = getRoute("aesthetics-hub")!;
  const title = locale === "ar" ? "التقنيات" : "Technologies";
  const intro =
    locale === "ar"
      ? "تضم عيادتنا معدات عالمية المستوى من Cynosure."
      : "Our clinic houses state-of-the-art, world-class equipment by Cynosure.";

  const ownRoute = getRoute("aesthetics-technologies-hub")!;

  // Hero + one card image per device, resolved in a single fan-out.
  const media = await resolveListingMedia(
    [
      { id: "page", englishPath: ownRoute.path.en },
      ...technologies.map((t) => ({ id: t.id, englishPath: `/aesthetics/technologies/${t.slug}` })),
    ],
    locale,
    [cacheTags.technologiesIndex(process.env.FEELSTACK_SITE_KEY ?? "", locale)],
  );
  const hero = heroFromListing(media);
  const detailsLabel = locale === "ar" ? "التفاصيل" : "Details";

  // Same array this page renders, so the structured list cannot diverge.
  const listItems = technologies.flatMap((entity) => {
    const r = getRoute(`technology-${entity.id}`);
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
        imageRole="technology"
        seed="technologies-hub"
        imageAlt={{
          en: "Cynosure aesthetic treatment equipment at Blue Diamond Medical",
          ar: "أجهزة العلاج التجميلي من Cynosure في بلو دايموند الطبية",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: aestheticsRoute.title[locale], href: href("aesthetics-hub", locale) }, { label: title }]} />}
      />

      <section className="section-y">
      <Container>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {technologies.map((tech, i) => {
            const route = getRoute(`technology-${tech.id}`)!;
            const image = (media[tech.id] ?? []).find((m) => m.slot === "hero" || m.slot === "card");
            return (
              <MediaCard
                key={tech.id}
                href={`/${locale}${route.path[locale]}`}
                title={tech.title[locale]}
                summary={tech.summary[locale]}
                image={image}
                imageRole="technology"
                preset="technology"
                /* Device photography is contained, not cropped, and sits a
                   stop taller than the 16/10 default. Manufacturer shots are
                   portrait or near-square far more often than they are wide
                   (of the three approved here two are taller than they are
                   wide, and one is 711x2048), so a 4/3 frame spends the
                   card's height on the device rather than on mat. See
                   `device-media-frame.ts`. */
                aspect="photo"
                mediaFit="contain"
                seed={tech.id}
                imageAlt={{
                  en: `${tech.title.en} at Blue Diamond Medical Aesthetics`,
                  ar: `${tech.title.ar} في بلو دايموند للتجميل الطبي`,
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
