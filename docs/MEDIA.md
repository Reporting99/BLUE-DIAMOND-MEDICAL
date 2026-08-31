# Media Pipeline (ImageKit)

> **2026-08-24 — architecture change.** Media is no longer imported by a
> workstation script holding an ImageKit private key. The authenticated import
> now lives in FeelStack, and this repository never sees a private credential at
> all. See "Import architecture" immediately below. The workstation script
> that predated this has been removed; the legacy-archive pass it ran is kept
> below as a record, not as a procedure.

## Import architecture (current)

```text
approved media pack (temporary, outside the repo)
        ↓  authenticated, project-scoped admin API
FeelStack ProjectMediaImportService
        ↓  deterministic path, useUniqueFileName:false, overwriteFile:false
ImageKit  /blue-diamond/…
        ↓  MediaAsset row + EntityMediaAssignment edge
FeelStack public resolver  (envelope.media)
        ↓  per-item validation, invalid rows dropped and logged
src/lib/feelstack/media.ts  →  ImageKitImage
```

**Where each thing lives, and why.**

| Concern | Owner | Why not the other side |
|---|---|---|
| Image binaries | ImageKit | FeelStack stores no binaries; a CMS row is a reference, never a file |
| Path, dimensions, checksum, role, approval, EN/AR alt, focal point | FeelStack `media_assets` | The frontend must not become a second media database |
| Which entity shows which asset in which slot | FeelStack `entity_media_assignments` | Placement is editorial, and it changes without a deploy |
| Delivery URL and transformations | This repo, via `ImageKitImage` + `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | A stored transformation URL freezes a decision that should stay a render-time one |

**Credentials.** This repository needs exactly one media variable:

```env
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/oq92dh6zib
```

`NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` is **not required for image delivery** — the
root layout's `ImageKitProvider` takes only `urlEndpoint`, and
`imagekitIsConfigured` tests only that. A public key would only be needed if an
authenticated *browser-upload* flow were added later, which this build does not
have. `IMAGEKIT_PRIVATE_KEY` must never appear in this repository's environment
in any form: the only process that holds one is the FeelStack backend, using the
credential already configured in its own service environment.

**Three properties the deterministic importer guarantees**, each of which the
old path could not:

1. *The delivered path equals the manifest path.* `useUniqueFileName: false`
   plus a post-upload assertion that `filePath` came back unchanged. The old
   `MediaLibraryService.upload()` forced `/projects/{id}/media` with unique
   renaming, which cannot express `/blue-diamond/…` at all.
2. *Reuse requires proof.* Same path plus same SHA-256 is reuse; same path plus
   different bytes is a refusal. `overwriteFile: false` means the provider
   enforces it too, not just the pre-check.
3. *A retry converges.* Assignments are keyed on
   (project, entityType, entityId, slot, sortOrder), so re-running an import
   updates rows rather than stacking a second hero on a page.

**Doctor rules are structural, not procedural.** The pack contains no doctor
imagery, so no doctor media record is created at all. Dr. Saeed keeps
`photoDeclined: true` with an empty path, Dr. Gwea keeps `status: "pending"`,
and every doctor card renders the code-generated FacetTile. Nothing in the
import can change that, because there is nothing to import.


Consolidated from the per-task documents this project accumulated; every
fact below is carried over verbatim from the source noted at each section.

## ImageKit account and credentials

The approved account/endpoint is **`https://ik.imagekit.io/oq92dh6zib`**, media
root **`/blue-diamond/`** — e.g. `/blue-diamond/home/home-hero-blue-diamond.png`.
`src/config/imagekit.ts` defaults `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` to this
value and exports `MEDIA_ROOT` for every content file that builds a path, so no
environment variable is required just to point at the right account.

**This repository holds no ImageKit credential, and does not need one.** The
private key lives in FeelStack's per-project media-provider configuration and
never leaves it. Imports authenticate as a project-scoped FeelStack user
(`bd-media-import`) whose token can only write inside this project's path
prefix; the two importers that exist —
`POST /admin/v1/projects/:id/media/import` and, wrapping it,
`scripts/import-before-after.mjs` — both go through that door. Anything asking
for `IMAGEKIT_PRIVATE_KEY` in this repository is reaching for a credential
scoped to the whole account when a narrower one already exists, and lands bytes
in ImageKit that no `MediaAsset` row points at, which the public resolver
cannot serve.

`NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` is the only ImageKit value the application
reads, and it is public by design — it grants delivery, not upload or delete.

### Flipping an asset from placeholder to real

Uploading bytes is not publication. `ImageKitImage` renders a real CDN URL only
when the referencing record says `status`/`approvalStatus` is `"approved"`;
everything else renders the FacetTile placeholder, never a stock photo or a
generated face. Promotion is a deliberate edit to the record that owns the
asset — `src/features/doctors/data.ts`, `src/features/products/data.ts`,
`src/features/aesthetics/data/before-after.ts` — and the site never promotes an
asset just because a file appeared in the account. That is what keeps
`"pending"` a signal rather than a formality, and it is the invariant a bulk
`approvalStatus` write broke once already.

### Verify

- `tests/unit/image-usage.spec.ts` — no code bypasses `ImageKitImage`, and every
  referenced path has a manifest entry.
- `npm run validate:secrets` — and, after a production build,
  `grep -r "IMAGEKIT_PRIVATE_KEY" .next/static` must return nothing.
## ImageKit Media Manifest

Generated from `src/lib/media/image-manifest.ts` (source of truth — regenerate this file by hand whenever it changes). Every path is relative to the approved ImageKit account/media root (brief §12): **`https://ik.imagekit.io/oq92dh6zib`**, root **`/blue-diamond/`**. This is the audit-trail view the brief asks for (path, page, section, alt text EN/AR, dimensions, aspect ratio, focal point, priority, approval status); `docs/MEDIA.md` and `docs/MEDIA.md` carry the deeper planning/evidence layer (which real source-archive file is a candidate for which entry).

**41 registered assets. 0 approved, 4 identity-confirmed and ready to import, 3 candidate-but-unconfirmed, 1 permanently disabled (photo declined), 33 pending (no source candidate matched yet or awaiting new photography).** Every `ImageKitImage` usage across the site resolves to one of these entries or renders the FacetTile placeholder — `tests/unit/image-usage.spec.ts` enforces there is no third option (no hardcoded local path, no unmapped path).

Focal point: `undefined` on every entry below — real photography doesn't exist yet, so no deliberate crop/focus decision has been made (the type supports `{x, y}` once one is). Priority: not a manifest field — it's the `preload` prop passed at each usage site (only the homepage hero uses it; every other image lazy-loads).

### Hero / clinic / homepage

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

### Doctors (`src/features/doctors/data.ts` — single source of truth, never duplicated here)

| ImageKit path | Page | Section | EN alt | AR alt | W×H | Aspect | Status |
|---|---|---|---|---|---|---|---|
| `/blue-diamond/doctors/farhat.jpg` | Doctors index + Dr. Farhat profile | Portrait | Portrait of Dr. Mohamed Farhat | صورة د. محمد فرحات | 640×800 | 4:5 | **pending, but identity-confirmed and ready to import** (`medical/dr.farhat.jpg`) |
| `/blue-diamond/doctors/hamdi.jpg` | Doctors index + Dr. Hamdi profile | Portrait | Portrait of Dr. Reem Hamdi | صورة د. ريم حمدي | 640×800 | 4:5 | **pending, but identity-confirmed and ready to import** (`medical/3p0a4127.jpg`, embroidered name badge visible) |
| `/blue-diamond/doctors/omonijo.jpg` | Doctors index + Dr. Omonijo profile | Portrait | Portrait of Dr. Omonijo | صورة د. أومونيجو | 640×800 | 4:5 | pending — 2 unconfirmed candidate photos exist, needs client confirmation (`docs/CONTENT_MODEL.md`) |
| `/blue-diamond/doctors/bakare.jpg` | Doctors index + Dr. Bakare profile | Portrait | Portrait of Dr. Bakare | صورة د. باكاري | 640×800 | 4:5 | pending — 1 unconfirmed candidate, shared ambiguity with Dr. Gwea |
| `/blue-diamond/doctors/gwea.jpg` | Doctors index + Dr. Gwea profile | Portrait | Portrait of Dr. Ahmed Gwea | صورة د. أحمد جويع | 640×800 | 4:5 | pending — same unconfirmed candidate as Dr. Bakare |
| — (no entry) | Doctors index + Dr. Saeed profile | Portrait | — | — | — | — | **disabled — `photoDeclined: true`, permanent.** Brief §12 explicit rule: abstract Facet Tile, never a human figure |

