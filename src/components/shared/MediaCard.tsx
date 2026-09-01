import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { FacetTile } from "@/components/shared/FacetTile";
import { cmsAlt } from "@/lib/feelstack/media-slots";
import { deviceMediaFrame, deviceMediaPadding } from "@/components/shared/device-media-frame";
import type { ImagePresetKey } from "@/config/imagekit";
import type { ImageKitAsset, ImageRole } from "@/types/media";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/**
 * The standard picture-led link card: image, title, one-line summary, a
 * directional CTA.
 *
 * Every listing on this site had grown its own version of this — a bordered
 * box with a heading and a paragraph, no image, on the medical hub, the
 * treatments index, the technologies index, the concerns index, the health
 * hub. They were consistent only in being empty. One component makes them
 * consistent in being full, and fixes the image ratio in one place: cards
 * across two different listings now crop their pictures identically, which is
 * the difference between a site that looks designed and one that looks
 * assembled.
 *
 * THE IMAGE IS NEVER OPTIONAL. `image` is — the CMS assignment usually has not
 * been made yet — but the *slot* is not. With no assignment the card draws a
 * `FacetTile` seeded from `seed`, so a grid of six unphotographed services
 * shows six different brand-blue facet compositions rather than six blank
 * boxes or six copies of one. That is the fallback strategy this build
 * committed to: a designed stand-in, never a grey rectangle, and never a stock
 * photograph of somebody else's clinic.
 */

/** Fixed crops, so two different listings never disagree about card shape. */
const aspectClasses = {
  wide: "aspect-[16/10]",
  photo: "aspect-[4/3]",
  portrait: "aspect-[4/5]",
} as const;

export interface MediaCardProps {
  href: string;
  title: string;
  summary?: string;
  /** Resolved CMS assignment for this entity, when one exists. */
  image?: ImageKitAsset;
  /** Tint/composition for the fallback, and transformation preset for a real asset. */
  imageRole?: ImageRole;
  preset?: ImagePresetKey;
  /** Accessible name for the visual — what the photograph of this entity would carry. */
  imageAlt: { en: string; ar: string };
  /** Varies the fallback composition between sibling cards. Usually the entity id. */
  seed?: string | number;
  locale: Locale;
  /** Wording of the CTA row. Omit to leave the card without one. */
  ctaLabel?: string;
  /** Small line above the title — a category, a price, a session count. */
  eyebrow?: string;
  /** Anything extra between the summary and the CTA. */
  children?: React.ReactNode;
  aspect?: keyof typeof aspectClasses;
  /**
   * `cover` (default) crops the asset to the card's frame. `contain` fits the
   * whole asset inside it on a light mat -- for cards whose subject is a
   * single object whose silhouette identifies it, where a crop removes the
   * thing being shown. See `device-media-frame.ts`.
   */
  mediaFit?: "cover" | "contain";
  /** Stagger index within its grid. Reset per row by the caller (`i % 4`). */
  delay?: number;
  /** `sizes` for the real asset. Defaults to a three-across desktop grid. */
  sizes?: string;
  /**
   * Heading level for the card title. `h3` suits a grid that sits under a
   * section `h2`; index pages whose cards ARE the top-level content pass `h2`
   * so the document never jumps from `h1` straight to `h3` (axe heading-order).
   */
  headingLevel?: "h2" | "h3";
  className?: string;
}

export function MediaCard({
  href,
  title,
  summary,
  image,
  imageRole = "service",
  preset = "service",
  imageAlt,
  seed,
  locale,
  ctaLabel,
  eyebrow,
  children,
  aspect = "wide",
  mediaFit = "cover",
  delay = 0,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  headingLevel: Heading = "h3",
  className,
}: MediaCardProps) {
  return (
    <Link
      href={href}
      data-reveal="up"
      data-reveal-delay={String(delay % 4)}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background transition-[border-color,box-shadow,transform] duration-[var(--motion-normal)] ease-[var(--motion-ease)] hover:border-primary hover:shadow-[0_10px_30px_rgba(29,86,120,0.10)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          aspectClasses[aspect],
          mediaFit === "contain" && cn(deviceMediaFrame, deviceMediaPadding),
        )}
      >
        {image ? (
          <ImageKitImage
            path={image.path}
            preset={preset}
            role={image.role}
            status={image.status}
            alt={cmsAlt(image) ?? imageAlt}
            locale={locale}
            width={image.width}
            height={image.height}
            sizes={sizes}
            fit={mediaFit}
            /* The lift on hover is on the picture, not the card: moving the
               whole card shifts the text it sits above, and text that moves
               under the cursor is harder to read, not more alive.

               A contained asset does not take the zoom. `object-contain` fits
               the asset to the frame, so scaling it up pushes its own edges
               past the mat and clips the silhouette on hover -- reintroducing,
               for a third of a second at a time, exactly the crop this mode
               exists to avoid. The card keeps its border and shadow response,
               so the hover still reads. */
            className={cn(
              "h-full w-full",
              mediaFit === "cover" &&
                "transition-transform duration-[600ms] ease-[var(--motion-ease)] group-hover:scale-[1.04]",
            )}
          />
        ) : (
          <FacetTile
            role={imageRole}
            seed={seed}
            alt={imageAlt[locale]}
            className="h-full w-full transition-transform duration-[600ms] ease-[var(--motion-ease)] group-hover:scale-[1.04]"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.08em] text-primary uppercase">{eyebrow}</p>
        ) : null}
        <Heading className={cn("font-heading text-h4", eyebrow && "mt-2")}>{title}</Heading>
        {summary ? <p className="mt-2 text-sm text-text-secondary">{summary}</p> : null}
        {children}
        {/* Pushes the CTA to the card's bottom edge, so a row of cards whose
            summaries differ in length still shares one CTA baseline. */}
        <span aria-hidden="true" className="mt-auto" />
        {ctaLabel ? (
          <span className="inline-flex items-center gap-1 pt-4 text-sm font-medium text-primary group-hover:text-primary-hover">
            {ctaLabel}
            <ArrowRight
              className="size-3.5 transition-transform duration-[var(--motion-normal)] ease-[var(--motion-ease)] group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        ) : null}
      </div>
    </Link>
  );
}
