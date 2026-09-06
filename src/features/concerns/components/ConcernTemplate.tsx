import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { AestheticsHero } from "@/features/aesthetics/components/AestheticsHero";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { MedicalWebPageSchema } from "@/components/shared/schema";
import { FaqPageSchema } from "@/components/shared/schema";
import { getBookingUrl } from "@/config/booking";
import { getRoute, href } from "@/lib/routing";
import { getConcern } from "@/features/concerns/data";
import {
  getTreatmentsForConcern,
  getTechnologiesForConcern,
  getBeforeAfterPairsForConcernPage,
  getDeviceForConcernResults,
} from "@/features/concerns/queries";
import { ConcernResults } from "./ConcernResults";
import { doctors } from "@/features/doctors";
import type { AestheticConcern } from "@/features/concerns/types";
import type { AestheticTreatment } from "@/features/aesthetics/types";
import type { Bilingual } from "@/types/common";
import type { ImageKitAsset } from "@/types/media";
import type { Locale } from "@/i18n/config";

const labels = {
  en: {
    presentations: "How this may appear",
    factors: "Contributing factors",
    treatmentOptions: "Treatment options at Blue Diamond",
    treatmentOptionsIntro:
      "Which of these is right for you is decided at your consultation, by a physician, after assessing your skin — this page is a starting point, not a diagnosis.",
    readMore: "Read the full treatment page",
    relatedTechnologies: "Relevant technologies",
    whatToExpect: "What to expect",
    relatedConcerns: "Related concerns",
    relatedDoctors: "Relevant physicians",
    faqs: "Frequently asked questions",
    consultCta: "Book a consultation",
    consultHeading: "Not sure which option fits?",
    where: "Where this is performed",
    expect: {
      duration: "How long a session takes",
      treatmentDayJourney: "On the day",
      comfortLevel: "How it feels",
      preparation: "Before your appointment",
      downtime: "Downtime",
      aftercare: "Aftercare",
      resultTimeline: "Results",
      suggestedCourse: "Suggested course",
    },
  },
  ar: {
    presentations: "كيف قد تظهر",
    factors: "العوامل المساهمة",
    treatmentOptions: "خيارات العلاج في بلو دايموند",
    treatmentOptionsIntro:
      "يُحدَّد الخيار المناسب لكم خلال الاستشارة، من قبل الطبيب وبعد تقييم بشرتكم — هذه الصفحة نقطة بداية وليست تشخيصًا.",
    readMore: "اطّلعوا على صفحة العلاج كاملة",
    relatedTechnologies: "التقنيات ذات الصلة",
    whatToExpect: "ما الذي يمكن توقعه",
    relatedConcerns: "مخاوف ذات صلة",
    relatedDoctors: "الأطباء المعنيون",
    faqs: "الأسئلة الشائعة",
    consultCta: "احجز استشارة",
    consultHeading: "غير متأكدين من الخيار المناسب؟",
    where: "أين يُجرى هذا العلاج",
    expect: {
      duration: "مدة الجلسة",
      treatmentDayJourney: "في يوم العلاج",
      comfortLevel: "الإحساس أثناء العلاج",
      preparation: "قبل الموعد",
      downtime: "فترة التعافي",
      aftercare: "العناية بعد العلاج",
      resultTimeline: "النتائج",
      suggestedCourse: "عدد الجلسات المقترح",
    },
  },
};

/**
 * The fields that answer "what will this actually be like", and the order a
 * visitor wants them in: before the appointment, during it, after it.
 *
 * Every one is authored per treatment from approved source content. A
 * treatment that says nothing about, say, downtime simply contributes no
 * downtime row — the section shrinks rather than being filled in.
 */
const EXPECT_FIELDS = [
  "preparation",
  "duration",
  "treatmentDayJourney",
  "comfortLevel",
  "downtime",
  "aftercare",
  "resultTimeline",
  "suggestedCourse",
] as const;

