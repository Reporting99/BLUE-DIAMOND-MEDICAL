import type { Bilingual } from "@/types/common";

/**
 * Approved aesthetic treatment pricing — one record per workbook row.
 *
 * Source of record: `BLUE_DIAMOND_AESTHETIC_PRICING_APPROVED_2026-08-23.xlsx`
 * (81 populated rows, kept outside the repository), reconciled to the
 * canonical treatment taxonomy in `docs/APPROVED_AESTHETIC_PRICING_MATRIX.md`.
 * `id` is the stable `PR-0xx` key from that matrix, so any row here can be
 * traced back to a literal workbook row without re-reading the workbook.
 *
 * Rows are stored once and rendered in several places (treatment page,
 * pricing index). Nothing is duplicated per surface — see
 * `getTreatmentPricing()` / `aestheticsPricingGroups`.
 */
export interface AestheticPriceRow {
  /** Stable price ID from docs/APPROVED_AESTHETIC_PRICING_MATRIX.md (e.g. "PR-001"). */
  id: string;
  /**
   * Canonical treatment this price belongs to, or `null` for a record that is
   * not a treatment price (the three ampoule add-ons). Combined protocols are
   * attached to their lead treatment rather than inventing a new route.
   */
  treatmentId: string | null;
  /** Sub-heading within the treatment — the workbook's TREATMENTS column. */
  group: Bilingual;
  /**
   * The workbook's AREA column. `null` where the AREA cell names a protocol
   * rather than a body area (PR-024), so no body area is invented.
   */
  area: Bilingual | null;
  /** Cents, to avoid float rounding. Never estimated, rounded or inferred. */
  priceCents: number;
  /** The workbook's NOTES / EQUIPMENT column, where it carried content. */
  notes?: Bilingual;
  /** Devices this price is delivered on — cross-links to `@/features/technologies`. */
  technologyIds?: string[];
  /**
   * `false` keeps an approved price stored and classified but unpublished.
   * The three ampoule add-ons are commercially approved yet held behind
   * GAP-014 (clinician review of the topical-infusion agent list) — see
   * docs/CONTENT_GAPS_AND_APPROVALS.md. Commercial approval is not clinical
   * approval, so these render nowhere.
   */
  publicDisplay: boolean;
  /**
   * Provenance. `client-email` marks the single row resolved by the client
   * approval email of 2026-08-23 rather than by a workbook cell.
   */
  source: "workbook" | "client-email";
}