Dr. Ahmed Gwea additionally: per brief §12, must use the approved abstract tile until a real approved photo is supplied — matches the "pending" status above exactly (FacetTile renders for anything not `"approved"`).

### Aesthetic treatments (8 live — `src/features/aesthetics/data/treatments.ts`)

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

### Technologies (5 live — `src/features/technologies/data.ts`)

| ImageKit path | Page | EN alt | AR alt | W×H | Aspect | Status |
|---|---|---|---|---|---|---|
| `/blue-diamond/technologies/potenza-device.jpg` | `/aesthetics/technologies/potenza` | Potenza RF micro-needling device | جهاز Potenza للإبر الدقيقة | 800×800 | 1:1 | pending — real manufacturer device photography exists in the source archive, not yet imported |
| `/blue-diamond/technologies/elite-iq-device.jpg` | `/aesthetics/technologies/elite-iq` | Elite iQ™ device at Blue Diamond Medical | جهاز Elite iQ™ في بلو دايموند الطبية | 800×800 | 1:1 | pending — same, candidate exists |
| `/blue-diamond/technologies/tempsure-device.jpg` | `/aesthetics/technologies/tempsure` | TempSure device at Blue Diamond Medical | جهاز TempSure في بلو دايموند الطبية | 800×800 | 1:1 | pending — same, candidate exists |
| `/blue-diamond/technologies/ultra-device.jpg` | `/aesthetics/technologies/ultra` | Ultra device at Blue Diamond Medical | جهاز Ultra في بلو دايموند الطبية | 800×800 | 1:1 | pending — same, candidate exists |
| `/blue-diamond/technologies/tempsure-vitalia-device.jpg` | `/aesthetics/technologies/tempsure-vitalia` | TempSure Vitalia device at Blue Diamond Medical | جهاز TempSure Vitalia في بلو دايموند الطبية | 800×800 | 1:1 | pending — not distinctly identified in the source archive |

### Aesthetic concerns (9 live — `src/features/concerns/data.ts`)

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

### Medical services (7 live + uninsured-services — `src/features/medical-services/data.ts`)

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

### Not yet in this manifest (tracked separately, not a code gap)

- **SkinMedica product photography (23 SKUs)** — owned by FeelStack, not by this manifest and not by the repository. A product's image is whatever asset is assigned to its `productPrimary` slot; 19 of 23 have one today, under `/blue-diamond/shop/`. The static `images[]` in `src/features/products/data.ts` is only the fallback for a product with no assignment, and it carries no path — it used to guess `/blue-diamond/products/skinmedica/<slug>.jpg`, a location no asset has ever occupied.
- **Before/After gallery** — `beforeAfterEnabled: false`, no manifest entries exist because no approved photography exists to reference (brief explicitly forbids fabricating this).
- **Logo** — recreated as inline SVG (`src/components/layout/Logo.tsx`) from the approved brand PDF's geometry, not an ImageKit raster asset.

### Verification

