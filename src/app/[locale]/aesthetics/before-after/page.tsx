import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { BeforeAfterGallery } from "@/features/aesthetics";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/lib/routing";
import { features } from "@/config/features";
import { getBeforeAfterPairs } from "@/features/aesthetics";
import { getRouteMetadata } from "@/lib/seo/metadata";

/**
 * Feature-flagged off (`beforeAfterEnabled`) — no approved before/after
 * photography has been supplied, and the brief explicitly forbids
 * fabricating clinical results imagery. Route/template exist so real,
 * consented photography can be added later without new code — see
 * docs/IMAGE_REPLACEMENT_MANIFEST.md.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  if (!features.beforeAfterEnabled) return {};
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("aesthetics-before-after", safeLocale, {
    description: { en: "Before and after results at Blue Diamond Medical Aesthetics.", ar: "نتائج قبل وبعد في بلو دايموند للتجميل الطبي." },
  });
}

export default async function BeforeAfterPage({ params }: { params: Promise<{ locale: string }> }) {
  if (!features.beforeAfterEnabled) notFound();

  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const aestheticsRoute = getRoute("aesthetics-hub")!;
  const title = locale === "ar" ? "قبل وبعد" : "Before & After";

  return (
    <>
      <section className="section-y">
      <Container>
        <Breadcrumbs locale={locale} items={[{ label: aestheticsRoute.title[locale], href: href("aesthetics-hub", locale) }, { label: title }]} />
        <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{title}</h1>
        <BeforeAfterGallery pairs={getBeforeAfterPairs()} locale={locale} />
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
