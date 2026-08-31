# Blue Diamond — Content Gaps and Approvals

Everything blocked on information that does not exist in any approved source.
Nothing here was filled in by invention, inference, or competitor content.

**"Can page publish safely?"** answers whether the *canonical page* can go live
in its current state, not whether the gap is closed.

## Blocking gaps — must be resolved before the affected page publishes

| Gap ID | Entity | Missing information | Why required | Can page publish safely? | Temporary handling | Approval owner |
|---|---|---|---|---|---|---|
| GAP-001 | `legal-terms` | Real Terms & Conditions copy | The legacy page is the literal string "Coming soon!". A clinic site with booking CTAs and a product catalogue needs enforceable terms | **No** | Route, template, and typed model built; `legalPagesEnabled: false`, route returns 404, excluded from nav and sitemap. No placeholder page renders | Client + legal counsel |
| GAP-002 | `legal-privacy-policy` | Real Privacy Policy copy | Legacy page reads "Privacy Policy coming soon". The clinic handles health information, operates secure messaging, and runs a reCAPTCHA-protected careers form — a real policy is a legal precondition, not a nicety | **No** | Same gating as GAP-001 | Client + legal counsel (Alberta HIA / PIPA) |
| ~~GAP-003~~ | `aesthetics-pricing` | ~~Approved aesthetic treatment pricing workbook~~ | **RESOLVED 2026-08-24.** `BLUE_DIAMOND_AESTHETIC_PRICING_APPROVED_2026-08-23.xlsx` (SHA-256 `d543c7b9…d7d12fd9`, 1 sheet, 81 populated rows, 81 price rows) was delivered, together with the client approval email of 2026-08-23. **All 81 rows are now mapped** (GAP-017 and GAP-018 resolved 2026-08-24). See `docs/APPROVED_AESTHETIC_PRICING_MATRIX.md`. **Implemented and published 2026-08-31** (`src/features/aesthetics/data/pricing.ts`, `aestheticPricingEnabled: true`) | Yes | 78 treatment prices are published on the treatment pages and `/aesthetics/pricing`; 3 ampoule add-ons stay `publicDisplay: false` pending GAP-014. **No price was estimated and no package price inferred.** | — resolved |
| GAP-012 | `legal-medical-disclaimer` | Medical disclaimer copy | The site publishes treatment mechanisms, contraindications, and outcome timelines across ~20 pages. A disclaimer is the standard containment for that | **No** | Route built and gated | Client + legal counsel |
| GAP-013 | `treatment-ultra` | Physician sign-off on the actinic keratosis (pre-cancerous lesion) indication | A pre-cancerous condition cannot be presented as a cosmetic indication behind a booking button; it needs a medical-assessment pathway | Page yes, **that indication no** | Indication held at `NEEDS_CLIENT_APPROVAL` and omitted from the published indication list | Dr. Farhat / clinical lead |
| GAP-014 | `treatment-rf-microneedling` | Physician sign-off on the topical-infusion serum list (Hyaluronic Acid, Botox for pore size, Poly-L-Lactic Acid, Poly-D-L-Lactic Acid, Tranexamic Acid) | Names prescription agents and an off-label Botox indication | Page yes, **serum list no** | List held at `NEEDS_CLIENT_APPROVAL` | Dr. Farhat / clinical lead |

## Non-blocking gaps — page publishes, content is degraded or held back

