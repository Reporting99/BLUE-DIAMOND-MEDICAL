/**
 * Reusable, performance-safe surface-transition seam — replaces the hard
 * horizontal color line where one flat section background meets the next.
 * Pure CSS linear-gradient, no JS, no images, no blur/filter. A 1px
 * negative margin on both edges (see .section-seam in globals.css)
 * prevents a sub-pixel rendering gap between the seam and its neighbors.
 *
 * Usage: place directly between two adjacent <section> elements whose
 * backgrounds differ, passing each section's own background color.
 */
export function SectionTransition({ from, to }: { from: string; to: string }) {
  return (
    <div
      aria-hidden="true"
      className="section-seam"
      style={{ background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)` }}
    />
  );
}
