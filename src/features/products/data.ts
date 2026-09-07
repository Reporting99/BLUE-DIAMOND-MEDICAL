import type { Product, ProductBrand, ProductCategory, ProductConcern, ProductSource } from "@/features/products/types";

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
 * `shopEnabled` stays `false` (src/config/features.ts): the data blocker
 * is resolved (23/23 approved records, all with real detail content now),
 * but no SkinMedica product photography exists in the approved image
 * archive — see docs/MEDIA.md. Nothing else blocks
 * flipping the flag once photography exists.
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

export const productCategories: ProductCategory[] = [
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

export const productBrands: ProductBrand[] = [
  { id: "skinmedica", slug: "skinmedica", slugAr: "سكين-ميديكا", name: "SkinMedica" },
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
  "the-growth-factor": { en: "Groundbreaking science for skin that's transformed", ar: "علم رائد لبشرة متجددة" },
  "the-cleanse-factor": { en: "An array of cleansers for every skin type", ar: "مجموعة من المنظفات لكل أنواع البشرة" },
  "the-correct-factor": { en: "Target a wide variety of skin concerns", ar: "تستهدف مجموعة واسعة من مخاوف البشرة" },
  "the-protect-factor": { en: "Everyday protection for all skin types", ar: "حماية يومية لجميع أنواع البشرة" },
  "the-hydration-factor": { en: "Essential hydration skin needs", ar: "الترطيب الأساسي الذي تحتاجه البشرة" },
};

/**
 * The placeholder record a product falls back to when FeelStack has no
 * `productPrimary` assignment for it.
 *
 * It carries NO path. The previous version built one from the slug —
 * `${MEDIA_ROOT}/products/skinmedica/<slug>.jpg` — a location no asset has
 * ever occupied: the real packshots live under `/blue-diamond/shop/` with
 * catalogue-numbered filenames, and FeelStack decides which belongs to which
 * product. Guessing a path from a slug was inert only because `status` is
 * `"pending"` and `ImageKitImage` refuses to request bytes below `"approved"`;
 * flipping that status would have pointed 23 products at 23 URLs that 404.
 *
 * An empty path is the honest statement — "no image, and nothing here knows
 * where one would be" — and it keeps the source of truth in one place. Adding
 * a photograph is a CMS action: upload, approve, assign `productPrimary`,
 * publish. No code change, no redeploy.
 */
function pendingImage(_slug: string, name: Product["name"]): Product["images"][number] {
  return { path: "", status: "pending", alt: name };
}

const officialSite: Omit<ProductSource, "url"> = { retrievedDate: "2026-08-22", publisher: "SkinMedica official site (skinmedica.com — the .ca storefront returned an access error during research; .com is the same manufacturer/brand and used as the verification source)" };
const caRetailer = (name: string): Omit<ProductSource, "url"> => ({ retrievedDate: "2026-08-22", publisher: `${name} — authorized Canadian SkinMedica retailer, used to confirm current Canadian-market naming/pricing` });

export const products: Product[] = [
  // ============ THE GROWTH FACTOR ============
  {
    id: "lumivive-system",
    slug: "lumivive-system-day-night",
    slugAr: "نظام-لوميفيف-نهار-ليل",
    name: { en: "Lumivive® System Day, Night", ar: "نظام لوميفيف® (نهار، ليل)" },
    brandId: "skinmedica",
    categoryIds: ["treatment-systems"],
    concernIds: [],
    priceCents: 28500,
    sizeLabel: "28.4 g",
    images: [pendingImage("lumivive-system-day-night", { en: "Lumivive® System Day, Night", ar: "نظام لوميفيف® (نهار، ليل)" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: {
        en: "A two-step day-and-night system: a daytime step formulated to help shield skin from blue light and environmental stress, and a nighttime step formulated to support skin's overnight repair process.",
        ar: "نظام من خطوتين للنهار والليل: خطوة نهارية مصممة للمساعدة في حماية البشرة من الضوء الأزرق والإجهاد البيئي، وخطوة ليلية مصممة لدعم عملية إصلاح البشرة أثناء الليل.",
      },
      whatItIs: {
        en: "A two-bottle treatment system (Day, Night), not a single product — both bottles are included in this one price/size record.",
        ar: "نظام علاجي من زجاجتين (نهار، ليل) وليس منتجًا واحدًا — كلتا الزجاجتين مشمولتان بهذا السعر والحجم.",
      },
      productType: { en: "Two-step antioxidant treatment system", ar: "نظام علاجي مضاد للأكسدة من خطوتين" },
      routinePlacement: { en: "After cleansing and toning, before other treatment products and moisturizer — Day in the morning, Night in the evening.", ar: "بعد التنظيف والتونر، وقبل باقي منتجات العلاج والمرطب — خطوة النهار صباحًا وخطوة الليل مساءً." },
      keyCharacteristics: {
        en: ["Two-step system: Day and Night formulas", "Contains antioxidants including Coenzyme Q10, Niacinamide, Panthenol, Peptides, Shea Butter, and Vitamin E, per manufacturer information"],
        ar: ["نظام من خطوتين: تركيبة نهارية وأخرى ليلية", "يحتوي على مضادات أكسدة تشمل إنزيم Q10، النياسيناميد، البانثينول، الببتيدات، زبدة الشيا، وفيتامين E، وفق معلومات الشركة المصنّعة"],
      },
      howToUse: {
        en: "Apply 1 pump of the Day formula in the morning and 1 pump of the Night formula in the evening, after cleansing and toning, to face, neck, and décolletage.",
        ar: "ضعوا ضغطة واحدة من تركيبة النهار صباحًا وضغطة واحدة من تركيبة الليل مساءً، بعد التنظيف والتونر، على الوجه والرقبة وأعلى الصدر.",
      },
      relatedProductIds: ["vitamin-c-e-complex", "tns-eye-repair"],
      faqs: [
        { question: { en: "Is this one product or two?", ar: "هل هذا منتج واحد أم اثنان؟" }, answer: { en: "It's a two-bottle system — a Day formula and a Night formula — sold together as one record at this price and size.", ar: "هو نظام من زجاجتين — تركيبة نهارية وأخرى ليلية — تُباع معًا بهذا السعر والحجم." } },
        { question: { en: "When do I use each bottle?", ar: "متى أستخدم كل زجاجة؟" }, answer: { en: "The Day formula in the morning and the Night formula in the evening, both after cleansing and toning.", ar: "تركيبة النهار صباحًا وتركيبة الليل مساءً، وكلتاهما بعد التنظيف والتونر." } },
        { question: { en: "What is Lumivive designed to help with?", ar: "ما الذي صُمم نظام لوميفيف للمساعدة فيه؟" }, answer: { en: "Per manufacturer information, the Day formula is designed to help shield skin from blue light and environmental stress, and the Night formula is designed to support the skin's overnight repair process.", ar: "وفق معلومات الشركة المصنّعة، صُممت تركيبة النهار للمساعدة في حماية البشرة من الضوء الأزرق والإجهاد البيئي، وصُممت تركيبة الليل لدعم عملية إصلاح البشرة أثناء الليل." } },
        { question: { en: "Where do I apply it?", ar: "أين أضعه؟" }, answer: { en: "Face, neck, and décolletage.", ar: "الوجه والرقبة وأعلى الصدر." } },
        { question: { en: "Can I combine this with other SkinMedica products?", ar: "هل يمكنني الجمع بينه وبين منتجات أخرى من سكين ميديكا؟" }, answer: { en: "This is a routine question best confirmed with the clinic directly, since it depends on your full regimen.", ar: "هذا سؤال يتعلق بروتين العناية ويُفضَّل تأكيده مباشرة مع العيادة، لأنه يعتمد على نظام عنايتكم الكامل." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتأكد من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly — see the notice above.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية — راجعوا الإشعار أعلاه." } },
      ],
      sources: [{ url: "https://www.skinmedica.com/us/product-category/correction/96202.html", ...officialSite }],
    },
  },
  {
    id: "tns-eye-repair",
    slug: "tns-eye-repair",
    slugAr: "تي-إن-إس-لإصلاح-محيط-العين",
    name: { en: "TNS® Eye Repair", ar: "TNS® لإصلاح محيط العين" },
    brandId: "skinmedica",
    categoryIds: ["eye-care"],
    concernIds: [],
    priceCents: 10800,
    sizeLabel: "14.2 g",
    images: [pendingImage("tns-eye-repair", { en: "TNS® Eye Repair", ar: "TNS® لإصلاح محيط العين" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "A treatment for the skin around the eyes, combining SkinMedica's TNS® growth-factor technology with peptides and vitamins A, C, and E.", ar: "علاج لبشرة محيط العين، يجمع بين تقنية TNS® لعوامل النمو من سكين ميديكا والببتيدات وفيتامينات A وC وE." },
      whatItIs: { en: "An eye-area cream formulated for fine lines, wrinkles, skin tone, and texture around the eyes, per manufacturer information.", ar: "كريم لمنطقة العين مصمم للخطوط الدقيقة والتجاعيد ولون وملمس البشرة حول العين، وفق معلومات الشركة المصنّعة." },
      productType: { en: "Eye-area treatment cream", ar: "كريم علاجي لمحيط العين" },
      routinePlacement: { en: "As a targeted treatment step for the eye area, within a broader skincare routine.", ar: "كخطوة علاجية موجّهة لمنطقة العين، ضمن روتين عناية أوسع." },
      keyCharacteristics: { en: ["Contains TNS® growth-factor technology, peptides, and vitamins A, C, and E, per manufacturer information", "Formulated for the eye area specifically"], ar: ["يحتوي على تقنية TNS® لعوامل النمو، وببتيدات، وفيتامينات A وC وE، وفق معلومات الشركة المصنّعة", "مصمم خصيصًا لمنطقة العين"] },
      howToUse: { en: "Apply to the skin around the eyes as directed by the product packaging or your provider; avoid direct contact with the eyes.", ar: "يُطبَّق على الجلد المحيط بالعين وفق تعليمات العبوة أو مقدم الرعاية؛ يُتجنَّب ملامسة العين مباشرة." },
      relatedProductIds: ["lumivive-system", "dermal-repair-cream"],
      faqs: [
        { question: { en: "What is TNS Eye Repair formulated for?", ar: "لماذا صُمم TNS لإصلاح محيط العين؟" }, answer: { en: "The eye area specifically — fine lines, wrinkles, tone, and texture, per manufacturer information.", ar: "لمنطقة العين تحديدًا — الخطوط الدقيقة والتجاعيد واللون والملمس، وفق معلومات الشركة المصنّعة." } },
        { question: { en: "What is TNS®?", ar: "ما هو TNS®؟" }, answer: { en: "TNS® is SkinMedica's growth-factor technology, used across several products in this catalogue.", ar: "TNS® هي تقنية عوامل النمو من سكين ميديكا، وتُستخدم في عدة منتجات ضمن هذه القائمة." } },
        { question: { en: "Can this go near my eyes safely?", ar: "هل يمكن استخدامه بأمان قرب العينين؟" }, answer: { en: "It's formulated for the eye area, but avoid direct contact with the eyes themselves — confirm technique with your provider.", ar: "هو مصمم لمنطقة العين، لكن يُتجنَّب ملامسة العين نفسها مباشرة — يُنصح بتأكيد طريقة الاستخدام مع مقدم الرعاية." } },
        { question: { en: "What size does this come in?", ar: "ما الحجم المتوفر؟" }, answer: { en: "14.2 g.", ar: "14.2 غرام." } },
        { question: { en: "Is this the same TNS used in TNS Recovery Complex?", ar: "هل هذا TNS نفسه المستخدم في TNS Recovery Complex؟" }, answer: { en: "It's the same underlying SkinMedica TNS® growth-factor technology, formulated here specifically for the eye area.", ar: "هي التقنية نفسها لعوامل النمو TNS® من سكين ميديكا، مصممة هنا خصيصًا لمنطقة العين." } },
        { question: { en: "How do I ask the clinic about this product?", ar: "كيف أستفسر عن هذا المنتج من العيادة؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly for current availability and to discuss whether it suits your routine.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية لمعرفة التوفر الحالي ومناقشة مدى ملاءمته لروتينكم." } },
      ],
      sources: [{ url: "https://skinmedica.com/products/targeted/tnseyerepair", ...officialSite }],
    },
  },
  {
    id: "vitamin-c-e-complex",
    slug: "vitamin-c-e-complex",
    slugAr: "مركب-فيتامين-سي-إي",
    name: { en: "Vitamin C+E Complex", ar: "مركب فيتامين C+E" },
    brandId: "skinmedica",
    categoryIds: ["serums"],
    concernIds: [],
    priceCents: 10800,
    sizeLabel: "28.3 g",
    images: [pendingImage("vitamin-c-e-complex", { en: "Vitamin C+E Complex", ar: "مركب فيتامين C+E" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "A morning antioxidant serum combining vitamin C and vitamin E, formulated to release gradually through the day.", ar: "سيروم صباحي مضاد للأكسدة يجمع بين فيتامين C وفيتامين E، مصمم للتحرر تدريجيًا خلال اليوم." },
      whatItIs: { en: "A vitamin C and E antioxidant serum for daytime use.", ar: "سيروم مضاد للأكسدة بفيتاميني C وE للاستخدام النهاري." },
      productType: { en: "Antioxidant serum", ar: "سيروم مضاد للأكسدة" },
      routinePlacement: { en: "Each morning after cleansing, toning, and (if used) TNS Recovery Complex, and before moisturizer.", ar: "كل صباح بعد التنظيف والتونر، وبعد TNS Recovery Complex (إن استُخدم)، وقبل المرطب." },
      keyCharacteristics: {
        en: ["Contains Ascorbic Acid (vitamin C), Tetrahexyldecyl Ascorbate (a lipid-soluble vitamin C ester), and Tocopherol (vitamin E), per manufacturer information", "Formulated for gradual release through the day"],
        ar: ["يحتوي على حمض الأسكوربيك (فيتامين C)، وTetrahexyldecyl Ascorbate (شكل ذواب في الدهون من فيتامين C)، وTocopherol (فيتامين E)، وفق معلومات الشركة المصنّعة", "مصمم للتحرر التدريجي خلال اليوم"],
      },
      howToUse: { en: "Apply a single pump into the hand and gently apply to the entire face (neck and chest if desired) each morning.", ar: "ضعوا ضغطة واحدة في راحة اليد وطبّقوها بلطف على الوجه بالكامل (والرقبة والصدر إذا رغبتم) كل صباح." },
      relatedProductIds: ["lumivive-system", "daily-physical-defense-spf-34"],
      faqs: [
        { question: { en: "When should I apply this?", ar: "متى أضع هذا المنتج؟" }, answer: { en: "In the morning, after cleansing/toning and before moisturizer.", ar: "في الصباح، بعد التنظيف/التونر وقبل المرطب." } },
        { question: { en: "What vitamins does it contain?", ar: "ما الفيتامينات التي يحتوي عليها؟" }, answer: { en: "Vitamin C (as Ascorbic Acid and Tetrahexyldecyl Ascorbate) and vitamin E (as Tocopherol), per manufacturer information.", ar: "فيتامين C (على شكل حمض الأسكوربيك وTetrahexyldecyl Ascorbate) وفيتامين E (على شكل Tocopherol)، وفق معلومات الشركة المصنّعة." } },
        { question: { en: "Should I still wear sunscreen with this?", ar: "هل ما زلت بحاجة لواقي الشمس مع هذا المنتج؟" }, answer: { en: "An antioxidant serum doesn't replace sunscreen — daily sun protection is a separate, important step.", ar: "لا يُغني السيروم المضاد للأكسدة عن واقي الشمس — الحماية اليومية من الشمس خطوة منفصلة ومهمة." } },
        { question: { en: "How much do I use?", ar: "ما الكمية المستخدمة؟" }, answer: { en: "A single pump, applied to the entire face and optionally neck and chest.", ar: "ضغطة واحدة، تُطبَّق على الوجه بالكامل وبشكل اختياري على الرقبة والصدر." } },
        { question: { en: "What size is this?", ar: "ما الحجم؟" }, answer: { en: "28.3 g.", ar: "28.3 غرام." } },
        { question: { en: "How do I check current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.dermstore.com/p/skinmedica-vitamin-c-plus-e-complex/11289692/", ...caRetailer("Dermstore") }],
    },
  },

  // ============ THE CLEANSE FACTOR ============
  {
    id: "facial-cleanser",
    slug: "facial-cleanser",
    slugAr: "غسول-الوجه",
    name: { en: "Facial Cleanser", ar: "غسول الوجه" },
    brandId: "skinmedica",
    categoryIds: ["cleansers"],
    concernIds: [],
    priceCents: 4000,
    sizeLabel: "177.4 ml",
    images: [pendingImage("facial-cleanser", { en: "Facial Cleanser", ar: "غسول الوجه" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "A foaming daily cleanser formulated for all skin types, with panthenol to support healthy-looking skin.", ar: "غسول رغوي للاستخدام اليومي مصمم لجميع أنواع البشرة، مع البانثينول لدعم مظهر بشرة صحي." },
      whatItIs: { en: "A foaming face wash intended to remove dirt, oil, and makeup.", ar: "غسول رغوي للوجه مخصص لإزالة الأوساخ والزيوت ومستحضرات المكياج." },
      productType: { en: "Foaming facial cleanser", ar: "غسول رغوي للوجه" },
      routinePlacement: { en: "First step of a skincare routine, morning and/or evening.", ar: "الخطوة الأولى في روتين العناية بالبشرة، صباحًا و/أو مساءً." },
      keyCharacteristics: { en: ["Foaming formula for all skin types, per manufacturer information", "Contains panthenol"], ar: ["تركيبة رغوية لجميع أنواع البشرة، وفق معلومات الشركة المصنّعة", "تحتوي على البانثينول"] },
      howToUse: { en: "Wet the face, apply a small amount, work into a lather, and rinse thoroughly.", ar: "بلّلوا الوجه، ضعوا كمية صغيرة، دلّكوها حتى تتكوّن رغوة، ثم اشطفوا جيدًا." },
      relatedProductIds: ["aha-bha-exfoliating-cleanser"],
      faqs: [
        { question: { en: "What skin types is this for?", ar: "لأي أنواع بشرة يناسب هذا المنتج؟" }, answer: { en: "It's described by the manufacturer as suitable for all skin types.", ar: "تصفه الشركة المصنّعة بأنه مناسب لجميع أنواع البشرة." } },
        { question: { en: "Morning, evening, or both?", ar: "صباحًا أم مساءً أم كليهما؟" }, answer: { en: "It can be used as the first step of a morning and/or evening routine.", ar: "يمكن استخدامه كخطوة أولى في الروتين الصباحي و/أو المسائي." } },
        { question: { en: "Is this different from the AHA/BHA Exfoliating Cleanser?", ar: "هل يختلف عن غسول AHA/BHA المقشر؟" }, answer: { en: "Yes — this is a standard foaming cleanser without exfoliating acids; the AHA/BHA Exfoliating Cleanser is a separate, exfoliating product.", ar: "نعم — هذا غسول رغوي عادي دون أحماض مقشرة؛ أما غسول AHA/BHA المقشر فهو منتج منفصل ومقشر." } },
        { question: { en: "What size is this?", ar: "ما الحجم؟" }, answer: { en: "177.4 ml.", ar: "177.4 مل." } },
        { question: { en: "Does this contain fragrance?", ar: "هل يحتوي على عطر؟" }, answer: { en: "Not confirmed by the research for this record — ask the clinic if fragrance-free formulation matters for your skin.", ar: "لم يتأكد ذلك من خلال البحث لهذا السجل — يُرجى سؤال العيادة إذا كانت التركيبة الخالية من العطور مهمة لبشرتكم." } },
        { question: { en: "How do I confirm price and availability?", ar: "كيف أتحقق من السعر والتوفر؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.skinmedica.com/us/product-category/facial-cleansers/", ...officialSite }],
    },
  },
  {
    id: "aha-bha-exfoliating-cleanser",
    slug: "aha-bha-exfoliating-cleanser",
    slugAr: "غسول-مقشر-aha-bha",
    name: { en: "AHA/BHA Exfoliating Cleanser", ar: "غسول مقشر AHA/BHA" },
    brandId: "skinmedica",
    categoryIds: ["cleansers"],
    concernIds: [],
    priceCents: 5000,
    sizeLabel: "177.4 ml",
    images: [pendingImage("aha-bha-exfoliating-cleanser", { en: "AHA/BHA Exfoliating Cleanser", ar: "غسول مقشر AHA/BHA" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "An exfoliating cleanser combining alpha- and beta-hydroxy acids to cleanse and exfoliate in one step.", ar: "غسول مقشر يجمع بين أحماض ألفا وبيتا هيدروكسي للتنظيف والتقشير في خطوة واحدة." },
      whatItIs: { en: "A daily-use exfoliating facial cleanser.", ar: "غسول وجه مقشر للاستخدام اليومي." },
      productType: { en: "AHA/BHA exfoliating cleanser", ar: "غسول مقشر بأحماض AHA/BHA" },
      routinePlacement: { en: "First step of a routine, replacing a standard cleanser.", ar: "الخطوة الأولى في الروتين، بديلًا عن الغسول العادي." },
      howToUse: { en: "Moisten skin with warm water, apply a small amount to fingertips, gently exfoliate in small circular motions, and rinse thoroughly. Avoid the eye area; if contact occurs, rinse eyes thoroughly with water.", ar: "بلّلوا البشرة بماء دافئ، ضعوا كمية صغيرة على أطراف الأصابع، ودلّكوا بلطف بحركات دائرية صغيرة، ثم اشطفوا جيدًا. تجنّبوا منطقة العين؛ وفي حال الملامسة، اشطفوا العينين جيدًا بالماء." },
      whenToUse: { en: "Can be used up to twice daily (morning and evening); those with sensitive skin may start with once daily and increase gradually as tolerated.", ar: "يمكن استخدامه حتى مرتين يوميًا (صباحًا ومساءً)؛ ومن لديهم بشرة حساسة قد يبدؤون بمرة واحدة يوميًا ويزيدون تدريجيًا حسب التحمل." },
      sunSensitivityWarning: { en: "Contains an alpha-hydroxy acid (AHA), which may increase skin's sensitivity to sunburn. Use a sunscreen and limit sun exposure while using this product and for a week following discontinuation.", ar: "يحتوي على حمض ألفا هيدروكسي (AHA)، ما قد يزيد من حساسية البشرة لحروق الشمس. استخدموا واقي شمس وقلّلوا التعرض للشمس أثناء استخدام هذا المنتج ولمدة أسبوع بعد التوقف عنه." },
      relatedProductIds: ["facial-cleanser", "aha-bha-cream"],
      faqs: [
        { question: { en: "How often can I use this?", ar: "كم مرة يمكنني استخدامه؟" }, answer: { en: "Up to twice daily; sensitive skin should start with once daily and increase gradually as tolerated.", ar: "حتى مرتين يوميًا؛ ويُنصح من لديهم بشرة حساسة بالبدء بمرة واحدة يوميًا والزيادة تدريجيًا حسب التحمل." } },
        { question: { en: "Does this make my skin more sun-sensitive?", ar: "هل يزيد هذا المنتج من حساسية بشرتي للشمس؟" }, answer: { en: "Yes — it contains an AHA, which can increase sun sensitivity. Use sunscreen and limit sun exposure while using it and for a week after stopping.", ar: "نعم — يحتوي على حمض AHA قد يزيد من حساسية الشمس. استخدموا واقي الشمس وقلّلوا التعرض للشمس أثناء الاستخدام ولمدة أسبوع بعد التوقف." } },
        { question: { en: "What if it gets in my eyes?", ar: "ماذا لو دخل في عينيّ؟" }, answer: { en: "Rinse eyes thoroughly with water.", ar: "اشطفوا العينين جيدًا بالماء." } },
        { question: { en: "Can I use this with the AHA/BHA Cream too?", ar: "هل يمكنني استخدامه مع كريم AHA/BHA أيضًا؟" }, answer: { en: "Both are acid-based products from the same category — ask the clinic how to combine them safely for your skin.", ar: "كلاهما منتجان يحتويان على أحماض من الفئة نفسها — يُرجى سؤال العيادة عن كيفية الجمع بينهما بأمان لبشرتكم." } },
        { question: { en: "What size is this?", ar: "ما الحجم؟" }, answer: { en: "177.4 ml.", ar: "177.4 مل." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.skinmedica.com/us/product-category/facial-cleansers/20086695.html", ...officialSite }],
    },
  },

  // ============ THE CORRECT FACTOR ============
  {
    id: "retinol-complex-025",
    slug: "retinol-complex-0-25",
    slugAr: "مركب-الريتينول-٠٫٢٥",
    name: { en: "Retinol Complex 0.25", ar: "مركب الريتينول 0.25" },
    brandId: "skinmedica",
    categoryIds: ["retinol"],
    concernIds: [],
    priceCents: 6600,
    sizeLabel: "29.6 g",
    images: [pendingImage("retinol-complex-0-25", { en: "Retinol Complex 0.25", ar: "مركب الريتينول 0.25" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "The lowest of three Retinol Complex strengths — a starting point for those new to retinol.", ar: "أخف تركيزات مركب الريتينول الثلاثة — نقطة بداية مناسبة لمن هم جدد على استخدام الريتينول." },
      whatItIs: { en: "A retinol treatment, evening use only.", ar: "علاج بالريتينول، للاستخدام المسائي فقط." },
      productType: { en: "Retinol serum/cream, 0.25% strength", ar: "سيروم/كريم ريتينول بتركيز 0.25%" },
      routinePlacement: { en: "In the evening, after cleansing and toning, before moisturizer.", ar: "مساءً، بعد التنظيف والتونر، وقبل المرطب." },
      howToUse: { en: "Apply a single pump in the evening after cleansing and toning and before moisturizer, to the entire face. Avoid the eye area; if contact occurs, rinse eyes thoroughly with water.", ar: "ضعوا ضغطة واحدة مساءً بعد التنظيف والتونر وقبل المرطب، على الوجه بالكامل. تجنّبوا منطقة العين؛ وفي حال الملامسة، اشطفوا العينين جيدًا بالماء." },
      whenToUse: { en: "If new to retinol, start with twice-weekly use, gradually increasing to every other night, then nightly or as tolerated.", ar: "إذا كنتم جددًا على الريتينول، ابدؤوا باستخدامه مرتين أسبوعيًا، ثم زيدوا تدريجيًا إلى ليلة بعد ليلة، ثم يوميًا أو حسب التحمل." },
      pregnancyWarning: { en: "Do not use if pregnant, lactating, or planning to become pregnant.", ar: "لا يُستخدم في حال الحمل أو الرضاعة أو التخطيط للحمل." },
      sunSensitivityWarning: { en: "Use daily sun protection with SPF 30 or higher and limit sun exposure while using this product and for a week following discontinuation.", ar: "استخدموا واقي شمس يوميًا بعامل حماية SPF 30 أو أعلى، وقلّلوا التعرض للشمس أثناء استخدام هذا المنتج ولمدة أسبوع بعد التوقف عنه." },
      warnings: { en: ["Mild redness, peeling, and irritation are expected effects when using this product."], ar: ["الاحمرار الخفيف والتقشر والتهيج آثار متوقعة عند استخدام هذا المنتج."] },
      relatedProductIds: ["retinol-complex-05", "retinol-complex-10", "dermal-repair-cream"],
      faqs: [
        { question: { en: "How is this different from Retinol Complex 0.5 and 1.0?", ar: "كيف يختلف عن مركب الريتينول 0.5 و1.0؟" }, answer: { en: "Same product line at a lower retinol strength — a starting point for those new to retinol.", ar: "نفس خط المنتج بتركيز ريتينول أخف — نقطة بداية جيدة لمن هم جدد على الريتينول." } },
        { question: { en: "Can I use this if pregnant or breastfeeding?", ar: "هل يمكن استخدامه أثناء الحمل أو الرضاعة؟" }, answer: { en: "No — do not use if pregnant, lactating, or planning to become pregnant.", ar: "لا — لا يُستخدم في حال الحمل أو الرضاعة أو التخطيط للحمل." } },
        { question: { en: "How often should I use it when starting out?", ar: "كم مرة أستخدمه عند البدء؟" }, answer: { en: "Twice weekly at first, gradually increasing to every other night and then nightly or as tolerated.", ar: "مرتين أسبوعيًا في البداية، ثم زيادة تدريجية إلى ليلة بعد ليلة ثم يوميًا أو حسب التحمل." } },
        { question: { en: "Do I need sunscreen while using this?", ar: "هل أحتاج واقي شمس أثناء استخدامه؟" }, answer: { en: "Yes — SPF 30 or higher daily, with limited sun exposure, during use and for a week after stopping.", ar: "نعم — عامل حماية SPF 30 أو أعلى يوميًا، مع تقليل التعرض للشمس، أثناء الاستخدام ولمدة أسبوع بعد التوقف." } },
        { question: { en: "Is redness normal?", ar: "هل الاحمرار أمر طبيعي؟" }, answer: { en: "Mild redness, peeling, and irritation are expected effects.", ar: "الاحمرار الخفيف والتقشر والتهيج آثار متوقعة." } },
        { question: { en: "How do I confirm price and availability?", ar: "كيف أتحقق من السعر والتوفر؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.skinmedica.com/us/product-category/correction/20086707.html", ...officialSite }],
    },
  },
  {
    id: "retinol-complex-05",
    slug: "retinol-complex-0-5",
    slugAr: "مركب-الريتينول-٠٫٥",
    name: { en: "Retinol Complex 0.5", ar: "مركب الريتينول 0.5" },
    brandId: "skinmedica",
    categoryIds: ["retinol"],
    concernIds: [],
    priceCents: 8300,
    sizeLabel: "29.6 g",
    images: [pendingImage("retinol-complex-0-5", { en: "Retinol Complex 0.5", ar: "مركب الريتينول 0.5" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "The mid-strength Retinol Complex — for those who have built tolerance beyond the 0.25 strength.", ar: "التركيز المتوسط من مركب الريتينول — لمن بنوا تحملًا يتجاوز تركيز 0.25." },
      whatItIs: { en: "A retinol treatment, evening use only.", ar: "علاج بالريتينول، للاستخدام المسائي فقط." },
      productType: { en: "Retinol serum/cream, 0.5% strength", ar: "سيروم/كريم ريتينول بتركيز 0.5%" },
      routinePlacement: { en: "In the evening, after cleansing and toning, before moisturizer.", ar: "مساءً، بعد التنظيف والتونر، وقبل المرطب." },
      howToUse: { en: "Apply a single pump in the evening after cleansing and toning and before moisturizer, to the entire face. Avoid the eye area; if contact occurs, rinse eyes thoroughly with water.", ar: "ضعوا ضغطة واحدة مساءً بعد التنظيف والتونر وقبل المرطب، على الوجه بالكامل. تجنّبوا منطقة العين؛ وفي حال الملامسة، اشطفوا العينين جيدًا بالماء." },
      whenToUse: { en: "Typically for those already tolerating a lower retinol strength; increase frequency gradually as tolerated.", ar: "عادة لمن يتحملون بالفعل تركيزًا أخف من الريتينول؛ يُزاد التكرار تدريجيًا حسب التحمل." },
      pregnancyWarning: { en: "Do not use if pregnant, lactating, or planning to become pregnant.", ar: "لا يُستخدم في حال الحمل أو الرضاعة أو التخطيط للحمل." },
      sunSensitivityWarning: { en: "Use daily sun protection with SPF 30 or higher and limit sun exposure while using this product and for a week following discontinuation.", ar: "استخدموا واقي شمس يوميًا بعامل حماية SPF 30 أو أعلى، وقلّلوا التعرض للشمس أثناء استخدام هذا المنتج ولمدة أسبوع بعد التوقف عنه." },
      warnings: { en: ["Mild redness, peeling, and irritation are expected effects when using this product."], ar: ["الاحمرار الخفيف والتقشر والتهيج آثار متوقعة عند استخدام هذا المنتج."] },
      relatedProductIds: ["retinol-complex-025", "retinol-complex-10", "dermal-repair-cream"],
      faqs: [
        { question: { en: "Should I start with this strength or the 0.25?", ar: "هل أبدأ بهذا التركيز أم بتركيز 0.25؟" }, answer: { en: "Those new to retinol typically start lower and work up — ask your provider what's appropriate for you.", ar: "من هم جدد على الريتينول يبدؤون عادة بتركيز أخف ثم يتدرجون — يُرجى سؤال مقدم الرعاية عمّا يناسبكم." } },
        { question: { en: "Can I use this if pregnant or breastfeeding?", ar: "هل يمكن استخدامه أثناء الحمل أو الرضاعة؟" }, answer: { en: "No — do not use if pregnant, lactating, or planning to become pregnant.", ar: "لا — لا يُستخدم في حال الحمل أو الرضاعة أو التخطيط للحمل." } },
        { question: { en: "Do I need sunscreen while using this?", ar: "هل أحتاج واقي شمس أثناء استخدامه؟" }, answer: { en: "Yes — SPF 30 or higher daily, with limited sun exposure, during use and for a week after stopping.", ar: "نعم — عامل حماية SPF 30 أو أعلى يوميًا، مع تقليل التعرض للشمس، أثناء الاستخدام ولمدة أسبوع بعد التوقف." } },
        { question: { en: "Is redness normal?", ar: "هل الاحمرار أمر طبيعي؟" }, answer: { en: "Mild redness, peeling, and irritation are expected effects.", ar: "الاحمرار الخفيف والتقشر والتهيج آثار متوقعة." } },
        { question: { en: "What size is this?", ar: "ما الحجم؟" }, answer: { en: "29.6 g.", ar: "29.6 غرام." } },
        { question: { en: "How do I confirm price and availability?", ar: "كيف أتحقق من السعر والتوفر؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.skinmedica.com/us/product-category/correction/94921.html", ...officialSite }],
    },
  },
  {
    id: "retinol-complex-10",
    slug: "retinol-complex-1-0",
    slugAr: "مركب-الريتينول-١٫٠",
    name: { en: "Retinol Complex 1.0", ar: "مركب الريتينول 1.0" },
    brandId: "skinmedica",
    categoryIds: ["retinol"],
    concernIds: [],
    priceCents: 9900,
    sizeLabel: "29.6 g",
    images: [pendingImage("retinol-complex-1-0", { en: "Retinol Complex 1.0", ar: "مركب الريتينول 1.0" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "The highest of three Retinol Complex strengths, for skin that has already built tolerance to retinol.", ar: "أعلى تركيزات مركب الريتينول الثلاثة، لبشرة بنت بالفعل تحملًا للريتينول." },
      whatItIs: { en: "A retinol treatment, evening use only.", ar: "علاج بالريتينول، للاستخدام المسائي فقط." },
      productType: { en: "Retinol serum/cream, 1.0% strength", ar: "سيروم/كريم ريتينول بتركيز 1.0%" },
      routinePlacement: { en: "In the evening, after cleansing and toning, before moisturizer.", ar: "مساءً، بعد التنظيف والتونر، وقبل المرطب." },
      howToUse: { en: "Apply a single pump in the evening after cleansing and toning and before moisturizer, to the entire face. Avoid the eye area; if contact occurs, rinse eyes thoroughly with water.", ar: "ضعوا ضغطة واحدة مساءً بعد التنظيف والتونر وقبل المرطب، على الوجه بالكامل. تجنّبوا منطقة العين؛ وفي حال الملامسة، اشطفوا العينين جيدًا بالماء." },
      whenToUse: { en: "Typically for those already tolerating a lower retinol strength well.", ar: "عادة لمن يتحملون بالفعل تركيزًا أخف من الريتينول بشكل جيد." },
      pregnancyWarning: { en: "Do not use if pregnant, lactating, or planning to become pregnant.", ar: "لا يُستخدم في حال الحمل أو الرضاعة أو التخطيط للحمل." },
      sunSensitivityWarning: { en: "Use daily sun protection with SPF 30 or higher and limit sun exposure while using this product and for a week following discontinuation.", ar: "استخدموا واقي شمس يوميًا بعامل حماية SPF 30 أو أعلى، وقلّلوا التعرض للشمس أثناء استخدام هذا المنتج ولمدة أسبوع بعد التوقف عنه." },
      warnings: { en: ["Mild redness, peeling, and irritation are expected effects when using this product."], ar: ["الاحمرار الخفيف والتقشر والتهيج آثار متوقعة عند استخدام هذا المنتج."] },
      relatedProductIds: ["retinol-complex-025", "retinol-complex-05", "dermal-repair-cream"],
      faqs: [
        { question: { en: "Is this the strongest Retinol Complex?", ar: "هل هذا أقوى تركيز من مركب الريتينول؟" }, answer: { en: "Yes — 1.0 is the highest of the three strengths in this line.", ar: "نعم — تركيز 1.0 هو الأعلى بين التركيزات الثلاثة في هذا الخط." } },
        { question: { en: "Should I start here if I'm new to retinol?", ar: "هل أبدأ بهذا التركيز إذا كنت جديدًا على الريتينول؟" }, answer: { en: "Typically not — this strength is intended for skin already tolerating a lower strength well. Ask your provider.", ar: "عادة لا — هذا التركيز مخصص لبشرة تتحمل بالفعل تركيزًا أخف بشكل جيد. يُرجى استشارة مقدم الرعاية." } },
        { question: { en: "Can I use this if pregnant or breastfeeding?", ar: "هل يمكن استخدامه أثناء الحمل أو الرضاعة؟" }, answer: { en: "No — do not use if pregnant, lactating, or planning to become pregnant.", ar: "لا — لا يُستخدم في حال الحمل أو الرضاعة أو التخطيط للحمل." } },
        { question: { en: "Do I need sunscreen while using this?", ar: "هل أحتاج واقي شمس أثناء استخدامه؟" }, answer: { en: "Yes — SPF 30 or higher daily, with limited sun exposure, during use and for a week after stopping.", ar: "نعم — عامل حماية SPF 30 أو أعلى يوميًا، مع تقليل التعرض للشمس، أثناء الاستخدام ولمدة أسبوع بعد التوقف." } },
        { question: { en: "Is redness normal?", ar: "هل الاحمرار أمر طبيعي؟" }, answer: { en: "Mild redness, peeling, and irritation are expected effects.", ar: "الاحمرار الخفيف والتقشر والتهيج آثار متوقعة." } },
        { question: { en: "How do I confirm price and availability?", ar: "كيف أتحقق من السعر والتوفر؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.skinmedica.com/us/product-category/correction/20086711.html", ...officialSite }],
    },
  },
  {
    id: "lytera-2-pigment-brightening-serum",
    slug: "lytera-2-pigment-brightening-serum",
    slugAr: "سيروم-لايتيرا-٢-لتفتيح-التصبغات",
    name: { en: "Lytera® 2.0 Pigment Brightening Serum", ar: "سيروم لايتيرا® 2.0 لتفتيح التصبغات" },
    brandId: "skinmedica",
    categoryIds: ["serums"],
    concernIds: [],
    priceCents: 17000,
    sizeLabel: "60 ml",
    images: [pendingImage("lytera-2-pigment-brightening-serum", { en: "Lytera® 2.0 Pigment Brightening Serum", ar: "سيروم لايتيرا® 2.0 لتفتيح التصبغات" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "An evening serum formulated to address the appearance of stubborn skin discoloration.", ar: "سيروم مسائي مصمم لمعالجة مظهر تصبغات البشرة العنيدة." },
      whatItIs: { en: "A pigment-brightening serum.", ar: "سيروم لتفتيح التصبغات." },
      productType: { en: "Pigment-brightening serum", ar: "سيروم لتفتيح التصبغات" },
      routinePlacement: { en: "In the evening, as a treatment step.", ar: "مساءً، كخطوة علاجية." },
      howToUse: { en: "Apply a single pump to the face and neck each evening.", ar: "ضعوا ضغطة واحدة على الوجه والرقبة كل مساء." },
      sunSensitivityWarning: { en: "As with other pigment-focused treatments, daily sun protection is important while addressing discoloration — confirm specific guidance with your provider.", ar: "كما هو الحال مع العلاجات الأخرى الموجهة للتصبغات، تُعد الحماية اليومية من الشمس مهمة أثناء معالجة التصبغ — يُرجى تأكيد الإرشادات المحددة مع مقدم الرعاية." },
      relatedProductIds: ["retinol-complex-025", "daily-physical-defense-spf-34"],
      legacyNameNote: { en: "Current official product listings sometimes name this \"Lytera 2.0 Pigment Correcting Serum\"; the approved catalogue's \"Pigment Brightening Serum\" naming is preserved as the published name.", ar: "تُدرج بعض المصادر الرسمية الحالية هذا المنتج باسم \"Lytera 2.0 Pigment Correcting Serum\"؛ وقد تم اعتماد تسمية \"Pigment Brightening Serum\" من القائمة المعتمدة كاسم منشور." },
      faqs: [
        { question: { en: "When do I use this serum?", ar: "متى أستخدم هذا السيروم؟" }, answer: { en: "In the evening, one pump applied to the face and neck.", ar: "مساءً، ضغطة واحدة تُطبَّق على الوجه والرقبة." } },
        { question: { en: "What is this formulated to address?", ar: "لماذا صُمم هذا السيروم؟" }, answer: { en: "The appearance of stubborn skin discoloration, per manufacturer information.", ar: "مظهر تصبغات البشرة العنيدة، وفق معلومات الشركة المصنّعة." } },
        { question: { en: "Do I need sunscreen while using this?", ar: "هل أحتاج واقي شمس أثناء استخدامه؟" }, answer: { en: "Daily sun protection is generally important with pigment-focused treatments — confirm specific guidance with your provider.", ar: "الحماية اليومية من الشمس مهمة بشكل عام مع علاجات التصبغ — يُرجى تأكيد الإرشادات مع مقدم الرعاية." } },
        { question: { en: "Is this the same as \"Lytera 2.0 Pigment Correcting Serum\"?", ar: "هل هذا هو نفسه \"Lytera 2.0 Pigment Correcting Serum\"؟" }, answer: { en: "Some current listings use \"Correcting\" rather than \"Brightening\" in the name — same underlying product line; the approved catalogue name is used here.", ar: "تستخدم بعض القوائم الحالية كلمة \"Correcting\" بدل \"Brightening\" في الاسم — لكنه خط المنتج نفسه؛ ويُستخدم هنا الاسم المعتمد في القائمة." } },
        { question: { en: "What size is this?", ar: "ما الحجم؟" }, answer: { en: "60 ml.", ar: "60 مل." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.skinmedica.com/us/", ...officialSite }],
    },
  },
  {
    id: "aha-bha-cream",
    slug: "aha-bha-cream",
    slugAr: "كريم-aha-bha",
    name: { en: "AHA/BHA Cream", ar: "كريم AHA/BHA" },
    brandId: "skinmedica",
    categoryIds: ["treatment-systems"],
    concernIds: [],
    priceCents: 4600,
    sizeLabel: "56.7 g",
    images: [pendingImage("aha-bha-cream", { en: "AHA/BHA Cream", ar: "كريم AHA/BHA" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "A leave-on AHA/BHA exfoliating cream, distinct from the AHA/BHA Exfoliating Cleanser, which is rinsed off.", ar: "كريم مقشر بأحماض AHA/BHA يُترك على البشرة، ويختلف عن غسول AHA/BHA المقشر الذي يُشطف." },
      whatItIs: { en: "An acid-based exfoliating treatment cream, sometimes listed by the manufacturer as \"AHA/BHA Exfoliating Cream.\"", ar: "كريم علاجي مقشر يعتمد على الأحماض، وتُدرجه الشركة المصنّعة أحيانًا باسم \"AHA/BHA Exfoliating Cream\"." },
      productType: { en: "AHA/BHA exfoliating cream", ar: "كريم مقشر بأحماض AHA/BHA" },
      routinePlacement: { en: "As a leave-on treatment step, per your provider's guidance.", ar: "كخطوة علاجية تُترك على البشرة، وفق إرشادات مقدم الرعاية." },
      howToUse: { en: "Apply as directed by your provider; avoid the eye area, and rinse thoroughly with water if contact occurs.", ar: "يُطبَّق وفق إرشادات مقدم الرعاية؛ يُتجنَّب منطقة العين، ويُشطف جيدًا بالماء في حال الملامسة." },
      sunSensitivityWarning: { en: "Contains an alpha-hydroxy acid (AHA), which may increase skin's sensitivity to sunburn. Use sunscreen, wear protective clothing, and limit sun exposure while using this product and for a week following discontinuation.", ar: "يحتوي على حمض ألفا هيدروكسي (AHA)، ما قد يزيد من حساسية البشرة لحروق الشمس. استخدموا واقي الشمس، وارتدوا ملابس واقية، وقلّلوا التعرض للشمس أثناء استخدام هذا المنتج ولمدة أسبوع بعد التوقف عنه." },
      relatedProductIds: ["aha-bha-exfoliating-cleanser", "retinol-complex-025"],
      faqs: [
        { question: { en: "Is this the same as the AHA/BHA Exfoliating Cleanser?", ar: "هل هذا هو نفسه غسول AHA/BHA المقشر؟" }, answer: { en: "No — the cleanser is rinsed off; this cream is a leave-on treatment.", ar: "لا — الغسول يُشطف، بينما هذا الكريم علاج يُترك على البشرة." } },
        { question: { en: "Does this increase sun sensitivity?", ar: "هل يزيد هذا المنتج من حساسية الشمس؟" }, answer: { en: "Yes — it contains an AHA. Use sunscreen, protective clothing, and limit sun exposure during use and for a week after stopping.", ar: "نعم — يحتوي على حمض AHA. استخدموا واقي الشمس والملابس الواقية، وقلّلوا التعرض للشمس أثناء الاستخدام ولمدة أسبوع بعد التوقف." } },
        { question: { en: "What if it gets in my eyes?", ar: "ماذا لو دخل في عينيّ؟" }, answer: { en: "Rinse thoroughly with water.", ar: "اشطفوا جيدًا بالماء." } },
        { question: { en: "What size is this?", ar: "ما الحجم؟" }, answer: { en: "56.7 g.", ar: "56.7 غرام." } },
        { question: { en: "How do I know how often to use it?", ar: "كيف أعرف عدد مرات الاستخدام؟" }, answer: { en: "Ask your provider — leave-on acid treatments are typically introduced gradually.", ar: "يُرجى سؤال مقدم الرعاية — إذ تُدخَل العلاجات الحمضية التي تُترك على البشرة عادة بشكل تدريجي." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.skinmedica.com/us/product-category/brighteners/20086693.html", ...officialSite }],
    },
  },

  // ============ THE PROTECT FACTOR ============
  {
    id: "daily-physical-defense-spf-34",
    slug: "daily-physical-defense-spf-34",
    slugAr: "واقي-الشمس-اليومي-spf-34",
    name: { en: "Daily Physical Defense® SPF 34", ar: "واقي الشمس اليومي® SPF 34" },
    brandId: "skinmedica",
    categoryIds: ["sunscreen"],
    concernIds: [],
    priceCents: 5100,
    sizeLabel: "85 ml",
    images: [pendingImage("daily-physical-defense-spf-34", { en: "Daily Physical Defense® SPF 34", ar: "واقي الشمس اليومي® SPF 34" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "An oil-free, fragrance-free dual-mineral sunscreen providing broad-spectrum UVA/UVB protection.", ar: "واقي شمس معدني مزدوج، خالٍ من الزيوت والعطور، يوفر حماية واسعة الطيف من أشعة UVA/UVB." },
      whatItIs: { en: "A daily mineral (physical) sunscreen with active ingredients Titanium Dioxide 5.0% and Zinc Oxide 6.0%, per manufacturer information.", ar: "واقي شمس معدني (فيزيائي) للاستخدام اليومي، بمكونين فعالين هما ثاني أكسيد التيتانيوم 5.0% وأكسيد الزنك 6.0%، وفق معلومات الشركة المصنّعة." },
      productType: { en: "Broad-spectrum mineral sunscreen, SPF 34", ar: "واقي شمس معدني واسع الطيف، SPF 34" },
      routinePlacement: { en: "The last step of a morning routine.", ar: "الخطوة الأخيرة في الروتين الصباحي." },
      keyCharacteristics: { en: ["Oil-free and fragrance-free, per manufacturer information", "Contains caffeine and green tea antioxidant, per manufacturer information"], ar: ["خالٍ من الزيوت والعطور، وفق معلومات الشركة المصنّعة", "يحتوي على الكافيين ومضاد أكسدة الشاي الأخضر، وفق معلومات الشركة المصنّعة"] },
      howToUse: { en: "Dispense onto the back of the hand and apply generously to the face and other sun-exposed areas (neck and chest if desired).", ar: "ضعوا الكمية على ظهر اليد وطبّقوها بسخاء على الوجه والمناطق المعرضة للشمس (والرقبة والصدر إذا رغبتم)." },
      whenToUse: { en: "Apply in the morning as the last step of your routine, or as needed; reapply at least every 2 hours if in direct sunlight.", ar: "يُطبَّق صباحًا كخطوة أخيرة في الروتين، أو حسب الحاجة؛ ويُعاد التطبيق كل ساعتين على الأقل عند التعرض المباشر لأشعة الشمس." },
      relatedProductIds: ["total-defence-repair-spf-34-tinted", "total-defence-repair-spf-34-clear", "vitamin-c-e-complex"],
      faqs: [
        { question: { en: "Is this a chemical or mineral sunscreen?", ar: "هل هو واقي شمس كيميائي أم معدني؟" }, answer: { en: "Mineral (physical) — with Titanium Dioxide and Zinc Oxide as the active ingredients, per manufacturer information.", ar: "معدني (فيزيائي) — بمكونين فعالين هما ثاني أكسيد التيتانيوم وأكسيد الزنك، وفق معلومات الشركة المصنّعة." } },
        { question: { en: "How often do I reapply?", ar: "كم مرة أعيد التطبيق؟" }, answer: { en: "At least every 2 hours if in direct sunlight.", ar: "كل ساعتين على الأقل عند التعرض المباشر لأشعة الشمس." } },
        { question: { en: "Is it fragrance-free?", ar: "هل هو خالٍ من العطور؟" }, answer: { en: "Yes, per manufacturer information.", ar: "نعم، وفق معلومات الشركة المصنّعة." } },
        { question: { en: "Where do I apply it?", ar: "أين أضعه؟" }, answer: { en: "Face and other sun-exposed areas, with neck and chest if desired.", ar: "الوجه والمناطق المعرضة للشمس، مع الرقبة والصدر إذا رغبتم." } },
        { question: { en: "How is this different from Total Defence + Repair?", ar: "كيف يختلف عن Total Defence + Repair؟" }, answer: { en: "Both are SPF 34 sunscreens from the same catalogue; ask the clinic which suits your routine and skin type.", ar: "كلاهما واقيا شمس بعامل SPF 34 من القائمة نفسها؛ يُرجى سؤال العيادة عن الأنسب لروتينكم ونوع بشرتكم." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://dermshop.ca/products/skinmedica-daily-physical-defense%C2%AE-broad-spectrum-spf-34", ...caRetailer("Dermshop.ca") }],
    },
  },
  {
    id: "total-defence-repair-spf-34-tinted",
    slug: "total-defence-repair-spf-34-tinted",
    slugAr: "واقي-الشمس-الشامل-والإصلاح-spf-34-ملون",
    name: { en: "Total Defense + Repair SPF 34 (Tinted)", ar: "واقي الشمس الشامل + الإصلاح SPF 34 (ملون)" },
    brandId: "skinmedica",
    categoryIds: ["sunscreen"],
    concernIds: [],
    priceCents: 7500,
    sizeLabel: "65 g",
    images: [pendingImage("total-defence-repair-spf-34-tinted", { en: "Total Defense + Repair SPF 34 (Tinted)", ar: "واقي الشمس الشامل + الإصلاح SPF 34 (ملون)" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "A broad-spectrum SPF 34 sunscreen with sheer tinted coverage, for daily use.", ar: "واقي شمس واسع الطيف بعامل SPF 34 مع تغطية لونية خفيفة، للاستخدام اليومي." },
      whatItIs: { en: "A tinted broad-spectrum sunscreen.", ar: "واقي شمس ملون واسع الطيف." },
      productType: { en: "Broad-spectrum sunscreen, SPF 34, tinted", ar: "واقي شمس واسع الطيف، SPF 34، ملون" },
      routinePlacement: { en: "The last step of a morning routine.", ar: "الخطوة الأخيرة في الروتين الصباحي." },
      howToUse: { en: "Apply generously to face and other sun-exposed areas as the last step of your morning routine; reapply at least every 2 hours if in direct sunlight.", ar: "طبّقوه بسخاء على الوجه والمناطق المعرضة للشمس كخطوة أخيرة في الروتين الصباحي؛ ويُعاد التطبيق كل ساعتين على الأقل عند التعرض المباشر لأشعة الشمس." },
      legacyNameNote: { en: "The approved catalogue used the British/Canadian spelling \"Defence\"; the manufacturer's own current naming (confirmed on the official skinmedica.ca product URL and multiple Canadian retailers) uses \"Defense.\" The current official name is used here; the approved price and size are unchanged.", ar: "استخدمت القائمة المعتمدة الإملاء البريطاني/الكندي \"Defence\"؛ بينما تستخدم الشركة المصنّعة حاليًا تسمية \"Defense\" (تم التأكد من ذلك عبر رابط المنتج الرسمي على skinmedica.ca وعدة متاجر كندية معتمدة). يُستخدم هنا الاسم الرسمي الحالي، مع الحفاظ على السعر والحجم المعتمدين دون تغيير." },
      relatedProductIds: ["total-defence-repair-spf-34-clear", "daily-physical-defense-spf-34"],
      faqs: [
        { question: { en: "Is this tinted or clear?", ar: "هل هو ملون أم شفاف؟" }, answer: { en: "Tinted — with sheer coverage. A clear version is also available as a separate product.", ar: "ملون — بتغطية خفيفة. يتوفر أيضًا إصدار شفاف كمنتج منفصل." } },
        { question: { en: "Why does the product name say \"Defense\" instead of \"Defence\"?", ar: "لماذا يُكتب اسم المنتج \"Defense\" بدلًا من \"Defence\"؟" }, answer: { en: "\"Defense\" is the manufacturer's current official spelling, confirmed on the official product URL and Canadian retailers — the approved price and size are unchanged.", ar: "\"Defense\" هو الإملاء الرسمي الحالي للشركة المصنّعة، وتم التأكد منه عبر رابط المنتج الرسمي والمتاجر الكندية — مع بقاء السعر والحجم المعتمدين دون تغيير." } },
        { question: { en: "How often do I reapply?", ar: "كم مرة أعيد التطبيق؟" }, answer: { en: "At least every 2 hours if in direct sunlight.", ar: "كل ساعتين على الأقل عند التعرض المباشر لأشعة الشمس." } },
        { question: { en: "What SPF does this provide?", ar: "ما درجة الحماية SPF التي يوفرها؟" }, answer: { en: "SPF 34, broad spectrum.", ar: "SPF 34، حماية واسعة الطيف." } },
        { question: { en: "What size is this?", ar: "ما الحجم؟" }, answer: { en: "65 g.", ar: "65 غرام." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://dermshop.ca/products/skinmedica-total-defense-repair-spf-34", ...caRetailer("Dermshop.ca") }, { url: "https://www.skinmedica.ca/products/protect/totaldefenserepairspf34tinted", retrievedDate: "2026-08-22", publisher: "SkinMedica official Canadian site (skinmedica.ca) — URL confirmed via search result title; direct fetch was blocked by the site's own access controls" }],
    },
  },
  {
    id: "total-defence-repair-spf-34-clear",
    slug: "total-defence-repair-spf-34-clear",
    slugAr: "واقي-الشمس-الشامل-والإصلاح-spf-34-شفاف",
    name: { en: "Total Defense + Repair SPF 34 (Clear)", ar: "واقي الشمس الشامل + الإصلاح SPF 34 (شفاف)" },
    brandId: "skinmedica",
    categoryIds: ["sunscreen"],
    concernIds: [],
    priceCents: 7500,
    sizeLabel: "65 g",
    images: [pendingImage("total-defence-repair-spf-34-clear", { en: "Total Defense + Repair SPF 34 (Clear)", ar: "واقي الشمس الشامل + الإصلاح SPF 34 (شفاف)" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "A broad-spectrum SPF 34 sunscreen in a clear, untinted formula, for daily use.", ar: "واقي شمس واسع الطيف بعامل SPF 34 بتركيبة شفافة دون لون، للاستخدام اليومي." },
      whatItIs: { en: "A clear broad-spectrum sunscreen.", ar: "واقي شمس شفاف واسع الطيف." },
      productType: { en: "Broad-spectrum sunscreen, SPF 34, untinted", ar: "واقي شمس واسع الطيف، SPF 34، دون لون" },
      routinePlacement: { en: "The last step of a morning routine.", ar: "الخطوة الأخيرة في الروتين الصباحي." },
      howToUse: { en: "Apply generously to face and other sun-exposed areas as the last step of your morning routine; reapply at least every 2 hours if in direct sunlight.", ar: "طبّقوه بسخاء على الوجه والمناطق المعرضة للشمس كخطوة أخيرة في الروتين الصباحي؛ ويُعاد التطبيق كل ساعتين على الأقل عند التعرض المباشر لأشعة الشمس." },
      legacyNameNote: { en: "The approved catalogue used the British/Canadian spelling \"Defence\"; the manufacturer's own current naming uses \"Defense.\" The current official name is used here; the approved price and size are unchanged.", ar: "استخدمت القائمة المعتمدة الإملاء البريطاني/الكندي \"Defence\"؛ بينما تستخدم الشركة المصنّعة حاليًا تسمية \"Defense\". يُستخدم هنا الاسم الرسمي الحالي، مع الحفاظ على السعر والحجم المعتمدين دون تغيير." },
      relatedProductIds: ["total-defence-repair-spf-34-tinted", "daily-physical-defense-spf-34"],
      faqs: [
        { question: { en: "Is this tinted?", ar: "هل هو ملون؟" }, answer: { en: "No — this is the clear, untinted version. A tinted version is also available as a separate product.", ar: "لا — هذا هو الإصدار الشفاف دون لون. يتوفر أيضًا إصدار ملون كمنتج منفصل." } },
        { question: { en: "How does this differ from Daily Physical Defense?", ar: "كيف يختلف عن Daily Physical Defense؟" }, answer: { en: "Both are SPF sunscreens in this catalogue; ask the clinic which formula and finish suits your routine.", ar: "كلاهما واقيا شمس بعامل SPF ضمن هذه القائمة؛ يُرجى سؤال العيادة عن التركيبة والملمس الأنسب لروتينكم." } },
        { question: { en: "How often do I reapply?", ar: "كم مرة أعيد التطبيق؟" }, answer: { en: "At least every 2 hours if in direct sunlight.", ar: "كل ساعتين على الأقل عند التعرض المباشر لأشعة الشمس." } },
        { question: { en: "What SPF does this provide?", ar: "ما درجة الحماية SPF التي يوفرها؟" }, answer: { en: "SPF 34, broad spectrum.", ar: "SPF 34، حماية واسعة الطيف." } },
        { question: { en: "What size is this?", ar: "ما الحجم؟" }, answer: { en: "65 g.", ar: "65 غرام." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://dermshop.ca/products/skinmedica-total-defense-repair-spf-34", ...caRetailer("Dermshop.ca") }],
    },
  },

  // ============ THE HYDRATION FACTOR ============
  {
    id: "dermal-repair-cream",
    slug: "dermal-repair-cream",
    slugAr: "كريم-إصلاح-البشرة",
    name: { en: "Dermal Repair Cream", ar: "كريم إصلاح البشرة" },
    brandId: "skinmedica",
    categoryIds: ["moisturizers"],
    concernIds: [],
    priceCents: 13600,
    sizeLabel: "48 g",
    images: [pendingImage("dermal-repair-cream", { en: "Dermal Repair Cream", ar: "كريم إصلاح البشرة" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "An ultra-rich facial cream intended to intensely hydrate and help replenish moisture, suited to normal-to-dry skin.", ar: "كريم وجه غني القوام مخصص للترطيب المكثف والمساعدة في استعادة رطوبة البشرة، ويناسب البشرة العادية إلى الجافة." },
      whatItIs: { en: "A rich moisturizing cream with antioxidant vitamins C and E and sodium hyaluronate, per manufacturer information.", ar: "كريم مرطب غني بفيتاميني C وE المضادين للأكسدة وهيالورونات الصوديوم، وفق معلومات الشركة المصنّعة." },
      productType: { en: "Rich moisturizing cream", ar: "كريم مرطب غني القوام" },
      routinePlacement: { en: "As the moisturizing step of a routine, appropriate for normal-to-dry skin.", ar: "كخطوة الترطيب في الروتين، ويناسب البشرة العادية إلى الجافة." },
      keyCharacteristics: { en: ["Contains Tetrahexyldecyl Ascorbate and Tocopheryl Acetate (antioxidant vitamin C and E forms) and Sodium Hyaluronate, per manufacturer information", "Formulated for normal-to-dry skin"], ar: ["يحتوي على Tetrahexyldecyl Ascorbate وTocopheryl Acetate (أشكال مضادة للأكسدة من فيتاميني C وE) وهيالورونات الصوديوم، وفق معلومات الشركة المصنّعة", "مصمم للبشرة العادية إلى الجافة"] },
      howToUse: { en: "Apply to face (and neck if desired) as the moisturizing step of your routine.", ar: "يُطبَّق على الوجه (والرقبة إذا رغبتم) كخطوة الترطيب في روتينكم." },
      relatedProductIds: ["retinol-complex-025", "tns-ceramide-treatment-cream"],
      faqs: [
        { question: { en: "What skin type is this formulated for?", ar: "لأي نوع بشرة صُمم هذا الكريم؟" }, answer: { en: "Normal-to-dry skin, per manufacturer information.", ar: "البشرة العادية إلى الجافة، وفق معلومات الشركة المصنّعة." } },
        { question: { en: "What does it contain?", ar: "ما مكوناته؟" }, answer: { en: "Antioxidant vitamin C and E forms and sodium hyaluronate, per manufacturer information.", ar: "أشكال مضادة للأكسدة من فيتاميني C وE، وهيالورونات الصوديوم، وفق معلومات الشركة المصنّعة." } },
        { question: { en: "Does this contain ceramides?", ar: "هل يحتوي على السيراميد؟" }, answer: { en: "The research for this record didn't confirm ceramides as a primary ingredient — TNS Ceramide Treatment Cream is SkinMedica's dedicated ceramide-focused product.", ar: "لم يؤكد البحث الخاص بهذا السجل احتواءه على السيراميد كمكون أساسي — يُعد كريم TNS العلاجي بالسيراميد منتج سكين ميديكا المخصص للسيراميد." } },
        { question: { en: "When do I apply this in my routine?", ar: "متى أطبّق هذا الكريم ضمن روتيني؟" }, answer: { en: "As the moisturizing step, typically after any treatment serums.", ar: "كخطوة الترطيب، عادة بعد أي سيروم علاجي." } },
        { question: { en: "What size is this?", ar: "ما الحجم؟" }, answer: { en: "48 g.", ar: "48 غرام." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.skinmedica.com/us/dry-skin/20086508.html", ...officialSite }],
    },
  },
  {
    id: "rejuvenative-moisturizer",
    slug: "rejuvenative-moisturizer",
    slugAr: "مرطب-منشط",
    name: { en: "Rejuvenative Moisturizer", ar: "مرطب منشط" },
    brandId: "skinmedica",
    categoryIds: ["moisturizers"],
    concernIds: [],
    priceCents: 6200,
    sizeLabel: "56.7 g",
    images: [pendingImage("rejuvenative-moisturizer", { en: "Rejuvenative Moisturizer", ar: "مرطب منشط" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "A moisturizing cream formulated to restore and maintain skin's natural moisture balance.", ar: "كريم مرطب مصمم لاستعادة توازن رطوبة البشرة الطبيعي والحفاظ عليه." },
      whatItIs: { en: "A daily moisturizer.", ar: "مرطب للاستخدام اليومي." },
      productType: { en: "Moisturizing cream", ar: "كريم مرطب" },
      routinePlacement: { en: "As the moisturizing step of a routine.", ar: "كخطوة الترطيب في الروتين." },
      howToUse: { en: "Apply to face (and neck if desired) as the moisturizing step of your routine.", ar: "يُطبَّق على الوجه (والرقبة إذا رغبتم) كخطوة الترطيب في روتينكم." },
      relatedProductIds: ["ultra-sheer-moisturizer", "replenish-hydrating-cream"],
      faqs: [
        { question: { en: "What does this moisturizer do?", ar: "ماذا يفعل هذا المرطب؟" }, answer: { en: "It's formulated to help restore and maintain the skin's natural moisture balance, per manufacturer information.", ar: "صُمم للمساعدة في استعادة توازن رطوبة البشرة الطبيعي والحفاظ عليه، وفق معلومات الشركة المصنّعة." } },
        { question: { en: "When do I apply it?", ar: "متى أطبّقه؟" }, answer: { en: "As the moisturizing step of your routine, morning and/or evening.", ar: "كخطوة الترطيب في روتينكم، صباحًا و/أو مساءً." } },
        { question: { en: "How is this different from Ultra Sheer Moisturizer?", ar: "كيف يختلف عن مرطب Ultra Sheer؟" }, answer: { en: "Both are moisturizers in this catalogue with different formulations — ask the clinic which suits your skin type.", ar: "كلاهما مرطبان ضمن هذه القائمة بتركيبتين مختلفتين — يُرجى سؤال العيادة عن الأنسب لنوع بشرتكم." } },
        { question: { en: "What size is this?", ar: "ما الحجم؟" }, answer: { en: "56.7 g.", ar: "56.7 غرام." } },
        { question: { en: "Is this suitable for all skin types?", ar: "هل يناسب جميع أنواع البشرة؟" }, answer: { en: "Not confirmed by the research for this specific record — ask the clinic about suitability for your skin.", ar: "لم يتأكد ذلك من خلال البحث الخاص بهذا السجل — يُرجى سؤال العيادة عن مدى ملاءمته لبشرتكم." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.skinmedica.com/us/product-category/moisturizers/", ...officialSite }],
    },
  },
  {
    id: "replenish-hydrating-cream",
    slug: "replenish-hydrating-cream",
    slugAr: "كريم-ترطيب-مجدد",
    name: { en: "Replenish Hydrating Cream", ar: "كريم ترطيب مجدد" },
    brandId: "skinmedica",
    categoryIds: ["moisturizers"],
    concernIds: [],
    priceCents: 7000,
    sizeLabel: "56.7 g",
    images: [pendingImage("replenish-hydrating-cream", { en: "Replenish Hydrating Cream", ar: "كريم ترطيب مجدد" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "A hydrating cream formulated to restore moisture levels for smoother, softer, more balanced-feeling skin.", ar: "كريم ترطيب مصمم لاستعادة مستويات الرطوبة لبشرة أكثر نعومة وتوازنًا." },
      whatItIs: { en: "A daily hydrating moisturizer.", ar: "مرطب ترطيبي للاستخدام اليومي." },
      productType: { en: "Hydrating cream", ar: "كريم ترطيب" },
      routinePlacement: { en: "As the moisturizing step of a routine.", ar: "كخطوة الترطيب في الروتين." },
      keyCharacteristics: { en: ["Contains chamomile-derived bisabolol, green tea antioxidant, vitamin C, and glycerin, per manufacturer information"], ar: ["يحتوي على مادة bisabolol المستخلصة من البابونج، ومضاد أكسدة الشاي الأخضر، وفيتامين C، والجليسرين، وفق معلومات الشركة المصنّعة"] },
      howToUse: { en: "Apply to face (and neck if desired) as the moisturizing step of your routine.", ar: "يُطبَّق على الوجه (والرقبة إذا رغبتم) كخطوة الترطيب في روتينكم." },
      relatedProductIds: ["rejuvenative-moisturizer", "dermal-repair-cream"],
      faqs: [
        { question: { en: "What ingredients help calm the skin?", ar: "ما المكونات التي تساعد على تهدئة البشرة؟" }, answer: { en: "Chamomile-derived bisabolol, per manufacturer information.", ar: "مادة bisabolol المستخلصة من البابونج، وفق معلومات الشركة المصنّعة." } },
        { question: { en: "Does this brighten skin tone?", ar: "هل يعمل على تفتيح لون البشرة؟" }, answer: { en: "It contains vitamin C, which the manufacturer describes as helping restore radiance.", ar: "يحتوي على فيتامين C، الذي تصفه الشركة المصنّعة بأنه يساعد على استعادة النضارة." } },
        { question: { en: "When do I apply it?", ar: "متى أطبّقه؟" }, answer: { en: "As the moisturizing step of your routine.", ar: "كخطوة الترطيب في روتينكم." } },
        { question: { en: "What size is this?", ar: "ما الحجم؟" }, answer: { en: "56.7 g.", ar: "56.7 غرام." } },
        { question: { en: "Is this suited to sensitive skin?", ar: "هل يناسب البشرة الحساسة؟" }, answer: { en: "The manufacturer describes it as nourishing and soothing; confirm suitability for sensitive skin with the clinic.", ar: "تصفه الشركة المصنّعة بأنه مغذٍ ومهدئ؛ يُرجى تأكيد ملاءمته للبشرة الحساسة مع العيادة." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.dermstore.com/p/skinmedica-replenish-hydrating-cream/11289675/", ...caRetailer("Dermstore") }],
    },
  },
  {
    id: "tns-ceramide-treatment-cream",
    slug: "tns-ceramide-treatment-cream",
    slugAr: "كريم-tns-العلاجي-بالسيراميد",
    name: { en: "TNS Ceramide Treatment Cream®", ar: "كريم TNS العلاجي بالسيراميد®" },
    brandId: "skinmedica",
    categoryIds: ["moisturizers"],
    concernIds: [],
    priceCents: 7200,
    sizeLabel: "56.7 g",
    images: [pendingImage("tns-ceramide-treatment-cream", { en: "TNS Ceramide Treatment Cream®", ar: "كريم TNS العلاجي بالسيراميد®" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "A moisture cream formulated to help heal, mend, and soothe severely dry, damaged, or compromised skin.", ar: "كريم ترطيب مصمم للمساعدة في شفاء وإصلاح وتهدئة البشرة الجافة جدًا أو التالفة أو المتضررة." },
      whatItIs: { en: "A barrier-repair cream combining SkinMedica's TNS® technology, peptides, and a patented ceramide complex, per manufacturer information.", ar: "كريم لإصلاح حاجز البشرة يجمع بين تقنية TNS® من سكين ميديكا، والببتيدات، ومركب سيراميد مسجل براءة اختراع، وفق معلومات الشركة المصنّعة." },
      productType: { en: "Ceramide barrier-repair cream", ar: "كريم لإصلاح حاجز البشرة بالسيراميد" },
      routinePlacement: { en: "As the moisturizing step, particularly for very dry or compromised skin.", ar: "كخطوة الترطيب، خصوصًا للبشرة الجافة جدًا أو المتضررة." },
      howToUse: { en: "Apply to face (and neck if desired) as the moisturizing step of your routine.", ar: "يُطبَّق على الوجه (والرقبة إذا رغبتم) كخطوة الترطيب في روتينكم." },
      relatedProductIds: ["dermal-repair-cream", "replenish-hydrating-cream"],
      faqs: [
        { question: { en: "Who is this cream formulated for?", ar: "لمن صُمم هذا الكريم؟" }, answer: { en: "Skin that is severely dry, damaged, or compromised, per manufacturer information.", ar: "البشرة الجافة جدًا أو التالفة أو المتضررة، وفق معلومات الشركة المصنّعة." } },
        { question: { en: "What technology does it use?", ar: "ما التقنية التي يستخدمها؟" }, answer: { en: "SkinMedica's TNS® technology, peptides, and a patented ceramide complex, per manufacturer information.", ar: "تقنية TNS® من سكين ميديكا، والببتيدات، ومركب سيراميد مسجل براءة اختراع، وفق معلومات الشركة المصنّعة." } },
        { question: { en: "How is this different from Dermal Repair Cream?", ar: "كيف يختلف عن كريم إصلاح البشرة؟" }, answer: { en: "Both are rich moisturizers; this one is specifically ceramide-focused for barrier repair — ask the clinic which suits your skin.", ar: "كلاهما مرطبان غنيان؛ إلا أن هذا الكريم مخصص للسيراميد لإصلاح حاجز البشرة — يُرجى سؤال العيادة عن الأنسب لبشرتكم." } },
        { question: { en: "When do I apply it?", ar: "متى أطبّقه؟" }, answer: { en: "As the moisturizing step of your routine.", ar: "كخطوة الترطيب في روتينكم." } },
        { question: { en: "What size is this?", ar: "ما الحجم؟" }, answer: { en: "56.7 g.", ar: "56.7 غرام." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.dermstore.com/p/skinmedica-tns-ceramide-treatment-cream/11289681/", ...caRetailer("Dermstore") }],
    },
  },
  {
    id: "ultra-sheer-moisturizer",
    slug: "ultra-sheer-moisturizer",
    slugAr: "مرطب-خفيف-فائق",
    name: { en: "Ultra Sheer Moisturizer", ar: "مرطب خفيف فائق" },
    brandId: "skinmedica",
    categoryIds: ["moisturizers"],
    concernIds: [],
    priceCents: 6200,
    sizeLabel: "56.7 g",
    images: [pendingImage("ultra-sheer-moisturizer", { en: "Ultra Sheer Moisturizer", ar: "مرطب خفيف فائق" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "A lightweight, oil-free moisturizer enriched with vitamins C and E.", ar: "مرطب خفيف القوام وخالٍ من الزيوت، مدعّم بفيتاميني C وE." },
      whatItIs: { en: "A daily lightweight moisturizer.", ar: "مرطب خفيف للاستخدام اليومي." },
      productType: { en: "Lightweight, oil-free moisturizer", ar: "مرطب خفيف وخالٍ من الزيوت" },
      routinePlacement: { en: "As the moisturizing step of a routine, for those who prefer a lighter finish.", ar: "كخطوة الترطيب في الروتين، لمن يفضلون ملمسًا أخف." },
      keyCharacteristics: { en: ["Oil-free formula, per manufacturer information", "Contains vitamins C and E, per manufacturer information"], ar: ["تركيبة خالية من الزيوت، وفق معلومات الشركة المصنّعة", "تحتوي على فيتاميني C وE، وفق معلومات الشركة المصنّعة"] },
      howToUse: { en: "Apply to face (and neck if desired) as the moisturizing step of your routine.", ar: "يُطبَّق على الوجه (والرقبة إذا رغبتم) كخطوة الترطيب في روتينكم." },
      relatedProductIds: ["rejuvenative-moisturizer", "vitamin-c-e-complex"],
      faqs: [
        { question: { en: "Is this oil-free?", ar: "هل هو خالٍ من الزيوت؟" }, answer: { en: "Yes, per manufacturer information.", ar: "نعم، وفق معلومات الشركة المصنّعة." } },
        { question: { en: "How is this different from Rejuvenative Moisturizer?", ar: "كيف يختلف عن مرطب Rejuvenative؟" }, answer: { en: "Both are moisturizers in this catalogue; this one is positioned as a lighter, sheer finish — ask the clinic which suits your skin type.", ar: "كلاهما مرطبان ضمن هذه القائمة؛ إلا أن هذا المرطب أخف وأكثر شفافية في الملمس — يُرجى سؤال العيادة عن الأنسب لنوع بشرتكم." } },
        { question: { en: "What vitamins does it contain?", ar: "ما الفيتامينات التي يحتوي عليها؟" }, answer: { en: "Vitamins C and E, per manufacturer information.", ar: "فيتامينا C وE، وفق معلومات الشركة المصنّعة." } },
        { question: { en: "When do I apply it?", ar: "متى أطبّقه؟" }, answer: { en: "As the moisturizing step of your routine.", ar: "كخطوة الترطيب في روتينكم." } },
        { question: { en: "What size is this?", ar: "ما الحجم؟" }, answer: { en: "56.7 g.", ar: "56.7 غرام." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.skinmedica.com/us/product-category/moisturizers/20087354.html", ...officialSite }],
    },
  },

  // ============ SCARRING ============
  // Two approved sizes of the same underlying product. Implemented as two
  // independent product pages (the brief's explicitly sanctioned
  // alternative to a single variant-selector page) rather than a variant
  // model — the existing commerce data model has no variant/option
  // concept, and introducing one for a single product pair, while shop
  // checkout stays disabled regardless, isn't worth the added complexity
  // and risk to the working route/type architecture right now. Each links
  // to the other via `variantOfId` so a visitor on either page can find
  // the other size.
  {
    id: "scar-recovery-gel-small",
    slug: "scar-recovery-gel-with-centelline-small",
    slugAr: "جل-علاج-الندبات-بالسنتيلين-صغير",
    name: { en: "Scar Recovery Gel with Centelline® (Small)", ar: "جل علاج الندبات بالسنتيلين® (صغير)" },
    brandId: "skinmedica",
    categoryIds: ["scar-care"],
    concernIds: [],
    priceCents: 4600,
    sizeLabel: "14.2 g",
    images: [pendingImage("scar-recovery-gel-with-centelline-small", { en: "Scar Recovery Gel with Centelline® (Small)", ar: "جل علاج الندبات بالسنتيلين® (صغير)" })],
    approvalStatus: "approved",
    inStock: true,
    variantOfId: "scar-recovery-gel-large",
    detail: {
      overview: { en: "A lightweight gel formulated to help minimize the appearance of scars, in the smaller of two approved sizes.", ar: "جل خفيف القوام مصمم للمساعدة في تقليل مظهر الندبات، بالحجم الأصغر من حجمين معتمدين." },
      whatItIs: { en: "A scar-appearance gel built around Centelline®, a complex of Centella asiatica, Bulbine frutescens, and Oleuropein, per manufacturer information.", ar: "جل لمظهر الندبات يعتمد على مركب Centelline®، وهو مزيج من نبات Centella asiatica وBulbine frutescens وOleuropein، وفق معلومات الشركة المصنّعة." },
      productType: { en: "Scar-appearance gel", ar: "جل لمظهر الندبات" },
      routinePlacement: { en: "Applied directly to a healed scar area, not as part of a general facial routine.", ar: "يُطبَّق مباشرة على منطقة الندبة الملتئمة، وليس كجزء من الروتين العام للوجه." },
      howToUse: { en: "Apply morning and evening after the wound has healed, directly to scars, on smaller incisions and everyday cuts. Continue use until the scar appears flat and without redness.", ar: "يُطبَّق صباحًا ومساءً بعد التئام الجرح، مباشرة على الندبات، على الشقوق الصغيرة والجروح اليومية. يُستمر الاستخدام حتى يصبح مظهر الندبة مسطحًا وخاليًا من الاحمرار." },
      warnings: { en: ["This is a cosmetic gel, not a medical scar-removal treatment — individual outcomes vary and are never guaranteed."], ar: ["هذا جل تجميلي وليس علاجًا طبيًا لإزالة الندبات — تختلف النتائج من شخص لآخر ولا تُضمن أبدًا."] },
      relatedProductIds: ["scar-recovery-gel-large"],
      faqs: [
        { question: { en: "What is Centelline®?", ar: "ما هو Centelline®؟" }, answer: { en: "A complex of Centella asiatica, Bulbine frutescens, and Oleuropein, formulated to help minimize the appearance of scars, per manufacturer information.", ar: "مركب من نبات Centella asiatica وBulbine frutescens وOleuropein، مصمم للمساعدة في تقليل مظهر الندبات، وفق معلومات الشركة المصنّعة." } },
        { question: { en: "When do I start using this?", ar: "متى أبدأ باستخدام هذا الجل؟" }, answer: { en: "After the wound has healed — not on an open wound.", ar: "بعد التئام الجرح — وليس على جرح مفتوح." } },
        { question: { en: "Does this guarantee my scar will disappear?", ar: "هل يضمن هذا المنتج اختفاء الندبة؟" }, answer: { en: "No — results vary by individual, and this is a cosmetic gel, not a guaranteed medical treatment.", ar: "لا — تختلف النتائج من شخص لآخر، وهذا جل تجميلي وليس علاجًا طبيًا مضمونًا." } },
        { question: { en: "What's the difference between this and the large size?", ar: "ما الفرق بين هذا الحجم والحجم الكبير؟" }, answer: { en: "Same product, different size — 14.2 g here versus 56.7 g for the large size.", ar: "المنتج نفسه بحجم مختلف — 14.2 غرام هنا مقابل 56.7 غرام للحجم الكبير." } },
        { question: { en: "How long do I use it for?", ar: "كم من الوقت أستخدمه؟" }, answer: { en: "Until the scar appears flat and without redness, per manufacturer guidance.", ar: "حتى يصبح مظهر الندبة مسطحًا وخاليًا من الاحمرار، وفق إرشادات الشركة المصنّعة." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.skinmedica.com/products/correct/scarrecoverygelcentelline", ...officialSite }],
    },
  },
  {
    id: "scar-recovery-gel-large",
    slug: "scar-recovery-gel-with-centelline-large",
    slugAr: "جل-علاج-الندبات-بالسنتيلين-كبير",
    name: { en: "Scar Recovery Gel with Centelline® (Large)", ar: "جل علاج الندبات بالسنتيلين® (كبير)" },
    brandId: "skinmedica",
    categoryIds: ["scar-care"],
    concernIds: [],
    priceCents: 10800,
    sizeLabel: "56.7 g",
    images: [pendingImage("scar-recovery-gel-with-centelline-large", { en: "Scar Recovery Gel with Centelline® (Large)", ar: "جل علاج الندبات بالسنتيلين® (كبير)" })],
    approvalStatus: "approved",
    inStock: true,
    variantOfId: "scar-recovery-gel-small",
    detail: {
      overview: { en: "A lightweight gel formulated to help minimize the appearance of scars, in the larger of two approved sizes.", ar: "جل خفيف القوام مصمم للمساعدة في تقليل مظهر الندبات، بالحجم الأكبر من حجمين معتمدين." },
      whatItIs: { en: "A scar-appearance gel built around Centelline®, a complex of Centella asiatica, Bulbine frutescens, and Oleuropein, per manufacturer information.", ar: "جل لمظهر الندبات يعتمد على مركب Centelline®، وهو مزيج من نبات Centella asiatica وBulbine frutescens وOleuropein، وفق معلومات الشركة المصنّعة." },
      productType: { en: "Scar-appearance gel", ar: "جل لمظهر الندبات" },
      routinePlacement: { en: "Applied directly to a healed scar area, not as part of a general facial routine.", ar: "يُطبَّق مباشرة على منطقة الندبة الملتئمة، وليس كجزء من الروتين العام للوجه." },
      howToUse: { en: "Apply morning and evening after the wound has healed, directly to scars. Continue use until the scar appears flat and without redness.", ar: "يُطبَّق صباحًا ومساءً بعد التئام الجرح، مباشرة على الندبات. يُستمر الاستخدام حتى يصبح مظهر الندبة مسطحًا وخاليًا من الاحمرار." },
      warnings: { en: ["This is a cosmetic gel, not a medical scar-removal treatment — individual outcomes vary and are never guaranteed."], ar: ["هذا جل تجميلي وليس علاجًا طبيًا لإزالة الندبات — تختلف النتائج من شخص لآخر ولا تُضمن أبدًا."] },
      relatedProductIds: ["scar-recovery-gel-small"],
      faqs: [
        { question: { en: "Why choose the large size?", ar: "لماذا أختار الحجم الكبير؟" }, answer: { en: "For a larger scar area or more extended use — ask the clinic which size suits your situation.", ar: "لمنطقة ندبة أكبر أو استخدام أطول — يُرجى سؤال العيادة عن الحجم الأنسب لحالتكم." } },
        { question: { en: "When do I start using this?", ar: "متى أبدأ باستخدام هذا الجل؟" }, answer: { en: "After the wound has healed — not on an open wound.", ar: "بعد التئام الجرح — وليس على جرح مفتوح." } },
        { question: { en: "Does this guarantee my scar will disappear?", ar: "هل يضمن هذا المنتج اختفاء الندبة؟" }, answer: { en: "No — results vary by individual, and this is a cosmetic gel, not a guaranteed medical treatment.", ar: "لا — تختلف النتائج من شخص لآخر، وهذا جل تجميلي وليس علاجًا طبيًا مضمونًا." } },
        { question: { en: "What's the difference between this and the small size?", ar: "ما الفرق بين هذا الحجم والحجم الصغير؟" }, answer: { en: "Same product, different size — 56.7 g here versus 14.2 g for the small size.", ar: "المنتج نفسه بحجم مختلف — 56.7 غرام هنا مقابل 14.2 غرام للحجم الصغير." } },
        { question: { en: "How long do I use it for?", ar: "كم من الوقت أستخدمه؟" }, answer: { en: "Until the scar appears flat and without redness, per manufacturer guidance.", ar: "حتى يصبح مظهر الندبة مسطحًا وخاليًا من الاحمرار، وفق إرشادات الشركة المصنّعة." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.skinmedica.com/products/correct/scarrecoverygelcentelline", ...officialSite }],
    },
  },

  // ============ REJUVENATION ============
  {
    id: "tns-advanced-plus-serum",
    slug: "tns-advanced-plus-serum",
    slugAr: "سيروم-tns-المتقدم-بلس",
    name: { en: "TNS® Advanced+ Serum", ar: "سيروم TNS® المتقدم+" },
    brandId: "skinmedica",
    categoryIds: ["serums"],
    concernIds: [],
    priceCents: 33000,
    sizeLabel: "28.4 g",
    images: [pendingImage("tns-advanced-plus-serum", { en: "TNS® Advanced+ Serum", ar: "سيروم TNS® المتقدم+" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "A serum built on SkinMedica's TNS® growth-factor technology, formulated to support collagen production and cellular activity.", ar: "سيروم يعتمد على تقنية TNS® لعوامل النمو من سكين ميديكا، ومصمم لدعم إنتاج الكولاجين والنشاط الخلوي." },
      whatItIs: { en: "A growth-factor serum. Per manufacturer information, it contains 450 total growth factors, described as more than any previous TNS formulation.", ar: "سيروم بعوامل النمو. وفق معلومات الشركة المصنّعة، يحتوي على 450 عامل نمو إجمالًا، وتصفه الشركة بأنه يفوق أي تركيبة سابقة من TNS." },
      productType: { en: "Growth-factor serum", ar: "سيروم بعوامل النمو" },
      routinePlacement: { en: "Morning and evening, after cleansing and toning; if used with TNS Recovery Complex, apply Recovery Complex first, then this serum.", ar: "صباحًا ومساءً، بعد التنظيف والتونر؛ وعند استخدامه مع TNS Recovery Complex، يُطبَّق Recovery Complex أولًا ثم هذا السيروم." },
      howToUse: { en: "Apply to the entire face (neck and chest if desired), morning and evening. Avoid the eye area; if contact occurs, rinse eyes thoroughly with water.", ar: "يُطبَّق على الوجه بالكامل (والرقبة والصدر إذا رغبتم)، صباحًا ومساءً. تجنّبوا منطقة العين؛ وفي حال الملامسة، اشطفوا العينين جيدًا بالماء." },
      legacyNameNote: { en: "The approved catalogue listed this as \"TNS Advanced Plus Serum®.\" Current official and Canadian-retailer naming and trademark placement is \"TNS® Advanced+ Serum\" (confirmed on skinmedica.com and Dermstore.com) — used here; the approved price and size are unchanged.", ar: "أدرجت القائمة المعتمدة هذا المنتج باسم \"TNS Advanced Plus Serum®\". أما التسمية الرسمية الحالية وموضع العلامة التجارية المعتمدين لدى المتاجر الكندية فهما \"TNS® Advanced+ Serum\" (تم التأكد من ذلك عبر skinmedica.com وDermstore.com) — وقد اعتُمد هذا الشكل هنا، مع بقاء السعر والحجم المعتمدين دون تغيير." },
      relatedProductIds: ["tns-recovery-complex", "vitamin-c-e-complex"],
      faqs: [
        { question: { en: "How many growth factors does this contain?", ar: "كم عامل نمو يحتوي هذا السيروم؟" }, answer: { en: "450 total growth factors, per manufacturer information — described as more than any previous TNS formulation.", ar: "450 عامل نمو إجمالًا، وفق معلومات الشركة المصنّعة — وتصفه الشركة بأنه يفوق أي تركيبة سابقة من TNS." } },
        { question: { en: "Why does the name differ slightly from the approved catalogue?", ar: "لماذا يختلف الاسم قليلًا عن القائمة المعتمدة؟" }, answer: { en: "The approved catalogue listed \"TNS Advanced Plus Serum®\"; the current official naming/trademark styling is \"TNS® Advanced+ Serum.\" The approved price and size are unchanged.", ar: "أدرجت القائمة المعتمدة اسم \"TNS Advanced Plus Serum®\"؛ بينما التسمية الرسمية الحالية هي \"TNS® Advanced+ Serum\". مع بقاء السعر والحجم المعتمدين دون تغيير." } },
        { question: { en: "Should I use this with TNS Recovery Complex?", ar: "هل أستخدمه مع TNS Recovery Complex؟" }, answer: { en: "If using both, apply TNS Recovery Complex first, then this serum, per manufacturer guidance.", ar: "عند استخدام كليهما، يُطبَّق TNS Recovery Complex أولًا، ثم هذا السيروم، وفق إرشادات الشركة المصنّعة." } },
        { question: { en: "When do I apply this?", ar: "متى أطبّق هذا السيروم؟" }, answer: { en: "Morning and evening, after cleansing and toning.", ar: "صباحًا ومساءً، بعد التنظيف والتونر." } },
        { question: { en: "What size is this?", ar: "ما الحجم؟" }, answer: { en: "28.4 g.", ar: "28.4 غرام." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.dermstore.com/p/skinmedica-tns-advanced-serum-28.4g/12596429/", ...caRetailer("Dermstore") }, { url: "https://www.skinmedica.com/us/skin-concern/fine-line-and-wrinkles/20086513.html", ...officialSite }],
    },
  },
  {
    id: "tns-recovery-complex",
    slug: "tns-recovery-complex",
    slugAr: "مركب-tns-للتعافي",
    name: { en: "TNS Recovery Complex®", ar: "مركب TNS للتعافي®" },
    brandId: "skinmedica",
    categoryIds: ["serums"],
    concernIds: [],
    priceCents: 25000,
    sizeLabel: "28.4 g",
    images: [pendingImage("tns-recovery-complex", { en: "TNS Recovery Complex®", ar: "مركب TNS للتعافي®" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "A concentrated growth-factor serum formulated to help reduce the appearance of fine lines and wrinkles while improving skin tone and texture.", ar: "سيروم مركّز بعوامل النمو مصمم للمساعدة في تقليل مظهر الخطوط الدقيقة والتجاعيد مع تحسين لون وملمس البشرة." },
      whatItIs: { en: "A growth-factor and exosome serum. Per manufacturer information, it contains over 1 trillion exosomes per bottle, described as the highest concentration of the brand's patented growth-factor blend.", ar: "سيروم بعوامل النمو والإكسوسومات. وفق معلومات الشركة المصنّعة، يحتوي على أكثر من تريليون إكسوسوم في كل زجاجة، وتصفه بأنه يحتوي على أعلى تركيز من مزيج عوامل النمو المسجل الخاص بالعلامة." },
      productType: { en: "Growth-factor and exosome serum", ar: "سيروم بعوامل النمو والإكسوسومات" },
      routinePlacement: { en: "Morning and evening, after cleansing and toning; if used with TNS Advanced+ Serum, apply this first.", ar: "صباحًا ومساءً، بعد التنظيف والتونر؛ وعند استخدامه مع سيروم TNS المتقدم+، يُطبَّق هذا المنتج أولًا." },
      howToUse: { en: "Apply to the entire face (neck and chest if desired), morning and evening. Avoid the eye area; if contact occurs, rinse eyes thoroughly with water.", ar: "يُطبَّق على الوجه بالكامل (والرقبة والصدر إذا رغبتم)، صباحًا ومساءً. تجنّبوا منطقة العين؛ وفي حال الملامسة، اشطفوا العينين جيدًا بالماء." },
      relatedProductIds: ["tns-advanced-plus-serum", "vitamin-c-e-complex"],
      faqs: [
        { question: { en: "What are exosomes?", ar: "ما هي الإكسوسومات؟" }, answer: { en: "The manufacturer describes this product as containing over 1 trillion exosomes per bottle as part of its growth-factor and protein blend.", ar: "تصف الشركة المصنّعة هذا المنتج بأنه يحتوي على أكثر من تريليون إكسوسوم في كل زجاجة ضمن مزيجه من عوامل النمو والبروتينات." } },
        { question: { en: "Should this go before or after TNS Advanced+ Serum?", ar: "هل يُستخدم قبل أم بعد سيروم TNS المتقدم+؟" }, answer: { en: "Before — apply TNS Recovery Complex first, then TNS Advanced+ Serum, per manufacturer guidance.", ar: "قبل — يُطبَّق TNS Recovery Complex أولًا، ثم سيروم TNS المتقدم+، وفق إرشادات الشركة المصنّعة." } },
        { question: { en: "When do I apply this?", ar: "متى أطبّق هذا السيروم؟" }, answer: { en: "Morning and evening, after cleansing and toning.", ar: "صباحًا ومساءً، بعد التنظيف والتونر." } },
        { question: { en: "What is this formulated to help with?", ar: "لماذا صُمم هذا السيروم؟" }, answer: { en: "The appearance of fine lines and wrinkles, and skin tone and texture, per manufacturer information.", ar: "مظهر الخطوط الدقيقة والتجاعيد، ولون وملمس البشرة، وفق معلومات الشركة المصنّعة." } },
        { question: { en: "What size is this?", ar: "ما الحجم؟" }, answer: { en: "28.4 g.", ar: "28.4 غرام." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.skinmedica.com/us/product-category/correction/95863.html", ...officialSite }],
    },
  },
  {
    id: "ha5-rejuvenative-hydrator",
    slug: "ha5-rejuvenative-hydrator",
    slugAr: "مرطب-ha5-المنشط",
    name: { en: "HA5® Rejuvenating Hydrator", ar: "مرطب HA5® المنشط" },
    brandId: "skinmedica",
    categoryIds: ["moisturizers", "serums"],
    concernIds: [],
    priceCents: 19600,
    sizeLabel: "56.7 g",
    images: [pendingImage("ha5-rejuvenative-hydrator", { en: "HA5® Rejuvenating Hydrator", ar: "مرطب HA5® المنشط" })],
    approvalStatus: "approved",
    inStock: true,
    detail: {
      overview: { en: "A hydrating serum blending five forms of hyaluronic acid, for all skin types.", ar: "سيروم مرطب يجمع بين خمسة أشكال من حمض الهيالورونيك، لجميع أنواع البشرة." },
      whatItIs: { en: "A multi-molecular-weight hyaluronic acid serum with SkinMedica's VITISENSCE antioxidant technology, per manufacturer information.", ar: "سيروم بحمض الهيالورونيك متعدد الأوزان الجزيئية، مع تقنية VITISENSCE المضادة للأكسدة من سكين ميديكا، وفق معلومات الشركة المصنّعة." },
      productType: { en: "Hyaluronic acid hydrating serum", ar: "سيروم مرطب بحمض الهيالورونيك" },
      routinePlacement: { en: "Twice daily; if used with other treatment products such as Lytera or a retinol product, apply this as the last step before moisturizer.", ar: "مرتين يوميًا؛ وعند استخدامه مع منتجات علاجية أخرى مثل Lytera أو منتج ريتينول، يُطبَّق كخطوة أخيرة قبل المرطب." },
      keyCharacteristics: { en: ["Blends five forms of hyaluronic acid, per manufacturer information", "Formulated for all skin types"], ar: ["يجمع بين خمسة أشكال من حمض الهيالورونيك، وفق معلومات الشركة المصنّعة", "مصمم لجميع أنواع البشرة"] },
      howToUse: { en: "Apply to face, neck, or décolleté twice daily.", ar: "يُطبَّق على الوجه والرقبة أو أعلى الصدر مرتين يوميًا." },
      legacyNameNote: { en: "The approved catalogue listed this as \"HA5 Rejuvenative Hydrator.\" Current official and Canadian-retailer naming (confirmed on multiple authorized retailers) is \"HA5® Rejuvenating Hydrator\" — used here; the approved price and size are unchanged.", ar: "أدرجت القائمة المعتمدة هذا المنتج باسم \"HA5 Rejuvenative Hydrator\". أما التسمية الرسمية الحالية لدى المتاجر الكندية المعتمدة (تم التأكد منها عبر عدة متاجر) فهي \"HA5® Rejuvenating Hydrator\" — وقد اعتُمد هذا الشكل هنا، مع بقاء السعر والحجم المعتمدين دون تغيير." },
      relatedProductIds: ["lytera-2-pigment-brightening-serum", "retinol-complex-025"],
      faqs: [
        { question: { en: "Why does the name differ from the approved catalogue?", ar: "لماذا يختلف الاسم عن القائمة المعتمدة؟" }, answer: { en: "The approved catalogue listed \"HA5 Rejuvenative Hydrator\"; current official/retailer naming is \"HA5® Rejuvenating Hydrator.\" The approved price and size are unchanged, and this is the same product.", ar: "أدرجت القائمة المعتمدة اسم \"HA5 Rejuvenative Hydrator\"؛ بينما التسمية الرسمية/التجارية الحالية هي \"HA5® Rejuvenating Hydrator\". مع بقاء السعر والحجم المعتمدين دون تغيير، وهو المنتج نفسه." } },
        { question: { en: "How many types of hyaluronic acid does it contain?", ar: "كم نوعًا من حمض الهيالورونيك يحتوي؟" }, answer: { en: "Five forms, per manufacturer information.", ar: "خمسة أشكال، وفق معلومات الشركة المصنّعة." } },
        { question: { en: "How often do I use it?", ar: "كم مرة أستخدمه؟" }, answer: { en: "Twice daily.", ar: "مرتين يوميًا." } },
        { question: { en: "When do I apply it relative to other treatments?", ar: "متى أطبّقه بالنسبة للعلاجات الأخرى؟" }, answer: { en: "If used with other treatment products, apply it as the last step before moisturizer.", ar: "عند استخدامه مع منتجات علاجية أخرى، يُطبَّق كخطوة أخيرة قبل المرطب." } },
        { question: { en: "What size is this?", ar: "ما الحجم؟" }, answer: { en: "56.7 g.", ar: "56.7 غرام." } },
        { question: { en: "How do I confirm current price and availability?", ar: "كيف أتحقق من السعر والتوفر الحاليين؟" }, answer: { en: "Contact Blue Diamond Medical Clinic directly.", ar: "تواصلوا مباشرة مع عيادة بلو دايموند الطبية." } },
      ],
      sources: [{ url: "https://www.dermstore.com/p/skinmedica-ha5-rejuvenating-hydrator/11290631/", ...caRetailer("Dermstore") }, { url: "https://dermshop.ca/collections/skinmedica", ...caRetailer("Dermshop.ca") }],
    },
  },
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
    name: { en: "THE PURIFYING PEELING", ar: "THE PURIFYING PEELING" },
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
        "Recommended in a treatment course for long-term results.",
      ],
      ar: [
        "Liposoluble anti-inflammatory formula.",
        "Suitable for alternating use or as a prep with AHA-based products.",
        "Recommended in a treatment course for long-term results.",
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
      en: "This is a professional-use peel applied by a trained clinician at Blue Diamond Medical. It is shown here for information and is not available to purchase online \u2014 please ask the clinic.",
      ar: "This is a professional-use peel applied by a trained clinician at Blue Diamond Medical. It is shown here for information and is not available to purchase online \u2014 please ask the clinic.",
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
    name: { en: "THE BRIGHTENING PEELING", ar: "THE BRIGHTENING PEELING" },
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
      en: "This is a professional-use peel applied by a trained clinician at Blue Diamond Medical. Its price has not been supplied, and it is not available to purchase online \u2014 please ask the clinic about pricing.",
      ar: "This is a professional-use peel applied by a trained clinician at Blue Diamond Medical. Its price has not been supplied, and it is not available to purchase online \u2014 please ask the clinic about pricing.",
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
        "Protects skin and helps prevent aging caused by environmental aggressions.",
        "Lightweight and silky formula for long-term healthy skin.",
        "Suitable for normal to dehydrated skin.",
      ],
      ar: [
        "Protects skin and helps prevent aging caused by environmental aggressions.",
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
        "Apply evenly to the face, neck, and decollete.",
        "Use with the C-Serum to support the skin's natural defenses.",
      ],
      ar: [
        "Apply evenly to the face, neck, and decollete.",
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
        "Protects skin and helps prevent aging caused by environmental aggressions.",
        "Mattifying formula helps control and stabilize sebum production throughout the day.",
        "Suitable for oily or combination skin and skin intolerant to moisturizing creams.",
      ],
      ar: [
        "Protects skin and helps prevent aging caused by environmental aggressions.",
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
        "Apply evenly to the face, neck, and decollete.",
        "Use with the C-Serum to support the skin's natural defenses.",
      ],
      ar: [
        "Apply evenly to the face, neck, and decollete.",
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
        "Apply evenly to the face, neck, and decollete.",
        "Use with the C-Serum to support the skin's natural defenses.",
      ],
      ar: [
        "Apply evenly to the face, neck, and decollete.",
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
        "Promotes healing and instantly soothes redness and skin discomfort.",
        "Helps maintain facial hydration throughout the day.",
      ],
      ar: [
        "Promotes healing and instantly soothes redness and skin discomfort.",
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
        "Repairs and protects skin following ablative procedures and extremely dehydrated skin.",
        "Supports healing and helps reduce infection risk.",
      ],
      ar: [
        "Repairs and protects skin following ablative procedures and extremely dehydrated skin.",
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
        "Protects against external aggressors.",
      ],
      ar: [
        "Stimulates collagen production.",
        "Reduces wrinkles and repairs environmental damage.",
        "Firms and tones skin for a more youthful appearance.",
        "Deeply hydrates and leaves skin silky.",
        "Protects against external aggressors.",
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
    subtitle: { en: "Post-treatment support for purifying peels, IPL, or facial treatments for teenagers", ar: "Post-treatment support for purifying peels, IPL, or facial treatments for teenagers" },
    categoryIds: ["kits"],
    concernIds: [],
    sizeLabel: "3-month kit - complete set",
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
    subtitle: { en: "Post-treatment support for IPL, ND:YAG laser, or redness and sensitivity care", ar: "Post-treatment support for IPL, ND:YAG laser, or redness and sensitivity care" },
    categoryIds: ["kits"],
    concernIds: [],
    sizeLabel: "3-month kit - complete set support",
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
    sizeLabel: "3-month kit - complete set support",
    priceCents: null,
    kitContents: {
      en: [
        "The Cleanser 100 ml",
        "The Ultra-Protective 50 ml",
        "The Dermo-Repair Complex 1 50 ml",
        "The Dermo-Repair Complex 2 50 ml",
      ],
      ar: [
        "The Cleanser 100 ml",
        "The Ultra-Protective 50 ml",
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
    sizeLabel: "3-month kit - complete set support",
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
    sizeLabel: "3-month kit - complete set",
    priceCents: null,
    kitContents: {
      en: [
        "The Cleanser 100 ml",
        "The Soothing Gel 100 ml",
        "The Ultra-Protective Cream 50 ml",
        "The C-Retinol 50 ml",
      ],
      ar: [
        "The Cleanser 100 ml",
        "The Soothing Gel 100 ml",
        "The Ultra-Protective Cream 50 ml",
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
        "The Ultra-Protective 5 ml",
        "The Dermo-Repair Complex 1 5 ml",
        "The Dermo-Repair Complex 2 5 ml",
      ],
      ar: [
        "The Cleanser 30 ml",
        "The Ultra-Protective 5 ml",
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
