import { z } from "zod";
import { defineEntityContract, localizedBilingual, localizedBilingualList } from "@/lib/feelstack/adapters";
import { resolveSlotGallery } from "@/lib/feelstack/media-slots";
import type { ImageStatus } from "@/types/media";
import type { Product, ProductDetail, ProductFaq } from "./types";

/**
 * Product <- FeelStack `product` content type.
 *
 * Derived from the REAL created record: read back from
 * `resolve?path=/shop/scar-recovery-gel-with-centelline-large` after the canary
 * was written. Fixtures in `tests/fixtures/feelstack/product-resolve-{en,ar}.json`
 * are that exact response.
 *
 * COMMERCE SAFETY. This entity carries money and stock state, so the schema is
 * the strictest in the integration:
 *
 *  - `price_cents` is an integer in CENTS and `price_currency` is a stored
 *    enum, not an inference. The domain type's comment says "Cents, CAD", so
 *    currency is a recorded fact; storing it explicitly means a future
 *    second-currency product cannot silently inherit CAD.
 *  - `in_stock` and `approval_status` are carried VERBATIM from the approved
 *    source. They are commerce STATE, not content, and nothing derives
 *    schema.org availability from them — `ProductTemplate` deliberately emits a
 *    Product schema with no `offers`, which is why `availabilityNotice` exists
 *    and tells visitors to confirm price and availability with the clinic.
 *  - Product existence, a price, and a checkout route each imply nothing about
 *    availability.
 */

const imageStatusSchema = z.enum(["approved", "temporary", "pending", "disabled"]);

/** Per-locale image: path and approval status are shared, alt text is not. */
const productImageSchema = z.object({
  path: z.string(),
  status: imageStatusSchema,
  alt: z.string(),
});

/** Provenance — every product fact traces to one of these. Never dropped. */
const productSourceSchema = z.object({
  url: z.string(),
  retrievedDate: z.string(),
  publisher: z.string(),
});

export const productFieldsSchema = z.object({
  product_id: z.string().min(1),
  brand_id: z.string().min(1),
  price_cents: z.number().int().nonnegative(),
  price_currency: z.literal("CAD"),
  approval_status: z.enum(["approved", "pending"]),
  in_stock: z.boolean(),
  sources: z.array(productSourceSchema).min(1),
  images: z.array(productImageSchema),
  overview: z.string().min(1),
  what_it_is: z.string().min(1),
  product_type: z.string().min(1),
  routine_placement: z.string().min(1),
  how_to_use: z.string().min(1),
  category_ids: z.array(z.string()).optional(),
  concern_ids: z.array(z.string()).optional(),
  size_label: z.string().optional(),
  variant_of_id: z.string().optional(),
  key_characteristics: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  when_to_use: z.string().optional(),
  sun_sensitivity_warning: z.string().optional(),
  pregnancy_warning: z.string().optional(),
  legacy_name_note: z.string().optional(),
  related_product_ids: z.array(z.string()).optional(),
});

export type ProductFields = z.infer<typeof productFieldsSchema>;

export const productCmsContract = defineEntityContract<ProductFields, Product>({
  contentType: "product",
  fields: productFieldsSchema,
  adapt: ({ locale, title, fields: f, faqs, path, media }) => {
    /**
     * Gallery for this product: every `productPrimary`/`productGallery`
     * assignment in CMS order, or the typed `images` field when there is no
     * assignment at all. Falling back wholesale (rather than merging) keeps a
     * product from showing both its real photograph and the placeholder record
     * that stood in for it.
     */
    const resolveProductImages = () => {
      const assigned = resolveSlotGallery(media, ["productPrimary", "productGallery"]);
      if (assigned.length) {
        return assigned.map((m) => ({ path: m.path, status: m.status, alt: m.alt }));
      }
      return f.images.map((i) => ({
        path: i.path,
        status: i.status as ImageStatus,
        alt: localizedBilingual(locale, i.alt),
      }));
    };
    const detail: ProductDetail = {
      overview: localizedBilingual(locale, f.overview),
      whatItIs: localizedBilingual(locale, f.what_it_is),
      productType: localizedBilingual(locale, f.product_type),
      routinePlacement: localizedBilingual(locale, f.routine_placement),
      howToUse: localizedBilingual(locale, f.how_to_use),
      faqs: faqs.map<ProductFaq>((q) => ({
        question: localizedBilingual(locale, q.question),
        answer: localizedBilingual(locale, q.answer),
      })),
      sources: f.sources,
    };
    if (f.key_characteristics) detail.keyCharacteristics = localizedBilingualList(locale, f.key_characteristics);
    if (f.warnings) detail.warnings = localizedBilingualList(locale, f.warnings);
    if (f.when_to_use) detail.whenToUse = localizedBilingual(locale, f.when_to_use);
    if (f.sun_sensitivity_warning) detail.sunSensitivityWarning = localizedBilingual(locale, f.sun_sensitivity_warning);
    if (f.pregnancy_warning) detail.pregnancyWarning = localizedBilingual(locale, f.pregnancy_warning);
    if (f.legacy_name_note) detail.legacyNameNote = localizedBilingual(locale, f.legacy_name_note);
    if (f.related_product_ids) detail.relatedProductIds = f.related_product_ids;

    const product: Product = {
      id: f.product_id,
      slug: path.replace(/^\/shop\//, ""),
      // Arabic public URLs stay frontend-owned; the CMS slug is ASCII.
      slugAr: "",
      name: localizedBilingual(locale, title ?? ""),
      brandId: f.brand_id,
      categoryIds: f.category_ids ?? [],
      concernIds: f.concern_ids ?? [],
      detail,
      priceCents: f.price_cents,
      // Real media assignments come first, in CMS sort order, and the typed
      // `images` field is what remains for products the import has not reached.
      // A product with an assignment must not also render its stale hardcoded
      // path, so the assignment REPLACES the field rather than prepending to
      // it -- two images of the same product in one gallery is a content bug.
      images: resolveProductImages(),
      approvalStatus: f.approval_status,
      // Verbatim source flag. Nothing downstream turns this into an Offer or a
      // schema.org availability value.
      inStock: f.in_stock,
    };
    if (f.size_label) product.sizeLabel = f.size_label;
    if (f.variant_of_id) product.variantOfId = f.variant_of_id;
    return product;
  },
});
