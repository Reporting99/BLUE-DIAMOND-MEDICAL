"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getDictionary, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/** Pixels of scroll before the rail is offered. Short on purpose: this control
 *  now reports position as well as offering the way back, and a position
 *  readout that only appears after a full viewport has scrolled past is absent
 *  for exactly the stretch where the reader first wonders how long the page is. */
const REVEAL_AFTER = 100;

/**
 * The floating scroll rail — a miniature of the document scrollbar, pinned to
 * the inline-end edge, that reports how far down the page the reader is and
 * returns them to the top when pressed.
 *
 * WHY IT LOOKS LIKE THE SCROLLBAR. It is drawn from the same four ingredients
 * as the ::-webkit-scrollbar rules in globals.css — pale cyan track, the 135deg
 * gloss ramp, the white hairline border, the soft glow — because it is doing
 * the scrollbar's job in a place the scrollbar cannot always be seen: iOS
 * Safari keeps its own overlay indicator and hides it between gestures, and an
 * overlay scrollbar on any platform fades out while reading. A control that
 * says "you are here" should look like the thing that says "you are here".
 *
 * IT IS STILL A REAL BUTTON. Not a div with a click handler — a `<button>`, so
 * it is reachable by keyboard, announced as an action, and activated by Enter
 * and Space without a line of extra code. The visible capsule is 12px wide;
 * the pointer target is not. `.scroll-rail::before` inflates the hit area to
 * roughly 48x124 without drawing anything, so the control can be slim and
 * still be pressable — the alternative, widening the pill until it was easy to
 * hit, would have turned it back into the round button it replaced.
 *
 * ONE SCROLL LISTENER, NOT TWO. Visibility and progress are read from the same
 * rAF-throttled, passive handler this component already had. Progress is
 * written straight to the DOM as a custom property rather than held in state:
 * it changes on every scroll frame and nothing else reads it, so `useState`
 * would re-render the component sixty times a second to produce one changed
 * style string. `setVisible` is called only when the boolean actually flips —
 * once per crossing of the threshold, not once per frame.
 *
 * MOTION. The scroll itself is smooth, except under `prefers-reduced-motion`,
 * where it jumps — the same rule RouteScrollManager applies to same-page Home
 * clicks, kept consistent so the site has one answer to "how does this page get
 * back to the top". The thumb itself has no transition: it tracks the finger,
 * and a position readout that eases arrives somewhere the reader no longer is.
 */
export function BackToTop({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);
  const railRef = useRef<HTMLButtonElement>(null);
  const label = getDictionary(locale).common.backToTop;
  const pathname = usePathname();

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let frame = 0;
    // Mirrors the rendered state so the effect can compare without reading
    // `visible` from the closure, which would go stale between renders.
    let shown = window.scrollY > REVEAL_AFTER;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      // How much of the document is actually scrollable. On a short page this
      // is 0 or negative; the thumb then stays parked at the top rather than
      // jumping to the end on the first pixel of overscroll (a real artefact on
      // iOS, where rubber-banding reports scrollY beyond the maximum).
      const scrollable = doc.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
      rail.style.setProperty("--rail-p", String(progress));

      const next = window.scrollY > REVEAL_AFTER;
      if (next !== shown) {
        shown = next;
        setVisible(next);
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    // Correct on mount too — a reload landing mid-page, or a back/forward
    // restore, both arrive already scrolled.
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Resizing changes both terms of the ratio — a rotated phone or an opened
    // devtools panel otherwise leaves the thumb reporting the old geometry.
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // Route changes swap the document's height underneath a component that does
    // not remount (this lives in the persistent [locale] layout), so the ratio
    // has to be recomputed against the new page.
  }, [pathname]);

  return (
    <button
      ref={railRef}
      type="button"
      data-back-to-top=""
      aria-label={label}
      title={label}
      /* `inert` rather than unmounting or `hidden`. Unmounting would give the
         entrance/exit transition nothing to animate; `hidden` sets
         `display: none`, which does the same. `inert` leaves the element
         rendered so it can fade, while removing it from the tab order, from
         the accessibility tree and from hit-testing — so a control that is
         invisible at the top of the page cannot be tabbed to or clicked
         through, which is the whole reason not to simply set opacity to 0. */
      inert={!visible}
      onClick={() => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "smooth" });
      }}
      className={cn(
        /* No `overflow-hidden`: it would clip `.scroll-rail::before`, which is
           the entire pointer target. */
        "scroll-rail group fixed bottom-6 z-40 block p-0 transition-[transform,opacity] duration-[var(--motion-normal)] ease-[var(--motion-ease)] focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
      /* Inline-end, so the rail sits against the edge the language ends at —
         the right in English, the left in Arabic — without a second rule. */
      style={{ insetInlineEnd: "1rem" }}
    >
      <span className="scroll-rail-thumb block" aria-hidden="true" />
    </button>
  );
}
