import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { ImageKitImage } from "@/components/media/ImageKitImage";
import { Button } from "@/components/ui/button";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { doctors, getDoctor } from "@/types/doctor";
import { getBookingUrl } from "@/config/booking";
import { siteConfig } from "@/config/site";
import { getRoute, href } from "@/config/routes";

/**
 * Canonical English-slug route for every doctor, in both locales — the
 * pretty Arabic URL (e.g. /ar/الأطباء/محمد-فرحات) is rewritten to this
 * physical path by src/proxy.ts. See docs/EN_AR_ROUTE_MAPPING.md.
 */
export function generateStaticParams() {
  return locales.flatMap((locale) => doctors.map((doctor) => ({ locale, doctorId: doctor.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; doctorId: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, doctorId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const doctor = getDoctor(doctorId);
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
  const doctor = getDoctor(doctorId);
  if (!doctor) notFound();

  const booking = getBookingUrl(doctor.bookingChannel);

  return (
    <>
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
          <h1 className="text-display-1 font-heading lg:text-display-1-lg">{doctor.name[locale]}</h1>
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
        </div>
      </Container>
      </article>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
