import { z } from "zod";

/**
 * Runtime-validated response shapes for the FeelStack CMS API — brief §4
 * ("Validate every response with Zod... Reject malformed responses
 * safely"). Every response from the network is parsed through these
 * schemas before the app trusts it; a schema-validation failure is
 * classified `INVALID_RESPONSE` (src/lib/feelstack/errors.ts) rather than
 * silently rendering partial data or being treated as a 404.
 *
 * Endpoints implemented against (confirmed from this build's own prior
 * pass, `src/lib/feelstack/client.ts`): `/public/v1/sites/:siteKey/resolve`
 * and `/public/v1/sites/:siteKey/routes`. These are the two endpoints the
 * brief names as verified. No live FeelStack API reference was available
 * this session (see docs/ARCHITECTURE.md) — the
 * recovered Dfeelings source (C:\Users\user\Downloads\dfeelings) calls a
 * *different*, older FeelStack surface (`/posts/slug/:slug`,
 * `/case-studies/published`, etc.) with no Zod validation at all, so it
 * could not be used to derive these shapes; the schemas below extend what
 * Blue Diamond's own adapter already assumed, unchanged in shape.
 */

export const feelstackContentStatusSchema = z.enum(["draft", "published", "disabled"]);


/**
 * ONE PAGE of the route inventory, captured live on 2026-08-24 from
 * `GET https://feelstack.dfeelings.com/api/public/v1/sites/blue-diamond-medical/routes?locale=en`
 * and cross-read against the backend source
 * (`headless-cms/src/platform/services/public-route-resolver.service.ts`,
 * `routeInventory()`):
 *
 *   { "items": [ { "path": "/aesthetics/concerns/acne-scars",
 *                  "locale": "en",
 *                  "type": "content_entry",
 *                  "lastModified": "2026-08-23T11:25:34.635Z",
 *                  "seo": { "title": ..., "description": ... } } ],
 *     "page": 1, "limit": 100, "hasMore": false }
 *
 * THERE IS NO `status` FIELD, and the envelope key is `items`, not `routes`.
 * The previous shape (`{ routes: [{ path, status }] }`) was forward-declared,
 * never live-captured, and matched nothing — so `safeParse` failed on every
 * call and `listRoutes()` returned `[]` unconditionally. A well-formed,
 * plausible contract that matches nothing, failing silently.
 *
 * `status` must NOT be reintroduced: `routeInventory()` already filters
 * `status: PUBLISHED, enabled: true` in the query, and additionally drops any
 * route whose MERGED seo has `index === false || sitemapIncluded === false`.
 * Publication filtering is a server-side guarantee; re-deriving it here from a
 * field the API does not send would be inventing a contract.
 */
export const feelstackRouteSchema = z.object({
  path: z.string().min(1),
  locale: z.string().min(1),
  type: z.string().min(1),
  lastModified: z.string().optional(),
  /**
   * The server-MERGED seo object (defaultSeo <- section.seo <- entity.seo).
   * Passed through unvalidated in shape because it is free-form on the
   * backend; it is deliberately NOT re-merged on this side — see
   * docs/CONTENT_MODEL.md. Any route present in `items` has already passed
   * the server's index/sitemapIncluded filter.
   */
  seo: z.record(z.string(), z.unknown()).optional(),
});

export const feelstackRouteInventoryPageSchema = z.object({
  items: z.array(feelstackRouteSchema),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  hasMore: z.boolean(),
});
export type FeelstackRouteInventoryPage = z.infer<typeof feelstackRouteInventoryPageSchema>;
export type FeelstackRoute = z.infer<typeof feelstackRouteSchema>;

/**
 * SITE CONFIG, captured live 2026-08-24 from
 * `GET /api/public/v1/sites/blue-diamond-medical/config` and cross-read
 * against `PlatformPublicV1Controller.config()`:
 *
 *   { siteKey, siteName, defaultLocale, supportedLocales, defaultSeo,
 *     socialProfiles, contactInformation, analytics, branding, features,
 *     sitemap, updatedAt }
 *
 * Every object-valued key is `settings?.<key> ?? {}` on the backend, so each
 * is always present but frequently EMPTY — `defaultSeo` is `{}` for Blue
 * Diamond today. Empty is a legitimate value, never an error.
 *
 * `defaultSeo` is typed as opaque on purpose. It is the OUTERMOST layer of the
 * server's `mergeSeoMetadata(settings.defaultSeo, section.seo, entity.seo)`,
 * and that merge — including the `index`/`sitemapIncluded` filtering it drives
 * — is performed server-side before anything reaches this client. Re-modelling
 * its keys here would fork the merge into two implementations that drift, which
 * is exactly what docs/CONTENT_MODEL.md forbids. What this client needs from
 * `defaultSeo` is that a CHANGE to it invalidates the surfaces that inherit it;
 * that is the cache contract, not a parsing contract.
 */
