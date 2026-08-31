import type { BeforeAfterPair } from "@/features/aesthetics/before-after-types";

/**
 * The 14 historical Before/After pairs recovered from the two original
 * Blue Diamond websites — closure brief §17/§18. Every field here was
 * derived from the live sites and their embedded CommonNinja widget
 * datasets during the source audit; nothing is guessed. The full evidence
 * trail is docs/BEFORE_AFTER_SOURCE_AUDIT.md.
 *
 * THREE RULES THIS FILE ENFORCES BY CONSTRUCTION
 *
 * 1. `technologyId` is set only where a source FILENAME names the device
 *    ("PRD-0844-Elite-iQ-BNAs-CAN-EN", "TempSure_Before",
 *    "PRD_4497_TempSureEnvi") or the widget and the source page both name
 *    it (Ultra). It is never set because a result "looks like" a device's
 *    work (§26/§46). Ten of the fourteen therefore carry no technology,
 *    and that is the correct answer, not missing data.
 *
 * 2. `concernId` is set only from the source's own metadata — the widget
 *    the site owner titled "Spider", on the laser page, maps to the
 *    existing `spider-veins` concern. The two widgets titled "Acne …"
 *    record `sourceConditionLabel: "Acne"` but deliberately DO NOT map to
 *    `acne-scars`: acne and acne scarring are different clinical things
 *    and picking one is a clinician's call, not a string match (§30).
 *
 * 3. `treatmentId` comes from the page the widget was embedded on, routed
 *    through this project's own already-verified legacy redirect table
 *    (src/lib/routing/legacy-redirects.ts) — e.g. `/rf-micro-needeling`
 *    is already mapped to `rf-microneedling`. It is a restatement of an
 *    existing verified mapping, not a new judgement.
 *
 * PROVENANCE, HONESTLY. These are device-manufacturer clinical examples
 * (Cynosure), not Blue Diamond patient photography. Four filenames survive
 * anonymisation and prove it outright; the remainder are dimension-matched
 * siblings from the same packs. `rightsStatus` is therefore
 * LEGACY_SITE_USAGE_EVIDENCE for all fourteen — Blue Diamond published
 * them itself, publicly, on its own site, which is real evidence but is
 * NOT a licence, and must never be silently upgraded to
 * VERIFIED_REPUBLISHABLE without a rights document (§22).
 *
 * All 14 are `approved` / `PUBLISHED`. They were held at `pending` for one
 * mechanical reason — the binaries were not yet on the approved CDN, and
 * ImageKitImage renders a real URL only at "approved", so flipping early
 * would have published 28 broken images. The 28 files were imported through
 * FeelStack (scripts/import-before-after.mjs) into
 * /blue-diamond/before-after/, checksum-verified on both sides, and every
 * delivery URL answers 200. The editorial decision to use them was already
 * made; see docs/BEFORE_AFTER_SOURCE_AUDIT.md for what they actually are and
 * for the attribution rules that make using them honest.
 */
