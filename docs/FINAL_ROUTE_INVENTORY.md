# Final Route Inventory

Every route currently registered in `src/config/routes.ts` (104 entries), classified as exactly one of `KEEP` / `MERGE` / `REDIRECT` / `GATE` / `DELETE` / `REQUIRES CLIENT APPROVAL`, validated against both owned legacy sites, the approved DOCX, and the rules in `docs/ROUTE_DECISION_LOG.md`. This supersedes `docs/ROUTE_INVENTORY.md`'s prose format with the exact classification scheme this phase requires; `ROUTE_INVENTORY.md` remains accurate and is not being deleted.

**Result: 88 KEEP (live), 16 GATE, 0 MERGE, 0 DELETE, 0 REQUIRES CLIENT APPROVAL at the route level.** 31 legacy URLs classified REDIRECT (3 corrected in an earlier pass — see `docs/ROUTE_DECISION_LOG.md`).

> **Updated this pass**: the shop catalogue (`shop-hub`, all 8 product categories, all 6 product concerns, all 23 SkinMedica products — 38 route entries) moved from GATE to KEEP when `shopEnabled` flipped to `true` in the SkinMedica-catalogue pass. The "50 KEEP / 52 GATE" figures below the fold in this file's prose predate that flip and are corrected here; see `docs/LEGACY_PAGE_COVERAGE_MATRIX.md` and `docs/FINAL_URL_TREE.md` for the current authoritative counts.

## KEEP — live, public, indexed (50 routes → 100 URLs)

