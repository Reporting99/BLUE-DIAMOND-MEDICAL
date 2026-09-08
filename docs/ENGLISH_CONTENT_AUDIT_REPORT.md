# Blue Diamond Medical English Content Audit

Audit date: 2026-09-08

Market: Calgary, Alberta, Canada

Repository base: `0fdcc187b755813a700c0b1534be821afbf0333f`

Status: repository corrections prepared and tested; CMS publication and production verification blocked by missing `content.publish` permission.

## 1. Overall verdict

| Area | Verdict | Notes |
|---|---|---|
| Native Canadian English | PASS_WITH_NOTES | Reviewed corrections are prepared; the published CMS still contains known older wording. |
| Calgary localization | PASS_WITH_NOTES | West Springs, Calgary and Alberta terminology were made natural and claims about Calgary's climate were qualified. |
| Medical terminology | PASS_WITH_NOTES | Material terminology corrections are complete; unresolved device and indication questions remain flagged. |
| Medical content safety | PASS_WITH_NOTES | Absolute and unsupported claims were removed or qualified. RF microneedling risks require clinician approval. |
| Aesthetics source fidelity | PASS_WITH_NOTES | Mechanisms, devices, durations, recovery and contraindications were preserved where verified. See the matrix below. |
| SEO English | PASS_WITH_NOTES | Physician descriptions no longer end mid-word; changed pages still require post-deployment crawl verification. |
| GEO English | PASS_WITH_NOTES | Entities and Calgary relationships are clearer without keyword repetition. |
| AEO English | PASS_WITH_NOTES | Treatment and product answers are more direct; outstanding clinical questions are not answered by inference. |
| CMS content sync | BLOCKED | The configured `bd-media-import` user has write access but lacks `content.publish`. |
| Production verified | BLOCKED | No deployment is appropriate until CMS-backed changes can be published in the same release. |

No 10/10 claim is made while CMS publication, clinical review items and live HTML verification remain open.

## 2. Coverage

| Measure | Result |
|---|---:|
| Candidate paths crawled | 153 |
| Canonical English public routes returning 200 | 129 |
| Routes reviewed by rendered-string inventory | 129 |
| Rendered English string occurrences captured | 15,283 |
| Distinct rendered English strings captured | 2,004 |
| Repository string fields changed from production base | 180 |
| CMS records reviewed | 69 |
| CMS body entities reviewed | 58 (52 content entries, 6 physician profiles) |
| Exact CMS field proposals prepared | 57 across 32 records (56 admin-mapped, 1 manual mapping) |
| Meta titles and descriptions captured | 129 each |
| Doctor biographies reviewed | 6 |
| Medical service pages reviewed | 7 |
| Aesthetic treatment pages reviewed | 8 |
| Concern pages reviewed | 11 |
| Technology pages reviewed | 5 |
| Product pages reviewed | 54 |

The complete route inventory is in `content/english-audit/route-inventory.csv`. Counts above distinguish machine capture from completed human review and do not call unpublished changes complete.

## 3. Canadian English corrections

Grammar, punctuation and non-native phrasing were corrected in headings, descriptions, FAQs, forms, buttons, empty states, products, services and treatment content. The house style standardizes `patient-centred`, `practising`, `anaesthetic`, `radiofrequency`, `microneedling`, `platelet-rich plasma`, `post-inflammatory`, Canadian phone formatting and en dashes for ranges.

British-sounding legacy phrases and internal editorial language such as “this record,” “approved catalogue,” and “research for this record” were removed from patient-facing copy. American `board certified` terminology was changed to the CFPC's Canadian terminology, “certified by the College,” while preserving the supplied CCFP/FCFP facts. Generic marketing claims such as “best,” guaranteed duration, universal suitability and instant effects were removed or qualified.

## 4. Calgary localization

Calgary references were reviewed across all captured pages. Natural local context was strengthened on the home, medical, eye-screening, physician and treatment metadata. West Springs and Calgary, Alberta remain consistent. `AHS-covered` was corrected because Alberta Health Care Insurance Plan eligibility concerns insured physician services; Alberta Health Services is the delivery organization. The dry-skin page now says Calgary's dry climate “can contribute” to symptoms rather than claiming unmatched dryness in Canada. No neighbourhood or doorway pages were created.

## 5. Medical terminology

Substantive corrections include:

- `PRP serum` → platelet-rich plasma prepared from the patient's blood.
- Catagen described as the transition phase; the follicle and hair shaft mechanism was retained.
- `Bruxism (TMJ)` → bruxism and jaw pain, avoiding use of an anatomical joint as a diagnosis.
- `Radio Frequency` → radiofrequency in prose while retaining registered product and route names.
- `postinflammatory` → post-inflammatory.
- CFPC `board certified` → certified by the College.
- Eye screening access changed from a universal coverage statement to referral and eligibility language.

Ambiguous or clinician-dependent terminology remains in the source-conflict register. It includes the post-treatment “celluloid” mask, RF topical infusion substances, Ultra for actinic keratosis, and broad TempSure Vitalia pelvic-floor or sexual-health indications.

