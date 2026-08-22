# ImageKit Media Manifest

Generated from `src/content/media/image-manifest.ts` (source of truth — regenerate this file by hand whenever it changes). Every path is relative to the approved ImageKit account/media root (brief §12): **`https://ik.imagekit.io/oq92dh6zib`**, root **`/blue-diamond/`**. This is the audit-trail view the brief asks for (path, page, section, alt text EN/AR, dimensions, aspect ratio, focal point, priority, approval status); `docs/IMAGE_REPLACEMENT_MANIFEST.md` and `docs/IMAGEKIT_IMPORT_REPORT.md` carry the deeper planning/evidence layer (which real source-archive file is a candidate for which entry).

**41 registered assets. 0 approved, 4 identity-confirmed and ready to import, 3 candidate-but-unconfirmed, 1 permanently disabled (photo declined), 33 pending (no source candidate matched yet or awaiting new photography).** Every `ImageKitImage` usage across the site resolves to one of these entries or renders the FacetTile placeholder — `tests/unit/image-usage.spec.ts` enforces there is no third option (no hardcoded local path, no unmapped path).

Focal point: `undefined` on every entry below — real photography doesn't exist yet, so no deliberate crop/focus decision has been made (the type supports `{x, y}` once one is). Priority: not a manifest field — it's the `preload` prop passed at each usage site (only the homepage hero uses it; every other image lazy-loads).

## Hero / clinic / homepage

| ImageKit path | Page | Section | EN alt | AR alt | W×H | Aspect | Status |
|---|---|---|---|---|---|---|---|
| `/blue-diamond/hero/homepage-hero.jpg` | Homepage | Hero | Blue Diamond Medical Clinic, West Springs, Calgary | عيادة بلو دايموند الطبية، ويست سبرينغز، كالغاري | 1920×1080 | 16:9 | pending — candidate: `medical/3p0a4142.jpg` (clinic interior signage), not an exact hero-crop match |
| `/blue-diamond/clinic/west-springs-exterior.jpg` | Homepage / About | Location | Blue Diamond Medical Clinic exterior, West Springs | واجهة عيادة بلو دايموند الطبية، ويست سبرينغز | 800×1000 | 4:5 | pending |
| `/blue-diamond/clinic/map-placeholder.jpg` | Contact | Location | Map to Blue Diamond Medical Clinic | خريطة الوصول إلى عيادة بلو دايموند الطبية | 800×600 | 4:3 | pending |
| `/blue-diamond/pathways/medical-care.jpg` | Homepage | Two Care Pathways (hero composition) | Physician with patient at Blue Diamond Medical | طبيب مع مريض في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/pathways/medical-aesthetics.jpg` | Homepage | Two Care Pathways (hero composition) | Medical aesthetics treatment technology | تقنية علاجات التجميل الطبي | 900×700 | 9:7 | pending |
| `/blue-diamond/medical/family-care.jpg` | Homepage | Two Care Pathways (section 2 detail) | Family medicine consultation room at Blue Diamond Medical | غرفة استشارات طب الأسرة في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/aesthetics/consultation-room.jpg` | Homepage | Two Care Pathways (section 2 detail) | Medical aesthetics consultation room at Blue Diamond Medical | غرفة استشارات التجميل الطبي في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/botox/consultation.jpg` | Botox hub | Overview | Botox consultation at Blue Diamond Medical | استشارة بوتوكس في بلو دايموند الطبية | 800×600 | 4:3 | pending |
| `/blue-diamond/aesthetics/hub-hero.jpg` | Aesthetics hub | Hero | Blue Diamond Medical Aesthetics | التجميل الطبي في بلو دايموند | 800×600 | 4:3 | pending |
| `/blue-diamond/medical/services-overview.jpg` | Medical hub | Overview | Physician consultation at Blue Diamond Medical | استشارة طبية في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/shop/skinmedica-collection.jpg` | Shop hub | Overview | SkinMedica professional skincare collection | مجموعة العناية بالبشرة الطبية سكين ميديكا | 900×700 | 9:7 | pending |

## Doctors (`src/types/doctor.ts` — single source of truth, never duplicated here)

| ImageKit path | Page | Section | EN alt | AR alt | W×H | Aspect | Status |
|---|---|---|---|---|---|---|---|
| `/blue-diamond/doctors/farhat.jpg` | Doctors index + Dr. Farhat profile | Portrait | Portrait of Dr. Mohamed Farhat | صورة د. محمد فرحات | 640×800 | 4:5 | **pending, but identity-confirmed and ready to import** (`medical/dr.farhat.jpg`) |
| `/blue-diamond/doctors/hamdi.jpg` | Doctors index + Dr. Hamdi profile | Portrait | Portrait of Dr. Reem Hamdi | صورة د. ريم حمدي | 640×800 | 4:5 | **pending, but identity-confirmed and ready to import** (`medical/3p0a4127.jpg`, embroidered name badge visible) |
| `/blue-diamond/doctors/omonijo.jpg` | Doctors index + Dr. Omonijo profile | Portrait | Portrait of Dr. Omonijo | صورة د. أومونيجو | 640×800 | 4:5 | pending — 2 unconfirmed candidate photos exist, needs client confirmation (`docs/DATA_APPROVAL_BLOCKERS.md`) |
| `/blue-diamond/doctors/bakare.jpg` | Doctors index + Dr. Bakare profile | Portrait | Portrait of Dr. Bakare | صورة د. باكاري | 640×800 | 4:5 | pending — 1 unconfirmed candidate, shared ambiguity with Dr. Gwea |
| `/blue-diamond/doctors/gwea.jpg` | Doctors index + Dr. Gwea profile | Portrait | Portrait of Dr. Ahmed Gwea | صورة د. أحمد جويع | 640×800 | 4:5 | pending — same unconfirmed candidate as Dr. Bakare |
| — (no entry) | Doctors index + Dr. Saeed profile | Portrait | — | — | — | — | **disabled — `photoDeclined: true`, permanent.** Brief §12 explicit rule: abstract Facet Tile, never a human figure |

