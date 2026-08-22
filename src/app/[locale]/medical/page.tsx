import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { getBookingUrl } from "@/config/booking";
import { getRoute, href } from "@/config/routes";
import { medicalServices } from "@/content/medical-services";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { PageSchema } from "@/components/seo/PageSchema";
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
      <section className="section-y">
        <Container>
          <Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />

          <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{copy.title}</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-text-secondary">{copy.intro}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" render={<a href={walkIn.href} target="_blank" rel="noopener noreferrer" />}>
              {copy.walkInCta}
            </Button>
            <Button size="lg" variant="outline" render={<a href={eye.href} target="_blank" rel="noopener noreferrer" />}>
              {copy.eyeCta}
            </Button>
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--background)" to="var(--surface)" />
      <section className="section-y bg-surface">
        <Container>
          <h2 className="text-display-2 font-heading">{copy.servicesHeading}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {medicalServices.map((service) => {
              const route = getRoute(`medical-${service.id}`)!;
              return (
                <Link
                  key={service.id}
                  href={`/${locale}${route.path[locale]}`}
                  className="group flex flex-col justify-between rounded-lg border border-border bg-background p-5 transition-colors hover:border-primary"
                >
                  <div>
                    <h3 className="font-heading text-h4">{service.title[locale]}</h3>
                    <p className="mt-2 text-sm text-text-secondary">{service.summary[locale]}</p>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {locale === "ar" ? "التفاصيل" : "Details"} <ArrowRight className="size-3.5 rtl:rotate-180" />
                  </span>
                </Link>
              );
            })}

            <Link
              href={`/${locale}${botoxRoute.path[locale]}`}
              className="group flex flex-col justify-between rounded-lg border border-border bg-background p-5 transition-colors hover:border-primary"
            >
              <div>
                <h3 className="font-heading text-h4">{botoxRoute.title[locale]}</h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {locale === "ar"
                    ? "بعض إجراءات البوتوكس الطبي مشمولة بالتأمين الصحي — بما في ذلك الشقيقة وصرير الأسنان والتعرق الزائد."
                    : "Some medical Botox procedures are AHS-insured — including migraine, bruxism, and hyperhidrosis."}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                {locale === "ar" ? "التفاصيل" : "Details"} <ArrowRight className="size-3.5 rtl:rotate-180" />
              </span>
            </Link>
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--surface)" to="var(--background)" />
      <section className="section-y">
        <Container>
          <h2 className="text-display-2 font-heading">{copy.otherHeading}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherInsuredServices[locale].map((item) => (
              <li key={item} className="rounded-md border border-border bg-surface px-4 py-3 text-sm">
                {item}
              </li>
            ))}
          </ul>

          <Link
            href={`/${locale}${uninsuredRoute.path[locale]}`}
            className="mt-8 inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover"
          >
            {copy.uninsuredCta} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
          <br />
          <Link href={href("doctors-index", locale)} className="mt-3 inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover">
            {locale === "ar" ? "تعرّف على فريقنا الطبي" : "Meet our physicians"} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
