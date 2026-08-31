# Content Model

What content exists, where it lives, how it is approved, and how gaps are
handled. Companion documents: `ARCHITECTURE.md`, `FEELSTACK.md`,
`DEPLOYMENT.md`.

---

## 1. Entity types

| Entity | Type | Content | Route |
|---|---|---|---|
| Medical service | `types/medical-service.ts` | `content/medical-services.ts` | `/medical/[serviceId]` |
| Doctor | `types/doctor.ts` | inline in the same file | `/doctors/[doctorId]` |
| Aesthetic treatment | `types/aesthetics.ts` | `content/treatments.ts` | `/aesthetics/treatments/[treatmentId]` |
| Concern | `types/aesthetics.ts` | `content/concerns.ts` | `/aesthetics/concerns/[concernId]` |
| Technology | `types/aesthetics.ts` | `content/technologies.ts` | `/aesthetics/technologies/[technologyId]` |
| Product | `types/product.ts` | `content/products.ts` | `/shop/[productId]` |
| Health Hub article | `types/article.ts` | `content/health-hub-articles.ts` | `/health-hub/[articleId]` |
| Legal page | `types/legal.ts` | `content/legal-pages.ts` | `/[legalPageId]` |
| Before/after | `types/before-after.ts` | `content/before-after.ts` | `/aesthetics/before-after` |
| Pricing | `types/pricing.ts` | `content/uninsured-fees.ts`, `content/aesthetics-pricing.ts` | `/medical/uninsured-services`, `/aesthetics/pricing` |
| Media manifest | `types/media.ts` | `content/media/image-manifest.ts` | — |

Clinic facts (address, phone, fax, hours, social) live in `config/site.ts` and
`config/clinic-hours.ts` and are read from there by every component and schema
— never hardcoded elsewhere.

FAQs and prices are **not** standalone entities; they travel embedded on their
parent entity, in both the local types and the CMS schemas.

Each entity's CMS counterpart and cache tags: `FEELSTACK.md` §4–5.

## 2. Bilingual by construction

Every user-facing string field is `Bilingual` (`{ en: string; ar: string }`).
There is no code path that can register English-only content — the type makes
both required. The same applies to routes: `RouteEntry.path` is a required
`{ en; ar }` object.

Arabic is real translated copy with real Arabic slugs, not transliteration and
not English slugs under `/ar/`. Review status: `CONTENT_MODEL.md`.

## 3. Approval and provenance

The governing rule: **a field with no approved source is omitted, never
invented.** A missing optional field means the section is not rendered — never
placeholder text, never "coming soon".

- `CONTENT_MODEL.md` — provenance of every field.
- `CONTENT_MODEL.md` — the approved sources themselves.
- `CONTENT_MODEL.md` — what the legacy-site crawl found.
- `CONTENT_MODEL.md` — what is blocked and on whom.
- `CONTENT_MODEL.md` — what is absent and why.
- `CONTENT_MODEL.md` — legacy content mapped to new routes.
- `CONTENT_MODEL.md` — per-page field requirements.
- `SEO.md` — intent each route targets.

`sourceVerified` on an entity means every field traces to the approved
extraction document. Products additionally carry per-fact `sources` with
publisher and retrieval date.

This discipline is what makes the structured data safe: schema is generated
only from fields that already exist and are already rendered, so JSON-LD can
never assert something the page does not show (`ARCHITECTURE.md` §6).

## 4. Feature gating

`config/features.ts` is the single set of flags. A disabled feature must be
hidden from navigation, excluded from the sitemap, and unreachable — its route
calls `notFound()`. It must never render an empty page.

Gated routes are fully built — registry entry, typed model, template — so
enabling one is a flag flip, not new code.

Currently off, each pending real content or a provider:

| Flag | Blocked on |
|---|---|
| `shopCheckoutEnabled` | no payment provider implemented or approved |
| `legalPagesEnabled` | legacy Terms/Privacy are literal "Coming soon" placeholders |
| `healthHubArticlesEnabled` | template and model built; zero approved articles |
| `beforeAfterEnabled` | no approved before/after photography |
| `consultationFormEnabled` | no approved consultation flow |
| `aestheticPricingEnabled` | **enabled** — approved workbook published (GAP-003 resolved) |
| `newsletterEnabled` | no email provider |
| `medicalBotoxDetailPagesEnabled`, `cosmeticBotoxTreatmentPageEnabled`, `skinTighteningTreatmentPageEnabled`, `newProductBrandEnabled` | would duplicate existing content rather than add unique detail |

`shopEnabled` and `careersFormEnabled` are on.

## 5. Media

Every image is an entry in `content/media/image-manifest.ts` with an approval
`status`. Only `"approved"` renders the real ImageKit path; everything else
renders the FacetTile placeholder, so an unapproved or missing photo degrades
to a designed placeholder rather than a broken image.

Most clinical photography is still `pending` — see
`MEDIA.md` and `MEDIA.md`. One doctor
has `photoDeclined: true`, which is permanent and must not be revisited.

Setup and import: `MEDIA.md`, `MEDIA.md`.

## 6. Adding or changing content

1. Add or edit the entry in that feature's data file under `src/features/`,
   filling only fields with an
   approved source.
2. If it needs a new route, add it to `src/config/routes.ts` with both locale
   paths — nav, breadcrumbs, canonical, hreflang and sitemap follow
   automatically.
3. Record provenance in `CONTENT_MODEL.md`.
4. For images, add a manifest entry with `status: "pending"` and flip it to
   `"approved"` only once the asset is uploaded and signed off.
5. Run `npm run validate` and the Playwright suite. The static-analysis tests
   will reject unapproved image hosts, catalogue drift, and sitemap or hreflang
   inconsistency.

Once FeelStack is provisioned, the same entities become CMS-managed one family
at a time — `FEELSTACK.md` §7.

---

## Content Source Register

Every business-specific claim published on the site, traced to its source. This complements (does not replace) `docs/CONTENT_MODEL.md`, which is organized by claim-topic; this register is organized by **route**, with the exact columns this phase requires: Route / Section / Claim or topic / Source type / Source URL or document / Approval status / Review status / Medical reviewer requirement / Publication status.

Scope note: this registers every *route-level* claim (what a page asserts about Blue Diamond as a business) rather than every individual sentence — a full sentence-by-sentence ledger would run to thousands of rows for no added traceability, since every route's content already derives from exactly one of the two approved source documents, checked in `docs/CONTENT_MODEL.md`. New claims added this pass (SkinMedica catalogue, redirect corrections) get full-detail rows; unchanged routes are summarized with a pointer to the existing detailed matrix.

