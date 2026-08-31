# Blue Diamond — Approved Aesthetic Pricing Matrix

Reconciliation of the approved cosmetic-treatment pricing workbook against the
canonical treatment taxonomy.

> **Implementation status — 2026-08-31.** This matrix was documentation-only
> when first written (no application source was touched in that pass). It has
> since been implemented: all 81 rows now live in
> `src/features/aesthetics/data/pricing.ts`, keyed by the `PR-0xx` ids below,
> with `aestheticPricingEnabled: true`. The 78 `publicDisplay: true` rows render
> on each treatment page and on `/aesthetics/pricing`; the 3 ampoule add-ons
> stay unpublished pending GAP-014. This document remains the source of record
> that `tests/unit/aesthetic-pricing.spec.ts` asserts the code against — if the
> two ever disagree, this document wins and the test fails.

## Approved source

| Field | Value |
|---|---|
| Filename | `BLUE_DIAMOND_AESTHETIC_PRICING_APPROVED_2026-08-23.xlsx` |
| Location | `/home/blue-diamond-sources/` — **kept outside the repository**; not copied into the repo, `public/`, `src/`, or any deployment/release directory |
| SHA-256 | `d543c7b9cc02c29930aaf59e4e5ea587a6b098419aaa392cfa3afe1ee7d12fd9` |
| Size | 13,668 bytes |
| Author (docProps) | Blue Diamond Medical |
| Created / modified (docProps) | 2026-08-20T16:28:34Z / 2026-08-20T16:45:31Z |
| Sheets | **1** — `Sheet1` |
| Named tables | 1 — `Table1`, ref `C3:F85` |
| Sheet dimension | `C3:F85` |
| Columns | C `TREATMENTS` · D `AREA` · E `PRICE` · F `NOTES / EQUIPMENTS/ ADD ON AMPOULES` |
| Rows with content | 83 (rows 3–85) |
| Header row | Row 3 |
| Header artifact | Row 4 — column F only, repeats the header string `NOTES / EQUIPMENTS/ ADD ON AMPOULES`. Not a price row; recorded and excluded |
| **Populated data rows** | **81** (rows 5–85) |
| Currency | CAD (no currency column; all values are bare integers, treated as CAD per the client approval) |

Every cell was extracted programmatically from the OOXML parts (`sharedStrings.xml`
+ `worksheets/sheet1.xml`). No row was sampled, summarised, or skipped.

## Client approval email — 2026-08-23

Highest-authority source in this pass. Two directives:

1. **Price override** — `PRP microneedling for the neck is priced at $850, the
   same as the face.` This fills workbook row 78, whose PRICE cell (E78) is
   **empty**. It is the only missing price in the workbook and the only email
   override applied.
2. **Approved public note** — stored as a general pricing note, **not** as a
   product or treatment price:

   > Customized treatment packages are available based on individual client
   > needs. Please contact our team for a personalized treatment plan and
   > package pricing.

**Applied precedence:** client approval email → approved pricing workbook →
approved structured pricing records → Word extraction → legacy websites.

## Data integrity checks (all run programmatically)

| Check | Result |
|---|---|
| Populated data rows | 81 |
| Rows with a numeric price in the workbook | 80 |
| Rows with an empty PRICE cell | 1 — row 78, resolved by the email override |
| Non-numeric / text prices | 0 |
| "Starting from" / "from" wording anywhere in the workbook | 0 — none created |
| Explicit package-price rows in the workbook | **0** |
| Multi-session or bundle pricing columns | 0 |
| Tax, discount, financing, or insurance statements | 0 — none added |
| Duplicate `(TREATMENT, AREA)` keys | **0** |
| Numeric conflicts (same key, different price) | **0** |
| Repeated treatment areas across different treatments | Preserved — e.g. "Neck" appears under RF Microneedling Regular ($650), RF Fusion ($1,100), Ultra ($425), TempSure Envi ($350), and PRP Microneedling ($850). **None dropped, none merged** |
| Identical prices across unlike treatments | 9 price values recur across different treatments (e.g. $750 appears on 6 unlike rows). **Not merged** — each stays its own record |
| Competitor pricing (Silk Touch, Preventous, any other clinic) | **0** — no external price entered Blue Diamond data |
| Sum of all workbook numeric prices | $35,005 (arithmetic control total) |

## Pricing matrix — all 81 rows

`Price ID` is stable. `Workbook row` is the literal 1-indexed Excel row.
Prices are exact workbook values; nothing was rounded, estimated, or inferred.

