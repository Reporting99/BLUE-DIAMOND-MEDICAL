<!-- Generated 2026-08-24 by the ImageKit + FeelStack media import run.
     The run STOPPED at the Phase 1 credential gate: no bytes were uploaded to
     ImageKit and no FeelStack record was written. Every "planned" column below
     is a plan, not a result. -->

# ImageKit Import Report

**Status: BLOCKED at Phase 1 — no upload performed.**

Blue Diamond's runtime environment (`/home/blue-diamond/shared/.env.production`, symlinked
into each release as `.env`) configures `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` but carries no
ImageKit public or private key. The authenticated Upload API cannot be called, so all 37
`UPLOAD_NEW` rows below are planned, not executed.

Media root: `/blue-diamond/` &nbsp;·&nbsp; endpoint: `https://ik.imagekit.io/oq92dh6zib`

## Verification method

Every `REUSE_IDENTICAL_EXISTING` row was proven by fetching the live delivery URL
unauthenticated and comparing the returned bytes' SHA-256 against the local file. No row is
marked reusable on filename or size alone. `UPLOAD_NEW` rows returned HTTP 404 at their
target path — nothing exists there to collide with.

| Source file | ImageKit path | Action | ImageKit file ID | Verification status |
|---|---|---|---|---|
| `blue-diamond/aesthetics/aesthetics-hub-hero.png` | `/blue-diamond/aesthetics/aesthetics-hub-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/aesthetics/concerns-hub-natural-skin.png` | `/blue-diamond/aesthetics/concerns-hub-natural-skin.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/aesthetics/technologies-hub-abstract.png` | `/blue-diamond/aesthetics/technologies-hub-abstract.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/home/home-hero-blue-diamond.png` | `/blue-diamond/home/home-hero-blue-diamond.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/medical/eye-screening-hero.png` | `/blue-diamond/medical/eye-screening-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/medical/medical-botox-consultation-hero.png` | `/blue-diamond/medical/medical-botox-consultation-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/medical/medical-family-care-hero.png` | `/blue-diamond/medical/medical-family-care-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shared/about-patient-care-hero.png` | `/blue-diamond/shared/about-patient-care-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shared/booking-contact-hero.png` | `/blue-diamond/shared/booking-contact-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shared/careers-team-hero.png` | `/blue-diamond/shared/careers-team-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shared/contact-calgary-location-hero.png` | `/blue-diamond/shared/contact-calgary-location-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shared/open-graph-background.png` | `/blue-diamond/shared/open-graph-background.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shared/patient-resources-uninsured-hero.png` | `/blue-diamond/shared/patient-resources-uninsured-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shop/01_LUMIVIVE_System_Day_Night.jpg` | `/blue-diamond/shop/01_LUMIVIVE_System_Day_Night.jpg` | REUSE_IDENTICAL_EXISTING | unknown (needs Media API key) | SHA-256 of delivered bytes == local file — IDENTICAL |
| `blue-diamond/shop/02_TNS_Eye_Repair.jpg` | `/blue-diamond/shop/02_TNS_Eye_Repair.jpg` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shop/03_Vitamin_C_E_Complex.jpg` | `/blue-diamond/shop/03_Vitamin_C_E_Complex.jpg` | REUSE_IDENTICAL_EXISTING | unknown (needs Media API key) | SHA-256 of delivered bytes == local file — IDENTICAL |
| `blue-diamond/shop/04_Facial_Cleanser.jpg` | `/blue-diamond/shop/04_Facial_Cleanser.jpg` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shop/05_AHA_BHA_Exfoliating_Cleanser.jpg` | `/blue-diamond/shop/05_AHA_BHA_Exfoliating_Cleanser.jpg` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shop/06_Retinol_Complex_0_25.jpg` | `/blue-diamond/shop/06_Retinol_Complex_0_25.jpg` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shop/07_Retinol_Complex_0_5.jpg` | `/blue-diamond/shop/07_Retinol_Complex_0_5.jpg` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shop/08_Retinol_Complex_1_0.jpg` | `/blue-diamond/shop/08_Retinol_Complex_1_0.jpg` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shop/10_AHA_BHA_Cream.jpg` | `/blue-diamond/shop/10_AHA_BHA_Cream.jpg` | REUSE_IDENTICAL_EXISTING | unknown (needs Media API key) | SHA-256 of delivered bytes == local file — IDENTICAL |
| `blue-diamond/shop/13_Total_Defense_Repair_SPF_34_Clear.jpg` | `/blue-diamond/shop/13_Total_Defense_Repair_SPF_34_Clear.jpg` | REUSE_IDENTICAL_EXISTING | unknown (needs Media API key) | SHA-256 of delivered bytes == local file — IDENTICAL |
| `blue-diamond/shop/14_Dermal_Repair_Cream.jpg` | `/blue-diamond/shop/14_Dermal_Repair_Cream.jpg` | REUSE_IDENTICAL_EXISTING | unknown (needs Media API key) | SHA-256 of delivered bytes == local file — IDENTICAL |
| `blue-diamond/shop/15_Rejuvenative_Moisturizer.jpg` | `/blue-diamond/shop/15_Rejuvenative_Moisturizer.jpg` | REUSE_IDENTICAL_EXISTING | unknown (needs Media API key) | SHA-256 of delivered bytes == local file — IDENTICAL |
| `blue-diamond/shop/17_TNS_Ceramide_Treatment_Cream.jpg` | `/blue-diamond/shop/17_TNS_Ceramide_Treatment_Cream.jpg` | REUSE_IDENTICAL_EXISTING | unknown (needs Media API key) | SHA-256 of delivered bytes == local file — IDENTICAL |
| `blue-diamond/shop/18_Ultra_Sheer_Moisturizer.jpg` | `/blue-diamond/shop/18_Ultra_Sheer_Moisturizer.jpg` | REUSE_IDENTICAL_EXISTING | unknown (needs Media API key) | SHA-256 of delivered bytes == local file — IDENTICAL |
| `blue-diamond/shop/19_Scar_Recovery_Gel_with_Centelline_Small.jpg` | `/blue-diamond/shop/19_Scar_Recovery_Gel_with_Centelline_Small.jpg` | REUSE_IDENTICAL_EXISTING | unknown (needs Media API key) | SHA-256 of delivered bytes == local file — IDENTICAL |
| `blue-diamond/shop/20_Scar_Recovery_Gel_with_Centelline_Large.jpg` | `/blue-diamond/shop/20_Scar_Recovery_Gel_with_Centelline_Large.jpg` | REUSE_IDENTICAL_EXISTING | unknown (needs Media API key) | SHA-256 of delivered bytes == local file — IDENTICAL |
| `blue-diamond/shop/21_TNS_Advanced_Plus_Serum.jpg` | `/blue-diamond/shop/21_TNS_Advanced_Plus_Serum.jpg` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shop/22_TNS_Recovery_Complex.jpg` | `/blue-diamond/shop/22_TNS_Recovery_Complex.jpg` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shop/23_HA5_Current_Reformulation.jpg` | `/blue-diamond/shop/23_HA5_Current_Reformulation.jpg` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shop/product-image-pending-abstract.png` | `/blue-diamond/shop/product-image-pending-abstract.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/shop/skinmedica-catalogue-hero-neutral.png` | `/blue-diamond/shop/skinmedica-catalogue-hero-neutral.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/technologies/elite-iq-abstract-card.png` | `/blue-diamond/technologies/elite-iq-abstract-card.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/technologies/potenza-abstract-card.png` | `/blue-diamond/technologies/potenza-abstract-card.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/technologies/tempsure-abstract-card.png` | `/blue-diamond/technologies/tempsure-abstract-card.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/technologies/tempsure-vitalia-abstract-card.png` | `/blue-diamond/technologies/tempsure-vitalia-abstract-card.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/technologies/ultra-abstract-card.png` | `/blue-diamond/technologies/ultra-abstract-card.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/treatments/cosmetic-botox-hero.png` | `/blue-diamond/treatments/cosmetic-botox-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/treatments/laser-hair-removal-hero.png` | `/blue-diamond/treatments/laser-hair-removal-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/treatments/laser-skin-treatments-hero.png` | `/blue-diamond/treatments/laser-skin-treatments-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/treatments/prp-hair-restoration-hero.png` | `/blue-diamond/treatments/prp-hair-restoration-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/treatments/prp-skin-rejuvenation-hero.png` | `/blue-diamond/treatments/prp-skin-rejuvenation-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/treatments/radio-frequency-skin-tightening-hero.png` | `/blue-diamond/treatments/radio-frequency-skin-tightening-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/treatments/rf-microneedling-hero.png` | `/blue-diamond/treatments/rf-microneedling-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |
| `blue-diamond/treatments/ultra-pigmentation-hero.png` | `/blue-diamond/treatments/ultra-pigmentation-hero.png` | UPLOAD_NEW | n/a — not uploaded | target 404 — no collision, upload pending credentials |

