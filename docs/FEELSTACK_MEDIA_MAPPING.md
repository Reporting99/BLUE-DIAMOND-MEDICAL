<!-- Generated 2026-08-24 by the ImageKit + FeelStack media import run.
     The run STOPPED at the Phase 1 credential gate: no bytes were uploaded to
     ImageKit and no FeelStack record was written. Every "planned" column below
     is a plan, not a result. -->

# FeelStack Media Mapping

**Status: BLOCKED — no FeelStack record was created or updated.**

Two independent reasons, both established from real deployed state rather than assumption:

1. No ImageKit credential exists for Blue Diamond, so there is no verified uploaded asset to
   reference. Writing a media reference for an asset that does not exist would create exactly
   the broken-path state the brief forbids.
2. Blue Diamond's FeelStack integration (`src/lib/feelstack/`) is **read-only by construction** —
   `client.ts` exports only `resolveEnvelope`, `listRoutes` and `getSiteConfig`, and issues no
   `POST`/`PUT`/`PATCH` anywhere. `FEELSTACK_REVALIDATE_SECRET` authenticates *inbound* webhooks;
   it is not a write credential. Writing entity media requires the FeelStack admin API under
   `admin/v1/projects/:projectId/content`, which needs CMS admin authentication that is not part
   of the Blue Diamond application environment.

## Planned mapping

EN/AR alt text is **not supplied by the media pack** — it carries no alt column. Every value
below is derived from bilingual content that already exists in the repository (the entity's own
`title`/`name` `{en, ar}` pair, or an existing `src/lib/media/image-manifest.ts` entry), which is
why both locales are marked DERIVED rather than SUPPLIED. Nothing was machine-translated.

