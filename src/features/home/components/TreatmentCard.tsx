import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FacetTile } from "@/components/shared/FacetTile";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import type { ResolvedMedia } from "@/lib/feelstack/media";
import { cmsAlt } from "@/lib/feelstack/media-slots";
import { getRoute } from "@/lib/routing";
import type { AestheticTreatment } from "@/features/aesthetics/types";
import type { Locale } from "@/i18n/config";

/**
 * One card component rendering three visual tiers (large/medium/small) for
 * the treatment showcase, so the grid stays editorial rather than four
 * repeated identical cards. `size="small"` intentionally drops the image
 * for a compact, text-led editorial link — brief: "Smaller editorial
 * links."
 */
function TreatmentCard({
  resolved,
  treatment,
  locale,
  concern,
  size,
  className = "",
  delay = 0,
}: {
  /** Media resolved for this entity by the homepage. See lib/feelstack/listing-media.ts. */
  resolved?: ResolvedMedia;
  treatment: AestheticTreatment;
  locale: Locale;
  concern?: { title: { en: string; ar: string } };
  size: "large" | "medium" | "small";
  className?: string;
  delay?: number;
}) {
  const route = getRoute(`treatment-${treatment.id}`)!;
  const linkHref = `/${locale}${route.path[locale]}`;

  if (size === "small") {
    return (
      <Link data-reveal="up" data-reveal-delay={String(delay % 4)} href={linkHref} className="group flex flex-col gap-2">
        <div className="aspect-square overflow-hidden rounded-md bg-background/60">
          {resolved ? (
            <ImageKitImage
              path={resolved.path}
              preset="treatment"
              role={resolved.role}
              status={resolved.status}
              alt={cmsAlt(resolved) ?? { en: `${treatment.title.en} at Blue Diamond Medical`, ar: `${treatment.title.ar} في بلو دايموند الطبية` }}
              locale={locale}
              width={resolved.width}
              height={resolved.height}
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="h-full w-full transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
          <FacetTile role="treatment" alt={({ en: `${treatment.title.en} at Blue Diamond Medical`, ar: `${treatment.title.ar} في بلو دايموند الطبية` })[locale]} className="h-full w-full transition-transform duration-300 group-hover:scale-[1.04]" />
          )}
        </div>
        <span className="text-sm font-semibold group-hover:text-primary">{treatment.title[locale]}</span>
      </Link>
    );
  }

  return (
    <Link
      data-reveal={size === "large" ? "start" : "up"}
      data-reveal-delay={size === "medium" ? String(delay % 4) : undefined}
      href={linkHref}
      className={`group relative isolate flex flex-col justify-end overflow-hidden rounded-lg p-7 text-white ${size === "large" ? "aspect-[4/3] lg:aspect-auto lg:min-h-[420px]" : "aspect-[4/3]"} ${className}`}
    >
      {resolved ? (
        <ImageKitImage
          path={resolved.path}
          preset="treatment"
          role={resolved.role}
          status={resolved.status}
          alt={cmsAlt(resolved) ?? { en: `${treatment.title.en} at Blue Diamond Medical`, ar: `${treatment.title.ar} في بلو دايموند الطبية` }}
          locale={locale}
          width={resolved.width}
          height={resolved.height}
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="absolute inset-0 -z-20 h-full w-full"
        />
      ) : (
      <FacetTile role="treatment" alt={({ en: `${treatment.title.en} at Blue Diamond Medical`, ar: `${treatment.title.ar} في بلو دايموند الطبية` })[locale]} className="absolute inset-0 -z-20 h-full w-full" />
      )}
      {/* Darkens most of the card, not just the bottom third — a shorter
          aspect ratio (the "medium" size) can put the h3/p high enough
          that a steeper falloff left them over the near-white FacetTile
          placeholder with almost no darkening at all (a real contrast
          failure axe caught: 1.12:1 against white text). */}
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: "linear-gradient(0deg, rgba(29,86,120,0.94) 0%, rgba(29,86,120,0.55) 60%, rgba(29,86,120,0.1) 100%)" }} />
      {concern ? <span className="text-xs font-semibold tracking-[0.08em] text-white/80 uppercase">{concern.title[locale]}</span> : null}
      <h3 className={`mt-2 font-heading text-white ${size === "large" ? "text-h2" : "text-h4"}`}>{treatment.title[locale]}</h3>
      <p className={`mt-2 text-white/85 ${size === "large" ? "max-w-md text-body" : "line-clamp-2 text-sm"}`}>{treatment.summary[locale]}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
        <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
      </span>
    </Link>
  );
}

export { TreatmentCard };
