<!-- Generated 2026-08-24 by the ImageKit + FeelStack media import run.
     The run stopped at the Phase 1 credential gate. Nothing was uploaded. -->

# ImageKit — Missing Assets

What the master pack does **not** contain, measured against the site's own
`src/lib/media/image-manifest.ts` (48 generated entries) and
`src/features/products/data.ts` (23 SKUs).

The pack supplies 47 files covering **21 of 48** manifest entries and **19 of 23**
product packshots. The 27 manifest entries and 4 products below still have no
approved asset.

## 1. Doctors — the whole family is missing

The pack's own `CLAUDE_UPLOAD_AND_MAPPING_INSTRUCTIONS.md` names `doctors` as one of
the ImageKit target folders, but **the archive contains no `blue-diamond/doctors/`
directory and no doctor imagery of any kind**. This is the single largest gap.

| Doctor | Repo state | What is needed | What must NOT happen |
|---|---|---|---|
| Dr. Omaima Saeed (`omaima-saeed`) | `image: { path: "", status: "disabled", photoDeclined: true }` | The **approved Blue Diamond abstract branded tile** — not supplied in this pack | No portrait. No generated face, stock doctor, or human silhouette. She has explicitly declined photography. |
| Dr. Ahmed Gwea (`ahmed-gwea`) | `/blue-diamond/doctors/gwea.jpg`, `status: "pending"` | The **approved abstract branded placeholder**, until a real approved photo is supplied — not supplied in this pack | Never a stock or generated person presented as Dr. Gwea. |
| Dr. Mohamed Farhat (`mohamed-farhat`) | `/blue-diamond/doctors/farhat.jpg`, `status: "pending"` | Real approved portrait | — |
| Dr. Reem Hamdi (`reem-hamdi`) | `/blue-diamond/doctors/hamdi.jpg`, `status: "pending"` | Real approved portrait | — |
| Dr. Omonijo (`omonijo`) | `/blue-diamond/doctors/omonijo.jpg`, `status: "pending"` | Real approved portrait | — |
| Dr. Bakare (`bakare`) | `/blue-diamond/doctors/bakare.jpg`, `status: "pending"` | Real approved portrait | — |

Current behaviour is already correct and safe: `ImageKitImage` renders the
code-generated abstract **FacetTile** for every non-`approved` asset, so no doctor
card is broken and no stock face is shown. The gap is that the *approved branded
tile* the brief calls for is a distinct designed asset which this pack does not
deliver — the FacetTile is standing in for it.

**Nothing in this import changes any doctor record.** The doctor rules are satisfied
by leaving all six exactly as they are.

## 2. Skin concerns — 9 of 9 missing

The pack supplies one concerns *hub* image (`concerns-hub-natural-skin.png`) and no
per-concern imagery. Manifest entries `concern-*` still have no asset:

`acne-scars`, `rosacea-redness`, `dry-skin`, `fine-lines-wrinkles`, `skin-laxity`,
`spider-veins`, `sun-damage-pigmentation`, `skin-revitalization`, `razor-bumps`

## 3. Medical services — 6 of 7 missing

Only `eye-screening` has a card image in the pack. Still missing:

`after-hours-care`, `chronic-disease-management`, `preventive-care`,
`weight-management`, `pain-management`, `minor-procedures`

## 4. Aesthetic treatments — 1 of 10 missing

| Treatment | Note |
|---|---|
| `tempsure-vitalia` | No hero in the pack. The pack *does* supply a TempSure Vitalia **technology** card (`technologies/tempsure-vitalia-abstract-card.png`), which is a different slot on a different page — it is not a substitute and has not been reused as one. |

`skin-tightening` is not counted as missing: its own published copy states skin
tightening is delivered through the Radio Frequency (TempSure) treatment, so it
shares the `radio-frequency` hero as one asset reference rather than getting a
duplicate image.

## 5. Generic site imagery — 6 manifest entries missing

| Manifest id | Path it expects |
|---|---|
| `clinic-exterior` | `/blue-diamond/clinic/west-springs-exterior.jpg` |
| `clinic-map` | `/blue-diamond/clinic/map-placeholder.jpg` |
| `pathways-medical-care` | `/blue-diamond/pathways/medical-care.jpg` |
| `pathways-medical-aesthetics` | `/blue-diamond/pathways/medical-aesthetics.jpg` |
| `pathways-aesthetics-consultation-detail` | `/blue-diamond/aesthetics/consultation-room.jpg` |
| `medical-services-overview` | `/blue-diamond/medical/services-overview.jpg` |

## 6. Products — 4 of 23 have no packshot

These are `REVIEW_REQUIRED` in the pack's own
`SkinMedica_Product_Source_Manifest.csv`. They take the shared placeholder
`/blue-diamond/shop/product-image-pending-abstract.png` and **keep
`status: "pending"`**. No fake package image is to be created for any of them.

| # | Product | Repo id | Why no image |
|---|---|---|---|
| 9 | Lytera® 2.0 Pigment Brightening Serum | `lytera-2-pigment-brightening-serum` | Official Canada listing; dedicated current product page/image not retrieved |
| 11 | Daily Physical Defense™ SPF 34 | `daily-physical-defense-spf-34` | Clinic legacy listing; manufacturer confirmation required |
| 12 | Total Defense + Repair SPF 34 (Tinted) | `total-defence-repair-spf-34-tinted` | Official family confirmed, but a distinct packshot for the tinted variant requires confirmation |
| 16 | Replenish Hydrating Cream | `replenish-hydrating-cream` | Clinic legacy listing; manufacturer confirmation required |

## 7. Health Hub

Zero article imagery, consistent with `features.healthHubArticlesEnabled: false` and
zero approved articles. Not a regression.

## 8. Path-shape mismatch (not a missing asset, but blocks wiring)

The pack's paths and the repo manifest's expected paths do not agree, so the
manifest must be updated to the pack's real paths rather than the pack renamed:

| Repo manifest expects | Pack actually ships |
|---|---|
| `/blue-diamond/hero/homepage-hero.jpg` | `/blue-diamond/home/home-hero-blue-diamond.png` |
| `/blue-diamond/treatments/{id}.jpg` | `/blue-diamond/treatments/{name}-hero.png` |
| `/blue-diamond/technologies/{id}-device.jpg` | `/blue-diamond/technologies/{id}-abstract-card.png` |
| `/blue-diamond/medical/{id}.jpg` | `/blue-diamond/medical/{name}-hero.png` |
| `/blue-diamond/products/skinmedica/{slug}.jpg` | `/blue-diamond/shop/{NN}_{Name}.jpg` |

The pack instruction "preserve the folder structure under `/blue-diamond/…`" is
authoritative here, so the ImageKit paths stay as shipped and the repo follows.
