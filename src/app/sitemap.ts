import type { MetadataRoute } from "next";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { features, type FeatureFlags } from "@/config/features";

export default function sitemap(): MetadataRoute.Sitemap {
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
