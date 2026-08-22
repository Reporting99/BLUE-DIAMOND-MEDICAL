import type { Bilingual } from "@/types/common";

export type LegalPageId = "terms" | "privacy-policy" | "accessibility" | "medical-disclaimer";

export interface LegalPageContent {
  id: LegalPageId;
  slug: string;
  slugAr: string;
  title: Bilingual;
  /** ISO date the copy was last approved by counsel/the client — required before publish. */
  effectiveDate: string | null;
  /** Empty string = no approved copy yet. Never rendered as "Coming soon" — the route 404s instead. */
  body: Bilingual;
}
