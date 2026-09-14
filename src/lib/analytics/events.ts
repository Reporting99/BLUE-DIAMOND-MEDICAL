/**
 * GA4 event helpers.
 *
 * Every call site here is restricted to a fixed, non-PII parameter shape —
 * an event name plus at most a short static label (a channel key, a form
 * name). Nothing free-text (a form field value, a query string, a name or
 * contact detail) is ever accepted, by construction: there is no `details`
 * or `metadata` escape hatch on the type below. This is the healthcare
 * privacy boundary — see docs/AI_EDITORIAL_POLICY.md's spirit applied to
 * analytics: no patient data leaves the browser toward Google.
 *
 * `window.gtag` is installed by `@next/third-parties`'s `<GoogleAnalytics>`
 * (mounted once in the root layout). Calling this before that script has
 * loaded, or when analytics is unconfigured, is a silent no-op — never a
 * thrown error a visitor could notice.
 */

type LeadEventName = "phone_click" | "email_click" | "booking_click" | "form_submit";

type LeadEventParams = {
  /** A short static identifier, e.g. "clinic", "aesthetics", "mikata", "consultation". Never free text. */
  label: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackLeadEvent(name: LeadEventName, params: LeadEventParams): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, { event_category: "lead", label: params.label });
}
