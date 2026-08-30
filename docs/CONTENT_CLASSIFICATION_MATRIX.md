# Blue Diamond — Content Classification Matrix

**Phase:** classification only. No application source code, no UI component, no
production deployment, and no DNS record was touched in this pass.

**Source under classification:**
`/home/blue-diamond-sources/BLUE_DIAMOND_CONTENT.md` — read-only, 57,684 bytes,
1,199 lines, 34 page sections, 148 sub-headings, 14 tables. The file was **not**
copied into this repository, not committed, and not modified.

## Source precedence applied

| # | Source | Status in this pass |
|---|--------|---------------------|
| 1 | Explicit client approvals / recent client emails | Not supplied to this pass — nothing here overrides on this basis |
| 2 | Approved pricing spreadsheets | **`BLUE_DIAMOND_AESTHETIC_PRICING_APPROVED_2026-08-23.xlsx` delivered 2026-08-24** (81 price rows) — see `docs/APPROVED_AESTHETIC_PRICING_MATRIX.md`. Together with SkinMedica product prices and uninsured medical fees, all three approved price sources now exist |
| 3 | Approved current doctor & product records | `src/features/doctors/data.ts` (6 doctors), `src/features/products/data.ts` (23 approved SKUs) |
| 4 | Approved Blue Diamond route registry | `src/config/routes.ts` — 104 bilingual entries, authoritative for every canonical route below |
| 5 | Verified clinic facts & centralized configuration | `src/config/site.ts`, `src/config/booking.ts`, `src/config/clinic-hours.ts`, `src/config/features.ts` |
| 6 | `BLUE_DIAMOND_CONTENT.md` | Authoritative for **wording and factual data only** |
| 7 | Legacy website page structure / internal links | **Not authoritative** — corrected throughout, see §5 corrections |
| 8 | Competitor content | Not used; no competitor wording entered any classification |

A lower-priority source never overwrote a higher-priority one. Where the Word
file and the approved registry disagreed on taxonomy, routing, or naming, the
registry won and the difference is recorded in `SOURCE_CONFLICT_REGISTER.md`.

## Column key

- **Classification** — exactly one of `PUBLISH`, `MERGE_WITH_CANONICAL_ENTITY`,
  `RELATION_ONLY`, `EXCLUDE_LEGACY_BOILERPLATE`, `NEEDS_CLIENT_APPROVAL`,
  `SUPERSEDED_BY_NEWER_SOURCE`.
- **Canonical AR route** — locale-prefixed public route is `/ar` + the path shown.
  `/en` + the EN path likewise. `n/a` means the block resolves to a structured
  fact or configuration record rather than a page of its own.
- **Approval status** — `Approved` (publishable now), `Pending client`
  (blocked on a client decision, tracked in `CONTENT_GAPS_AND_APPROVALS.md`),
  `N/A` (excluded or relation-only).

### Standing rule applied to every legacy `Meta Title` / `Meta Description` pair

All 34 legacy meta blocks are classified `SUPERSEDED_BY_NEWER_SOURCE`. The
approved route registry (precedence 4) already carries a bilingual title for
every canonical entity, and `src/lib/seo/metadata.ts` composes descriptions from
approved page content. Legacy meta is retained in this matrix as a keyword
reference only and must not be re-published verbatim — several legacy titles are
keyword-stuffed, one is the entire About paragraph pasted into a description
field, and two are the generic string "Blue Diamond Medical".

---

## Document header

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| — | Extraction document | 1–7 | Document title block | "Blue Diamond Medical / Website Content Extraction / Prepared by Dfeelings Digital Marketing Agency" | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Extraction-document metadata, never site content | N/A |
| — | Extraction document | 9–11, 572–574 | Per-site banners | "bluediamondmedical.ca — 12 pages extracted", "bluediamondmedicalaesthetics.ca — 22 pages extracted" | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Extraction annotation; counts verified (12 + 22 = 34) and carried into the completeness gate | N/A |

---

# Site A — bluediamondmedical.ca (12 pages)

## A1. Home (lines 13–80)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| medical | / | 13–19 | Meta title + description | "Blue Diamond Medical Clinic - Walk-In Medical Clinic" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `home` | `/` | `/` | Registry title approved and bilingual; legacy title is EN-only | Approved |
| medical | / | 21 | "Male and Female Physicians Accepting New Patients, Call 825 413 1113 to Book" | Hero banner asserting current new-patient acceptance | NEEDS_CLIENT_APPROVAL | Homepage content | `home` | `/` | `/` | Live availability claim that goes stale silently; phone must render from `siteConfig`, never hardcoded | Pending client |
| medical | / | 23 | Banner: "Botox Migraine Treatments Available" | Promo strip pointing at Botox | RELATION_ONLY | CTA | `home` → `botox-hub` | `/botox` | `/بوتوكس` | Structured link, not duplicated Botox copy | N/A |
| medical | / | 25–27 | "Services — WHAT WE OFFER — Learn More" | Nav teaser to /services | RELATION_ONLY | CTA | `home` → `medical-hub` | `/medical` | `/الرعاية-الطبية` | Legacy nav teaser; becomes a hub link | N/A |
| medical | / | 29–31 | "Questions? — ASK OUR SPECIALISTS — Contact Us" | Nav teaser to /contact-us | RELATION_ONLY | CTA | `home` → `contact` | `/contact` | `/تواصل-معنا` | Legacy nav teaser | N/A |
| medical | / | 33 | "CTA button: BOOK NOW (mika.care)" | Primary booking CTA | RELATION_ONLY | Booking destination | `booking:family-doctor` | n/a | n/a | Resolves through `getBookingUrl()`; URL never inlined in page content | N/A |
| medical | / | 35 | Practice-history paragraph | Opened 4 July 2022, West Springs, founded by Dr. Farhat (28 yrs), now six family physicians | PUBLISH | About content | `about` | `/about` | `/من-نحن` | Canonical home of the practice story; homepage carries a short excerpt only | Approved |
| medical | / | 37 | "BLUE DIAMOND MEDICAL TEAM — Learn more" | Nav teaser to /our-team | RELATION_ONLY | CTA | `home` → `doctors-index` | `/doctors` | `/الأطباء` | Legacy nav teaser | N/A |
| medical | / | 39–51 | "Your Glow On Your Terms" + 4 signature services | Aesthetics teaser: RF Micro-Needling, Skin Tightening, Laser Treatments, Botox Services | RELATION_ONLY | CTA | `home` → `aesthetics-hub`, 4 treatments | `/aesthetics` | `/التجميل-الطبي` | Teaser card set; full treatment copy lives on the treatment entities | N/A |
| medical | / | 53 | "Experience the best in beauty and rejuvenation without delay." | Superlative marketing line | NEEDS_CLIENT_APPROVAL | Homepage content | `home` | `/` | `/` | "the best" is an unsupported superiority claim (§12) | Pending client |
| medical | / | 55–61 | "Blue Diamond walk-in… West Springs" + address, tel, fax | Clinic NAP block | MERGE_WITH_CANONICAL_ENTITY | Location / Contact information | `location:main-clinic` | n/a | n/a | Duplicated on /contact-us; single record is `siteConfig.clinic` | Approved |
| medical | / | 63–67 | Hours table — "Open today 08:00 – 19:00" | Daily hours values | MERGE_WITH_CANONICAL_ENTITY | Opening-hours schedule | `hours:main-clinic` | n/a | n/a | Values merge into `clinicHours`; only Mon–Fri are source-confirmed | Pending client |
| medical | / | 65 | Static string "Open today" | Hardcoded open-state text | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | §5.16 — open state must be computed live from the schedule, never printed as static text | N/A |
| medical | / | 68 | "Closed All Statutory Holidays" | Holiday notice | MERGE_WITH_CANONICAL_ENTITY | Opening-hours schedule | `hours:statutory-notice` | n/a | n/a | Single bilingual notice reused everywhere hours render | Approved |
| medical | / | 70 | "Real stories from Blue Diamond Medical Clinic customers" | Testimonial module heading with zero testimonials | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Empty widget; fabricating testimonials is forbidden (§12) | N/A |
| medical | / | 72–74 | "Fitness Motivation on Instagram" + follow link | GoDaddy template residue on a medical clinic homepage | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | §5.17 — explicitly named legacy residue | N/A |
| medical | / | 76–78 | "Connect With Us" — Facebook, Instagram | Social profile links | MERGE_WITH_CANONICAL_ENTITY | Contact information | `contact:social` | n/a | n/a | Single record in `siteConfig.social`; handle is `bludiamondmedical` (no "e") — verified, not a typo to fix | Approved |
| medical | / | 80 | Footer "Copyright © 2026 … Powered by GoDaddy Website Builder" | Platform attribution | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Builder attribution; year conflict recorded as CONF-004 | N/A |

## A2. Appointment (lines 82–108)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| medical | /appointment-1 | 82–88 | Meta title + description | "Online Appointment Booking at Blue Diamond Medical Clinic" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `book-appointment` | `/book-appointment` | `/حجز-موعد` | Registry title governs | Approved |
| medical | /appointment-1 | 90 | "IMPORTANT NOTICE!" | All-caps shout heading | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Presentation residue; the notice body is classified separately | N/A |
| medical | /appointment-1 | 92 | Confirmation-system notice | Appointment confirmation/reminder system, missed appointments incur no-show fees | MERGE_WITH_CANONICAL_ENTITY | Clinic policy | `patient-resources-hub` | `/patient-resources` | `/موارد-المرضى` | Same policy also stated on /clinic-policies; one canonical statement. Source spells the vendor "Mikita" — the approved booking config records it as **Mika** | Approved |
| medical | /appointment-1 | 92 | Named walk-in roster: "headed by Dr. Omonijo, Dr. Gwea and Dr. Saeed" | Staffing assignment for the full-time walk-in clinic | NEEDS_CLIENT_APPROVAL | Doctor | `doctor-omonijo`, `doctor-gwea`, `doctor-saeed` | `/doctors/*` | `/الأطباء/*` | Roster assignments change without notice; publishing a stale rota misdirects walk-in patients | Pending client |
| medical | /appointment-1 | 94 | CTAs: "Book with Your Doctor Now!" / "Book your Eye Screening Now!" | Two external booking buttons | RELATION_ONLY | Booking destination | `booking:family-doctor`, `booking:eye-screening` | n/a | n/a | Both already in the approved centralized booking config | N/A |
| medical | /appointment-1 | 96–107 | "No Show Fees" table (6 rows) | Regular $40; Full Medical (CPX) $100; Paediatric Follow-up $100; Driver's Medical $125; Paediatric $200; Euclid Eye Health $50 | PUBLISH | Medical fee | `fees:no-show` | `/patient-resources` + `/medical/uninsured-services` | `/موارد-المرضى` + `/الرعاية-الطبية/الخدمات-غير-المشمولة` | All 6 rows carried verbatim into `noShowFees`; amounts never estimated | Approved |
| medical | /appointment-1 | 108 | Euclid cancellation line — 1-800-511-5661 | Cancel/reschedule number for Euclid Telehealth | MERGE_WITH_CANONICAL_ENTITY | Booking destination | `booking:eye-screening` | n/a | n/a | Belongs with the eye-screening service and booking record, not a standalone block | Approved |

## A3. Services — Uninsured Medical Services (lines 110–198)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| medical | /services | 110–116 | Meta title + description | "Uninsured Medical Services at Blue Diamond Medical Clinic" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `medical-uninsured-services` | `/medical/uninsured-services` | `/الرعاية-الطبية/الخدمات-غير-المشمولة` | Registry title governs | Approved |
| medical | /services | 118 | "Your Health, Our Priority" | Generic slogan, no content | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Contentless tagline | N/A |
| medical | /services | 120 | Two booking CTAs | Mika + Euclid buttons | RELATION_ONLY | Booking destination | `booking:family-doctor`, `booking:eye-screening` | n/a | n/a | Centralized booking config | N/A |
| medical | /services | 122–133 | "Uninsured Services — Forms" (7 rows) | APS $50+; Short Term Disability $50+; Certificates $50+; Blue Cross Special Auth $35; Long Term Disability $150; Handicap Placard $50; Medical Authorization $35 | PUBLISH | Medical fee | `fees:uninsured-forms` | `/medical/uninsured-services` | `/الرعاية-الطبية/الخدمات-غير-المشمولة` | 7/7 rows carried verbatim including "billed to provider" qualifiers | Approved |
| medical | /services | 135–145 | "Uninsured Services — Treatments" (6 rows) | Emigration Medical $400; Injections $20; Pregnancy Confirmation $5; Skin Tag Removal $60; Wart Treatment $10; Medical Supplies $5+ | PUBLISH | Medical fee | `fees:uninsured-treatments` | `/medical/uninsured-services` | `/الرعاية-الطبية/الخدمات-غير-المشمولة` | 6/6 rows carried verbatim | Approved |
| medical | /services | 147–160 | "Uninsured Services — Administrative Task" (9 rows) | Transfer of Records $50+ … Driver's Medical 75+ $100 | PUBLISH | Medical fee | `fees:uninsured-admin` | `/medical/uninsured-services` | `/الرعاية-الطبية/الخدمات-غير-المشمولة` | 9/9 rows carried verbatim; both Driver's Medical age tiers preserved as separate rows | Approved |
| medical | /services | 162–188 | "AHS Insured Services" — items with a canonical service page | Eye Disease Screening, Pain Management, Chronic Illness, Weight Management, Minor Procedures, Out-of-hours Care, Euclid Eye Screening | MERGE_WITH_CANONICAL_ENTITY | Medical service | 7 `medical-*` entities | `/medical/*` | `/الرعاية-الطبية/*` | Legacy flat bullet list becomes structured service entities; "Eye Disease Screening" and "Euclid Eye Screening" are one entity, not two | Approved |
| medical | /services | 162–188 | "AHS Insured Services" — items with no unique page-worthy content | General Family Medicine, Vaccination, Mental health, Women's Health, Some Botox Procedures | RELATION_ONLY | Medical service | `medical-hub` list items | `/medical` | `/الرعاية-الطبية` | Source supplies a label only; separate pages would be thin duplicates (§6 closing rule) | N/A |
| medical | /services | 168 | "Onsite Paediatrician" | Claimed on-site paediatric specialist | NEEDS_CLIENT_APPROVAL | Staff or leadership member | — | n/a | n/a | No paediatrician exists in the approved doctor record; publishing an unnamed specialist is an unsupported credential claim (§12) | Pending client |
| medical | /services | 190 | Out-of-hours referral partners | Mosaic PCN (mosaicpcn.ca) and Calgary West Central PCN (cwcpcn.com) as after-hours emergency routes | PUBLISH | Medical service | `medical-after-hours-care` | `/medical/after-hours-care` | `/الرعاية-الطبية/الرعاية-خارج-أوقات-الدوام` | Real operational content; both partners named | Approved |
| medical | /services | 190 | Per-doctor PCN split | Mosaic for Dr. Hamdi's patients; CWC for Dr. Farhat's patients | NEEDS_CLIENT_APPROVAL | Doctor ↔ service relation | `doctor-hamdi`, `doctor-farhat` | n/a | n/a | Covers only 2 of 6 physicians and contradicts /primary-care-network's clinic-wide CWC statement — CONF-009 | Pending client |
| medical | /services | 192–196 | "Online Booking for New and Walk-In Patients" | Skip the Waiting Room link + phone 825-413-1113 | RELATION_ONLY | Booking destination | `booking:walk-in`, `booking:phone` | n/a | n/a | Walk-in channel and telephone booking are approved destinations | N/A |
| medical | /services | 194 | `ab.skipthewaitingroom.com` URL | Third external booking host | NEEDS_CLIENT_APPROVAL | Booking destination | — | n/a | n/a | Host is **not** in the approved booking allowlist (`mika.care`, `euclidtelehealth.org`, `bluediamondmedical.janeapp.com`); confirm whether STWR is still in use before adding | Pending client |
| medical | /services | 198 | Trailing CTAs | "Book Now!" / "Book your Eye Screening now" | RELATION_ONLY | Booking destination | `booking:family-doctor`, `booking:eye-screening` | n/a | n/a | Duplicate of line 120 CTAs | N/A |

