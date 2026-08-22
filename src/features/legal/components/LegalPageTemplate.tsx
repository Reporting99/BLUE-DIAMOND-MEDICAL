import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import type { LegalPageContent } from "@/features/legal/types";
import type { Locale } from "@/i18n/config";

export function LegalPageTemplate({ page, locale }: { page: LegalPageContent; locale: Locale }) {
  const effectiveLabel = locale === "ar" ? "تاريخ السريان" : "Effective date";

  return (
    <>
      <article className="section-y">
      <Container className="max-w-2xl">
        <h1 className="text-display-1 font-heading lg:text-display-1-lg">{page.title[locale]}</h1>
        {page.effectiveDate ? (
          <p className="mt-2 text-sm text-text-secondary">
            {effectiveLabel}: {page.effectiveDate}
          </p>
        ) : null}
        <div className="mt-8 whitespace-pre-line text-body text-text-body">{page.body[locale]}</div>
      </Container>
      </article>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
