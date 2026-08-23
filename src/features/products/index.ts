/** SkinMedica retail catalogue domain. */
export type {
  Product,
  ProductBrand,
  ProductCategory,
  ProductConcern,
  ProductDetail,
  ProductFaq,
  ProductSource,
} from "./types";
export {
  availabilityNotice,
  categoryTaglines,
  productBrands,
  productCategories,
  productConcerns,
  products,
  getProduct,
  getProductById,
} from "./data";
export { ProductTemplate } from "./components/ProductTemplate";
export { ProductCard } from "./components/ProductCard";
