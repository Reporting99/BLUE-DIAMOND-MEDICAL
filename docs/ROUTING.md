# Routing, Route Registry and Redirects

Consolidated from the per-task documents this project accumulated; every
fact below is carried over verbatim from the source noted at each section.

## English ↔ Arabic Route Map

Required Part-1 deliverable — covers **every** registered route, live and gated, not just the live 50. Source of truth is always `src/config/routes.ts`; this is a generated-by-hand mirror, verified against it this pass.

**100% EN/AR path parity confirmed** — every one of the 102 registered routes has both `path.en` and `path.ar` populated (enforced structurally by the `RouteEntry` type, which makes `path` a required `{ en; ar }` object — there is no code path that could register an English-only route). This is also asserted by `tests/seo/seo-validators.spec.ts`.

### Live routes (50 — full detail, matches `docs/ROUTING.md`'s KEEP list)

See `docs/ROUTING.md` for the complete existing table — verified current and accurate this pass, no changes needed. Reproduced summary:

| Section | EN root | AR root |
|---|---|---|
| Home | `/` | `/` |
| Medical | `/medical` (+7 services, +1 pricing) | `/الرعاية-الطبية` |
| Aesthetics | `/aesthetics` (+ treatments/concerns/technologies hubs and 22 leaf pages) | `/التجميل-الطبي` |
| Botox | `/botox` | `/بوتوكس` |
| Doctors | `/doctors` (+6 profiles) | `/الأطباء` |
| Patient Resources | `/patient-resources` | `/موارد-المرضى` |
| Health Hub | `/health-hub` | `/المركز-المعرفي` |
| About | `/about` | `/من-نحن` |
| Careers | `/careers` | `/الوظائف` |
| Contact | `/contact` | `/تواصل-معنا` |
| Book Appointment | `/book-appointment` | `/حجز-موعد` |

### Gated routes (52 — Arabic slugs already written, ready the moment each flag flips)

| Section | EN root | AR root |
|---|---|---|
| Medical Botox | `/medical/botox` (+3 conditions) | `/الرعاية-الطبية/بوتوكس` |
| Cosmetic Botox / Skin Tightening | `/aesthetics/treatments/cosmetic-botox`, `/aesthetics/treatments/skin-tightening` | `/التجميل-الطبي/العلاجات/بوتوكس-تجميلي`, `.../شد-البشرة` |
| Aesthetics pricing | `/aesthetics/pricing` | `/التجميل-الطبي/الأسعار` |
| Consultation request | `/aesthetics/consultation` | `/التجميل-الطبي/طلب-استشارة` |
| Before & After | `/aesthetics/before-after` | `/التجميل-الطبي/قبل-وبعد` |
| Legal (4 pages) | `/terms`, `/privacy-policy`, `/accessibility`, `/medical-disclaimer` | Arabic slugs per `src/features/legal/data.ts` |
| Shop (41 routes: hub, 8 categories, 6 concerns, 23 products, cart, checkout, shipping) | `/shop/...` | `/المتجر/...` |

### Known translation-review flags

- `doctor-gwea`'s Arabic slug (`محمد-فرحات` sibling pattern, transliteration of "Gwea") is pending native-speaker confirmation — tracked in `docs/CONTENT_MODEL.md`, not a blocker (the page still renders and functions correctly either way; this is a spelling-refinement flag, not a missing-content flag).
- SkinMedica product Arabic names and detail content (23 products) are professional-convention transliterations/translations and original bilingual copy, not yet reviewed by a native Arabic-speaking marketing reviewer — flagged in `docs/CONTENT_MODEL.md`.

### Verification

`tests/seo/seo-validators.spec.ts` — "no duplicate English paths," "no duplicate Arabic paths," "Sitemap contains every published route in both locales" — all passing. `src/proxy.ts`'s `arabicToCanonicalPath` map is auto-derived from this exact registry, so a route added here with both paths populated is automatically reachable via its pretty Arabic URL with zero additional code.

## Route Inventory

