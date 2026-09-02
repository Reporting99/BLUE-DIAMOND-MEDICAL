import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { FacetTile } from "@/components/shared/FacetTile";
import { cmsAlt } from "@/lib/feelstack/media-slots";
import type { ImageKitAsset } from "@/types/media";
import type { Locale } from "@/i18n/config";

/**
 * THE CONCERN DETAIL HERO — photograph on the left, copy on the right, a
 * faceted Blue Diamond transition between them.
 *
 * WHY THIS IS NOT `PageHero`. PageHero is art-directed around a full-bleed
 * photograph with the copy laid OVER it behind a readability wash, and its
 * `mediaLayout="split"` variant puts the picture on the inline-END side — the
 * right in English, the left in Arabic — because every other hero on the site
 * starts its copy from the inline-start edge. This composition is the opposite
 * on both counts: no text ever crosses the photograph, and the photograph is
 * on the PHYSICAL left in both locales rather than mirroring with the writing
 * direction. Adding two more flags to PageHero to express that would have made
 * a component that twenty-one other routes render branch on a case none of
 * them use; those routes are deliberately untouched by this file.
 *
 * WHY THE COLUMNS ARE A GRID AND NOT AN ABSOLUTE HALF. PageHero's split lifts
 * its picture out of the flow (`md:absolute md:inset-y-0`) because the copy
 * has to be able to run underneath it. Here nothing overlaps, so the two
 * columns can simply be grid tracks: the photograph stretches to the row's
 * height for free, the copy column can never be overrun by it, and there is no
 * way for either to escape the section and produce a horizontal scrollbar.
 *
 * WHERE THE PHOTOGRAPH IS ALLOWED TO DISSOLVE. The nine concern assets are one
 * shoot with one framing: a plain, near-empty background on the left and the
 * subject's face running to within a few percent of the RIGHT edge of the
 * frame. That edge is the one facing the copy, so the long inner-edge fade
 * PageHero uses (0 -> 1 over ~36% of the picture) would print the transition
 * straight across a cheek — the same failure `.hero-split-media`'s comment in
 * globals.css records having to correct once already. No `object-position` can
 * rescue it either: the subject ends where the frame ends, so cropping can
 * only cut the face off rather than move it inboard.
 *
 * So the picture keeps a SHORT fade — the last ~8% of its own box, a few dozen
 * pixels — and the faceted transition the design calls for lives mostly in the
 * band BESIDE the photograph rather than on top of it. The photograph stays at
 * full strength and full colour across everything a viewer actually looks at,
 * which is the brief's first requirement, and what meets the copy ground is
 * still a gradient over facet planes rather than a cut rectangular edge.
 */

/** How tall the two-column composition stands. Kept inside the 400–520px the
 * design calls for at every desktop width — tall enough to hold a portrait,
 * short enough that the copy never floats in an empty lower half. */
const HERO_MIN_HEIGHT = "md:min-h-[400px] lg:min-h-[460px] xl:min-h-[500px]";

/**
 * The photograph's inner edge.
 *
 * Opaque until 92% of its own width, then out to nothing. Long enough to read
 * as a dissolve into the facet band rather than as a cut, short enough to stay
 * clear of the subject. Applied from `md` only: below that the picture is a
 * full-width block whose edges are the section's own, and a fade there would
 * just thin one side of it for no reason.
 *
 * 92% IS MEASURED, NOT CHOSEN. The nine assets are two families. Four are
 * portraits on a plain ground whose subject ends well inboard — the rightmost
 * column carrying subject is 68.8% (acne-scars), 87.1% (skin-revitalization),
 * 87.1% (spider-veins), and skin-laxity's feature asset sits on its own
 * graphic ground. The other five (dry-skin, rosacea-redness,
 * fine-lines-wrinkles, razor-bumps, sun-damage-pigmentation) are full-bleed
 * macro skin crops with no ground at all, where the fade dissolves texture
 * rather than a face. So the fade begins after the last face ends in the
 * first family and is cosmetic in the second — which is why it is 8% and not
 * PageHero's 36%. At 36% the dissolve starts at 64%, inside all three faces.
 */
const INNER_EDGE_FADE =
  "md:[-webkit-mask-image:linear-gradient(to_right,#000_0%,#000_92%,transparent_100%)] " +
  "md:[mask-image:linear-gradient(to_right,#000_0%,#000_92%,transparent_100%)] " +
  "md:[-webkit-mask-size:100%_100%] md:[mask-size:100%_100%] " +
  "md:[-webkit-mask-repeat:no-repeat] md:[mask-repeat:no-repeat]";

export interface ConcernSplitHeroProps {
  locale: Locale;
  title: string;
  body?: string;
  /** This concern's resolved CMS assignment. Chosen by the shared slot order
   * in `../media-slots` — never by this component, which is why Skin Laxity's
   * `section` feature asset arrives here without a special case. */
  image?: ImageKitAsset;
  /** Fallback name for the visual when the asset carries no CMS alt. */
  imageAlt: { en: string; ar: string };
  /** Varies the facet composition between sibling concerns. */
  seed?: string | number;
  /** The consultation CTA, rendered in the copy column under the summary. */
  actions?: React.ReactNode;
  /** Rendered above the H1, inside the copy column — never over the picture. */
  breadcrumbs?: React.ReactNode;
  /** The asset's own caption, when the CMS supplied one. Rendered as a credit
   * line under the copy rather than inside the masked picture box, where it
   * would be clipped by the inner-edge fade. */
  imageCaption?: { en: string; ar: string };
}

