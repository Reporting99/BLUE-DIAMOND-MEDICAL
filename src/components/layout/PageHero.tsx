import { Container } from "@/components/layout/Container";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { FacetTile } from "@/components/shared/FacetTile";
import { cmsAlt } from "@/lib/feelstack/media-slots";
import type { ImageKitAsset, ImageRole } from "@/types/media";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * The one hero every page uses.
 *
 * Before this component the homepage had a designed hero and every other route
 * opened with an unadorned `<h1>` on white — twenty-eight pages that were
 * correct, readable, and visually empty. A hero per page written by hand would
 * have produced twenty-eight slightly different heroes; this produces one,
 * whose only per-page variables are the picture, the words, and how tall it is.
 *
 * WHAT THE IMAGE IS. `image` is a resolved CMS assignment, the same
 * `ImageKitAsset` shape every other surface consumes (see
 * `lib/feelstack/media-slots.ts`). It renders through `ImageKitImage`, so an
 * asset that is not `approved` — which today is nearly all of them — falls
 * through to the branded `FacetTile` at exactly the same size. That is the
 * point: a page whose photography has not been shot yet still opens with a
 * composed, brand-coloured visual rather than with nothing, and the day an
 * editor approves the real photograph the page changes with no code change.
 * `imageRole` and `seed` decide which facet composition and tint stand in
 * meanwhile, so neighbouring pages do not open with identical art.
 *
 * WHY THE HOMEPAGE DOES NOT USE IT. Home is full-bleed *behind a transparent
 * header* and carries its own top padding to compensate; every other route
 * renders below the header's flow spacer (see Header.tsx) and is in-flow. The
 * two are the same design language, not the same box, and forcing one
 * component to be both would mean a `isHomepage` branch inside it — the kind
 * of conditional that quietly rots.
 *
 * NOTHING HERE IS REVEAL-ANIMATED. A hero is above the fold on every page it
 * appears on, and its `<h1>` and image are the LCP candidates, so
 * docs/UI_UX_FOUNDATION.md §9-10's rule applies verbatim: do not animate the
 * hero H1, hero CTA, or LCP image. `[data-reveal]` starts below this section.
 */

/** How much vertical room the hero claims. */
type PageHeroSize = "compact" | "standard";

/**
 * How wide the hero's own text column is, and — the reason this exists —
 * where its inline-start edge falls.
 *
 * `wide` puts the copy against the page container's edge, which is right for
 * a hub or listing whose content below runs the full width. `article` and
 * `narrow` reproduce the exact measure of the `max-w-3xl` / `max-w-2xl`
 * columns the detail templates render their prose in. Without them a
 * treatment page opened with its headline at the page edge and its first
 * paragraph indented to the centre of a narrower column — two different left
 * margins, one above the other, which reads as a layout bug rather than as a
 * hero.
 */
type PageHeroMeasure = "wide" | "article" | "narrow" | "form";

/**
 * Where the hero's picture goes.
 *
 * `bleed` is what every hero on this site does and what it has always done:
 * one photograph behind the whole section, the copy laid over its calm side,
 * a readability wash between them.
 *
 * `split` gives the picture a half of its own on the inline-END side and
 * leaves the facet background holding the other half, with the copy on the
 * inline-start side against it. In Arabic that lands the photograph on the
 * LEFT with the copy on the right, which is the composition /aesthetics was
 * art-directed to; in English the same rule mirrors to a photograph on the
 * right, which is what keeps the copy on the inline-start edge every other
 * hero on the site starts from. The asset is one file with no burnt-in text,
 * so nothing about the picture itself is flipped — only which side it is on.
 */
type PageHeroMediaLayout = "bleed" | "split";

const measureClasses: Record<PageHeroMeasure, string> = {
  wide: "",
  article: "max-w-3xl",
  narrow: "max-w-2xl",
  /** The single-column form pages (consultation), whose column is `max-w-xl`. */
  form: "max-w-xl",
};

