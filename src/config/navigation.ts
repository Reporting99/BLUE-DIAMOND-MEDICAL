import { getRoute, href } from "@/lib/routing";
import { gatedTreatments } from "@/features/aesthetics/data/treatments";
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
 * inside the mega menu of the half it belongs to.
 *
 * A LATER PASS then made Aesthetics concern-first. Its menu is now two groups,
 * TREATMENTS and TECHNOLOGIES, where the Treatments group lists patient
 * concerns rather than devices — see the comment on `treatmentsColumn`. The
 * device pages it used to list are still live at their own URLs; they moved out
 * of the menu, not off the site.
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
  headingKey: "treatments" | "technologies" | "medical" | "uninsuredServices";
  links: NavMenuLink[];
  /**
   * Render this column's links in two sub-columns where there is room.
   * For a long list (the 13-row Aesthetics Treatments column) a single stack
   * runs past the fold on a laptop; splitting it keeps the whole menu
   * scannable at a glance. Ignored on mobile, which is a single stack anyway.
   */
  split?: boolean;
  /** Optional "View all …" row rendered under the column. */
  viewAll?: { routeId: string; labelKey: "viewAllTreatments" | "viewAllTechnologies" | "viewAllMedical" };
}

export interface PrimaryNavLink {
  id: string;
  labelKey: "home" | "medical" | "aesthetics" | "ourTeam" | "about" | "contact";
  /** The item is ALWAYS a real link, even when it also opens a menu. */
  routeId: string;
  /** Present => this item opens a mega menu on hover/focus. */
  columns?: NavMenuColumn[];
}

/**
 * THE AESTHETICS "TREATMENTS" COLUMN IS THE PATIENT-CONCERN LIST.
 *
 * Aesthetics used to offer two competing navigation systems side by side: a
 * Treatments column naming devices and procedures (RF Microneedling, Radio
 * Frequency, Ultra Treatment, PRP …) and a Concerns column naming patient
 * problems (Acne Scars, Skin Laxity …). Both led into the same catalogue, and
 * the visitor had to guess which vocabulary the site wanted from them — while
 * almost everyone arrives knowing the problem, not the device.
 *
 * There is now one journey: PATIENT PROBLEM -> TREATMENT OPTIONS -> TECHNOLOGY.
 * This column lists what a visitor wants treated, straight from the concern
 * registry rather than a hand-typed list, so a concern cannot exist as a page
 * and be missing from the menu. The device pages are still live and indexed at
 * their own URLs; they are reached from the concern page that recommends them
 * (`getTreatmentsForConcern`) or from their technology page, not from here.
 *
 * Cosmetic Botox is the deliberate exception, appended last: no approved source
 * files it under a single concern, so filing it under one would be an invented
 * indication and hiding it would make it undiscoverable. It stays a standalone
 * row pointing at the live Botox hub, which is where its approved content is.
 */
const treatmentsColumn: NavMenuColumn = {
  id: "aesthetics-treatments",
  headingKey: "treatments",
  links: [
    ...concerns.map((c) => ({ id: c.id, routeId: `concern-${c.id}` })),
    cosmeticBotoxLink(),
  ],
  // 13 rows is too tall for one menu column; the freed space left by the
  // removed Concerns column is spent widening this one into two.
  split: true,
  viewAll: { routeId: "aesthetics-treatments-hub", labelKey: "viewAllTreatments" },
};

/**
 * Cosmetic Botox is a `gatedTreatment`: its approved source content is not
 * unique to it (it duplicates the Botox hub — see treatments.ts and
 * docs/CONTENT_MODEL.md), so the menu shows its approved display name but
 * points at the real live page that already carries that content, instead of a
 * thin duplicate.
 */
function cosmeticBotoxLink(): NavMenuLink {
  const g = gatedTreatments.find((x) => x.id === "cosmetic-botox");
  if (!g) throw new Error('src/config/navigation.ts: gated treatment "cosmetic-botox" is missing');
  return { id: g.id, label: g.title, routeId: "botox-hub" };
}

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
 * Medicine, Vaccination, Mental Health, Women's Health — CL-023 removed
 * the onsite-paediatrician claim from that list) are deliberately NOT in this menu: they are rendered as a labelled
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
    columns: [treatmentsColumn, technologiesColumn],
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
