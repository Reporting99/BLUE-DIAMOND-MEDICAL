import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import type { LegalPageContent } from "@/features/legal/types";
import type { Locale } from "@/i18n/config";

export function LegalPageTemplate({ page, locale }: { page: LegalPageContent; locale: Locale }) {
  const effectiveLabel = locale === "ar" ? "تاريخ السريان" : "Effective date";

  return (
    <>
      {/* Compact, and the only hero on the site with no CMS image slot behind
          it: a privacy policy is not a page anyone photographs, and the facet
          visual keeps it inside the same design language without pretending
          otherwise. The effective date sits in the hero because on a legal
          page it is the first thing a reader needs to check. */}
      <PageHero
        locale={locale}
        title={page.title[locale]}
        imageRole="hero"
        seed={page.id}
        measure="narrow"
        imageAlt={{
          en: `${page.title.en} — Blue Diamond Medical`,
          ar: `${page.title.ar} — بلو دايموند الطبية`,
        }}
        size="compact"
      >
        {page.effectiveDate ? (
          <p className="mt-4 text-sm text-text-secondary">
            {effectiveLabel}: {page.effectiveDate}
          </p>
        ) : null}
      </PageHero>

      <article className="section-y">
      <Container className="max-w-2xl">
        <div data-reveal="up" className="whitespace-pre-line text-body text-text-body">{page.body[locale]}</div>
      </Container>
      </article>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