Single source of truth is `src/config/routes.ts` — this document mirrors it in prose. Do not hand-edit route paths here; edit the registry (or the content file it's generated from) and regenerate this table.

**104 route entries are registered** (81 + 23 `shop-product-*` entries, one per client-approved SkinMedica product — see `docs/CONTENT_MODEL.md`). Every one of them has a real page file, a typed bilingual content model, and a reusable template — there is no "planned but not built" category left. 50 entries are live and public (unchanged — sitemap.xml verified at exactly 100 URLs); 54 are fully built but feature-flagged off pending approved content, credentials, or a business decision (see "Gated" below and `docs/CONTENT_MODEL.md` for the reason behind each).

### Live and public (50 route entries → 100 URLs, verified in `sitemap.xml`)

| Route ID | EN path | AR path | Template | In nav |
|---|---|---|---|---|
| `home` | `/` | `/` | homepage | — |
| `medical-hub` | `/medical` | `/الرعاية-الطبية` | hub | ✅ |
| `medical-eye-screening`, `medical-after-hours-care`, `medical-chronic-disease-management`, `medical-preventive-care`, `medical-weight-management`, `medical-pain-management`, `medical-minor-procedures` (×7) | `/medical/<slug>` | `/الرعاية-الطبية/<slug>` | medical-service | — |
| `medical-uninsured-services` | `/medical/uninsured-services` | `/الرعاية-الطبية/الخدمات-غير-المشمولة` | pricing | — |
| `aesthetics-hub` | `/aesthetics` | `/التجميل-الطبي` | hub | ✅ |
| `aesthetics-treatments-hub` + 8 treatments | `/aesthetics/treatments[/<slug>]` | `/التجميل-الطبي/العلاجات[/<slug>]` | hub + aesthetic-treatment | — |
| `aesthetics-concerns-hub` + 9 concerns | `/aesthetics/concerns[/<slug>]` | `/التجميل-الطبي/المخاوف-الجمالية[/<slug>]` | hub + concern | — |
| `aesthetics-technologies-hub` + 5 technologies | `/aesthetics/technologies[/<slug>]` | `/التجميل-الطبي/التقنيات[/<slug>]` | hub + technology | — |
| `botox-hub` | `/botox` | `/بوتوكس` | hub | ✅ |
| `doctors-index` + 6 doctors | `/our-team[/<slug>]` | `/فريقنا[/<slug>]` | hub + doctor-profile | ✅ (index only) |
| `patient-resources-hub` | `/patient-resources` | `/موارد-المرضى` | hub | ✅ |
| `health-hub` | `/health-hub` | `/المركز-المعرفي` | hub | ✅ |
| `about` | `/about` | `/من-نحن` | static | ✅ |
| `careers` | `/careers` | `/الوظائف` | static | — |
| `contact` | `/contact` | `/تواصل-معنا` | contact | ✅ |
| `book-appointment` | `/book-appointment` | `/حجز-موعد` | booking-hub | ✅ |

Exact per-route slugs for the 22 aesthetics leaf pages live in `src/features/aesthetics/data/treatments.ts`, `src/features/concerns/data.ts`, `src/features/technologies/data.ts` — the route registry generates from those files directly, so they're treated as the source of truth rather than duplicated here.

### Gated — fully built, feature-flagged off (52 route entries → 104 URLs)

None of these appear in the sitemap, main navigation, or search results, and every one of them returns a real 404 (verified in `tests/e2e/gated-routes.spec.ts`) — not an empty page, not a redirect, not a "Coming soon" placeholder.

| Route(s) | Feature flag | Why it's off |
|---|---|---|
| `medical-botox-hub` + migraine/bruxism-tmj/hyperhidrosis (4) | `medicalBotoxDetailPagesEnabled` | Would duplicate content already published on `/botox` |
| `treatment-cosmetic-botox` | `cosmeticBotoxTreatmentPageEnabled` | Would duplicate `/botox`'s existing content |
| `treatment-skin-tightening` | `skinTighteningTreatmentPageEnabled` | Would duplicate `/aesthetics/treatments/radio-frequency` |
| `aesthetics-pricing` | `aestheticPricingEnabled` | **Published 2026-08-31** — flag `true`, route `index`/`inSitemap`. The flag is retained so the whole price list can be withdrawn in one move if the clinic revises the sheet |
| `aesthetics-consultation` | `consultationFormEnabled` | No approved consultation-intake flow supplied |
| `aesthetics-before-after` | `beforeAfterEnabled` | No approved before/after photography |
| `legal-terms`, `legal-privacy-policy`, `legal-accessibility`, `legal-medical-disclaimer` (4) | `legalPagesEnabled` | No approved legal copy (legacy showed literal "Coming soon") |
| `shop-hub`, 8 category, 6 concern, 23 `shop-product-*` (all client-approved SkinMedica products, full bilingual detail content), cart, checkout, shipping-returns (41) | `shopEnabled` | Product data and content are approved, imported, and validated (`src/features/products/data.ts`, `tests/unit/skinmedica-catalogue.spec.ts`); the remaining blocker is product photography — see `docs/MEDIA.md` |

`/health-hub/[articleId]` is a 19th fully-built-but-empty case that isn't in the table above because it has no flag at all — it's gated purely by having zero entries in `src/features/health-hub/data.ts`, so `generateStaticParams` returns nothing and any slug 404s. Same underlying pattern (route + type + template exist, no content), no feature flag needed since there's nothing to toggle.

### Verification

- `tests/e2e/gated-routes.spec.ts` — every gated path 404s; sitemap and nav both omit them.
- `tests/seo/seo-validators.spec.ts` — asserts by construction that every route with `requiresFeature` set has `indexing: "noindex"` and `inSitemap: false` in the registry, not just that today's flag values happen to hide it.

## Route Decision Log

Records every route-tree validation decision from the Part 1 audit, against the rules in the brief and the two owned legacy sites / approved DOCX. Classification scheme: `KEEP` / `MERGE` / `REDIRECT` / `GATE` / `DELETE` / `REQUIRES CLIENT APPROVAL`. Full per-route classification table is `docs/ROUTING.md`; this log is the *reasoning*, not the inventory.

### 2026-09-01 — `/doctors` renamed to `/our-team` (whole family)

`REDIRECT`. The index and all six member pages moved together:
`/doctors[/<slug>]` -> `/our-team[/<slug>]`, `/الأطباء[/<slug>]` -> `/فريقنا[/<slug>]`.
Member slugs are unchanged on both sides; only the parent segment moved.

**Why the whole family, not just the index.** An index at `/our-team` with
members still at `/doctors/<slug>` is two names for one section — it breaks the
breadcrumb's own claim about where a member lives, and leaves the old noun in
every physician's canonical URL. A partial rename was considered and rejected.

**Arabic.** `فريقنا` is not a new coinage: it is already the project's Arabic
for "Our Team" in `src/i18n/dictionaries/ar.ts` (`nav.ourTeam`). Member slugs
stay exactly as the CMS authored them.

**Both sides moved.** The six members are FeelStack `person_profile` entities,
so the CMS is authoritative for their paths. They were repatched there
(`routePrefix` only, leaving each stored slug untouched), then
`src/config/localized-entity-routes.generated.ts` and
`tests/fixtures/feelstack/cms-route-inventory.json` were regenerated from the
updated CMS. Renaming only the repository would have failed
`localized-route-parity.spec.ts`, which is exactly what that spec is for.

**The route id stayed `doctors-index`.** It is an internal key referenced by
nav, the footer, three templates, the FacetTile seed and
`cacheTags.doctorsIndex` — whose CMS cache tag `feelstack-doctors:<site>:<locale>`
is derived from it. Renaming it would churn all of that, and invalidate live
cache keys, to change a string no visitor sees.

**Redirects: none, deliberately.** The rename briefly carried 28 exact-match
301s in `renamedRouteRedirects`. They were removed in the pre-launch
architecture pass. Blue Diamond has never been published on its production
domain, so `/doctors` and `/الأطباء` have no inbound links, no index entry and
no equity to preserve — a redirect for one only gives the team family a second
address, which is the duplication this pass exists to remove. `/our-team` and
`/فريقنا` are now the only addresses that have ever been public.

This does NOT apply to `legacyRedirects` in the same file, which maps URLs from
the two live third-party sites (bluediamondmedical.ca,
bluediamondmedicalaesthetics.ca). Those URLs *are* published and *do* have
inbound links; that table is a migration contract and stays. The invariant
separating the two — a redirect source may never be a path this build itself
served — is asserted in `tests/contracts/prelaunch-route-architecture.spec.ts`.

### Rule-by-rule validation

| Rule | Checked against | Result |
|---|---|---|
| One authoritative page per doctor | 6 `doctor-*` routes in `src/config/routes.ts`, each a unique id/path generated from `src/features/doctors/data.ts` | **Compliant** — no duplicates possible by construction (routes are generated 1:1 from the doctors array) |
| Treatments and concerns remain separate | `treatment-*` vs `concern-*` route id prefixes, separate hubs (`/aesthetics/treatments` vs `/aesthetics/concerns`) | **Compliant** |
| Technologies remain separate from treatments | `technology-*` route prefix, separate hub (`/aesthetics/technologies`) | **Compliant** |
| Medical Botox remains separate from cosmetic Botox | `medical-botox-*` (AHS-insured conditions, gated) vs `treatment-cosmetic-botox` (gated) vs `botox-hub` (live, unified overview covering both) are three distinct route trees | **Compliant** |
| Doctors must not be duplicated under Medical and Aesthetics | `doctors-index` is one top-level section; Medical and Aesthetics pages *link* to doctor profiles, none re-publish a duplicate profile under their own path | **Compliant** |
| After-Hours Care must have one canonical location | `medical-after-hours-care` (`/medical/after-hours-care`) is the only route carrying this content; Patient Resources links out to it rather than repeating it | **Compliant** |
| Do not create detailed internal booking-form routes | `book-appointment` route (`templateType: "booking-hub"`) presents channel choices and links externally; no form fields, no health-data collection anywhere on the site | **Compliant** |
| `/book-appointment/` is an external-booking routing hub | Confirmed via `src/config/routes.ts` and `docs/ARCHITECTURE.md` | **Compliant** |
| Do not create duplicate pages merely to target similar keywords | Checked every treatment/concern/technology pair for content overlap — none share the same underlying content (each has distinct approved source text) | **Compliant** |
| Do not retain thin or empty category pages | Shop category/concern pages are now populated (21 real SkinMedica products), but the whole subtree stays `GATE`d pending product photography — no thin *live* page exists | **Compliant** |
| Do not publish "Coming Soon" pages | Grepped for the phrase and manually checked every gated route's behavior — all real 404s, zero placeholder pages | **Compliant** |
| Gated content must return the intended non-indexable behavior | Verified structurally (`indexing: "noindex"` + `inSitemap: false` on every `requiresFeature` route) and by test (`tests/e2e/gated-routes.spec.ts`) | **Compliant** |
| Old URLs must redirect directly to the final canonical route | Audited every row in `src/lib/routing/legacy-redirects.ts` against actual current content location — **found and fixed 3 rows that pointed at the wrong or an unrelated page** (see below) | **2 real bugs found and fixed this pass** |
| Do not redirect unrelated pages to the homepage | No row redirects to `/` — but 2 rows redirected to an unrelated *non-homepage* live page, which is the same underlying problem; fixed | **2 real bugs found and fixed this pass** |
| Do not create redirect chains | `tests/redirects/legacy-redirects.spec.ts` asserts a single-hop resolution for every row; 42/42 passing | **Compliant** |

### Real fixes made this pass

1. **`/terms-and-conditions` and `/privacy-policy`** previously redirected to `/en/aesthetics` — an unrelated marketing page. A visitor looking for legal terms would land on a treatments page with no indication anything was wrong. Retargeted to the real final canonical routes (`/en/terms`, `/en/privacy-policy`), matching the same "point at the real destination even if it's currently gated" pattern already used for `/products` → `/en/shop`. Both still 404 while `legalPagesEnabled` is off — that's correct and honest, not a regression.
2. **`/primary-care-network`** previously redirected to the generic `/en/patient-resources` hub with a `TODO retarget` comment. Checked the actual content: the legacy "Primary Care Network" page was specifically about the Mosaic PCN / Calgary West Central PCN after-hours partnership, and that exact content (verified in `src/features/medical-services/data.ts`) lives on `/medical/after-hours-care`, not the general resources hub. Retargeted accordingly. `/clinic-policies` was checked against the same rule and found already correct (clinic-policy content genuinely is published inline on the Patient Resources hub) — left unchanged.

Both fixes were verified: `npx playwright test tests/redirects` — 31/31 passing after the change, TypeScript/ESLint/build all clean.

### "FINAL MANDATORY NAVIGATION" pass — decisions recorded, not silently guessed

Two literal-text ambiguities between that brief and the existing, tested route tree, resolved using the brief's own stated priority ("use the existing canonical route map... do not invent duplicate routes when an approved canonical route already exists") rather than guessed silently:

1. **"Services" nav item / `/en/services/`** — the brief's Services-page section uses `/en/services/` as its example URL, but the existing `/en/medical/` hub already satisfies every literal requirement listed there word-for-word (real, public, organized by category, non-gated, 200, linked from nav/homepage/footer) and is the brief's own mandatory Medical Services hub from an earlier pass in this same project. Creating a second `/en/services/` page with the same content would itself be the "duplicate route" the brief forbids. Resolution: the "Services" nav item links to `/en/medical/` (`src/config/navigation.ts`). An alias `/en/services` → `/en/medical` was added in `next.config.ts` at the time and has since been **removed** in the pre-launch architecture pass: nothing links to `/en/services`, it was never published, and an alias for it gave the Medical hub a second address no reader arrives at. `/en/services` is now simply not a route.
2. **"Cosmetic Botox" and "Skin Tightening" in the Treatments dropdown** — both are on the brief's required treatment list, but each one's only approved source content already lives entirely on an existing live page (Cosmetic Botox's treatment-area list is the Botox hub's; "Skin Tightening" is Radio Frequency/TempSure's own stated function, not a distinct procedure) — exactly why both were gated in an earlier pass (see "Gate — fully built, feature-flagged off" below and `docs/CONTENT_MODEL.md`). The brief's own §7 rule — "never link to a gated page" — combined with the master brief's standing "do not create duplicate pages for the same intent" rules out both flipping the flag on a thin/duplicate page and inventing new unique content that doesn't exist in any approved source. Resolution: both appear in the Treatments dropdown with their approved display name (`src/features/aesthetics/data/treatments.ts` `gatedTreatments`, title only) but link to the real live page that already carries their approved content — `botox-hub` and `treatment-radio-frequency` respectively (`src/config/navigation.ts` `treatmentsMenuItems`). Two dropdown labels intentionally resolve to the same underlying page for Skin Tightening/Radio Frequency, which is documented here rather than hidden.

### Route classifications summary (full detail in `docs/ROUTING.md`)

- **KEEP**: all 50 live/public route entries — no restructuring needed, every rule above checked compliant.
- **GATE**: 52 route entries, unchanged classification from `docs/ROUTING.md`/`docs/CONTENT_MODEL.md` — each has a specific, documented, non-duplicative reason.
- **REDIRECT**: 42 legacy URLs (source of truth: `src/lib/routing/legacy-redirects.ts`) — most on the primary legacy domain handled natively by `src/proxy.ts`, the rest aesthetics-domain-only entries documented for DNS-level configuration in `docs/DEPLOYMENT.md`. 11 of these 42 (`/tempsure`, `/microneedling`, 7 `/about-skinmedica-products/f/*` product pages, `/vitalia`, `/ols/products`) were found this pass via a live sitemap/robots crawl of both legacy domains and were previously undiscovered/unredirected — see `docs/CONTENT_MODEL.md`.
- **MERGE**: none required — no two routes were found serving the same purpose.
- **DELETE**: none — every previously-built route still has a legitimate reason to exist.
- **REQUIRES CLIENT APPROVAL**: the data conflicts already tracked in `docs/CONTENT_MODEL.md` (doctor roster count, 3 unidentified portraits) don't correspond to a *route*-level decision — no route's existence depends on an unresolved conflict; they affect content/image completeness within already-KEEP routes.

## Redirect Map

Source of truth: `src/lib/routing/legacy-redirects.ts`, consumed by `src/proxy.ts`. All redirects are direct (no chains), exact-match, and return 301.

### bluediamondmedical.ca — homepage

| Old path | New path |
|---|---|
| `/` | `/en/` *(handled by `src/proxy.ts`'s bare-path locale-prefix step, not the `legacyRedirects` table — `defaultLocale` is a static constant, not Accept-Language negotiation, so this is a genuine 301, not a temporary redirect; fixed from 307 during this pass)* |

### bluediamondmedical.ca (primary legacy site — handled natively by this app's proxy)

| Old path | New path |
|---|---|
| `/appointment-1` | `/en/book-appointment` |
| `/services` | `/en/medical` |
| `/our-team` | `/en/our-team` |
| `/medical-aesthetics-1` | `/en/aesthetics` |
| `/botox-1` | `/en/botox` |
| `/eye-examining` | `/en/medical/eye-screening` |
| `/primary-care-network` | `/en/medical/after-hours-care` *(fixed during route-tree validation — the legacy PCN page's content now lives on the after-hours service page, not the general resources hub)* |
| `/clinic-policies` | `/en/patient-resources` *(correct — clinic-policy content is published inline on this hub)* |
| `/join-our-team` | `/en/careers` |
| `/contact-us` | `/en/contact` |
| `/products` | `/en/shop` *(shop is live — `shopEnabled: true` as of the SkinMedica catalogue pass; resolves to a real 200 catalogue page, not a 404)* |
| `/tempsure` | `/en/aesthetics/technologies/tempsure` *(found via live `sitemap.website.xml` crawl this pass — not in the original DOCX-derived inventory, previously would have 404'd)* |
| `/microneedling` | `/en/aesthetics/treatments/rf-microneedling` *(same — found via live crawl)* |
| `/about-skinmedica-products/f/lumivivetm-system` | `/en/shop/lumivive-system-day-night` *(found via live `sitemap.blog.xml` crawl; 6 more per-product legacy URLs below)* |
| `/about-skinmedica-products/f/lytera®-20-pigmentbrightening-serum` | `/en/shop/lytera-2-pigment-brightening-serum` |
| `/about-skinmedica-products/f/tns®-eye-repair` | `/en/shop/tns-eye-repair` |
| `/about-skinmedica-products/f/total-defense-repair-spf-34---tinted` | `/en/shop/total-defence-repair-spf-34-clear` *(legacy URL slug literally says "tinted" for both this and the next row — resolved by fetching each page's real `<title>`: this one is "... - Clear")* |
| `/about-skinmedica-products/f/total-defense-repair-spf-34---tinted-1` | `/en/shop/total-defence-repair-spf-34-tinted` *(confirmed "... - Tinted" by title)* |
| `/about-skinmedica-products/f/dermal-repair-cream` | `/en/shop/dermal-repair-cream` |
| `/about-skinmedica-products/f/ahabha-exfoliating-cleanser` | `/en/shop/aha-bha-exfoliating-cleanser` |
| `/about-skinmedica-products/f/*` (any other/undiscovered slug) | `/en/shop` *(safety-net prefix rule in `src/proxy.ts` — no 404 possible under this legacy path even for a slug not individually mapped above)* |

### bluediamondmedicalaesthetics.ca (separate legacy domain — cannot be caught by this app's proxy)

This app's `src/proxy.ts` only runs for requests to `bluediamondmedical.ca`. Redirecting the old aesthetics domain requires host-level configuration — see `docs/DEPLOYMENT.md`. The intended target mapping (same table this app's proxy would use if it ever received these hosts) is:

| Old path (bluediamondmedicalaesthetics.ca) | New path (bluediamondmedical.ca) |
|---|---|
| `/` | `/en/aesthetics` |
| `/treatments` | `/en/aesthetics/treatments` |
| `/area-concern` | `/en/aesthetics/concerns` |
| `/laser-hair-removal` | `/en/aesthetics/treatments/laser-hair-removal` |
| `/laser-treatment-1` | `/en/aesthetics/treatments/laser-skin-treatments` |
| `/radio-frequency` | `/en/aesthetics/treatments/radio-frequency` |
| `/rf-micro-needeling` | `/en/aesthetics/treatments/rf-microneedling` |
| `/ultra-treatment` | `/en/aesthetics/treatments/ultra` |
| `/prp-therapy` | `/en/aesthetics/treatments/prp-skin-rejuvenation` *(the legacy page covered both hair and skin PRP in one page; split per brief §15 into `prp-hair-restoration` and `prp-skin-rejuvenation` — this legacy path lands on the skin-rejuvenation half, which is closer to the original page's primary framing)* |
| `/our-technologies` | `/en/aesthetics/technologies` |
| `/our-team` | `/en/our-team` |
| `/acne-scar-removal` | `/en/aesthetics/concerns/acne-scars` |
| `/rosacea-abatement` | `/en/aesthetics/concerns/rosacea-redness` |
| `/dry-skin-remediation` | `/en/aesthetics/concerns/dry-skin` |
| `/fineline-and-wrinkle` | `/en/aesthetics/concerns/fine-lines-wrinkles` |
| `/non-invasive-skin` | `/en/aesthetics/concerns/skin-laxity` |
| `/spider-vein` | `/en/aesthetics/concerns/spider-veins` |
| `/sun-damage` | `/en/aesthetics/concerns/sun-damage-pigmentation` |
| `/skin-revitalization` | `/en/aesthetics/concerns/skin-revitalization` |
| `/razor-bumps` | `/en/aesthetics/concerns/razor-bumps` |
| `/terms-and-conditions` | `/en/terms` *(fixed during route-tree validation — previously pointed at the unrelated `/en/aesthetics` page; now points at the real final canonical route, which itself 404s until `legalPagesEnabled` — see `docs/CONTENT_MODEL.md`)* |
| `/privacy-policy` | `/en/privacy-policy` *(same fix)* |
| `/vitalia` | `/en/aesthetics/treatments/tempsure-vitalia` *(found via live `sitemap.website.xml` crawl this pass — not in the original DOCX-derived inventory. Page content confirmed by direct fetch: pelvic-floor/vaginal-tightening RF treatment — the exact subject already covered by the published TempSure Vitalia page, not a duplicate)* |
| `/ols/products` | `/en/shop` *(GoDaddy Website Builder's auto-generated "Online Store" module page, found via `sitemap.ols.xml` — generic platform boilerplate, not unique editorial content; closest live equivalent)* |

All treatment/concern/technology targets above now point at real, built pages (`docs/ROUTING.md`) — none of this table's targets are placeholders anymore. No `TODO retarget` markers remain — `/primary-care-network` and the two legal-page redirects were corrected to their real final destinations during this pass's route-tree validation (`docs/ROUTING.md`).

Only the two legal-page targets (`/en/terms`, `/en/privacy-policy`) still resolve to a 404 boundary — `legalPagesEnabled` stays off until real, approved legal copy exists (brief §25 explicitly forbids publishing the legacy "Coming soon" placeholder or inventing legal text). Every other redirect target in both tables above is a live 200 page. See `docs/CONTENT_MODEL.md`.

### Tested

`tests/e2e/locale-routing.spec.ts` verifies `/services → /en/medical` as a representative case. The full redirect table should get one test per row before launch —.

---

## Primary navigation IA (final IA brief §13 / §18 / §19) — 2026-08-31

The top level changed this pass. It was:

```
Home · Services · Treatments ▾ · Medical Aesthetics · Our Team · About · Contact
```

which put one *aesthetic* category (Treatments) at the same level as the two
halves of the clinic, and labelled the medical half "Services" — so the top
level never said that Blue Diamond is one brand with two care areas. It is now:

```
Home · Medical ▾ · Aesthetics ▾ · Our Team · About · Contact
        (+ EN | العربية and Book Appointment)
```

**No route was renamed, added or removed by this change**, and nothing was
dropped from the navigation: `Services` is now the Medical mega menu (which
links to the same `/medical` hub the label used to), and `Treatments` is the
first column of the Aesthetics mega menu. The old-site
`legacyRedirects` table is unaffected. (The `/en/services → /en/medical` alias
referenced by earlier revisions of this section no longer exists — see the
"FINAL MANDATORY NAVIGATION" note above.)

| Top-level item | Links to | Mega menu |
|---|---|---|
| Home | `home` | — |
| Medical | `medical-hub` | **Medical**: the 7 built medical-service pages + Botox hub + "View all medical care". **Uninsured Services**: the fees page (grouped separately per §18/§33). |
| Aesthetics | `aesthetics-hub` | **Treatments** (9 + view all) · **Concerns** (9 + view all) · **Technologies** (5 + view all) — the three kept visually distinct per §11/§19. |
| Our Team | `doctors-index` | — |
| About | `about` | — |
| Contact | `contact` | — |

Both mega-menu labels are real `<a href>` links as well as disclosure
triggers: clicking or pressing Enter goes to the hub, hovering or focusing
opens the panel first.

The Concerns and Technologies columns are generated from `concerns` and
`technologies` rather than hand-listed, so a page cannot exist and be missing
from the menu.

**Deliberately not in the Medical menu:** General Family Medicine,
Vaccination, Onsite Paediatrician, Mental Health and Women's Health. On the
original site these are single line items in an AHS-insured services list,
not pages with content. They are rendered as exactly that — a labelled list —
on the Medical hub. A menu row must lead somewhere real; creating five thin
pages to fill out a menu would mean writing medical copy no approved source
supports. Tracked as a content gap, not a routing gap.
