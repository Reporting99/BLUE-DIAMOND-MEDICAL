"use client";

import { useEffect } from "react";
import { trackLeadEvent } from "@/lib/analytics/events";

/**
 * Fires GA4 lead events for tel:/mailto:/booking-link clicks anywhere in the
 * app, via one document-level listener mounted once here — the same pattern
 * as ScrollProgress/BackToTop in this layout — rather than editing every
 * component that renders a phone number or a "Book online" link.
 *
 * Delegation, not per-link handlers, because those links are rendered by
 * server components (AccessOptions, FooterPhones, page-level CTAs) across
 * dozens of files; making each one a client component just to attach an
 * onClick would be a much larger, more fragile change for the same result.
 *
 * The href is inspected only for its scheme/host — never its text content —
 * so no visible label, phone number, or email address is read into the
 * event payload.
 */
const BOOKING_HOSTS = [
  "ab.skipthewaitingroom.com",
  "app.mikatahealth.com",
  "euclidtelehealth.org",
];

export function LeadEventTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const href = anchor.getAttribute("href") ?? "";

      if (href.startsWith("tel:")) {
        trackLeadEvent("phone_click", { label: "clinic" });
        return;
      }
      if (href.startsWith("mailto:")) {
        trackLeadEvent("email_click", { label: "clinic" });
        return;
      }
      try {
        const url = new URL(href, window.location.href);
        if (BOOKING_HOSTS.includes(url.hostname)) {
          trackLeadEvent("booking_click", { label: url.hostname });
        }
      } catch {
        // Relative/invalid href — not a booking link.
      }
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
