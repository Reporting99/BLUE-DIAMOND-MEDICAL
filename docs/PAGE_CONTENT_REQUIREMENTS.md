# Page Content Requirements

Per-page-type content specification, cross-checked against the **actual current type models and templates** (not assumed) — every field below was verified to exist or not exist in `src/types/*.ts` and to render or not render in `src/templates/*.tsx` before being marked ✅ or ⚠️. This is the spec Part 2's implementation plan and the content-writing pass both work from.

## Medical service page (`src/types/medical-service.ts`, `MedicalServiceTemplate.tsx`)

| Brief requirement (§11) | Field/section | Status |
|---|---|---|
| 1. Answer-first introduction | `summary` | ✅ |
| 2. Who it may be for | `whoItsFor` | ✅ |
| 3. What clinic is approved to help with | `whatsIncluded` | ✅ |
| 4. What patients should bring | — | ⚠️ **No field.** Not present in the approved DOCX for any service currently; not fabricatable. Flagged, not implemented. |
| 5. Appointments/walk-in/external system | `howAppointmentsWork` + `bookingChannel` | ✅ |
| 6. What to expect | `whatsIncluded`/`howAppointmentsWork` (overlapping, no dedicated field) | ⚠️ Adequate but not a dedicated section |
| 7. Relevant approved doctors | `relatedDoctorIds` | ✅ |
| 8. Insurance/fee info when verified | `contactNote` (used for uninsured-services cross-link) | ✅ |
| 9. When not appropriate | `urgentCareNote` (partial overlap) | ⚠️ Covers urgent-care redirection, not general non-appropriateness |
| 10. Emergency guidance | `urgentCareNote` | ✅ |
| 11. Related medical services | Not modeled — services aren't cross-linked to each other, only to doctors/patient-resources | ⚠️ **Real gap** — no `relatedServiceIds` field exists |
| 12. Related patient resources | `contactNote` links out informally; no typed field | ⚠️ **Real gap** |
| 13. 6-10 FAQs | `faqs?: FaqEntry[]` on the type — **currently unused by any of the 7 live services** (checked: zero services populate this field) | ⚠️ **Real gap — highest priority.** Field exists, content doesn't. |
| 14. External booking/telephone CTA | `bookingChannel` → `getBookingUrl()` | ✅ |
| 15. Medical disclaimer | `medicalDisclaimer` (shared constant, rendered on every service page) | ✅ |
| 16. Sources | Not modeled per-page | ⚠️ Tracked centrally in `docs/CONTENT_SOURCE_REGISTER.md` instead of per-page |

## Aesthetic treatment page (`src/types/aesthetics.ts`, `AestheticTreatmentTemplate.tsx`)

| Brief requirement (§12) | Field/section | Status |
|---|---|---|
| 1. Real-image hero | Handled by `ImageKitImage`, independent of content type | ✅ (pending real photography) |
| 2. Answer-first overview | `summary` | ✅ |
| 3. Concerns addressed | `concernsTreated` | ✅ |
| 4. How it works | `howItWorks` | ✅ |
| 5. Treatment areas | `treatmentAreas` | ✅ |
| 6. Quick facts (consultation, appointment length, comfort, downtime, result timeline, course) | `duration`, `comfortLevel`, `downtime`, `resultTimeline`, `suggestedCourse` — 5 of 6 present; no distinct "consultation process" field | ⚠️ Minor gap (consultation-process description) |
| 7. Consultation and assessment | Not modeled | ⚠️ Same gap as above |
| 8. Preparation | `preparation` | ✅ |
| 9. Treatment-day journey | **Not modeled at all** | ❌ **Real gap** |
| 10. Aftercare | **Not modeled at all** (only `downtime` exists, which is duration-of-recovery, not care instructions) | ❌ **Real gap** |
| 11. Expected vs. variable results | `resultTimeline` (partial) | ⚠️ No explicit "results vary by individual" framing field |
| 12. Risks and safety | `safetyContraindications` | ✅ |
| 13. Contraindications | Folded into `safetyContraindications` | ✅ (combined, acceptable) |
| 14. Technology used | `technologyIds` | ✅ |
| 15. Alternatives/related treatments | `relatedTreatmentIds` | ✅ |
| 16. Approved before/after | Not modeled on this type — separate before/after system (gated) | ✅ by design (correctly gated, not a content-model gap) |
| 17. Relevant doctors | **Not modeled at all** — confirmed via grep, zero doctor cross-linking on any aesthetic treatment page | ❌ **Real gap** |
| 18. 8-12 FAQs | `faqs` — populated on some treatments already (checked `rf-microneedling` has real FAQs), not audited across all 10 | ⚠️ Needs a per-treatment audit (tracked in `docs/CONTENT_ENRICHMENT_PLAN.md`) |
| 19. External consultation CTA | `getBookingUrl("aesthetics-consultation")` | ✅ |
| 20. Sources and medical disclaimer | **No medical disclaimer renders on this template at all** — confirmed via grep, zero matches | ❌ **Real gap, same severity as the medical-service disclaimer being present makes this inconsistency notable** |

