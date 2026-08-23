import type { Bilingual } from "@/types/common";
import type { ImageStatus } from "@/types/media";

/**
 * Before/after pair type model — brief Part 2 §15. Every field the brief
 * requires is present; nothing here is optional except where the brief
 * itself says "only when verified" (session/time metadata) or where a
 * field genuinely doesn't apply to every pair (concernId).
 *
 * `approvalStatus` reuses the same `ImageStatus` enum as every other
 * image on the site rather than inventing a parallel status type — a
 * before/after pair is exactly as "approved to render" as any other
 * ImageKit asset, no more, no less.
 */
export interface BeforeAfterPair {
  /** Stable, human-traceable ID — e.g. "rf-microneedling-01". Never reused across different real patients/sessions. */
  pairId: string;
  treatmentId: string;
  concernId?: string;
  /** Approved description of what the pair shows — never invented, never implies a typical/guaranteed result. */
  description: Bilingual;
  /** Session or elapsed-time metadata — only populated when an approved source confirms it. */
  sessionInfo?: Bilingual;
  before: {
    imagekitPath: string;
    alt: Bilingual;
  };
  after: {
    imagekitPath: string;
    alt: Bilingual;
  };
  approvalStatus: ImageStatus;
}

export const resultsVaryDisclaimer: Bilingual = {
  en: "Individual results vary. This image shows one patient's outcome and is not a guarantee of results for any other patient.",
  ar: "تختلف النتائج من شخص لآخر. تُظهر هذه الصورة نتيجة مريض واحد ولا تُعدّ ضمانًا للنتائج لأي مريض آخر.",
};
