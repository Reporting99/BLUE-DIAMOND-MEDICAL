import { BeforeAfterSlider } from "./BeforeAfterSlider";
import type { BeforeAfterPair } from "@/types/before-after";
import type { Locale } from "@/i18n/config";

const emptyStateCopy = {
  en: "Before and after photography is being reviewed for accuracy before publishing. Check back soon, or ask about specific results during your consultation.",
  ar: "يجري حاليًا مراجعة صور قبل وبعد للتأكد من دقتها قبل نشرها. يُرجى العودة لاحقًا، أو الاستفسار عن نتائج محددة خلال استشارتكم.",
};

/**
 * Renders every approved pair (empty today — see src/features/aesthetics/data/before-after.ts)
 * or an honest empty-state message instead of a blank grid. The component
 * itself stays fully implemented regardless of data, per the brief: "If
 * approved images are unavailable, keep the component implemented but
 * gated" — the route wrapping this stays behind `beforeAfterEnabled`.
 */
export function BeforeAfterGallery({ pairs, locale }: { pairs: BeforeAfterPair[]; locale: Locale }) {
  if (pairs.length === 0) {
    return <p className="mt-8 max-w-xl text-body text-text-secondary">{emptyStateCopy[locale]}</p>;
  }

  return (
    <ul className="mt-8 grid gap-8 sm:grid-cols-2">
      {pairs.map((pair) => (
        <li key={pair.pairId}>
          <BeforeAfterSlider pair={pair} locale={locale} />
        </li>
      ))}
    </ul>
  );
}
