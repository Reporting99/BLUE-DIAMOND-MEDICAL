import { getRoute, href } from "@/config/routes";
import { treatments, gatedTreatments } from "@/content/treatments";
import type { Locale } from "@/i18n/config";

/**
 * Single authoritative primary-navigation definition — "FINAL MANDATORY
 * NAVIGATION" brief. Every entry resolves to a route id that already
 * exists in src/config/routes.ts; this file never invents a new route,
 * it only decides which existing routes appear in the header/mobile menu
 * and in what order. Header.tsx and MobileNav.tsx both read from this one
 * list so there is exactly one navigation hierarchy, never two.
 *
 * Nav labels are intentionally distinct from each destination's own page
 * <title>/H1 — see src/i18n/dictionaries/{en,ar}.ts `nav` — matching the
 * brief's own example ("The navigation label may be 'Medical Care' ... but
 * it must link to /en/medical/").
 */
export interface PrimaryNavLink {
  id: string;
  labelKey: "home" | "services" | "medicalAesthetics" | "ourTeam" | "about" | "contact";
  routeId: string;
}

/**
 * "Services" -> the existing, fully-built canonical Medical Services hub
 * (`medical-hub`, /en/medical/). The brief's own worked example uses
 * "/en/services/" as an illustrative URL, but brief §4 is explicit: "Use
 * the existing canonical route map. Do not invent duplicate routes when an
 * approved canonical route already exists." /en/medical/ already satisfies
 * every literal requirement of the Services page section (real, public,
 * organized, non-gated, 200) — creating a second, parallel /en/services/
 * hub would itself be the forbidden duplicate route. Documented, not
 * silently guessed — see docs/ARCHITECTURE.md.
 */
export const primaryNavLinks: PrimaryNavLink[] = [
  { id: "nav-home", labelKey: "home", routeId: "home" },
  { id: "nav-services", labelKey: "services", routeId: "medical-hub" },
  // "treatments" is handled separately below (interactive dropdown, not a
  // plain link) — deliberately not listed here.
  { id: "nav-medical-aesthetics", labelKey: "medicalAesthetics", routeId: "aesthetics-hub" },
  { id: "nav-our-team", labelKey: "ourTeam", routeId: "doctors-index" },
  { id: "nav-about", labelKey: "about", routeId: "about" },
  { id: "nav-contact", labelKey: "contact", routeId: "contact" },
];

export interface TreatmentsMenuItem {
  id: string;
  title: { en: string; ar: string };
  /** Real, live route id — never a gated or 404 destination. */
  routeId: string;
}

/**
 * The Treatments dropdown — brief §6/§7. "Cosmetic Botox" and "Skin
 * Tightening" are on the brief's required list, but each one's only
 * approved source content already lives on an existing live page rather
 * than being unique detail of its own (documented in
 * src/content/treatments.ts `gatedTreatments` and
 * docs/CONTENT_MODEL.md: Cosmetic Botox duplicates the Botox hub,
 * Skin Tightening duplicates Radio Frequency/TempSure). Per brief §7's own
 * rule — "never link to a gated page" — and the master brief's standing
 * "do not create duplicate pages for the same intent," both items are
 * included with their approved display name but point at the real live
 * page that already carries their approved content, instead of a new thin
 * duplicate page. Every href below resolves through getRoute(), so a
 * broken/gated target fails typecheck or the route-registry tests, not
 * silently at runtime.
 */
export const treatmentsMenuItems: TreatmentsMenuItem[] = [
  {
    id: "cosmetic-botox",
    title: gatedTreatments.find((t) => t.id === "cosmetic-botox")!.title,
    routeId: "botox-hub",
  },
  {
    id: "rf-microneedling",
    title: treatments.find((t) => t.id === "rf-microneedling")!.title,
    routeId: "treatment-rf-microneedling",
  },
  {
    id: "laser-hair-removal",
    title: treatments.find((t) => t.id === "laser-hair-removal")!.title,
    routeId: "treatment-laser-hair-removal",
  },
  {
    id: "laser-skin-treatments",
    title: treatments.find((t) => t.id === "laser-skin-treatments")!.title,
    routeId: "treatment-laser-skin-treatments",
  },
  {
    id: "radio-frequency",
    title: treatments.find((t) => t.id === "radio-frequency")!.title,
    routeId: "treatment-radio-frequency",
  },
  {
    id: "skin-tightening",
    title: gatedTreatments.find((t) => t.id === "skin-tightening")!.title,
    routeId: "treatment-radio-frequency",
  },
  {
    id: "ultra",
    title: treatments.find((t) => t.id === "ultra")!.title,
    routeId: "treatment-ultra",
  },
  {
    id: "prp-hair-restoration",
    title: treatments.find((t) => t.id === "prp-hair-restoration")!.title,
    routeId: "treatment-prp-hair-restoration",
  },
  {
    id: "prp-skin-rejuvenation",
    title: treatments.find((t) => t.id === "prp-skin-rejuvenation")!.title,
    routeId: "treatment-prp-skin-rejuvenation",
  },
  {
    id: "tempsure-vitalia",
    title: treatments.find((t) => t.id === "tempsure-vitalia")!.title,
    routeId: "treatment-tempsure-vitalia",
  },
];

export const treatmentsHubRouteId = "aesthetics-treatments-hub";

/** Full locale-prefixed href for a primary nav link. */
export function primaryNavHref(link: PrimaryNavLink, locale: Locale): string {
  return href(link.routeId, locale);
}

export function treatmentsMenuHref(item: TreatmentsMenuItem, locale: Locale): string {
  return href(item.routeId, locale);
}

/** Throws at module-load time (build) if any referenced route id is missing
 * — fails loudly instead of a silent runtime 404. */
function assertRouteExists(routeId: string, context: string) {
  if (!getRoute(routeId)) {
    throw new Error(`src/config/navigation.ts: unknown route id "${routeId}" (${context})`);
  }
}
for (const link of primaryNavLinks) assertRouteExists(link.routeId, `primaryNavLinks: ${link.id}`);
assertRouteExists(treatmentsHubRouteId, "treatmentsHubRouteId");
for (const item of treatmentsMenuItems) assertRouteExists(item.routeId, `treatmentsMenuItems: ${item.id}`);
