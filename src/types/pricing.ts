import type { Bilingual } from "./medical-service";

/** Typed bilingual pricing model — brief §19. Currency is fixed to CAD (Calgary clinic). */
export interface PricingItem {
  id: string;
  label: Bilingual;
  /** Price in cents to avoid float rounding; null when only "starting from" or "contact us" applies. */
  priceCents: number | null;
  startingFrom?: boolean;
  effectiveDate?: string; // ISO date
  approvalStatus: "approved" | "pending";
  notes?: Bilingual;
}

export interface PricingGroup {
  heading: Bilingual;
  items: PricingItem[];
}

export const currency = { code: "CAD", symbol: "$" } as const;

/**
 * Always two decimal places and an explicit "CAD" suffix — no currency
 * ambiguity, no silently-dropped cents. (Previously stripped a trailing
 * ".00", which read as an unformatted/rounded number rather than a real
 * price; fixed per the SkinMedica catalogue brief's explicit "two decimal
 * places" price rule, applied here for every caller since there's no
 * legitimate reason a price should render inconsistently between pages.)
 */
export function formatPrice(priceCents: number | null, startingFrom?: boolean): string {
  if (priceCents === null) return "—";
  const amount = (priceCents / 100).toFixed(2);
  return `${startingFrom ? "from " : ""}${currency.symbol}${amount} ${currency.code}`;
}
