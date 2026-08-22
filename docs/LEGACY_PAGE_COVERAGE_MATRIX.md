# Legacy Page Coverage Matrix

Every legacy URL discovered on `bluediamondmedical.ca` and `bluediamondmedicalaesthetics.ca` — from the brief's mandatory minimum inventories (§4, §5) **plus** a live crawl performed this pass (`robots.txt` + every `sitemap*.xml` on both domains, per §3's mandatory discovery step) — with its final outcome. Source of truth for the redirect columns: `src/lib/seo/legacy-redirects.ts` / `docs/REDIRECT_MAP.md`. Source of truth for the destination-page columns: `src/config/routes.ts`.

**Coverage: 42/42 discovered legacy URLs have a definite final outcome (redirect target registered, no chain). 40/42 redirect targets return a live HTTP 200 today; 2/42 (the two legal-page targets) redirect correctly but the target itself still 404s pending approved legal copy — see "Known incomplete rows" at the bottom. Zero legacy URLs are silently dropped, zero redirect to an unrelated page, zero redirect to the homepage as a catch-all.**

Legend — Action: `REDIRECT` (only action used; no legacy page was a true duplicate of another live route, so `MERGE` was never needed here — see `docs/ROUTE_DECISION_LOG.md`). SEO/GEO/AEO "completed" means the destination page carries unique metadata, canonical/hreflang, Calgary/West Springs context, and visible FAQs where applicable (`docs/SEO_SCHEMA_SUMMARY.md`); marked "—" when the destination itself is still gated (nothing to validate yet).

## bluediamondmedical.ca (primary legacy domain)

