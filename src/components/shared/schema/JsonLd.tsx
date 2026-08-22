import type { JsonLdNode } from "@/lib/schema";

/**
 * The one place this codebase serialises a Schema.org node into the document.
 * Every named schema component below is this emitter plus a builder from
 * `@/lib/schema` — pages never hand-roll a `<script type="application/ld+json">`.
 */
export function JsonLd({ data }: { data: JsonLdNode }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
