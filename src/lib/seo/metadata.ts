import type { Metadata } from "next";
// `@imagekit/next`'s entrypoint is marked "use client" in its compiled
// output — importing anything from it (even a pure URL-string function
// like buildSrc) from a Server Component context (generateMetadata runs
// server-side) throws "Attempted to call buildSrc() from the server but
// buildSrc is on the client." Real, build-breaking bug found and fixed
// this pass, surfaced only once NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT had a
// value and this branch actually ran (previously always short-circuited
// by `imagekitIsConfigured` being false — see src/config/imagekit.ts).
// buildSrc is a framework-agnostic re-export from @imagekit/javascript
// (the underlying dependency, carries no "use client" boundary) — import
// it directly for this one server-side usage instead.
import { buildSrc } from "@imagekit/javascript";
import { getRoute } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { imagekitConfig, imagekitIsConfigured, imagePresets } from "@/config/imagekit";
import type { Locale } from "@/i18n/config";

interface RouteMetadataOverrides {
  description: { en: string; ar: string };
  ogImagePath?: string;
}

/**
 * Builds per-page Metadata from the central route registry so every page's
 * title, canonical, and hreflang alternates stay derived from one source —
 * brief §29/§30. Every route gets a *self-referencing* canonical; Arabic
 * pages are never canonicalized to their English counterpart.
 */
export function getRouteMetadata(
  routeId: string,
  locale: Locale,
  overrides: RouteMetadataOverrides,
): Metadata {
  const route = getRoute(routeId);
  if (!route) {
    throw new Error(`getRouteMetadata: unknown route id "${routeId}"`);
  }

  const enUrl = `${siteConfig.url}/en${route.path.en}`;
  const arUrl = `${siteConfig.url}/ar${route.path.ar}`;
  const canonical = locale === "ar" ? arUrl : enUrl;

  // ogImagePath was previously accepted here and silently dropped — every
  // page fell back to Next's default OG image regardless of what callers
  // passed. Now it actually resolves through ImageKit's og-image preset
  // (1200x630, matching the standard OG/Twitter card size) when ImageKit
  // is configured; when it isn't (no live account yet — see
  // docs/IMAGEKIT_IMPORT_REPORT.md), `images` is omitted entirely rather
  // than pointing at a URL that would 404, which is the same honest
  // fallback behavior used everywhere else in the app.
  const ogImage =
    overrides.ogImagePath && imagekitIsConfigured
      ? buildSrc({
          src: overrides.ogImagePath,
          urlEndpoint: imagekitConfig.urlEndpoint,
          transformation: [imagePresets["og-image"]],
        })
      : undefined;

  return {
    title: route.title[locale],
    description: overrides.description[locale],
    alternates: {
      canonical,
      languages: {
        "en-CA": enUrl,
        "ar-CA": arUrl,
        "x-default": enUrl,
      },
    },
    robots: route.indexing === "index" ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      title: route.title[locale],
      description: overrides.description[locale],
      url: canonical,
      locale: locale === "ar" ? "ar_CA" : "en_CA",
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: route.title[locale],
      description: overrides.description[locale],
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