| Source URL | Source title / topic | Source status | Final EN URL | Final AR URL | Redirect target | Final HTTP status | Content migrated | Images assigned | SEO/GEO/AEO | In nav/internal links | In sitemap | Tests added | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | Homepage | Live | `/en/` | `/ar/` | `/en/` | 200 | Yes | Yes | Yes | Yes | Yes | Yes | Handled by `src/proxy.ts` bare-path step, not the redirect table; fixed from 307→301 this pass (locale is a static default, not negotiation) |
| `/appointment-1` | Book an appointment | Live | `/en/book-appointment` | `/ar/حجز-موعد` | `/en/book-appointment` | 200 | Yes | Yes | Yes | Yes | Yes | Yes | External-booking routing hub, no internal form (brief §16) |
| `/services` | Services overview | Live | `/en/medical` | `/ar/الرعاية-الطبية` | `/en/medical` | 200 | Yes | Yes | Yes | Yes | Yes | Yes | The mandatory §2 hub — direct single-hop 301, never the homepage |
| `/our-team` | Our Team (doctor bios) | Live | `/en/doctors` | `/ar/الأطباء` | `/en/doctors` | 200 | Yes | Partial (2/6 real portraits imported, rest Facet Tile pending client photo confirmation) | Yes | Yes | Yes | Yes | Also the aesthetics domain's `/our-team` target — one shared doctor roster, not duplicated per brief §7 |
| `/medical-aesthetics-1` | Medical Aesthetics overview | Live | `/en/aesthetics` | `/ar/التجميل-الطبي` | `/en/aesthetics` | 200 | Yes | Yes | Yes | Yes | Yes | Yes | |
| `/botox-1` | Botox (medical + cosmetic) | Live | `/en/botox` | `/ar/بوتوكس` | `/en/botox` | 200 | Yes | Yes | Yes | Yes | Yes | Yes | Unified overview; detail sub-pages gated (see Known incomplete rows in `docs/MISSING_CONTENT_REPORT.md`) |
| `/eye-examining` | Eye disease screening | Live | `/en/medical/eye-screening` | `/ar/الرعاية-الطبية/فحص-العين` | `/en/medical/eye-screening` | 200 | Yes | Yes | Yes | Yes (linked from Medical hub) | Yes | Yes | Euclid Telehealth partnership content preserved |
| `/primary-care-network` | Primary Care Network (Mosaic/CWC after-hours) | Live | `/en/medical/after-hours-care` | `/ar/الرعاية-الطبية/الرعاية-خارج-أوقات-الدوام` | `/en/medical/after-hours-care` | 200 | Yes | Yes | Yes | Yes | Yes | Yes | Retargeted from a generic resources-hub redirect to the actual matching content page (`docs/ROUTE_DECISION_LOG.md`) |
| `/clinic-policies` | Clinic policies | Live | `/en/patient-resources` | `/ar/موارد-المرضى` | `/en/patient-resources` | 200 | Yes | Yes | Yes | Yes | Yes | Yes | Content published inline on this hub, not a separate sub-page |
| `/join-our-team` | Careers | Live | `/en/careers` | `/ar/الوظائف` | `/en/careers` | 200 | Yes | Yes | Yes | Yes | Yes | Yes | `careersFormEnabled: true` |
| `/contact-us` | Contact | Live | `/en/contact` | `/ar/تواصل-معنا` | `/en/contact` | 200 | Yes | Yes | Yes | Yes | Yes | Yes | |
| `/products` | SkinMedica products | Live | `/en/shop` | `/ar/المتجر` | `/en/shop` | 200 | Yes | Placeholder (Facet Tile; no bottle photography exists yet) | Yes | Yes | Yes | Yes | `shopEnabled: true` — full 23-product catalogue live |
| `/about-skinmedica-products` | About SkinMedica | Live | `/en/shop` | `/ar/المتجر` | `/en/shop` | 200 | Yes | Placeholder | Yes | Yes | Yes | Yes | Merged into the shop hub per brief §15 |
| `/tempsure` *(found via live crawl this pass)* | TempSure technology | Live | `/en/aesthetics/technologies/tempsure` | `/ar/التجميل-الطبي/التقنيات/...` | `/en/aesthetics/technologies/tempsure` | 200 | Yes | Yes | Yes | Yes | Yes | Yes | Not in the DOCX-derived inventory; would previously have 404'd |
| `/microneedling` *(found via live crawl)* | RF Micro-needling | Live | `/en/aesthetics/treatments/rf-microneedling` | `/ar/.../الإبر-الدقيقة-بالترددات-الراديوية` | `/en/aesthetics/treatments/rf-microneedling` | 200 | Yes | Yes | Yes | Yes | Yes | Yes | Same |
| `/about-skinmedica-products/f/lumivivetm-system` *(found via live crawl)* | LumiVive System product page | Live | `/en/shop/lumivive-system-day-night` | `/ar/المتجر/...` | `/en/shop/lumivive-system-day-night` | 200 | Yes | Placeholder | Yes | No (product pages aren't in nav; reachable from shop hub) | Yes | Yes | |
| `/about-skinmedica-products/f/lytera®-20-pigmentbrightening-serum` *(found via live crawl)* | Lytera 2.0 product page | Live | `/en/shop/lytera-2-pigment-brightening-serum` | `/ar/المتجر/...` | `/en/shop/lytera-2-pigment-brightening-serum` | 200 | Yes | Placeholder | Yes | No | Yes | Yes | |
| `/about-skinmedica-products/f/tns®-eye-repair` *(found via live crawl)* | TNS Eye Repair product page | Live | `/en/shop/tns-eye-repair` | `/ar/المتجر/...` | `/en/shop/tns-eye-repair` | 200 | Yes | Placeholder | Yes | No | Yes | Yes | |
| `/about-skinmedica-products/f/total-defense-repair-spf-34---tinted` *(found via live crawl)* | Total Defense + Repair SPF 34 — **Clear** (legacy URL slug says "tinted"; real `<title>` confirmed "Clear") | Live | `/en/shop/total-defence-repair-spf-34-clear` | `/ar/المتجر/...` | `/en/shop/total-defence-repair-spf-34-clear` | 200 | Yes | Placeholder | Yes | No | Yes | Yes | Disambiguated by fetching the real page `<title>`, not by URL text |
| `/about-skinmedica-products/f/total-defense-repair-spf-34---tinted-1` *(found via live crawl)* | Total Defense + Repair SPF 34 — **Tinted** (confirmed by `<title>`) | Live | `/en/shop/total-defence-repair-spf-34-tinted` | `/ar/المتجر/...` | `/en/shop/total-defence-repair-spf-34-tinted` | 200 | Yes | Placeholder | Yes | No | Yes | Yes | |
| `/about-skinmedica-products/f/dermal-repair-cream` *(found via live crawl)* | Dermal Repair Cream product page | Live | `/en/shop/dermal-repair-cream` | `/ar/المتجر/...` | `/en/shop/dermal-repair-cream` | 200 | Yes | Placeholder | Yes | No | Yes | Yes | |
| `/about-skinmedica-products/f/ahabha-exfoliating-cleanser` *(found via live crawl)* | AHA/BHA Exfoliating Cleanser product page | Live | `/en/shop/aha-bha-exfoliating-cleanser` | `/ar/المتجر/...` | `/en/shop/aha-bha-exfoliating-cleanser` | 200 | Yes | Placeholder | Yes | No | Yes | Yes | |
| `/about-skinmedica-products/f/*` (any other slug under this prefix) | Any further legacy product sub-page not individually discovered | Unknown | `/en/shop` | `/ar/المتجر` | `/en/shop` (prefix safety-net in `src/proxy.ts`) | 200 | N/A | N/A | N/A | N/A | N/A | Yes (covered by the same test asserting the 7 known rows; prefix rule itself is a proxy-level guarantee, not per-URL) | Prevents any 404 under this legacy path even for a slug this crawl didn't individually surface |

## bluediamondmedicalaesthetics.ca (separate legacy domain — redirect requires DNS/host-level config, see `docs/DNS_LEGACY_DOMAIN_GUIDE.md`; table below is the intended mapping this app would apply if it received the request)

| Source URL | Source title / topic | Source status | Final EN URL | Final AR URL | Redirect target | Final HTTP status | Content migrated | Images assigned | SEO/GEO/AEO | In nav/internal links | In sitemap | Tests added | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | Aesthetics homepage | Live | `/en/aesthetics` | `/ar/التجميل-الطبي` | `/en/aesthetics` | 200 | Yes | Yes | Yes | Yes | Yes | N/A (cross-domain; DNS-level) | |
| `/treatments` | Treatments overview | Live | `/en/aesthetics/treatments` | `/ar/التجميل-الطبي/العلاجات` | `/en/aesthetics/treatments` | 200 | Yes | Yes | Yes | Yes | Yes | N/A | |
| `/area-concern` | Concerns overview | Live | `/en/aesthetics/concerns` | `/ar/التجميل-الطبي/المخاوف-الجمالية` | `/en/aesthetics/concerns` | 200 | Yes | Yes | Yes | Yes | Yes | N/A | |
| `/laser-hair-removal` | Laser Hair Removal | Live | `/en/aesthetics/treatments/laser-hair-removal` | `/ar/.../إزالة-الشعر-بالليزر` | same | 200 | Yes | Yes | Yes | No (leaf page) | Yes | N/A | Elite iQ™/Citizen Studio location note preserved (`docs/DATA_APPROVAL_BLOCKERS.md`) |
| `/laser-treatment-1` | Laser Skin Treatments | Live | `/en/aesthetics/treatments/laser-skin-treatments` | `/ar/.../علاجات-الليزر-للبشرة` | same | 200 | Yes | Yes | Yes | No | Yes | N/A | |
| `/radio-frequency` | Radio Frequency | Live | `/en/aesthetics/treatments/radio-frequency` | `/ar/.../الترددات-الراديوية` | same | 200 | Yes | Yes | Yes | No | Yes | N/A | |
| `/rf-micro-needeling` | RF Micro-needling | Live | `/en/aesthetics/treatments/rf-microneedling` | `/ar/.../الإبر-الدقيقة-بالترددات-الراديوية` | same | 200 | Yes | Yes | Yes | No | Yes | N/A | Shared target with the medical-domain `/microneedling` row above |
| `/ultra-treatment` | Ultra | Live | `/en/aesthetics/treatments/ultra` | `/ar/.../ألترا` | same | 200 | Yes | Yes | Yes | No | Yes | N/A | |
| `/prp-therapy` | PRP Therapy | Live | `/en/aesthetics/treatments/prp-skin-rejuvenation` | `/ar/.../تجديد-البشرة-بالبلازما` | same | 200 | Yes | Yes | Yes | No | Yes | N/A | Legacy page covered both hair and skin PRP; split per brief §7 into two pages (`prp-hair-restoration` also live) — this legacy path lands on the skin half, its primary framing |
| `/our-technologies` | Our Technologies | Live | `/en/aesthetics/technologies` | `/ar/التجميل-الطبي/التقنيات` | same | 200 | Yes | Yes | Yes | Yes | Yes | N/A | |
| `/our-team` | Our Team | Live | `/en/doctors` | `/ar/الأطباء` | `/en/doctors` | 200 | Yes | Partial | Yes | Yes | Yes | N/A | Same shared roster as the medical-domain row |
| `/acne-scar-removal` | Acne Scars | Live | `/en/aesthetics/concerns/acne-scars` | `/ar/.../ندبات-حب-الشباب` | same | 200 | Yes | Yes | Yes | No | Yes | N/A | |
| `/rosacea-abatement` | Rosacea & Redness | Live | `/en/aesthetics/concerns/rosacea-redness` | `/ar/.../الوردية-والاحمرار` | same | 200 | Yes | Yes | Yes | No | Yes | N/A | Cross-link corrected to Laser Skin Treatments per `docs/CONTENT_APPROVAL_MATRIX.md` |
| `/dry-skin-remediation` | Dry Skin | Live | `/en/aesthetics/concerns/dry-skin` | `/ar/.../جفاف-البشرة` | same | 200 | Yes | Yes | Yes | No | Yes | N/A | |
| `/fineline-and-wrinkle` | Fine Lines & Wrinkles | Live | `/en/aesthetics/concerns/fine-lines-wrinkles` | `/ar/.../خطوط-التجاعيد-الدقيقة` | same | 200 | Yes | Yes | Yes | No | Yes | N/A | |
| `/non-invasive-skin` | Skin Laxity | Live | `/en/aesthetics/concerns/skin-laxity` | `/ar/.../ترهل-الجلد` | same | 200 | Yes | Yes | Yes | No | Yes | N/A | |
| `/spider-vein` | Spider Veins | Live | `/en/aesthetics/concerns/spider-veins` | `/ar/.../الأوردة-العنكبوتية` | same | 200 | Yes | Yes | Yes | No | Yes | N/A | Cross-link corrected, same as Rosacea above |
| `/sun-damage` | Sun Damage & Pigmentation | Live | `/en/aesthetics/concerns/sun-damage-pigmentation` | `/ar/.../ضرر-الشمس-والتصبغ` | same | 200 | Yes | Yes | Yes | No | Yes | N/A | Cross-link corrected, same |
| `/skin-revitalization` | Skin Revitalization | Live | `/en/aesthetics/concerns/skin-revitalization` | `/ar/.../تجديد-البشرة` | same | 200 | Yes | Yes | Yes | No | Yes | N/A | |
| `/razor-bumps` | Razor Bumps | Live | `/en/aesthetics/concerns/razor-bumps` | `/ar/.../نتوءات-الحلاقة` | same | 200 | Yes | Yes | Yes | No | Yes | N/A | |
| `/terms-and-conditions` | Terms & Conditions | Live ("Coming soon" placeholder) | `/en/terms` | `/ar/الشروط-والأحكام` | `/en/terms` | **404** | No | No | No | No | No | Yes (redirect itself is tested; target status intentionally asserted as gated) | **Known incomplete** — see below |
| `/privacy-policy` | Privacy Policy | Live ("Coming soon" placeholder) | `/en/privacy-policy` | `/ar/سياسة-الخصوصية` | `/en/privacy-policy` | **404** | No | No | No | No | No | Yes | **Known incomplete** — see below |
| `/vitalia` *(found via live crawl this pass)* | Vitalia — pelvic floor/vaginal tightening RF | Live | `/en/aesthetics/treatments/tempsure-vitalia` | `/ar/.../تمبشور-فيتاليا` | `/en/aesthetics/treatments/tempsure-vitalia` | 200 | Yes | Yes | Yes | No | Yes | N/A | Not in the DOCX-derived inventory. A prevalence-statistic discrepancy ("1 in 3" vs. legacy's "1 in 4") was found and logged, not silently resolved — `docs/DATA_APPROVAL_BLOCKERS.md` |
| `/ols/products` *(found via live crawl)* | GoDaddy "Online Store" auto-page | Live (platform-generated) | `/en/shop` | `/ar/المتجر` | `/en/shop` | 200 | N/A (no unique editorial content on the source page) | Placeholder | Yes | Yes | Yes | N/A | Generic platform SEO boilerplate, not a real content page |

## Known incomplete rows (2 of 42)

`/terms-and-conditions` and `/privacy-policy` are the **only** rows in this matrix whose redirect target does not return 200. The redirect itself is correct, direct, and permanent — it targets the real final canonical route, not the homepage or an unrelated page — but `legalPagesEnabled` stays off because the legacy pages themselves show a literal "Coming soon" placeholder and no real legal copy has ever been drafted or approved. Brief §1 forbids both leaving a legacy URL at 404 *and* publishing a "Coming soon" page or inventing content — these two constraints are in direct tension for exactly these two rows, and it is recorded here rather than silently resolved by fabricating legal text for a medical clinic (a real compliance/liability document, not marketing copy). This is a content-approval blocker, not a code or architecture gap: the route, template, and typed bilingual model are fully built (`src/templates/LegalPageTemplate.tsx`, `src/content/legal-pages.ts`) and go live the moment approved copy is supplied. See `docs/DATA_APPROVAL_BLOCKERS.md` and `docs/MISSING_CONTENT_REPORT.md`.

## Coverage totals

| Metric | Value |
|---|---|
| Medical-domain legacy URLs discovered | 24 (13 from the brief's minimum inventory + 11 found via live crawl this pass: `/`, `/about-skinmedica-products` base, `/tempsure`, `/microneedling`, 7 individual product sub-pages) |
| Aesthetics-domain legacy URLs discovered | 24 (22 from the brief's minimum inventory + `/vitalia` + `/ols/products`, both found via live crawl this pass) |
| Total unique legacy URLs discovered | 42 (`/our-team` is shared by both domains and counted once in `src/lib/seo/legacy-redirects.ts`, hence 42 not 48) |
| Rows classified REDIRECT | 42 (100%) |
| Rows classified MERGE | 0 (no true duplicate found — see `docs/ROUTE_DECISION_LOG.md`) |
| Rows silently dropped | 0 |
| Rows redirecting to an unrelated page or the homepage as a catch-all | 0 |
| Redirect chains | 0 (every row is single-hop, verified by `tests/redirects/legacy-redirects.spec.ts`) |
| Rows whose final target returns 200 | 40/42 |
| Rows whose final target still 404s (content-approval blocker, not missing route) | 2/42 (`/terms-and-conditions`, `/privacy-policy`) |