## A4. Our Team — Staff Profiles (lines 200–258)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| medical | /our-team | 200–204 | Meta title | "Our Team" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `doctors-index` | `/doctors` | `/الأطباء` | Registry title governs; no legacy description existed | Approved |
| medical | /our-team | 206 | "Staff Profiles" | Section nav label | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Label only | N/A |
| medical | /our-team | 208–210 | Dr. Farhat biography | Family physician, 28 years, minor surgery, cosmetic services | MERGE_WITH_CANONICAL_ENTITY | Doctor | `doctor-farhat` | `/doctors/mohamed-farhat` | `/الأطباء/محمد-فرحات` | Duplicated on the aesthetics site (lines 1065–1067); one authoritative biography | Approved |
| medical | /our-team | 212 | "Book an Appointment (mika.care)" | Farhat booking CTA | RELATION_ONLY | Booking destination | `doctor-farhat` → `booking:family-doctor` | n/a | n/a | Doctor→booking relation, not duplicated copy | N/A |
| medical | /our-team | 214–216 | Dr. Omaima Saeed biography | Postgraduate FM training (Pakistan); preventive medicine, women's health, stigma-free mental health | MERGE_WITH_CANONICAL_ENTITY | Doctor | `doctor-saeed` | `/doctors/omaima-saeed` | `/الأطباء/أميمة-سعيد` | Sole source for this doctor; **no portrait, stock person, generated face, or human silhouette may be rendered** (§7) | Approved |
| medical | /our-team | 218 | Empty `###` heading | Stray heading with no content | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Markup artifact between the Saeed and Hamdi profiles | N/A |
| medical | /our-team | 214–216 | Dr. Saeed — no booking CTA | Only physician on the page without a booking button | NEEDS_CLIENT_APPROVAL | Booking destination | `doctor-saeed` | n/a | n/a | Flagged for configuration review; no booking URL was invented. Current config assigns the shared `family-doctor` (Mika) channel used by every other physician — confirm this is correct rather than a deliberate omission | Pending client |
| medical | /our-team | 220–222 | Dr. Reem Hamdi biography | FM since 2015, U of C residency, maternity/newborn training, MSc U of A | MERGE_WITH_CANONICAL_ENTITY | Doctor | `doctor-hamdi` | `/doctors/reem-hamdi` | `/الأطباء/ريم-حمدي` | Duplicated on the aesthetics site (lines 1069–1071) | Approved |
| medical | /our-team | 224 | "Book an Appointment (mika.care)" | Hamdi booking CTA | RELATION_ONLY | Booking destination | `doctor-hamdi` → `booking:family-doctor` | n/a | n/a | Doctor→booking relation | N/A |
| medical | /our-team | 226–228 | Dr. Omonijo biography | 12 years community + hospital, UK FM residency | MERGE_WITH_CANONICAL_ENTITY | Doctor | `doctor-omonijo` | `/doctors/omonijo` | `/الأطباء/أومونيجو` | Single canonical profile | Approved |
| medical | /our-team | 230 | "Book an Appointment (mika.care)" | Omonijo booking CTA | RELATION_ONLY | Booking destination | `doctor-omonijo` → `booking:family-doctor` | n/a | n/a | Doctor→booking relation | N/A |
| medical | /our-team | 232–234 | Dr. Bakare biography | FM since 2006, hospitalist, Assistant Clinical Professor U of C, chronic disease + palliative care, in-house lesion excision and intra-articular injections | MERGE_WITH_CANONICAL_ENTITY | Doctor | `doctor-bakare` | `/doctors/bakare` | `/الأطباء/باكاري` | Single canonical profile; credentials carried verbatim, none invented | Approved |
| medical | /our-team | 236 | "Book an Appointment (mika.care)" | Bakare booking CTA | RELATION_ONLY | Booking destination | `doctor-bakare` → `booking:family-doctor` | n/a | n/a | Doctor→booking relation | N/A |
| medical | /our-team | 238–240 | Dr. Gwea biography, paragraph 1 (marked up as `###`) | Hamad Medical Corporation FM residency; RCPI Diploma in Dermatology; dermatology, preventive medicine, chronic disease management | MERGE_WITH_CANONICAL_ENTITY | Doctor | `doctor-gwea` | `/doctors/ahmed-gwea` | `/الأطباء/أحمد-جويع` | **Structural correction required**: body copy is authored as a heading. Convert to body text without altering meaning (§7). Portrait must use the approved branded abstract placeholder until an approved photograph exists | Approved |
| medical | /our-team | 242 | Dr. Gwea biography, paragraph 2 (marked up as `###`) | Long-term patient relationships; father of two, soccer | MERGE_WITH_CANONICAL_ENTITY | Doctor | `doctor-gwea` | `/doctors/ahmed-gwea` | `/الأطباء/أحمد-جويع` | Same structural correction as paragraph 1 | Approved |
| medical | /our-team | 244 | "Book an Appointment (mika.care)" | Gwea booking CTA | RELATION_ONLY | Booking destination | `doctor-gwea` → `booking:family-doctor` | n/a | n/a | Doctor→booking relation | N/A |
| medical | /our-team | 246–250 | "About Blue Diamond Medical Clinic" / "Our Mission" | Exceptional care in a family-based environment; "prevention is better than cure"; compassion, caring, wellbeing for ALL | MERGE_WITH_CANONICAL_ENTITY | About content | `about` | `/about` | `/من-نحن` | Mission belongs on About, not on the doctor index | Approved |
| medical | /our-team | 252–254 | "Our Services" filler paragraph | "From routine check-ups to specialized treatments, we've got you covered." | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Generic template filler; the real service list is the AHS block above | N/A |
| medical | /our-team | 256–258 | "Our Team" filler paragraph | "highly skilled and experienced healthcare professionals…" | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Generic template filler; the real content is the six biographies | N/A |

