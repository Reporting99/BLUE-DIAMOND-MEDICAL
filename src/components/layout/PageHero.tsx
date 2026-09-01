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

const measureClasses: Record<PageHeroMeasure, string> = {
  wide: "",
  article: "max-w-3xl",
  narrow: "max-w-2xl",
  /** The single-column form pages (consultation), whose column is `max-w-xl`. */
  form: "max-w-xl",
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
  imageCaption,
  size = "standard",
  measure = "wide",
  align = "start",
}: PageHeroProps) {
  const centered = align === "center";
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

  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      {/* THE PICTURE. Full-bleed, behind everything, never clipped into a
          card — a hero image that sits in a rounded box beside the text is a
          figure, not a hero. */}
      <div className="absolute inset-0 -z-30">
        {image ? (
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
      {symmetricWash ? (
        <div aria-hidden="true" className="hero-wash-center absolute inset-0 -z-20" />
      ) : (
        <>
          <div aria-hidden="true" className="hero-wash-block absolute inset-0 -z-20 lg:hidden" />
          <div aria-hidden="true" className="hero-wash-inline absolute inset-0 -z-20 hidden lg:block" />
        </>
      )}
      <div aria-hidden="true" className="hero-wash-top absolute inset-x-0 top-0 -z-10 h-20" />
      <div aria-hidden="true" className="hero-wash-bottom absolute inset-x-0 bottom-0 -z-10 h-20" />

      <Container
        className={cn(
          "flex flex-col justify-center",
          sizeClasses[size],
          measureClasses[measure],
          centered && "items-center text-center",
        )}
      >
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
      </Container>
    </section>
  );
}
