import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/lib/routing";
import { features } from "@/config/features";
import { aestheticsPricingGroups } from "@/features/aesthetics";
import { formatPrice } from "@/types/pricing";
import { getRouteMetadata } from "@/lib/seo/metadata";

/**
 * Feature-flagged off (`aestheticPricingEnabled`) — see
 * src/features/aesthetics/data/pricing.ts. Fully built: type model, currency
 * formatting, and this page all work correctly the moment approved prices
 * are added to the content file; until then it 404s rather than
 * publishing an empty pricing page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  if (!features.aestheticPricingEnabled) return {};
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("aesthetics-pricing", safeLocale, {
    description: {
      en: "Pricing for medical aesthetics treatments at Blue Diamond Medical.",
      ar: "أسعار علاجات التجميل الطبي في بلو دايموند الطبية.",
    },
  });
}

export default async function AestheticsPricingPage({ params }: { params: Promise<{ locale: string }> }) {
  if (!features.aestheticPricingEnabled) notFound();

  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const aestheticsRoute = getRoute("aesthetics-hub")!;
  const title = locale === "ar" ? "أسعار التجميل الطبي" : "Aesthetics Pricing";

  return (
    <>
      <section className="section-y">
      <Container>
        <Breadcrumbs locale={locale} items={[{ label: aestheticsRoute.title[locale], href: href("aesthetics-hub", locale) }, { label: title }]} />
        <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{title}</h1>

        {aestheticsPricingGroups.map((group) => (
          <div key={group.heading.en} className="mt-8">
            <h2 className="text-h4 font-heading">{group.heading[locale]}</h2>
            <ul className="mt-3 space-y-2">
              {group.items.map((item) => (
                <li key={item.id} className="flex justify-between rounded-md border border-border bg-surface px-4 py-3 text-sm">
                  <span>{item.label[locale]}</span>
                  <span className="ltr-run font-medium" style={{ fontFamily: "var(--font-data)" }}>
                    {formatPrice(item.priceCents, item.startingFrom)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
