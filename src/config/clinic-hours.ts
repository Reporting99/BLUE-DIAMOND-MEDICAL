/**
 * Central weekly schedule — the ONE source of truth for clinic hours.
 * Components must compute "open now" / "closes at" dynamically from this
 * table in the clinic's timezone — never hardcode "Open today" as static
 * text (brief §23), and never restate a day-by-day schedule inline.
 *
 * Client change register:
 *  - CL-009  approved schedule: Monday–Saturday 8:00 AM–7:00 PM, Sunday
 *            closed. This replaces the legacy Mon–Fri / 09:00-start
 *            readings, which were an inference from a legacy page that
 *            only ever published "Open today 08:00–19:00".
 *  - CL-010  `holidayExceptions` below lets staff mark a specific date as
 *            closed, or open with custom hours, from one place — without
 *            editing the Contact page, the footer, or structured data.
 */

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface DailyHours {
  day: DayOfWeek;
  open: string | null; // "HH:mm" 24h, null = closed
  close: string | null;
}

/** CL-009 — Monday through Saturday 08:00–19:00, Sunday closed. */
export const clinicHours: DailyHours[] = [
  { day: 0, open: null, close: null }, // Sunday — closed
  { day: 1, open: "08:00", close: "19:00" },
  { day: 2, open: "08:00", close: "19:00" },
  { day: 3, open: "08:00", close: "19:00" },
  { day: 4, open: "08:00", close: "19:00" },
  { day: 5, open: "08:00", close: "19:00" },
  { day: 6, open: "08:00", close: "19:00" }, // Saturday
];

/**
 * The aesthetics arm keeps its own published phone line and its own hours
 * (docs/SOURCE_CONFLICT_REGISTER.md CONF-001). CL-009 governs the CLINIC
 * schedule and does not restate the aesthetics arm's, so the approved
 * 09:00–17:00 window stands, on the same Monday–Saturday pattern the clinic
 * itself now keeps.
 */
export const aestheticsHours: DailyHours[] = [
  { day: 0, open: null, close: null },
  { day: 1, open: "09:00", close: "17:00" },
  { day: 2, open: "09:00", close: "17:00" },
  { day: 3, open: "09:00", close: "17:00" },
  { day: 4, open: "09:00", close: "17:00" },
  { day: 5, open: "09:00", close: "17:00" },
  { day: 6, open: "09:00", close: "17:00" },
];

/**
 * CL-010 — date-specific overrides.
 *
 * The DEFAULT for a statutory holiday is closed (`statutoryHolidayNotice`
 * says so, and that is what the clinic publishes). This table is how an
 * EXCEPTION is recorded: a holiday the clinic chooses to open, with custom
 * hours, or an unscheduled closure. Add a row and every hours surface —
 * Contact, footer, open-now status, JSON-LD — reflects it. Nothing else
 * needs editing.
 *
 * `date` is a clinic-local calendar date, "YYYY-MM-DD".
 * `open`/`close` null = closed that day.
 */
export interface HolidayException {
  date: string;
  open: string | null;
  close: string | null;
  label: { en: string; ar: string };
}

export const holidayExceptions: HolidayException[] = [
  // The shape staff maintain. No dated exception is approved yet, so the
  // list ships empty rather than carrying invented clinic closures:
  // { date: "2026-12-24", open: "08:00", close: "13:00",
  //   label: { en: "Christmas Eve", ar: "ليلة عيد الميلاد" } },
];

export const statutoryHolidayNotice = {
  en: "Closed on all statutory holidays.",
  ar: "مغلق في جميع العطلات الرسمية.",
};

const TIMEZONE = "America/Edmonton";

