# SEO, GEO & AEO Validation Summary

Covers traditional SEO, Generative Engine Optimization (GEO — signals that help AI answer engines correctly attribute and locate the clinic), and Answer Engine Optimization (AEO — structuring content so it can be lifted directly as an answer). Validated by `tests/seo/seo-validators.spec.ts` plus manual review.

## SEO — implemented

- **Per-page metadata** via `src/lib/seo/metadata.ts#getRouteMetadata()` — every built page (all 81 route entries, including gated ones for when they're switched on) has a unique, locale-specific title and description, driven by `src/config/routes.ts`.
- **Self-referencing canonicals** — English pages canonicalize to their English URL, Arabic pages to their Arabic URL. Verified by construction and by `tests/seo/seo-validators.spec.ts`.
- **hreflang alternates** — `en-CA`, `ar-CA`, and `x-default` (pointing at English) on every page, via both `alternates.languages` in page metadata and per-URL `alternates` in `src/app/sitemap.ts`.
- **`robots.ts`** — allows all crawling except `/api/` and query-string variants; points at the sitemap. Verified live.
- **`sitemap.ts`** — generated from the route registry, filtered to `inSitemap && indexing === "index"` and feature-flag-gated. Produces exactly 100 URLs (50 route entries × 2 locales) as of this pass — verified by a dedicated test that recomputes the expected count from the registry rather than hardcoding it, so it can't silently drift.
- **Gated-route noindex-by-construction** — every one of the 31 gated route entries has `indexing: "noindex"` and `inSitemap: false` set structurally in the registry, checked by a test that fails if any gated entry is missing either field (not just checked against current flag values, which could be true by accident).
- **`llms.txt`** — matches what's actually live on the site; no unpublished claims.
- **Descriptive link text** — the desktop Lighthouse `link-text` audit caught 4 generic "Learn more" links on the homepage this pass; fixed with `sr-only` context spans (). Desktop SEO score: **100**.
- **Clean URLs** — meaningful Arabic slugs (not `/ar/doctors`), no query-string language switching.
- **301 redirects** for the legacy domain's known URLs, exact-match, no chains (`src/lib/seo/legacy-redirects.ts`), each covered by `tests/redirects/legacy-redirects.spec.ts`.

## JSON-LD (`src/components/seo/JsonLd.tsx`)

- `MedicalClinic` + `Physician` graph on the homepage, one consistent clinic `@id`, `inLanguage` set per locale, `address`/`geo` fields for West Springs, Calgary, AB.
- `BreadcrumbList` — visible trail + matching JSON-LD, live on every medical-service, uninsured-services, aesthetic-treatment, concern, technology, and doctor page.
- `FAQPage` — added on the homepage, generated from the same `homepageCopy.faq` array that renders the visible `<details>` accordion, so the schema can never say more than the page shows. Extended to every template with a `faqs` field via the shared `FaqPageSchema` component: `MedicalServiceTemplate` (all 7 medical services), `AestheticTreatmentTemplate` (8 of 10 treatments), `ConcernTemplate` (all 9 concerns), and `TechnologyTemplate` (all 5 technologies) — same guarantee everywhere: the component takes the exact array a template renders visibly, never a separate list.
- No reviews, ratings, awards, patient counts, or certifications are emitted anywhere — none are approved (`docs/CONTENT_APPROVAL_MATRIX.md`).

## GEO (Generative Engine Optimization)

- Consistent NAP (Name/Address/Phone) block repeated verbatim across header, footer, contact page, homepage, and `MedicalClinic` JSON-LD `address`/`telephone` — AI answer engines cross-reference NAP consistency to trust a location.
- "West Springs, Calgary, Alberta" stated explicitly in body copy (not just schema) on the homepage hero, location section, and contact page, so it's extractable from rendered text alone, not only structured data.
- Physician `@id`s in the `Physician` graph link back to the clinic `@id`, establishing the "physician-led" relationship machine-readably, matching the visible doctor bios.
- `llms.txt` gives AI crawlers a direct, honest summary of services/location/contact/language options without requiring them to infer it from navigation.

## AEO (Answer Engine Optimization)

- Homepage FAQ section is answer-first: each question is followed immediately by a direct, complete answer (no "click to learn more" deflection), matching the pattern answer engines extract most reliably.
- Medical-service and aesthetic-treatment templates lead with a one-paragraph summary before any subheadings — the "answer" precedes the detail, so a snippet extractor doesn't need to assemble it from scattered fragments.
- Uninsured-services fee tables and the no-show fee schedule are marked up as real `<table>` data (not styled `<div>` grids), which both accessibility tooling and answer engines parse more reliably than visual-only tables.

## Added this remediation pass

- **`MedicalWebPage` schema** — `src/components/seo/MedicalWebPageSchema.tsx`, wired into `MedicalServiceTemplate`, `AestheticTreatmentTemplate`, `ConcernTemplate`, and `TechnologyTemplate`. Deliberately narrow (`name`/`description`/`url`/publisher reference only) — no `MedicalProcedure` claims (cost, risk, preparation, outcome), since the approved source doesn't carry that level of structured clinical detail and inventing it would violate the no-fabrication rule. Verified by `tests/seo/seo-validators.spec.ts`'s "MedicalWebPage structured data" suite (checks the schema's `name` matches the page's own visible `<h1>`).
- **Doctor and treatment/concern/technology cross-linking** — the Part 1 content audit found zero doctor cross-links from any aesthetics page; now every treatment, concern, and technology entry carries `relatedDoctorIds` (all pointing at Dr. Farhat, the only physician with `practicesAesthetics: true`), rendered as real internal links, strengthening the site's internal-linking signal without inventing any new fact.
- **Open Graph images** — `getRouteMetadata()`'s `ogImagePath` parameter was previously accepted and silently dropped (a real bug, not just a gap — the type signature implied it worked). Now resolves through ImageKit's `og-image` preset via the official SDK's `buildSrc()` when ImageKit is configured; omits `images` entirely (same honest fallback as everywhere else) when it isn't. Wired into the homepage as a working example; not yet applied to the other 49 live routes — a mechanical follow-up once real hero images exist per page.

## Not yet implemented (honest gaps)

- `Product`/`Offer` schema — moot while shop is gated (SkinMedica data is imported, but photography isn't — see `docs/IMAGEKIT_IMPORT_REPORT.md`).
- `Article` schema — moot while Health Hub has zero published articles.
- Open Graph images beyond the homepage — the plumbing is real and tested, but only one page uses it so far.

## Structured-data honesty check

`docs/CONTENT_APPROVAL_MATRIX.md` governs every field emitted by `JsonLd.tsx` — nothing in any schema block says more than the corresponding visible page content does. This is enforced by convention (every JSON-LD field is sourced from the same content object the page renders from — see the homepage's `homepageCopy.faq` example above) rather than by a runtime diff, which is a reasonable but not airtight guarantee and is worth a dedicated automated check in a future pass.
