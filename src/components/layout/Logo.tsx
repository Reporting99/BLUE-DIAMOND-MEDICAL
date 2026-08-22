import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/media";

/**
 * Inline recreation of the approved Blue Diamond Medical mark (4-facet
 * diamond + heartbeat line, 4-blue variant), built to the exact facet
 * numbering and RGB values in BLUE DIAMOND LOGO DOCUMENT[10519].pdf.
 *
 * This is a functional stand-in until Decca Design Inc.'s master vector
 * file (SVG/EPS) is supplied — see docs/IMAGE_REPLACEMENT_MANIFEST.md. It
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
