# Blue Diamond — Legacy Content Redirect Map

Every legacy URL from both domains resolves to a **single direct 301** to a real
canonical route. No chains, no wildcard catch-alls to the homepage, no redirect
into a gated (404) route.

- Canonical domain: `https://bluediamondmedical.ca/`
- All targets are locale-prefixed. `/en/…` is the default target; the Arabic
  equivalent is reachable via hreflang from the landing page.
- `bluediamondmedicalaesthetics.ca` becomes a **redirect-only host**. It must not
  continue to serve a second canonical website.
- Status column: `Live` = already present in `src/lib/routing/legacy-redirects.ts`;
  `PROPOSED` = identified in this classification pass, not yet implemented (no
  code was changed this phase).

## Site A — bluediamondmedical.ca (same-host redirects, handled by the app proxy)

| Legacy domain | Legacy path | Final canonical route | Status code | Reason | Test required |
|---|---|---|---|---|---|
| bluediamondmedical.ca | `/` | `/en/` | — | Already the canonical homepage; locale prefix applied | Yes — root must land on `/en/` with no chain |
| bluediamondmedical.ca | `/appointment-1` | `/en/book-appointment` | 301 (Live) | Booking hub carries the confirmation notice, no-show fees, and every booking channel | Yes |
| bluediamondmedical.ca | `/services` | `/en/medical` | 301 (Live) | Legacy page mixed AHS services with uninsured fees; the hub is the honest landing point and links to the fee page | Yes |
| bluediamondmedical.ca | `/our-team` | `/en/our-team` | 301 (Live) | Single canonical doctor index | Yes |
| bluediamondmedical.ca | `/medical-aesthetics-1` | `/en/aesthetics` | 301 (Live) | Aesthetics hub; the `-1` suffix never becomes canonical | Yes |
| bluediamondmedical.ca | `/botox-1` | `/en/botox` | 301 (Live) | Educational Botox hub routing to medical and cosmetic pathways | Yes |
| bluediamondmedical.ca | `/eye-examining` | `/en/medical/eye-screening` | 301 (Live) | Direct content match | Yes |
| bluediamondmedical.ca | `/primary-care-network` | `/en/medical/after-hours-care` | 301 (Live) | PCN content is the after-hours/enhanced-care service, not a generic patient-resources page | Yes |
| bluediamondmedical.ca | `/clinic-policies` | `/en/patient-resources` | 301 (Live) | Policy content publishes inline on this hub; no separate policies route exists | Yes |
| bluediamondmedical.ca | `/join-our-team` | `/en/careers` | 301 (Live) | Direct content match | Yes |
| bluediamondmedical.ca | `/contact-us` | `/en/contact` | 301 (Live) | Direct content match | Yes |
| bluediamondmedical.ca | `/products` | `/en/shop` | 301 (Live) | Orphan legacy catalogue → live canonical catalogue (200, `shopEnabled: true`) | Yes |
| bluediamondmedical.ca | `/tempsure` | `/en/aesthetics/technologies/tempsure` | 301 (Live) | Found by live sitemap crawl; absent from the Word inventory | Yes |
| bluediamondmedical.ca | `/microneedling` | `/en/aesthetics/treatments/rf-microneedling` | 301 (Live) | Found by live sitemap crawl | Yes |
| bluediamondmedical.ca | `/about-skinmedica-products/f/lumivivetm-system` | `/en/shop/lumivive-system-day-night` | 301 (Live) | Legacy per-product landing page | Yes |
| bluediamondmedical.ca | `/about-skinmedica-products/f/lytera®-20-pigmentbrightening-serum` | `/en/shop/lytera-2-pigment-brightening-serum` | 301 (Live) | Legacy per-product landing page | Yes |
| bluediamondmedical.ca | `/about-skinmedica-products/f/tns®-eye-repair` | `/en/shop/tns-eye-repair` | 301 (Live) | Legacy per-product landing page | Yes |
| bluediamondmedical.ca | `/about-skinmedica-products/f/total-defense-repair-spf-34---tinted` | `/en/shop/total-defence-repair-spf-34-clear` | 301 (Live) | Legacy slug says "tinted" but its `<title>` reads "Clear" — verified against the `-1` variant before mapping | Yes — both variants must be asserted together |
| bluediamondmedical.ca | `/about-skinmedica-products/f/total-defense-repair-spf-34---tinted-1` | `/en/shop/total-defence-repair-spf-34-tinted` | 301 (Live) | Confirmed by page `<title>` | Yes |
| bluediamondmedical.ca | `/about-skinmedica-products/f/dermal-repair-cream` | `/en/shop/dermal-repair-cream` | 301 (Live) | Legacy per-product landing page | Yes |
| bluediamondmedical.ca | `/about-skinmedica-products/f/ahabha-exfoliating-cleanser` | `/en/shop/aha-bha-exfoliating-cleanser` | 301 (Live) | Legacy per-product landing page | Yes |
| bluediamondmedical.ca | `/about-skinmedica-products/f/*` (any other) | `/en/shop` | 301 (Live, safety net) | Prefix fallback so an undiscovered product slug lands on the catalogue instead of 404ing. Bounded to this prefix — **not** a universal homepage redirect | Yes — assert the fallback fires only under this prefix |
| bluediamondmedical.ca | `/ols/products` | `/en/shop` | 301 (Live) | GoDaddy auto-generated store module page; platform boilerplate, no unique content | Yes |
| bluediamondmedical.ca | `/laser-treatment` | `/en/aesthetics/treatments/laser-skin-treatments` | 301 **PROPOSED** | Linked from the legacy Medical Aesthetics page (L276) but never existed as a page. Defensive entry so any inbound link or crawl of that broken URL lands correctly | Yes |

