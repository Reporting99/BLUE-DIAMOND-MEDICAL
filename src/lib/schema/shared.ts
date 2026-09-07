import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";

/** BCP-47 tag for a locale, used as `inLanguage` on every page-level node. */
export function schemaLanguage(locale: Locale): string {
  return locale === "ar" ? "ar-CA" : "en-CA";
}

/**
 * Absolute, locale-prefixed URL for a site-relative path.
 *
 * Trailing slash stripped for the same reason as
 * `src/lib/routing/canonical.ts`: a path of "/" would join to "<origin>/en/",
 * which answers a 308 on this app (`trailingSlash: false`). A JSON-LD `url`
 * or `@id` that redirects points a validator — and an answer engine — at a
 * hop instead of the page. No caller passes "/" today; this makes it
 * impossible for one to introduce the bug later.
 */
export function absoluteUrl(locale: Locale, path: string): string {
  const url = `${siteConfig.url}/${locale}${path}`;
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

/** Stable JSON-LD `@id` for the single WebSite node declared on the homepage. */
export const websiteId = `${siteConfig.url}/#website`;

/**
 * The site origin for a JSON-LD `url` property, or undefined when none is
 * configured.
 *
 * A relative `@id` is fine — JSON-LD resolves it against the document — but a
 * `url` of "" is not: it is a present-but-empty claim, and a validator reads
 * it as a broken link rather than as an absent one. Callers spread this so the
 * property disappears entirely pre-domain.
 */
export function siteOrigin(): string | undefined {
  return siteConfig.url || undefined;
}
