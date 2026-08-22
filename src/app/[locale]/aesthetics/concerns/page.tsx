import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ConcernExplorer } from "@/components/aesthetics/ConcernExplorer";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/config/routes";
import { getRouteMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("aesthetics-concerns-hub", safeLocale, {
    description: {
      en: "Browse by skin concern — acne scars, redness, dryness, fine lines, and more — at Blue Diamond Medical Aesthetics.",
      ar: "تصفّحوا حسب مخاوف البشرة — ندبات حب الشباب، الاحمرار، الجفاف، الخطوط الدقيقة، وغيرها — في بلو دايموند للتجميل الطبي.",
    },
  });
}

export default async function ConcernsHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const aestheticsRoute = getRoute("aesthetics-hub")!;
  const title = locale === "ar" ? "المخاوف الجمالية" : "Concerns";

  return (
    <>
      <section className="section-y">
        <Container>
          <Breadcrumbs locale={locale} items={[{ label: aestheticsRoute.title[locale], href: href("aesthetics-hub", locale) }, { label: title }]} />
          <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{title}</h1>

          <div className="mt-10">
            <ConcernExplorer locale={locale} />
          </div>
        </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
