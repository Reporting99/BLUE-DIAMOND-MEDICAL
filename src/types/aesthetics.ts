import type { Bilingual, FaqEntry } from "./medical-service";

export type { Bilingual };

export interface AestheticTreatment {
  id: string;
  slug: string;
  slugAr: string;
  title: Bilingual;
  /** Answer-first summary. */
  summary: Bilingual;
  whoItsFor?: Bilingual;
  /**
   * Set only when a treatment is performed at a different address than
   * the main clinic (e.g. Elite iQ™ at Citizen Studio) — brief: "Do not
   * imply every treatment is performed at West Springs." See
   * src/config/site.ts `eliteIQLocation` and docs/DATA_APPROVAL_BLOCKERS.md.
   */
  serviceLocationNote?: Bilingual;
  concernsTreated?: { en: string[]; ar: string[] };
  howItWorks?: Bilingual;
  treatmentAreas?: { en: string[]; ar: string[] };
  duration?: Bilingual;
  preparation?: Bilingual;
  comfortLevel?: Bilingual;
  /** What actually happens during the visit — separate from `duration` (how long) and `downtime` (recovery). */
  treatmentDayJourney?: Bilingual;
  downtime?: Bilingual;
  /** Care instructions after treatment — separate from `downtime` (how long recovery takes). */
  aftercare?: Bilingual;
  resultTimeline?: Bilingual;
  suggestedCourse?: Bilingual;
  safetyContraindications?: { en: string[]; ar: string[] };
  technologyIds?: string[];
  relatedTreatmentIds?: string[];
  relatedConcernIds?: string[];
  /** Physicians who assess/perform this treatment — Part 2 addition (Part 1 found zero doctor cross-linking from any aesthetics page). */
  relatedDoctorIds?: string[];
  faqs?: { question: Bilingual; answer: Bilingual }[];
  sourceVerified: boolean;
}

export interface AestheticConcern {
  id: string;
  slug: string;
  slugAr: string;
  title: Bilingual;
  summary: Bilingual;
  /** How the concern commonly presents — kept optional/undefined rather than invented where the source doesn't describe it. */
  commonPresentations?: Bilingual;
  /** General contributing factors, educational framing only, never a diagnosis. */
  contributingFactors?: Bilingual;
  relatedTreatmentIds: string[];
  /** Other concern pages worth cross-linking. */
  relatedConcernIds?: string[];
  /** Technologies relevant to this concern, independent of any one treatment. */
  relatedTechnologyIds?: string[];
  relatedDoctorIds?: string[];
  faqs?: FaqEntry[];
  sourceVerified: boolean;
  /**
   * Notes an editorial correction where the legacy site's own "learn more"
   * link appeared mismatched to its concern (e.g. a redness/pigmentation
   * concern linking to the hair-removal page) — cross-linked here to the
   * treatment page whose actual content matches the concern instead. See
   * docs/CONTENT_APPROVAL_MATRIX.md.
   */
  correctedFromSource?: boolean;
}

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
