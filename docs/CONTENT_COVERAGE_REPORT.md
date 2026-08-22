# Content Coverage Report

Maps every section of the approved source, `Blue-Diamond-Medical-Website-Content-Extraction_1.docx`, to its destination route and publication status. Complements `docs/CONTENT_APPROVAL_MATRIX.md` (which is organized by claim/status) and `docs/SOURCE_INVENTORY.md` (which documents the two approved source files). This document is organized by **source section**, in the order it appears in the extraction doc, so it can be checked off page-by-page against the DOCX.

Status key: **Published** — fully live, indexed. **Built, gated** — page exists with real content, feature-flagged off pending a decision documented in `docs/MISSING_CONTENT_REPORT.md`. **Excluded** — deliberately not built into a route, with reason.

## bluediamondmedical.ca section (family medicine / walk-in)

| DOCX section | Destination route(s) | Status | Notes |
|---|---|---|---|
| Homepage hero, "who we are," founding story (July 4, 2022, Dr. Farhat, 28+ years) | `/` | Published | Also feeds `MedicalClinic` JSON-LD `foundingDate` |
| Physician roster + bios (6 doctors) | `/doctors`, `/doctors/<slug>` | Published | Dr. Saeed has no photo (declined, per `docs/DATA_APPROVAL_BLOCKERS.md`); Dr. Gwea uses a Facet Tile placeholder |
| AHS-insured services list | `/medical`, `/medical/<slug>` (7 service pages) | Published | Split one page per service rather than one long list, to give each a real URL, heading, and FAQ — not a duplication, each page's copy is scoped to that service only. **All 7 now carry 6 original FAQs each (42 total, grounded in existing approved fields, matched by `FAQPage` schema) — added during the Part 1 content-enrichment pass,.** |
| Uninsured services fee tables (Forms, Treatments, Administrative Tasks) | `/medical/uninsured-services` | Published | Full tables reproduced verbatim; prices are `IBM Plex Mono` styled as data, not prose |
| No-show fee schedule | `/medical/uninsured-services` | Published | Same page as above |
| Eye disease screening / Euclid Telehealth partnership | `/medical/eye-screening` | Published | Booking CTA routes to `euclidtelehealth.org/book-now` |
| After-hours care (Mosaic PCN for Dr. Hamdi's patients, CWC PCN for Dr. Farhat's patients) | `/medical/after-hours-care` | Published | Not duplicated under Patient Resources — Patient Resources links to this one canonical page instead of repeating the content |
| Clinic policies (appointments, no-show, prescription refills, confidentiality) | `/patient-resources` | Published | |
| Careers listing | `/careers` | Published | |
| Contact info (address, phone, fax, hours) | `/contact`, header, footer, homepage, `MedicalClinic` JSON-LD | Published | |

## bluediamondmedicalaesthetics.ca section (medical aesthetics)

| DOCX section | Destination route(s) | Status | Notes |
|---|---|---|---|
| Aesthetics overview / signature services | `/aesthetics` | Published | |
| 8 treatments (laser hair removal, laser skin treatments, radio frequency, RF micro-needling, Ultra, PRP hair restoration, PRP skin rejuvenation, TempSure Vitalia) — full clinical detail | `/aesthetics/treatments/<slug>` (×8) | Published | Laser hair removal carries the approved Citizen Studio `serviceLocationNote` (see `docs/DATA_APPROVAL_BLOCKERS.md` item on service location) |
| 9 concerns | `/aesthetics/concerns/<slug>` (×9) | Published | Rosacea/spider-veins/sun-damage relinked from the source's `/laser-hair-removal` mislink to Laser Skin Treatments — documented deviation, see `CONTENT_APPROVAL_MATRIX.md` |
| 5 technologies (Elite iQ, Potenza, TempSure, Ultra, TempSure Vitalia) | `/aesthetics/technologies/<slug>` (×5) | Published | "Elite+" in the source normalized to the technology's correct product name "Elite iQ™" — see `DATA_APPROVAL_BLOCKERS.md` |
| Botox — cosmetic + medical (migraine, TMJ/bruxism, hyperhidrosis) treatment list, insurance/compassionate-program note | `/botox` (published) | Published | Single unified hub, not split by cosmetic/medical, per the consolidation rule in the newest brief — a medical-Botox-by-condition breakout (`/medical/botox/*`) is **built but gated** (`medicalBotoxDetailPagesEnabled: false`) because splitting it out would duplicate `/botox`'s existing, approved content without new source material to differentiate the pages |
| SkinMedica product price list | `/shop` and children | **Built, gated** (`shopEnabled: false`) | Prices exist in the source but the brief itself asks for explicit brand/product approval before publishing a commerce catalogue (§18 of the original brief) — not published pending that sign-off |
| Individual aesthetics pricing (beyond the SkinMedica list) | `/aesthetics/pricing` | **Built, gated** (`aestheticPricingEnabled: false`) | No approved aesthetics-treatment price list was supplied separately from SkinMedica |
| Before/after photography | `/aesthetics/before-after` | **Built, gated** (`beforeAfterEnabled: false`) | No photography supplied; gallery slot renders empty by design rather than stock/fake images |

## Not present anywhere in the source (correctly absent from the site)

- Legal copy (Terms, Privacy, Accessibility Statement, Medical Disclaimer) — the legacy site itself only shows "Coming soon." Routes are built (`/terms`, `/privacy`, etc.) with `legalPagesEnabled: false`, and even if that flag were flipped on, `LegalPageTemplate` independently refuses to render a page whose `body` is empty, so flipping the flag alone can never publish unapproved legal text.
- Reviews, ratings, awards, patient counts, third-party certifications — never fabricated, never rendered, never included in any JSON-LD block.
- Health Hub articles — the source doc contains no blog/article content; `/health-hub` exists as a hub shell with `healthHubArticlesEnabled: false` and zero fabricated articles.
- Doctor photography — not supplied; every doctor (Dr. Saeed by explicit choice, Dr. Gwea by omission) renders through the code-generated Facet Tile placeholder, never a stock photo.

## Coverage summary

Every section of the approved DOCX has a destination. Nothing in the source was silently dropped: content either (a) is published, (b) is built into a real route held behind a feature flag with a documented reason, or (c) is explicitly listed above as absent from the source and therefore correctly absent from the site. No page's copy was invented outside these two documents.
