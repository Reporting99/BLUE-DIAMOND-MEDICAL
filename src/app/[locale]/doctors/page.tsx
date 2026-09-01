import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { isLocale, type Locale } from "@/i18n/config";
import { getRoute } from "@/lib/routing";
import { doctors } from "@/features/doctors";
import { resolveListingMedia } from "@/lib/feelstack/listing-media";
import { resolveSlotImageRef, cmsAlt } from "@/lib/feelstack/media-slots";
import { cacheTags } from "@/lib/feelstack/cache-tags";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PageSchema } from "@/components/shared/schema";
import { resolvePageHeroImage } from "@/lib/feelstack/page-hero-media";
import { siteConfig } from "@/config/site";

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

  // Listing media. Without this the index renders a FacetTile for a doctor
  // whose detail page one click away renders a real portrait -- same person,
  // same assignment, different consumer. See lib/feelstack/listing-media.ts.
  const listingMedia = await resolveListingMedia(
    doctors.map((d) => ({ id: d.id, englishPath: `/doctors/${d.id}` })),
    locale,
    [cacheTags.doctorsIndex(process.env.FEELSTACK_SITE_KEY ?? "", locale)],
  );
  const heading = locale === "ar" ? "أطباؤنا" : "Our Doctors";
  const intro =
    locale === "ar"
      ? "ستة أطباء أسرة يقدّمون رعاية شاملة لعائلتكم، بعضهم يقدّم أيضًا خدمات التجميل الطبي وحقن البوتوكس."
      : "Six family physicians providing comprehensive care for your family — several also deliver medical aesthetics and Botox.";

  const ownRoute = getRoute("doctors-index")!;
  // Built from the same `doctors` array the grid below maps over, so the
  // structured list can never drift from the visibly rendered one.
  const items = doctors.flatMap((doctor) => {
    const route = getRoute(doctor.routeId);
    return route ? [{ name: doctor.name[locale], url: `${siteConfig.url}/${locale}${route.path[locale]}` }] : [];
  });

  const hero = await resolvePageHeroImage(ownRoute.path.en, locale);

  return (
    <>
      <PageSchema
        locale={locale}
        name={heading}
        description={intro}
        path={ownRoute.path[locale]}
        items={items}
      />
      {/* NOTE the `imageRole`: "location", not "doctor". This hero must never
          resolve to, or stand in for, a portrait. Physician photography is
          uploaded and approved by the clinic, and the one thing this build
          will not do is put a generated or stock face on a doctors page --
          docs/UI_UX_FOUNDATION.md §18. A clinic-context visual is the honest
          backdrop for a page whose subjects are real people. */}
      <PageHero
        locale={locale}
        title={heading}
        body={intro}
        image={hero}
        imageRole="location"
        seed="doctors-index"
        imageAlt={{
          en: "Blue Diamond Medical Clinic, West Springs, Calgary",
          ar: "عيادة بلو دايموند الطبية، ويست سبرينغز، كالغاري",
        }}
        breadcrumbs={<Breadcrumbs locale={locale} items={[{ label: ownRoute.title[locale] }]} />}
      />

      <section className="section-y">
      <Container>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor, index) => {
            const route = getRoute(doctor.routeId)!;
            // photoDeclined / disabled still beat the assignment, evaluated in
            // the same central resolver the detail page uses.
            const portrait = resolveSlotImageRef({
              media: listingMedia[doctor.id] ?? [],
              slot: "doctorPortrait",
              override: doctor.image,
              fallback: doctor.image,
            });
            const assigned = (listingMedia[doctor.id] ?? []).find((m) => m.slot === "doctorPortrait");
            return (
              <Link
                key={doctor.id}
                data-reveal="up"
                data-reveal-delay={String(index % 3)}
                href={`/${locale}${route.path[locale]}`}
                className="group block overflow-hidden rounded-lg border border-border transition-[border-color,box-shadow] duration-[var(--motion-normal)] ease-[var(--motion-ease)] hover:border-primary hover:shadow-[0_10px_30px_rgba(29,86,120,0.10)]"
              >
                <div className="facet-corner-sm relative aspect-[4/5] overflow-hidden">
                  <ImageKitImage
                    path={portrait.path}
                    preset="doctor-card"
                    role="doctor"
                    status={portrait.status}
                    alt={
                      cmsAlt(assigned) ?? {
                        en: `Portrait of ${doctor.name.en}`,
                        ar: `صورة ${doctor.name.ar}`,
                      }
                    }
                    locale={locale}
                    width={480}
                    height={600}
                    seed={doctor.id}
                    className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  {/* h2, not p: the doctor's name is this card's primary
                      information, and a listing of six name-only <p> elements
                      gives a crawler no structural signal that these are the
                      page's enumerated entities (brief §12). Same classes, so
                      the rendered appearance is byte-identical. */}
                  <h2 className="font-heading text-h4">{doctor.name[locale]}</h2>
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