| Price ID | Workbook sheet | Workbook row | Category | Canonical treatment | Variant | Treatment area | Price CAD | Source | Approval | Public display | Reason |
| -------- | -------------- | ------------ | -------- | ------------------- | ------- | -------------- | --------: | ------ | -------- | -------------- | ------ |
| PR-001 | Sheet1 | 5 | RF Microneedling – Regular Tip | `treatment-rf-microneedling` — RF Micro-Needling | Regular tip | Perioral (smile lines) | $350 | Workbook | approved | Yes | Technology: Potenza; Workbook note: "Potenza" |
| PR-002 | Sheet1 | 6 | RF Microneedling – Regular | `treatment-rf-microneedling` — RF Micro-Needling | Regular tip | Periorbital (eyes) | $350 | Workbook | approved | Yes | Technology: Potenza; Workbook note: "Potenza" |
| PR-003 | Sheet1 | 7 | RF Microneedling – Regular | `treatment-rf-microneedling` — RF Micro-Needling | Regular tip | Full Face | $750 | Workbook | approved | Yes | Technology: Potenza; Workbook note: "Potenza" |
| PR-004 | Sheet1 | 8 | RF Microneedling – Regular | `treatment-rf-microneedling` — RF Micro-Needling | Regular tip | Full Face with Fusion Upgrade | $950 | Workbook | approved | Yes | Technology: Potenza; Workbook note: "Potenza" |
| PR-005 | Sheet1 | 9 | RF Microneedling – Regular | `treatment-rf-microneedling` — RF Micro-Needling | Regular tip | Cheeks | $450 | Workbook | approved | Yes | Technology: Potenza; Workbook note: "Potenza" |
| PR-006 | Sheet1 | 10 | RF Microneedling – Regular | `treatment-rf-microneedling` — RF Micro-Needling | Regular tip | Forehead | $450 | Workbook | approved | Yes | Technology: Potenza; Workbook note: "Potenza" |
| PR-007 | Sheet1 | 11 | RF Microneedling – Regular | `treatment-rf-microneedling` — RF Micro-Needling | Regular tip | Neck | $650 | Workbook | approved | Yes | Technology: Potenza; Workbook note: "Potenza" |
| PR-008 | Sheet1 | 12 | RF Microneedling – Regular | `treatment-rf-microneedling` — RF Micro-Needling | Regular tip | Face and Neck | $1,250 | Workbook | approved | Yes | Technology: Potenza; Workbook note: "Potenza" |
| PR-009 | Sheet1 | 13 | RF Microneedling – Body | `treatment-rf-microneedling` — RF Micro-Needling | Regular tip — body | Decolletage | $650 | Workbook | approved | Yes | Technology: Potenza; Workbook note: "Potenza" |
| PR-010 | Sheet1 | 14 | RF Microneedling – Body | `treatment-rf-microneedling` — RF Micro-Needling | Regular tip — body | Abdomen (Full) | $1,400 | Workbook | approved | Yes | Technology: Potenza; Workbook note: "Potenza" |
| PR-011 | Sheet1 | 15 | RF Microneedling – Body | `treatment-rf-microneedling` — RF Micro-Needling | Regular tip — body | Abdomen (Upper and Lower) | $750 | Workbook | approved | Yes | Technology: Potenza; Workbook note: "Potenza" |
| PR-012 | Sheet1 | 16 | RF Microneedling – Body | `treatment-rf-microneedling` — RF Micro-Needling | Regular tip — body | Arms (Back) | $800 | Workbook | approved | Yes | Technology: Potenza; Workbook note: "Potenza" |
| PR-013 | Sheet1 | 17 | RF Microneedling – Fusion/Infusion | `treatment-rf-microneedling` — RF Micro-Needling | Fusion / infusion tip + ampoule | Small Area (Eyes, Cheeks, Forehead, etc.) | $850 | Workbook | approved | Yes | Technology: Potenza; Workbook note: "Specialized topicals (AMPOULE)" |
| PR-014 | Sheet1 | 18 | RF Microneedling – Fusion/Infusion | `treatment-rf-microneedling` — RF Micro-Needling | Fusion / infusion tip + ampoule | Neck | $1,100 | Workbook | approved | Yes | Technology: Potenza; Workbook note: "Specialized topicals (AMPOULE)" |
| PR-015 | Sheet1 | 19 | RF Microneedling – Fusion/Infusion | `treatment-rf-microneedling` — RF Micro-Needling | Fusion / infusion tip + ampoule | Full Face | $1,250 | Workbook | approved | Yes | Technology: Potenza; Workbook note: "Specialized topicals (AMPOULE)" |
| PR-016 | Sheet1 | 20 | RF Microneedling – Fusion/Infusion | `treatment-rf-microneedling` — RF Micro-Needling | Fusion / infusion tip + ampoule | Full Face & Neck | $1,550 | Workbook | approved | Yes | Technology: Potenza; Workbook note: "Specialized topicals (AMPOULE)" |
| PR-017 | Sheet1 | 21 | Ultra | `treatment-ultra` — Ultra Treatment | — | Full Face | $750 | Workbook | approved | Yes | Technology: Ultra; Workbook note: "Ultra Laser + Specialized topical can be added" |
| PR-018 | Sheet1 | 22 | Ultra | `treatment-ultra` — Ultra Treatment | — | Moderate – Full Face | $550 | Workbook | approved | Yes | Technology: Ultra; Workbook note: "(Ultra Laser + Specialized topical can be added)" |
| PR-019 | Sheet1 | 23 | Ultra | `treatment-ultra` — Ultra Treatment | — | Ultra-Light Glow Full Face | $350 | Workbook | approved | Yes | Technology: Ultra; Workbook note: "Ultra Laser + Specialized topical can be added" |
| PR-020 | Sheet1 | 24 | Ultra | `treatment-ultra` — Ultra Treatment | — | Neck | $425 | Workbook | approved | Yes | Technology: Ultra; Workbook note: "Ultra Laser + Specialized topical can be added" |
| PR-021 | Sheet1 | 25 | Ultra | `treatment-ultra` — Ultra Treatment | — | Full Face + Neck | $900 | Workbook | approved | Yes | Technology: Ultra; Workbook note: "Ultra Laser + Specialized topical can be added" |
| PR-022 | Sheet1 | 26 | Ultra | `treatment-ultra` — Ultra Treatment | — | Decolletage | $600 | Workbook | approved | Yes | Technology: Ultra; Workbook note: "Ultra Laser + Specialized topical can be added" |
| PR-023 | Sheet1 | 27 | Ultra | `treatment-ultra` — Ultra Treatment | — | Small Area | $425 | Workbook | approved | Yes | Technology: Ultra; Workbook note: "Ultra Laser + Specialized topical can be added" |
| PR-024 | Sheet1 | 28 | Ultra + Potenza | **Combined treatment protocol** — components `treatment-ultra` + `treatment-rf-microneedling` | Ultra Skin Solutions | — *(none; `treatmentArea: null`)* | $1,300 | Workbook | approved | Yes — "Combination Treatments" section | Named combined protocol, **not** a multi-session package (`packagePrice: false`). The AREA cell is the protocol name, so `treatmentArea` is null — no body area invented. Technologies: Ultra + Potenza. No new canonical route created. Workbook note says a specialized topical "can be added", so the topical is **not** included in the $1,300 |
| PR-025 | Sheet1 | 29 | TempSure Envi | `treatment-radio-frequency` — Radio Frequency | TempSure Envi (face) | Perioral (smile lines) | $300 | Workbook | approved | Yes | Technology: TempSure |
| PR-026 | Sheet1 | 30 | TempSure Envi | `treatment-radio-frequency` — Radio Frequency | TempSure Envi (face) | Periorbital (eyes) | $300 | Workbook | approved | Yes | Technology: TempSure |
| PR-027 | Sheet1 | 31 | TempSure Envi | `treatment-radio-frequency` — Radio Frequency | TempSure Envi (face) | Full Face | $650 | Workbook | approved | Yes | Technology: TempSure |
| PR-028 | Sheet1 | 32 | TempSure Envi | `treatment-radio-frequency` — Radio Frequency | TempSure Envi (face) | Cheeks | $350 | Workbook | approved | Yes | Technology: TempSure |
| PR-029 | Sheet1 | 33 | TempSure Envi | `treatment-radio-frequency` — Radio Frequency | TempSure Envi (face) | Forehead | $350 | Workbook | approved | Yes | Technology: TempSure |
| PR-030 | Sheet1 | 34 | TempSure Envi | `treatment-radio-frequency` — Radio Frequency | TempSure Envi (face) | Neck | $350 | Workbook | approved | Yes | Technology: TempSure |
| PR-031 | Sheet1 | 35 | TempSure Envi | `treatment-radio-frequency` — Radio Frequency | TempSure Envi (face) | Face and Neck | $800 | Workbook | approved | Yes | Technology: TempSure |
| PR-032 | Sheet1 | 36 | TempSure Vitalia | `treatment-tempsure-vitalia` — TempSure Vitalia | — | Area | $500 | Workbook | approved | Yes | Technology: TempSure Vitalia |
| PR-033 | Sheet1 | 37 | TempSure Vitalia | `treatment-tempsure-vitalia` — TempSure Vitalia | — | Full | $1,000 | Workbook | approved | Yes | Technology: TempSure Vitalia |
| PR-034 | Sheet1 | 38 | TempSure FlexSure | `treatment-radio-frequency` — Radio Frequency | TempSure FlexSure (body) | Large | $800 | Workbook | approved | Yes | Technology: TempSure; Workbook note: "2–4 weeks between treatments" |
| PR-035 | Sheet1 | 39 | Laser Rejuvenation | `treatment-laser-skin-treatments` — Laser Skin Treatments | Laser rejuvenation | Full Face | $325 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ Skin Rejuvenation" |
| PR-036 | Sheet1 | 40 | Laser Rejuvenation | `treatment-laser-skin-treatments` — Laser Skin Treatments | Laser rejuvenation | Partial Face | $250 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ Skin Rejuvenation" |
| PR-037 | Sheet1 | 41 | Laser Rejuvenation | `treatment-laser-skin-treatments` — Laser Skin Treatments | Laser rejuvenation | Face, Neck & Chest | $500 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ Skin Rejuvenation" |
| PR-038 | Sheet1 | 42 | Laser Rejuvenation | `treatment-laser-skin-treatments` — Laser Skin Treatments | Laser rejuvenation | Neck | $250 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ Skin Rejuvenation" |
| PR-039 | Sheet1 | 43 | Laser Rejuvenation | `treatment-laser-skin-treatments` — Laser Skin Treatments | Laser rejuvenation | Chest | $325 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ Skin Rejuvenation" |
| PR-040 | Sheet1 | 44 | Laser Rejuvenation | `treatment-laser-skin-treatments` — Laser Skin Treatments | Laser rejuvenation | Hands (Both) | $325 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ Skin Rejuvenation" |
| PR-041 | Sheet1 | 45 | Vein Treatment | `treatment-laser-skin-treatments` — Laser Skin Treatments | Vascular / vein treatment | 4 x 4 cm Sq Area | $300 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Leg veins/ Spider Veins" |
| PR-042 | Sheet1 | 46 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Full Abdomen | $150 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-043 | Sheet1 | 47 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Areola | $75 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-044 | Sheet1 | 48 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Full Arms | $265 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-045 | Sheet1 | 49 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Arm (Upper/Lower) | $165 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-046 | Sheet1 | 50 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Back | $345 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-047 | Sheet1 | 51 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Back and Shoulders | $395 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-048 | Sheet1 | 52 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Back (Lower) | $155 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-049 | Sheet1 | 53 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Beard & Front Neck | $165 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-050 | Sheet1 | 54 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Bikini, Brazilian | $175 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-051 | Sheet1 | 55 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Bikini, Playboy | $155 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-052 | Sheet1 | 56 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Bikini, Standard (Female) | $95 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-053 | Sheet1 | 57 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Bikini, Standard (Male) | $175 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-054 | Sheet1 | 58 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Brows (Between) | $55 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-055 | Sheet1 | 59 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Cheeks | $75 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-056 | Sheet1 | 60 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Chest | $225 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-057 | Sheet1 | 61 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Chin | $55 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-058 | Sheet1 | 62 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Derriere | $195 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-059 | Sheet1 | 63 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Ears | $65 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-060 | Sheet1 | 64 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Face Lower (Woman) | $165 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-061 | Sheet1 | 65 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Feet and Toes | $95 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-062 | Sheet1 | 66 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Hands & Fingers | $95 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-063 | Sheet1 | 67 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Happy Trail | $95 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-064 | Sheet1 | 68 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Legs (Full) | $375 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-065 | Sheet1 | 69 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Legs (Upper or Lower) | $235 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-066 | Sheet1 | 70 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Lip (Upper) | $55 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-067 | Sheet1 | 71 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Neck (Back) | $85 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-068 | Sheet1 | 72 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Neck (Front) | $85 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-069 | Sheet1 | 73 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Perineum ("taint") | $95 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-070 | Sheet1 | 74 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Shoulders | $155 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-071 | Sheet1 | 75 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Sideburns | $75 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-072 | Sheet1 | 76 | Laser Hair Removal | `treatment-laser-hair-removal` — Laser Hair Removal | — | Underarms | $95 | Workbook | approved | Yes | Technology: Elite iQ; Workbook note: "Elite IQ" |
| PR-073 | Sheet1 | 77 | PRP Microneedling | `treatment-prp-skin-rejuvenation` — PRP Skin Rejuvenation | Delivered by microneedling | Full Face | $850 | Workbook | approved | Yes | Direct mapping from the workbook TREATMENTS column |
| PR-074 | Sheet1 | 78 | PRP Microneedling | `treatment-prp-skin-rejuvenation` — PRP Skin Rejuvenation | Delivered by microneedling | Neck | $850 | Client email override (2026-08-23) | approved | Yes | Direct mapping from the workbook TREATMENTS column |
| PR-075 | Sheet1 | 79 | Ultra + PRP | `treatment-ultra` — Ultra Treatment | With PRP — face | Face | $750 | Workbook | approved | Yes | Technology: Ultra |
| PR-076 | Sheet1 | 80 | Ultra + PRP | `treatment-ultra` — Ultra Treatment | With PRP — hair restoration | Hair Restoration | $750 | Workbook | approved | Yes | Technology: Ultra |
| PR-077 | Sheet1 | 81 | PRP Injections | `treatment-prp-skin-rejuvenation` — PRP Skin Rejuvenation | Delivered by injection | Dark Circles / Under Eye | $450 | Workbook | approved | Yes | Direct mapping from the workbook TREATMENTS column |
| PR-078 | Sheet1 | 82 | PRP Injections | `treatment-prp-hair-restoration` — PRP Hair Restoration | Delivered by injection | Hair Restoration | $750 | Workbook | approved | Yes | Direct mapping from the workbook TREATMENTS column |
| PR-079 | Sheet1 | 83 | Ampoule / Addition | **Aesthetic Treatment Add-On** — `addon-tranexamic-acid-ampoule` | Per-unit add-on | Tranexamic Acid Ampoule | $120 | Workbook | approved (commercial) · **pending-clinician-review** (clinical) | **No** — `publicDisplay: false` | `priceType: "per-unit"`, unit = ampoule. Many-to-many eligibility: `rf-microneedling-fusion-infusion`, `ultra-treatment`. Stored once, **not** duplicated under each eligible treatment. Price is commercially approved; publication waits on the clinician review of the topical-infusion list (GAP-014) |
| PR-080 | Sheet1 | 84 | Ampoule / Addition | **Aesthetic Treatment Add-On** — `addon-vitamin-c-ampoule` | Per-unit add-on | Vitamin C Ampoule | $60 | Workbook | approved (commercial) · **pending-clinician-review** (clinical) | **No** — `publicDisplay: false` | As PR-079: per-unit ampoule pricing, many-to-many eligibility, stored once. Commercially approved; clinical publication blocked pending clinician review |
| PR-081 | Sheet1 | 85 | Ampoule / Addition | **Aesthetic Treatment Add-On** — `addon-vitamin-a-ampoule` | Per-unit add-on | Vitamin A Ampoule | $60 | Workbook | approved (commercial) · **pending-clinician-review** (clinical) | **No** — `publicDisplay: false` | As PR-079. `sourceNote`: "Price appears as a handwritten addition in the client-approved workbook." The client-approved workbook establishes **commercial** price approval including this handwritten entry; clinical publication still blocked |
## Category totals

