"use client";

import { useId, useState } from "react";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { resultsVaryDisclaimer } from "@/types/before-after";
import type { BeforeAfterPair } from "@/types/before-after";
import type { Locale } from "@/i18n/config";

const labels = {
  en: { before: "Before", after: "After", slider: "Drag to compare before and after" },
  ar: { before: "قبل", after: "بعد", slider: "اسحبوا للمقارنة بين قبل وبعد" },
};

/**
 * Keyboard-accessible before/after comparison slider — brief Part 2 §15.
 * Built on a native `<input type="range">` rather than a custom
 * draggable div: a range input gets full keyboard operation (arrow keys,
 * Home/End), a correct accessible name/value, and RTL mirroring for free
 * from the browser, instead of needing hand-rolled ARIA and pointer-event
 * handling to reach the same bar. The range input is visually
 * transparent and stretched over the image; only its thumb is styled, so
 * it reads as a drag handle without needing a second synthetic element
 * kept in sync with it.
 *
 * `after` is clipped via `clip-path` based on the slider value — no
 * retouching, no inconsistent cropping: both images render at their
 * original aspect ratio and crop, and only the reveal boundary moves.
 */
export function BeforeAfterSlider({ pair, locale }: { pair: BeforeAfterPair; locale: Locale }) {
  const t = labels[locale];
  const id = useId();
  const [value, setValue] = useState(50);
  const isRtl = locale === "ar";
  // The mirroring the range input does automatically in RTL should match
  // which side is visually revealed, so the "after" clip direction flips
  // with it rather than fighting it.
  const afterClip = isRtl ? `inset(0 0 0 ${value}%)` : `inset(0 ${100 - value}% 0 0)`;

  return (
    <figure className="relative">
      <div className="relative aspect-4/3 overflow-hidden rounded-lg">
        <div className="absolute inset-0">
          <ImageKitImage
            path={pair.before.imagekitPath}
            preset="before-after"
            role="before-after"
            status={pair.approvalStatus}
            alt={pair.before.alt}
            locale={locale}
            width={800}
            height={600}
            className="h-full w-full"
          />
          <span className="absolute top-3 left-3 rounded-full bg-surface-dark/80 px-3 py-1 text-xs font-semibold text-surface-dark-foreground rtl:right-3 rtl:left-auto">
            {t.before}
          </span>
        </div>
        <div className="absolute inset-0" style={{ clipPath: afterClip }}>
          <ImageKitImage
            path={pair.after.imagekitPath}
            preset="before-after"
            role="before-after"
            status={pair.approvalStatus}
            alt={pair.after.alt}
            locale={locale}
            width={800}
            height={600}
            className="h-full w-full"
          />
          <span className="absolute top-3 right-3 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground rtl:right-auto rtl:left-3">
            {t.after}
          </span>
        </div>
        {/* Visible divider tracking the slider value, purely decorative
            (aria-hidden) — the input below is the real control. */}
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-background" aria-hidden="true" style={{ insetInlineStart: `${value}%` }} />
      </div>

      <label htmlFor={id} className="sr-only">
        {t.slider} — {pair.description[locale]}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-3 h-2 w-full cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />

      <figcaption className="mt-3 text-sm text-text-secondary">
        <p>{pair.description[locale]}</p>
        {pair.sessionInfo ? <p className="mt-1">{pair.sessionInfo[locale]}</p> : null}
        <p className="mt-1 text-xs">{resultsVaryDisclaimer[locale]}</p>
      </figcaption>
    </figure>
  );
}
