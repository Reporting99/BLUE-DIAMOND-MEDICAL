# Blue Diamond — Canonical Entity Registry

One authoritative entity per real-world thing. No entity appears twice, and no
content block is placed in two canonical pages to make a page look fuller.

- **Canonical domain:** `https://bluediamondmedical.ca/`
- **Public routes are locale-prefixed:** `/en/…` and `/ar/…`. Routes below are
  shown without the prefix; both locales always exist and are reciprocal
  hreflang alternates of each other.
- **Route authority:** `src/config/routes.ts` (104 entries, verified 0 path
  collisions across both locales).
- `bluediamondmedicalaesthetics.ca` is a **legacy redirect source only** — it is
  not a canonical site and owns no entity.

**Publication status values:** `Published` (live and indexed) ·
`Published (noindex)` · `Built, gated` (route, typed model, and template exist;
feature flag off; route returns 404 so it can never be an empty indexable page) ·
`Structured fact` (a configuration record, not a page).

## Summary

| Entity type | Count | Notes |
|---|---|---|
| Homepage content | 1 | |
| Medical service | 7 | + 1 hub |
| Uninsured medical service / Medical fee | 4 fee groups | published on 1 pricing page |
| Medical Botox service | 4 | hub + 3 conditions, all gated |
| Aesthetic treatment | 10 | 8 published, 2 gated |
| Aesthetic concern | 9 | all published |
| Aesthetic technology | 5 | all published |
| Women's wellness service | 1 | TempSure Vitalia (also counted as a treatment) |
| Doctor | 6 | + 1 index |
| Product | 23 | + 8 categories + 6 product concerns + 1 hub |
| Patient resource / Clinic policy | 8 policies | published on 1 hub |
| Booking destination | 7 | 5 external + 2 telephone — structured facts |
| Location | 2 | main clinic + Citizen Studio service-location exception |
| Opening-hours schedule | 2 | clinic + aesthetics |
| About / Careers | 2 | |
| Health Hub topic | 0 | hub published, zero approved articles |
| Legal content | 4 | all gated, no approved copy |
| FAQ | 5 sets | attached to their parent treatment entities |
| **Total routed entities** | **104** | 88 live, 16 gated |

## Routed entities

