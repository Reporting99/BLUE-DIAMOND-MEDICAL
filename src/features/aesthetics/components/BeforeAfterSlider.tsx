"use client";

import { useId, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImageKitImage } from "@/components/shared/ImageKitImage";
import { attributionFor, resultsVaryDisclaimer } from "@/features/aesthetics/before-after-types";
import type { BeforeAfterPair } from "@/features/aesthetics/before-after-types";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

const labels = {
  en: { before: "Before", after: "After", slider: "Drag to compare before and after" },
  ar: { before: "قبل", after: "بعد", slider: "اسحبوا للمقارنة بين قبل وبعد" },
};

/**
 * One card, one photograph, two states — the "after" is revealed by dragging a
 * handle across the same frame rather than by putting two pictures side by
 * side. Two pictures side by side ask the reader to find the difference; one
 * picture with a moving seam shows it.
 *
 * BUILT ON A NATIVE `<input type="range">`, stretched invisibly across the
 * whole image. This is the load-bearing decision in the component. A range
 * input gives, for free and correctly: pointer dragging anywhere in the frame,
 * click-to-jump, touch dragging, arrow-key and Home/End operation, a correct
 * accessible name and value, and RTL mirroring. The hand-rolled alternative —
 * a draggable div with pointerdown/move/up handlers and hand-written ARIA — is
 * roughly eighty lines to reach the same bar and typically arrives without
 * keyboard support. The input carries `opacity-0` and only the *visual* handle
 * below is drawn, so the control looks designed while behaving native.
 *
 * The visible handle is `pointer-events-none` on purpose: it is a drawing of
 * where the seam is, not the thing being dragged. Making it interactive would
 * put a second hit target over the input and swallow drags that start on it —
 * the one place a user is most likely to press.
 *
 * `after` is clipped via `clip-path` from the slider value: both images render
 * at their original aspect ratio and crop, and only the reveal boundary moves.
 * No retouching, no per-image cropping, nothing that could make a clinical
 * result look different from what the source shows.
 */
export function BeforeAfterSlider({ pair, locale }: { pair: BeforeAfterPair; locale: Locale }) {
  const t = labels[locale];
  const id = useId();
  const [value, setValue] = useState(50);
  // Whether the reader has moved this slider yet. Its only job is to retire
  // the drag hint: once someone has discovered the control, an animation
  // telling them it exists is noise.
  const [engaged, setEngaged] = useState(false);
  const isRtl = locale === "ar";
  /**
   * WHICH LAYER IS CLIPPED, AND WHY IT IS THE "BEFORE".
   *
   * The after image is the base layer and the before image is clipped over it,
   * covering the inline-start portion up to the handle. That puts Before on the
   * side the language starts at and After on the side it ends at — read left to
   * right in English, right to left in Arabic, in both cases in the order the
   * words themselves go.
   *
   * It also fixes a defect visible in every rendering of this component: with
   * the AFTER clipped to the start side instead, the "Before" badge (drawn at
   * the start corner) sat underneath the after layer and the "After" badge
   * (drawn at the end corner) sat in the region the clip removed — so at the
   * default 50% neither label was on screen. Each layer now carries the badge
   * for the half it actually occupies, so both are visible at any handle
   * position that leaves both halves visible, and each disappears exactly when
   * its own half is dragged away.
   *
   * The mirroring the range input does automatically in RTL is matched rather
   * than fought: `inset-inline-start` and the clip both resolve from the same
   * edge the input measures its value from.
   */
  const beforeClip = isRtl ? `inset(0 0 0 ${100 - value}%)` : `inset(0 ${100 - value}% 0 0)`;
  const attribution = attributionFor(pair);

  return (
    <figure className="flex h-full flex-col">
      {/* The focus ring lives on the frame, not on the input: the input is
          invisible, so an outline drawn on it would be an outline drawn on
          nothing. `focus-within` moves it to the thing a keyboard user can
          actually see they have selected. */}
      <div className="group relative aspect-4/3 overflow-hidden rounded-lg border border-border bg-surface focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-focus">
        {/* AFTER — the base layer, filling the frame; the before layer above
            covers whatever part of it the handle has not revealed. */}
        <div className="absolute inset-0">
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
          <span className="absolute top-3 end-3 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-[2px]">
            {t.after}
          </span>
        </div>
        {/* BEFORE — clipped to the inline-start side of the handle. */}
        <div className="absolute inset-0" style={{ clipPath: beforeClip }}>
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
          <span className="absolute top-3 start-3 rounded-full bg-surface-dark/80 px-3 py-1 text-xs font-semibold text-surface-dark-foreground backdrop-blur-[2px]">
            {t.before}
          </span>
        </div>

        {/* THE SEAM AND ITS HANDLE — decorative (aria-hidden) and
            non-interactive; the input below is the real control. The seam is a
            white hairline with a soft shadow so it stays visible over a light
            and a dark photograph alike, and the handle is a solid disc rather
            than a translucent one for the same reason. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white/90 shadow-[0_0_0_1px_rgba(29,86,120,0.25)]"
          style={{ insetInlineStart: `${value}%` }}
        />
        <div
          aria-hidden="true"
          /* `.ba-handle` owns the centring transform because it has to differ
             by writing direction: `inset-inline-start` resolves to `left` in
             English and to `right` in Arabic, so the disc must be pulled back
             by half its width in opposite physical directions to stay centred
             on the seam. A Tailwind `-translate-x-1/2` would be correct in one
             language and a half-handle off in the other. */
          className="ba-handle pointer-events-none absolute top-1/2 z-10"
          style={{ insetInlineStart: `${value}%` }}
        >
          <span className="flex size-11 items-center justify-center rounded-full border border-white/70 bg-white text-primary shadow-[0_2px_12px_rgba(29,86,120,0.35)] transition-transform duration-[var(--motion-normal)] ease-[var(--motion-ease)] group-hover:scale-105">
            {/* The directional hint. Two arrows say "this moves sideways"
                without a word of copy in either language, and the nudge
                animation carries that across the room until the reader has
                actually used the control — see .ba-drag-hint in globals.css. */}
            <span className={cn("flex items-center", !engaged && "ba-drag-hint")}>
              <ChevronLeft className="size-4" />
              <ChevronRight className="-ms-1 size-4" />
            </span>
          </span>
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
          onChange={(e) => {
            setValue(Number(e.target.value));
            setEngaged(true);
          }}
          /* Stretched over the entire frame so the whole picture is the drag
             surface. `appearance-none` removes the platform track; the input
             is fully transparent and only the handle above is seen. */
          className="absolute inset-0 z-20 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0 outline-none"
        />
      </div>

      <figcaption className="mt-3 text-sm text-text-secondary">
        <p>{pair.description[locale]}</p>
        {pair.sessionInfo ? <p className="mt-1">{pair.sessionInfo[locale]}</p> : null}
        {/* Attribution is rendered from the pair's own provenance rather
            than written per page — closure brief §19/§20. If a source
            filename evidenced the manufacturer, this names it. Suppressing
            it is not possible from a call site, which is the point: an
            asset cannot be shown as if it were a Blue Diamond patient. */}
        {attribution ? <p className="mt-1 text-xs font-medium">{attribution[locale]}</p> : null}
        <p className="mt-1 text-xs">{resultsVaryDisclaimer[locale]}</p>
      </figcaption>
    </figure>
  );
}
