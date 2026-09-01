import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ConcernExplorer } from "@/features/concerns";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/lib/routing";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { resolvePageHeroImage } from "@/lib/feelstack/page-hero-media";

/** Single source for this page's description: consumed by both generateMetadata
 * and the page's JSON-LD node, so the two can never drift apart (brief §9). */
const PAGE_DESCRIPTION = {
      en: "Browse by skin concern — acne scars, redness, dryness, fine lines, and more — at Blue Diamond Medical Aesthetics.",
      ar: "تصفّحوا حسب مخاوف البشرة — ندبات حب الشباب، الاحمرار، الجفاف، الخطوط الدقيقة، وغيرها — في بلو دايموند للتجميل الطبي.",
    } as const;

import { PageSchema } from "@/components/shared/schema";
import { siteConfig } from "@/config/site";
import { concerns } from "@/features/concerns";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("aesthetics-concerns-hub", safeLocale, { description: PAGE_DESCRIPTION });
}

export default async function ConcernsHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const aestheticsRoute = getRoute("aesthetics-hub")!;
  const title = locale === "ar" ? "المخاوف الجمالية" : "Concerns";

  const ownRoute = getRoute("aesthetics-concerns-hub")!;
  const hero = await resolvePageHeroImage(ownRoute.path.en, locale);
  // Same array this page renders, so the structured list cannot diverge.
  const listItems = concerns.flatMap((entity) => {
    const r = getRoute(`concern-${entity.id}`);
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
      {/* PAGE_DESCRIPTION again as the hero subtitle — the page had no
          on-page intro at all, and the sentence the metadata already uses to
          describe this index is the honest one to show a reader too. */}
      <PageHero
        locale={locale}
        title={title}
        body={PAGE_DESCRIPTION[locale]}
        image={hero}
        imageRole="concern"
        seed="concerns-hub"
        imageAlt={{
          en: "Skin assessment during an aesthetics consultation at Blue Diamond Medical",
          ar: "تقييم البشرة خلال استشارة تجميلية في بلو دايموند الطبية",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: aestheticsRoute.title[locale], href: href("aesthetics-hub", locale) }, { label: title }]} />}
      />

      <section className="section-y">
        <Container>
          <div data-reveal="up">
            <ConcernExplorer locale={locale} />
          </div>
        </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
