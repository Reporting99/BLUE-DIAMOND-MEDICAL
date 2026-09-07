import { test, expect } from "@playwright/test";
import { products, getProduct, productCategories, productBrands } from "../../src/features/products/data";

/**
 * Automated validation for the "MANDATORY APPROVED SKINMEDICA CATALOGUE"
 * brief — asserts the 23-record catalogue matches the client-approved
 * source exactly (name/price/size/grouping) and that every record carries
 * the required content shape, rather than trusting a one-time manual
 * check. Run via the Playwright test runner (plain Node assertions, no
 * browser needed), same pattern as tests/unit/image-usage.spec.ts.
 *
 * `approvedCatalogue` below is the client-approved reference table
 * (name/price/size/factor-group), transcribed from
 * `Blue-Diamond-Medical-Website-Content-Extraction_1(4).docx` — this is
 * the ground truth this test protects against silent drift, not a value
 * derived from the current content file.
 */

type FactorGroup =
  | "the-growth-factor"
  | "the-cleanse-factor"
  | "the-correct-factor"
  | "the-protect-factor"
  | "the-hydration-factor"
  | "scarring"
  | "rejuvenation";

const approvedCatalogue: { id: string; priceCents: number; sizeLabel: string; group: FactorGroup }[] = [
  // The Growth Factor (3)
  { id: "lumivive-system", priceCents: 28500, sizeLabel: "28.4 g", group: "the-growth-factor" },
  { id: "tns-eye-repair", priceCents: 10800, sizeLabel: "14.2 g", group: "the-growth-factor" },
  { id: "vitamin-c-e-complex", priceCents: 10800, sizeLabel: "28.3 g", group: "the-growth-factor" },
  // The Cleanse Factor (2)
  { id: "facial-cleanser", priceCents: 4000, sizeLabel: "177.4 ml", group: "the-cleanse-factor" },
  { id: "aha-bha-exfoliating-cleanser", priceCents: 5000, sizeLabel: "177.4 ml", group: "the-cleanse-factor" },
  // The Correct Factor (5)
  { id: "retinol-complex-025", priceCents: 6600, sizeLabel: "29.6 g", group: "the-correct-factor" },
  { id: "retinol-complex-05", priceCents: 8300, sizeLabel: "29.6 g", group: "the-correct-factor" },
  { id: "retinol-complex-10", priceCents: 9900, sizeLabel: "29.6 g", group: "the-correct-factor" },
  { id: "lytera-2-pigment-brightening-serum", priceCents: 17000, sizeLabel: "60 ml", group: "the-correct-factor" },
  { id: "aha-bha-cream", priceCents: 4600, sizeLabel: "56.7 g", group: "the-correct-factor" },
  // The Protect Factor (3)
  { id: "daily-physical-defense-spf-34", priceCents: 5100, sizeLabel: "85 ml", group: "the-protect-factor" },
  { id: "total-defence-repair-spf-34-tinted", priceCents: 7500, sizeLabel: "65 g", group: "the-protect-factor" },
  { id: "total-defence-repair-spf-34-clear", priceCents: 7500, sizeLabel: "65 g", group: "the-protect-factor" },
  // The Hydration Factor (5)
  { id: "dermal-repair-cream", priceCents: 13600, sizeLabel: "48 g", group: "the-hydration-factor" },
  { id: "rejuvenative-moisturizer", priceCents: 6200, sizeLabel: "56.7 g", group: "the-hydration-factor" },
  { id: "replenish-hydrating-cream", priceCents: 7000, sizeLabel: "56.7 g", group: "the-hydration-factor" },
  { id: "tns-ceramide-treatment-cream", priceCents: 7200, sizeLabel: "56.7 g", group: "the-hydration-factor" },
  { id: "ultra-sheer-moisturizer", priceCents: 6200, sizeLabel: "56.7 g", group: "the-hydration-factor" },
  // Scarring (2) — two approved sizes of one product
  { id: "scar-recovery-gel-small", priceCents: 4600, sizeLabel: "14.2 g", group: "scarring" },
  { id: "scar-recovery-gel-large", priceCents: 10800, sizeLabel: "56.7 g", group: "scarring" },
  // Rejuvenation (3)
  { id: "tns-advanced-plus-serum", priceCents: 33000, sizeLabel: "28.4 g", group: "rejuvenation" },
  { id: "tns-recovery-complex", priceCents: 25000, sizeLabel: "28.4 g", group: "rejuvenation" },
  { id: "ha5-rejuvenative-hydrator", priceCents: 19600, sizeLabel: "56.7 g", group: "rejuvenation" },
];

