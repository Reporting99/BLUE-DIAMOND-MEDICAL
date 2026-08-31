import { test, expect } from "@playwright/test";
import {
  aestheticPriceRows,
  publishedPriceRows,
  aestheticsPricingGroups,
  getTreatmentPricing,
} from "../../src/features/aesthetics/data/pricing";
import { treatments } from "../../src/features/aesthetics/data/treatments";
import { technologies } from "../../src/features/technologies/data";

/**
 * Guards the client-approved aesthetic price list against silent drift.
 *
 * The reference values below are the *approved source of record*
 * (`BLUE_DIAMOND_AESTHETIC_PRICING_APPROVED_2026-08-23.xlsx`, reconciled in
 * docs/APPROVED_AESTHETIC_PRICING_MATRIX.md), not values read back out of the
 * content file — so an edit to pricing.ts that changes a price, drops a row
 * or invents one fails here instead of shipping.
 */

/** Arithmetic control totals recorded in the reconciliation document. */
const WORKBOOK_TOTAL_CENTS = 3_500_500; // $35,005 — the 80 workbook price cells
const GRAND_TOTAL_CENTS = 3_585_500; // $35,855 — including the $850 email override

/** Per-category row counts and category totals from the reconciliation document. */
const approvedCategoryTotals: { treatmentId: string; rows: number; totalCents: number }[] = [
  { treatmentId: "rf-microneedling", rows: 16, totalCents: 1_355_000 }, // 350+4,850+3,600+4,750
  { treatmentId: "ultra", rows: 10, totalCents: 680_000 }, // 4,000 + 1,300 + 1,500
  { treatmentId: "radio-frequency", rows: 8, totalCents: 390_000 }, // 3,100 + 800
  { treatmentId: "tempsure-vitalia", rows: 2, totalCents: 150_000 },
  { treatmentId: "laser-skin-treatments", rows: 7, totalCents: 227_500 }, // 1,975 + 300
  { treatmentId: "laser-hair-removal", rows: 31, totalCents: 469_000 },
  { treatmentId: "prp-skin-rejuvenation", rows: 3, totalCents: 215_000 }, // 850 + 850 + 450
  { treatmentId: "prp-hair-restoration", rows: 1, totalCents: 75_000 },
];

test("every workbook row is present exactly once, with a stable PR id", () => {
  expect(aestheticPriceRows).toHaveLength(81);
  const ids = aestheticPriceRows.map((row) => row.id);
  expect(new Set(ids).size).toBe(81);
  for (let n = 1; n <= 81; n += 1) {
    expect(ids).toContain(`PR-${String(n).padStart(3, "0")}`);
  }
});

test("prices match the approved arithmetic control totals", () => {
  const sum = (rows: typeof aestheticPriceRows) => rows.reduce((total, row) => total + row.priceCents, 0);
  expect(sum(aestheticPriceRows.filter((row) => row.source === "workbook"))).toBe(WORKBOOK_TOTAL_CENTS);
  expect(sum(aestheticPriceRows)).toBe(GRAND_TOTAL_CENTS);
});

test("the three ampoule add-ons stay unpublished pending GAP-014", () => {
  const held = aestheticPriceRows.filter((row) => !row.publicDisplay);
  expect(held.map((row) => row.id).sort()).toEqual(["PR-079", "PR-080", "PR-081"]);
  // Held rows are add-ons, not treatment prices, and must reach no surface.
  expect(held.every((row) => row.treatmentId === null)).toBe(true);
  expect(publishedPriceRows).toHaveLength(78);
  const publishedIds = new Set(aestheticsPricingGroups.flatMap((g) => g.items.map((i) => i.id)));
  for (const row of held) expect(publishedIds.has(row.id)).toBe(false);
});

test("PRP microneedling — neck carries the client-email price, not an inferred one", () => {
  const neck = aestheticPriceRows.find((row) => row.id === "PR-074")!;
  expect(neck.priceCents).toBe(85_000);
  expect(neck.source).toBe("client-email");
  // The email says "the same as the face" — so the face row must still agree.
  expect(aestheticPriceRows.find((row) => row.id === "PR-073")!.priceCents).toBe(85_000);
});

test("no price is a package, a range, or a starting-from value", () => {
  for (const row of aestheticPriceRows) {
    expect(row.priceCents).toBeGreaterThan(0);
    expect(Number.isInteger(row.priceCents)).toBe(true);
    // Whole-dollar workbook values: no cents were invented anywhere.
    expect(row.priceCents % 100).toBe(0);
  }
  // `startingFrom` exists on the shared PricingItem type; the workbook has no
  // such row, so no rendering surface may introduce one.
  const items = aestheticsPricingGroups.flatMap((group) => group.items);
  expect(items.every((item) => !item.startingFrom)).toBe(true);
  expect(items.every((item) => item.priceCents !== null)).toBe(true);
});

test("each treatment gets exactly its own approved rows and category total", () => {
  for (const { treatmentId, rows, totalCents } of approvedCategoryTotals) {
    const groups = getTreatmentPricing(treatmentId);
    const items = groups.flatMap((group) => group.items);
    expect(items, `${treatmentId} row count`).toHaveLength(rows);
    expect(
      items.reduce((total, item) => total + (item.priceCents ?? 0), 0),
      `${treatmentId} category total`,
    ).toBe(totalCents);
  }
  // Every published row is claimed by exactly one treatment — nothing orphaned,
  // nothing double-counted across treatment pages.
  const claimed = approvedCategoryTotals.reduce((total, category) => total + category.rows, 0);
  expect(claimed).toBe(publishedPriceRows.length);
});

test("repeated area names across different treatments stay separate prices", () => {
  // "Neck" is six different approved prices on six different treatment rows:
  // RF regular ($650), RF fusion ($1,100), Ultra ($425), TempSure Envi ($350),
  // Laser Rejuvenation ($250) and PRP microneedling ($850). None may be merged.
  const necks = publishedPriceRows.filter((row) => row.area?.en === "Neck");
  expect(necks).toHaveLength(6);
  expect(necks.map((row) => row.priceCents).sort((a, b) => a - b)).toEqual([
    25_000, 35_000, 42_500, 65_000, 85_000, 110_000,
  ]);
  // Six rows, six distinct treatment/group pairings — no duplicate record.
  expect(new Set(necks.map((row) => `${row.treatmentId}|${row.group.en}`)).size).toBe(6);
});

test("every row is bilingual and cross-links only to real entities", () => {
  const treatmentIds = new Set(treatments.map((treatment) => treatment.id));
  const technologyIds = new Set(technologies.map((technology) => technology.id));
  for (const row of aestheticPriceRows) {
    expect(row.group.en.length, `${row.id} en group`).toBeGreaterThan(0);
    expect(row.group.ar.length, `${row.id} ar group`).toBeGreaterThan(0);
    if (row.area) {
      expect(row.area.en.length, `${row.id} en area`).toBeGreaterThan(0);
      expect(row.area.ar.length, `${row.id} ar area`).toBeGreaterThan(0);
    }
    if (row.notes) {
      expect(row.notes.en.length, `${row.id} en note`).toBeGreaterThan(0);
      expect(row.notes.ar.length, `${row.id} ar note`).toBeGreaterThan(0);
    }
    if (row.treatmentId) expect(treatmentIds, `${row.id} treatment`).toContain(row.treatmentId);
    for (const id of row.technologyIds ?? []) expect(technologyIds, `${row.id} technology`).toContain(id);
  }
});
