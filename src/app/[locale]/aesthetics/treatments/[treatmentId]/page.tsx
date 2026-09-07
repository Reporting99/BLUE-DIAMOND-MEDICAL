import type { Metadata } from "next";
import { cmsPathForLocale } from "@/lib/routing";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/i18n/config";
import { treatments, getTreatment, getGatedTreatment } from "@/features/aesthetics";
import { AestheticTreatmentTemplate } from "@/features/aesthetics";
import { concerns, getConcern, ConcernTemplate } from "@/features/concerns";
import { getTechnologiesForConcern } from "@/features/concerns/queries";
import {
  resolveTechnologyListingMedia,
  technologyCardImages,
} from "@/features/technologies/media";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { features, type FeatureFlags } from "@/config/features";
import { resolvePageContent, entityCacheTags } from "@/lib/feelstack/page-resolver";
import { cacheTags } from "@/lib/feelstack/cache-tags";
import { aestheticTreatmentCmsContract } from "@/features/aesthetics/cms-contract";
import { aestheticConcernCmsContract, concernCmsPath } from "@/features/concerns/cms-contract";
import { concernRepoArt } from "@/features/concerns/media";
import { approvedManifestAsset } from "@/lib/media/image-manifest";

/**
 * /aesthetics/treatments/<slug> serves TWO entity types.
 *
 * The Aesthetics IA is concern-first: the Treatments menu lists what a visitor
 * wants treated (Acne Scars, Skin Laxity, …), and each of those concern pages
 * surfaces the treatment options for it. The individual treatment pages
 * (RF Micro-Needling, Laser Skin Treatments, …) are still live and still
 * indexed at their original URLs — they left the navigation, not the site —
 * so both kinds of page now live in this one segment. See the concern block in
 * src/config/routes.ts, which also asserts at build time that no concern slug
 * collides with a treatment slug.
 *
 * Which one a slug is, is decided from the static registries before anything
 * is loaded, so a concern never costs a speculative treatment lookup (or a
 * speculative CMS round trip in FEELSTACK_CONTENT_MODE=hybrid) on its way to
 * the right loader.
 */
type EntityKind = "treatment" | "concern" | "gated-treatment";

function entityKind(slug: string): EntityKind | undefined {
  if (treatments.some((t) => t.slug === slug)) return "treatment";
  if (concerns.some((c) => c.slug === slug)) return "concern";
  if (getGatedTreatment(slug)) return "gated-treatment";
  return undefined;
}

// Only published treatments and concerns are statically pre-rendered. Gated
// treatments (see src/features/aesthetics/data/treatments.ts) are intentionally
// excluded here — if their feature flag is ever enabled, the page still
// resolves correctly on demand (Next.js falls back to dynamic rendering for a
// param combo outside generateStaticParams), it just isn't pre-built while
// disabled.
export function generateStaticParams() {
  return locales.flatMap((locale) => [
    ...treatments.map((t) => ({ locale, treatmentId: t.slug })),
    ...concerns.map((c) => ({ locale, treatmentId: c.slug })),
  ]);
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
async function loadTreatment(id: string, locale: Locale) {
  // FeelStack registers the Arabic route under its Arabic slug, so ask
  // for THIS locale's path rather than the English one. See cmsPathForLocale.
  const cmsPath = cmsPathForLocale(`/aesthetics/treatments/${id}`, locale);
  const resolution = await resolvePageContent({
    path: cmsPath,
    locale,
    contract: aestheticTreatmentCmsContract,
    staticFallback: () => getTreatment(id),
    tags: entityCacheTags({
      detail: cacheTags.aestheticTreatment,
      index: cacheTags.aestheticTreatmentsIndex,
      locale,
      id,
      path: cmsPath,
    }),
  });
  if (resolution.source === "not-found") return undefined;
  const treatment = resolution.data;
  /* The CMS assignment wins whenever there is one. This only fills the gap for
     a treatment whose artwork the repository owns because no publishable
     assignment could be written for it — today that is TempSure Vitalia; see
     `approvedManifestAsset` and docs/MEDIA.md. */
  return treatment.image ? treatment : { ...treatment, image: approvedManifestAsset(`treatment-${id}`) };
}

/**
 * The concern's CMS path is deliberately NOT its public path.
 *
 * FeelStack registered these entries under /aesthetics/concerns/<slug> and
 * this repository does not get to rename someone else's routes; the public URL
 * moved into /aesthetics/treatments on its own. Asking the CMS for the public
 * path would resolve nothing and silently drop every concern page's media, so
 * the request keeps using the CMS's own path — which is also what
 * cmsPathForLocale needs in order to find the Arabic alternate in
 * localized-entity-routes.generated.ts.
 */
async function loadConcern(id: string, locale: Locale) {
  const cmsPath = cmsPathForLocale(concernCmsPath(id), locale);
  const resolution = await resolvePageContent({
    path: cmsPath,
    locale,
    contract: aestheticConcernCmsContract,
    staticFallback: () => getConcern(id),
    tags: entityCacheTags({
      detail: cacheTags.concern,
      index: cacheTags.concernsIndex,
      locale,
      id,
      path: cmsPath,
    }),
  });
  if (resolution.source === "not-found") return undefined;
  const concern = resolution.data;
  /* Same rule as the explorer: the assignment first, the repo's own artwork
     only for the two concerns that have no publishable CMS entry to carry
     one. See `concernRepoArt`. */
  return concern.image ? concern : { ...concern, image: concernRepoArt(id) };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; treatmentId: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, treatmentId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  if (entityKind(treatmentId) === "concern") {
    const concern = await loadConcern(treatmentId, locale);
    if (!concern) return {};
    return getRouteMetadata(`concern-${concern.id}`, locale, {
      description: { en: concern.summary.en, ar: concern.summary.ar },
    });
  }

  const treatment = await loadTreatment(treatmentId, locale);
  if (!treatment) return {};

  return getRouteMetadata(`treatment-${treatment.id}`, locale, {
    description: { en: treatment.summary.en, ar: treatment.summary.ar },
  });
}

export default async function AestheticsTreatmentsPage({
  params,
}: {
  params: Promise<{ locale: string; treatmentId: string }>;
}) {
  const { locale: rawLocale, treatmentId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  if (entityKind(treatmentId) === "concern") {
    const concern = await loadConcern(treatmentId, locale);
    if (!concern) notFound();
    /* The concern's own resolve returns the concern's media, not the media of
       the devices it links to — and the closing results section shows one. So
       the technologies this concern can surface are resolved alongside it, the
       same fan-out the concerns explorer uses for its own listing. In static
       content mode this is a no-op returning {} and the device frame falls back
       to its FacetTile. */
    const technologies = getTechnologiesForConcern(concern.id);
    const technologyImages = technologyCardImages(
      await resolveTechnologyListingMedia(technologies, locale),
      technologies,
    );
    return <ConcernTemplate concern={concern} locale={locale} technologyImages={technologyImages} />;
  }

  const treatment = await loadTreatment(treatmentId, locale);
  if (treatment) {
    return <AestheticTreatmentTemplate treatment={treatment} locale={locale} />;
  }

  // Fully built but feature-flagged off — see src/features/aesthetics/data/treatments.ts
  // `gatedTreatments` and docs/CONTENT_MODEL.md.
  const gated = getGatedTreatment(treatmentId);
  if (gated && features[gated.requiresFeature as keyof FeatureFlags]) {
    return <AestheticTreatmentTemplate treatment={gated} locale={locale} />;
  }

  notFound();
}

export const dynamicParams = true;
