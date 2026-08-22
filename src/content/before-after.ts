import type { BeforeAfterPair } from "@/types/before-after";

/**
 * No before/after pair is approved yet. The 15 candidate assets found in
 * the licensed image archive this pass are flagged for clinical/marketing
 * review before any of them can be added here — see
 * docs/CONTENT_MODEL.md and docs/CONTENT_MODEL.md. Never
 * populate this array with an unreviewed or unconfirmed pairing — an
 * empty array here is what keeps `beforeAfterEnabled: false` honest.
 */
export const beforeAfterPairs: BeforeAfterPair[] = [];

export function getBeforeAfterPairs(treatmentId?: string): BeforeAfterPair[] {
  if (!treatmentId) return beforeAfterPairs;
  return beforeAfterPairs.filter((p) => p.treatmentId === treatmentId);
}
