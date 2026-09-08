import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageSchema } from "@/components/shared/schema";
import { resolvePageHeroImage } from "@/lib/feelstack/page-hero-media";
import { getRoute } from "@/lib/routing";

const categories = {
  en: ["Family Health", "Women's Health", "Mental Health", "Medical Aesthetics", "Skin & Hair", "Clinic News"],
  ar: ["صحة الأسرة", "صحة المرأة", "الصحة النفسية", "التجميل الطبي", "البشرة والشعر", "أخبار العيادة"],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("health-hub", safeLocale, {
    description: {
      en: "Guidance from the Blue Diamond Medical clinical team on family health, women's health, mental health, and medical aesthetics.",
      ar: "إرشادات من فريق بلو دايموند الطبي حول صحة الأسرة، وصحة المرأة، والصحة النفسية، والتجميل الطبي.",
    },
  });
}

export default async function HealthHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  const copy = {
    en: {
      title: "Health Hub",
      intro:
        "Plain-language guidance from our clinical team, organized by the topics our patients ask about most. Articles are published only after medical review.",
      emptyHeading: "The first articles are on their way",
      emptyBody:
        "Nothing has been published here yet. Our physicians are preparing the first articles, and each one is reviewed before it goes up. In the meantime, please call the clinic or ask at your next appointment.",
    },
    ar: {
      title: "المركز المعرفي",
      intro:
        "إرشادات بلغة واضحة من فريقنا الطبي، مصنّفة حسب المواضيع الأكثر تكرارًا بين مرضانا. تُنشر المقالات فقط بعد المراجعة الطبية.",
      emptyHeading: "المقالات الأولى في الطريق",
      emptyBody:
        "لم يُنشر أي مقال هنا بعد. يعمل أطباؤنا على إعداد المقالات الأولى، وتخضع كل مقالة للمراجعة قبل نشرها. وفي هذه الأثناء، يسعدنا تلقي أسئلتكم عبر الاتصال بالعيادة أو في موعدكم القادم.",
    },
  }[locale];

  const ownRoute = getRoute("health-hub")!;

  const hero = await resolvePageHeroImage(ownRoute.path.en, locale);

  return (
    <>
      <PageSchema
        locale={locale}
        name={copy.title}
        description={copy.intro}
        path={ownRoute.path[locale]}
      />
      <PageHero
        locale={locale}
        title={copy.title}
        body={copy.intro}
        image={hero}
        imageRole="article"
        seed="health-hub"
        imageAlt={{
          en: "Health information and patient education at Blue Diamond Medical",
          ar: "معلومات صحية وتثقيف للمرضى في بلو دايموند الطبية",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />}
      />

      <section className="section-y">
      <Container>
        <ul className="flex flex-wrap gap-3">
          {categories[locale].map((category, i) => (
            <li key={category} data-reveal="up" data-reveal-delay={String(i % 4)} className="rounded-full border border-border bg-surface px-4 py-2 text-sm">
              {category}
            </li>
          ))}
        </ul>

        <div
          data-reveal="up"
          className="mt-10 rounded-md border border-border bg-surface px-5 py-6"
        >
          <h2 className="text-h4 font-heading">{copy.emptyHeading}</h2>
          <p className="mt-2 max-w-2xl text-body text-text-secondary">{copy.emptyBody}</p>
        </div>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
