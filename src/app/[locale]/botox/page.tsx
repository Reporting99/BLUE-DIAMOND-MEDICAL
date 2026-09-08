import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { AestheticsHero } from "@/features/aesthetics/components/AestheticsHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { getBookingUrl } from "@/config/booking";
import { siteConfig } from "@/config/site";

/** Single source for this page's description: consumed by both generateMetadata
 * and the page's JSON-LD node, so the two can never drift apart (brief §9). */
const PAGE_DESCRIPTION = {
      en: "Medical Botox for migraine, hyperhidrosis, and bruxism at Blue Diamond Medical Clinic. Cosmetic Botox is provided by Dr. Mohamed Farhat and Dr. Reem Hamdi.",
      ar: "بوتوكس طبي لعلاج الشقيقة والتعرق الزائد وصرير الأسنان في عيادة بلو دايموند الطبية. ويقدّم البوتوكس التجميلي الدكتور محمد فرحات والدكتورة ريم حمدي.",
    } as const;

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageSchema } from "@/components/shared/schema";
import { getRoute } from "@/lib/routing";
import { resolvePageHeroImage } from "@/lib/feelstack/page-hero-media";

const medicalConditions = {
  en: ["Migraine treatment", "Hyperhidrosis", "Bruxism and jaw pain"],
  ar: ["علاج الشقيقة (الصداع النصفي)", "التعرق الزائد", "صرير الأسنان (TMJ) وألم الفك"],
};

/**
 * CL-024 — cosmetic Botox is the ONE stated provider-specific exception.
 * It names both approved providers. This restriction is about cosmetic Botox
 * only: it says nothing about chronic care, minor procedures or general
 * family medicine, all of which every clinic family physician provides.
 */
const cosmeticProviders = {
  en: "Cosmetic Botox is provided by Dr. Mohamed Farhat and Dr. Reem Hamdi.",
  ar: "يقدّم البوتوكس التجميلي كل من الدكتور محمد فرحات والدكتورة ريم حمدي.",
};

const cosmeticAreas = {
  en: [
    "Frown lines",
    "Forehead lines",
    "Crow's feet",
    "Bunny lines",
    "Nefertiti neck lift",
    "Gummy smile",
    "Lip flip",
    "Brow lift",
    "Chin & platysma",
  ],
  ar: [
    "خطوط العبوس",
    "خطوط الجبين",
    "خطوط الضحك (قدم الغراب)",
    "خطوط الأنف",
    "شدّ الرقبة (نفرتيتي)",
    "الابتسامة اللثوية",
    "رفع الشفة",
    "رفع الحاجب",
    "الذقن والرقبة",
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("botox-hub", safeLocale, { description: PAGE_DESCRIPTION });
}

export default async function BotoxHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const phone = getBookingUrl("phone-medical-botox");

  const copy = {
    en: {
      title: "Botox",
      intro:
        "Botox at Blue Diamond Medical is administered by Dr. Farhat and Dr. Hamdi. Every treatment begins with a consultation to discuss suitability, the appointment and expected recovery.",
      coverageNote:
        "Coverage for Botox for migraine, bruxism and hyperhidrosis depends on the condition and your insurance eligibility. Provincial coverage, private insurance or the clinic's compassionate program may help with costs. Albertans can contact the clinic whether or not they are registered patients. Confirm coverage and any fees before treatment.",
      medicalHeading: "Medical Botox",
      cosmeticHeading: "Cosmetic Botox",
      cta: "Call to book",
      /* The Botox-only phone sentence that used to sit here is gone: it
         labelled the general medical number as a Botox booking line. Both
         published lines are now stated with their real purpose. */
      contactHeading: "Contact us",
      medicalLabel: "Medical Clinic",
      aestheticLabel: "Aesthetic Clinic",
    },
    ar: {
      title: "البوتوكس",
      intro:
        "يتمتع الدكتور فرحات والدكتورة ريم حمدي بمهارة عالية في إجراء البوتوكس. يبدأ كل علاج باستشارة — ومعظم الإجراءات سريعة ولا تحتاج إلا لوقت تعافٍ قصير.",
      coverageNote:
        "يُغطّى بوتوكس الشقيقة وصرير الأسنان والتعرق الزائد جزئيًا بالتأمين الصحي الحكومي، إلى جانب التأمين الخاص أو برنامج العيادة التعاطفي، وهو متاح لجميع سكان ألبرتا سواء كانوا مسجّلين في العيادة أم لا.",
      medicalHeading: "البوتوكس الطبي",
      cosmeticHeading: "البوتوكس التجميلي",
      cta: "اتصل للحجز",
      contactHeading: "تواصلوا معنا",
      medicalLabel: "العيادة الطبية",
      aestheticLabel: "عيادة التجميل",
    },
  }[locale];

  const ownRoute = getRoute("botox-hub")!;
  const hero = await resolvePageHeroImage(ownRoute.path.en, locale);

  return (
    <>
      <PageSchema
        locale={locale}
        type="WebPage"
        name={copy.title}
        description={PAGE_DESCRIPTION[locale]}
        path={ownRoute.path[locale]}
      />
      <AestheticsHero
        locale={locale}
        title={copy.title}
        body={copy.intro}
        image={hero}
        imageRole="treatment"
        seed="botox-hub"
        imageAlt={{
          en: "Botox treatment room at Blue Diamond Medical Clinic",
          ar: "غرفة علاج البوتوكس في عيادة بلو دايموند الطبية",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />}
        actions={
          <Button size="lg" render={<a href={phone.href!} />}>
            {copy.cta}: <span className="ltr-run ms-1">{siteConfig.clinic.phoneDisplay}</span>
          </Button>
        }
      />

      <section className="section-y">
      <Container>
        {/* The coverage note stays a page-body element rather than moving into
            the hero: it is the sentence that tells an Albertan whether this
            treatment costs them anything, and burying it in a wash over a
            photograph is the wrong place for the one paragraph on this page
            with money in it. */}
        <p data-reveal="up" className="max-w-2xl rounded-md border border-border bg-surface p-4 text-sm text-text-secondary">
          {copy.coverageNote}
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <div data-reveal="up">
            <h2 className="text-h3 font-heading">{copy.medicalHeading}</h2>
            <ul className="mt-4 space-y-2">
              {medicalConditions[locale].map((item) => (
                <li key={item} className="rounded-md border border-border bg-surface px-4 py-3 text-sm">
                  {item}
                </li>
              ))}
            </ul>
            {/* CL-042 — both published lines, each labelled with what it
                answers, so neither number reads as a Botox-only or a
                single-purpose line. Numbers come from siteConfig, never
                hardcoded. */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-10">
              <div>
                <p className="text-sm text-text-secondary">{copy.medicalLabel}</p>
                <a
                  href={`tel:${siteConfig.clinic.phone}`}
                  className="ltr-run text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {siteConfig.clinic.phoneDisplay}
                </a>
              </div>
              <div>
                <p className="text-sm text-text-secondary">{copy.aestheticLabel}</p>
                <a
                  href={`tel:${siteConfig.aesthetics.phone}`}
                  className="ltr-run text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {siteConfig.aesthetics.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
          <div data-reveal="up" data-reveal-delay="1">
            <h2 className="text-h3 font-heading">{copy.cosmeticHeading}</h2>
            {/* CL-024 — both approved cosmetic-Botox providers, named. */}
            <p className="mt-3 rounded-md border border-border bg-surface px-4 py-3 text-sm">
              {cosmeticProviders[locale]}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {cosmeticAreas[locale].map((item) => (
                <li key={item} className="rounded-full border border-border px-3 py-1.5 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
