import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { BeforeAfterSlider } from "@/features/aesthetics/components/BeforeAfterSlider";
import {
  clinicalExamplesHeading,
  clinicalExamplesIntro,
} from "@/features/aesthetics/before-after-types";
import type { BeforeAfterPair } from "@/features/aesthetics/before-after-types";
import { getRoute } from "@/lib/routing";
import type { Technology } from "@/features/technologies/types";
import type { ImageKitAsset } from "@/types/media";
import type { Locale } from "@/i18n/config";

const labels = {
  en: {
    device: "The device used",
    deviceIntro: "The technology these treatments are performed with at Blue Diamond.",
    readMore: "About this technology",
  },
  ar: {
    device: "الجهاز المستخدم",
    deviceIntro: "التقنية التي تُجرى بها هذه العلاجات في بلو دايموند.",
    readMore: "عن هذه التقنية",
  },
};

/**
 * The last section of a concern page: up to three before/after comparisons and,
 * as the fourth frame in the same row, a picture of the device those treatments
 * are performed with.
 *
 * WHY THE DEVICE SHARES THE ROW rather than sitting in a section of its own.
 * The question a reader asks of a clinical result is "what was this done with";
 * answering it in the next frame, at the same size, in the same grid, is the
 * shortest possible distance between the result and its cause — and it is what
 * turns four pictures into one statement instead of a results archive (§27).
 *
 * The device frame carries no result claim and no comparison handle: it is the
 * equipment, captioned as the equipment, linking to its own page. Where the CMS
 * has assigned no photograph — the normal state in static content mode — the
 * shared `ImageKitImage` renders the technology FacetTile, so the fourth frame
 * is always designed and never an empty cell.
 *
 * Fewer than three pairs simply renders fewer: the library only holds what the
 * two legacy sites actually published, and a concern with two approved
 * comparisons gets two. Nothing here pads a row.
 */
export function ConcernResults({
  pairs,
  technology,
  technologyImage,
  locale,
}: {
  pairs: BeforeAfterPair[];
  technology?: Technology;
  technologyImage?: ImageKitAsset;
  locale: Locale;
}) {
  if (pairs.length === 0) return null;
  const t = labels[locale];
  const route = technology ? getRoute(`technology-${technology.id}`) : undefined;

  return (
    <section className="@container mt-12">
      <h2 data-reveal="up" className="text-h4 font-heading">
        {clinicalExamplesHeading[locale]}
      </h2>
      <p data-reveal="up" className="mt-2 max-w-2xl text-sm text-text-secondary">
        {clinicalExamplesIntro[locale]}
      </p>
      <ul className="mt-6 grid items-stretch gap-6 @2xl:grid-cols-2 @5xl:grid-cols-4 @5xl:gap-5">
        {pairs.map((pair, index) => (
          <li key={pair.pairId} data-reveal="up" data-reveal-delay={String(index % 4)} className="h-full">
            <BeforeAfterSlider pair={pair} locale={locale} />
          </li>
        ))}
        {technology ? (
          <li data-reveal="up" data-reveal-delay={String(pairs.length % 4)} className="h-full">
            <figure className="flex h-full flex-col">
              <div className="relative aspect-4/3 overflow-hidden rounded-lg border border-border bg-surface">
                <ImageKitImage
                  path={technologyImage?.path ?? ""}
                  version={technologyImage?.version}
                  preset="technology"
                  role="technology"
                  status={technologyImage?.status ?? "pending"}
                  alt={technologyImage?.alt ?? technology.title}
                  locale={locale}
                  seed={technology.id}
                  width={800}
                  height={600}
                  className="h-full w-full"
                />
                <span className="absolute top-3 start-3 rounded-full bg-surface-dark/80 px-3 py-1 text-xs font-semibold text-surface-dark-foreground backdrop-blur-[2px]">
                  {t.device}
                </span>
              </div>
              <figcaption className="mt-3 text-sm text-text-secondary">
                <p className="font-medium text-text-primary">
                  {technology.title[locale]}
                  {technology.manufacturer ? ` — ${technology.manufacturer}` : ""}
                </p>
                <p className="mt-1">{t.deviceIntro}</p>
                {route ? (
                  <Link
                    href={`/${locale}${route.path[locale]}`}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
                  >
                    {t.readMore} <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                  </Link>
                ) : null}
              </figcaption>
            </figure>
          </li>
        ) : null}
      </ul>
    </section>
  );
}
