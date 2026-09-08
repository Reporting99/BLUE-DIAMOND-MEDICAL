import type { Metadata } from "next";
import Link from "next/link";
import { features } from "@/config/features";
import { ArrowRight, Sparkles, Cpu } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { AestheticsHero } from "@/features/aesthetics/components/AestheticsHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { getBookingUrl } from "@/config/booking";
import { getRoute, href } from "@/lib/routing";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageSchema } from "@/components/shared/schema";
import { resolvePageHeroImage } from "@/lib/feelstack/page-hero-media";
import { manifestAsset } from "@/lib/media/image-manifest";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("aesthetics-hub", safeLocale, {
    description: {
      en: "Physician-led medical aesthetics at Blue Diamond Medical — RF microneedling, skin tightening, laser treatments, and Botox, delivered by the same clinical team.",
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
      /* CL-035 supplied this three-paragraph introduction and it was published
         verbatim. The 2026-09-08 native-Canadian-English pass edits it, on the
         same footing as CL-030/CL-031: the client has since commissioned an
         editorial pass over the whole site and named "comprehensive range",
         "designed to", "committed to delivering" and "look and feel your best"
         as the house-marketing register to remove. EVERY SERVICE NAMED IS
         PRESERVED — RF microneedling, laser treatments, radiofrequency
         procedures, laser hair removal, PRP hair restoration, PRP facial
         rejuvenation, under-eye PRP, Botox, dermal fillers. Only the sentences
         carrying them changed. Paragraph 1 carries the hero (the split hero
         stays compact, CL-033); paragraphs 2 and 3 continue in the introduction
         block immediately below it, so the full copy is present once, in order. */
      intro:
        "Blue Diamond Medical Aesthetics offers medical aesthetic treatments for the skin and for hair restoration. Our services include RF microneedling, laser treatments, radiofrequency procedures, and laser hair removal.",
      introRest: [
        "We also provide PRP treatments: PRP hair restoration, PRP facial rejuvenation, and PRP injections under the eyes to soften the appearance of dark circles and refresh the under-eye area. Botox and dermal fillers are available to soften fine lines and restore volume.",
        "Every treatment here is medically supervised and planned around you, and your physician will discuss what you can realistically expect before you begin.",
      ] as readonly string[] | null,
      exploreHeading: "Find your way in",
      byTreatment: { title: "Treatments", body: "Start from what you'd like to treat — acne scars, unwanted hair, fine lines — and see the options we offer for it." },
      byTechnology: { title: "Our Technologies", body: "The Cynosure equipment behind our treatments." },
      botoxCta: "Explore Botox services",
      pricingCta: "View aesthetics pricing",
    },
    ar: {
      title: "التجميل الطبي",
      intro:
        "يبدأ كل علاج في قسم التجميل الطبي لدى بلو دايموند باستشارة طبية. يتخصص فريقنا في الإبر الدقيقة بالترددات الراديوية، وعلاجات الليزر، وشدّ البشرة بالترددات الراديوية، وجميعها تُقدَّم من نفس العيادة التي تُدير صحة عائلتكم.",
      /* CL-035 — no approved Arabic rendering of the new three-paragraph
         introduction was supplied. The Arabic hub keeps its approved intro
         and renders no continuation block rather than publish a machine
         translation. CLIENT DEPENDENCY: approved AR copy for paragraphs 1-3. */
      introRest: null as readonly string[] | null,
      exploreHeading: "من أين تبدأ",
      byTreatment: { title: "العلاجات", body: "ابدأوا مما ترغبون في علاجه — ندبات حب الشباب، الشعر غير المرغوب فيه، الخطوط الدقيقة — واطّلعوا على الخيارات المتاحة." },
      byTechnology: { title: "تقنياتنا", body: "معدات Cynosure التي تقف خلف علاجاتنا." },
      botoxCta: "تعرّف على خدمات البوتوكس",
      pricingCta: "اطّلع على أسعار التجميل الطبي",
    },
  }[locale];

  /* Two ways in, not three. This used to offer "By Treatment" and "By
     Concern" as separate cards — the same two competing catalogues the mega
     menu carried, and the same guess it asked the visitor to make. Now the
     concern list IS the treatments list, so a third card would be a second
     link to the identical page. */
  /* The card art is repo-owned rather than CMS-assigned: these two cards
     illustrate a ROUTE, not an entity, so there is no content entry whose
     media assignment could carry them. `manifestAsset` is the single approval
     gate -- setting either entry back to `pending` in image-manifest.ts takes
     the picture off this page without touching it. */
  const exploreCards = [
    {
      icon: Sparkles,
      ...copy.byTreatment,
      href: href("aesthetics-treatments-hub", locale),
      asset: manifestAsset("aesthetics-nav-treatments"),
    },
    {
      icon: Cpu,
      ...copy.byTechnology,
      href: href("aesthetics-technologies-hub", locale),
      asset: manifestAsset("aesthetics-nav-technologies"),
    },
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
      <AestheticsHero
        locale={locale}
        title={copy.title}
        body={copy.intro}
        image={hero}
        imageRole="treatment"
        seed="aesthetics-hub"
        imageAlt={{
          en: "Medical aesthetics wellness portrait at Blue Diamond Medical",
          ar: "صورة تعبيرية للتجميل الطبي والعناية بالبشرة في بلو دايموند الطبية",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />}
        actions={
          <Button size="lg" render={<a href={consult.href!} target="_blank" rel="noopener noreferrer" />}>
            {consult.label[locale]}
          </Button>
        }
      />

      {/* CL-035 — approved paragraphs 2 and 3, immediately adjacent to the
          hero. `pt-0` keeps the hero-to-copy transition inside the CL-032
          budget: this is a continuation of the hero's own text, not a new
          section with its own leading band. */}
      {copy.introRest ? (
        <section className="section-y pt-0">
          <Container>
            <div data-reveal="up" className="max-w-[68ch] space-y-4 text-text-secondary">
              {copy.introRest.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

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
                {/* aria-hidden, exactly as the FacetTile this replaced was
                    `decorative`: the link's own heading and body already name
                    where it goes, so announcing the picture as well would add
                    a second label for one destination. The bilingual alt text
                    still travels with the asset in image-manifest.ts and on
                    the FeelStack media row. */}
                <div aria-hidden="true" className="relative aspect-[16/9] overflow-hidden">
                  <ImageKitImage
                    path={card.asset.path}
                    preset="treatment"
                    role={card.asset.role}
                    status={card.asset.status}
                    alt={card.asset.alt}
                    locale={locale}
                    width={card.asset.width}
                    height={card.asset.height}
                    seed={card.title}
                    sizes="(min-width: 640px) 33vw, 100vw"
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
