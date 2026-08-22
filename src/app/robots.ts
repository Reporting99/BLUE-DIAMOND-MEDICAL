import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { isSiteLaunched } from "@/config/launch";

// Read at request time rather than baked at build time, so indexability is a
// property of the running environment and not of the artifact. A build can
// therefore never carry "crawlable" into a slot that was not meant to be
// public. See src/config/launch.ts.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (!isSiteLaunched()) {
    // No Sitemap: line either. Advertising a sitemap on an unlaunched
    // deployment hands a crawler the full URL inventory, which is the exact
    // thing this gate exists to withhold.
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
