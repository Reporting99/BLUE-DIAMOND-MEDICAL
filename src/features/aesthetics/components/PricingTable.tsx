import type { PricingGroup } from "@/types/pricing";
import { formatPrice } from "@/types/pricing";
import type { Locale } from "@/i18n/config";

const labels = {
  en: {
    priceColumn: "Price (CAD)",
  },
  ar: {
    priceColumn: "السعر (دولار كندي)",
  },
};

/**
 * Shared renderer for approved aesthetic pricing — used by the treatment
 * pages and by /aesthetics/pricing so a price is written once and rendered
 * identically everywhere (docs/APPROVED_AESTHETIC_PRICING_MATRIX.md).
 *
 * Deliberately a description list rather than a <table>: every row is a
 * wrapping flex row, so long bilingual area names ("Small Area (Eyes,
 * Cheeks, Forehead, etc.)" / "منطقة صغيرة (العينان، الخدان، الجبهة، إلخ)")
 * reflow on a narrow viewport instead of forcing horizontal overflow. Prices
 * stay LTR in both locales via `.ltr-run`, matching the product catalogue.
 */
export function PricingTable({
  groups,
  locale,
  /**
   * Heading level for the group headings, so the table slots into whatever
   * outline hosts it without skipping a level: `h3` under the treatment
   * page's "Pricing" `h2`, `h2` directly under the pricing index's `h1`.
   */
  headingLevel = 3,
}: {
  groups: PricingGroup[];
  locale: Locale;
  headingLevel?: 2 | 3;
}) {
  const t = labels[locale];
  if (!groups.length) return null;
  const Heading = `h${headingLevel}` as "h2" | "h3";

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.heading.en}>
          <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
            <Heading className="text-h6 font-heading">{group.heading[locale]}</Heading>
            <span className="shrink-0 text-xs uppercase tracking-wide text-text-secondary">{t.priceColumn}</span>
          </div>
          <dl className="mt-1 divide-y divide-border">
            {group.items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                <dt className="min-w-0 flex-1 text-sm text-text-body">
                  {item.label[locale]}
                  {item.notes ? (
                    <span className="mt-0.5 block text-xs text-text-secondary">{item.notes[locale]}</span>
                  ) : null}
                </dt>
                <dd
                  className="ltr-run shrink-0 text-sm font-medium tabular-nums"
                  style={{ fontFamily: "var(--font-data)" }}
                >
                  {formatPrice(item.priceCents, item.startingFrom)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
