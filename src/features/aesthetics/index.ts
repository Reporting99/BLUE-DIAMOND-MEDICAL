/**
 * Medical-aesthetics domain: treatments, the before/after gallery and the
 * published aesthetics price list. Skin concerns and devices are their own
 * features (`@/features/concerns`, `@/features/technologies`) because they are
 * separate browse paths with their own routes and schema.
 */
export type { AestheticTreatment } from "./types";
export type { BeforeAfterPair } from "./before-after-types";
export { resultsVaryDisclaimer } from "./before-after-types";
export { treatments, gatedTreatments, getTreatment, getGatedTreatment } from "./data/treatments";
export {
  beforeAfterPairs,
  getBeforeAfterPairs,
  getBeforeAfterPairsForConcern,
  getBeforeAfterPairsForTechnology,
  publishableBeforeAfterPairs,
} from "./data/before-after";
export type { AestheticPriceRow } from "./pricing-types";
export {
  aestheticPriceRows,
  publishedPriceRows,
  aestheticsPricingGroups,
  getTreatmentPricing,
} from "./data/pricing";
export { PricingTable } from "./components/PricingTable";
export { AestheticTreatmentTemplate } from "./components/AestheticTreatmentTemplate";
export { BeforeAfterGallery } from "./components/BeforeAfterGallery";
export { BeforeAfterSlider } from "./components/BeforeAfterSlider";
