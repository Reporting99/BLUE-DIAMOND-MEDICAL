import { Image as ImageKitSdkImage } from "@imagekit/next";
import { imagekitIsConfigured, imagePresets, type ImagePresetKey } from "@/config/imagekit";
import type { ImageRole, ImageStatus, Locale } from "@/types/media";
import { FacetTile } from "./FacetTile";
import { cn } from "@/lib/utils";

interface ImageKitImageProps {
  /** ImageKit path, e.g. "/doctors/farhat.jpg". Ignored when status !== "approved". */
  path: string;
  preset: ImagePresetKey;
  role: ImageRole;
  status: ImageStatus;
  alt: { en: string; ar: string };
  locale: Locale;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  /**
   * How the asset meets its frame.
   *
   * `cover` (default, and every existing caller's behaviour) fills the frame
   * and crops the overflow -- correct for scene photography, where the frame
   * is a window.
   *
   * `contain` fits the whole asset inside the frame and leaves the remainder
   * as mat -- correct for a photograph OF AN OBJECT, where the silhouette is
   * the identity and a crop removes the thing being identified. See
   * `device-media-frame.ts`.
   */
  fit?: "cover" | "contain";
  /** Replaces the deprecated `priority` prop — see Next.js 16 image API. */
  preload?: boolean;
  caption?: { en: string; ar: string };
  /**
   * Forwarded to the FacetTile fallback so a listing that renders several
   * unphotographed entities draws a different facet composition per card
   * rather than the same one repeated. Ignored once a real asset is
   * approved — see FacetTile.
   */
  seed?: string | number;
}

/**
 * Single entry point for every production image on the site. Page/section
 * components must never construct transformation URLs or reach for
 * next/image directly — see docs/UI_UX_FOUNDATION.md §8/§18. Renders
 * through the official @imagekit/next SDK's <Image> component (brief §8),
 * which wraps next/image and applies the ImageKit transformation pipeline.
 *
 * Renders the real ImageKit-delivered asset only when ImageKit is
 * configured AND the asset's approval status is "approved". Every other
 * state (pending/temporary/disabled, or no ImageKit endpoint configured at
 * all) renders the FacetTile abstract placeholder — never a stock photo,
 * generated face, or unrelated local image.
 */
export function ImageKitImage({
  path,
  preset,
  role,
  status,
  alt,
  locale,
  width,
  height,
  className,
  sizes,
  preload,
  caption,
  seed,
  fit = "cover",
}: ImageKitImageProps) {
  const canRenderReal = imagekitIsConfigured && status === "approved";
  const altText = alt[locale];
  const captionText = caption?.[locale];

  return (
    <figure
      className={cn(
        "relative overflow-hidden",
        /* `bg-surface` is a ground for a COVER image: the picture fills the
           figure, so the colour is never actually seen and only prevents a
           flash of nothing while it decodes. Under `contain` the figure is
           larger than the picture by definition, so that same colour becomes
           the visible mat -- painting over whatever ground the caller chose
           and, for a photo with its own white studio background, drawing
           exactly the rectangle-inside-a-frame seam the contained treatment
           exists to remove. Contained images therefore let the caller's
           background show through. */
        fit === "contain" ? "bg-transparent" : "bg-surface",
        className,
      )}
    >
      {canRenderReal ? (
        <ImageKitSdkImage
          src={path}
          transformation={[imagePresets[preset]]}
          alt={altText}
          width={width}
          height={height}
          sizes={sizes}
          preload={preload}
          className={cn(
            "h-full w-full",
            fit === "contain" ? "object-contain" : "object-cover",
          )}
        />
      ) : (
        <FacetTile role={role} alt={altText} seed={seed} className="h-full w-full" />
      )}
      {captionText ? (
        <figcaption className="mt-2 text-caption text-text-secondary">{captionText}</figcaption>
      ) : null}
    </figure>
  );
}
