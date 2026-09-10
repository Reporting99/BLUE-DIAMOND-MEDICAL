import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FacetTile } from "@/components/shared/FacetTile";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import type { ResolvedMedia } from "@/lib/feelstack/media";
import { cmsAlt } from "@/lib/feelstack/media-slots";
import { getRoute } from "@/lib/routing";
import type { Bilingual } from "@/types/common";
import type { Locale } from "@/i18n/config";

/**
 * "Care for every stage of life" service card. Mobile (base styles):
 * plain stacked card — image, title, short summary, all always visible,
 * the whole card is one link. Desktop (`lg:`): converts into an
 * absolutely-positioned overlay card — image + title/short-summary shown
 * by default, swapping via opacity+translate to the longer explanation +
 * a descriptive CTA on hover *or* keyboard focus (`group-focus-within`,
 * which fires the instant the link itself receives focus — no extra JS).
 * The explanation is a real `absolute inset-0 opacity-0` element, never
 * `display:none` at the `lg:` breakpoint, so it stays genuinely animatable
 * and present for assistive tech and search engines at all times — a
 * `hidden`/`flex` toggle can't transition opacity at all, which is the
 * one thing tried first and rejected here.
 */
function ServiceCard({
  resolved,
  title,
  short,
  long,
  ctaLabel,
  routeId,
  imageId,
  locale,
  delay,
  className = "",
}: {
  /** Media resolved for this entity by the homepage. See lib/feelstack/listing-media.ts. */
  resolved?: ResolvedMedia;
  title: Bilingual;
  short: Bilingual;
  long: Bilingual;
  ctaLabel: string;
  routeId: string;
  imageId: string;
  locale: Locale;
  delay: number;
  className?: string;
}) {
  const route = getRoute(routeId)!;
  return (
    <Link
      href={`/${locale}${route.path[locale]}`}
      data-reveal="up"
      data-reveal-delay={String(delay % 4)}
      className={`group relative isolate flex flex-col overflow-hidden rounded-lg border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:aspect-[4/5] lg:border-0 ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden lg:absolute lg:inset-0 lg:aspect-auto">
        {resolved ? (
          <ImageKitImage
            path={resolved.path}
            version={resolved.version}
            preset="service"
            role={resolved.role}
            status={resolved.status}
            alt={cmsAlt(resolved) ?? { en: `${title.en} at Blue Diamond Medical`, ar: `${title.ar} في بلو دايموند الطبية` }}
            locale={locale}
            width={resolved.width}
            height={resolved.height}
            sizes="(min-width: 1024px) 33vw, 100vw"
            seed={imageId}
            className="h-full w-full transition-opacity duration-[380ms] lg:group-hover:opacity-0 lg:group-focus-within:opacity-0"
          />
        ) : (
        <FacetTile role="service" seed={imageId} alt={({ en: `${title.en} at Blue Diamond Medical`, ar: `${title.ar} في بلو دايموند الطبية` })[locale]} className="h-full w-full transition-opacity duration-[380ms] lg:group-hover:opacity-0 lg:group-focus-within:opacity-0" />
        )}
      </div>

      <div className="relative flex flex-1 flex-col gap-1.5 p-5 lg:absolute lg:inset-0 lg:z-10 lg:justify-end lg:text-white lg:transition-opacity lg:duration-[380ms] lg:group-hover:opacity-0 lg:group-focus-within:opacity-0">
        <div
          aria-hidden="true"
          className="hidden lg:absolute lg:inset-0 lg:-z-10 lg:block"
          /* The wash is CONCENTRATED, not uniform: heavy where the text sits
             and gone by the top third, so the card reads as a photograph with
             a caption rather than a blue rectangle.

             The previous ramp (0.95/0.86/0.55/0.30) never dropped below 0.30
             anywhere, which tinted the whole picture — the "blue highlight"
             complaint. It went that far because the ramp BEFORE it put the
             summary at ~0.6 alpha and failed AA on a light photograph, so the
             fix must not simply lighten everything again.

             0.80 at 32% is the floor that keeps that fix intact. White on
             0.80 × #1D5678 over a pure-white image — the worst case in the
             manifest — computes to 4.6:1, still clear of AA, and the title and
             summary both sit below that stop. Above it the wash falls away
             fast and is fully clear by 88%. Do not raise the 32% stop or lower
             its alpha without re-running that contrast check. */
          style={{ background: "linear-gradient(0deg, rgba(29,86,120,0.94) 0%, rgba(29,86,120,0.80) 32%, rgba(29,86,120,0.34) 62%, rgba(29,86,120,0) 88%)" }}
        />
        {/* `lg:text-white` sits on the heading ITSELF, not just on the wrapper.
            globals.css colours every h1/h2/h3 with --text-primary in the base
            layer, and a direct rule on the element beats a colour inherited
            from an ancestor — so the wrapper's `lg:text-white` never reached
            this title, and it rendered dark blue on a dark blue wash, which is
            what made it invisible on the medical cards.

            The shadow is a second, independent guard: it holds the glyph edges
            apart from whatever detail sits directly behind them, which a flat
            overlay alone cannot do on a busy image. */}
        <h3 className="font-heading text-h5 lg:text-white lg:[text-shadow:0_1px_3px_rgba(9,32,48,0.55)]">{title[locale]}</h3>
        <p className="text-sm text-text-secondary lg:text-white lg:[text-shadow:0_1px_3px_rgba(9,32,48,0.55)]">
          {short[locale]}
        </p>
      </div>

      {/* Desktop-only explanation overlay. Hidden (display:none) below
          `lg:` since mobile shows the short summary directly instead
          (brief's "preferred approach" — no hover on touch). */}
      <div className="pointer-events-none absolute inset-0 z-20 hidden translate-y-2 flex-col justify-between bg-primary p-5 text-white opacity-0 transition-[opacity,transform] duration-[380ms] lg:flex lg:group-hover:pointer-events-auto lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:pointer-events-auto lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
        <div>
          {/* Same reason as the default-state title above: the base-layer
              h1/h2/h3 colour rule overrides the `text-white` inherited from
              this panel, so it has to be set on the heading itself — here it
              was dark blue on solid --primary. */}
          <h3 className="font-heading text-h5 text-white">{title[locale]}</h3>
          <p className="mt-2 text-sm text-white/90">{long[locale]}</p>
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
          {ctaLabel} <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export { ServiceCard };