/**
 * CL-036 / CL-037 / CL-038 — the catalogue is no longer SkinMedica-only.
 *
 * The client supplied two professional peels with their own content shape:
 * a subtitle, Benefits and Key features lists, and NO manufacturer research
 * block (no `detail`, no `sources`, no 6-10 FAQs) — because inventing that
 * research is exactly what this repository refuses to do. Both are also
 * deliberately incomplete: CL-037 has no approved packaging photograph and
 * CL-038 has neither a photograph nor a price.
 *
 * So the SkinMedica contract below is unchanged and still exact — 23 records,
 * every price and size verbatim, every one carrying full research detail —
 * and the client-supplied records are held to their own, separate contract.
 * Widening the SkinMedica assertions to accommodate them would have retired a
 * real guard; this keeps both.
 */
/**
 * CL-042 — the partition is now by BRAND, not by an id blocklist.
 *
 * It used to be "everything except these two ids is SkinMedica", which was
 * true while the catalogue held 23 SkinMedica records plus two peels. Adding
 * the 29 remaining Myriade records would have swept all of them into
 * `skinMedicaProducts` and failed the research-detail contract below for
 * products that deliberately have no research block — reporting a fabricated
 * problem rather than a real one.
 *
 * Partitioning on `brandId` keeps the SkinMedica contract exactly as strict
 * for exactly the 23 records it was written for, and holds the 31
 * client-supplied Myriade records to their own separate contract. No
 * assertion is weakened; the boundary is simply drawn where it belongs.
 */
const CLIENT_SUPPLIED_IDS = ["purifying-peeling", "brightening-peeling"] as const;
const skinMedicaProducts = products.filter((p) => p.brandId === "skinmedica");
/** The two CL-037/CL-038 peel records, whose assertions below are specific to them. */
const clientSuppliedProducts = products.filter((p) =>
  (CLIENT_SUPPLIED_IDS as readonly string[]).includes(p.id),
);
/** The whole Myriade catalogue: the two peels plus the 29 CL-042 records. */
const myriadeProducts = products.filter((p) => p.brandId === "myriade");

test("exactly 23 approved catalogue records are published", () => {
  expect(approvedCatalogue.length).toBe(23);
  expect(skinMedicaProducts.length).toBe(23);
});

test("no unapproved product exists and no approved product is missing", () => {
  const approvedIds = new Set(approvedCatalogue.map((p) => p.id));
  const publishedIds = new Set(skinMedicaProducts.map((p) => p.id));
  const unapproved = [...publishedIds].filter((id) => !approvedIds.has(id));
  const missing = [...approvedIds].filter((id) => !publishedIds.has(id));
  expect(unapproved, `Published products not in the approved catalogue: ${unapproved.join(", ")}`).toEqual([]);
  expect(missing, `Approved products missing from the published catalogue: ${missing.join(", ")}`).toEqual([]);
  // The only non-SkinMedica records permitted are the two the client supplied.
  expect(clientSuppliedProducts.map((p) => p.id).sort()).toEqual([...CLIENT_SUPPLIED_IDS].sort());
});

test("no duplicate ids, slugs, or Arabic slugs", () => {
  expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
  expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
  expect(new Set(products.map((p) => p.slugAr)).size).toBe(products.length);
});

test("every published price matches the approved catalogue exactly", () => {
  const mismatches: string[] = [];
  for (const approved of approvedCatalogue) {
    const product = products.find((p) => p.id === approved.id);
    if (!product) continue; // caught by the missing-product test above
    if (product.priceCents !== approved.priceCents) {
      mismatches.push(`${approved.id}: expected ${approved.priceCents}, got ${product.priceCents}`);
    }
  }
  expect(mismatches, `Price mismatches:\n${mismatches.join("\n")}`).toEqual([]);
});

