import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PhysicianSchema } from "@/components/shared/schema/PhysicianSchema";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { doctors, getDoctor } from "@/features/doctors";
import { getBookingUrl } from "@/config/booking";
import { siteConfig } from "@/config/site";
import { getRoute, href } from "@/lib/routing";
import { servicesForDoctor } from "@/lib/seo/entity-graph";
import { resolvePageContent, entityCacheTags } from "@/lib/feelstack/page-resolver";
import { cacheTags } from "@/lib/feelstack/cache-tags";
import { cmsDoctorSchema } from "@/lib/feelstack/schemas";

/**
 * Canonical English-slug route for every doctor, in both locales — the
 * pretty Arabic URL (e.g. /ar/الأطباء/محمد-فرحات) is rewritten to this
 * physical path by src/proxy.ts. See docs/ROUTING.md.
 */
export function generateStaticParams() {
  return locales.flatMap((locale) => doctors.map((doctor) => ({ locale, doctorId: doctor.id })));
}


/**
 * Hybrid FeelStack resolution for this entity type, following the reference
 * pattern in medical/[serviceId]. In the default FEELSTACK_CONTENT_MODE=static
 * this never touches the network: resolvePageContent goes straight to
 * staticFallback(), so behaviour is unchanged from before this pass.
 *
 * The tags are what let the publish webhook invalidate this entry — see
 * entityCacheTags() in page-resolver.ts.
 */
async function loadDoctor(id: string, locale: Locale) {
  const cmsPath = `/doctors/${id}`;
  const resolution = await resolvePageContent({
    path: cmsPath,
    locale,
    schema: cmsDoctorSchema,
    staticFallback: () => getDoctor(id),
    tags: entityCacheTags({
      detail: cacheTags.doctor,
      index: cacheTags.doctorsIndex,
      locale,
      id,
      path: cmsPath,
    }),
  });
  return resolution.source === "not-found" ? undefined : resolution.data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; doctorId: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, doctorId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const doctor = await loadDoctor(doctorId, locale);
  if (!doctor) return {};

  const route = getRoute(doctor.routeId);
  const enUrl = `${siteConfig.url}/en${route?.path.en ?? `/doctors/${doctor.id}`}`;
  // Public Arabic URL uses the pretty slug — proxy.ts rewrites it to this
  // same canonical path internally, but the alternate link must point at
  // the address a visitor/crawler actually sees.
  const arUrl = `${siteConfig.url}/ar${route?.path.ar ?? `/doctors/${doctor.id}`}`;

  return {
    title: doctor.name[locale],
    description: doctor.bio[locale].slice(0, 155),
    alternates: {
      canonical: locale === "ar" ? arUrl : enUrl,
      languages: { "en-CA": enUrl, "ar-CA": arUrl, "x-default": enUrl },
    },
  };
}

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ locale: string; doctorId: string }>;
}) {
  const { locale: rawLocale, doctorId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const doctor = await loadDoctor(doctorId, locale);
  if (!doctor) notFound();

  const booking = getBookingUrl(doctor.bookingChannel);
  const ownRoute = getRoute(doctor.routeId);
  const doctorsHub = getRoute("doctors-index")!;
  // Only services whose own approved content names this doctor — see
  // src/lib/seo/entity-graph.ts. Empty for doctors the source never links,
  // in which case the section is omitted rather than filled.
  const relatedServices = servicesForDoctor(doctor.id);

  const labels = {
    en: { relatedServices: "Services this physician provides" },
    ar: { relatedServices: "الخدمات التي يقدمها هذا الطبيب" },
  }[locale];

  return (
    <>
      {ownRoute ? <PhysicianSchema doctor={doctor} locale={locale} path={ownRoute.path[locale]} /> : null}
      <article className="section-y">
      <Container className="grid gap-10 lg:grid-cols-[5fr_7fr] lg:items-start">
        <div className="facet-corner aspect-[4/5] overflow-hidden rounded-lg lg:sticky lg:top-24">
          <ImageKitImage
            path={doctor.image.path}
            preset="doctor"
            role="doctor"
            status={doctor.image.status}
            alt={{ en: `Portrait of ${doctor.name.en}`, ar: `صورة ${doctor.name.ar}` }}
            locale={locale}
            width={640}
            height={800}
            className="h-full w-full"
          />
        </div>

        <div>
          <Breadcrumbs
            locale={locale}
            items={[
              { label: doctorsHub.title[locale], href: href("doctors-index", locale) },
              { label: doctor.name[locale] },
            ]}
          />

          <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{doctor.name[locale]}</h1>
          <p className="mt-2 text-body-lg text-primary">{doctor.credentials[locale]}</p>
          <p className="mt-6 max-w-2xl text-body-lg text-text-secondary">{doctor.bio[locale]}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" render={<a href={booking.href} target="_blank" rel="noopener noreferrer" />}>
              {booking.label[locale]}
            </Button>
            {doctor.practicesAesthetics ? (
              <Button size="lg" variant="outline" render={<Link href={href("aesthetics-hub", locale)} />}>
                {locale === "ar" ? "خدمات التجميل الطبي" : "Medical aesthetics services"}
              </Button>
            ) : null}
          </div>

          {/* Inverse of MedicalServiceContent.relatedDoctorIds — a real crawlable
              edge back into the medical-service entity cluster (brief §13), using
              the same pill-link treatment the service template already uses for
              its "Related physicians" list so nothing new is introduced visually. */}
          {relatedServices.length ? (
            <section className="mt-10">
              <h2 className="text-h4 font-heading">{labels.relatedServices}</h2>
              <ul className="mt-3 flex flex-wrap gap-3">
                {relatedServices.map((service) => {
                  const route = getRoute(`medical-${service.id}`);
                  if (!route) return null;
                  return (
                    <li key={service.id}>
                      <Link
                        href={`/${locale}${route.path[locale]}`}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
                      >
                        {service.title[locale]} <ArrowRight className="size-3.5 rtl:rotate-180" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      </Container>
      </article>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
