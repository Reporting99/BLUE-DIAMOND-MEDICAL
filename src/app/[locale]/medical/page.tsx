import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { MediaCard } from "@/components/shared/MediaCard";
import { Button } from "@/components/ui/button";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { getBookingUrl, isBookable } from "@/config/booking";
import { NewPatientNotice } from "@/components/shared/NewPatientNotice";
import { AccessOptions } from "@/components/shared/AccessOptions";
import { ScrollCue } from "@/components/layout/ScrollCue";
import { getRoute, href } from "@/lib/routing";
import { medicalServices } from "@/features/medical-services";
import { resolveListingMedia } from "@/lib/feelstack/listing-media";
import { approvedManifestAsset } from "@/lib/media/image-manifest";
import { heroFromListing } from "@/lib/feelstack/page-hero-media";
import { cacheTags } from "@/lib/feelstack/cache-tags";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageSchema } from "@/components/shared/schema";
import { siteConfig } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("medical-hub", safeLocale, {
    description: {
      en: "Family medicine and walk-in care at Blue Diamond Medical Clinic in West Springs, Calgary. Explore medical services and appointment options.",
      ar: "طب الأسرة، والرعاية بدون موعد، والخدمات المشمولة بالتأمين الصحي في عيادة بلو دايموند الطبية في ويست سبرينغز، كالغاري.",
    },
  });
}

