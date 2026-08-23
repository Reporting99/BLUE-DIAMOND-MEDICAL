import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { FeeTable } from "@/features/medical-services";
import { noShowFees, uninsuredFeeGroups } from "@/features/medical-services";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute, href } from "@/lib/routing";
import { getRouteMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("medical-uninsured-services", safeLocale, {
    description: {
      en: "Fees for uninsured medical services, forms, and administrative tasks at Blue Diamond Medical Clinic, plus no-show fees.",
      ar: "رسوم الخدمات والنماذج والمهام الإدارية غير المشمولة بالتأمين الصحي في عيادة بلو دايموند الطبية، إضافةً إلى رسوم عدم الحضور.",
    },
  });
}

export default async function UninsuredServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const medicalRoute = getRoute("medical-hub")!;

  const copy = {
    en: {
      title: "Uninsured Services & Fees",
      intro:
        "A number of services your family doctor provides are not covered by Alberta Health Services. All fees must be paid in full before documents are released.",
    },
    ar: {
      title: "الخدمات والرسوم غير المشمولة بالتأمين الصحي",
      intro: "عدد من الخدمات التي يقدمها طبيب أسرتكم غير مشمولة بالتأمين الصحي لألبرتا. يجب سداد جميع الرسوم كاملة قبل تسليم المستندات.",
    },
  }[locale];

  return (
    <>
      <article className="section-y">
      <Container>
        <Breadcrumbs
          locale={locale}
          items={[{ label: medicalRoute.title[locale], href: href("medical-hub", locale) }, { label: copy.title }]}
        />

        <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-text-secondary">{copy.intro}</p>

        <FeeTable group={noShowFees} locale={locale} />
        {uninsuredFeeGroups.map((group) => (
          <FeeTable key={group.heading.en} group={group} locale={locale} />
        ))}
      </Container>
      </article>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
