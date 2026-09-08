import type { Product, ProductBrand, ProductCategory, ProductConcern } from "@/features/products/types";
import { features } from "@/config/features";
import { archivedSkinMedicaProducts, skinMedicaBrand } from "@/features/products/archive/skinmedica";

/**
 * Shop content store — brief §18, plus the "MANDATORY APPROVED SKINMEDICA
 * CATALOGUE" pass. Two source tiers, never mixed:
 *
 * 1. **Approved catalogue values** (name, price, size, category) — verbatim
 *    from `Blue-Diamond-Medical-Website-Content-Extraction_1(4).docx`
 *    (Source page: bluediamondmedical.ca/products). These are never
 *    altered except where the client's own instruction explicitly asked
 *    for a current-official-name verification (Total Defense/Defence,
 *    TNS Advanced+, HA5) — in those cases the *display name* uses the
 *    verified current official name, the approved price/size is
 *    unchanged, and the mapping is documented in `legacyNameNote`.
 * 2. **`detail` fields** — original Blue Diamond copy, written from
 *    verified official-manufacturer or authorized-Canadian-retailer
 *    research (never a competitor clinic's own copy, never invented).
 *    Every `detail.sources` entry names the exact page and retrieval
 *    date. Where research didn't confirm a fact (e.g. a complete
 *    ingredient list, an exact skin-type claim), that field is simply
 *    omitted — see `docs/CONTENT_MODEL.md` for the full
 *    per-product source trace.
 *
 * **SkinMedica is archived, not deleted (2026-09-07).** Blue Diamond stopped
 * carrying the line and carries Myriade only, so the 23 approved SkinMedica
 * records moved verbatim to
 * `src/features/products/archive/skinmedica.ts` and re-enter `products`
 * only while `features.skinMedicaEnabled` is `true` — which it is not. Tier 1
 * and tier 2 above still describe how those archived records were sourced;
 * the live catalogue below is the Myriade one (CL-037/CL-038/CL-042), whose
 * every field is verbatim client-supplied copy.
 *
 * Availability notice (brief-mandated, shown near every price — see
 * `availabilityNotice` export and `ProductTemplate.tsx`):
 * "Product availability and current pricing should be confirmed directly
 * with Blue Diamond Medical Clinic."
 */
export const availabilityNotice = {
  en: "Product availability and current pricing should be confirmed directly with Blue Diamond Medical Clinic.",
  ar: "يرجى تأكيد توفر المنتج وسعره الحالي مباشرةً مع عيادة بلو دايموند الطبية.",
};

/**
 * The full catalogue taxonomy. Exported below as `productCategories`, filtered
 * to the groupings the LIVE catalogue actually fills — see that export.
 */
const allProductCategories: ProductCategory[] = [
  { id: "cleansers", slug: "cleansers", slugAr: "المنظفات", name: { en: "Cleansers", ar: "المنظفات" } },
  { id: "serums", slug: "serums", slugAr: "السيروم", name: { en: "Serums", ar: "السيروم" } },
  { id: "moisturizers", slug: "moisturizers", slugAr: "المرطبات", name: { en: "Moisturizers", ar: "المرطبات" } },
  { id: "sunscreen", slug: "sunscreen", slugAr: "واقي-الشمس", name: { en: "Sunscreen", ar: "واقي الشمس" } },
  { id: "retinol", slug: "retinol", slugAr: "الريتينول", name: { en: "Retinol", ar: "الريتينول" } },
  { id: "eye-care", slug: "eye-care", slugAr: "العناية-بمحيط-العين", name: { en: "Eye Care", ar: "العناية بمحيط العين" } },
  { id: "scar-care", slug: "scar-care", slugAr: "العناية-بالندبات", name: { en: "Scar Care", ar: "العناية بالندبات" } },
  { id: "treatment-systems", slug: "treatment-systems", slugAr: "أنظمة-العلاج", name: { en: "Treatment Systems", ar: "أنظمة العلاج" } },
  /* CL-036 - the client-supplied professional peels are not skincare
     retail items and do not belong in any SkinMedica grouping above.
     "Professional Peels" is an organisational label only. */
  { id: "peels", slug: "peels", slugAr: "التقشير", name: { en: "Professional Peels", ar: "التقشير المهني" } },
  /* CL-042 - the Myriade catalogue's own groupings, taken verbatim from the
     supplied Products Flyer rather than re-classified into the SkinMedica
     groupings above. "Sun Care" is deliberately absent: it maps onto the
     existing `sunscreen` category rather than adding a synonym for it.
     These are navigational taxonomy labels, not product or clinical copy. */
  { id: "daily-care", slug: "daily-care", slugAr: "العناية-اليومية", name: { en: "Daily Care", ar: "العناية اليومية" } },
  { id: "brightening", slug: "brightening", slugAr: "التفتيح", name: { en: "Brightening", ar: "التفتيح" } },
  { id: "purifying", slug: "purifying", slugAr: "التنقية", name: { en: "Purifying", ar: "التنقية" } },
  { id: "anti-aging-repairing", slug: "anti-aging-repairing", slugAr: "مكافحة-الشيخوخة-والإصلاح", name: { en: "Anti-Aging and Repairing", ar: "مكافحة الشيخوخة والإصلاح" } },
  { id: "kits", slug: "kits", slugAr: "الأطقم", name: { en: "Kits", ar: "الأطقم" } },
  { id: "professional-care", slug: "professional-care", slugAr: "العناية-المهنية", name: { en: "Professional Care", ar: "العناية المهنية" } },
];

export const productConcerns: ProductConcern[] = [
  { id: "acne", slug: "acne", slugAr: "حب-الشباب", name: { en: "Acne", ar: "حب الشباب" } },
  { id: "anti-aging", slug: "anti-aging", slugAr: "مكافحة-الشيخوخة", name: { en: "Anti-Aging", ar: "مكافحة الشيخوخة" } },
  { id: "pigmentation", slug: "pigmentation", slugAr: "التصبغ", name: { en: "Pigmentation", ar: "التصبغ" } },
  { id: "dry-skin", slug: "dry-skin", slugAr: "جفاف-البشرة", name: { en: "Dry Skin", ar: "جفاف البشرة" } },
  { id: "redness", slug: "redness", slugAr: "الاحمرار", name: { en: "Redness", ar: "الاحمرار" } },
  { id: "hair-care", slug: "hair-care", slugAr: "العناية-بالشعر", name: { en: "Hair Care", ar: "العناية بالشعر" } },
];

/**
 * Brands the catalogue currently carries. SkinMedica is appended only while
 * `features.skinMedicaEnabled` is true, so nothing derived from this list —
 * the /shop meta description names the brands and counts the products — can
 * go on naming a manufacturer whose products the site no longer publishes.
 */
export const productBrands: ProductBrand[] = [
  ...(features.skinMedicaEnabled ? [skinMedicaBrand] : []),
  /* CL-042 - Concept Myriade, the second catalogue brand. The name is a
     proper noun and is not translated, per ProductBrand's own contract. */
  { id: "myriade", slug: "myriade", slugAr: "ميرياد", name: "Myriade" },
];

/** Category taglines from the approved catalogue. The current global
 * SkinMedica site organizes products under a different top-level taxonomy
 * (Facial Cleansers / Moisturizers / Correction / Brighteners / Sunscreens
 * / Targeted Treatments / Post-Procedure / Kits & Systems / HA5
 * Collection — verified skinmedica.com, 2026-08-22), but nothing found
 * contradicts these client-approved "Factor" groupings as inappropriate;
 * they're preserved as directed, used only as organizational labels. */
export const categoryTaglines: Record<string, { en: string; ar: string }> = {
  "the-growth-factor": { en: "Groundbreaking science for visibly transformed skin", ar: "علم رائد لبشرة متجددة" },
  "the-cleanse-factor": { en: "An array of cleansers for every skin type", ar: "مجموعة من المنظفات لكل أنواع البشرة" },
  "the-correct-factor": { en: "Target a wide variety of skin concerns", ar: "تستهدف مجموعة واسعة من مخاوف البشرة" },
  "the-protect-factor": { en: "Everyday protection for all skin types", ar: "حماية يومية لجميع أنواع البشرة" },
  "the-hydration-factor": { en: "Essential hydration skin needs", ar: "الترطيب الأساسي الذي تحتاجه البشرة" },
};


/**
 * The live catalogue: the 31 Myriade records (CL-037, CL-038, CL-042).
 *
 * Kept as its own binding rather than inlined into `products` so the archived
 * SkinMedica records can be prepended without moving a line of it.
 */
