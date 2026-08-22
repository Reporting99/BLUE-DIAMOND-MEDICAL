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
 * happens. See docs/FEELSTACK.md.
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

const imageStatusSchema = z.enum(["approved", "temporary", "pending", "disabled"]);

/**
 * Drops the CMS envelope's bookkeeping fields after validation. `status` and
 * `updatedAt` are transport concerns — every schema below validates them (so a
 * malformed envelope is rejected) and then removes them, because the domain
 * types in src/types/* do not carry them and hybrid mode requires the CMS
 * branch and the local fallback to produce the same shape.
 */
function stripEnvelope<T extends { status: unknown; updatedAt?: unknown }>(
  data: T,
): Omit<T, "status" | "updatedAt"> {
  const { status, updatedAt, ...rest } = data;
  void status;
  void updatedAt;
  return rest;
}

/**
 * Every schema below mirrors its local `src/types/*` counterpart field-for-field
 * and `.transform()`s into exactly that type, stripping the CMS-only
 * `status`/`updatedAt` bookkeeping fields. That equality is what lets
 * `resolvePageContent` share one type parameter between the CMS branch and the
 * `src/content/*.ts` fallback — the two must be assignable to the same `T`, or
 * hybrid mode cannot type-check. `sourceVerified` is synthesized `true` for CMS
 * entries for the reason given on cmsMedicalServiceSchema above.
 */
export const cmsDoctorSchema = z
  .object({
    id: z.string(),
    routeId: z.string(),
    name: bilingualSchema,
    credentials: bilingualSchema,
    bio: bilingualSchema,
    clinicalInterests: bilingualListSchema.optional(),
    practicesAesthetics: z.boolean(),
    image: z.object({
      path: z.string(),
      status: imageStatusSchema,
      photoDeclined: z.boolean().optional(),
    }),
    // Deliberately narrower than the site-wide bookingChannelSchema: a Doctor
    // can only be booked through these two channels (src/types/doctor.ts), and
    // widening it here would let the CMS hand back e.g. "walk-in" for a named
    // physician. tsc caught exactly this when the schema was first written.
    bookingChannel: z.enum(["family-doctor", "phone-medical-botox"]),
    status: feelstackContentStatusSchema,
    updatedAt: z.string().optional(),
  })
  .transform(stripEnvelope);
export type CmsDoctor = z.infer<typeof cmsDoctorSchema>;

const productSourceSchema = z.object({
  url: z.string(),
  retrievedDate: z.string(),
  publisher: z.string(),
});

const productDetailSchema = z.object({
  overview: bilingualSchema,
  whatItIs: bilingualSchema,
  productType: bilingualSchema,
  routinePlacement: bilingualSchema,
  skincareGoals: bilingualSchema.optional(),
  keyCharacteristics: bilingualListSchema.optional(),
  texture: bilingualSchema.optional(),
  howToUse: bilingualSchema,
  whenToUse: bilingualSchema.optional(),
  warnings: bilingualListSchema.optional(),
  sunSensitivityWarning: bilingualSchema.optional(),
  pregnancyWarning: bilingualSchema.optional(),
  relatedProductIds: z.array(z.string()).optional(),
  faqs: z.array(faqEntrySchema),
  sources: z.array(productSourceSchema),
  legacyNameNote: bilingualSchema.optional(),
});

export const cmsProductSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    slugAr: z.string(),
    name: bilingualSchema,
    brandId: z.string(),
    categoryIds: z.array(z.string()),
    concernIds: z.array(z.string()),
    description: bilingualSchema.optional(),
    detail: productDetailSchema.optional(),
    priceCents: z.number().int().nonnegative(),
    sizeLabel: z.string().optional(),
    images: z.array(z.object({ path: z.string(), status: imageStatusSchema, alt: bilingualSchema })),
    approvalStatus: z.enum(["approved", "pending"]),
    inStock: z.boolean(),
    variantOfId: z.string().optional(),
    status: feelstackContentStatusSchema,
    updatedAt: z.string().optional(),
  })
  .transform(stripEnvelope);
export type CmsProduct = z.infer<typeof cmsProductSchema>;

export const cmsAestheticTreatmentSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    slugAr: z.string(),
    title: bilingualSchema,
    summary: bilingualSchema,
    whoItsFor: bilingualSchema.optional(),
    serviceLocationNote: bilingualSchema.optional(),
    concernsTreated: bilingualListSchema.optional(),
    howItWorks: bilingualSchema.optional(),
    treatmentAreas: bilingualListSchema.optional(),
    duration: bilingualSchema.optional(),
    preparation: bilingualSchema.optional(),
    comfortLevel: bilingualSchema.optional(),
    treatmentDayJourney: bilingualSchema.optional(),
    downtime: bilingualSchema.optional(),
    aftercare: bilingualSchema.optional(),
    resultTimeline: bilingualSchema.optional(),
    suggestedCourse: bilingualSchema.optional(),
    safetyContraindications: bilingualListSchema.optional(),
    technologyIds: z.array(z.string()).optional(),
    relatedTreatmentIds: z.array(z.string()).optional(),
    relatedConcernIds: z.array(z.string()).optional(),
    relatedDoctorIds: z.array(z.string()).optional(),
    faqs: z.array(faqEntrySchema).optional(),
    status: feelstackContentStatusSchema,
    updatedAt: z.string().optional(),
  })
  .transform((data) => ({ ...stripEnvelope(data), sourceVerified: true as const }));
export type CmsAestheticTreatment = z.infer<typeof cmsAestheticTreatmentSchema>;

export const cmsAestheticConcernSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    slugAr: z.string(),
    title: bilingualSchema,
    summary: bilingualSchema,
    commonPresentations: bilingualSchema.optional(),
    contributingFactors: bilingualSchema.optional(),
    relatedTreatmentIds: z.array(z.string()),
    relatedConcernIds: z.array(z.string()).optional(),
    relatedTechnologyIds: z.array(z.string()).optional(),
    relatedDoctorIds: z.array(z.string()).optional(),
    faqs: z.array(faqEntrySchema).optional(),
    correctedFromSource: z.boolean().optional(),
    status: feelstackContentStatusSchema,
    updatedAt: z.string().optional(),
  })
  .transform((data) => ({ ...stripEnvelope(data), sourceVerified: true as const }));
export type CmsAestheticConcern = z.infer<typeof cmsAestheticConcernSchema>;

export const cmsTechnologySchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    slugAr: z.string(),
    title: bilingualSchema,
    manufacturer: z.string().optional(),
    summary: bilingualSchema,
    howItWorks: bilingualSchema.optional(),
    whatItAddresses: bilingualSchema.optional(),
    appointmentInvolves: bilingualSchema.optional(),
    safetyNote: bilingualSchema.optional(),
    relatedTreatmentIds: z.array(z.string()),
    relatedConcernIds: z.array(z.string()).optional(),
    relatedDoctorIds: z.array(z.string()).optional(),
    faqs: z.array(faqEntrySchema).optional(),
    status: feelstackContentStatusSchema,
    updatedAt: z.string().optional(),
  })
  .transform((data) => ({ ...stripEnvelope(data), sourceVerified: true as const }));
export type CmsTechnology = z.infer<typeof cmsTechnologySchema>;

export const cmsHealthHubArticleSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    slugAr: z.string(),
    category: z.enum([
      "family-health",
      "womens-health",
      "mental-health",
      "medical-aesthetics",
      "skin-and-hair",
      "treatment-guides",
      "clinic-news",
    ]),
    title: bilingualSchema,
    summary: bilingualSchema,
    author: z.string(),
    medicalReviewer: z.string().optional(),
    publishedAt: z.string(),
    articleUpdatedAt: z.string().optional(),
    body: bilingualSchema,
    relatedDoctorIds: z.array(z.string()).optional(),
    relatedServiceRouteIds: z.array(z.string()).optional(),
    faqs: z.array(faqEntrySchema).optional(),
    sources: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
    status: feelstackContentStatusSchema,
    updatedAt: z.string().optional(),
  })
  // `updatedAt` is overloaded: HealthHubArticle has its own editorial
  // updatedAt, while every CMS envelope also carries a bookkeeping updatedAt.
  // The wire field is named `articleUpdatedAt` to keep them distinct, and is
  // mapped back onto the domain type's `updatedAt` here.
  .transform((data) => {
    const { articleUpdatedAt, ...rest } = stripEnvelope(data);
    return { ...rest, ...(articleUpdatedAt !== undefined ? { updatedAt: articleUpdatedAt } : {}) };
  });
export type CmsHealthHubArticle = z.infer<typeof cmsHealthHubArticleSchema>;

export const cmsLegalPageSchema = z
  .object({
    id: z.enum(["terms", "privacy-policy", "accessibility", "medical-disclaimer"]),
    slug: z.string(),
    slugAr: z.string(),
    title: bilingualSchema,
    effectiveDate: z.string().nullable(),
    body: bilingualSchema,
    status: feelstackContentStatusSchema,
    updatedAt: z.string().optional(),
  })
  .transform(stripEnvelope);
export type CmsLegalPage = z.infer<typeof cmsLegalPageSchema>;

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