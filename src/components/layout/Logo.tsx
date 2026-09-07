import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/media";
import { brandMark } from "@/lib/media/brand-mark";

/**
 * The approved Blue Diamond Medical mark, as supplied by the client on
 * 2026-09-07 — docs/MEDIA.md CL-001. This replaced the mark derived from the
 * client's earlier black-field render, which in turn replaced an inline SVG
 * stand-in; neither predecessor may come back.
 *
 * The asset is the client's own file with the white page field cut away to
 * transparency, so it sits on the white header, the dark blue footer and the
 * About hero alike. Every pixel of the diamond is theirs — nothing is
 * redrawn, recolored, or restyled, per docs/UI_UX_FOUNDATION.md §1.1, and the
 * diamond's own white interior is KEPT white rather than knocked through to
 * the background, because that negative space is part of the artwork. See
 * src/assets/brand/README.md for the source file, its checksum and how the
 * cut-out was derived.
 *
 * Served from ImageKit on the client's instruction (2026-09-07). Which URL
 * that is -- the CDN copy or the one bundled in the build -- is decided once
 * in `src/lib/media/brand-mark.ts`, not here; this component only draws it.
 *
 * A bare `<img>`, not `ImageKitImage` and not `next/image`. This is the one
 * image on the site that is neither: `ImageKitImage` renders the FacetTile
 * placeholder for anything that is not an approved ImageKit asset, and an
 * abstract tile where the clinic's logo should be reads as a broken header
 * rather than a missing photograph; `next/image` is banned in `src/` outright
 * (tests/unit/image-usage.spec.ts) because content imagery must go through
 * ImageKit's own loader, and this is not content imagery. `width`/`height`
 * carry the mark's aspect so nothing shifts while it loads, and
 * `loading="eager"` because the header lock-up is above the fold on every
 * route.
 */
export function DiamondMark({ className }: { className?: string }) {
  return (
    // The brand mark is deliberately not routed through next/image — see above.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={brandMark.src}
      width={brandMark.width}
      height={brandMark.height}
      alt=""
      aria-hidden="true"
      className={className}
      loading="eager"
      decoding="async"
    />
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
 * same proportions the header sets — mark width 1.751× the wordmark's font
 * size (29.41/16.8), gap 0.595× (10/16.8). The mark ratio moved again when the
 * client supplied the current logo on 2026-09-07 and the derived mark's box
 * went from 440:515 to 424:519: the header sizes the mark by height (`h-9`),
 * so a narrower asset at the same height is a narrower mark, and this lock-up
 * has to follow it. Those two ratios are the only
 * reason this is a component rather than a `className` on `Logo`: scaling a
 * lock-up whose parts are pinned in px (`h-9`, `gap-2.5`, `1.05rem`) means
 * re-spacing it by hand at every size, and re-spacing the lock-up is exactly
 * what docs/UI_UX_FOUNDATION.md §1.1 forbids. Driving all three off one width
 * variable keeps the geometry identical at any size.
 *
 * Callers set `--bd-lockup` to the lock-up's *rendered* width; everything
 * else follows from it, so `height` is never specified and the mark asset's
 * own 424:519 ratio is what decides it. The three coefficients below are the two
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
      style={{ gap: "calc(var(--bd-lockup) * 0.0497)" }}
    >
      <span className="block shrink-0" style={{ width: "calc(var(--bd-lockup) * 0.1461)" }}>
        <DiamondMark className="block h-auto w-full" />
      </span>
      <span
        className="font-semibold leading-tight tracking-tight whitespace-nowrap"
        style={{ fontSize: "calc(var(--bd-lockup) * 0.0835)", color: "var(--blue-3)" }}
      >
        {locale === "ar" ? "بلو دايموند الطبية" : "Blue Diamond Medical"}
      </span>
    </div>
  );
}
