/** Skin-concern domain — the "browse by what you're noticing" entry path. */
export type { AestheticConcern } from "./types";
export { concerns, getConcern } from "./data";
export { ConcernTemplate } from "./components/ConcernTemplate";
export { ConcernExplorer } from "./components/ConcernExplorer";
/** PATIENT PROBLEM -> TREATMENT OPTIONS -> TECHNOLOGY. See ./queries.ts. */
export { getTreatmentsForConcern, getTechnologiesForConcern, getConcernsForTreatment } from "./queries";
