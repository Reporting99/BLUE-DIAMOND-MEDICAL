import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import type { BreadcrumbItem, JsonLdNode } from "./types";

/**
 * `BreadcrumbList` for the trail a page renders visibly. The Home crumb is
 * prepended here so the visible trail and the schema can never disagree about
 * where the trail starts — callers pass only the page-specific segments.
 */
export function buildBreadcrumbTrail(locale: Locale, items: BreadcrumbItem[]): BreadcrumbItem[] {
  const home = { label: locale === "ar" ? "الرئيسية" : "Home", href: `/${locale}` };
  return [home, ...items];
}

export function buildBreadcrumbSchema(trail: BreadcrumbItem[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${siteConfig.url}${item.href}` } : {}),
    })),
  };
}
