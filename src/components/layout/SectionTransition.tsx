/**
 * Surface-transition seam — RETIRED BY CL-032, deliberately kept as a no-op.
 *
 * This used to render a 56-180px gradient strip between two sections whose
 * backgrounds differ, softening the colour edge. The client's instruction is
 * that consecutive sections must sit very close together with no empty
 * background strip between them, and this strip was the largest single
 * contributor to the blank bands reported: 118px at 1440px, on its own, at
 * every one of the 84 places it appears.
 *
 * It renders `null` rather than being deleted from 84 call sites for three
 * reasons: the call sites document where two surfaces meet, deleting them all
 * is churn with no behavioural difference, and restoring the treatment later
 * is a one-file change rather than 84 edits. Nothing is left in the DOM — no
 * empty spacer node survives, which is what the requirement asks for.
 *
 * The props are still accepted (and still type-checked at every call site) so
 * the colour pair each boundary declares is not lost.
 */
export function SectionTransition(props: { from: string; to: string }): null {
  // The parameter stays declared so every call site keeps type-checking the
  // colour pair it names; `void` is what says "deliberately unused" to both a
  // reader and the linter, rather than an underscore convention this config
  // does not recognise.
  void props;
  return null;
}