| Workbook category | Rows | Price range CAD | Category total CAD | Canonical treatment | Technology |
|---|---:|---|---:|---|---|
| RF Microneedling – Regular Tip | 1 | $350 – $350 | $350 | `treatment-rf-microneedling` | Potenza |
| RF Microneedling – Regular | 7 | $350 – $1,250 | $4,850 | `treatment-rf-microneedling` | Potenza |
| RF Microneedling – Body | 4 | $650 – $1,400 | $3,600 | `treatment-rf-microneedling` | Potenza |
| RF Microneedling – Fusion/Infusion | 4 | $850 – $1,550 | $4,750 | `treatment-rf-microneedling` | Potenza |
| Ultra | 7 | $350 – $900 | $4,000 | `treatment-ultra` | Ultra |
| Ultra + Potenza | 1 | $1,300 – $1,300 | $1,300 | `combined-treatment-protocol` — Ultra Skin Solutions | Ultra + Potenza |
| TempSure Envi | 7 | $300 – $800 | $3,100 | `treatment-radio-frequency` | TempSure |
| TempSure Vitalia | 2 | $500 – $1,000 | $1,500 | `treatment-tempsure-vitalia` | TempSure Vitalia |
| TempSure FlexSure | 1 | $800 – $800 | $800 | `treatment-radio-frequency` | TempSure |
| Laser Rejuvenation | 6 | $250 – $500 | $1,975 | `treatment-laser-skin-treatments` | Elite iQ |
| Vein Treatment | 1 | $300 – $300 | $300 | `treatment-laser-skin-treatments` | Elite iQ |
| Laser Hair Removal | 31 | $55 – $395 | $4,690 | `treatment-laser-hair-removal` | Elite iQ |
| PRP Microneedling | 2 | $850 – $850 | $1,700 | `treatment-prp-skin-rejuvenation` | — |
| Ultra + PRP | 2 | $750 – $750 | $1,500 | `treatment-ultra` | Ultra |
| PRP Injections | 2 | $450 – $750 | $1,200 | `treatment-prp-hair-restoration`, `treatment-prp-skin-rejuvenation` | — |
| Ampoule / Addition | 3 | $60 – $120 | $240 | Aesthetic Treatment Add-On (3 records) | — |
| **Total** | **81** | | **$35,855** | | |

