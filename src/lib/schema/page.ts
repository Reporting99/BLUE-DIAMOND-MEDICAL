import { clinicId } from "@/lib/seo/entity-graph";
import type { Locale } from "@/i18n/config";
import { absoluteUrl, schemaLanguage, websiteId } from "./shared";
import type { CollectionItem, JsonLdNode, PageSchemaType } from "./types";

/**
 * One JSON-LD page node for hub, listing, and informational pages.
 *
 * `items` must be built from the same array the page maps over, so the list can
 * never drift from what is visibly rendered. Pages with nothing to list (a
 * feature-gated hub with zero approved entries) pass no `items` and get a plain
 * node instead of an empty `ItemList`.
 *
 * Entity-detail pages do NOT use this builder — they keep their own more
 * specific nodes (`buildMedicalWebPageSchema`, `buildPhysicianSchema`,
 * Product), which carry fields a generic page node cannot.
 */
export function buildPageSchema({
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
}): JsonLdNode {
  const url = absoluteUrl(locale, path);

  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#page`,
    name,
    description,
    url,
    inLanguage: schemaLanguage(locale),
    isPartOf: { "@id": websiteId },
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
}