| Entity ID | Entity type | Canonical name | English route | Arabic route | Source sections | Related entities | Duplicate sources merged | Publication status |
|---|---|---|---|---|---|---|---|---|
| `home` | Homepage content | Blue Diamond Medical Clinic | `/` | `/` | A1 (13–80) | medical-hub, aesthetics-hub, botox-hub, doctors-index, contact, book-appointment | — | Published |
| `medical-hub` | Medical service (hub) | Medical Care | `/medical` | `/الرعاية-الطبية` | A3 (162–188) | 7 medical services, uninsured-services, botox-hub | — | Published |
| `medical-eye-screening` | Medical service | Eye Disease Screening | `/medical/eye-screening` | `/الرعاية-الطبية/فحص-العين` | A7 (340–354); A3 (162–188) | booking:eye-screening, partner:euclid | "Eye Disease Screening" + "Euclid Eye Screening" listed twice in the AHS list — one entity | Published |
| `medical-after-hours-care` | Medical service | After-Hours Care | `/medical/after-hours-care` | `/الرعاية-الطبية/الرعاية-خارج-أوقات-الدوام` | A8 (356–394); A3 (190) | partner:cwc-pcn, partner:mosaic-pcn, doctor-farhat, doctor-hamdi | Legacy `/primary-care-network` page merged here | Published |
| `medical-chronic-disease-management` | Medical service | Chronic Disease Management | `/medical/chronic-disease-management` | `/الرعاية-الطبية/إدارة-الأمراض-المزمنة` | A3 (162–188) | doctor-bakare, booking:family-doctor | — | Published |
| `medical-preventive-care` | Medical service | Preventive Care | `/medical/preventive-care` | `/الرعاية-الطبية/الرعاية-الوقائية` | A3 (162–188); A4 (248) | doctor-saeed, medical-eye-screening | Absorbs the AHS list's "Vaccination" item | Published |
| `medical-weight-management` | Medical service | Weight Management | `/medical/weight-management` | `/الرعاية-الطبية/إدارة-الوزن` | A3 (162–188) | treatment-rf-microneedling (post-weight-loss) | — | Published |
| `medical-pain-management` | Medical service | Pain Management | `/medical/pain-management` | `/الرعاية-الطبية/إدارة-الألم` | A3 (162–188); A4 (232–234) | doctor-bakare | — | Published |
| `medical-minor-procedures` | Medical service | Minor Procedures | `/medical/minor-procedures` | `/الرعاية-الطبية/الإجراءات-البسيطة` | A3 (162–188); A4 (232–234) | doctor-bakare, doctor-farhat, fees:uninsured-treatments | — | Published |
| `medical-uninsured-services` | Uninsured medical service / Medical fee | Uninsured Services & Fees | `/medical/uninsured-services` | `/الرعاية-الطبية/الخدمات-غير-المشمولة` | A3 (122–160); A2 (96–107) | policy:uninsured, patient-resources-hub | 4 fee tables from 2 legacy pages consolidated | Published |
| `medical-botox-hub` | Medical Botox service | Medical Botox | `/medical/botox` | `/الرعاية-الطبية/بوتوكس` | A6 (296–304) | botox-hub, 3 conditions, doctor-farhat | — | Built, gated (`medicalBotoxDetailPagesEnabled`) |
| `medical-botox-migraine` | Medical Botox service | Botox for Migraine | `/medical/botox/migraine` | `/الرعاية-الطبية/بوتوكس/الشقيقة` | A6 (298); A1 (23) | booking:phone-medical-botox | — | Built, gated |
| `medical-botox-bruxism-tmj` | Medical Botox service | Botox for Bruxism & TMJ | `/medical/botox/bruxism-tmj` | `/الرعاية-الطبية/بوتوكس/صرير-الأسنان` | A6 (304) | booking:phone-medical-botox | — | Built, gated |
| `medical-botox-hyperhidrosis` | Medical Botox service | Botox for Hyperhidrosis | `/medical/botox/hyperhidrosis` | `/الرعاية-الطبية/بوتوكس/التعرق-الزائد` | A6 (300) | booking:phone-medical-botox | — | Built, gated |
| `botox-hub` | Medical Botox service (educational hub) | Botox | `/botox` | `/بوتوكس` | A6 (280–338) | medical-botox-hub, treatment-cosmetic-botox, concern-fine-lines-wrinkles, doctor-farhat | — | Published |
| `aesthetics-hub` | Aesthetic treatment (hub) | Medical Aesthetics | `/aesthetics` | `/التجميل-الطبي` | B1 (576–621); A5 (260–278) | treatments/concerns/technologies hubs, shop-hub | Two legacy homepages (medical `/medical-aesthetics-1` + aesthetics `/`) merged | Published |
| `aesthetics-treatments-hub` | Aesthetic treatment (hub) | Treatments | `/aesthetics/treatments` | `/التجميل-الطبي/العلاجات` | B2 (623–657) | 10 treatments | — | Published |
| `treatment-laser-hair-removal` | Aesthetic treatment | Laser Hair Removal | `/aesthetics/treatments/laser-hair-removal` | `/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر` | B4 (669–731) | technology-elite-iq, location:citizen-studio, concern-razor-bumps | — | Published |
| `treatment-laser-skin-treatments` | Aesthetic treatment | Laser Skin Treatments | `/aesthetics/treatments/laser-skin-treatments` | `/التجميل-الطبي/العلاجات/علاجات-البشرة-بالليزر` | B5 (733–771) | concern-rosacea-redness, concern-spider-veins, concern-sun-damage-pigmentation, concern-skin-revitalization | Legacy `-1` route retired | Published |
| `treatment-radio-frequency` | Aesthetic treatment | Radio Frequency | `/aesthetics/treatments/radio-frequency` | `/التجميل-الطبي/العلاجات/الترددات-الراديوية` | B6 (773–805); A5 (272–274) | technology-tempsure, concern-skin-laxity, concern-fine-lines-wrinkles | Legacy "Skin Tightening" teaser resolves here | Published |
| `treatment-rf-microneedling` | Aesthetic treatment | RF Micro-Needling | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية` | B7 (807–897); A5 (268–270) | technology-potenza, concern-acne-scars, concern-dry-skin, concern-fine-lines-wrinkles, concern-skin-laxity | Misspelled legacy slug retired | Published |
| `treatment-ultra` | Aesthetic treatment | Ultra Treatment | `/aesthetics/treatments/ultra` | `/التجميل-الطبي/العلاجات/الترا` | B8 (899–945) | technology-ultra, concern-sun-damage-pigmentation, concern-skin-revitalization | **Not** PRP — legacy mislink corrected | Published |
| `treatment-prp-hair-restoration` | Aesthetic treatment | PRP Hair Restoration | `/aesthetics/treatments/prp-hair-restoration` | `/التجميل-الطبي/العلاجات/استعادة-الشعر-بالبلازما` | B9 (963–973, 989–1001) | doctor-farhat, faq:prp | Split out of the single legacy PRP page | Published |
| `treatment-prp-skin-rejuvenation` | Aesthetic treatment | PRP Skin Rejuvenation | `/aesthetics/treatments/prp-skin-rejuvenation` | `/التجميل-الطبي/العلاجات/تجديد-البشرة-بالبلازما` | B9 (975–1001) | doctor-farhat, concern-acne-scars, concern-fine-lines-wrinkles | Split out of the single legacy PRP page | Published |
| `treatment-tempsure-vitalia` | Women's wellness service | TempSure Vitalia | `/aesthetics/treatments/tempsure-vitalia` | `/التجميل-الطبي/العلاجات/تمبشور-فيتاليا` | B10 (1053–1055); B2 (657) | technology-tempsure-vitalia, booking:aesthetics-consultation | Legacy self-linking "Vitalia" entry given a real entity | Published |
| `treatment-cosmetic-botox` | Aesthetic treatment | Cosmetic Botox | `/aesthetics/treatments/cosmetic-botox` | `/التجميل-الطبي/العلاجات/بوتوكس-تجميلي` | A6 (306–336) | botox-hub, concern-fine-lines-wrinkles | Kept strictly separate from Medical Botox | Built, gated (`cosmeticBotoxTreatmentPageEnabled`) — 15 area labels only, no per-area copy |
| `treatment-skin-tightening` | Aesthetic treatment | Skin Tightening | `/aesthetics/treatments/skin-tightening` | `/التجميل-الطبي/العلاجات/شد-البشرة` | A1 (45); A5 (272) | treatment-radio-frequency, concern-skin-laxity | — | Built, gated (`skinTighteningTreatmentPageEnabled`) — would duplicate Radio Frequency |
| `aesthetics-concerns-hub` | Aesthetic concern (hub) | Concerns | `/aesthetics/concerns` | `/التجميل-الطبي/المخاوف-الجمالية` | B3 (659–667) | 9 concerns | Replaces the contentless "Area Concern" hover module | Published |
| `concern-acne-scars` | Aesthetic concern | Acne Scars | `/aesthetics/concerns/acne-scars` | `/التجميل-الطبي/المخاوف-الجمالية/ندبات-حب-الشباب` | B12 (1073–1083) | treatment-rf-microneedling, treatment-prp-skin-rejuvenation, shop-concern-acne | Reclassified from treatment | Published |
| `concern-rosacea-redness` | Aesthetic concern | Rosacea & Redness | `/aesthetics/concerns/rosacea-redness` | `/التجميل-الطبي/المخاوف-الجمالية/الوردية-والاحمرار` | B13 (1085–1095) | treatment-laser-skin-treatments, shop-concern-redness | Reclassified; link retargeted | Published |
| `concern-dry-skin` | Aesthetic concern | Dry Skin | `/aesthetics/concerns/dry-skin` | `/التجميل-الطبي/المخاوف-الجمالية/جفاف-البشرة` | B14 (1097–1107) | treatment-rf-microneedling, shop-concern-dry-skin | Reclassified | Published |
| `concern-fine-lines-wrinkles` | Aesthetic concern | Fine Lines & Wrinkles | `/aesthetics/concerns/fine-lines-wrinkles` | `/التجميل-الطبي/المخاوف-الجمالية/الخطوط-الدقيقة-والتجاعيد` | B15 (1109–1119) | treatment-rf-microneedling, treatment-radio-frequency, treatment-cosmetic-botox, shop-concern-anti-aging | Reclassified | Published |
| `concern-skin-laxity` | Aesthetic concern | Skin Laxity | `/aesthetics/concerns/skin-laxity` | `/التجميل-الطبي/المخاوف-الجمالية/ترهل-البشرة` | B16 (1121–1131) | treatment-radio-frequency, treatment-rf-microneedling | Reclassified from "Non-invasive Skin Tightening", which named the modality not the concern | Published |
| `concern-spider-veins` | Aesthetic concern | Spider Veins | `/aesthetics/concerns/spider-veins` | `/التجميل-الطبي/المخاوف-الجمالية/الأوردة-العنكبوتية` | B17 (1133–1143) | treatment-laser-skin-treatments | Reclassified; link retargeted | Published |
| `concern-sun-damage-pigmentation` | Aesthetic concern | Sun Damage & Pigmentation | `/aesthetics/concerns/sun-damage-pigmentation` | `/التجميل-الطبي/المخاوف-الجمالية/تلف-الشمس-والتصبغ` | B18 (1145–1155) | treatment-laser-skin-treatments, treatment-ultra, shop-concern-pigmentation | Reclassified; link retargeted | Published |
| `concern-skin-revitalization` | Aesthetic concern | Skin Revitalization | `/aesthetics/concerns/skin-revitalization` | `/التجميل-الطبي/المخاوف-الجمالية/تجديد-البشرة` | B19 (1157–1167) | treatment-laser-skin-treatments, treatment-rf-microneedling, treatment-ultra | Reclassified; both links retargeted | Published |
| `concern-razor-bumps` | Aesthetic concern | Razor Bumps | `/aesthetics/concerns/razor-bumps` | `/التجميل-الطبي/المخاوف-الجمالية/حبوب-الحلاقة` | B20 (1169–1179) | treatment-laser-hair-removal | Reclassified; link verified correct and retained | Published |
| `aesthetics-technologies-hub` | Aesthetic technology (hub) | Technologies | `/aesthetics/technologies` | `/التجميل-الطبي/التقنيات` | B10 (1015–1035) | 5 technologies | — | Published |
| `technology-elite-iq` | Aesthetic technology | Elite iQ™ (Cynosure) | `/aesthetics/technologies/elite-iq` | `/التجميل-الطبي/التقنيات/إيليت-آي-كيو` | B10 (1037–1039); B4 (699–715) | treatment-laser-hair-removal, treatment-laser-skin-treatments, location:citizen-studio | "Elite+™" and "Elite iQ™" are one device — CONF-005. Contentless legacy device paragraph replaced by the real description from the LHR page | Published |
| `technology-potenza` | Aesthetic technology | Potenza (Cynosure) | `/aesthetics/technologies/potenza` | `/التجميل-الطبي/التقنيات/بوتنزا` | B10 (1041–1043); B7 (815–835) | treatment-rf-microneedling, concern-skin-laxity, concern-acne-scars | — | Published |
| `technology-tempsure` | Aesthetic technology | TempSure (Cynosure) | `/aesthetics/technologies/tempsure` | `/التجميل-الطبي/التقنيات/تمبشور` | B10 (1045–1047); B6 (779–785) | treatment-radio-frequency, concern-skin-laxity | — | Published |
| `technology-ultra` | Aesthetic technology | Ultra (Cynosure) | `/aesthetics/technologies/ultra` | `/التجميل-الطبي/التقنيات/الترا` | B10 (1049–1051); B8 (907–925) | treatment-ultra, concern-sun-damage-pigmentation | Distinct from `treatment-ultra`; the device page explains the platform and links out rather than repeating the treatment page | Published |
| `technology-tempsure-vitalia` | Aesthetic technology | TempSure Vitalia (Cynosure) | `/aesthetics/technologies/tempsure-vitalia` | `/التجميل-الطبي/التقنيات/تمبشور-فيتاليا` | B10 (1053–1055) | treatment-tempsure-vitalia, booking:aesthetics-consultation | — | Published |
| `aesthetics-pricing` | Aesthetic treatment (pricing) | Aesthetics Pricing | `/aesthetics/pricing` | `/التجميل-الطبي/الأسعار` | Approved pricing workbook 2026-08-23 (81 rows) + client email override | 8 priced treatments, `PRICING-NOTE-001` | Legacy "packages offered" wording folded into the general pricing note | Built, gated (`aestheticPricingEnabled`) — **all 81 approved price rows are mapped** (GAP-003, GAP-017, GAP-018 all resolved): 78 publishable treatment prices (77 single-treatment + 1 combined protocol) and 3 add-on prices held at `publicDisplay: false` pending the GAP-014 clinician review. Flag flips once the page content is implemented |
| `aesthetics-consultation` | CTA / form | Request a Consultation | `/aesthetics/consultation` | `/التجميل-الطبي/طلب-استشارة` | B2 (631) | booking:aesthetics-consultation | — | Built, gated (`consultationFormEnabled`) |
| `aesthetics-before-after` | Aesthetic treatment (gallery) | Before & After | `/aesthetics/before-after` | `/التجميل-الطبي/قبل-وبعد` | B4/B5/B6/B7/B8 (5 empty modules) | 5 treatments | 5 empty legacy gallery modules consolidated into one gated entity | Built, gated (`beforeAfterEnabled`) — no approved photography (GAP-004) |
| `doctors-index` | Doctor (hub) | Our Team | `/our-team` | `/فريقنا` | A4 (200–258); B11 (1057–1071) | 6 doctors | Two legacy team pages merged into one index | Published |
| `doctor-farhat` | Doctor | Dr. Mohamed Farhat | `/doctors/mohamed-farhat` | `/الأطباء/محمد-فرحات` | A4 (208–212); B11 (1065–1067); A1 (35); B9 (957) | botox-hub, both PRP treatments, medical-minor-procedures, partner:cwc-pcn, booking:family-doctor | **2 biographies merged into 1** | Published |
| `doctor-saeed` | Doctor | Dr. Omaima Saeed | `/doctors/omaima-saeed` | `/الأطباء/أميمة-سعيد` | A4 (214–218); A2 (92) | medical-preventive-care | — | Published — **no portrait, stock person, generated face, or human silhouette** |
| `doctor-hamdi` | Doctor | Dr. Reem Hamdi | `/doctors/reem-hamdi` | `/الأطباء/ريم-حمدي` | A4 (220–224); B11 (1069–1071); A3 (190) | partner:mosaic-pcn, booking:family-doctor | **2 biographies merged into 1** | Published |
| `doctor-omonijo` | Doctor | Dr. Omonijo | `/doctors/omonijo` | `/الأطباء/أومونيجو` | A4 (226–230); A2 (92) | booking:family-doctor | — | Published |
| `doctor-bakare` | Doctor | Dr. Bakare | `/doctors/bakare` | `/الأطباء/باكاري` | A4 (232–236) | medical-chronic-disease-management, medical-pain-management, medical-minor-procedures | — | Published |
| `doctor-gwea` | Doctor | Dr. Ahmed Gwea | `/doctors/ahmed-gwea` | `/الأطباء/أحمد-جويع` | A4 (238–244); A2 (92) | medical-chronic-disease-management, medical-preventive-care | Two heading-marked paragraphs converted to body text without changing meaning | Published — **approved branded abstract placeholder** until a real photograph is supplied |
| `patient-resources-hub` | Patient resource / Clinic policy | Patient Resources | `/patient-resources` | `/موارد-المرضى` | A9 (396–444); A2 (90–108) | medical-uninsured-services, book-appointment | 8 policy sections + the appointment-confirmation notice consolidated | Published — 4 of 8 policies currently rendered (GAP-007) |
| `health-hub` | Health Hub topic (hub) | Health Hub | `/health-hub` | `/المركز-المعرفي` | — | medical services, treatments | — | Published — **0 articles** (GAP-005) |
| `about` | About content | About Blue Diamond Medical | `/about` | `/من-نحن` | A1 (35); A4 (246–250); A11 (478–480) | doctors-index, medical-hub, careers | Practice history + mission from 3 legacy locations consolidated | Published |
| `careers` | Careers content | Careers | `/careers` | `/الوظائف` | A10 (446–472) | about, contact | — | Published |
| `legal-terms` | Legal content | Terms & Conditions | `/terms` | `/الشروط-والأحكام` | B21 (1181–1189) | — | — | Built, gated (`legalPagesEnabled`) — no approved copy (GAP-001) |
| `legal-privacy-policy` | Legal content | Privacy Policy | `/privacy-policy` | `/سياسة-الخصوصية` | B22 (1191–1199) | policy:confidentiality, policy:test-results | — | Built, gated — no approved copy (GAP-002) |
| `legal-accessibility` | Legal content | Accessibility | `/accessibility` | `/إمكانية-الوصول` | — (no legacy source) | — | — | Built, gated — no approved copy |
| `legal-medical-disclaimer` | Legal content | Medical Disclaimer | `/medical-disclaimer` | `/إخلاء-المسؤولية-الطبية` | — (no legacy source) | all treatment/service entities | — | Built, gated — no approved copy (GAP-012) |
| `contact` | Contact information | Contact Us | `/contact` | `/تواصل-معنا` | A11 (474–495); A1 (55–68); B1 (602–617) | location:main-clinic, location:citizen-studio, hours:*, book-appointment | 3 legacy contact blocks across 2 domains consolidated | Published |
| `book-appointment` | Booking destination (hub) | Book an Appointment | `/book-appointment` | `/حجز-موعد` | A2 (82–108); A3 (192–198) | all 7 booking destinations, 6 doctors | — | Published |
| `shop-hub` | Product category (hub) | SkinMedica Products | `/shop` | `/المتجر` | A12 (497–570); B1 (594–596) | 8 categories, 6 product concerns, 23 products | Orphan legacy page + the aesthetics site's dead "SHOP Now" button both resolve here | Published |
| `shop-category-*` (8) | Product category | Cleansers, Serums, Moisturizers, Sunscreen, Retinol, Eye Care, Scar Care, Treatment Systems | `/shop/category/{slug}` | `/المتجر/فئة/{slug}` | A12 (507–567) | shop-hub, products | Legacy "Factor" groupings preserved as labels alongside the functional taxonomy | Published (noindex) |
| `shop-concern-*` (6) | Product concern | Acne, Anti-Aging, Pigmentation, Dry Skin, Redness, Hair Care | `/shop/concern/{slug}` | `/المتجر/مخاوف/{slug}` | derived | aesthetic concerns, products | — | Published (noindex) |
| `shop-product-*` (23) | Product | see the classification matrix §A12b | `/shop/{slug}` | `/المتجر/{slug}` | A12 (512–570) | categories, product concerns, shop-hub | Each product card routes to its own detail page | Published — images pending (GAP-008) |
| `shop-cart` / `shop-checkout` / `shop-shipping-returns` | Product (commerce) | Cart / Checkout / Shipping & Returns | `/shop/cart`, `/shop/checkout`, `/shop/shipping-returns` | `/المتجر/سلة-المشتريات`, `/المتجر/الدفع`, `/المتجر/الشحن-والإرجاع` | — | shop-hub | — | Built, gated (`shopCheckoutEnabled`) — no approved payment, cart, inventory, or shipping. Deliberately a **separate** flag from `shopEnabled` |

## Non-routed canonical entities (structured facts)

| Entity ID | Entity type | Canonical name | English route | Arabic route | Source sections | Related entities | Duplicate sources merged | Publication status |
|---|---|---|---|---|---|---|---|---|
| `location:main-clinic` | Location | Blue Diamond Medical Clinic, 23-8 Weston Drive SW, Calgary AB T3H 5P2 | n/a | n/a | A1 (55–61); A11 (482–495); B1 (606) | contact, home, all services | 3 identical NAP blocks across 2 domains | Structured fact |
| `location:citizen-studio` | Location | Citizen Studio, 45 Greenbriar Dr NW, Calgary AB T3B 5N4 | n/a | n/a | B1 (608); B4 (683) | technology-elite-iq, treatment-laser-hair-removal | — | Structured fact — **service-location exception, distinct from the main clinic** |
| `contact:main-line` | Contact information | +1 (825) 413-1113 | n/a | n/a | A1 (21, 61); A11 (486); A6 (338) | location:main-clinic, booking:phone-medical-botox | — | Structured fact |
| `contact:aesthetics-line` | Contact information | (403) 247-1418 | n/a | n/a | B1 (586, 610); B9 (1013) | aesthetics-hub, booking:phone-aesthetics | — | Structured fact — CONF-001, kept distinct |
| `contact:fax` | Contact information | +1 (587) 443-0394 | n/a | n/a | A1 (61); A11 (486); A9 (424); B1 (610) | policy:prescriptions | Identical on both domains | Structured fact — **not changed this phase, per client instruction** |
| `contact:social` | Contact information | facebook.com/bluediamondmedical · instagram.com/bludiamondmedical | n/a | n/a | A1 (76–78) | home, contact | — | Structured fact |
| `hours:main-clinic` | Opening-hours schedule | 08:00–19:00 | n/a | n/a | A1 (63–68); A11 (490–495) | location:main-clinic | 2 identical tables | Structured fact — only weekdays source-confirmed (GAP-009) |
| `hours:aesthetics` | Opening-hours schedule | 09:00–17:00 | n/a | n/a | B1 (612–617) | aesthetics-hub | — | Structured fact — CONF-002 |
| `hours:statutory-notice` | Opening-hours schedule | Closed all statutory holidays | n/a | n/a | A1 (68); A11 (495); B1 (617) | both schedules | 3 phrasings unified | Structured fact |
| `booking:family-doctor` | Booking destination | Mika | n/a | n/a | A1 (33); A2 (94); A4 (×6) | 6 doctors, medical services | — | Structured fact (external) |
| `booking:walk-in` | Booking destination | Mika / Skip the Waiting Room | n/a | n/a | A2 (92); A3 (192–196) | book-appointment | — | Structured fact — STWR host pending approval (GAP-010) |
| `booking:eye-screening` | Booking destination | Euclid Telehealth | n/a | n/a | A2 (94, 108); A7 (352–354) | medical-eye-screening | Cancellation number + support email merged from 2 pages | Structured fact (external) |
| `booking:aesthetics-consultation` | Booking destination | Jane App | n/a | n/a | B10 (1055) | treatment-tempsure-vitalia, aesthetics-consultation | — | Structured fact (external) |
| `booking:phone-medical-botox` | Booking destination | Telephone — 825 413 1113 | n/a | n/a | A6 (294, 338) | botox-hub, medical-botox-* | — | Structured fact |
| `booking:phone-aesthetics` | Booking destination | Telephone — 403 247 1418 | n/a | n/a | B1 (586); B9 (1013) | aesthetics treatments | — | Structured fact |
| `partner:cwc-pcn` | Medical service (partner) | Calgary West Central Primary Care Network | n/a | n/a | A8 (356–394); A3 (190) | medical-after-hours-care, doctor-farhat | — | Structured fact (external) |
| `partner:mosaic-pcn` | Medical service (partner) | Mosaic Primary Care Network | n/a | n/a | A3 (190) | medical-after-hours-care, doctor-hamdi | — | Structured fact (external) |
| `partner:euclid` | Medical service (partner) | Euclid Telehealth | n/a | n/a | A7 (340–354) | medical-eye-screening | — | Structured fact (external) |
| `fees:no-show` | Medical fee | No-Show Fees (6 rows) | n/a | n/a | A2 (96–107) | patient-resources-hub, medical-uninsured-services | — | Structured fact |
| `fees:uninsured-forms` | Medical fee | Forms (7 rows) | n/a | n/a | A3 (122–133) | medical-uninsured-services | — | Structured fact |
| `fees:uninsured-treatments` | Medical fee | Treatments (6 rows) | n/a | n/a | A3 (135–145) | medical-uninsured-services, medical-minor-procedures | — | Structured fact |
| `fees:uninsured-admin` | Medical fee | Administrative Tasks (9 rows) | n/a | n/a | A3 (147–160) | medical-uninsured-services | — | Structured fact |
| `policy:appointments` … `policy:confidentiality` (8) | Clinic policy | Appointments · General Conduct · Prescription Refills · Test Results · Referrals & Investigations · Telephone Consultations · Uninsured Services · Confidentiality | n/a | n/a | A9 (406–444) | patient-resources-hub | — | 4 published, 4 approved but not yet rendered (GAP-007) |
| `faq:laser-hair-removal` / `:radio-frequency` / `:rf-microneedling` / `:ultra` / `:prp` | FAQ | per-treatment FAQ sets | n/a | n/a | B4, B6, B7, B8, B9 | parent treatments | — | Published on their parent treatment pages |

## Integrity checks

| Check | Result |
|---|---|
| Duplicate canonical entities | **0** — no two entity IDs describe the same real-world thing |
| Route collisions (EN and AR, all 104 entries) | **0** — verified programmatically against `src/config/routes.ts` |
| Wrong entity-family relationships | **0** — no concern typed as a treatment, no technology typed as a concern, no doctor duplicated |
| Content blocks placed in more than one canonical page | **0** — shared content (PRP definition, Elite iQ description, fee tables) is referenced by relation, not copied |
| `-1` suffixed canonical routes | **0** |
| Misspelled canonical routes | **0** |
| Query-string language routes | **0** — locale is a path prefix |
| Empty indexable pages | **0** — every entity with no approved content is gated behind a flag and returns 404 |

## Pricing relations — added 2026-08-24

Source: `BLUE_DIAMOND_AESTHETIC_PRICING_APPROVED_2026-08-23.xlsx` +
client approval email 2026-08-23. Full detail in
`docs/APPROVED_AESTHETIC_PRICING_MATRIX.md`. No new routed entity was created —
prices attach to the treatment entities that already exist.

| Entity ID | Entity type | Priced rows | Price range CAD | Technology relation | Notes |
|---|---|---:|---|---|---|
| `treatment-laser-hair-removal` | Aesthetic treatment | 31 | $55 – $395 | `technology-elite-iq` | 31 discrete treatment areas, each its own price record |
| `treatment-rf-microneedling` | Aesthetic treatment | 16 | $350 – $1,550 | `technology-potenza` | Two mandated variants kept separate: regular tip (12 rows, incl. 4 body areas) and fusion/infusion tip with ampoule (4 rows) |
| `treatment-ultra` | Aesthetic treatment | 9 | $350 – $900 | `technology-ultra` | 7 Ultra rows + 2 `Ultra + PRP` rows. Ultra is **not** reclassified as PRP; the combined rows relate to the PRP entities |
| `treatment-radio-frequency` | Aesthetic treatment | 8 | $300 – $800 | `technology-tempsure` | TempSure **Envi** (7 face/neck rows) and TempSure **FlexSure** (1 body row) mapped as named applicator variants — see GAP-019 / CONF-024 |
| `treatment-laser-skin-treatments` | Aesthetic treatment | 7 | $250 – $500 | `technology-elite-iq` | 6 Laser Rejuvenation rows + 1 Vein Treatment row. The vein row relates to `concern-spider-veins`; **the concern is not priced as a treatment** |
| `treatment-prp-skin-rejuvenation` | Aesthetic treatment | 3 | $450 – $850 | — | 2 microneedling-delivered rows (incl. the $850 Neck email override) + 1 injection-delivered row (dark circles). Delivery methods kept as distinct variants |
| `treatment-tempsure-vitalia` | Women's wellness service | 2 | $500 – $1,000 | `technology-tempsure-vitalia` | Kept separate from TempSure Envi/FlexSure |
| `treatment-prp-hair-restoration` | Aesthetic treatment | 1 | $750 | — | Injection-delivered. The `Ultra + PRP / Hair Restoration` row is a separate record under `treatment-ultra` |
| `protocol-ultra-skin-solutions` | **Combined treatment protocol** | 1 | $1,300 | `technology-ultra` + `technology-potenza` | Workbook row 28. Components `treatment-ultra` + `treatment-rf-microneedling`; `treatmentArea: null`; `packagePrice: false`. **No canonical route** — renders in a "Combination Treatments" section on `/aesthetics/pricing` |
| `addon-tranexamic-acid-ampoule`, `addon-vitamin-c-ampoule`, `addon-vitamin-a-ampoule` | **Aesthetic Treatment Add-On** | 3 | $60 – $120 | — | Workbook rows 83–85. `priceType: "per-unit"`, unit = ampoule. Many-to-many eligibility across the RF Micro-Needling fusion/infusion variant and Ultra; stored once each. `publicDisplay: false` pending GAP-014 |

### Non-routed entity added

| Entity ID | Entity type | Canonical name | English route | Arabic route | Source sections | Related entities | Duplicate sources merged | Publication status |
|---|---|---|---|---|---|---|---|---|
| `PRICING-NOTE-001` | Structured-data fact / pricing note | Customized packages note | n/a | n/a | Client approval email 2026-08-23 | `aesthetics-pricing`, all 8 priced treatments | Absorbs the legacy "packages offered" (Word L1093) and "3- and 5-session packages" (Word L847) wording | Approved — carries **no amount**; stored as a general pricing note, never as a product or treatment price |

### Non-routed pricing entities added 2026-08-24

| Entity ID | Entity type | Canonical name | English route | Arabic route | Source | Related entities | Duplicate sources merged | Publication status |
|---|---|---|---|---|---|---|---|---|
| `protocol-ultra-skin-solutions` | Combined treatment protocol | Ultra Skin Solutions | n/a — price row on `/aesthetics/pricing` | n/a — price row on `/التجميل-الطبي/الأسعار` | Workbook row 28 | `treatment-ultra`, `treatment-rf-microneedling`, `technology-ultra`, `technology-potenza` | — | **Approved, publicly displayed.** Exact source name kept. Description limited to "combines Ultra and Potenza" — no benefits, duration, areas, results, or course stated |
| `addon-tranexamic-acid-ampoule` | Aesthetic Treatment Add-On | Tranexamic Acid Ampoule / أمبولة حمض الترانيكساميك | n/a | n/a | Workbook row 83 | eligible: `rf-microneedling-fusion-infusion`, `ultra-treatment` | — | Commercially approved · `clinicalPublicationStatus: "pending-clinician-review"` · `publicDisplay: false` |
| `addon-vitamin-c-ampoule` | Aesthetic Treatment Add-On | Vitamin C Ampoule / أمبولة فيتامين C | n/a | n/a | Workbook row 84 | eligible: `rf-microneedling-fusion-infusion`, `ultra-treatment` | — | Commercially approved · `pending-clinician-review` · `publicDisplay: false` |
| `addon-vitamin-a-ampoule` | Aesthetic Treatment Add-On | Vitamin A Ampoule / أمبولة فيتامين A | n/a | n/a | Workbook row 85 | eligible: `rf-microneedling-fusion-infusion`, `ultra-treatment` | — | Commercially approved (`sourceNote`: handwritten addition in the client-approved workbook) · `pending-clinician-review` · `publicDisplay: false` |

An **Aesthetic Treatment Add-On** is deliberately a separate entity family, not a
treatment: it carries per-unit pricing and a many-to-many eligibility relation, so
it is stored once and never duplicated under each eligible treatment. Commercial
price approval and clinical publication approval are tracked as two independent
fields, which is why all three can be `approvalStatus: "approved"` while
remaining unpublished.

**Integrity re-check:** still **104 routed entities, 0 route collisions, 0
duplicate canonical entities, 0 new canonical routes.** The pricing passes added
78 treatment-price records, 3 add-on price records, and 1 pricing note — all
attached to existing entities or held as non-routed structured facts.