Category total for PRP Microneedling includes the $850 email override for row 78.

## Treatment totals

| Canonical treatment entity | Priced rows | Technology relationship |
|---|---:|---|
| `treatment-laser-hair-removal` — Laser Hair Removal | 31 | Elite iQ |
| `treatment-rf-microneedling` — RF Micro-Needling | 16 | Potenza |
| `treatment-ultra` — Ultra Treatment | 9 | Ultra |
| `treatment-radio-frequency` — Radio Frequency | 8 | TempSure |
| `treatment-laser-skin-treatments` — Laser Skin Treatments | 7 | Elite iQ |
| `treatment-prp-skin-rejuvenation` — PRP Skin Rejuvenation | 3 | — (autologous, no device) |
| `treatment-tempsure-vitalia` — TempSure Vitalia | 2 | TempSure Vitalia |
| `treatment-prp-hair-restoration` — PRP Hair Restoration | 1 | — (autologous, no device) |
| `combined-treatment-protocol` — Ultra Skin Solutions | 1 | Ultra + Potenza |
| Aesthetic Treatment Add-On (ampoules) | 3 | — (per-unit consumables; eligible across RF Micro-Needling fusion/infusion and Ultra) |
| **Total** | **81** | |
Control: $35,005 (workbook sum) + $850 (email override, row 78) = **$35,855**.

