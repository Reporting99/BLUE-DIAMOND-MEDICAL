/**
 * Centralized external booking destinations. Every "Book" CTA in the app
 * must resolve its href through getBookingUrl() — never hardcode a
 * mika.care / euclidtelehealth.org / janeapp.com URL inline in a component.
 *
 * Source: Blue-Diamond-Medical-Website-Content-Extraction_1.docx.
 */

export type BookingChannel =
  | "family-doctor" // Mika — general appointments with your family doctor
  | "walk-in" // Mika — Skip the Waiting Room / walk-in & new patients
  | "eye-screening" // Euclid Telehealth
  | "aesthetics-consultation" // Jane App — TempSure Vitalia / aesthetics
  | "phone-medical-botox" // no online booking supplied — phone only
  | "phone-aesthetics"; // no online booking supplied — phone only

interface BookingDestination {
  channel: BookingChannel;
  type: "url" | "phone";
  href: string;
  label: { en: string; ar: string };
}

/** Allowlist — src/lib/security/booking-allowlist.ts validates against these hosts. */
export const allowedBookingHosts = [
  "mika.care",
  "euclidtelehealth.org",
  "bluediamondmedical.janeapp.com",
] as const;

export const bookingDestinations: Record<BookingChannel, BookingDestination> = {
  "family-doctor": {
    channel: "family-doctor",
    type: "url",
    href: "https://mika.care",
    label: { en: "Book with your doctor", ar: "احجز مع طبيبك" },
  },
  "walk-in": {
    channel: "walk-in",
    type: "url",
    href: "https://mika.care",
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
    href: "https://bluediamondmedical.janeapp.com",
    label: { en: "Book a consultation", ar: "احجز استشارة" },
  },
  "phone-medical-botox": {
    channel: "phone-medical-botox",
    type: "phone",
    href: "tel:+18254131113",
    label: { en: "Call to book Botox", ar: "اتصل لحجز موعد البوتوكس" },
  },
  "phone-aesthetics": {
    channel: "phone-aesthetics",
    type: "phone",
    href: "tel:+14032471418",
    label: { en: "Call to book a consultation", ar: "اتصل لحجز استشارة" },
  },
};

export function getBookingUrl(channel: BookingChannel): BookingDestination {
  return bookingDestinations[channel];
}
