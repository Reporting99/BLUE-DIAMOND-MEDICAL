export type Locale = "en" | "ar";

export type TemplateType =
  | "homepage"
  | "hub"
  | "medical-service"
  | "medical-botox"
  | "aesthetic-treatment"
  | "concern"
  | "technology"
  | "doctor-profile"
  | "product"
  | "article"
  | "contact"
  | "pricing"
  | "booking-hub"
  | "legal"
  | "static";

export interface RouteEntry {
  /** Stable ID — never renamed once published; sitemap/redirect tooling keys on this. */
  id: string;
  templateType: TemplateType;
  path: { en: string; ar: string };
  title: { en: string; ar: string };
  /** Feature flag key that must be enabled for this route to exist. */
  requiresFeature?: string;
  indexing: "index" | "noindex";
  inSitemap: boolean;
  inNav: boolean;
  /** Route ID of the parent, for breadcrumbs. */
  parentId?: string;
}
