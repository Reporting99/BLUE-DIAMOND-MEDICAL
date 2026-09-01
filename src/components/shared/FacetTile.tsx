/**
 * Code-generated abstract visual used wherever a required image is missing or
 * not yet approved — most importantly doctor portraits (never a stock photo,
 * generated face, or silhouette; see docs/UI_UX_FOUNDATION.md §18).
 *
 * Built from the signature "Facet Line" motif: flat brand-blue planes meeting
 * at shallow diagonals, echoing the logo's facet construction without
 * reproducing the logo itself. Pure SVG, no raster asset, so it costs nothing
 * to render at any size and never needs an ImageKit upload.
 *
 * This is a DESIGNED FALLBACK, not a placeholder swatch. Three things carry
 * that distinction, all of them cheap:
 *
 *  - a graded background wash rather than one flat fill, so the tile has a
 *    light direction like a photograph does;
 *  - a soft highlight where that light lands, and a hairline catching the
 *    dominant facet seam;
 *  - four compositions (src/lib/media/facet-tile-art.ts) selected by a
 *    deterministic `seed`, so a grid of eight unphotographed treatments reads
 *    as a set of eight designed tiles instead of one missing image repeated
 *    eight times.
 *
 * Colour still comes only from `imageRoleTint` — the approved brand
 * primitives, one triple per role — so a technology tile and a product tile
 * differ in hue exactly as much as the palette allows and no more.
 */

import { imageRoleTint } from "@/lib/media/facet-tile-tints";
import { facetTileArtColors, facetTileVariantFor, facetTileVariantIndex } from "@/lib/media/facet-tile-art";
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
  /**
   * Picks which of the four compositions this tile draws. Pass a card's index
   * or an entity id in any listing that renders several tiles at once; omit it
   * for a lone tile, which then gets the composition chosen for its role.
   */
  seed?: string | number;
}

export function FacetTile({ role = "doctor", className, alt, decorative, seed }: FacetTileProps) {
  const tint = imageRoleTint[role];
  const variant = facetTileVariantFor(role, seed);
  const tone = { mid: tint.mid, deep: tint.deep };

  /**
   * Gradient ids are derived from role + variant rather than randomised or
   * generated with `useId`. Two reasons, both hard requirements here: this is
   * a Server Component, so it has no hooks to call; and two tiles with the
   * same role and variant define byte-identical gradients, so a duplicate id
   * in the document resolves to an identical paint. Randomising instead would
   * mean a different id on the server than on the client — a hydration
   * mismatch on a component that renders dozens of times per page.
   */
  const key = `${role}-${facetTileVariantIndex(variant)}`;

  return (
    <svg
      viewBox="0 0 400 500"
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? "true" : undefined}
      aria-label={decorative ? undefined : alt}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* The ground: the role's own base tint, lifted at the top and settled
            toward its mid tone at the bottom. One gradient does the work a
            flat fill cannot — it gives the tile a direction. */}
        <linearGradient id={`facet-bg-${key}`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor={facetTileArtColors.glow} />
          <stop offset="45%" stopColor={tint.base} />
          <stop offset="100%" stopColor={tint.mid} stopOpacity="0.45" />
        </linearGradient>
        {/* Where the light lands. Kept wide and weak: this should read as an
            open, softly lit surface, never as a spotlight. */}
        <radialGradient id={`facet-glow-${key}`}>
          <stop offset="0%" stopColor={facetTileArtColors.glow} stopOpacity="0.85" />
          <stop offset="100%" stopColor={facetTileArtColors.glow} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="500" fill={`url(#facet-bg-${key})`} />
      <circle
        cx={variant.glow.cx}
        cy={variant.glow.cy}
        r={variant.glow.r}
        fill={`url(#facet-glow-${key})`}
      />

      {variant.planes.map((plane, index) => (
        <polygon key={index} points={plane.points} fill={tone[plane.tone]} opacity={plane.opacity} />
      ))}

      {/* The lit edge of the dominant seam. A single hairline at low opacity —
          the detail that makes the planes read as folded rather than stacked. */}
      <line
        x1={variant.seam[0]}
        y1={variant.seam[1]}
        x2={variant.seam[2]}
        y2={variant.seam[3]}
        stroke={facetTileArtColors.glow}
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
    </svg>
  );
}
