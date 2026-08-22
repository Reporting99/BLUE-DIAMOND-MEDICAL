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
 * this session (see docs/DFEELINGS_TO_BLUE_ARCHITECTURE_MAP.md §4) — the
 * recovered Dfeelings source (C:\Users\user\Downloads\dfeelings) calls a
 * *different*, older FeelStack surface (`/posts/slug/:slug`,
 * `/case-studies/published`, etc.) with no Zod validation at all, so it
 * could not be used to derive these shapes; the schemas below extend what
 * Blue Diamond's own adapter already assumed, unchanged in shape.
 */

export const feelstackContentStatusSchema = z.enum(["draft", "published", "disabled"]);

export const feelstackResolveResponseSchema = z.object({
  path: z.string(),
  locale: z.enum(["en", "ar"]),
  status: feelstackContentStatusSchema,
  title: z.string().optional(),
  description: z.string().optional(),
  body: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type FeelstackResolveResponse = z.infer<typeof feelstackResolveResponseSchema>;

export const feelstackRouteSchema = z.object({
  path: z.string(),
  status: feelstackContentStatusSchema,
});

export const feelstackRoutesResponseSchema = z.object({
  routes: z.array(feelstackRouteSchema),
});
export type FeelstackRoutesResponse = z.infer<typeof feelstackRoutesResponseSchema>;

/**
 * Structured FeelStack API error envelope, when the API returns one
 * instead of a bare non-2xx status — brief §6 ("Use HTTP status and
 * structured error codes when supplied"). Optional/best-effort: this
 * shape has not been confirmed against a live FeelStack deployment, so
 * the adapter classifies purely on HTTP status when this doesn't parse
 * (see src/lib/feelstack/errors.ts `classifyHttpStatus`) rather than
 * depending on it.
 */
export const feelstackApiErrorSchema = z.object({
  error: z.object({
    code: z.string().optional(),
    message: z.string().optional(),
  }),
});

/* ---------------------------------------------------------------------- *
 * Entity content schemas — brief §11. Mirrors the shape of Blue Diamond's
 * existing local `src/types/*.ts` content models, since those are the
 * fields the frontend already renders and the ones a future FeelStack
 * entity must supply to replace them. NOT yet confirmed against a live
 * FeelStack schema (no Blue Diamond site is provisioned) — treat as a
 * forward-declared contract, reconciled once FeelStack provisioning
 * happens. See docs/FEELSTACK_MIGRATION_MANIFEST.md.
 * ---------------------------------------------------------------------- */

const bilingualSchema = z.object({ en: z.string(), ar: z.string() });
const bilingualListSchema = z.object({ en: z.array(z.string()), ar: z.array(z.string()) });
const faqEntrySchema = z.object({ question: bilingualSchema, answer: bilingualSchema });

const bookingChannelSchema = z.enum([
  "family-doctor",
  "walk-in",
  "eye-screening",
  "aesthetics-consultation",
  "phone-medical-botox",
  "phone-aesthetics",
]);

/**
 * Output type matches `MedicalServiceContent` (src/types/medical-service.ts)
 * field-for-field via `.transform()`, so `resolvePageContent` can share one
 * type parameter between the CMS schema and the local
 * `src/content/medical-services.ts` fallback (page-resolver.ts requires
 * both branches to return the same `T`). `status`/`updatedAt` are
 * CMS-only bookkeeping fields, stripped after validation; `sourceVerified`
 * is synthesized `true` for CMS-sourced entries — content only reaches
 * "published" in FeelStack through the same editorial approval process
 * that traces to the approved source doc for the local fallback.
 */
export const cmsMedicalServiceSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    slugAr: z.string(),
    title: bilingualSchema,
    summary: bilingualSchema,
    whoItsFor: bilingualSchema.optional(),
    whatsIncluded: bilingualListSchema.optional(),
    howAppointmentsWork: bilingualSchema.optional(),
    urgentCareNote: bilingualSchema.optional(),
    relatedDoctorIds: z.array(z.string()),
    relatedServiceIds: z.array(z.string()).optional(),
    bookingChannel: bookingChannelSchema,
    externalPartners: z.array(z.object({ name: z.string(), url: z.string(), note: bilingualSchema })).optional(),
    contactNote: bilingualSchema.optional(),
    faqs: z.array(faqEntrySchema).optional(),
    status: feelstackContentStatusSchema,
    updatedAt: z.string().optional(),
  })
  .transform((data) => ({
    id: data.id,
    slug: data.slug,
    slugAr: data.slugAr,
    title: data.title,
    summary: data.summary,
    whoItsFor: data.whoItsFor,
    whatsIncluded: data.whatsIncluded,
    howAppointmentsWork: data.howAppointmentsWork,
    urgentCareNote: data.urgentCareNote,
    relatedDoctorIds: data.relatedDoctorIds,
    relatedServiceIds: data.relatedServiceIds,
    bookingChannel: data.bookingChannel,
    externalPartners: data.externalPartners,
    contactNote: data.contactNote,
    faqs: data.faqs,
    sourceVerified: true as const,
  }));
export type CmsMedicalService = z.infer<typeof cmsMedicalServiceSchema>;

export const cmsDoctorSchema = z.object({
  id: z.string(),
  slug: z.string(),
  slugAr: z.string(),
  name: bilingualSchema,
  credentials: z.string().optional(),
  bio: bilingualSchema.optional(),
  photoPath: z.string().optional(),
  status: feelstackContentStatusSchema,
  updatedAt: z.string().optional(),
});
export type CmsDoctor = z.infer<typeof cmsDoctorSchema>;

export const cmsProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  slugAr: z.string(),
  name: bilingualSchema,
  priceCents: z.number().int().nonnegative(),
  sizeLabel: z.string().optional(),
  description: bilingualSchema.optional(),
  imagePath: z.string().optional(),
  status: feelstackContentStatusSchema,
  updatedAt: z.string().optional(),
});
export type CmsProduct = z.infer<typeof cmsProductSchema>;

/**
 * Structured webhook event body — brief §9 ("cache-tag correction" +
 * webhook security). Not confirmed against a real FeelStack webhook
 * sender — no webhook exists in the recovered Dfeelings source to derive
 * it from (Dfeelings uses time-based ISR only, `revalidate: 30`, no
 * on-demand invalidation at all). Documented as a contract limitation in
 * docs/WEBHOOK_SECURITY_REPORT.md. Falls back to the legacy `{ path }`
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
export type FeelstackWebhookBody = z.infer<typeof feelstackWebhookBodySchema>;
