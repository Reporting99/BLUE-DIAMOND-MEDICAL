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
}: ImageKitImageProps) {
  const canRenderReal = imagekitIsConfigured && status === "approved";
  const altText = alt[locale];
  const captionText = caption?.[locale];

  return (
    <figure className={cn("relative overflow-hidden bg-surface", className)}>
      {canRenderReal ? (
        <ImageKitSdkImage
          src={path}
          transformation={[imagePresets[preset]]}
          alt={altText}
          width={width}
          height={height}
          sizes={sizes}
          preload={preload}
          className="h-full w-full object-cover"
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
