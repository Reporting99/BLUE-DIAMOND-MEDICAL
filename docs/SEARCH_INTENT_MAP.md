# Search Intent Map

Maps real search wording (English and Arabic) to the site's actual indexable routes. No search-volume figures are claimed anywhere in this document — none are backed by an approved data source (Google Search Console, Keyword Planner, or similar), so none are stated as "high volume" or ranked by size. Queries are grouped by intent only.

## Medical

| Route | Primary EN query | Secondary EN queries | Primary AR query | Secondary AR queries | User questions | Answer-first statement (draft) | Internal links | Schema |
|---|---|---|---|---|---|---|---|---|
| `/medical` | family doctor accepting new patients Calgary | family doctor West Springs Calgary; walk-in clinic Calgary SW | طبيب أسرة يقبل مرضى جدد في كالغاري | طبيب أسرة في غرب كالغاري؛ عيادة بدون موعد في كالغاري | "Are you accepting new patients?" "Do I need an appointment?" | States directly whether new patients/walk-ins are accepted and how to book, in the first sentence | → 7 service pages, `/doctors`, `/book-appointment` | `MedicalClinic` (homepage-level, referenced) |
| `/medical/eye-screening` | eye screening Calgary | vaccinations Calgary (general-medicine adjacent, not a dedicated page — see gap note) | فحص العين في كالغاري | — | "Who does the screening?" "Is it covered?" | Names the Euclid Telehealth partnership and what the screening checks, up front | → `/book-appointment`, `/medical` | `MedicalWebPage` (live) |
| `/medical/after-hours-care` | after-hours medical care Calgary | walk-in clinic Calgary SW | الرعاية الطبية خارج أوقات الدوام في كالغاري | عيادة بدون موعد في كالغاري | "What do I do if the clinic is closed?" | Names the PCN partner and how to reach care, immediately | → `/patient-resources`, PCN external links | `MedicalWebPage` (live) |
| `/medical/chronic-disease-management` | chronic disease management Calgary | mental health family doctor Calgary (partial overlap — see gap note) | إدارة الأمراض المزمنة في كالغاري | — | "What conditions do you manage?" | States the AHS-insured scope plainly | → `/doctors`, `/medical` | `MedicalWebPage` (live) |
| `/medical/weight-management` | — (no direct supplied query; inferred from "weight management Calgary" pattern) | — | إدارة الوزن في كالغاري | — | "Is this covered by AHS?" | States insured status and what's involved | → `/medical` | `MedicalWebPage` (live) |
| `/medical/pain-management` | — (inferred) | — | إدارة الألم في كالغاري | — | "What kind of pain do you treat?" | States scope plainly | → `/medical` | `MedicalWebPage` (live) |
| `/medical/minor-procedures` | driver's medical Calgary (partial — minor procedures ≠ driver's medicals, see gap note); immigration medical Calgary (same caveat) | — | الإجراءات الطبية البسيطة في كالغاري | — | "What procedures are done in-clinic?" | Lists the actual approved procedure types (skin lesion excision, joint injections) | → `/doctors/bakare` | `MedicalWebPage` (live) |
| `/medical/uninsured-services` | uninsured medical services Calgary | driver's medical Calgary; immigration medical Calgary | الخدمات الطبية غير المشمولة في كالغاري | — | "How much does a form cost?" | Points straight at the fee table | → `/medical` | `MedicalWebPage` (live) |
| `/patient-resources` | — | women's health clinic Calgary; pediatric care Calgary SW (both partial-overlap, see gap note) | — | — | "What's your no-show policy?" | States policy directly | → `/medical/after-hours-care` | — |

