/**
 * Direct 301 redirect map for every legacy URL — brief §33. Consumed by
 * src/proxy.ts. Kept as a flat exact-match table (no chains, no wildcard
 * regex) so each entry is auditable and testable 1:1 — see
 * docs/REDIRECT_MAP.md and tests/redirects.
 *
 * Only routes that exist in src/config/routes.ts today are targeted here;
 * entries whose destination page isn't built yet point at the closest
 * live parent hub instead of a 404, and are flagged in
 * docs/REDIRECT_MAP.md for retargeting once the child page ships.
 */
export const legacyRedirects: Record<string, string> = {
  // bluediamondmedical.ca (primary legacy site)
  "/appointment-1": "/en/book-appointment",
  "/services": "/en/medical",
  "/our-team": "/en/doctors",
  "/medical-aesthetics-1": "/en/aesthetics",
  "/botox-1": "/en/botox",
  "/eye-examining": "/en/medical/eye-screening",
  // The legacy "Primary Care Network" page was about the Mosaic/CWC PCN
  // after-hours partnership — that content now lives on the after-hours
  // service page, not the general Patient Resources hub. Found and fixed
  // during route-tree validation (was pointing at an unrelated generic
  // page, same class of issue as the terms/privacy fix below).
  "/primary-care-network": "/en/medical/after-hours-care",
  "/clinic-policies": "/en/patient-resources", // correct — clinic-policy content is published inline on this hub, not a separate route
  "/join-our-team": "/en/careers",
  "/contact-us": "/en/contact",
  "/products": "/en/shop", // shop is live (shopEnabled: true) — resolves to a real 200 catalogue page

  // Found via a live sitemap.xml crawl of bluediamondmedical.ca (brief §3
  // mandatory discovery) — absent from the original DOCX-derived inventory,
  // not previously redirected, would otherwise 404.
  "/tempsure": "/en/aesthetics/technologies/tempsure",
  "/microneedling": "/en/aesthetics/treatments/rf-microneedling",
  // Legacy per-product landing pages under /about-skinmedica-products/f/ —
  // also found via the live sitemap crawl (sitemap.blog.xml). Page titles
  // were fetched directly to resolve the two ambiguous "tinted" slugs: the
  // legacy site's own URL slug for the Clear variant literally contains
  // the word "tinted" (a copy-paste artifact on their end, not ours) — its
  // <title> reads "TOTAL DEFENSE + REPAIR SPF 34 - Clear", confirmed
  // against the "-1" variant's <title> of "... - Tinted" before mapping.
  // Any further/undiscovered slug under this same prefix falls back to
  // `/en/shop` via the safety-net rule in src/proxy.ts rather than 404ing.
  "/about-skinmedica-products/f/lumivivetm-system": "/en/shop/lumivive-system-day-night",
  "/about-skinmedica-products/f/lytera®-20-pigmentbrightening-serum": "/en/shop/lytera-2-pigment-brightening-serum",
  "/about-skinmedica-products/f/tns®-eye-repair": "/en/shop/tns-eye-repair",
  "/about-skinmedica-products/f/total-defense-repair-spf-34---tinted": "/en/shop/total-defence-repair-spf-34-clear",
  "/about-skinmedica-products/f/total-defense-repair-spf-34---tinted-1": "/en/shop/total-defence-repair-spf-34-tinted",
  "/about-skinmedica-products/f/dermal-repair-cream": "/en/shop/dermal-repair-cream",
  "/about-skinmedica-products/f/ahabha-exfoliating-cleanser": "/en/shop/aha-bha-exfoliating-cleanser",

  // bluediamondmedicalaesthetics.ca — cannot be caught by this app's own
  // proxy (different host), documented for DNS/hosting-level redirect
  // configuration in docs/DEPLOYMENT.md. Listed here too so
  // the same table can drive that documentation and stay in sync.
  "/treatments": "/en/aesthetics/treatments",
  "/area-concern": "/en/aesthetics/concerns",
  "/laser-hair-removal": "/en/aesthetics/treatments/laser-hair-removal",
  "/laser-treatment-1": "/en/aesthetics/treatments/laser-skin-treatments",
  "/radio-frequency": "/en/aesthetics/treatments/radio-frequency",
  "/rf-micro-needeling": "/en/aesthetics/treatments/rf-microneedling",
  "/ultra-treatment": "/en/aesthetics/treatments/ultra",
  "/prp-therapy": "/en/aesthetics/treatments/prp-skin-rejuvenation",
  "/our-technologies": "/en/aesthetics/technologies",
  "/acne-scar-removal": "/en/aesthetics/concerns/acne-scars",
  "/rosacea-abatement": "/en/aesthetics/concerns/rosacea-redness",
  "/dry-skin-remediation": "/en/aesthetics/concerns/dry-skin",
  "/fineline-and-wrinkle": "/en/aesthetics/concerns/fine-lines-wrinkles",
  "/non-invasive-skin": "/en/aesthetics/concerns/skin-laxity",
  "/spider-vein": "/en/aesthetics/concerns/spider-veins",
  "/sun-damage": "/en/aesthetics/concerns/sun-damage-pigmentation",
  "/skin-revitalization": "/en/aesthetics/concerns/skin-revitalization",
  "/razor-bumps": "/en/aesthetics/concerns/razor-bumps",
  // Point at the real final canonical route, not an unrelated live page.
  // Both still resolve through the gated-route 404 boundary until
  // legalPagesEnabled flips true (real copy withheld — see
  // docs/MISSING_CONTENT_REPORT.md and docs/DATA_APPROVAL_BLOCKERS.md),
  // which is more honest than landing a visitor looking for legal terms
  // on an unrelated aesthetics marketing page.
  "/terms-and-conditions": "/en/terms",
  "/privacy-policy": "/en/privacy-policy",
  // Found via a live sitemap.xml crawl of bluediamondmedicalaesthetics.ca
  // (brief §3 mandatory discovery) — absent from the DOCX-derived minimum
  // inventory. Page fetched directly: real content about pelvic-floor and
  // vaginal-tightening RF treatment, which is exactly the approved
  // TempSure Vitalia treatment content already published at this target
  // (src/content/treatments.ts `tempsure-vitalia`) — not a duplicate page.
  "/vitalia": "/en/aesthetics/treatments/tempsure-vitalia",
  // GoDaddy Website Builder's auto-generated "Online Store" module page
  // (sitemap.ols.xml) — generic platform SEO boilerplate, not unique
  // editorial content; closest live equivalent is the shop catalogue.
  "/ols/products": "/en/shop",
};