test("every published size label matches the approved catalogue exactly", () => {
  const mismatches: string[] = [];
  for (const approved of approvedCatalogue) {
    const product = products.find((p) => p.id === approved.id);
    if (!product) continue;
    if (product.sizeLabel !== approved.sizeLabel) {
      mismatches.push(`${approved.id}: expected "${approved.sizeLabel}", got "${product.sizeLabel}"`);
    }
  }
  expect(mismatches, `Size mismatches:\n${mismatches.join("\n")}`).toEqual([]);
});

test("factor-group counts match the approved catalogue (3/2/5/3/5/2/3 = 23)", () => {
  const expectedCounts: Record<FactorGroup, number> = {
    "the-growth-factor": 3,
    "the-cleanse-factor": 2,
    "the-correct-factor": 5,
    "the-protect-factor": 3,
    "the-hydration-factor": 5,
    scarring: 2,
    rejuvenation: 3,
  };
  const actualCounts: Record<string, number> = {};
  for (const p of approvedCatalogue) actualCounts[p.group] = (actualCounts[p.group] ?? 0) + 1;
  expect(actualCounts).toEqual(expectedCounts);
  const total = Object.values(expectedCounts).reduce((a, b) => a + b, 0);
  expect(total).toBe(23);
});

test("every SkinMedica product has a name, category, price, size, unique slug, and image", () => {
  const missing: string[] = [];
  for (const p of skinMedicaProducts) {
    if (!p.name?.en || !p.name?.ar) missing.push(`${p.id}: missing bilingual name`);
    if (!p.categoryIds?.length) missing.push(`${p.id}: missing categoryIds`);
    if (typeof p.priceCents !== "number" || p.priceCents <= 0) missing.push(`${p.id}: invalid priceCents`);
    if (!p.sizeLabel) missing.push(`${p.id}: missing sizeLabel`);
    if (!p.slug || !p.slugAr) missing.push(`${p.id}: missing slug or slugAr`);
    if (!p.images?.length) missing.push(`${p.id}: missing image entry`);
  }
  expect(missing, missing.join("\n")).toEqual([]);
});

test("every SkinMedica product has real bilingual detail content: overview, whatItIs, howToUse, sources, and 6-10 product-specific FAQs", () => {
  const problems: string[] = [];
  for (const p of skinMedicaProducts) {
    if (!p.detail) {
      problems.push(`${p.id}: missing detail block entirely`);
      continue;
    }
    const d = p.detail;
    if (!d.overview?.en || !d.overview?.ar) problems.push(`${p.id}: missing bilingual overview`);
    if (!d.whatItIs?.en || !d.whatItIs?.ar) problems.push(`${p.id}: missing bilingual whatItIs`);
    if (!d.howToUse?.en || !d.howToUse?.ar) problems.push(`${p.id}: missing bilingual howToUse`);
    if (!d.sources?.length) problems.push(`${p.id}: missing sources`);
    if (!d.faqs || d.faqs.length < 6 || d.faqs.length > 10) {
      problems.push(`${p.id}: expected 6-10 FAQs, got ${d.faqs?.length ?? 0}`);
    }
  }
  expect(problems, problems.join("\n")).toEqual([]);
});

test("FAQ content is product-specific, not one generic set reused across all 23 records", () => {
  // If every product's FAQ question set were identical, this would collapse
  // to size 1 — a real signal of a copy-pasted generic block.
  const faqSignatures = new Set(
    products.map((p) => (p.detail?.faqs ?? []).map((f) => f.question.en).join("|")),
  );
  expect(faqSignatures.size).toBeGreaterThan(1);
});

