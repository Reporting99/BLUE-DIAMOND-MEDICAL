import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { pathnameFrom, redirectOrNotFound } from "@/lib/feelstack/redirect-or-404";
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
  const cmsPath = `/${id}`;
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
  const { locale: rawLocale, legalPageId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";

  // While legal pages are disabled this route is the de-facto handler for
  // EVERY single-segment path, because Next matches it before the catch-all.
  // It therefore has to end the same way the catch-all does, or a page renamed
  // in the CMS would 404 whenever its path happens to be one segment long --
  // which is most of them.
  //
  // The feature gate is not weakened by this. It exists to stop disabled legal
  // pages being SERVED, and a redirect serves nothing: no legal content is
  // loaded, rendered or revealed on this branch. If the destination is itself a
  // disabled legal page it 404s on arrival, exactly as it would have.
  const gated = !features.legalPagesEnabled;

  // Content resolution first, always. Only once this misses can a redirect be
  // the right answer -- otherwise a stale redirect row could shadow a page
  // that is live right now.
  const page = gated ? null : await loadLegalPage(legalPageId, locale);
  if (gated || !page || !page.body.en || !page.body.ar) {
    // No searchParams here, deliberately. This route is statically
    // prerenderable, and reading searchParams in a prerendered route throws
    // DYNAMIC_SERVER_USAGE at request time -- which Next turns into a 500.
    // Measured, not assumed: adding it made every single-segment 404 on this
    // site a 500, the same failure that headers() in not-found.tsx once
    // caused. A rename here therefore drops query parameters rather than
    // risking that; the catch-all, which is dynamic by construction, keeps
    // them.
    return redirectOrNotFound(pathnameFrom(locale, [legalPageId]), locale);
  }

  return <LegalPageTemplate page={page} locale={locale} />;
}
