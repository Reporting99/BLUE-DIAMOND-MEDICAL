import { cn } from "@/lib/utils";
import { mapEmbedUrl, type CanonicalLocation } from "@/config/locations";

interface LocationMapProps {
  /** The location to centre and pin. */
  location: CanonicalLocation;
  /**
   * Accessible name for the frame, localized by the caller. An <iframe>
   * without a title is an unlabelled frame to a screen reader, which is an
   * axe violation and the reason this prop is required rather than optional.
   */
  title: string;
  className?: string;
}

/**
 * Real interactive map — pan, zoom, and a pin on the geocoded street address.
 *
 * Replaces the FacetTile placeholder that previously stood in for the
 * location visual (docs/MEDIA.md, Homepage/Contact "Location · Map" row,
 * which already noted "Consider an embedded map instead of a static image").
 *
 * Keyless by design: the project has no maps API key provisioned, and the
 * embed resolves the street address server-side at request time. That is also
 * why no latitude/longitude appears anywhere in this codebase — coordinates
 * typed by hand are the classic way a clinic pin ends up a block off.
 *
 * `dir="ltr"` is pinned on the frame because the surrounding section flips to
 * RTL in Arabic. Map geography must not mirror with the layout — only the
 * column order around it does.
 */
export function LocationMap({ location, title, className }: LocationMapProps) {
  return (
    <iframe
      src={mapEmbedUrl(location)}
      title={title}
      dir="ltr"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      className={cn("block size-full border-0", className)}
    />
  );
}
