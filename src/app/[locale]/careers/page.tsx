import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";

/** Single source for this page's description: consumed by both generateMetadata
 * and the page's JSON-LD node, so the two can never drift apart (brief §9). */
const PAGE_DESCRIPTION = {
      en: "Join the team at Blue Diamond Medical Clinic in West Springs, Calgary.",
      ar: "انضموا إلى فريق عيادة بلو دايموند الطبية في ويست سبرينغز، كالغاري.",
    } as const;

import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageSchema } from "@/components/shared/schema";
import { getRoute } from "@/lib/routing";
import { resolvePageHeroImage } from "@/lib/feelstack/page-hero-media";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("careers", safeLocale, { description: PAGE_DESCRIPTION });
}

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  const copy = {
    en: {
      title: "Join Our Team",
      body: "Blue Diamond Medical is seeking qualified and eligible medical staff who are committed to exemplary patient care without sacrificing their own wellbeing. Email us your resume to apply.",
      cta: "Email your application",
    },
    ar: {
      title: "انضم إلى فريقنا",
      body: "تبحث بلو دايموند الطبية عن كوادر طبية مؤهلة وملتزمة بتقديم رعاية استثنائية للمرضى دون التفريط بعافيتها الشخصية. أرسلوا سيرتكم الذاتية عبر البريد الإلكتروني للتقديم.",
      cta: "أرسل طلبك عبر البريد الإلكتروني",
    },
  }[locale];

  const ownRoute = getRoute("careers")!;
  const hero = await resolvePageHeroImage(ownRoute.path.en, locale);

  return (
    <>
      <PageSchema
        locale={locale}
        type="WebPage"
        name={copy.title}
        description={PAGE_DESCRIPTION[locale]}
        path={ownRoute.path[locale]}
      />
      {/* Careers is a one-idea page: the hero IS the page. Everything it used
          to render below the fold — the paragraph and the mailto button — is
          in the hero itself rather than repeated under it. */}
      <PageHero
        locale={locale}
        title={copy.title}
        body={copy.body}
        image={hero}
        imageRole="location"
        seed="careers"
        imageAlt={{
          en: "A clinical team reviewing notes together around a table",
          ar: "فريق طبي يراجع الملاحظات معًا حول طاولة",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />}
        actions={
          <Button size="lg" render={<a href={`mailto:${siteConfig.careersEmail}`} />}>
            <Mail className="me-1 size-4" aria-hidden="true" />
            {copy.cta}
          </Button>
        }
      />
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
