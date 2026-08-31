import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { cmsAlt } from "@/lib/feelstack/media-slots";
import { MedicalWebPageSchema } from "@/components/shared/schema";
import { FaqPageSchema } from "@/components/shared/schema";
import { getRoute, href } from "@/lib/routing";
import { getTreatment } from "@/features/aesthetics/data/treatments";
import { getConcern } from "@/features/concerns/data";
import { doctors } from "@/features/doctors";
import type { Technology } from "@/features/technologies/types";
import type { Bilingual } from "@/types/common";
import type { Locale } from "@/i18n/config";

const labels = {
  en: {
    manufacturer: "Manufacturer",
    treatments: "Treatments using this technology",
    concerns: "Concerns this technology may help address",
    doctors: "Relevant physicians",
    faqs: "Frequently asked questions",
    steps: {
      whatItIs: "What it is",
      howItWorks: "How it works",
      whatItAddresses: "What it may address",
      appointment: "What the appointment involves",
      safety: "Safety and suitability",
    },
  },
  ar: {
    manufacturer: "الشركة المصنّعة",
    treatments: "علاجات تستخدم هذه التقنية",
    concerns: "المخاوف التي قد تساعد هذه التقنية في معالجتها",
    doctors: "الأطباء المعنيون",
    faqs: "الأسئلة الشائعة",
    steps: {
      whatItIs: "ما هي هذه التقنية",
      howItWorks: "كيف تعمل",
      whatItAddresses: "ما الذي قد تعالجه",
      appointment: "ماذا يتضمن الموعد",
      safety: "السلامة والملاءمة",
    },
  },
};

/**
 * Numbered editorial sequence (01-05) — justified here (not decoration)
 * because the content genuinely is an ordered walkthrough: what a device
 * is, how it works, what it addresses, what a visit involves, then
 * safety. A step is skipped entirely (not rendered as an empty "05") when
 * its content field is undefined, so a technology entry with thinner
 * source material still reads as honest and complete rather than padded.
 */
function NumberedStep({ index, label, body }: { index: number; label: string; body: string }) {
  return (
    <div className="mt-8 flex gap-4 border-t border-border pt-8 first:mt-10 first:border-t-0 first:pt-0">
      {/* Solid --primary, not a low-opacity tint: axe's contrast check
          still evaluates aria-hidden decorative text (aria-hidden only
          exempts it from assistive-tech reading, not from being a
          visually-rendered element sighted low-vision users encounter),
          and text-primary/40 measured below the large-text 3:1 threshold
          — found during this pass's own accessibility run. */}
      <span className="font-heading text-h4 font-normal text-primary" aria-hidden="true">
        {String(index).padStart(2, "0")}
      </span>
      <div>
        <h2 className="text-h4 font-heading">{label}</h2>
        <p className="mt-2 text-body text-text-secondary">{body}</p>
      </div>
    </div>
  );
}

export function TechnologyTemplate({ technology, locale }: { technology: Technology; locale: Locale }) {
  const t = labels[locale];
  const technologiesHub = getRoute("aesthetics-technologies-hub")!;
  const ownRoute = getRoute(`technology-${technology.id}`);
  const relatedTreatments = technology.relatedTreatmentIds.map(getTreatment).filter(Boolean) as NonNullable<ReturnType<typeof getTreatment>>[];
  const relatedConcerns = (technology.relatedConcernIds ?? []).map(getConcern).filter(Boolean) as NonNullable<ReturnType<typeof getConcern>>[];
  const relatedDoctors = doctors.filter((d) => (technology.relatedDoctorIds ?? []).includes(d.id));

  const steps: { label: string; body?: Bilingual }[] = [
    { label: t.steps.howItWorks, body: technology.howItWorks },
    { label: t.steps.whatItAddresses, body: technology.whatItAddresses },
    { label: t.steps.appointment, body: technology.appointmentInvolves },
    { label: t.steps.safety, body: technology.safetyNote },
  ];

  return (
    <>
      {ownRoute ? (
        <MedicalWebPageSchema locale={locale} name={technology.title[locale]} description={technology.summary[locale]} path={ownRoute.path[locale]} />
      ) : null}
      <article className="section-y">
      <Container className="max-w-3xl">
        <Breadcrumbs
          locale={locale}
          items={[{ label: technologiesHub.title[locale], href: href("aesthetics-technologies-hub", locale) }, { label: technology.title[locale] }]}
        />
        <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{technology.title[locale]}</h1>

        {technology.image ? (
          <ImageKitImage
            path={technology.image.path}
            preset="technology"
            role={technology.image.role}
            status={technology.image.status}
            alt={cmsAlt(technology.image) ?? { en: technology.title.en, ar: technology.title.ar }}
            caption={technology.image.caption}
            locale={locale}
            width={technology.image.width}
            height={technology.image.height}
            sizes="(min-width: 768px) 28rem, 100vw"
            className="mt-8 aspect-square max-w-md rounded-lg"
          />
        ) : null}
        {technology.manufacturer ? (
          <p className="mt-2 text-sm text-text-secondary">
            {t.manufacturer}: <span className="font-medium text-text-body">{technology.manufacturer}</span>
          </p>
        ) : null}

        <NumberedStep index={1} label={t.steps.whatItIs} body={technology.summary[locale]} />
        {steps.map((step, i) =>
          step.body ? <NumberedStep key={step.label} index={i + 2} label={step.label} body={step.body[locale]} /> : null,
        )}

        {relatedTreatments.length ? (
          <section className="mt-10 border-t border-border pt-8">
            <h2 className="text-h4 font-heading">{t.treatments}</h2>
            <ul className="mt-3 flex flex-wrap gap-3">
              {relatedTreatments.map((treatment) => {
                const route = getRoute(`treatment-${treatment!.id}`)!;
                return (
                  <li key={treatment!.id}>
                    <Link
                      href={`/${locale}${route.path[locale]}`}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
                    >
                      {treatment!.title[locale]} <ArrowRight className="size-3.5 rtl:rotate-180" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {relatedConcerns.length ? (
          <section className="mt-10">
            <h2 className="text-h4 font-heading">{t.concerns}</h2>
            <ul className="mt-3 flex flex-wrap gap-3">
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
          </section>
        ) : null}

        {relatedDoctors.length ? (
          <section className="mt-10">
            <h2 className="text-h4 font-heading">{t.doctors}</h2>
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

        {technology.faqs?.length ? (
          <section className="mt-10">
            <h2 className="text-h4 font-heading">{t.faqs}</h2>
            <dl className="mt-3 space-y-4">
              {technology.faqs.map((faq) => (
                <div key={faq.question[locale]}>
                  <dt className="font-medium">{faq.question[locale]}</dt>
                  <dd className="mt-1 text-sm text-text-secondary">{faq.answer[locale]}</dd>
                </div>
              ))}
            </dl>
            <FaqPageSchema faqs={technology.faqs} locale={locale} />
          </section>
        ) : null}
      </Container>
      </article>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