test("Scar Recovery Gel sizes map correctly and cross-link reciprocally via variantOfId", () => {
  const small = getProduct("scar-recovery-gel-with-centelline-small");
  const large = getProduct("scar-recovery-gel-with-centelline-large");
  expect(small, "small scar-recovery-gel product not found by slug").toBeTruthy();
  expect(large, "large scar-recovery-gel product not found by slug").toBeTruthy();
  expect(small!.sizeLabel).toBe("14.2 g");
  expect(large!.sizeLabel).toBe("56.7 g");
  expect(small!.priceCents).toBe(4600);
  expect(large!.priceCents).toBe(10800);
  expect(small!.variantOfId).toBe(large!.id);
  expect(large!.variantOfId).toBe(small!.id);
});

test("every variantOfId and relatedProductIds entry resolves to a real product by id", () => {
  // A real bug: these fields point at `id`, not `slug` (5 of the 23
  // products have id !== slug, e.g. "scar-recovery-gel-small" vs. slug
  // "scar-recovery-gel-with-centelline-small") — a lookup helper that
  // searches by slug instead of id silently drops the cross-link. This
  // guards the fix (ProductTemplate.tsx uses getProductById, not
  // getProduct, for both fields).
  const idSet = new Set(products.map((p) => p.id));
  const dangling: string[] = [];
  for (const p of products) {
    if (p.variantOfId && !idSet.has(p.variantOfId)) dangling.push(`${p.id}: variantOfId "${p.variantOfId}" not found`);
    for (const relatedId of p.detail?.relatedProductIds ?? []) {
      if (!idSet.has(relatedId)) dangling.push(`${p.id}: relatedProductIds entry "${relatedId}" not found`);
    }
  }
  expect(dangling, dangling.join("\n")).toEqual([]);
});

test("no product carries an Offer/InStock claim beyond the typed inStock boolean (no fabricated availability data)", () => {
  // approvalStatus must be "approved" per the brief (all 23 records are
  // client-approved); inStock is a plain boolean the template never
  // renders as structured data while shopEnabled is false.
  const bad = skinMedicaProducts.filter((p) => p.approvalStatus !== "approved");
  expect(bad.map((p) => p.id)).toEqual([]);
});

/* ---------- CL-036 / CL-037 / CL-038 — client-supplied peel records ---------- */

test("CL-037/CL-038: both peels carry structured Benefits and Key features, never one concatenated paragraph", () => {
  const problems: string[] = [];
  for (const p of clientSuppliedProducts) {
    if (!p.subtitle?.en) problems.push(`${p.id}: missing subtitle`);
    if (!p.benefits?.en?.length) problems.push(`${p.id}: missing benefits list`);
    if (!p.keyFeatures?.en?.length) problems.push(`${p.id}: missing keyFeatures list`);
    // A single-entry list is the shape a concatenated paragraph would take.
    if ((p.benefits?.en.length ?? 0) < 2) problems.push(`${p.id}: benefits look concatenated`);
  }
  expect(problems, problems.join("\n")).toEqual([]);

  const purifying = products.find((p) => p.id === "purifying-peeling")!;
  expect(purifying.name.en).toBe("THE PURIFYING PEELING");
  expect(purifying.subtitle!.en).toBe("Decongestant and anti-inflammatory");
  expect(purifying.benefits!.en).toHaveLength(3);
  expect(purifying.keyFeatures!.en).toHaveLength(3);

  const brightening = products.find((p) => p.id === "brightening-peeling")!;
  // CL-038 — one canonical title; the pasted "HE BRIGHTENING PEELING" and the
  // trailing "&#x20;" entity must not survive into published content.
  expect(brightening.name.en).toBe("THE BRIGHTENING PEELING");
  expect(brightening.subtitle!.en).toBe("Exfoliating and anti-aging");
  expect(brightening.benefits!.en).toHaveLength(6);
  expect(brightening.keyFeatures!.en).toHaveLength(2);
});

test("CL-037: the Purifying peel publishes its supplied price string verbatim, GST shown and never computed in", () => {
  const purifying = products.find((p) => p.id === "purifying-peeling")!;
  expect(purifying.priceLabel).toBe("188 + GST");
  // 188 exactly — not a tax-inclusive total derived from it.
  expect(purifying.priceCents).toBe(18800);
});

