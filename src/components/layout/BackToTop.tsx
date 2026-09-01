"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { getDictionary, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/** Pixels of scroll before the arrow is offered. Roughly one viewport on a
 *  laptop: far enough that returning to the top is a real journey, close
 *  enough that it is there when the hero has just left the screen. */
const REVEAL_AFTER = 640;

/**
 * The blue side arrow — a scroll-to-top control pinned to the inline-end edge
 * of the viewport.
 *
 * WHY SCROLL-TO-TOP RATHER THAN A SECTION-STEPPER. Both were on the table.
 * A stepper that advances section by section has to know each page's section
 * boundaries, and this site's pages differ in structure — a treatment page,
 * the shop and a legal page share no rhythm — so it would either need
 * per-page configuration or would guess, and a navigation control that guesses
 * wrong is worse than none. Return-to-top is unambiguous on every page and
 * pairs with the reading rail above it: the rail says how far down you are,
 * the arrow undoes it.
 *
 * IT IS A REAL BUTTON. Not a div with a click handler, not an `<a href="#top">`
 * — a `<button>`, so it is reachable by keyboard, announced as an action, and
 * activated by Enter and Space without a line of extra code. It is rendered
 * only once it becomes useful, so it never sits in the tab order of a page
 * that is not scrolled.
 *
 * MOTION. The scroll itself is smooth, except under `prefers-reduced-motion`,
 * where it jumps — the same rule RouteScrollManager already applies to
 * same-page Home clicks, kept consistent so the site has one answer to "how
 * does this page get back to the top".
 */
export function BackToTop({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);
  const label = getDictionary(locale).common.backToTop;

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      setVisible(window.scrollY > REVEAL_AFTER);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    // Correct on mount too — a reload landing mid-page, or a back/forward
    // restore, both arrive already scrolled.
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
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
        "group fixed bottom-6 z-40 inline-flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-white/70 shadow-[0_6px_20px_rgba(29,86,120,0.28)] transition-[background-color,transform,box-shadow,opacity] duration-[var(--motion-normal)] ease-[var(--motion-ease)] hover:bg-primary-hover hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus lg:size-12",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
      /* The white ring is what keeps this readable everywhere it can be
         scrolled past. The button is brand blue, and so is the footer
         (--surface-dark, one facet away from --primary), so over the footer a
         blue disc on blue all but disappears. On every light section the ring
         is white on white and invisible, costing nothing; over the footer it
         is the edge that separates the control from its ground. */
      style={{ insetInlineEnd: "1rem" }}
    >
      <ChevronUp className="size-5 transition-transform duration-[var(--motion-normal)] ease-[var(--motion-ease)] group-hover:-translate-y-0.5" aria-hidden="true" />
    </button>
  );
}
