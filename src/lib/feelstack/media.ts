import { z } from "zod";
import { MEDIA_ROOT } from "@/config/imagekit";
import type { ImageKitAsset, ImageRole, ImageStatus } from "@/types/media";

/**
 * FeelStack media contract — read side.
 *
 * The backend emits one `media` array per resolved route (FeelStack
 * `PublicRouteResolverService.publicMedia`). Each element is one asset attached
 * to one slot on this entity. FeelStack already applies three filters before we
 * see anything: the assignment must be enabled, the asset's approvalStatus must
 * be publishable, and both must belong to this project. Nothing here re-derives
 * those decisions — a frontend that re-implements a server-side merge is the
 * mistake `docs/FEELSTACK.md` records about `defaultSeo`.
 *
 * WHY THIS IS PARSED PER ITEM, NOT AS PART OF THE ENVELOPE SCHEMA.
 * `feelstackResolveEnvelopeSchema` keeps `media` as `z.array(z.unknown())`, and
 * every element is validated separately here. If the strict shape lived in the
 * envelope, a single malformed row — one asset missing a height, say — would
 * fail `safeParse` on the whole envelope, and the page resolver would treat
 * that as an unusable response and render a 404. Losing an image is a visual
 * defect; losing the page is an outage. This module is where that difference is
 * enforced: bad rows are dropped and counted, good rows pass through, and the
 * page always renders.
 */

const localizedTextSchema = z.object({
  en: z.string(),
  ar: z.string(),
});

const captionSchema = z.object({
  en: z.string().optional(),
  ar: z.string().optional(),
});

const focalPointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

/**
 * One assigned asset, exactly as FeelStack's public contract defines it.
 *
 * Strictness notes, each deliberate:
 *  - `path` must start with MEDIA_ROOT. A path outside it is either a
 *    cross-project leak or a misconfigured prefix; either way this build must
 *    not render it, and `ImageKitImage` would otherwise happily request it.
 *  - `width`/`height` are required and positive. An image without real
 *    dimensions cannot reserve layout space, and the brief's no-layout-shift
 *    rule is unmeetable without them. FeelStack already drops dimensionless
 *    assets; this is the second half of the same guarantee.
 *  - `role` and `approvalStatus` are open strings here rather than enums. The
 *    CMS owns that vocabulary and may add to it; an unknown role maps to a
 *    conservative default below instead of invalidating an otherwise good
 *    record.
 */
export const feelstackMediaAssignmentSchema = z.object({
  id: z.string().min(1),
  path: z.string().startsWith(`${MEDIA_ROOT}/`),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  aspectRatio: z.number().positive().optional(),
  alt: localizedTextSchema,
  caption: captionSchema.optional(),
  role: z.string().optional(),
  slot: z.string().min(1),
  approvalStatus: z.string().min(1),
  focalPoint: focalPointSchema.optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  localeMode: z.enum(["shared", "localized"]).optional(),
});

export type FeelstackMediaAssignment = z.infer<typeof feelstackMediaAssignmentSchema>;

/**
 * CMS role vocabulary → this build's `ImageRole`, which drives the FacetTile
 * placeholder's tint and the transformation preset. An unmapped role is not an
 * error: it falls back to "hero", the most neutral full-bleed treatment.
 */
const ROLE_MAP: Record<string, ImageRole> = {
  hero: "hero",
  heroMobile: "hero",
  card: "service",
  section: "service",
  gallery: "treatment",
  technology: "technology",
  doctorPortrait: "doctor",
  doctorPlaceholder: "doctor",
  productPrimary: "product",
  productGallery: "product",
  ogImage: "social",
  sharedPlaceholder: "product",
};

/**
 * CMS approval vocabulary → this build's `ImageStatus`.
 *
 * The mapping is intentionally conservative in one direction only: anything
 * this build does not recognise becomes "pending", which renders the FacetTile
 * placeholder. A new CMS status can therefore never accidentally promote an
 * unreviewed asset into production rendering — the failure mode is a
 * placeholder, never a wrong photograph on a medical page.
 */
const STATUS_MAP: Record<string, ImageStatus> = {
  approved: "approved",
  temporary: "temporary",
  pending: "pending",
  rejected: "disabled",
};

export function toImageRole(role: string | undefined): ImageRole {
  return (role && ROLE_MAP[role]) || "hero";
}

export function toImageStatus(approvalStatus: string): ImageStatus {
  return STATUS_MAP[approvalStatus] ?? "pending";
}

/** Domain shape: the existing `ImageKitAsset` plus the slot it was assigned to. */
export interface ResolvedMedia extends ImageKitAsset {
  slot: string;
  sortOrder: number;
}

export function adaptMediaAssignment(item: FeelstackMediaAssignment): ResolvedMedia {
  return {
    id: item.id,
    path: item.path,
    width: item.width,
    height: item.height,
    aspectRatio: (item.aspectRatio ?? item.width / item.height).toFixed(6),
    ...(item.focalPoint ? { focalPoint: item.focalPoint } : {}),
    alt: item.alt,
    ...(item.caption?.en || item.caption?.ar
      ? { caption: { en: item.caption.en ?? "", ar: item.caption.ar ?? "" } }
      : {}),
    role: toImageRole(item.role),
    status: toImageStatus(item.approvalStatus),
    slot: item.slot,
    sortOrder: item.sortOrder ?? 0,
  };
}

export interface MediaParseResult {
  media: ResolvedMedia[];
  /** Per-item rejection reasons, for logging. Never surfaced to a visitor. */
  rejected: string[];
}

/**
 * Validates an envelope's raw `media` array item by item.
 *
 * Returns everything usable plus a list of why anything was dropped. The caller
 * logs the rejections; the page renders regardless. This function does not
 * throw and does not return a failure state — there is no media problem severe
 * enough to justify failing a page.
 */
export function parseMediaAssignments(raw: unknown): MediaParseResult {
  if (!Array.isArray(raw)) {
    return { media: [], rejected: raw === undefined ? [] : ["media was not an array"] };
  }
  const media: ResolvedMedia[] = [];
  const rejected: string[] = [];
  for (const [index, item] of raw.entries()) {
    const parsed = feelstackMediaAssignmentSchema.safeParse(item);
    if (!parsed.success) {
      rejected.push(
        `media[${index}]: ${parsed.error.issues
          .map((issue) => `${issue.path.join(".") || "(root)"} ${issue.message}`)
          .join("; ")}`,
      );
      continue;
    }
    media.push(adaptMediaAssignment(parsed.data));
  }
  media.sort((a, b) => a.slot.localeCompare(b.slot) || a.sortOrder - b.sortOrder);
  return { media, rejected };
}

/**
 * Groups by slot, preserving sort order within each.
 *
 * Templates ask for a slot, not an index — `bySlot(media).hero?.[0]` reads as
 * the design does, and a gallery is just the same slot with several entries.
 */
export function bySlot(media: readonly ResolvedMedia[]): Record<string, ResolvedMedia[]> {
  const grouped: Record<string, ResolvedMedia[]> = {};
  for (const item of media) {
    (grouped[item.slot] ??= []).push(item);
  }
  return grouped;
}

/** First asset in a slot, or undefined. The common case for single-image slots. */
export function primaryForSlot(
  media: readonly ResolvedMedia[],
  slot: string,
): ResolvedMedia | undefined {
  return media.find((item) => item.slot === slot);
}
