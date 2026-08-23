import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, MapPin, Phone, Stethoscope, Sparkles, Search, Cpu } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { SiteClosingExperience } from "@/components/layout/SiteClosingExperience";
import { Button } from "@/components/ui/button";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { ClinicSchema } from "@/components/shared/schema";
import { FaqPageSchema } from "@/components/shared/schema";
import { ConcernExplorer } from "@/features/concerns";
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
import { getBookingUrl } from "@/config/booking";
import { siteConfig } from "@/config/site";
import { getOpenStatus, statutoryHolidayNotice } from "@/config/clinic-hours";
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
    ogImagePath: "/blue-diamond/hero/homepage-hero.jpg",
  });
}


export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const dict = getDictionary(locale);
  const copy = homepageCopy[locale];
  const bookingHub = getRoute("book-appointment")!;
  const status = getOpenStatus();
  const featuredDoctors = doctors.slice(0, 3);

  const { serviceCards, techShowcase, treatmentShowcase, productShowcase } = getHomeShowcases(locale);
  const faqSchemaEntries = homeFaqSchemaEntries(locale);

  const findByNeedIcon = { stethoscope: Stethoscope, sparkles: Sparkles, search: Search, cpu: Cpu };

  return (
    <>
      <ClinicSchema locale={locale} />
      <FaqPageSchema faqs={faqSchemaEntries} locale={locale} />

      {/* ============ SECTION 1 — UNIFIED PREMIUM HERO ============ */}
      {/* No data-reveal anywhere in this section: H1, CTAs, and both
          images are LCP-critical/above-the-fold and must render
          immediately, per the brief's explicit "do not animate hero H1,
          hero CTA, LCP image, critical booking information" rule. */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(120% 70% at 85% 15%, var(--surface-blue-soft) 0%, transparent 60%), radial-gradient(90% 60% at 10% 90%, var(--surface-blue-mist) 0%, transparent 55%)",
          }}
        />
        {/* Extra top padding vs. other section-y content: the header is
            `fixed` (not `sticky`) on the homepage specifically so the
            hero can extend behind its transparent top-state, which means
            it no longer reserves any space in normal flow — this
            replaces that reserved space so the H1 doesn't render behind
            the floating header. */}
        <Container className="grid gap-10 pt-28 pb-14 lg:grid-cols-[6fr_6fr] lg:items-center lg:pt-36 lg:pb-20">
          <div className="max-w-xl">
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

          {/* Dual-image composition: medical care + medical aesthetics,
              joined by a restrained diamond-facet seam (each half clipped
              with a complementary diagonal notch). */}
          {/* min-w-0 on the grid and both cells: without it, CSS Grid's
              default `min-width: auto` lets each image's intrinsic
              width (800) force its column wider than the track — a real
              horizontal-overflow bug found by measuring scrollWidth at
              375/768/1024px, not visible at 1440px where the column
              happens to still exceed 800px unscaled. */}
          <div className="relative grid aspect-[4/5] min-w-0 grid-cols-2 gap-1 lg:aspect-[16/10]">
            <div
              className="relative min-w-0 overflow-hidden rounded-lg"
              style={{ clipPath: "polygon(0 0, 94% 0, 100% 100%, 0 100%)" }}
            >
              <ImageKitImage
                path="/blue-diamond/pathways/medical-care.jpg"
                preset="hero"
                role="hero"
                status="pending"
                alt={{ en: "Family medicine at Blue Diamond Medical", ar: "طب الأسرة في بلو دايموند الطبية" }}
                locale={locale}
                width={800}
                height={1000}
                preload
                className="h-full w-full"
              />
            </div>
            <div
              className="relative min-w-0 overflow-hidden rounded-lg"
              style={{ clipPath: "polygon(6% 0, 100% 0, 100% 100%, 0 100%)" }}
            >
              <ImageKitImage
                path="/blue-diamond/pathways/medical-aesthetics.jpg"
                preset="hero"
                role="treatment"
                status="pending"
                alt={{ en: "Physician-led medical aesthetics at Blue Diamond Medical", ar: "التجميل الطبي بإشراف طبي في بلو دايموند الطبية" }}
                locale={locale}
                width={800}
                height={1000}
                preload
                className="h-full w-full"
              />
            </div>
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
            <div data-reveal="start" className="flex flex-col justify-center rounded-lg border border-border p-8">
              <Stethoscope className="size-7 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-h3 font-heading">{dict.home.pathwaysMedicalTitle}</h3>
              <p className="mt-3 text-body text-text-secondary">{dict.home.pathwaysMedicalBody}</p>
              <Link href={href("medical-hub", locale)} className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">
                {copy.finalActions.explorMedical} <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </div>

            <Link
              data-reveal="end"
              href={href("aesthetics-hub", locale)}
              className="group relative isolate flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-lg p-9 text-white"
            >
              <ImageKitImage
                path="/blue-diamond/aesthetics/consultation-room.jpg"
                preset="treatment"
                role="treatment"
                status="pending"
                alt={{ en: "Medical aesthetics consultation room at Blue Diamond Medical", ar: "غرفة استشارات التجميل الطبي في بلو دايموند الطبية" }}
                locale={locale}
                width={900}
                height={700}
                className="absolute inset-0 -z-20 h-full w-full"
              />
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
                <TreatmentCard key={treatment.id} treatment={treatment} locale={locale} concern={concernForTreatment(treatment.id)} size="large" className="lg:col-span-4 lg:row-span-2" />
              ))}
              {treatmentShowcase.slice(1, 3).map((treatment, i) => (
                <TreatmentCard key={treatment.id} treatment={treatment} locale={locale} concern={concernForTreatment(treatment.id)} size="medium" className="lg:col-span-2" delay={i} />
              ))}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-6 lg:grid-cols-5">
                {treatmentShowcase.slice(3).map((treatment, i) => (
                  <TreatmentCard key={treatment.id} treatment={treatment} locale={locale} concern={concernForTreatment(treatment.id)} size="small" delay={i} />
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
          <ConcernExplorer locale={locale} />
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
                <TechnologyCard key={tech.id} technology={tech} locale={locale} number={i + 1} size="large" className="lg:col-span-4" />
              ))}
              <div className="grid gap-6 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1">
                {techShowcase.slice(1, 3).map((tech, i) => (
                  <TechnologyCard key={tech.id} technology={tech} locale={locale} number={i + 2} size="small" delay={i} />
                ))}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:col-span-6 lg:grid-cols-2">
                {techShowcase.slice(3).map((tech, i) => (
                  <TechnologyCard key={tech.id} technology={tech} locale={locale} number={i + 4} size="medium" delay={i} />
                ))}
              </div>
            </div>
          ) : null}
        </Container>
      </section>

      <SectionTransition from="var(--blue-4)" to="var(--background)" />

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
                      path={doctor.image.path}
                      preset="doctor-card"
                      role="doctor"
                      status={doctor.image.status}
                      alt={{ en: `Portrait of ${doctor.name.en}`, ar: `صورة ${doctor.name.ar}` }}
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
                    path={product.images[0]!.path}
                    preset="product"
                    role="product"
                    status={product.images[0]!.status}
                    alt={product.images[0]!.alt}
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
      <section className="section-y bg-surface" style={{ "--text-secondary": "var(--grey-4)" } as React.CSSProperties}>
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div data-reveal="start">
            <p className="text-xs font-semibold tracking-[0.1em] text-primary uppercase">{copy.locationEyebrow}</p>
            <h2 className="mt-3 text-display-2 font-heading lg:text-display-2-lg">{dict.home.locationTitle}</h2>
            <p className="mt-4 text-body-lg text-text-secondary">{dict.home.locationBody}</p>

            <dl className="mt-6 space-y-3 text-body">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <dd>
                  {siteConfig.clinic.address.line1}, {siteConfig.clinic.address.city} {siteConfig.clinic.address.region} {siteConfig.clinic.address.postalCode}
                </dd>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <dd>
                  <a className="ltr-run hover:text-primary" href={`tel:${siteConfig.clinic.phone}`}>
                    {siteConfig.clinic.phoneDisplay}
                  </a>
                </dd>
              </div>
            </dl>

            <div className="mt-4 rounded-md border border-border bg-background px-4 py-3 text-sm">
              <span className="font-medium">{status.label[locale]}</span>
              <span className="mx-2 text-text-secondary">·</span>
              <span className="text-text-secondary">{statutoryHolidayNotice[locale]}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <Button variant="outline" render={<Link href={href("contact", locale)} />}>
                {locale === "ar" ? "الحصول على الاتجاهات" : "Get directions"}
              </Button>
              <Button render={<Link href={`/${locale}${bookingHub.path[locale]}`} />}>{dict.common.bookAppointment}</Button>
            </div>
          </div>

          <div data-reveal="end" className="facet-corner aspect-[4/3] overflow-hidden rounded-lg lg:aspect-auto lg:self-stretch">
            <ImageKitImage
              path="/blue-diamond/clinic/map-placeholder.jpg"
              preset="service"
              role="location"
              status="pending"
              alt={{ en: "Map to Blue Diamond Medical Clinic", ar: "خريطة الوصول إلى عيادة بلو دايموند الطبية" }}
              locale={locale}
              width={800}
              height={600}
              className="h-full w-full"
            />
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