export const feelstackSiteConfigSchema = z.object({
  siteKey: z.string().min(1),
  siteName: z.string().min(1),
  defaultLocale: z.string().min(1),
  supportedLocales: z.array(z.string().min(1)).min(1),
  defaultSeo: z.record(z.string(), z.unknown()),
  socialProfiles: z.record(z.string(), z.unknown()),
  contactInformation: z.record(z.string(), z.unknown()),
  analytics: z.record(z.string(), z.unknown()),
  branding: z.record(z.string(), z.unknown()),
  features: z.record(z.string(), z.unknown()),
  /**
   * Advisory site-level sitemap settings. `enabled` is the only key this
   * client reads, and only to SUPPRESS CMS-owned rows — see
   * `cmsOnlyEntries()` in src/app/sitemap.ts. Nothing server-side consumes
   * it, so it is a frontend-honoured setting, not a server guarantee.
   */
  sitemap: z.object({ enabled: z.boolean().optional() }).catchall(z.unknown()),
  updatedAt: z.string().min(1),
});
export type FeelstackSiteConfig = z.infer<typeof feelstackSiteConfigSchema>;

/**
 * PRODUCTION shape, captured live from
 * `GET https://feelstack.dfeelings.com/api/public/v1/sites/<key>/resolve`:
 *
 *   { "statusCode": 404, "message": "Site not found.",
 *     "error": "Not Found", "code": "SITE_NOT_FOUND" }
 *
 * `code` is TOP-LEVEL and `error` is a STRING (Nest's status text). An earlier
 * revision of this file assumed `{ error: { code } }` — a shape FeelStack has
 * never emitted — so the envelope never parsed, no code was ever extracted,
 * and an unknown siteKey fell through to the bare-404 path. See
 * docs/FEELSTACK.md §1a.
 */
export const feelstackApiErrorFlatSchema = z.object({
  code: z.string(),
  statusCode: z.number().optional(),
  message: z.string().optional(),
});

/**
 * Legacy/nested shape. Retained only so a consumer or fixture written against
 * the previously assumed contract still classifies correctly; FeelStack does
 * not emit it. Never preferred over the flat shape.
 */
export const feelstackApiErrorNestedSchema = z.object({
  error: z.object({
    code: z.string().optional(),
    message: z.string().optional(),
  }),
});

export const feelstackApiErrorSchema = z.union([
  feelstackApiErrorFlatSchema,
  feelstackApiErrorNestedSchema,
]);

/**
 * Pulls the machine-readable code out of either envelope, flat first.
 *
 * Mirrors the extractor in the deployed Dfeelings integration
 * (`/home/dfeelings/apps/blue/current/.next` — flat `.code`, then
 * `.error.code`), so the two frontends cannot drift apart in how they read
 * the same backend. Returns undefined for anything unrecognisable; the caller
 * must then fail closed rather than assume absence.
 */
export function extractFeelstackErrorCode(body: unknown): string | undefined {
  const flat = feelstackApiErrorFlatSchema.safeParse(body);
  if (flat.success) return flat.data.code;
  const nested = feelstackApiErrorNestedSchema.safeParse(body);
  if (nested.success) return nested.data.error.code;
  return undefined;
}

