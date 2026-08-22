import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
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
        <ImageKitImage
          path={`/medical/${imageId}.jpg`}
          preset="service"
          role="service"
          status="pending"
          alt={{ en: `${title.en} at Blue Diamond Medical`, ar: `${title.ar} في بلو دايموند الطبية` }}
          locale={locale}
          width={600}
          height={450}
          className="h-full w-full transition-opacity duration-[380ms] lg:group-hover:opacity-0 lg:group-focus-within:opacity-0"
        />
      </div>

      <div className="relative flex flex-1 flex-col gap-1.5 p-5 lg:absolute lg:inset-0 lg:z-10 lg:justify-end lg:text-white lg:transition-opacity lg:duration-[380ms] lg:group-hover:opacity-0 lg:group-focus-within:opacity-0">
        <div
          aria-hidden="true"
          className="hidden lg:absolute lg:inset-0 lg:-z-10 lg:block"
          style={{ background: "linear-gradient(0deg, rgba(29,86,120,0.88) 0%, rgba(29,86,120,0.55) 55%, rgba(29,86,120,0.05) 100%)" }}
        />
        <h3 className="font-heading text-h5">{title[locale]}</h3>
        <p className="text-sm text-text-secondary lg:text-white/90">{short[locale]}</p>
      </div>

      {/* Desktop-only explanation overlay. Hidden (display:none) below
          `lg:` since mobile shows the short summary directly instead
          (brief's "preferred approach" — no hover on touch). */}
      <div className="pointer-events-none absolute inset-0 z-20 hidden translate-y-2 flex-col justify-between bg-primary p-5 text-white opacity-0 transition-[opacity,transform] duration-[380ms] lg:flex lg:group-hover:pointer-events-auto lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:pointer-events-auto lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
        <div>
          <h3 className="font-heading text-h5">{title[locale]}</h3>
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
