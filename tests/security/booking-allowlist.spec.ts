import { test, expect } from "@playwright/test";
import { findBookingAllowlistViolations, isAllowedBookingHost } from "../../src/lib/security/booking-allowlist";
import { bookingDestinations } from "../../src/config/booking";

/**
 * Guards the external-booking security properties the brief calls out
 * explicitly: every url-type booking destination resolves to an
 * allow-listed host, and no destination is a bare/relative path that
 * would accidentally point back into this app (an "internal booking
 * subroute" the brief prohibits).
 */
test.describe("Booking allowlist", () => {
  test("every url-type booking destination is on the allowlist", () => {
    expect(findBookingAllowlistViolations()).toEqual([]);
  });

  test("no booking destination is a relative/internal path", () => {
    for (const destination of Object.values(bookingDestinations)) {
      if (destination.type === "url") {
        expect(destination.href).toMatch(/^https:\/\//);
      } else if (destination.type === "phone") {
        expect(destination.href).toMatch(/^tel:\+/);
      } else {
        // CL-007 — a "pending" channel carries no URL at all rather than a
        // guessed one, and every surface renders its phone/in-person route.
        expect(destination.href).toBeNull();
      }
    }
  });

  test("isAllowedBookingHost rejects an unlisted host", () => {
    expect(isAllowedBookingHost("https://evil.example.com/book")).toBe(false);
    expect(isAllowedBookingHost("not a url")).toBe(false);
  });

  test("isAllowedBookingHost accepts the real destinations", () => {
    for (const destination of Object.values(bookingDestinations)) {
      if (destination.type === "url" && destination.href) {
        expect(isAllowedBookingHost(destination.href)).toBe(true);
      }
    }
  });
});
