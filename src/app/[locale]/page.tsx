import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MapPin, Phone, Printer, Stethoscope, Sparkles, Search, Cpu } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { SiteClosingExperience } from "@/components/layout/SiteClosingExperience";
import { Button } from "@/components/ui/button";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { FacetTile } from "@/components/shared/FacetTile";
import { resolveListingMedia } from "@/lib/feelstack/listing-media";
import { cacheTags } from "@/lib/feelstack/cache-tags";
import { cmsAlt, resolveSlotImageRef } from "@/lib/feelstack/media-slots";
import { ClinicSchema } from "@/components/shared/schema";
import { FaqPageSchema } from "@/components/shared/schema";
import { ConcernExplorer } from "@/features/concerns";
import { concerns } from "@/features/concerns/data";
import { concernExplorerImages, concernListingEntities } from "@/features/concerns/media";
import { doctors } from "@/features/doctors";
import { availabilityNotice } from "@/features/products";
import {
  concernForTreatment,
  getHomeShowcases,
  homeFaqSchemaEntries,
  homepageCopy,
  ServiceCard,
  StatsCounters,
  TechnologyCard,
  TreatmentCard,
} from "@/features/home";
import { getDictionary, isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/lib/routing";
import { publishableBeforeAfterPairs } from "@/features/aesthetics/data/before-after";
import { BeforeAfterGallery } from "@/features/aesthetics/components/BeforeAfterGallery";
import { getBookingUrl } from "@/config/booking";
import { siteConfig } from "@/config/site";
import { eliteIQLocation, mapDirectionsUrl, primaryLocation } from "@/config/locations";
import { LocationMap } from "@/components/shared/LocationMap";
import { aestheticsHours, getOpenStatus, statutoryHolidayNotice } from "@/config/clinic-hours";
import { formatPrice } from "@/types/pricing";
import { getRouteMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("home", safeLocale, {
    description: {
      en: "Family medicine, walk-in care, and physician-led medical aesthetics at Blue Diamond Medical Clinic in West Springs, Calgary. Male and female physicians accepting new patients.",
      ar: "طب الأسرة، والرعاية بدون موعد، والتجميل الطبي بإشراف طبي في عيادة بلو دايموند الطبية في ويست سبرينغز، كالغاري. أطباء وطبيبات يستقبلون مرضى جددًا.",
    },
    // The approved home hero, and an asset that actually exists. This pointed
    // at /blue-diamond/hero/homepage-hero.jpg, a path nothing has ever
    // occupied -- so every share card for the homepage requested a 404 from
    // ImageKit and rendered with no image. Unlike an <img>, an OG image is not
    // gated on approval status: metadata emits the URL whatever the manifest
    // says, which is why this one broke in production while the on-page hero
    // correctly showed a placeholder.
    ogImagePath: "/blue-diamond/home/home-hero-blue-diamond.png",
  });
}


export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  // Home is a real CMS page whose route is "/" in both locales, so its hero
  // arrives like any other entity's media. Before the root-page designation
  // existed the homepage had no CMS entity at all and its imagery could only
  // be a placeholder; now that "/" resolves, not consuming it would leave a
  // publishable, approved asset rendering as a FacetTile -- the exact
  // detail/listing gap this work has been closing everywhere else.
  const dict = getDictionary(locale);
  const copy = homepageCopy[locale];
  const bookingHub = getRoute("book-appointment")!;
  const status = getOpenStatus(aestheticsHours);
  const featuredDoctors = doctors.slice(0, 3);

  const { serviceCards, techShowcase, treatmentShowcase, productShowcase } = getHomeShowcases(locale);

  // Home's own hero, plus the media for every entity this page features.
  //
  // The homepage is the largest LISTING on the site: it shows medical services,
  // treatments, technologies, doctors and products, all from static modules.
  // Each of those entities may already carry an approved assignment that its own
  // detail page renders -- so without resolving here the homepage shows a
  // placeholder for the very image the page it links to displays. That is the
  // same detail/listing split closed on /doctors and /shop, at homepage scale.
  const homeEntities = [
    { id: "home", englishPath: "/" },
    /* HUB ROUTES AS MEDIA OWNERS.
     *
     * `/medical` and `/aesthetics` are static Next routes, but each also has a
     * FeelStack `page` record — the same primitive `/` already uses to own the
     * homepage hero. A page owns media without owning content: this app reads
     * only `media` from the envelope and never renders `data.blocks`, so a
     * published hub page cannot replace or override the static page it sits
     * beside. That is what makes this safe, and it is why the hub cards below
     * can consume a real assignment instead of hardcoding a placeholder. */
    { id: "hub:medical", englishPath: "/medical" },
    { id: "hub:aesthetics", englishPath: "/aesthetics" },
    ...serviceCards.map((c) => ({ id: `service:${c.id}`, englishPath: `/medical/${c.id}` })),
    ...treatmentShowcase.map((t) => ({ id: `treatment:${t.id}`, englishPath: `/aesthetics/treatments/${t.id}` })),
    ...techShowcase.map((t) => ({ id: `tech:${t.id}`, englishPath: `/aesthetics/technologies/${t.id}` })),
    ...featuredDoctors.map((d) => ({ id: `doctor:${d.id}`, englishPath: `/our-team/${d.id}` })),
    ...productShowcase.map((pr) => ({ id: `product:${pr.id}`, englishPath: `/shop/${pr.slug}` })),
    /* Section 6's concern explorer. It was the last listing on this page still
       asking the CMS for nothing: nine concerns with approved, assigned
       photography rendered the branded FacetTile here and on the concerns hub,
       while the detail page one click away showed the real picture. Added to
       THIS fan-out rather than a second one of its own so the section costs the
       same round trips the rest of the page already makes. */
    ...concernListingEntities(concerns),
  ];
  const homeMedia = await resolveListingMedia(homeEntities, locale, [
    cacheTags.doctorsIndex(process.env.FEELSTACK_SITE_KEY ?? "", locale),
    cacheTags.medicalServicesIndex(process.env.FEELSTACK_SITE_KEY ?? "", locale),
    cacheTags.aestheticTreatmentsIndex(process.env.FEELSTACK_SITE_KEY ?? "", locale),
    cacheTags.technologiesIndex(process.env.FEELSTACK_SITE_KEY ?? "", locale),
    cacheTags.productsIndex(process.env.FEELSTACK_SITE_KEY ?? "", locale),
    cacheTags.concernsIndex(process.env.FEELSTACK_SITE_KEY ?? "", locale),
  ]);
  const homeHero = (homeMedia.home ?? []).find((m) => m.slot === "hero");
  /** First asset in any of `slots` for a featured entity, or undefined. */
  const featured = (key: string, ...slots: string[]) =>
    (homeMedia[key] ?? []).find((m) => slots.includes(m.slot));
  /* SECTION 2 PATHWAY CARDS.
     The canonical owner of both cards' imagery is the published "/" page
     record, which carries one shared assignment per card
     (`localeMode: "shared"`), so EN and AR resolve the SAME MediaAsset id
     rather than two locale copies of one photograph. The slot key — not the
     card's position in the grid — is what binds an image to a card, which is
     why RTL reversing the visual order cannot cross them over.

     `/medical` and `/aesthetics` also have `page` records, but both are still
     drafts in both locales, so their assignments never reach the public
     resolver. `hub:aesthetics` is therefore kept below only as a fallback for
     the day those pages are published — an ordered precedence, not a second
     source of truth. */
  const pathwaySlot = (slot: string) => (homeMedia.home ?? []).find((m) => m.slot === slot);
  const medicalPathwayMedia = pathwaySlot("pathwayMedicalCare");
  const aestheticsPathwayMedia =
    pathwaySlot("pathwayMedicalAesthetics") ?? featured("hub:aesthetics", "hero", "card");
  /* Keyed by concern id, resolved through the shared slot order rather than by
     position in the grid — see features/concerns/media.ts on why a preference
     list cannot cross one concern's photograph onto another's card. */
  const concernImages = concernExplorerImages(homeMedia, concerns);
  const faqSchemaEntries = homeFaqSchemaEntries(locale);

  const findByNeedIcon = { stethoscope: Stethoscope, sparkles: Sparkles, search: Search, cpu: Cpu };

  // Up to 4, one per treatment, so Home shows range rather than four views
  // of the same procedure (§27). Four rather than six because the gallery is
  // now a four-across grid: six would fill one row and leave two cards
  // stranded in a half-empty second one, and the "View all Before & After
  // examples" link directly beneath already carries anyone who wants the
  // other ten.
  const homeBeforeAfter = Object.values(
    publishableBeforeAfterPairs().reduce<Record<string, ReturnType<typeof publishableBeforeAfterPairs>[number]>>((acc, pair) => {
      acc[pair.treatmentId] ??= pair;
      return acc;
    }, {}),
  ).slice(0, 4);

  return (
    <>
      <ClinicSchema locale={locale} />
      <FaqPageSchema faqs={faqSchemaEntries} locale={locale} />

      {/* ============ SECTION 1 — FULL-BLEED PREMIUM HERO ============ */}
      {/* One photograph, edge to edge, with the copy laid over its calm
          side. This replaced a two-panel composition — a clipped photo
          beside a decorative FacetTile — which read as two cards in a box
          rather than as one image.

          No data-reveal anywhere in this section: H1, CTAs and the LCP
          image are above the fold and must render immediately, per the
          brief's "do not animate hero H1, hero CTA, LCP image, critical
          booking information" rule. */}
      <section className="relative isolate overflow-hidden border-b border-border">
        {/* THE PHOTOGRAPH. Still the FeelStack `hero` assignment resolved
            server-side above — swapping it stays a CMS action (upload,
            approve, assign `hero`, publish), never a code change. When no
            assignment exists ImageKitImage renders the FacetTile placeholder
            at the same full-bleed size, so the layout holds either way.

            object-position is set from here rather than through a new prop on
            the shared component: the framing differs only on this one
            surface. At narrow widths a 16:9 photograph cropped to a tall box
            loses its subject, so the focal point moves off centre to keep the
            clinician and patient in frame; on wide screens the natural centre
            already places them to the side of the copy. */}
        <div className="absolute inset-0 -z-30">
          {homeHero ? (
            <ImageKitImage
              path={homeHero.path}
              preset="hero"
              role={homeHero.role}
              status={homeHero.status}
              alt={
                cmsAlt(homeHero) ?? {
                  en: "A clinician in conversation with a patient in the Blue Diamond Medical consultation room",
                  ar: "طبيبة تتحدث مع مريضة في غرفة الاستشارات في بلو دايموند الطبية",
                }
              }
              locale={locale}
              width={homeHero.width}
              height={homeHero.height}
              /* The LCP image, and the only preloaded image on this page.
                 100vw because it is now full-bleed; it used to be sized for a
                 half-width panel, which made every candidate twice the size
                 the layout could use. */
              preload
              sizes="100vw"
              /* Arabic mirrors the layout, so the photograph mirrors with it.
                 The frame is directional: its calm, near-white facet panel is
                 on the left and the clinician and patient are on the right.
                 Left as-is under RTL the copy would land on the busiest part
                 of the picture while the calm side sat behind nothing.
                 Flipping puts the quiet side back under the words. There is
                 no text in the frame, so nothing reads backwards. */
              className="h-full w-full [&>img]:object-[68%_center] lg:[&>img]:object-center rtl:[&>img]:-scale-x-100"
            />
          ) : (
            <FacetTile
              role="hero"
              alt={({ en: "Blue Diamond Medical consultation room", ar: "غرفة الاستشارات في بلو دايموند الطبية" })[locale]}
              className="h-full w-full"
            />
          )}
        </div>

        {/* READABILITY WASH — light, never dark. Blue Diamond stays clinical
            and calm, so contrast comes from lifting the copy side toward white
            rather than dimming the photograph.

            Two directions, because the copy sits in two different places:
            beside the photograph on desktop, stacked over it on mobile — so
            the mobile wash holds its light until below the trust line rather
            than clearing halfway down, which would leave the smallest text on
            the brightest part of the picture. The horizontal wash mirrors for
            Arabic: the copy moves to the right, so the lit side moves with it.
            Every stop is a slow fade with no hard edge, which is what keeps
            this from reading as a white rectangle behind the text. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 lg:hidden"
          style={{
            background:
              "linear-gradient(to bottom, rgba(250,253,255,0.97) 0%, rgba(250,253,255,0.95) 50%, rgba(250,253,255,0.90) 74%, rgba(250,253,255,0.72) 90%, rgba(250,253,255,0.40) 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 hidden lg:block"
          style={{
            background: `linear-gradient(${locale === "ar" ? "to left" : "to right"}, rgba(250,253,255,0.97) 0%, rgba(250,253,255,0.94) 20%, rgba(250,253,255,0.78) 38%, rgba(250,253,255,0.34) 56%, rgba(250,253,255,0.06) 72%, rgba(250,253,255,0) 84%)`,
          }}
        />
        {/* A whisper of light under the floating header so the nav links stay
            legible wherever the photograph happens to be bright or busy, and a
            fade into the page colour at the bottom so the hero meets the next
            section's seam without a visible edge. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-32"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0) 100%)" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 -z-10 h-24"
          style={{ background: "linear-gradient(to top, var(--background) 0%, rgba(255,255,255,0) 100%)" }}
        />

        {/* Extra top padding vs. other section-y content: the header is
            `fixed` (not `sticky`) on the homepage specifically so the
            hero can extend behind its transparent top-state, which means
            it no longer reserves any space in normal flow — this
            replaces that reserved space so the H1 doesn't render behind
            the floating header. */}
        <Container className="flex min-h-[580px] flex-col justify-center pt-28 pb-12 sm:min-h-[600px] lg:min-h-[620px] lg:pt-32 lg:pb-16 xl:min-h-[640px]">
          <div className="max-w-[560px]">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{dict.home.heroEyebrow}</p>
            <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{dict.home.heroTitle}</h1>
            <p className="mt-5 text-body-lg text-text-secondary">{dict.home.heroBody}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button size="lg" render={<Link href={href("medical-hub", locale)} />}>
                {dict.home.heroCtaPrimary}
                <ArrowRight className="ms-1 size-4 rtl:rotate-180" />
              </Button>
              <Button size="lg" variant="outline" render={<Link href={href("aesthetics-hub", locale)} />}>
                {dict.home.heroCtaSecondary}
                <ArrowRight className="ms-1 size-4 rtl:rotate-180" />
              </Button>
            </div>
            <Button size="lg" variant="ghost" className="mt-3" render={<Link href={`/${locale}${bookingHub.path[locale]}`} />}>
              {dict.common.bookAppointment}
            </Button>

            {/* Compact trust line — only verified items, no statistics. */}
            <p className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-text-secondary">
              {copy.trustLine.map((item, i) => (
                <span key={item} className="ltr-run">
                  {i > 0 ? <span aria-hidden="true" className="me-2 text-primary">·</span> : null}
                  {item}
                </span>
              ))}
            </p>
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--background)" to="var(--surface-blue-soft)" />

      {/* TRUST STRIP — verified stats only, animated (StatsCounters). */}
      <section className="bg-surface-blue-soft">
        <Container className="py-14 lg:py-16">
          <StatsCounters stats={copy.trustStats} />
        </Container>
      </section>

      <SectionTransition from="var(--surface-blue-soft)" to="var(--background)" />

      {/* ============ SECTION 2 — TWO CLEAR CARE PATHWAYS ============ */}
      {/* Asymmetric weight on desktop: medical takes the wider column
          text-and-image editorial treatment; aesthetics leads with a
          larger image-led panel. Order reverses in RTL automatically via
          the grid's natural flow direction — no JS mirroring needed. */}
      <section className="section-y">
        <Container>
          <h2 data-reveal="up" className="text-display-2 font-heading lg:text-display-2-lg">
            {dict.home.pathwaysTitle}
          </h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-[5fr_7fr]">
            {/* MEDICAL CARE CARD. Mirrors the aesthetics card's treatment —
                photograph, the same Blue Diamond overlay, white text — while
                keeping this card's own structure (centred content, p-8, its
                existing inner link). The overlay is a render-time layer so the
                approved asset stays clean: nothing is baked into the source.
                With no assignment the card falls back to its original bordered
                panel rather than an empty box. */}
            <div
              data-reveal="start"
              className={`relative isolate flex flex-col justify-center overflow-hidden rounded-lg p-8 ${
                medicalPathwayMedia ? "text-white" : "border border-border"
              }`}
            >
              {medicalPathwayMedia ? (
                <>
                  <ImageKitImage
                    path={medicalPathwayMedia.path}
                    preset="hero"
                    role={medicalPathwayMedia.role}
                    status={medicalPathwayMedia.status}
                    alt={
                      cmsAlt(medicalPathwayMedia) ?? {
                        en: "Family medical consultation at Blue Diamond Medical",
                        ar: "استشارة رعاية طبية عائلية في بلو دايموند الطبية",
                      }
                    }
                    locale={locale}
                    width={medicalPathwayMedia.width}
                    height={medicalPathwayMedia.height}
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    className="absolute inset-0 -z-20 h-full w-full"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10"
                    style={{ background: "linear-gradient(0deg, rgba(41,101,137,0.92) 0%, rgba(41,101,137,0.5) 60%, rgba(41,101,137,0.08) 100%)" }}
                  />
                </>
              ) : null}
              <Stethoscope className={medicalPathwayMedia ? "size-7" : "size-7 text-primary"} aria-hidden="true" />
              <h3 className="mt-4 text-h3 font-heading">{dict.home.pathwaysMedicalTitle}</h3>
              <p className={`mt-3 text-body ${medicalPathwayMedia ? "text-white/90" : "text-text-secondary"}`}>{dict.home.pathwaysMedicalBody}</p>
              <Link href={href("medical-hub", locale)} className={`mt-6 inline-flex items-center gap-1 text-sm font-semibold ${medicalPathwayMedia ? "tracking-wide text-white hover:text-white/90" : "text-primary hover:text-primary-hover"}`}>
                {copy.finalActions.explorMedical} <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </div>

            <Link
              data-reveal="end"
              href={href("aesthetics-hub", locale)}
              className="group relative isolate flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-lg p-9 text-white"
            >
              {/* Real assigned media wins; the facet tile is the fallback, not
                  the default. This used to be a hardcoded FacetTile, which meant
                  an approved photograph assigned to the Aesthetics hub could
                  never reach the card no matter what the CMS said. */}
              {aestheticsPathwayMedia ? (
                <ImageKitImage
                  path={aestheticsPathwayMedia.path}
                  preset="hero"
                  role={aestheticsPathwayMedia.role}
                  status={aestheticsPathwayMedia.status}
                  alt={
                    cmsAlt(aestheticsPathwayMedia) ?? {
                      en: "Medical aesthetics consultation room at Blue Diamond Medical",
                      ar: "غرفة استشارات التجميل الطبي في بلو دايموند الطبية",
                    }
                  }
                  locale={locale}
                  width={aestheticsPathwayMedia.width}
                  height={aestheticsPathwayMedia.height}
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="absolute inset-0 -z-20 h-full w-full"
                />
              ) : (
                <FacetTile role="treatment" alt={({ en: "Medical aesthetics consultation room at Blue Diamond Medical", ar: "غرفة استشارات التجميل الطبي في بلو دايموند الطبية" })[locale]} className="absolute inset-0 -z-20 h-full w-full" />
              )}
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10"
                style={{ background: "linear-gradient(0deg, rgba(41,101,137,0.92) 0%, rgba(41,101,137,0.5) 60%, rgba(41,101,137,0.08) 100%)" }}
              />
              <Sparkles className="size-7" aria-hidden="true" />
              <h3 className="mt-4 text-h3 font-heading text-white">{dict.home.pathwaysAestheticsTitle}</h3>
              <p className="mt-3 max-w-sm text-body text-white/90">{dict.home.pathwaysAestheticsBody}</p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold tracking-wide">
                {copy.finalActions.exploreAesthetics} <ArrowRight className="size-4 rtl:rotate-180" />
              </span>
            </Link>
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--background)" to="var(--surface)" />

      {/* ============ SECTION 3 — FIND CARE BY NEED ============ */}
      <section className="section-y bg-surface">
        <Container>
          <p data-reveal="up" className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.findByNeedEyebrow}</p>
          <h2 data-reveal="up" className="mt-3 text-display-2 font-heading lg:text-display-2-lg">{copy.findByNeedHeading}</h2>
          <p data-reveal="up" className="mt-3 max-w-2xl text-body text-text-secondary">{copy.findByNeedIntro}</p>

          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {copy.findByNeed.map((item, i) => {
              const Icon = findByNeedIcon[item.icon];
              return (
                <Link
                  key={item.label}
                  data-reveal="up"
                  data-reveal-delay={String(i % 4)}
                  href={`/${locale}${getRoute(item.routeId)!.path[locale]}`}
                  className="group flex flex-col gap-3 bg-background p-7 transition-colors hover:bg-surface-blue-soft"
                >
                  <Icon className="size-6 text-primary" aria-hidden="true" />
                  <span className="font-heading text-h4">{item.label}</span>
                  <span className="text-sm text-text-secondary">{item.caption}</span>
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--surface)" to="var(--background)" />

      {/* ============ SECTION 4 — MEDICAL CARE DEPTH ============ */}
      <section className="section-y bg-background">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div data-reveal="up" className="max-w-xl">
              <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.medicalDepthEyebrow}</p>
              <h2 className="mt-3 text-display-2 font-heading lg:text-display-2-lg">{copy.medicalDepthHeading}</h2>
              <p className="mt-3 text-body text-text-secondary">{copy.medicalDepthIntro}</p>
            </div>
            <Link data-reveal="up" href={href("medical-hub", locale)} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">
              {copy.medicalDepthCta} <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </div>

          {/* Real image-backed cards, not empty bordered boxes: default
              state shows image + title + short summary; hover/focus
              swaps to the longer explanation + a descriptive CTA. First
              2 cards span 2 columns for editorial variety, not a uniform
              4-up grid. */}
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {serviceCards.map((card, i) => (
              <ServiceCard
                key={card.id}
                title={card.title}
                short={card.short}
                long={card.long}
                ctaLabel={card.ctaLabel}
                routeId={card.routeId}
                imageId={card.id}
                resolved={featured(`service:${card.id}`, "hero", "card")}
                locale={locale}
                delay={i}
                className={i < 2 ? "col-span-2" : "col-span-2 sm:col-span-1"}
              />
            ))}
          </div>

          <div data-reveal="up" className="mt-10 border-t border-border pt-6">
            <p className="text-xs font-semibold tracking-[0.08em] text-primary uppercase">{copy.otherServiceFactsHeading}</p>
            <p className="mt-2 text-sm text-text-secondary">{copy.otherServiceFacts.join(" · ")}</p>
          </div>

          <div className="mt-10 grid gap-6 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {copy.medicalGuidance.map((item, i) => (
              <div key={item.label} data-reveal="up" data-reveal-delay={String(i % 4)}>
                <p className="text-xs font-semibold tracking-[0.08em] text-primary uppercase">{item.label}</p>
                <p className="mt-2 text-sm text-text-secondary">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--background)" to="var(--surface-blue-soft)" />

      {/* ============ SECTION 5 — FEATURED AESTHETIC TREATMENTS ============ */}
      {/* One large + two medium + five compact editorial entries —
          deliberately not a uniform card grid. Alternating aspect ratios
          across the three tiers. */}
      <section className="section-y bg-surface-blue-soft" style={{ "--text-secondary": "var(--grey-4)" } as React.CSSProperties}>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div data-reveal="up" className="max-w-xl">
              <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.treatmentsEyebrow}</p>
              <h2 className="mt-3 text-display-2 font-heading lg:text-display-2-lg">{copy.treatmentsHeading}</h2>
              <p className="mt-3 text-body text-text-secondary">{copy.treatmentsIntro}</p>
            </div>
            <Link data-reveal="up" href={href("aesthetics-treatments-hub", locale)} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">
              {copy.treatmentsCta} <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </div>

          {treatmentShowcase.length ? (
            <div className="mt-10 grid gap-4 lg:grid-cols-6">
              {treatmentShowcase.slice(0, 1).map((treatment) => (
                <TreatmentCard key={treatment.id} resolved={featured(`treatment:${treatment.id}`, "hero", "card")} treatment={treatment} locale={locale} concern={concernForTreatment(treatment.id)} size="large" className="lg:col-span-4 lg:row-span-2" />
              ))}
              {treatmentShowcase.slice(1, 3).map((treatment, i) => (
                <TreatmentCard key={treatment.id} resolved={featured(`treatment:${treatment.id}`, "hero", "card")} treatment={treatment} locale={locale} concern={concernForTreatment(treatment.id)} size="medium" className="lg:col-span-2" delay={i} />
              ))}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-6 lg:grid-cols-5">
                {treatmentShowcase.slice(3).map((treatment, i) => (
                  <TreatmentCard key={treatment.id} resolved={featured(`treatment:${treatment.id}`, "hero", "card")} treatment={treatment} locale={locale} concern={concernForTreatment(treatment.id)} size="small" delay={i} />
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </section>

      <SectionTransition from="var(--surface-blue-soft)" to="var(--background)" />

      {/* ============ SECTION 6 — EXPLORE BY CONCERN ============ */}
      <section className="section-y bg-background">
        <Container>
          <ConcernExplorer locale={locale} images={concernImages} />
        </Container>
      </section>

      <SectionTransition from="var(--background)" to="var(--blue-4)" />

      {/* ============ SECTION 7 — TECHNOLOGY BEHIND THE TREATMENT ============ */}
      {/* Dark editorial atmosphere. One large featured (Potenza, "01") +
          an asymmetric supporting grid for 02-05 — never a flat row of
          five identical machine cards. */}
      <section className="relative overflow-hidden bg-blue-4 px-4 py-[clamp(4.5rem,9vw,7.5rem)] lg:px-6">
        <span aria-hidden="true" className="pointer-events-none absolute -top-16 end-[-4rem] size-56 rotate-45 bg-white/5 lg:size-72" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-[-6rem] start-[-3rem] size-64 rotate-45 bg-white/5" />
        <Container>
          <div data-reveal="up" className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.14em] text-white/80 uppercase">{copy.techEyebrow}</p>
            <h2 className="mt-4 text-display-2 font-heading text-white lg:text-display-2-lg">{copy.techHeading}</h2>
            <p className="mt-4 text-body-lg text-white/85">{copy.techIntro}</p>
          </div>

          {techShowcase.length ? (
            <div className="mt-12 grid gap-6 lg:grid-cols-6">
              {techShowcase.slice(0, 1).map((tech, i) => (
                <TechnologyCard key={tech.id} resolved={featured(`tech:${tech.id}`, "card", "hero")} technology={tech} locale={locale} number={i + 1} size="large" className="lg:col-span-4" />
              ))}
              <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
                {techShowcase.slice(1, 3).map((tech, i) => (
                  <TechnologyCard key={tech.id} resolved={featured(`tech:${tech.id}`, "card", "hero")} technology={tech} locale={locale} number={i + 2} size="small" delay={i} />
                ))}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:col-span-6 lg:grid-cols-2">
                {techShowcase.slice(3).map((tech, i) => (
                  <TechnologyCard key={tech.id} resolved={featured(`tech:${tech.id}`, "card", "hero")} technology={tech} locale={locale} number={i + 4} size="medium" delay={i} />
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </section>

      <SectionTransition from="var(--blue-4)" to="var(--background)" />

      {/* ============ SECTION 7b — CLINICAL BEFORE & AFTER (curated) ============ */}
      {/* Closure brief §27: a curated handful, never the whole library —
          the site has to keep reading as a medical practice, not a results
          gallery. `homeBeforeAfter` is empty while nothing is publishable,
          and the whole section (heading, seam and all) then renders
          nothing rather than leaving a titled empty band (§46). */}
      {homeBeforeAfter.length > 0 ? (
        <>
          <section className="section-y bg-background">
            <Container>
              <BeforeAfterGallery pairs={homeBeforeAfter} locale={locale} />
              <Link
                href={href("aesthetics-before-after", locale)}
                className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover"
              >
                {locale === "ar" ? "عرض جميع أمثلة قبل وبعد" : "View all Before & After examples"}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </Container>
          </section>
          <SectionTransition from="var(--background)" to="var(--background)" />
        </>
      ) : null}

      {/* ============ SECTION 8 — PATIENT JOURNEY ============ */}
      <section className="section-y bg-background">
        <Container>
          <p data-reveal="up" className="text-center text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.journeyEyebrow}</p>
          <h2 data-reveal="up" className="mt-3 text-center text-display-2 font-heading lg:text-display-2-lg">{copy.journeyHeading}</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {copy.journeySteps.map((step, i) => (
              <div key={step.t} data-reveal="up" data-reveal-delay={String(Math.min(i, 3))} className="border-t-2 border-blue-1 pt-5">
                <div className="ltr-run font-heading text-h3 text-primary">{String(i + 1).padStart(2, "0")}</div>
                <p className="mt-3 font-semibold">{step.t}</p>
                <p className="mt-2 text-sm text-text-secondary">{step.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--background)" to="var(--surface)" />

      {/* ============ SECTION 9 — DOCTORS AND CARE TEAM ============ */}
      <section className="section-y bg-surface">
        <Container>
          <div data-reveal="up" className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.doctorsEyebrow}</p>
            <h2 className="mt-3 text-display-2 font-heading lg:text-display-2-lg">{dict.home.doctorsTitle}</h2>
            <p className="mt-3 text-body text-text-secondary">{dict.home.doctorsBody}</p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {featuredDoctors.map((doctor, i) => {
              const route = getRoute(doctor.routeId)!;
              return (
                <Link
                  key={doctor.id}
                  data-reveal="scale"
                  data-reveal-delay={String(Math.min(i, 3))}
                  href={`/${locale}${route.path[locale]}`}
                  className="group block overflow-hidden rounded-lg border border-border bg-background"
                >
                  <div className="facet-corner-sm relative aspect-[4/5] overflow-hidden">
                    <ImageKitImage
                      path={
                        resolveSlotImageRef({
                          media: homeMedia[`doctor:${doctor.id}`] ?? [],
                          slot: "doctorPortrait",
                          override: doctor.image,
                          fallback: doctor.image,
                        }).path
                      }
                      preset="doctor-card"
                      role="doctor"
                      status={
                        resolveSlotImageRef({
                          media: homeMedia[`doctor:${doctor.id}`] ?? [],
                          slot: "doctorPortrait",
                          override: doctor.image,
                          fallback: doctor.image,
                        }).status
                      }
                      alt={
                        cmsAlt(featured(`doctor:${doctor.id}`, "doctorPortrait")) ?? {
                          en: `Portrait of ${doctor.name.en}`,
                          ar: `صورة ${doctor.name.ar}`,
                        }
                      }
                      locale={locale}
                      width={480}
                      height={600}
                      className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-heading text-h4">{doctor.name[locale]}</p>
                    <p className="mt-1 text-sm text-text-secondary">{doctor.credentials[locale]}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          <div data-reveal="up" className="mt-8 text-center">
            <Link href={href("doctors-index", locale)} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">
              {dict.common.learnMore} <span className="sr-only">{locale === "ar" ? "عن أطبائنا" : "about our doctors"}</span>{" "}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--surface)" to="var(--background)" />

      {/* ============ SECTION 10 — SKINMEDICA PRODUCT COLLECTION ============ */}
      {/* Refined homepage preview only (4-6 featured products) — the full
          23-product catalogue lives at /shop, never on the homepage.
          Every card links to its own real detail page; the section CTA
          opens the catalogue itself, not Contact, since that's what "View
          All SkinMedica Products" actually points to — button wording
          must match its destination. */}
      <section className="section-y bg-background">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div data-reveal="up" className="max-w-xl">
              <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.productsEyebrow}</p>
              <h2 className="mt-3 text-display-2 font-heading lg:text-display-2-lg">{copy.productsHeading}</h2>
              <p className="mt-3 text-body text-text-secondary">{copy.productsIntro}</p>
            </div>
            <Button data-reveal="up" render={<Link href={href("shop-hub", locale)} />}>
              {copy.productsCta}
            </Button>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productShowcase.map((product, i) => (
              <Link
                key={product.id}
                href={href(`shop-product-${product.id}`, locale)}
                data-reveal="up"
                data-reveal-delay={String(i % 4)}
                className="group rounded-lg border border-border p-5 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="facet-corner-sm aspect-square overflow-hidden rounded">
                  <ImageKitImage
                    path={(featured(`product:${product.id}`, "productPrimary") ?? product.images[0]!).path}
                    preset="product"
                    role="product"
                    status={(featured(`product:${product.id}`, "productPrimary") ?? product.images[0]!).status}
                    alt={cmsAlt(featured(`product:${product.id}`, "productPrimary")) ?? product.images[0]!.alt}
                    locale={locale}
                    width={400}
                    height={400}
                    className="h-full w-full transition-transform group-hover:scale-[1.02]"
                  />
                </div>
                <p className="mt-4 font-heading text-h5 group-hover:text-primary">{product.name[locale]}</p>
                {product.detail ? <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{product.detail.overview[locale]}</p> : null}
                <p className="mt-2 text-sm text-text-secondary">{product.sizeLabel}</p>
                <p className="mt-1 text-sm font-semibold text-text-body">{formatPrice(product.priceCents)}</p>
              </Link>
            ))}
          </div>

          <p data-reveal="up" className="mt-6 max-w-2xl text-sm text-text-secondary">{availabilityNotice[locale]}</p>
        </Container>
      </section>

      <SectionTransition from="var(--background)" to="var(--surface-blue-mist)" />

      {/* ============ SECTION 11 — PATIENT RESOURCES ============ */}
      <section className="section-y bg-surface-blue-mist" style={{ "--text-secondary": "var(--grey-4)" } as React.CSSProperties}>
        <Container>
          <p data-reveal="up" className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.resourcesEyebrow}</p>
          <h2 data-reveal="up" className="mt-3 text-display-2 font-heading lg:text-display-2-lg">{copy.resourcesHeading}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.resources.map((item, i) => (
              <Link
                key={item.label}
                data-reveal="up"
                data-reveal-delay={String(i % 4)}
                href={`/${locale}${getRoute(item.routeId)!.path[locale]}`}
                className="group flex flex-col gap-2 rounded-lg border border-border bg-background p-5 transition-colors hover:border-primary"
              >
                <span className="font-semibold">{item.label}</span>
                <span className="text-sm text-text-secondary">{item.body}</span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--surface-blue-mist)" to="var(--background)" />

      {/* ============ SECTION 14 — FAQ ============ */}
      {/* FAQPage schema is emitted once at the top of the page from this
          exact `copy.faqs` array via FaqPageSchema — never a separate
          invented list. */}
      <section className="section-y bg-background">
        <Container className="max-w-3xl">
          <p data-reveal="up" className="text-center text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.faqEyebrow}</p>
          <h2 data-reveal="up" className="mt-3 text-center text-display-2 font-heading lg:text-display-2-lg">{copy.faqHeading}</h2>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {copy.faqs.map((faq, i) => (
              <details key={faq.q} data-reveal="up" data-reveal-delay={String(Math.min(i, 3))} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:content-none">
                  {faq.q}
                  <span className="shrink-0 text-primary group-open:hidden">+</span>
                  <span className="hidden shrink-0 text-primary group-open:inline">−</span>
                </summary>
                <p className="mt-3 text-sm text-text-secondary">{faq.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--background)" to="var(--surface)" />

      {/* ============ SECTION 15 — LOCATION AND CONTACT ============ */}
      {/* Two-column composition unchanged: a large visual on one side, the
          location content on the other. What changed is that the visual is
          now a REAL interactive map instead of the FacetTile placeholder
          (docs/MEDIA.md already flagged that row as "Consider an embedded map
          instead of a static image"), and the card now presents the
          aesthetics location entity.

          Every fact below — name, address, phone, fax, map pin, directions
          target — comes from `primaryLocation` / `eliteIQLocation` in
          src/config/locations.ts. Nothing factual is written inline here and
          nothing factual lives in the locale dictionaries, which is what
          makes EN and AR structurally incapable of disagreeing.

          On the phone number: this card is the AESTHETICS channel, so it
          renders the (403) 247-1418 aesthetics line, not the (825) 413-1113
          medical/walk-in line. Both are approved, published, and deliberately
          distinct — see docs/SOURCE_CONFLICT_REGISTER.md CONF-001. Do not
          "reconcile" them.

          Hours status is computed from `aestheticsHours`, not the default
          clinic schedule: this card is the aesthetics location and its
          approved hours are 09:00-17:00, where the clinic's are 08:00-19:00.
          "Open now" is never static text. */}
      <section className="section-y bg-surface" style={{ "--text-secondary": "var(--grey-4)" } as React.CSSProperties}>
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Content is FIRST in the DOM so mobile stacks content-then-map
              (the section's existing order) and so reading/tab order stays
              logical. `lg:order-2` moves it to the right-hand column at
              desktop, putting the map on the left. */}
          <div data-reveal="end" className="lg:order-2">
            <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.location.eyebrow}</p>
            <h2 className="mt-3 text-display-2 font-heading lg:text-display-2-lg">{copy.location.heading}</h2>
            <p className="mt-4 text-body-lg text-text-secondary">{copy.location.body}</p>

            <p className="mt-8 text-h4 font-heading">{primaryLocation.name}</p>

            {/* The rows are a GRID, not a flex row wrapping an inner div.
                `dl > div > div > dt` is invalid: axe's `only-dlitems` check
                flattens a role-less `div` child of the `dl` and then requires
                every screen-reader-visible node it finds to be a `dt`/`dd`,
                and `dlitem` allows the pair's parent to be a `div` only when
                THAT div's parent is the `dl`. Nesting a second div to stack
                the label over the value therefore failed both rules on /en
                and /ar (serious, 7 nodes). A two-row grid with the icon
                spanning both rows keeps the identical visual — icon at the
                inline-start, label above value — while leaving `dt` and `dd`
                as direct children of the one `div`. The icons are
                `aria-hidden`, which is what lets them sit in that div without
                becoming disallowed children themselves. */}
            <dl className="mt-4 space-y-4 text-body">
              <div className="grid grid-cols-[auto_1fr] items-start gap-x-3">
                <MapPin className="row-span-2 mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <dt className="text-sm text-text-secondary">{copy.location.addressLabel}</dt>
                {/* Two `ltr-run` spans rather than one: the address is Latin
                    script inside an RTL paragraph, and isolating each line
                    keeps "23-8" and the postal code from being reordered by
                    the bidi algorithm. */}
                <dd className="mt-0.5">
                  <span className="ltr-run">{primaryLocation.displayLines[0]},</span>
                  <br />
                  <span className="ltr-run">{primaryLocation.displayLines[1]}</span>
                </dd>
              </div>

              <div className="grid grid-cols-[auto_1fr] items-start gap-x-3">
                <Phone className="row-span-2 mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <dt className="text-sm text-text-secondary">{copy.location.phoneLabel}</dt>
                <dd className="mt-0.5">
                  <a className="ltr-run hover:text-primary" href={`tel:${primaryLocation.phone}`}>
                    {primaryLocation.phoneDisplay}
                  </a>
                </dd>
              </div>

              {/* Fax is deliberately not a link — it is reference information,
                  never a contact action. */}
              <div className="grid grid-cols-[auto_1fr] items-start gap-x-3">
                <Printer className="row-span-2 mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <dt className="text-sm text-text-secondary">{copy.location.faxLabel}</dt>
                <dd className="ltr-run mt-0.5">{primaryLocation.faxDisplay}</dd>
              </div>
            </dl>

            <div className="mt-6 rounded-md border border-border bg-background px-4 py-3 text-sm">
              <span className="font-medium">{status.label[locale]}</span>
              <span className="mx-2 text-text-secondary">·</span>
              <span className="text-text-secondary">{statutoryHolidayNotice[locale]}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <Button
                variant="outline"
                render={
                  <a href={mapDirectionsUrl(primaryLocation)} target="_blank" rel="noopener noreferrer" />
                }
              >
                {copy.location.directions}
              </Button>
              <Button render={<Link href={`/${locale}${bookingHub.path[locale]}`} />}>{dict.common.bookAppointment}</Button>
            </div>

            {/* SECONDARY location. Visually subordinate on purpose — a muted
                bordered note, not a second address block of equal weight — so
                Citizen Studio can never read as the main clinic. */}
            <aside className="mt-8 rounded-lg border border-border bg-background/60 px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.08em] text-primary uppercase">{copy.location.eliteIQHeading}</p>
              <p className="mt-2 text-sm text-text-secondary">{copy.location.eliteIQBody}</p>
              <p className="mt-2 text-sm">
                <span className="ltr-run">{eliteIQLocation.displayLines[0]},</span>
                <br />
                <span className="ltr-run">{eliteIQLocation.displayLines[1]}</span>
              </p>
              <a
                href={mapDirectionsUrl(eliteIQLocation)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
              >
                {copy.location.eliteIQDirections}
              </a>
            </aside>
          </div>

          {/* MAP. Fills the visual container the FacetTile used to occupy.
              Below `lg` the 4:3 ratio derives height from the column width, so
              the box can never collapse to zero and needs no min-height — and
              must not have one: `aspect-[4/3]` resolves against whichever axis
              is constrained, so a `min-h` here made the ratio compute WIDTH
              from that height (288px -> 384px) and pushed the map ~10px past a
              390px viewport. At `lg` the ratio is dropped for `self-stretch`,
              and the min-height is the floor that keeps the map from
              collapsing when the content column is short.
              `overflow-hidden` + `rounded-lg` clips the iframe to the Blue
              Diamond corner radius. */}
          <div
            data-reveal="start"
            className="aspect-[4/3] overflow-hidden rounded-lg border border-border lg:order-1 lg:aspect-auto lg:min-h-[28rem] lg:self-stretch"
          >
            <LocationMap location={primaryLocation} title={copy.location.mapTitle} />
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--surface)" to="var(--background)" />

      {/* BOOKING PATHS — external systems, resolved centrally. */}
      <section className="section-y bg-background">
        <Container>
          <h2 data-reveal="up" className="text-center text-display-2 font-heading lg:text-display-2-lg">
            {copy.bookingHeading}
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.bookingPaths.map((path, i) => {
              const dest = getBookingUrl(path.channel);
              return (
                <a
                  key={path.channel}
                  data-reveal="up"
                  data-reveal-delay={String(i % 4)}
                  href={dest.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-40 flex-col gap-2.5 rounded-lg border border-border bg-surface p-7 transition-colors hover:border-primary"
                >
                  <span className="text-xs font-semibold tracking-[0.08em] text-primary uppercase">{path.label}</span>
                  <span className="mt-auto text-h4 font-heading">{dest.label[locale]}</span>
                </a>
              );
            })}
            <a
              data-reveal="up"
              data-reveal-delay="3"
              href={`tel:${siteConfig.clinic.phone}`}
              className="flex min-h-40 flex-col gap-2.5 rounded-lg border border-border bg-surface p-7 transition-colors hover:border-primary"
            >
              <span className="text-xs font-semibold tracking-[0.08em] text-primary uppercase">{copy.callCard.label}</span>
              <span className="ltr-run mt-auto text-h4 font-heading">{copy.callCard.value}</span>
            </a>
          </div>
        </Container>
      </section>

      {/* ============ SECTION 16 — FINAL CONVERSION AREA ============ */}
      {/* One continuous closing atmosphere (light content → CTA → the
          footer's own deep-blue tone), not three flat rectangles — see
          SiteClosingExperience.tsx. Replaces the previous flat bg-blue-4
          CTA block + a separate manual gradient-seam div. */}
      <SiteClosingExperience locale={locale} variant="light" />
    </>
  );
}
