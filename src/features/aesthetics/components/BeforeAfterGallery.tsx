import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { clinicalExamplesHeading, clinicalExamplesIntro } from "@/features/aesthetics/before-after-types";
import type { BeforeAfterPair } from "@/features/aesthetics/before-after-types";
import type { Locale } from "@/i18n/config";

const emptyStateCopy = {
  en: "Before and after imagery is being reviewed for accuracy before publishing. Ask about specific results during your consultation.",
  ar: "يجري حاليًا مراجعة صور قبل وبعد للتأكد من دقتها قبل نشرها. يُرجى الاستفسار عن نتائج محددة خلال استشارتكم.",
};

/**
 * Renders the publishable pairs it is given, or nothing at all.
 *
 * `renderEmptyState` defaults to false — closure brief §46: an optional
 * Before/After block on a treatment/concern/technology page must
 * *disappear* when it has nothing to show, not leave a paragraph of
 * apology in the middle of the page. The dedicated gallery route passes
 * `renderEmptyState` because there the section IS the page, and vanishing
 * would leave a blank screen.
 *
 * The heading and intro are the honest ones (§20): these assets are
 * manufacturer clinical collateral, so the section says so once, at the
 * top, for every pair beneath it — including the pairs whose own filename
 * did not survive anonymisation and therefore carry no per-pair
 * manufacturer line of their own.
 *
 * LAYOUT. Four across at full page width, two in a narrower column, one on
 * phones. Four is the count that reads as a considered clinical set: a 4:3
 * comparison frame at a quarter of the 1280px container is still large enough
 * to read a result in, and a row of four keeps the section a band on the page
 * rather than a scrolling results archive — the distinction §27 draws between
 * a medical practice and a gallery.
 *
 * The breakpoints are CONTAINER queries, not viewport ones, and that is the
 * load-bearing detail. This gallery renders in two very different boxes: the
 * full-width Container on the dedicated Before/After route and on Home, and
 * the `max-w-3xl` article column on every treatment, concern and technology
 * page. Keyed to the viewport, a 1440px desktop would force four cards into a
 * 768px article column — 170px each, too small to read a clinical result in,
 * which is the opposite of what the four-across layout is for. Keyed to the
 * container, the same component gives four across where there is room for
 * four and two where there is room for two, with no per-call-site prop.
 *
 * The cards stretch to a common height so a pair with a two-line description
 * does not leave its neighbours' frames floating.
 */
export function BeforeAfterGallery({
  pairs,
  locale,
  renderEmptyState = false,
  headingLevel: Heading = "h2",
}: {
  pairs: BeforeAfterPair[];
  locale: Locale;
  renderEmptyState?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  if (pairs.length === 0) {
    if (!renderEmptyState) return null;
    return <p className="mt-8 max-w-xl text-body text-text-secondary">{emptyStateCopy[locale]}</p>;
  }

  return (
    <section className="@container mt-10">
      <Heading data-reveal="up" className="text-h4 font-heading">
        {clinicalExamplesHeading[locale]}
      </Heading>
      <p data-reveal="up" className="mt-2 max-w-2xl text-sm text-text-secondary">
        {clinicalExamplesIntro[locale]}
      </p>
      <ul className="mt-6 grid items-stretch gap-6 @2xl:grid-cols-2 @5xl:grid-cols-4 @5xl:gap-5">
        {pairs.map((pair, index) => (
          // Staggered by column, not by absolute position: the delay resets
          // every fourth card so the second row enters on the same rhythm as
          // the first rather than arriving progressively later down the page.
          <li key={pair.pairId} data-reveal="up" data-reveal-delay={String(index % 4)} className="h-full">
            <BeforeAfterSlider pair={pair} locale={locale} />
          </li>
        ))}
      </ul>
    </section>
  );
}