## Site B — bluediamondmedicalaesthetics.ca (cross-host; configured at DNS/hosting)

These cannot be caught by this app's proxy because they arrive on a different
host. They must be configured at the hosting/DNS layer for the aesthetics domain,
driven by the same table so the two never drift.

| Legacy domain | Legacy path | Final canonical route | Status code | Reason | Test required |
|---|---|---|---|---|---|
| bluediamondmedicalaesthetics.ca | `/` | `https://bluediamondmedical.ca/en/aesthetics` | 301 **PROPOSED** | Domain root currently has no mapping. Without it the whole aesthetics site keeps resolving as a second canonical website | Yes — highest priority test |
| bluediamondmedicalaesthetics.ca | `/treatments` | `/en/aesthetics/treatments` | 301 (Live) | Treatments hub | Yes |
| bluediamondmedicalaesthetics.ca | `/area-concern` | `/en/aesthetics/concerns` | 301 (Live) | Legacy page was a JS hover module with no body content; the Concerns hub is the real equivalent | Yes |
| bluediamondmedicalaesthetics.ca | `/laser-hair-removal` | `/en/aesthetics/treatments/laser-hair-removal` | 301 (Live) | Direct match | Yes |
| bluediamondmedicalaesthetics.ca | `/laser-treatment-1` | `/en/aesthetics/treatments/laser-skin-treatments` | 301 (Live) | `-1` suffix retired | Yes |
| bluediamondmedicalaesthetics.ca | `/radio-frequency` | `/en/aesthetics/treatments/radio-frequency` | 301 (Live) | Direct match | Yes |
| bluediamondmedicalaesthetics.ca | `/rf-micro-needeling` | `/en/aesthetics/treatments/rf-microneedling` | 301 (Live) | Misspelled legacy slug retired; correct spelling is canonical | Yes |
| bluediamondmedicalaesthetics.ca | `/rf-micro-needling` | `/en/aesthetics/treatments/rf-microneedling` | 301 **PROPOSED** | Correctly-spelled variant linked from the Skin Revitalization page (L1167) but never a real page — covers inbound links to it | Yes |
| bluediamondmedicalaesthetics.ca | `/ultra-treatment` | `/en/aesthetics/treatments/ultra` | 301 (Live) | Ultra is its own treatment, **not** PRP — legacy index mislink corrected here | Yes — assert it does **not** land on any PRP route |
| bluediamondmedicalaesthetics.ca | `/prp-therapy` | `/en/aesthetics/treatments/prp-skin-rejuvenation` | 301 (Live) | One legacy page split into two canonical treatments; skin rejuvenation is the broader landing point and cross-links to hair restoration | Yes — assert the hair-restoration page is reachable in one click from the target |
| bluediamondmedicalaesthetics.ca | `/vitalia` | `/en/aesthetics/treatments/tempsure-vitalia` | 301 (Live) | Real pelvic-floor/RF content found by live crawl; matches the approved Vitalia treatment | Yes |
| bluediamondmedicalaesthetics.ca | `/our-technologies` | `/en/aesthetics/technologies` | 301 (Live) | Technologies hub | Yes |
| bluediamondmedicalaesthetics.ca | `/our-team` | `/en/our-team` | 301 **PROPOSED** | Cross-host equivalent of the Site A rule; the two duplicate biographies now live on the canonical doctor index | Yes |
| bluediamondmedicalaesthetics.ca | `/acne-scar-removal` | `/en/aesthetics/concerns/acne-scars` | 301 (Live) | Reclassified treatment → concern | Yes |
| bluediamondmedicalaesthetics.ca | `/rosacea-abatement` | `/en/aesthetics/concerns/rosacea-redness` | 301 (Live) | Reclassified treatment → concern | Yes |
| bluediamondmedicalaesthetics.ca | `/dry-skin-remediation` | `/en/aesthetics/concerns/dry-skin` | 301 (Live) | Reclassified treatment → concern | Yes |
| bluediamondmedicalaesthetics.ca | `/fineline-and-wrinkle` | `/en/aesthetics/concerns/fine-lines-wrinkles` | 301 (Live) | Reclassified treatment → concern | Yes |
| bluediamondmedicalaesthetics.ca | `/non-invasive-skin` | `/en/aesthetics/concerns/skin-laxity` | 301 (Live) | Reclassified; the concern is skin laxity, not the modality | Yes |
| bluediamondmedicalaesthetics.ca | `/spider-vein` | `/en/aesthetics/concerns/spider-veins` | 301 (Live) | Reclassified treatment → concern | Yes |
| bluediamondmedicalaesthetics.ca | `/sun-damage` | `/en/aesthetics/concerns/sun-damage-pigmentation` | 301 (Live) | Reclassified treatment → concern | Yes |
| bluediamondmedicalaesthetics.ca | `/skin-revitalization` | `/en/aesthetics/concerns/skin-revitalization` | 301 (Live) | Reclassified treatment → concern | Yes |
| bluediamondmedicalaesthetics.ca | `/razor-bumps` | `/en/aesthetics/concerns/razor-bumps` | 301 (Live) | Reclassified treatment → concern | Yes |
| bluediamondmedicalaesthetics.ca | `/terms-and-conditions` | `/en/terms` | 301 (Live) | Points at the real final canonical route. **Currently resolves through the gated 404 boundary** because no approved legal copy exists — more honest than landing a visitor on an unrelated marketing page. Must be re-tested the moment `legalPagesEnabled` flips | Yes — re-test on flag flip (GAP-001) |
| bluediamondmedicalaesthetics.ca | `/privacy-policy` | `/en/privacy-policy` | 301 (Live) | Same as above | Yes — re-test on flag flip (GAP-002) |