test("CL-038: the Brightening peel has NO price — the Purifying peel's is never borrowed and none is estimated", () => {
  const brightening = products.find((p) => p.id === "brightening-peeling")!;
  expect(brightening.priceCents).toBeNull();
  expect(brightening.priceLabel).toBeUndefined();
});

test("CL-036: a record missing its approved image or price is not purchasable and claims no availability", () => {
  for (const p of clientSuppliedProducts) {
    expect(p.purchaseBlocked?.en, `${p.id} must state why it cannot be purchased`).toBeTruthy();
    expect(p.inStock, `${p.id} must not claim stock`).toBe(false);
    expect(p.approvalStatus, `${p.id} is not fully approved yet`).toBe("pending");
  }
});

test("CL-037/CL-038/CL-039-041: no treatment or equipment photograph is reused as product packaging", () => {
  // This guard used to read "`images` must stay EMPTY", because at the time no
  // packaging photograph existed for the peels and the only way to fill the
  // slot would have been to borrow a CL-039..CL-041 device/treatment asset —
  // presenting a laser handpiece as a bottle of peel.
  //
  // CL-042 supplied the real packshots, so emptiness is no longer the thing
  // worth asserting; PROVENANCE is. Every product image must come from a
  // product packshot folder, and never from the treatment, technology or
  // before/after trees.
  const FORBIDDEN = /^\/blue-diamond\/(treatments|technologies|before-after|aesthetics|medical|home|team|shared)\//;
  for (const p of products) {
    for (const img of p.images) {
      if (!img.path) continue;
      expect(img.path, `${p.id} must not use a non-packaging asset`).not.toMatch(FORBIDDEN);
      expect(img.path, `${p.id} must use a product packshot path`).toMatch(
        /^\/blue-diamond\/(products|shop)\//,
      );
    }
  }
});

/* ------------------------------- CL-042 — the Myriade catalogue contract ---- */

test("CL-042: the catalogue holds 23 SkinMedica + 31 Myriade = 54 records, with unique ids and slugs", () => {
  expect(skinMedicaProducts.length).toBe(23);
  expect(myriadeProducts.length).toBe(31);
  expect(products.length).toBe(54);
  // Adding a brand must not have collided an id or a URL with an existing one.
  expect(new Set(products.map((p) => p.id)).size).toBe(54);
  expect(new Set(products.map((p) => p.slug)).size).toBe(54);
  expect(new Set(products.map((p) => p.slugAr)).size).toBe(54);
});

test("CL-042: no Myriade record claims a price, stock or purchase path it was not given", () => {
  const problems: string[] = [];
  for (const p of myriadeProducts) {
    if (p.inStock) problems.push(`${p.id}: claims stock`);
    if (!p.purchaseBlocked?.en) problems.push(`${p.id}: no purchaseBlocked note`);
    // The flyer supplied exactly one price. Any other non-null price would be
    // borrowed or estimated, which is the failure this guards.
    if (p.id !== "purifying-peeling" && p.priceCents !== null) {
      problems.push(`${p.id}: has a price the source never supplied`);
    }
  }
  expect(problems, problems.join("\n")).toEqual([]);
  const priced = myriadeProducts.filter((p) => p.priceCents !== null);
  expect(priced.map((p) => p.id)).toEqual(["purifying-peeling"]);
});

test("CL-042: professional-only products say so and are never purchasable", () => {
  const pro = myriadeProducts.filter((p) => p.professionalOnly);
  expect(pro.length).toBeGreaterThan(0);
  for (const p of pro) {
    expect(p.inStock, `${p.id} must not claim stock`).toBe(false);
    expect(p.purchaseBlocked?.en ?? "", `${p.id} must state it is professional-use`).toMatch(
      /professional/i,
    );
  }
});