| Gap ID | Entity | Missing information | Why required | Can page publish safely? | Temporary handling | Approval owner |
|---|---|---|---|---|---|---|
| GAP-004 | `aesthetics-before-after` + 5 treatment pages | Approved before/after photography | Five legacy pages carry an empty "Before & After" gallery module with no assets; the 2026-08-24 media pack supplies none either | Yes | Gallery excluded as an empty module; dedicated route gated (`beforeAfterEnabled: false`). Fabricating or sourcing stand-in imagery is forbidden | Client |
| GAP-005 | `health-hub` | Approved, medically-reviewed article copy | Hub is published with zero articles; template and model are built | Yes (hub) | `healthHubArticlesEnabled: false`; no machine-generated medical content published | Client + clinical reviewer |
| GAP-006 | `doctor-hamdi` | Confirmation of whether Dr. Hamdi still practises aesthetics | The aesthetics site listed her; the approved record flags only Dr. Farhat | Yes | `practicesAesthetics` relation left off pending confirmation; the biography publishes | Client |
| GAP-007 | `patient-resources-hub` | Nothing missing — 4 approved policies are simply not yet rendered | General Conduct, Test Results, Referrals & Investigations, and Telephone Consultations are approved source content sitting unpublished | Yes | Classified `MERGE_WITH_CANONICAL_ENTITY`; scheduled for the implementation pass. **This is an implementation task, not a client approval** | Internal — implementation |
| GAP-008 | 23 `shop-product-*` | Approved, uploaded SkinMedica product photography | Every product record is complete (name, price, size, descriptions, category, usage, sources), but no packshot is live. Per `docs/IMAGEKIT_MISSING_ASSETS.md` (committed 2026-08-24) an asset pack covering **19 of 23** products exists; that import run stopped at the credential gate and **uploaded nothing**, so all 23 records remain `status: "pending"` and 4 products have no source asset at all | Yes | Approved neutral placeholder renders for all 23 | Client + internal (ImageKit credentials) |
| GAP-009 | `hours:main-clinic`, `hours:aesthetics` | Day-by-day weekly schedule | Both legacy sites published only a single "Open today" line. Saturday and Sunday are recorded as unconfirmed, not as verified closures | Yes | Weekdays published from the source value; unconfirmed days omitted from opening-hours structured data rather than asserted as closed (wrong hours in local search actively misdirect patients) | Client |
| GAP-010 | `booking:walk-in` | Whether Skip the Waiting Room is still in use | `ab.skipthewaitingroom.com` appears in the source but is not in the approved booking allowlist | Yes | Walk-in booking routes through the approved Mika channel. **No URL invented**; every booking href resolves through the centralized typed booking config | Client |
| GAP-011 | 9 treatment/concern blocks | "Individual results vary" qualifier on outcome-timeline statements | Statements such as "visible uniformity in as little as 2 treatments", "spider veins in as little as 2 treatments", "effects lasting up to 2 years", "nourished and glowing for months", "easily removed", "faster, more dramatic results" are stated as typical protocol without a qualifier | Yes, with the qualifier | Publish with a standard results-vary qualifier applied consistently. The Ultra page already carries one, which sets the precedent | Client (wording sign-off) |
| GAP-015 | `treatment-rf-microneedling` | Definition and price of the "post-treatment care kit"; contents of the "pamper packages" | **Partly resolved 2026-08-24**: the unidentified "Flexure body firming" is confirmed as **TempSure FlexSure**, a real Cynosure body applicator, now carrying an approved price (workbook row 38, Large, $800) mapped to `treatment-radio-frequency`. The post-treatment care kit still has no SKU, contents, or price, and "pamper package" contents remain undefined | Yes | Care kit and package contents omitted; the FlexSure price publishes as an individual service price, never as a package | Client |
| GAP-016 | `treatment-rf-microneedling` | Definition and price of the 3- and 5-session packages | **Resolved by client instruction 2026-08-24.** The approved workbook contains **no package-price rows at all**, and the client approved a general note directing package enquiries to the team. No package amount is published | Yes | Package structure mentioned only as a clinical recommendation, with no price, alongside `PRICING-NOTE-001` | — resolved |

## Claim approvals — content held at `NEEDS_CLIENT_APPROVAL` (§12)

Each of these publishes only after sign-off, or with the flagged phrase removed.

