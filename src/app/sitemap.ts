import type { MetadataRoute } from "next";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { features, type FeatureFlags } from "@/config/features";
import { isSiteLaunched } from "@/config/launch";

// Request-time, for the same reason as robots.ts — see src/config/launch.ts.
export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  // An unlaunched deployment publishes no URL inventory at all. Every entry
  // in a sitemap is an absolute URL on the launch domain, so a sitemap served
  // before launch can only ever invite crawling of a site that is not ready.
  if (!isSiteLaunched()) return [];

  return routes
    .filter((route) => route.inSitemap && route.indexing === "index")
    .filter((route) => !route.requiresFeature || features[route.requiresFeature as keyof FeatureFlags])
    .flatMap((route) => {
      const enUrl = `${siteConfig.url}/en${route.path.en}`;
      const arUrl = `${siteConfig.url}/ar${route.path.ar}`;
      const languages = { "en-CA": enUrl, "ar-CA": arUrl };

      return [
        { url: enUrl, alternates: { languages } },
        { url: arUrl, alternates: { languages } },
      ];
    });
}