## Counters

```text
TOTAL WORKBOOK ROWS (with content):        83
  header row (3):                          1
  header artifact row (4, column F only):  1
  populated data rows (5–85):              81
TOTAL PRICE ROWS:                          81
  priced in the workbook:                  80
  priced by client email override:         1
TOTAL MAPPED ROWS:                         81
  mapped to a single treatment entity:     77
  combined treatment protocols:            1   (row 28)
  treatment add-ons:                       3   (rows 83–85)
TOTAL EXCLUDED PACKAGE ROWS:               0   (the workbook contains no package-price rows)
TOTAL PACKAGE PRICE ROWS CREATED:          0
TOTAL EMAIL OVERRIDES:                     1   (row 78 — PRP Microneedling, Neck, $850)
TOTAL DUPLICATE ROWS:                      0
TOTAL UNMAPPED ROWS:                       0
TOTAL CONFLICTING ROWS:                    0   (no numeric price conflict anywhere)
TOTAL ROWS SILENTLY DROPPED:               0
PUBLIC ADD-ON ROWS PENDING CLINICAL REVIEW: 0  (all 3 add-ons have publicDisplay: false)
NEW PUBLIC CANONICAL ROUTES FROM THESE 4 ROWS: 0
```

## Resolved 2026-08-24 — the four previously held rows

All four rows are now classified by authoritative client decision. **None was
guessed at, and no source value was altered.** Prices, names, and notes remain
exactly as they appear in the workbook.

### Row 28 — combined treatment protocol

| Field | Value |
|---|---|
| Cell reference | `C28:F28` |
| Verbatim content | `Ultra + Potenza` / `Ultra Skin Solutions` / `1300` / `Ultra Laser + Specialized topical can be added` |
| Price family | `combined-treatment-protocol` |
| Canonical name | **Ultra Skin Solutions** (exact source name; not renamed) |
| Components | `treatment-ultra`, `treatment-rf-microneedling` (decision ids: `ultra-treatment`, `rf-microneedling`) |
| Technologies | `technology-ultra`, `technology-potenza` (decision ids: `ultra`, `potenza`) |
| `treatmentArea` | `null` — the AREA cell holds the protocol name, so **no body area was invented** |
| Amount | 1300 CAD, `priceType: "fixed"`, `packagePrice: false` |
| Public display | **Yes** — under a `Combination Treatments` section on the Aesthetic Pricing page |
| Canonical route | **None created.** It renders as a price row on `/aesthetics/pricing`; no new indexable treatment page exists for it |

Published description is limited to: it combines Ultra and Potenza. **No
benefits, duration, areas, results, or treatment course are stated** — the
workbook supplies none.

The workbook note reads "Specialized topical **can be added**", so the specialized
topical is **not** included in the $1,300. Any ampoule added is priced separately
under the add-on family below.

### Rows 83–85 — Aesthetic Treatment Add-On price family

A new pricing entity family, introduced because an add-on legitimately relates to
more than one treatment and cannot carry a single mandatory `treatmentId`.

