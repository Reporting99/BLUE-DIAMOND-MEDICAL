"use client";

import { usePathname } from "next/navigation";
import type { PhoneLine } from "@/config/phone-lines";
import type { Locale } from "@/i18n/config";

/**
 * The footer's published phone lines.
 *
 * A CLIENT component, and the only one in the footer, for one reason: the
 * footer lives in the shared `[locale]` layout, and a Next.js layout is not
 * told which child route is rendering. The client rule is route-dependent —
 * `/medical/*` publishes the clinic line alone, everywhere else publishes
 * both — so something in this subtree has to read the actual path.
 * `usePathname()` is that, scoped to this block so the rest of the footer
 * stays a server component.
 *
 * Both phone lists are passed in as props rather than imported here, so
 * `src/config/site.ts` (and the SITE_URL resolver behind it) stays out of the
 * client bundle. This component only picks between two lists it was handed.
 *
 * `medicalPathPrefixes` is passed in rather than derived here, and is a LIST
 * rather than one string, for two separate reasons:
 *
 *  1. The localized medical path is "/medical" in English but
 *     "/الرعاية-الطبية" in Arabic, so a hardcoded "/medical" check would
 *     silently never match on /ar and every Arabic medical page would
 *     publish both numbers. The caller resolves the path from the route
 *     registry, which keeps that table the single source of truth and keeps
 *     it out of the client bundle.
 *  2. src/proxy.ts serves a pretty Arabic URL by REWRITING it to the
 *     English-slug path under the same locale (/ar/الرعاية-الطبية renders as
 *     /ar/medical). A rewrite leaves the browser URL alone, so depending on
 *     whether this component is rendering on the server or after a client
 *     navigation, usePathname() can report either form. Matching both means
 *     the answer is the same either way — and, importantly, identical
 *     between the server and client render, so there is no hydration
 *     mismatch and no flash of the wrong number.
 */
export function FooterPhones({
  locale,
  lines,
  medicalLines,
  medicalPathPrefixes,
}: {
  locale: Locale;
  /** What every non-medical page publishes. */
  lines: readonly PhoneLine[];
  /** What `/medical/*` publishes instead. */
  medicalLines: readonly PhoneLine[];
  /** Every locale-prefixed form the medical hub can appear as, e.g. "/en/medical". */
  medicalPathPrefixes: readonly string[];
}) {
  const pathname = usePathname();

  // usePathname() percent-encodes non-ASCII segments, so the Arabic medical
  // path arrives as "/ar/%D8%A7%D9%84...". Decode before comparing, and fall
  // back to the raw value if it is somehow not valid encoding rather than
  // throwing inside a render.
  let decoded = pathname ?? "";
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    /* keep the raw pathname */
  }

  // Exact match or a real child segment — never a bare `startsWith`, which
  // would also match a sibling route that merely begins with the same
  // characters (e.g. "/en/medical-spa").
  const isMedical = medicalPathPrefixes.some(
    (prefix) => decoded === prefix || decoded.startsWith(`${prefix}/`),
  );

  const shown = isMedical ? medicalLines : lines;

  return (
    <div className="mt-1 space-y-1">
      {shown.map((line) => (
        <div key={line.id}>
          {/* The label is rendered only when there is more than one number to
              tell apart. On a medical page the single line needs no
              disambiguation, and labelling it there would add a row of
              chrome the previous footer never had. */}
          {shown.length > 1 ? (
            <span className="me-2 text-xs" style={{ color: "var(--footer-text-muted)" }}>
              {line.label[locale]}
            </span>
          ) : null}
          <a
            className="ltr-run inline-block text-sm font-medium hover:text-[color:var(--footer-link-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--footer-focus)]"
            style={{ color: "var(--footer-text)" }}
            href={`tel:${line.tel}`}
          >
            {line.display}
          </a>
        </div>
      ))}
    </div>
  );
}
