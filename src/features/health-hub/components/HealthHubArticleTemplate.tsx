import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { getRoute, href } from "@/lib/routing";
import { doctors } from "@/features/doctors";
import type { HealthHubArticle } from "@/types/article";
import type { Locale } from "@/i18n/config";

const labels = {
  en: { by: "By", reviewedBy: "Medically reviewed by", updated: "Updated", sources: "Sources", faqs: "Frequently asked questions" },
  ar: { by: "بقلم", reviewedBy: "روجع طبيًا من قبل", updated: "آخر تحديث", sources: "المصادر", faqs: "الأسئلة الشائعة" },
};

/**
 * Reusable Health Hub article template — brief §21. Not yet exercised by
 * any real content (src/features/health-hub/data.ts is empty), but
 * built and typed so the first approved article needs no new code.
 */
export function HealthHubArticleTemplate({ article, locale }: { article: HealthHubArticle; locale: Locale }) {
  const t = labels[locale];
  const healthHubRoute = getRoute("health-hub")!;
  const relatedDoctors = (article.relatedDoctorIds ?? [])
    .map((id) => doctors.find((d) => d.id === id))
    .filter(Boolean);

  return (
    <>
      <article className="section-y">
      <Container className="max-w-3xl">
        <Breadcrumbs locale={locale} items={[{ label: healthHubRoute.title[locale], href: href("health-hub", locale) }, { label: article.title[locale] }]} />

        <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{article.title[locale]}</h1>
        <p className="mt-4 text-body-lg text-text-secondary">{article.summary[locale]}</p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
          <span>
            {t.by} {article.author}
          </span>
          {article.medicalReviewer ? (
            <span>
              {t.reviewedBy} {article.medicalReviewer}
            </span>
          ) : null}
          {article.updatedAt ? (
            <span>
              {t.updated}: {article.updatedAt}
            </span>
          ) : null}
        </div>

        <div className="mt-8 whitespace-pre-line text-body text-text-body">{article.body[locale]}</div>

        {article.faqs?.length ? (
          <section className="mt-10">
            <h2 className="text-h4 font-heading">{t.faqs}</h2>
            <dl className="mt-3 space-y-4">
              {article.faqs.map((faq) => (
                <div key={faq.question[locale]}>
                  <dt className="font-medium">{faq.question[locale]}</dt>
                  <dd className="mt-1 text-sm text-text-secondary">{faq.answer[locale]}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {relatedDoctors.length ? (
          <section className="mt-10 flex flex-wrap gap-3">
            {relatedDoctors.map((doctor) => {
              const route = getRoute(doctor!.routeId)!;
              return (
                <a
                  key={doctor!.id}
                  href={`/${locale}${route.path[locale]}`}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
                >
                  {doctor!.name[locale]}
                </a>
              );
            })}
          </section>
        ) : null}

        {article.sources?.length ? (
          <section className="mt-10 border-t border-border pt-6">
            <h2 className="text-h4 font-heading">{t.sources}</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {article.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </Container>
      </article>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