## Legacy page → destination coverage (all 34 source pages)

| Legacy page | Destination type | Canonical target |
|---|---|---|
| A1 Home | Canonical page | `/en/` |
| A2 Appointment | Redirect → hub | `/en/book-appointment` |
| A3 Services | Redirect → hub (content split to hub + fee page) | `/en/medical` |
| A4 Our Team | Redirect → hub | `/en/our-team` |
| A5 Medical Aesthetics | Redirect → hub | `/en/aesthetics` |
| A6 Botox | Redirect → hub | `/en/botox` |
| A7 Eye Examining | Redirect → detail page | `/en/medical/eye-screening` |
| A8 Primary Care Network | Redirect → detail page | `/en/medical/after-hours-care` |
| A9 Clinic Policies | Redirect → hub | `/en/patient-resources` |
| A10 Join our Team | Redirect → detail page | `/en/careers` |
| A11 Contact Us | Redirect → detail page | `/en/contact` |
| A12 Products | Redirect → hub (+ 6 per-product legacy redirects) | `/en/shop` |
| B1 Home | Redirect → hub | `/en/aesthetics` |
| B2 Treatments | Redirect → hub | `/en/aesthetics/treatments` |
| B3 Area Concern | **Redirect-only** (no publishable content) | `/en/aesthetics/concerns` |
| B4 Laser Hair Removal | Redirect → detail page | `/en/aesthetics/treatments/laser-hair-removal` |
| B5 Laser Treatment | Redirect → detail page | `/en/aesthetics/treatments/laser-skin-treatments` |
| B6 Radio Frequency | Redirect → detail page | `/en/aesthetics/treatments/radio-frequency` |
| B7 RF Micro-needling | Redirect → detail page | `/en/aesthetics/treatments/rf-microneedling` |
| B8 Ultra Treatment | Redirect → detail page | `/en/aesthetics/treatments/ultra` |
| B9 PRP Therapy | Redirect → detail page (content split across 2) | `/en/aesthetics/treatments/prp-skin-rejuvenation` |
| B10 Our Technologies | Redirect → hub | `/en/aesthetics/technologies` |
| B11 Our Team | **Redirect-only** (duplicate content merged) | `/en/our-team` |
| B12–B20 (9 concern pages) | Redirect → detail page | `/en/aesthetics/concerns/*` |
| B21 Terms and Conditions | **Redirect-only, gated target** | `/en/terms` |
| B22 Privacy Policy | **Redirect-only, gated target** | `/en/privacy-policy` |

