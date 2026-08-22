import type { FeeGroup } from "@/content/uninsured-fees";
import type { Locale } from "@/i18n/config";

export function FeeTable({ group, locale }: { group: FeeGroup; locale: Locale }) {
  return (
    <div className="mt-6">
      <h2 id={`fee-table-${group.heading.en}`} className="text-h4 font-heading">
        {group.heading[locale]}
      </h2>
      {/* Horizontally scrollable on narrow viewports — tabIndex + role/aria-labelledby
          make the scroll region keyboard-operable, per axe's scrollable-region-focusable
          rule (caught on a mobile viewport scan during this build). */}
      <div
        className="mt-3 overflow-x-auto rounded-lg border border-border"
        tabIndex={0}
        role="region"
        aria-labelledby={`fee-table-${group.heading.en}`}
      >
        <table className="w-full min-w-[420px] border-collapse text-sm">
          <tbody>
            {group.rows.map((row) => (
              <tr key={row.item.en} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3">{row.item[locale]}</td>
                <td className="ltr-run px-4 py-3 text-end font-medium" style={{ fontFamily: "var(--font-data)" }}>
                  {row.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
