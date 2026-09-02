/**
 * Canonical, locale-independent location facts for the public location and
 * contact surfaces.
 *
 * WHY THIS EXISTS. The brief requires that English and Arabic render from a
 * SINGLE factual dataset — same business name, same addresses, same phone,
 * same fax, same map target — with only headings, labels and status strings
 * localized. Two locale dictionaries each carrying their own copy of an
 * address is exactly how a site ends up with a stale number in one language.
 * So the facts live here once, and both locales read them.
 *
 * Source of truth: the approved Blue Diamond Medical Aesthetics location
 * card (23-8 Weston Drive SW; (403) 247-1418; fax (587) 443-0394; Elite iQ™
 * performed off-site at Citizen Studio). Structured values are re-exported
 * from `siteConfig` rather than retyped, so this file never becomes a second
 * competing copy of the clinic facts.
 *
 * NOTE ON THE TWO PHONE LINES — docs/SOURCE_CONFLICT_REGISTER.md CONF-001.
 * Blue Diamond runs two genuinely different published lines: the medical /
 * walk-in line +1 (825) 413-1113 and the aesthetics line (403) 247-1418.
 * That register's approved resolution is to keep BOTH as distinct structured
 * facts and have each channel render the number matching it — not to merge
 * them. The aesthetics location card below is the aesthetics channel, so it
 * renders the 403 line. Do not "unify" it with the medical line.
 */

import { siteConfig } from "./site";

export interface LocationAddress {
  line1: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface CanonicalLocation {
  id: string;
  /** Business name, identical in every locale — a proper noun, never translated. */
  name: string;
  address: LocationAddress;
  /**
   * The address exactly as the approved source card breaks it over two lines.
   * Held explicitly rather than derived because the two approved cards use
   * different comma conventions ("Calgary AB, T3H 5P2" vs "Calgary, AB
   * T3B 5N4") and the brief pins both verbatim. One value, both locales.
   */
  displayLines: readonly [string, string];
  phone?: string;
  phoneDisplay?: string;
  fax?: string;
  faxDisplay?: string;
}

/**
 * PRIMARY location. Everything on the homepage location card — the map pin,
 * the "Get directions" button, the phone CTA — resolves to this and only
 * this.
 */
export const primaryLocation: CanonicalLocation = {
  id: "blue-diamond-medical-aesthetics",
  name: "Blue Diamond Medical Aesthetics",
  address: siteConfig.clinic.address,
  displayLines: ["23-8 Weston Drive SW", "Calgary AB, T3H 5P2"],
  phone: siteConfig.aesthetics.phone,
  phoneDisplay: siteConfig.aesthetics.phoneDisplay,
  fax: siteConfig.aesthetics.fax,
  faxDisplay: siteConfig.aesthetics.faxDisplay,
};

/**
 * SECONDARY location — Elite iQ™ treatments only. This is NOT the clinic.
 * It must never become the map's default pin or the target of the primary
 * "Get directions" action.
 */
export const eliteIQLocation: CanonicalLocation = {
  id: "citizen-studio",
  name: siteConfig.eliteIQLocation.name,
  address: siteConfig.eliteIQLocation.address,
  displayLines: ["45 Greenbriar Dr NW", "Calgary, AB T3B 5N4"],
};

/**
 * The string handed to the map provider for geocoding. Address only, with the
 * country spelled out — deliberately WITHOUT the business name, so the pin
 * resolves to the postal address itself rather than to whatever business
 * listing the provider happens to associate with that name.
 */
export function geocodeQuery(location: CanonicalLocation): string {
  const { line1, city, region, postalCode } = location.address;
  return `${line1}, ${city}, ${region} ${postalCode}, Canada`;
}

/**
 * Interactive embedded map centred on `location`, with a pin at the geocoded
 * address. Keyless: the provider resolves the address at request time, so no
 * coordinates are ever hand-entered here.
 */
export function mapEmbedUrl(location: CanonicalLocation): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(geocodeQuery(location))}&output=embed`;
}

/** Turn-by-turn directions to `location` (Google's documented Maps URL API). */
export function mapDirectionsUrl(location: CanonicalLocation): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(geocodeQuery(location))}`;
}

/** Single-line address, for schema and for anywhere a two-line block won't fit. */
export function formatAddress(location: CanonicalLocation): string {
  return location.displayLines.join(", ");
}
