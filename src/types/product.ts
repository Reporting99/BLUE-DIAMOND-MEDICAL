import type { Bilingual } from "./medical-service";
import type { ImageStatus } from "./media";

export interface ProductBrand {
  id: string;
  slug: string;
  slugAr: string;
  name: string; // proper noun, not translated
}

export interface ProductCategory {
  id: string;
  slug: string;
  slugAr: string;
  name: Bilingual;
}

export interface ProductConcern {
  id: string;
  slug: string;
  slugAr: string;
  name: Bilingual;
}

export interface ProductFaq {
  question: Bilingual;
  answer: Bilingual;
}

/**
 * Every fact in `ProductDetail` must trace to one of these — the official
 * manufacturer site or an authorized Canadian retailer, never a
 * competitor clinic's own marketing copy. Recorded per-product so every
 * claim is individually traceable, per the brief's "record the
 * manufacturer URL and retrieval date" rule.
 */
export interface ProductSource {
  url: string;
  /** ISO date the fact was retrieved/verified — not the manufacturer's own publish date, which isn't always available. */
  retrievedDate: string;
  publisher: string;
}

/**
 * Original Blue Diamond content for a product detail page, written from
 * verified official-source research — never copied from manufacturer
 * paragraphs verbatim, never inventing a fact the research didn't
 * confirm. Every field is optional except `overview`/`whatItIs`/
 * `howToUse`/`faqs`/`sources` — the brief says "omit any detail that
 * cannot be verified" rather than requiring every field for every
 * product, and several of the 23 SkinMedica products had thinner
 * available research than others.
 */
export interface ProductDetail {
  /** Answer-first — what this is and its main job, in 1-2 sentences. */
  overview: Bilingual;
  whatItIs: Bilingual;
  /** e.g. "Broad-spectrum mineral sunscreen", "Retinol serum" — the product category in plain terms, not a marketing label. */
  productType: Bilingual;
  routinePlacement: Bilingual;
  /** Manufacturer-stated goals, attributed to the manufacturer rather than asserted as a Blue Diamond promise. */
  skincareGoals?: Bilingual;
  keyCharacteristics?: { en: string[]; ar: string[] };
  texture?: Bilingual;
  howToUse: Bilingual;
  whenToUse?: Bilingual;
  /** General verified warnings not covered by the two dedicated fields below. */
  warnings?: { en: string[]; ar: string[] };
  sunSensitivityWarning?: Bilingual;
  pregnancyWarning?: Bilingual;
  relatedProductIds?: string[];
  /** 6-10 product-specific questions — never a generic set reused across products. */
  faqs: ProductFaq[];
  sources: ProductSource[];
  /**
   * Set only when official current naming/trademark styling differs from
   * the client-approved catalogue record (e.g. "Rejuvenative" ->
   * "Rejuvenating", "Defence" -> "Defense") — documents the mapping
   * rather than silently swapping names. The approved catalogue's price
   * and size are always preserved regardless.
   */
  legacyNameNote?: Bilingual;
}

export interface Product {
  id: string;
  slug: string;
  slugAr: string;
  name: Bilingual;
  brandId: string;
  categoryIds: string[];
  concernIds: string[];
  /**
   * @deprecated superseded by `detail.overview` — kept only so any
   * existing reference doesn't break; every product now has `detail`.
   */
  description?: Bilingual;
  detail?: ProductDetail;
  /** Cents, CAD — see src/types/pricing.ts#formatPrice for display. */
  priceCents: number;
  sizeLabel?: string; // e.g. "56.7 g" — not translated, a measurement
  images: { path: string; status: ImageStatus; alt: Bilingual }[];
  approvalStatus: "approved" | "pending";
  inStock: boolean;
  /**
   * Set only for a product that is one of several approved size/price
   * variants of the same underlying product (e.g. Scar Recovery Gel
   * Small/Large) — points at the sibling variant's `id`. Both variants
   * remain full, independent product records/pages (the brief's
   * alternative to a single variant-selector page), just cross-linked.
   */
  variantOfId?: string;
}
