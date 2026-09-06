import { treatments, gatedTreatments } from "@/features/aesthetics/data/treatments";
import { getTechnology } from "@/features/technologies/data";
import {
  getBeforeAfterPairs,
  getBeforeAfterPairsForConcern,
} from "@/features/aesthetics/data/before-after";
import type { BeforeAfterPair } from "@/features/aesthetics/before-after-types";
import { concerns } from "./data";
import type { AestheticConcern } from "./types";
import type { AestheticTreatment } from "@/features/aesthetics/types";
import type { Technology } from "@/features/technologies/types";

/**
 * PATIENT PROBLEM -> TREATMENT OPTIONS -> TECHNOLOGY.
 *
 * The single place that answers "what does Blue Diamond offer for this
 * concern". Every Aesthetics surface — the Treatments menu, the Treatments
 * hub, the concern page's "Treatment Options" section — reads it, so the
 * three can never disagree about which treatments belong to a concern.
 *
 * The edge is authored in BOTH directions in the content data
 * (`concern.relatedTreatmentIds` and `treatment.relatedConcernIds`), because
 * the approved source material describes some pairs from the concern's side
 * and others from the treatment's. Reading only one side is what left, for
 * example, Acne Scars listing RF Micro-Needling while PRP Skin Rejuvenation —
 * whose own approved copy names acne scars explicitly — went unlisted. This
 * unions the two, so an edge stated anywhere in the approved content shows up
 * on the page.
 *
 * It is a union of what is WRITTEN, never an inference. Nothing here decides
 * that a treatment "probably" suits a concern; if neither entry names the
 * other, the pair does not appear. Gated treatments are excluded — their
 * pages are not live, and a Treatment Option has to lead somewhere real.
 */
export function getTreatmentsForConcern(concernId: string): AestheticTreatment[] {
  const concern = concerns.find((c) => c.id === concernId);
  const gated = new Set(gatedTreatments.map((t) => t.id));

  const ids = new Set<string>([
    ...(concern?.relatedTreatmentIds ?? []),
    ...treatments.filter((t) => (t.relatedConcernIds ?? []).includes(concernId)).map((t) => t.id),
  ]);

  // Ordered by the treatment registry rather than by insertion, so two
  // concerns that share treatments list them in the same order.
  return treatments.filter((t) => ids.has(t.id) && !gated.has(t.id));
}

/**
 * Technologies relevant to a concern.
 *
 * An explicitly authored `relatedTechnologyIds` always wins. Otherwise the
 * list is DERIVED from the concern's own treatment options: whatever device
 * those treatments already say they run on. That is a derivation, not an
 * inference — the answer comes only from `treatment.technologyIds`, authored
 * per treatment from approved source content, so a concern page can only ever
 * show a technology that a treatment already on that same page is documented
 * to use.
 */
export function getTechnologiesForConcern(concernId: string): Technology[] {
  const concern = concerns.find((c) => c.id === concernId);
  const ids = concern?.relatedTechnologyIds?.length
    ? concern.relatedTechnologyIds
    : Array.from(
        new Set(getTreatmentsForConcern(concernId).flatMap((t) => t.technologyIds ?? [])),
      );
  return ids.map(getTechnology).filter((t): t is Technology => Boolean(t));
}

/** The reverse view: which concern pages surface this treatment. */
export function getConcernsForTreatment(treatmentId: string): AestheticConcern[] {
  const treatment = treatments.find((t) => t.id === treatmentId);
  const ids = new Set<string>([
    ...(treatment?.relatedConcernIds ?? []),
    ...concerns.filter((c) => c.relatedTreatmentIds.includes(treatmentId)).map((c) => c.id),
  ]);
  return concerns.filter((c) => ids.has(c.id));
}

/**
 * The before/after pairs a concern page may close with, most specific first.
 *
 * `getBeforeAfterPairsForConcern` is strict equality on a recorded
 * `concernId` (§30), and it stays that way: exactly one pair in the whole
 * library carries one, so on its own it leaves ten of the eleven concern
 * pages with no results section at all.
 *
 * This widens the set the same way `getTechnologiesForConcern` above widens
 * technologies, and under the same rule — a DERIVATION from what is already
 * written on this page, never an inference about what a photograph shows.
 * The extra pairs come only from `getTreatmentsForConcern`, i.e. treatments
 * the approved content already names for this concern and which are listed
 * as options higher up the same page, and each pair still renders its own
 * approved description and manufacturer attribution, so it is shown as a
 * clinical example of THAT treatment rather than as a picture of this
 * concern. No pair's `concernId` is written, read or implied by any of it.
 *
 * Pairs whose own source evidence names the concern lead, because where that
 * evidence exists it is the better answer.
 */
export function getBeforeAfterPairsForConcernPage(
  concernId: string,
  limit = 3,
): BeforeAfterPair[] {
  const own = getBeforeAfterPairsForConcern(concernId);
  const seen = new Set(own.map((p) => p.pairId));
  const derived = getTreatmentsForConcern(concernId).flatMap((t) =>
    getBeforeAfterPairs(t.id).filter((p) => !seen.has(p.pairId) && seen.add(p.pairId)),
  );
  return [...own, ...derived].slice(0, limit);
}

/**
 * The device to show alongside a concern page's before/after pairs.
 *
 * Answered from the pairs actually on screen, most direct evidence first: a
 * pair whose own source filename named the device wins, then the device the
 * shown pairs' treatments are documented to run on, and only then the
 * concern's own technology list. Every step reads an authored id — nothing
 * here decides that a photograph "looks like" a given machine.
 *
 * Undefined when none of the three answers, and the fourth frame is then
 * simply not rendered.
 */
export function getDeviceForConcernResults(
  concernId: string,
  pairs: readonly BeforeAfterPair[],
): Technology | undefined {
  const named = pairs.find((p) => p.technologyId)?.technologyId;
  const fromTreatments = pairs
    .map((p) => treatments.find((t) => t.id === p.treatmentId))
    .flatMap((t) => t?.technologyIds ?? []);
  const ids = [named, ...fromTreatments].filter((id): id is string => Boolean(id));
  for (const id of ids) {
    const tech = getTechnology(id);
    if (tech) return tech;
  }
  return getTechnologiesForConcern(concernId)[0];
}
