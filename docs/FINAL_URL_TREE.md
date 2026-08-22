# Final URL Tree

Generated from `src/config/routes.ts` + `src/config/features.ts` (source of truth — regenerate this file by hand whenever either changes). Every route entry produces exactly two URLs (English + Arabic); only English paths are shown below for readability, with the Arabic path pattern noted once per section. **88 live route entries → 176 public URLs. 16 gated route entries → 32 non-public URLs (built, not indexed, not linked, not in the sitemap — see `docs/MISSING_CONTENT_REPORT.md`).**

Arabic paths mirror the English tree 1:1 under `/ar/` using the meaningful Arabic slugs registered in `src/config/routes.ts` (e.g. `/en/medical` ↔ `/ar/الرعاية-الطبية`, `/en/doctors/mohamed-farhat` ↔ `/ar/الأطباء/محمد-فرحات`) — see `docs/EN_AR_ROUTE_MAPPING.md` for the full pairing table.

```
/en/                                                          LIVE — home
/en/medical/                                                  LIVE — Medical Care hub (brief §2 mandatory)
├─ /en/medical/eye-screening/                                 LIVE
├─ /en/medical/after-hours-care/                               LIVE
├─ /en/medical/chronic-disease-management/                     LIVE
├─ /en/medical/preventive-care/                                LIVE
├─ /en/medical/weight-management/                               LIVE
├─ /en/medical/pain-management/                                 LIVE
├─ /en/medical/minor-procedures/                                 LIVE
├─ /en/medical/uninsured-services/                               LIVE — brief §2 mandatory
├─ /en/medical/botox/                                            GATED (medicalBotoxDetailPagesEnabled)
│  ├─ /en/medical/botox/migraine/                                GATED
│  ├─ /en/medical/botox/bruxism-tmj/                             GATED
│  └─ /en/medical/botox/hyperhidrosis/                           GATED
/en/aesthetics/                                                LIVE — Medical Aesthetics hub
├─ /en/aesthetics/treatments/                                   LIVE
│  ├─ /en/aesthetics/treatments/laser-hair-removal/              LIVE
│  ├─ /en/aesthetics/treatments/laser-skin-treatments/            LIVE
│  ├─ /en/aesthetics/treatments/radio-frequency/                  LIVE
│  ├─ /en/aesthetics/treatments/rf-microneedling/                 LIVE
│  ├─ /en/aesthetics/treatments/ultra/                            LIVE
│  ├─ /en/aesthetics/treatments/prp-hair-restoration/              LIVE
│  ├─ /en/aesthetics/treatments/prp-skin-rejuvenation/              LIVE
│  ├─ /en/aesthetics/treatments/tempsure-vitalia/                   LIVE
│  ├─ /en/aesthetics/treatments/cosmetic-botox/                     GATED (cosmeticBotoxTreatmentPageEnabled)
│  └─ /en/aesthetics/treatments/skin-tightening/                    GATED (skinTighteningTreatmentPageEnabled)
├─ /en/aesthetics/concerns/                                     LIVE
│  ├─ /en/aesthetics/concerns/acne-scars/                         LIVE
│  ├─ /en/aesthetics/concerns/rosacea-redness/                    LIVE
│  ├─ /en/aesthetics/concerns/dry-skin/                            LIVE
│  ├─ /en/aesthetics/concerns/fine-lines-wrinkles/                 LIVE
│  ├─ /en/aesthetics/concerns/skin-laxity/                         LIVE
│  ├─ /en/aesthetics/concerns/spider-veins/                        LIVE
│  ├─ /en/aesthetics/concerns/sun-damage-pigmentation/              LIVE
│  ├─ /en/aesthetics/concerns/skin-revitalization/                  LIVE
│  └─ /en/aesthetics/concerns/razor-bumps/                          LIVE
├─ /en/aesthetics/technologies/                                 LIVE
│  ├─ /en/aesthetics/technologies/elite-iq/                        LIVE
│  ├─ /en/aesthetics/technologies/potenza/                         LIVE
│  ├─ /en/aesthetics/technologies/tempsure/                        LIVE
│  ├─ /en/aesthetics/technologies/ultra/                           LIVE
│  └─ /en/aesthetics/technologies/tempsure-vitalia/                LIVE
├─ /en/aesthetics/pricing/                                      GATED (aestheticPricingEnabled)
├─ /en/aesthetics/consultation/                                 GATED (consultationFormEnabled)
└─ /en/aesthetics/before-after/                                 GATED (beforeAfterEnabled)
/en/botox/                                                      LIVE — unified medical + cosmetic overview
/en/doctors/                                                     LIVE
├─ /en/doctors/mohamed-farhat/                                    LIVE
├─ /en/doctors/omaima-saeed/                                       LIVE
├─ /en/doctors/reem-hamdi/                                          LIVE
├─ /en/doctors/omonijo/                                             LIVE
├─ /en/doctors/bakare/                                              LIVE
└─ /en/doctors/ahmed-gwea/                                          LIVE
/en/patient-resources/                                          LIVE
/en/health-hub/                                                 LIVE — shell; zero approved articles yet (healthHubArticlesEnabled has no effect since the content array is empty, not a gate)
/en/about/                                                       LIVE
├─ /en/careers/                                                   LIVE (careersFormEnabled: true)
/en/terms/                                                       GATED (legalPagesEnabled) — content-approval blocker, not a code gap
/en/privacy-policy/                                              GATED (legalPagesEnabled)
/en/accessibility/                                               GATED (legalPagesEnabled)
/en/medical-disclaimer/                                          GATED (legalPagesEnabled)
/en/contact/                                                     LIVE
/en/shop/                                                        LIVE (shopEnabled: true) — 23-product SkinMedica catalogue
├─ /en/shop/category/<8 categories>/                              LIVE
├─ /en/shop/concern/<6 concerns>/                                 LIVE
├─ /en/shop/<23 product slugs>/                                   LIVE (full list: `docs/CONTENT_SOURCE_REGISTER.md`)
├─ /en/shop/cart/                                                 GATED (shopCheckoutEnabled — separate flag; no real cart/payment exists)
├─ /en/shop/checkout/                                             GATED (shopCheckoutEnabled)
└─ /en/shop/shipping-returns/                                     GATED (shopCheckoutEnabled)
/en/book-appointment/                                            LIVE — external-only booking hub (brief §16)
```

