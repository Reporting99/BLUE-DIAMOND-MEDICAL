import { buildPageSchema } from "@/lib/schema";
import type { CollectionItem, PageSchemaType } from "@/lib/schema";
import type { Locale } from "@/i18n/config";
import { JsonLd } from "./JsonLd";

export type { CollectionItem, PageSchemaType };

/** Page node for hub, listing, and informational pages. */
export function PageSchema(props: {
  locale: Locale;
  type?: PageSchemaType;
  name: string;
  description: string;
  path: string;
  items?: CollectionItem[];
}) {
  return <JsonLd data={buildPageSchema(props)} />;
}