| Gap ID | Entity | Claim held | Claim type | Temporary handling | Approval owner |
|---|---|---|---|---|---|
| CLM-001 | `home` | "Male and Female Physicians Accepting New Patients" | Eligibility/availability | Hero publishes without the acceptance claim | Client |
| CLM-002 | `home` | "Experience the best in beauty and rejuvenation" | Superiority | Sentence removed | Client |
| CLM-003 | `aesthetics-hub` | "the best possible care" | Superiority | Sentence removed | Client |
| CLM-004 | `concern-razor-bumps` | "world-leading technologies" | Superiority | Phrase removed | Client |
| CLM-005 | both `treatment-prp-*` | "Safe, natural procedures" · "Proven results that speak for themselves" · "Minimal discomfort and no lengthy recovery" | Safety + proven-results + downtime | Whole "Why Choose" block withheld | Dr. Farhat / clinical lead |
| CLM-006 | `treatment-laser-hair-removal` | "permanent hair reduction" | Permanence without qualification | Published as "long-lasting hair reduction" pending sign-off | Clinical lead |
| CLM-007 | `technology-elite-iq` | "proven safety record" | Safety | Phrase removed | Clinical lead |
| CLM-008 | `technology-elite-iq` | Skintel™ "first Health Canada and FDA cleared melanin reader on the market" | Regulatory / certification | Claim withheld pending manufacturer documentation | Client + Cynosure |
| CLM-009 | `treatment-laser-hair-removal` | ASAPS "3rd most performed non-surgical cosmetic treatment in the US" | Unsourced third-party statistic about another country | Statistic withheld | Client |
| CLM-010 | `treatment-radio-frequency` | "Does it hurt? Not at all" | Unqualified pain-free promise | Answer republished from the qualified second clause only | Clinical lead |
| CLM-011 | `concern-spider-veins` | "quickly and painlessly" | Pain-free promise | Phrase removed | Clinical lead |
| CLM-012 | `technology-tempsure` | "zero downtime" | Absolute downtime promise | Published as "virtually no downtime", matching the treatment page (CONF-012) | Clinical lead |
| CLM-013 | `botox-hub` | "back to your normal schedule within 90 minutes" | Recovery-time promise | Withheld pending clinician confirmation | Clinical lead |
| CLM-014 | `botox-hub` | Botox for migraine/bruxism/hyperhidrosis "covered by a combination of provincial health insurance and either patient private insurance or our compassionate program" | Insurance/eligibility guarantee | Published in a hedged form; written coverage confirmation required. The separate "open to all Albertans whether registered or not" statement is the clinic's own policy and publishes as-is | Client |
| CLM-015 | `medical-eye-screening` | "free screening… covered by Alberta Health Care" | Insurance/eligibility guarantee | Operational description publishes; the coverage claim is withheld | Client |
| CLM-016 | `treatment-rf-microneedling` | "Ozempic face and belly" · "avoiding the need for surgery in some patients" | Third-party drug reference + surgical-alternative claim | Paragraph withheld | Clinical lead |
| CLM-017 | `treatment-tempsure-vitalia` | "1 in 3 women suffer from these issues" | Unsourced prevalence statistic | Statistic withheld; the service description publishes | Clinical lead |
| CLM-018 | `medical-hub` | "Onsite Paediatrician" | Unsupported credential/specialist claim (CONF-018) | Not published | Client |
| CLM-019 | `book-appointment` | Walk-in clinic "headed by Dr. Omonijo, Dr. Gwea and Dr. Saeed" | Staffing/rota claim (CONF-017) | Walk-in service publishes without a named rota | Client |
| CLM-020 | `medical-after-hours-care` | Per-doctor PCN assignment (Mosaic for Hamdi, CWC for Farhat) | Contradicts the clinic-wide CWC statement; 4 of 6 physicians unaccounted for (CONF-009) | PCN service publishes; no per-doctor assignment shown | Client |
| CLM-021 | `location:main-clinic` | Business name variant "Blue Diamond Esthetics Medical Spa" | Structured-data / legal name (CONF-006) | Legal name stays "Blue Diamond Medical Clinic"; the variant is excluded | Client |

## Configuration reviews (not content gaps)

| Gap ID | Entity | Item | Why required | Can page publish safely? | Temporary handling | Approval owner |
|---|---|---|---|---|---|---|
| CFG-001 | `doctor-saeed` | Missing booking CTA on the legacy page — the only physician without one | Could be a deliberate omission (not accepting bookings) or a legacy oversight. **No booking URL was invented** | Yes | Currently assigned the shared `family-doctor` (Mika) channel used by every other physician. Confirm this is correct | Client |
| CFG-002 | `doctor-saeed` | Portrait policy — approved branded abstract tile | §7: no portrait, stock person, generated face, or human silhouette may be displayed. She has declined photography; the approved abstract tile is also absent from the media pack | Yes | `image.status: "disabled"`, `photoDeclined: true`; abstract FacetTile renders | Client |
| CFG-003 | `doctor-gwea` | Approved photograph, **and** the approved branded abstract placeholder itself | §7: must use the approved branded abstract placeholder until a real photograph is supplied. `docs/IMAGEKIT_MISSING_ASSETS.md` records that the media pack contains **no doctor imagery of any kind**, including that placeholder | Yes | The code-generated abstract FacetTile stands in — never a stock or generated person | Client |
| CFG-004 | `doctor-gwea` | Biography markup | Both biography paragraphs are authored as `###` headings in the source | Yes | Convert to body text with **no change to meaning** — a structural correction, not an edit | Internal — implementation |
| CFG-005 | Aesthetics domain | Host-level 301 for `bluediamondmedicalaesthetics.ca/` | The domain root has no mapping; without it the aesthetics site keeps resolving as a second canonical website | **Blocks launch** | PROPOSED in the redirect map; requires DNS/hosting configuration, not app code | Internal — infrastructure |
| CFG-006 | `contact:fax` | Fax reconciliation | Same value on both domains, formatted differently | Yes | **Frozen — no change this phase per explicit client instruction** (CONF-007) | Client (deferred) |


## Pricing gaps opened by the 2026-08-23 workbook — resolved 2026-08-24

All three were closed by authoritative client classification decisions. No source
value was altered and no row was guessed at.