`tests/unit/image-usage.spec.ts` — every literal `path="..."` string used by an `ImageKitImage` instance in a `[locale]` page has a matching entry in `src/lib/media/image-manifest.ts` (this file's source). Passing as of this pass, `npx playwright test tests/unit/image-usage.spec.ts`.

## ImageKit Import Report

Source: `blue-diamond-original-site-images.zip` (client-supplied, usage rights confirmed for images extracted from `bluediamondmedical.ca` and `bluediamondmedicalaesthetics.ca`) — 70 image files plus `source-map.json`, which records each asset's real dimensions, byte size, originating page(s), and a `reviewRequired` flag the extraction tool itself set on 15 assets.

This section is the **record of the legacy-archive pass**, kept for its
provenance: what the archive contained, what was excluded and why, and which
portraits may never be published blind. It is not a procedure to run.

The script that produced it, `scripts/imagekit-import.mjs`, has been removed.
It predated the current architecture: it uploaded straight to the ImageKit
Upload API with an account-wide `IMAGEKIT_PRIVATE_KEY`, which this repository
does not hold and should not, and it left no `MediaAsset` row behind, so
nothing it uploaded could be resolved or approved. Its work is done — the
archive's assets are registered in FeelStack under `/blue-diamond/shared/legacy/`
— and the door it used is closed. Imports now go through
`POST /admin/v1/projects/:id/media/import`, described under "Import
architecture" above.

### Status

The archive was imported and is registered in the FeelStack media library. The
review holds recorded below still stand and are not superseded by the import:
the three unidentified physician portraits and the assets flagged for
claim-accuracy review remain unpublished, and publishing any of them is a human
decision, not an import step.

### What the archive contained

| | |
|---|---|
| Total assets scanned | 70 |
| Excluded (not imported) | 8 |
| Identity-confirmed doctor photos | 4 (2 unique photos + 2 duplicate resized copies) |
| Unidentified physician portraits | 3 |
| Flagged for manual review before use | 18 |
| Total size | 2.9 MB |
| By role (of the 62 non-excluded assets) | treatment 19 · technology 18 · concern 12 · doctor 9 · location 4 |

### Excluded — not imported

| File | Reason |
|---|---|
| `medical/blue-diamond-medical-logo.png` | Low-resolution legacy web logo; superseded by the approved logo PDF's vector geometry already implemented in `src/components/layout/Logo.tsx` |
| `aesthetics/bluediamondmedicalaesthetics-bold01.png` | Same reason — legacy aesthetics wordmark, not the approved brand asset |
| `medical/screenshot-2026-01-04-at-12.08.27-pm.png`, `-12.21.51-pm.png`, `-12.32.31-pm.png`, `-12.46.43-pm.png` | Literal browser screenshots of the old site's UI — not photography, not usable as content imagery on the new site |
| `aesthetics/screenshot-2026-02-13-at-8.45.42-am.png`, `-1.02.15-pm.png` | Same reason |

### Doctor photos — identity-confirmed by visual inspection

| File | → Destination | Doctor | Confirmation basis |
|---|---|---|---|
| `medical/dr.farhat.jpg` | `/doctors/farhat.jpg` | Dr. Mohamed Farhat | Filename + clear portrait match; already the exact path `src/features/doctors/data.ts` expects |
| `medical/3p0a4127.jpg` | `/doctors/hamdi.jpg` | Dr. Reem Hamdi | Visible embroidered name badge on her white coat reads "Dr. Reem Ham[di]" |
| `aesthetics/rs-w_388-h_388-cg_true.webp` | (duplicate) | Dr. Reem Hamdi | Same photo, resized copy — same name badge visible |
| `aesthetics/rs-w_388-h_388-cg_true-m.webp` | (duplicate) | Dr. Reem Hamdi | Same photo, second resized copy |

Both real portraits were opened and visually inspected this pass, not inferred from filename alone. `src/features/doctors/data.ts` already points `mohamed-farhat` and `reem-hamdi` at exactly these destination paths (`/doctors/farhat.jpg`, `/doctors/hamdi.jpg`) — no code change was needed, only the import itself once credentials exist. Both remain `status: "pending"` (FacetTile placeholder) until that import actually runs.

### Doctor photos — real people, unconfirmed identity (do not import blind)

Three more genuine, non-stock physician portraits exist in the archive, all from the "Our Team" page, none carrying a visible name:

| File | Description | Candidate roster names |
|---|---|---|
| `medical/blob-0846d7f.png` | Woman, dark hair, no headscarf, navy blouse, arms crossed | Dr. Omonijo (the only remaining unassigned female physician — Dr. Saeed declined a photo, Dr. Hamdi is confirmed above) |
| `medical/whatsapp-image-2024-12-30-at-17.06.09.jpeg` | Woman, dark hair, maroon top, arms crossed | Same candidate pool as above — **two different women are pictured for one remaining unassigned female roster slot**, which itself needs a client answer (is one of these Dr. Omonijo, is the other a former team member, or are these two different current staff?) |
| `medical/blob-7cc2b3d.png` | Man, short black hair, beard, lilac shirt, arms crossed | Dr. Bakare or Dr. Ahmed Gwea (both male, both unassigned) |

**Per the brief's explicit instruction — "never assign a legacy portrait to the wrong doctor" — none of these three files were mapped to a doctor ID.** `src/features/doctors/data.ts` is unchanged for Dr. Omonijo, Dr. Bakare, and Dr. Gwea; all three keep their placeholder. This needs a direct client answer before any of these three files gets imported and linked.

> **2026-08-31 — RESOLVED, and the answer is stronger than "needs review".**
> Both original websites were re-crawled live and rendered in a real browser
> this pass, and the galleries' third-party widget datasets were pulled
> directly. All 14 before/after pairs on the original aesthetics site are
> **Cynosure device-manufacturer marketing collateral showing other
> clinicians' patients** — the surviving filenames name Dr. Nanni and
> Dr. Arroyo and carry Cynosure product-document numbers (PRD-0844,
> PRD-4497). They must not be migrated as Blue Diamond results. Full
> evidence, complete pair-by-pair inventory and the decision:
> **`docs/BEFORE_AFTER_SOURCE_AUDIT.md`**.

### Before/After and result-claim imagery — flagged for manual review (15 files)

The source archive's own extraction tool already flagged these 15 assets as `reviewRequired: true` — mostly filenames literally containing `-ba-` (before/after) or paired `acne-2`/`acne-3`-style result images, tied to specific concern and treatment pages:

| File | Legacy page context |
|---|---|
| `aesthetics/marketing_materials_ba-elite-c-arroyo-legveins.png` + `.jpg` | Treatments page / Spider Vein concern page |
| `aesthetics/marketing_materials_ba-elite-c-arroyo-pigment.png` + `.jpg` | Treatments page / Sun Damage concern page |
| `aesthetics/marketing_materials_ba-elite-c-nanni-pigment-p.jpg` | Sun Damage concern page |
| `aesthetics/prd-0844-elite-iq-bnas-can-en_02.jpg`, `_04-before.png` | Treatments page (Elite iQ™ manufacturer before/after asset) |
| `aesthetics/prd-1960-ultra-bnas-webformat-560x560-01.png` | Treatments page (Ultra manufacturer result asset) |
| `aesthetics/prd-1408-ultra-skin-solutions-bnas-format-amps.jpg` | Non-invasive skin (skin-laxity) concern page |
| `aesthetics/acne-2.png`, `acne-3.png` | Treatments page |
| `aesthetics/after-prp-treatment.png` | Treatments page |
| `aesthetics/loose-skin.jpg` | Treatments page / skin-laxity concern page |
| `aesthetics/artboard-30-80.jpg`, `artboard-30-80-ece906b.jpg` | Treatments page / Skin Revitalization concern page |

**None of these are imported or linked to a route yet.** Per the brief: "Before/After assets may be imported because usage rights are confirmed, but visible medical claims must match the approved source content... do not silently treat unrelated images as a Before/After pair." These are manufacturer/marketing result images, not confirmed to be genuine matched before/after pairs of the same real patient — several file-name pairs look plausible (e.g., the two `arroyo-legveins` files, `.png`+`.jpg`, may be the same pairing exported twice rather than a true before/after pair) but this needs a human — ideally clinical — reviewer to confirm each pairing and its claim before it appears on `/aesthetics/before-after` (still `beforeAfterEnabled: false`).

### Technology and treatment imagery

The remaining 37 assets (technology device photography for Cynosure/Elite iQ/Potenza/TempSure/Ultra, and generic treatment/concern thumbnails not flagged `reviewRequired`) classify cleanly by their originating legacy page and carry no identity or claim-accuracy risk — they're manufacturer device photography and generic marketing graphics, not patient photos.

### What is still open

Credentials are no longer among these. The remaining items are human decisions, not engineering steps:

1. **Client confirmation of the 3 unidentified doctor portraits** — which roster name (if any) each belongs to. Until then all three stay unmapped and unpublished.
2. **Clinical/marketing review of the 15 before/after-style legacy assets** — each pairing, and any claim it implies, confirmed against approved copy. This is separate from the 14 recovered pairs now published under `/blue-diamond/before-after/`, whose provenance is settled in `docs/BEFORE_AFTER_SOURCE_AUDIT.md`.
3. **Licensing for the retained Cynosure asset** — appearing on the legacy site is evidence of use, not a transferable licence.

## Image Replacement Manifest

The approved ImageKit account/endpoint is `https://ik.imagekit.io/oq92dh6zib`, media root `/blue-diamond/` (`src/config/imagekit.ts`). Media now exists in the account and is registered in FeelStack. An entry below still renders the code-generated "Facet Tile" placeholder (`src/components/shared/FacetTile.tsx`) wherever its record's approval `status` is `"pending"` — the account holding a file is never on its own what publishes it. Treat the FeelStack media library as the authority on what exists; this table is the planning layer for what each slot is *for*.

| Page | Section | Subject | ImageKit path (planned) | Aspect ratio | Status | Notes |
|---|---|---|---|---|---|---|
| Homepage | Hero | Clinic exterior/interior, West Springs | `/blue-diamond/hero/homepage-hero.jpg` | 16:9 (desktop) / 4:5 (mobile) | pending | No exact hero-crop candidate identified in the source archive yet; `medical/3p0a4142.jpg` (real clinic-interior signage photo) is a strong candidate for a *different* slot (see Location, below) |
| Homepage / About | Location | Clinic interior — real photo found and classified this pass | `/blue-diamond/clinic/interior-signage.jpg` | 3:2 | **ready to import** | `medical/3p0a4142.jpg` — real photo of the physical diamond+heartbeat wall sign, 1306×870. Not yet wired to a manifest entry in code; recommended for Part 2 |
| Homepage / Contact | Location | Office/reception candid | `/blue-diamond/clinic/reception.jpg` | 4:3 | **ready to import** | `medical/3p0a4130.jpg` — real candid desk/laptop photo, no identifiable faces, 365×365 |
| Homepage / Contact | Location | Map | `/blue-diamond/clinic/map-placeholder.jpg` | 4:3 | pending | Consider an embedded map instead of a static image |
| Aesthetics hub | Hero | Treatment room | `/blue-diamond/aesthetics/hub-hero.jpg` | 4:3 | pending | No confirmed candidate; several unclassified `aesthetics/blob-*.png` treatment-page images exist (37 non-flagged assets — see import report) worth a manual pass |
| 8 aesthetic treatment pages | Cover | Treatment in progress / equipment | `/blue-diamond/treatments/<slug>.jpg` | 3:2 (`treatment` preset) | pending | Real technology device photography exists in the archive (Cynosure/Potenza/TempSure/Ultra assets) and can supply several of these — see `docs/MEDIA.md`'s "ready to import" section |
| 9 concern pages | Cover | Representative skin condition (never a real patient photo without consent) | `/blue-diamond/concerns/<slug>.jpg` | 1:1 (`concern` preset) | pending | Some candidate assets exist per-concern in the archive but are among the 15 flagged for clinical/marketing review before use — do not import without that review |
| 5 technology pages | Cover | Equipment photo | `/blue-diamond/technologies/<slug>.jpg` | 4:3 (`technology` preset) | **ready to import (4 of 5)** | Real manufacturer device photography found for Elite iQ™, Potenza, TempSure, Ultra in the archive; TempSure Vitalia not distinctly identified — see import report |
| Doctors — Dr. Farhat | Card + profile | Portrait | `/blue-diamond/doctors/farhat.jpg` | 4:5 | **identity-confirmed, ready to import** | `medical/dr.farhat.jpg` — visually confirmed this pass |
| Doctors — Dr. Saeed | Card + profile | — | — | **disabled** | Photo declined by the subject — permanent, never revisit. Facet Tile only. |
| Doctors — Dr. Hamdi | Card + profile | Portrait | `/blue-diamond/doctors/hamdi.jpg` | 4:5 | **identity-confirmed, ready to import** | `medical/3p0a4127.jpg` — confirmed via a visible embroidered name badge on her coat |
| Doctors — Dr. Omonijo | Card + profile | Portrait | `/blue-diamond/doctors/omonijo.jpg` | 4:5 | **candidate found, identity unconfirmed** | 2 real female portraits exist in the archive (`medical/blob-0846d7f.png`, `medical/whatsapp-image-2024-12-30-at-17.06.09.jpeg`) with no visible name — client must confirm which (if either) is Dr. Omonijo before either is imported (`docs/CONTENT_MODEL.md`) |
| Doctors — Dr. Bakare | Card + profile | Portrait | `/blue-diamond/doctors/bakare.jpg` | 4:5 | **candidate found, identity unconfirmed** | 1 real male portrait (`medical/blob-7cc2b3d.png`) — candidate for Dr. Bakare or Dr. Gwea, unconfirmed |
| Doctors — Dr. Gwea | Card + profile | Portrait | `/blue-diamond/doctors/gwea.jpg` | 4:5 | **candidate found, identity unconfirmed** | Same candidate as above, shared with Dr. Bakare — needs client confirmation either way |
| Logo (header/footer) | — | Diamond + heartbeat mark | — | — | **functional recreation** | `src/components/layout/Logo.tsx` recreates the mark from the approved PDF's coordinates/colors as inline SVG — no master vector file (SVG/EPS) was supplied. Must be swapped for Decca Design Inc.'s master file before launch. |
| Before/After gallery (`/aesthetics/before-after`, gated) | — | 15 candidate assets found, none approved | `/blue-diamond/before-after/<pair-id>.jpg` | varies | **flagged, not imported** | Full list with legacy-page context in `docs/MEDIA.md` — every one needs a clinical/marketing reviewer to confirm genuine pairing and claim accuracy before any import |
| SkinMedica products (23, `/shop/*`, **live**) | Product photography | Bottle/packaging shots | `/blue-diamond/shop/<catalogue-number>_<Product_Name>.jpg`, assigned in FeelStack | 1:1 | **19 of 23 approved and assigned** | None of these came from the licensed legacy archive; they were supplied separately and imported into the media library. 19 render their real packshot on the catalogue and detail pages in both locales. The remaining 4 — Lytera 2.0, Daily Physical Defense SPF 34, Total Defense + Repair SPF 34 (Tinted), Replenish Hydrating Cream — render the neutral Facet Tile. A sibling's photograph is never substituted. Adding one is a CMS action: upload, approve, assign `productPrimary`, publish. No code change, no redeploy. |

### Real source archive — summary (full detail in `docs/MEDIA.md`)

70 licensed images found this pass (`blue-diamond-original-site-images.zip`), classified during the legacy-archive pass: 8 excluded (legacy screenshots/superseded logos), 4 identity-confirmed doctor photos, 3 unidentified doctor photos, 15 before/after-style assets flagged for review, ~37 technology/treatment/concern images carrying no identity or claim-accuracy risk. Real dimensions, byte sizes, and originating legacy-page context are recorded for every asset — nothing above is guessed.

### Presets defined, ready for real assets

`src/config/imagekit.ts` defines transformation presets for: logo, hero, hero-mobile, doctor, doctor-card, service, treatment, concern, technology, product, product-gallery, article, og-image, thumbnail, before-after. `og-image` is now actually wired up and exercised (`src/lib/seo/metadata.ts`, homepage) — the rest await real assets.

### Automated verification

`tests/unit/image-usage.spec.ts` (built and passing, 4 tests): no component imports `next/image` directly (must go through `ImageKitImage`), no hardcoded `/images/...` local paths, no Unsplash/Pexels/Cloudinary references, every `ImageKitImage path=` used in a page has a matching `image-manifest.ts` entry. `public/` still contains only the unused Next.js default scaffold SVGs; `src/app/favicon.ico` is still the scaffold default and needs replacing with a Blue Diamond favicon derived from the approved mark before launch.