```ts
type ApprovedTreatmentAddOnPrice = {
  id: string;
  addOnName: { en: string; ar: string };
  amount: number;
  currency: "CAD";
  priceType: "per-unit";
  unit: { en: "ampoule"; ar: "أمبولة" };
  eligibleTreatmentIds: string[];      // many-to-many
  source: "approved-pricing-workbook";
  approvalStatus: "approved";
  clinicalPublicationStatus: "approved" | "pending-clinician-review";
  publicDisplay: boolean;
  sourceNote?: string;
};
```

Eligible treatments (shared by all three add-ons):

- `rf-microneedling-fusion-infusion` — the fusion/infusion variant of
  `treatment-rf-microneedling` (workbook rows 17–20, "Specialized topicals (AMPOULE)")
- `ultra-treatment` — `treatment-ultra`, where a specialized topical addition
  applies (workbook rows 21–28, "Specialized topical can be added")

Each add-on is stored **once**. It is **not** duplicated under every eligible
treatment.

| Price ID | Workbook row | Add-on (EN) | Add-on (AR) | Amount | Unit | Commercial approval | Clinical publication | `publicDisplay` | Source note |
|---|---|---|---|---:|---|---|---|---|---|
| PR-079 | 83 | Tranexamic Acid Ampoule | أمبولة حمض الترانيكساميك | 120 CAD | ampoule / أمبولة | approved | `pending-clinician-review` | `false` | — |
| PR-080 | 84 | Vitamin C Ampoule | أمبولة فيتامين C | 60 CAD | ampoule / أمبولة | approved | `pending-clinician-review` | `false` | — |
| PR-081 | 85 | Vitamin A Ampoule | أمبولة فيتامين A | 60 CAD | ampoule / أمبولة | approved | `pending-clinician-review` | `false` | Price appears as a handwritten addition in the client-approved workbook. |

**Commercial price approval and clinical approval are separate gates.** The
client-approved workbook establishes commercial price approval for all three
rows, **including the handwritten Vitamin A entry**. It does not establish
clinical approval. The existing clinician-review blocker on the topical-infusion
list (GAP-014, workbook-independent, originating in the Word source at line 865)
stands unchanged.

Until clinician approval is recorded, **no clinical indication, benefit,
suitability statement, or usage claim may be published for any ampoule**, and all
three carry `publicDisplay: false`. The prices are stored and classified, not
shown.

### Identifier namespaces

The client decision uses short ids (`ultra-treatment`, `rf-microneedling`,
`rf-microneedling-fusion-infusion`, `ultra`, `potenza`). The approved route
registry uses prefixed ids. Both are recorded so the implementation phase maps
them without guessing:

| Decision id | Canonical registry entity |
|---|---|
| `ultra-treatment` | `treatment-ultra` |
| `rf-microneedling` | `treatment-rf-microneedling` |
| `rf-microneedling-fusion-infusion` | `treatment-rf-microneedling`, fusion/infusion variant (not a separate route) |
| `ultra` | `technology-ultra` |
| `potenza` | `technology-potenza` |

## Approved general pricing note (not a price)

Stored once as a **general pricing note** attached to the pricing page and to
every treatment entity that carries a price. It is not a product record, not a
treatment record, and carries no amount.

| Note ID | Scope | Source | English | Arabic |
|---|---|---|---|---|
| `PRICING-NOTE-001` | Global — aesthetics pricing | Client approval email, 2026-08-23 | Customized treatment packages are available based on individual client needs. Please contact our team for a personalized treatment plan and package pricing. | تتوفر باقات علاجية مخصّصة بحسب احتياجات كل عميل. يُرجى التواصل مع فريقنا للحصول على خطة علاجية مخصّصة وأسعار الباقات. |

This note is the **only** place package pricing is addressed. No package amount
is published anywhere, and no individual area price was converted into a package
price.

## Taxonomy mapping applied

