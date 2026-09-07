import { resolveSiteUrl } from "./site-url";

/**
 * Central clinic facts. Every component/schema/doc must read from here —
 * never hardcode address, phone, fax, domain, or social links elsewhere.
 *
 * `url`/`domain` are the deployment's configured public origin and resolve to
 * "" when none is set — they are NOT constants. Everything else in this file
 * is an approved, verified clinic fact.
 *
 * Source: Blue-Diamond-Medical-Website-Content-Extraction_1.docx
 * (approved content extraction of the two live legacy sites).
 * See docs/CONTENT_MODEL.md for provenance of every field.
 */

export const siteConfig = {
  name: "Blue Diamond Medical",
  legalName: "Blue Diamond Medical Clinic",

  /**
   * The public origin, or "" when none is configured.
   *
   * A GETTER, not a literal. It used to be the string
   * "https://bluediamondmedical.ca", which made every canonical, hreflang, OG
   * and JSON-LD URL in the app assert a production identity that no operator
   * had configured — the hard-coded production domain this pass removes. The
   * value now comes from SITE_URL (see src/config/site-url.ts) and is read
   * per access, so robots.txt and sitemap.xml — which run at request time —
   * always reflect the running configuration.
   *
   * The empty-string fallback is deliberate and load-bearing: the ~30 call
   * sites that build URLs as `${siteConfig.url}${path}` degrade to a
   * ROOT-RELATIVE path rather than to a fabricated absolute one. Callers for
   * which a relative value would be wrong (canonical, hreflang, Open Graph
   * `url`, sitemap entries) must check `siteUrlIsConfigured()` and omit the
   * field instead — never substitute a host of their own.
   */
  get url(): string {
    return resolveSiteUrl() ?? "";
  },

  /** Bare hostname of the configured origin, or "" — same rules as `url`. */
  get domain(): string {
    const url = resolveSiteUrl();
    return url ? new URL(url).hostname : "";
  },

  defaultLocale: "en",
  locales: ["en", "ar"] as const,

  /** Primary clinic — family medicine, walk-in, medical Botox. */
  clinic: {
    name: "Blue Diamond Medical Clinic",
    address: {
      line1: "23-8 Weston Drive SW",
      city: "Calgary",
      region: "AB",
      postalCode: "T3H 5P2",
      country: "CA",
      neighborhood: "West Springs",
    },
    phone: "+18254131113",
    phoneDisplay: "+1 (825) 413-1113",
    fax: "+15874430394",
    faxDisplay: "+1 (587) 443-0394",
    openedOn: "2022-07-04",
    foundedBy: "Dr. Mohamed Farhat",
    timezone: "America/Edmonton", // Calgary, MST/MDT
  },

  /**
   * Aesthetics is delivered from the same clinic address, and reached on the
   * same clinic telephone line.
   *
   * The legacy bluediamondmedicalaesthetics.ca site listed a separate
   * reception line, (403) 247-1418, which this file previously preserved as a
   * "genuinely different" number. The 2026-09-07 English content audit
   * retired it: the client's approved instruction names 825-413-1113 as the
   * established clinic telephone number and lists 403-247-1418 among the
   * outdated facts that must not be reintroduced. It is Blue Diamond's own
   * decommissioned line, not a partner's — Euclid Telehealth's
   * 1-800-511-5661 is the only genuinely third-party number on the site, and
   * it is held separately.
   *
   * This matters more than one card: `primaryLocation` in config/locations.ts
   * reads these fields, so the homepage location card, its map pin, and its
   * phone CTA were all publishing the retired number against the West Springs
   * address. The aesthetics identity is kept as its own entry (the brand and
   * fax presentation still differ); only the telephone now resolves to the
   * clinic line.
   */
  aesthetics: {
    name: "Blue Diamond Medical Aesthetics",
    phone: "+18254131113",
    phoneDisplay: "(825) 413-1113",
    fax: "+15874430394",
    // Formatted as the approved aesthetics location card prints it — no "+1"
    // prefix, matching phoneDisplay above. Same fax line as the medical
    // clinic; only the presentation differs per card.
    faxDisplay: "(587) 443-0394",
  },

  /** Elite iQ™ laser treatments are performed off-site, not at the main clinic. */
  eliteIQLocation: {
    name: "Citizen Studio",
    address: {
      line1: "45 Greenbriar Dr NW",
      city: "Calgary",
      region: "AB",
      postalCode: "T3B 5N4",
      country: "CA",
    },
  },

  social: {
    facebook: "https://facebook.com/bluediamondmedical",
    instagram: "https://instagram.com/bludiamondmedical",
  },

  careersEmail: "accountant@bluediamondmedical.ca",
} as const;
