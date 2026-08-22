/**
 * Primitives shared by every domain. These are the only types allowed to be
 * imported across feature boundaries — anything more specific belongs in the
 * feature that owns it (`src/features/<domain>/types.ts`).
 */

/** A string that must exist in both published locales. */
export interface Bilingual {
  en: string;
  ar: string;
}

/** One question/answer pair. Rendered visibly *and* fed to FAQPage schema. */
export interface FaqEntry {
  question: Bilingual;
  answer: Bilingual;
}