| Workbook category | Canonical entity | Entity family | Technology relation | Notes |
|---|---|---|---|---|
| RF Microneedling – Regular Tip / – Regular | `treatment-rf-microneedling` | Aesthetic treatment | Potenza | Rows 5 and 6–12 are the same variant under two label spellings ("Regular Tip" / "Regular"). Recorded as one variant with a label variant, **not** merged rows — all 8 area rows preserved |
| RF Microneedling – Body | `treatment-rf-microneedling` | Aesthetic treatment | Potenza | Regular tip applied to body areas; kept distinct from face rows |
| RF Microneedling – Fusion/Infusion | `treatment-rf-microneedling` | Aesthetic treatment | Potenza | Infusion tip + ampoules. Kept strictly separate from regular-tip rows per the mandatory split |
| Ultra | `treatment-ultra` | Aesthetic treatment | Ultra | Includes intensity variants "Moderate" (row 22) and "Ultra-Light Glow" (row 23), preserved as variants, not separate treatments |
| Ultra + PRP | `treatment-ultra` (primary) + `treatment-prp-skin-rejuvenation` / `treatment-prp-hair-restoration` (related) | Aesthetic treatment | Ultra | **Ultra is not reclassified as PRP** because a combined treatment exists. Row 79 relates to skin rejuvenation, row 80 to hair restoration |
| TempSure Envi | `treatment-radio-frequency` | Aesthetic treatment | TempSure | Face/neck RF applicator |
| TempSure FlexSure | `treatment-radio-frequency` | Aesthetic treatment | TempSure | Body RF applicator. **This resolves the unidentified "Flexure body firming" reference** in the Word extraction (line 839) — it is the TempSure FlexSure applicator, and it now carries an approved price |
| TempSure Vitalia | `treatment-tempsure-vitalia` | Women's wellness service | TempSure Vitalia | Kept separate from TempSure Envi/FlexSure |
| Laser Rejuvenation | `treatment-laser-skin-treatments` | Aesthetic treatment | Elite iQ | |
| Vein Treatment | `treatment-laser-skin-treatments` | Aesthetic treatment | Elite iQ | Related to `concern-spider-veins`. Workbook note "Leg veins/ Spider Veins" — the **concern stays a concern**; only the laser treatment is priced |
| Laser Hair Removal | `treatment-laser-hair-removal` | Aesthetic treatment | Elite iQ | 31 discrete areas, all preserved individually |
| PRP Microneedling | `treatment-prp-skin-rejuvenation`, variant "delivered by microneedling" | Aesthetic treatment | — | **Not merged with PRP Injections** — separate variant, separate price records |
| PRP Injections | `treatment-prp-skin-rejuvenation` (dark circles) / `treatment-prp-hair-restoration` (hair), variant "delivered by injection" | Aesthetic treatment | — | **Not merged with PRP Microneedling** |
| Ultra + Potenza | `combined-treatment-protocol` — **Ultra Skin Solutions** (components `treatment-ultra` + `treatment-rf-microneedling`) | Combined treatment protocol | Ultra + Potenza | Not a package (`packagePrice: false`), not a body area, no new canonical route. Published under "Combination Treatments" |
| Ampoule / Addition | `addon-tranexamic-acid-ampoule`, `addon-vitamin-c-ampoule`, `addon-vitamin-a-ampoule` | **Aesthetic Treatment Add-On** | — | `priceType: "per-unit"` (ampoule). Many-to-many eligibility across RF Microneedling Fusion/Infusion and Ultra; stored once each. `publicDisplay: false` pending clinician review |

**Concerns remain concerns.** Rosacea, pigmentation, spider veins, and sun damage
are not priced as treatments anywhere. They keep their concern entities and
relate to the applicable laser treatment, which is where the price lives.

## Structured price model

Every mapped row produces one `ApprovedTreatmentPrice` record:

```ts
type ApprovedTreatmentPrice = {
  id: string;                    // "PR-001" … "PR-081"
  category: string;              // verbatim workbook TREATMENTS value
  treatmentId: string;           // canonical entity id
  treatmentName: { en: string; ar: string };
  treatmentArea?: { en: string; ar: string };
  variant?: { en: string; ar: string };
  amount: number;                // exact workbook integer
  currency: "CAD";
  priceType: "fixed";
  packagePrice: false;
  source: "approved-pricing-workbook" | "client-email-override";
  sourceDate: "2026-08-23";
  approvalStatus: "approved";
  displayOrder: number;          // workbook row order
  notes?: { en?: string; ar?: string };
};
```

`priceType` is `"fixed"` for all 78 treatment-price records (77 single-treatment
rows plus the combined protocol at row 28): the workbook carries no "starting
from", "up to", or tiered pricing type for any treatment row. The three ampoule
rows carry explicit per-unit wording ("$120 per ampoule", "$60 per ampoule") and
are modelled as `ApprovedTreatmentAddOnPrice` with `priceType: "per-unit"` —
documented faithfully rather than forced into `fixed`.

`packagePrice` is `false` on every record, and **no package-price record was
created**; the workbook contains no package rows.

Row 28 additionally carries `priceFamily: "combined-treatment-protocol"`,
`components[]`, `technologies[]`, and `treatmentArea: null`.

**No code was written this pass.** The type above documents the target shape for
the implementation phase.

## Bilingual naming appendix

Device trademarks (**Potenza, TempSure, TempSure Envi, TempSure FlexSure,
TempSure Vitalia, Elite iQ, Ultra**) are **not translated**; they appear in Latin
script inside Arabic copy, matching the existing technology entities.

### Treatment names

| Workbook category | English (canonical) | Arabic |
|---|---|---|
| RF Microneedling – Regular Tip / – Regular | RF Micro-Needling — regular tip | الإبر الدقيقة بالترددات الراديوية — الرأس العادي |
| RF Microneedling – Body | RF Micro-Needling — body, regular tip | الإبر الدقيقة بالترددات الراديوية — الجسم، الرأس العادي |
| RF Microneedling – Fusion/Infusion | RF Micro-Needling — fusion / infusion tip with ampoule | الإبر الدقيقة بالترددات الراديوية — رأس الدمج/التسريب مع الأمبولة |
| Ultra | Ultra Treatment | علاج Ultra |
| Ultra + PRP | Ultra Treatment with PRP | علاج Ultra مع البلازما الغنية بالصفائح الدموية |
| TempSure Envi | Radio Frequency — TempSure Envi | الترددات الراديوية — TempSure Envi |
| TempSure FlexSure | Radio Frequency — TempSure FlexSure (body) | الترددات الراديوية — TempSure FlexSure (الجسم) |
| TempSure Vitalia | TempSure Vitalia | TempSure Vitalia |
| Laser Rejuvenation | Laser Skin Rejuvenation | تجديد البشرة بالليزر |
| Vein Treatment | Vascular / Vein Treatment | علاج الأوردة والشعيرات الدموية |
| Laser Hair Removal | Laser Hair Removal | إزالة الشعر بالليزر |
| PRP Microneedling | PRP Skin Rejuvenation — delivered by microneedling | تجديد البشرة بالبلازما — عبر الإبر الدقيقة |
| PRP Injections | PRP — delivered by injection | البلازما الغنية بالصفائح الدموية — عبر الحقن |
| Ampoule / Addition | Ampoule add-on | أمبولة إضافية |

