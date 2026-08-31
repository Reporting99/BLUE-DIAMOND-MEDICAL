import type { Bilingual, FaqEntry } from "@/types/common";
import type { ImageKitAsset } from "@/types/media";

export interface Technology {
  id: string;
  /** Card image from this technology's FeelStack media assignment, if any. */
  image?: ImageKitAsset;
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
