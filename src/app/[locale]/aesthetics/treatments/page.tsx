import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { AestheticsHero } from "@/features/aesthetics/components/AestheticsHero";
import { getBookingUrl } from "@/config/booking";
import { Button } from "@/components/ui/button";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ConcernExplorer, concerns } from "@/features/concerns";
import { gatedTreatments } from "@/features/aesthetics/data/treatments";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/lib/routing";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { resolvePageHeroImage } from "@/lib/feelstack/page-hero-media";
import { concernExplorerImages, resolveConcernListingMedia } from "@/features/concerns/media";
import { PageSchema } from "@/components/shared/schema";
import { siteConfig } from "@/config/site";

/**
 * The Treatments hub IS the concern list.
 *
 * Aesthetics used to run two parallel catalogues — a Treatments index of
 * devices and procedures, and a Concerns index of patient problems — and asked
 * every visitor to guess which vocabulary the site wanted. It now runs one, in
 * the vocabulary people actually arrive with: you pick what you want treated,
 * and that page shows the treatment options Blue Diamond offers for it.
 *
 * So this page lists concerns, and the individual treatment pages
 * (RF Microneedling, Laser Skin Treatments, PRP, …) are reached FROM them.
 * Those pages are all still live and indexed at their own URLs — they left the
 * navigation, not the site — and every one of them is linked from at least one
 * concern page's "Treatment Options" section or from its technology page, so
 * none is orphaned. See src/features/concerns/queries.ts for the mapping.
 *
 * Cosmetic Botox is the one standalone entry: it is not filed under any single
 * concern, because the approved content does not put it under one.
 */

/** Single source for this page's description: consumed by both generateMetadata
 * and the page's JSON-LD node, so the two can never drift apart (brief §9). */
const PAGE_DESCRIPTION = {
  en: "Choose what you'd like to treat — unwanted hair, hair loss, acne scars, redness, fine lines, skin laxity and more — and see the physician-led treatment options Blue Diamond Medical offers.",
  ar: "اختاروا ما ترغبون في علاجه — الشعر غير المرغوب فيه، وتساقط الشعر، وندبات حب الشباب، والاحمرار، والخطوط الدقيقة، وترهل البشرة وغيرها — واطّلعوا على خيارات العلاج بإشراف طبي في بلو دايموند الطبية.",
} as const;

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
  const consult = getBookingUrl("aesthetics-consultation");
  const aestheticsRoute = getRoute("aesthetics-hub")!;
  const ownRoute = getRoute("aesthetics-treatments-hub")!;
  const title = ownRoute.title[locale];

  const hero = await resolvePageHeroImage(ownRoute.path.en, locale);
  /* The explorer's own imagery, through the same shared resolver the homepage
     uses, so the two surfaces cannot answer differently about which picture a
     concern owns. */
  const concernImages = concernExplorerImages(
    await resolveConcernListingMedia(concerns, locale),
    concerns,
  );

  /* Cosmetic Botox stays a standalone row rather than being filed under Fine
     Lines & Wrinkles or Skin Revitalization: no approved source assigns it to
     one concern, and burying it under a guess would make it undiscoverable.
     It points at the live Botox hub, which is where its approved content
     actually is — see the `gatedTreatments` note in
     src/features/aesthetics/data/treatments.ts. */
  const botox = gatedTreatments.find((t) => t.id === "cosmetic-botox")!;
  const botoxRoute = getRoute("botox-hub")!;
  const standaloneLabel = locale === "ar" ? "علاج مستقل" : "Also available";

  // Same entries this page renders, so the structured list cannot diverge.
  const listItems = [
    ...concerns.flatMap((entity) => {
      const r = getRoute(`concern-${entity.id}`);
      return r ? [{ name: entity.title[locale], url: `${siteConfig.url}/${locale}${r.path[locale]}` }] : [];
    }),
    { name: botox.title[locale], url: `${siteConfig.url}/${locale}${botoxRoute.path[locale]}` },
  ];

  return (
    <>
      <PageSchema
        locale={locale}
        name={title}
        description={PAGE_DESCRIPTION[locale]}
        path={ownRoute.path[locale]}
        items={listItems}
      />
      <AestheticsHero
        locale={locale}
        title={title}
        body={PAGE_DESCRIPTION[locale]}
        image={hero}
        imageRole="treatment"
        seed="treatments-hub"
        /* CL-033 — the same approved consultation CTA the parent Aesthetics
           hub and every detail page already use. Nothing new is authored: the
           label and destination both come from config/booking.ts. */
        actions={
          <Button size="lg" render={<a href={consult.href!} target="_blank" rel="noopener noreferrer" />}>
            {consult.label[locale]}
          </Button>
        }
        imageAlt={{
          en: "A physician performing an aesthetic treatment at Blue Diamond Medical",
          ar: "طبيبة تُجري علاجًا تجميليًا في بلو دايموند الطبية",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: aestheticsRoute.title[locale], href: href("aesthetics-hub", locale) }, { label: title }]} />}
      />

      <section className="section-y">
        <Container>
          <div data-reveal="up">
            <ConcernExplorer locale={locale} images={concernImages} showViewAll={false} />
          </div>

          <div data-reveal="up" className="mt-12 border-t border-border pt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">{standaloneLabel}</p>
            <Link
              href={`/${locale}${botoxRoute.path[locale]}`}
              className="group mt-4 flex max-w-2xl flex-col rounded-lg border border-border p-5 transition-colors hover:border-primary"
            >
              <h3 className="font-heading text-h4">{botox.title[locale]}</h3>
              <p className="mt-2 text-sm text-text-secondary">{botox.summary[locale]}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
