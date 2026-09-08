import type { Metadata } from "next";
import { ArrowUpRight, Phone } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { getBookingUrl, isBookable, type BookingChannel } from "@/config/booking";
import { siteConfig } from "@/config/site";
import { AccessOptions } from "@/components/shared/AccessOptions";
import { NewPatientNotice } from "@/components/shared/NewPatientNotice";

/** Single source for this page's description: consumed by both generateMetadata
 * and the page's JSON-LD node, so the two can never drift apart (brief §9). */
const PAGE_DESCRIPTION = {
      en: "Book with your family doctor, come in as a walk-in, arrange an eye screening, or request a medical aesthetics consultation at Blue Diamond Medical Clinic in Calgary.",
      ar: "احجزوا مع طبيب أسرتكم، أو زيارة بدون موعد، أو فحص العين، أو استشارة تجميل طبي في عيادة بلو دايموند الطبية.",
    } as const;

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageSchema } from "@/components/shared/schema";
import { resolvePageHeroImage } from "@/lib/feelstack/page-hero-media";
import { getRoute } from "@/lib/routing";

const options: { channel: BookingChannel; description: { en: string; ar: string } }[] = [
  {
    channel: "family-doctor",
    description: {
      en: "Registered and current patients — book online with your own family physician.",
      ar: "المرضى المسجّلون والحاليون — احجزوا عبر الإنترنت مع طبيب أسرتكم.",
    },
  },
  {
    channel: "walk-in",
    description: {
      en: "New patients and walk-ins — no standing appointment needed.",
      ar: "المرضى الجدد والزيارات بدون موعد — لا حاجة لموعد مسبق.",
    },
  },
  {
    channel: "eye-screening",
    description: {
      en: "AHS-covered eye disease screening with Euclid Telehealth, on-site once a month.",
      ar: "فحص مجاني لأمراض العين مشمول بالتأمين الصحي مع Euclid Telehealth، في العيادة مرة شهريًا.",
    },
  },
  {
    channel: "aesthetics-consultation",
    description: {
      // CL-008 — provider, duration and destination agree with the CTA label.
      en: "For all aesthetic treatment appointments, book a 20-minute consultation with Dr. Farhat.",
      ar: "تبدأ جميع مواعيد العلاجات التجميلية باستشارة مع الطبيب.",
    },
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("book-appointment", safeLocale, { description: PAGE_DESCRIPTION });
}

export default async function BookAppointmentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const title = locale === "ar" ? "احجز موعدًا" : "Book an Appointment";
  /* The Botox-only phone callout that used to sit here has been removed.
     It presented 825 413 1113 as though it were a Botox booking line, which
     it is not: it is the general medical clinic number. The block below
     states BOTH published lines with what each is actually for, so a visitor
     can tell the medical desk from the aesthetics desk. */
  const contactLines = [
    {
      label: locale === "ar" ? "العيادة الطبية" : "Medical Clinic",
      display: siteConfig.clinic.phoneDisplay,
      href: `tel:${siteConfig.clinic.phone}`,
    },
    {
      label: locale === "ar" ? "عيادة التجميل" : "Aesthetic Clinic",
      display: siteConfig.aesthetics.phoneDisplay,
      href: `tel:${siteConfig.aesthetics.phone}`,
    },
  ];

  const ownRoute = getRoute("book-appointment")!;

  const hero = await resolvePageHeroImage(ownRoute.path.en, locale);

  return (
    <>
      <PageSchema
        locale={locale}
        type="WebPage"
        name={title}
        description={PAGE_DESCRIPTION[locale]}
        path={ownRoute.path[locale]}
      />
      {/* PAGE_DESCRIPTION as the subtitle: this page is a set of booking
          channels, and the sentence the metadata already uses to describe it
          is the one a visitor needs before choosing between them. */}
      <PageHero
        locale={locale}
        title={title}
        body={PAGE_DESCRIPTION[locale]}
        image={hero}
        imageRole="service"
        seed="book-appointment"
        imageAlt={{
          en: "Reception at Blue Diamond Medical Clinic, West Springs",
          ar: "الاستقبال في عيادة بلو دايموند الطبية، ويست سبرينغز",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />}
        size="compact"
      />

      {/* CL-002 — the availability ticker, in the same place as on Home and
          Medical Care: a full-bleed strip directly under the hero. This is the
          page whose whole job is getting an appointment, so the walk-in fact
          and the booking line belong above the channel cards, not below. */}
      <NewPatientNotice locale={locale} />

      <section className="section-y">
      <Container>
        <div className="grid gap-6 sm:grid-cols-2">
          {/* CL-007 — a channel whose online URL has not been supplied is not
              drawn as a card that goes nowhere. The "How to book" block below
              carries its phone and in-person route instead. */}
          {options.map((option, i) => {
            const booking = getBookingUrl(option.channel);
            if (!isBookable(booking)) return null;
            return (
              <a
                key={option.channel}
                data-reveal="up"
                data-reveal-delay={String(i % 2)}
                href={booking.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-lg border border-border bg-surface p-6 transition-[border-color,box-shadow] duration-[var(--motion-normal)] ease-[var(--motion-ease)] hover:border-primary hover:shadow-[0_10px_30px_rgba(29,86,120,0.10)]"
              >
                <div>
                  <h2 className="text-h4 font-heading">{booking.label[locale]}</h2>
                  <p className="mt-2 text-sm text-text-secondary">{option.description[locale]}</p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {booking.label[locale]} <ArrowUpRight className="size-4" />
                </span>
              </a>
            );
          })}
        </div>

        {/* CL-005 — online, by phone, and in person, all three stated on the
            page whose job is to explain how to get an appointment. */}
        <AccessOptions
          locale={locale}
          className="mt-8"
          channels={[
            { channel: "family-doctor", audience: "registered" },
            { channel: "walk-in", audience: "new-patient" },
            { channel: "aesthetics-consultation", audience: "aesthetics" },
          ]}
        />

        {/* Both published lines, each named for what it answers. Same card
            shell, same spacing and icon as the block it replaces — this is a
            content correction, not a layout change. */}
        <div data-reveal="up" className="mt-8 flex items-start gap-3 rounded-lg border border-border bg-surface p-6">
          <Phone className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-10">
            {contactLines.map((line) => (
              <div key={line.label}>
                <p className="text-sm text-text-secondary">{line.label}</p>
                <a href={line.href} className="ltr-run font-medium text-primary hover:text-primary-hover">
                  {line.display}
                </a>
              </div>
            ))}
          </div>
        </div>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
