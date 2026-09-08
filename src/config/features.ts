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
  // The /shop catalogue — browsing, category/concern listings, product detail
  // pages and the enquiry route. Live. Controls browsing/detail/enquiry only:
  // cart/checkout stay separately gated below regardless of this flag
  // (brief: "Do not activate... Cart. Checkout.").
  shopEnabled: true,
  // SkinMedica — ARCHIVED 2026-09-07. Blue Diamond stopped carrying the line
  // and now carries Myriade only, so its 23 client-approved records do not
  // publish: no /shop cards, no detail pages, no route-registry entries, no
  // sitemap rows, and the brand is absent from /shop's own copy and metadata.
  //
  // Off, not deleted, because the instruction was that the line is stopped
  // "currently". Every record — exact names, prices, sizes, bilingual detail
  // copy, FAQs and per-claim sources — is preserved verbatim in
  // src/features/products/archive/skinmedica.ts and validated by
  // tests/unit/skinmedica-catalogue.spec.ts, so bringing the line back is
  // this one flag plus a deploy, with nothing rewritten and no research
  // repeated. The 23 retired product URLs 301 to /shop while it is false —
  // src/lib/routing/moved-routes.ts, which derives them from the archive so
  // the redirect table cannot drift from it.
  //
  // Flipping this to true republishes the line and, by construction, drops
  // those 301s, restores the seven SkinMedica-only categories, and re-adds
  // the brand to the hub's derived description. Nothing else to change.
  skinMedicaEnabled: false,
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
