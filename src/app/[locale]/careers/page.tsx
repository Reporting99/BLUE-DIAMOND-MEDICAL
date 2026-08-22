import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Button } from "@/components/ui/button";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("careers", safeLocale, {
    description: {
      en: "Join the team at Blue Diamond Medical Clinic in West Springs, Calgary.",
      ar: "انضموا إلى فريق عيادة بلو دايموند الطبية في ويست سبرينغز، كالغاري.",
    },
  });
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

  return (
    <>
      <section className="section-y">
      <Container className="max-w-2xl">
        <h1 className="text-display-1 font-heading lg:text-display-1-lg">{copy.title}</h1>
        <p className="mt-4 text-body-lg text-text-secondary">{copy.body}</p>
        <Button size="lg" className="mt-8" render={<a href={`mailto:${siteConfig.careersEmail}`} />}>
          <Mail className="me-1 size-4" aria-hidden="true" />
          {copy.cta}
        </Button>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
