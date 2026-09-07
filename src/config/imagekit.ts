import { buildSrc } from "@imagekit/javascript";
import type { Transformation } from "@imagekit/next";

/**
 * Central ImageKit configuration, built on the official @imagekit/next SDK
 * (brief §8 — "Install the official SDK... use one centralized provider").
 * No production images live in public/ or point at unapproved external
 * hosts — see docs/UI_UX_FOUNDATION.md §8/§18 and
 * docs/MEDIA.md.
 *
 * The approved ImageKit account/endpoint is now known (brief §12) even
 * though no asset has been uploaded to it yet — `DEFAULT_URL_ENDPOINT`
 * below is the public CDN base (not a secret; safe to commit, same as a
 * public key), used unless overridden by the env var. This only changes
 * *where a real image would be requested from* — every asset in
 * `src/lib/media/image-manifest.ts` still carries `status: "pending"`
 * (docs/CONTENT_MODEL.md), and `ImageKitImage` only renders the
 * real CDN path when `status === "approved"`, so nothing currently renders
 * differently: still the FacetTile placeholder everywhere until real
 * photography is uploaded and each entry's status flips.
 */
const DEFAULT_URL_ENDPOINT = "https://ik.imagekit.io/oq92dh6zib";

/** Every path stored in content data is relative to this root (brief §12),
 * e.g. `/blue-diamond/home/home-hero-blue-diamond.png`. */
export const MEDIA_ROOT = "/blue-diamond";

/**
 * Normalize one ImageKit environment value into "configured" or "not".
 *
 * Exported, and taking the raw value rather than reading the environment, so
 * both states are directly testable without mutating `process.env` — the same
 * shape `isSiteLaunched` uses in src/config/launch.ts.
 *
 * `??` is deliberately NOT the test. Next inlines `process.env.NEXT_PUBLIC_*`
 * at build time, and a variable that is declared-but-blank — an empty line in
 * a slot runtime file, a GitHub Actions `vars.` entry that exists with no
 * value, `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=` in a hand-edited .env — arrives
 * as `""`, not `undefined`. `??` passes `""` straight through, so a blank
 * value would be treated as a configured endpoint and every image URL would
 * be built against an empty origin. Trimming first also catches the trailing
 * space a copy-paste leaves behind. A trailing slash is stripped so
 * `https://ik.imagekit.io/x` and `https://ik.imagekit.io/x/` are one value and
 * cannot produce a double slash in a delivery URL.
 */