## A5. Medical Aesthetics (lines 260–278)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| medical | /medical-aesthetics-1 | 260–266 | Meta title + description | "Medical Aesthetics" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `aesthetics-hub` | `/aesthetics` | `/التجميل-الطبي` | Registry title governs | Approved |
| medical | /medical-aesthetics-1 | 268–270 | "RF Micro-Needling" teaser | Cross-domain link to bluediamondmedicalaesthetics.ca/rf-micro-needeling | RELATION_ONLY | Aesthetic treatment | `treatment-rf-microneedling` | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية` | Cross-domain link collapses into a same-site relation; misspelled legacy slug corrected (§5.9) | N/A |
| medical | /medical-aesthetics-1 | 272–274 | "Skin Tightening" teaser | Links to /radio-frequency | RELATION_ONLY | Aesthetic treatment / concern | `treatment-radio-frequency` + `concern-skin-laxity` | `/aesthetics/treatments/radio-frequency` | `/التجميل-الطبي/العلاجات/الترددات-الراديوية` | Legacy label "Skin Tightening" is the outcome; the delivered procedure is Radio Frequency and the patient-facing problem is Skin Laxity | N/A |
| medical | /medical-aesthetics-1 | 276–278 | "Laser Treatments" teaser | Links to `/laser-treatment` — a path that does not exist (real page is `/laser-treatment-1`) | RELATION_ONLY | Aesthetic treatment | `treatment-laser-skin-treatments` | `/aesthetics/treatments/laser-skin-treatments` | `/التجميل-الطبي/العلاجات/علاجات-البشرة-بالليزر` | §5.8 — broken legacy link is not made canonical; it is handled in the redirect map only | N/A |

## A6. Botox (lines 280–338)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| medical | /botox-1 | 280–286 | Meta title + description | "Botox Treatments at Blue Diamond Medical Clinic" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `botox-hub` | `/botox` | `/بوتوكس` | Registry title governs | Approved |
| medical | /botox-1 | 288 | "Boost Your Health!" | Generic slogan | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Contentless tagline | N/A |
| medical | /botox-1 | 290–292 | Botox process narrative | Dr. Farhat administers; every treatment starts with a consultation and proceeds only on patient comfort; out-of-hours appointments available | PUBLISH | Medical Botox service | `botox-hub` | `/botox` | `/بوتوكس` | Consultation-first process is real, useful, non-promotional content | Approved |
| medical | /botox-1 | 292 | "lunchtime procedures… back to your normal schedule within 90 minutes" | Specific recovery-time promise | NEEDS_CLIENT_APPROVAL | Medical Botox service | `botox-hub` | `/botox` | `/بوتوكس` | Unqualified downtime promise (§12) — needs either a clinician-confirmed qualifier or removal | Pending client |
| medical | /botox-1 | 294 | Coverage + compassionate-program paragraph | Migraine/bruxism/hyperhidrosis Botox "covered by a combination of provincial health insurance and either patient private insurance or our compassionate program"; open to all Albertans whether registered or not | NEEDS_CLIENT_APPROVAL | Medical Botox service | `botox-hub` | `/botox` | `/بوتوكس` | Insurance-eligibility guarantee (§12). The eligibility half ("open to all Albertans") is the clinic's own policy and is safe; the coverage half needs written confirmation | Pending client |
| medical | /botox-1 | 296 | "Blue Diamond Medical provides the following Botox treatments" | Section label | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Label only | N/A |
| medical | /botox-1 | 298–304 | "Medical Botox" — migraine, hyperhidrosis, bruxism (TMJ)/jaw pain | Three medically-indicated Botox uses | MERGE_WITH_CANONICAL_ENTITY | Medical Botox service | `medical-botox-hub` + `medical-botox-migraine` / `-bruxism-tmj` / `-hyperhidrosis` | `/medical/botox`, `/medical/botox/{migraine,bruxism-tmj,hyperhidrosis}` | `/الرعاية-الطبية/بوتوكس/…` | §6 — medical indications kept structurally separate from cosmetic. Detail sub-pages stay gated: the source carries no unique per-condition copy beyond what `/botox` already publishes, so splitting three ways would create thin duplicates | Approved |
| medical | /botox-1 | 306–336 | "Cosmetic Botox" — 15 treatment areas | Frown lines, forehead lines, crow's feet, bunny lines, frontalis, jelly roll, Nefertiti neck lift, gummy smile, nasal smile, lip flip, downturned smile, browlift, cobbled chin, chin, platysma | MERGE_WITH_CANONICAL_ENTITY | Aesthetic treatment | `treatment-cosmetic-botox` (gated) + `botox-hub` cosmetic section | `/aesthetics/treatments/cosmetic-botox` | `/التجميل-الطبي/العلاجات/بوتوكس-تجميلي` | §6 — cosmetic areas are an aesthetic treatment, never merged into the medical entity. The 15 areas are a bare list with no per-area copy, so the dedicated page stays gated and the list publishes on the `/botox` hub | Approved |
| medical | /botox-1 | 338 | "Please call the clinic to book on 825 413 1113" | Telephone-only booking instruction | RELATION_ONLY | Booking destination | `booking:phone-medical-botox` | n/a | n/a | No online Botox booking exists; telephone is the approved channel | N/A |

## A7. Eye Examining (lines 340–354)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| medical | /eye-examining | 340–346 | Meta title + description | "Eye Examining" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `medical-eye-screening` | `/medical/eye-screening` | `/الرعاية-الطبية/فحص-العين` | Registry title "Eye Disease Screening" is more accurate and bilingual | Approved |
| medical | /eye-examining | 348–350 | Euclid Telehealth partnership — operational detail | On-site one day per month; non-invasive 20-minute screening; Euclid contacts the patient on the doctor's recommendation | PUBLISH | Medical service | `medical-eye-screening` | `/medical/eye-screening` | `/الرعاية-الطبية/فحص-العين` | Concrete operational facts patients need | Approved |
| medical | /eye-examining | 350 | "free screening… covered by Alberta Health Care" | Coverage and cost claim | NEEDS_CLIENT_APPROVAL | Medical service | `medical-eye-screening` | `/medical/eye-screening` | `/الرعاية-الطبية/فحص-العين` | Insurance/eligibility guarantee (§12); coverage rules change and are not the clinic's to guarantee | Pending client |
| medical | /eye-examining | 352 | Euclid contact — patientsupport@euclidtelehealth.org, 1-800-511-5661 | Partner support channels | MERGE_WITH_CANONICAL_ENTITY | Booking destination | `booking:eye-screening` | n/a | n/a | Merges with the cancellation number from /appointment-1 line 108 | Approved |
| medical | /eye-examining | 354 | CTAs "Learn More" / "Book Now" | euclidtelehealth.org/bluediamond and /book-now | RELATION_ONLY | Booking destination | `booking:eye-screening` | n/a | n/a | Centralized booking config | N/A |

## A8. Primary Care Network (lines 356–394)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| medical | /primary-care-network | 356–360 | Meta title | "Primary Care Network \| Blue Diamond Medical Clinic" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `medical-after-hours-care` | `/medical/after-hours-care` | `/الرعاية-الطبية/الرعاية-خارج-أوقات-الدوام` | Registry title governs | Approved |
| medical | /primary-care-network | 362–364 | CWC PCN membership intro | Clinic and doctors work with CWC PCN to provide free enhanced care; patients may be referred | MERGE_WITH_CANONICAL_ENTITY | Medical service | `medical-after-hours-care` | `/medical/after-hours-care` | `/الرعاية-الطبية/الرعاية-خارج-أوقات-الدوام` | PCN partnership is part of the after-hours/enhanced-care service, not a standalone page | Approved |
| medical | /primary-care-network | 366–368 | "Nursing appointments" | Primary Care RNs, chronic disease care plans, education, goal-setting | MERGE_WITH_CANONICAL_ENTITY | Patient resource | `medical-after-hours-care` (PCN services section) | `/medical/after-hours-care` | `/الرعاية-الطبية/الرعاية-خارج-أوقات-الدوام` | One PCN services section rather than six thin pages | Approved |
| medical | /primary-care-network | 370–372 | "Mental health support" | Referral to a Primary Care Registered Psychologist | MERGE_WITH_CANONICAL_ENTITY | Patient resource | `medical-after-hours-care` | `/medical/after-hours-care` | `/الرعاية-الطبية/الرعاية-خارج-أوقات-الدوام` | Same section | Approved |
| medical | /primary-care-network | 374–376 | "Social work" | Housing, community services, benefits navigation | MERGE_WITH_CANONICAL_ENTITY | Patient resource | `medical-after-hours-care` | `/medical/after-hours-care` | `/الرعاية-الطبية/الرعاية-خارج-أوقات-الدوام` | Same section | Approved |
| medical | /primary-care-network | 378–380 | "Senior Services" | Health goals, access to medical and community services | MERGE_WITH_CANONICAL_ENTITY | Patient resource | `medical-after-hours-care` | `/medical/after-hours-care` | `/الرعاية-الطبية/الرعاية-خارج-أوقات-الدوام` | Same section | Approved |
| medical | /primary-care-network | 382–384 | "Dietitian support" | Primary Care Registered Dietitians, nutrition care plans | MERGE_WITH_CANONICAL_ENTITY | Patient resource | `medical-after-hours-care` | `/medical/after-hours-care` | `/الرعاية-الطبية/الرعاية-خارج-أوقات-الدوام` | Same section | Approved |
| medical | /primary-care-network | 386–388 | "Screening support" | Health Information / Patient Care Coordinators book overdue screening | MERGE_WITH_CANONICAL_ENTITY | Patient resource | `medical-after-hours-care` | `/medical/after-hours-care` | `/الرعاية-الطبية/الرعاية-خارج-أوقات-الدوام` | Same section | Approved |
| medical | /primary-care-network | 390–392 | "Access Appointment Service" | 24-hour non-emergency access at CWC PCN Primary Care Centre; 9am–9pm weekdays, 9am–4pm weekends/holidays; visit notes returned to your doctor | MERGE_WITH_CANONICAL_ENTITY | Medical service | `medical-after-hours-care` | `/medical/after-hours-care` | `/الرعاية-الطبية/الرعاية-خارج-أوقات-الدوام` | Core after-hours content; hours belong to the partner, not the clinic schedule | Approved |
| medical | /primary-care-network | 394 | "visit their website (cwcpcn.com)" | External partner link | RELATION_ONLY | Booking destination / partner | `partner:cwc-pcn` | n/a | n/a | Structured external relation | N/A |

## A9. Clinic Policies (lines 396–444)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| medical | /clinic-policies | 396–400 | Meta title | "Clinic Policies \| Blue Diamond Medical Clinic" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `patient-resources-hub` | `/patient-resources` | `/موارد-المرضى` | Registry title governs | Approved |
| medical | /clinic-policies | 402–404 | Policies preamble | Exceptional care requires patient co-operation with the following policies | MERGE_WITH_CANONICAL_ENTITY | Clinic policy | `patient-resources-hub` | `/patient-resources` | `/موارد-المرضى` | Intro for the policy set | Approved |
| medical | /clinic-policies | 406–416 | "Appointments" (5 bullets) | On time (>5 min late may rebook); bring Alberta Healthcare Number; 15-minute standard, 48h notice for 30 minutes; confirm attendance or no-show fees apply; keep contact details current | PUBLISH | Clinic policy | `policy:appointments` | `/patient-resources` | `/موارد-المرضى` | Already published; all five bullets accounted for | Approved |
| medical | /clinic-policies | 418–420 | "General Conduct" | Mutual courtesy; rude/aggressive/bullying behaviour leads to removal and discharge; abusive calls terminated | MERGE_WITH_CANONICAL_ENTITY | Clinic policy | `policy:conduct` | `/patient-resources` | `/موارد-المرضى` | Valid approved policy **not currently published** — must be added to the canonical policy set | Approved |
| medical | /clinic-policies | 422–424 | "Prescription Refills" | New meds require an in-person visit; pharmacy faxes renewal to +1 (587) 443-0394; 2 business days; ask for an extension if you run out | PUBLISH | Clinic policy | `policy:prescriptions` | `/patient-resources` | `/موارد-المرضى` | Already published | Approved |
| medical | /clinic-policies | 426–428 | "Test Results" | Secure messaging for results; opt-out available; never communicated by insecure email | MERGE_WITH_CANONICAL_ENTITY | Clinic policy | `policy:test-results` | `/patient-resources` | `/موارد-المرضى` | Valid approved policy **not currently published**; also supports the "no health data in ordinary web forms" rule (§9) | Approved |
| medical | /clinic-policies | 430–432 | "Referrals and Investigations" | X-ray/MRI/ultrasound referrals only via an in-person visit with your family doctor | MERGE_WITH_CANONICAL_ENTITY | Clinic policy | `policy:referrals` | `/patient-resources` | `/موارد-المرضى` | Valid approved policy **not currently published** | Approved |
| medical | /clinic-policies | 434–436 | "Telephone Consultations" | At the doctor's discretion, booked in advance; confirmation and no-show fees apply | MERGE_WITH_CANONICAL_ENTITY | Clinic policy | `policy:telephone-consults` | `/patient-resources` | `/موارد-المرضى` | Valid approved policy **not currently published** | Approved |
| medical | /clinic-policies | 438–440 | "Uninsured Services" policy | Some services are not AHS-covered; fees payable in full before documents are released | MERGE_WITH_CANONICAL_ENTITY | Clinic policy | `policy:uninsured` | `/patient-resources` | `/موارد-المرضى` | Policy text lives with the policies; the fee tables live on the pricing page and are linked, not duplicated | Approved |
| medical | /clinic-policies | 438 | "see the uninsured services page" | Cross-reference | RELATION_ONLY | Clinic policy → pricing | `patient-resources-hub` → `medical-uninsured-services` | `/medical/uninsured-services` | `/الرعاية-الطبية/الخدمات-غير-المشمولة` | Structured link | N/A |
| medical | /clinic-policies | 442–444 | "Confidentiality" | Legal requirement; nothing shared with insurers, lawyers, or other clinics without express written permission | PUBLISH | Clinic policy | `policy:confidentiality` | `/patient-resources` | `/موارد-المرضى` | Already published | Approved |

## A10. Join our Team (lines 446–472)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| medical | /join-our-team | 446–452 | Meta title + description | "Join our Team" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `careers` | `/careers` | `/الوظائف` | Registry title governs | Approved |
| medical | /join-our-team | 454 | "We're Hiring!" | Careers headline | PUBLISH | Careers content | `careers` | `/careers` | `/الوظائف` | Real headline for a live page | Approved |
| medical | /join-our-team | 456–458 | "Join Our Team" body | Seeking qualified medical staff committed to patient care without sacrificing wellbeing; apply by form or accountant@bluediamondmedical.ca | PUBLISH | Careers content | `careers` | `/careers` | `/الوظائف` | Approved copy; email lives in `siteConfig.careersEmail` | Approved |
| medical | /join-our-team | 460–470 | "Apply Now" form fields | Name*, Phone*, Email*, Attach Resume, reCAPTCHA-protected | PUBLISH | Careers content | `careers` (form) | `/careers` | `/الوظائف` | Collects no symptoms, diagnoses, or health information — compliant with §9 | Approved |
| medical | /join-our-team | 472 | "Submit Application" button | Form submit CTA | RELATION_ONLY | CTA | `careers` | `/careers` | `/الوظائف` | Form action, not content | N/A |

## A11. Contact Us (lines 474–495)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| medical | /contact-us | 474–480 | Meta title + description | Keyword-stuffed title; the description is the entire practice-history paragraph pasted into a meta field | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `contact` | `/contact` | `/تواصل-معنا` | Registry title governs; the pasted description duplicates the About paragraph (line 35) and must not be republished as meta | Approved |
| medical | /contact-us | 482–488 | Contact heading + tel, fax, address | Duplicate of the homepage NAP block | MERGE_WITH_CANONICAL_ENTITY | Location / Contact information | `location:main-clinic` | `/contact` | `/تواصل-معنا` | Second copy of the same facts; one `siteConfig.clinic` record | Approved |
| medical | /contact-us | 490–493 | Hours table — "Open today 08:00 a.m. – 07:00 p.m." | Same hours as the homepage in 12-hour format | MERGE_WITH_CANONICAL_ENTITY | Opening-hours schedule | `hours:main-clinic` | n/a | n/a | Duplicate of lines 63–67; consistent, no conflict; formatting is a display concern | Pending client |
| medical | /contact-us | 495 | "Closed All Statutory Holidays. Get directions (map link)." | Holiday notice + map | MERGE_WITH_CANONICAL_ENTITY | Location | `hours:statutory-notice`, `location:main-clinic` | `/contact` | `/تواصل-معنا` | Directions derive from the single address record | Approved |

## A12. Products — SkinMedica (lines 497–570)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| medical | /products | 497–501 | Meta title | "Products \| Blue Diamond Medical Clinic" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `shop-hub` | `/shop` | `/المتجر` | Registry title "SkinMedica Products" is accurate; the catalogue carries SkinMedica exclusively | Approved |
| medical | /products | 503 | Orphan-page note | "not linked from the main navigation menu but is live on the site" | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Extraction annotation, not page content. The orphan status is why the catalogue must be reachable from navigation post-migration | N/A |
| medical | /products | 505 | "SkinMedica® Products" | Catalogue heading | MERGE_WITH_CANONICAL_ENTITY | Product category | `shop-hub` | `/shop` | `/المتجر` | Becomes the catalogue hub title | Approved |
| medical | /products | 507–511 | "The Growth Factor — Groundbreaking science for skin that's transformed" | Group label + tagline (3 products) | PUBLISH | Product category | `category-tagline:the-growth-factor` | `/shop` | `/المتجر` | Client-approved organizational grouping, preserved as a label; products are also filed under the functional category taxonomy | Approved |
| medical | /products | 516–520 | "The Cleanse Factor — An array of cleansers for every skin type" | Group label + tagline (2 products) | PUBLISH | Product category | `category-tagline:the-cleanse-factor` | `/shop` | `/المتجر` | As above | Approved |
| medical | /products | 524–528 | "The Correct Factor — Target a wide variety of skin concerns" | Group label + tagline (5 products) | PUBLISH | Product category | `category-tagline:the-correct-factor` | `/shop` | `/المتجر` | As above | Approved |
| medical | /products | 535–539 | "The Protect Factor — Everyday protection for all skin types" | Group label + tagline (3 products) | PUBLISH | Product category | `category-tagline:the-protect-factor` | `/shop` | `/المتجر` | As above | Approved |
| medical | /products | 544–548 | "The Hydration Factor — Essential hydration skin needs" | Group label + tagline (5 products) | PUBLISH | Product category | `category-tagline:the-hydration-factor` | `/shop` | `/المتجر` | As above | Approved |
| medical | /products | 555–559 | "Scarring" | Group label, no tagline (2 products) | PUBLISH | Product category | `product-category:scar-care` | `/shop/category/scar-care` | `/المتجر/فئة/العناية-بالندبات` | Maps to the functional Scar Care category | Approved |
| medical | /products | 563–567 | "Rejuvenation" | Group label, no tagline (3 products) | PUBLISH | Product category | `product-category:serums` / `moisturizers` | `/shop/category/serums` | `/المتجر/فئة/السيروم` | Legacy group splits across functional categories by product type | Approved |

### A12b. SkinMedica product records — classified individually (23 of 23)

Every row below is `PUBLISH` / entity family **Product**. Price and size are
carried **verbatim** from the Word table and match the approved product record
exactly, all 23/23 — no price was estimated, inferred, or adjusted. Where the
display name differs from the legacy name, the change is a verified
current-official-manufacturer name only; the approved price and size are
unchanged and the legacy variant is retained as a name variant.

Fields captured per product in the approved record: canonical name, legacy name
variants, size, approved price, short + long description, category, skin-concern
relationships, usage information, approved claims, warnings/limitations, source
location, approval status, image status, EN route, AR route. Not invented for any
product: ingredients, benefits, claims, sizes, prices, inventory, shipping,
payment, availability.

**Image status for all 23: `pending`** — no approved SkinMedica packshot exists
in the media archive; the approved neutral placeholder renders until photography
is supplied.

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| medical | /products | 512 | Lumivive® System Day, Night | $285.00 · 28.4 g · category: treatment-systems | PUBLISH | Product | `shop-product-lumivive-system` | `/shop/lumivive-system-day-night` | `/المتجر/نظام-لوميفيف-نهار-ليل` | Name, price, and size identical to the approved record; image pending | Approved |
| medical | /products | 513 | TNS Eye Repair® | $108.00 · 14.2 g · category: eye-care | PUBLISH | Product | `shop-product-tns-eye-repair` | `/shop/tns-eye-repair` | `/المتجر/تي-إن-إس-لإصلاح-محيط-العين` | Trademark-symbol placement only (legacy: TNS Eye Repair®); wording, price, and size unchanged; image pending | Approved |
| medical | /products | 514 | Vitamin C+E Complex | $108.00 · 28.3 g · category: serums | PUBLISH | Product | `shop-product-vitamin-c-e-complex` | `/shop/vitamin-c-e-complex` | `/المتجر/مركب-فيتامين-سي-إي` | Name, price, and size identical to the approved record; image pending | Approved |
| medical | /products | 521 | Facial Cleanser | $40.00 · 177.4 ml · category: cleansers | PUBLISH | Product | `shop-product-facial-cleanser` | `/shop/facial-cleanser` | `/المتجر/غسول-الوجه` | Name, price, and size identical to the approved record; image pending | Approved |
| medical | /products | 522 | AHA/BHA Exfoliating Cleanser | $50.00 · 177.4 ml · category: cleansers | PUBLISH | Product | `shop-product-aha-bha-exfoliating-cleanser` | `/shop/aha-bha-exfoliating-cleanser` | `/المتجر/غسول-مقشر-aha-bha` | Name, price, and size identical to the approved record; image pending | Approved |
| medical | /products | 529 | Retinol Complex 0.25 | $66.00 · 29.6 g · category: retinol | PUBLISH | Product | `shop-product-retinol-complex-025` | `/shop/retinol-complex-0-25` | `/المتجر/مركب-الريتينول-٠٫٢٥` | Name, price, and size identical to the approved record; image pending | Approved |
| medical | /products | 530 | Retinol Complex 0.5 | $83.00 · 29.6 g · category: retinol | PUBLISH | Product | `shop-product-retinol-complex-05` | `/shop/retinol-complex-0-5` | `/المتجر/مركب-الريتينول-٠٫٥` | Name, price, and size identical to the approved record; image pending | Approved |
| medical | /products | 531 | Retinol Complex 1.0 | $99.00 · 29.6 g · category: retinol | PUBLISH | Product | `shop-product-retinol-complex-10` | `/shop/retinol-complex-1-0` | `/المتجر/مركب-الريتينول-١٫٠` | Name, price, and size identical to the approved record; image pending | Approved |
| medical | /products | 532 | Lytera® 2.0 Pigment Brightening Serum | $170.00 · 60 ml · category: serums | PUBLISH | Product | `shop-product-lytera-2-pigment-brightening-serum` | `/shop/lytera-2-pigment-brightening-serum` | `/المتجر/سيروم-لايتيرا-٢-لتفتيح-التصبغات` | Name, price, and size identical to the approved record; image pending | Approved |
| medical | /products | 533 | AHA/BHA Cream | $46.00 · 56.7 g · category: treatment-systems | PUBLISH | Product | `shop-product-aha-bha-cream` | `/shop/aha-bha-cream` | `/المتجر/كريم-aha-bha` | Name, price, and size identical to the approved record; image pending | Approved |
| medical | /products | 540 | Daily Physical Defense™ SPF 34 | $51.00 · 85 ml · category: sunscreen | PUBLISH | Product | `shop-product-daily-physical-defense-spf-34` | `/shop/daily-physical-defense-spf-34` | `/المتجر/واقي-الشمس-اليومي-spf-34` | Trademark-symbol placement only (legacy: Daily Physical Defense™ SPF 34); wording, price, and size unchanged; image pending | Approved |
| medical | /products | 541 | Total Defence + Repair SPF 34 (Tinted) | $75.00 · 65 g · category: sunscreen | PUBLISH | Product | `shop-product-total-defence-repair-spf-34-tinted` | `/shop/total-defence-repair-spf-34-tinted` | `/المتجر/واقي-الشمس-الشامل-والإصلاح-spf-34-ملون` | Legacy name variant retained: Total Defence + Repair SPF 34 (Tinted) → verified current official manufacturer name; approved price and size unchanged; image pending | Approved |
| medical | /products | 542 | Total Defence + Repair SPF 34 (Clear) | $75.00 · 65 g · category: sunscreen | PUBLISH | Product | `shop-product-total-defence-repair-spf-34-clear` | `/shop/total-defence-repair-spf-34-clear` | `/المتجر/واقي-الشمس-الشامل-والإصلاح-spf-34-شفاف` | Legacy name variant retained: Total Defence + Repair SPF 34 (Clear) → verified current official manufacturer name; approved price and size unchanged; image pending | Approved |
| medical | /products | 549 | Dermal Repair Cream | $136.00 · 48 g · category: moisturizers | PUBLISH | Product | `shop-product-dermal-repair-cream` | `/shop/dermal-repair-cream` | `/المتجر/كريم-إصلاح-البشرة` | Name, price, and size identical to the approved record; image pending | Approved |
| medical | /products | 550 | Rejuvenative Moisturizer | $62.00 · 56.7 g · category: moisturizers | PUBLISH | Product | `shop-product-rejuvenative-moisturizer` | `/shop/rejuvenative-moisturizer` | `/المتجر/مرطب-منشط` | Name, price, and size identical to the approved record; image pending | Approved |
| medical | /products | 551 | Replenish Hydrating Cream | $70.00 · 56.7 g · category: moisturizers | PUBLISH | Product | `shop-product-replenish-hydrating-cream` | `/shop/replenish-hydrating-cream` | `/المتجر/كريم-ترطيب-مجدد` | Name, price, and size identical to the approved record; image pending | Approved |
| medical | /products | 552 | TNS Ceramide Treatment Cream™ | $72.00 · 56.7 g · category: moisturizers | PUBLISH | Product | `shop-product-tns-ceramide-treatment-cream` | `/shop/tns-ceramide-treatment-cream` | `/المتجر/كريم-tns-العلاجي-بالسيراميد` | Trademark-symbol placement only (legacy: TNS Ceramide Treatment Cream™); wording, price, and size unchanged; image pending | Approved |
| medical | /products | 553 | Ultra Sheer Moisturizer | $62.00 · 56.7 g · category: moisturizers | PUBLISH | Product | `shop-product-ultra-sheer-moisturizer` | `/shop/ultra-sheer-moisturizer` | `/المتجر/مرطب-خفيف-فائق` | Name, price, and size identical to the approved record; image pending | Approved |
| medical | /products | 560 | Scar Recovery Gel with Centelline (Small) | $46.00 · 14.2 g · category: scar-care | PUBLISH | Product | `shop-product-scar-recovery-gel-small` | `/shop/scar-recovery-gel-with-centelline-small` | `/المتجر/جل-علاج-الندبات-بالسنتيلين-صغير` | Trademark-symbol placement only (legacy: Scar Recovery Gel with Centelline (Small)); wording, price, and size unchanged; image pending | Approved |
| medical | /products | 561 | Scar Recovery Gel with Centelline (Large) | $108.00 · 56.7 g · category: scar-care | PUBLISH | Product | `shop-product-scar-recovery-gel-large` | `/shop/scar-recovery-gel-with-centelline-large` | `/المتجر/جل-علاج-الندبات-بالسنتيلين-كبير` | Trademark-symbol placement only (legacy: Scar Recovery Gel with Centelline (Large)); wording, price, and size unchanged; image pending | Approved |
| medical | /products | 568 | TNS Advanced Plus Serum® | $330.00 · 28.4 g · category: serums | PUBLISH | Product | `shop-product-tns-advanced-plus-serum` | `/shop/tns-advanced-plus-serum` | `/المتجر/سيروم-tns-المتقدم-بلس` | Legacy name variant retained: TNS Advanced Plus Serum® → verified current official manufacturer name; approved price and size unchanged; image pending | Approved |
| medical | /products | 569 | TNS Recovery Complex | $250.00 · 28.4 g · category: serums | PUBLISH | Product | `shop-product-tns-recovery-complex` | `/shop/tns-recovery-complex` | `/المتجر/مركب-tns-للتعافي` | Trademark-symbol placement only (legacy: TNS Recovery Complex); wording, price, and size unchanged; image pending | Approved |
| medical | /products | 570 | HA5 Rejuvenative Hydrator | $196.00 · 56.7 g · category: moisturizers, serums | PUBLISH | Product | `shop-product-ha5-rejuvenative-hydrator` | `/shop/ha5-rejuvenative-hydrator` | `/المتجر/مرطب-ha5-المنشط` | Legacy name variant retained: HA5 Rejuvenative Hydrator → verified current official manufacturer name; approved price and size unchanged; image pending | Approved |

**Product source-count reconciliation:** the Word extraction contains **23**
priced SkinMedica records (lines 512–570; seven blank header-artifact rows in the
seven tables are not records). The approved product manifest also contains **23**
records. Every one of the 23 matched on name, price, and size — verified
programmatically, zero mismatches, zero unmatched products in either direction.
No product was deleted. The "21 products" figure that appears in the
classification brief does not match either source and is recorded as **CONF-014**;
it must not be used to trim the catalogue.

---

# Site B — bluediamondmedicalaesthetics.ca (22 pages)

The entire aesthetics domain becomes a **legacy redirect source**. It does not
remain a second canonical website, and no `bluediamondmedicalaesthetics.ca` URL
appears as a canonical route anywhere below.

## B1. Home (lines 576–621)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| aesthetics | / | 576–582 | Meta title + description | Keyword-stuffed: "Revitalize Your Skin with Aesthetics Microneedling Radio Frequency waves, and Laser Treatment" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `aesthetics-hub` | `/aesthetics` | `/التجميل-الطبي` | Registry title governs; legacy title is keyword stuffing and must not be reused | Approved |
| aesthetics | / | 584 | "Welcome to Blue Diamond Medical Aesthetics" | Hub headline | MERGE_WITH_CANONICAL_ENTITY | Homepage content | `aesthetics-hub` | `/aesthetics` | `/التجميل-الطبي` | Becomes the aesthetics hub heading under the single canonical site | Approved |
| aesthetics | / | 586 | "Schedule a consultation (tel: 403-247-1418)" | Phone CTA | RELATION_ONLY | Booking destination | `booking:phone-aesthetics` | n/a | n/a | Distinct approved aesthetics line; never merged with the medical number | N/A |
| aesthetics | / | 588 | "RF Micro Needling / Skin Tightening / Laser Treatments" | Three-up teaser strip | RELATION_ONLY | Aesthetic treatment | `treatment-rf-microneedling`, `treatment-radio-frequency`, `treatment-laser-skin-treatments` | `/aesthetics/treatments/*` | `/التجميل-الطبي/العلاجات/*` | Teaser links; "Skin Tightening" resolves to Radio Frequency + the Skin Laxity concern | N/A |
| aesthetics | / | 590–592 | "About Us — Our Expertise" | Specialization in RF microneedling, laser, RF treatments | MERGE_WITH_CANONICAL_ENTITY | About content | `aesthetics-hub` | `/aesthetics` | `/التجميل-الطبي` | Aesthetics positioning belongs on the hub | Approved |
| aesthetics | / | 592 | "committed to providing you with the best possible care" | Superlative | NEEDS_CLIENT_APPROVAL | About content | `aesthetics-hub` | `/aesthetics` | `/التجميل-الطبي` | "best" superiority claim (§12) | Pending client |
| aesthetics | / | 594–596 | "Shop Our Premium Collection" + SHOP Now button | Retail teaser; the legacy button has **no functional link** | RELATION_ONLY | Product category | `aesthetics-hub` → `shop-hub` | `/shop` | `/المتجر` | Dead legacy CTA is repaired by routing to the canonical catalogue (§10) | N/A |
| aesthetics | / | 598–600 | "Our Services / Our Technologies / Our Team" | Three nav cards to /area-concern, /our-technologies, /our-team | RELATION_ONLY | CTA | `aesthetics-concerns-hub`, `aesthetics-technologies-hub`, `doctors-index` | `/aesthetics/concerns`, `/aesthetics/technologies`, `/doctors` | `/التجميل-الطبي/المخاوف-الجمالية`, `/التجميل-الطبي/التقنيات`, `/الأطباء` | Legacy labelled the concerns index "Our Services" — corrected: it is the Concerns hub | N/A |
| aesthetics | / | 602–604 | "Contact Us" intro | "see us in person… ask about laser treatment, aesthetics microneedling, and radio frequency waves" | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Keyword-stuffed template sentence duplicated from the medical homepage | N/A |
| aesthetics | / | 606 | Address — 23-8 Weston Drive SW | Same address as the main clinic | MERGE_WITH_CANONICAL_ENTITY | Location | `location:main-clinic` | `/contact` | `/تواصل-معنا` | Identical to `siteConfig.clinic.address`; one location record | Approved |
| aesthetics | / | 608 | Citizen Studio note | "All Elite iQ™ treatments are exclusively performed at Citizen Studio, 45 Greenbriar Dr NW, Calgary, AB T3B 5N4" | PUBLISH | Location | `location:citizen-studio` | `/aesthetics/treatments/laser-hair-removal` | `/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر` | §8 — a distinct service-location fact. Must never be implied to happen at the main clinic | Approved |
| aesthetics | / | 610 | Phone (403) 247-1418, Fax (587) 443-0394 | Aesthetics contact numbers | MERGE_WITH_CANONICAL_ENTITY | Contact information | `contact:aesthetics-line` | n/a | n/a | Phone kept as a genuinely distinct number (CONF-001). Fax is identical to the medical fax — **no fax change made this phase** per client instruction | Pending client |
| aesthetics | / | 612–616 | Hours table — "Open today 09:00 a.m. – 05:00 p.m." | Aesthetics daily hours | MERGE_WITH_CANONICAL_ENTITY | Opening-hours schedule | `hours:aesthetics` | n/a | n/a | Kept as a second schedule, not merged into clinic hours (CONF-002) | Pending client |
| aesthetics | / | 614 | Static string "Open today" | Hardcoded open-state text | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | §5.16 | N/A |
| aesthetics | / | 617 | "Closed in all Stat. Holidays. Get directions." | Holiday notice + map | MERGE_WITH_CANONICAL_ENTITY | Opening-hours schedule | `hours:statutory-notice` | n/a | n/a | Same notice as the medical site, abbreviated differently | Approved |
| aesthetics | / | 619 | "Blue Diamond Aesthetics laser treatment, microneedling, RF Waves and Beyond" | Keyword-stuffed footer heading | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Pure keyword stuffing, no informational content | N/A |
| aesthetics | / | 621 | Footer "Copyright © 2024 … Terms and Conditions, Privacy Policy" | Footer + legal links | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Year conflicts with the medical site's 2026 (CONF-004); both legal targets are "Coming soon" placeholders | N/A |

## B2. Treatments index (lines 623–657)

The legacy index is the single largest source of taxonomy error: **9 of its 13
entries are concerns, not treatments**, and two of the links are broken. Each
entry is classified individually below.

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| aesthetics | /treatments | 623–627 | Meta title | "Treatments \| Blue Diamond Medical Aesthetics" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `aesthetics-treatments-hub` | `/aesthetics/treatments` | `/التجميل-الطبي/العلاجات` | Registry title governs | Approved |
| aesthetics | /treatments | 629–631 | Consultation-first intro | Every treatment starts with a 20-minute physician consultation; referral out where a specialist serves the patient better | PUBLISH | Aesthetic treatment | `aesthetics-treatments-hub` | `/aesthetics/treatments` | `/التجميل-الطبي/العلاجات` | Genuine, patient-protective process content; sets the consultation gate for every treatment page | Approved |
| aesthetics | /treatments | 633 | "Acne Scar Removal — /acne-scar-removal" | Listed as a treatment | RELATION_ONLY | **Aesthetic concern** | `concern-acne-scars` | `/aesthetics/concerns/acne-scars` | `/التجميل-الطبي/المخاوف-الجمالية/ندبات-حب-الشباب` | §4 — a patient concern, not a procedure. Reclassified | N/A |
| aesthetics | /treatments | 635 | "Rosacea Abatement — /rosacea-abatement" | Listed as a treatment | RELATION_ONLY | **Aesthetic concern** | `concern-rosacea-redness` | `/aesthetics/concerns/rosacea-redness` | `/التجميل-الطبي/المخاوف-الجمالية/الوردية-والاحمرار` | §4 — reclassified from treatment to concern | N/A |
| aesthetics | /treatments | 637 | "Dry Skin Remediation — /dry-skin-remediation" | Listed as a treatment | RELATION_ONLY | **Aesthetic concern** | `concern-dry-skin` | `/aesthetics/concerns/dry-skin` | `/التجميل-الطبي/المخاوف-الجمالية/جفاف-البشرة` | §4 — reclassified | N/A |
| aesthetics | /treatments | 639 | "Fine Line and Wrinkle Erasing — /fineline-and-wrinkle" | Listed as a treatment | RELATION_ONLY | **Aesthetic concern** | `concern-fine-lines-wrinkles` | `/aesthetics/concerns/fine-lines-wrinkles` | `/التجميل-الطبي/المخاوف-الجمالية/الخطوط-الدقيقة-والتجاعيد` | §4 — reclassified | N/A |
| aesthetics | /treatments | 641 | "Non-invasive Skin Tightening — /non-invasive-skin" | Listed as a treatment | RELATION_ONLY | **Aesthetic concern** | `concern-skin-laxity` | `/aesthetics/concerns/skin-laxity` | `/التجميل-الطبي/المخاوف-الجمالية/ترهل-البشرة` | §4 — the concern is skin laxity; the procedure delivering it is Radio Frequency | N/A |
| aesthetics | /treatments | 643 | "Spider Vein Removal — /spider-vein" | Listed as a treatment | RELATION_ONLY | **Aesthetic concern** | `concern-spider-veins` | `/aesthetics/concerns/spider-veins` | `/التجميل-الطبي/المخاوف-الجمالية/الأوردة-العنكبوتية` | §4 — reclassified | N/A |
| aesthetics | /treatments | 645 | "Sun Damage Treatment — /sun-damage" | Listed as a treatment | RELATION_ONLY | **Aesthetic concern** | `concern-sun-damage-pigmentation` | `/aesthetics/concerns/sun-damage-pigmentation` | `/التجميل-الطبي/المخاوف-الجمالية/تلف-الشمس-والتصبغ` | §4 — reclassified | N/A |
| aesthetics | /treatments | 647 | "Skin Revitalization — /skin-revitalization" | Listed as a treatment | RELATION_ONLY | **Aesthetic concern** | `concern-skin-revitalization` | `/aesthetics/concerns/skin-revitalization` | `/التجميل-الطبي/المخاوف-الجمالية/تجديد-البشرة` | §4 — reclassified | N/A |
| aesthetics | /treatments | 649 | "Razor Bumps (PFB) — /razor-bumps" | Listed as a treatment | RELATION_ONLY | **Aesthetic concern** | `concern-razor-bumps` | `/aesthetics/concerns/razor-bumps` | `/التجميل-الطبي/المخاوف-الجمالية/حبوب-الحلاقة` | §4 — reclassified | N/A |
| aesthetics | /treatments | 651 | "Ultra Treatment — links to /prp-therapy" | **Mislabelled link** — Ultra pointed at the PRP page | RELATION_ONLY | Aesthetic treatment | `treatment-ultra` | `/aesthetics/treatments/ultra` | `/التجميل-الطبي/العلاجات/الترا` | §5.1 / §5.12 — Ultra is a laser rejuvenation treatment and is **not** PRP. Corrected to the real Ultra entity; the broken legacy link is never made canonical | N/A |
| aesthetics | /treatments | 653 | "Laser Hair Removal — /laser-hair-removal" | Correctly listed | RELATION_ONLY | Aesthetic treatment | `treatment-laser-hair-removal` | `/aesthetics/treatments/laser-hair-removal` | `/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر` | Legacy classification correct; carried forward | N/A |
| aesthetics | /treatments | 655 | "PRP Therapy — /prp-therapy" | One entry covering two distinct procedures | RELATION_ONLY | Aesthetic treatment | `treatment-prp-hair-restoration`, `treatment-prp-skin-rejuvenation` | `/aesthetics/treatments/prp-hair-restoration`, `/aesthetics/treatments/prp-skin-rejuvenation` | `/التجميل-الطبي/العلاجات/استعادة-الشعر-بالبلازما`, `/التجميل-الطبي/العلاجات/تجديد-البشرة-بالبلازما` | Source page describes hair restoration and skin rejuvenation as separate procedures with separate indications; split into two entities | N/A |
| aesthetics | /treatments | 657 | "Vitalia — links to /treatments" | **Self-link** — the entry pointed back at its own index page | RELATION_ONLY | Women's wellness service | `treatment-tempsure-vitalia` | `/aesthetics/treatments/tempsure-vitalia` | `/التجميل-الطبي/العلاجات/تمبشور-فيتاليا` | §5.2 / §5.13 / §5.18 — a page linking only to itself. Vitalia now has a proper canonical treatment entity plus a technology entity | N/A |

## B3. Area Concern (lines 659–667)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| aesthetics | /area-concern | 659–663 | Meta title | "Area Concern" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `aesthetics-concerns-hub` | `/aesthetics/concerns` | `/التجميل-الطبي/المخاوف-الجمالية` | Registry title "Concerns" governs | Approved |
| aesthetics | /area-concern | 665–667 | "Hover over the images below for more details" | JavaScript image-hover module; **no authoritative body content** | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | §5.14 — broken/empty module. The page becomes redirect-only into the real Concerns hub; nothing is invented to fill it | N/A |

## B4. Laser Hair Removal (lines 669–731)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| aesthetics | /laser-hair-removal | 669–673 | Meta title | "Laser Hair Removal" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `treatment-laser-hair-removal` | `/aesthetics/treatments/laser-hair-removal` | `/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر` | Registry title governs | Approved |
| aesthetics | /laser-hair-removal | 675 | "Laser Hair Removal at Blue Diamond Medical Aesthetics ." | Malformed H1 with a stray space + period | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Typographic residue; canonical title comes from the registry | N/A |
| aesthetics | /laser-hair-removal | 677–679 | "Get to the Root of Unwanted Hair" | Shaving/waxing/plucking are time-consuming and temporary | PUBLISH | Aesthetic treatment | `treatment-laser-hair-removal` | `/aesthetics/treatments/laser-hair-removal` | `/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر` | Standard, non-promotional framing content | Approved |
| aesthetics | /laser-hair-removal | 679 | ASAPS "3rd most performed non-surgical cosmetic treatment in the US" | Third-party statistic, undated | NEEDS_CLIENT_APPROVAL | Aesthetic treatment | `treatment-laser-hair-removal` | `/aesthetics/treatments/laser-hair-removal` | `/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر` | Unsourced/undated external statistic about a different country; needs a citation or removal | Pending client |
| aesthetics | /laser-hair-removal | 681 | "safe, long-lasting… permanent hair reduction anywhere on the body" | Permanence + safety claim | NEEDS_CLIENT_APPROVAL | Aesthetic treatment | `treatment-laser-hair-removal` | `/aesthetics/treatments/laser-hair-removal` | `/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر` | §12 — permanent results without qualification | Pending client |
| aesthetics | /laser-hair-removal | 681 | "Elite+™ laser system" | Device name used on this page | MERGE_WITH_CANONICAL_ENTITY | Aesthetic technology | `technology-elite-iq` | `/aesthetics/technologies/elite-iq` | `/التجميل-الطبي/التقنيات/إيليت-آي-كيو` | Naming conflict with "Elite iQ™" used elsewhere in the same source — CONF-005; one device entity, not two | Pending client |
| aesthetics | /laser-hair-removal | 683 | Citizen Studio off-site note | Elite iQ™ treatments performed exclusively at Citizen Studio | RELATION_ONLY | Location | `treatment-laser-hair-removal` → `location:citizen-studio` | n/a | n/a | Structured service-location exception (§8) | N/A |
| aesthetics | /laser-hair-removal | 685–693 | "How It Works — How Your Hair Grows" | Anagen / Catagen / Telogen cycle; anagen responds best | PUBLISH | Aesthetic treatment | `treatment-laser-hair-removal` | `/aesthetics/treatments/laser-hair-removal` | `/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر` | Genuine patient education, all 3 phases carried | Approved |
| aesthetics | /laser-hair-removal | 695–697 | "How Laser Hair Removal Works" | Light absorbed by follicular melanin; multiple sessions needed | PUBLISH | Aesthetic treatment | `treatment-laser-hair-removal` | `/aesthetics/treatments/laser-hair-removal` | `/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر` | Mechanism explanation | Approved |
| aesthetics | /laser-hair-removal | 699–707 | "Technology We Use — Cynosure® Elite+™" | Fast (spot sizes to 24 mm), Effective (two wavelengths), Safe (long clinical use) | RELATION_ONLY | Aesthetic technology | `technology-elite-iq` | `/aesthetics/technologies/elite-iq` | `/التجميل-الطبي/التقنيات/إيليت-آي-كيو` | §4 — device detail lives on the technology entity; the treatment page links rather than duplicating it | Approved |
| aesthetics | /laser-hair-removal | 707 | "Safe: in clinical use for many years with proven safety record" | Safety claim | NEEDS_CLIENT_APPROVAL | Aesthetic technology | `technology-elite-iq` | `/aesthetics/technologies/elite-iq` | `/التجميل-الطبي/التقنيات/إيليت-آي-كيو` | §12 — "proven safety record" is an unsupported safety/superiority claim | Pending client |
| aesthetics | /laser-hair-removal | 709–711 | "What To Expect On The Day Of Treatment" | Shave beforehand; cold air and snapping sensation; hairs shed over weeks; regrowth thinner each session | PUBLISH | Aesthetic treatment | `treatment-laser-hair-removal` | `/aesthetics/treatments/laser-hair-removal` | `/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر` | Practical preparation content patients need | Approved |
| aesthetics | /laser-hair-removal | 713–715 | "How does Elite iQ™ work?" — Skintel™ "first Health Canada and FDA cleared melanin reader on the market" | Regulatory-first claim | NEEDS_CLIENT_APPROVAL | Aesthetic technology | `technology-elite-iq` | `/aesthetics/technologies/elite-iq` | `/التجميل-الطبي/التقنيات/إيليت-آي-كيو` | §12 — unsupported certification/first-to-market claim | Pending client |
| aesthetics | /laser-hair-removal | 717–719 | "Is this treatment right for me?" | All skin types; face, back, chest, arms, underarms, bikini, legs; discuss candidacy with a provider | PUBLISH | FAQ | `faq:laser-hair-removal` | `/aesthetics/treatments/laser-hair-removal` | `/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر` | Ends in a provider consultation, not a suitability guarantee | Approved |
| aesthetics | /laser-hair-removal | 721–723 | "When will I see results?" | Gradual reduction; multiple treatments; "individual results vary" | PUBLISH | FAQ | `faq:laser-hair-removal` | `/aesthetics/treatments/laser-hair-removal` | `/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر` | Already carries the individual-results qualifier | Approved |
| aesthetics | /laser-hair-removal | 725–727 | "How many treatments will I need?" | The answer describes session **duration** (<30 min), not session **count** | PUBLISH | FAQ | `faq:laser-hair-removal` | `/aesthetics/treatments/laser-hair-removal` | `/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر` | Question/answer mismatch in the source — republish under a duration-accurate question without inventing a treatment count | Approved |
| aesthetics | /laser-hair-removal | 729–731 | "Before & After Photos" | Interactive gallery module with no assets | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Empty module; no approved before/after photography exists and none may be fabricated | N/A |

## B5. Laser Treatment (lines 733–771)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| aesthetics | /laser-treatment-1 | 733–737 | Meta title | "Laser Treatment" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `treatment-laser-skin-treatments` | `/aesthetics/treatments/laser-skin-treatments` | `/التجميل-الطبي/العلاجات/علاجات-البشرة-بالليزر` | Registry title governs; §5.8 — the `-1` suffix never becomes canonical | Approved |
| aesthetics | /laser-treatment-1 | 739 | "Transform Your Skin with Blue Diamond Medical Aesthetics" | Generic slogan | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Contentless tagline | N/A |
| aesthetics | /laser-treatment-1 | 741–755 | "Laser Treatment" intro + 5 capabilities | Smoother complexions, younger healthier skin, brightening damaged skin, benign pigmented lesion removal, face and leg vein treatment; protocol tailored per skin tone | PUBLISH | Aesthetic treatment | `treatment-laser-skin-treatments` | `/aesthetics/treatments/laser-skin-treatments` | `/التجميل-الطبي/العلاجات/علاجات-البشرة-بالليزر` | The distinct laser-rejuvenation treatment, separate from hair removal | Approved |
| aesthetics | /laser-treatment-1 | 757–759 | "Laser Facial" | Sun-damaged skin, ruddy complexions, light telangiectasia, uneven pigmentation; avoid sun 1 week prior; 3–6 treatments | PUBLISH | Aesthetic treatment | `treatment-laser-skin-treatments` | `/aesthetics/treatments/laser-skin-treatments` | `/التجميل-الطبي/العلاجات/علاجات-البشرة-بالليزر` | Protocol detail; publish with the standard individual-results qualifier (GAP-011) | Approved |
| aesthetics | /laser-treatment-1 | 761–763 | "Benign Pigmented Lesions (Liver spots and Sun Spots)" | Visible uniformity in as little as 2 treatments; full course 4 treatments at 3–4 week intervals | PUBLISH | Aesthetic treatment | `treatment-laser-skin-treatments` | `/aesthetics/treatments/laser-skin-treatments` | `/التجميل-الطبي/العلاجات/علاجات-البشرة-بالليزر` | Stated as a typical protocol; publish with the individual-results qualifier (GAP-011) | Approved |
| aesthetics | /laser-treatment-1 | 765–767 | "Vascular Treatments (Spider veins)" | Spider veins in as little as 2 treatments, 4–8 weeks apart | PUBLISH | Aesthetic treatment | `treatment-laser-skin-treatments` | `/aesthetics/treatments/laser-skin-treatments` | `/التجميل-الطبي/العلاجات/علاجات-البشرة-بالليزر` | Also the treatment relation for the Spider Veins concern; qualifier per GAP-011 | Approved |
| aesthetics | /laser-treatment-1 | 769–771 | "Before & After Photos" | Empty gallery module | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | No approved assets | N/A |

## B6. Radio Frequency (lines 773–805)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| aesthetics | /radio-frequency | 773–777 | Meta title | "Radio Frequency \| Blue Diamond Medical Aesthetics" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `treatment-radio-frequency` | `/aesthetics/treatments/radio-frequency` | `/التجميل-الطبي/العلاجات/الترددات-الراديوية` | Registry title governs | Approved |
| aesthetics | /radio-frequency | 779–781 | "Radio Frequency" intro | TempSure RF for non-invasive tightening and smoothing; improved tone, reduced fine lines, sun-damage appearance, rejuvenated glow | PUBLISH | Aesthetic treatment | `treatment-radio-frequency` | `/aesthetics/treatments/radio-frequency` | `/التجميل-الطبي/العلاجات/الترددات-الراديوية` | The canonical home of "skin tightening" as a delivered procedure | Approved |
| aesthetics | /radio-frequency | 783–785 | "How Does It Work" | Handheld device, circular motion, controlled heating, collagen and elastin stimulation | PUBLISH | Aesthetic treatment | `treatment-radio-frequency` | `/aesthetics/treatments/radio-frequency` | `/التجميل-الطبي/العلاجات/الترددات-الراديوية` | Mechanism explanation | Approved |
| aesthetics | /radio-frequency | 787–789 | "Does it hurt?" — "Not at all — most patients report a therapeutic, massage-like effect" | Absolute pain-free promise | NEEDS_CLIENT_APPROVAL | FAQ | `faq:radio-frequency` | `/aesthetics/treatments/radio-frequency` | `/التجميل-الطبي/العلاجات/الترددات-الراديوية` | §12 — "Not at all" is an unqualified pain-free promise; the second clause is publishable on its own | Pending client |
| aesthetics | /radio-frequency | 791–793 | "What's involved in the treatment?" | Face/neck/décolletage roller 40–90 min; body pads ~20 min; peels/facials may be offered during treatment | PUBLISH | Aesthetic treatment | `treatment-radio-frequency` | `/aesthetics/treatments/radio-frequency` | `/التجميل-الطبي/العلاجات/الترددات-الراديوية` | Concrete session detail | Approved |
| aesthetics | /radio-frequency | 795–797 | "How long is the downtime?" | "Virtually no downtime"; medical-grade sunscreen recommended | PUBLISH | FAQ | `faq:radio-frequency` | `/aesthetics/treatments/radio-frequency` | `/التجميل-الطبي/العلاجات/الترددات-الراديوية` | Already qualified ("virtually"), unlike the technology page's absolute "zero downtime" | Approved |
| aesthetics | /radio-frequency | 799–801 | "How long before I see results?" | Not an instant fix; fresher within days; most noticeable at 6–8 weeks; 3–5 treatments 4–6 weeks apart; effects up to 2 years | PUBLISH | FAQ | `faq:radio-frequency` | `/aesthetics/treatments/radio-frequency` | `/التجميل-الطبي/العلاجات/الترددات-الراديوية` | Self-qualifying ("not an instant-fix"); durability claim carries the GAP-011 qualifier | Approved |
| aesthetics | /radio-frequency | 803–805 | "Before & After Photos" | Empty gallery module | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | No approved assets | N/A |

## B7. RF Micro-needling (lines 807–897)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| aesthetics | /rf-micro-needeling | 807–811 | Meta title | "RF Micro-needling" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `treatment-rf-microneedling` | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية` | §5.9 — the misspelled legacy slug `rf-micro-needeling` never becomes canonical | Approved |
| aesthetics | /rf-micro-needeling | 813 | "Discover Blue Diamond Aesthetics RF Micro-needling" | Generic slogan | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Contentless tagline | N/A |
| aesthetics | /rf-micro-needeling | 815–829 | "What is it?" + 6 outcome bullets | Potenza adds RF energy to mechanical microneedling; scarring, firmness, tone, dark spots, pore control, wrinkle reduction | PUBLISH | Aesthetic treatment | `treatment-rf-microneedling` | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية` | Core treatment content; "faster, more dramatic results" carries the GAP-011 qualifier | Approved |
| aesthetics | /rf-micro-needeling | 831 | Post-weight-loss paragraph — "Ozempic face and belly", "avoiding the need for surgery in some patients" | Brand-drug reference + surgical-alternative claim | NEEDS_CLIENT_APPROVAL | Aesthetic treatment | `treatment-rf-microneedling` | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية` | §12 — names a third-party prescription drug and claims a surgical alternative | Pending client |
| aesthetics | /rf-micro-needeling | 833–835 | "Why RF micro-needling vs. non-RF?" | Focused RF heating triggers collagen and elastin production | PUBLISH | Aesthetic treatment | `treatment-rf-microneedling` | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية` | Legitimate comparison of two modalities the clinic offers | Approved |
| aesthetics | /rf-micro-needeling | 837–839 | "How long does it take?" | ~30 minutes; topical anaesthetic up to 45 min to take effect | PUBLISH | Aesthetic treatment | `treatment-rf-microneedling` | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية` | Concrete session detail | Approved |
| aesthetics | /rf-micro-needeling | 839 | "optional pamper packages (facial/chemical peel, Flexure body firming…)" | Add-on package offer | NEEDS_CLIENT_APPROVAL | Aesthetic treatment | `treatment-rf-microneedling` | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية` | §11 — customized-package wording with no approved definition or price. **Updated 2026-08-24:** "Flexure" is confirmed as **TempSure FlexSure** (workbook row 38, $800, mapped to `treatment-radio-frequency`); the package contents themselves remain undefined and the offer stays withheld (CONF-025, GAP-015) | Pending client |
| aesthetics | /rf-micro-needeling | 841–843 | "Will it hurt?" | Numbing removes most discomfort; patients can halt treatment at any time | PUBLISH | FAQ | `faq:rf-microneedling` | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية` | Qualified ("most"), and patient-agency content | Approved |
| aesthetics | /rf-micro-needeling | 845–847 | "How long will it last?" — 3- and 5-session packages recommended | Package structure | NEEDS_CLIENT_APPROVAL | Aesthetic treatment | `treatment-rf-microneedling` | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية` | §11 — package structure exists with no approved price; must stay separate from individual-treatment pricing | Pending client |
| aesthetics | /rf-micro-needeling | 849–851 | "Downtime" | Avoid strenuous exercise and sun 48 h; celluloid mask post-treatment plus 2 to take home | PUBLISH | Aesthetic treatment | `treatment-rf-microneedling` | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية` | Real aftercare instruction | Approved |
| aesthetics | /rf-micro-needeling | 851 | "a post-treatment care kit can also be purchased" | Retail item absent from the approved catalogue | NEEDS_CLIENT_APPROVAL | Product | — | n/a | n/a | §10 — no such SKU, price, or contents exist in the approved product record; nothing may be invented | Pending client |
| aesthetics | /rf-micro-needeling | 853–863 | "Types of Micro-needling Treatment We Offer" | Scar removal, wrinkle reduction, rejuvenation, tightening (belly, double chin), topical infusion | PUBLISH | Aesthetic treatment | `treatment-rf-microneedling` | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية` | Treatment variants, each mapping to an existing concern | Approved |
| aesthetics | /rf-micro-needeling | 865 | Infusion serum list — Hyaluronic Acid, Botox (pore size), Poly-L-Lactic Acid, Poly-D-L-Lactic Acid, Tranexamic Acid | Injectable/infusion agents with indications | NEEDS_CLIENT_APPROVAL | Aesthetic treatment | `treatment-rf-microneedling` | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية` | Names prescription agents and an off-label Botox indication; requires physician sign-off before publication | Pending client |
| aesthetics | /rf-micro-needeling | 867–869 | "What Can I Expect Post Treatment" | Smoother complexion within days; redness, minor swelling, pinpoint bleeding normal, resolving within 3 days; bumps/micro-crusting managed at the clinic | PUBLISH | Aesthetic treatment | `treatment-rf-microneedling` | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية` | Honest expectation-setting including adverse effects | Approved |
| aesthetics | /rf-micro-needeling | 871–893 | "Safety Concerns" — 9 contraindications | Pregnancy, breastfeeding, active lesions, active acne, open wounds, active infections, pacemaker/implanted electrical device, gold thread rejuvenation, keloid propensity; full consultation and consent first | PUBLISH | Aesthetic treatment | `treatment-rf-microneedling` | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/الإبر-الدقيقة-بالترددات-الراديوية` | Highest-value safety content in the entire source; all 9 items publish verbatim | Approved |
| aesthetics | /rf-micro-needeling | 895–897 | "Before & After Photos" | Empty gallery module | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | No approved assets | N/A |

## B8. Ultra Treatment (lines 899–945)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| aesthetics | /ultra-treatment | 899–903 | Meta title | "Ultra Treatment" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `treatment-ultra` | `/aesthetics/treatments/ultra` | `/التجميل-الطبي/العلاجات/الترا` | Registry title governs | Approved |
| aesthetics | /ultra-treatment | 905 | "Discover Blue Diamond Aesthetics Ultra Treatment" | Generic slogan | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Contentless tagline | N/A |
| aesthetics | /ultra-treatment | 907–925 | "What is Ultra?" + 7 indications | Low-downtime laser for brighter tone and texture; age spots, freckles, sun spots, pigmented lesions, sun damage, melasma, post-inflammatory hyperpigmentation | PUBLISH | Aesthetic treatment | `treatment-ultra` | `/aesthetics/treatments/ultra` | `/التجميل-الطبي/العلاجات/الترا` | §5.12 — Ultra is a laser rejuvenation treatment and is **explicitly not** PRP. Distinct entity, distinct route | Approved |
| aesthetics | /ultra-treatment | 919 | "Actinic keratosis (pre-cancerous lesions)" | Pre-cancerous lesion indication | NEEDS_CLIENT_APPROVAL | Aesthetic treatment | `treatment-ultra` | `/aesthetics/treatments/ultra` | `/التجميل-الطبي/العلاجات/الترا` | A pre-cancerous condition cannot be presented as a cosmetic indication; needs physician sign-off and a medical-assessment pathway, not a booking button | Pending client |
| aesthetics | /ultra-treatment | 927–929 | "Is there any downtime?" | Mild redness; normal activities immediately; full healing 5–7 days | PUBLISH | FAQ | `faq:ultra` | `/aesthetics/treatments/ultra` | `/التجميل-الطبي/العلاجات/الترا` | Qualified and specific | Approved |
| aesthetics | /ultra-treatment | 931–933 | "How does it feel?" | Variable; most describe mild to moderate discomfort; topical numbing may be applied | PUBLISH | FAQ | `faq:ultra` | `/aesthetics/treatments/ultra` | `/التجميل-الطبي/العلاجات/الترا` | Honest — states discomfort rather than denying it | Approved |
| aesthetics | /ultra-treatment | 935–937 | "How long does the treatment take?" | 10–20 minutes; "Lunchtime Facial"; results may need several visits | PUBLISH | FAQ | `faq:ultra` | `/aesthetics/treatments/ultra` | `/التجميل-الطبي/العلاجات/الترا` | Self-qualifying | Approved |
| aesthetics | /ultra-treatment | 939–941 | "What to expect from Ultra" | Warm tingling; face/neck/chest; 5–6 days of dry sandpaper-like texture, which is normal | PUBLISH | Aesthetic treatment | `treatment-ultra` | `/aesthetics/treatments/ultra` | `/التجميل-الطبي/العلاجات/الترا` | Sets a realistic recovery expectation | Approved |
| aesthetics | /ultra-treatment | 943–945 | "Before and After" | Empty gallery module | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | No approved assets | N/A |

## B9. PRP Therapy (lines 947–1013)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| aesthetics | /prp-therapy | 947–951 | Meta title | "PRP Therapy \| Blue Diamond Medical Aesthetics" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `treatment-prp-hair-restoration`, `treatment-prp-skin-rejuvenation` | `/aesthetics/treatments/prp-*` | `/التجميل-الطبي/العلاجات/…` | One legacy page becomes two canonical treatments | Approved |
| aesthetics | /prp-therapy | 953 | "Restore your Hair with Blue Diamond Aesthetics" | Generic slogan | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Contentless tagline | N/A |
| aesthetics | /prp-therapy | 955–957 | "PRP Therapy for Natural Skin & Hair Renewal" | Blue Diamond now offers PRP for hair restoration and skin rejuvenation, performed by Dr. Farhat | MERGE_WITH_CANONICAL_ENTITY | Aesthetic treatment | both `treatment-prp-*` | `/aesthetics/treatments/prp-hair-restoration`, `/aesthetics/treatments/prp-skin-rejuvenation` | `/التجميل-الطبي/العلاجات/…` | Shared intro split across the two procedures rather than duplicated wholesale | Approved |
| aesthetics | /prp-therapy | 959–961 | "What Is PRP?" | Regenerative serum from the patient's own blood; plasma separated and concentrated; growth factors support repair, collagen synthesis, regeneration | PUBLISH | Aesthetic treatment | both `treatment-prp-*` | `/aesthetics/treatments/prp-*` | `/التجميل-الطبي/العلاجات/…` | Shared mechanism explainer, published once per entity as the definition section | Approved |
| aesthetics | /prp-therapy | 963–973 | "Hair Restoration" | Injected into the scalp to stimulate inactive follicles, improve circulation, promote denser growth; for thinning or early hair loss; quick sessions, little to no downtime | PUBLISH | Aesthetic treatment | `treatment-prp-hair-restoration` | `/aesthetics/treatments/prp-hair-restoration` | `/التجميل-الطبي/العلاجات/استعادة-الشعر-بالبلازما` | Distinct procedure with its own indication set | Approved |
| aesthetics | /prp-therapy | 975–987 | "Skin Rejuvenation" | Topical or micro-injection; fine lines, tone/texture/elasticity, acne scars and pigmentation, collagen; "vampire facial" | PUBLISH | Aesthetic treatment | `treatment-prp-skin-rejuvenation` | `/aesthetics/treatments/prp-skin-rejuvenation` | `/التجميل-الطبي/العلاجات/تجديد-البشرة-بالبلازما` | Distinct procedure; also the treatment relation for the Acne Scars and Sun Damage & Pigmentation concerns | Approved |
| aesthetics | /prp-therapy | 989–1001 | "Frequently Asked Questions about PRP" (6 Q&A) | What PRP is; hair restoration; skin rejuvenation; who performs it (Dr. Farhat); session length 30–60 min; 3–4 treatments a few weeks apart with maintenance | PUBLISH | FAQ | `faq:prp` | `/aesthetics/treatments/prp-hair-restoration`, `/aesthetics/treatments/prp-skin-rejuvenation` | `/التجميل-الطبي/العلاجات/…` | All 6 Q&A carried and split by procedure; the shared ones publish on both | Approved |
| aesthetics | /prp-therapy | 957, 999 | "Performed by Dr. Farhat" | Provider attribution | RELATION_ONLY | Doctor ↔ treatment | `doctor-farhat` ↔ both `treatment-prp-*` | n/a | n/a | Doctor-provides-service relation; the biography is not duplicated onto the treatment page | N/A |
| aesthetics | /prp-therapy | 1003–1011 | "Why Choose Blue Diamond Medical?" | "Safe, natural procedures"; "Personalized care from trained experts"; "Minimal discomfort and no lengthy recovery"; "Proven results that speak for themselves" | NEEDS_CLIENT_APPROVAL | Aesthetic treatment | both `treatment-prp-*` | `/aesthetics/treatments/prp-*` | `/التجميل-الطبي/العلاجات/…` | §12 — stacked safety, superiority, and proven-results claims in a single block | Pending client |
| aesthetics | /prp-therapy | 1013 | CTA "Call us now (tel: 403-247-1418)" | Phone booking CTA | RELATION_ONLY | Booking destination | `booking:phone-aesthetics` | n/a | n/a | Centralized booking config | N/A |

## B10. Our Technologies (lines 1015–1055)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| aesthetics | /our-technologies | 1015–1019 | Meta title | "Our Technologies" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `aesthetics-technologies-hub` | `/aesthetics/technologies` | `/التجميل-الطبي/التقنيات` | Registry title governs | Approved |
| aesthetics | /our-technologies | 1021 | "Helping patients discover their beautiful—together" | Manufacturer marketing tagline | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Cynosure's own strapline, not Blue Diamond's voice | N/A |
| aesthetics | /our-technologies | 1023–1035 | Technologies intro + 5-device list | Cynosure equipment: Elite IQ, Potenza, TempSure, Ultra, TempSure Vitalia | PUBLISH | Aesthetic technology | `aesthetics-technologies-hub` | `/aesthetics/technologies` | `/التجميل-الطبي/التقنيات` | Device roster; all 5 become technology entities | Approved |
| aesthetics | /our-technologies | 1037–1039 | "Elite IQ" description | The body copy describes a "holistic approach to skincare and beauty" and never describes the device | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | Wrong copy pasted under a device heading; the real Elite iQ description lives on the Laser Hair Removal page (lines 699–715) and is related there | N/A |
| aesthetics | /our-technologies | 1039 | "Blue Diamond Esthetics Medical Spa" | A fourth business-name variant | NEEDS_CLIENT_APPROVAL | Structured-data fact | `location:main-clinic` | n/a | n/a | CONF-006 — conflicts with "Blue Diamond Medical Clinic", "Blue Diamond Medical Aesthetics", and "Blue Diamond Medical"; the legal name drives schema.org and local search | Pending client |
| aesthetics | /our-technologies | 1041–1043 | "Potenza" | RF microneedling device for tightening and smoothing; fine lines, post-weight-loss, post-birth | PUBLISH | Aesthetic technology | `technology-potenza` | `/aesthetics/technologies/potenza` | `/التجميل-الطبي/التقنيات/بوتنزا` | §4 mapping: Potenza → RF Microneedling | Approved |
| aesthetics | /our-technologies | 1045–1047 | "TempSure" | Non-invasive tightening and firming all over the body | PUBLISH | Aesthetic technology | `technology-tempsure` | `/aesthetics/technologies/tempsure` | `/التجميل-الطبي/التقنيات/تمبشور` | §4 mapping: TempSure → Radio Frequency and non-invasive skin tightening | Approved |
| aesthetics | /our-technologies | 1047 | "with zero downtime" | Absolute downtime promise | NEEDS_CLIENT_APPROVAL | Aesthetic technology | `technology-tempsure` | `/aesthetics/technologies/tempsure` | `/التجميل-الطبي/التقنيات/تمبشور` | §12 — the treatment page says "virtually no downtime"; the absolute form must not be published | Pending client |
| aesthetics | /our-technologies | 1049–1051 | "Ultra" | Low-downtime laser for brighter tone and improved texture | PUBLISH | Aesthetic technology | `technology-ultra` | `/aesthetics/technologies/ultra` | `/التجميل-الطبي/التقنيات/الترا` | §4 mapping: Ultra → Ultra treatments and approved PRP combinations. Device entity explains the platform and links out; it does not duplicate the treatment page | Approved |
| aesthetics | /our-technologies | 1053–1055 | "TempSure Vitalia" | Addresses pelvic floor and sexual-health concerns for women at all ages | PUBLISH | Aesthetic technology | `technology-tempsure-vitalia` | `/aesthetics/technologies/tempsure-vitalia` | `/التجميل-الطبي/التقنيات/تمبشور-فيتاليا` | §4 mapping: TempSure Vitalia → women's wellness treatment. §5.13 resolved — Vitalia now has both a technology and a treatment entity | Approved |
| aesthetics | /our-technologies | 1055 | "1 in 3 women suffer from these issues" | Unsourced prevalence statistic | NEEDS_CLIENT_APPROVAL | Women's wellness service | `treatment-tempsure-vitalia` | `/aesthetics/treatments/tempsure-vitalia` | `/التجميل-الطبي/العلاجات/تمبشور-فيتاليا` | §12 — no citation supplied for a clinical prevalence claim | Pending client |
| aesthetics | /our-technologies | 1055 | "book an appointment (bluediamondmedical.janeapp.com)" | Jane App booking link | RELATION_ONLY | Booking destination | `booking:aesthetics-consultation` | n/a | n/a | Fourth external booking system; already in the approved allowlist | N/A |

## B11. Our Team — aesthetics (lines 1057–1071)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| aesthetics | /our-team | 1057–1061 | Meta title | "our team \| Blue Diamond Medical Aesthetics" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `doctors-index` | `/doctors` | `/الأطباء` | Registry title governs; lowercase legacy title not reused | Approved |
| aesthetics | /our-team | 1063 | "Our Team" | Section nav label | EXCLUDE_LEGACY_BOILERPLATE | — | — | n/a | n/a | §5.18 — duplicate navigation label | N/A |
| aesthetics | /our-team | 1065–1067 | Dr. Farhat biography (second copy) | Near-identical to lines 208–210; differs only in "knowledge" vs "experience" and "his patient" vs "his patients" | MERGE_WITH_CANONICAL_ENTITY | Doctor | `doctor-farhat` | `/doctors/mohamed-farhat` | `/الأطباء/محمد-فرحات` | §5.11 / §7 — **duplicate deleted, not republished.** One authoritative biography; the medical-site copy is the base. Both copies contain the garbled phrase "a physician with a family", corrected to "a family physician" without changing meaning | Approved |
| aesthetics | /our-team | 1069–1071 | Dr. Hamdi biography (second copy) | Identical to lines 220–222 except "as part of the family" vs "part of the family" | MERGE_WITH_CANONICAL_ENTITY | Doctor | `doctor-hamdi` | `/doctors/reem-hamdi` | `/الأطباء/ريم-حمدي` | §5.11 / §7 — duplicate deleted, not republished | Approved |
| aesthetics | /our-team | 1057–1071 | Aesthetics team roster (implied) | Only Farhat and Hamdi appear on the aesthetics site, vs six on the medical site | RELATION_ONLY | Doctor ↔ aesthetic service | `doctor-farhat` (aesthetics: yes), `doctor-hamdi` | n/a | n/a | Becomes a `practicesAesthetics` relation on the single doctor entity rather than a second team page. Whether Dr. Hamdi still practises aesthetics needs confirmation (GAP-006) | Pending client |

## B12–B20. Concern pages (lines 1073–1179)

Every one of these nine legacy pages was filed under "Treatments" on the legacy
site. All nine are reclassified as **concerns**, and five of them carried a
broken or wrong outbound link that is corrected here.

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| aesthetics | /acne-scar-removal | 1073–1077 | Meta title | "Acne scar Removal \| Blue Diamond Medical Aesthetics" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `concern-acne-scars` | `/aesthetics/concerns/acne-scars` | `/التجميل-الطبي/المخاوف-الجمالية/ندبات-حب-الشباب` | Registry title governs | Approved |
| aesthetics | /acne-scar-removal | 1079–1081 | "Acne Treatment Removal" | Prolonged outbreaks and scarring; comprehensive care including consultation, prescriptions where necessary, RF microneedling and laser, under physician supervision | MERGE_WITH_CANONICAL_ENTITY | Aesthetic concern | `concern-acne-scars` | `/aesthetics/concerns/acne-scars` | `/التجميل-الطبي/المخاوف-الجمالية/ندبات-حب-الشباب` | §4 — reclassified from treatment to concern; acknowledges mental-health impact without over-claiming | Approved |
| aesthetics | /acne-scar-removal | 1083 | Link → /rf-micro-needeling | Outbound treatment link (misspelled legacy slug) | RELATION_ONLY | Concern ↔ treatment | `concern-acne-scars` → `treatment-rf-microneedling`, `treatment-prp-skin-rejuvenation` | `/aesthetics/treatments/rf-microneedling` | `/التجميل-الطبي/العلاجات/…` | §5.9 — corrected slug; PRP skin rejuvenation added as a second valid treatment (its own page names acne scars) | N/A |
| aesthetics | /rosacea-abatement | 1085–1089 | Meta title | "Rosacea Abatement \| Blue Diamond Medical Aesthetics" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `concern-rosacea-redness` | `/aesthetics/concerns/rosacea-redness` | `/التجميل-الطبي/المخاوف-الجمالية/الوردية-والاحمرار` | Registry title governs | Approved |
| aesthetics | /rosacea-abatement | 1091–1093 | "Rosacea" | Flush escalating to distressing redness; holistic approach starting with a full physician consultation; laser works best; packages offered | MERGE_WITH_CANONICAL_ENTITY | Aesthetic concern | `concern-rosacea-redness` | `/aesthetics/concerns/rosacea-redness` | `/التجميل-الطبي/المخاوف-الجمالية/الوردية-والاحمرار` | §4 — reclassified. "Packages offered" carries no approved price and stays out of any price table (§11) | Approved |
| aesthetics | /rosacea-abatement | 1095 | Link → /laser-hair-removal | **Wrong target** — rosacea pointed at hair removal | RELATION_ONLY | Concern ↔ treatment | `concern-rosacea-redness` → `treatment-laser-skin-treatments` | `/aesthetics/treatments/laser-skin-treatments` | `/التجميل-الطبي/العلاجات/علاجات-البشرة-بالليزر` | §5.3 — corrected to Laser Skin Treatments, whose "red or ruddy complexions" indication is the actual match | N/A |
| aesthetics | /dry-skin-remediation | 1097–1101 | Meta title | "Dry Skin Remediation" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `concern-dry-skin` | `/aesthetics/concerns/dry-skin` | `/التجميل-الطبي/المخاوف-الجمالية/جفاف-البشرة` | Registry title governs | Approved |
| aesthetics | /dry-skin-remediation | 1103–1105 | "Dry Skin Remediation" | Calgary/Rockies dryness; infusion RF microneedling delivers moisturizers and pigment regulators | MERGE_WITH_CANONICAL_ENTITY | Aesthetic concern | `concern-dry-skin` | `/aesthetics/concerns/dry-skin` | `/التجميل-الطبي/المخاوف-الجمالية/جفاف-البشرة` | §4 — reclassified. "nourished and glowing for months" carries the GAP-011 qualifier | Approved |
| aesthetics | /dry-skin-remediation | 1107 | Link → /rf-micro-needeling | Outbound treatment link (misspelled legacy slug) | RELATION_ONLY | Concern ↔ treatment / product | `concern-dry-skin` → `treatment-rf-microneedling`, `shop-concern-dry-skin` | `/aesthetics/treatments/rf-microneedling`, `/shop/concern/dry-skin` | `/التجميل-الطبي/العلاجات/…`, `/المتجر/مخاوف/جفاف-البشرة` | §5.9 corrected; product-concern relation added (§3 "Product relates to skin concern") | N/A |
| aesthetics | /fineline-and-wrinkle | 1109–1113 | Meta title | "Fineline and wrinkle \| Blue Diamond Medical Aesthetics" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `concern-fine-lines-wrinkles` | `/aesthetics/concerns/fine-lines-wrinkles` | `/التجميل-الطبي/المخاوف-الجمالية/الخطوط-الدقيقة-والتجاعيد` | Registry title governs | Approved |
| aesthetics | /fineline-and-wrinkle | 1115–1117 | "Fine line and wrinkle erasing, relaxing and tightening" | State-of-the-art technologies smooth and erase fine lines plus body tightening; suitable for all skin types; bespoke treatments | MERGE_WITH_CANONICAL_ENTITY | Aesthetic concern | `concern-fine-lines-wrinkles` | `/aesthetics/concerns/fine-lines-wrinkles` | `/التجميل-الطبي/المخاوف-الجمالية/الخطوط-الدقيقة-والتجاعيد` | §4 / §6 — "relaxing" is the cosmetic Botox pathway and is related, not merged into the medical Botox entity | Approved |
| aesthetics | /fineline-and-wrinkle | 1119 | Links → /rf-micro-needeling, /radio-frequency | Two outbound treatment links | RELATION_ONLY | Concern ↔ treatment | `concern-fine-lines-wrinkles` → `treatment-rf-microneedling`, `treatment-radio-frequency`, `treatment-cosmetic-botox` | `/aesthetics/treatments/…` | `/التجميل-الطبي/العلاجات/…` | Slug corrected; cosmetic Botox added as the third valid pathway | N/A |
| aesthetics | /non-invasive-skin | 1121–1125 | Meta title | "non invasive skin \| Blue Diamond Medical Aesthetics" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `concern-skin-laxity` | `/aesthetics/concerns/skin-laxity` | `/التجميل-الطبي/المخاوف-الجمالية/ترهل-البشرة` | Registry title "Skin Laxity" names the concern rather than the modality | Approved |
| aesthetics | /non-invasive-skin | 1127–1129 | "Non-invasive skin tightening all over the body" | RF waves promote collagen and elastin; pain-free pad delivery; ~15 minutes; visible results, no downtime | MERGE_WITH_CANONICAL_ENTITY | Aesthetic concern | `concern-skin-laxity` | `/aesthetics/concerns/skin-laxity` | `/التجميل-الطبي/المخاوف-الجمالية/ترهل-البشرة` | §4 — the concern is skin laxity; Radio Frequency is the procedure. "Pain-free pad" is a device descriptor, not a treatment promise | Approved |
| aesthetics | /non-invasive-skin | 1131 | Link → /radio-frequency | Outbound treatment link (correct on the legacy site) | RELATION_ONLY | Concern ↔ treatment | `concern-skin-laxity` → `treatment-radio-frequency`, `treatment-rf-microneedling` | `/aesthetics/treatments/radio-frequency` | `/التجميل-الطبي/العلاجات/الترددات-الراديوية` | Carried forward; RF microneedling added (its own page claims post-weight-loss tightening) | N/A |
| aesthetics | /spider-vein | 1133–1137 | Meta title | "spider vein \| Blue Diamond Medical Aesthetics" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `concern-spider-veins` | `/aesthetics/concerns/spider-veins` | `/التجميل-الطبي/المخاوف-الجمالية/الأوردة-العنكبوتية` | Registry title governs | Approved |
| aesthetics | /spider-vein | 1139–1141 | "Spider vein (leg and face) removal" | Damaged vessels appearing red, blue or purple; generally harmless but unsightly; laser can remove them | MERGE_WITH_CANONICAL_ENTITY | Aesthetic concern | `concern-spider-veins` | `/aesthetics/concerns/spider-veins` | `/التجميل-الطبي/المخاوف-الجمالية/الأوردة-العنكبوتية` | §4 — reclassified | Approved |
| aesthetics | /spider-vein | 1141 | "quickly and painlessly" | Pain-free promise | NEEDS_CLIENT_APPROVAL | Aesthetic concern | `concern-spider-veins` | `/aesthetics/concerns/spider-veins` | `/التجميل-الطبي/المخاوف-الجمالية/الأوردة-العنكبوتية` | §12 — unqualified pain-free claim | Pending client |
| aesthetics | /spider-vein | 1143 | Link → /laser-hair-removal | **Wrong target** | RELATION_ONLY | Concern ↔ treatment | `concern-spider-veins` → `treatment-laser-skin-treatments` | `/aesthetics/treatments/laser-skin-treatments` | `/التجميل-الطبي/العلاجات/علاجات-البشرة-بالليزر` | §5.4 — corrected; the Laser Treatment page's "Vascular Treatments (Spider veins)" section is the real match | N/A |
| aesthetics | /sun-damage | 1145–1149 | Meta title | "sun damage \| Blue Diamond Medical Aesthetics" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `concern-sun-damage-pigmentation` | `/aesthetics/concerns/sun-damage-pigmentation` | `/التجميل-الطبي/المخاوف-الجمالية/تلف-الشمس-والتصبغ` | Registry title governs | Approved |
| aesthetics | /sun-damage | 1151–1153 | "Sun damage treatment" | Brown spots, sun spots and liver spots removable with the clinic's technologies | MERGE_WITH_CANONICAL_ENTITY | Aesthetic concern | `concern-sun-damage-pigmentation` | `/aesthetics/concerns/sun-damage-pigmentation` | `/التجميل-الطبي/المخاوف-الجمالية/تلف-الشمس-والتصبغ` | §4 — reclassified. "easily removed" carries the GAP-011 qualifier | Approved |
| aesthetics | /sun-damage | 1155 | Link → /laser-hair-removal | **Wrong target** | RELATION_ONLY | Concern ↔ treatment / product | `concern-sun-damage-pigmentation` → `treatment-laser-skin-treatments`, `treatment-ultra`, `shop-concern-pigmentation` | `/aesthetics/treatments/laser-skin-treatments`, `/aesthetics/treatments/ultra`, `/shop/concern/pigmentation` | `/التجميل-الطبي/العلاجات/…`, `/المتجر/مخاوف/التصبغ` | §5.5 — corrected; Ultra explicitly treats sun spots and pigmented lesions; product-concern relation added | N/A |
| aesthetics | /skin-revitalization | 1157–1161 | Meta title | "Skin revitalization \| Blue Diamond Medical Aesthetics" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `concern-skin-revitalization` | `/aesthetics/concerns/skin-revitalization` | `/التجميل-الطبي/المخاوف-الجمالية/تجديد-البشرة` | Registry title governs | Approved |
| aesthetics | /skin-revitalization | 1163–1165 | "Skin Revitalization" | Weather and daily stress dull the skin; refresh in under 45 minutes, natural glow, fine line and wrinkle reduction | MERGE_WITH_CANONICAL_ENTITY | Aesthetic concern | `concern-skin-revitalization` | `/aesthetics/concerns/skin-revitalization` | `/التجميل-الطبي/المخاوف-الجمالية/تجديد-البشرة` | §4 — reclassified | Approved |
| aesthetics | /skin-revitalization | 1167 | Links → /laser-hair-removal and /rf-micro-needling | **Both wrong**: one points at hair removal, the other at a correctly-spelled slug that does not exist on the legacy site | RELATION_ONLY | Concern ↔ treatment | `concern-skin-revitalization` → `treatment-laser-skin-treatments`, `treatment-rf-microneedling`, `treatment-ultra` | `/aesthetics/treatments/…` | `/التجميل-الطبي/العلاجات/…` | §5.7 / §5.9 — both corrected; neither broken link becomes canonical | N/A |
| aesthetics | /razor-bumps | 1169–1173 | Meta title | "razor bumps \| Blue Diamond Medical Aesthetics" | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `concern-razor-bumps` | `/aesthetics/concerns/razor-bumps` | `/التجميل-الطبي/المخاوف-الجمالية/حبوب-الحلاقة` | Registry title governs | Approved |
| aesthetics | /razor-bumps | 1175–1177 | "Razor Bumps" | Uncomfortable, can become infected, compounded by ingrown hairs; minimally invasive treatment of bumps and cause | MERGE_WITH_CANONICAL_ENTITY | Aesthetic concern | `concern-razor-bumps` | `/aesthetics/concerns/razor-bumps` | `/التجميل-الطبي/المخاوف-الجمالية/حبوب-الحلاقة` | §4 — reclassified (legacy index called it "Razor Bumps (PFB)") | Approved |
| aesthetics | /razor-bumps | 1177 | "Our world-leading technologies" | Superiority claim | NEEDS_CLIENT_APPROVAL | Aesthetic concern | `concern-razor-bumps` | `/aesthetics/concerns/razor-bumps` | `/التجميل-الطبي/المخاوف-الجمالية/حبوب-الحلاقة` | §12 — "world-leading" is an unsupported superiority claim | Pending client |
| aesthetics | /razor-bumps | 1179 | Link → /laser-hair-removal | Outbound treatment link | RELATION_ONLY | Concern ↔ treatment | `concern-razor-bumps` → `treatment-laser-hair-removal` | `/aesthetics/treatments/laser-hair-removal` | `/التجميل-الطبي/العلاجات/إزالة-الشعر-بالليزر` | §5.6 — this is the one page where the laser-hair-removal target is genuinely correct (PFB is caused by shaving); retained deliberately, not by default | N/A |

## B21–B22. Legal pages (lines 1181–1199)

| Source site | Source page | Line range | Source heading | Summary | Classification | Entity family | Canonical entity | Canonical EN route | Canonical AR route | Reason | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| aesthetics | /terms-and-conditions | 1181–1185 | Meta title | "Blue Diamond Medical" — generic | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `legal-terms` | `/terms` | `/الشروط-والأحكام` | Registry title governs; the legacy title is a placeholder | Approved |
| aesthetics | /terms-and-conditions | 1187–1189 | "Terms and Conditions" — "Coming soon!" | Placeholder with no legal copy | EXCLUDE_LEGACY_BOILERPLATE | Legal content | `legal-terms` | `/terms` | `/الشروط-والأحكام` | §5.15 — a "Coming soon" placeholder is never published. The route and template exist but stay gated and unreachable until real approved copy arrives (GAP-001) | Pending client |
| aesthetics | /privacy-policy | 1191–1195 | Meta title | "Blue Diamond Medical" — generic | SUPERSEDED_BY_NEWER_SOURCE | SEO metadata | `legal-privacy-policy` | `/privacy-policy` | `/سياسة-الخصوصية` | Registry title governs | Approved |
| aesthetics | /privacy-policy | 1197–1199 | "Privacy Policy" — "Privacy Policy coming soon" | Placeholder with no legal copy | EXCLUDE_LEGACY_BOILERPLATE | Legal content | `legal-privacy-policy` | `/privacy-policy` | `/سياسة-الخصوصية` | §5.15 — not published. A clinic handling health information needs a real privacy policy before launch (GAP-002) | Pending client |

---

# Completeness gate

Coverage was verified mechanically: every matrix row's line range was parsed and
checked against the source file.

| Check | Result |
|---|---|
| All 1,199 source lines considered | **Yes** — 641 non-blank lines, 0 uncovered |
| All 34 page sections classified | **Yes** — 34/34, 0 missing |
| All 148 sub-headings accounted for | **Yes** — 148/148, 0 missing |
| All 14 tables classified | **Yes** — 14/14, 0 missing |
| Every SkinMedica product row accounted for | **Yes** — 23/23, each with its own row; price and size verified against the approved record with zero mismatches |
| Every uninsured-service fee row accounted for | **Yes** — 22/22 (7 forms + 6 treatments + 9 administrative) plus 6 no-show rows = 28 fee rows |
| Every doctor biography accounted for | **Yes** — 8 biography blocks → 6 canonical doctors (2 cross-site duplicates merged) |
| Every booking URL accounted for | **Yes** — 5 distinct external destinations + 2 telephone channels; see `SOURCE_CONFLICT_REGISTER.md` CONF-010 |
| Every legacy page has a canonical destination, redirect-only status, or exclusion reason | **Yes** — 34/34, see `LEGACY_CONTENT_REDIRECT_MAP.md` |
| Every wrong legacy relationship corrected | **Yes** — all 18 items in §5 resolved, see the corrections list below |
| No concern classified as a treatment | **Yes** — 9 legacy "treatments" reclassified as concerns |
| No technology classified as a concern | **Yes** — 5 technologies are their own entity family |
| No doctor duplicated | **Yes** — 6 canonical doctor entities, 2 duplicate biographies merged and deleted |
| No unsupported claim silently published | **Yes** — 28 blocks held at `NEEDS_CLIENT_APPROVAL` |
| No legal placeholder published | **Yes** — both "Coming soon" pages excluded; routes gated and unreachable |
| No content silently dropped | **Yes** — every excluded block carries a written exclusion reason |

## Final counters

```text
TOTAL SOURCE PAGE SECTIONS:            34
TOTAL SOURCE SUBHEADINGS:              148
TOTAL SOURCE TABLES:                   14
TOTAL MEANINGFUL CONTENT BLOCKS:       292
PUBLISH:                               84
MERGE_WITH_CANONICAL_ENTITY:           55
RELATION_ONLY:                         56
EXCLUDE_LEGACY_BOILERPLATE:            35
NEEDS_CLIENT_APPROVAL:                 28
SUPERSEDED_BY_NEWER_SOURCE:            34
UNCLASSIFIED:                          0
SILENTLY_DROPPED:                      0
DUPLICATE_CANONICAL_ENTITIES:          0
WRONG_ENTITY_FAMILY_RELATIONSHIPS:     0
UNRESOLVED_ROUTE_COLLISIONS:           0
```

84 + 55 + 56 + 35 + 28 + 34 = 292 ✓

## §5 legacy errors — resolution record

| # | Legacy error | Resolution |
|---|---|---|
| 1 | "Ultra Treatment" linking to `/prp-therapy` | Ultra is its own treatment entity at `/aesthetics/treatments/ultra`; the broken link is redirect-only |
| 2 | "Vitalia" linking back to `/treatments` | Vitalia now has a treatment entity **and** a technology entity; the self-link is gone |
| 3 | Rosacea → Laser Hair Removal | Retargeted to Laser Skin Treatments |
| 4 | Spider Veins → Laser Hair Removal | Retargeted to Laser Skin Treatments (Vascular Treatments section) |
| 5 | Sun Damage → Laser Hair Removal | Retargeted to Laser Skin Treatments + Ultra |
| 6 | Razor Bumps → wrong laser route | Reviewed and **deliberately retained** — laser hair removal is the correct treatment for PFB |
| 7 | Skin Revitalization → wrong laser route | Retargeted to Laser Skin Treatments + RF Microneedling + Ultra |
| 8 | `/laser-treatment` vs `/laser-treatment-1` | Canonical is `/aesthetics/treatments/laser-skin-treatments`; both legacy paths become 301 sources, neither is canonical |
| 9 | `/rf-micro-needling` vs `/rf-micro-needeling` | Canonical is `/aesthetics/treatments/rf-microneedling`; both legacy spellings become 301 sources |
| 10 | Medical Botox mixed with Cosmetic Botox | Split into a medical entity subtree and an aesthetic treatment entity; `/botox` remains an educational routing hub |
| 11 | Doctor biographies duplicated across two sites | 6 canonical doctor entities; the 2 aesthetics duplicates are merged and deleted |
| 12 | Ultra described/routed as PRP | Separate entities, separate routes, separate technology mappings |
| 13 | Vitalia without a canonical entity | `treatment-tempsure-vitalia` (women's wellness) + `technology-tempsure-vitalia` |
| 14 | Area Concern — JS hover module only | Excluded; the page is redirect-only into the Concerns hub |
| 15 | Legal pages "Coming soon" | Excluded; canonical routes exist but stay gated and unreachable |
| 16 | Static "Open today" text | Excluded in all three occurrences; open state computes from the schedule |
| 17 | "Fitness Motivation on Instagram" residue | Excluded |
| 18 | Navigation label creating a self-linking page | Both instances excluded ("Vitalia" self-link, aesthetics "Our Team" duplicate label) |

---

# Addendum — approved aesthetic pricing, 2026-08-24

The approved cosmetic-treatment pricing workbook and its client approval email
were delivered after this matrix was written. They do **not** change any
classification above: the Word extraction still contains zero aesthetic prices,
and every block classified here keeps its original status.

What changed:

- **Precedence 2 is now populated.** `BLUE_DIAMOND_AESTHETIC_PRICING_APPROVED_2026-08-23.xlsx`
  (SHA-256 `d543c7b9…d7d12fd9`) supersedes the Word source for all aesthetic
  pricing. Full reconciliation: `docs/APPROVED_AESTHETIC_PRICING_MATRIX.md`.
- **GAP-003 is resolved.** The statement that the workbook was never delivered is
  withdrawn from every report.
- **81 price rows** were extracted and, after the 2026-08-24 client classification
  decisions, **all 81 are mapped**: 77 to single canonical treatment entities, 1
  as a combined treatment protocol (row 28 — "Ultra Skin Solutions", Ultra +
  Potenza, $1,300), and 3 as Aesthetic Treatment Add-Ons (rows 83–85, per-unit
  ampoules). Zero unmapped, zero dropped.
- **One client-email override**: workbook row 78 (PRP Microneedling, Neck) had an
  empty price cell; the 2026-08-23 email sets it to **$850 CAD**.
- **Zero package-price rows** exist in the workbook and **none was created**. The
  client-approved customized-package statement is stored as `PRICING-NOTE-001`, a
  general pricing note carrying no amount — not a product or treatment price. The
  combined protocol at row 28 is explicitly `packagePrice: false`.
- **No new public canonical route** was created for any of the 81 price rows. The
  combined protocol renders as a row in a "Combination Treatments" section on the
  existing `/aesthetics/pricing` route.
- **The clinical-review blocker is preserved.** All three ampoule add-ons carry
  `clinicalPublicationStatus: "pending-clinician-review"` and
  `publicDisplay: false`. Commercial price approval from the workbook does not
  substitute for clinician review, and no clinical indication, benefit,
  suitability, or usage claim is published for any ampoule. The
  `NEEDS_CLIENT_APPROVAL` row for the topical-infusion serum list (line 865,
  GAP-014) is unchanged.
- **Taxonomy held.** No concern was priced as a treatment; rosacea, pigmentation,
  spider veins, and sun damage remain concerns related to the priced laser
  treatments. Ultra was not reclassified as PRP despite the `Ultra + PRP` rows.
  PRP Microneedling and PRP Injections stay separate variants.
- **The 292 content blocks, the 34 legacy pages, and all counters in this matrix
  are unchanged.** Pricing rows are tracked in their own matrix and are not
  counted as source content blocks.
