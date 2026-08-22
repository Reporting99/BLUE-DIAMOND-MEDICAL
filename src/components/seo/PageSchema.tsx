import { siteConfig } from "@/config/site";
import { clinicId } from "@/lib/seo/entity-graph";
import type { Locale } from "@/i18n/config";

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

/**
 * One JSON-LD page node for hub, listing, and informational pages — brief
 * §10/§12.
 *
 * These pages previously emitted no structured data at all, so a crawler had to
 * infer "this page enumerates N doctors/services/products" from card markup
 * alone. This states it explicitly and, critically, gives each list entry the
 * URL of its own detail page, which is what turns a listing into a traversable
 * edge in the entity graph rather than a dead end.
 *
 * `items` must be built from the same array the page maps over, so the list can
 * never drift from what is visibly rendered. Pages with nothing to list (a
 * feature-gated hub with zero approved entries) pass no `items` and get a plain
 * node instead of an empty `ItemList`.
 *
 * Entity-detail pages do NOT use this component — they keep their own more
 * specific nodes (`MedicalWebPageSchema`, `PhysicianSchema`, Product), which
 * carry fields a generic page node cannot.
 */
export function PageSchema({
  locale,
  type = "CollectionPage",
  name,
  description,
  path,
  items,
}: {
  locale: Locale;
  type?: PageSchemaType;
  name: string;
  description: string;
  path: string;
  items?: CollectionItem[];
}) {
  const url = `${siteConfig.url}/${locale}${path}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#page`,
    name,
    description,
    url,
    inLanguage: locale === "ar" ? "ar-CA" : "en-CA",
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    publisher: { "@id": clinicId },
    about: { "@id": clinicId },
    ...(items && items.length > 0
      ? {
          mainEntity: {
            "@type": "ItemList" as const,
            numberOfItems: items.length,
            itemListElement: items.map((item, index) => ({
              "@type": "ListItem" as const,
              position: index + 1,
              name: item.name,
              url: item.url,
            })),
          },
        }
      : {}),
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
