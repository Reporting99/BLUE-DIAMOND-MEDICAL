import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/lib/routing";
import { features } from "@/config/features";
import { medicalBotoxHub, medicalBotoxConditions } from "@/features/medical-services";
import { getRouteMetadata } from "@/lib/seo/metadata";

/**
 * Feature-flagged off — see src/features/medical-services/botox.ts. The page is
 * fully implemented so enabling it later is a one-line flag flip, but
 * `notFound()` fires while `medicalBotoxDetailPagesEnabled` is false, so
 * it is not publicly reachable, not indexed, and not in the sitemap/nav.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  if (!features.medicalBotoxDetailPagesEnabled) return {};
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("medical-botox-hub", safeLocale, {
    description: { en: medicalBotoxHub.summary.en, ar: medicalBotoxHub.summary.ar },
  });
}

export default async function MedicalBotoxHubPage({ params }: { params: Promise<{ locale: string }> }) {
  if (!features.medicalBotoxDetailPagesEnabled) notFound();

  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const medicalRoute = getRoute("medical-hub")!;

  return (
    <>
      <section className="section-y">
      <Container className="max-w-3xl">
        <Breadcrumbs
          locale={locale}
          items={[{ label: medicalRoute.title[locale], href: href("medical-hub", locale) }, { label: medicalBotoxHub.title[locale] }]}
        />
        <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{medicalBotoxHub.title[locale]}</h1>
        <p className="mt-4 text-body-lg text-text-secondary">{medicalBotoxHub.summary[locale]}</p>

        <ul className="mt-8 flex flex-wrap gap-3">
          {medicalBotoxConditions.map((condition) => {
            const route = getRoute(`medical-botox-${condition.id}`)!;
            return (
              <li key={condition.id}>
                <Link
                  href={`/${locale}${route.path[locale]}`}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
                >
                  {condition.title[locale]}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link href={href("botox-hub", locale)} className="mt-8 inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover">
          {locale === "ar" ? "عرض صفحة البوتوكس الكاملة" : "View the full Botox page"} <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
