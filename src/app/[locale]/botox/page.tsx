import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { getBookingUrl } from "@/config/booking";

/** Single source for this page's description: consumed by both generateMetadata
 * and the page's JSON-LD node, so the two can never drift apart (brief §9). */
const PAGE_DESCRIPTION = {
      en: "Medical Botox for migraine, hyperhidrosis, and bruxism, plus cosmetic Botox — administered by Dr. Farhat at Blue Diamond Medical Clinic.",
      ar: "بوتوكس طبي لعلاج الشقيقة والتعرق الزائد وصرير الأسنان، إلى جانب البوتوكس التجميلي — يُجريه الدكتور فرحات في عيادة بلو دايموند الطبية.",
    } as const;

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageSchema } from "@/components/shared/schema";
import { getRoute } from "@/lib/routing";

const medicalConditions = {
  en: ["Migraine treatment", "Hyperhidrosis", "Bruxism (TMJ) & jaw pain"],
  ar: ["علاج الشقيقة (الصداع النصفي)", "التعرق الزائد", "صرير الأسنان (TMJ) وألم الفك"],
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
        "Dr. Farhat is highly skilled in administering Botox for both medical and cosmetic purposes. Every treatment begins with a consultation — most procedures are efficient \"lunchtime\" visits with minimal recovery time.",
      coverageNote:
        "Botox for migraines, bruxism, and hyperhidrosis is covered by a combination of provincial health insurance and either private insurance or the clinic's compassionate program, open to all Albertans whether registered with the clinic or not.",
      medicalHeading: "Medical Botox",
      cosmeticHeading: "Cosmetic Botox",
      cta: "Call to book",
    },
    ar: {
      title: "البوتوكس",
      intro:
        "يتمتع الدكتور فرحات بمهارة عالية في إجراء البوتوكس لأغراض طبية وتجميلية. يبدأ كل علاج باستشارة — ومعظم الإجراءات سريعة ولا تحتاج إلا لوقت تعافٍ قصير.",
      coverageNote:
        "يُغطّى بوتوكس الشقيقة وصرير الأسنان والتعرق الزائد جزئيًا بالتأمين الصحي الحكومي، إلى جانب التأمين الخاص أو برنامج العيادة التعاطفي، وهو متاح لجميع سكان ألبرتا سواء كانوا مسجّلين في العيادة أم لا.",
      medicalHeading: "البوتوكس الطبي",
      cosmeticHeading: "البوتوكس التجميلي",
      cta: "اتصل للحجز",
    },
  }[locale];

  const ownRoute = getRoute("botox-hub")!;

  return (
    <>
      <PageSchema
        locale={locale}
        type="WebPage"
        name={copy.title}
        description={PAGE_DESCRIPTION[locale]}
        path={ownRoute.path[locale]}
      />
      <section className="section-y">
      <Container>
        <Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />

        <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-text-secondary">{copy.intro}</p>
        <p className="mt-4 max-w-2xl rounded-md border border-border bg-surface p-4 text-sm text-text-secondary">
          {copy.coverageNote}
        </p>

        <Button size="lg" className="mt-8" render={<a href={phone.href} />}>
          {copy.cta}: <span className="ltr-run ms-1">825 413 1113</span>
        </Button>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-h3 font-heading">{copy.medicalHeading}</h2>
            <ul className="mt-4 space-y-2">
              {medicalConditions[locale].map((item) => (
                <li key={item} className="rounded-md border border-border bg-surface px-4 py-3 text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-h3 font-heading">{copy.cosmeticHeading}</h2>
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
