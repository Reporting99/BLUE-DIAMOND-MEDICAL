# Before / After — source audit of both original Blue Diamond websites

**Date of audit:** 2026-08-31
**Method:** independent live crawl + real-browser render of both original sites.
Nothing in this document is taken from an earlier pass's notes; every row was
re-derived from the live sites during this audit.

## 1. Scope actually covered

Both original sites were crawled in full (link-following crawl from the
homepage, stopping only at external hosts and binary assets):

| Site | Pages discovered and fetched |
|---|---|
| `bluediamondmedical.ca` | 11 content pages (`/`, `/appointment-1`, `/botox-1`, `/clinic-policies`, `/contact-us`, `/eye-examining`, `/join-our-team`, `/medical-aesthetics-1`, `/our-team`, `/primary-care-network`, `/services`) |
| `bluediamondmedicalaesthetics.ca` | 22 content pages (`/`, `/acne-scar-removal`, `/area-concern`, `/dry-skin-remediation`, `/fineline-and-wrinkle`, `/laser-hair-removal`, `/laser-treatment-1`, `/non-invasive-skin`, `/our-team`, `/our-technologies`, `/privacy-policy`, `/prp-therapy`, `/radio-frequency`, `/razor-bumps`, `/rf-micro-needeling`, `/rosacea-abatement`, `/skin-revitalization`, `/spider-vein`, `/sun-damage`, `/terms-and-conditions`, `/treatments`, `/ultra-treatment`) |

Static HTML alone is **not** sufficient on these sites: they are GoDaddy
Website Builder sites, and the result galleries are third-party embeds whose
content is not in the page source. Every page was therefore also rendered in a
real Chromium browser, scrolled end-to-end, and every image response recorded
at the network layer.

## 2. Where result media actually lives

Five pages carry a "Before & After Photos" / "Before and After" heading:
`/laser-hair-removal`, `/laser-treatment-1`, `/radio-frequency`,
`/rf-micro-needeling`, `/ultra-treatment` (plus `/prp-therapy`, whose slider
has no heading).

In every case the gallery is a **CommonNinja "Before & After Slider" widget**
embedded in an iframe. The page HTML contains only:

```html
<div class="commonninja_component pid-f4b986b5-406e-422b-b526-cce8444ef384"></div>
```

The pairs were recovered from the widget's own data endpoint
(`https://cdn.commoninja.com/api/v1/embed/<projectId>`), which returns the
configured `sliders[]` array with `beforeImage` / `afterImage` URLs. All 28
images (14 pairs) were downloaded and inspected.

## 3. Complete inventory — 14 pairs

| # | Source page | Widget | Before file | After file |
|---|---|---|---|---|
| 1 | `/laser-hair-removal` | Before & After Slider | `asset/f9fb1a23…png` | `asset/e1676d6b…png` |
| 2 | `/laser-hair-removal` | Before & After Slider | `asset/aa505c21…png` | `asset/903cd6a4…png` |
| 3 | `/laser-treatment-1` | "…copy" | **`before_after/1731549407223_marketing_materials_BA-Elite-C-Nanni-Pigment-Pre-Post2Tx-01_b4.png`** | `asset/585a04a7…png` |
| 4 | `/laser-treatment-1` | "…copy" | `asset/2cae486a…png` | `asset/74f4df46…png` |
| 5 | `/laser-treatment-1` | "Spider" | `asset/5c0f989c…png` | `asset/d6844b26…png` |
| 6 | `/laser-treatment-1` | "…copy copy" | `asset/bb35c22e…png` | `asset/d5778a61…png` |
| 7 | `/laser-treatment-1` | "…copy copy" | **`before_after/1731549748427_PRD-0844-Elite-iQ-BNAs-CAN-EN_02_B4.png`** | `asset/8605775d…png` |
| 8 | `/prp-therapy` | Before & After Slider | `asset/f2af09b9…png` | `asset/18243572…PNG` |
| 9 | `/radio-frequency` | "…copy" | **`before_after/1731554603454_TempSure_Before.png`** | `asset/51876c60…png` |
| 10 | `/radio-frequency` | "…copy" | **`before_after/1731554683080_PRD_4497_TempSureEnvi_BampA_Standard_Format-921-000-0000_b4.png`** | `asset/b093592d…png` |
| 11 | `/radio-frequency` | "…copy" | `before_after/1737139634411_skin_tone.png` | `asset/b8476ddf…png` |
| 12 | `/rf-micro-needeling` | "Acne Before & After Slider" | `asset/cfd1cc48…png` | `asset/69543d8d…png` |
| 13 | `/rf-micro-needeling` | "Acne Before & After Slider" | `asset/20307aa1…png` | `asset/86c6139d…png` |
| 14 | `/ultra-treatment` | "Ultra Treatement" | `asset/9050204a…png` | `asset/82381d99…png` |

