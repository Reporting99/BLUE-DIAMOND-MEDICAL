import type { Metadata } from "next";
import { ArrowUpRight, Phone } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { getBookingUrl, type BookingChannel } from "@/config/booking";

/** Single source for this page's description: consumed by both generateMetadata
 * and the page's JSON-LD node, so the two can never drift apart (brief §9). */
const PAGE_DESCRIPTION = {
      en: "Book with your family doctor, a walk-in visit, an eye screening, or a medical aesthetics consultation at Blue Diamond Medical Clinic.",
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
      en: "Book with your registered family physician for a follow-up or ongoing care.",
      ar: "احجز مع طبيب أسرتك المسجَّل لمتابعة أو رعاية مستمرة.",
    },
  },
  {
    channel: "walk-in",
    description: {
      en: "New to the clinic, or need to be seen without a standing appointment.",
      ar: "جديد على العيادة، أو تحتاج لزيارة بدون موعد مسبق.",
    },
  },
  {
    channel: "eye-screening",
    description: {
      en: "Free, AHS-covered eye disease screening with Euclid Telehealth, on-site once a month.",
      ar: "فحص مجاني لأمراض العين مشمول بالتأمين الصحي مع Euclid Telehealth، في العيادة مرة شهريًا.",
    },
  },
  {
    channel: "aesthetics-consultation",
    description: {
      en: "Start with a physician consultation for any medical aesthetics treatment.",
      ar: "ابدأوا باستشارة طبية لأي علاج تجميل طبي.",
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
  const botoxNote =
    locale === "ar"
      ? "لحجز البوتوكس الطبي (الشقيقة، صرير الأسنان، التعرق الزائد)، يرجى الاتصال بنا مباشرة."
      : "To book medical Botox (migraine, bruxism, hyperhidrosis), please call us directly.";
  const botoxPhone = getBookingUrl("phone-medical-botox");

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

      <section className="section-y">
      <Container>
        <div className="grid gap-6 sm:grid-cols-2">
          {options.map((option, i) => {
            const booking = getBookingUrl(option.channel);
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

        <div data-reveal="up" className="mt-8 flex items-center gap-3 rounded-lg border border-border bg-surface p-6">
          <Phone className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm">{botoxNote}</p>
            <a href={botoxPhone.href} className="ltr-run font-medium text-primary hover:text-primary-hover">
              825 413 1113
            </a>
          </div>
        </div>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