## Route-type counts (live only)

| Section | Live routes | Live URLs (×2 locales) |
|---|---|---|
| Home | 1 | 2 |
| Medical hub + 7 service pages + uninsured-services | 9 | 18 |
| Aesthetics hub + treatments hub + 8 treatments + concerns hub + 9 concerns + technologies hub + 5 technologies | 26 | 52 |
| Botox hub | 1 | 2 |
| Doctors index + 6 profiles | 7 | 14 |
| Patient Resources, Health Hub, About, Careers, Contact | 5 | 10 |
| Shop hub + 8 categories + 6 concerns + 23 products | 38 | 76 |
| Book Appointment | 1 | 2 |
| **Total** | **88** | **176** |

## Gated (built, not public) — 16 routes → 32 URLs

| Route(s) | Count | Flag | Reason |
|---|---|---|---|
| Medical Botox hub + 3 condition pages | 4 | `medicalBotoxDetailPagesEnabled` | Would duplicate `/botox`'s published content |
| Cosmetic Botox treatment page | 1 | `cosmeticBotoxTreatmentPageEnabled` | Would duplicate `/botox` |
| Skin Tightening treatment page | 1 | `skinTighteningTreatmentPageEnabled` | Same procedure as Radio Frequency under a different name |
| Aesthetics pricing | 1 | `aestheticPricingEnabled` | No approved aesthetics-treatment price list |
| Aesthetics consultation form | 1 | `consultationFormEnabled` | No approved consultation-intake flow |
| Before & After gallery | 1 | `beforeAfterEnabled` | No approved before/after photography |
| Legal pages (Terms, Privacy, Accessibility, Medical Disclaimer) | 4 | `legalPagesEnabled` | No approved legal copy (legacy showed "Coming soon") |
| Shop cart/checkout/shipping-returns | 3 | `shopCheckoutEnabled` | No real payment/cart/shipping implemented or approved |

Every gated route: registered with `indexing: "noindex"` and `inSitemap: false`, unreachable from navigation, and returns a genuine `notFound()` — never a "Coming soon" placeholder (`tests/e2e/gated-routes.spec.ts`).