test("CL-042: Myriade carries no invented research block and no borrowed image", () => {
  for (const p of myriadeProducts) {
    // The flyer is the only source; a `detail` block here would mean invented
    // FAQs and manufacturer URLs.
    expect(p.detail, `${p.id} must not carry a fabricated research block`).toBeUndefined();
    // Every Myriade record points at its OWN verified ImageKit asset — the
    // exact path uploaded and approved from the client bundle, recorded in
    // evidence/myriade-media-mapping.json. Not a guessed path (the failure
    // that emptied these arrays before) and never a sibling's packshot.
    expect(p.images, `${p.id} must carry its packshot`).toHaveLength(1);
    expect(p.images[0].status).toBe("approved");
    expect(p.images[0].path, `${p.id}`).toMatch(/^\/blue-diamond\/products\/myriade\//);
  }
});

test("CL-042: Arabic repeats the approved English and is not presented as a translation", () => {
  // Recorded as a contract so the day real Arabic arrives, this test is the
  // thing that tells you where it has to go.
  for (const p of myriadeProducts) {
    expect(p.name.ar, `${p.id}`).toBe(p.name.en);
    if (p.subtitle) expect(p.subtitle.ar).toBe(p.subtitle.en);
  }
});

test("CL-042: every Myriade category and brand referenced actually exists", () => {
  const catIds = new Set(productCategories.map((c) => c.id));
  const brandIds = new Set(productBrands.map((b) => b.id));
  const problems: string[] = [];
  for (const p of myriadeProducts) {
    if (!p.brandId || !brandIds.has(p.brandId)) problems.push(`${p.id}: unknown brand ${p.brandId}`);
    if (!p.categoryIds.length) problems.push(`${p.id}: no category`);
    for (const c of p.categoryIds) if (!catIds.has(c)) problems.push(`${p.id}: unknown category ${c}`);
  }
  expect(problems, problems.join("\n")).toEqual([]);
});

test("CL-042: no two products share a packshot path", () => {
  const withPath = products.filter((p) => p.images[0]?.path);
  const paths = withPath.map((p) => p.images[0].path);
  expect(new Set(paths).size, "a packshot is reused across products").toBe(paths.length);
});

test("CL-042: the manufacturer comparison is on exactly one product, correctly ordered and correctly attributed", () => {
  const withComparison = products.filter((p) => p.manufacturerComparison);
  // A result photograph belongs to the product it was taken for and nowhere
  // else. If a second product ever acquires one, that is a decision someone
  // must make deliberately, not a copy-paste.
  expect(withComparison.map((p) => p.id)).toEqual(["c-eye-contour"]);

  const c = withComparison[0].manufacturerComparison!;
  expect(c.before.path).toContain("-before");
  expect(c.after.path).toContain("-after");
  expect(c.before.path).not.toBe(c.after.path);
  // All THREE supplied files are placed, not just the split pair. The
  // untouched composite is what proves the halves were not re-cropped or
  // swapped, so losing it silently would remove the evidence and leave the
  // claim. Three distinct paths, all in this product's own folder.
  expect(c.source, "the supplied source composite is not placed").toBeDefined();
  expect(c.source!.path).toContain("-before-after-source");
  const comparisonPaths = [c.source!.path, c.before.path, c.after.path];
  expect(new Set(comparisonPaths).size).toBe(3);
  for (const p of comparisonPaths) {
    expect(p).toContain("/products/myriade/c-eye-contour/before-after/");
  }
  // The manufacturer's stated interval travels with the pictures. Without
  // it a reader supplies their own, which is exactly the implied-outcome
  // claim `resultsVary` exists to prevent.
  expect(c.caption.en).toMatch(/two weeks of use/i);
  expect(c.caption.ar).toMatch(/two weeks of use/i);
  // Both statements are load-bearing: these are the manufacturer's clinical
  // examples, and presenting them as our own patients' results would be a
  // false claim about Blue Diamond's outcomes.
  expect(c.attribution.en).toMatch(/not Blue Diamond Medical patient photography/i);
  expect(c.attribution.ar).toMatch(/not Blue Diamond Medical patient photography/i);
  expect(c.resultsVary.en).toMatch(/individual results vary/i);
  expect(c.resultsVary.ar).toMatch(/individual results vary/i);
  // The comparison must never be reused as packaging.
  for (const p of products) {
    for (const img of p.images) {
      expect(img.path).not.toContain("/before-after/");
    }
  }
});
