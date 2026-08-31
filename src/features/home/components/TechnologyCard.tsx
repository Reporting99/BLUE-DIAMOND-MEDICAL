import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FacetTile } from "@/components/shared/FacetTile";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import type { ResolvedMedia } from "@/lib/feelstack/media";
import { cmsAlt } from "@/lib/feelstack/media-slots";
import { getRoute } from "@/lib/routing";
import { treatments } from "@/features/aesthetics/data/treatments";
import type { Technology } from "@/features/technologies/types";
import type { Locale } from "@/i18n/config";

/**
 * Technology showcase card — three sizes matching the brief's "one large
 * featured + asymmetric supporting grid" spec for the dark section.
 */
function TechnologyCard({
  resolved,
  technology,
  locale,
  number,
  size,
  className = "",
  delay = 0,
}: {
  /** Media resolved for this entity by the homepage. See lib/feelstack/listing-media.ts. */
  resolved?: ResolvedMedia;
  technology: Technology;
  locale: Locale;
  number: number;
  size: "large" | "medium" | "small";
  className?: string;
  delay?: number;
}) {
  const route = getRoute(`technology-${technology.id}`)!;
  const linkHref = `/${locale}${route.path[locale]}`;
  const relatedTreatmentTitles = technology.relatedTreatmentIds
    .map((id) => treatments.find((t) => t.id === id)?.title[locale])
    .filter((t): t is string => Boolean(t));

  return (
    <Link
      data-reveal={size === "large" ? "start" : "up"}
      data-reveal-delay={size !== "large" ? String(delay % 4) : undefined}
      href={linkHref}
      className={`group flex flex-col gap-4 rounded-lg border border-white/10 bg-white/5 p-6 text-white transition-colors hover:border-white/30 ${size === "large" ? "lg:flex-row lg:items-center lg:gap-8" : ""} ${className}`}
    >
      <div className={`relative aspect-square overflow-hidden rounded-md bg-white/5 ${size === "large" ? "w-full lg:w-64 lg:shrink-0" : size === "small" ? "w-16 shrink-0" : "w-full"}`}>
        {resolved ? (
          <ImageKitImage
            path={resolved.path}
            preset="technology"
            role={resolved.role}
            status={resolved.status}
            alt={cmsAlt(resolved) ?? { en: `${technology.title.en} device at Blue Diamond Medical`, ar: `جهاز ${technology.title.ar} في بلو دايموند الطبية` }}
            locale={locale}
            width={resolved.width}
            height={resolved.height}
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="h-full w-full"
          />
        ) : (
        <FacetTile role="technology" alt={({ en: `${technology.title.en} device at Blue Diamond Medical`, ar: `جهاز ${technology.title.ar} في بلو دايموند الطبية` })[locale]} className="h-full w-full" />
        )}
      </div>
      <div className={size === "small" ? "flex flex-1 items-center justify-between gap-3" : ""}>
        <div>
          <span className="ltr-run font-heading text-sm text-white/80">{String(number).padStart(2, "0")}</span>
          <h3 className={`font-heading text-white ${size === "large" ? "mt-1 text-h2" : "text-h5"}`}>{technology.title[locale]}</h3>
          {size !== "small" ? <p className={`mt-2 text-white/80 ${size === "large" ? "max-w-md text-body" : "line-clamp-2 text-sm"}`}>{technology.summary[locale]}</p> : null}
          {size === "large" && relatedTreatmentTitles.length ? (
            <p className="mt-3 text-sm text-white/80">{relatedTreatmentTitles.join(" · ")}</p>
          ) : null}
        </div>
        {size === "small" ? <ArrowRight className="size-4 shrink-0 text-white/80 rtl:rotate-180" aria-hidden="true" /> : null}
      </div>
    </Link>
  );
}

export { TechnologyCard };
