# Source Inventory

## Approved source documents

| File | Location | Used for |
|---|---|---|
| `BLUE DIAMOND LOGO DOCUMENT[10519].pdf` | Supplied via Downloads (client-provided, Decca Design Inc.) | Logo geometry, 4-blue/4-grey palette, wordmark typeface reference — see `docs/UI_UX_FOUNDATION.md` §1–2 |
| `Blue-Diamond-Medical-Website-Content-Extraction_1.docx` | Supplied via Downloads (Dfeelings Digital Marketing Agency content extraction) | All copy currently on the live site: home, appointment/no-show fees, uninsured services, doctor bios, medical aesthetics, Botox, eye screening, primary care network, clinic policies, careers, contact, SkinMedica product price list, and the full `bluediamondmedicalaesthetics.ca` treatment/technology/concern catalogue |

No other client documents (pricing for aesthetics, before/after photography, legal copy, doctor headshots, business hours beyond "open today," ImageKit/FeelStack credentials) have been supplied. See `docs/MISSING_CONTENT_REPORT.md`.

## Source priority applied

1. The two documents above (approved client source).
2. Direct instructions in the build brief.
3. A live crawl of both legacy domains (added this pass — see below), used strictly for **discovery and gap verification** (finding URLs that exist but weren't in the DOCX), never for copying page copy into the new site.

## Live legacy-domain crawl (brief §3 mandatory discovery, performed this pass)

Both legacy domains were reachable, so this ran the real crawl rather than falling back to the DOCX-only minimum inventory: fetched `robots.txt` and every `sitemap*.xml` file on both `bluediamondmedical.ca` (`sitemap.xml` index → `sitemap.website.xml`, `sitemap.blog.xml`, `sitemap.ola.xml`) and `bluediamondmedicalaesthetics.ca` (`sitemap.xml` index → `sitemap.website.xml`, `sitemap.ols.xml`, `sitemap.ola.xml`). Found 3 real pages and 7 individual SkinMedica product sub-pages absent from the DOCX-derived inventory — `/tempsure`, `/microneedling`, `/vitalia`, and `/about-skinmedica-products/f/<slug>` × 7 — all now redirected (`src/lib/seo/legacy-redirects.ts`, `docs/REDIRECT_MAP.md`) rather than left to 404. Full detail: `docs/DATA_APPROVAL_BLOCKERS.md`. The `sitemap.ola.xml` endpoint on both domains and `/ols/products` are platform-generated (GoDaddy Website Builder booking-widget/store-module) artifacts, not unique editorial pages.

## What was NOT used

- Derm.ca or any other third-party clinic site — not consulted for content or imagery, only referenced in the brief as a quality-bar note.
- Stock photography, AI-generated photography, or any non-ImageKit image source for production imagery.
- No page copy was transcribed from the live crawl above — it was used only to confirm a URL exists and to read its `<title>`/topic for correct redirect targeting, never as a content source for the new site's pages (the DOCX remains the sole approved copy source).
