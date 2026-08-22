# Route Decision Log

Records every route-tree validation decision from the Part 1 audit, against the rules in the brief and the two owned legacy sites / approved DOCX. Classification scheme: `KEEP` / `MERGE` / `REDIRECT` / `GATE` / `DELETE` / `REQUIRES CLIENT APPROVAL`. Full per-route classification table is `docs/FINAL_ROUTE_INVENTORY.md`; this log is the *reasoning*, not the inventory.

## Rule-by-rule validation

| Rule | Checked against | Result |
|---|---|---|
| One authoritative page per doctor | 6 `doctor-*` routes in `src/config/routes.ts`, each a unique id/path generated from `src/types/doctor.ts` | **Compliant** — no duplicates possible by construction (routes are generated 1:1 from the doctors array) |
| Treatments and concerns remain separate | `treatment-*` vs `concern-*` route id prefixes, separate hubs (`/aesthetics/treatments` vs `/aesthetics/concerns`) | **Compliant** |
| Technologies remain separate from treatments | `technology-*` route prefix, separate hub (`/aesthetics/technologies`) | **Compliant** |
| Medical Botox remains separate from cosmetic Botox | `medical-botox-*` (AHS-insured conditions, gated) vs `treatment-cosmetic-botox` (gated) vs `botox-hub` (live, unified overview covering both) are three distinct route trees | **Compliant** |
| Doctors must not be duplicated under Medical and Aesthetics | `doctors-index` is one top-level section; Medical and Aesthetics pages *link* to doctor profiles, none re-publish a duplicate profile under their own path | **Compliant** |
| After-Hours Care must have one canonical location | `medical-after-hours-care` (`/medical/after-hours-care`) is the only route carrying this content; Patient Resources links out to it rather than repeating it | **Compliant** |
| Do not create detailed internal booking-form routes | `book-appointment` route (`templateType: "booking-hub"`) presents channel choices and links externally; no form fields, no health-data collection anywhere on the site | **Compliant** |
| `/book-appointment/` is an external-booking routing hub | Confirmed via `src/config/routes.ts` and `docs/BOOKING_SYSTEMS.md` | **Compliant** |
| Do not create duplicate pages merely to target similar keywords | Checked every treatment/concern/technology pair for content overlap — none share the same underlying content (each has distinct approved source text) | **Compliant** |
| Do not retain thin or empty category pages | Shop category/concern pages are now populated (21 real SkinMedica products), but the whole subtree stays `GATE`d pending product photography — no thin *live* page exists | **Compliant** |
| Do not publish "Coming Soon" pages | Grepped for the phrase and manually checked every gated route's behavior — all real 404s, zero placeholder pages | **Compliant** |
| Gated content must return the intended non-indexable behavior | Verified structurally (`indexing: "noindex"` + `inSitemap: false` on every `requiresFeature` route) and by test (`tests/e2e/gated-routes.spec.ts`) | **Compliant** |
| Old URLs must redirect directly to the final canonical route | Audited every row in `src/lib/seo/legacy-redirects.ts` against actual current content location — **found and fixed 3 rows that pointed at the wrong or an unrelated page** (see below) | **2 real bugs found and fixed this pass** |
| Do not redirect unrelated pages to the homepage | No row redirects to `/` — but 2 rows redirected to an unrelated *non-homepage* live page, which is the same underlying problem; fixed | **2 real bugs found and fixed this pass** |
| Do not create redirect chains | `tests/redirects/legacy-redirects.spec.ts` asserts a single-hop resolution for every row; 42/42 passing | **Compliant** |

## Real fixes made this pass

1. **`/terms-and-conditions` and `/privacy-policy`** previously redirected to `/en/aesthetics` — an unrelated marketing page. A visitor looking for legal terms would land on a treatments page with no indication anything was wrong. Retargeted to the real final canonical routes (`/en/terms`, `/en/privacy-policy`), matching the same "point at the real destination even if it's currently gated" pattern already used for `/products` → `/en/shop`. Both still 404 while `legalPagesEnabled` is off — that's correct and honest, not a regression.
2. **`/primary-care-network`** previously redirected to the generic `/en/patient-resources` hub with a `TODO retarget` comment. Checked the actual content: the legacy "Primary Care Network" page was specifically about the Mosaic PCN / Calgary West Central PCN after-hours partnership, and that exact content (verified in `src/content/medical-services.ts`) lives on `/medical/after-hours-care`, not the general resources hub. Retargeted accordingly. `/clinic-policies` was checked against the same rule and found already correct (clinic-policy content genuinely is published inline on the Patient Resources hub) — left unchanged.

