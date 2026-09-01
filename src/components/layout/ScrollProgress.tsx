"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * The blue reading-progress rail — a hairline across the top of the viewport
 * that fills left-to-right (right-to-left in Arabic) as the page is scrolled.
 *
 * WHY IT IS DRAWN THIS WAY. The fill is one element permanently at full width
 * with a `scaleX` transform, not an element whose `width` changes. Width is a
 * layout property: animating it on every scroll frame forces layout + paint on
 * a fixed element sitting above the header, on every page, forever. `scaleX`
 * is a compositor transform — it costs the same whether it runs sixty times a
 * second or six hundred. `transform-origin` is `left`/`right` by direction so
 * the rail grows from the edge the language starts at.
 *
 * WHY THE DOM IS TOUCHED DIRECTLY. The progress value is not application
 * state — nothing else reads it, and it changes on literally every scroll
 * frame. Holding it in `useState` would re-render this component sixty times a
 * second to produce one changed style string. The ref is written inside a
 * rAF-throttled scroll handler instead, so at most one write happens per
 * painted frame.
 *
 * WHY IT IS `aria-hidden` AND NOT A PROGRESSBAR. It communicates nothing a
 * screen reader user cannot already get — the scrollbar and the document
 * structure both report position — and a live `role="progressbar"` whose value
 * changes on every frame is an announcement storm, not an affordance. The
 * label stays in the DOM for the element's accessible name only in the sense
 * that it documents intent; the rail itself is decoration over real content.
 *
 * REDUCED MOTION. The rail still tracks the scroll — it is a position readout,
 * and a user who asked for less motion still wants to know where they are.
 * What it drops is the easing transition between frames, which is what would
 * otherwise make it glide after the finger has stopped.
 */
export function ScrollProgress() {
  const fillRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      // How much of the document is actually scrollable. On a short page this
      // is 0 or negative; the rail then stays empty rather than jumping to
      // 100% on the first pixel of overscroll (a real artefact on iOS, where
      // rubber-banding reports scrollY beyond the maximum).
      const scrollable = doc.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(Math.max(window.scrollY / scrollable, 0), 1) : 0;
      fill.style.transform = `scaleX(${progress})`;
      // Fade the rail away entirely at the very top: at scrollY 0 there is no
      // progress to report, and a 1px line under a transparent header on the
      // homepage hero would be the only thing drawn over the photograph.
      fill.style.opacity = progress > 0.004 ? "1" : "0";
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Resizing changes both terms of the ratio — a rotated phone or an opened
    // devtools panel otherwise leaves the rail reporting the old geometry.
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
    // Route changes swap the document's height underneath a component that
    // does not remount (this lives in the persistent [locale] layout), so the
    // ratio has to be recomputed against the new page.
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent"
    >
      <div ref={fillRef} className="scroll-progress-fill h-full w-full" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}
