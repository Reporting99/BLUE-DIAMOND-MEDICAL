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
    <section className="mt-10">
      <Heading className="text-h4 font-heading">{clinicalExamplesHeading[locale]}</Heading>
      <p className="mt-2 max-w-2xl text-sm text-text-secondary">{clinicalExamplesIntro[locale]}</p>
      <ul className="mt-6 grid gap-8 sm:grid-cols-2">
        {pairs.map((pair) => (
          <li key={pair.pairId}>
            <BeforeAfterSlider pair={pair} locale={locale} />
          </li>
        ))}
      </ul>
    </section>
  );
}
