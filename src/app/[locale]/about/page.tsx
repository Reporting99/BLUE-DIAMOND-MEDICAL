import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { getRoute, href } from "@/lib/routing";
import { BrandLockup } from "@/components/layout/Logo";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageSchema } from "@/components/shared/schema";
import { resolvePageHeroImage } from "@/lib/feelstack/page-hero-media";

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
        'Blue Diamond Medical was founded on a simple principle: careful, personal attention for every patient, in a setting that feels welcoming to the whole family. We aim to meet the needs of all our patients in a friendly, timely, and efficient way. We also believe that "prevention is better than cure," so we work to give our patients access to the resources that help them lead healthier lives. Blue Diamond Medical — compassion, caring, and well-being for all.',
      aestheticsHeading: "Expanding Our Clinic with a New Aesthetic Medicine Department",
      aestheticsBody: [
        "Blue Diamond Medical has proudly expanded its services to include physician\u2011led medical aesthetics in response to growing patient demand. Alongside our comprehensive family medicine care, we now offer a range of advanced aesthetic treatments designed to improve skin health, enhance confidence, and support overall well\u2011being.",
        "Our aesthetic services include laser hair removal, hair restoration using laser therapy and/or PRP, and a variety of skin\u2011rejuvenation treatments focused on improving texture, tone, and vitality. These additions allow us to provide patients with safe, effective, and medically supervised solutions for both skin and hair concerns — all within the trusted environment of our clinic. With our commitment to high\u2011quality care and continuous innovation, Blue Diamond Medical remains dedicated to meeting the evolving needs of our community while ensuring every patient receives personalized, professional treatment.",
      ],
      storyHeading: "Our story",
      story:
        "Our practice opened on July 4, 2022 in West Springs and has welcomed walk-in patients ever since. It was founded by Dr. Mohamed Farhat, who brings over 30 years of family medicine experience. Six family physicians now practise here, and the clinic continues to grow at a careful, steady pace.",
      teamCta: "Meet our team",
    },
    ar: {
      title: "عن بلو دايموند الطبية",
      missionHeading: "رسالتنا",
      mission:
        'تأسّست بلو دايموند الطبية على مبدأ الرعاية الاستثنائية ضمن بيئة عائلية دافئة. نلتزم بتلبية احتياجات جميع مرضانا بأسلوب ودود وسريع وفعّال. نؤمن بأن "الوقاية خير من العلاج"، ونعمل جاهدين لمنح مرضانا الوصول إلى موارد تساعدهم على حياة أكثر صحة. بلو دايموند الطبية — رحمة ورعاية وعافية للجميع.',
      /**
       * CL-031 — ARABIC IS A CLIENT DEPENDENCY.
       *
       * The client supplied this section's exact English heading and body and
       * no Arabic rendering. A machine translation of clinical/aesthetic
       * service copy is exactly what docs/CONTENT_MODEL.md forbids, so the
       * Arabic page omits the section until approved Arabic arrives, rather
       * than publishing invented copy or English text under /ar.
       */
      aestheticsHeading: null,
      aestheticsBody: null,
      storyHeading: "قصتنا",
      story:
        "افتُتحت عيادتنا في 4 يوليو 2022 في حي ويست سبرينغز، وما زالت تستقبل مرضى بدون موعد مسبق منذ ذلك الحين. أسّسها الدكتور محمد فرحات بخبرة تتجاوز 30 عامًا في طب الأسرة، وتضم عيادة بلو دايموند اليوم ستة أطباء أسرة، وتواصل نموها بخطى ثابتة وآمنة.",
      teamCta: "تعرّفوا على فريقنا",
    },
  }[locale];

  /**
   * The brand name, as one unwrappable unit for the hero headline only.
   *
   * The hero's copy column is a share of what the article-measure offset
   * leaves, which is narrow enough that "About Blue Diamond Medical" wraps to
   * three lines — fine in itself, except the break landed between "Blue" and
   * "Diamond" and split the clinic's name down the middle. A U+00A0 is the
   * whole fix: `PageHero`'s `title` is a `string`, so a `<span>` would mean
   * widening that prop for all twenty-eight heroes, and a `nowrap` rule would
   * have to be scoped to this one H1 anyway.
   *
   * Derived rather than written out a second time so it cannot drift from
   * `copy.title`, and applied only here: `PageSchema` and the breadcrumb trail
   * keep the plain string, because a hard space is a typesetting instruction
   * and has no business in structured data.
   */
  const brand = { en: "Blue Diamond", ar: "بلو دايموند" }[locale];
  const heroTitle = copy.title.replace(brand, brand.replace(" ", "\u00A0"));

  const ownRoute = getRoute("about")!;
  const hero = await resolvePageHeroImage(ownRoute.path.en, locale);

  return (
    <>
      <PageSchema
        locale={locale}
        type="AboutPage"
        name={copy.title}
        description={copy.mission}
        path={ownRoute.path[locale]}
      />
      {/* The hero carries no subtitle on purpose: the mission statement
          immediately below is this page's opening paragraph, and repeating a
          shortened version of it over the photograph would make the reader
          read the same thought twice before reaching anything new. */}
      <PageHero
        locale={locale}
        title={heroTitle}
        image={hero}
        imageRole="location"
        seed="about"
        measure="article"
        imageAlt={{
          en: "A clinician's hands resting on a patient's hands during a consultation",
          ar: "يدا أحد الأطباء تستندان على يدي مريض خلال استشارة",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />}
        /* The brand lock-up as this hero's second element, balancing the
           headline across the empty inline-end half. It is the mark itself, at
           size, on the hero's own background — no plate, no card, no shadow
           (docs/UI_UX_FOUNDATION.md §1.1 rules out drop shadows on the logo
           outright) and full opacity, because a logo dimmed against its own
           brand-coloured background reads as a watermark rather than as the
           clinic signing its own page.

           `--bd-lockup` is the lock-up's width and the only thing that
           changes between breakpoints; mark, gap and wordmark all scale off
           it, so the geometry is fixed and only the size moves. */
        aside={
          <BrandLockup
            locale={locale}
            className="[--bd-lockup:min(70vw,300px)] md:[--bd-lockup:clamp(240px,26vw,480px)] lg:[--bd-lockup:clamp(280px,26vw,480px)]"
          />
        }
      />

      <section className="section-y">
      <Container className="max-w-3xl">
        <h2 data-reveal="up" className="text-h3 font-heading">{copy.missionHeading}</h2>
        <p data-reveal="up" className="mt-3 text-body-lg text-text-secondary">{copy.mission}</p>

        {/* CL-031 — placed after the mission/introduction and before the
            team-facing content, which is where the client asked for it. */}
        {copy.aestheticsHeading && copy.aestheticsBody ? (
          <section>
            <h2 data-reveal="up" className="mt-10 text-h3 font-heading">{copy.aestheticsHeading}</h2>
            {copy.aestheticsBody.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} data-reveal="up" className="mt-3 text-body-lg text-text-secondary">
                {paragraph}
              </p>
            ))}
          </section>
        ) : null}

        <h2 data-reveal="up" className="mt-10 text-h3 font-heading">{copy.storyHeading}</h2>
        <p data-reveal="up" className="mt-3 text-body-lg text-text-secondary">{copy.story}</p>

        <Link
          data-reveal="up"
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