/**
 * Where a two-column hero's copy column starts.
 *
 * `measure` normally does this by capping the Container itself, which a
 * two-column hero cannot do — it needs the full 1280px to have a second
 * column at all. Without this the copy fell back to the container edge while
 * the prose below it stayed in its own centred column: on /about that was the
 * headline at x=104 above a first paragraph at x=360, which is precisely the
 * two-different-left-margins bug the `measure` doc comment above describes.
 *
 * Both columns are centred in the viewport, so the gap between their
 * inline-start edges is `(container - measure) / 2` — independent of viewport
 * width, and 0 once the viewport is narrower than the measure. Expressed
 * against the row's own containing block that is `(100% + 2×padding -
 * measure) / 2`, which is why each entry carries the `px-4`/`lg:px-6` the
 * Container is actually padded with. Percentage padding resolves against the
 * containing block, so the columns' own percentages then divide what is left
 * rather than the full container.
 *
 * `wide` gets nothing: its copy is already meant to sit at the container edge.
 */
const measureOffsetClasses: Record<PageHeroMeasure, string> = {
  wide: "",
  article: "md:ps-[calc((100%_+_2rem_-_48rem)/2)] lg:ps-[calc((100%_+_3rem_-_48rem)/2)]",
  narrow: "md:ps-[calc((100%_+_2rem_-_42rem)/2)] lg:ps-[calc((100%_+_3rem_-_42rem)/2)]",
  form: "md:ps-[calc((100%_+_2rem_-_36rem)/2)] lg:ps-[calc((100%_+_3rem_-_36rem)/2)]",
};

const sizeClasses: Record<PageHeroSize, string> = {
  // Utility and transactional routes — cart, checkout, legal, shipping. Enough
  // presence to be a hero, not so much that it delays the task.
  compact: "min-h-[240px] py-10 sm:min-h-[280px] lg:min-h-[320px] lg:py-14",
  // Every editorial and landing route.
  standard: "min-h-[320px] py-12 sm:min-h-[380px] lg:min-h-[460px] lg:py-20",
};

export interface PageHeroProps {
  locale: Locale;
  /** Small uppercase line above the title. Optional but usual. */
  eyebrow?: string;
  title: string;
  /** One or two sentences. Longer copy belongs in the first section, not here. */
  body?: string;
  /** Resolved CMS assignment for this page's hero slot, when it has one. */
  image?: ImageKitAsset;
  /** Tint and facet composition for the fallback, and the role for a real asset. */
  imageRole?: ImageRole;
  /** Varies the fallback composition between sibling pages. Usually the route id. */
  seed?: string | number;
  /**
   * Accessible name for the visual. Required because it is not decorative:
   * it is standing in for the photograph of this page's subject, and
   * `FacetTile`/`ImageKitImage` both need the name the photograph would carry.
   */
  imageAlt: { en: string; ar: string };
  /** Buttons/links. Rendered in a wrap-safe row under the body. */
  actions?: React.ReactNode;
  /** Breadcrumbs, rendered above the eyebrow so the trail stays at the top. */
  breadcrumbs?: React.ReactNode;
  /** Anything page-specific below the actions — fact chips, a phone line, a note. */
  children?: React.ReactNode;
  /**
   * A page-specific visual beside the copy, not below it.
   *
   * Opting in turns the hero into two columns from `md` up — the copy on the
   * inline-start side, this centred in whatever the copy leaves, both
   * vertically centred against each other — and stacks them (copy first, this
   * centred underneath) below that. Leaving it undefined is not a variant of
   * that layout: the single-column branch below is the original markup
   * untouched, so the twenty-seven heroes that pass nothing render exactly as
   * before.
   *
   * `measure` still applies, but as an offset rather than as a cap: a
   * two-column hero needs the full container, so instead of narrowing it the
   * measure moves the copy column's inline-start edge onto the same grid line
   * the page's prose below starts on. See `measureOffsetClasses`.
   */
  aside?: React.ReactNode;
  /**
   * The picture's own caption, when the CMS supplied one.
   *
   * Rendered as a credit line at the foot of the hero rather than passed to
   * `ImageKitImage`: that component prints a caption inside its `<figure>`,
   * which here is absolutely positioned behind the copy, so the line would be
   * painted under the headline or clipped off the section entirely. Detail
   * pages whose lead image moved into the hero keep their provenance this way
   * — a caption that names a manufacturer or a source is not decoration, and
   * dropping it when the image was promoted would quietly remove an
   * attribution the asset was published under.
   */
  imageCaption?: { en: string; ar: string };
  size?: PageHeroSize;
  /**
   * Matches the hero's text column to the measure of the page beneath it.
   * Detail templates that render prose in a `max-w-3xl` column pass
   * `article`; legal pages, whose column is `max-w-2xl`, pass `narrow`; the
   * single-column form pages, whose column is `max-w-xl`, pass `form`.
   */
  measure?: PageHeroMeasure;
  /**
   * `start` lays the copy along the inline-start edge over the calm side of
   * the picture (the default, and what a wide photograph wants). `center` is
   * for hub pages whose hero is symmetric and whose copy is short.
   */
  align?: "start" | "center";
  /**
   * Opt in to the two-half composition described on `PageHeroMediaLayout`.
   *
   * Deliberately a per-page flag rather than a new default. Twenty-one routes
   * render this component, and every one of them is art-directed around a
   * full-bleed picture with copy over it; making `split` the default would
   * silently recompose all of them. It also degrades rather than half-renders:
   * `split` is honoured only when this page actually has an APPROVED
   * photograph to put in the half, because a split hero whose picture slot
   * holds a placeholder tile is a facet tile beside a facet tile with a seam
   * down the middle. Without one the hero falls back to `bleed` and looks
   * exactly as it does today.
   */
  mediaLayout?: PageHeroMediaLayout;
  /**
   * Which side of a `split` hero the photograph takes. Ignored otherwise.
   *
   * `end` (the default) is the composition the Aesthetics hub was art-directed
   * around, and it stays the default so adopting `split` elsewhere cannot
   * silently recompose that page.
   *
   * `start` is the concern-detail convention: the picture leads on the side
   * the language starts at — left in English, right in Arabic — so the reader
   * meets the subject before the words. Both sides resolve from
   * `inset-inline`, so neither needs a locale branch and neither mirrors by
   * accident.
   */
  mediaSide?: "start" | "end";
}