**Gap notes** (queries supplied in the brief that don't map cleanly to an existing or plannable route, given approved source content): "vaccinations Calgary," "women's health clinic Calgary," "pediatric care Calgary SW," "mental health family doctor Calgary," "driver's medical Calgary," and "immigration medical Calgary" are all real family-medicine search intents, but the approved DOCX doesn't confirm Blue Diamond offers a *dedicated* service line for any of these beyond what's already folded into `/medical/uninsured-services` (forms) and general family-doctor scope (`/medical`, `/doctors`). No new route is proposed for any of these without an approved source confirming the specific service — flagged in `docs/CONTENT_SOURCE_REGISTER.md` as "needs client confirmation before a dedicated page is justified," per §11's own rule ("do not imply Blue Diamond treats a condition unless the service is confirmed").

## Medical Aesthetics

| Route | Primary EN query | Secondary EN queries | Primary AR query | User questions | Answer-first statement (draft) | Schema |
|---|---|---|---|---|---|---|
| `/aesthetics` | physician-led medical aesthetics Calgary | medical aesthetics Calgary SW; medical aesthetics West Springs; skin clinic Calgary | عيادة تجميل طبي في كالغاري | "Is this run by a doctor or an esthetician?" | States physician-led status in the first sentence | — |
| `/aesthetics/treatments/laser-hair-removal` | laser hair removal Calgary | laser clinic Calgary | إزالة الشعر بالليزر في كالغاري | "Which device do you use?" "Where is it performed?" | States the Elite iQ™/Citizen Studio location detail up front (already implemented via `serviceLocationNote`) | `MedicalWebPage` (live) |
| `/aesthetics/treatments/rf-microneedling` | RF microneedling Calgary | Potenza Calgary | الوخز الدقيق بالترددات الراديوية في كالغاري | "How many sessions?" | Names Potenza and the mechanism plainly | `MedicalWebPage` (live) |
| `/aesthetics/treatments/radio-frequency` | skin tightening Calgary | TempSure Calgary | شد البشرة بدون جراحة في كالغاري | "Is there downtime?" | States mechanism + downtime-varies framing | `MedicalWebPage` (live) |
| `/aesthetics/treatments/prp-hair-restoration` | PRP hair restoration Calgary | hair loss treatment Calgary (concern overlap) | علاج تساقط الشعر بالبلازما في كالغاري | "Does this use my own blood?" | States the PRP mechanism plainly | `MedicalWebPage` (live) |
| `/aesthetics/treatments/prp-skin-rejuvenation` | PRP skin rejuvenation Calgary | — | تجديد البشرة بالبلازما في كالغاري | — | Same pattern | `MedicalWebPage` (live) |
| `/aesthetics/treatments/laser-skin-treatments` | laser pigmentation treatment Calgary | — | علاج التصبغات بالليزر في كالغاري | — | States what pigment/redness concerns it addresses | `MedicalWebPage` (live) |
| `/botox` | cosmetic Botox Calgary | medical Botox Calgary | بوتوكس تجميلي في كالغاري | "Is this covered by insurance?" | States the AHS/private-insurance qualified language immediately (already implemented per `docs/DATA_APPROVAL_BLOCKERS.md`) | — |

## Concerns

| Route | Primary EN query | Primary AR query |
|---|---|---|
| `/aesthetics/concerns/acne-scars` | acne scar treatment Calgary | علاج آثار حب الشباب في كالغاري |
| `/aesthetics/concerns/rosacea-redness` | rosacea treatment Calgary / facial redness treatment Calgary | علاج الوردية واحمرار الوجه |
| `/aesthetics/concerns/sun-damage-pigmentation` | pigmentation treatment Calgary / sun damage treatment Calgary | علاج التصبغات وأضرار الشمس |
| `/aesthetics/concerns/spider-veins` | spider vein treatment Calgary | — |
| `/aesthetics/concerns/fine-lines-wrinkles` | fine lines treatment Calgary | — |
| `/aesthetics/concerns/skin-laxity` | skin laxity treatment Calgary | — |
| `/aesthetics/concerns/razor-bumps` | razor bumps treatment Calgary | — |
| *(no route — see gap note)* | hair loss treatment Calgary | علاج تساقط الشعر بالبلازما |

**Gap note**: "hair loss treatment Calgary" doesn't have a dedicated *concern* page — it currently only surfaces via the `prp-hair-restoration` *treatment* page. Given PRP hair restoration is the only approved hair-loss-relevant treatment in the source, a genuinely new "Hair Loss" concern page would either duplicate that treatment page's content or need additional approved source material to be non-thin. Recorded here as a candidate for a future concern page **if** more source content becomes available — not created now to avoid the brief's own "no duplicate pages targeting similar keywords" rule.

## Medical Botox (gated — `medicalBotoxDetailPagesEnabled`)

| Route (gated) | Primary EN query | Primary AR query |
|---|---|---|
| `/medical/botox/migraine` | Botox for migraine Calgary | بوتوكس طبي للصداع النصفي |
| `/medical/botox/bruxism-tmj` | Botox for TMJ Calgary / Botox for bruxism Calgary / Botox for jaw clenching Calgary | بوتوكس طبي لمفصل الفك |
| `/medical/botox/hyperhidrosis` | Botox for hyperhidrosis Calgary | بوتوكس طبي لفرط التعرق |
| `/botox` (live, covers all 3 today) | medical Botox vs cosmetic Botox; medical Botox insurance Calgary | — |

These three queries are real search intents with real approved content already written (`src/content/medical-botox.ts`) — they're addressed today via `/botox`'s unified content rather than 3 separate pages, per the documented no-duplication rule (`docs/MISSING_CONTENT_REPORT.md`). No insurance-coverage promise is ever stated as guaranteed — every mention uses the approved qualified phrasing ("a combination of provincial health insurance and either patient private insurance or our compassionate program").

## Cross-cutting notes

- No keyword is stuffed into any heading or paragraph — this map exists to confirm each *existing* page already has a clear, honest reason to rank for its mapped intent, and to flag genuine gaps for client review, not to drive new invented content.
- Arabic queries above are natural phrasings, not literal word-for-word translations of the English list — matching the brief's own bilingual-content requirement (§18) that Arabic content be equivalent in meaning, not mechanically literal.
- Local relevance ("Calgary," "West Springs," "Calgary SW") appears naturally in existing page copy (address, JSON-LD, homepage hero) rather than being force-inserted into every heading.
