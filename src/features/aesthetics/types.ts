import type { Bilingual } from "@/types/common";

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
   * src/config/site.ts `eliteIQLocation` and docs/CONTENT_MODEL.md.
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
