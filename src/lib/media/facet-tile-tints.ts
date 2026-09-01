import type { ImageRole } from "@/types/media";

/** Every value must be one of the approved brand primitives — no raw off-palette hex. */
export const imageRoleTint: Record<ImageRole, { base: string; mid: string; deep: string }> = {
  doctor: { base: "#F5F8FA", mid: "#88B9D7", deep: "#296589" },
  hero: { base: "#EEF3F6", mid: "#5999BF", deep: "#1D5678" },
  service: { base: "#F5F8FA", mid: "#88B9D7", deep: "#296589" },
  treatment: { base: "#F5F8FA", mid: "#5999BF", deep: "#296589" },
  concern: { base: "#EEF3F6", mid: "#88B9D7", deep: "#1D5678" },
  technology: { base: "#F5F8FA", mid: "#5999BF", deep: "#1D5678" },
  // The lightest blue set in the table. A product tile stands in for packaging
  // on a bright sweep, so it has to read cooler and lighter than a treatment
  // or service tile — but "lighter" was previously spelled with the two greys,
  // and a catalogue of two dozen grey tiles read as two dozen failed images
  // rather than as a designed set. Pairing the grey mid with a brand-blue deep
  // was worse still: the two planes met in a hard grey-to-blue seam that
  // belonged to neither family. So: same blues as the rest of the system, one
  // step lighter throughout.
  product: { base: "#EEF3F6", mid: "#88B9D7", deep: "#5999BF" },
  article: { base: "#EEF3F6", mid: "#88B9D7", deep: "#296589" },
  "before-after": { base: "#F5F8FA", mid: "#9F9F9F", deep: "#636363" },
  location: { base: "#EEF3F6", mid: "#5999BF", deep: "#1D5678" },
  social: { base: "#F5F8FA", mid: "#88B9D7", deep: "#296589" },
  logo: { base: "#FFFFFF", mid: "#88B9D7", deep: "#1D5678" },
};
