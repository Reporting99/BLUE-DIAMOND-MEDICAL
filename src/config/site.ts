/**
 * Central clinic facts. Every component/schema/doc must read from here —
 * never hardcode address, phone, fax, domain, or social links elsewhere.
 *
 * Source: Blue-Diamond-Medical-Website-Content-Extraction_1.docx
 * (approved content extraction of the two live legacy sites).
 * See docs/CONTENT_MODEL.md for provenance of every field.
 */

export const siteConfig = {
  name: "Blue Diamond Medical",
  legalName: "Blue Diamond Medical Clinic",
  domain: "bluediamondmedical.ca",
  url: "https://bluediamondmedical.ca",
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
   * Aesthetics is delivered from the same clinic address for consultations;
   * the legacy bluediamondmedicalaesthetics.ca site listed a separate
   * reception line, which is preserved here as a distinct, genuinely
   * different phone number rather than merged away.
   */
  aesthetics: {
    phone: "+14032471418",
    phoneDisplay: "(403) 247-1418",
    fax: "+15874430394",
    faxDisplay: "+1 (587) 443-0394",
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

export type SiteConfig = typeof siteConfig;
