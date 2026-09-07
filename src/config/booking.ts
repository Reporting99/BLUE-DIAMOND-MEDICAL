import { siteConfig } from "@/config/site";

/**
 * Centralized external booking destinations. Every "Book" CTA in the app
 * must resolve its href through getBookingUrl() — never hardcode a
 * mikatahealth.com / euclidtelehealth.org / skipthewaitingroom URL inline
 * in a component.
 *
 * Client change register:
 *  - CL-006  registered/current patients book through the clinic's own
 *            tokenized Mikata link, never the generic Mikata homepage.
 *  - CL-007  new patients and walk-ins book through the clinic-specific
 *            Skip the Waiting Room link. SUPPLIED 2026-09-06 — see
 *            NEW_PATIENT_ONLINE_BOOKING_URL below.
 *  - CL-008  the aesthetics consultation flow uses Mikata, not Jane.
 */

/**
 * CL-007 — the clinic-specific Skip the Waiting Room queue, supplied by the
 * client 2026-09-06. This is Blue Diamond's OWN walk-in queue, not the Skip
 * the Waiting Room homepage and not a search result: sending a new patient to
 * the wrong clinic's queue is the failure this constant exists to prevent.
 *
 * Setting this flips the `walk-in` channel below from `pending` to `url`
 * automatically, so every new-patient/walk-in surface gains its online option
 * from this one line. Nothing else needs editing to add or remove it.
 *
 * Deliberately NOT the destination of generic "Book" buttons. A visitor whose
 * patient type is unknown goes to the booking page, where the three access
 * routes are separated; only a CTA that explicitly says new-patient or
 * walk-in resolves here.
 */
export const NEW_PATIENT_ONLINE_BOOKING_URL: string | null =
  "https://ab.skipthewaitingroom.com/walk-in-clinic/calgary/blue-diamond-medical/blue-diamond-medical";

/** CL-006 / CL-008 — the clinic's own tokenized Mikata booking link. */
export const MIKATA_BOOKING_URL =
  "https://app.mikatahealth.com/book-appointment?token=it7K7LTw7OHcbe";

export type BookingChannel =
  | "family-doctor" // Mikata — registered/current patients, with your own doctor
  | "walk-in" // Skip the Waiting Room — new patients & walk-ins (URL pending)
  | "eye-screening" // Euclid Telehealth
  | "aesthetics-consultation" // Mikata — 20-minute consultation with Dr. Farhat
  | "phone-medical-botox" // no online booking supplied — phone only
  | "phone-aesthetics" // no online booking supplied — phone only
  | "minor-procedures"; // CL-018 — phone or in person only, never online

export interface BookingDestination {
  channel: BookingChannel;
  /**
   * "url"     — a live external booking destination.
   * "phone"   — this channel is booked by calling the clinic.
   * "pending" — this channel HAS an online route, but its URL has not been
   *             supplied yet; `href` is null and callers must fall back to
   *             the phone/in-person options rather than render a dead link.
   */
  type: "url" | "phone" | "pending";
  href: string | null;
  label: { en: string; ar: string };
}

/** Allowlist — src/lib/security/booking-allowlist.ts validates against these hosts. */
export const allowedBookingHosts = [
  "app.mikatahealth.com",
  "mikatahealth.com",
  "euclidtelehealth.org",
  "skipthewaitingroom.com",
] as const;

export const bookingDestinations: Record<BookingChannel, BookingDestination> = {
  "family-doctor": {
    channel: "family-doctor",
    type: "url",
    href: MIKATA_BOOKING_URL,
    label: { en: "Book with your doctor", ar: "احجز مع طبيبك" },
  },
  "walk-in": {
    channel: "walk-in",
    type: NEW_PATIENT_ONLINE_BOOKING_URL ? "url" : "pending",
    href: NEW_PATIENT_ONLINE_BOOKING_URL,
    label: { en: "Book a walk-in or new-patient visit", ar: "احجز زيارة بدون موعد أو كمريض جديد" },
  },
  "eye-screening": {
    channel: "eye-screening",
    type: "url",
    href: "https://euclidtelehealth.org/book-now",
    label: { en: "Book your eye screening", ar: "احجز فحص العين" },
  },
  "aesthetics-consultation": {
    channel: "aesthetics-consultation",
    type: "url",
    href: MIKATA_BOOKING_URL,
    label: { en: "Book a 20-minute consultation", ar: "احجز استشارة" },
  },
  "phone-medical-botox": {
    channel: "phone-medical-botox",
    type: "phone",
    href: `tel:${siteConfig.clinic.phone}`,
    label: { en: "Call to book Botox", ar: "اتصل لحجز موعد البوتوكس" },
  },
  "phone-aesthetics": {
    channel: "phone-aesthetics",
    type: "phone",
    href: `tel:${siteConfig.aesthetics.phone}`,
    label: { en: "Call to book a consultation", ar: "اتصل لحجز استشارة" },
  },
  /**
   * CL-018 / CL-042 — minor procedures are an AHS-insured MEDICAL clinic
   * service, so the number a patient is sent to must be the medical clinic
   * line. This channel previously carried the AESTHETIC clinic's number
   * (403 247-1418), which sent every "call to book a minor procedure" CTA on
   * /medical/minor-procedures to the wrong reception desk. Both numbers now
   * come from siteConfig rather than being retyped here, so a change to a
   * published line cannot leave a stale digit behind in this file.
   */
  "minor-procedures": {
    channel: "minor-procedures",
    type: "phone",
    href: `tel:${siteConfig.clinic.phone}`,
    label: { en: "Call to book a minor procedure", ar: "اتصل لحجز إجراء بسيط" },
  },
};

export function getBookingUrl(channel: BookingChannel): BookingDestination {
  return bookingDestinations[channel];
}

/** True when this channel can actually be opened right now. */
export function isBookable(destination: BookingDestination): destination is BookingDestination & { href: string } {
  return destination.href !== null;
}

/**
 * CL-008 — the client-approved sentence for the aesthetic-treatment flow.
 * Exact wording; do not shorten, rephrase, or re-provider it.
 *
 * Arabic is a CLIENT DEPENDENCY: no approved Arabic rendering of this
 * sentence was supplied, and this file does not invent one. Callers render
 * it only where `en` is the active locale (see AccessOptions).
 */
export const AESTHETICS_CONSULTATION_NOTE = {
  en: "For all aesthetic treatment appointments, book a 20-minute consultation with Dr. Farhat.",
  ar: null,
} as const;
