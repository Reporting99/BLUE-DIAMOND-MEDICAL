import type { Bilingual, FaqEntry } from "@/types/common";

export interface Technology {
  id: string;
  slug: string;
  slugAr: string;
  title: Bilingual;
  manufacturer?: string;
  summary: Bilingual;
  /**
   * Numbered-storytelling fields (brief Part 2 §13) — 01 "what it is" is
   * `summary` above; the remaining 4 are optional so a technology entry
   * with thinner source material still renders honestly (missing
   * sections are simply omitted, never filled with invented detail).
   */
  howItWorks?: Bilingual;
  whatItAddresses?: Bilingual;
  appointmentInvolves?: Bilingual;
  safetyNote?: Bilingual;
  relatedTreatmentIds: string[];
  relatedConcernIds?: string[];
  relatedDoctorIds?: string[];
  faqs?: FaqEntry[];
  sourceVerified: boolean;
}