function CrossLinkList<T extends { title: { en: string; ar: string } }>({
  items,
  getHref,
  locale,
}: {
  items: T[];
  getHref: (item: T) => string;
  locale: Locale;
}) {
  return (
    <ul className="mt-3 flex flex-wrap gap-3">
      {items.map((item) => (
        <li key={item.title.en}>
          <Link
            href={getHref(item)}
            className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
          >
            {item.title[locale]} <ArrowRight className="size-3.5 rtl:rotate-180" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * One treatment option, as a card rather than a bare link.
 *
 * This is where the old standalone treatment pages surface. Those pages left
 * the navigation when Aesthetics became concern-first, and a visitor who
 * arrives at "Acne Scars" should not have to click through to a device page to
 * find out what the device is for — so each option carries its own approved
 * summary and mechanism here, and links onward for the full detail rather than
 * replacing it.
 */
function TreatmentOptionCard({ treatment, locale }: { treatment: AestheticTreatment; locale: Locale }) {
  const t = labels[locale];
  const route = getRoute(`treatment-${treatment.id}`);
  const body: Bilingual | undefined = treatment.howItWorks ?? treatment.whoItsFor;

  return (
    <li className="rounded-lg border border-border p-6">
      <h3 className="font-heading text-h4">{treatment.title[locale]}</h3>
      <p className="mt-2 text-body text-text-secondary">{treatment.summary[locale]}</p>
      {body ? <p className="mt-3 text-sm text-text-secondary">{body[locale]}</p> : null}
      {/* Never let a concern page imply every treatment happens at West
          Springs — Elite iQ™ does not. */}
      {treatment.serviceLocationNote ? (
        <p className="mt-3 text-sm text-text-secondary">
          <span className="font-medium text-text-primary">{t.where}: </span>
          {treatment.serviceLocationNote[locale]}
        </p>
      ) : null}
      {route ? (
        <Link
          href={`/${locale}${route.path[locale]}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
        >
          {t.readMore} <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
        </Link>
      ) : null}
    </li>
  );
}

export function ConcernTemplate({
  concern,
  locale,
  technologyImages = {},
}: {
  concern: AestheticConcern;
  locale: Locale;
  /** CMS device photography, keyed by technology id — see features/technologies/media.ts. */
  technologyImages?: Record<string, ImageKitAsset>;
}) {
  const t = labels[locale];
  const booking = getBookingUrl("aesthetics-consultation");
  const treatmentsHub = getRoute("aesthetics-treatments-hub")!;
  const ownRoute = getRoute(`concern-${concern.id}`);

  /**
   * PATIENT PROBLEM -> TREATMENT OPTIONS -> TECHNOLOGY, all three steps
   * resolved in one place (features/concerns/queries.ts) so this page, the
   * Treatments menu and the Treatments hub cannot disagree about which
   * treatments belong to a concern. Nothing here infers an indication: an
   * option appears only where the approved content already names the pair.
   */
  const relatedTreatments = getTreatmentsForConcern(concern.id);
  const relatedTechnologies = getTechnologiesForConcern(concern.id);
  const relatedConcerns = (concern.relatedConcernIds ?? []).map(getConcern).filter(Boolean) as AestheticConcern[];
  const relatedDoctors = doctors.filter((d) => (concern.relatedDoctorIds ?? []).includes(d.id));

  /* The page's closing section — up to three comparisons plus the device they
     were performed with. Assembled here rather than inside the section so the
     device is chosen from the pairs that will actually render. */
  const resultPairs = getBeforeAfterPairsForConcernPage(concern.id);
  const resultsDevice = getDeviceForConcernResults(concern.id, resultPairs);

  /* "What to expect" is assembled from the treatment options already listed
     above — the approved practical detail those pages carry, brought to the
     page the visitor actually landed on. Grouped by treatment rather than
     merged, because 30 minutes for one device is not 30 minutes for another
     and a merged list would read as a claim about the concern itself. */
  const expectations = relatedTreatments
    .map((treatment) => ({
      treatment,
      rows: EXPECT_FIELDS.flatMap((field) => {
        const value = treatment[field];
        return value ? [{ field, label: t.expect[field], value: value[locale] }] : [];
      }),
    }))
    .filter((group) => group.rows.length > 0);

  return (
    <>
      {ownRoute ? (
        <MedicalWebPageSchema locale={locale} name={concern.title[locale]} description={concern.summary[locale]} path={ownRoute.path[locale]} />
      ) : null}
      <AestheticsHero
        locale={locale}
        title={concern.title[locale]}
        body={concern.summary[locale]}
        image={concern.image}
        imageRole="concern"
        seed={concern.id}
        imageFocus="right"
        imageAlt={{
          en: concern.title.en || concern.id,
          ar: concern.title.ar || concern.id,
        }}
        imageCaption={concern.image?.caption}
        actions={
          <Button size="lg" render={<a href={booking.href!} target="_blank" rel="noopener noreferrer" />}>
            {t.consultCta}
          </Button>
        }
        breadcrumbs={
          <Breadcrumbs
            locale={locale}
            items={[{ label: treatmentsHub.title[locale], href: href("aesthetics-treatments-hub", locale) }, { label: concern.title[locale] }]}
          />
        }
      />

      <article className="section-y">
      <Container className="max-w-3xl">

        {concern.commonPresentations ? (
          <section data-reveal="up" className="mt-10 first:mt-0">
            <h2 className="text-h4 font-heading">{t.presentations}</h2>
            <p className="mt-2 text-body text-text-secondary">{concern.commonPresentations[locale]}</p>
          </section>
        ) : null}

        {concern.contributingFactors ? (
          <section data-reveal="up" className="mt-10 first:mt-0">
            <h2 className="text-h4 font-heading">{t.factors}</h2>
            <p className="mt-2 text-body text-text-secondary">{concern.contributingFactors[locale]}</p>
          </section>
        ) : null}

        {relatedTreatments.length ? (
          <section data-reveal="up" className="mt-10 first:mt-0">
            <h2 className="text-h4 font-heading">{t.treatmentOptions}</h2>
            <p className="mt-2 text-body text-text-secondary">{t.treatmentOptionsIntro}</p>
            <ul className="mt-5 grid gap-4">
              {relatedTreatments.map((treatment) => (
                <TreatmentOptionCard key={treatment.id} treatment={treatment} locale={locale} />
              ))}
            </ul>
          </section>
        ) : null}

        {relatedTechnologies.length ? (
          <section data-reveal="up" className="mt-10 first:mt-0">
            <h2 className="text-h4 font-heading">{t.relatedTechnologies}</h2>
            <CrossLinkList items={relatedTechnologies} locale={locale} getHref={(tech) => `/${locale}${getRoute(`technology-${tech.id}`)!.path[locale]}`} />
          </section>
        ) : null}

        {expectations.length ? (
          <section data-reveal="up" className="mt-10 first:mt-0">
            <h2 className="text-h4 font-heading">{t.whatToExpect}</h2>
            <div className="mt-4 space-y-6">
              {expectations.map(({ treatment, rows }) => (
                <div key={treatment.id}>
                  {/* Named even when there is only one option, so the detail is
                      never read as being true of the concern in general. */}
                  <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-text-muted">
                    {treatment.title[locale]}
                  </h3>
                  <dl className="mt-2 space-y-3">
                    {rows.map((row) => (
                      <div key={row.field}>
                        <dt className="font-medium">{row.label}</dt>
                        <dd className="mt-1 text-sm text-text-secondary">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {relatedDoctors.length ? (
          <section data-reveal="up" className="mt-10 first:mt-0">
            <h2 className="text-h4 font-heading">{t.relatedDoctors}</h2>
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

        {relatedConcerns.length ? (
          <section data-reveal="up" className="mt-10 first:mt-0">
            <h2 className="text-h4 font-heading">{t.relatedConcerns}</h2>
            <CrossLinkList items={relatedConcerns} locale={locale} getHref={(c) => `/${locale}${getRoute(`concern-${c.id}`)!.path[locale]}`} />
          </section>
        ) : null}

        {concern.faqs?.length ? (
          <section data-reveal="up" className="mt-10 first:mt-0">
            <h2 className="text-h4 font-heading">{t.faqs}</h2>
            <dl className="mt-3 space-y-4">
              {concern.faqs.map((faq) => (
                <div key={faq.question[locale]}>
                  <dt className="font-medium">{faq.question[locale]}</dt>
                  <dd className="mt-1 text-sm text-text-secondary">{faq.answer[locale]}</dd>
                </div>
              ))}
            </dl>
            <FaqPageSchema faqs={concern.faqs} locale={locale} />
          </section>
        ) : null}

        {/* The page ends where the journey does: every aesthetic treatment at
            Blue Diamond starts with a consultation, so the last thing on a
            concern page is the way to book one. */}
        <section data-reveal="up" className="mt-12 rounded-lg border border-border p-6">
          <h2 className="text-h4 font-heading">{t.consultHeading}</h2>
          <p className="mt-2 text-body text-text-secondary">{t.treatmentOptionsIntro}</p>
          <Button className="mt-4" size="lg" render={<a href={booking.href!} target="_blank" rel="noopener noreferrer" />}>
            {t.consultCta}
          </Button>
        </section>

        {/* Every concern page ends on evidence: what the treatment looks like
            and what it is performed with. Last, deliberately — the reader has
            the options, the practicalities and the way to book above it. */}
        <ConcernResults
          pairs={resultPairs}
          technology={resultsDevice}
          technologyImage={resultsDevice ? technologyImages[resultsDevice.id] : undefined}
          locale={locale}
        />

      </Container>
      </article>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
