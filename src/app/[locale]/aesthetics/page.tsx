import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, Target, Cpu } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { getBookingUrl } from "@/config/booking";
import { getRoute, href } from "@/lib/routing";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageSchema } from "@/components/shared/schema/PageSchema";

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
    },
  }[locale];

  const exploreCards = [
    { icon: Target, ...copy.byTreatment, href: href("aesthetics-treatments-hub", locale) },
    { icon: Sparkles, ...copy.byConcern, href: href("aesthetics-concerns-hub", locale) },
    { icon: Cpu, ...copy.byTechnology, href: href("aesthetics-technologies-hub", locale) },
  ];

  const ownRoute = getRoute("aesthetics-hub")!;

  return (
    <>
      <PageSchema
        locale={locale}
        name={copy.title}
        description={copy.intro}
        path={ownRoute.path[locale]}
      />
      <section className="section-y">
        <Container className="grid gap-10 lg:grid-cols-[7fr_5fr] lg:items-center">
          <div>
            <Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />

            <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{copy.title}</h1>
            <p className="mt-4 max-w-xl text-body-lg text-text-secondary">{copy.intro}</p>
            <Button size="lg" className="mt-8" render={<a href={consult.href} target="_blank" rel="noopener noreferrer" />}>
              {consult.label[locale]}
            </Button>
          </div>
          <div className="facet-corner aspect-[4/3] overflow-hidden rounded-lg">
            <ImageKitImage
              path="/blue-diamond/aesthetics/hub-hero.jpg"
              preset="treatment"
              role="treatment"
              status="pending"
              alt={{ en: "Blue Diamond Medical Aesthetics", ar: "التجميل الطبي في بلو دايموند" }}
              locale={locale}
              width={800}
              height={600}
              className="h-full w-full"
            />
          </div>
        </Container>
      </section>

      <SectionTransition from="var(--background)" to="var(--surface)" />
      <section className="section-y bg-surface">
        <Container>
          <h2 className="text-display-2 font-heading">{copy.exploreHeading}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {exploreCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group flex flex-col justify-between rounded-lg border border-border bg-background p-6 transition-colors hover:border-primary"
              >
                <div>
                  <card.icon className="size-7 text-primary" aria-hidden="true" />
                  <h3 className="mt-3 font-heading text-h4">{card.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{card.body}</p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  <ArrowRight className="size-3.5 rtl:rotate-180" />
                </span>
              </Link>
            ))}
          </div>

          <Link href={href("botox-hub", locale)} className="mt-8 inline-flex items-center gap-1 font-medium text-primary hover:text-primary-hover">
            {copy.botoxCta} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </Container>
      </section>
      <SectionTransition from="var(--surface)" to="var(--surface-dark)" />
    </>
  );
}