## 6. Medical claims

Claims were handled conservatively. Qualifying changes cover AHCIP eligibility, laser treatment areas and suitability, radiofrequency downtime, treatment response, recovery, PRP results, dry-skin duration, rosacea improvement and device measurement. Unsupported superiority, universal suitability, guaranteed duration, “no synthetic additives,” “best,” immediate RF results, and broad Vitalia efficacy language were removed.

The C-Retinol page and the kit containing it now carry the manufacturer's pregnancy/breastfeeding and photosensitivity warnings. The changes preserve the product concentration and directions. Unresolved claims are listed by priority in section 12.

## 7. Aesthetics source fidelity

| Treatment | Reference | Mechanism | Device | Duration | Downtime | Aftercare | Contraindications | Unsupported claim added | Meaning changed | Production verified |
|---|---|---|---|---|---|---|---|---|---|---|
| Laser hair removal | YES | YES | REVIEW: Elite+ vs Elite iQ | YES | N/A | N/A | N/A | NO | NO | NO |
| Laser skin treatments | YES | YES | REVIEW: Elite+ vs Elite iQ | YES | N/A | N/A | N/A | NO | NO | NO |
| Radiofrequency | YES | YES | YES: TempSure | YES | YES, qualified | YES | N/A | NO | NO | NO |
| RF microneedling | YES | YES | YES: Potenza | YES | YES | YES | YES | NO | NO | NO |
| Ultra | YES | YES | YES | YES | YES | YES | N/A | NO | NO | NO |
| PRP hair restoration | YES | YES | N/A | YES | YES | N/A | N/A | NO | NO | NO |
| PRP skin rejuvenation | YES | YES | N/A | YES | N/A | N/A | N/A | NO | NO | NO |
| TempSure Vitalia | YES | REVIEW | YES | N/A | N/A | N/A | N/A | NO | YES—unsafe broad efficacy was removed | NO |

The Elite+ name is retained because the clinic's current device inventory has not confirmed that Elite iQ supersedes it. Ultra's source-listed actinic keratosis indication is withheld pending medical approval. RF microneedling durations, 3–5 treatment course, 4–6 week spacing, up-to-two-year qualified RF duration, 48-hour precautions and contraindications were preserved.

## 8. Physician biographies

| Physician | Facts preserved | Credentials verified | Grammar | Canadian English | Medical terminology |
|---|---|---|---|---|---|
| Dr. Mohamed Farhat | YES | PARTIAL—clinic/current approved record | PASS | PASS | PASS |
| Dr. Omaima Saeed | YES | PARTIAL—clinic/current approved record | PASS | PASS | PASS |
| Dr. Reem Hamdi | YES | PARTIAL—CFPC terminology verified; individual designations need registry confirmation | PASS | PASS | PASS |
| Dr. Omonijo | YES | PARTIAL—time-sensitive years-of-practice claim flagged | PASS | PASS | PASS |
| Dr. Bakare | YES | PARTIAL—clinic/current approved record | PASS | PASS | PASS |
| Dr. Ahmed Gwea | YES | PARTIAL—diploma naming retained from approved record | PASS | PASS | PASS |

All biographies and clinical interests were preserved. No degree, appointment, privilege, procedure, year of experience or hospital relationship was invented. Physician meta descriptions are now complete sentences and identify Blue Diamond Medical in West Springs, Calgary.

## 9. SEO, GEO and AEO

All 129 canonical pages had title, description, canonical, H1, headings, schema text, links and rendered copy captured. Physician descriptions were repaired. Important pages use Calgary when it reflects location or search intent; product and policy pages do not repeat it unnecessarily. Treatment sections answer what the treatment is, how it works, duration, recovery and suitability only where the source supports an answer. Structured fields retain explicit device, treatment, concern and physician relationships. A second production crawl is required after publication.

## 10. CMS and production

CMS authority applies to 52 content entries and 6 physician profiles. Eleven page records mainly provide page metadata/media while repository templates supply the body. Fifty-seven exact whole-field CMS proposals across 32 records are recorded; further structured-field mapping is required for new aftercare and warning fields. No CMS record was changed because the available account cannot publish. No repository deployment was started, so production remains on `0fdcc187b755813a700c0b1534be821afbf0333f` and old CMS copy remains visible on affected routes.

## 11. Representative before/after examples

