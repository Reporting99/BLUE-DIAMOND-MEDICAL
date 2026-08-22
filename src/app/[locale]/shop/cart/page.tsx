import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { isLocale, type Locale } from "@/i18n/config";
import { features } from "@/config/features";

/**
 * Feature-flagged off (`shopCheckoutEnabled`, deliberately separate from
 * `shopEnabled` so the live catalogue never exposes this bare stub).
 * Always noindex regardless of flag state — cart pages are never indexed.
 */
export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  if (!features.shopCheckoutEnabled) notFound();

  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const title = locale === "ar" ? "سلة المشتريات" : "Cart";

  return (
    <>
      <section className="section-y">
        <Container>
          <h1 className="text-display-1 font-heading lg:text-display-1-lg">{title}</h1>
        </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