function clinicNow(): { day: DayOfWeek; minutes: number; date: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const hour = Number(get("hour") || "0");
  const minute = Number(get("minute") || "0");

  const dayMap: Record<string, DayOfWeek> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return {
    day: dayMap[get("weekday")] ?? 0,
    minutes: hour * 60 + minute,
    date: `${get("year")}-${get("month")}-${get("day")}`,
  };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** "08:00" → "8:00 AM" / "8:00 ص". */
export function formatTime(hhmm: string, locale: "en" | "ar"): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h < 12 ? (locale === "ar" ? "ص" : "AM") : locale === "ar" ? "م" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export interface OpenStatus {
  isOpen: boolean;
  today: DailyHours;
  /** Set when a holidayExceptions row is driving today's hours. */
  exception?: HolidayException;
  label: { en: string; ar: string };
}

/** Today's effective hours: a holiday exception when one exists, else the weekly table. */
export function hoursForDate(
  date: string,
  day: DayOfWeek,
  schedule: DailyHours[] = clinicHours,
): { hours: DailyHours; exception?: HolidayException } {
  const exception = holidayExceptions.find((h) => h.date === date);
  if (exception) {
    return { hours: { day, open: exception.open, close: exception.close }, exception };
  }
  return { hours: schedule.find((d) => d.day === day)! };
}

export function getOpenStatus(schedule: DailyHours[] = clinicHours): OpenStatus {
  const { day, minutes, date } = clinicNow();
  const { hours: today, exception } = hoursForDate(date, day, schedule);

  if (!today.open || !today.close) {
    return {
      isOpen: false,
      today,
      exception,
      label: { en: "Closed today", ar: "مغلق اليوم" },
    };
  }

  const isOpen = minutes >= toMinutes(today.open) && minutes < toMinutes(today.close);

  return {
    isOpen,
    today,
    exception,
    label: isOpen
      ? {
          en: `Open now · closes ${formatTime(today.close, "en")}`,
          ar: `مفتوح الآن · يغلق ${formatTime(today.close, "ar")}`,
        }
      : { en: "Closed now", ar: "مغلق الآن" },
  };
}

const DAY_NAMES: Record<DayOfWeek, { en: string; ar: string }> = {
  0: { en: "Sunday", ar: "الأحد" },
  1: { en: "Monday", ar: "الإثنين" },
  2: { en: "Tuesday", ar: "الثلاثاء" },
  3: { en: "Wednesday", ar: "الأربعاء" },
  4: { en: "Thursday", ar: "الخميس" },
  5: { en: "Friday", ar: "الجمعة" },
  6: { en: "Saturday", ar: "السبت" },
};

export interface HoursRow {
  days: { en: string; ar: string };
  hours: { en: string; ar: string };
}

/**
 * The weekly schedule collapsed into display rows, consecutive identical
 * days grouped ("Monday – Saturday"). Derived, never authored — this is what
 * the Contact page, the footer and any future hours block all render, so a
 * change to `clinicHours` cannot leave one surface behind.
 */
export function weeklyHoursRows(schedule: DailyHours[] = clinicHours): HoursRow[] {
  const ordered: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];
  const rows: HoursRow[] = [];
  let run: DayOfWeek[] = [];

  const key = (d: DayOfWeek) => {
    const e = schedule.find((s) => s.day === d)!;
    return `${e.open}-${e.close}`;
  };

  const flush = () => {
    if (!run.length) return;
    const first = run[0];
    const last = run[run.length - 1];
    const entry = schedule.find((s) => s.day === first)!;
    const days =
      run.length === 1
        ? DAY_NAMES[first]
        : {
            en: `${DAY_NAMES[first].en} – ${DAY_NAMES[last].en}`,
            ar: `${DAY_NAMES[first].ar} – ${DAY_NAMES[last].ar}`,
          };
    const hours =
      entry.open && entry.close
        ? {
            en: `${formatTime(entry.open, "en")} – ${formatTime(entry.close, "en")}`,
            ar: `${formatTime(entry.open, "ar")} – ${formatTime(entry.close, "ar")}`,
          }
        : { en: "Closed", ar: "مغلق" };
    rows.push({ days, hours });
    run = [];
  };

  for (const day of ordered) {
    if (run.length && key(day) !== key(run[0])) flush();
    run.push(day);
  }
  flush();
  return rows;
}