export function PageHero({
  locale,
  eyebrow,
  title,
  body,
  image,
  imageRole = "hero",
  seed,
  imageAlt,
  actions,
  breadcrumbs,
  children,
  aside,
  imageCaption,
  size = "standard",
  measure = "wide",
  align = "start",
  mediaLayout = "bleed",
  mediaSide = "end",
}: PageHeroProps) {
  const centered = align === "center";
  /**
   * See `mediaLayout`. The `approved` test is the whole of the degradation
   * rule: `ImageKitImage` renders real bytes for an approved asset and its
   * FacetTile stand-in for anything else, so an unapproved assignment would
   * put a placeholder tile into the picture half rather than a picture.
   */
  const split = mediaLayout === "split" && image?.status === "approved";
  /**
   * Which wash the picture gets.
   *
   * The one-sided (`hero-wash-inline`) wash lights only the inline-start ~40%
   * of the viewport, which is exactly where the copy sits in the `wide`
   * measure and nowhere near where it sits in the others: `article` centres a
   * 48rem column, so at 1440px its text runs from x≈360 to x≈1080 — straight
   * through the part of the one-sided wash that has already faded to 0.34 and
   * then 0.06. Secondary text at that opacity over a dark facet plane is a
   * contrast failure, not a design choice. Any measure that centres its column
   * therefore gets the symmetric wash, which holds ~0.8+ across the middle and
   * lets the picture through at both edges instead of one.
   */
  const symmetricWash = centered || measure !== "wide";

  const copy = (
    <>
      {breadcrumbs ? <div className="mb-5">{breadcrumbs}</div> : null}
      {/* The 600px cap applies only in the `wide` measure: it is what keeps
          a headline from running the full 1280px container and colliding
          with the bright side of the photograph. In the article/narrow
          measures the column is already the constraint, and capping again
          would pull the copy off the edge it was just aligned to. */}
      <div className={cn(centered ? "max-w-2xl" : measure === "wide" && "max-w-[600px]")}>
        {eyebrow ? (
          <p className="text-sm font-semibold tracking-wide text-primary uppercase">{eyebrow}</p>
        ) : null}
        {/* No top margin without an eyebrow: the breadcrumb row above
            already carries the gap, and adding a second one leaves the
            headline sitting low in heroes that have no eyebrow (most). */}
        <h1 className={cn("text-display-1 font-heading lg:text-display-1-lg", eyebrow && "mt-4")}>{title}</h1>
        {body ? <p className="mt-5 text-body-lg text-text-secondary">{body}</p> : null}
        {actions ? (
          <div className={cn("mt-8 flex flex-wrap gap-3", centered && "justify-center")}>{actions}</div>
        ) : null}
        {children}
      </div>
      {imageCaption?.[locale] ? (
        <p className={cn("mt-6 text-caption text-text-secondary", measure === "wide" && "max-w-[600px]", centered && "mx-auto")}>
          {imageCaption[locale]}
        </p>
      ) : null}
    </>
  );

  /**
   * THE SPLIT HERO'S PICTURE.
   *
   * One element, two layouts, deliberately — not two elements behind
   * breakpoint visibility classes. Rendering it twice would put two `<img>`
   * carrying the same alt text into the accessibility tree, and preload two
   * copies of the LCP image so the browser fetches both and shows one.
   *
   * Below `md` it is an ordinary block in the flow, stacked under the copy and
   * broken out of the Container's `px-4` so it runs edge to edge. Its
   * `aspect-[4/3]` is the asset's own ratio, so `object-cover` has nothing to
   * crop and the subject survives the narrow viewport whole — the one thing a
   * portrait hero cannot afford to get wrong on a phone.
   *
   * From `md` up it leaves the flow and takes the inline-end half of the
   * section: `inset-y-0` is what makes it the hero's FULL height rather than
   * the height of a picture sitting in a row, and `end-0` is what puts it on
   * the left in Arabic and the right in English without a locale branch.
   *
   * The z-index puts it above the readability wash (-20) and below the wash
   * under the fixed header (-10). Above the readability wash because that wash
   * exists to protect text and there is no text over this half — leaving the
   * picture under it would veil the photograph to hold up copy that is not
   * there. Below the header wash because the nav still crosses the top of it.
   */
  const splitPhoto =
    split && image ? (
      <div
        className={cn(
          "hero-split-media relative -mx-4 aspect-[4/3] w-[calc(100%+2rem)] overflow-hidden",
          "md:absolute md:inset-y-0 md:z-[-15] md:mx-0 md:aspect-auto md:w-[46%] lg:w-[48%]",
          mediaSide === "start" ? "md:start-0" : "md:end-0",
          /* Tells the mask which edge to dissolve. The class above only moves
             the picture; without this the fade stays keyed to an inline-END
             picture and eats the OUTER edge instead. */
          mediaSide === "start" && "hero-split-media--start",
        )}
      >
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
             covers half the viewport rather than all of it, and a `100vw`
             hint here would make the browser pick a candidate twice the size
             it can ever paint. */
          preload
          sizes="(min-width: 768px) 50vw, 100vw"
          className="h-full w-full"
        />
      </div>
    ) : null;

  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      {/* THE PICTURE. Full-bleed, behind everything, never clipped into a
          card — a hero image that sits in a rounded box beside the text is a
          figure, not a hero. */}
      <div className="absolute inset-0 -z-30">
        {/* In the split layout this layer is the BACKGROUND, not the picture:
            the facet composition keeps the whole section, the photograph is
            laid over half of it by `splitPhoto`, and the mask dissolves the
            join. Decorative here because the photograph carries the
            accessible name — two elements naming the same subject would say
            it twice. */}
        {split ? (
          <FacetTile role={imageRole} seed={seed} decorative className="h-full w-full" />
        ) : image ? (
          <ImageKitImage
            path={image.path}
            preset="hero"
            role={image.role}
            status={image.status}
            alt={cmsAlt(image) ?? imageAlt}
            locale={locale}
            width={image.width}
            height={image.height}
            /* This page's LCP image. `100vw` because it is full-bleed; a
               narrower hint would make the browser pick a candidate too small
               to fill the section on a wide screen. */
            preload
            sizes="100vw"
            className="h-full w-full"
          />
        ) : (
          <FacetTile role={imageRole} seed={seed} alt={imageAlt[locale]} className="h-full w-full" />
        )}
      </div>

      {/* READABILITY WASH — light, never dark (see globals.css). Two
          directions when the copy sits against one edge, because that copy is
          stacked over the picture on narrow screens and beside it on wide
          ones; one symmetric wash whenever the copy sits in a centred column. */}
      {/* The split hero's copy sits against the inline-start edge at every
          width where the two halves exist, so it wants the one-sided wash from
          `md` rather than from `lg` — at `md` the ordinary hero is still
          stacked and the symmetric/block wash is the right one, but this one
          is already two columns. */}
      {split ? (
        <>
          <div aria-hidden="true" className="hero-wash-block absolute inset-0 -z-20 md:hidden" />
          {mediaSide === "start" ? (
            /* Copy is on the inline-END half here, which the one-sided ramp
               does not reach -- see .hero-wash-panel in globals.css. */
            <div
              aria-hidden="true"
              className="hero-wash-panel absolute inset-y-0 end-0 -z-20 hidden md:block md:start-[46%] lg:start-[48%]"
            />
          ) : (
            <div aria-hidden="true" className="hero-wash-inline absolute inset-0 -z-20 hidden md:block" />
          )}
        </>
      ) : symmetricWash ? (
        <div aria-hidden="true" className="hero-wash-center absolute inset-0 -z-20" />
      ) : (
        <>
          <div aria-hidden="true" className="hero-wash-block absolute inset-0 -z-20 lg:hidden" />
          <div aria-hidden="true" className="hero-wash-inline absolute inset-0 -z-20 hidden lg:block" />
        </>
      )}
      {/* The top and bottom edge fades sit at -z-10, ABOVE the split hero's
          picture at -z-15, so in a split layout they would lay a 62%-white
          band across the top of the photograph and fade its foot into the page
          -- a veil over the one thing the split composition exists to show.
          From `md` up (where the picture has a half of its own) they are
          therefore pulled back to the copy half. They still run edge to edge
          in the `bleed` layout, where copy is over the picture and the fades
          are what make that copy and the section seam readable, and below `md`
          in split, where the picture is an in-flow block painting above them.

          Nothing is lost at the top: only the homepage floats a transparent
          header, and it does not use this component. Every route that does
          rests the header on an opaque `bg-background` (Header.tsx), so the
          nav needs no wash beneath it here. */}
      <div
        aria-hidden="true"
        className={cn(
          "hero-wash-top absolute inset-x-0 top-0 -z-10 h-20",
          split && (mediaSide === "start" ? "md:start-[46%] lg:start-[48%]" : "md:end-[46%] lg:end-[48%]"),
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "hero-wash-bottom absolute inset-x-0 bottom-0 -z-10 h-20",
          split && (mediaSide === "start" ? "md:start-[46%] lg:start-[48%]" : "md:end-[46%] lg:end-[48%]"),
        )}
      />

      <Container
        className={cn(
          "flex flex-col justify-center",
          sizeClasses[size],
          !aside && !split && measureClasses[measure],
          centered && !aside && !split && "items-center text-center",
        )}
      >
        {split ? (
          /* `md:block` rather than a second flex row: from `md` up the
             picture is out of the flow, so the only thing left to lay out is
             the copy column, and a flex row with one child would centre it. */
          <div className="flex flex-col gap-10 md:block">
            <div className={cn("md:w-[54%] lg:w-[52%]", mediaSide === "start" && "md:ms-auto")}>{copy}</div>
            {splitPhoto}
          </div>
        ) : aside ? (
          <div
            className={cn(
              "flex flex-col gap-10 md:flex-row md:items-center md:gap-8 lg:gap-12",
              measureOffsetClasses[measure],
            )}
          >
            {/* The copy takes a fixed share of what the offset leaves and is
                the only column allowed to shrink; the visual's column is
                content-sized (`basis-auto` + `shrink-0`) and absorbs the rest
                by growing. That ordering is what guarantees no overflow: if a
                wide viewport's visual and this column ever cannot both fit,
                the copy gives up the width rather than the visual spilling
                past the container.

                `min-w-min` is the floor on that shrinking — the column never
                goes narrower than its own longest unbreakable run. Without it
                a headline holding a non-breaking brand name overflowed its
                column between `lg` and ~1150px, where the display size steps
                up to 3.5rem while this column is still at its narrowest. The
                visual's column absorbs the difference, which it has room for:
                the floor only binds at widths where the lock-up is at its
                smallest. */}
            <div className="md:w-[42%] md:min-w-min">{copy}</div>
            {/* Growing rather than a fixed percentage is what keeps the visual
                centred in the leftover space instead of pinned beside the
                copy or against the container's inline-end edge. */}
            <div className="flex justify-center md:shrink-0 md:grow">{aside}</div>
          </div>
        ) : (
          copy
        )}
      </Container>
    </section>
  );
}