export const beforeAfterPairs: BeforeAfterPair[] = [
  {
    pairId: "laser-hair-removal-01",
    treatmentId: "laser-hair-removal",
    description: { en: "Clinical example published on Blue Diamond’s original Laser Hair Removal page.", ar: "مثال سريري كان منشورًا على صفحة إزالة الشعر بالليزر في موقع بلو دايموند الأصلي." },
    before: {
      imagekitPath: "/blue-diamond/before-after/laser-hair-removal-01-before.png",
      alt: { en: "Clinical example before Laser Hair Removal — before image", ar: "مثال سريري قبل إزالة الشعر بالليزر" },
      sourceUrl: "https://cdn.commoninja.com/asset/f9fb1a23-34b2-4e2c-ae3b-faabc98c1dcb.png",
      originalFilename: "f9fb1a23-34b2-4e2c-ae3b-faabc98c1dcb.png",
      width: 1350,
      height: 1080,
      bytes: 1340459,
    },
    after: {
      imagekitPath: "/blue-diamond/before-after/laser-hair-removal-01-after.png",
      alt: { en: "Clinical example after Laser Hair Removal — after image", ar: "مثال سريري بعد إزالة الشعر بالليزر" },
      sourceUrl: "https://cdn.commoninja.com/asset/e1676d6b-a3de-466f-bbe2-f9ae6a111484.png",
      originalFilename: "e1676d6b-a3de-466f-bbe2-f9ae6a111484.png",
      width: 1350,
      height: 1080,
      bytes: 605393,
    },
    provenance: {
      sourceWebsite: "bluediamondmedicalaesthetics.ca",
      sourcePage: "/laser-hair-removal",
      sourceWidget: "Before & After Slider",
    },
    rightsStatus: "LEGACY_SITE_USAGE_EVIDENCE",
    pipelineState: "PUBLISHED",
    approvalStatus: "approved",
  },
  {
    pairId: "laser-hair-removal-02",
    treatmentId: "laser-hair-removal",
    description: { en: "Clinical example published on Blue Diamond’s original Laser Hair Removal page.", ar: "مثال سريري كان منشورًا على صفحة إزالة الشعر بالليزر في موقع بلو دايموند الأصلي." },
    before: {
      imagekitPath: "/blue-diamond/before-after/laser-hair-removal-02-before.png",
      alt: { en: "Clinical example before Laser Hair Removal — before image", ar: "مثال سريري قبل إزالة الشعر بالليزر" },
      sourceUrl: "https://cdn.commoninja.com/asset/aa505c21-c5f6-4b4d-9bcb-45c1fad531bb.png",
      originalFilename: "aa505c21-c5f6-4b4d-9bcb-45c1fad531bb.png",
      width: 1350,
      height: 1080,
      bytes: 1438074,
    },
    after: {
      imagekitPath: "/blue-diamond/before-after/laser-hair-removal-02-after.png",
      alt: { en: "Clinical example after Laser Hair Removal — after image", ar: "مثال سريري بعد إزالة الشعر بالليزر" },
      sourceUrl: "https://cdn.commoninja.com/asset/903cd6a4-0a6f-4fbf-9c2d-aa0524f108f7.png",
      originalFilename: "903cd6a4-0a6f-4fbf-9c2d-aa0524f108f7.png",
      width: 1350,
      height: 1080,
      bytes: 1341986,
    },
    provenance: {
      sourceWebsite: "bluediamondmedicalaesthetics.ca",
      sourcePage: "/laser-hair-removal",
      sourceWidget: "Before & After Slider",
    },
    rightsStatus: "LEGACY_SITE_USAGE_EVIDENCE",
    pipelineState: "PUBLISHED",
    approvalStatus: "approved",
  },
  {
    pairId: "laser-skin-treatments-01",
    treatmentId: "laser-skin-treatments",
    description: { en: "Clinical example published on Blue Diamond’s original Laser Skin Treatments page.", ar: "مثال سريري كان منشورًا على صفحة علاجات البشرة بالليزر في موقع بلو دايموند الأصلي." },
    before: {
      imagekitPath: "/blue-diamond/before-after/laser-skin-treatments-01-before.png",
      alt: { en: "Clinical example before Laser Skin Treatments — before image", ar: "مثال سريري قبل علاجات البشرة بالليزر" },
      sourceUrl: "https://uploads.commoninja.com/before_after/1731549407223_marketing_materials_BA-Elite-C-Nanni-Pigment-Pre-Post2Tx-01_b4.png",
      originalFilename: "1731549407223_marketing_materials_BA-Elite-C-Nanni-Pigment-Pre-Post2Tx-01_b4.png",
      width: 637,
      height: 841,
      bytes: 632460,
    },
    after: {
      imagekitPath: "/blue-diamond/before-after/laser-skin-treatments-01-after.png",
      alt: { en: "Clinical example after Laser Skin Treatments — after image", ar: "مثال سريري بعد علاجات البشرة بالليزر" },
      sourceUrl: "https://cdn.commoninja.com/asset/585a04a7-f48a-401e-b5e4-e454ee4d544f.png",
      originalFilename: "585a04a7-f48a-401e-b5e4-e454ee4d544f.png",
      width: 635,
      height: 843,
      bytes: 453467,
    },
    provenance: {
      sourceWebsite: "bluediamondmedicalaesthetics.ca",
      sourcePage: "/laser-treatment-1",
      sourceWidget: "Before & After Slider copy",
      manufacturer: "Cynosure",
      manufacturerReference: "1731549407223_marketing_materials_BA-Elite-C-Nanni-Pigment-Pre-Post2Tx-01",
    },
    rightsStatus: "LEGACY_SITE_USAGE_EVIDENCE",
    pipelineState: "PUBLISHED",
    approvalStatus: "approved",
  },
  {
    pairId: "laser-skin-treatments-02",
    treatmentId: "laser-skin-treatments",
    description: { en: "Clinical example published on Blue Diamond’s original Laser Skin Treatments page.", ar: "مثال سريري كان منشورًا على صفحة علاجات البشرة بالليزر في موقع بلو دايموند الأصلي." },
    before: {
      imagekitPath: "/blue-diamond/before-after/laser-skin-treatments-02-before.png",
      alt: { en: "Clinical example before Laser Skin Treatments — before image", ar: "مثال سريري قبل علاجات البشرة بالليزر" },
      sourceUrl: "https://cdn.commoninja.com/asset/2cae486a-669d-401c-a132-5514d50bd895.png",
      originalFilename: "2cae486a-669d-401c-a132-5514d50bd895.png",
      width: 637,
      height: 842,
      bytes: 558983,
    },
    after: {
      imagekitPath: "/blue-diamond/before-after/laser-skin-treatments-02-after.png",
      alt: { en: "Clinical example after Laser Skin Treatments — after image", ar: "مثال سريري بعد علاجات البشرة بالليزر" },
      sourceUrl: "https://cdn.commoninja.com/asset/74f4df46-af1b-46df-8a7c-a5aafee8745c.png",
      originalFilename: "74f4df46-af1b-46df-8a7c-a5aafee8745c.png",
      width: 640,
      height: 842,
      bytes: 451555,
    },
    provenance: {
      sourceWebsite: "bluediamondmedicalaesthetics.ca",
      sourcePage: "/laser-treatment-1",
      sourceWidget: "Before & After Slider copy",
    },
    rightsStatus: "LEGACY_SITE_USAGE_EVIDENCE",
    pipelineState: "PUBLISHED",
    approvalStatus: "approved",
  },
  {
    pairId: "laser-skin-treatments-03",
    treatmentId: "laser-skin-treatments",
    concernId: "spider-veins",
    description: { en: "Clinical example published on Blue Diamond’s original Laser Skin Treatments page.", ar: "مثال سريري كان منشورًا على صفحة علاجات البشرة بالليزر في موقع بلو دايموند الأصلي." },
    before: {
      imagekitPath: "/blue-diamond/before-after/laser-skin-treatments-03-before.png",
      alt: { en: "Clinical example before Laser Skin Treatments — before image", ar: "مثال سريري قبل علاجات البشرة بالليزر" },
      sourceUrl: "https://cdn.commoninja.com/asset/5c0f989c-52c2-4280-ba23-dcae97ae21e6.png",
      originalFilename: "5c0f989c-52c2-4280-ba23-dcae97ae21e6.png",
      width: 475,
      height: 842,
      bytes: 443058,
    },
    after: {
      imagekitPath: "/blue-diamond/before-after/laser-skin-treatments-03-after.png",
      alt: { en: "Clinical example after Laser Skin Treatments — after image", ar: "مثال سريري بعد علاجات البشرة بالليزر" },
      sourceUrl: "https://cdn.commoninja.com/asset/d6844b26-514a-49e0-a2f9-f512082bf128.png",
      originalFilename: "d6844b26-514a-49e0-a2f9-f512082bf128.png",
      width: 477,
      height: 842,
      bytes: 330199,
    },
    provenance: {
      sourceWebsite: "bluediamondmedicalaesthetics.ca",
      sourcePage: "/laser-treatment-1",
      sourceWidget: "Spider",
      sourceConditionLabel: "Spider",
    },
    rightsStatus: "LEGACY_SITE_USAGE_EVIDENCE",
    pipelineState: "PUBLISHED",
    approvalStatus: "approved",
  },
  {
    pairId: "laser-skin-treatments-04",
    treatmentId: "laser-skin-treatments",
    description: { en: "Clinical example published on Blue Diamond’s original Laser Skin Treatments page.", ar: "مثال سريري كان منشورًا على صفحة علاجات البشرة بالليزر في موقع بلو دايموند الأصلي." },
    before: {
      imagekitPath: "/blue-diamond/before-after/laser-skin-treatments-04-before.png",
      alt: { en: "Clinical example before Laser Skin Treatments — before image", ar: "مثال سريري قبل علاجات البشرة بالليزر" },
      sourceUrl: "https://cdn.commoninja.com/asset/bb35c22e-814c-4d98-a160-f82f9cc0a528.png",
      originalFilename: "bb35c22e-814c-4d98-a160-f82f9cc0a528.png",
      width: 962,
      height: 848,
      bytes: 732303,
    },
    after: {
      imagekitPath: "/blue-diamond/before-after/laser-skin-treatments-04-after.png",
      alt: { en: "Clinical example after Laser Skin Treatments — after image", ar: "مثال سريري بعد علاجات البشرة بالليزر" },
      sourceUrl: "https://cdn.commoninja.com/asset/d5778a61-859a-4aea-94c0-5fe98f57b861.png",
      originalFilename: "d5778a61-859a-4aea-94c0-5fe98f57b861.png",
      width: 955,
      height: 851,
      bytes: 645304,
    },
    provenance: {
      sourceWebsite: "bluediamondmedicalaesthetics.ca",
      sourcePage: "/laser-treatment-1",
      sourceWidget: "Before & After Slider copy copy",
    },
    rightsStatus: "LEGACY_SITE_USAGE_EVIDENCE",
    pipelineState: "PUBLISHED",
    approvalStatus: "approved",
  },
  {
    pairId: "laser-skin-treatments-05",
    treatmentId: "laser-skin-treatments",
    technologyId: "elite-iq",
    description: { en: "Clinical example published on Blue Diamond’s original Laser Skin Treatments page.", ar: "مثال سريري كان منشورًا على صفحة علاجات البشرة بالليزر في موقع بلو دايموند الأصلي." },
    before: {
      imagekitPath: "/blue-diamond/before-after/laser-skin-treatments-05-before.png",
      alt: { en: "Clinical example before Laser Skin Treatments — before image", ar: "مثال سريري قبل علاجات البشرة بالليزر" },
      sourceUrl: "https://uploads.commoninja.com/before_after/1731549748427_PRD-0844-Elite-iQ-BNAs-CAN-EN_02_B4.png",
      originalFilename: "1731549748427_PRD-0844-Elite-iQ-BNAs-CAN-EN_02_B4.png",
      width: 960,
      height: 848,
      bytes: 554936,
    },
    after: {
      imagekitPath: "/blue-diamond/before-after/laser-skin-treatments-05-after.png",
      alt: { en: "Clinical example after Laser Skin Treatments — after image", ar: "مثال سريري بعد علاجات البشرة بالليزر" },
      sourceUrl: "https://cdn.commoninja.com/asset/8605775d-a270-4f6c-8733-51d095925264.png",
      originalFilename: "8605775d-a270-4f6c-8733-51d095925264.png",
      width: 959,
      height: 848,
      bytes: 525141,
    },
    provenance: {
      sourceWebsite: "bluediamondmedicalaesthetics.ca",
      sourcePage: "/laser-treatment-1",
      sourceWidget: "Before & After Slider copy copy",
      manufacturer: "Cynosure",
      manufacturerReference: "1731549748427_PRD-0844-Elite-iQ-BNAs-CAN-EN_02",
    },
    rightsStatus: "LEGACY_SITE_USAGE_EVIDENCE",
    pipelineState: "PUBLISHED",
    approvalStatus: "approved",
  },
  {
    pairId: "prp-skin-rejuvenation-01",
    treatmentId: "prp-skin-rejuvenation",
    description: { en: "Clinical example published on Blue Diamond’s original PRP Skin Rejuvenation page.", ar: "مثال سريري كان منشورًا على صفحة تجديد البشرة بالبلازما في موقع بلو دايموند الأصلي." },
    before: {
      imagekitPath: "/blue-diamond/before-after/prp-skin-rejuvenation-01-before.png",
      alt: { en: "Clinical example before PRP Skin Rejuvenation — before image", ar: "مثال سريري قبل تجديد البشرة بالبلازما" },
      sourceUrl: "https://cdn.commoninja.com/asset/f2af09b9-a3fe-4176-832e-56c5144fdf97.png",
      originalFilename: "f2af09b9-a3fe-4176-832e-56c5144fdf97.png",
      width: 333,
      height: 470,
      bytes: 94817,
    },
    after: {
      imagekitPath: "/blue-diamond/before-after/prp-skin-rejuvenation-01-after.png",
      alt: { en: "Clinical example after PRP Skin Rejuvenation — after image", ar: "مثال سريري بعد تجديد البشرة بالبلازما" },
      sourceUrl: "https://cdn.commoninja.com/asset/18243572-b4d7-4db9-b208-598570493a2e.PNG",
      originalFilename: "18243572-b4d7-4db9-b208-598570493a2e.PNG",
      width: 331,
      height: 467,
      bytes: 189954,
    },
    provenance: {
      sourceWebsite: "bluediamondmedicalaesthetics.ca",
      sourcePage: "/prp-therapy",
      sourceWidget: "Before & After Slider",
    },
    rightsStatus: "LEGACY_SITE_USAGE_EVIDENCE",
    pipelineState: "PUBLISHED",
    approvalStatus: "approved",
  },
  {
    pairId: "radio-frequency-01",
    treatmentId: "radio-frequency",
    technologyId: "tempsure",
    description: { en: "Clinical example published on Blue Diamond’s original Radio Frequency page.", ar: "مثال سريري كان منشورًا على صفحة الترددات الراديوية في موقع بلو دايموند الأصلي." },
    before: {
      imagekitPath: "/blue-diamond/before-after/radio-frequency-01-before.png",
      alt: { en: "Clinical example before Radio Frequency — before image", ar: "مثال سريري قبل الترددات الراديوية" },
      sourceUrl: "https://uploads.commoninja.com/before_after/1731554603454_TempSure_Before.png",
      originalFilename: "1731554603454_TempSure_Before.png",
      width: 398,
      height: 395,
      bytes: 192904,
    },
    after: {
      imagekitPath: "/blue-diamond/before-after/radio-frequency-01-after.png",
      alt: { en: "Clinical example after Radio Frequency — after image", ar: "مثال سريري بعد الترددات الراديوية" },
      sourceUrl: "https://cdn.commoninja.com/asset/51876c60-5434-4f9d-8d57-41a401de89c0.png",
      originalFilename: "51876c60-5434-4f9d-8d57-41a401de89c0.png",
      width: 397,
      height: 387,
      bytes: 176033,
    },
    provenance: {
      sourceWebsite: "bluediamondmedicalaesthetics.ca",
      sourcePage: "/radio-frequency",
      sourceWidget: "Before & After Slider copy",
      manufacturer: "Cynosure",
      manufacturerReference: "1731554603454_TempSure_Before",
    },
    rightsStatus: "LEGACY_SITE_USAGE_EVIDENCE",
    pipelineState: "PUBLISHED",
    approvalStatus: "approved",
  },
  {
    pairId: "radio-frequency-02",
    treatmentId: "radio-frequency",
    technologyId: "tempsure",
    description: { en: "Clinical example published on Blue Diamond’s original Radio Frequency page.", ar: "مثال سريري كان منشورًا على صفحة الترددات الراديوية في موقع بلو دايموند الأصلي." },
    before: {
      imagekitPath: "/blue-diamond/before-after/radio-frequency-02-before.png",
      alt: { en: "Clinical example before Radio Frequency — before image", ar: "مثال سريري قبل الترددات الراديوية" },
      sourceUrl: "https://uploads.commoninja.com/before_after/1731554683080_PRD_4497_TempSureEnvi_BampA_Standard_Format-921-000-0000_b4.png",
      originalFilename: "1731554683080_PRD_4497_TempSureEnvi_BampA_Standard_Format-921-000-0000_b4.png",
      width: 962,
      height: 550,
      bytes: 536149,
    },
    after: {
      imagekitPath: "/blue-diamond/before-after/radio-frequency-02-after.png",
      alt: { en: "Clinical example after Radio Frequency — after image", ar: "مثال سريري بعد الترددات الراديوية" },
      sourceUrl: "https://cdn.commoninja.com/asset/b093592d-bf76-48ae-b5b3-a47ba77a67a4.png",
      originalFilename: "b093592d-bf76-48ae-b5b3-a47ba77a67a4.png",
      width: 964,
      height: 558,
      bytes: 586647,
    },
    provenance: {
      sourceWebsite: "bluediamondmedicalaesthetics.ca",
      sourcePage: "/radio-frequency",
      sourceWidget: "Before & After Slider copy",
      manufacturer: "Cynosure",
      manufacturerReference: "1731554683080_PRD_4497_TempSureEnvi_BampA_Standard_Format-921-000-0000",
    },
    rightsStatus: "LEGACY_SITE_USAGE_EVIDENCE",
    pipelineState: "PUBLISHED",
    approvalStatus: "approved",
  },
  {
    pairId: "radio-frequency-03",
    treatmentId: "radio-frequency",
    description: { en: "Clinical example published on Blue Diamond’s original Radio Frequency page.", ar: "مثال سريري كان منشورًا على صفحة الترددات الراديوية في موقع بلو دايموند الأصلي." },
    before: {
      imagekitPath: "/blue-diamond/before-after/radio-frequency-03-before.png",
      alt: { en: "Clinical example before Radio Frequency — before image", ar: "مثال سريري قبل الترددات الراديوية" },
      sourceUrl: "https://uploads.commoninja.com/before_after/1737139634411_skin_tone.png",
      originalFilename: "1737139634411_skin_tone.png",
      width: 2048,
      height: 2048,
      bytes: 1364491,
    },
    after: {
      imagekitPath: "/blue-diamond/before-after/radio-frequency-03-after.png",
      alt: { en: "Clinical example after Radio Frequency — after image", ar: "مثال سريري بعد الترددات الراديوية" },
      sourceUrl: "https://cdn.commoninja.com/asset/b8476ddf-03ba-4c8a-b06b-0faa7cc6b14c.png",
      originalFilename: "b8476ddf-03ba-4c8a-b06b-0faa7cc6b14c.png",
      width: 2048,
      height: 2048,
      bytes: 1373192,
    },
    provenance: {
      sourceWebsite: "bluediamondmedicalaesthetics.ca",
      sourcePage: "/radio-frequency",
      sourceWidget: "Before & After Slider copy",
    },
    rightsStatus: "LEGACY_SITE_USAGE_EVIDENCE",
    pipelineState: "PUBLISHED",
    approvalStatus: "approved",
  },
  {
    pairId: "rf-microneedling-01",
    treatmentId: "rf-microneedling",
    description: { en: "Clinical example published on Blue Diamond’s original RF Micro-Needling page.", ar: "مثال سريري كان منشورًا على صفحة الإبر الدقيقة بالترددات الراديوية في موقع بلو دايموند الأصلي." },
    before: {
      imagekitPath: "/blue-diamond/before-after/rf-microneedling-01-before.png",
      alt: { en: "Clinical example before RF Micro-Needling — before image", ar: "مثال سريري قبل الإبر الدقيقة بالترددات الراديوية" },
      sourceUrl: "https://cdn.commoninja.com/asset/cfd1cc48-37dd-4a8f-9723-df9f6f8d9994.png",
      originalFilename: "cfd1cc48-37dd-4a8f-9723-df9f6f8d9994.png",
      width: 2048,
      height: 2048,
      bytes: 1653563,
    },
    after: {
      imagekitPath: "/blue-diamond/before-after/rf-microneedling-01-after.png",
      alt: { en: "Clinical example after RF Micro-Needling — after image", ar: "مثال سريري بعد الإبر الدقيقة بالترددات الراديوية" },
      sourceUrl: "https://cdn.commoninja.com/asset/69543d8d-d873-4561-be13-a3403459ee74.png",
      originalFilename: "69543d8d-d873-4561-be13-a3403459ee74.png",
      width: 2048,
      height: 2048,
      bytes: 1203656,
    },
    provenance: {
      sourceWebsite: "bluediamondmedicalaesthetics.ca",
      sourcePage: "/rf-micro-needeling",
      sourceWidget: "Acne Before & After Slider",
      sourceConditionLabel: "Acne",
    },
    rightsStatus: "LEGACY_SITE_USAGE_EVIDENCE",
    pipelineState: "PUBLISHED",
    approvalStatus: "approved",
  },
  {
    pairId: "rf-microneedling-02",
    treatmentId: "rf-microneedling",
    description: { en: "Clinical example published on Blue Diamond’s original RF Micro-Needling page.", ar: "مثال سريري كان منشورًا على صفحة الإبر الدقيقة بالترددات الراديوية في موقع بلو دايموند الأصلي." },
    before: {
      imagekitPath: "/blue-diamond/before-after/rf-microneedling-02-before.png",
      alt: { en: "Clinical example before RF Micro-Needling — before image", ar: "مثال سريري قبل الإبر الدقيقة بالترددات الراديوية" },
      sourceUrl: "https://cdn.commoninja.com/asset/20307aa1-1db5-432a-a5f6-467506e23a98.png",
      originalFilename: "20307aa1-1db5-432a-a5f6-467506e23a98.png",
      width: 2048,
      height: 2048,
      bytes: 1702708,
    },
    after: {
      imagekitPath: "/blue-diamond/before-after/rf-microneedling-02-after.png",
      alt: { en: "Clinical example after RF Micro-Needling — after image", ar: "مثال سريري بعد الإبر الدقيقة بالترددات الراديوية" },
      sourceUrl: "https://cdn.commoninja.com/asset/86c6139d-f219-4966-9925-45d5c7ab392d.png",
      originalFilename: "86c6139d-f219-4966-9925-45d5c7ab392d.png",
      width: 2048,
      height: 2048,
      bytes: 1362841,
    },
    provenance: {
      sourceWebsite: "bluediamondmedicalaesthetics.ca",
      sourcePage: "/rf-micro-needeling",
      sourceWidget: "Acne Before & After Slider",
      sourceConditionLabel: "Acne",
    },
    rightsStatus: "LEGACY_SITE_USAGE_EVIDENCE",
    pipelineState: "PUBLISHED",
    approvalStatus: "approved",
  },
  {
    pairId: "ultra-01",
    treatmentId: "ultra",
    technologyId: "ultra",
    description: { en: "Clinical example published on Blue Diamond’s original Ultra page.", ar: "مثال سريري كان منشورًا على صفحة ألترا في موقع بلو دايموند الأصلي." },
    before: {
      imagekitPath: "/blue-diamond/before-after/ultra-01-before.png",
      alt: { en: "Clinical example before Ultra — before image", ar: "مثال سريري قبل ألترا" },
      sourceUrl: "https://cdn.commoninja.com/asset/9050204a-cd1b-493e-b57a-b278ed2b9b1f.png",
      originalFilename: "9050204a-cd1b-493e-b57a-b278ed2b9b1f.png",
      width: 513,
      height: 547,
      bytes: 415998,
    },
    after: {
      imagekitPath: "/blue-diamond/before-after/ultra-01-after.png",
      alt: { en: "Clinical example after Ultra — after image", ar: "مثال سريري بعد ألترا" },
      sourceUrl: "https://cdn.commoninja.com/asset/82381d99-3cf6-499f-9f04-cf8172df4b17.png",
      originalFilename: "82381d99-3cf6-499f-9f04-cf8172df4b17.png",
      width: 508,
      height: 549,
      bytes: 345154,
    },
    provenance: {
      sourceWebsite: "bluediamondmedicalaesthetics.ca",
      sourcePage: "/ultra-treatment",
      sourceWidget: "Ultra Treatement",
      manufacturer: "Cynosure",
    },
    rightsStatus: "LEGACY_SITE_USAGE_EVIDENCE",
    pipelineState: "PUBLISHED",
    approvalStatus: "approved",
  },];

/** Pairs whose binaries are live on the CDN and cleared to render. */
export function publishableBeforeAfterPairs(): BeforeAfterPair[] {
  return beforeAfterPairs.filter((p) => p.approvalStatus === "approved");
}

export function getBeforeAfterPairs(treatmentId?: string): BeforeAfterPair[] {
  const pairs = publishableBeforeAfterPairs();
  if (!treatmentId) return pairs;
  return pairs.filter((p) => p.treatmentId === treatmentId);
}

/**
 * The other two entry points the relationship model needs (§26/§30/§31).
 * Both are strict equality on an explicitly recorded id: neither infers a
 * relationship from the treatment's own concern or technology lists,
 * because "this treatment usually addresses acne scars" is not evidence
 * that THIS photograph shows acne scars.
 */
export function getBeforeAfterPairsForConcern(concernId: string): BeforeAfterPair[] {
  return publishableBeforeAfterPairs().filter((p) => p.concernId === concernId);
}

export function getBeforeAfterPairsForTechnology(technologyId: string): BeforeAfterPair[] {
  return publishableBeforeAfterPairs().filter((p) => p.technologyId === technologyId);
}
