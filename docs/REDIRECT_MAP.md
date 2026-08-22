# Redirect Map

Source of truth: `src/lib/seo/legacy-redirects.ts`, consumed by `src/proxy.ts`. All redirects are direct (no chains), exact-match, and return 301.

## bluediamondmedical.ca — homepage

| Old path | New path |
|---|---|
| `/` | `/en/` *(handled by `src/proxy.ts`'s bare-path locale-prefix step, not the `legacyRedirects` table — `defaultLocale` is a static constant, not Accept-Language negotiation, so this is a genuine 301, not a temporary redirect; fixed from 307 during this pass)* |

## bluediamondmedical.ca (primary legacy site — handled natively by this app's proxy)

| Old path | New path |
|---|---|
| `/appointment-1` | `/en/book-appointment` |
| `/services` | `/en/medical` |
| `/our-team` | `/en/doctors` |
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

## bluediamondmedicalaesthetics.ca (separate legacy domain — cannot be caught by this app's proxy)

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
| `/our-team` | `/en/doctors` |
| `/acne-scar-removal` | `/en/aesthetics/concerns/acne-scars` |
| `/rosacea-abatement` | `/en/aesthetics/concerns/rosacea-redness` |
| `/dry-skin-remediation` | `/en/aesthetics/concerns/dry-skin` |
| `/fineline-and-wrinkle` | `/en/aesthetics/concerns/fine-lines-wrinkles` |
| `/non-invasive-skin` | `/en/aesthetics/concerns/skin-laxity` |
| `/spider-vein` | `/en/aesthetics/concerns/spider-veins` |
| `/sun-damage` | `/en/aesthetics/concerns/sun-damage-pigmentation` |
| `/skin-revitalization` | `/en/aesthetics/concerns/skin-revitalization` |
| `/razor-bumps` | `/en/aesthetics/concerns/razor-bumps` |
| `/terms-and-conditions` | `/en/terms` *(fixed during route-tree validation — previously pointed at the unrelated `/en/aesthetics` page; now points at the real final canonical route, which itself 404s until `legalPagesEnabled` — see `docs/MISSING_CONTENT_REPORT.md`)* |
| `/privacy-policy` | `/en/privacy-policy` *(same fix)* |
| `/vitalia` | `/en/aesthetics/treatments/tempsure-vitalia` *(found via live `sitemap.website.xml` crawl this pass — not in the original DOCX-derived inventory. Page content confirmed by direct fetch: pelvic-floor/vaginal-tightening RF treatment — the exact subject already covered by the published TempSure Vitalia page, not a duplicate)* |
| `/ols/products` | `/en/shop` *(GoDaddy Website Builder's auto-generated "Online Store" module page, found via `sitemap.ols.xml` — generic platform boilerplate, not unique editorial content; closest live equivalent)* |

All treatment/concern/technology targets above now point at real, built pages (`docs/ROUTE_INVENTORY.md`) — none of this table's targets are placeholders anymore. No `TODO retarget` markers remain — `/primary-care-network` and the two legal-page redirects were corrected to their real final destinations during this pass's route-tree validation (`docs/ROUTE_DECISION_LOG.md`).

Only the two legal-page targets (`/en/terms`, `/en/privacy-policy`) still resolve to a 404 boundary — `legalPagesEnabled` stays off until real, approved legal copy exists (brief §25 explicitly forbids publishing the legacy "Coming soon" placeholder or inventing legal text). Every other redirect target in both tables above is a live 200 page. See `docs/DATA_APPROVAL_BLOCKERS.md`.

## Tested

`tests/e2e/locale-routing.spec.ts` verifies `/services → /en/medical` as a representative case. The full redirect table should get one test per row before launch —.