## Concern page (`AestheticConcern` type, `ConcernTemplate.tsx`)

| Brief requirement (§13) | Status |
|---|---|
| 1-3. What it is, how it appears, contributing factors | ⚠️ Only `summary` exists — a single field, not the 3 distinct sub-sections implied |
| 4-5. When medical vs. aesthetic assessment appropriate | ❌ Not modeled |
| 6. Approved treatment options | ✅ `relatedTreatmentIds` |
| 7. Treatment-comparison block | ❌ **Not modeled** — treatments are listed as links, not compared |
| 8. Realistic expectations | ❌ Not modeled |
| 9. Relevant technologies | ❌ **Not modeled** — no `relatedTechnologyIds` on `AestheticConcern` |
| 10. Relevant doctors | ❌ Not modeled (same gap as treatments) |
| 11. Before/after | N/A — correctly deferred to the gated before/after system |
| 12. Related concerns | ❌ **Not modeled** — no `relatedConcernIds` |
| 13. Related articles | N/A while Health Hub has zero articles |
| 14. 8-12 FAQs | ❌ **`AestheticConcern` has no `faqs` field at all** — the most structurally underbuilt of the four content types |

## Technology page (`Technology` type, `TechnologyTemplate.tsx`)

| Brief requirement (§14) | Status |
|---|---|
| 1. Approved device image | ✅ (pending photography) |
| 2-3. What it is / how it works | ⚠️ Only `summary` — no dedicated "how it works" field (treatments have this, technologies don't) |
| 4. Approved treatments using it | ✅ `relatedTreatmentIds` |
| 5. Approved concerns connected | ❌ Not modeled |
| 6. Treatment areas | ❌ Not modeled |
| 7-8. Comfort/downtime/prep/aftercare | ❌ Not modeled — these live on the *treatment* using the device, not the device page itself, which is a defensible design choice (avoids duplicating the same downtime info across a device page and every treatment page that uses it) rather than a gap |
| 9. Safety/contraindications | ❌ Not modeled on this type |
| 10. Skin-tone suitability | ❌ Not modeled — correctly absent since no approved source states this |
| 11. Comparison with alternatives | ❌ Not modeled |
| 12. FAQs | ❌ **No `faqs` field** |
| 13. Consultation CTA | ✅ (inherited from page-level booking pattern) |
| 14. Manufacturer source | `manufacturer?: string` field exists but is optional/unpopulated on most entries | ⚠️ |

## Homepage (§15)

All 16 required elements were confirmed present in the existing homepage build (14-section surface rhythm, documented in earlier session work) — no gaps found. Not re-audited line-by-line here since the homepage was extensively rebuilt and verified in the prior remediation pass; `docs/VISUAL_CONTINUITY_REPORT.md` and the homepage's own inline comments cover it.

## Summary of real content-model gaps found (for `docs/CONTENT_ENRICHMENT_PLAN.md` and Part 2)

**Structural (type + template changes needed, not just content-writing) — highest priority:**
1. `AestheticTreatmentTemplate` renders no medical disclaimer at all (every medical-service page has one; every aesthetic page should too, given both involve physician-provided care).
2. No treatment page, concern page, or technology page cross-links to relevant doctors — only medical-service pages do.
3. `AestheticConcern` and `Technology` types have no `faqs` field at all (medical services and treatments do).
4. `AestheticConcern` has no treatment-comparison, related-concerns, or related-technologies modeling.
5. No treatment-day-journey or aftercare-instructions field on aesthetic treatments.

**Content-only (existing fields, just need real approved copy written) — see `docs/CONTENT_ENRICHMENT_PLAN.md` for the prioritized list:**
- 0 of 7 medical services currently populate their (already-built) `faqs` field.
- Aesthetic treatment FAQ depth needs a full per-page audit against the 8-12 target.
