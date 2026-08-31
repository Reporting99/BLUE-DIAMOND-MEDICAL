import { getRoute, href } from "@/lib/routing";
import { treatments, gatedTreatments } from "@/features/aesthetics/data/treatments";
import { concerns } from "@/features/concerns/data";
import { technologies } from "@/features/technologies/data";
import { medicalServices } from "@/features/medical-services/data";
import type { Locale } from "@/i18n/config";

/**
 * Single authoritative primary-navigation definition — final IA brief §13,
 * §18, §19. Header.tsx and MobileNav.tsx both read from this one list, so
 * there is exactly one navigation hierarchy on desktop and on mobile,
 * never two that can drift apart.
 *
 * WHAT CHANGED IN THIS PASS AND WHY
 *
 * The previous top level was: Home, Services, Treatments (dropdown),
 * Medical Aesthetics, Our Team, About, Contact. That put a single
 * *aesthetic* category (Treatments) at the same level as the two whole
 * halves of the clinic, and labelled the medical half "Services", so a
 * visitor could not tell from the top level that Blue Diamond is one
 * brand with two care areas. §6/§10 of the brief make that split the
 * organising idea of the whole site, and §13 fixes the top level to:
 *
 *   HOME · MEDICAL · AESTHETICS · OUR TEAM · ABOUT · CONTACT
 *   (+ BOOK APPOINTMENT and EN | العربية, which live in Header.tsx)
 *
 * Everything that used to be top level is still one interaction away,
 * inside the mega menu of the half it belongs to. Nothing was removed and
 * no route was renamed — this file only decides which existing routes
 * appear where.
 *
 * Every href resolves through getRoute()/href(), and the assertions at the
 * bottom run at module load (i.e. at build time), so a nav entry pointing
 * at a route that does not exist fails the build rather than shipping a
 * silent 404.
 */

/** One link inside a mega-menu column. */
export interface NavMenuLink {
  id: string;
  routeId: string;
  /** Display name when it must differ from the route's own title. */
  label?: { en: string; ar: string };
}

/** One labelled column inside a mega menu. */
export interface NavMenuColumn {
  id: string;
  headingKey: "treatments" | "concerns" | "technologies" | "medical" | "uninsuredServices";
  links: NavMenuLink[];
  /** Optional "View all …" row rendered under the column. */
  viewAll?: { routeId: string; labelKey: "viewAllTreatments" | "viewAllConcerns" | "viewAllTechnologies" | "viewAllMedical" };
}

export interface PrimaryNavLink {
  id: string;
  labelKey: "home" | "medical" | "aesthetics" | "ourTeam" | "about" | "contact";
  /** The item is ALWAYS a real link, even when it also opens a menu. */
  routeId: string;
  /** Present => this item opens a mega menu on hover/focus. */
  columns?: NavMenuColumn[];
}

function treatmentLink(id: string): NavMenuLink {
  const t = treatments.find((x) => x.id === id);
  if (t) return { id, routeId: `treatment-${t.id}` };
  // Cosmetic Botox and Skin Tightening are `gatedTreatments`: their approved
  // source content is not unique to them (it duplicates the Botox hub and
  // Radio Frequency respectively — see treatments.ts and docs/CONTENT_MODEL.md),
  // so the menu shows their approved display name but points at the real live
  // page that already carries that content, instead of a thin duplicate.
  const g = gatedTreatments.find((x) => x.id === id);
  if (!g) throw new Error(`src/config/navigation.ts: unknown treatment id "${id}"`);
  return {
    id,
    label: g.title,
    routeId: id === "cosmetic-botox" ? "botox-hub" : "treatment-radio-frequency",
  };
}

const treatmentsColumn: NavMenuColumn = {
  id: "aesthetics-treatments",
  headingKey: "treatments",
  links: [
    treatmentLink("laser-hair-removal"),
    treatmentLink("laser-skin-treatments"),
    treatmentLink("rf-microneedling"),
    treatmentLink("radio-frequency"),
    treatmentLink("ultra"),
    treatmentLink("prp-hair-restoration"),
    treatmentLink("prp-skin-rejuvenation"),
    treatmentLink("tempsure-vitalia"),
    treatmentLink("cosmetic-botox"),
  ],
  viewAll: { routeId: "aesthetics-treatments-hub", labelKey: "viewAllTreatments" },
};

