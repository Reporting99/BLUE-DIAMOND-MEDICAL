# Content Enrichment Plan

Prioritized plan for Part 2, built from `docs/PAGE_CONTENT_REQUIREMENTS.md`'s gap analysis and `docs/COMPETITOR_CONTENT_BENCHMARK.md`'s structural findings. Two tracks: **content-only** (existing fields, needs real copy) and **structural** (needs a type/template change before content can even be written). Content-only items completed this pass are marked ✅ done; everything else is scoped and ready to execute.

## Track A — Content-only (no code changes needed beyond content files)

| Item | Status | Detail |
|---|---|---|
| Medical service FAQs (7 pages, 6 FAQs each = 42 FAQs) | ✅ **Done this pass** | Written directly into `src/content/medical-services.ts`, grounded entirely in the existing approved fields on each service (no new facts invented). `FAQPage` schema wired to match (`src/components/seo/FaqPageSchema.tsx`), verified against visible content by test. |
| Aesthetic treatment FAQs | ✅ **Done (Part 2)** | All 8 live treatments now have real FAQs (3 already had thin sets from earlier passes; 5 that had zero were written this pass — laser-skin-treatments, radio-frequency, ultra, prp-skin-rejuvenation, tempsure-vitalia). Counts range 3-7 per treatment — below the 8-12 target for several; a follow-up pass to deepen the thinner ones (laser-hair-removal at 3, prp-hair-restoration at 1) is still worthwhile but no longer a hard zero-content gap. |
| `FAQPage` schema wired to aesthetic treatment template | ✅ **Done** | `AestheticTreatmentTemplate.tsx` renders `FaqPageSchema` alongside its visible FAQ block. |
| Concern-page and technology-page FAQs | ✅ **Done (Part 2)** | Unblocked by adding `faqs?: FaqEntry[]` to both types (Track B item 1, done this pass). All 9 concerns and all 5 technologies now have real, grounded FAQs (3-6 each), rendered with matching `FaqPageSchema`. |

## Track B — Structural (type + template changes needed first, Part 2 scope)

Ranked by how much downstream content work depends on each. **All of 1-3 and 5 are done as of Part 2**; 4 (partial), 6, and 7 remain.

1. ✅ **Done.** `faqs?: FaqEntry[]` added to `AestheticConcern` and `Technology`, rendered in `ConcernTemplate.tsx`/`TechnologyTemplate.tsx`, wired to `FaqPageSchema`. All 9 concerns and all 5 technologies now have real FAQ content.
2. ✅ **Done.** `medicalDisclaimer` (the existing shared constant) is now rendered on `AestheticTreatmentTemplate` and `ConcernTemplate`. Not yet added to `TechnologyTemplate` — devices themselves aren't medical advice in the same direct way a treatment or concern page is, but this is worth a final consistency pass rather than a considered omission.
3. ✅ **Done.** `relatedDoctorIds?: string[]` added to all three aesthetics types, rendered the same way `MedicalServiceTemplate` does it. Every treatment, concern, and technology entry now cross-links to Dr. Farhat (the only physician with `practicesAesthetics: true`).
4. **Partially done.** `relatedConcernIds?: string[]` and `relatedTechnologyIds?: string[]` were added to `AestheticConcern` (type + template render), but content population is incomplete — most concern entries don't yet list related concerns/technologies (only what naturally exists via shared treatments). A genuine treatment-*comparison* block (not just a link list) — the piece that would let Blue Diamond's concern pages exceed every competitor sampled — is still not built.
5. ✅ **Done.** `treatmentDayJourney?: Bilingual` and `aftercare?: Bilingual` added to `AestheticTreatment` and rendered, though no treatment entry populates them with content yet (the approved source doesn't describe a separate treatment-day journey or aftercare instructions beyond what's already captured in `downtime`/`preparation` — populating these honestly needs either a source re-read or a client-confirmed addition, not invention).
6. **Not done.** A dedicated "consultation and assessment" field/section.
7. **Not done.** `relatedServiceIds?: string[]` on `MedicalServiceContent` — the type field was added, but no medical-service entries populate it yet, and `MedicalServiceTemplate` doesn't render it.

## Track C — Route-level (already executed this pass, listed for completeness)

- 3 legacy-redirect targets corrected (`docs/ROUTE_DECISION_LOG.md`).
- Arabic-language booking-system accommodation copy drafted, not yet implemented (`docs/BOOKING_SYSTEMS.md`) — small, Part 2 item.

## Track D — Data/approval-blocked (cannot proceed without a client decision, tracked, not re-litigated here)

- Doctor roster/count final confirmation.
- 3 unidentified physician portraits.
- Clinical/marketing review of 15 before/after candidate assets.
- SkinMedica product photography.
- Aesthetics-treatment pricing, legal copy, consultation-intake approval, weekend-hours confirmation.

All unchanged from `docs/DATA_APPROVAL_BLOCKERS.md` — restated here only so this plan is self-contained about what it can't unblock on its own.

## Recommended Part 2 execution order

1. Track B items 1-3 (FAQ field + disclaimer + doctor cross-links) — highest content-unlock value, lowest risk (additive optional fields, no breaking changes to existing templates).
2. Write the now-unblocked concern-page and technology-page FAQs (Track A, was blocked on Track B).
3. Track B items 4-6 (comparison block, aftercare/journey fields) — larger content-writing lift once fields exist.
4. Complete the aesthetic-treatment FAQ audit (Track A, independently schedulable any time).
5. Track B item 7 (service cross-linking) — smallest remaining item.
6. Implement the Arabic booking-language note (Track C).

This order front-loads the changes that unblock the most *other* content work, consistent with how Track A's medical-service FAQs (needing no structural change) were completed first in this very pass.