Both fixes were verified: `npx playwright test tests/redirects` — 31/31 passing after the change, TypeScript/ESLint/build all clean.

## "FINAL MANDATORY NAVIGATION" pass — decisions recorded, not silently guessed

Two literal-text ambiguities between that brief and the existing, tested route tree, resolved using the brief's own stated priority ("use the existing canonical route map... do not invent duplicate routes when an approved canonical route already exists") rather than guessed silently:

1. **"Services" nav item / `/en/services/`** — the brief's Services-page section uses `/en/services/` as its example URL, but the existing `/en/medical/` hub already satisfies every literal requirement listed there word-for-word (real, public, organized by category, non-gated, 200, linked from nav/homepage/footer) and is the brief's own mandatory Medical Services hub from an earlier pass in this same project. Creating a second `/en/services/` page with the same content would itself be the "duplicate route" the brief forbids. Resolution: the "Services" nav item links to `/en/medical/` (`src/config/navigation.ts`); a plain redirect alias `/en/services` → `/en/medical` was added (`next.config.ts`) so the literal URL still resolves rather than 404s, without creating a second indexable page.
2. **"Cosmetic Botox" and "Skin Tightening" in the Treatments dropdown** — both are on the brief's required treatment list, but each one's only approved source content already lives entirely on an existing live page (Cosmetic Botox's treatment-area list is the Botox hub's; "Skin Tightening" is Radio Frequency/TempSure's own stated function, not a distinct procedure) — exactly why both were gated in an earlier pass (see "Gate — fully built, feature-flagged off" below and `docs/MISSING_CONTENT_REPORT.md`). The brief's own §7 rule — "never link to a gated page" — combined with the master brief's standing "do not create duplicate pages for the same intent" rules out both flipping the flag on a thin/duplicate page and inventing new unique content that doesn't exist in any approved source. Resolution: both appear in the Treatments dropdown with their approved display name (`src/content/treatments.ts` `gatedTreatments`, title only) but link to the real live page that already carries their approved content — `botox-hub` and `treatment-radio-frequency` respectively (`src/config/navigation.ts` `treatmentsMenuItems`). Two dropdown labels intentionally resolve to the same underlying page for Skin Tightening/Radio Frequency, which is documented here rather than hidden.

## Route classifications summary (full detail in `docs/FINAL_ROUTE_INVENTORY.md`)

- **KEEP**: all 50 live/public route entries — no restructuring needed, every rule above checked compliant.
- **GATE**: 52 route entries, unchanged classification from `docs/ROUTE_INVENTORY.md`/`docs/MISSING_CONTENT_REPORT.md` — each has a specific, documented, non-duplicative reason.
- **REDIRECT**: 42 legacy URLs (source of truth: `src/lib/seo/legacy-redirects.ts`) — most on the primary legacy domain handled natively by `src/proxy.ts`, the rest aesthetics-domain-only entries documented for DNS-level configuration in `docs/DNS_LEGACY_DOMAIN_GUIDE.md`. 11 of these 42 (`/tempsure`, `/microneedling`, 7 `/about-skinmedica-products/f/*` product pages, `/vitalia`, `/ols/products`) were found this pass via a live sitemap/robots crawl of both legacy domains and were previously undiscovered/unredirected — see `docs/DATA_APPROVAL_BLOCKERS.md`.
- **MERGE**: none required — no two routes were found serving the same purpose.
- **DELETE**: none — every previously-built route still has a legitimate reason to exist.
- **REQUIRES CLIENT APPROVAL**: the data conflicts already tracked in `docs/DATA_APPROVAL_BLOCKERS.md` (doctor roster count, 3 unidentified portraits) don't correspond to a *route*-level decision — no route's existence depends on an unresolved conflict; they affect content/image completeness within already-KEEP routes.
