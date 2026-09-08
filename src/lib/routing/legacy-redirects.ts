import { features } from "@/config/features";

/**
 * Where a legacy SkinMedica product page should land.
 *
 * SkinMedica was archived on 2026-09-07 (src/config/features.ts), which
 * removed all 23 product routes. Left pointing at `/en/shop/<slug>` these
 * seven 301s would have chained — legacy URL -> retired product URL ->
 * /en/shop — and this table's whole contract is one hop to a live 200
 * (docs/ROUTING.md, tests/redirects). Reading the flag keeps them single-hop
 * in BOTH states: straight to the hub now, straight back to each product the
 * day the line returns.
 */
const skinMedicaProduct = (slug: string): string =>
  features.skinMedicaEnabled ? `/en/shop/${slug}` : "/en/shop";

/**
 * Direct 301 redirect map for every legacy URL — brief §33. Consumed by
 * src/proxy.ts. Kept as a flat exact-match table (no chains, no wildcard
 * regex) so each entry is auditable and testable 1:1 — see
 * docs/ROUTING.md and tests/redirects.
 *
 * Only routes that exist in src/config/routes.ts today are targeted here;
 * entries whose destination page isn't built yet point at the closest
 * live parent hub instead of a 404, and are flagged in
 * docs/ROUTING.md for retargeting once the child page ships.
 */
export const legacyRedirects: Record<string, string> = {
  // bluediamondmedical.ca (primary legacy site)
  "/appointment-1": "/en/book-appointment",
  "/services": "/en/medical",
  "/our-team": "/en/our-team",
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
  "/about-skinmedica-products/f/lumivivetm-system": skinMedicaProduct("lumivive-system-day-night"),
  "/about-skinmedica-products/f/lytera®-20-pigmentbrightening-serum": skinMedicaProduct("lytera-2-pigment-brightening-serum"),
  "/about-skinmedica-products/f/tns®-eye-repair": skinMedicaProduct("tns-eye-repair"),
  "/about-skinmedica-products/f/total-defense-repair-spf-34---tinted": skinMedicaProduct("total-defence-repair-spf-34-clear"),
  "/about-skinmedica-products/f/total-defense-repair-spf-34---tinted-1": skinMedicaProduct("total-defence-repair-spf-34-tinted"),
  "/about-skinmedica-products/f/dermal-repair-cream": skinMedicaProduct("dermal-repair-cream"),
  "/about-skinmedica-products/f/ahabha-exfoliating-cleanser": skinMedicaProduct("aha-bha-exfoliating-cleanser"),

  // bluediamondmedicalaesthetics.ca — cannot be caught by this app's own
  // proxy (different host), documented for DNS/hosting-level redirect
  // configuration in docs/DEPLOYMENT.md. Listed here too so
  // the same table can drive that documentation and stay in sync.
  "/treatments": "/en/aesthetics/treatments",
  "/area-concern": "/en/aesthetics/treatments",
  "/laser-hair-removal": "/en/aesthetics/treatments/laser-hair-removal",
  "/laser-treatment-1": "/en/aesthetics/treatments/laser-skin-treatments",
  "/radio-frequency": "/en/aesthetics/treatments/radio-frequency",
  "/rf-micro-needeling": "/en/aesthetics/treatments/rf-microneedling",
  "/ultra-treatment": "/en/aesthetics/treatments/ultra",
  "/prp-therapy": "/en/aesthetics/treatments/prp-skin-rejuvenation",
  "/our-technologies": "/en/aesthetics/technologies",
  // The legacy concern pages point INTO /aesthetics/treatments, not
  // /aesthetics/concerns: skin concerns became the Treatments entry points
  // themselves when the Aesthetics IA turned concern-first. Re-pointed at the
  // new URL rather than left aimed at the old one, so these stay single-hop —
  // src/lib/routing/moved-routes.ts explains the move and catches anyone still
  // arriving at the in-app URL these used to target.
  "/acne-scar-removal": "/en/aesthetics/treatments/acne-scars",
  "/rosacea-abatement": "/en/aesthetics/treatments/rosacea-redness",
  "/dry-skin-remediation": "/en/aesthetics/treatments/dry-skin",
  "/fineline-and-wrinkle": "/en/aesthetics/treatments/fine-lines-wrinkles",
  "/non-invasive-skin": "/en/aesthetics/treatments/skin-laxity",
  "/spider-vein": "/en/aesthetics/treatments/spider-veins",
  "/sun-damage": "/en/aesthetics/treatments/sun-damage-pigmentation",
  "/skin-revitalization": "/en/aesthetics/treatments/skin-revitalization",
  "/razor-bumps": "/en/aesthetics/treatments/razor-bumps",
  // Point at the real final canonical route, not an unrelated live page.
  // Both still resolve through the gated-route 404 boundary until
  // legalPagesEnabled flips true (real copy withheld — see
  // docs/CONTENT_MODEL.md and docs/CONTENT_MODEL.md),
  // which is more honest than landing a visitor looking for legal terms
  // on an unrelated aesthetics marketing page.
  "/terms-and-conditions": "/en/terms",
  "/privacy-policy": "/en/privacy-policy",
  // Found via a live sitemap.xml crawl of bluediamondmedicalaesthetics.ca
  // (brief §3 mandatory discovery) — absent from the DOCX-derived minimum
  // inventory. Page fetched directly: real content about pelvic-floor and
  // vaginal-tightening RF treatment, which is exactly the approved
  // TempSure Vitalia treatment content already published at this target
  // (src/features/aesthetics/data/treatments.ts `tempsure-vitalia`) — not a duplicate page.
  "/vitalia": "/en/aesthetics/treatments/tempsure-vitalia",
  // GoDaddy Website Builder's auto-generated "Online Store" module page
  // (sitemap.ols.xml) — generic platform SEO boilerplate, not unique
  // editorial content; closest live equivalent is the shop catalogue.
  "/ols/products": "/en/shop",
};
