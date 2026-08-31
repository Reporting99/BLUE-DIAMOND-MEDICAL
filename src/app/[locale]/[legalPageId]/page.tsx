import type { Metadata } from "next";
import { cmsPathForLocale } from "@/lib/routing";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { features } from "@/config/features";
import { getLegalPage } from "@/features/legal";
import { LegalPageTemplate } from "@/features/legal";
import { getRouteMetadata } from "@/lib/seo/metadata";
import { resolvePageContent, entityCacheTags } from "@/lib/feelstack/page-resolver";
import { cacheTags } from "@/lib/feelstack/cache-tags";

/**
 * Feature-flagged off (`legalPagesEnabled`) — see src/features/legal/data.ts.
 * Belt-and-suspenders: even if the flag were flipped on prematurely, a
 * page with an empty `body` still 404s rather than publishing blank legal
 * text (brief §25 forbids empty "Coming soon" legal pages).
 *
 * Lives at the locale root (e.g. /en/terms, matching the legacy redirect
 * targets in brief §33) rather than nested under another hub. A literal
 * sibling folder (medical, aesthetics, doctors, etc.) always takes
 * routing precedence over this dynamic segment, so it only ever catches
 * requests that don't match any other top-level route.
 */
export function generateStaticParams() {
  return []; // nothing pre-rendered while disabled — see notFound() below
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
async function loadLegalPage(id: string, locale: Locale) {
  // FeelStack registers the Arabic route under its Arabic slug, so ask
  // for THIS locale's path rather than the English one. See cmsPathForLocale.
  const cmsPath = cmsPathForLocale(`/${id}`, locale);
  const resolution = await resolvePageContent({
    path: cmsPath,
    locale,
    staticFallback: () => getLegalPage(id),
    tags: entityCacheTags({
      detail: cacheTags.legalPage,
      index: cacheTags.legalPagesIndex,
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
  params: Promise<{ locale: string; legalPageId: string }>;
}): Promise<Metadata> {
  if (!features.legalPagesEnabled) return {};
  const { locale: rawLocale, legalPageId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const page = await loadLegalPage(legalPageId, locale);
  if (!page) return {};

  return getRouteMetadata(`legal-${page.id}`, locale, {
    description: { en: page.title.en, ar: page.title.ar },
  });
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string; legalPageId: string }>;
}) {
  if (!features.legalPagesEnabled) notFound();

  const { locale: rawLocale, legalPageId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const page = await loadLegalPage(legalPageId, locale);
  if (!page || !page.body.en || !page.body.ar) notFound();

  return <LegalPageTemplate page={page} locale={locale} />;
}
