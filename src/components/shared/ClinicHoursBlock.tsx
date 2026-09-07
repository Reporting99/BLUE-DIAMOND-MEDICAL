import {
  getOpenStatus,
  holidayExceptions,
  statutoryHolidayNotice,
  weeklyHoursRows,
  type DailyHours,
} from "@/config/clinic-hours";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * CL-009 / CL-010 — the clinic's published hours, rendered from
 * `src/config/clinic-hours.ts` and from nowhere else.
 *
 * Every public hours surface uses this component, so "Monday–Saturday
 * 8:00 AM–7:00 PM, Sunday closed" is stated once. Dated exceptions
 * (`holidayExceptions`) appear automatically underneath.
 */
export function ClinicHoursBlock({
  locale,
  schedule,
  tone = "default",
  className,
}: {
  locale: Locale;
  schedule?: DailyHours[];
  /** "reversed" = for the dark footer. */
  tone?: "default" | "reversed";
  className?: string;
}) {
  const rows = weeklyHoursRows(schedule);
  const status = getOpenStatus(schedule);
  const muted = tone === "reversed" ? "var(--footer-text-muted)" : undefined;

  return (
    <div className={cn("text-sm", className)}>
      <dl className="space-y-1">
        {rows.map((row) => (
          <div key={row.days.en} className="flex flex-wrap justify-between gap-x-4">
            <dt className={tone === "reversed" ? undefined : "text-text-secondary"} style={{ color: muted }}>
              {row.days[locale]}
            </dt>
            <dd className="font-medium">{row.hours[locale]}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2" style={{ color: muted }}>
        <span className={cn("font-medium", tone === "default" && (status.isOpen ? "text-primary" : "text-text-secondary"))}>
          {status.label[locale]}
        </span>
        {" · "}
        {statutoryHolidayNotice[locale]}
      </p>
      {holidayExceptions.length ? (
        <ul className="mt-2 space-y-1" style={{ color: muted }}>
          {holidayExceptions.map((h) => (
            <li key={h.date}>
              {h.label[locale]} ({h.date}) —{" "}
              {h.open && h.close ? `${h.open}–${h.close}` : locale === "ar" ? "مغلق" : "Closed"}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
