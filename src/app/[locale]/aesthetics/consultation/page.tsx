import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ConsultationRequestForm } from "@/features/booking";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/lib/routing";
import { features } from "@/config/features";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { resolvePageHeroImage } from "@/lib/feelstack/page-hero-media";

/** Feature-flagged off (`consultationFormEnabled`) — see docs/CONTENT_MODEL.md. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  if (!features.consultationFormEnabled) return {};
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("aesthetics-consultation", safeLocale, {
    description: {
      en: "Request a medical aesthetics consultation at Blue Diamond Medical.",
      ar: "اطلبوا استشارة تجميل طبي في بلو دايموند الطبية.",
    },
  });
}

export default async function ConsultationRequestPage({ params }: { params: Promise<{ locale: string }> }) {
  if (!features.consultationFormEnabled) notFound();

  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const aestheticsRoute = getRoute("aesthetics-hub")!;
  const title = locale === "ar" ? "طلب استشارة" : "Request a Consultation";
  const intro =
    locale === "ar"
      ? "تبدأ كل خطة علاج باستشارة مع طبيب. أرسلوا تفاصيلكم وسيتواصل معكم فريقنا لتحديد موعد."
      : "Every treatment plan starts with a physician consultation. Send your details and our team will contact you to arrange a time.";
  const ownRoute = getRoute("aesthetics-consultation")!;
  const hero = await resolvePageHeroImage(ownRoute.path.en, locale);

  return (
    <>
      <PageHero
        locale={locale}
        title={title}
        body={intro}
        image={hero}
        imageRole="treatment"
        seed="aesthetics-consultation"
        measure="form"
        imageAlt={{
          en: "A physician consulting with a patient at Blue Diamond Medical",
          ar: "طبيبة تستشير مريضة في بلو دايموند الطبية",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: aestheticsRoute.title[locale], href: href("aesthetics-hub", locale) }, { label: title }]} />}
        size="compact"
      />

      <section className="section-y">
      <Container className="max-w-xl">
        {/* The form itself is never reveal-animated: it is the reason this
            page exists, and content a visitor may have arrived to complete
            should not wait on an observer to become visible. */}
        <ConsultationRequestForm locale={locale} />
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
