# Competitor Content Benchmark

Research method: live site fetches (homepages for all 5; one treatment-page and one concern-page deep-dive as representative depth samples) plus targeted search to locate real page URLs. All observations describe **structure and patterns**, not content — no competitor sentence, heading, FAQ, or claim was copied into any Blue Diamond content. Competitor sites are structural/UX references only, per the source-of-truth hierarchy in `docs/CONTENT_SOURCE_REGISTER.md`.

Every finding below is tagged:
- **STRUCTURE INSPIRATION** — a pattern worth adapting (never copying) into Blue Diamond's own architecture.
- **VERIFIED BLUE DIAMOND FACT** — n/a in this document (this file is competitor-only; facts live in `docs/CONTENT_SOURCE_REGISTER.md`).
- **GENERAL EDUCATIONAL SOURCE** — n/a here; competitor sites are never used as a factual/educational source, only a structural one (see hierarchy rule §2).
- **REJECTED OR UNSUPPORTED CLAIM** — a pattern Blue Diamond must not imitate.

## Derm.ca

*Fetched: homepage, `/cortisone-injections` (treatment page, real URL found via search).*

| Pattern | Tag |
|---|---|
| Dual treatment organization — by medical discipline (medical vs. cosmetic dermatology) AND by concern (acne, rosacea, hair loss) simultaneously, so the same procedure is reachable two ways | STRUCTURE INSPIRATION — Blue Diamond already does this (treatments hub + concerns hub + technologies hub, cross-linked) |
| Treatment page structure: hero → overview → benefits list → "closer look" (mechanism/duration/timeline) → cross-sell → cancellation policy → contact → **only 3 FAQs** → reviews → before/after → blog cross-sell | STRUCTURE INSPIRATION for the answer-first overview → mechanism → timeline flow; **note** — derm.ca's own FAQ depth (3 questions, no quick-facts summary block) is shallower than what Blue Diamond's existing template already structurally supports (comfort/duration/downtime/result-timeline/course fields + 8-12 FAQs per §12) |
| Quantified-expertise trust signals: "40,000 skin cancer surgeries," "120,000+ patients treated," star ratings, named patient testimonials with direct review links | REJECTED — Blue Diamond has no approved patient-count, procedure-count, or review data; none of this is fabricatable |
| Media-mention badges (Calgary Herald, Calgary Sun, "What Clinic" awards) | REJECTED — no approved award/press data exists |
| Before/after galleries tied to specific named procedures | STRUCTURE INSPIRATION for pairing (treatment ↔ before/after), but only with Blue Diamond's own approved, traceable pairs (`docs/IMAGE_REPLACEMENT_MANIFEST.md`) |

## Preventous Cosmetic Medicine

*Fetched: homepage, `/hyperpigmentation/` (concern page).*

| Pattern | Tag |
|---|---|
| Dual-access navigation: concern-first (aging hands, acne) and treatment-first (Morpheus8, Botox), each pointing at the other | STRUCTURE INSPIRATION — matches Blue Diamond's existing treatments/concerns/technologies cross-linking |
| Consultation-first framing — booking language emphasizes assessment before any specific procedure is promised | STRUCTURE INSPIRATION — matches Blue Diamond's existing "suitability assessed during consultation" qualified-language convention |
| Concern page structure: tabbed condition overview → tabbed treatment-options list (7 modalities, no comparison) → single before/after case → contact form. **No FAQ section, no comparison table, no related-concerns links** | STRUCTURE INSPIRATION for the tabbed-overview idea only; the *absence* of a comparison block and FAQs here is a real gap — Blue Diamond's planned 8-12 FAQs + treatment-comparison block per concern page (brief §13) genuinely exceeds this competitor's depth rather than copying it |
| "500+ Total Treatments" volume metric, testimonial outcome language, physician-title-only presentation (no bio) | REJECTED — no approved treatment-volume data; Blue Diamond's doctor profiles already carry real bios, which is deeper than this competitor's title-only approach |
| Age-decade-segmented content ("Feel Beautiful at Every Age") | REJECTED as a framing device — implies a marketing angle not grounded in approved source content |

## Dermapure (Calgary location page)

*Fetched: `/clinics/calgary`.*

| Pattern | Tag |
|---|---|
| Structured schema data embedded per location (coordinates, daily hours, social handles) alongside the visible clinic card | STRUCTURE INSPIRATION for GEO — Blue Diamond's `MedicalClinic` JSON-LD already does this on the homepage; worth confirming address/hours schema is equally present wherever a location is mentioned |
| Multi-location directory with per-location physician/staff cards linking to individual profiles | STRUCTURE INSPIRATION — not directly applicable (Blue Diamond has one main clinic + one satellite location for Elite iQ™, not a multi-city directory), but confirms the value of the existing `serviceLocationNote` pattern already implemented for the Citizen Studio location |
| Treatment catalog organized in nested parent/child categories (Injections → Botox, dermal fillers) with some entries flagged location-specific | STRUCTURE INSPIRATION — matches Blue Diamond's existing treatments taxonomy |
| Clinical, feature-language treatment descriptions ("targets," "stimulates collagen") without visible FAQ, testimonials, or before/after on this page | Neutral — no claims to reject; confirms even a well-resourced competitor doesn't always over-claim |

