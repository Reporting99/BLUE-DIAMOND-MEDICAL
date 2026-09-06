import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SectionTransition } from "@/components/layout/SectionTransition";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { PhysicianSchema } from "@/components/shared/schema";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { doctors, getDoctor, portraitForLocale, DOCTOR_AVAILABILITY_NOTE } from "@/features/doctors";
import { AccessOptions } from "@/components/shared/AccessOptions";
import { siteConfig } from "@/config/site";
import { getRoute, href, cmsPathForLocale } from "@/lib/routing";
import { resolvePageContent, entityCacheTags } from "@/lib/feelstack/page-resolver";
import { cacheTags } from "@/lib/feelstack/cache-tags";
import { doctorCmsContract } from "@/features/doctors/cms-contract";

/**
 * Canonical English-slug route for every doctor, in both locales — the
 * pretty Arabic URL (e.g. /ar/فريقنا/محمد-فرحات) is rewritten to this
 * physical path by src/proxy.ts. See docs/ROUTING.md.
 */
export function generateStaticParams() {
  return locales.flatMap((locale) => doctors.map((doctor) => ({ locale, doctorId: doctor.id })));
}


/**
 * Hybrid FeelStack resolution for this entity type, following the reference
 * pattern in medical/[serviceId]. In the default FEELSTACK_CONTENT_MODE=static
 * this never touches the network: resolvePageContent goes straight to
 * staticFallback(), so behaviour is unchanged from before this pass.
 *
 * The tags are what let the publish webhook invalidate this entry — see
 * entityCacheTags() in page-resolver.ts.
 */
async function loadDoctor(id: string, locale: Locale) {
  // FeelStack registers the Arabic route under its Arabic slug, so ask
  // for THIS locale's path rather than the English one. See cmsPathForLocale.
  const cmsPath = cmsPathForLocale(`/our-team/${id}`, locale);
  const resolution = await resolvePageContent({
    path: cmsPath,
    locale,
    contract: doctorCmsContract,
    staticFallback: () => getDoctor(id),
    tags: entityCacheTags({
      detail: cacheTags.doctor,
      index: cacheTags.doctorsIndex,
      locale,
      id,
      path: cmsPath,
    }),
  });
  return resolution.source === "not-found" ? undefined : resolution.data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; doctorId: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, doctorId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const doctor = await loadDoctor(doctorId, locale);
  if (!doctor) return {};

  const route = getRoute(doctor.routeId);
  const enUrl = `${siteConfig.url}/en${route?.path.en ?? `/our-team/${doctor.id}`}`;
  // Public Arabic URL uses the pretty slug — proxy.ts rewrites it to this
  // same canonical path internally, but the alternate link must point at
  // the address a visitor/crawler actually sees.
  //
  // Both fallbacks are unreachable for the six registered doctors and exist
  // only so an unregistered one still yields a URL rather than "undefined".
  // The Arabic one is a genuine last resort, not a correct answer: it emits a
  // LATIN path under /ar, which proxy.ts 301s to the Arabic canonical — i.e. a
  // canonical/hreflang target that redirects. The registry is the real source
  // for both, which is why `route` is consulted first.
  const arUrl = `${siteConfig.url}/ar${route?.path.ar ?? `/our-team/${doctor.id}`}`;

  return {
    title: doctor.name[locale],
    description: doctor.bio[locale].slice(0, 155),
    alternates: {
      canonical: locale === "ar" ? arUrl : enUrl,
      languages: { "en-CA": enUrl, "ar-CA": arUrl, "x-default": enUrl },
    },
  };
}

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ locale: string; doctorId: string }>;
}) {
  const { locale: rawLocale, doctorId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const doctor = await loadDoctor(doctorId, locale);
  if (!doctor) notFound();

  const ownRoute = getRoute(doctor.routeId);
  const doctorsHub = getRoute("doctors-index")!;
  // CL-025 — a locale-restricted portrait resolves to the branded FacetTile
  // here rather than being rendered in a locale it does not belong to.
  const portrait = portraitForLocale(doctor, locale);
  /* CL-028 — the approved biographies are multi-paragraph. The field is one
     string with blank-line separators, so it is split at render time; every
     single-paragraph biography yields exactly one paragraph and is unchanged. */
  const bioParagraphs = doctor.bio[locale].split(/\n{2,}/).filter(Boolean);

  return (
    <>
      {ownRoute ? <PhysicianSchema doctor={doctor} locale={locale} path={ownRoute.path[locale]} /> : null}
      <article className="section-y">
      <Container className="grid gap-10 lg:grid-cols-[5fr_7fr] lg:items-start">
        <div className="facet-corner aspect-[4/5] overflow-hidden rounded-lg lg:sticky lg:top-24">
          <ImageKitImage
            path={portrait.path}
            preset="doctor"
            role="doctor"
            status={portrait.status}
            alt={{ en: `Portrait of ${doctor.name.en}`, ar: `صورة ${doctor.name.ar}` }}
            locale={locale}
            width={640}
            height={800}
            seed={doctor.id}
            className="h-full w-full"
          />
        </div>

        <div>
          <Breadcrumbs
            locale={locale}
            items={[
              { label: doctorsHub.title[locale], href: href("doctors-index", locale) },
              { label: doctor.name[locale] },
            ]}
          />

          <h1 className="mt-4 text-display-1 font-heading lg:text-display-1-lg">{doctor.name[locale]}</h1>
          <p className="mt-2 text-body-lg text-primary">{doctor.credentials[locale]}</p>
          <div className="mt-6 max-w-2xl space-y-4 text-body-lg text-text-secondary">
            {bioParagraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {/* CL-027 — the availability line sits directly under the biography,
              on every physician profile, from one shared constant. */}
          <p className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white">
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-white" />
            {DOCTOR_AVAILABILITY_NOTE[locale]}
          </p>

          {/* CL-026 — the "Services this physician provides" block is gone.
              It was populated from the services whose approved copy happened
              to name a doctor, so a physician linked only from After-Hours
              Care appeared to provide nothing else. Every family physician
              here provides the full family-medicine list, and the Medical Care
              hub is where that list lives; a per-doctor subset could only
              understate it. The booking and aesthetics actions the block sat
              beside are preserved below. */}

          {/* CL-027 — online, phone and in-person access, with the correct
              destination per patient type (CL-005/CL-006/CL-007). */}
          <AccessOptions
            locale={locale}
            className="mt-8 max-w-2xl"
            channels={[
              { channel: "family-doctor", audience: "registered" },
              { channel: "walk-in", audience: "new-patient" },
              ...(doctor.practicesAesthetics
                ? [{ channel: "aesthetics-consultation" as const, audience: "aesthetics" as const }]
                : []),
            ]}
          />

          {doctor.practicesAesthetics ? (
            <div className="mt-6 flex flex-wrap gap-4">
              <Button size="lg" variant="outline" render={<Link href={href("aesthetics-hub", locale)} />}>
                {locale === "ar" ? "خدمات التجميل الطبي" : "Medical aesthetics services"}
              </Button>
            </div>
          ) : null}

        </div>
      </Container>
      </article>
      <SectionTransition from="var(--background)" to="var(--surface-dark)" />
    </>
  );
}
