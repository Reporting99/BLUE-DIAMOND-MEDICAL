# Treatment Route Localization Matrix

Every Arabic slug below was **authored in FeelStack** and recovered from `route.alternates`. None was invented, derived or transliterated by this repository.

| treatmentId | EN path | AR path | CMS alternate | route registry | resolvedLocale | usedFallback | HTTP | media rendered |
|---|---|---|---|---|---|---|---|---|
| `laser-hair-removal` | `/aesthetics/treatments/laser-hair-removal` | `/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر` | ✅ | generated artifact | `ar` | `False` | 200 | no |
| `laser-skin-treatments` | `/aesthetics/treatments/laser-skin-treatments` | `/التجميل-الطبي/العلاجات/علاجات-البشرة-بالليزر` | ✅ | generated artifact | `ar` | `False` | 200 | no |
| `prp-hair-restoration` | `/aesthetics/treatments/prp-hair-restoration` | `/التجميل-الطبي/العلاجات/استعادة-الشعر-بالبلازما` | ✅ | generated artifact | `ar` | `False` | 200 | no |
| `prp-skin-rejuvenation` | `/aesthetics/treatments/prp-skin-rejuvenation` | `/التجميل-الطبي/العلاجات/تجديد-البشرة-بالبلازما` | ✅ | generated artifact | `ar` | `False` | 200 | no |
| `radio-frequency` | `/aesthetics/treatments/radio-frequency` | `/التجميل-الطبي/العلاجات/الترددات-الراديوية` | ✅ | generated artifact | `ar` | `False` | 200 | no |
| `rf-microneedling` | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية` | ✅ | generated artifact | `ar` | `False` | 200 | no |
| `tempsure-vitalia` | `/aesthetics/treatments/tempsure-vitalia` | `/التجميل-الطبي/العلاجات/تمبشور-فيتاليا` | ✅ | generated artifact | `ar` | `False` | 200 | no |
| `ultra` | `/aesthetics/treatments/ultra` | `/التجميل-الطبي/العلاجات/الترا` | ✅ | generated artifact | `ar` | `False` | 200 | no |

**8/8 treatment routes: `resolvedLocale=ar`, `usedFallback=false`, HTTP 200.**

`MISSING_LOCALIZED_ROUTE_DATA`: **none**. Every treatment has an authored Arabic slug in the CMS.

## Why media renders on none of them

Not a routing failure. Two independent and correct reasons:

1. **Seven of the eight have no publishable asset.** Their assigned assets were reverted to `pending` in the corrective batch — they are third-party before/after composites, manufacturer adverts, or loose stock matches. The public resolver withholds them, exactly as intended.

2. **The one that does have an approved asset (`rf-microneedling`) has no AR-side assignment.** `EntityMediaAssignment` rows are per-entity, and FeelStack stores one entity per locale. The importer created the `hero` assignment on the English entity only, so the Arabic entity (`f2ab7ca1-14b8-429d-a82a-9955fdf239a6`) resolves correctly and finds nothing attached. Prepared as operation 4 in `BLUE_DIAMOND_PENDING_CMS_WRITES.json`; not executed.

This is the general shape of AR media across the site: **routing is fixed, assignment coverage is not**. Only doctors and eye-screening received AR-side assignments during the import.

## Scope beyond treatments

The same fix covers every entity family. The generated artifact carries **58** localized routes — 9 concerns, 5 technologies, 8 treatments, 7 medical services, 23 products and 6 doctors — where the hand-maintained registry had 6. Parity is enforced by `tests/contracts/localized-route-parity.spec.ts`.

