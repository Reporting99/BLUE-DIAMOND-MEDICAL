import { z } from "zod";

/**
 * FeelStack PUBLIC transport DTOs — the wire shape, nothing else.
 *
 * No `import "server-only"`: pure schemas, no env or secret access. The
 * credentialed boundary is `./client`.
 *
 * Every shape here was read out of the deployed backend source
 * (`src/platform/services/public-route-resolver.service.ts`), not inferred from
 * this repo's needs. That distinction matters: the previous revision of this
 * integration forward-declared a flat entity envelope that FeelStack has never
 * emitted, so nothing parsed and a wrong siteKey 404'd the whole site. When the
 * backend defines a contract, the backend is the authority.
 *
 * These types deliberately stop at the transport boundary. Feature modules must
 * never import them — they consume domain models produced by `./adapters`.
 */

/** One published sibling route for the same translation group. */
export const feelstackAlternateSchema = z.object({
  locale: z.string(),
  path: z.string(),
});

/**
 * Route resolution metadata.
 *
 * `usedFallback` is the safety-critical field. FeelStack answers a request for
 * a locale it has no route for by serving the DEFAULT-locale route instead and
 * flagging it here (`route.locale !== requestedLocale`). For a bilingual
 * medical site that means an Arabic URL can come back carrying English
 * clinical content. See `./locale-integrity`.
 */
export const feelstackRouteMetaSchema = z.object({
  id: z.string(),
  path: z.string(),
  locale: z.string(),
  requestedLocale: z.string(),
  resolvedLocale: z.string(),
  usedFallback: z.boolean(),
  alternates: z.array(feelstackAlternateSchema).default([]),
  sectionId: z.string().nullable().optional(),
  updatedAt: z.string().optional(),
});

/**
 * The entity payload. For a `content_entry` the caller-defined fields live
 * under `fields`; `person_profile` and `location` are first-class models with
 * their own top-level columns instead.
 */
export const feelstackEntryDataSchema = z
  .object({
    id: z.string(),
    contentType: z.string().optional(),
    title: z.string().optional(),
    /** `content_entry` only — caller-defined fields live here. */
    fields: z.record(z.string(), z.unknown()).optional(),
    /**
     * First-class model columns. `person_profile` and `location` expose their
     * values at the TOP LEVEL of `data` rather than under `fields` — verified
     * against the live API with the first real doctor record, not assumed.
     */
    displayName: z.string().nullable().optional(),
    professionalTitle: z.string().nullable().optional(),
    biography: z.string().nullable().optional(),
    mediaAssetId: z.string().nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
    translationGroupId: z.string().nullable().optional(),
    publishedAt: z.string().nullable().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

/**
 * Which part of `data` an entity's field schema should parse.
 *
 * `content_entry` nests caller-defined values under `fields`; the first-class
 * models (`person_profile`, `location`) put their columns at the top level.
 * Reading the wrong one yields an empty object rather than an error, so the
 * choice is made here, once, from the envelope's own `type`.
 */
export function entityPayload(envelope: { type: string; data: Record<string, unknown> }): Record<string, unknown> {
  if (envelope.type === "content_entry") {
    return (envelope.data.fields as Record<string, unknown> | undefined) ?? {};
  }
  return envelope.data;
}

export const feelstackRelationSchema = z.object({
  id: z.string(),
  relationKey: z.string(),
  targetType: z.string(),
  targetId: z.string(),
  sortOrder: z.number().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

/** First-class FAQ, already locale-filtered by the backend. */
export const feelstackFaqSchema = z.object({
  id: z.string(),
  key: z.string().nullable().optional(),
  question: z.string(),
  answer: z.string(),
});

export const feelstackSectionSchema = z.object({
  id: z.string(),
  key: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  pathPrefix: z.string().nullable().optional(),
});

export const feelstackTaxonomyAssignmentSchema = z.object({
  taxonomy: z.object({ id: z.string(), key: z.string(), name: z.string().nullable().optional() }),
  term: z.object({
    id: z.string(),
    parentId: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    slug: z.string().nullable().optional(),
    locale: z.string().nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  }),
});

/**
 * Relations bundle.
 *
 * NOTE the nesting: the backend returns
 *   relations: { items, faqs, sections, taxonomies }
 * not four sibling keys. Confirmed in the resolver's return statement.
 */
export const feelstackRelationsSchema = z.object({
  items: z.array(feelstackRelationSchema).default([]),
  faqs: z.array(feelstackFaqSchema).default([]),
  sections: z.array(feelstackSectionSchema).default([]),
  taxonomies: z.array(feelstackTaxonomyAssignmentSchema).default([]),
});

/**
 * `GET /public/v1/sites/:siteKey/resolve` — the whole envelope.
 *
 * `media` is deliberately typed as `unknown[]` HERE and validated per item in
 * `./media`. A strict element schema at this level would make one malformed
 * asset fail `safeParse` for the entire envelope, and the page resolver treats
 * an unparseable envelope as an unusable response — turning a missing image
 * into a 404. Media is decoration; it must never be able to take a page down.
 * See `parseMediaAssignments`.
 */
export const feelstackResolveEnvelopeSchema = z.object({
  type: z.string(),
  route: feelstackRouteMetaSchema,
  data: feelstackEntryDataSchema,
  seo: z.record(z.string(), z.unknown()).nullable().optional(),
  relations: feelstackRelationsSchema.optional(),
  media: z.array(z.unknown()).optional(),
});

export type FeelstackResolveEnvelope = z.infer<typeof feelstackResolveEnvelopeSchema>;
export type FeelstackRouteMeta = z.infer<typeof feelstackRouteMetaSchema>;
export type FeelstackFaq = z.infer<typeof feelstackFaqSchema>;
export type FeelstackRelation = z.infer<typeof feelstackRelationSchema>;

/**
 * `GET /public/v1/sites/:siteKey/routes` — paginated route inventory.
 * Kept permissive around pagination so an additive backend change cannot break
 * the sitemap; see docs/FEELSTACK.md on why the contract version is not gated.
 */
export const feelstackRouteInventoryItemSchema = z
  .object({
    path: z.string().optional(),
    fullPath: z.string().optional(),
    locale: z.string().optional(),
    status: z.string().optional(),
  })
  .passthrough();
