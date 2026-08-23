import type { ImageRole } from "@/types/media";

/** Every value must be one of the approved brand primitives — no raw off-palette hex. */
export const imageRoleTint: Record<ImageRole, { base: string; mid: string; deep: string }> = {
  doctor: { base: "#F5F8FA", mid: "#88B9D7", deep: "#296589" },
  hero: { base: "#EEF3F6", mid: "#5999BF", deep: "#1D5678" },
  service: { base: "#F5F8FA", mid: "#88B9D7", deep: "#296589" },
  treatment: { base: "#F5F8FA", mid: "#5999BF", deep: "#296589" },
  concern: { base: "#EEF3F6", mid: "#88B9D7", deep: "#1D5678" },
  technology: { base: "#F5F8FA", mid: "#5999BF", deep: "#1D5678" },
  product: { base: "#F5F8FA", mid: "#BEBEBE", deep: "#707070" },
  article: { base: "#EEF3F6", mid: "#88B9D7", deep: "#296589" },
  "before-after": { base: "#F5F8FA", mid: "#9F9F9F", deep: "#636363" },
  location: { base: "#EEF3F6", mid: "#5999BF", deep: "#1D5678" },
  social: { base: "#F5F8FA", mid: "#88B9D7", deep: "#296589" },
  logo: { base: "#FFFFFF", mid: "#88B9D7", deep: "#1D5678" },
};
