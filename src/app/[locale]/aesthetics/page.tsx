import type { Metadata } from "next";
import Link from "next/link";
import { features } from "@/config/features";
import { ArrowRight, Sparkles, Target, Cpu } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { FacetTile } from "@/components/shared/FacetTile";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { getBookingUrl } from "@/config/booking";
import { getRoute, href } from "@/lib/routing";
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
  return getRouteMetadata("aesthetics-hub", safeLocale, {
    description: {
      en: "Physician-led medical aesthetics at Blue Diamond Medical — RF micro-needling, skin tightening, laser treatments, and Botox, delivered by the same clinical team.",
      ar: "تجميل طبي بإشراف طبي في بلو دايموند الطبية — الإبر الدقيقة بالترددات الراديوية، وشدّ البشرة، وعلاجات الليزر، والبوتوكس، بواسطة نفس الفريق السريري.",
    },
  });
}

export default async function AestheticsHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const consult = getBookingUrl("aesthetics-consultation");

  const copy = {
    en: {
      title: "Medical Aesthetics",
      intro:
        "Every treatment at Blue Diamond Medical Aesthetics begins with a physician consultation. Our team specializes in RF micro-needling, laser treatments, and radio-frequency skin tightening, all delivered from the same clinic that manages your family's health.",
      exploreHeading: "Find your way in",
      byTreatment: { title: "By Treatment", body: "Browse every procedure we offer, from laser hair removal to PRP therapy." },
      byConcern: { title: "By Concern", body: "Start from what's bothering you — acne scars, redness, fine lines — and see what treats it." },
      byTechnology: { title: "Our Technologies", body: "The Cynosure equipment behind our treatments." },
      botoxCta: "Explore Botox services",
      pricingCta: "View aesthetics pricing",
    },
    ar: {
      title: "التجميل الطبي",
      intro:
        "يبدأ كل علاج في قسم التجميل الطبي لدى بلو دايموند باستشارة طبية. يتخصص فريقنا في الإبر الدقيقة بالترددات الراديوية، وعلاجات الليزر، وشدّ البشرة بالترددات الراديوية، وجميعها تُقدَّم من نفس العيادة التي تُدير صحة عائلتكم.",
      exploreHeading: "من أين تبدأ",
      byTreatment: { title: "حسب العلاج", body: "تصفّحوا جميع الإجراءات التي نقدّمها، من إزالة الشعر بالليزر إلى علاج البلازما." },
      byConcern: { title: "حسب المخاوف", body: "ابدأوا مما يقلقكم — ندبات حب الشباب، الاحمرار، الخطوط الدقيقة — واكتشفوا العلاج المناسب." },
      byTechnology: { title: "تقنياتنا", body: "معدات Cynosure التي تقف خلف علاجاتنا." },
      botoxCta: "تعرّف على خدمات البوتوكس",
      pricingCta: "اطّلع على أسعار التجميل الطبي",
    },
  }[locale];

  const exploreCards = [
    { icon: Target, ...copy.byTreatment, href: href("aesthetics-treatments-hub", locale) },
    { icon: Sparkles, ...copy.byConcern, href: href("aesthetics-concerns-hub", locale) },
    { icon: Cpu, ...copy.byTechnology, href: href("aesthetics-technologies-hub", locale) },
  ];

  const ownRoute = getRoute("aesthetics-hub")!;
  const hero = await resolvePageHeroImage("/aesthetics", locale);

  return (
    <>
      <PageSchema
        locale={locale}
        name={copy.title}
        description={copy.intro}
        path={ownRoute.path[locale]}
      />
      {/* The hero used to be a two-column band: copy beside a FacetTile
          clipped into a rounded card. That reads as a text block next to a
          decorative box, not as a hero — the same composition the homepage
          replaced. One full-bleed visual with the copy laid over its calm
          side is the pattern now, sitewide. */}
      <PageHero
        locale={locale}
        title={copy.title}
        body={copy.intro}
        image={hero}
        imageRole="treatment"
        seed="aesthetics-hub"
        /* The one route on the site art-directed as two halves: the supplied
           photograph on the inline-end side, the facet background holding the
           other, the copy against the inline-start edge. In Arabic that is the
           picture on the left with the Arabic copy on the right, which is the
           approved composition; in English the same rule mirrors. Opt-in per
           page (see PageHero) so the other twenty routes are untouched, and
           self-disabling until this page's hero assignment is an approved
           photograph. */
        mediaLayout="split"
        imageAlt={{
          en: "Medical aesthetics wellness portrait at Blue Diamond Medical",
          ar: "صورة تعبيرية للتجميل الطبي والعناية بالبشرة في بلو دايموند الطبية",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />}
        actions={
          <Button size="lg" render={<a href={consult.href} target="_blank" rel="noopener noreferrer" />}>
            {consult.label[locale]}
          </Button>
        }
      />

      <SectionTransition from="var(--background)" to="var(--surface)" />
      <section className="section-y bg-surface">
        <Container>
          <h2 data-reveal="up" className="text-display-2 font-heading">{copy.exploreHeading}</h2>
          {/* Three route-in cards. Each carries a facet visual band rather than
              opening on flat card stock — the icon still names the route, but
              the card now has something to look at above the words. */}
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {exploreCards.map((card, i) => (
              <Link
                key={card.title}
                data-reveal="up"
                data-reveal-delay={String(i % 3)}
                href={card.href}
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-[border-color,box-shadow] duration-[var(--motion-normal)] ease-[var(--motion-ease)] hover:border-primary hover:shadow-[0_10px_30px_rgba(29,86,120,0.10)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <FacetTile
                    role="treatment"
                    seed={card.title}
                    decorative
                    className="h-full w-full transition-transform duration-[600ms] ease-[var(--motion-ease)] group-hover:scale-[1.04]"
                  />
                  {/* The icon sits on the visual, in a solid disc, so it reads
                      at any point of the facet composition behind it. */}
                  <span className="absolute bottom-3 start-4 flex size-11 items-center justify-center rounded-full bg-background shadow-[0_2px_10px_rgba(29,86,120,0.18)]">
                    <card.icon className="size-5 text-primary" aria-hidden="true" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-heading text-h4">{card.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{card.body}</p>
                  <span aria-hidden="true" className="mt-auto" />
                  <span className="inline-flex items-center gap-1 pt-4 text-sm font-medium text-primary">
                    <ArrowRight className="size-3.5 transition-transform duration-[var(--motion-normal)] group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div data-reveal="up" className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            <Link href={href("botox-hub", locale)} className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover">
              {copy.botoxCta} <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
            {/* Published price list — gated with the same flag as the page itself
                so this never links to a 404 while pricing is withdrawn. */}
            {features.aestheticPricingEnabled ? (
              <Link
                href={href("aesthetics-pricing", locale)}
                className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover"
              >
                {copy.pricingCta} <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            ) : null}
          </div>
        </Container>
      </section>
      <SectionTransition from="var(--surface)" to="var(--surface-dark)" />
    </>
  );
}