Dr. Ahmed Gwea additionally: per brief §12, must use the approved abstract tile until a real approved photo is supplied — matches the "pending" status above exactly (FacetTile renders for anything not `"approved"`).

## Aesthetic treatments (8 live — `src/content/treatments.ts`)

| ImageKit path | Page | EN alt | AR alt | W×H | Aspect | Status |
|---|---|---|---|---|---|---|
| `/blue-diamond/treatments/laser-hair-removal.jpg` | `/aesthetics/treatments/laser-hair-removal` | Laser Hair Removal at Blue Diamond Medical | إزالة الشعر بالليزر في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/treatments/laser-skin-treatments.jpg` | `/aesthetics/treatments/laser-skin-treatments` | Laser Skin Treatments at Blue Diamond Medical | علاجات الليزر للبشرة في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/treatments/radio-frequency.jpg` | `/aesthetics/treatments/radio-frequency` | Radio Frequency at Blue Diamond Medical | الترددات الراديوية في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/treatments/rf-microneedling.jpg` | `/aesthetics/treatments/rf-microneedling` | RF Micro-needling at Blue Diamond Medical | الإبر الدقيقة بالترددات الراديوية في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/treatments/ultra.jpg` | `/aesthetics/treatments/ultra` | Ultra at Blue Diamond Medical | ألترا في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/treatments/prp-hair-restoration.jpg` | `/aesthetics/treatments/prp-hair-restoration` | PRP Hair Restoration at Blue Diamond Medical | استعادة الشعر بالبلازما في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/treatments/prp-skin-rejuvenation.jpg` | `/aesthetics/treatments/prp-skin-rejuvenation` | PRP Skin Rejuvenation at Blue Diamond Medical | تجديد البشرة بالبلازما في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/treatments/tempsure-vitalia.jpg` | `/aesthetics/treatments/tempsure-vitalia` | TempSure Vitalia at Blue Diamond Medical | تمبشور فيتاليا في بلو دايموند الطبية | 900×700 | 9:7 | pending |

## Technologies (5 live — `src/content/technologies.ts`)

| ImageKit path | Page | EN alt | AR alt | W×H | Aspect | Status |
|---|---|---|---|---|---|---|
| `/blue-diamond/technologies/potenza-device.jpg` | `/aesthetics/technologies/potenza` | Potenza RF micro-needling device | جهاز Potenza للإبر الدقيقة | 800×800 | 1:1 | pending — real manufacturer device photography exists in the source archive, not yet imported |
| `/blue-diamond/technologies/elite-iq-device.jpg` | `/aesthetics/technologies/elite-iq` | Elite iQ™ device at Blue Diamond Medical | جهاز Elite iQ™ في بلو دايموند الطبية | 800×800 | 1:1 | pending — same, candidate exists |
| `/blue-diamond/technologies/tempsure-device.jpg` | `/aesthetics/technologies/tempsure` | TempSure device at Blue Diamond Medical | جهاز TempSure في بلو دايموند الطبية | 800×800 | 1:1 | pending — same, candidate exists |
| `/blue-diamond/technologies/ultra-device.jpg` | `/aesthetics/technologies/ultra` | Ultra device at Blue Diamond Medical | جهاز Ultra في بلو دايموند الطبية | 800×800 | 1:1 | pending — same, candidate exists |
| `/blue-diamond/technologies/tempsure-vitalia-device.jpg` | `/aesthetics/technologies/tempsure-vitalia` | TempSure Vitalia device at Blue Diamond Medical | جهاز TempSure Vitalia في بلو دايموند الطبية | 800×800 | 1:1 | pending — not distinctly identified in the source archive |

## Aesthetic concerns (9 live — `src/content/concerns.ts`)

| ImageKit path | Page | EN alt | AR alt | W×H | Aspect | Status |
|---|---|---|---|---|---|---|
| `/blue-diamond/concerns/acne-scars.jpg` | `/aesthetics/concerns/acne-scars` | Acne Scars — Blue Diamond Medical Aesthetics | ندبات حب الشباب — بلو دايموند للتجميل الطبي | 900×900 | 1:1 | pending |
| `/blue-diamond/concerns/rosacea-redness.jpg` | `/aesthetics/concerns/rosacea-redness` | Rosacea & Redness — Blue Diamond Medical Aesthetics | الوردية والاحمرار — بلو دايموند للتجميل الطبي | 900×900 | 1:1 | pending |
| `/blue-diamond/concerns/dry-skin.jpg` | `/aesthetics/concerns/dry-skin` | Dry Skin — Blue Diamond Medical Aesthetics | جفاف البشرة — بلو دايموند للتجميل الطبي | 900×900 | 1:1 | pending |
| `/blue-diamond/concerns/fine-lines-wrinkles.jpg` | `/aesthetics/concerns/fine-lines-wrinkles` | Fine Lines & Wrinkles — Blue Diamond Medical Aesthetics | خطوط التجاعيد الدقيقة — بلو دايموند للتجميل الطبي | 900×900 | 1:1 | pending |
| `/blue-diamond/concerns/skin-laxity.jpg` | `/aesthetics/concerns/skin-laxity` | Skin Laxity — Blue Diamond Medical Aesthetics | ترهل الجلد — بلو دايموند للتجميل الطبي | 900×900 | 1:1 | pending |
| `/blue-diamond/concerns/spider-veins.jpg` | `/aesthetics/concerns/spider-veins` | Spider Veins — Blue Diamond Medical Aesthetics | الأوردة العنكبوتية — بلو دايموند للتجميل الطبي | 900×900 | 1:1 | pending |
| `/blue-diamond/concerns/sun-damage-pigmentation.jpg` | `/aesthetics/concerns/sun-damage-pigmentation` | Sun Damage & Pigmentation — Blue Diamond Medical Aesthetics | ضرر الشمس والتصبغ — بلو دايموند للتجميل الطبي | 900×900 | 1:1 | pending |
| `/blue-diamond/concerns/skin-revitalization.jpg` | `/aesthetics/concerns/skin-revitalization` | Skin Revitalization — Blue Diamond Medical Aesthetics | تجديد البشرة — بلو دايموند للتجميل الطبي | 900×900 | 1:1 | pending |
| `/blue-diamond/concerns/razor-bumps.jpg` | `/aesthetics/concerns/razor-bumps` | Razor Bumps — Blue Diamond Medical Aesthetics | نتوءات الحلاقة — بلو دايموند للتجميل الطبي | 900×900 | 1:1 | pending |

## Medical services (7 live + uninsured-services — `src/content/medical-services.ts`)

| ImageKit path | Page | EN alt | AR alt | W×H | Aspect | Status |
|---|---|---|---|---|---|---|
| `/blue-diamond/medical/eye-screening.jpg` | `/medical/eye-screening` | Eye Disease Screening at Blue Diamond Medical | فحص أمراض العين في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/medical/after-hours-care.jpg` | `/medical/after-hours-care` | After-Hours Care at Blue Diamond Medical | الرعاية خارج أوقات الدوام في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/medical/chronic-disease-management.jpg` | `/medical/chronic-disease-management` | Chronic Disease Management at Blue Diamond Medical | إدارة الأمراض المزمنة في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/medical/preventive-care.jpg` | `/medical/preventive-care` | Preventive Care at Blue Diamond Medical | الرعاية الوقائية في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/medical/weight-management.jpg` | `/medical/weight-management` | Weight Management at Blue Diamond Medical | إدارة الوزن في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/medical/pain-management.jpg` | `/medical/pain-management` | Pain Management at Blue Diamond Medical | إدارة الألم في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/medical/minor-procedures.jpg` | `/medical/minor-procedures` | Minor Procedures at Blue Diamond Medical | الإجراءات البسيطة في بلو دايموند الطبية | 900×700 | 9:7 | pending |
| `/blue-diamond/medical/uninsured-services.jpg` | `/medical/uninsured-services` | Uninsured services at Blue Diamond Medical | الخدمات غير المشمولة بالتأمين في بلو دايموند الطبية | 900×700 | 9:7 | pending |

## Not yet in this manifest (tracked separately, not a code gap)

- **SkinMedica product photography (23 SKUs)** — each product's `images[]` is generated by `pendingImage()` in `src/content/products.ts`, not this shared manifest (`/blue-diamond/products/skinmedica/<slug>.jpg`, one per product, all `status: "pending"`). Kept in `products.ts` rather than duplicated here since the SkinMedica catalogue is otherwise a fully self-contained content module — see `docs/CONTENT_SOURCE_REGISTER.md`.
- **Before/After gallery** — `beforeAfterEnabled: false`, no manifest entries exist because no approved photography exists to reference (brief explicitly forbids fabricating this).
- **Logo** — recreated as inline SVG (`src/components/layout/Logo.tsx`) from the approved brand PDF's geometry, not an ImageKit raster asset.

## Verification

`tests/unit/image-usage.spec.ts` — every literal `path="..."` string used by an `ImageKitImage` instance in a `[locale]` page has a matching entry in `src/content/media/image-manifest.ts` (this file's source). Passing as of this pass, `npx playwright test tests/unit/image-usage.spec.ts`.
