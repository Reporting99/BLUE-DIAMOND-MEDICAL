/**
 * Centralized feature flags — see docs/UI_UX_FOUNDATION.md and
 * docs/CONTENT_MODEL.md for why each disabled flag is off.
 *
 * A disabled feature must:
 *  - be hidden from navigation
 *  - be excluded from the sitemap (src/app/sitemap.ts filters on this file)
 *  - be excluded from indexing and unreachable (the route calls notFound())
 *  - never render an empty "Coming soon" page
 *
 * Route entries with a `requiresFeature` key (src/config/routes.ts) are
 * technically fully built — registry entry, typed bilingual content model,
 * reusable template — but their page component checks the corresponding
 * flag here and calls notFound() while it's false. This lets each gap be
 * closed later by flipping one flag, not by writing new code.
 */
export const features = {
  // SkinMedica brand + product data (all 23 client-approved SKUs, exact
  // names/prices/sizes, full bilingual detail content, FAQs, and sources)
  // is imported (src/features/products/data.ts) and validated
  // (tests/unit/skinmedica-catalogue.spec.ts). Published live per the
  // "COMPLETE SKINMEDICA NAVIGATION AND PRODUCT-DETAIL FLOW" brief's
  // explicit instruction to ship with the approved neutral placeholder
  // until real photography exists, rather than keep the whole catalogue
  // gated on photography — see docs/MEDIA.md and
  // docs/CONTENT_MODEL.md for the still-missing packshots.
  // Controls browsing/detail/enquiry only — cart/checkout stay separately
  // gated below regardless of this flag (brief: "Do not activate...
  // Cart. Checkout.").
  shopEnabled: true,
  // Real payment/cart/checkout is not implemented and not approved —
  // deliberately a *separate* flag from shopEnabled so flipping shop
  // browsing on never exposes the bare placeholder cart/checkout/
  // shipping-returns stub pages.
  shopCheckoutEnabled: false,
  newProductBrandEnabled: false,
  // Published from the client-approved pricing workbook
  // (BLUE_DIAMOND_AESTHETIC_PRICING_APPROVED_2026-08-23.xlsx) plus the
  // client approval email of the same date — GAP-003, resolved. 78 of the
  // 81 rows publish; the 3 ampoule add-ons stay publicDisplay:false behind
  // GAP-014 (clinician review), enforced in the data file, not here.
  // See docs/APPROVED_AESTHETIC_PRICING_MATRIX.md. Flipping this to false
  // withdraws the entire price list — pricing index and every per-treatment
  // pricing block — in one move.
  aestheticPricingEnabled: true,
  // The 14 recovered pairs are imported to /blue-diamond/before-after/ and
  // approved. They are manufacturer clinical collateral, not Blue Diamond
  // patient photography, and every gallery says so — see
  // docs/BEFORE_AFTER_SOURCE_AUDIT.md and tests/unit/before-after-provenance.
  beforeAfterEnabled: true,
  newsletterEnabled: false,
  careersFormEnabled: true, // "Join our Team" form is live on the legacy site
  consultationFormEnabled: false, // no approved consultation-request flow supplied yet
  legalPagesEnabled: false, // legacy Terms/Privacy are literal "Coming soon" placeholders
  // Would duplicate existing published content rather than add unique
  // detail — see docs/CONTENT_MODEL.md and docs/CONTENT_MODEL.md.
  cosmeticBotoxTreatmentPageEnabled: false,
  skinTighteningTreatmentPageEnabled: false,
  medicalBotoxDetailPagesEnabled: false, // migraine / bruxism-tmj / hyperhidrosis sub-pages
  healthHubArticlesEnabled: false, // template + model built, zero approved articles supplied yet
} as const;

export type FeatureFlags = typeof features;