const myriadeProducts: Product[] = [
  // ============ PROFESSIONAL PEELS (CL-037, CL-038) ============
  /**
   * Client-supplied records. Every field below is verbatim from the client's
   * own copy - no manufacturer research, no invented ingredient, benefit,
   * indication or contraindication, and no borrowed price.
   *
   * BOTH are non-purchasable (`purchaseBlocked`), but the REASON changed on
   * 2026-09-07: the CL-042 Myriade bundle supplied both approved packaging
   * photographs, so GAP-018 is closed and each record now points at its own
   * verified ImageKit asset. They stay non-purchasable because they are
   * professional-use peels applied by a clinician, and CL-038 additionally
   * still has no supplied price. A treatment or equipment photograph is still
   * never substituted for product packaging.
   *
   * ARABIC IS A CLIENT DEPENDENCY: no approved Arabic rendering of this
   * product copy was supplied, so the `ar` fields repeat the approved
   * English rather than carry a machine translation - the same rule the
   * biography records follow.
   */
  {
    id: "purifying-peeling",
    slug: "the-purifying-peeling",
    slugAr: "the-purifying-peeling",
    brandId: "myriade",
    name: { en: "The Purifying Peeling", ar: "The Purifying Peeling" },
    subtitle: { en: "Decongestant and anti-inflammatory", ar: "Decongestant and anti-inflammatory" },
    categoryIds: ["peels", "professional-care"],
    concernIds: ["acne"],
    // Published exactly as supplied: "188 + GST". The GST is displayed as
    // given and never computed into a tax-inclusive total.
    priceCents: 18800,
    priceLabel: "188 + GST",
    benefits: {
      en: [
        "Reduces skin inflammation.",
        "Penetrates the sebaceous gland to reduce breakouts and stabilize sebum production.",
        "Decongests pores and improves skin imperfections at their source.",
      ],
      ar: [
        "Reduces skin inflammation.",
        "Penetrates the sebaceous gland to reduce breakouts and stabilize sebum production.",
        "Decongests pores and improves skin imperfections at their source.",
      ],
    },
    keyFeatures: {
      en: [
        "Liposoluble anti-inflammatory formula.",
        "Suitable for alternating use or as a prep with AHA-based products.",
        "Recommended as part of a course of treatment, for longer-term results.",
      ],
      ar: [
        "Liposoluble anti-inflammatory formula.",
        "Suitable for alternating use or as a prep with AHA-based products.",
        "Recommended as part of a course of treatment, for longer-term results.",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/professional-care/purifying-peeling.jpg",
        status: "approved",
        alt: { en: "The Purifying Peeling by Myriade", ar: "The Purifying Peeling by Myriade" },
      },
    ],
    approvalStatus: "pending",
    inStock: false,
    purchaseBlocked: {
      en: "This is a professional-use peel applied by a trained clinician at Blue Diamond Medical. It is shown here for information and is not available to purchase online — please ask the clinic.",
      ar: "This is a professional-use peel applied by a trained clinician at Blue Diamond Medical. It is shown here for information and is not available to purchase online — please ask the clinic.",
    },
  },
  {
    id: "brightening-peeling",
    slug: "the-brightening-peeling",
    slugAr: "the-brightening-peeling",
    brandId: "myriade",
    /* CL-038 - the source pasted this title three ways ("HE BRIGHTENING
       PEELING", a trailing "&#x20;" entity, and a duplicated adjacent
       title). One canonical title is published. */
    name: { en: "The Brightening Peeling", ar: "The Brightening Peeling" },
    subtitle: { en: "Exfoliating and anti-aging", ar: "Exfoliating and anti-aging" },
    categoryIds: ["peels", "professional-care"],
    concernIds: ["anti-aging", "pigmentation"],
    // CL-038 - NO PRICE SUPPLIED. Deliberately null: it is not the
    // Purifying peel's 188, and it is not an estimate.
    priceCents: null,
    benefits: {
      en: [
        "Deeply exfoliates by eliminating dead skin cells.",
        "Brightens the complexion and corrects skin irregularities for a uniform, radiant skin tone.",
        "Stimulates natural production of elastin and collagen.",
        "Improves the appearance of pigmentation spots.",
        "Refines skin texture and reduces wrinkles and fine lines.",
        "Tightens enlarged pores.",
      ],
      ar: [
        "Deeply exfoliates by eliminating dead skin cells.",
        "Brightens the complexion and corrects skin irregularities for a uniform, radiant skin tone.",
        "Stimulates natural production of elastin and collagen.",
        "Improves the appearance of pigmentation spots.",
        "Refines skin texture and reduces wrinkles and fine lines.",
        "Tightens enlarged pores.",
      ],
    },
    keyFeatures: {
      en: [
        "It continues to work for 48 hours after neutralization in the treatment room to maximize cellular renewal.",
        "Suitable for skin with imperfections, wrinkles and fine lines, as well as superficial dehydration.",
      ],
      ar: [
        "It continues to work for 48 hours after neutralization in the treatment room to maximize cellular renewal.",
        "Suitable for skin with imperfections, wrinkles and fine lines, as well as superficial dehydration.",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/professional-care/brightening-peeling.jpg",
        status: "approved",
        alt: { en: "The Brightening Peeling by Myriade", ar: "The Brightening Peeling by Myriade" },
      },
    ],
    approvalStatus: "pending",
    inStock: false,
    purchaseBlocked: {
      en: "This is a professional-use peel applied by a trained clinician at Blue Diamond Medical. Its price has not been supplied, and it is not available to purchase online — please ask the clinic about pricing.",
      ar: "This is a professional-use peel applied by a trained clinician at Blue Diamond Medical. Its price has not been supplied, and it is not available to purchase online — please ask the clinic about pricing.",
    },
  },
  /* ------------------------------------------------------------------ CL-042
   * MYRIADE (Concept Myriade) - 29 records from the client-supplied
   * "Products Flyer.pdf" bundle, verified 2026-09-06
   * (BLUE_DIAMOND_PRODUCTS_BEFORE_AFTER_IMAGEKIT_READY_2026-09-06.zip,
   * BUNDLE_VALIDATION.json status PASS). With the two peels already published
   * as CL-037/CL-038 this brings the Myriade catalogue to 31.
   *
   * They follow the CL-037/CL-038 professional-peel shape, NOT the SkinMedica
   * shape: subtitle plus the manufacturer's own Benefits / Key features /
   * Directions / Ingredients lists, and NO `detail` research block, because
   * the flyer is the only source and 6-10 researched FAQs plus manufacturer
   * source URLs do not exist for these products.
   *
   * ARABIC IS A CLIENT DEPENDENCY: no approved Arabic rendering was supplied,
   * so every `ar` field repeats the approved English - the same rule the two
   * peels and the doctor biographies already follow. It is not a translation
   * and must not be presented as one.
   *
   * PRICING: the flyer supplies exactly one price (The Purifying Peeling,
   * "188 + GST", already published). Every record below carries
   * `priceCents: null`; none is estimated or borrowed from a sibling.
   *
   * PURCHASE: catalogue content only - `inStock: false` plus an explicit
   * `purchaseBlocked` note. `professionalOnly` records say so in that note.
   * No checkout, inventory, tax or shipping behaviour is introduced.
   *
   * IMAGES: `images: []` deliberately. The packshot is the approved
   * `productPrimary` media assignment in FeelStack (see
   * evidence/myriade-media-mapping.json), exactly as for the 23 SkinMedica
   * records - the static array is only the no-assignment fallback.
   */
  {
    id: "the-cleanser",
    slug: "the-cleanser",
    slugAr: "the-cleanser",
    name: { en: "The Cleanser", ar: "The Cleanser" },
    brandId: "myriade",
    subtitle: { en: "Makeup remover and facial cleanser", ar: "Makeup remover and facial cleanser" },
    categoryIds: ["daily-care"],
    concernIds: [],
    sizeLabel: "250 ml",
    priceCents: null,
    benefits: {
      en: [
        "Deeply cleanses, soothes, and protects the skin's integrity.",
        "Can also be used as a shaving cream.",
        "Suitable for all skin types.",
      ],
      ar: [
        "Deeply cleanses, soothes, and protects the skin's integrity.",
        "Can also be used as a shaving cream.",
        "Suitable for all skin types.",
      ],
    },
    keyFeatures: {
      en: [
        "Enriched with allantoin and fine lavender essential oil.",
        "Daily cleanser based on aloe vera.",
        "Removes impurities and residues, enhancing absorption of active ingredients.",
        "Stimulates cellular renewal.",
      ],
      ar: [
        "Enriched with allantoin and fine lavender essential oil.",
        "Daily cleanser based on aloe vera.",
        "Removes impurities and residues, enhancing absorption of active ingredients.",
        "Stimulates cellular renewal.",
      ],
    },
    directions: {
      en: [
        "Lather with warm water and massage to remove impurities.",
        "Leave on for 3 minutes, then rinse thoroughly with warm water.",
        "Pat skin dry before applying a cream.",
      ],
      ar: [
        "Lather with warm water and massage to remove impurities.",
        "Leave on for 3 minutes, then rinse thoroughly with warm water.",
        "Pat skin dry before applying a cream.",
      ],
    },
    keyIngredients: {
      en: [
        "Aloe Vera 40%",
        "Kaolin",
        "Glycolic Acid 0.25%",
      ],
      ar: [
        "Aloe Vera 40%",
        "Kaolin",
        "Glycolic Acid 0.25%",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/daily-care/the-cleanser.jpg",
        status: "approved",
        alt: { en: "The Cleanser by Myriade", ar: "The Cleanser by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "protective-day-cream",
    slug: "protective-day-cream",
    slugAr: "protective-day-cream",
    name: { en: "The Protective Day Cream", ar: "The Protective Day Cream" },
    brandId: "myriade",
    subtitle: { en: "Anti-aging and moisturizing day cream", ar: "Anti-aging and moisturizing day cream" },
    categoryIds: ["daily-care"],
    concernIds: [],
    sizeLabel: "50 ml",
    priceCents: null,
    benefits: {
      en: [
        "Protects skin and helps prevent aging caused by environmental stress.",
        "Lightweight and silky formula for long-term healthy skin.",
        "Suitable for normal to dehydrated skin.",
      ],
      ar: [
        "Protects skin and helps prevent aging caused by environmental stress.",
        "Lightweight and silky formula for long-term healthy skin.",
        "Suitable for normal to dehydrated skin.",
      ],
    },
    keyFeatures: {
      en: [
        "Contains radical scavengers, antioxidants, anti-inflammatories, and moisturizers.",
        "Helps reduce oxidative stress caused by free radicals.",
      ],
      ar: [
        "Contains radical scavengers, antioxidants, anti-inflammatories, and moisturizers.",
        "Helps reduce oxidative stress caused by free radicals.",
      ],
    },
    directions: {
      en: [
        "Apply evenly to the face, neck, and décolletage.",
        "Use with the C-Serum to support the skin's natural defenses.",
      ],
      ar: [
        "Apply evenly to the face, neck, and décolletage.",
        "Use with the C-Serum to support the skin's natural defenses.",
      ],
    },
    keyIngredients: {
      en: [
        "Hyaluronic Acid 5%",
        "Allantoin",
        "Tea Tree Oil",
      ],
      ar: [
        "Hyaluronic Acid 5%",
        "Allantoin",
        "Tea Tree Oil",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/daily-care/protective-day-cream.jpg",
        status: "approved",
        alt: { en: "The Protective Day Cream by Myriade", ar: "The Protective Day Cream by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "protective-fluid",
    slug: "protective-fluid",
    slugAr: "protective-fluid",
    name: { en: "The Protective Fluid", ar: "The Protective Fluid" },
    brandId: "myriade",
    subtitle: { en: "Mattifying, sebo-regulating, and anti-aging day cream", ar: "Mattifying, sebo-regulating, and anti-aging day cream" },
    categoryIds: ["daily-care"],
    concernIds: [],
    sizeLabel: "50 ml",
    priceCents: null,
    benefits: {
      en: [
        "Protects skin and helps prevent aging caused by environmental stress.",
        "Mattifying formula helps control and stabilize sebum production throughout the day.",
        "Suitable for oily or combination skin and skin intolerant to moisturizing creams.",
      ],
      ar: [
        "Protects skin and helps prevent aging caused by environmental stress.",
        "Mattifying formula helps control and stabilize sebum production throughout the day.",
        "Suitable for oily or combination skin and skin intolerant to moisturizing creams.",
      ],
    },
    keyFeatures: {
      en: [
        "Helps reduce oxidative stress caused by free radicals.",
        "Designed for problem-prone skin.",
      ],
      ar: [
        "Helps reduce oxidative stress caused by free radicals.",
        "Designed for problem-prone skin.",
      ],
    },
    directions: {
      en: [
        "Apply evenly to the face, neck, and décolletage.",
        "Use with the C-Serum to support the skin's natural defenses.",
      ],
      ar: [
        "Apply evenly to the face, neck, and décolletage.",
        "Use with the C-Serum to support the skin's natural defenses.",
      ],
    },
    keyIngredients: {
      en: [
        "Hyaluronic Acid 5%",
        "Tea Tree Oil",
        "Kaolin",
      ],
      ar: [
        "Hyaluronic Acid 5%",
        "Tea Tree Oil",
        "Kaolin",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/daily-care/protective-fluid.jpg",
        status: "approved",
        alt: { en: "The Protective Fluid by Myriade", ar: "The Protective Fluid by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "ultra-protective",
    slug: "ultra-protective",
    slugAr: "ultra-protective",
    name: { en: "The Ultra Protective", ar: "The Ultra Protective" },
    brandId: "myriade",
    subtitle: { en: "Anti-aging and moisturizing day cream", ar: "Anti-aging and moisturizing day cream" },
    categoryIds: ["daily-care"],
    concernIds: [],
    sizeLabel: "50 ml",
    priceCents: null,
    benefits: {
      en: [
        "Helps maintain facial hydration throughout the day.",
        "Contains cellular protectors and antioxidants for photosensitive skin or skin prone to pigmentation disorders.",
      ],
      ar: [
        "Helps maintain facial hydration throughout the day.",
        "Contains cellular protectors and antioxidants for photosensitive skin or skin prone to pigmentation disorders.",
      ],
    },
    keyFeatures: {
      en: [
        "Rich texture for photoaging, dry patches, and extreme dehydration.",
        "Suitable for mature or very dehydrated skin.",
      ],
      ar: [
        "Rich texture for photoaging, dry patches, and extreme dehydration.",
        "Suitable for mature or very dehydrated skin.",
      ],
    },
    directions: {
      en: [
        "Apply evenly to the face, neck, and décolletage.",
        "Use with the C-Serum to support the skin's natural defenses.",
      ],
      ar: [
        "Apply evenly to the face, neck, and décolletage.",
        "Use with the C-Serum to support the skin's natural defenses.",
      ],
    },
    keyIngredients: {
      en: [
        "Hyaluronic Acid 5%",
        "Manganese Gluconate 5%",
        "Vitamin C",
      ],
      ar: [
        "Hyaluronic Acid 5%",
        "Manganese Gluconate 5%",
        "Vitamin C",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/daily-care/ultra-protective.jpg",
        status: "approved",
        alt: { en: "The Ultra Protective by Myriade", ar: "The Ultra Protective by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "soothing-gel",
    slug: "soothing-gel",
    slugAr: "soothing-gel",
    name: { en: "The Soothing Gel", ar: "The Soothing Gel" },
    brandId: "myriade",
    subtitle: { en: "Relieves and soothes", ar: "Relieves and soothes" },
    categoryIds: ["daily-care"],
    concernIds: [],
    sizeLabel: "100 ml",
    priceCents: null,
    benefits: {
      en: [
        "Promotes healing and quickly soothes redness and skin discomfort.",
        "Helps maintain facial hydration throughout the day.",
      ],
      ar: [
        "Promotes healing and quickly soothes redness and skin discomfort.",
        "Helps maintain facial hydration throughout the day.",
      ],
    },
    keyFeatures: {
      en: [
        "Designed for redness-prone, oily, and acne-prone skin.",
        "Can be used as an SOS gel or after aesthetic treatments.",
        "Supports the skin's protective barrier after shaving, bathing, or showering.",
        "Suitable for all skin types.",
      ],
      ar: [
        "Designed for redness-prone, oily, and acne-prone skin.",
        "Can be used as an SOS gel or after aesthetic treatments.",
        "Supports the skin's protective barrier after shaving, bathing, or showering.",
        "Suitable for all skin types.",
      ],
    },
    directions: {
      en: [
        "Use as a serum before day or night cream.",
        "May be used alone on clean, dry skin.",
      ],
      ar: [
        "Use as a serum before day or night cream.",
        "May be used alone on clean, dry skin.",
      ],
    },
    keyIngredients: {
      en: [
        "Aloe Vera 20%",
        "Bisabolol",
        "Sea Fennel",
      ],
      ar: [
        "Aloe Vera 20%",
        "Bisabolol",
        "Sea Fennel",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/daily-care/soothing-gel.jpg",
        status: "approved",
        alt: { en: "The Soothing Gel by Myriade", ar: "The Soothing Gel by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "soothing-mask",
    slug: "soothing-mask",
    slugAr: "soothing-mask",
    name: { en: "The Soothing Mask", ar: "The Soothing Mask" },
    brandId: "myriade",
    subtitle: { en: "Soothing and moisturizing", ar: "Soothing and moisturizing" },
    categoryIds: ["daily-care"],
    concernIds: [],
    sizeLabel: "150 ml",
    priceCents: null,
    benefits: {
      en: [
        "Improves skin appearance and reduces visible signs of aging.",
        "Provides deep hydration and relieves tightness caused by dehydration.",
        "Calms irritation, redness, and skin discomfort.",
      ],
      ar: [
        "Improves skin appearance and reduces visible signs of aging.",
        "Provides deep hydration and relieves tightness caused by dehydration.",
        "Calms irritation, redness, and skin discomfort.",
      ],
    },
    keyFeatures: {
      en: [
        "Enriched with thermal mud and sea clay.",
        "Does not dry out the skin like a traditional clay mask.",
        "Suitable for all skin types, including hypersensitive or couperose-prone skin.",
      ],
      ar: [
        "Enriched with thermal mud and sea clay.",
        "Does not dry out the skin like a traditional clay mask.",
        "Suitable for all skin types, including hypersensitive or couperose-prone skin.",
      ],
    },
    directions: {
      en: [
        "Apply generously to clean skin for 20 to 30 minutes.",
        "Rinse thoroughly with lukewarm water.",
      ],
      ar: [
        "Apply generously to clean skin for 20 to 30 minutes.",
        "Rinse thoroughly with lukewarm water.",
      ],
    },
    keyIngredients: {
      en: [
        "Aloe Vera 10%",
        "Shea Butter 5%",
        "Liposilt 20%",
      ],
      ar: [
        "Aloe Vera 10%",
        "Shea Butter 5%",
        "Liposilt 20%",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/daily-care/soothing-mask.jpg",
        status: "approved",
        alt: { en: "The Soothing Mask by Myriade", ar: "The Soothing Mask by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "balancing-tonic-solution",
    slug: "balancing-tonic-solution",
    slugAr: "balancing-tonic-solution",
    name: { en: "The Balancing Tonic Solution", ar: "The Balancing Tonic Solution" },
    brandId: "myriade",
    subtitle: { en: "Regulates, detoxifies, and purifies", ar: "Regulates, detoxifies, and purifies" },
    categoryIds: ["daily-care"],
    concernIds: [],
    sizeLabel: "150 ml",
    priceCents: null,
    benefits: {
      en: [
        "Helps restore a glowing, healthy-looking complexion.",
        "Helps reduce bacterial growth and sebum production.",
        "Minimizes the appearance of pores.",
      ],
      ar: [
        "Helps restore a glowing, healthy-looking complexion.",
        "Helps reduce bacterial growth and sebum production.",
        "Minimizes the appearance of pores.",
      ],
    },
    keyFeatures: {
      en: [
        "Formulated with zinc for antibacterial and sebum-regulating properties.",
        "Contains seawater to help tighten pores.",
        "Soothes and hydrates skin.",
      ],
      ar: [
        "Formulated with zinc for antibacterial and sebum-regulating properties.",
        "Contains seawater to help tighten pores.",
        "Soothes and hydrates skin.",
      ],
    },
    directions: {
      en: [
        "Apply morning and evening to clean, dry skin.",
      ],
      ar: [
        "Apply morning and evening to clean, dry skin.",
      ],
    },
    keyIngredients: {
      en: [
        "Zinc",
        "Seawater",
        "Pullulan",
        "Lavender Water",
        "Aloe Vera",
      ],
      ar: [
        "Zinc",
        "Seawater",
        "Pullulan",
        "Lavender Water",
        "Aloe Vera",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/daily-care/balancing-tonic-solution.jpg",
        status: "approved",
        alt: { en: "The Balancing Tonic Solution by Myriade", ar: "The Balancing Tonic Solution by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "c-retinol",
    slug: "c-retinol",
    slugAr: "c-retinol",
    name: { en: "The C-Retinol", ar: "The C-Retinol" },
    brandId: "myriade",
    subtitle: { en: "Anti-aging and brightening night cream", ar: "Anti-aging and brightening night cream" },
    categoryIds: ["brightening"],
    concernIds: [],
    sizeLabel: "50 ml",
    priceCents: null,
    benefits: {
      en: [
        "Reduces visible signs of skin aging.",
        "Lightens hyperpigmentation and helps correct pigmentation disorders.",
        "Evens skin tone and texture.",
      ],
      ar: [
        "Reduces visible signs of skin aging.",
        "Lightens hyperpigmentation and helps correct pigmentation disorders.",
        "Evens skin tone and texture.",
      ],
    },
    keyFeatures: {
      en: [
        "Lightweight and mattifying formula.",
        "Supports collagen synthesis.",
        "Contains agents that control pigment production.",
        "Suitable for mature skin or skin with pigmentation irregularities.",
      ],
      ar: [
        "Lightweight and mattifying formula.",
        "Supports collagen synthesis.",
        "Contains agents that control pigment production.",
        "Suitable for mature skin or skin with pigmentation irregularities.",
      ],
    },
    directions: {
      en: [
        "Apply daily before bedtime to clean, dry skin.",
        "Use with a suitable serum for optimal results.",
      ],
      ar: [
        "Apply daily before bedtime to clean, dry skin.",
        "Use with a suitable serum for optimal results.",
      ],
    },
    keyIngredients: {
      en: [
        "Encapsulated Retinol A 0.5%",
        "Oligopeptide-68 5%",
        "Vitamin C",
        "Touki Extract",
        "Pomegranate Extract",
      ],
      ar: [
        "Encapsulated Retinol A 0.5%",
        "Oligopeptide-68 5%",
        "Vitamin C",
        "Touki Extract",
        "Pomegranate Extract",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/brightening/c-retinol.jpg",
        status: "approved",
        alt: { en: "The C-Retinol by Myriade", ar: "The C-Retinol by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "c-eye-contour",
    slug: "c-eye-contour",
    slugAr: "c-eye-contour",
    name: { en: "The C Eye Contour", ar: "The C Eye Contour" },
    brandId: "myriade",
    subtitle: { en: "Anti-aging and brightening day and night cream", ar: "Anti-aging and brightening day and night cream" },
    categoryIds: ["brightening"],
    concernIds: [],
    sizeLabel: "15 ml",
    priceCents: null,
    benefits: {
      en: [
        "Reduces and helps prevent hyperpigmentation around the eyes.",
        "Supports collagen synthesis and provides antioxidant properties.",
      ],
      ar: [
        "Reduces and helps prevent hyperpigmentation around the eyes.",
        "Supports collagen synthesis and provides antioxidant properties.",
      ],
    },
    keyFeatures: {
      en: [
        "Moisturizing, non-greasy formula.",
        "Suitable for all skin types.",
      ],
      ar: [
        "Moisturizing, non-greasy formula.",
        "Suitable for all skin types.",
      ],
    },
    directions: {
      en: [
        "Apply gently around the eyes morning and evening on clean, dry skin.",
      ],
      ar: [
        "Apply gently around the eyes morning and evening on clean, dry skin.",
      ],
    },
    keyIngredients: {
      en: [
        "Hyaluronic Acid",
        "Palmitoyl Oligopeptide",
        "Palmitoyl Tetrapeptide-7",
        "Vitamin C (MAP)",
        "Caffeine",
      ],
      ar: [
        "Hyaluronic Acid",
        "Palmitoyl Oligopeptide",
        "Palmitoyl Tetrapeptide-7",
        "Vitamin C (MAP)",
        "Caffeine",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/brightening/c-eye-contour.jpg",
        status: "approved",
        alt: { en: "The C Eye Contour by Myriade", ar: "The C Eye Contour by Myriade" },
      },
    ],
    manufacturerComparison: {
      source: {
        path: "/blue-diamond/products/myriade/c-eye-contour/before-after/c-eye-contour-before-after-source.jpg",
        alt: { en: "The C Eye Contour manufacturer-supplied before and after example", ar: "The C Eye Contour manufacturer-supplied before and after example" },
      },
      before: {
        path: "/blue-diamond/products/myriade/c-eye-contour/before-after/c-eye-contour-before.jpg",
        alt: { en: "The C Eye Contour manufacturer-supplied before view", ar: "The C Eye Contour manufacturer-supplied before view" },
      },
      after: {
        path: "/blue-diamond/products/myriade/c-eye-contour/before-after/c-eye-contour-after.jpg",
        alt: { en: "The C Eye Contour manufacturer-supplied after view", ar: "The C Eye Contour manufacturer-supplied after view" },
      },
      caption: { en: "Two weeks of use of The C Eye Contour", ar: "Two weeks of use of The C Eye Contour" },
      attribution: { en: "Manufacturer-supplied clinical example from Concept Myriade. This is not Blue Diamond Medical patient photography.", ar: "Manufacturer-supplied clinical example from Concept Myriade. This is not Blue Diamond Medical patient photography." },
      resultsVary: { en: "Individual results vary.", ar: "Individual results vary." },
    },
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "c-serum",
    slug: "c-serum",
    slugAr: "c-serum",
    name: { en: "The C-Serum", ar: "The C-Serum" },
    brandId: "myriade",
    subtitle: { en: "Antioxidant and brightening day and night serum", ar: "Antioxidant and brightening day and night serum" },
    categoryIds: ["brightening"],
    concernIds: [],
    sizeLabel: "30 ml",
    priceCents: null,
    benefits: {
      en: [
        "Protects skin against free-radical damage associated with skin aging.",
        "Supports collagen synthesis and helps prevent the appearance of fine lines.",
        "Brightens and enhances the complexion for a more even-looking skin tone.",
      ],
      ar: [
        "Protects skin against free-radical damage associated with skin aging.",
        "Supports collagen synthesis and helps prevent the appearance of fine lines.",
        "Brightens and enhances the complexion for a more even-looking skin tone.",
      ],
    },
    keyFeatures: {
      en: [
        "Antioxidant formula.",
        "Suitable for all skin types.",
      ],
      ar: [
        "Antioxidant formula.",
        "Suitable for all skin types.",
      ],
    },
    directions: {
      en: [
        "Apply before sunscreen to support resistance to pollutants and ultraviolet exposure.",
      ],
      ar: [
        "Apply before sunscreen to support resistance to pollutants and ultraviolet exposure.",
      ],
    },
    keyIngredients: {
      en: [
        "Hyaluronic Acid (2 molecular weights)",
        "Vitamin C (3-O Ethyl Ascorbic Acid)",
      ],
      ar: [
        "Hyaluronic Acid (2 molecular weights)",
        "Vitamin C (3-O Ethyl Ascorbic Acid)",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/brightening/c-serum.jpg",
        status: "approved",
        alt: { en: "The C-Serum by Myriade", ar: "The C-Serum by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "charcoal-purifier",
    slug: "charcoal-purifier",
    slugAr: "charcoal-purifier",
    name: { en: "The Charcoal Purifier", ar: "The Charcoal Purifier" },
    brandId: "myriade",
    subtitle: { en: "Exfoliating and brightening", ar: "Exfoliating and brightening" },
    categoryIds: ["purifying"],
    concernIds: [],
    sizeLabel: "130 ml",
    priceCents: null,
    benefits: {
      en: [
        "Removes dead skin cells and impurities from surface layers.",
        "Reduces blackheads and the appearance of enlarged pores over time.",
      ],
      ar: [
        "Removes dead skin cells and impurities from surface layers.",
        "Reduces blackheads and the appearance of enlarged pores over time.",
      ],
    },
    keyFeatures: {
      en: [
        "Combines chemical acids with mechanical exfoliating particles.",
        "Formulated for congested and dull skin.",
        "Supports cell renewal and skin respiration.",
      ],
      ar: [
        "Combines chemical acids with mechanical exfoliating particles.",
        "Formulated for congested and dull skin.",
        "Supports cell renewal and skin respiration.",
      ],
    },
    directions: {
      en: [
        "Apply to dry skin, or damp skin if sensitive.",
        "Leave on for a few minutes and rinse with lukewarm water.",
        "Use 2 to 3 times a week.",
      ],
      ar: [
        "Apply to dry skin, or damp skin if sensitive.",
        "Leave on for a few minutes and rinse with lukewarm water.",
        "Use 2 to 3 times a week.",
      ],
    },
    keyIngredients: {
      en: [
        "Coco Glucoside",
        "Bamboo Extract",
        "Charcoal Extract",
        "Glycolic Acid 0.5%",
        "Bentonite",
      ],
      ar: [
        "Coco Glucoside",
        "Bamboo Extract",
        "Charcoal Extract",
        "Glycolic Acid 0.5%",
        "Bentonite",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/purifying/charcoal-purifier.jpg",
        status: "approved",
        alt: { en: "The Charcoal Purifier by Myriade", ar: "The Charcoal Purifier by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "aha-bha-lotion",
    slug: "aha-bha-lotion",
    slugAr: "aha-bha-lotion",
    name: { en: "The AHA BHA Lotion", ar: "The AHA BHA Lotion" },
    brandId: "myriade",
    subtitle: { en: "Exfoliating, sebo-regulating, and anti-inflammatory night lotion", ar: "Exfoliating, sebo-regulating, and anti-inflammatory night lotion" },
    categoryIds: ["purifying"],
    concernIds: [],
    sizeLabel: "30 ml",
    priceCents: null,
    benefits: {
      en: [
        "Controls sebum and skin breakouts.",
        "Improves the appearance of texture concerns including acne scars, blackheads, enlarged pores, and keratosis pilaris.",
        "Helps prevent effects associated with photoaging.",
      ],
      ar: [
        "Controls sebum and skin breakouts.",
        "Improves the appearance of texture concerns including acne scars, blackheads, enlarged pores, and keratosis pilaris.",
        "Helps prevent effects associated with photoaging.",
      ],
    },
    keyFeatures: {
      en: [
        "Fluid texture for combination to oily skin.",
        "Photosensitive.",
      ],
      ar: [
        "Fluid texture for combination to oily skin.",
        "Photosensitive.",
      ],
    },
    directions: {
      en: [
        "Apply to clean skin before bedtime.",
        "Cleanse upon waking and apply sunscreen.",
      ],
      ar: [
        "Apply to clean skin before bedtime.",
        "Cleanse upon waking and apply sunscreen.",
      ],
    },
    keyIngredients: {
      en: [
        "Salicylic Acid 2%",
        "Glycolic Acid 5%",
        "Lavender Essential Oil",
      ],
      ar: [
        "Salicylic Acid 2%",
        "Glycolic Acid 5%",
        "Lavender Essential Oil",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/purifying/aha-bha-lotion.jpg",
        status: "approved",
        alt: { en: "The AHA BHA Lotion by Myriade", ar: "The AHA BHA Lotion by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "aha-mask",
    slug: "aha-mask",
    slugAr: "aha-mask",
    name: { en: "The AHA Mask", ar: "The AHA Mask" },
    brandId: "myriade",
    subtitle: { en: "Exfoliating, brightening, and anti-aging", ar: "Exfoliating, brightening, and anti-aging" },
    categoryIds: ["purifying"],
    concernIds: [],
    sizeLabel: "150 ml",
    priceCents: null,
    benefits: {
      en: [
        "Tightens pores and helps prevent blackheads.",
        "Brightens the complexion.",
        "Refines skin texture and accelerates cell renewal.",
        "Improves tolerance to active ingredients such as glycolic acids.",
      ],
      ar: [
        "Tightens pores and helps prevent blackheads.",
        "Brightens the complexion.",
        "Refines skin texture and accelerates cell renewal.",
        "Improves tolerance to active ingredients such as glycolic acids.",
      ],
    },
    keyFeatures: {
      en: [
        "Suitable for normal and oily skin prone to blackheads and enlarged pores.",
        "Acts as a chemical exfoliant.",
        "Not recommended for very sensitive skin.",
        "Photosensitive.",
      ],
      ar: [
        "Suitable for normal and oily skin prone to blackheads and enlarged pores.",
        "Acts as a chemical exfoliant.",
        "Not recommended for very sensitive skin.",
        "Photosensitive.",
      ],
    },
    directions: {
      en: [
        "Apply a thick layer for 15 minutes.",
        "Rinse with lukewarm water.",
      ],
      ar: [
        "Apply a thick layer for 15 minutes.",
        "Rinse with lukewarm water.",
      ],
    },
    keyIngredients: {
      en: [
        "Glycolic Acid",
        "Kaolin",
        "Bentonite",
        "Olive Leaf Extract",
        "Horse Chestnut Extract",
        "Chlorophyll",
      ],
      ar: [
        "Glycolic Acid",
        "Kaolin",
        "Bentonite",
        "Olive Leaf Extract",
        "Horse Chestnut Extract",
        "Chlorophyll",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/purifying/aha-mask.jpg",
        status: "approved",
        alt: { en: "The AHA Mask by Myriade", ar: "The AHA Mask by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "aha-cream",
    slug: "aha-cream",
    slugAr: "aha-cream",
    name: { en: "The AHA Cream", ar: "The AHA Cream" },
    brandId: "myriade",
    subtitle: { en: "Exfoliating and anti-aging night cream", ar: "Exfoliating and anti-aging night cream" },
    categoryIds: ["purifying"],
    concernIds: [],
    sizeLabel: "50 ml",
    priceCents: null,
    benefits: {
      en: [
        "Brightens and exfoliates skin.",
        "Reduces the appearance of pigmentation spots, wrinkles, fine lines, and enlarged pores.",
        "Helps improve roughness, yellowish complexion, and skin texture.",
      ],
      ar: [
        "Brightens and exfoliates skin.",
        "Reduces the appearance of pigmentation spots, wrinkles, fine lines, and enlarged pores.",
        "Helps improve roughness, yellowish complexion, and skin texture.",
      ],
    },
    keyFeatures: {
      en: [
        "Oil-free and non-comedogenic formula.",
        "Suitable for dry or rough skin.",
        "Photosensitive.",
      ],
      ar: [
        "Oil-free and non-comedogenic formula.",
        "Suitable for dry or rough skin.",
        "Photosensitive.",
      ],
    },
    directions: {
      en: [
        "Apply to clean, dry skin before bedtime.",
        "Apply after serum.",
      ],
      ar: [
        "Apply to clean, dry skin before bedtime.",
        "Apply after serum.",
      ],
    },
    keyIngredients: {
      en: [
        "Glycolic Acid 5%",
        "Shea Butter",
        "Squalane",
        "Panthenol",
        "Tea Oil",
      ],
      ar: [
        "Glycolic Acid 5%",
        "Shea Butter",
        "Squalane",
        "Panthenol",
        "Tea Oil",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/purifying/aha-cream.png",
        status: "approved",
        alt: { en: "The AHA Cream by Myriade", ar: "The AHA Cream by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "regenerating",
    slug: "regenerating",
    slugAr: "regenerating",
    name: { en: "The Regenerating", ar: "The Regenerating" },
    brandId: "myriade",
    subtitle: { en: "Anti-aging and strengthening day and/or night cream", ar: "Anti-aging and strengthening day and/or night cream" },
    categoryIds: ["anti-aging-repairing"],
    concernIds: [],
    sizeLabel: "50 ml",
    priceCents: null,
    benefits: {
      en: [
        "Reduces and soothes redness associated with rosacea, weather, AHAs, and retinoids.",
        "Provides anti-aging and moisturizing properties.",
      ],
      ar: [
        "Reduces and soothes redness associated with rosacea, weather, AHAs, and retinoids.",
        "Provides anti-aging and moisturizing properties.",
      ],
    },
    keyFeatures: {
      en: [
        "Contains hyaluronic acid and vitamins C and E.",
        "Enriched with peptides, omegas, and stem-cell protectors.",
        "Suitable for sensitive and reactive skin.",
      ],
      ar: [
        "Contains hyaluronic acid and vitamins C and E.",
        "Enriched with peptides, omegas, and stem-cell protectors.",
        "Suitable for sensitive and reactive skin.",
      ],
    },
    directions: {
      en: [
        "Apply daily to clean, dry skin and massage until absorbed.",
        "May be used morning and night.",
      ],
      ar: [
        "Apply daily to clean, dry skin and massage until absorbed.",
        "May be used morning and night.",
      ],
    },
    keyIngredients: {
      en: [
        "Trehalose",
        "Hyaluronic Acid",
        "Vitamin C",
        "Acetyl Hexapeptide-8",
        "Palmitoyl Tripeptide-1",
        "Palmitoyl Tetrapeptide-7",
        "Pentapeptide-18",
        "Caffeine",
        "Pea Peptide",
      ],
      ar: [
        "Trehalose",
        "Hyaluronic Acid",
        "Vitamin C",
        "Acetyl Hexapeptide-8",
        "Palmitoyl Tripeptide-1",
        "Palmitoyl Tetrapeptide-7",
        "Pentapeptide-18",
        "Caffeine",
        "Pea Peptide",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/anti-aging-and-repairing/regenerating.jpg",
        status: "approved",
        alt: { en: "The Regenerating by Myriade", ar: "The Regenerating by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "dermo-repair-complex-1",
    slug: "dermo-repair-complex-1",
    slugAr: "dermo-repair-complex-1",
    name: { en: "The Dermo-Repair Complex 1", ar: "The Dermo-Repair Complex 1" },
    brandId: "myriade",
    subtitle: { en: "Hydrating, repairing, and anti-aging day and night cream", ar: "Hydrating, repairing, and anti-aging day and night cream" },
    categoryIds: ["anti-aging-repairing"],
    concernIds: [],
    sizeLabel: "50 ml",
    priceCents: null,
    benefits: {
      en: [
        "Repairs and protects skin after ablative procedures, and skin that is extremely dehydrated.",
        "Supports healing and helps reduce infection risk.",
      ],
      ar: [
        "Repairs and protects skin after ablative procedures, and skin that is extremely dehydrated.",
        "Supports healing and helps reduce infection risk.",
      ],
    },
    keyFeatures: {
      en: [
        "Repairing, restructuring, moisturizing, and anti-aging properties.",
        "Designed for immediate post-procedure use.",
        "Forms a protective shield against free radicals.",
        "Suitable for dry, sensitive, and reactive skin.",
      ],
      ar: [
        "Repairing, restructuring, moisturizing, and anti-aging properties.",
        "Designed for immediate post-procedure use.",
        "Forms a protective shield against free radicals.",
        "Suitable for dry, sensitive, and reactive skin.",
      ],
    },
    directions: {
      en: [
        "Apply immediately to clean, dry skin.",
        "Massage gently until fully absorbed.",
      ],
      ar: [
        "Apply immediately to clean, dry skin.",
        "Massage gently until fully absorbed.",
      ],
    },
    keyIngredients: {
      en: [
        "Glycofilm 5%",
        "Hyaluronic Acid",
        "Beta-Glucan",
        "Ceramides",
        "Oat Oil",
        "Purified Silver",
      ],
      ar: [
        "Glycofilm 5%",
        "Hyaluronic Acid",
        "Beta-Glucan",
        "Ceramides",
        "Oat Oil",
        "Purified Silver",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/anti-aging-and-repairing/dermo-repair-complex-1.jpg",
        status: "approved",
        alt: { en: "The Dermo-Repair Complex 1 by Myriade", ar: "The Dermo-Repair Complex 1 by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "dermo-repair-complex-2",
    slug: "dermo-repair-complex-2",
    slugAr: "dermo-repair-complex-2",
    name: { en: "The Dermo-Repair Complex 2", ar: "The Dermo-Repair Complex 2" },
    brandId: "myriade",
    subtitle: { en: "Hydrating and repairing night cream", ar: "Hydrating and repairing night cream" },
    categoryIds: ["anti-aging-repairing"],
    concernIds: [],
    sizeLabel: "50 ml",
    priceCents: null,
    benefits: {
      en: [
        "Repairs skin during healing after ablative dermo-aesthetic treatments.",
        "Helps restore the skin's natural protective barrier.",
      ],
      ar: [
        "Repairs skin during healing after ablative dermo-aesthetic treatments.",
        "Helps restore the skin's natural protective barrier.",
      ],
    },
    keyFeatures: {
      en: [
        "Non-occlusive formula supporting optimal healing.",
        "Helps reduce post-inflammatory hyperpigmentation, scars, redness, and sensitivity.",
        "Suitable for severe dehydration, irritation, and dry, sensitive, or reactive skin.",
      ],
      ar: [
        "Non-occlusive formula supporting optimal healing.",
        "Helps reduce post-inflammatory hyperpigmentation, scars, redness, and sensitivity.",
        "Suitable for severe dehydration, irritation, and dry, sensitive, or reactive skin.",
      ],
    },
    directions: {
      en: [
        "Apply to clean, dry skin.",
      ],
      ar: [
        "Apply to clean, dry skin.",
      ],
    },
    keyIngredients: {
      en: [
        "Hyaluronic Acid (2 molecular weights)",
        "Defensil-Plus",
        "Ceramides",
        "Purified Silver",
        "Tranexamic Acid 2%",
        "Niacinamide 1%",
      ],
      ar: [
        "Hyaluronic Acid (2 molecular weights)",
        "Defensil-Plus",
        "Ceramides",
        "Purified Silver",
        "Tranexamic Acid 2%",
        "Niacinamide 1%",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/anti-aging-and-repairing/dermo-repair-complex-2.jpg",
        status: "approved",
        alt: { en: "The Dermo-Repair Complex 2 by Myriade", ar: "The Dermo-Repair Complex 2 by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "lift-eye-contour",
    slug: "lift-eye-contour",
    slugAr: "lift-eye-contour",
    name: { en: "The Lift Eye Contour", ar: "The Lift Eye Contour" },
    brandId: "myriade",
    subtitle: { en: "Anti-aging and revitalizing day and night serum-gel", ar: "Anti-aging and revitalizing day and night serum-gel" },
    categoryIds: ["anti-aging-repairing"],
    concernIds: [],
    sizeLabel: "15 ml",
    priceCents: null,
    benefits: {
      en: [
        "Reduces and helps prevent wrinkles, fine lines, puffiness, and dark circles.",
        "Provides an immediate glow for eye and lip contours.",
      ],
      ar: [
        "Reduces and helps prevent wrinkles, fine lines, puffiness, and dark circles.",
        "Provides an immediate glow for eye and lip contours.",
      ],
    },
    keyFeatures: {
      en: [
        "Lightweight, concentrated formula.",
        "Hydrates and soothes with hyaluronic acid and witch hazel water.",
        "Contains amino acids supporting collagen synthesis and brightening.",
        "Supports microcirculation to reduce puffiness and swelling.",
        "Suitable for all skin types.",
      ],
      ar: [
        "Lightweight, concentrated formula.",
        "Hydrates and soothes with hyaluronic acid and witch hazel water.",
        "Contains amino acids supporting collagen synthesis and brightening.",
        "Supports microcirculation to reduce puffiness and swelling.",
        "Suitable for all skin types.",
      ],
    },
    directions: {
      en: [
        "Apply gently to eye and lip contours morning and night on clean, dry skin.",
        "Massage gently until absorbed.",
      ],
      ar: [
        "Apply gently to eye and lip contours morning and night on clean, dry skin.",
        "Massage gently until absorbed.",
      ],
    },
    keyIngredients: {
      en: [
        "Hyaluronic Acid 5%",
        "Beta-Glucans",
        "Tranexamic Acid 0.5%",
        "Acetyl Hexapeptide-8 5%",
        "Pentapeptide-18 5%",
        "Acetyl Tetrapeptide-5 5%",
      ],
      ar: [
        "Hyaluronic Acid 5%",
        "Beta-Glucans",
        "Tranexamic Acid 0.5%",
        "Acetyl Hexapeptide-8 5%",
        "Pentapeptide-18 5%",
        "Acetyl Tetrapeptide-5 5%",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/anti-aging-and-repairing/lift-eye-contour.jpg",
        status: "approved",
        alt: { en: "The Lift Eye Contour by Myriade", ar: "The Lift Eye Contour by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "collagen-activator-serum",
    slug: "collagen-activator-serum",
    slugAr: "collagen-activator-serum",
    name: { en: "The Collagen Activator Serum", ar: "The Collagen Activator Serum" },
    brandId: "myriade",
    subtitle: { en: "Anti-aging and revitalizing day and night serum", ar: "Anti-aging and revitalizing day and night serum" },
    categoryIds: ["anti-aging-repairing"],
    concernIds: [],
    sizeLabel: "30 ml",
    priceCents: null,
    benefits: {
      en: [
        "Stimulates collagen production.",
        "Reduces wrinkles and repairs environmental damage.",
        "Firms and tones skin for a more youthful appearance.",
        "Deeply hydrates and leaves skin silky.",
        "Protects the skin against environmental stressors.",
      ],
      ar: [
        "Stimulates collagen production.",
        "Reduces wrinkles and repairs environmental damage.",
        "Firms and tones skin for a more youthful appearance.",
        "Deeply hydrates and leaves skin silky.",
        "Protects the skin against environmental stressors.",
      ],
    },
    keyFeatures: {
      en: [
        "Formula with hyaluronic acid, beta-glucan, plant stem cells, and ceramides.",
        "Supports skin hydration and protection.",
        "Suitable for all skin types.",
      ],
      ar: [
        "Formula with hyaluronic acid, beta-glucan, plant stem cells, and ceramides.",
        "Supports skin hydration and protection.",
        "Suitable for all skin types.",
      ],
    },
    directions: {
      en: [
        "Apply to clean, dry skin and massage until absorbed.",
        "Use before AHA cream.",
      ],
      ar: [
        "Apply to clean, dry skin and massage until absorbed.",
        "Use before AHA cream.",
      ],
    },
    keyIngredients: {
      en: [
        "Hyaluronic Acid",
        "Beta-Glucans",
        "Plant Stem Cells",
        "Ceramides",
      ],
      ar: [
        "Hyaluronic Acid",
        "Beta-Glucans",
        "Plant Stem Cells",
        "Ceramides",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/anti-aging-and-repairing/collagen-activator-serum.jpg",
        status: "approved",
        alt: { en: "The Collagen Activator Serum by Myriade", ar: "The Collagen Activator Serum by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "mineral-sunscreen-spf-30",
    slug: "mineral-sunscreen-spf-30",
    slugAr: "mineral-sunscreen-spf-30",
    name: { en: "The Mineral Sunscreen SPF 30", ar: "The Mineral Sunscreen SPF 30" },
    brandId: "myriade",
    subtitle: { en: "Protects skin and helps prevent sunburn", ar: "Protects skin and helps prevent sunburn" },
    categoryIds: ["sunscreen"],
    concernIds: [],
    sizeLabel: "50 ml",
    priceCents: null,
    benefits: {
      en: [
        "Offers broad-spectrum UVA and UVB protection.",
        "Absorbs quickly without a greasy residue.",
        "Hydrates and soothes while protecting against sun-related dehydration.",
        "Helps prevent early visible signs of skin aging.",
      ],
      ar: [
        "Offers broad-spectrum UVA and UVB protection.",
        "Absorbs quickly without a greasy residue.",
        "Hydrates and soothes while protecting against sun-related dehydration.",
        "Helps prevent early visible signs of skin aging.",
      ],
    },
    keyFeatures: {
      en: [
        "Formulated with natural ingredients.",
        "Contains anti-aging, hydrating, and soothing ingredients.",
        "Suitable for all skin types, including sensitive skin.",
      ],
      ar: [
        "Formulated with natural ingredients.",
        "Contains anti-aging, hydrating, and soothing ingredients.",
        "Suitable for all skin types, including sensitive skin.",
      ],
    },
    directions: {
      en: [
        "Apply generously and evenly 15 minutes before sun exposure.",
        "Reapply at least every 2 hours or after swimming.",
        "Avoid contact with eyes.",
      ],
      ar: [
        "Apply generously and evenly 15 minutes before sun exposure.",
        "Reapply at least every 2 hours or after swimming.",
        "Avoid contact with eyes.",
      ],
    },
    keyIngredients: {
      en: [
        "Zinc Oxide",
        "Titanium Dioxide",
        "Hyaluronic Acid",
        "Caprylic Triglyceride",
        "Vitamin E",
        "Kigelia Extract",
        "Quillaja Extract",
        "Lavandula Hybrida",
      ],
      ar: [
        "Zinc Oxide",
        "Titanium Dioxide",
        "Hyaluronic Acid",
        "Caprylic Triglyceride",
        "Vitamin E",
        "Kigelia Extract",
        "Quillaja Extract",
        "Lavandula Hybrida",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/sun-care/mineral-sunscreen-spf-30.png",
        status: "approved",
        alt: { en: "The Mineral Sunscreen SPF 30 by Myriade", ar: "The Mineral Sunscreen SPF 30 by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "oily-skin-problem-kit",
    slug: "oily-skin-problem-kit",
    slugAr: "oily-skin-problem-kit",
    name: { en: "Oily Skin Problem Kit", ar: "Oily Skin Problem Kit" },
    brandId: "myriade",
    subtitle: { en: "Post-treatment support for purifying peels, IPL, or facial treatments for teenage skin", ar: "Post-treatment support for purifying peels, IPL, or facial treatments for teenage skin" },
    categoryIds: ["kits"],
    concernIds: [],
    sizeLabel: "3-month kit — complete set",
    priceCents: null,
    kitContents: {
      en: [
        "The Cleanser 100 ml",
        "The Soothing Gel 100 ml",
        "The Protective Day Fluid 50 ml",
        "The AHA BHA Lotion 30 ml",
      ],
      ar: [
        "The Cleanser 100 ml",
        "The Soothing Gel 100 ml",
        "The Protective Day Fluid 50 ml",
        "The AHA BHA Lotion 30 ml",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/kits/oily-skin-problem-kit.png",
        status: "approved",
        alt: { en: "Oily Skin Problem Kit by Myriade", ar: "Oily Skin Problem Kit by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "redness-kit",
    slug: "redness-kit",
    slugAr: "redness-kit",
    name: { en: "Redness Kit", ar: "Redness Kit" },
    brandId: "myriade",
    subtitle: { en: "Post-treatment support for IPL, Nd:YAG laser, or redness and sensitivity care", ar: "Post-treatment support for IPL, Nd:YAG laser, or redness and sensitivity care" },
    categoryIds: ["kits"],
    concernIds: [],
    sizeLabel: "3-month kit — complete set support",
    priceCents: null,
    kitContents: {
      en: [
        "The Cleanser 100 ml",
        "The Soothing Mask 100 ml",
        "The Protective Day Cream 50 ml",
        "The Regenerating Cream 50 ml",
      ],
      ar: [
        "The Cleanser 100 ml",
        "The Soothing Mask 100 ml",
        "The Protective Day Cream 50 ml",
        "The Regenerating Cream 50 ml",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/kits/redness-kit.png",
        status: "approved",
        alt: { en: "Redness Kit by Myriade", ar: "Redness Kit by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "skin-resurfacing-support-kit",
    slug: "skin-resurfacing-support-kit",
    slugAr: "skin-resurfacing-support-kit",
    name: { en: "Skin Resurfacing Support Kit", ar: "Skin Resurfacing Support Kit" },
    brandId: "myriade",
    subtitle: { en: "Post-treatment support for ablative fractional laser", ar: "Post-treatment support for ablative fractional laser" },
    categoryIds: ["kits"],
    concernIds: [],
    sizeLabel: "3-month kit — complete set support",
    priceCents: null,
    kitContents: {
      en: [
        "The Cleanser 100 ml",
        "The Ultra Protective 50 ml",
        "The Dermo-Repair Complex 1 50 ml",
        "The Dermo-Repair Complex 2 50 ml",
      ],
      ar: [
        "The Cleanser 100 ml",
        "The Ultra Protective 50 ml",
        "The Dermo-Repair Complex 1 50 ml",
        "The Dermo-Repair Complex 2 50 ml",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/kits/skin-resurfacing-support-kit.png",
        status: "approved",
        alt: { en: "Skin Resurfacing Support Kit by Myriade", ar: "Skin Resurfacing Support Kit by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "repair-kit",
    slug: "repair-kit",
    slugAr: "repair-kit",
    name: { en: "Repair Kit", ar: "Repair Kit" },
    brandId: "myriade",
    subtitle: { en: "Post-treatment support for microneedling, non-ablative fractional laser, or skin-tissue repair", ar: "Post-treatment support for microneedling, non-ablative fractional laser, or skin-tissue repair" },
    categoryIds: ["kits"],
    concernIds: [],
    sizeLabel: "3-month kit — complete set support",
    priceCents: null,
    kitContents: {
      en: [
        "The Cleanser 100 ml",
        "The Soothing Gel 100 ml",
        "The Protective Day Cream 50 ml",
        "The Dermo-Repair Complex 2 50 ml",
      ],
      ar: [
        "The Cleanser 100 ml",
        "The Soothing Gel 100 ml",
        "The Protective Day Cream 50 ml",
        "The Dermo-Repair Complex 2 50 ml",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/kits/repair-kit.png",
        status: "approved",
        alt: { en: "Repair Kit by Myriade", ar: "Repair Kit by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "pigmentary-disorders-kit",
    slug: "pigmentary-disorders-kit",
    slugAr: "pigmentary-disorders-kit",
    name: { en: "Pigmentary Disorders Kit", ar: "Pigmentary Disorders Kit" },
    brandId: "myriade",
    subtitle: { en: "Post-treatment support for IPL, laser, brightening peel, or complexion-evening care", ar: "Post-treatment support for IPL, laser, brightening peel, or complexion-evening care" },
    categoryIds: ["kits"],
    concernIds: [],
    sizeLabel: "3-month kit — complete set",
    priceCents: null,
    kitContents: {
      en: [
        "The Cleanser 100 ml",
        "The Soothing Gel 100 ml",
        "The Ultra Protective Cream 50 ml",
        "The C-Retinol 50 ml",
      ],
      ar: [
        "The Cleanser 100 ml",
        "The Soothing Gel 100 ml",
        "The Ultra Protective Cream 50 ml",
        "The C-Retinol 50 ml",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/kits/pigmentary-disorders-kit.jpg",
        status: "approved",
        alt: { en: "Pigmentary Disorders Kit by Myriade", ar: "Pigmentary Disorders Kit by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "normal-skin-kit",
    slug: "normal-skin-kit",
    slugAr: "normal-skin-kit",
    name: { en: "Normal Skin Kit", ar: "Normal Skin Kit" },
    brandId: "myriade",
    subtitle: { en: "Discovery, travel, or early post-treatment support", ar: "Discovery, travel, or early post-treatment support" },
    categoryIds: ["kits"],
    concernIds: [],
    sizeLabel: "Complete set",
    priceCents: null,
    kitContents: {
      en: [
        "The Cleanser 30 ml",
        "The Soothing Gel 30 ml",
        "The Protective Day Cream 50 ml",
        "The Dermo-Repair Complex 2 50 ml",
      ],
      ar: [
        "The Cleanser 30 ml",
        "The Soothing Gel 30 ml",
        "The Protective Day Cream 50 ml",
        "The Dermo-Repair Complex 2 50 ml",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/kits/normal-skin-kit.jpg",
        status: "approved",
        alt: { en: "Normal Skin Kit by Myriade", ar: "Normal Skin Kit by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "oily-skin-kit",
    slug: "oily-skin-kit",
    slugAr: "oily-skin-kit",
    name: { en: "Oily Skin Kit", ar: "Oily Skin Kit" },
    brandId: "myriade",
    subtitle: { en: "Discovery, travel, or early post-treatment support for oily skin", ar: "Discovery, travel, or early post-treatment support for oily skin" },
    categoryIds: ["kits"],
    concernIds: [],
    sizeLabel: "Complete set",
    priceCents: null,
    kitContents: {
      en: [
        "The Cleanser 30 ml",
        "The Soothing Gel 30 ml",
        "The Protective Day Fluid 5 ml",
        "The Dermo-Repair Complex 2 5 ml",
      ],
      ar: [
        "The Cleanser 30 ml",
        "The Soothing Gel 30 ml",
        "The Protective Day Fluid 5 ml",
        "The Dermo-Repair Complex 2 5 ml",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/kits/oily-skin-kit.jpg",
        status: "approved",
        alt: { en: "Oily Skin Kit by Myriade", ar: "Oily Skin Kit by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "skin-resurfacing-kit",
    slug: "skin-resurfacing-kit",
    slugAr: "skin-resurfacing-kit",
    name: { en: "Skin Resurfacing Kit", ar: "Skin Resurfacing Kit" },
    brandId: "myriade",
    subtitle: { en: "Discovery, travel, or early post-treatment support after dermo-aesthetic treatment", ar: "Discovery, travel, or early post-treatment support after dermo-aesthetic treatment" },
    categoryIds: ["kits"],
    concernIds: [],
    sizeLabel: "Complete set",
    priceCents: null,
    kitContents: {
      en: [
        "The Cleanser 30 ml",
        "The Ultra Protective 5 ml",
        "The Dermo-Repair Complex 1 5 ml",
        "The Dermo-Repair Complex 2 5 ml",
      ],
      ar: [
        "The Cleanser 30 ml",
        "The Ultra Protective 5 ml",
        "The Dermo-Repair Complex 1 5 ml",
        "The Dermo-Repair Complex 2 5 ml",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/kits/skin-resurfacing-kit.jpg",
        status: "approved",
        alt: { en: "Skin Resurfacing Kit by Myriade", ar: "Skin Resurfacing Kit by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: false,
    purchaseBlocked: { en: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic.", ar: "This product is shown for information only and is not available to purchase online. Availability and current pricing are confirmed directly with the clinic." },
  },
  {
    id: "micro-needle-care",
    slug: "micro-needle-care",
    slugAr: "micro-needle-care",
    name: { en: "Micro-Needle Care", ar: "Micro-Needle Care" },
    brandId: "myriade",
    subtitle: { en: "Anti-aging and repairing", ar: "Anti-aging and repairing" },
    categoryIds: ["professional-care"],
    concernIds: [],
    sizeLabel: "4 x 5 ml",
    priceCents: null,
    benefits: {
      en: [
        "Improves skin texture and reduces visible signs of aging.",
        "Provides intensive hydration with aloe and hyaluronic acid.",
        "Supports treatment of wrinkles, fine lines, enlarged pores, superficial scars, and stretch marks.",
        "Promotes rapid healing of skin tissue.",
      ],
      ar: [
        "Improves skin texture and reduces visible signs of aging.",
        "Provides intensive hydration with aloe and hyaluronic acid.",
        "Supports treatment of wrinkles, fine lines, enlarged pores, superficial scars, and stretch marks.",
        "Promotes rapid healing of skin tissue.",
      ],
    },
    keyFeatures: {
      en: [
        "High-performance serum combining peptides, collagen-supporting ingredients, beta-glucans, and plant stem cells.",
        "Designed for microneedling treatments.",
        "Supports firmer and more radiant-looking skin.",
      ],
      ar: [
        "High-performance serum combining peptides, collagen-supporting ingredients, beta-glucans, and plant stem cells.",
        "Designed for microneedling treatments.",
        "Supports firmer and more radiant-looking skin.",
      ],
    },
    directions: {
      en: [
        "Use with the post-treatment repair kit as directed by the treating professional.",
      ],
      ar: [
        "Use with the post-treatment repair kit as directed by the treating professional.",
      ],
    },
    keyIngredients: {
      en: [
        "Palmitoyl Tripeptide-5",
        "Palmitoyl Dipeptide-5 Diaminobutyroyl Hydroxythreonine",
        "Beta-Glucan",
        "Argan Stem Cells",
        "Symphytum (Comfrey) Stem Cells",
      ],
      ar: [
        "Palmitoyl Tripeptide-5",
        "Palmitoyl Dipeptide-5 Diaminobutyroyl Hydroxythreonine",
        "Beta-Glucan",
        "Argan Stem Cells",
        "Symphytum (Comfrey) Stem Cells",
      ],
    },
    images: [
      {
        path: "/blue-diamond/products/myriade/professional-care/micro-needle-care.jpg",
        status: "approved",
        alt: { en: "Micro-Needle Care by Myriade", ar: "Micro-Needle Care by Myriade" },
      },
    ],
    approvalStatus: "approved",
    inStock: false,
    professionalOnly: true,
    purchaseBlocked: { en: "This is a professional-use product applied by a trained clinician at Blue Diamond Medical. It is shown here for information and is not available to purchase online — please ask the clinic.", ar: "This is a professional-use product applied by a trained clinician at Blue Diamond Medical. It is shown here for information and is not available to purchase online — please ask the clinic." },
  },
];

/**
 * The published catalogue.
 *
 * Order is deliberate: while `skinMedicaEnabled` is true the archived
 * SkinMedica records come FIRST, which is the order /shop, the route registry
 * and the sitemap published in until 2026-09-07. Restoring the line therefore
 * restores the exact previous catalogue, not a reshuffled one.
 */
export const products: Product[] = [
  ...(features.skinMedicaEnabled ? archivedSkinMedicaProducts : []),
  ...myriadeProducts,
];

/**
 * Categories that the published catalogue actually fills.
 *
 * Derived, not written down: `src/config/routes.ts` builds one route per entry
 * here, and /shop links every one of them. Archiving SkinMedica emptied seven
 * groupings (cleansers, serums, moisturizers, retinol, eye-care, scar-care,
 * treatment-systems) — publishing routes for them would have shipped seven
 * indexable-by-accident listing pages with nothing on them, and seven filter
 * chips on /shop that lead to an empty grid. Filtering here removes the route,
 * the link and the page in one move, and brings them all back the moment the
 * flag does.
 */
export const productCategories: ProductCategory[] = allProductCategories.filter((category) =>
  products.some((product) => product.categoryIds.includes(category.id)),
);

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/**
 * Looks up by `id`, not `slug` — needed because `variantOfId` and
 * `detail.relatedProductIds` both point at a product's `id` (per
 * `src/features/products/types.ts`'s own doc comments), and `id` differs from
 * `slug` for 5 of the 23 products (e.g. "scar-recovery-gel-small" vs.
 * slug "scar-recovery-gel-with-centelline-small"). Calling `getProduct()`
 * with an id instead of a slug silently returns undefined for those —
 * a real bug this helper exists to prevent.
 */
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
