/**
 * Code-generated abstract placeholder used wherever a required image is
 * missing or not yet approved — most importantly doctor portraits (never a
 * stock photo, generated face, or silhouette; see docs/UI_UX_FOUNDATION.md §18).
 *
 * Built from the signature "Facet Line" motif: 2-3 flat brand-blue planes
 * meeting at diagonal seams, echoing the logo's facet construction without
 * reproducing the logo itself. Pure SVG, no raster asset, so it costs
 * nothing to render at any size and never needs an ImageKit upload.
 */

import { imageRoleTint } from "./facet-tile-tints";
import type { ImageRole } from "@/types/media";

interface FacetTileProps {
  role?: ImageRole;
  className?: string;
  /**
   * This tile stands in for a real photo, so it needs the same accessible
   * name that photo's alt text would carry — axe-core's svg-img-alt rule
   * caught this missing in an earlier pass of this build. Pass `alt` for
   * meaningful content; pass `decorative` instead when the surrounding
   * text already conveys the same information.
   */
  alt?: string;
  decorative?: boolean;
}

export function FacetTile({ role = "doctor", className, alt, decorative }: FacetTileProps) {
  const tint = imageRoleTint[role];

  return (
    <svg
      viewBox="0 0 400 500"
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : alt}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="400" height="500" fill={tint.base} />
      <polygon points="0,0 400,0 400,220 0,340" fill={tint.mid} opacity="0.55" />
      <polygon points="400,500 0,500 0,300 400,180" fill={tint.deep} opacity="0.65" />
      <polygon points="400,0 400,500 260,500 400,140" fill={tint.deep} opacity="0.3" />
    </svg>
  );
}
