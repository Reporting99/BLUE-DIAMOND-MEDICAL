import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { isIndexingEnabled } from "@/config/launch";

// Read at request time rather than baked at build time, so indexability is a
// property of the running environment and not of the artifact. A build can
// therefore never carry "crawlable" into a slot that was not meant to be
// public. See src/config/launch.ts.
//
// `isIndexingEnabled()` is the flag AND a valid https SITE_URL, so the
// `Sitemap:` line below can never be built from an empty or temporary origin:
// if there is no origin, this function has already returned the Disallow
// policy above it.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexingEnabled()) {
    // No Sitemap: line either. Advertising a sitemap on an unlaunched or
    // origin-less deployment hands a crawler the full URL inventory, which is
    // the exact thing this gate exists to withhold — and there would be no
    // trustworthy absolute URL to advertise it at.
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/*?*"], // no query-string variants indexed — brief §29
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