| Entity type | Entity ID/slug | Media slot | ImageKit path | EN alt status | AR alt status | API read-back status |
|---|---|---|---|---|---|---|
| page | `aesthetics-hub` | `hero` | `/blue-diamond/aesthetics/aesthetics-hub-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| page | `concerns-hub` | `hero` | `/blue-diamond/aesthetics/concerns-hub-natural-skin.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| page | `technologies-hub` | `hero` | `/blue-diamond/aesthetics/technologies-hub-abstract.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| page | `homepage` | `hero` | `/blue-diamond/home/home-hero-blue-diamond.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| medical-service | `eye-screening` | `card` | `/blue-diamond/medical/eye-screening-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| page | `medical-botox` | `hero` | `/blue-diamond/medical/medical-botox-consultation-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| page | `medical-hub` | `section` | `/blue-diamond/medical/medical-family-care-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| page | `about` | `hero` | `/blue-diamond/shared/about-patient-care-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| page | `book-appointment` | `hero` | `/blue-diamond/shared/booking-contact-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| page | `careers` | `hero` | `/blue-diamond/shared/careers-team-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| page | `contact` | `hero` | `/blue-diamond/shared/contact-calgary-location-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| site | `blue-diamond-medical` | `ogImage` | `/blue-diamond/shared/open-graph-background.png` | EMPTY — decorative, correct | EMPTY — decorative, correct | NOT RUN — no record written |
| page | `patient-resources` | `hero` | `/blue-diamond/shared/patient-resources-uninsured-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `lumivive-system` | `productPrimary` | `/blue-diamond/shop/01_LUMIVIVE_System_Day_Night.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `tns-eye-repair` | `productPrimary` | `/blue-diamond/shop/02_TNS_Eye_Repair.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `vitamin-c-e-complex` | `productPrimary` | `/blue-diamond/shop/03_Vitamin_C_E_Complex.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `facial-cleanser` | `productPrimary` | `/blue-diamond/shop/04_Facial_Cleanser.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `aha-bha-exfoliating-cleanser` | `productPrimary` | `/blue-diamond/shop/05_AHA_BHA_Exfoliating_Cleanser.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `retinol-complex-025` | `productPrimary` | `/blue-diamond/shop/06_Retinol_Complex_0_25.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `retinol-complex-05` | `productPrimary` | `/blue-diamond/shop/07_Retinol_Complex_0_5.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `retinol-complex-10` | `productPrimary` | `/blue-diamond/shop/08_Retinol_Complex_1_0.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `aha-bha-cream` | `productPrimary` | `/blue-diamond/shop/10_AHA_BHA_Cream.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `total-defence-repair-spf-34-clear` | `productPrimary` | `/blue-diamond/shop/13_Total_Defense_Repair_SPF_34_Clear.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `dermal-repair-cream` | `productPrimary` | `/blue-diamond/shop/14_Dermal_Repair_Cream.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `rejuvenative-moisturizer` | `productPrimary` | `/blue-diamond/shop/15_Rejuvenative_Moisturizer.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `tns-ceramide-treatment-cream` | `productPrimary` | `/blue-diamond/shop/17_TNS_Ceramide_Treatment_Cream.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `ultra-sheer-moisturizer` | `productPrimary` | `/blue-diamond/shop/18_Ultra_Sheer_Moisturizer.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `scar-recovery-gel-small` | `productPrimary` | `/blue-diamond/shop/19_Scar_Recovery_Gel_with_Centelline_Small.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `scar-recovery-gel-large` | `productPrimary` | `/blue-diamond/shop/20_Scar_Recovery_Gel_with_Centelline_Large.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `tns-advanced-plus-serum` | `productPrimary` | `/blue-diamond/shop/21_TNS_Advanced_Plus_Serum.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `tns-recovery-complex` | `productPrimary` | `/blue-diamond/shop/22_TNS_Recovery_Complex.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| product | `ha5-rejuvenative-hydrator` | `productPrimary` | `/blue-diamond/shop/23_HA5_Current_Reformulation.jpg` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| shared-asset | `product-placeholder` | `productPrimary` | `/blue-diamond/shop/product-image-pending-abstract.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| page | `shop` | `hero` | `/blue-diamond/shop/skinmedica-catalogue-hero-neutral.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| technology | `elite-iq` | `technology` | `/blue-diamond/technologies/elite-iq-abstract-card.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| technology | `potenza` | `technology` | `/blue-diamond/technologies/potenza-abstract-card.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| technology | `tempsure` | `technology` | `/blue-diamond/technologies/tempsure-abstract-card.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| technology | `tempsure-vitalia` | `technology` | `/blue-diamond/technologies/tempsure-vitalia-abstract-card.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| technology | `ultra` | `technology` | `/blue-diamond/technologies/ultra-abstract-card.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| aesthetic-treatment | `cosmetic-botox` | `hero` | `/blue-diamond/treatments/cosmetic-botox-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| aesthetic-treatment | `laser-hair-removal` | `hero` | `/blue-diamond/treatments/laser-hair-removal-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| aesthetic-treatment | `laser-skin-treatments` | `hero` | `/blue-diamond/treatments/laser-skin-treatments-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| aesthetic-treatment | `prp-hair-restoration` | `hero` | `/blue-diamond/treatments/prp-hair-restoration-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| aesthetic-treatment | `prp-skin-rejuvenation` | `hero` | `/blue-diamond/treatments/prp-skin-rejuvenation-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| aesthetic-treatment | `radio-frequency` | `hero` | `/blue-diamond/treatments/radio-frequency-skin-tightening-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| aesthetic-treatment | `rf-microneedling` | `hero` | `/blue-diamond/treatments/rf-microneedling-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |
| aesthetic-treatment | `ultra` | `hero` | `/blue-diamond/treatments/ultra-pigmentation-hero.png` | DERIVED (repo bilingual source) | DERIVED (repo bilingual source) | NOT RUN — no record written |

## Alt text, verbatim

