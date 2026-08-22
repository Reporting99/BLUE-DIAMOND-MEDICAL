/**
 * Central weekly schedule. Components must compute "open now" / "closes at"
 * dynamically from this table in the clinic's timezone — never hardcode
 * "Open today" as static text (brief §23).
 *
 * Source: legacy site listed only "Open today 08:00–19:00" for the main
 * clinic and "Open today 09:00–17:00" for aesthetics, with no other days
 * broken out. Both are treated here as the daily hours applying every day
 * the clinic is open, which is the most literal reading of the source —
 * flagged in docs/MISSING_CONTENT_REPORT.md as needing a real day-by-day
 * schedule from the client.
 */

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface DailyHours {
  day: DayOfWeek;
  open: string | null; // "HH:mm" 24h, null = closed
  close: string | null;
}

export const clinicHours: DailyHours[] = [
  { day: 0, open: null, close: null }, // Sunday — not confirmed, closed by default
  { day: 1, open: "08:00", close: "19:00" },
  { day: 2, open: "08:00", close: "19:00" },
  { day: 3, open: "08:00", close: "19:00" },
  { day: 4, open: "08:00", close: "19:00" },
  { day: 5, open: "08:00", close: "19:00" },
  { day: 6, open: null, close: null }, // Saturday — not confirmed, closed by default
];

export const aestheticsHours: DailyHours[] = [
  { day: 0, open: null, close: null },
  { day: 1, open: "09:00", close: "17:00" },
  { day: 2, open: "09:00", close: "17:00" },
  { day: 3, open: "09:00", close: "17:00" },
  { day: 4, open: "09:00", close: "17:00" },
  { day: 5, open: "09:00", close: "17:00" },
  { day: 6, open: null, close: null },
];

export const statutoryHolidayNotice = {
  en: "Closed all statutory holidays.",
  ar: "مغلق في جميع العطلات الرسمية.",
};

const TIMEZONE = "America/Edmonton";

function nowInClinicTimezone(): { day: DayOfWeek; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const weekdayShort = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");

  const dayMap: Record<string, DayOfWeek> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  return { day: dayMap[weekdayShort] ?? 0, minutes: hour * 60 + minute };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export interface OpenStatus {
  isOpen: boolean;
  today: DailyHours;
  label: { en: string; ar: string };
}

export function getOpenStatus(schedule: DailyHours[] = clinicHours): OpenStatus {
  const { day, minutes } = nowInClinicTimezone();
  const today = schedule.find((d) => d.day === day)!;

  if (!today.open || !today.close) {
    return {
      isOpen: false,
      today,
      label: { en: "Closed today", ar: "مغلق اليوم" },
    };
  }

  const isOpen = minutes >= toMinutes(today.open) && minutes < toMinutes(today.close);

  return {
    isOpen,
    today,
    label: isOpen
      ? { en: `Open now · closes ${today.close}`, ar: `مفتوح الآن · يغلق ${today.close}` }
      : { en: "Closed now", ar: "مغلق الآن" },
  };
}
