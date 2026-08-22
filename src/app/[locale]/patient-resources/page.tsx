import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { isLocale, type Locale } from "@/i18n/config";
import { getRouteMetadata } from "@/lib/seo/metadata";

/** Single source for this page's description: consumed by both generateMetadata
 * and the page's JSON-LD node, so the two can never drift apart (brief §9). */
const PAGE_DESCRIPTION = {
      en: "Clinic policies, no-show fees, prescription refills, and confidentiality at Blue Diamond Medical Clinic.",
      ar: "سياسات العيادة، ورسوم عدم الحضور، وتجديد الوصفات، والسرّية في عيادة بلو دايموند الطبية.",
    } as const;

import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { PageSchema } from "@/components/seo/PageSchema";
import { getRoute } from "@/config/routes";

const policies = {
  en: [
    {
      title: "Appointments",
      body: "Arrive on time — patients more than 5 minutes late may need to rebook at the doctor's discretion. Bring your Alberta Healthcare number to every visit. Standard appointments are 15 minutes; call at least 48 hours ahead for a longer appointment.",
    },
    {
      title: "No-show fees",
      body: "Confirm your attendance via the reminder system. If you miss a confirmed appointment, no-show fees apply (from $40 for a regular visit up to $200 for paediatric appointments).",
    },
    {
      title: "Prescription refills",
      body: "New medications require an in-person visit. To renew an existing prescription, ask your pharmacy to fax a renewal request to +1 (587) 443-0394 — allow 2 business days.",
    },
    {
      title: "Confidentiality",
      body: "We never share your information with a third party — including insurers, lawyers, or other clinics — without your express written permission.",
    },
  ],
  ar: [
    {
      title: "المواعيد",
      body: "يرجى الحضور في الموعد المحدد — قد لا يُستقبل من يتأخر أكثر من 5 دقائق وقد يُطلب حجز موعد جديد وفق تقدير الطبيب. أحضروا رقم التأمين الصحي الألبرتي في كل زيارة. مدة الموعد المعتاد 15 دقيقة؛ يرجى الاتصال قبل 48 ساعة على الأقل لحجز موعد أطول.",
    },
    {
      title: "رسوم عدم الحضور",
      body: "يرجى تأكيد حضوركم عبر نظام التذكير. في حال عدم الحضور لموعد مؤكَّد، تُطبَّق رسوم عدم الحضور (من 40 دولارًا للزيارة العادية وحتى 200 دولار لمواعيد الأطفال).",
    },
    {
      title: "تجديد الوصفات الطبية",
      body: "تتطلب الأدوية الجديدة زيارة حضورية. لتجديد وصفة قائمة، اطلبوا من الصيدلية إرسال طلب تجديد عبر الفاكس إلى 443-0394 (587) 1+ — يستغرق الأمر يومي عمل.",
    },
    {
      title: "السرّية",
      body: "لا نُشارك معلوماتكم مع أي طرف ثالث — بما في ذلك شركات التأمين أو المحامين أو عيادات أخرى — دون إذن كتابي صريح منكم.",
    },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("patient-resources-hub", safeLocale, { description: PAGE_DESCRIPTION });
}

export default async function PatientResourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const title = locale === "ar" ? "موارد المرضى" : "Patient Resources";

  const ownRoute = getRoute("patient-resources-hub")!;

  return (
    <>
      <PageSchema
        locale={locale}
        type="WebPage"
        name={title}
        description={PAGE_DESCRIPTION[locale]}
        path={ownRoute.path[locale]}
      />
      <section className="section-y">
      <Container>
        <Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />

        <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{title}</h1>
        <div className="mt-10 divide-y divide-border border-y border-border">
          {policies[locale].map((policy) => (
            <div key={policy.title} className="grid gap-2 py-6 lg:grid-cols-[280px_1fr] lg:gap-8">
              <h2 className="text-h4 font-heading">{policy.title}</h2>
              <p className="text-body text-text-secondary">{policy.body}</p>
            </div>
          ))}
        </div>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
