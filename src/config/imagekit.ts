import type { Transformation } from "@imagekit/next";

/**
 * Central ImageKit configuration, built on the official @imagekit/next SDK
 * (brief §8 — "Install the official SDK... use one centralized provider").
 * No production images live in public/ or point at unapproved external
 * hosts — see docs/UI_UX_FOUNDATION.md §8/§18 and
 * docs/IMAGE_REPLACEMENT_MANIFEST.md.
 *
 * The approved ImageKit account/endpoint is now known (brief §12) even
 * though no asset has been uploaded to it yet — `DEFAULT_URL_ENDPOINT`
 * below is the public CDN base (not a secret; safe to commit, same as a
 * public key), used unless overridden by the env var. This only changes
 * *where a real image would be requested from* — every asset in
 * `src/lib/media/image-manifest.ts` still carries `status: "pending"`
 * (docs/MISSING_CONTENT_REPORT.md), and `ImageKitImage` only renders the
 * real CDN path when `status === "approved"`, so nothing currently renders
 * differently: still the FacetTile placeholder everywhere until real
 * photography is uploaded and each entry's status flips.
 */
const DEFAULT_URL_ENDPOINT = "https://ik.imagekit.io/oq92dh6zib";

/** Every path stored in content data is relative to this root (brief §12),
 * e.g. `/blue-diamond/home/home-hero-blue-diamond.png`. */
export const MEDIA_ROOT = "/blue-diamond";

export const imagekitConfig = {
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? DEFAULT_URL_ENDPOINT,
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ?? "",
} as const;

export const imagekitIsConfigured = imagekitConfig.urlEndpoint.length > 0;

/**
 * Reusable transformation presets, keyed by ImageRole (src/types/media.ts).
 * Passed straight through as an @imagekit/next `Transformation` object —
 * widths are the largest size requested; next/image + the `sizes` prop
 * handle responsive downscaling on top of these.
 */
export const imagePresets = {
  logo: { width: 240, quality: 90, format: "auto" },
  hero: { width: 1920, quality: 80, format: "auto" },
  "hero-mobile": { width: 960, quality: 80, format: "auto" },
  doctor: { width: 640, quality: 85, format: "auto", focus: "face" },
  "doctor-card": { width: 480, quality: 85, format: "auto", focus: "face" },
  service: { width: 800, quality: 82, format: "auto" },
  treatment: { width: 800, quality: 82, format: "auto" },
  concern: { width: 600, quality: 82, format: "auto" },
  technology: { width: 800, quality: 82, format: "auto" },
  product: { width: 600, quality: 85, format: "auto" },
  "product-gallery": { width: 1200, quality: 88, format: "auto" },
  article: { width: 1000, quality: 80, format: "auto" },
  "og-image": { width: 1200, height: 630, quality: 85, format: "jpg" },
  thumbnail: { width: 320, quality: 75, format: "auto" },
  "before-after": { width: 800, quality: 88, format: "auto" },
} as const satisfies Record<string, Transformation>;

export type ImagePresetKey = keyof typeof imagePresets;
