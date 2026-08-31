import type { Bilingual } from "@/types/common";
import type { ImageStatus } from "@/types/media";

/**
 * Before/after pair type model.
 *
 * EXTENDED for the closure brief §21/§25: the historical pairs recovered
 * from the two original Blue Diamond websites are third-party
 * device-manufacturer clinical collateral, not Blue Diamond patient
 * photography (see docs/BEFORE_AFTER_SOURCE_AUDIT.md). That is a
 * publishable class of asset — but only if the site says what it actually
 * is. So the model now carries provenance, attribution and rights as
 * first-class required fields rather than as a comment somewhere: a pair
 * cannot be added to this system without stating where it came from and
 * on what basis it may be shown.
 */

/**
 * Where the right to republish comes from — deliberately separate from
 * provenance (§22). Provenance says "where did this file come from";
 * rights says "on what basis may Blue Diamond show it".
 */
export type BeforeAfterRightsStatus =
  /** A rights document / licence exists in the project or client records. */
  | "VERIFIED_REPUBLISHABLE"
  /** The only evidence is that Blue Diamond already published this asset
   *  itself, publicly, on its own legacy website. Real evidence, weaker
   *  than a licence — and never to be silently upgraded to the above. */
  | "LEGACY_SITE_USAGE_EVIDENCE"
  /** Rights unclear; must not be published until a human resolves it. */
  | "REVIEW_REQUIRED";

/**
 * Position in the media pipeline (§23). Importing an asset is NOT the same
 * as approving it, and this enum exists so the two can never be conflated
 * by accident: `PUBLISHED` is a separate, later state than `IMPORTED`.
 */
export type BeforeAfterPipelineState =
  | "FOUND"
  | "DOWNLOADED"
  | "IMPORTED"
  | "REGISTERED"
  | "MAPPED"
  | "ASSIGNED"
  | "REVIEW_REQUIRED"
  | "APPROVED"
  | "PUBLISHED";

/** Traceability back to the original website (§21). Never dropped. */
export interface BeforeAfterProvenance {
  /** e.g. "bluediamondmedicalaesthetics.ca" */
  sourceWebsite: string;
  /** Path on that site, e.g. "/radio-frequency". */
  sourcePage: string;
  /** The embedded widget's own name, as configured by the site owner. */
  sourceWidget?: string;
  /**
   * The device manufacturer, ONLY where a source filename or caption
   * evidences it. Absent means "not evidenced", never "probably none".
   */
  manufacturer?: string;
  /**
   * The manufacturer's own product/document reference where the filename
   * carries one (e.g. "PRD-0844-Elite-iQ-BNAs-CAN-EN"). This is the
   * strongest single piece of provenance evidence these assets have.
   */
  manufacturerReference?: string;
  /**
   * A condition word that appeared in the source's own metadata (e.g. a
   * widget titled "Acne Before & After Slider"). Recorded verbatim as
   * evidence — deliberately NOT auto-mapped to a `concernId`, because the
   * site's concern registry uses more specific terms and matching them up
   * is a clinical judgement, not a string operation (§30).
   */
  sourceConditionLabel?: string;
}

/** One side of a pair, with its own provenance and real dimensions. */
export interface BeforeAfterImage {
  /** Path within the approved ImageKit media root. */
  imagekitPath: string;
  alt: Bilingual;
  /** The original URL this file was retrieved from. Provenance only —
   *  never rendered, never fetched at runtime (§33: no permanent hotlink). */
  sourceUrl: string;
  originalFilename: string;
  /** Measured from the retrieved file, not declared by the source. */
  width: number;
  height: number;
  bytes: number;
}

export interface BeforeAfterPair {
  /** Stable, human-traceable ID — e.g. "rf-microneedling-01". */
  pairId: string;
  treatmentId: string;
  /** Only when source evidence supports it (§30). */
  concernId?: string;
  /** Only when a source filename/caption names the device (§26/§46). */
  technologyId?: string;
  /** Approved description of what the pair shows — never invented. */
  description: Bilingual;
  /** Session/elapsed-time metadata — only when a source confirms it. */
  sessionInfo?: Bilingual;
  before: BeforeAfterImage;
  after: BeforeAfterImage;
  provenance: BeforeAfterProvenance;
  rightsStatus: BeforeAfterRightsStatus;
  pipelineState: BeforeAfterPipelineState;
  /**
   * Gates rendering exactly like every other image on the site: the shared
   * ImageKitImage renders the real CDN asset only at "approved".
   */
  approvalStatus: ImageStatus;
}

export const resultsVaryDisclaimer: Bilingual = {
  en: "Individual results vary. This image shows one patient's outcome and is not a guarantee of results for any other patient.",
  ar: "تختلف النتائج من شخص لآخر. تُظهر هذه الصورة نتيجة مريض واحد ولا تُعدّ ضمانًا للنتائج لأي مريض آخر.",
};

/**
 * The attribution line that must accompany any pair whose provenance names
 * a manufacturer — closure brief §19/§20. This is the difference between
 * showing these assets honestly and misrepresenting another clinic's
 * patient as a Blue Diamond result, so it is derived from the data rather
 * than left to whoever writes the page.
 */
export function attributionFor(pair: BeforeAfterPair): Bilingual | undefined {
  const maker = pair.provenance.manufacturer;
  if (!maker) return undefined;
  return {
    en: `Clinical example provided by the technology manufacturer (${maker}). Not a Blue Diamond Medical patient. Individual results vary.`,
    ar: `مثال سريري مقدَّم من الشركة المصنِّعة للتقنية (${maker}). ليس من مرضى بلو دايموند الطبية. تختلف النتائج من شخص لآخر.`,
  };
}

/** Section heading for galleries of manufacturer collateral (§20). */
export const clinicalExamplesHeading: Bilingual = {
  en: "Clinical Before & After Examples",
  ar: "أمثلة سريرية قبل وبعد",
};

export const clinicalExamplesIntro: Bilingual = {
  en: "Clinical examples provided by the technology manufacturer. These are not Blue Diamond Medical patients. Individual results vary.",
  ar: "أمثلة سريرية مقدَّمة من الشركة المصنِّعة للتقنية. هؤلاء ليسوا من مرضى بلو دايموند الطبية. تختلف النتائج من شخص لآخر.",
};
