import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * CL-002 — the new-patient / walk-in availability notice.
 *
 * One component, rendered above the fold on Home and on Medical Care, so the
 * two pages cannot drift apart and the sentence is edited in one place. It is
 * deliberately a filled brand-blue band with a live status dot, not a
 * small-print line under the hero copy: the client's complaint was that this
 * fact read as a footnote.
 *
 * It now reads as a breaking-news ticker: a full-width brand-blue strip whose
 * sentence travels across it. The motion is what makes the fact unmissable at
 * a glance, which is the same job the filled band was doing — the wording,
 * colour and status dot are unchanged.
 *
 * The English sentence is the client's exact approved wording. The Arabic is
 * the clinic's own already-published Arabic for the same fact (the Medical
 * Care hub's approved intro), not a new machine translation.
 */
export const NEW_PATIENT_NOTICE = {
  en: "Male and female family physicians accepting new patients and walk-ins.",
  ar: "أطباء وطبيبات أسرة يستقبلون مرضى جددًا وحالات بدون موعد مسبق.",
} as const;

/**
 * The booking channel for that fact, carried in the same strip. The client
 * asked for the phone number to travel WITH the notice, and to say plainly
 * that booking happens by calling it — otherwise the strip announces the
 * availability without telling anyone how to act on it.
 *
 * The number is the medical clinic's own line (the arm this notice is about),
 * read from the canonical site config so it cannot drift from the contact
 * card, the footer or the schema.
 */
export const NEW_PATIENT_BOOKING = {
  en: `Booking by phone: ${siteConfig.clinic.phoneDisplay}`,
  ar: `الحجز عبر الهاتف: ${siteConfig.clinic.phoneDisplay}`,
} as const;

/**
 * How many times the sentence is repeated inside ONE copy of the track. The
 * loop only reads as continuous while the track is at least twice the strip's
 * width; a single short sentence on a 1920px screen would otherwise leave a
 * long empty stretch trailing it.
 */
const REPEATS_PER_COPY = 3;

function NoticeItem({ text, booking }: { text: string; booking: string }) {
  return (
    <>
      <span className="flex shrink-0 items-center gap-2.5 px-6">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-white" />
        <span className="whitespace-nowrap">{text}</span>
      </span>
      <span className="flex shrink-0 items-center gap-2.5 px-6">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-white" />
        <span className="whitespace-nowrap">{booking}</span>
      </span>
    </>
  );
}

export function NewPatientNotice({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const text = NEW_PATIENT_NOTICE[locale];
  const booking = NEW_PATIENT_BOOKING[locale];
  const items = Array.from({ length: REPEATS_PER_COPY }, (_, i) => i);

  return (
    <div
      className={cn(
        "notice-ticker relative flex w-full overflow-hidden bg-primary py-3 text-sm font-semibold text-white sm:text-base",
        className,
      )}
    >
      {/*
        The sentence is announced once, statically, to assistive technology —
        the visual repetition exists only to make the loop seamless, and a
        screen reader hearing it six times would be noise, not emphasis.
      */}
      <span className="sr-only">
        {text} {booking}
      </span>
      {/*
        The number itself stays reachable: the moving copy is aria-hidden and
        cannot be tapped, so the strip also carries one real tel link, visible
        only to assistive technology and keyboard users.
      */}
      <a className="sr-only focus:not-sr-only" href={`tel:${siteConfig.clinic.phone}`}>
        {siteConfig.clinic.phoneDisplay}
      </a>

      <div aria-hidden="true" className="notice-ticker-track flex w-max shrink-0">
        {/* Two identical copies — the CSS slides the track by exactly half its
            width, so copy two lands where copy one began. */}
        {items.map((i) => (
          <NoticeItem key={`a-${i}`} booking={booking} text={text} />
        ))}
        {items.map((i) => (
          <NoticeItem key={`b-${i}`} booking={booking} text={text} />
        ))}
      </div>
    </div>
  );
}