| Gap ID | Entity | Status | Resolution |
|---|---|---|---|
| ~~GAP-017~~ | `treatment-ultra` + `treatment-rf-microneedling` | **RESOLVED** | Workbook row 28 is a **named combined treatment protocol** — "Ultra Skin Solutions", `priceFamily: "combined-treatment-protocol"`, components `treatment-ultra` + `treatment-rf-microneedling`, technologies Ultra + Potenza, `treatmentArea: null`, $1,300, `priceType: "fixed"`, `packagePrice: false`, `publicDisplay: true`. It is **not** a multi-session package, not a body area, and gets **no new canonical route** — it renders in a "Combination Treatments" section on `/aesthetics/pricing`. Published wording is limited to "combines Ultra and Potenza"; no benefits, duration, areas, results, or course invented. The workbook's "specialized topical **can be added**" means the topical is **not** included in the $1,300 |
| ~~GAP-018~~ | Add-on ampoules (rows 83–85) | **RESOLVED** | A new pricing entity family, **Aesthetic Treatment Add-On** (`ApprovedTreatmentAddOnPrice`), with `priceType: "per-unit"`, `unit: ampoule`, and a **many-to-many** `eligibleTreatmentIds` relation (`rf-microneedling-fusion-infusion`, `ultra-treatment`). Each add-on is stored **once**, not duplicated under every eligible treatment. The client-approved workbook establishes **commercial** price approval for all three rows, **including the handwritten Vitamin A entry**, which is recorded in `sourceNote` rather than treated as a defect |
| GAP-019 | `technology-tempsure` | **Commercial price issue resolved; non-blocking presentation question remains** | TempSure Envi and TempSure FlexSure prices are approved, mapped, and publicly displayable — there was never a price blocker. What remains is a presentation decision: whether Envi and FlexSure become distinct technology entities or stay named applicator variants of `technology-tempsure`. Currently mapped as variants; no technology entity invented. **Does not block pricing publication** |

### Clinical-review blocker — preserved, unchanged

| Gap ID | Entity | Missing information | Why required | Can page publish safely? | Temporary handling | Approval owner |
|---|---|---|---|---|---|---|
| GAP-014 | `treatment-rf-microneedling` + the 3 ampoule add-ons | Physician sign-off on the topical-infusion agent list (Hyaluronic Acid, Botox for pore size, Poly-L-Lactic Acid, Poly-D-L-Lactic Acid, Tranexamic Acid) | Names prescription agents and an off-label Botox indication. **Commercial price approval does not replace clinical review** | Pricing page yes; **ampoule publication no** | All three ampoule records carry `clinicalPublicationStatus: "pending-clinician-review"` and `publicDisplay: false`. **No clinical indication, benefit, suitability statement, or usage claim is published for any ampoule.** Prices are stored and classified, not shown | Dr. Farhat / clinical lead |

This blocker predates the workbook — it originates in the Word source (line 865)
— and the workbook does not address it. It is unchanged by this pass.

## Summary

| | Count |
|---|---|
| Blocking gaps (page cannot publish) | 5 |
| Non-blocking gaps | 11 |
| Claim approvals pending | 21 |
| Configuration reviews | 6 |
| **Total open items** | **43** |
| Resolved to date | 4 — GAP-003, GAP-016, GAP-017, GAP-018 (plus GAP-015 partly, GAP-019 commercially) |
| Launch-blocking items | 6 — GAP-001, GAP-002, GAP-012, GAP-013, GAP-014, CFG-005 |
| Items requiring client sign-off | 39 |
| Items resolvable internally | 4 — GAP-007, CFG-004, CFG-005, plus the PROPOSED redirect entries |

Unchanged by this pass, deliberately:

- **Legal-content blockers** GAP-001 (Terms), GAP-002 (Privacy Policy), and
  GAP-012 (Medical Disclaimer) stand exactly as recorded.
- **Clinical-claim blockers** GAP-013 (actinic keratosis indication) and GAP-014
  (topical infusion list) stand exactly as recorded. GAP-014 now also gates the
  three ampoule add-ons.
- **CFG-006 / CONF-007 — the fax number remains frozen. No change made.**
- **`SITE_LAUNCHED=false`** — verified unchanged in `active-release.env`, absent
  from both slot runtime files and `.env.production`.

Aesthetic pricing is no longer gap-blocked: all 81 approved price rows are
classified, 78 treatment prices are publishable, and the 3 ampoule add-on prices
are stored with `publicDisplay: false` pending GAP-014.

## Cross-references

This register is scoped to **content** gaps found in
`BLUE_DIAMOND_CONTENT.md`. Media-asset gaps are tracked separately and in more
detail in `docs/IMAGEKIT_MISSING_ASSETS.md`, `docs/IMAGEKIT_IMPORT_REPORT.md`,
`docs/MEDIA_QA_REPORT.md`, and `docs/FEELSTACK_MEDIA_MAPPING.md` (committed
2026-08-24 by a separate media-import pass). GAP-004, GAP-008, CFG-002, and
CFG-003 above are the content-side view of those findings; where the two differ,
the media reports are authoritative on asset state.