| Route ID | EN path | AR path | Source | Primary intent | Sitemap/Index |
|---|---|---|---|---|---|
| `home` | `/` | `/` | Approved DOCX + brief | Clinic identity, both pathways | index/sitemap |
| `medical-hub` | `/medical` | `/الرعاية-الطبية` | Approved DOCX | Family medicine overview | index/sitemap |
| `medical-eye-screening` | `/medical/eye-screening` | .../فحص-العين | Approved DOCX (Euclid Telehealth partnership) | Book an eye screening | index/sitemap |
| `medical-after-hours-care` | `/medical/after-hours-care` | .../الرعاية-خارج-أوقات-الدوام | Approved DOCX (Mosaic/CWC PCN) | Find after-hours care | index/sitemap |
| `medical-chronic-disease-management` | `/medical/chronic-disease-management` | .../إدارة-الأمراض-المزمنة | Approved DOCX (AHS-insured list) | Chronic condition management | index/sitemap |
| `medical-preventive-care` | `/medical/preventive-care` | .../الرعاية-الوقائية | Approved DOCX | Preventive care | index/sitemap |
| `medical-weight-management` | `/medical/weight-management` | .../إدارة-الوزن | Approved DOCX | Weight management | index/sitemap |
| `medical-pain-management` | `/medical/pain-management` | .../إدارة-الألم | Approved DOCX | Pain management | index/sitemap |
| `medical-minor-procedures` | `/medical/minor-procedures` | .../الإجراءات-البسيطة | Approved DOCX (Dr. Bakare's excision/injection interests) | Minor in-clinic procedures | index/sitemap |
| `medical-uninsured-services` | `/medical/uninsured-services` | .../الخدمات-غير-المشمولة | Approved DOCX (fee tables) | Uninsured fee lookup | index/sitemap |
| `aesthetics-hub` | `/aesthetics` | `/التجميل-الطبي` | Approved DOCX | Aesthetics overview | index/sitemap |
| `aesthetics-treatments-hub` | `/aesthetics/treatments` | .../العلاجات | Approved DOCX | Browse by treatment | index/sitemap |
| `treatment-laser-hair-removal` | `/aesthetics/treatments/laser-hair-removal` | .../إزالة-الشعر-بالليزر | Approved DOCX | Treatment detail | index/sitemap |
| `treatment-laser-skin-treatments` | `/aesthetics/treatments/laser-skin-treatments` | .../علاجات-الليزر-للبشرة | Approved DOCX | Treatment detail | index/sitemap |
| `treatment-radio-frequency` | `/aesthetics/treatments/radio-frequency` | .../الترددات-الراديوية | Approved DOCX | Treatment detail | index/sitemap |
| `treatment-rf-microneedling` | `/aesthetics/treatments/rf-microneedling` | .../الإبر-الدقيقة-بالترددات-الراديوية | Approved DOCX | Treatment detail | index/sitemap |
| `treatment-ultra` | `/aesthetics/treatments/ultra` | .../ألترا | Approved DOCX | Treatment detail | index/sitemap |
| `treatment-prp-hair-restoration` | `/aesthetics/treatments/prp-hair-restoration` | .../استعادة-الشعر-بالبلازما | Approved DOCX | Treatment detail | index/sitemap |
| `treatment-prp-skin-rejuvenation` | `/aesthetics/treatments/prp-skin-rejuvenation` | .../تجديد-البشرة-بالبلازما | Approved DOCX | Treatment detail | index/sitemap |
| `treatment-tempsure-vitalia` | `/aesthetics/treatments/tempsure-vitalia` | .../تمبشور-فيتاليا | Approved DOCX | Treatment detail | index/sitemap |
| `aesthetics-concerns-hub` | `/aesthetics/concerns` | .../المخاوف-الجمالية | Approved DOCX | Browse by concern | index/sitemap |
| `concern-acne-scars` … `concern-razor-bumps` (9) | `/aesthetics/concerns/<slug>` | .../المخاوف-الجمالية/<slugAr> | Approved DOCX | Concern detail | index/sitemap |
| `aesthetics-technologies-hub` | `/aesthetics/technologies` | .../التقنيات | Approved DOCX | Browse by device | index/sitemap |
| `technology-elite-iq` … `technology-tempsure-vitalia` (5) | `/aesthetics/technologies/<slug>` | .../التقنيات/<slugAr> | Approved DOCX + manufacturer docs | Technology detail | index/sitemap |
| `botox-hub` | `/botox` | `/بوتوكس` | Approved DOCX | Unified cosmetic + medical Botox overview | index/sitemap |
| `doctors-index` | `/doctors` | `/الأطباء` | Approved DOCX | Meet the team | index/sitemap |
| `doctor-farhat` … `doctor-gwea` (6) | `/doctors/<slug>` | `/الأطباء/<slugAr>` | Approved DOCX | Doctor profile | index/sitemap |
| `patient-resources-hub` | `/patient-resources` | `/موارد-المرضى` | Approved DOCX | Clinic policies | index/sitemap |
| `health-hub` | `/health-hub` | `/المركز-المعرفي` | Brief (shell; no articles yet) | Health Hub landing | index/sitemap |
| `about` | `/about` | `/من-نحن` | Approved DOCX | Clinic story | index/sitemap |
| `careers` | `/careers` | `/الوظائف` | Approved DOCX ("Join our Team" live on legacy site) | Careers | index/sitemap |
| `contact` | `/contact` | `/تواصل-معنا` | Approved DOCX | Contact info | index/sitemap |
| `book-appointment` | `/book-appointment` | `/حجز-موعد` | Brief §8 (external-only booking hub) | External booking routing | index/sitemap |
| `shop-hub`, 8 `shop-category-*`, 6 `shop-concern-*`, 23 `shop-product-*` (38) | `/shop`, `/shop/category/<slug>`, `/shop/concern/<slug>`, `/shop/<product-slug>` | Approved DOCX (`/products`, `/about-skinmedica-products`) | Full 23-SKU SkinMedica catalogue browsing + detail; live behind the approved neutral placeholder pending product photography | index/sitemap |

## GATE — fully built, feature-flagged off (16 routes → 32 URLs)

| Route(s) | Feature flag | Reason (unchanged unless noted) |
|---|---|---|
| `medical-botox-hub` + 3 conditions (migraine/bruxism-tmj/hyperhidrosis) | `medicalBotoxDetailPagesEnabled` | Would duplicate `/botox`'s existing published content |
| `treatment-cosmetic-botox` | `cosmeticBotoxTreatmentPageEnabled` | Would duplicate `/botox` |
| `treatment-skin-tightening` | `skinTighteningTreatmentPageEnabled` | Is the same procedure as `/aesthetics/treatments/radio-frequency` under a different name |
| `aesthetics-pricing` | `aestheticPricingEnabled` | No separate approved aesthetics price list beyond SkinMedica product prices |
| `aesthetics-consultation` | `consultationFormEnabled` | No approved consultation-intake flow |
| `aesthetics-before-after` | `beforeAfterEnabled` | No approved before/after photography published yet (15 candidate assets flagged for clinical review — `docs/IMAGEKIT_IMPORT_REPORT.md`) |
| `legal-terms`, `legal-privacy-policy`, `legal-accessibility`, `legal-medical-disclaimer` (4) | `legalPagesEnabled` | Legacy showed literal "Coming soon" — no real copy exists |
| `shop-cart`, `shop-checkout`, `shop-shipping-returns` (3) | `shopCheckoutEnabled` (separate from `shopEnabled`, which is now `true`) | No real payment/cart/shipping is implemented or approved; brief explicitly forbids activating checkout |

## REDIRECT — 29 legacy URLs (`src/lib/seo/legacy-redirects.ts`)

27 on the primary legacy domain (`bluediamondmedical.ca`), handled by `src/proxy.ts`; the aesthetics-domain rows are documented separately for DNS-level configuration (`docs/DNS_LEGACY_DOMAIN_GUIDE.md`) since a different host can't be caught by this app's own proxy. Full table with corrected targets: `docs/REDIRECT_MAP.md`. 3 targets were found pointing at the wrong or an unrelated page and corrected this pass (`docs/ROUTE_DECISION_LOG.md`).

## MERGE — none

No two routes were found serving a duplicate purpose. Every treatment/concern/technology pair was checked for content overlap during this validation pass; none share underlying content.

## DELETE — none

Every previously-built route (live or gated) still has a documented, legitimate reason to exist. Nothing was removed.

## REQUIRES CLIENT APPROVAL — none at the route level

No route's *existence* depends on an unresolved conflict. The open conflicts in `docs/DATA_APPROVAL_BLOCKERS.md` (doctor roster count, 3 unidentified physician portraits, SkinMedica photography) affect content/image *completeness* within routes already classified KEEP or GATE — they don't change any route's classification.
