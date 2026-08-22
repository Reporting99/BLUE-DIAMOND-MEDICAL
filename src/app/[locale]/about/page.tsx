import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { getRoute, href } from "@/config/routes";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { PageSchema } from "@/components/seo/PageSchema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("about", safeLocale, {
    description: {
      en: "Blue Diamond Medical Clinic's mission, founded by Dr. Mohamed Farhat in West Springs, Calgary, in 2022.",
      ar: "رسالة عيادة بلو دايموند الطبية، التي أسّسها الدكتور محمد فرحات في ويست سبرينغز، كالغاري، عام 2022.",
    },
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  const copy = {
    en: {
      title: "About Blue Diamond Medical",
      missionHeading: "Our Mission",
      mission:
        'Blue Diamond Medical is built on the ethos of exceptional patient care in a family-based environment. We are committed to meeting the needs of all our patients in a friendly, timely, and efficient manner. We believe "prevention is better than cure," and work hard to give our patients access to resources that help them lead healthier lives. Blue Diamond Medical — compassion, caring, and wellbeing for all.',
      storyHeading: "Our story",
      story:
        "Our practice opened on July 4, 2022 in West Springs and has consistently welcomed walk-in patients ever since. Founded by Dr. Mohamed Farhat, who brings more than 28 years of family medicine experience, Blue Diamond Medical now houses six family physicians and continues to grow at a safe, steady pace.",
      teamCta: "Meet our team",
    },
    ar: {
      title: "عن بلو دايموند الطبية",
      missionHeading: "رسالتنا",
      mission:
        'تأسّست بلو دايموند الطبية على مبدأ الرعاية الاستثنائية ضمن بيئة عائلية دافئة. نلتزم بتلبية احتياجات جميع مرضانا بأسلوب ودود وسريع وفعّال. نؤمن بأن "الوقاية خير من العلاج"، ونعمل جاهدين لمنح مرضانا الوصول إلى موارد تساعدهم على حياة أكثر صحة. بلو دايموند الطبية — رحمة ورعاية وعافية للجميع.',
      storyHeading: "قصتنا",
      story:
        "افتُتحت عيادتنا في 4 يوليو 2022 في حي ويست سبرينغز، وما زالت تستقبل مرضى بدون موعد مسبق منذ ذلك الحين. أسّسها الدكتور محمد فرحات بخبرة تتجاوز 28 عامًا في طب الأسرة، وتضم عيادة بلو دايموند اليوم ستة أطباء أسرة، وتواصل نموها بخطى ثابتة وآمنة.",
      teamCta: "تعرّفوا على فريقنا",
    },
  }[locale];

  const ownRoute = getRoute("about")!;

  return (
    <>
      <PageSchema
        locale={locale}
        type="AboutPage"
        name={copy.title}
        description={copy.mission}
        path={ownRoute.path[locale]}
      />
      <section className="section-y">
      <Container className="max-w-3xl">
        <Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />

        <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{copy.title}</h1>

        <h2 className="mt-10 text-h3 font-heading">{copy.missionHeading}</h2>
        <p className="mt-3 text-body-lg text-text-secondary">{copy.mission}</p>

        <h2 className="mt-10 text-h3 font-heading">{copy.storyHeading}</h2>
        <p className="mt-3 text-body-lg text-text-secondary">{copy.story}</p>

        <Link
          href={href("doctors-index", locale)}
          className="mt-8 inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover"
        >
          {copy.teamCta} <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