## Local asset facts (source of the width/height/aspect-ratio a FeelStack record needs)

| ImageKit path | Type | W×H | Aspect ratio | Bytes | SHA-256 |
|---|---|---|---|---|---|
| `/blue-diamond/aesthetics/aesthetics-hub-hero.png` | png | 1672×941 | 1.7768 | 1635563 | `9a337eec4c3931431cad10a97ac4b3fe…` |
| `/blue-diamond/aesthetics/concerns-hub-natural-skin.png` | png | 1672×941 | 1.7768 | 1890485 | `13b430841bbcb1099df0c74604ee93e1…` |
| `/blue-diamond/aesthetics/technologies-hub-abstract.png` | png | 1672×941 | 1.7768 | 1681458 | `4825c8dd9a91a3dcb8ffeb91666e6b9c…` |
| `/blue-diamond/home/home-hero-blue-diamond.png` | png | 1672×941 | 1.7768 | 1668396 | `d7e23dbad409b83d9628163d7d97db8a…` |
| `/blue-diamond/medical/eye-screening-hero.png` | png | 1672×941 | 1.7768 | 1710436 | `e3ff707d0da229e30ec4ec8a77f816c3…` |
| `/blue-diamond/medical/medical-botox-consultation-hero.png` | png | 1672×941 | 1.7768 | 1672845 | `d28415348b8c27ce34c41bec6aff2c05…` |
| `/blue-diamond/medical/medical-family-care-hero.png` | png | 1672×941 | 1.7768 | 1689663 | `1025872a42d86d2ae54710914c8d69dc…` |
| `/blue-diamond/shared/about-patient-care-hero.png` | png | 1672×941 | 1.7768 | 1473378 | `419684e16641354ea7ad0a71ae180c7d…` |
| `/blue-diamond/shared/booking-contact-hero.png` | png | 1672×941 | 1.7768 | 1475202 | `09a1b52eb8b129220911dbbc60204cb4…` |
| `/blue-diamond/shared/careers-team-hero.png` | png | 1672×941 | 1.7768 | 1585747 | `2cf87ae0163be02b739664fad3ba05d2…` |
| `/blue-diamond/shared/contact-calgary-location-hero.png` | png | 1672×941 | 1.7768 | 1434685 | `46891e2c14815bcec00e5ffe093ed92b…` |
| `/blue-diamond/shared/open-graph-background.png` | png | 1733×908 | 1.9086 | 1089724 | `6e1b9715c2546163c645e2e3f1b878ee…` |
| `/blue-diamond/shared/patient-resources-uninsured-hero.png` | png | 1672×941 | 1.7768 | 1478893 | `4cd3844afac9e3697d71a3ffbdeac1fa…` |
| `/blue-diamond/shop/01_LUMIVIVE_System_Day_Night.jpg` | jpeg | 1074×1074 | 1.0 | 32761 | `3ada7ab20dff70ada10b3ecb3b0e995f…` |
| `/blue-diamond/shop/02_TNS_Eye_Repair.jpg` | jpeg | 1074×1074 | 1.0 | 21282 | `ed70ad9da280edc91971d2f5a2593f03…` |
| `/blue-diamond/shop/03_Vitamin_C_E_Complex.jpg` | jpeg | 1074×1074 | 1.0 | 22013 | `82ad1c596cb194dc5212c3d1b86271b9…` |
| `/blue-diamond/shop/04_Facial_Cleanser.jpg` | jpeg | 1074×1074 | 1.0 | 24993 | `8d6b7684e98b883430058eba866b0acd…` |
| `/blue-diamond/shop/05_AHA_BHA_Exfoliating_Cleanser.jpg` | jpeg | 1074×1074 | 1.0 | 26299 | `aa7022bcb8950edda4c9c25e1ab12435…` |
| `/blue-diamond/shop/06_Retinol_Complex_0_25.jpg` | jpeg | 1074×1074 | 1.0 | 21859 | `5b087bafbcfcffaa6027518e0f83e96e…` |
| `/blue-diamond/shop/07_Retinol_Complex_0_5.jpg` | jpeg | 1074×1074 | 1.0 | 21802 | `3816c8159e54a8263293f34c01ac333c…` |
| `/blue-diamond/shop/08_Retinol_Complex_1_0.jpg` | jpeg | 1074×1074 | 1.0 | 21731 | `7b26cfb74c0b11c6e7c26c579dd56183…` |
| `/blue-diamond/shop/10_AHA_BHA_Cream.jpg` | jpeg | 1074×1074 | 1.0 | 23909 | `0f220365b392753e849b408006efa74a…` |
| `/blue-diamond/shop/13_Total_Defense_Repair_SPF_34_Clear.jpg` | jpeg | 954×1428 | 0.6681 | 41646 | `e35f0da68336b710fe6b971dd47ae1c5…` |
| `/blue-diamond/shop/14_Dermal_Repair_Cream.jpg` | jpeg | 1074×1074 | 1.0 | 21590 | `f9467840904766d0331b5324db5d9aa6…` |
| `/blue-diamond/shop/15_Rejuvenative_Moisturizer.jpg` | jpeg | 1074×1074 | 1.0 | 22560 | `badc5d1bd4136d3a29b6309ec327d7ce…` |
| `/blue-diamond/shop/17_TNS_Ceramide_Treatment_Cream.jpg` | jpeg | 1074×1074 | 1.0 | 23089 | `b29595c4b8af4b3e7f7f8196b5c2d9e2…` |
| `/blue-diamond/shop/18_Ultra_Sheer_Moisturizer.jpg` | jpeg | 1074×1074 | 1.0 | 23512 | `bde71850751adfcf658abb2820130e25…` |
| `/blue-diamond/shop/19_Scar_Recovery_Gel_with_Centelline_Small.jpg` | jpeg | 1074×1074 | 1.0 | 23715 | `612f1800b273e01c9e9eb73e91c878f5…` |
| `/blue-diamond/shop/20_Scar_Recovery_Gel_with_Centelline_Large.jpg` | jpeg | 1074×1074 | 1.0 | 23715 | `612f1800b273e01c9e9eb73e91c878f5…` |
| `/blue-diamond/shop/21_TNS_Advanced_Plus_Serum.jpg` | jpeg | 1074×1074 | 1.0 | 25552 | `90cd6da3447727c9849bc43343ed7e9d…` |
| `/blue-diamond/shop/22_TNS_Recovery_Complex.jpg` | jpeg | 1074×1074 | 1.0 | 22752 | `106027521598841dd4595daac066529e…` |
| `/blue-diamond/shop/23_HA5_Current_Reformulation.jpg` | jpeg | 1074×1074 | 1.0 | 25937 | `146ef3cb9e66f72e2aade457d5690d54…` |
| `/blue-diamond/shop/product-image-pending-abstract.png` | png | 1254×1254 | 1.0 | 1431962 | `c1d4ff6e46381eb6bc0027937ef0fe97…` |
| `/blue-diamond/shop/skinmedica-catalogue-hero-neutral.png` | png | 1672×941 | 1.7768 | 1527687 | `1b73e5cefc78c1016aa51e60e12c9c73…` |
| `/blue-diamond/technologies/elite-iq-abstract-card.png` | png | 1254×1254 | 1.0 | 2005256 | `425df774ad409b8f9ebf79c6fe2d2916…` |
| `/blue-diamond/technologies/potenza-abstract-card.png` | png | 1254×1254 | 1.0 | 2086372 | `21bd9bea5afc88104bd5e46f172af7c4…` |
| `/blue-diamond/technologies/tempsure-abstract-card.png` | png | 1254×1254 | 1.0 | 1965306 | `75321410f2c8659331b5bd8c3bbb994e…` |
| `/blue-diamond/technologies/tempsure-vitalia-abstract-card.png` | png | 1254×1254 | 1.0 | 1750692 | `6d9c0bdfdec6b3d77031eda302fd9a1a…` |
| `/blue-diamond/technologies/ultra-abstract-card.png` | png | 1254×1254 | 1.0 | 2206076 | `3aec10f2c43e83faa2a01b241554c067…` |
| `/blue-diamond/treatments/cosmetic-botox-hero.png` | png | 1672×941 | 1.7768 | 1684389 | `e7873d4b1889560f3c0e758200d03e9d…` |
| `/blue-diamond/treatments/laser-hair-removal-hero.png` | png | 1672×941 | 1.7768 | 1526350 | `0c63e2ddeb7ae99c916a952313b47522…` |
| `/blue-diamond/treatments/laser-skin-treatments-hero.png` | png | 1672×941 | 1.7768 | 1652973 | `0d974a24654557a64466506c011328a7…` |
| `/blue-diamond/treatments/prp-hair-restoration-hero.png` | png | 1672×941 | 1.7768 | 1791032 | `3a01e4878012334caca52ba074296d9e…` |
| `/blue-diamond/treatments/prp-skin-rejuvenation-hero.png` | png | 1672×941 | 1.7768 | 1680933 | `75339f1060b6794e8f7393ee157c49fc…` |
| `/blue-diamond/treatments/radio-frequency-skin-tightening-hero.png` | png | 1672×941 | 1.7768 | 1674746 | `a6fd70b7c6cf6e9787dfd252fe661947…` |
| `/blue-diamond/treatments/rf-microneedling-hero.png` | png | 1672×941 | 1.7768 | 1560857 | `1a8fb92fdacb9f001e95b9efffada179…` |
| `/blue-diamond/treatments/ultra-pigmentation-hero.png` | png | 1672×941 | 1.7768 | 1690935 | `14e99877ac43f9534273afa03a448d1e…` |

All 47 SHA-256 values match the pack's own `instructions/MEDIA_INVENTORY.tsv` exactly.
