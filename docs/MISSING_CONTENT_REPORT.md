# Missing Content Report

Tracks everything the site is intentionally *not* showing yet because approved source content doesn't exist. Each row: the component/data model is already built; only the flag/status needs flipping once real content arrives.

**Every route below is fully built** — registered in `src/config/routes.ts`, backed by a typed bilingual content model, rendered by a reusable template — and every one of them returns a genuine 404 today (verified in `tests/e2e/gated-routes.spec.ts`, which also confirms each is absent from the sitemap and main navigation). Nothing is silently omitted from the brief's required route list; nothing renders as an empty or "Coming soon" page. See `docs/CONTENT_APPROVAL_MATRIX.md` for the source-by-source reasoning.

| Item | Current state | Blocking |
|---|---|---|
| Doctor photography (all 6) | Facet Tile abstract placeholder | No ImageKit account to actually deliver any photo yet. Real, licensed source photos now exist for 2 of 6 (Dr. Farhat, Dr. Reem Hamdi — identity-confirmed by visual inspection, see `docs/IMAGEKIT_IMPORT_REPORT.md`) and are ready to import the moment credentials exist. Dr. Saeed permanently declines a photo. Dr. Omonijo/Bakare/Gwea: real, non-stock portraits exist in the archive but carry no visible name — needs client confirmation before import (see `docs/DATA_APPROVAL_BLOCKERS.md`). |
| ImageKit account/credentials | Official `@imagekit/next` SDK installed and wired (`ImageKitProvider` in the root layout, `ImageKitImage` component using the SDK's `<Image>`) — code is complete; `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` is the only thing unset | Needs a real ImageKit account from the client |
| FeelStack CMS endpoint/site key | Adapter fully built — `src/lib/feelstack/client.ts` (typed, timeout+retry, Zod-validated, fails closed to local content), `src/lib/feelstack/fallback.ts`, and the HMAC-verified `/api/feelstack/revalidate` webhook (`src/lib/security/hmac.ts`) all exist and typecheck/build cleanly | Needs a real FeelStack API URL, site key, and revalidation secret — every real page on the site is still driven by `src/content/*.ts`, not FeelStack, until then |
| Aesthetic treatment pricing | Not shown (`aestheticPricingEnabled: false`) | Only uninsured *medical* fees were supplied — no separate aesthetics-treatment price list beyond the now-imported SkinMedica product prices |
| Before/after photography | Not shown (`beforeAfterEnabled: false`) | None supplied; brief explicitly forbids fabricating this |
| Medical Botox hub + migraine/bruxism-tmj/hyperhidrosis detail pages (`/medical/botox/*`) | Route + typed data (`src/content/medical-botox.ts`) + template built; gated behind `medicalBotoxDetailPagesEnabled` | The only source content for each condition individually already lives in full on `/botox` and summarized on `/medical` — splitting it three ways would be duplicate content, not three unique pages |
| Cosmetic Botox (`/aesthetics/treatments/cosmetic-botox`) | Route + typed data (`src/content/treatments.ts` `gatedTreatments`) + template built; gated behind `cosmeticBotoxTreatmentPageEnabled` | Its only source content is the treatment-area list already live on `/botox` |
| Skin Tightening (`/aesthetics/treatments/skin-tightening`) | Route + typed data + template built; gated behind `skinTighteningTreatmentPageEnabled` | Its only source content *is* the Radio Frequency/TempSure page — "skin tightening" is that treatment's stated function, not a distinct procedure |
| Health Hub articles (`/health-hub/[articleId]`) | Type model (`src/types/article.ts`), template (`HealthHubArticleTemplate`), and dynamic route built; `src/content/health-hub-articles.ts` is an empty array | No article copy has been drafted or medically reviewed |
| Aesthetics pricing (`/aesthetics/pricing`) | Type model (`src/types/pricing.ts`), template, and route built; gated behind `aestheticPricingEnabled` | No approved aesthetics-treatment price list supplied (distinct from the SkinMedica *product* prices, which are imported and live at `/shop` behind `shopEnabled`) |
| Consultation request (`/aesthetics/consultation`) | Full Zod-validated form + server action + route built; gated behind `consultationFormEnabled` | No approved consultation-intake flow supplied |
| Before & After (`/aesthetics/before-after`) | Route + gallery slot built; gated behind `beforeAfterEnabled` | No approved before/after photography supplied |
| Legal pages — Terms, Privacy, Accessibility, Medical Disclaimer | Route (`/[locale]/[legalPageId]`), template, and typed model built for all 4; gated behind `legalPagesEnabled`, and each individually 404s even if the flag were flipped on because `body` is empty | Legacy copy is literally "Coming soon" — brief §25 explicitly forbids publishing that; real legal copy needs drafting/approval |
| Shop — cart, checkout, shipping & returns only (the catalogue hub, category/concern pages, and all 23 product detail pages are **live** as of the "COMPLETE SKINMEDICA NAVIGATION AND PRODUCT-DETAIL FLOW" pass — see `docs/DATA_APPROVAL_BLOCKERS.md`, no longer listed here as missing) | Commerce adapter interface (`src/lib/commerce/adapter.ts`, ready for a real Shopify/Stripe implementation) and the 3 stub pages are built; gated behind a **separate** `shopCheckoutEnabled` flag (`false`) so the live catalogue never exposes them | No real payment/cart/shipping is implemented or approved — these stay disabled regardless of `shopEnabled` until a payment provider and an approved shipping/returns policy exist. Remaining photography blocker (SkinMedica bottle shots) is cosmetic only — every live product page already renders correctly through the approved Facet Tile placeholder. |
| Newsletter signup | Component built (`NewsletterSignup`), self-gating on `newsletterEnabled`, not placed on any page yet | Not requested in supplied source; no email-list provider configured |
| Health Hub articles | Hub page exists, no articles | No approved article copy or medical reviewer assignment supplied |
| Legal pages (Terms, Privacy, Accessibility, Medical Disclaimer) | Not built, not routed | Legacy site shows literal "Coming soon" for Terms/Privacy — brief §25 explicitly forbids publishing that; real legal copy must be drafted/approved first |
| Shop / products | Not shown (`shopEnabled: false`) | Catalogue data is approved and imported; blocked on product photography only — see the row above |
| Consultation-request form | Not shown (`consultationFormEnabled: false`) | No approved flow supplied |
| Newsletter signup | Not shown (`newsletterEnabled: false`) | Not requested in supplied source |
| Contact form delivery (email/CRM) | Validates + rate-limits, but delivery fails closed with a "please call us" fallback | No `CONTACT_DELIVERY_PROVIDER` credentials supplied — see `src/lib/forms/contact-delivery.ts` |
| Careers application delivery | `mailto:` link only | No file-upload/ATS integration supplied; brief's "Name/Phone/Email/Resume + reCAPTCHA" form not yet built |
| Day-by-day clinic hours | Only "open today" hours were in the source (08:00–19:00 medical, 09:00–17:00 aesthetics); `src/config/clinic-hours.ts` applies these Mon–Fri and treats Sat/Sun as closed by assumption | Needs a real day-by-day schedule from the client, including whether Sat/Sun are actually closed |
| Primary Care Network / Clinic Policies detail sub-pages | Redirected to the Patient Resources hub, which already contains this content inline, rather than dedicated sub-pages | Content exists (used in the hub); dedicated URLs are a nice-to-have once the hub outgrows one page |

## Process followed for every row above

1. Build the reusable component (done in every case above).
2. Build the typed bilingual data structure (done — `src/types/*`, `src/config/*`).
3. Hide the incomplete feature via `src/config/features.ts` or simply not registering the route.
4. Record it here.
5. Continue with the rest of the project — followed throughout this build.