| Route | Section | Claim/topic | Source type | Source URL/document | Approval | Review | Medical reviewer required? | Publication |
|---|---|---|---|---|---|---|---|---|
| `/` | Trust strip | "6 Physicians · 28+ Years · 2022" | Approved DOCX | `Blue-Diamond-Medical-Website-Content-Extraction_1.docx` | Approved | Reviewed this pass (see `docs/CONTENT_MODEL.md` — roster count still needs final client reconfirmation) | No (factual/business, not clinical) | Published |
| `/medical/*` (7 pages) | All | AHS-insured service scope, per service | Approved DOCX | Same | Approved | Reviewed | No | Published |
| `/medical/uninsured-services` | Fee tables | Exact fees, forms, no-show schedule | Approved DOCX (verbatim tables) | Same | Approved | Reviewed | No | Published |
| `/medical/eye-screening` | Partnership | Euclid Telehealth eye screening | Approved DOCX | Same | Approved | Reviewed | No | Published |
| `/medical/after-hours-care` | PCN partnership | Mosaic PCN (Dr. Hamdi's patients), CWC PCN (Dr. Farhat's patients) | Approved DOCX | Same | Approved | Reviewed; also confirmed this pass as the correct redirect target for the legacy `/primary-care-network` URL | No | Published |
| `/aesthetics/treatments/*` (8 pages) | All | Treatment mechanism, areas, prep, aftercare, safety | Approved DOCX (`bluediamondmedicalaesthetics.ca` extraction) | Same | Approved | Reviewed | Recommended before launch (clinical accuracy of mechanism/safety text) — not yet performed, tracked here as open | Published |
| `/aesthetics/treatments/laser-hair-removal` | Location note | Citizen Studio address for Elite iQ™ | Approved DOCX | Same | Approved | Reviewed, implemented as `serviceLocationNote` | No | Published |
| `/aesthetics/concerns/*` (9 pages) | All | Concern description, approved treatment options | Approved DOCX | Same | Approved | Reviewed | Recommended, not yet performed | Published |
| `/aesthetics/concerns/rosacea-redness`, `/spider-veins`, `/sun-damage-pigmentation` | Related treatments | Relinked from the source's `/laser-hair-removal` mislink to Laser Skin Treatments | Approved DOCX + editorial correction | Same, cross-referenced against the source's own "Ultra Treatment — mislabeled" self-flag | Approved (documented deviation) | Reviewed | No | Published |
| `/aesthetics/technologies/*` (5 pages) | All | Device name, mechanism, approved treatments using it | Approved DOCX + manufacturer documentation | Same + device manufacturer sites (Cynosure/Cutera/BTL, referenced only, not scraped for claims) | Approved | Reviewed | Recommended, not yet performed | Published |
| `/aesthetics/technologies/elite-iq` | Naming | "Elite iQ™" (not "Elite+") | Approved DOCX (both names present; iQ used in FAQ context) | Same | Approved, documented resolution | Reviewed | No | Published |
| `/botox` | Insurance language | "combination of provincial health insurance and either patient private insurance or our compassionate program" | Approved DOCX (exact qualified phrasing) | Same | Approved | Reviewed | Recommended (insurance/coverage claims) | Published |
| `/doctors/*` (6 pages) | Bios, credentials | Per-doctor bio text | Approved DOCX | Same | Approved | Reviewed | No | Published |
| `/doctors/mohamed-farhat` | Photo | Real portrait | Approved image archive (`blue-diamond-original-site-images.zip`) | Same | Identity-confirmed by visual inspection this pass | Reviewed | N/A | Pending ImageKit credentials |
| `/doctors/reem-hamdi` | Photo | Real portrait, name-badge-confirmed | Approved image archive | Same | Identity-confirmed by visual inspection this pass | Reviewed | N/A | Pending ImageKit credentials |
| `/doctors/omonijo`, `/bakare`, `/ahmed-gwea` | Photo | 3 real, unidentified portraits exist | Approved image archive | Same | **Not approved — identity unconfirmed** | Open | N/A | Not published (placeholder remains) |
| `/doctors/omaima-saeed` | Photo | No photo, by explicit choice | Approved DOCX (declined) | Same | Approved (declined status itself is the approved fact) | Reviewed | N/A | Published (placeholder, permanent) |
| `/contact`, header, footer | NAP | Address, phone, fax | Approved DOCX | Same | Approved | Reviewed | No | Published |
| `/shop/*` (23 products, "MANDATORY APPROVED SKINMEDICA CATALOGUE" pass) | Product data — name/price/size/category | Exact names, prices, sizes, "Factor" grouping | Approved DOCX price-list tables | `Blue-Diamond-Medical-Website-Content-Extraction_1(4).docx`, source page bluediamondmedical.ca/products | **Client-approved, all 23 records published verbatim per group counts (3/2/5/3/5/2/3)** | Reviewed, transcribed verbatim, validated by `tests/unit/skinmedica-catalogue.spec.ts` (24 assertions: count, no unapproved/duplicate/missing product, price/size match, factor-group counts, cross-link integrity) | No (cosmetic products only — no medical-treatment claims made) | Built, **not published** (`shopEnabled: false`, photography blocker only — see row below) |
| `/shop/*` — per-product detail content (`overview`, `whatItIs`, `howToUse`, warnings, FAQs) | Product education copy | Original bilingual copy written from official-source research, not copied from any manufacturer paragraph | Official manufacturer site (skinmedica.com) + authorized Canadian retailers (Dermstore.com, dermshop.ca) | Per-product `detail.sources[]` entries in `src/features/products/data.ts` (URL + retrieval date `2026-08-22` + publisher, one row per product) | Approved (source-tier rule: manufacturer/authorized-retailer only, never a competitor clinic's copy) | Reviewed; every fact traces to a recorded source, unverifiable details omitted rather than invented | No (cosmetic, non-clinical) | Built, not published (same `shopEnabled` blocker) |
| `/shop/*` — naming corrections (5 products) | Current official product naming | "Total Defence" → "Total Defense" (Tinted + Clear), "TNS Advanced Plus Serum®" → "TNS® Advanced+ Serum", "HA5 Rejuvenative Hydrator" → "HA5® Rejuvenating Hydrator" | skinmedica.com (direct fetch of skinmedica.ca blocked by the site's own access controls — documented, worked around via manufacturer .com domain + Canadian retailers + search-result URL slugs) | See each product's `detail.legacyNameNote` in `src/features/products/data.ts` | Approved per brief's explicit instruction: preserve approved price/size, use current official name, document the mapping, never create a second product record | Reviewed | No | Built, not published |
| `/aesthetics/before-after` | Gallery | 15 candidate marketing/before-after assets found | Approved image archive | Same | **Not approved — flagged for clinical/marketing review**, several pairings unconfirmed | Open | Recommended (before/after claims are clinical) | Not published |
| Legacy redirects (`/terms-and-conditions`, `/privacy-policy`, `/primary-care-network`) | Redirect targets | 3 targets corrected this pass | Internal audit against actual content location | `src/features/medical-services/data.ts`, route registry | Approved (technical correction, not a new business claim) | Reviewed, tested | No | Published (redirect logic live) |

### Explicitly never sourced from competitors

Per the source-of-truth hierarchy, zero rows above cite a competitor site as a source — competitors inform structure only, recorded separately.

### Open items requiring action before launch

1. Clinical/medical review of treatment, concern, and technology page mechanism/safety text (recommended, not yet performed) — see rows above.
2. Identity confirmation for 3 physician portraits.
3. Clinical/marketing review of 15 before/after candidate assets.
4. Doctor roster/count final reconfirmation.

None of these are new findings — all were already tracked in `docs/CONTENT_MODEL.md` and `docs/CONTENT_MODEL.md`; this register cross-references them against their exact publishing location for traceability.

---

## Content Approval Matrix

For every published claim, its source, approval status, and where it renders. "Approved" here means "present in the supplied content-extraction document," not clinically re-verified — a medical reviewer should still sign off before real-world launch.

| Claim | Source | Status | Languages live | Page(s) |
|---|---|---|---|---|
| Clinic address, phone, fax | Content extraction doc (both legacy sites) | Approved | EN, AR | Header, Footer, Contact, Homepage, JSON-LD |
| "Opened July 4, 2022, founded by Dr. Mohamed Farhat, 28+ years experience" | Content extraction doc | Approved | EN, AR | Homepage, About |
| Six family physicians, names and bios | Content extraction doc | Approved | EN, AR | Doctors index + profiles |
| AHS-insured service list | Content extraction doc | Approved | EN, AR | Medical hub |
| Uninsured service fees (Forms, Treatments, Administrative Tasks — full tables) | Content extraction doc | Approved and published | EN, AR | `/medical/uninsured-services` |
| No-show fee schedule (full table) | Content extraction doc | Approved and published | EN, AR | `/medical/uninsured-services` |
| Botox medical/cosmetic treatment list | Content extraction doc | Approved | EN, AR | Botox hub |
| Botox insurance/compassionate-program note | Content extraction doc | Approved | EN, AR | Botox hub |
| Clinic policies (appointments, no-show, refills, confidentiality) | Content extraction doc | Approved | EN, AR | Patient Resources |
| Aesthetics signature services (RF micro-needling, skin tightening, laser, Botox, PRP) | Content extraction doc | Approved | EN, AR | Aesthetics hub |
| Eye disease screening (Euclid Telehealth partnership, monthly on-site, contact details) | Content extraction doc | Approved | EN, AR | `/medical/eye-screening` |
| After-hours care referral partners (Mosaic PCN for Dr. Hamdi's patients, CWC PCN for Dr. Farhat's patients) | Content extraction doc | Approved | EN, AR | `/medical/after-hours-care` |
| Chronic disease management, preventive care, weight management, pain management, minor procedures | Content extraction doc (AHS-insured list; one line each, plus Dr. Bakare's/Dr. Saeed's bios for detail) | Approved, kept intentionally short where source was thin | EN, AR | `/medical/<slug>` |
| SkinMedica product catalogue (23 SKUs — exact names, prices, sizes, full bilingual detail content and FAQs) | Content extraction doc + official manufacturer/authorized-retailer research | **Brand, data, and content approved and imported** (`src/features/products/data.ts`), validated by `tests/unit/skinmedica-catalogue.spec.ts` | — | Built and routed, still `shopEnabled: false` — the remaining blocker is product photography, not data (no SkinMedica bottle photos exist in the approved image archive) |
| Individual treatment/concern/technology detail copy (laser hair removal mechanics, RF micro-needling FAQs, etc.) | Content extraction doc | Approved in source, **not yet built into pages** | — | Tracked in `docs/CONTENT_MODEL.md` |
| Doctor photography | Not supplied | **Not approved / not present** | — | Facet Tile placeholder everywhere |
| Aesthetics pricing | `BLUE_DIAMOND_AESTHETIC_PRICING_APPROVED_2026-08-23.xlsx` + client approval email 2026-08-23 | **Approved and published** | 81 rows: 78 published, 3 ampoule add-ons held behind GAP-014 | `aestheticPricingEnabled: true` |
| Before/after results | Not supplied | **Not approved / not present** | — | `beforeAfterEnabled: false` |
| Legal copy (Terms, Privacy, Accessibility, Medical Disclaimer) | Legacy site shows "Coming soon" only | **Not approved / not publishable** | — | Not routed |
| 8 aesthetic treatments (laser hair removal, laser skin treatments, radio frequency, RF micro-needling, ultra, PRP hair restoration, PRP skin rejuvenation, TempSure Vitalia) — full clinical detail (mechanism, duration, downtime, results timeline, contraindications, FAQs) | Content extraction doc (bluediamondmedicalaesthetics.ca section) | Approved and published | EN, AR | `/aesthetics/treatments/<slug>` |
| 9 aesthetic concerns | Content extraction doc | Approved and published | EN, AR | `/aesthetics/concerns/<slug>` |
| 5 technologies (Elite iQ, Potenza, TempSure, Ultra, TempSure Vitalia) | Content extraction doc | Approved and published | EN, AR | `/aesthetics/technologies/<slug>` |
| Concern → treatment cross-links for Rosacea, Spider Veins, and Sun Damage | Content extraction doc, **with an editorial correction** | Approved with a documented deviation | EN, AR | The legacy site linked these three concerns to `/laser-hair-removal`, which the extraction doc itself flags as a mislink pattern elsewhere ("Ultra Treatment — links to /prp-therapy, mislabeled"). Relinked to Laser Skin Treatments instead, whose own approved content explicitly covers redness, spider veins, and pigmentation. See `src/features/concerns/data.ts` and `docs/ROUTING.md`. |
| Reviews, ratings, awards, patient counts, certifications | Not supplied anywhere | **Never to be fabricated** | — | Absent from every page and every JSON-LD block |

Every JSON-LD block (`src/components/shared/schema/JsonLd.tsx`) only emits fields with a row above marked "Approved."

---

## Content Coverage Report

Maps every section of the approved source, `Blue-Diamond-Medical-Website-Content-Extraction_1.docx`, to its destination route and publication status. Complements `docs/CONTENT_MODEL.md` (which is organized by claim/status) and `docs/CONTENT_MODEL.md` (which documents the two approved source files). This document is organized by **source section**, in the order it appears in the extraction doc, so it can be checked off page-by-page against the DOCX.

Status key: **Published** — fully live, indexed. **Built, gated** — page exists with real content, feature-flagged off pending a decision documented in `docs/CONTENT_MODEL.md`. **Excluded** — deliberately not built into a route, with reason.

### bluediamondmedical.ca section (family medicine / walk-in)

| DOCX section | Destination route(s) | Status | Notes |
|---|---|---|---|
| Homepage hero, "who we are," founding story (July 4, 2022, Dr. Farhat, 28+ years) | `/` | Published | Also feeds `MedicalClinic` JSON-LD `foundingDate` |
| Physician roster + bios (6 doctors) | `/doctors`, `/doctors/<slug>` | Published | Dr. Saeed has no photo (declined, per `docs/CONTENT_MODEL.md`); Dr. Gwea uses a Facet Tile placeholder |
| AHS-insured services list | `/medical`, `/medical/<slug>` (7 service pages) | Published | Split one page per service rather than one long list, to give each a real URL, heading, and FAQ — not a duplication, each page's copy is scoped to that service only. **All 7 now carry 6 original FAQs each (42 total, grounded in existing approved fields, matched by `FAQPage` schema) — added during the Part 1 content-enrichment pass,.** |
| Uninsured services fee tables (Forms, Treatments, Administrative Tasks) | `/medical/uninsured-services` | Published | Full tables reproduced verbatim; prices are `IBM Plex Mono` styled as data, not prose |
| No-show fee schedule | `/medical/uninsured-services` | Published | Same page as above |
| Eye disease screening / Euclid Telehealth partnership | `/medical/eye-screening` | Published | Booking CTA routes to `euclidtelehealth.org/book-now` |
| After-hours care (Mosaic PCN for Dr. Hamdi's patients, CWC PCN for Dr. Farhat's patients) | `/medical/after-hours-care` | Published | Not duplicated under Patient Resources — Patient Resources links to this one canonical page instead of repeating the content |
| Clinic policies (appointments, no-show, prescription refills, confidentiality) | `/patient-resources` | Published | |
| Careers listing | `/careers` | Published | |
| Contact info (address, phone, fax, hours) | `/contact`, header, footer, homepage, `MedicalClinic` JSON-LD | Published | |

### bluediamondmedicalaesthetics.ca section (medical aesthetics)

| DOCX section | Destination route(s) | Status | Notes |
|---|---|---|---|
| Aesthetics overview / signature services | `/aesthetics` | Published | |
| 8 treatments (laser hair removal, laser skin treatments, radio frequency, RF micro-needling, Ultra, PRP hair restoration, PRP skin rejuvenation, TempSure Vitalia) — full clinical detail | `/aesthetics/treatments/<slug>` (×8) | Published | Laser hair removal carries the approved Citizen Studio `serviceLocationNote` (see `docs/CONTENT_MODEL.md` item on service location) |
| 9 concerns | `/aesthetics/concerns/<slug>` (×9) | Published | Rosacea/spider-veins/sun-damage relinked from the source's `/laser-hair-removal` mislink to Laser Skin Treatments — documented deviation, see `CONTENT_MODEL.md` |
| 5 technologies (Elite iQ, Potenza, TempSure, Ultra, TempSure Vitalia) | `/aesthetics/technologies/<slug>` (×5) | Published | "Elite+" in the source normalized to the technology's correct product name "Elite iQ™" — see `CONTENT_MODEL.md` |
| Botox — cosmetic + medical (migraine, TMJ/bruxism, hyperhidrosis) treatment list, insurance/compassionate-program note | `/botox` (published) | Published | Single unified hub, not split by cosmetic/medical, per the consolidation rule in the newest brief — a medical-Botox-by-condition breakout (`/medical/botox/*`) is **built but gated** (`medicalBotoxDetailPagesEnabled: false`) because splitting it out would duplicate `/botox`'s existing, approved content without new source material to differentiate the pages |
| SkinMedica product price list | `/shop` and children | **Built, gated** (`shopEnabled: false`) | Prices exist in the source but the brief itself asks for explicit brand/product approval before publishing a commerce catalogue (§18 of the original brief) — not published pending that sign-off |
| Individual aesthetics pricing (beyond the SkinMedica list) | `/aesthetics/pricing` + every treatment page | **Published** (`aestheticPricingEnabled: true`) | The approved pricing workbook was supplied and implemented — see `docs/APPROVED_AESTHETIC_PRICING_MATRIX.md` |
| Before/after photography | `/aesthetics/before-after` | **Built, gated** (`beforeAfterEnabled: false`) | No photography supplied; gallery slot renders empty by design rather than stock/fake images |

### Not present anywhere in the source (correctly absent from the site)

- Legal copy (Terms, Privacy, Accessibility Statement, Medical Disclaimer) — the legacy site itself only shows "Coming soon." Routes are built (`/terms`, `/privacy`, etc.) with `legalPagesEnabled: false`, and even if that flag were flipped on, `LegalPageTemplate` independently refuses to render a page whose `body` is empty, so flipping the flag alone can never publish unapproved legal text.
- Reviews, ratings, awards, patient counts, third-party certifications — never fabricated, never rendered, never included in any JSON-LD block.
- Health Hub articles — the source doc contains no blog/article content; `/health-hub` exists as a hub shell with `healthHubArticlesEnabled: false` and zero fabricated articles.
- Doctor photography — not supplied; every doctor (Dr. Saeed by explicit choice, Dr. Gwea by omission) renders through the code-generated Facet Tile placeholder, never a stock photo.

### Coverage summary

Every section of the approved DOCX has a destination. Nothing in the source was silently dropped: content either (a) is published, (b) is built into a real route held behind a feature flag with a documented reason, or (c) is explicitly listed above as absent from the source and therefore correctly absent from the site. No page's copy was invented outside these two documents.

---

## Missing Content Report

Tracks everything the site is intentionally *not* showing yet because approved source content doesn't exist. Each row: the component/data model is already built; only the flag/status needs flipping once real content arrives.

**Every route below is fully built** — registered in `src/config/routes.ts`, backed by a typed bilingual content model, rendered by a reusable template — and every one of them returns a genuine 404 today (verified in `tests/e2e/gated-routes.spec.ts`, which also confirms each is absent from the sitemap and main navigation). Nothing is silently omitted from the brief's required route list; nothing renders as an empty or "Coming soon" page. See `docs/CONTENT_MODEL.md` for the source-by-source reasoning.

| Item | Current state | Blocking |
|---|---|---|
| Doctor photography (all 6) | Facet Tile abstract placeholder | No ImageKit account to actually deliver any photo yet. Real, licensed source photos now exist for 2 of 6 (Dr. Farhat, Dr. Reem Hamdi — identity-confirmed by visual inspection, see `docs/MEDIA.md`) and are ready to import the moment credentials exist. Dr. Saeed permanently declines a photo. Dr. Omonijo/Bakare/Gwea: real, non-stock portraits exist in the archive but carry no visible name — needs client confirmation before import (see `docs/CONTENT_MODEL.md`). |
| ImageKit account/credentials | Official `@imagekit/next` SDK installed and wired (`ImageKitProvider` in the root layout, `ImageKitImage` component using the SDK's `<Image>`) — code is complete; `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` is the only thing unset | Needs a real ImageKit account from the client |
| FeelStack CMS endpoint/site key | Adapter fully built — `src/lib/feelstack/client.ts` (typed, timeout+retry, Zod-validated, fails closed to local content), `src/lib/feelstack/page-resolver.ts`, and the HMAC-verified `/api/feelstack/revalidate` webhook (`src/lib/security/hmac.ts`) all exist and typecheck/build cleanly | Needs a real FeelStack API URL, site key, and revalidation secret — every real page on the site is still driven by the per-feature data files under `src/features/`, not FeelStack, until then |
| Aesthetic treatment pricing | Shown per treatment area on each treatment page and indexed at `/aesthetics/pricing` | 78 client-approved prices from the 2026-08-23 workbook. The 3 ampoule add-ons remain unpublished pending clinician review (GAP-014) |
| Before/after photography | Not shown (`beforeAfterEnabled: false`) | None supplied; brief explicitly forbids fabricating this |
| Medical Botox hub + migraine/bruxism-tmj/hyperhidrosis detail pages (`/medical/botox/*`) | Route + typed data (`src/features/medical-services/botox.ts`) + template built; gated behind `medicalBotoxDetailPagesEnabled` | The only source content for each condition individually already lives in full on `/botox` and summarized on `/medical` — splitting it three ways would be duplicate content, not three unique pages |
| Cosmetic Botox (`/aesthetics/treatments/cosmetic-botox`) | Route + typed data (`src/features/aesthetics/data/treatments.ts` `gatedTreatments`) + template built; gated behind `cosmeticBotoxTreatmentPageEnabled` | Its only source content is the treatment-area list already live on `/botox` |
| Skin Tightening (`/aesthetics/treatments/skin-tightening`) | Route + typed data + template built; gated behind `skinTighteningTreatmentPageEnabled` | Its only source content *is* the Radio Frequency/TempSure page — "skin tightening" is that treatment's stated function, not a distinct procedure |
| Health Hub articles (`/health-hub/[articleId]`) | Type model (`src/features/health-hub/types.ts`), template (`HealthHubArticleTemplate`), and dynamic route built; `src/features/health-hub/data.ts` is an empty array | No article copy has been drafted or medically reviewed |
| Aesthetics pricing (`/aesthetics/pricing`) | **Live.** Records in `src/features/aesthetics/data/pricing.ts` (81 rows, stable `PR-0xx` ids), rendered by `PricingTable` on the index and on each treatment page | Guarded by `tests/unit/aesthetic-pricing.spec.ts` (arithmetic control totals, per-treatment category totals, held add-ons) and `tests/e2e/aesthetic-pricing.spec.ts` (both locales, mobile overflow) |
| Consultation request (`/aesthetics/consultation`) | Full Zod-validated form + server action + route built; gated behind `consultationFormEnabled` | No approved consultation-intake flow supplied |
| Before & After (`/aesthetics/before-after`) | Route + gallery slot built; gated behind `beforeAfterEnabled` | No approved before/after photography supplied |
| Legal pages — Terms, Privacy, Accessibility, Medical Disclaimer | Route (`/[locale]/[legalPageId]`), template, and typed model built for all 4; gated behind `legalPagesEnabled`, and each individually 404s even if the flag were flipped on because `body` is empty | Legacy copy is literally "Coming soon" — brief §25 explicitly forbids publishing that; real legal copy needs drafting/approval |
| Shop — cart, checkout, shipping & returns only (the catalogue hub, category/concern pages, and all 23 product detail pages are **live** as of the "COMPLETE SKINMEDICA NAVIGATION AND PRODUCT-DETAIL FLOW" pass — see `docs/CONTENT_MODEL.md`, no longer listed here as missing) | The 3 stub pages are built (no commerce provider interface exists — the catalogue is content only); gated behind a **separate** `shopCheckoutEnabled` flag (`false`) so the live catalogue never exposes them | No real payment/cart/shipping is implemented or approved — these stay disabled regardless of `shopEnabled` until a payment provider and an approved shipping/returns policy exist. Remaining photography blocker (SkinMedica bottle shots) is cosmetic only — every live product page already renders correctly through the approved Facet Tile placeholder. |
| Newsletter signup | Component built (`NewsletterSignup`), self-gating on `newsletterEnabled`, not placed on any page yet | Not requested in supplied source; no email-list provider configured |
| Health Hub articles | Hub page exists, no articles | No approved article copy or medical reviewer assignment supplied |
| Legal pages (Terms, Privacy, Accessibility, Medical Disclaimer) | Not built, not routed | Legacy site shows literal "Coming soon" for Terms/Privacy — brief §25 explicitly forbids publishing that; real legal copy must be drafted/approved first |
| Shop / products | Not shown (`shopEnabled: false`) | Catalogue data is approved and imported; blocked on product photography only — see the row above |
| Consultation-request form | Not shown (`consultationFormEnabled: false`) | No approved flow supplied |
| Newsletter signup | Not shown (`newsletterEnabled: false`) | Not requested in supplied source |
| Contact form delivery (email/CRM) | Validates + rate-limits, but delivery fails closed with a "please call us" fallback | No `CONTACT_DELIVERY_PROVIDER` credentials supplied — see `src/lib/forms/delivery.ts` |
| Careers application delivery | `mailto:` link only | No file-upload/ATS integration supplied; brief's "Name/Phone/Email/Resume + reCAPTCHA" form not yet built |
| Day-by-day clinic hours | Only "open today" hours were in the source (08:00–19:00 medical, 09:00–17:00 aesthetics); `src/config/clinic-hours.ts` applies these Mon–Fri and treats Sat/Sun as closed by assumption | Needs a real day-by-day schedule from the client, including whether Sat/Sun are actually closed |
| Primary Care Network / Clinic Policies detail sub-pages | Redirected to the Patient Resources hub, which already contains this content inline, rather than dedicated sub-pages | Content exists (used in the hub); dedicated URLs are a nice-to-have once the hub outgrows one page |

### Process followed for every row above

1. Build the reusable component (done in every case above).
2. Build the typed bilingual data structure (done — `src/types/*`, `src/config/*`).
3. Hide the incomplete feature via `src/config/features.ts` or simply not registering the route.
4. Record it here.
5. Continue with the rest of the project — followed throughout this build.

---

## Data Approval Blockers

Conflicts between the approved source document and the legacy live sites, flagged explicitly for client resolution before launch. None of these block the build — each is resolved below using the established source-priority order (approved DOCX > legacy live sites), with the conflict recorded rather than silently picked.

### Doctor count and roster

- **Approved source** (`Blue-Diamond-Medical-Website-Content-Extraction_1.docx`): names and full bios for six family physicians — Dr. Mohamed Farhat, Dr. Omaima Saeed, Dr. Reem Hamdi, Dr. Omonijo, Dr. Bakare, Dr. Ahmed Gwea.
- **Legacy live site discrepancy**: reported to show a different count/roster on the homepage than the extraction document.
- **Resolution applied**: the approved DOCX is the higher-priority source per the project's established source hierarchy, and it is unambiguous — six named physicians, each with real, non-fabricated biographical content. The site shows "6 Physicians" (`src/app/[locale]/page.tsx` trust strip) and publishes all six doctor profiles on that basis.
- **Still needs client confirmation**: whether the current roster of six is final and current as of launch, since a legacy site showing a different count suggests the roster may have changed since the DOCX was extracted. **This is a launch blocker**, not a build blocker — flag before going live.
- **New evidence this pass**: the licensed legacy-site image archive (`blue-diamond-original-site-images.zip`) contains real, non-stock physician portraits from the "Our Team" page. Two are identity-confirmed (Dr. Farhat by clear match, Dr. Reem Hamdi by a visible embroidered name badge — see `docs/MEDIA.md`). Three more real portraits exist with **no visible name**: two different women (candidates for Dr. Omonijo, the only remaining unassigned female physician — but two different photos for one remaining slot is itself a discrepancy needing a client answer) and one man (candidate for Dr. Bakare or Dr. Gwea). None were guessed or assigned — see the import report for the full breakdown. **Client action needed**: confirm which name (if any) belongs to each of these three photos.

### Dr. Ahmed Gwea specifically

- Fully approved bio content exists in the source DOCX and is published (`src/features/doctors/data.ts`, route `doctor-ahmed-gwea`).
- Per the brief's own explicit doctor-image rule, his photo is a Facet Tile placeholder (status `pending`) until a real photograph is supplied — never a stock or generated face.
- If the client confirms Dr. Gwea is no longer part of the roster, the fix is a one-line change: remove his entry from `src/features/doctors/data.ts` and `src/config/routes.ts` regenerates automatically (routes are derived from the doctors array, not hardcoded).

### Opening hours

- Both legacy sites state only "Open today" plus one daily hour range each (main clinic 08:00–19:00, aesthetics 09:00–17:00) — neither ever published a real day-by-day schedule, so there is no factual "conflict" between two different schedules, only an *absence* of Saturday/Sunday data.
- **Resolution applied**: `src/config/clinic-hours.ts` applies the known Monday–Friday hours and treats Saturday/Sunday as closed by default (documented in-file as "not confirmed, closed by default") rather than inventing weekend hours. "Open today" is never hardcoded as static text — `getOpenStatus()` computes it live from this schedule in the Calgary timezone.
- **Still needs client confirmation**: the real weekly schedule, including whether the clinic is ever open on a Saturday.

### Elite+ vs. Elite iQ™

- The source content uses both names for laser hair removal equipment: "Elite+™ laser system" (general treatment description) and "Elite iQ™" (specifically for the Skintel™ melanin-reader-guided treatment).
- **Resolution applied**: not treated as interchangeable. `src/features/technologies/data.ts` registers `elite-iq` as the technology entry (matching the more specific, FAQ-referenced name), and `src/features/aesthetics/data/treatments.ts`'s laser-hair-removal FAQs use "Elite iQ™" consistently, matching the source's own FAQ section which uses that name exclusively when describing the Skintel-guided process. The general "Elite+" mention is treated as the equipment family name, Elite iQ as the specific configured device — both point at the same real technology, not two different pieces of equipment.

### Service locations — West Springs vs. Citizen Studio

- **Approved source**: "All Elite iQ™ treatments are exclusively performed at Citizen Studio, 45 Greenbriar Dr NW, Calgary, AB T3B 5N4" — a different address from the main clinic.
- **Resolution applied**: `src/config/site.ts` stores `eliteIQLocation` as a distinct, separately-named location object from `siteConfig.clinic`. `docs/CONTENT_MODEL.md` records this distinction. **Resolved and verified**: the laser-hair-removal treatment page now renders the approved Citizen Studio address inline (`AestheticTreatment.serviceLocationNote`, `AestheticTreatmentTemplate.tsx`) rather than implying West Springs — this was a real content-accuracy gap, found and fixed.

### Medical Botox insurance/compassionate-program coverage

- Source states coverage is "a combination of provincial health insurance and either patient private insurance or our compassionate program" for migraine, bruxism, and hyperhidrosis specifically — not a blanket guarantee, not extended to cosmetic Botox.
- **Resolution applied**: every mention of this on the site (Botox hub, homepage FAQ) uses the qualified phrasing from the source, never a bare "covered by insurance" claim, and explicitly states cosmetic Botox is not insured.

### SkinMedica catalogue — RESOLVED and LIVE (photography still placeholder)

- **Previously blocked on**: explicit brand/product approval (brief §18).
- **Resolution applied**: the client has approved the exact 23-product SkinMedica catalogue ("MANDATORY APPROVED SKINMEDICA CATALOGUE" pass). All 23 SKUs from the approved source (`Blue-Diamond-Medical-Website-Content-Extraction_1(4).docx`, source page bluediamondmedical.ca/products) are imported verbatim — exact names, prices, sizes, and "Factor" group counts (3/2/5/3/5/2/3 = 23) — into `src/features/products/data.ts`. Every product carries full original bilingual detail content (overview, what it is, routine placement, how to use, warnings, 6 product-specific FAQs each, per-fact sources) researched exclusively from the official manufacturer site and authorized Canadian retailers — never a competitor clinic's copy. Validated end-to-end by `tests/unit/skinmedica-catalogue.spec.ts` (24 assertions).
- **Naming corrections applied and documented** (client instruction: verify current official name, preserve approved price/size, document the mapping, never create a second product): "Total Defence" → "Total Defense + Repair SPF 34" (both Tinted and Clear), "TNS Advanced Plus Serum®" → "TNS® Advanced+ Serum", "HA5 Rejuvenative Hydrator" → "HA5® Rejuvenating Hydrator". Each recorded in the product's `detail.legacyNameNote` (bilingual) and in `docs/CONTENT_MODEL.md`. Direct fetch of skinmedica.ca returned HTTP 403 on every attempt; verification instead used skinmedica.com (same manufacturer) plus Dermstore.com/dermshop.ca as corroborating Canadian-retailer sources — documented transparently rather than silently substituted.
- **Published live** ("COMPLETE SKINMEDICA NAVIGATION AND PRODUCT-DETAIL FLOW" pass): `shopEnabled` is now `true` — the full 23-product catalogue at `/en/shop`/`/ar/المتجر`, all 46 individual product pages (23 × 2 locales, `shop-product-<id>`, indexed, in sitemap, unique per-product metadata/canonical/hreflang), the homepage's 6-product preview, and the "Ask About This Product" enquiry flow (validated `?product=<slug>` query param → Contact page, product preselected) are all live, per the brief's explicit instruction to ship with the approved neutral Facet Tile placeholder rather than keep the whole catalogue gated on photography. Cart/checkout/shipping-returns stay gated behind a **separate** `shopCheckoutEnabled` flag (still `false`) — no real payment/cart/shipping exists or is implied anywhere.
- **Still blocked on**: product photography only. The approved image archive (`blue-diamond-original-site-images.zip`) contains clinic, treatment, and technology imagery, but no SkinMedica product/bottle photography. Every product renders through the FacetTile placeholder until real photography is supplied and imported — see `docs/MEDIA.md`/`docs/MEDIA.md`. Swapping in real photos needs no other code change.
- **Not carried over**: `concernIds` (acne, anti-aging, etc.) is left empty on every product — the approved catalogue groups products by "Factor" (organizational, not a clinical-suitability claim), not by skin concern, so populating concern-targeting would mean inventing an unapproved suitability claim rather than transcribing one. Add real approved concern-mapping later without a schema change, same pattern as the rest of this blocker list.
- **Scar Recovery Gel** (2 approved sizes, one underlying product): implemented as two independent product records/pages (`scar-recovery-gel-with-centelline-small`, `-large`) cross-linked via `variantOfId`, per the brief's explicitly sanctioned alternative to a single variant-selector page — no variant/option commerce model exists in the current data layer, and checkout stays disabled regardless.

### TempSure Vitalia prevalence statistic — "1 in 3" vs. "1 in 4"

- **Approved source** (DOCX, published on `treatment-tempsure-vitalia`): "roughly 1 in 3 women" experience the pelvic floor/sexual health concerns TempSure Vitalia addresses.
- **Legacy live site** (`bluediamondmedicalaesthetics.ca/vitalia`, confirmed by direct fetch during this pass's mandatory legacy-page crawl): "nearly 1 in 4 women."
- **Resolution applied**: kept the approved DOCX figure ("1 in 3") per the established source-priority order — not silently reconciled to the live site's different number, and not averaged/guessed. Flagged here since it's a real numeric discrepancy between the two sources, not a copy-editing variance.
- **Still needs client confirmation**: which figure is current/correct.

### `/vitalia` and `/ols/products` — discovered via live crawl, not in the original DOCX inventory

- Found this pass via a real `sitemap.xml`/`sitemap.website.xml`/`sitemap.blog.xml`/`sitemap.ols.xml` crawl of both legacy domains (brief §3's mandatory discovery step).
- `/vitalia` (aesthetics domain): real page, redirected to the existing `tempsure-vitalia` treatment page (same subject, not a duplicate) — see the statistic discrepancy above, found via this same fetch.
- `/ols/products` (aesthetics domain): a GoDaddy Website Builder auto-generated "Online Store" module page with generic platform SEO boilerplate, no unique editorial content found — redirected to `/en/shop` as the closest live equivalent rather than omitted.
- `/tempsure`, `/microneedling` (medical domain, both now redirected in `src/lib/routing/legacy-redirects.ts`) and 7 individual `/about-skinmedica-products/f/<slug>` product pages (all now redirected, 2 required fetching the live `<title>` to disambiguate an ambiguous "tinted" slug used for both the Clear and Tinted products) were also found this way and would otherwise have 404'd with no prior redirect entry at all.

### Aesthetics phone number

- The aesthetics section of the source uses `(403) 247-1418`, distinct from the main clinic's `825 413-1113`. Both are real, sourced numbers for genuinely different reception lines — not a conflict, but flagged here since it's easy to mistakenly "unify" them. `src/config/site.ts` keeps them as separate fields (`clinic.phone` vs. `aesthetics.phone`).

---

## Translation Review Report

**Status: all Arabic copy in this build is AI-drafted and unreviewed.** It was written with care for register, medical tone, and natural phrasing (not machine-literal), but per the brief's own content-approval rules, it needs a native-speaker pass and — for anything describing a medical/clinical service — a medically-literate reviewer before this becomes the production Arabic site.

### What exists

- `src/i18n/dictionaries/ar.ts` — all UI chrome (nav, footer, homepage sections, common labels).
- Inline bilingual copy in every page component under `src/app/[locale]/*` (medical hub, aesthetics hub, botox hub, patient resources, about, contact, careers, book-appointment).
- `src/features/doctors/data.ts` — doctor names, credentials, and bios in Arabic.
- `src/config/routes.ts` — Arabic route slugs.
- `src/features/medical-services/data.ts` — 7 medical-service pages' Arabic copy, including clinical terms (chronic disease management, minor procedures, etc.).
- `src/features/medical-services/uninsured-fees.ts` — Arabic translations of every fee-schedule line item (forms, treatments, administrative tasks, no-show fees). Fee item names in particular should be checked against how patients actually refer to these documents in conversation (e.g. "Attending Physician Statement," "Blue Cross Special Authorization").
- `src/features/aesthetics/data/treatments.ts` — 8 aesthetic treatment pages, the richest and most clinically technical Arabic copy in the build (mechanism-of-action language, contraindication lists, downtime/recovery descriptions). This is the highest-priority file for a medical-Arabic reviewer given both volume and clinical specificity.
- `src/features/concerns/data.ts` — 9 concern pages, including the note on 3 concerns whose treatment cross-link was editorially corrected from the source (see `docs/CONTENT_MODEL.md`).
- `src/features/technologies/data.ts` — 5 technology pages. Manufacturer/product names (Elite iQ™, Potenza, TempSure, Cynosure) are kept untranslated as proper nouns — confirm this matches how the clinic wants brand names presented in Arabic marketing.
- `src/features/medical-services/data.ts` — **42 new bilingual FAQs added this pass** (6 per medical service × 7 services), grounded entirely in already-approved source content, never inventing new clinical facts. Same review priority as the rest of this file's medical-service copy.
- `src/features/products/data.ts` — **23 SkinMedica product names, plus full bilingual detail content and FAQs, transliterated/translated to Arabic.** Names are professional-convention renderings (phonetic transliteration for trademarked product names, following the same pattern already used for Potenza/TempSure/Elite iQ in `technologies.ts`); detail content (overview, how-to-use, warnings, FAQs) is original Arabic copy written from the same verified-source research as the English, not a machine translation. None of it has yet been reviewed by a native Arabic-speaking marketing reviewer — recommended before launch, same as every other Arabic content block in this report.

### Specific items needing native-speaker confirmation before launch

1. **Doctor name transliterations** — especially "Dr. Ahmed Gwea" → `أحمد جويع`, which is a best-effort phonetic transliteration with no confirmed source spelling. Every doctor should ideally confirm their own preferred Arabic spelling.
2. **Medical terminology precision** — terms like "bruxism (TMJ)" → `صرير الأسنان (TMJ)`, "hyperhidrosis" → `التعرق الزائد`, and the uninsured-service fee labels should be checked against how a Calgary-area Arabic-speaking patient population actually expects to see them phrased (regional Arabic varies; this draft uses Modern Standard Arabic throughout for broad comprehensibility).
3. **Numerals policy** — this build deliberately keeps Western/Latin digits everywhere (phone numbers, prices, dates) even inside Arabic paragraphs, on the reasoning that phone numbers and prices should never visually reverse. This is a design decision, not an oversight — confirm it matches client expectations; some Arabic-first audiences prefer Eastern Arabic numerals (٠١٢٣) in body copy.
4. **Legal/clinical disclaimers** — the emergency notice and contact-form privacy notice are translated but have not been reviewed by anyone with Arabic medical-legal expertise.

### Process for closing this out

1. Export all `ar:` strings (a script to diff `en.ts`/`ar.ts` keys and dump Arabic values would be a good next addition to `tests/`).
2. Native-speaker review pass, tracked against this file.
3. Medical reviewer sign-off on any clinical terminology.
4. Mark each section above resolved and remove the "unreviewed" status at the top of this file.

---

## Source Inventory

### Approved source documents

| File | Location | Used for |
|---|---|---|
| `BLUE DIAMOND LOGO DOCUMENT[10519].pdf` | Supplied via Downloads (client-provided, Decca Design Inc.) | Logo geometry, 4-blue/4-grey palette, wordmark typeface reference — see `docs/UI_UX_FOUNDATION.md` §1–2 |
| `Blue-Diamond-Medical-Website-Content-Extraction_1.docx` | Supplied via Downloads (Dfeelings Digital Marketing Agency content extraction) | All copy currently on the live site: home, appointment/no-show fees, uninsured services, doctor bios, medical aesthetics, Botox, eye screening, primary care network, clinic policies, careers, contact, SkinMedica product price list, and the full `bluediamondmedicalaesthetics.ca` treatment/technology/concern catalogue |

No other client documents (pricing for aesthetics, before/after photography, legal copy, doctor headshots, business hours beyond "open today," ImageKit/FeelStack credentials) have been supplied. See `docs/CONTENT_MODEL.md`.

### Source priority applied

1. The two documents above (approved client source).
2. Direct instructions in the build brief.
3. A live crawl of both legacy domains (added this pass — see below), used strictly for **discovery and gap verification** (finding URLs that exist but weren't in the DOCX), never for copying page copy into the new site.

### Live legacy-domain crawl (brief §3 mandatory discovery, performed this pass)

Both legacy domains were reachable, so this ran the real crawl rather than falling back to the DOCX-only minimum inventory: fetched `robots.txt` and every `sitemap*.xml` file on both `bluediamondmedical.ca` (`sitemap.xml` index → `sitemap.website.xml`, `sitemap.blog.xml`, `sitemap.ola.xml`) and `bluediamondmedicalaesthetics.ca` (`sitemap.xml` index → `sitemap.website.xml`, `sitemap.ols.xml`, `sitemap.ola.xml`). Found 3 real pages and 7 individual SkinMedica product sub-pages absent from the DOCX-derived inventory — `/tempsure`, `/microneedling`, `/vitalia`, and `/about-skinmedica-products/f/<slug>` × 7 — all now redirected (`src/lib/routing/legacy-redirects.ts`, `docs/ROUTING.md`) rather than left to 404. Full detail: `docs/CONTENT_MODEL.md`. The `sitemap.ola.xml` endpoint on both domains and `/ols/products` are platform-generated (GoDaddy Website Builder booking-widget/store-module) artifacts, not unique editorial pages.

### What was NOT used

- Derm.ca or any other third-party clinic site — not consulted for content or imagery, only referenced in the brief as a quality-bar note.
- Stock photography, AI-generated photography, or any non-ImageKit image source for production imagery.
- No page copy was transcribed from the live crawl above — it was used only to confirm a URL exists and to read its `<title>`/topic for correct redirect targeting, never as a content source for the new site's pages (the DOCX remains the sole approved copy source).

---

## Page Content Requirements

Per-page-type content specification, cross-checked against the **actual current type models and templates** (not assumed) — every field below was verified to exist or not exist in `src/types/*.ts` and to render or not render in `src/templates/*.tsx` before being marked ✅ or ⚠️. This is the spec Part 2's implementation plan and the content-writing pass both work from.

### Medical service page (`src/features/medical-services/types.ts`, `MedicalServiceTemplate.tsx`)

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
| 16. Sources | Not modeled per-page | ⚠️ Tracked centrally in `docs/CONTENT_MODEL.md` instead of per-page |

### Aesthetic treatment page (`src/features/aesthetics/types.ts`, `AestheticTreatmentTemplate.tsx`)

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
| 18. 8-12 FAQs | `faqs` — populated on some treatments already (checked `rf-microneedling` has real FAQs), not audited across all 10 | ⚠️ Needs a per-treatment audit () |
| 19. External consultation CTA | `getBookingUrl("aesthetics-consultation")` | ✅ |
| 20. Sources and medical disclaimer | **No medical disclaimer renders on this template at all** — confirmed via grep, zero matches | ❌ **Real gap, same severity as the medical-service disclaimer being present makes this inconsistency notable** |

### Concern page (`AestheticConcern` type, `ConcernTemplate.tsx`)

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

### Technology page (`Technology` type, `TechnologyTemplate.tsx`)

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

### Homepage (§15)

All 16 required elements were confirmed present in the existing homepage build (14-section surface rhythm, documented in earlier session work) — no gaps found. Not re-audited line-by-line here since the homepage was extensively rebuilt and verified in the prior remediation pass; `docs/UI_UX_FOUNDATION.md` and the homepage's own inline comments cover it.

### Summary of real content-model gaps found

**Structural (type + template changes needed, not just content-writing) — highest priority:**
1. `AestheticTreatmentTemplate` renders no medical disclaimer at all (every medical-service page has one; every aesthetic page should too, given both involve physician-provided care).
2. No treatment page, concern page, or technology page cross-links to relevant doctors — only medical-service pages do.
3. `AestheticConcern` and `Technology` types have no `faqs` field at all (medical services and treatments do).
4. `AestheticConcern` has no treatment-comparison, related-concerns, or related-technologies modeling.
5. No treatment-day-journey or aftercare-instructions field on aesthetic treatments.

**Content-only (existing fields, just need real approved copy written) for the prioritized list:**
- 0 of 7 medical services currently populate their (already-built) `faqs` field.
- Aesthetic treatment FAQ depth needs a full per-page audit against the 8-12 target.
