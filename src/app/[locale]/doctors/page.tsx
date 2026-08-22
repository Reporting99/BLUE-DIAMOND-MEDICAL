import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { ImageKitImage } from "@/components/media/ImageKitImage";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute } from "@/config/routes";
import { doctors } from "@/types/doctor";
import { getRouteMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return getRouteMetadata("doctors-index", safeLocale, {
    description: {
      en: "Meet the six family physicians of Blue Diamond Medical Clinic in West Springs, Calgary.",
      ar: "تعرّفوا على أطباء الأسرة الستة في عيادة بلو دايموند الطبية في ويست سبرينغز، كالغاري.",
    },
  });
}

export default async function DoctorsIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const heading = locale === "ar" ? "أطباؤنا" : "Our Doctors";
  const intro =
    locale === "ar"
      ? "ستة أطباء أسرة يقدّمون رعاية شاملة لعائلتكم، بعضهم يقدّم أيضًا خدمات التجميل الطبي وحقن البوتوكس."
      : "Six family physicians providing comprehensive care for your family — several also deliver medical aesthetics and Botox.";

  return (
    <>
      <section className="section-y">
      <Container>
        <h1 className="text-display-1 font-heading lg:text-display-1-lg">{heading}</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-text-secondary">{intro}</p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => {
            const route = getRoute(doctor.routeId)!;
            return (
              <Link
                key={doctor.id}
                href={`/${locale}${route.path[locale]}`}
                className="group block overflow-hidden rounded-lg border border-border"
              >
                <div className="facet-corner-sm relative aspect-[4/5] overflow-hidden">
                  <ImageKitImage
                    path={doctor.image.path}
                    preset="doctor-card"
                    role="doctor"
                    status={doctor.image.status}
                    alt={{ en: `Portrait of ${doctor.name.en}`, ar: `صورة ${doctor.name.ar}` }}
                    locale={locale}
                    width={480}
                    height={600}
                    className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  <p className="font-heading text-h4">{doctor.name[locale]}</p>
                  <p className="mt-1 text-sm text-text-secondary">{doctor.credentials[locale]}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
      </section>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