| ImageKit path | EN alt | AR alt |
|---|---|---|
| `/blue-diamond/aesthetics/aesthetics-hub-hero.png` | Blue Diamond Medical Aesthetics | التجميل الطبي في بلو دايموند |
| `/blue-diamond/aesthetics/concerns-hub-natural-skin.png` | Skin concerns we treat at Blue Diamond Medical Aesthetics | مشكلات البشرة التي نعالجها في بلو دايموند للتجميل الطبي |
| `/blue-diamond/aesthetics/technologies-hub-abstract.png` | Treatment technologies at Blue Diamond Medical Aesthetics | تقنيات العلاج في بلو دايموند للتجميل الطبي |
| `/blue-diamond/home/home-hero-blue-diamond.png` | Blue Diamond Medical Clinic, West Springs, Calgary | عيادة بلو دايموند الطبية، ويست سبرينغز، كالغاري |
| `/blue-diamond/medical/eye-screening-hero.png` | Eye Screening at Blue Diamond Medical | فحص العيون في بلو دايموند الطبية |
| `/blue-diamond/medical/medical-botox-consultation-hero.png` | Botox consultation at Blue Diamond Medical | استشارة بوتوكس في بلو دايموند الطبية |
| `/blue-diamond/medical/medical-family-care-hero.png` | Family medicine consultation room at Blue Diamond Medical | غرفة استشارات طب الأسرة في بلو دايموند الطبية |
| `/blue-diamond/shared/about-patient-care-hero.png` | Patient care at Blue Diamond Medical | رعاية المرضى في بلو دايموند الطبية |
| `/blue-diamond/shared/booking-contact-hero.png` | Book an appointment at Blue Diamond Medical | احجز موعدًا في بلو دايموند الطبية |
| `/blue-diamond/shared/careers-team-hero.png` | The team at Blue Diamond Medical | فريق بلو دايموند الطبية |
| `/blue-diamond/shared/contact-calgary-location-hero.png` | Blue Diamond Medical Clinic, West Springs, Calgary | عيادة بلو دايموند الطبية، ويست سبرينغز، كالغاري |
| `/blue-diamond/shared/open-graph-background.png` | _(empty — decorative)_ | _(empty — decorative)_ |
| `/blue-diamond/shared/patient-resources-uninsured-hero.png` | Patient resources at Blue Diamond Medical | موارد المرضى في بلو دايموند الطبية |
| `/blue-diamond/shop/01_LUMIVIVE_System_Day_Night.jpg` | Lumivive® System Day, Night — SkinMedica | نظام لوميفيف® (نهار، ليل) — سكين ميديكا |
| `/blue-diamond/shop/02_TNS_Eye_Repair.jpg` | TNS® Eye Repair — SkinMedica | TNS® لإصلاح محيط العين — سكين ميديكا |
| `/blue-diamond/shop/03_Vitamin_C_E_Complex.jpg` | Vitamin C+E Complex — SkinMedica | مركب فيتامين C+E — سكين ميديكا |
| `/blue-diamond/shop/04_Facial_Cleanser.jpg` | Facial Cleanser — SkinMedica | غسول الوجه — سكين ميديكا |
| `/blue-diamond/shop/05_AHA_BHA_Exfoliating_Cleanser.jpg` | AHA/BHA Exfoliating Cleanser — SkinMedica | غسول مقشر AHA/BHA — سكين ميديكا |
| `/blue-diamond/shop/06_Retinol_Complex_0_25.jpg` | Retinol Complex 0.25 — SkinMedica | مركب الريتينول 0.25 — سكين ميديكا |
| `/blue-diamond/shop/07_Retinol_Complex_0_5.jpg` | Retinol Complex 0.5 — SkinMedica | مركب الريتينول 0.5 — سكين ميديكا |
| `/blue-diamond/shop/08_Retinol_Complex_1_0.jpg` | Retinol Complex 1.0 — SkinMedica | مركب الريتينول 1.0 — سكين ميديكا |
| `/blue-diamond/shop/10_AHA_BHA_Cream.jpg` | AHA/BHA Cream — SkinMedica | كريم AHA/BHA — سكين ميديكا |
| `/blue-diamond/shop/13_Total_Defense_Repair_SPF_34_Clear.jpg` | Total Defense + Repair SPF 34 (Clear) — SkinMedica | واقي الشمس الشامل + الإصلاح SPF 34 (شفاف) — سكين ميديكا |
| `/blue-diamond/shop/14_Dermal_Repair_Cream.jpg` | Dermal Repair Cream — SkinMedica | كريم إصلاح البشرة — سكين ميديكا |
| `/blue-diamond/shop/15_Rejuvenative_Moisturizer.jpg` | Rejuvenative Moisturizer — SkinMedica | المرطب المجدد — سكين ميديكا |
| `/blue-diamond/shop/17_TNS_Ceramide_Treatment_Cream.jpg` | TNS Ceramide Treatment Cream™ — SkinMedica | كريم TNS بالسيراميد — سكين ميديكا |
| `/blue-diamond/shop/18_Ultra_Sheer_Moisturizer.jpg` | Ultra Sheer Moisturizer — SkinMedica | المرطب فائق الخفة — سكين ميديكا |
| `/blue-diamond/shop/19_Scar_Recovery_Gel_with_Centelline_Small.jpg` | Scar Recovery Gel with Centelline (Small) — SkinMedica | جل علاج الندبات بالسنتيلين (صغير) — سكين ميديكا |
| `/blue-diamond/shop/20_Scar_Recovery_Gel_with_Centelline_Large.jpg` | Scar Recovery Gel with Centelline (Large) — SkinMedica | جل علاج الندبات بالسنتيلين (كبير) — سكين ميديكا |
| `/blue-diamond/shop/21_TNS_Advanced_Plus_Serum.jpg` | TNS Advanced+ Serum® — SkinMedica | سيروم TNS المتقدم+ — سكين ميديكا |
| `/blue-diamond/shop/22_TNS_Recovery_Complex.jpg` | TNS Recovery Complex — SkinMedica | مركب TNS للتعافي — سكين ميديكا |
| `/blue-diamond/shop/23_HA5_Current_Reformulation.jpg` | HA5 Rejuvenative Hydrator — SkinMedica | مرطب HA5 المجدد — سكين ميديكا |
| `/blue-diamond/shop/product-image-pending-abstract.png` | Product image pending approval | صورة المنتج بانتظار الاعتماد |
| `/blue-diamond/shop/skinmedica-catalogue-hero-neutral.png` | SkinMedica professional skincare collection | مجموعة العناية بالبشرة الطبية سكين ميديكا |
| `/blue-diamond/technologies/elite-iq-abstract-card.png` | Elite iQ device at Blue Diamond Medical | جهاز إيليت آي كيو في بلو دايموند الطبية |
| `/blue-diamond/technologies/potenza-abstract-card.png` | Potenza RF micro-needling device | جهاز Potenza للإبر الدقيقة |
| `/blue-diamond/technologies/tempsure-abstract-card.png` | TempSure device at Blue Diamond Medical | جهاز تمبشور في بلو دايموند الطبية |
| `/blue-diamond/technologies/tempsure-vitalia-abstract-card.png` | TempSure Vitalia device at Blue Diamond Medical | جهاز تمبشور فيتاليا في بلو دايموند الطبية |
| `/blue-diamond/technologies/ultra-abstract-card.png` | Ultra device at Blue Diamond Medical | جهاز الترا في بلو دايموند الطبية |
| `/blue-diamond/treatments/cosmetic-botox-hero.png` | Cosmetic Botox at Blue Diamond Medical | بوتوكس تجميلي في بلو دايموند الطبية |
| `/blue-diamond/treatments/laser-hair-removal-hero.png` | Laser Hair Removal at Blue Diamond Medical | إزالة الشعر بالليزر في بلو دايموند الطبية |
| `/blue-diamond/treatments/laser-skin-treatments-hero.png` | Laser Skin Treatments at Blue Diamond Medical | علاجات البشرة بالليزر في بلو دايموند الطبية |
| `/blue-diamond/treatments/prp-hair-restoration-hero.png` | PRP Hair Restoration at Blue Diamond Medical | استعادة الشعر بالبلازما في بلو دايموند الطبية |
| `/blue-diamond/treatments/prp-skin-rejuvenation-hero.png` | PRP Skin Rejuvenation at Blue Diamond Medical | تجديد البشرة بالبلازما في بلو دايموند الطبية |
| `/blue-diamond/treatments/radio-frequency-skin-tightening-hero.png` | Radio Frequency at Blue Diamond Medical | الترددات الراديوية في بلو دايموند الطبية |
| `/blue-diamond/treatments/rf-microneedling-hero.png` | RF Micro-Needling at Blue Diamond Medical | الإبر الدقيقة بالترددات الراديوية في بلو دايموند الطبية |
| `/blue-diamond/treatments/ultra-pigmentation-hero.png` | Ultra Treatment at Blue Diamond Medical | علاج الترا في بلو دايموند الطبية |

