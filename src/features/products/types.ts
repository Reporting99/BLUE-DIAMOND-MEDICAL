import type { Bilingual } from "@/types/common";
import type { ImageStatus } from "@/types/media";

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
  /**
   * CL-036 — optional. The client-supplied professional-peel records name
   * no brand, and inventing one to satisfy a required field would be a
   * fabricated product attribute. Renderers omit the brand line and the
   * schema's `brand` node entirely when this is absent.
   */
  brandId?: string;
  /**
   * CL-037 / CL-038 — the product's own subtitle line, exactly as supplied
   * (e.g. "Decongestant and anti-inflammatory"). Distinct from
   * `detail.overview`: a subtitle is a label, not a description.
   */
  subtitle?: Bilingual;
  /** CL-037 / CL-038 — supplied "Benefits" list, one entry per bullet. */
  benefits?: { en: string[]; ar: string[] };
  /** CL-037 / CL-038 — supplied "Key features" list, one entry per bullet. */
  keyFeatures?: { en: string[]; ar: string[] };
  categoryIds: string[];
  concernIds: string[];
  /**
   * @deprecated superseded by `detail.overview` — kept only so any
   * existing reference doesn't break; every product now has `detail`.
   */
  description?: Bilingual;
  detail?: ProductDetail;
  /**
   * Cents, CAD — see src/types/pricing.ts#formatPrice for display.
   *
   * CL-038 — `null` when the client has not supplied a price. It is never
   * borrowed from a sibling product and never estimated; `formatPrice`
   * already renders null as an em dash, and `purchaseBlocked` below is what
   * keeps such a record out of any purchase path.
   */
  priceCents: number | null;
  /**
   * CL-037 — the price string exactly as the client supplied it, when that
   * differs from the computed CAD formatting. "188 + GST" is published
   * verbatim: the GST portion is displayed as given and is NOT calculated
   * into a tax-inclusive total, because no approved tax logic exists.
   */
  priceLabel?: string;
  /**
   * CL-036 — set when a required input (approved packaging photograph,
   * approved price) has not been supplied. While this is present the
   * product renders as catalogue content only: no purchase action, no
   * availability claim, and an explicit note saying what is outstanding.
   */
  purchaseBlocked?: Bilingual;
  /**
   * CL-042 (Myriade) — the client-supplied catalogue shape, continuing the
   * CL-037/CL-038 precedent above: a record sourced from a supplied product
   * flyer carries the manufacturer's own lists and no research `detail`
   * block, because inventing that research is what this repository refuses
   * to do. All four are optional and render only when supplied.
   *
   * `professionalOnly` is not decoration: it is what keeps a clinician-applied
   * product out of any purchase path regardless of stock or price state.
   */
  /**
   * CL-042 — a MANUFACTURER-SUPPLIED before/after example for this product.
   *
   * Deliberately its own field rather than another `images[]` entry: an entry
   * in `images` is product packaging, and a result photograph is not. Keeping
   * them apart is what stops a comparison shot being picked up as a packshot
   * by the card grid, and it forces the attribution below to travel with the
   * pictures rather than being remembered separately.
   *
   * `attribution` and `resultsVary` are REQUIRED, not optional. These are
   * manufacturer clinical examples, never Blue Diamond patient photography,
   * and both statements must render wherever the pair does.
   *
   * `source` is the manufacturer's OWN untouched composite — the single image
   * as it appears in the supplied brochure, privacy bars, printed labels and
   * all. It is kept alongside the split halves rather than instead of them:
   * the split pair is what the accessible side-by-side comparison needs, and
   * the composite is the evidence that the split was not re-cropped or
   * re-ordered. Rendering it first preserves the supplied manifest's own
   * ordering (source, then before, then after).
   *
   * `caption` is REQUIRED and carries the manufacturer's stated treatment
   * duration ("Two weeks of use of …"). A result photograph with no stated
   * interval invites the reader to supply their own, so the interval travels
   * with the pictures for the same reason the attribution does.
   */
  manufacturerComparison?: {
    source?: { path: string; alt: Bilingual };
    before: { path: string; alt: Bilingual };
    after: { path: string; alt: Bilingual };
    caption: Bilingual;
    attribution: Bilingual;
    resultsVary: Bilingual;
  };
  professionalOnly?: boolean;
  /** Manufacturer warnings for catalogue products without a detail block. */
  safetyWarnings?: { en: string[]; ar: string[] };
  /** Manufacturer "Directions"/how-to-use steps, one entry per step. */
  directions?: { en: string[]; ar: string[] };
  /** Manufacturer-stated key ingredients, verbatim — never an inferred list. */
  keyIngredients?: { en: string[]; ar: string[] };
  /** For a kit: the products it contains, as supplied. */
  kitContents?: { en: string[]; ar: string[] };
  sizeLabel?: string; // e.g. "56.7 g" — not translated, a measurement
  images: {
    path: string;
    status: ImageStatus;
    alt: Bilingual;
    /**
     * Cache-busting version token — see `ResolvedMedia` in
     * src/lib/feelstack/media.ts. Always undefined for these static,
     * repo-authored entries; present only once a CMS-resolved assignment
     * (see `productCardImage`) is merged in ahead of it.
     */
    version?: string;
  }[];
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
