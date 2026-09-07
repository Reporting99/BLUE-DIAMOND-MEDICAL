import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageHero } from "@/components/layout/PageHero";
import { MedicalWebPageSchema } from "@/components/shared/schema";
import { FaqPageSchema } from "@/components/shared/schema";
import { getBookingUrl, isBookable } from "@/config/booking";
import { AccessOptions, type AccessAudience } from "@/components/shared/AccessOptions";
import { getRoute, href } from "@/lib/routing";
import { doctors } from "@/features/doctors";
import type { MedicalServiceContent } from "@/features/medical-services/types";
import type { Locale } from "@/i18n/config";

/*
 * CL-032 — `first:mt-0` on every optional sub-section below.
 *
 * These blocks are rendered conditionally, so which one is FIRST differs per
 * service. Whichever it is used to carry a 40px top margin on top of the
 * article's own top padding, which put ~53px between the hero and the first
 * heading on pages like Minor Procedures. `first:mt-0` is `:first-child`, so
 * it follows the rendered DOM rather than the source order and the 40px rhythm
 * BETWEEN sub-sections — internal spacing the client asked to keep — is
 * untouched.
 */
/**
 * Reusable "medical service" page template — brief §26. Renders only the
 * sections that have real source-backed content for a given service; a
 * missing optional field means the section is omitted, never filled with
 * placeholder text. See docs/CONTENT_MODEL.md.
 */
