# Data Approval Blockers

Conflicts between the approved source document and the legacy live sites, flagged explicitly for client resolution before launch. None of these block the build — each is resolved below using the established source-priority order (approved DOCX > legacy live sites), with the conflict recorded rather than silently picked.

## Doctor count and roster

- **Approved source** (`Blue-Diamond-Medical-Website-Content-Extraction_1.docx`): names and full bios for six family physicians — Dr. Mohamed Farhat, Dr. Omaima Saeed, Dr. Reem Hamdi, Dr. Omonijo, Dr. Bakare, Dr. Ahmed Gwea.
- **Legacy live site discrepancy**: reported to show a different count/roster on the homepage than the extraction document.
- **Resolution applied**: the approved DOCX is the higher-priority source per the project's established source hierarchy, and it is unambiguous — six named physicians, each with real, non-fabricated biographical content. The site shows "6 Physicians" (`src/app/[locale]/page.tsx` trust strip) and publishes all six doctor profiles on that basis.
- **Still needs client confirmation**: whether the current roster of six is final and current as of launch, since a legacy site showing a different count suggests the roster may have changed since the DOCX was extracted. **This is a launch blocker**, not a build blocker — flag before going live.
- **New evidence this pass**: the licensed legacy-site image archive (`blue-diamond-original-site-images.zip`) contains real, non-stock physician portraits from the "Our Team" page. Two are identity-confirmed (Dr. Farhat by clear match, Dr. Reem Hamdi by a visible embroidered name badge — see `docs/IMAGEKIT_IMPORT_REPORT.md`). Three more real portraits exist with **no visible name**: two different women (candidates for Dr. Omonijo, the only remaining unassigned female physician — but two different photos for one remaining slot is itself a discrepancy needing a client answer) and one man (candidate for Dr. Bakare or Dr. Gwea). None were guessed or assigned — see the import report for the full breakdown. **Client action needed**: confirm which name (if any) belongs to each of these three photos.

## Dr. Ahmed Gwea specifically

- Fully approved bio content exists in the source DOCX and is published (`src/types/doctor.ts`, route `doctor-ahmed-gwea`).
- Per the brief's own explicit doctor-image rule, his photo is a Facet Tile placeholder (status `pending`) until a real photograph is supplied — never a stock or generated face.
- If the client confirms Dr. Gwea is no longer part of the roster, the fix is a one-line change: remove his entry from `src/types/doctor.ts` and `src/config/routes.ts` regenerates automatically (routes are derived from the doctors array, not hardcoded).

## Opening hours

- Both legacy sites state only "Open today" plus one daily hour range each (main clinic 08:00–19:00, aesthetics 09:00–17:00) — neither ever published a real day-by-day schedule, so there is no factual "conflict" between two different schedules, only an *absence* of Saturday/Sunday data.
- **Resolution applied**: `src/config/clinic-hours.ts` applies the known Monday–Friday hours and treats Saturday/Sunday as closed by default (documented in-file as "not confirmed, closed by default") rather than inventing weekend hours. "Open today" is never hardcoded as static text — `getOpenStatus()` computes it live from this schedule in the Calgary timezone.
- **Still needs client confirmation**: the real weekly schedule, including whether the clinic is ever open on a Saturday.

## Elite+ vs. Elite iQ™

- The source content uses both names for laser hair removal equipment: "Elite+™ laser system" (general treatment description) and "Elite iQ™" (specifically for the Skintel™ melanin-reader-guided treatment).
- **Resolution applied**: not treated as interchangeable. `src/content/technologies.ts` registers `elite-iq` as the technology entry (matching the more specific, FAQ-referenced name), and `src/content/treatments.ts`'s laser-hair-removal FAQs use "Elite iQ™" consistently, matching the source's own FAQ section which uses that name exclusively when describing the Skintel-guided process. The general "Elite+" mention is treated as the equipment family name, Elite iQ as the specific configured device — both point at the same real technology, not two different pieces of equipment.

## Service locations — West Springs vs. Citizen Studio

- **Approved source**: "All Elite iQ™ treatments are exclusively performed at Citizen Studio, 45 Greenbriar Dr NW, Calgary, AB T3B 5N4" — a different address from the main clinic.
- **Resolution applied**: `src/config/site.ts` stores `eliteIQLocation` as a distinct, separately-named location object from `siteConfig.clinic`. `docs/CONTENT_APPROVAL_MATRIX.md` records this distinction. **Resolved and verified**: the laser-hair-removal treatment page now renders the approved Citizen Studio address inline (`AestheticTreatment.serviceLocationNote`, `AestheticTreatmentTemplate.tsx`) rather than implying West Springs — this was a real content-accuracy gap, found and fixed.

## Medical Botox insurance/compassionate-program coverage

- Source states coverage is "a combination of provincial health insurance and either patient private insurance or our compassionate program" for migraine, bruxism, and hyperhidrosis specifically — not a blanket guarantee, not extended to cosmetic Botox.
- **Resolution applied**: every mention of this on the site (Botox hub, homepage FAQ) uses the qualified phrasing from the source, never a bare "covered by insurance" claim, and explicitly states cosmetic Botox is not insured.

## SkinMedica catalogue — RESOLVED and LIVE (photography still placeholder)