export default async function MedicalHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  // CL-006 — registered/current patients go to the clinic's own tokenized
  // Mikata link. CL-007 — new patients and walk-ins go to the clinic's own
  // Skip the Waiting Room queue, supplied 2026-09-06. Both are labelled by
  // patient type in the hero, and the "How to book" block below still carries
  // the phone and in-person routes for anyone who would rather not book
  // online. `isBookable` still guards the walk-in button so that clearing the
  // URL in booking.ts removes it everywhere rather than leaving a dead link.
  const registered = getBookingUrl("family-doctor");
  const walkIn = getBookingUrl("walk-in");
  const eye = getBookingUrl("eye-screening");
  const uninsuredRoute = getRoute("medical-uninsured-services")!;
  const botoxRoute = getRoute("botox-hub")!;

  const copy = {
    en: {
      title: "Medical Care",
      intro:
        "Male and female family physicians, accepting new patients and walk-ins. We provide comprehensive AHS-insured family medicine, along with a listed set of uninsured services and forms.",
      servicesHeading: "Explore our services",
      uninsuredCta: "View uninsured service fees",
      registeredCta: "Book with your doctor",
      walkInCta: "Book as a new or walk-in patient",
      eyeCta: "Book your eye screening",
    },
    ar: {
      title: "الرعاية الطبية",
      intro:
        "أطباء وطبيبات أسرة يستقبلون مرضى جددًا وحالات بدون موعد مسبق، ويقدّمون رعاية طب أسرة شاملة مشمولة بالتأمين الصحي، إلى جانب قائمة محددة من الخدمات والنماذج غير المشمولة.",
      servicesHeading: "تصفّح خدماتنا",
      uninsuredCta: "عرض رسوم الخدمات غير المشمولة",
      registeredCta: "احجز مع طبيبك",
      walkInCta: "احجز كمريض جديد أو بدون موعد",
      eyeCta: "احجز فحص العين",
    },
  }[locale];

  const ownRoute = getRoute("medical-hub")!;

  // One batch for this page's own hero and for every service card on it. The
  // hub used to render bordered text boxes for services whose detail pages one
  // click away show a real photograph -- the same listing/detail split closed
  // on /doctors and /shop, here at hub scale.
  const media = await resolveListingMedia(
    [
      { id: "page", englishPath: "/medical", routeKind: "page" as const },
      ...medicalServices.map((s) => ({ id: `service:${s.id}`, englishPath: `/medical/${s.id}` })),
    ],
    locale,
    [cacheTags.medicalServicesIndex(process.env.FEELSTACK_SITE_KEY ?? "", locale)],
  );
  const hero = heroFromListing(media);
  const detailsLabel = locale === "ar" ? "التفاصيل" : "Details";
  const serviceImage = (id: string) =>
    (media[`service:${id}`] ?? []).find((m) => m.slot === "hero" || m.slot === "card");

  // Built from the same array the grid below maps over, so the structured
  // list can never drift from what is visibly rendered.
  const listItems = medicalServices.map((s) => ({ name: s.title[locale], url: `${siteConfig.url}/${locale}${getRoute(`medical-${s.id}`)!.path[locale]}` }));

  return (
    <>
      <PageSchema
        locale={locale}
        name={copy.title}
        description={copy.intro}
        path={ownRoute.path[locale]}
        items={listItems}
      />
      <PageHero
        locale={locale}
        title={copy.title}
        body={copy.intro}
        image={hero}
        imageRole="service"
        seed="medical-hub"
        imageAlt={{
          en: "A family physician with a patient in a consultation room at Blue Diamond Medical",
          ar: "طبيب أسرة مع مريض في غرفة الاستشارات في بلو دايموند الطبية",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />}
        actions={
          <>
            <Button size="lg" render={<a href={registered.href!} target="_blank" rel="noopener noreferrer" />}>
              {copy.registeredCta}
            </Button>
            {/* CL-007 — the walk-in queue, offered here because this CTA says
                explicitly which patient type it is for. A generic "Book" button
                still goes to the booking page, where the routes are separated. */}
            {isBookable(walkIn) ? (
              <Button size="lg" render={<a href={walkIn.href} target="_blank" rel="noopener noreferrer" />}>
                {copy.walkInCta}
              </Button>
            ) : null}
            <Button size="lg" variant="outline" render={<a href={eye.href!} target="_blank" rel="noopener noreferrer" />}>
              {copy.eyeCta}
            </Button>
          </>
        }
      >
        {/* CL-003 — the services grid begins immediately below this hero; the
            cue says so rather than letting the hero read as the whole page. */}
        {/* CL-032 — the cue sits close under the notice instead of reserving a
            band of its own; the services grid now starts immediately below. */}
        <ScrollCue locale={locale} className="mt-3" />
      </PageHero>

      {/* CL-002 — the availability ticker, in the same place as on Home: a
          full-bleed strip directly under the hero rather than a block inside
          the hero's content column, so the two pages read identically. */}
      <NewPatientNotice locale={locale} />

      <SectionTransition from="var(--background)" to="var(--surface)" />
      <section className="section-y bg-surface">
        <Container>
          <h2 data-reveal="up" className="text-display-2 font-heading">{copy.servicesHeading}</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {medicalServices.map((service, i) => {
              const route = getRoute(`medical-${service.id}`)!;
              return (
                <MediaCard
                  key={service.id}
                  href={`/${locale}${route.path[locale]}`}
                  title={service.title[locale]}
                  summary={service.summary[locale]}
                  image={serviceImage(service.id)}
                  imageRole="service"
                  preset="service"
                  seed={service.id}
                  imageAlt={{
                    en: `${service.title.en} at Blue Diamond Medical`,
                    ar: `${service.title.ar} في بلو دايموند الطبية`,
                  }}
                  locale={locale}
                  ctaLabel={detailsLabel}
                  delay={i % 3}
                />
              );
            })}

            {/* Botox and Uninsured Services are the two cards on this hub that
                no CMS entity backs: neither `/botox` nor
                `/medical/uninsured-services` has a publishable entry in the
                Blue Diamond project, so `serviceImage` above has nothing to
                return for them and the batch above cannot ask. Their artwork
                is inventoried in image-manifest.ts instead, behind the same
                approval gate — see docs/MEDIA.md. */}
            <MediaCard
              href={`/${locale}${botoxRoute.path[locale]}`}
              title={botoxRoute.title[locale]}
              summary={
                locale === "ar"
                  ? "بعض إجراءات البوتوكس الطبي مشمولة بالتأمين الصحي — بما في ذلك الشقيقة وصرير الأسنان والتعرق الزائد."
                  : "Medical Botox consultations are available for migraine, bruxism and hyperhidrosis. Ask the clinic to confirm coverage and any fees."
              }
              image={approvedManifestAsset("medical-botox-card")}
              imageRole="treatment"
              seed="medical-botox"
              imageAlt={{
                en: "Medical Botox treatment room at Blue Diamond Medical",
                ar: "غرفة علاج البوتوكس الطبي في بلو دايموند الطبية",
              }}
              locale={locale}
              ctaLabel={detailsLabel}
              delay={medicalServices.length % 3}
            />

            {/* The fee schedule was reachable only from a text link further
                down the page, which put it below every service it sits
                alongside. The summary is the destination page's own approved
                opening sentence, verbatim -- no new copy, and the link below
                is left where it is. */}
            <MediaCard
              href={`/${locale}${uninsuredRoute.path[locale]}`}
              title={uninsuredRoute.title[locale]}
              summary={
                locale === "ar"
                  ? "عدد من الخدمات التي يقدمها طبيب أسرتكم غير مشمولة بالتأمين الصحي لألبرتا. يجب سداد جميع الرسوم كاملة قبل تسليم المستندات."
                  : "Some services your family doctor provides are not covered by the Alberta Health Care Insurance Plan (AHCIP). All fees must be paid in full before documents are released."
              }
              image={approvedManifestAsset("medical-service-uninsured-services")}
              imageRole="service"
              preset="service"
              seed="medical-uninsured-services"
              imageAlt={{
                en: "Editorial image of a physician reviewing an administrative medical form with a patient",
                ar: "صورة تحريرية لطبيبة تراجع نموذجاً طبياً إدارياً مع مريضة",
              }}
              locale={locale}
              ctaLabel={detailsLabel}
              delay={(medicalServices.length + 1) % 3}
            />
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--surface)" to="var(--background)" />
      <section className="section-y">
        <Container>
          <Link
            data-reveal="up"
            href={`/${locale}${uninsuredRoute.path[locale]}`}
            className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover"
          >
            {copy.uninsuredCta} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
          <br />
          <Link data-reveal="up" href={href("doctors-index", locale)} className="mt-3 inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover">
            {locale === "ar" ? "تعرّف على فريقنا الطبي" : "Meet our physicians"} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>

          {/* CL-005 — online, by phone, and in person, with the registered vs
              new-patient/walk-in distinction stated explicitly. */}
          <AccessOptions
            locale={locale}
            className="mt-10 first:mt-0"
            channels={[
              { channel: "family-doctor", audience: "registered" },
              { channel: "walk-in", audience: "new-patient" },
              { channel: "eye-screening", audience: "none" },
            ]}
          />
        </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
