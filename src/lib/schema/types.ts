/**
 * Shared vocabulary for the schema layer. Every builder in this directory
 * returns a plain, JSON-serialisable node; nothing here renders. Emitting is
 * the job of `@/components/shared/schema`, so a builder can be unit-tested
 * without React and reused from a route handler (sitemap, llms.txt) as easily
 * as from a page.
 */
export type JsonLdNode = Record<string, unknown>;

/** One entry in a `CollectionPage`'s `ItemList`. */
export interface CollectionItem {
  /** Visible name of the listed entity — must match what the page renders. */
  name: string;
  /** Absolute URL of the entity's own detail page. */
  url: string;
}

/**
 * schema.org `WebPage` subtypes that carry real meaning for this site. Using the
 * specific subtype (rather than a bare `WebPage` everywhere) is what lets a
 * consumer tell "this page enumerates entities" from "this page is how you
 * reach the clinic" without parsing the prose.
 */
export type PageSchemaType = "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage";

export interface FaqEntry {
  question: { en: string; ar: string };
  answer: { en: string; ar: string };
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
