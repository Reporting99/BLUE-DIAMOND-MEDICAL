export type Locale = "en" | "ar";

export type ImageRole =
  | "logo"
  | "hero"
  | "doctor"
  | "service"
  | "treatment"
  | "concern"
  | "technology"
  | "product"
  | "article"
  | "before-after"
  | "location"
  | "social";

export type ImageStatus = "approved" | "temporary" | "pending" | "disabled";

export interface ImageKitAsset {
  id: string;
  path: string;
  width: number;
  height: number;
  aspectRatio?: string;
  focalPoint?: { x: number; y: number };
  alt: { en: string; ar: string };
  caption?: { en: string; ar: string };
  role: ImageRole;
  status: ImageStatus;
}
