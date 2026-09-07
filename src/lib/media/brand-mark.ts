import diamondMark from "@/assets/brand/blue-diamond-mark.png";
import { BRAND_MARK_PATH, imagekitIsConfigured, imagekitSrc } from "@/config/imagekit";
import { manifestAsset } from "./image-manifest";

/**
 * Where the Blue Diamond mark is served from, decided once for the whole site.
 *
 * ImageKit is the source, on the client's instruction (2026-09-07): the bytes
 * were imported through FeelStack's media/import door to
 * `/blue-diamond/brand/blue-diamond-mark.png`, and `?tr=orig-true` on the CDN
 * returns 26,165 bytes with sha256
 * f467436ad918c33518f99f7294225797ad7269bd499764e1a3294541aec76e9b -- byte for
 * byte the file committed at src/assets/brand/blue-diamond-mark.png. (A plain
 * CDN URL returns fewer bytes; that is ImageKit's delivery-time optimisation,
 * not a different asset. Compare originals with `orig-true` or the checksums
 * will disagree for the wrong reason.)
 *
 * That committed file stays in the repository and stays imported here, as the
 * fallback. It is not a theoretical branch: `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
 * comes from `.env`, which is gitignored, so CI has no ImageKit endpoint and
 * every CI run of the suite exercises this path rather than the CDN one
 * (verified 2026-09-07 by building with .env moved aside). Production and the
 * deployed slots do set it, so what a visitor gets is the CDN copy. The logo is the one image whose absence reads as a broken site
 * rather than a missing photo, so it does not depend on a remote host and a
 * CMS status field alone: if the manifest entry is ever set back to `pending`
 * -- the ordinary way an editor withdraws an asset -- the header keeps showing
 * the real mark from the build instead of an abstract placeholder tile. The
 * bundled copy is also the provenance record the client's original is cut
 * from (src/assets/brand/README.md), so it is not a duplicate kept for this
 * fallback's sake.
 *
 * `width`/`height` come from the manifest and describe the ASPECT the browser
 * should reserve, not the pixels delivered: the `logo` preset asks ImageKit
 * for a 240px-wide render, which is ~1.2x the largest size the mark is ever
 * displayed at (the About lock-up's 66px on a 3x screen).
 */
const asset = manifestAsset("brand-mark");

export const brandMark = {
  src:
    imagekitIsConfigured && asset.status === "approved"
      ? imagekitSrc(BRAND_MARK_PATH, "logo")
      : diamondMark.src,
  width: asset.width,
  height: asset.height,
  alt: asset.alt,
} as const;
