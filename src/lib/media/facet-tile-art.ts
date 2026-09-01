import type { ImageRole } from "@/types/media";

/**
 * Geometry and colour for the FacetTile branded fallback visual.
 *
 * Lives here rather than in `FacetTile.tsx` for the same reason
 * `facet-tile-tints.ts` does: docs/UI_UX_FOUNDATION.md §2 forbids raw hex in
 * `.tsx` files, and the same rule is worth extending to the raw coordinate
 * soup a hand-built SVG otherwise scatters through a component. The component
 * stays a readable description of *what* is drawn; this module holds *where*.
 *
 * WHY VARIANTS EXIST. Every image on this site that has not yet been uploaded
 * and approved renders a FacetTile (see `ImageKitImage`), so a listing of eight
 * treatments renders eight of them side by side. One fixed composition repeated
 * eight times reads as a missing image repeated eight times — the "looks like a
 * placeholder" failure the fallback strategy exists to avoid. Four compositions
 * chosen by a caller-supplied seed make a grid read as a designed set instead.
 * The seed is deterministic, so a given card draws the same tile on the server
 * and the client and across rebuilds — no hydration mismatch, no flicker.
 */

/** Colours used by the tile's shared background wash, glow and hairlines. */
export const facetTileArtColors = {
  /** Highlight for the soft corner glow. Always white — it lifts the base
   *  tint toward light without introducing a fifth blue. */
  glow: "#FFFFFF",
} as const;

/**
 * One composition: the facet planes, in paint order, plus the hairline seam
 * that catches the light along the dominant edge.
 *
 * `opacity` is per-plane rather than baked into the colour so the same three
 * brand tints (base/mid/deep from `imageRoleTint`) produce depth without any
 * new colour entering the system.
 */
export interface FacetTileVariant {
  /** Facet planes, painted in order over the background wash. */
  planes: Array<{ points: string; tone: "mid" | "deep"; opacity: number }>;
  /** Two-point hairline (x1,y1,x2,y2) tracing the dominant facet seam. */
  seam: [number, number, number, number];
  /** Centre of the soft radial highlight, in viewBox units. */
  glow: { cx: number; cy: number; r: number };
}

/**
 * Four compositions on the same 400×500 canvas, all built from the brand's
 * facet construction: flat planes meeting at shallow diagonals, never curves,
 * never a gradient mesh. They differ in where the light falls and which way
 * the planes lean, which is enough to break repetition in a grid while
 * keeping every tile recognisably part of one family.
 */
export const facetTileVariants: FacetTileVariant[] = [
  // 0 — light from the upper right, planes leaning down-left. The calmest of
  //     the four; the default, and what a lone tile on a page gets.
  {
    planes: [
      { points: "0,0 400,0 400,190 0,330", tone: "mid", opacity: 0.5 },
      { points: "0,500 400,500 400,165 0,315", tone: "deep", opacity: 0.62 },
      { points: "400,0 400,500 250,500 400,120", tone: "deep", opacity: 0.26 },
    ],
    seam: [0, 322, 400, 178],
    glow: { cx: 330, cy: 90, r: 260 },
  },
  // 1 — mirrored lean, light low and inboard. Reads as the same room
  //     photographed from the other side.
  {
    planes: [
      { points: "0,0 400,0 400,300 0,170", tone: "mid", opacity: 0.46 },
      { points: "0,500 400,500 400,330 0,195", tone: "deep", opacity: 0.6 },
      { points: "0,0 0,500 140,500 0,140", tone: "deep", opacity: 0.24 },
    ],
    seam: [0, 182, 400, 315],
    glow: { cx: 90, cy: 380, r: 250 },
  },
  // 2 — a wide chevron, the most structural of the four. Suits technology and
  //     device contexts, where the subject itself is geometric.
  {
    planes: [
      { points: "0,0 400,0 400,120 200,250 0,120", tone: "mid", opacity: 0.44 },
      { points: "0,150 200,285 400,150 400,500 0,500", tone: "deep", opacity: 0.55 },
      { points: "200,250 400,120 400,215 200,345", tone: "deep", opacity: 0.3 },
    ],
    seam: [0, 135, 200, 268],
    glow: { cx: 200, cy: 60, r: 230 },
  },
  // 3 — a single steep plane with a long shallow shelf. The most open
  //     composition; leaves the widest calm area for text laid over it.
  {
    planes: [
      { points: "0,0 400,0 400,80 0,260", tone: "mid", opacity: 0.42 },
      { points: "0,290 400,110 400,500 0,500", tone: "deep", opacity: 0.58 },
      { points: "260,0 400,0 400,140 260,190", tone: "mid", opacity: 0.35 },
    ],
    seam: [0, 275, 400, 95],
    glow: { cx: 300, cy: 430, r: 240 },
  },
];

/**
 * The composition a role draws when the caller gives no seed.
 *
 * Roles are matched to the variant whose character suits them — technology to
 * the structural chevron, product to the open shelf — so that even the
 * unseeded case looks chosen rather than defaulted.
 */
const roleDefaultVariant: Record<ImageRole, number> = {
  logo: 0,
  hero: 0,
  doctor: 0,
  service: 1,
  treatment: 1,
  concern: 3,
  technology: 2,
  product: 3,
  article: 1,
  "before-after": 0,
  location: 2,
  social: 0,
};

/**
 * Resolves a seed to one of the four compositions.
 *
 * A number is used directly (a map index is the common case). A string is
 * hashed, so an entity id gives every card in a listing a stable tile of its
 * own without the call site having to think about indices. Absent a seed, the
 * role decides.
 */
export function facetTileVariantFor(role: ImageRole, seed?: string | number): FacetTileVariant {
  const count = facetTileVariants.length;
  if (typeof seed === "number") {
    return facetTileVariants[((seed % count) + count) % count];
  }
  if (typeof seed === "string" && seed.length > 0) {
    // Small, stable, non-cryptographic string hash (djb2). Deterministic
    // across server and client, which is the only property that matters here.
    let hash = 5381;
    for (let i = 0; i < seed.length; i += 1) hash = ((hash << 5) + hash + seed.charCodeAt(i)) | 0;
    return facetTileVariants[Math.abs(hash) % count];
  }
  return facetTileVariants[roleDefaultVariant[role]];
}

/** Index of a variant, used to build stable per-variant gradient ids. */
export function facetTileVariantIndex(variant: FacetTileVariant): number {
  return facetTileVariants.indexOf(variant);
}
