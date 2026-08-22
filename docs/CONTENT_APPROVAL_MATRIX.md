# Content Approval Matrix

For every published claim, its source, approval status, and where it renders. "Approved" here means "present in the supplied content-extraction document," not clinically re-verified — a medical reviewer should still sign off before real-world launch.

| Claim | Source | Status | Languages live | Page(s) |
|---|---|---|---|---|
| Clinic address, phone, fax | Content extraction doc (both legacy sites) | Approved | EN, AR | Header, Footer, Contact, Homepage, JSON-LD |
| "Opened July 4, 2022, founded by Dr. Mohamed Farhat, 28+ years experience" | Content extraction doc | Approved | EN, AR | Homepage, About |
| Six family physicians, names and bios | Content extraction doc | Approved | EN, AR | Doctors index + profiles |
| AHS-insured service list | Content extraction doc | Approved | EN, AR | Medical hub |
| Uninsured service fees (Forms, Treatments, Administrative Tasks — full tables) | Content extraction doc | Approved and published | EN, AR | `/medical/uninsured-services` |
| No-show fee schedule (full table) | Content extraction doc | Approved and published | EN, AR | `/medical/uninsured-services` |
| Botox medical/cosmetic treatment list | Content extraction doc | Approved | EN, AR | Botox hub |
| Botox insurance/compassionate-program note | Content extraction doc | Approved | EN, AR | Botox hub |
| Clinic policies (appointments, no-show, refills, confidentiality) | Content extraction doc | Approved | EN, AR | Patient Resources |
| Aesthetics signature services (RF micro-needling, skin tightening, laser, Botox, PRP) | Content extraction doc | Approved | EN, AR | Aesthetics hub |
| Eye disease screening (Euclid Telehealth partnership, monthly on-site, contact details) | Content extraction doc | Approved | EN, AR | `/medical/eye-screening` |
| After-hours care referral partners (Mosaic PCN for Dr. Hamdi's patients, CWC PCN for Dr. Farhat's patients) | Content extraction doc | Approved | EN, AR | `/medical/after-hours-care` |
| Chronic disease management, preventive care, weight management, pain management, minor procedures | Content extraction doc (AHS-insured list; one line each, plus Dr. Bakare's/Dr. Saeed's bios for detail) | Approved, kept intentionally short where source was thin | EN, AR | `/medical/<slug>` |
| SkinMedica product catalogue (23 SKUs — exact names, prices, sizes, full bilingual detail content and FAQs) | Content extraction doc + official manufacturer/authorized-retailer research | **Brand, data, and content approved and imported** (`src/content/products.ts`), validated by `tests/unit/skinmedica-catalogue.spec.ts` | — | Built and routed, still `shopEnabled: false` — the remaining blocker is product photography, not data (no SkinMedica bottle photos exist in the approved image archive) |
| Individual treatment/concern/technology detail copy (laser hair removal mechanics, RF micro-needling FAQs, etc.) | Content extraction doc | Approved in source, **not yet built into pages** | — | Tracked in `docs/MISSING_CONTENT_REPORT.md` |
| Doctor photography | Not supplied | **Not approved / not present** | — | Facet Tile placeholder everywhere |
| Aesthetics pricing | Not supplied | **Not approved / not present** | — | `aestheticPricingEnabled: false` |
| Before/after results | Not supplied | **Not approved / not present** | — | `beforeAfterEnabled: false` |
| Legal copy (Terms, Privacy, Accessibility, Medical Disclaimer) | Legacy site shows "Coming soon" only | **Not approved / not publishable** | — | Not routed |
| 8 aesthetic treatments (laser hair removal, laser skin treatments, radio frequency, RF micro-needling, ultra, PRP hair restoration, PRP skin rejuvenation, TempSure Vitalia) — full clinical detail (mechanism, duration, downtime, results timeline, contraindications, FAQs) | Content extraction doc (bluediamondmedicalaesthetics.ca section) | Approved and published | EN, AR | `/aesthetics/treatments/<slug>` |
| 9 aesthetic concerns | Content extraction doc | Approved and published | EN, AR | `/aesthetics/concerns/<slug>` |
| 5 technologies (Elite iQ, Potenza, TempSure, Ultra, TempSure Vitalia) | Content extraction doc | Approved and published | EN, AR | `/aesthetics/technologies/<slug>` |
| Concern → treatment cross-links for Rosacea, Spider Veins, and Sun Damage | Content extraction doc, **with an editorial correction** | Approved with a documented deviation | EN, AR | The legacy site linked these three concerns to `/laser-hair-removal`, which the extraction doc itself flags as a mislink pattern elsewhere ("Ultra Treatment — links to /prp-therapy, mislabeled"). Relinked to Laser Skin Treatments instead, whose own approved content explicitly covers redness, spider veins, and pigmentation. See `src/content/concerns.ts` and `docs/ROUTE_INVENTORY.md`. |
| Reviews, ratings, awards, patient counts, certifications | Not supplied anywhere | **Never to be fabricated** | — | Absent from every page and every JSON-LD block |

Every JSON-LD block (`src/components/seo/JsonLd.tsx`) only emits fields with a row above marked "Approved."