## How each mapping was derived

| ImageKit path | Entity | Evidence |
|---|---|---|
| `/blue-diamond/aesthetics/aesthetics-hub-hero.png` | page:`aesthetics-hub` | repo manifest id=aesthetics-hub-hero |
| `/blue-diamond/aesthetics/concerns-hub-natural-skin.png` | page:`concerns-hub` | route registry: aesthetics/concerns hub (no repo manifest entry yet) |
| `/blue-diamond/aesthetics/technologies-hub-abstract.png` | page:`technologies-hub` | route registry: aesthetics/technologies hub (no repo manifest entry yet) |
| `/blue-diamond/home/home-hero-blue-diamond.png` | page:`homepage` | repo manifest id=homepage-hero |
| `/blue-diamond/medical/eye-screening-hero.png` | medical-service:`eye-screening` | medicalServices[id=eye-screening] title |
| `/blue-diamond/medical/medical-botox-consultation-hero.png` | page:`medical-botox` | repo manifest id=botox-consultation |
| `/blue-diamond/medical/medical-family-care-hero.png` | page:`medical-hub` | repo manifest id=pathways-family-care-detail |
| `/blue-diamond/shared/about-patient-care-hero.png` | page:`about` | route registry: /about |
| `/blue-diamond/shared/booking-contact-hero.png` | page:`book-appointment` | route registry: /book-appointment |
| `/blue-diamond/shared/careers-team-hero.png` | page:`careers` | route registry: /careers |
| `/blue-diamond/shared/contact-calgary-location-hero.png` | page:`contact` | route registry: /contact |
| `/blue-diamond/shared/open-graph-background.png` | site:`blue-diamond-medical` | decorative/social card — empty alt is correct (never rendered in-page) |
| `/blue-diamond/shared/patient-resources-uninsured-hero.png` | page:`patient-resources` | route registry: /patient-resources |
| `/blue-diamond/shop/01_LUMIVIVE_System_Day_Night.jpg` | product:`lumivive-system` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/02_TNS_Eye_Repair.jpg` | product:`tns-eye-repair` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/03_Vitamin_C_E_Complex.jpg` | product:`vitamin-c-e-complex` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/04_Facial_Cleanser.jpg` | product:`facial-cleanser` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/05_AHA_BHA_Exfoliating_Cleanser.jpg` | product:`aha-bha-exfoliating-cleanser` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/06_Retinol_Complex_0_25.jpg` | product:`retinol-complex-025` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/07_Retinol_Complex_0_5.jpg` | product:`retinol-complex-05` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/08_Retinol_Complex_1_0.jpg` | product:`retinol-complex-10` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/10_AHA_BHA_Cream.jpg` | product:`aha-bha-cream` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/13_Total_Defense_Repair_SPF_34_Clear.jpg` | product:`total-defence-repair-spf-34-clear` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/14_Dermal_Repair_Cream.jpg` | product:`dermal-repair-cream` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/15_Rejuvenative_Moisturizer.jpg` | product:`rejuvenative-moisturizer` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/17_TNS_Ceramide_Treatment_Cream.jpg` | product:`tns-ceramide-treatment-cream` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/18_Ultra_Sheer_Moisturizer.jpg` | product:`ultra-sheer-moisturizer` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/19_Scar_Recovery_Gel_with_Centelline_Small.jpg` | product:`scar-recovery-gel-small` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/20_Scar_Recovery_Gel_with_Centelline_Large.jpg` | product:`scar-recovery-gel-large` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/21_TNS_Advanced_Plus_Serum.jpg` | product:`tns-advanced-plus-serum` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/22_TNS_Recovery_Complex.jpg` | product:`tns-recovery-complex` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/23_HA5_Current_Reformulation.jpg` | product:`ha5-rejuvenative-hydrator` | SkinMedica_Product_Source_Manifest.csv row -> products[id] |
| `/blue-diamond/shop/product-image-pending-abstract.png` | shared-asset:`product-placeholder` | pack instruction rule 5 + product manifest REVIEW_REQUIRED rows |
| `/blue-diamond/shop/skinmedica-catalogue-hero-neutral.png` | page:`shop` | repo manifest id=skinmedica-collection |
| `/blue-diamond/technologies/elite-iq-abstract-card.png` | technology:`elite-iq` | technologies[id] title |
| `/blue-diamond/technologies/potenza-abstract-card.png` | technology:`potenza` | repo manifest id=technology-potenza-device |
| `/blue-diamond/technologies/tempsure-abstract-card.png` | technology:`tempsure` | technologies[id] title |
| `/blue-diamond/technologies/tempsure-vitalia-abstract-card.png` | technology:`tempsure-vitalia` | technologies[id] title |
| `/blue-diamond/technologies/ultra-abstract-card.png` | technology:`ultra` | technologies[id] title |
| `/blue-diamond/treatments/cosmetic-botox-hero.png` | aesthetic-treatment:`cosmetic-botox` | treatments[id=cosmetic-botox]; page gated by features.cosmeticBotoxTreatmentPageEnabled=false |
| `/blue-diamond/treatments/laser-hair-removal-hero.png` | aesthetic-treatment:`laser-hair-removal` | treatments[id] title |
| `/blue-diamond/treatments/laser-skin-treatments-hero.png` | aesthetic-treatment:`laser-skin-treatments` | treatments[id] title |
| `/blue-diamond/treatments/prp-hair-restoration-hero.png` | aesthetic-treatment:`prp-hair-restoration` | treatments[id] title |
| `/blue-diamond/treatments/prp-skin-rejuvenation-hero.png` | aesthetic-treatment:`prp-skin-rejuvenation` | treatments[id] title |
| `/blue-diamond/treatments/radio-frequency-skin-tightening-hero.png` | aesthetic-treatment:`radio-frequency` | treatments[id=radio-frequency]; shared with treatments[id=skin-tightening], whose own copy states skin tightening IS delivered by Radio Frequency (TempSure) |
| `/blue-diamond/treatments/rf-microneedling-hero.png` | aesthetic-treatment:`rf-microneedling` | treatments[id] title |
| `/blue-diamond/treatments/ultra-pigmentation-hero.png` | aesthetic-treatment:`ultra` | treatments[id=ultra]; the Ultra treatment copy is explicitly the pigmentation laser |

## Shared asset references (one asset, several entities)

| ImageKit path | Primary entity | Also referenced by |
|---|---|---|
| `/blue-diamond/shared/patient-resources-uninsured-hero.png` | page:`patient-resources` | medical-service:uninsured-services (slot card) — PROPOSED reuse, needs sign-off |
| `/blue-diamond/shop/product-image-pending-abstract.png` | shared-asset:`product-placeholder` | product:lytera-2-pigment-brightening-serum, product:daily-physical-defense-spf-34, product:total-defence-repair-spf-34-tinted, product:replenish-hydrating-cream |
| `/blue-diamond/treatments/radio-frequency-skin-tightening-hero.png` | aesthetic-treatment:`radio-frequency` | aesthetic-treatment:skin-tightening (slot hero, same asset reference) |

A single record is shared in each case — the image is never duplicated per locale.
EN and AR read the same ImageKit path and differ only in alt text and caption.
