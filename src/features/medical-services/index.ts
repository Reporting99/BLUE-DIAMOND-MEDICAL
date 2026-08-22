/**
 * Medical services domain: AHS-insured family medicine, walk-in care, the
 * medical Botox sub-hub, and the uninsured fee schedule.
 */
export type { Bilingual, FaqEntry, MedicalServiceContent } from "./types";
export { medicalServices, getMedicalService } from "./data";
export { medicalBotoxHub, medicalBotoxConditions, getMedicalBotoxCondition } from "./botox";
export { noShowFees, uninsuredFeeGroups, type FeeGroup, type FeeRow } from "./uninsured-fees";
export { MedicalServiceTemplate } from "./components/MedicalServiceTemplate";
export { FeeTable } from "./components/FeeTable";