- **Previously blocked on**: explicit brand/product approval (brief §18).
- **Resolution applied**: the client has approved the exact 23-product SkinMedica catalogue ("MANDATORY APPROVED SKINMEDICA CATALOGUE" pass). All 23 SKUs from the approved source (`Blue-Diamond-Medical-Website-Content-Extraction_1(4).docx`, source page bluediamondmedical.ca/products) are imported verbatim — exact names, prices, sizes, and "Factor" group counts (3/2/5/3/5/2/3 = 23) — into `src/content/products.ts`. Every product carries full original bilingual detail content (overview, what it is, routine placement, how to use, warnings, 6 product-specific FAQs each, per-fact sources) researched exclusively from the official manufacturer site and authorized Canadian retailers — never a competitor clinic's copy. Validated end-to-end by `tests/unit/skinmedica-catalogue.spec.ts` (24 assertions).
- **Naming corrections applied and documented** (client instruction: verify current official name, preserve approved price/size, document the mapping, never create a second product): "Total Defence" → "Total Defense + Repair SPF 34" (both Tinted and Clear), "TNS Advanced Plus Serum®" → "TNS® Advanced+ Serum", "HA5 Rejuvenative Hydrator" → "HA5® Rejuvenating Hydrator". Each recorded in the product's `detail.legacyNameNote` (bilingual) and in `docs/CONTENT_SOURCE_REGISTER.md`. Direct fetch of skinmedica.ca returned HTTP 403 on every attempt; verification instead used skinmedica.com (same manufacturer) plus Dermstore.com/dermshop.ca as corroborating Canadian-retailer sources — documented transparently rather than silently substituted.
- **Published live** ("COMPLETE SKINMEDICA NAVIGATION AND PRODUCT-DETAIL FLOW" pass): `shopEnabled` is now `true` — the full 23-product catalogue at `/en/shop`/`/ar/المتجر`, all 46 individual product pages (23 × 2 locales, `shop-product-<id>`, indexed, in sitemap, unique per-product metadata/canonical/hreflang), the homepage's 6-product preview, and the "Ask About This Product" enquiry flow (validated `?product=<slug>` query param → Contact page, product preselected) are all live, per the brief's explicit instruction to ship with the approved neutral Facet Tile placeholder rather than keep the whole catalogue gated on photography. Cart/checkout/shipping-returns stay gated behind a **separate** `shopCheckoutEnabled` flag (still `false`) — no real payment/cart/shipping exists or is implied anywhere.
- **Still blocked on**: product photography only. The approved image archive (`blue-diamond-original-site-images.zip`) contains clinic, treatment, and technology imagery, but no SkinMedica product/bottle photography. Every product renders through the FacetTile placeholder until real photography is supplied and imported — see `docs/IMAGEKIT_IMPORT_REPORT.md`/`docs/IMAGE_REPLACEMENT_MANIFEST.md`. Swapping in real photos needs no other code change.
- **Not carried over**: `concernIds` (acne, anti-aging, etc.) is left empty on every product — the approved catalogue groups products by "Factor" (organizational, not a clinical-suitability claim), not by skin concern, so populating concern-targeting would mean inventing an unapproved suitability claim rather than transcribing one. Add real approved concern-mapping later without a schema change, same pattern as the rest of this blocker list.
- **Scar Recovery Gel** (2 approved sizes, one underlying product): implemented as two independent product records/pages (`scar-recovery-gel-with-centelline-small`, `-large`) cross-linked via `variantOfId`, per the brief's explicitly sanctioned alternative to a single variant-selector page — no variant/option commerce model exists in the current data layer, and checkout stays disabled regardless.

## TempSure Vitalia prevalence statistic — "1 in 3" vs. "1 in 4"

- **Approved source** (DOCX, published on `treatment-tempsure-vitalia`): "roughly 1 in 3 women" experience the pelvic floor/sexual health concerns TempSure Vitalia addresses.
- **Legacy live site** (`bluediamondmedicalaesthetics.ca/vitalia`, confirmed by direct fetch during this pass's mandatory legacy-page crawl): "nearly 1 in 4 women."
- **Resolution applied**: kept the approved DOCX figure ("1 in 3") per the established source-priority order — not silently reconciled to the live site's different number, and not averaged/guessed. Flagged here since it's a real numeric discrepancy between the two sources, not a copy-editing variance.
- **Still needs client confirmation**: which figure is current/correct.

## `/vitalia` and `/ols/products` — discovered via live crawl, not in the original DOCX inventory

- Found this pass via a real `sitemap.xml`/`sitemap.website.xml`/`sitemap.blog.xml`/`sitemap.ols.xml` crawl of both legacy domains (brief §3's mandatory discovery step).
- `/vitalia` (aesthetics domain): real page, redirected to the existing `tempsure-vitalia` treatment page (same subject, not a duplicate) — see the statistic discrepancy above, found via this same fetch.
- `/ols/products` (aesthetics domain): a GoDaddy Website Builder auto-generated "Online Store" module page with generic platform SEO boilerplate, no unique editorial content found — redirected to `/en/shop` as the closest live equivalent rather than omitted.
- `/tempsure`, `/microneedling` (medical domain, both now redirected in `src/lib/seo/legacy-redirects.ts`) and 7 individual `/about-skinmedica-products/f/<slug>` product pages (all now redirected, 2 required fetching the live `<title>` to disambiguate an ambiguous "tinted" slug used for both the Clear and Tinted products) were also found this way and would otherwise have 404'd with no prior redirect entry at all.

## Aesthetics phone number

- The aesthetics section of the source uses `(403) 247-1418`, distinct from the main clinic's `825 413-1113`. Both are real, sourced numbers for genuinely different reception lines — not a conflict, but flagged here since it's easy to mistakenly "unify" them. `src/config/site.ts` keeps them as separate fields (`clinic.phone` vs. `aesthetics.phone`).
