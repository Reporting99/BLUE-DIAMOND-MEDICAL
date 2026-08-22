import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";

/** BCP-47 tag for a locale, used as `inLanguage` on every page-level node. */
export function schemaLanguage(locale: Locale): string {
  return locale === "ar" ? "ar-CA" : "en-CA";
}

/** Absolute, locale-prefixed URL for a site-relative path. */
export function absoluteUrl(locale: Locale, path: string): string {
  return `${siteConfig.url}/${locale}${path}`;
}

/** Stable JSON-LD `@id` for the single WebSite node declared on the homepage. */
export const websiteId = `${siteConfig.url}/#website`;
