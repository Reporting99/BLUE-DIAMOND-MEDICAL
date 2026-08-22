import type { Bilingual, FaqEntry } from "@/types/common";

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