Additionally, the aesthetics `/treatments` page embeds these result-style
images directly (not in a widget):
`PRD-0844-Elite-iQ-BNAs-CAN-EN_02.jpg`,
`PRD-0844-Elite-iQ-BNAs-CAN-EN_04 before.png`,
`PRD-1960-Ultra-BNAs-WebFormat-560x560-01.png`,
`marketing_materials_BA-Elite-C-Arroyo-LegVeins.png/.jpg`,
`marketing_materials_BA-Elite-C-Arroyo-Pigment-.png/.jpg`,
`AMP_4265_Social_TempSure-Vitalia-2021-Winter-A.jpg`, `Acne-2.png`,
`Acne-3.png`, `After-PRP-treatment.PNG`, `Artboard-30-80.jpg`,
`loose-skin.jpg`; `/sun-damage` embeds
`marketing_materials_BA-Elite-C-Nanni-Pigment-P.jpg`; `/spider-vein` embeds
`marketing_materials_BA-Elite-C-Arroyo-LegVeins.jpg`; `/non-invasive-skin`
embeds `PRD-1408-Ultra-Skin-Solutions-BNAs-Format-AMPS.jpg`.

## 4. Provenance finding

**None of this media is Blue Diamond patient photography.** It is Cynosure
device-manufacturer clinical marketing collateral showing other clinicians'
patients. The four filenames the CommonNinja upload pipeline did not
anonymise state it outright:

- `marketing_materials_BA-Elite-C-Nanni-Pigment-Pre-Post2Tx-01_b4.png` —
  Cynosure Elite+ marketing materials, **Dr. Nanni's** patient, "pre / post
  2 treatments".
- `PRD-0844-Elite-iQ-BNAs-CAN-EN_02_B4.png` — Cynosure product document
  PRD-0844, "Elite iQ **B**efore-a**N**d-**A**fter**s**, Canada English".
- `PRD_4497_TempSureEnvi_BampA_Standard_Format-921-000-0000_b4.png` —
  Cynosure product document PRD-4497, TempSure Envi B&A pack.
- `marketing_materials_BA-Elite-C-Arroyo-*` (on `/treatments`, `/sun-damage`,
  `/spider-vein`) — same pack, **Dr. Arroyo's** patients.

The anonymised `cdn.commoninja.com/asset/<uuid>` partners are from the same
packs: each pair's two files share framing, lighting and dimensions to within
1–3 pixels (e.g. pair 3 is 637×841 / 635×843), which is what an export from a
single source pack looks like, not two independent clinic photographs.

Every image was inspected. They are genuine clinical photographs — including
identifiable patient faces (pairs 12/13, 2048×2048 facial acne views) — which
makes the provenance question more serious, not less: publishing an
identifiable patient's face as a Blue Diamond result requires that patient's
consent, held by Blue Diamond, which cannot exist for another clinic's patient.

## 5. Decision — USE these assets, with accurate provenance

**Superseded 2026-08-31 (closure pass).** An earlier pass recommended
discarding this media. The client decision is the opposite and is what this
repository now implements: **all 14 pairs are used**, because manufacturer
clinical collateral is a legitimate, publishable class of asset *provided
the site says what it is*. What was never acceptable — and still is not —
is presenting another clinician's patient as a Blue Diamond result.

So the assets are kept, and the honesty is enforced in code rather than in
a style guide:

| Rule | Where it is enforced |
|---|---|
| Section is titled "Clinical Before & After Examples", not "Our Results" | `clinicalExamplesHeading`, rendered by `BeforeAfterGallery` |
| Every gallery states "…provided by the technology manufacturer. These are not Blue Diamond Medical patients." | `clinicalExamplesIntro`, rendered once above every set |
| A pair whose filename evidences the maker names it per-pair | `attributionFor()`, called by `BeforeAfterSlider` — not optional at the call site |
| No copy may claim Blue Diamond ownership | `tests/unit/before-after-provenance.spec.ts` fails on "our patient", "treated at Blue Diamond", … |
| Rights are never overstated | same spec asserts `rightsStatus === "LEGACY_SITE_USAGE_EVIDENCE"` for all 14 |

## 6. What was imported, mapped and registered

| Stage | Count |
|---|---|
| FOUND (widget datasets) | 14 pairs / 28 files |
| DOWNLOADED + SHA-256 recorded | 28 / 28 |
| REGISTERED in `beforeAfterPairs` | 14 / 14 |
| MAPPED to a treatment | 14 / 14 |
| MAPPED to a technology (filename/widget evidence only) | 4 |
| MAPPED to a concern (source metadata only) | 1 |
| PUBLISHED (binary live on the approved CDN) | 0 — see §7 |

`scripts/before-after-manifest.json` carries every file's source URL,
original filename, byte size and SHA-256. `scripts/import-before-after.mjs`
re-verifies each checksum and uploads to ImageKit; it has been run in
verify mode from both the staged directory and, independently, by
re-downloading every file from its recorded source URL — **28/28 verified,
0 failed, in both modes**, so the payload is reproducible from provenance
alone.

### Technology mapping — the evidence, pair by pair

| Pair | Technology | Evidence |
|---|---|---|
| `laser-skin-treatments-05` | `elite-iq` | filename `PRD-0844-Elite-iQ-BNAs-CAN-EN_02_B4.png` |
| `radio-frequency-01` | `tempsure` | filename `TempSure_Before.png` |
| `radio-frequency-02` | `tempsure` | filename `PRD_4497_TempSureEnvi_BampA_Standard_Format-921-000-0000_b4.png` |
| `ultra-01` | `ultra` | widget "Ultra Treatement" on source page `/ultra-treatment` |
| the other 10 | *(none)* | anonymised filenames — no device named, so none claimed |

`laser-skin-treatments-03` is the only concern mapping (`spider-veins`),
from the site owner's own widget title "Spider". The two "Acne …" widgets
record `sourceConditionLabel: "Acne"` but map to no concern: the registry's
term is `acne-scars`, and acne is not acne scarring.

## 7. The one remaining step

`approvalStatus` is `"pending"` on all 14 and `beforeAfterEnabled` is
`false`. This is **not** an editorial hold — the decision to use these
assets is made. It is one mechanical fact:

> **`IMAGEKIT_PRIVATE_KEY` does not exist anywhere on this host** — not in
> `/home/blue-diamond/shared/*.env`, not in any release `.env`. The 28
> binaries therefore cannot be uploaded to `ik.imagekit.io/oq92dh6zib`, and
> `ImageKitImage` renders a real CDN URL only at `approved`. Flipping the
> flag now would publish 28 URLs with no file behind them — 28 broken
> images on treatment, technology and gallery pages.

To finish, with the key available:

```bash
BEFORE_AFTER_STAGE_DIR=/home/blue-diamond/tmp/before-after-migration \
IMAGEKIT_PRIVATE_KEY=… node scripts/import-before-after.mjs --upload
```

then set each pair's `approvalStatus` to `"approved"` and `pipelineState`
to `"PUBLISHED"`, and `features.beforeAfterEnabled` to `true`. No code
change is required — the gallery, the attribution, the relationships, the
routes and the tests are all in place and exercised.

The staged payload is at `/home/blue-diamond/tmp/before-after-migration/`
(28 files, 21,251,425 bytes), and is fully reconstructible from the
manifest if that directory is lost.
