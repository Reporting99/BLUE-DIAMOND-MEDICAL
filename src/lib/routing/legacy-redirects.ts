import { routes } from "@/config/routes";

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


/**
 * CANONICAL ROUTE RENAMES — distinct from the legacy table above, and kept
 * separate on purpose.
 *
 * `legacyRedirects` maps URLs from the *old third-party sites* onto this
 * build. This maps URLs this build itself used to serve. Both are exact-match
 * 301s, but they have different lifetimes and different review rules, and
 * `tests/redirects/legacy-redirects.spec.ts` asserts every row of the legacy
 * table lands on a pathname it can compare literally — which an Arabic
 * destination cannot satisfy, because `new URL(...).pathname` returns it
 * percent-encoded. Mixing the two would have meant weakening that assertion
 * for all forty-odd legacy rows to accommodate six Arabic ones.
 *
 * WHY EXACT MATCH IS LOAD-BEARING HERE. A prefix rule for `/doctors` would
 * swallow `/doctors/mohamed-farhat` and send all six member pages to the
 * index. Twenty-four of the twenty-eight keys below sit underneath one of the
 * four index keys, so this is the common case, not an edge case. Every lookup
 * against this table is a whole-pathname equality test.
 *
 * FOUR FORMS PER ROUTE, because a visitor can arrive at any of them:
 *   /doctors/x            bare, before proxy.ts prefixes a locale. Listed so
 *                         it resolves in ONE hop; without it the request 301s
 *                         to /en/doctors/x and then 301s again, and a chain is
 *                         the thing this table exists to avoid.
 *   /en/doctors/x         the English canonical this build used to publish.
 *   /ar/doctors/x         the Latin slug under /ar, which proxy.ts used to
 *                         redirect to the Arabic canonical.
 *   /ar/الأطباء/x         the Arabic canonical this build used to publish.
 *
 * The OLD paths are written out because they now exist nowhere else in the
 * repository. The NEW paths are read from the route registry rather than
 * repeated, so a later move of this family cannot leave the redirects behind.
 */
const RENAMED_ROUTE_FAMILY: ReadonlyArray<{
  routeId: string;
  oldEn: string;
  oldAr: string;
}> = [
  { routeId: "doctors-index", oldEn: "/doctors", oldAr: "/الأطباء" },
  { routeId: "doctor-farhat", oldEn: "/doctors/mohamed-farhat", oldAr: "/الأطباء/محمد-فرحات" },
  { routeId: "doctor-saeed", oldEn: "/doctors/omaima-saeed", oldAr: "/الأطباء/أميمة-سعيد" },
  { routeId: "doctor-hamdi", oldEn: "/doctors/reem-hamdi", oldAr: "/الأطباء/ريم-حمدي" },
  { routeId: "doctor-omonijo", oldEn: "/doctors/omonijo", oldAr: "/الأطباء/أومونيجو" },
  { routeId: "doctor-bakare", oldEn: "/doctors/bakare", oldAr: "/الأطباء/باكاري" },
  { routeId: "doctor-gwea", oldEn: "/doctors/ahmed-gwea", oldAr: "/الأطباء/أحمد-جويع" },
];

export const renamedRouteRedirects: Record<string, string> = Object.fromEntries(
  RENAMED_ROUTE_FAMILY.flatMap(({ routeId, oldEn, oldAr }) => {
    const route = routes.find((r) => r.id === routeId);
    if (!route) {
      // A rename row naming a route that no longer exists would silently stop
      // redirecting. Fail the build instead — this module is imported by
      // proxy.ts, so it is evaluated on every cold start.
      throw new Error(`legacy-redirects.ts: RENAMED_ROUTE_FAMILY references unknown route id "${routeId}"`);
    }
    const en = `/en${route.path.en}`;
    const ar = `/ar${route.path.ar}`;
    return [
      [oldEn, en],
      [`/en${oldEn}`, en],
      [`/ar${oldEn}`, ar],
      [`/ar${oldAr}`, ar],
    ] as const;
  }),
);
