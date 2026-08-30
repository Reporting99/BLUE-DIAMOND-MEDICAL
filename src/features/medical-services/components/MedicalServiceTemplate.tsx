import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { cmsAlt } from "@/lib/feelstack/media-slots";
import { MedicalWebPageSchema } from "@/components/shared/schema";
import { FaqPageSchema } from "@/components/shared/schema";
import { getBookingUrl } from "@/config/booking";
import { getRoute, href } from "@/lib/routing";
import { doctors } from "@/features/doctors";
import type { MedicalServiceContent } from "@/features/medical-services/types";
import type { Locale } from "@/i18n/config";

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
  const relatedDoctors = doctors.filter((d) => service.relatedDoctorIds.includes(d.id));
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
      <article className="section-y">
      <Container className="max-w-3xl">
        <Breadcrumbs
          locale={locale}
          items={[
            { label: medicalRoute.title[locale], href: href("medical-hub", locale) },
            { label: service.title[locale] },
          ]}
        />

        <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{service.title[locale]}</h1>
        <p className="mt-4 text-body-lg text-text-secondary">{service.summary[locale]}</p>

        {/* Lead image, present only when this service has a real FeelStack
            media assignment. Rendered through the single ImageKitImage entry
            point, which still decides on the asset's own status whether real
            bytes or the FacetTile placeholder appear. */}
        {service.image ? (
          <ImageKitImage
            path={service.image.path}
            preset="service"
            role={service.image.role}
            status={service.image.status}
            // CMS alt wins. When the imported asset carries none, fall back to
            // the entity's own title — factual and derived from the record this
            // image is assigned to, never a guess about the photograph.
            alt={
              cmsAlt(service.image) ?? {
                en: service.title.en || service.id,
                ar: service.title.ar || service.id,
              }
            }
            caption={service.image.caption}
            locale={locale}
            width={service.image.width}
            height={service.image.height}
            sizes="(min-width: 768px) 48rem, 100vw"
            className="mt-8 aspect-video rounded-lg"
          />
        ) : null}

        {service.urgentCareNote ? (
          <div className="mt-6 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive-surface px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>{service.urgentCareNote[locale]}</p>
          </div>
        ) : null}

        <Button size="lg" className="mt-8" render={<a href={booking.href} target="_blank" rel="noopener noreferrer" />}>
          {booking.label[locale]}
        </Button>

        {service.whoItsFor ? (
          <section className="mt-10">
            <h2 className="text-h4 font-heading">{labels.whoItsFor}</h2>
            <p className="mt-2 text-body text-text-secondary">{service.whoItsFor[locale]}</p>
          </section>
        ) : null}

        {service.whatsIncluded ? (
          <section className="mt-10">
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
          <section className="mt-10">
            <h2 className="text-h4 font-heading">{labels.howAppointmentsWork}</h2>
            <p className="mt-2 text-body text-text-secondary">{service.howAppointmentsWork[locale]}</p>
          </section>
        ) : null}

        {service.externalPartners?.length ? (
          <section className="mt-10">
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
          <section className="mt-10">
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

        {service.faqs?.length ? (
          <section className="mt-10">
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
