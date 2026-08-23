import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MapPin } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { MedicalWebPageSchema } from "@/components/shared/schema";
import { FaqPageSchema } from "@/components/shared/schema";
import { getBookingUrl } from "@/config/booking";
import { getRoute, href } from "@/lib/routing";
import { getConcern } from "@/features/concerns/data";
import { getTechnology } from "@/features/technologies/data";
import { getTreatment } from "@/features/aesthetics/data/treatments";
import { doctors } from "@/features/doctors";
import type { AestheticTreatment } from "@/features/aesthetics/types";
import type { Locale } from "@/i18n/config";

const labels = {
  en: {
    concernsTreated: "What this treats",
    howItWorks: "How it works",
    treatmentAreas: "Treatment areas",
    preparation: "Preparation",
    comfortLevel: "Comfort level",
    duration: "Duration",
    treatmentDayJourney: "What the appointment involves",
    downtime: "Downtime",
    aftercare: "Aftercare",
    resultTimeline: "When you'll see results",
    suggestedCourse: "Suggested course",
    safety: "Safety & contraindications",
    technology: "Technology used",
    relatedTreatments: "Related treatments",
    relatedConcerns: "Related concerns",
    relatedDoctors: "Relevant physicians",
    faqs: "Frequently asked questions",
    consultCta: "Book a consultation",
  },
  ar: {
    concernsTreated: "ما الذي يعالجه هذا العلاج",
    howItWorks: "كيف يعمل",
    treatmentAreas: "مناطق العلاج",
    preparation: "التحضير",
    comfortLevel: "مستوى الراحة",
    duration: "المدة",
    treatmentDayJourney: "ماذا يتضمن الموعد",
    downtime: "فترة التعافي",
    aftercare: "العناية بعد العلاج",
    resultTimeline: "متى تظهر النتائج",
    suggestedCourse: "البرنامج المقترح",
    safety: "السلامة وموانع الاستخدام",
    technology: "التقنية المستخدمة",
    relatedTreatments: "علاجات ذات صلة",
    relatedConcerns: "مخاوف ذات صلة",
    relatedDoctors: "الأطباء المعنيون",
    faqs: "الأسئلة الشائعة",
    consultCta: "احجز استشارة",
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-h4 font-heading">{title}</h2>
      <div className="mt-2 text-body text-text-secondary">{children}</div>
    </section>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-text-body">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function AestheticTreatmentTemplate({
  treatment,
  locale,
}: {
  treatment: AestheticTreatment;
  locale: Locale;
}) {
  const t = labels[locale];
  const booking = getBookingUrl("aesthetics-consultation");
  const treatmentsHub = getRoute("aesthetics-treatments-hub")!;
  const ownRoute = getRoute(`treatment-${treatment.id}`);
  const relatedTreatments = (treatment.relatedTreatmentIds ?? []).map(getTreatment).filter(Boolean) as AestheticTreatment[];
  const relatedConcerns = (treatment.relatedConcernIds ?? []).map(getConcern).filter(Boolean);
  const relatedTechnologies = (treatment.technologyIds ?? []).map(getTechnology).filter(Boolean);
  const relatedDoctors = doctors.filter((d) => (treatment.relatedDoctorIds ?? []).includes(d.id));

  return (
    <>
      {ownRoute ? (
        <MedicalWebPageSchema locale={locale} name={treatment.title[locale]} description={treatment.summary[locale]} path={ownRoute.path[locale]} />
      ) : null}
      <article className="section-y">
      <Container className="max-w-3xl">
        <Breadcrumbs
          locale={locale}
          items={[
            { label: treatmentsHub.title[locale], href: href("aesthetics-treatments-hub", locale) },
            { label: treatment.title[locale] },
          ]}
        />

        <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{treatment.title[locale]}</h1>
        <p className="mt-4 text-body-lg text-text-secondary">{treatment.summary[locale]}</p>

        {treatment.serviceLocationNote ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <p>{treatment.serviceLocationNote[locale]}</p>
          </div>
        ) : null}

        <Button size="lg" className="mt-8" render={<a href={booking.href} target="_blank" rel="noopener noreferrer" />}>
          {t.consultCta}
        </Button>

        {treatment.whoItsFor ? <Section title={t.concernsTreated}>{treatment.whoItsFor[locale]}</Section> : null}
        {treatment.concernsTreated ? (
          <Section title={t.concernsTreated}>
            <TagList items={treatment.concernsTreated[locale]} />
          </Section>
        ) : null}
        {treatment.howItWorks ? <Section title={t.howItWorks}>{treatment.howItWorks[locale]}</Section> : null}
        {treatment.treatmentAreas ? (
          <Section title={t.treatmentAreas}>
            <TagList items={treatment.treatmentAreas[locale]} />
          </Section>
        ) : null}
        {treatment.preparation ? <Section title={t.preparation}>{treatment.preparation[locale]}</Section> : null}
        {treatment.comfortLevel ? <Section title={t.comfortLevel}>{treatment.comfortLevel[locale]}</Section> : null}
        {treatment.duration ? <Section title={t.duration}>{treatment.duration[locale]}</Section> : null}
        {treatment.treatmentDayJourney ? <Section title={t.treatmentDayJourney}>{treatment.treatmentDayJourney[locale]}</Section> : null}
        {treatment.downtime ? <Section title={t.downtime}>{treatment.downtime[locale]}</Section> : null}
        {treatment.aftercare ? <Section title={t.aftercare}>{treatment.aftercare[locale]}</Section> : null}
        {treatment.resultTimeline ? <Section title={t.resultTimeline}>{treatment.resultTimeline[locale]}</Section> : null}
        {treatment.suggestedCourse ? <Section title={t.suggestedCourse}>{treatment.suggestedCourse[locale]}</Section> : null}
        {treatment.safetyContraindications ? (
          <Section title={t.safety}>
            <ul className="space-y-1.5">
              {treatment.safetyContraindications[locale].map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {relatedTechnologies.length ? (
          <Section title={t.technology}>
            <ul className="flex flex-wrap gap-3">
              {relatedTechnologies.map((tech) => {
                const route = getRoute(`technology-${tech!.id}`)!;
                return (
                  <li key={tech!.id}>
                    <Link
                      href={`/${locale}${route.path[locale]}`}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
                    >
                      {tech!.title[locale]} <ArrowRight className="size-3.5 rtl:rotate-180" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Section>
        ) : null}

        {relatedConcerns.length ? (
          <Section title={t.relatedConcerns}>
            <ul className="flex flex-wrap gap-3">
              {relatedConcerns.map((concern) => {
                const route = getRoute(`concern-${concern!.id}`)!;
                return (
                  <li key={concern!.id}>
                    <Link
                      href={`/${locale}${route.path[locale]}`}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
                    >
                      {concern!.title[locale]} <ArrowRight className="size-3.5 rtl:rotate-180" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Section>
        ) : null}

        {relatedTreatments.length ? (
          <Section title={t.relatedTreatments}>
            <ul className="flex flex-wrap gap-3">
              {relatedTreatments.map((related) => {
                const route = getRoute(`treatment-${related.id}`)!;
                return (
                  <li key={related.id}>
                    <Link
                      href={`/${locale}${route.path[locale]}`}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
                    >
                      {related.title[locale]} <ArrowRight className="size-3.5 rtl:rotate-180" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Section>
        ) : null}

        {relatedDoctors.length ? (
          <Section title={t.relatedDoctors}>
            <ul className="flex flex-wrap gap-3">
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
          </Section>
        ) : null}

        {treatment.faqs?.length ? (
          <Section title={t.faqs}>
            <dl className="space-y-4">
              {treatment.faqs.map((faq) => (
                <div key={faq.question[locale]}>
                  <dt className="font-medium text-text-body">{faq.question[locale]}</dt>
                  <dd className="mt-1 text-sm">{faq.answer[locale]}</dd>
                </div>
              ))}
            </dl>
            <FaqPageSchema faqs={treatment.faqs} locale={locale} />
          </Section>
        ) : null}

      </Container>
      </article>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