const concernsColumn: NavMenuColumn = {
  id: "aesthetics-concerns",
  headingKey: "concerns",
  // Straight from the concern registry rather than a hand-typed list, so a
  // concern can never exist as a page and be missing from the menu.
  links: concerns.map((c) => ({ id: c.id, routeId: `concern-${c.id}` })),
  viewAll: { routeId: "aesthetics-concerns-hub", labelKey: "viewAllConcerns" },
};

const technologiesColumn: NavMenuColumn = {
  id: "aesthetics-technologies",
  headingKey: "technologies",
  links: technologies.map((t) => ({ id: t.id, routeId: `technology-${t.id}` })),
  viewAll: { routeId: "aesthetics-technologies-hub", labelKey: "viewAllTechnologies" },
};

/**
 * The Medical mega menu — brief §18. The seven built medical-service pages
 * plus the medical Botox hub. The AHS-insured services that exist only as
 * approved list items and not as pages of their own (General Family
 * Medicine, Vaccination, Onsite Paediatrician, Mental Health, Women's
 * Health) are deliberately NOT in this menu: they are rendered as a labelled
 * list on the Medical hub itself, which is where their approved source
 * content actually is. A menu row has to lead somewhere real (§54: no dead
 * ends), and inventing five thin pages to fill out a menu would mean writing
 * medical copy that no approved source supports (§81).
 */
const medicalColumn: NavMenuColumn = {
  id: "medical-services",
  headingKey: "medical",
  links: [
    ...medicalServices.map((s) => ({ id: s.id, routeId: `medical-${s.id}` })),
    { id: "botox", routeId: "botox-hub" },
  ],
  viewAll: { routeId: "medical-hub", labelKey: "viewAllMedical" },
};

/** Uninsured services are grouped separately (brief §18, §33). */
const uninsuredColumn: NavMenuColumn = {
  id: "medical-uninsured",
  headingKey: "uninsuredServices",
  links: [{ id: "uninsured-fees", routeId: "medical-uninsured-services" }],
};

export const primaryNavLinks: PrimaryNavLink[] = [
  { id: "nav-home", labelKey: "home", routeId: "home" },
  { id: "nav-medical", labelKey: "medical", routeId: "medical-hub", columns: [medicalColumn, uninsuredColumn] },
  {
    id: "nav-aesthetics",
    labelKey: "aesthetics",
    routeId: "aesthetics-hub",
    columns: [treatmentsColumn, concernsColumn, technologiesColumn],
  },
  { id: "nav-our-team", labelKey: "ourTeam", routeId: "doctors-index" },
  { id: "nav-about", labelKey: "about", routeId: "about" },
  { id: "nav-contact", labelKey: "contact", routeId: "contact" },
];

/** Full locale-prefixed href for a primary nav link. */
export function primaryNavHref(link: PrimaryNavLink, locale: Locale): string {
  return href(link.routeId, locale);
}

export function navMenuLinkHref(item: NavMenuLink, locale: Locale): string {
  return href(item.routeId, locale);
}

export function navMenuLinkLabel(item: NavMenuLink, locale: Locale): string {
  if (item.label) return item.label[locale];
  return getRoute(item.routeId)!.title[locale];
}

/** Throws at module-load time (build) if any referenced route id is missing
 * — fails loudly instead of a silent runtime 404. */
function assertRouteExists(routeId: string, context: string) {
  if (!getRoute(routeId)) {
    throw new Error(`src/config/navigation.ts: unknown route id "${routeId}" (${context})`);
  }
}
for (const link of primaryNavLinks) {
  assertRouteExists(link.routeId, `primaryNavLinks: ${link.id}`);
  for (const column of link.columns ?? []) {
    for (const item of column.links) assertRouteExists(item.routeId, `${link.id} > ${column.id}: ${item.id}`);
    if (column.viewAll) assertRouteExists(column.viewAll.routeId, `${link.id} > ${column.id}: viewAll`);
  }
}
