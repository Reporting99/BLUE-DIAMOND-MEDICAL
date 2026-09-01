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
import { getBookingUrl } from "@/config/booking";
import { getRoute, href } from "@/lib/routing";
import { medicalServices } from "@/features/medical-services";
import { resolveListingMedia } from "@/lib/feelstack/listing-media";
import { heroFromListing } from "@/lib/feelstack/page-hero-media";
import { cacheTags } from "@/lib/feelstack/cache-tags";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageSchema } from "@/components/shared/schema";
import { siteConfig } from "@/config/site";

/** AHS-insured services with no dedicated page yet — listed plainly, no fabricated detail. */
const otherInsuredServices = {
  en: ["General Family Medicine", "Vaccination", "Onsite Paediatrician", "Mental Health", "Women's Health"],
  ar: ["طب الأسرة العام", "التطعيمات", "طبيب أطفال في العيادة", "الصحة النفسية", "صحة المرأة"],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("medical-hub", safeLocale, {
    description: {
      en: "Family medicine, walk-in care, and AHS-insured services at Blue Diamond Medical Clinic in West Springs, Calgary.",
      ar: "طب الأسرة، والرعاية بدون موعد، والخدمات المشمولة بالتأمين الصحي في عيادة بلو دايموند الطبية في ويست سبرينغز، كالغاري.",
    },
  });
}

export default async function MedicalHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const walkIn = getBookingUrl("walk-in");
  const eye = getBookingUrl("eye-screening");
  const uninsuredRoute = getRoute("medical-uninsured-services")!;
  const botoxRoute = getRoute("botox-hub")!;

  const copy = {
    en: {
      title: "Medical Care",
      intro:
        "Male and female family physicians accepting new patients and walk-ins, offering comprehensive AHS-insured family medicine alongside a defined list of uninsured services and forms.",
      servicesHeading: "Explore our services",
      otherHeading: "Also included in AHS-insured family medicine",
      uninsuredCta: "View uninsured service fees",
      walkInCta: "Book a walk-in or new-patient visit",
      eyeCta: "Book your eye screening",
    },
    ar: {
      title: "الرعاية الطبية",
      intro:
        "أطباء وطبيبات أسرة يستقبلون مرضى جددًا وحالات بدون موعد مسبق، ويقدّمون رعاية طب أسرة شاملة مشمولة بالتأمين الصحي، إلى جانب قائمة محددة من الخدمات والنماذج غير المشمولة.",
      servicesHeading: "تصفّح خدماتنا",
      otherHeading: "خدمات إضافية ضمن طب الأسرة المشمول بالتأمين الصحي",
      uninsuredCta: "عرض رسوم الخدمات غير المشمولة",
      walkInCta: "احجز زيارة بدون موعد أو كمريض جديد",
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
      { id: "page", englishPath: "/medical" },
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
            <Button size="lg" render={<a href={walkIn.href} target="_blank" rel="noopener noreferrer" />}>
              {copy.walkInCta}
            </Button>
            <Button size="lg" variant="outline" render={<a href={eye.href} target="_blank" rel="noopener noreferrer" />}>
              {copy.eyeCta}
            </Button>
          </>
        }
      />

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

            <MediaCard
              href={`/${locale}${botoxRoute.path[locale]}`}
              title={botoxRoute.title[locale]}
              summary={
                locale === "ar"
                  ? "بعض إجراءات البوتوكس الطبي مشمولة بالتأمين الصحي — بما في ذلك الشقيقة وصرير الأسنان والتعرق الزائد."
                  : "Some medical Botox procedures are AHS-insured — including migraine, bruxism, and hyperhidrosis."
              }
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
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--surface)" to="var(--background)" />
      <section className="section-y">
        <Container>
          <h2 data-reveal="up" className="text-display-2 font-heading">{copy.otherHeading}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherInsuredServices[locale].map((item, i) => (
              <li key={item} data-reveal="up" data-reveal-delay={String(i % 3)} className="rounded-md border border-border bg-surface px-4 py-3 text-sm">
                {item}
              </li>
            ))}
          </ul>

          <Link
            data-reveal="up"
            href={`/${locale}${uninsuredRoute.path[locale]}`}
            className="mt-8 inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover"
          >
            {copy.uninsuredCta} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
          <br />
          <Link data-reveal="up" href={href("doctors-index", locale)} className="mt-3 inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover">
            {locale === "ar" ? "تعرّف على فريقنا الطبي" : "Meet our physicians"} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