export function MedicalServiceTemplate({
  service,
  locale,
}: {
  service: MedicalServiceContent;
  locale: Locale;
}) {
  const booking = getBookingUrl(service.bookingChannel);
  /**
   * CL-012 / CL-015 / CL-016 — a service marked as provided by every family
   * physician lists the whole current roster, derived rather than authored,
   * so it cannot go stale and no single physician is promoted as the one who
   * provides a general family-medicine service.
   */
  const relatedDoctors =
    service.relatedDoctorScope === "all-family-physicians"
      ? doctors
      : doctors.filter((d) => service.relatedDoctorIds.includes(d.id));
  /**
   * CL-005 / CL-018 — which online channels this service offers. Minor
   * procedures offer none by policy; the eye-screening pathway is its own
   * external channel; everything else is the registered / new-patient pair.
   */
  const accessChannels: { channel: typeof service.bookingChannel; audience: AccessAudience }[] =
    service.bookingChannel === "minor-procedures"
      ? []
      : service.bookingChannel === "family-doctor"
        ? [
            { channel: "family-doctor", audience: "registered" },
            { channel: "walk-in", audience: "new-patient" },
          ]
        : [{ channel: service.bookingChannel, audience: "none" }];
  const medicalRoute = getRoute("medical-hub")!;
  // This template serves both regular medical-service pages and gated
  // medical-Botox condition pages, which live under different route-id
  // prefixes — try both rather than assuming one.
  const ownRoute = getRoute(`medical-${service.id}`) ?? getRoute(`medical-botox-${service.id}`);

  const labels = {
    en: {
      whoItsFor: "Who this is for",
      whatsIncluded: "What's included",
      howAppointmentsWork: "How appointments work",
      relatedDoctors: "Related physicians",
      faqs: "Frequently asked questions",
      book: "Book an appointment",
    },
    ar: {
      whoItsFor: "لمن هذه الخدمة",
      whatsIncluded: "ما الذي تشمله",
      howAppointmentsWork: "كيف تسير المواعيد",
      relatedDoctors: "الأطباء المعنيون",
      faqs: "الأسئلة الشائعة",
      book: "احجز موعدًا",
    },
  }[locale];

  return (
    <>
      {ownRoute ? (
        <MedicalWebPageSchema locale={locale} name={service.title[locale]} description={service.summary[locale]} path={ownRoute.path[locale]} />
      ) : null}
      {/* Hero, with the booking CTA in it. The urgent-care note deliberately
          stays in the page body below: it is a safety instruction about when
          NOT to use this service, and safety copy does not belong laid over a
          photograph competing with a booking button. */}
      <PageHero
        locale={locale}
        title={service.title[locale]}
        body={service.summary[locale]}
        image={service.image}
        imageRole="service"
        seed={service.id}
        measure="article"
        /* CMS alt wins inside PageHero. When the imported asset carries none,
           this falls back to the entity's own title — factual and derived from
           the record the image is assigned to, never a guess about what the
           photograph depicts. */
        imageAlt={{
          en: service.title.en || service.id,
          ar: service.title.ar || service.id,
        }}
        imageCaption={service.image?.caption}
        breadcrumbs={
          <Breadcrumbs
            locale={locale}
            items={[
              { label: medicalRoute.title[locale], href: href("medical-hub", locale) },
              { label: service.title[locale] },
            ]}
          />
        }
        actions={
          isBookable(booking) ? (
            <Button
              size="lg"
              render={
                booking.type === "phone" ? (
                  <a href={booking.href} />
                ) : (
                  <a href={booking.href} target="_blank" rel="noopener noreferrer" />
                )
              }
            >
              {booking.label[locale]}
            </Button>
          ) : null
        }
      />

      <article className="section-y">
      <Container className="max-w-3xl">
        {service.urgentCareNote ? (
          <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive-surface px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>{service.urgentCareNote[locale]}</p>
          </div>
        ) : null}

        {service.whoItsFor ? (
          <section data-reveal="up" className="mt-10 first:mt-0">
            <h2 className="text-h4 font-heading">{labels.whoItsFor}</h2>
            <p className="mt-2 text-body text-text-secondary">{service.whoItsFor[locale]}</p>
          </section>
        ) : null}

        {service.whatsIncluded ? (
          <section data-reveal="up" className="mt-10 first:mt-0">
            <h2 className="text-h4 font-heading">{labels.whatsIncluded}</h2>
            <ul className="mt-3 space-y-2">
              {service.whatsIncluded[locale].map((item) => (
                <li key={item} className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {service.howAppointmentsWork ? (
          <section data-reveal="up" className="mt-10 first:mt-0">
            <h2 className="text-h4 font-heading">{labels.howAppointmentsWork}</h2>
            <p className="mt-2 text-body text-text-secondary">{service.howAppointmentsWork[locale]}</p>
          </section>
        ) : null}

        {service.externalPartners?.length ? (
          <section data-reveal="up" className="mt-10 first:mt-0">
            <ul className="space-y-3">
              {service.externalPartners.map((partner) => (
                <li key={partner.name} className="rounded-md border border-border bg-surface px-4 py-3">
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:text-primary-hover"
                  >
                    {partner.name}
                  </a>
                  <p className="mt-1 text-sm text-text-secondary">{partner.note[locale]}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {relatedDoctors.length ? (
          <section data-reveal="up" className="mt-10 first:mt-0">
            <h2 className="text-h4 font-heading">{labels.relatedDoctors}</h2>
            <ul className="mt-3 flex flex-wrap gap-3">
              {relatedDoctors.map((doctor) => {
                const route = getRoute(doctor.routeId)!;
                return (
                  <li key={doctor.id}>
                    <Link
                      href={`/${locale}${route.path[locale]}`}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
                    >
                      {doctor.name[locale]} <ArrowRight className="size-3.5 rtl:rotate-180" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {/* CL-005 / CL-007 / CL-018 — every service page states all three ways
            in, and which patient type each online route serves. */}
        <AccessOptions locale={locale} className="mt-10 first:mt-0" channels={accessChannels} />

        {service.faqs?.length ? (
          <section data-reveal="up" className="mt-10 first:mt-0">
            <h2 className="text-h4 font-heading">{labels.faqs}</h2>
            <dl className="mt-3 space-y-4">
              {service.faqs.map((faq) => (
                <div key={faq.question[locale]}>
                  <dt className="font-medium">{faq.question[locale]}</dt>
                  <dd className="mt-1 text-sm text-text-secondary">{faq.answer[locale]}</dd>
                </div>
              ))}
            </dl>
            <FaqPageSchema faqs={service.faqs} locale={locale} />
          </section>
        ) : null}

        {service.contactNote ? (
          <p className="mt-10 rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
            {service.contactNote[locale]}
          </p>
        ) : null}

      </Container>
      </article>
      {/* Soften the plain-background → dark-footer boundary, matching the
          homepage's visual-continuity system (docs/UI_UX_FOUNDATION.md).
          Deliberately a sibling of <article>, not its last child: .section-y's
          own padding-bottom would otherwise leave a flat band of
          var(--background) between the gradient and the footer. */}
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