## JuvyDerm

*Fetched: homepage.*

| Pattern | Tag |
|---|---|
| Numbered technology showcase (01-05 carousel), each device paired with plain-language function explanation and a link to its detail page | STRUCTURE INSPIRATION — directly applicable: Blue Diamond's homepage "Featured Technology" section and the 5 technology pages could use this same plain-language "what it does" framing without the carousel gimmick (brief explicitly discourages numbered markers unless order carries real meaning — devices aren't a sequence, so a static grid is more honest than a numbered carousel here) |
| Multi-path treatment organization: by technology, by concern, by body area, by treatment type simultaneously | STRUCTURE INSPIRATION — Blue Diamond already supports 3 of these 4 paths (technology/concern/treatment); "by body area" is not a current navigation axis and isn't required by the approved source content |
| "Health Canada–licensed" device framing, "15+ years experience," "5,000+ clients," star-rated testimonials with names | REJECTED — no approved licensing citation, client-count, or review data for Blue Diamond |
| Team presented by role (founder/RN, medical director/MD, safety officer) with real credentials, not stock-photo bios | STRUCTURE INSPIRATION for how Blue Diamond's own doctor bios are already framed (real credentials, no fabricated titles) |
| Dedicated FAQ addressing first-timer concerns, downtime, result longevity, financing, booking (25+ questions implied) | STRUCTURE INSPIRATION — this is the deepest FAQ approach observed; matches the brief's own 8-12 FAQ target for treatment pages |

## Leo & Lucy (lucyskin.ca)

*Fetched: homepage.*

| Pattern | Tag |
|---|---|
| Restrained editorial tone, "evidence-based" language, stock/clinical imagery rather than dramatic before/afters, no aggressive sales rhetoric | STRUCTURE INSPIRATION — this is the closest existing reference to Blue Diamond's own composed, physician-led, "not sales-led" brand voice (`docs/UI_UX_FOUNDATION.md` §1.2) |
| Five equal-weight service categories, no forced hierarchy suggesting one treatment is "primary" | STRUCTURE INSPIRATION |
| Single founder presented by title only, no bio, no photo in the fetched content | Neutral — Blue Diamond's fuller doctor bios are already a deeper trust signal than this |
| "25+ Years," "4.9/5" patient satisfaction rating | REJECTED — no approved years-in-practice-as-a-clinic-brand or rating data (individual doctor years of experience ARE approved and already published per-doctor, which is different from a brand-level marketing stat) |
| No FAQ section at all | Confirms the brief's FAQ requirement (§11-14) is a genuine differentiator, not table stakes to match |

## Cross-competitor synthesis

**Patterns adopted into Blue Diamond's content plan** (`docs/CONTENT_ENRICHMENT_PLAN.md`, `docs/PAGE_CONTENT_REQUIREMENTS.md`):
- Answer-first overview → mechanism/how-it-works → practical timeline framing (derm.ca, dermapure)
- Consultation-first, assessment-before-promise language (preventous) — already Blue Diamond convention
- Plain-language technology explanations without carousel gimmicks (juvyderm, adapted)
- Restrained, non-sales editorial voice (lucyskin) — already Blue Diamond's established voice
- Deep, genuinely useful FAQ sections (juvyderm's approach, exceeding preventous/dermapure/lucyskin, matching derm.ca's structure but far exceeding its 3-question depth)
- Structured location/schema data (dermapure) — already implemented, confirmed sufficient

**Patterns explicitly rejected — never to appear on Blue Diamond's site:**
- Star ratings, review counts, testimonials of any kind (none approved)
- Quantified patient/treatment/procedure counts not in the approved source
- "Years in practice" as a clinic-brand claim (only real per-doctor experience, already approved and published)
- Media/award badges
- Numbered marketing carousels for non-sequential content
- Age-decade or other invented marketing segmentation
- Device licensing claims ("Health Canada–licensed") without an approved citation

**Genuine content gap this reveals**: none of the 5 competitors' sampled concern/treatment pages combine a real comparison block with a deep FAQ section. Blue Diamond's existing template architecture (quick-facts fields already in `AestheticTreatmentTemplate`/`MedicalServiceTemplate`, plus the brief's 8-12 FAQ requirement) is structurally positioned to exceed every competitor sampled here on genuine usefulness, without needing to borrow any of their unverifiable trust-signal tactics.
