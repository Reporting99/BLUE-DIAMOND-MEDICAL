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


export const feelstackRouteSchema = z.object({
  path: z.string(),
  status: feelstackContentStatusSchema,
});

export const feelstackRoutesResponseSchema = z.object({
  routes: z.array(feelstackRouteSchema),
});
export type FeelstackRoutesResponse = z.infer<typeof feelstackRoutesResponseSchema>;

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
 * Structured webhook event body — brief §9 ("cache-tag correction" +
 * webhook security). Not confirmed against a real FeelStack webhook
 * sender — no webhook exists in the recovered Dfeelings source to derive
 * it from (Dfeelings uses time-based ISR only, `revalidate: 30`, no
 * on-demand invalidation at all). Documented as a contract limitation in
 * docs/FEELSTACK.md. Falls back to the legacy `{ path }`
 * shape this build already shipped, so nothing already deployed breaks.
 */
export const feelstackWebhookEventSchema = z.enum([
  "page.published",
  "page.unpublished",
  "page.updated",
  "route.changed",
  "navigation.updated",
  "footer.updated",
  "doctor.updated",
  "medical-service.updated",
  "aesthetic-treatment.updated",
  "concern.updated",
  "technology.updated",
  "product.updated",
  "health-hub-article.published",
  "health-hub-article.updated",
  "legal-page.updated",
  "booking-config.updated",
  "site-settings.updated",
]);
export type FeelstackWebhookEvent = z.infer<typeof feelstackWebhookEventSchema>;

export const feelstackWebhookBodySchema = z.union([
  z.object({
    event: feelstackWebhookEventSchema,
    siteKey: z.string().min(1).max(200),
    locale: z.enum(["en", "ar"]).optional(),
    entityId: z.string().min(1).max(200).optional(),
    path: z.string().min(1).max(2048).optional(),
  }),
  // Legacy shape this deployment already ships — brief §17 "small
  // reviewable changes", not a breaking change to an in-flight contract.
  z.object({ path: z.string().min(1).max(2048) }),
]);