| Page | Before | After | Reason | Class | Meaning changed |
|---|---|---|---|---|---|
| Medical hub | Comprehensive AHS-insured… | Family medicine and walk-in care…in West Springs, Calgary. | Correct Alberta terminology | Terminology | NO |
| Eye screening | AHS-covered eye disease screening | Eye disease screening with referral based on your doctor's assessment | Avoid universal coverage claim | Claim qualification | NO |
| Home | Also included in every visit | Other family medicine services | Remove false visit inclusion | Factual | NO |
| Medical Botox | Bruxism (TMJ) | Bruxism and jaw pain | TMJ is anatomy, not a synonym | Terminology | NO |
| Medical Botox | Book through the approved system | Book your appointment | Remove internal wording | UX | NO |
| Laser hair removal | anywhere on the body | suitable areas of the face and body | Qualify suitability | Claim qualification | NO |
| Skintel | automatically calibrates | practitioner uses the reading to select settings | Correct operator/device role | Clinical accuracy | YES—corrected mechanism |
| Rosacea | best treatment | may help reduce visible blood vessels | Remove superiority claim | Claim qualification | NO |
| RF microneedling | faster, more dramatic results | support skin tightening | Remove unsupported comparison | Claim removal | NO |
| RF recovery | minimal downtime | redness, swelling and pinpoint bleeding typically settle within three days | Restore source detail | Source fidelity | NO |
| RF aftercare | precaution embedded in downtime | dedicated 48-hour exercise/sun section | Preserve and clarify | Source fidelity | NO |
| Ultra | postinflammatory | post-inflammatory | Canadian medical spelling | Terminology | NO |
| Ultra | actinic keratosis | withheld pending medical approval | Avoid publishing an unapproved indication | Claim removal | YES—safety correction |
| Ultra recovery | generic 5–7 days | one-day redness, 5–6 day dry texture, 5–7 day healing | Restore source distinctions | Source fidelity | NO |
| PRP | regenerative serum | platelet-rich plasma prepared from the patient's blood | Correct substance | Terminology | NO |
| PRP hair | stimulate inactive follicles | support hair growth; results vary | Avoid guaranteed mechanism/outcome | Claim qualification | NO |
| PRP skin | no synthetic additives | ask what preparation products are used | Protocol can include additives | Clinical accuracy | YES—removed unsupported claim |
| Vitalia | broad pelvic-floor and sexual-health treatment claims | consultation to assess symptoms and options | Source does not support broad efficacy | Claim removal | YES—safety correction |
| Dry skin | dryness…unparalleled anywhere in Canada | Calgary's dry climate can contribute | Remove exaggerated local claim | Localization | NO |
| Dry skin | nourished and glowing for months | topical moisturizers/pigment regulators; results vary | Remove duration promise | Claim removal | NO |
| Health Hub | physicians are preparing articles | no articles have been published yet | Remove invented workflow | Factual | NO |
| Lumivive | one price/size record | system includes Day and Night bottles | Remove database language | Naturalness | NO |
| Facial Cleanser | research for this record | check the current ingredient label | Patient-facing uncertainty | Naturalness | NO |
| Scar gel | smaller/larger approved size | 14.2 g / 56.7 g | State useful package facts | Naturalness | NO |
| C-Retinol | no pregnancy warning | do not use while pregnant or breastfeeding | Restore manufacturer warning | Safety | YES—new verified warning |
| C-Retinol | no photosensitivity warning | avoid direct UV; SPF 30+ every two hours | Restore manufacturer warning | Safety | YES—new verified warning |
| Physician metadata | biography cut at 155 characters | complete Calgary-specific sentence | Prevent truncated search result | SEO | NO |

## 12. Remaining issues

### P0

- Obtain a FeelStack publisher identity with `content.publish`; then back up, conflict-check, patch, publish and read back each CMS record.
- Run the normal CI deployment using the exact green release SHA only after CMS and repository changes are synchronized.
- Crawl all 129 canonical English routes after deployment and verify new copy present/old copy absent.

### P1

- Confirm whether the clinic uses Elite+ or Elite iQ; these are not interchangeable names.
- Obtain clinician approval for RF microneedling serious-risk language and the identity of the source-described “celluloid” mask/care kit.
- Confirm whether Ultra is offered for actinic keratosis; it remains withheld.
- Confirm the exact TempSure Vitalia indications used by the clinic.
- Confirm RF topical-infusion agents and protocols before naming hyaluronic acid, botulinum toxin, PLLA/PDLLA or tranexamic acid.
- Verify each physician's current registration and public credentials against the relevant registries.

### P2

- Review SkinMedica growth-factor/exosome quantities against a current manufacturer source before keeping precise numerical claims.
- Confirm eye-screening eligibility/cost language and the current Euclid patient pathway.
- Complete desktop, tablet and mobile visual QA after the synchronized build.

### P3

- Replace pending physician/product images only when approved assets are supplied.
- Revisit time-sensitive experience-year wording annually.

## Evidence and reproducibility

- `content/english-audit/replacements.json`: individually reviewed exact replacements.
- `content/english-audit/repository-field-diff.json`: production-base versus edited structured fields.
- `content/english-audit/cms-exact-field-proposals.json`: non-publishable CMS draft mapping.
- `content/english-audit/coverage-progress.json`: count definitions and current metrics.
- `docs/CANADIAN_ENGLISH_HOUSE_STYLE.md`: project glossary and house style.
- `docs/SOURCE_CONFLICT_REGISTER.md`: unresolved factual and clinical conflicts.

Primary external checks used in the review include Alberta's AHCIP coverage guidance, CFPC certification terminology, Cynosure manufacturer material, FDA RF microneedling safety communication, and the Concept Myriade C-Retinol warning. These sources qualify or flag content; they do not establish which device or protocol the clinic currently uses.
