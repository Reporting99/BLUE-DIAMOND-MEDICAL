import { Container } from "@/components/layout/Container";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { FacetTile } from "@/components/shared/FacetTile";
import type { PageHeroImageFocus } from "@/components/layout/PageHero";
import { resolveAlt } from "@/lib/feelstack/media-slots";
import type { ImageKitAsset, ImageRole } from "@/types/media";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * THE Aesthetics hero. One component, one composition, every route under
 * /aesthetics (plus /botox, which is an Aesthetics route wearing its own URL).
 *
 * WHY IT EXISTS SEPARATELY FROM PageHero. The section brief is not "make the
 * Aesthetics heroes similar"; it is that the hub, the three listings, the nine
 * treatments, the nine concerns and every technology page must be the SAME
 * template with only three variables — the breadcrumb, the words, and the
 * picture. `PageHero` cannot promise that, for two reasons that are features
 * there and defects here:
 *
 *  1. its `split` layout is CONDITIONAL — `mediaLayout="split"` silently falls
 *     back to the full-bleed composition unless the page's CMS assignment is
 *     an `approved` photograph. Across twenty-odd Aesthetics routes, whose
 *     photography is approved a few at a time, that produced two different
 *     heroes on neighbouring pages and would keep doing so with every publish.
 *  2. it is the sitewide hero, shared with Medical, the shop, legal and the
 *     rest. Warming its background or pinning its layout would recompose those
 *     twenty-seven routes too, which the brief explicitly forbids.
 *
 * So the split composition is reproduced here — the same grid, gaps, padding,
 * aspect, min-heights and type scale as `PageHero`'s split branch, deliberately
 * class-for-class — and made UNCONDITIONAL. A page with no approved photograph
 * gets the warm `FacetTile` in the picture half at exactly the picture's size,
 * so the hero's height, proportions and geometry never depend on the state of
 * the media library.
 *
 * WHAT MAY DIFFER BETWEEN PAGES. `breadcrumbs`, `title`/`body`/`actions`, and
 * `image`. Nothing else is a prop, on purpose: there is no size, no measure, no
 * alignment and no layout switch to get wrong, because every one of those would
 * be a way for two Aesthetics pages to stop matching.
 *
 * DIRECTION. Copy is first in the DOM, picture second, in one grid — so English
 * LTR lays the copy left and the picture right, Arabic RTL mirrors both without
 * a locale branch, and the stacked mobile order reads copy-then-picture in
 * both. Same rule as PageHero's split branch, same reasons.
 *
 * NOT REVEAL-ANIMATED. Above the fold on every route it appears on, and its
 * `<h1>` and image are the LCP candidates — docs/UI_UX_FOUNDATION.md §9-10.
 */
export interface AestheticsHeroProps {
  locale: Locale;
  /** Breadcrumb trail. Rendered at the top of the copy column. */
  breadcrumbs?: React.ReactNode;
  title: string;
  /** One or two sentences. Longer copy belongs in the first section. */
  body?: string;
  /** This page's resolved CMS hero assignment, when it has one. */
  image?: ImageKitAsset;
  /**
   * Accessible name for the visual — never optional. Whether the half holds
   * the photograph or its stand-in, it is naming this page's subject and the
   * CMS alt may be absent.
   */
  imageAlt: { en: string; ar: string };
  /** Picks the stand-in's composition so sibling pages differ. Usually the route id. */
  seed?: string | number;
  /** Which facet composition the stand-in draws from. Colour is warm regardless. */
  imageRole?: ImageRole;
  /** Where a cover-cropped photograph is anchored. Defaults to centre. */
  imageFocus?: PageHeroImageFocus;
  /** The CMS caption, when the asset carries one — an attribution, not decoration. */
  imageCaption?: { en: string; ar: string };
  /** The page's CTA. */
  actions?: React.ReactNode;
  /** Anything page-specific under the actions (a manufacturer line, a fact chip). */
  children?: React.ReactNode;
}

/** Mirrors `PageHero`'s `focusClasses`: literal strings, so Tailwind emits them. */
const focusClasses: Record<PageHeroImageFocus, string> = {
  center: "",
  top: "[&>img]:object-top",
  bottom: "[&>img]:object-bottom",
  left: "[&>img]:object-left",
  right: "[&>img]:object-right",
  "top-right": "[&>img]:object-[85%_20%]",
  "top-left": "[&>img]:object-[15%_20%]",
};

/**
 * The warm geometric ground, drawn identically on every Aesthetics page.
 *
 * Hand-written rather than a seeded `FacetTile`: the brief requires the
 * background shapes, their direction, their overlap and their opacity to be the
 * same on all of them, and a seeded composition is by definition not. It keeps
 * the Facet Line motif — flat planes meeting at shallow diagonals — in the
 * section's beige/taupe rather than in brand blue, and it runs the full width
 * so the planes carry across the seam behind the picture half exactly as they
 * do behind the copy.
 *
 * `preserveAspectRatio="none"` because this is atmosphere, not an image: it
 * stretches to whatever the hero's own content makes the section, and the
 * planes are shallow enough that stretching reads as a wider light rather than
 * as distortion.
 */
function AestheticsHeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[var(--aesthetics-hero-bg)]">
      <svg viewBox="0 0 1440 520" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="aesthetics-hero-ground" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="var(--aesthetics-hero-bg)" />
            <stop offset="100%" stopColor="var(--aesthetics-facet-1)" stopOpacity="0.85" />
          </linearGradient>
          <radialGradient id="aesthetics-hero-glow">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          {/* The join. Every Aesthetics page continues onto the white
              --background below this section, and a beige plane meeting white
              at the hero's border draws a second line under the first. The
              last few percent of the backdrop therefore settle back to the
              page's own ground, so the border-b stays the only edge. */}
          <linearGradient id="aesthetics-hero-join" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect width="1440" height="520" fill="url(#aesthetics-hero-ground)" />
        <circle cx="1080" cy="90" r="520" fill="url(#aesthetics-hero-glow)" />
        <polygon points="0,520 0,250 560,520" fill="var(--aesthetics-facet-2)" opacity="0.55" />
        <polygon points="0,520 380,300 900,520" fill="var(--aesthetics-facet-1)" opacity="0.7" />
        <polygon points="1440,0 1440,300 820,0" fill="var(--aesthetics-facet-1)" opacity="0.6" />
        <polygon points="1440,140 1440,520 1010,520" fill="var(--aesthetics-facet-3)" opacity="0.28" />
        <line x1="0" y1="250" x2="560" y2="520" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="1.5" />
        <rect y="430" width="1440" height="90" fill="url(#aesthetics-hero-join)" />
      </svg>
    </div>
  );
}

export function AestheticsHero({
  locale,
  breadcrumbs,
  title,
  body,
  image,
  imageAlt,
  seed,
  imageRole = "treatment",
  imageFocus = "center",
  imageCaption,
  actions,
  children,
}: AestheticsHeroProps) {
  /**
   * Only an APPROVED asset is a photograph; anything else is an assignment the
   * CMS has not cleared, and `ImageKitImage` would draw its own brand-blue
   * stand-in for it. The half is filled either way and at the same size — this
   * branch decides what is IN it, never how big it is.
   */
  const photograph = image?.status === "approved" ? image : undefined;

  return (
    <section
      data-hero="aesthetics"
      className="relative isolate overflow-hidden border-b border-border md:min-h-[380px] lg:min-h-[440px]"
    >
      <AestheticsHeroBackdrop />

      {/* The copy half. It sits in the Container so its measure, gutters and
          max width match every other section on the page; from `md` up it is
          held to the first column of the split and the second column is left
          empty, because the picture is NOT in the grid -- see below. */}
      <Container className="grid items-stretch gap-5 pt-10 pb-2 md:grid-cols-2 md:gap-8 lg:gap-12 lg:pt-14 lg:pb-14">
        <div data-hero-col="copy" className="flex flex-col justify-center">
          {breadcrumbs ? <div className="mb-4">{breadcrumbs}</div> : null}
          <h1 className="text-display-1 font-heading lg:text-display-1-lg">{title}</h1>
          {body ? (
            <p data-hero-body className="mt-4 text-body-lg text-text-secondary">
              {body}
            </p>
          ) : null}
          {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
          {children}
          {imageCaption?.[locale] ? (
            <p className="mt-4 text-caption text-text-secondary">{imageCaption[locale]}</p>
          ) : null}
        </div>
      </Container>

      {/*
        The picture half, and the whole point of this component: a COMPLETE
        HALF-PANEL, not a card sitting inside one.

        It is deliberately outside the Container and taken out of flow from
        `md` up -- `absolute inset-y-0 end-0 w-1/2` -- because the Container's
        gutter and max-width are exactly what used to inset the image and leave
        beige showing above, below and outside it. Out of flow, the panel spans
        the hero's full height (top edge to bottom edge, whatever the copy makes
        it) and runs off the outer page edge, with no margin, no padding, no
        radius, no shadow and no wrapper of its own.

        `end-0` rather than `right-0` is the RTL mirror: English lays the copy
        left and the panel right, Arabic swaps both, with no locale branch --
        the same rule the copy grid follows.

        Below `md` it stays in flow, directly after the copy, still full-bleed:
        it is a child of the section, so it spans the viewport with no side
        gutter and no rounding.
      */}
      <div
        data-hero-col="media"
        className="relative aspect-[4/3] w-full overflow-hidden md:absolute md:inset-y-0 md:end-0 md:aspect-auto md:h-full md:w-1/2"
      >
        {photograph ? (
          <ImageKitImage
            path={photograph.path}
            version={photograph.id}
            preset="hero"
            role={photograph.role}
            status={photograph.status}
            /* The CMS alt wins; the page's own is the fallback. The picture
               is the only element naming this subject, so never decorative. */
            alt={resolveAlt(photograph, imageAlt)}
            locale={locale}
            width={photograph.width}
            height={photograph.height}
            /* The LCP element on these routes, occupying half the viewport
               from `md` up -- so the hint says half, not 100vw. */
            preload
            sizes="(min-width: 768px) 50vw, 100vw"
            className={cn("h-full w-full", focusClasses[imageFocus])}
          />
        ) : (
          <FacetTile
            role={imageRole}
            seed={seed}
            palette="warm"
            alt={imageAlt[locale]}
            className="h-full w-full"
          />
        )}
      </div>
    </section>
  );
}