### Treatment areas (all 62 distinct values)

| English | Arabic | | English | Arabic |
|---|---|---|---|---|
| 4 x 4 cm Sq Area | منطقة ٤ × ٤ سم | | Full Face | الوجه كامل |
| Abdomen (Full) | البطن (كامل) | | Full Face & Neck | الوجه كامل والرقبة |
| Abdomen (Upper and Lower) | البطن (العلوي والسفلي) | | Full Face + Neck | الوجه كامل + الرقبة |
| Area | منطقة واحدة | | Full Face with Fusion Upgrade | الوجه كامل مع ترقية الدمج |
| Areola | الهالة | | Hair Restoration | استعادة الشعر |
| Arm (Upper/Lower) | الذراع (العلوي/السفلي) | | Hands & Fingers | اليدان والأصابع |
| Arms (Back) | الذراعان (الجهة الخلفية) | | Hands (Both) | اليدان (كلتاهما) |
| Back | الظهر | | Happy Trail | خط البطن السفلي |
| Back (Lower) | أسفل الظهر | | Large | منطقة كبيرة |
| Back and Shoulders | الظهر والكتفان | | Legs (Full) | الساقان (كاملتان) |
| Beard & Front Neck | اللحية ومقدمة الرقبة | | Legs (Upper or Lower) | الساقان (العلويتان أو السفليتان) |
| Bikini, Brazilian | البيكيني البرازيلي | | Lip (Upper) | الشفة العليا |
| Bikini, Playboy | بيكيني بلاي بوي | | Moderate – Full Face | متوسط — الوجه كامل |
| Bikini, Standard (Female) | البيكيني العادي (للنساء) | | Neck | الرقبة |
| Bikini, Standard (Male) | البيكيني العادي (للرجال) | | Neck (Back) | الرقبة (الخلفية) |
| Brows (Between) | ما بين الحاجبين | | Neck (Front) | الرقبة (الأمامية) |
| Cheeks | الخدان | | Partial Face | جزء من الوجه |
| Chest | الصدر | | Perineum ("taint") | العجان |
| Chin | الذقن | | Perioral (smile lines) | حول الفم (خطوط الابتسامة) |
| Dark Circles / Under Eye | الهالات السوداء / تحت العين | | Periorbital (eyes) | حول العينين |
| Decolletage | أعلى الصدر (الديكولتيه) | | Shoulders | الكتفان |
| Derriere | الأرداف | | Sideburns | السوالف |
| Ears | الأذنان | | Small Area | منطقة صغيرة |
| Face | الوجه | | Small Area (Eyes, Cheeks, Forehead, etc.) | منطقة صغيرة (العينان، الخدان، الجبهة، إلخ) |
| Face Lower (Woman) | أسفل الوجه (للنساء) | | Tranexamic Acid | حمض الترانيكساميك |
| Face and Neck | الوجه والرقبة | | Ultra-Light Glow Full Face | إشراقة Ultra الخفيفة — الوجه كامل |
| Face, Neck & Chest | الوجه والرقبة والصدر | | Underarms | تحت الإبطين |
| Feet and Toes | القدمان وأصابع القدم | | Vitamin A | فيتامين A |
| Forehead | الجبهة | | Vitamin C | فيتامين C |
| Full | كامل | | Full Abdomen | البطن كاملاً |
| Full Arms | الذراعان كاملتان | | Ultra Skin Solutions | Ultra Skin Solutions *(protocol name — kept as the exact source name, not translated)* |

## Verification gate

```text
WORKBOOK FOUND: YES
WORKBOOK READ COMPLETELY: YES
ALL SHEETS READ: YES                      (1 of 1 — Sheet1)
ALL POPULATED ROWS ACCOUNTED FOR: YES     (81 of 81)
PRICE ROWS: 81
MAPPED PRICE ROWS: 81
UNMAPPED PRICE ROWS: 0
PRP NECK PRICE: 850 CAD                   (row 78, client-email-override)
CLIENT PACKAGE NOTE RECORDED: YES         (PRICING-NOTE-001, no amount)
PACKAGE PRICES PUBLIC: NO
PACKAGE PRICE ROWS: 0
COMBINED TREATMENT PROTOCOLS: 1           (row 28 — Ultra Skin Solutions)
TREATMENT ADD-ON ROWS: 3                  (rows 83–85)
EMAIL OVERRIDES: 1
DUPLICATE PRICE ROWS: 0
NUMERIC CONFLICTS: 0
WRONG TREATMENT FAMILY: 0
SILENTLY DROPPED PRICE ROWS: 0
PUBLIC ADD-ON ROWS PENDING CLINICAL REVIEW: 0
NEW PUBLIC CANONICAL ROUTES CREATED: 0
CLINICAL REVIEW BLOCKER PRESERVED: YES     (GAP-014 — topical infusion list)
GAP-003 STATUS: RESOLVED
GAP-017 STATUS: RESOLVED                   (combined-protocol classification)
GAP-018 STATUS: RESOLVED                   (add-on family + many-to-many eligibility)
GAP-019 STATUS: COMMERCIAL PRICE RESOLVED  (entity-structure question remains, non-blocking)
APPLICATION SOURCE CHANGED: NO
PRODUCTION CHANGED: NO
SITE_LAUNCHED: false
```

All four previously held rows are classified. No source value was altered, no
row was dropped, no package price was created, and no new canonical route was
added. The three ampoule prices are stored and classified but remain
`publicDisplay: false` until the clinician review recorded as GAP-014 is
resolved.

**Pricing gate: PASS.**