**Coverage: 34/34.** Every legacy page has a canonical destination, a
redirect-only status, or a written exclusion reason.

## Redirect integrity rules verified

| Rule | Result |
|---|---|
| Direct 301s only — no chains | Pass — flat exact-match table, every target is a final canonical route |
| No universal redirect to the homepage | Pass — the single prefix fallback is bounded to `/about-skinmedica-products/f/*` and lands on `/en/shop` |
| No broken legacy link promoted to canonical | Pass — `/laser-treatment`, `/rf-micro-needling`, Ultra→PRP, and Vitalia→self exist **only** as redirect sources |
| No redirect into a non-existent route | Pass |
| Redirects into gated routes | 2 (`/terms`, `/privacy-policy`) — deliberate and documented; both must be re-tested when `legalPagesEnabled` flips |
| Aesthetics domain retained as a second canonical site | **No** — redirect-source only; domain root redirect is PROPOSED and required before launch |

---

# Addendum — approved aesthetic pricing, 2026-08-24

The approved pricing workbook (`BLUE_DIAMOND_AESTHETIC_PRICING_APPROVED_2026-08-23.xlsx`)
and its client approval email were reconciled on 2026-08-24. **This map is
unchanged**, and that is the correct outcome:

- The workbook is a **price source**, not a page source. It defines no URLs,
  names no legacy pages, and adds no canonical route.
- All 77 mapped prices attach to treatment entities that already exist in this
  map's targets — `treatment-rf-microneedling`, `treatment-ultra`,
  `treatment-radio-frequency`, `treatment-tempsure-vitalia`,
  `treatment-laser-hair-removal`, `treatment-laser-skin-treatments`, and the two
  PRP treatments. Every one already has a canonical route and inbound 301s.
- `/aesthetics/pricing` is an existing registry route. It stays gated
  (`aestheticPricingEnabled: false`) until GAP-017 and GAP-018 are answered, so it
  remains excluded from nav, sitemap, and indexing, and no redirect points at it.
- No legacy URL from either domain corresponds to a pricing page, so no new
  redirect source exists.
- The 34/34 legacy-page coverage, the redirect integrity rules, and every 301
  target above are unaffected.

Full pricing reconciliation: `docs/APPROVED_AESTHETIC_PRICING_MATRIX.md`.
