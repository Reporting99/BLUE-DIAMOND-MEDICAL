import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/config/routes";
import { technologies } from "@/content/technologies";
import { getRouteMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("aesthetics-technologies-hub", safeLocale, {
    description: {
      en: "World-class Cynosure equipment at Blue Diamond Medical Aesthetics — Elite iQ, Potenza, TempSure, Ultra, and TempSure Vitalia.",
      ar: "معدات عالمية من Cynosure في بلو دايموند للتجميل الطبي — Elite iQ وPotenza وTempSure وUltra وTempSure Vitalia.",
    },
  });
}

export default async function TechnologiesHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const aestheticsRoute = getRoute("aesthetics-hub")!;
  const title = locale === "ar" ? "التقنيات" : "Technologies";
  const intro =
    locale === "ar"
      ? "تضم عيادتنا معدات عالمية المستوى من Cynosure."
      : "Our clinic houses state-of-the-art, world-class equipment by Cynosure.";

  return (
    <>
      <section className="section-y">
      <Container>
        <Breadcrumbs
          locale={locale}
          items={[{ label: aestheticsRoute.title[locale], href: href("aesthetics-hub", locale) }, { label: title }]}
        />
        <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{title}</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-text-secondary">{intro}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {technologies.map((tech) => {
            const route = getRoute(`technology-${tech.id}`)!;
            return (
              <Link
                key={tech.id}
                href={`/${locale}${route.path[locale]}`}
                className="group flex flex-col justify-between rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary"
              >
                <div>
                  <h2 className="font-heading text-h4">{tech.title[locale]}</h2>
                  <p className="mt-2 text-sm text-text-secondary">{tech.summary[locale]}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
