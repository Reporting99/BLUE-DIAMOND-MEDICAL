import { allowedBookingHosts, bookingDestinations, type BookingChannel } from "@/config/booking";

/**
 * Validates that every `type: "url"` booking destination in
 * src/config/booking.ts points at an allow-listed host. This was
 * previously only a code comment ("src/lib/security/booking-allowlist.ts
 * validates against these hosts") with no file behind it — a real gap
 * found and fixed in this remediation pass, not a hypothetical one.
 *
 * This exists to catch the specific mistake it's designed for: someone
 * adding a new booking channel later and typo-ing the host, or a bad
 * external link making it into `bookingDestinations` unnoticed. It is not
 * meant to catch a genuinely malicious change to this repo's own source —
 * anyone editing `booking.ts` directly could edit this file too — but it
 * is a real, exercised guard against a real class of external-link
 * mistake, checked in CI via `tests/security/booking-allowlist.spec.ts`.
 */
export function isAllowedBookingHost(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  // Require https and no embedded credentials (https://user:pass@host/) —
  // a hostname-only check would pass a technically-matching but insecure
  // or credential-smuggling URL.
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    return false;
  }
  const hostname = parsed.hostname;
  return (allowedBookingHosts as readonly string[]).some(
    (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`),
  );
}

export interface BookingAllowlistViolation {
  channel: BookingChannel;
  href: string;
}

/** Every `url`-type booking destination that is NOT on the allowlist. Empty when everything is clean. */
export function findBookingAllowlistViolations(): BookingAllowlistViolation[] {
  const violations: BookingAllowlistViolation[] = [];
  for (const destination of Object.values(bookingDestinations)) {
    if (destination.type !== "url") continue; // tel: links aren't host-checked
    if (!isAllowedBookingHost(destination.href)) {
      violations.push({ channel: destination.channel, href: destination.href });
    }
  }
  return violations;
}
