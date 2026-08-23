/**
 * Public entry point for the schema layer. Every Schema.org node this site
 * emits is built here; `@/components/shared/schema` renders them. Nothing in
 * this directory imports React.
 */
export type {
  BreadcrumbItem,
  CollectionItem,
  FaqEntry,
  JsonLdNode,
  PageSchemaType,
} from "./types";
export { absoluteUrl, schemaLanguage, websiteId } from "./shared";
export { buildBreadcrumbSchema, buildBreadcrumbTrail } from "./breadcrumb";
export { buildClinicGraph } from "./clinic";
export { buildFaqPageSchema } from "./faq";
export { buildMedicalWebPageSchema } from "./medical-web-page";
export { buildPageSchema } from "./page";
export { buildPhysicianSchema } from "./physician";
