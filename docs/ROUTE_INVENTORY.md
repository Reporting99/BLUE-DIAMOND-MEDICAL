# Route Inventory

Single source of truth is `src/config/routes.ts` — this document mirrors it in prose. Do not hand-edit route paths here; edit the registry (or the content file it's generated from) and regenerate this table.

**104 route entries are registered** (81 + 23 `shop-product-*` entries, one per client-approved SkinMedica product — see `docs/DATA_APPROVAL_BLOCKERS.md`). Every one of them has a real page file, a typed bilingual content model, and a reusable template — there is no "planned but not built" category left. 50 entries are live and public (unchanged — sitemap.xml verified at exactly 100 URLs); 54 are fully built but feature-flagged off pending approved content, credentials, or a business decision (see "Gated" below and `docs/MISSING_CONTENT_REPORT.md` for the reason behind each).

## Live and public (50 route entries → 100 URLs, verified in `sitemap.xml`)

| Route ID | EN path | AR path | Template | In nav |
|---|---|---|---|---|
| `home` | `/` | `/` | homepage | — |
| `medical-hub` | `/medical` | `/الرعاية-الطبية` | hub | ✅ |
| `medical-eye-screening`, `medical-after-hours-care`, `medical-chronic-disease-management`, `medical-preventive-care`, `medical-weight-management`, `medical-pain-management`, `medical-minor-procedures` (×7) | `/medical/<slug>` | `/الرعاية-الطبية/<slug>` | medical-service | — |
| `medical-uninsured-services` | `/medical/uninsured-services` | `/الرعاية-الطبية/الخدمات-غير-المشمولة` | pricing | — |
| `aesthetics-hub` | `/aesthetics` | `/التجميل-الطبي` | hub | ✅ |
| `aesthetics-treatments-hub` + 8 treatments | `/aesthetics/treatments[/<slug>]` | `/التجميل-الطبي/العلاجات[/<slug>]` | hub + aesthetic-treatment | — |
| `aesthetics-concerns-hub` + 9 concerns | `/aesthetics/concerns[/<slug>]` | `/التجميل-الطبي/المخاوف-الجمالية[/<slug>]` | hub + concern | — |
| `aesthetics-technologies-hub` + 5 technologies | `/aesthetics/technologies[/<slug>]` | `/التجميل-الطبي/التقنيات[/<slug>]` | hub + technology | — |
| `botox-hub` | `/botox` | `/بوتوكس` | hub | ✅ |
| `doctors-index` + 6 doctors | `/doctors[/<slug>]` | `/الأطباء[/<slug>]` | hub + doctor-profile | ✅ (index only) |
| `patient-resources-hub` | `/patient-resources` | `/موارد-المرضى` | hub | ✅ |
| `health-hub` | `/health-hub` | `/المركز-المعرفي` | hub | ✅ |
| `about` | `/about` | `/من-نحن` | static | ✅ |
| `careers` | `/careers` | `/الوظائف` | static | — |
| `contact` | `/contact` | `/تواصل-معنا` | contact | ✅ |
| `book-appointment` | `/book-appointment` | `/حجز-موعد` | booking-hub | ✅ |

Exact per-route slugs for the 22 aesthetics leaf pages live in `src/content/treatments.ts`, `src/content/concerns.ts`, `src/content/technologies.ts` — the route registry generates from those files directly, so they're treated as the source of truth rather than duplicated here.

## Gated — fully built, feature-flagged off (52 route entries → 104 URLs)

None of these appear in the sitemap, main navigation, or search results, and every one of them returns a real 404 (verified in `tests/e2e/gated-routes.spec.ts`) — not an empty page, not a redirect, not a "Coming soon" placeholder.

| Route(s) | Feature flag | Why it's off |
|---|---|---|
| `medical-botox-hub` + migraine/bruxism-tmj/hyperhidrosis (4) | `medicalBotoxDetailPagesEnabled` | Would duplicate content already published on `/botox` |
| `treatment-cosmetic-botox` | `cosmeticBotoxTreatmentPageEnabled` | Would duplicate `/botox`'s existing content |
| `treatment-skin-tightening` | `skinTighteningTreatmentPageEnabled` | Would duplicate `/aesthetics/treatments/radio-frequency` |
| `aesthetics-pricing` | `aestheticPricingEnabled` | No approved aesthetics prices supplied |
| `aesthetics-consultation` | `consultationFormEnabled` | No approved consultation-intake flow supplied |
| `aesthetics-before-after` | `beforeAfterEnabled` | No approved before/after photography |
| `legal-terms`, `legal-privacy-policy`, `legal-accessibility`, `legal-medical-disclaimer` (4) | `legalPagesEnabled` | No approved legal copy (legacy showed literal "Coming soon") |
| `shop-hub`, 8 category, 6 concern, 23 `shop-product-*` (all client-approved SkinMedica products, full bilingual detail content), cart, checkout, shipping-returns (41) | `shopEnabled` | Product data and content are approved, imported, and validated (`src/content/products.ts`, `tests/unit/skinmedica-catalogue.spec.ts`); the remaining blocker is product photography — see `docs/IMAGEKIT_IMPORT_REPORT.md` |

`/health-hub/[articleId]` is a 19th fully-built-but-empty case that isn't in the table above because it has no flag at all — it's gated purely by having zero entries in `src/content/health-hub-articles.ts`, so `generateStaticParams` returns nothing and any slug 404s. Same underlying pattern (route + type + template exist, no content), no feature flag needed since there's nothing to toggle.

## Verification

- `tests/e2e/gated-routes.spec.ts` — every gated path 404s; sitemap and nav both omit them.
- `tests/seo/seo-validators.spec.ts` — asserts by construction that every route with `requiresFeature` set has `indexing: "noindex"` and `inSitemap: false` in the registry, not just that today's flag values happen to hide it.
