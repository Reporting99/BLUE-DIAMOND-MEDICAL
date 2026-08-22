import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/*?*"], // no query-string variants indexed — brief §29
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
