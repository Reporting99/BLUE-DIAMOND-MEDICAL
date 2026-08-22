import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { features } from "@/config/features";
import { getLegalPage } from "@/content/legal-pages";
import { LegalPageTemplate } from "@/templates/LegalPageTemplate";
import { getRouteMetadata } from "@/lib/seo/metadata";

/**
 * Feature-flagged off (`legalPagesEnabled`) — see src/content/legal-pages.ts.
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; legalPageId: string }>;
}): Promise<Metadata> {
  if (!features.legalPagesEnabled) return {};
  const { locale: rawLocale, legalPageId } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const page = getLegalPage(legalPageId);
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
  const page = getLegalPage(legalPageId);
  if (!page || !page.body.en || !page.body.ar) notFound();

  return <LegalPageTemplate page={page} locale={locale} />;
}
