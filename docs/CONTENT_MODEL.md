# Content Model

What content exists, where it lives, how it is approved, and how gaps are
handled. Companion documents: `ARCHITECTURE.md`, `FEELSTACK.md`,
`DEPLOYMENT.md`.

---

## 1. Entity types

| Entity | Type | Content | Route |
|---|---|---|---|
| Medical service | `types/medical-service.ts` | `content/medical-services.ts` | `/medical/[serviceId]` |
| Doctor | `types/doctor.ts` | inline in the same file | `/doctors/[doctorId]` |
| Aesthetic treatment | `types/aesthetics.ts` | `content/treatments.ts` | `/aesthetics/treatments/[treatmentId]` |
| Concern | `types/aesthetics.ts` | `content/concerns.ts` | `/aesthetics/concerns/[concernId]` |
| Technology | `types/aesthetics.ts` | `content/technologies.ts` | `/aesthetics/technologies/[technologyId]` |
| Product | `types/product.ts` | `content/products.ts` | `/shop/[productId]` |
| Health Hub article | `types/article.ts` | `content/health-hub-articles.ts` | `/health-hub/[articleId]` |
| Legal page | `types/legal.ts` | `content/legal-pages.ts` | `/[legalPageId]` |
| Before/after | `types/before-after.ts` | `content/before-after.ts` | `/aesthetics/before-after` |
| Pricing | `types/pricing.ts` | `content/uninsured-fees.ts`, `content/aesthetics-pricing.ts` | `/medical/uninsured-services`, `/aesthetics/pricing` |
| Media manifest | `types/media.ts` | `content/media/image-manifest.ts` | — |

Clinic facts (address, phone, fax, hours, social) live in `config/site.ts` and
`config/clinic-hours.ts` and are read from there by every component and schema
— never hardcoded elsewhere.

FAQs and prices are **not** standalone entities; they travel embedded on their
parent entity, in both the local types and the CMS schemas.

Each entity's CMS counterpart and cache tags: `FEELSTACK.md` §4–5.

## 2. Bilingual by construction

Every user-facing string field is `Bilingual` (`{ en: string; ar: string }`).
There is no code path that can register English-only content — the type makes
both required. The same applies to routes: `RouteEntry.path` is a required
`{ en; ar }` object.

Arabic is real translated copy with real Arabic slugs, not transliteration and
not English slugs under `/ar/`. Review status: `TRANSLATION_REVIEW_REPORT.md`.

## 3. Approval and provenance

The governing rule: **a field with no approved source is omitted, never
invented.** A missing optional field means the section is not rendered — never
placeholder text, never "coming soon".

- `CONTENT_APPROVAL_MATRIX.md` — provenance of every field.
- `CONTENT_SOURCE_REGISTER.md` — the approved sources themselves.
- `SOURCE_INVENTORY.md` — what the legacy-site crawl found.
- `DATA_APPROVAL_BLOCKERS.md` — what is blocked and on whom.
- `MISSING_CONTENT_REPORT.md` — what is absent and why.
- `CONTENT_COVERAGE_REPORT.md` — legacy content mapped to new routes.
- `PAGE_CONTENT_REQUIREMENTS.md` — per-page field requirements.
- `SEARCH_INTENT_MAP.md` — intent each route targets.

`sourceVerified` on an entity means every field traces to the approved
extraction document. Products additionally carry per-fact `sources` with
publisher and retrieval date.

This discipline is what makes the structured data safe: schema is generated
only from fields that already exist and are already rendered, so JSON-LD can
never assert something the page does not show (`ARCHITECTURE.md` §6).

## 4. Feature gating

`config/features.ts` is the single set of flags. A disabled feature must be
hidden from navigation, excluded from the sitemap, and unreachable — its route
calls `notFound()`. It must never render an empty page.

Gated routes are fully built — registry entry, typed model, template — so
enabling one is a flag flip, not new code.

Currently off, each pending real content or a provider:

| Flag | Blocked on |
|---|---|
| `shopCheckoutEnabled` | no payment provider implemented or approved |
| `legalPagesEnabled` | legacy Terms/Privacy are literal "Coming soon" placeholders |
| `healthHubArticlesEnabled` | template and model built; zero approved articles |
| `beforeAfterEnabled` | no approved before/after photography |
| `consultationFormEnabled` | no approved consultation flow |
| `aestheticPricingEnabled` | no approved aesthetics price list |
| `newsletterEnabled` | no email provider |
| `medicalBotoxDetailPagesEnabled`, `cosmeticBotoxTreatmentPageEnabled`, `skinTighteningTreatmentPageEnabled`, `newProductBrandEnabled` | would duplicate existing content rather than add unique detail |

`shopEnabled` and `careersFormEnabled` are on.

## 5. Media

Every image is an entry in `content/media/image-manifest.ts` with an approval
`status`. Only `"approved"` renders the real ImageKit path; everything else
renders the FacetTile placeholder, so an unapproved or missing photo degrades
to a designed placeholder rather than a broken image.

Most clinical photography is still `pending` — see
`IMAGE_REPLACEMENT_MANIFEST.md` and `IMAGEKIT_MEDIA_MANIFEST.md`. One doctor
has `photoDeclined: true`, which is permanent and must not be revisited.

Setup and import: `IMAGEKIT_SETUP.md`, `IMAGEKIT_IMPORT_REPORT.md`.

## 6. Adding or changing content

1. Add or edit the entry in `src/content/*.ts`, filling only fields with an
   approved source.
2. If it needs a new route, add it to `src/config/routes.ts` with both locale
   paths — nav, breadcrumbs, canonical, hreflang and sitemap follow
   automatically.
3. Record provenance in `CONTENT_APPROVAL_MATRIX.md`.
4. For images, add a manifest entry with `status: "pending"` and flip it to
   `"approved"` only once the asset is uploaded and signed off.
5. Run `npm run validate` and the Playwright suite. The static-analysis tests
   will reject unapproved image hosts, catalogue drift, and sitemap or hreflang
   inconsistency.

Once FeelStack is provisioned, the same entities become CMS-managed one family
at a time — `FEELSTACK.md` §7.
