# Translation Review Report

**Status: all Arabic copy in this build is AI-drafted and unreviewed.** It was written with care for register, medical tone, and natural phrasing (not machine-literal), but per the brief's own content-approval rules, it needs a native-speaker pass and — for anything describing a medical/clinical service — a medically-literate reviewer before this becomes the production Arabic site.

## What exists

- `src/i18n/dictionaries/ar.ts` — all UI chrome (nav, footer, homepage sections, common labels).
- Inline bilingual copy in every page component under `src/app/[locale]/*` (medical hub, aesthetics hub, botox hub, patient resources, about, contact, careers, book-appointment).
- `src/types/doctor.ts` — doctor names, credentials, and bios in Arabic.
- `src/config/routes.ts` — Arabic route slugs.
- `src/content/medical-services.ts` — 7 medical-service pages' Arabic copy, including clinical terms (chronic disease management, minor procedures, etc.).
- `src/content/uninsured-fees.ts` — Arabic translations of every fee-schedule line item (forms, treatments, administrative tasks, no-show fees). Fee item names in particular should be checked against how patients actually refer to these documents in conversation (e.g. "Attending Physician Statement," "Blue Cross Special Authorization").
- `src/content/treatments.ts` — 8 aesthetic treatment pages, the richest and most clinically technical Arabic copy in the build (mechanism-of-action language, contraindication lists, downtime/recovery descriptions). This is the highest-priority file for a medical-Arabic reviewer given both volume and clinical specificity.
- `src/content/concerns.ts` — 9 concern pages, including the note on 3 concerns whose treatment cross-link was editorially corrected from the source (see `docs/CONTENT_APPROVAL_MATRIX.md`).
- `src/content/technologies.ts` — 5 technology pages. Manufacturer/product names (Elite iQ™, Potenza, TempSure, Cynosure) are kept untranslated as proper nouns — confirm this matches how the clinic wants brand names presented in Arabic marketing.
- `src/content/medical-services.ts` — **42 new bilingual FAQs added this pass** (6 per medical service × 7 services), grounded entirely in already-approved source content, never inventing new clinical facts. Same review priority as the rest of this file's medical-service copy.
- `src/content/products.ts` — **23 SkinMedica product names, plus full bilingual detail content and FAQs, transliterated/translated to Arabic.** Names are professional-convention renderings (phonetic transliteration for trademarked product names, following the same pattern already used for Potenza/TempSure/Elite iQ in `technologies.ts`); detail content (overview, how-to-use, warnings, FAQs) is original Arabic copy written from the same verified-source research as the English, not a machine translation. None of it has yet been reviewed by a native Arabic-speaking marketing reviewer — recommended before launch, same as every other Arabic content block in this report.

## Specific items needing native-speaker confirmation before launch

1. **Doctor name transliterations** — especially "Dr. Ahmed Gwea" → `أحمد جويع`, which is a best-effort phonetic transliteration with no confirmed source spelling. Every doctor should ideally confirm their own preferred Arabic spelling.
2. **Medical terminology precision** — terms like "bruxism (TMJ)" → `صرير الأسنان (TMJ)`, "hyperhidrosis" → `التعرق الزائد`, and the uninsured-service fee labels should be checked against how a Calgary-area Arabic-speaking patient population actually expects to see them phrased (regional Arabic varies; this draft uses Modern Standard Arabic throughout for broad comprehensibility).
3. **Numerals policy** — this build deliberately keeps Western/Latin digits everywhere (phone numbers, prices, dates) even inside Arabic paragraphs, on the reasoning that phone numbers and prices should never visually reverse. This is a design decision, not an oversight — confirm it matches client expectations; some Arabic-first audiences prefer Eastern Arabic numerals (٠١٢٣) in body copy.
4. **Legal/clinical disclaimers** — the emergency notice and contact-form privacy notice are translated but have not been reviewed by anyone with Arabic medical-legal expertise.

## Process for closing this out

1. Export all `ar:` strings (a script to diff `en.ts`/`ar.ts` keys and dump Arabic values would be a good next addition to `tests/`).
2. Native-speaker review pass, tracked against this file.
3. Medical reviewer sign-off on any clinical terminology.
4. Mark each section above resolved and remove the "unreviewed" status at the top of this file.