export function normalizeImagekitEndpoint(raw: string | undefined | null): string | null {
  const trimmed = (raw ?? "").trim().replace(/\/+$/, "");
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * The endpoint an operator actually configured, or `null` when none is.
 *
 * The member expression is written out in full because webpack replaces
 * `process.env.NEXT_PUBLIC_…` textually; reading it through a variable or a
 * destructure would leave it unsubstituted in the client bundle.
 */
const CONFIGURED_URL_ENDPOINT = normalizeImagekitEndpoint(
  process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
);

/**
 * Whether ImageKit delivery is available in THIS environment.
 *
 * This is the environment's answer, not the constant's. It used to be
 * `imagekitConfig.urlEndpoint.length > 0`, which — because `urlEndpoint` falls
 * back to `DEFAULT_URL_ENDPOINT` — could only ever be `true`. So an
 * environment with no ImageKit at all still reported itself configured, and a
 * CI build with no `.env` emitted live `https://ik.imagekit.io/…` URLs: the
 * brand mark's bundled-copy fallback was never exercised there, and the suite
 * that claims to cover it was in fact asserting against real CDN delivery over
 * the network. Verified 2026-09-07 by building this branch with no `.env`:
 * the prerendered `/en` carried the ImageKit `src`, not
 * `/_next/static/media/blue-diamond-mark.<hash>.png`.
 *
 * `DEFAULT_URL_ENDPOINT` stays as the endpoint URLs are BUILT from, so a
 * configured deployment that omits the variable still resolves the approved
 * account. What changed is that it no longer answers "is ImageKit set up
 * here?" — only a real environment value does.
 */
export const imagekitIsConfigured = CONFIGURED_URL_ENDPOINT !== null;

export const imagekitConfig = {
  urlEndpoint: CONFIGURED_URL_ENDPOINT ?? DEFAULT_URL_ENDPOINT,
  publicKey: normalizeImagekitEndpoint(process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY) ?? "",
} as const;

/**
 * The brand mark's own library path.
 *
 * It sits here rather than in a component because the mark is the one image
 * that is not content: no page owns it, no CMS entry assigns it, and it is
 * requested from every route. Naming it once keeps the path out of JSX, where
 * a literal would be a second source of truth for the one asset that must
 * never silently move. The bytes were imported through the sanctioned door
 * (FeelStack `POST /admin/v1/projects/:id/media/import`) on 2026-09-07 and the
 * CDN copy is byte-identical to `src/assets/brand/blue-diamond-medical-mark.png`
 * -- see src/lib/media/brand-mark.ts.
 *
 * The `-medical-` name is not decoration. It distinguishes the clinic's own
 * mark from the third-party device marks that also live under a `brand`
 * directory of their own -- Ultra, FlexSure and TempSure each have one beneath
 * `/blue-diamond/technologies/`. It is also a new path rather than a reused
 * one: the mark supplied on 2026-09-07 is a different image from the one it
 * replaces, and the import endpoint answers different bytes at a known path
 * with a 409 rather than a silent overwrite.
 */
export const BRAND_MARK_PATH = `${MEDIA_ROOT}/brand/blue-diamond-medical-mark.png`;

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
  /**
   * 900 rather than 600 because the concern imagery that now exists is
   * 1448x1086, and the largest frame asking for this preset -- the concern
   * explorer's preview panel -- is a ~540px CSS square that a high-DPR screen
   * requests at roughly twice that. At 600 the preset capped the source below
   * the frame's own pixel demand and ImageKit had to enlarge a 600px image to
   * fill it; 900 stays comfortably inside the supplied original, so nothing is
   * ever upscaled. The detail-page hero is unaffected -- PageHero asks for the
   * "hero" preset.
   */
  concern: { width: 900, quality: 82, format: "auto" },
  technology: { width: 800, quality: 82, format: "auto" },
  product: { width: 600, quality: 85, format: "auto" },
  "product-gallery": { width: 1200, quality: 88, format: "auto" },
  article: { width: 1000, quality: 80, format: "auto" },
  "og-image": { width: 1200, height: 630, quality: 85, format: "jpg" },
  thumbnail: { width: 320, quality: 75, format: "auto" },
  "before-after": { width: 800, quality: 88, format: "auto" },
  /**
   * The Our Team hero group photograph.
   *
   * 600 is the asset's NATIVE width, not a design choice: the file the clinic
   * supplied is 600x451, and asking ImageKit for anything wider makes it
   * enlarge a 600px source rather than deliver a sharper one. The hero frame
   * is capped to match (see our-team/page.tsx), so the picture is never
   * upscaled in CSS either. Raise both together the day a higher-resolution
   * original is supplied -- not one without the other.
   */
  "team-group": { width: 600, quality: 88, format: "auto" },
} as const satisfies Record<string, Transformation>;

export type ImagePresetKey = keyof typeof imagePresets;

/**
 * A delivery URL for one library path with a preset applied.
 *
 * `ImageKitImage` is still the only way a PAGE gets a picture -- this exists
 * for the brand mark alone (src/lib/media/brand-mark.ts), which cannot go
 * through that component: it renders the FacetTile placeholder for anything
 * not approved, and an abstract tile where the clinic's logo should be is a
 * visibly broken header rather than a graceful fallback. Building the URL
 * here rather than in the component is the same rule docs/UI_UX_FOUNDATION.md
 * §8/§18 states -- transformation URLs are constructed by the centralized
 * provider config, never at the usage site.
 *
 * Uses the official SDK's own builder, so the transformation string is the
 * SDK's business and not a template literal that drifts from it.
 */
export function imagekitSrc(path: string, preset: ImagePresetKey): string {
  return buildSrc({
    urlEndpoint: imagekitConfig.urlEndpoint,
    src: path,
    transformation: [imagePresets[preset]],
  });
}
