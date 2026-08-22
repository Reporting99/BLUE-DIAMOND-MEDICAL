# FeelStack Migration Manifest

Maps every static-content entity family in `src/content/*.ts` to its future FeelStack entity type, and records the exact commands/authorization still required before any real migration runs. No CMS writes have been executed — this is planning documentation only (brief §11, §17, and the explicit user instruction: "Do not execute CMS writes or claim migration completion until: the Blue Diamond FeelStack project/site is provisioned... a valid siteKey is supplied... CMS write authorization is explicitly supplied").

## Entity mapping

| Entity family | Local source | Count (per `docs/FINAL_ROUTE_INVENTORY.md`) | FeelStack entity type | Cache tag builder | Zod schema | Reference route (wired this pass) |
|---|---|---|---|---|---|---|
| Medical services | `src/content/medical-services.ts` | 7 live | `medical-service` | `cacheTags.medicalService` / `medicalServicesIndex` | `cmsMedicalServiceSchema` (`schemas.ts`) — **done** | `medical/[serviceId]` — **wired** |
| Doctors | inline in `src/config/routes.ts` (no dedicated content file yet) | 6 | `doctor` | `cacheTags.doctor` / `doctorsIndex` | `cmsDoctorSchema` (`schemas.ts`) — done, unwired | `doctors/[doctorId]` — not wired |
| Aesthetic treatments | `src/content/treatments.ts` | 8 live + 2 gated | `aesthetic-treatment` | `cacheTags.aestheticTreatment` / `aestheticTreatmentsIndex` | not yet written | `aesthetics/treatments/[treatmentId]` — not wired |
| Concerns | `src/content/concerns.ts` | 9 | `concern` | `cacheTags.concern` / `concernsIndex` | not yet written | `aesthetics/concerns/[concernId]` — not wired |
| Technologies | `src/content/technologies.ts` | 5 | `technology` | `cacheTags.technology` / `technologiesIndex` | not yet written | `aesthetics/technologies/[technologyId]` — not wired |
| Products (SkinMedica) | `src/content/products.ts` | 23 | `product` | `cacheTags.product` / `productsIndex` | `cmsProductSchema` (`schemas.ts`) — done, unwired | `shop/[productId]` — not wired |
| Health Hub articles | `src/content/health-hub-articles.ts` | 0 published (`healthHubArticlesEnabled: false`) | `health-hub-article` | `cacheTags.healthHubArticle` / `healthHubIndex` | not yet written | `health-hub/[articleId]` — not wired |
| Legal pages | `src/content/legal-pages.ts` | 4, all gated (`legalPagesEnabled: false`) | `legal-page` | `cacheTags.legalPage` / `legalPagesIndex` | not yet written | `[legalPageId]` — not wired |
| FAQs | inline per-entity (`faqs?: FaqEntry[]` on most content types) | — | not a standalone entity — travels embedded in its parent entity's schema, same as today | (parent entity's tag) | embedded in each parent schema | — |
| Prices | `src/content/uninsured-fees.ts`, `src/content/aesthetics-pricing.ts`, product `priceCents` | — | embedded in `medical-service`/`product`, not standalone (no separate "price" entity observed in either the brief's list or FeelStack's confirmed endpoints) | (parent entity's tag) | embedded | `medical/uninsured-services`, `aesthetics/pricing` — not wired |
| Navigation | `src/config/navigation.ts` | — | `navigation` | `cacheTags.navigation` | not yet written | `Header`/`Footer` components — not wired |
| SEO/GEO/AEO fields | `src/lib/seo/metadata.ts` + per-route `getRouteMetadata` | — | embedded in `page`/entity schemas as `title`/`description` fields (matches `feelstackResolveResponseSchema`'s existing `title`/`description`) | `cacheTags.seo` | `feelstackResolveResponseSchema` — done | all `generateMetadata` functions — not wired |
| ImageKit media paths | `src/config/imagekit.ts`, `src/content/media/image-manifest.ts` | — | stored as ImageKit path strings on the owning entity (e.g. `CmsDoctor.photoPath`), never binaries — per brief §12 | (parent entity's tag) | embedded string field | `ImageKitImage` component — not wired |

## Why only `medical-service` has a Zod schema and a wired route

Per the explicit scope decision (`docs/DFEELINGS_TO_BLUE_ARCHITECTURE_MAP.md` §5): build the complete adapter now, prove the pattern once end-to-end, and let the migration manifest — not a second bulk rewrite — carry the pattern to the rest. `cmsDoctorSchema` and `cmsProductSchema` were written as the next two schemas (doctors and products are explicitly named as priorities in the user's scope decision: *"Ensure doctors and products will become immediately manageable from FeelStack after provisioning"*) but their routes were left unwired this pass to keep the change reviewable.

## To apply the pattern to another route (e.g. `doctors/[doctorId]`)

1. Confirm/extend the entity's Zod schema in `schemas.ts` so its `.transform()` output matches the local `src/types/*.ts` shape exactly (see `cmsMedicalServiceSchema` for the pattern — TypeScript will fail `resolvePageContent`'s type-unification if the shapes drift, which is the intended safety net).
2. In the route's `page.tsx`, replace the direct `getX(id)` call with:
   ```ts
   const resolution = await resolvePageContent({
     path: `/doctors/${doctorId}`,
     locale,
     schema: cmsDoctorSchema,
     staticFallback: () => getDoctor(doctorId),
   });
   ```
3. Nothing else changes — `resolvePageContent` is a no-op network-wise while `FEELSTACK_CONTENT_MODE` stays at its default (`static`).

## Provisioning and import commands — explicitly NOT fabricated

No live FeelStack admin/import/write API was available to confirm this session (only the two *public read* endpoints — `/public/v1/sites/:siteKey/resolve` and `/public/v1/sites/:siteKey/routes` — are confirmed, from this repo's own pre-existing adapter; see `docs/FEELSTACK_CONTRACTS.md`). Per the mandatory safety rules ("Do not run migrations, CMS writes... Never guess missing architecture"), this document does **not** invent a provisioning CLI, an admin API shape, or an import script — doing so would be exactly the kind of guessed architecture the brief prohibits.

**Before any real migration:**
1. Obtain the actual Blue Diamond FeelStack site/project (who provisions it, and its real `siteKey`, is outside this session's access).
2. Obtain FeelStack's actual write/admin/import API documentation (not observed in the recovered Dfeelings source, which only ever *reads* from FeelStack — see `docs/DFEELINGS_TO_BLUE_ARCHITECTURE_MAP.md` §2).
3. Set `FEELSTACK_API_URL`, `FEELSTACK_SITE_KEY`, `FEELSTACK_REVALIDATE_SECRET` in the real deployment environment (never committed — see `.env.example`).
4. Only then set `FEELSTACK_CONTENT_MODE=hybrid` for a single entity family at a time, starting with `medical-service` (already wired), verify with the existing Playwright suite plus the new contract/failure-classification tests, then extend to the next entity per the table above.
5. This manifest's entity/count table is the exact checklist for verifying nothing was missed mid-migration.
