import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/media";

/**
 * Inline recreation of the approved Blue Diamond Medical mark (4-facet
 * diamond + heartbeat line, 4-blue variant), built to the exact facet
 * numbering and RGB values in BLUE DIAMOND LOGO DOCUMENT[10519].pdf.
 *
 * This is a functional stand-in until Decca Design Inc.'s master vector
 * file (SVG/EPS) is supplied — see docs/MEDIA.md. It
 * must be swapped for the real file before launch and must never be
 * redrawn, recolored, or modified beyond that swap — docs/UI_UX_FOUNDATION.md §1.1.
 */
export function DiamondMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 130"
      className={className}
      role="img"
      aria-hidden="true"
    >
      <polygon points="50,5 50,65 5,65" fill="#88B9D7" />
      <polygon points="50,5 95,65 50,65" fill="#5999BF" />
      <polygon points="50,65 5,65 50,125" fill="#1D5678" />
      <polygon points="50,65 50,125 95,65" fill="#296589" />
      <path
        d="M 50 15 L 50 50 L 40 50 L 46 38 L 54 68 L 60 50 L 50 50 L 50 115"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  locale,
  className,
  showWordmark = true,
  tone = "default",
}: {
  locale: Locale;
  className?: string;
  showWordmark?: boolean;
  /** "reversed" = white wordmark for dark backgrounds — brand rule: dark backgrounds get the reversed lock-up, never the default blue-3 text. */
  tone?: "default" | "reversed";
}) {
  return (
    <Link
      href={`/${locale}`}
      className={cn("flex items-center gap-2.5 py-1", className)}
      aria-label={locale === "ar" ? "بلو دايموند الطبية — الصفحة الرئيسية" : "Blue Diamond Medical — Home"}
    >
      <DiamondMark className="h-9 w-auto shrink-0" />
      {showWordmark ? (
        <span
          className="text-[1.05rem] font-semibold leading-tight tracking-tight"
          style={{ color: tone === "reversed" ? "var(--surface-dark-foreground)" : "var(--blue-3)" }}
        >
          {locale === "ar" ? "بلو دايموند الطبية" : "Blue Diamond Medical"}
        </span>
      ) : null}
    </Link>
  );
}

/**
 * The same lock-up the header renders, at display scale.
 *
 * It is not a second logo and nothing here is redrawn: it is `DiamondMark`
 * plus the same wordmark, in the same order, the same `--blue-3`, and the
 * same proportions the header sets — mark width 1.648× the wordmark's font
 * size (27.69/16.8), gap 0.595× (10/16.8). Those two ratios are the only
 * reason this is a component rather than a `className` on `Logo`: scaling a
 * lock-up whose parts are pinned in px (`h-9`, `gap-2.5`, `1.05rem`) means
 * re-spacing it by hand at every size, and re-spacing the lock-up is exactly
 * what docs/UI_UX_FOUNDATION.md §1.1 forbids. Driving all three off one width
 * variable keeps the geometry identical at any size.
 *
 * Callers set `--bd-lockup` to the lock-up's *rendered* width; everything
 * else follows from it, so `height` is never specified and the mark's 100:130
 * viewBox ratio is what decides it. The three coefficients below are the two
 * ratios above divided through by the wordmark's measured advance width
 * (~10.1em in IBM Plex Sans SemiBold at `tracking-tight`), which is what makes
 * the box come out at `--bd-lockup` rather than a tenth under it.
 *
 * NOT A LINK. The header's lock-up is the site's home affordance; a second,
 * much larger one inside a page's own hero would be a 480px-wide link to a
 * page the visitor is one click from anyway. This is a graphic — one image to
 * assistive technology, named once by `aria-label`.
 */
export function BrandLockup({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <div
      role="img"
      aria-label={locale === "ar" ? "بلو دايموند الطبية" : "Blue Diamond Medical"}
      className={cn("flex items-center", className)}
      style={{ gap: "calc(var(--bd-lockup) * 0.0493)" }}
    >
      <span className="block shrink-0" style={{ width: "calc(var(--bd-lockup) * 0.1367)" }}>
        <DiamondMark className="block h-auto w-full" />
      </span>
      <span
        className="font-semibold leading-tight tracking-tight whitespace-nowrap"
        style={{ fontSize: "calc(var(--bd-lockup) * 0.0829)", color: "var(--blue-3)" }}
      >
        {locale === "ar" ? "بلو دايموند الطبية" : "Blue Diamond Medical"}
      </span>
    </div>
  );
}