export function ConcernSplitHero({
  locale,
  title,
  body,
  image,
  imageAlt,
  seed,
  actions,
  breadcrumbs,
  imageCaption,
}: ConcernSplitHeroProps) {
  /**
   * `ImageKitImage` already degrades to a FacetTile for an asset that is not
   * approved, so this only decides whether the picture column gets the masked
   * photograph treatment or a clean branded tile. A placeholder with a
   * dissolving edge would read as a rendering fault rather than as a fallback.
   */
  const hasPhoto = image?.status === "approved";

  return (
    <section
      /* A stable hook for the rendering checks that assert this composition
         holds — picture on the left, copy clear of it, no overlay on the
         photograph — across all nine concerns in both locales. */
      data-concern-hero=""
      className="relative isolate overflow-hidden border-b border-border"
    >
      {/*
        THE GROUND, in one layer: pale Blue Diamond blue under the picture and
        the transition, resolving to white where the copy sits. The copy never
        reads against anything but near-white, and the seam between the two
        halves is a gradient stop rather than a boundary.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-30 bg-[linear-gradient(to_right,var(--surface-blue-soft)_0%,var(--surface-blue-mist)_46%,#ffffff_66%)]"
      />

      {/*
        THE FACETED TRANSITION. The brand's own facet planes, held in the band
        between the picture's inner edge and the copy and masked to nothing at
        both ends, so it has no edge of its own to show. Low opacity and
        `md:` only: this is the join between two columns, and below `md` there
        is no join because the two are stacked.

        Decorative — the photograph beside it already carries the accessible
        name for this concern, and a second element naming the same subject
        would say it twice.
      */}
      {/*
        THE BAND IS CUT OFF BEFORE THE COPY, DELIBERATELY. It spans 30%–50% of
        the section and is masked to nothing by its own right edge, so the
        facet planes have faded out by 50% — while the copy column's text does
        not begin until ~49% (its track starts at 45–46% and is padded by
        `lg:px-14`). Letting the band run under the headline is the failure
        mode this composition is most exposed to: `--text-secondary` is #707070,
        which clears 4.5:1 on the near-white ground here but not over facet
        planes, and a structural overlap check would pass the whole time.
      */}
      <div
        aria-hidden="true"
        className={
          "absolute inset-y-0 left-[30%] hidden w-[20%] -z-20 opacity-50 md:block " +
          "[-webkit-mask-image:linear-gradient(to_right,transparent_0%,#000_50%,#000_72%,transparent_100%)] " +
          "[mask-image:linear-gradient(to_right,transparent_0%,#000_50%,#000_72%,transparent_100%)] " +
          "[-webkit-mask-size:100%_100%] [mask-size:100%_100%] " +
          "[-webkit-mask-repeat:no-repeat] [mask-repeat:no-repeat]"
        }
      >
        <FacetTile role="concern" seed={seed} decorative className="h-full w-full" />
      </div>

      {/*
        `dir="ltr"` PINS THE COLUMN ORDER. The grid's first track is the
        photograph and it must stay on the physical left in Arabic too — this
        hero is a branded page pattern, not a reading-order layout, and
        mirroring it would put the subject's face against the copy's inner
        edge, which is the one place the composition cannot take it. The copy
        column below restores the document's own direction for its text.
      */}
      <div
        dir="ltr"
        className={`grid grid-cols-1 items-stretch md:grid-cols-[46%_54%] lg:grid-cols-[45%_55%] ${HERO_MIN_HEIGHT}`}
      >
        {/* THE PICTURE. Flush to the section's left edge, no card, no border,
            no inset — a hero image in a rounded box beside the text is a
            figure, not a hero. `aspect-[4/3]` below `md` is the asset's own
            ratio, so the stacked phone layout crops nothing at all. */}
        <div
          className={`relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:h-full ${
            hasPhoto ? INNER_EDGE_FADE : ""
          }`}
        >
          {image && hasPhoto ? (
            <ImageKitImage
              path={image.path}
              preset="hero"
              role={image.role}
              status={image.status}
              alt={cmsAlt(image) ?? imageAlt}
              locale={locale}
              width={image.width}
              height={image.height}
              /* Still this page's LCP image, so still preloaded — but it now
                 covers under half the viewport, and a `100vw` hint would make
                 the browser choose a candidate twice the size it can paint. */
              preload
              sizes="(min-width: 768px) 46vw, 100vw"
              /* Biased up the frame: every one of these assets is a portrait
                 with the head high in a 4:3 original, and the desktop column
                 is wider than 4:3, so what `object-cover` discards is the top
                 and bottom. Centred, it takes the crown of the head with it. */
              className="h-full w-full [&_img]:object-[62%_22%]"
            />
          ) : (
            <FacetTile
              role="concern"
              seed={seed}
              alt={imageAlt[locale]}
              className="h-full w-full"
            />
          )}
        </div>

        {/* THE COPY. Its own column, against the pale ground — never over the
            photograph. `dir` returns to the document's here so Arabic runs
            RTL and aligns right inside a column that is itself pinned to the
            physical right. */}
        <div
          dir={locale === "ar" ? "rtl" : "ltr"}
          className="flex flex-col justify-center px-6 py-10 sm:px-8 md:px-10 md:py-12 lg:px-14 xl:px-16"
        >
          <div className="w-full max-w-[34rem]">
            {breadcrumbs ? <div className="mb-5">{breadcrumbs}</div> : null}
            {/* The page's one H1. Not reveal-animated: it is above the fold on
                every concern page and is an LCP candidate — see
                docs/UI_UX_FOUNDATION.md §9-10. */}
            <h1 className="text-display-1 font-heading lg:text-display-1-lg">{title}</h1>
            {body ? <p className="mt-5 text-body-lg text-text-secondary">{body}</p> : null}
            {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
            {imageCaption?.[locale] ? (
              <p className="mt-6 text-caption text-text-secondary">{imageCaption[locale]}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
