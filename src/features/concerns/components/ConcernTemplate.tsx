import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
import { getTreatment } from "@/features/aesthetics/data/treatments";
import { getConcern } from "@/features/concerns/data";
import { getTechnology } from "@/features/technologies/data";
import { getBeforeAfterPairsForConcern } from "@/features/aesthetics/data/before-after";
import { BeforeAfterGallery } from "@/features/aesthetics/components/BeforeAfterGallery";
import { doctors } from "@/features/doctors";
import type { AestheticConcern } from "@/features/concerns/types";
import type { Locale } from "@/i18n/config";

const labels = {
  en: {
    presentations: "How this may appear",
    factors: "Contributing factors",
    relatedTreatments: "Treatments for this concern",
    relatedTechnologies: "Related technologies",
    relatedConcerns: "Related concerns",
    relatedDoctors: "Relevant physicians",
    faqs: "Frequently asked questions",
    consultCta: "Book a consultation",
  },
  ar: {
    presentations: "كيف قد تظهر",
    factors: "العوامل المساهمة",
    relatedTreatments: "علاجات لهذه المخاوف",
    relatedTechnologies: "التقنيات ذات الصلة",
    relatedConcerns: "مخاوف ذات صلة",
    relatedDoctors: "الأطباء المعنيون",
    faqs: "الأسئلة الشائعة",
    consultCta: "احجز استشارة",
  },
};

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

export function ConcernTemplate({ concern, locale }: { concern: AestheticConcern; locale: Locale }) {
  const t = labels[locale];
  const booking = getBookingUrl("aesthetics-consultation");
  const concernsHub = getRoute("aesthetics-concerns-hub")!;
  const ownRoute = getRoute(`concern-${concern.id}`);
  const relatedTreatments = concern.relatedTreatmentIds.map(getTreatment).filter(Boolean) as NonNullable<ReturnType<typeof getTreatment>>[];

  /**
   * Concern -> Technology (brief §11/§12/§29). An explicitly authored
   * `relatedTechnologyIds` always wins. When there isn't one, the link is
   * DERIVED from the concern's own recommended treatments: whatever device
   * those treatments already say they run on.
   *
   * This is a derivation, not an inference. It never asks "what device
   * probably treats this concern" — the answer comes only from
   * `treatment.technologyIds`, which is authored per treatment from
   * approved source content. So the page can only ever show a technology
   * that a treatment already on this same page is documented to use,
   * which is exactly the "Concern -> Recommended Treatment -> Technology"
   * chain the brief asks the UI to make walkable. Before this, most
   * concern pages simply omitted the section, and a visitor who arrived
   * knowing their problem (the common case for aesthetics) hit a dead end
   * one step short of the technology page.
   */
  const derivedTechnologyIds = Array.from(
    new Set(relatedTreatments.flatMap((treatment) => treatment.technologyIds ?? [])),
  );
  const technologyIds = concern.relatedTechnologyIds?.length
    ? concern.relatedTechnologyIds
    : derivedTechnologyIds;
  const relatedTechnologies = technologyIds.map(getTechnology).filter(Boolean) as NonNullable<ReturnType<typeof getTechnology>>[];
  const relatedConcerns = (concern.relatedConcernIds ?? []).map(getConcern).filter(Boolean) as AestheticConcern[];
  const relatedDoctors = doctors.filter((d) => (concern.relatedDoctorIds ?? []).includes(d.id));

  return (
    <>
      {ownRoute ? (
        <MedicalWebPageSchema locale={locale} name={concern.title[locale]} description={concern.summary[locale]} path={ownRoute.path[locale]} />
      ) : null}
      <article className="section-y">
      <Container className="max-w-3xl">
        <Breadcrumbs
          locale={locale}
          items={[{ label: concernsHub.title[locale], href: href("aesthetics-concerns-hub", locale) }, { label: concern.title[locale] }]}
        />
        <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{concern.title[locale]}</h1>
        <p className="mt-4 text-body-lg text-text-secondary">{concern.summary[locale]}</p>

        {/* Lead image, present only when this entity has a real FeelStack
            media assignment. ImageKitImage still decides, from the asset's own
            status, whether real bytes or the FacetTile placeholder appear. */}
        {concern.image ? (
          <ImageKitImage
            path={concern.image.path}
            preset="concern"
            role={concern.image.role}
            status={concern.image.status}
            alt={
              cmsAlt(concern.image) ?? {
                en: concern.title.en || concern.id,
                ar: concern.title.ar || concern.id,
              }
            }
            caption={concern.image.caption}
            locale={locale}
            width={concern.image.width}
            height={concern.image.height}
            sizes="(min-width: 768px) 48rem, 100vw"
            className="mt-8 aspect-video rounded-lg"
          />
        ) : null}


        <Button size="lg" className="mt-8" render={<a href={booking.href} target="_blank" rel="noopener noreferrer" />}>
          {t.consultCta}
        </Button>

        {concern.commonPresentations ? (
          <section className="mt-10">
            <h2 className="text-h4 font-heading">{t.presentations}</h2>
            <p className="mt-2 text-body text-text-secondary">{concern.commonPresentations[locale]}</p>
          </section>
        ) : null}

        {concern.contributingFactors ? (
          <section className="mt-10">
            <h2 className="text-h4 font-heading">{t.factors}</h2>
            <p className="mt-2 text-body text-text-secondary">{concern.contributingFactors[locale]}</p>
          </section>
        ) : null}

        {relatedTreatments.length ? (
          <section className="mt-10">
            <h2 className="text-h4 font-heading">{t.relatedTreatments}</h2>
            <CrossLinkList items={relatedTreatments} locale={locale} getHref={(tr) => `/${locale}${getRoute(`treatment-${tr.id}`)!.path[locale]}`} />
          </section>
        ) : null}

        {/* Concern-level examples (§30) — only pairs whose own source
            evidence names this concern, never aggregated by appearance. */}
        <BeforeAfterGallery pairs={getBeforeAfterPairsForConcern(concern.id)} locale={locale} />

        {relatedTechnologies.length ? (
          <section className="mt-10">
            <h2 className="text-h4 font-heading">{t.relatedTechnologies}</h2>
            <CrossLinkList items={relatedTechnologies} locale={locale} getHref={(tech) => `/${locale}${getRoute(`technology-${tech.id}`)!.path[locale]}`} />
          </section>
        ) : null}

        {relatedDoctors.length ? (
          <section className="mt-10">
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
          <section className="mt-10">
            <h2 className="text-h4 font-heading">{t.relatedConcerns}</h2>
            <CrossLinkList items={relatedConcerns} locale={locale} getHref={(c) => `/${locale}${getRoute(`concern-${c.id}`)!.path[locale]}`} />
          </section>
        ) : null}

        {concern.faqs?.length ? (
          <section className="mt-10">
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

      </Container>
      </article>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
