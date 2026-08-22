import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ConsultationRequestForm } from "@/features/booking";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/lib/routing";
import { features } from "@/config/features";
import { getRouteMetadata } from "@/lib/seo/metadata";

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

  return (
    <>
      <section className="section-y">
      <Container className="max-w-xl">
        <Breadcrumbs locale={locale} items={[{ label: aestheticsRoute.title[locale], href: href("aesthetics-hub", locale) }, { label: title }]} />
        <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{title}</h1>
        <div className="mt-8">
          <ConsultationRequestForm locale={locale} />
        </div>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