/**
 * Canonical FeelStack webhook envelope.
 *
 * Derived from the REAL sender — FeelStack
 * `headless-cms/src/platform/services/webhook.service.ts::deliver()`,
 * verified at production commit 0e32652c:
 *
 *   JSON.stringify({
 *     id:         event.eventId,     // uuid
 *     type:       event.eventType,   // e.g. "content.entry.published"
 *     projectId:  event.projectId,   // uuid -- NOT a siteKey
 *     occurredAt: event.createdAt,   // Date -> ISO 8601 by JSON.stringify
 *     data:       event.payload,     // jsonb; shape varies by producer
 *   })
 *
 * WHAT THIS REPLACES, AND WHY IT IS NOT A UNION BRANCH
 * ---------------------------------------------------
 * The previous shape was `{ event, siteKey, locale?, entityId?, path? }`
 * plus a legacy `{ path }` fallback. Its own docblock conceded it was
 * never confirmed against a real sender, and it was in fact unsatisfiable:
 * a real delivery has no top-level `event`, `siteKey` or `path`, so every
 * genuine webhook verified its HMAC and then failed body-schema parsing.
 *
 * Both old branches are DELETED rather than retained for compatibility.
 * Keeping an unsatisfiable shape in a union costs nothing at runtime but
 * lets the guess quietly remain "supported", which is how the same class
 * of defect survived twice before in this integration (the error envelope
 * and the entity envelope). `tests/contracts/feelstack-schemas.spec.ts`
 * asserts the old shapes NO LONGER validate.
 *
 * NOTE ON THE `type` GRAMMAR: underscores are permitted. FeelStack really
 * does emit `content.person_profile.<status>` today (see
 * `directory-content.service.ts`, which interpolates the internal
 * routeType). Dfeelings' receiver forbids underscores and therefore
 * rejects those events outright; Blue Diamond deliberately does not
 * inherit that restriction, so doctor events are consumable here both
 * before and after FeelStack PR #21 renames them to `content.person.*`.
 */
export const feelstackWebhookEnvelopeSchema = z.object({
  id: z.string().uuid(),
  type: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+$/, "malformed event type"),
  projectId: z.string().uuid(),
  occurredAt: z
    .string()
    .min(1)
    .max(64)
    .refine((v) => Number.isFinite(Date.parse(v)), "unparseable occurredAt"),
  /**
   * CANONICAL ENTITY CONTEXT (FeelStack PR #22, live since 6c2c3c97).
   *
   * `recordContentEvent` has always stored entityType / entityId / locale /
   * path as columns on the outbox row; before #22 only `data` crossed the
   * wire, so producers that identify the affected entity ONLY in those
   * columns -- content.relationships.updated and content.taxonomy.updated --
   * emitted events no consumer could act on.
   *
   * Optional and nullable on purpose:
   *  - optional, so an event produced by a pre-#22 sender (or replayed from
   *    an outbox row queued before the deploy) still validates rather than
   *    being rejected as malformed;
   *  - nullable, because `locale` and `path` are nullable columns and the
   *    sender emits null when the producer recorded none. null means "not
   *    recorded", never "the root path".
   *
   * `locale` is deliberately a plain string here, not z.enum(["en","ar"]).
   * FeelStack may legitimately emit a locale this site does not serve; that
   * must be an event this consumer declines, not a parse failure that
   * discards the whole envelope. The supported-locale check lives in the
   * adapter, where it can be reported.
   */
  entityType: z.string().min(1).max(128).nullable().optional(),
  entityId: z.string().min(1).max(200).nullable().optional(),
  locale: z.string().min(1).max(35).nullable().optional(),
  path: z.string().min(1).max(2048).nullable().optional(),
  data: z.record(z.string(), z.unknown()),
});
export type FeelstackWebhookEnvelope = z.infer<typeof feelstackWebhookEnvelopeSchema>;

/**
 * FeelStack's own lifecycle enum (`ContentStatus`): draft | published |
 * archived. Deliberately NOT `feelstackContentStatusSchema` above, which
 * is Blue Diamond's route-status enum and uses "disabled" where FeelStack
 * uses "archived" -- reusing it would silently reject every archive event.
 */
export const feelstackEventStatusSchema = z.enum(["draft", "published", "archived"]);

/**
 * The `data` payload shape emitted by the content producers Blue Diamond
 * consumes. Every field is optional because `data` is a free-form jsonb
 * column whose contents differ per producer; the handler asserts what it
 * actually needs per event family rather than over-constraining here.
 *
 * Derived from the real producers:
 *   directory-content.service.ts  -> { id, status, locale, path }
 *   structured-content.service.ts -> { id, contentType, status, locale,
 *                                      path, previousPath? }
 */
export const feelstackContentEventDataSchema = z.object({
  id: z.string().uuid().optional(),
  contentType: z.string().min(1).max(128).optional(),
  status: feelstackEventStatusSchema.optional(),
  locale: z.enum(["en", "ar"]).optional(),
  path: z.string().min(1).max(2048).nullable().optional(),
  previousPath: z.string().min(1).max(2048).nullable().optional(),
});
export type FeelstackContentEventData = z.infer<typeof feelstackContentEventDataSchema>;
