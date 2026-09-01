"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * One global scroll-reveal observer — docs/UI_UX_FOUNDATION.md §9-10.
 * Deliberately not a wrapper component or a Framer Motion tree: this is a
 * single Client Component mounted once in the root layout, using one
 * IntersectionObserver for the whole page. Every Server Component stays a
 * Server Component; they just carry a `data-reveal="up|start|end|scale"`
 * attribute, styled entirely in CSS (globals.css).
 *
 * Progressive enhancement: `.reveal-active` is added to <html> only after
 * this component mounts, which is also the moment the CSS rules that hide
 * [data-reveal] elements start applying — so a no-JS visitor or a crawler
 * that never runs this effect sees fully visible, complete HTML.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("reveal-active");

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)"));
    if (elements.length === 0) return;

    if (prefersReducedMotion) {
      // CSS already forces full visibility under reduced motion, but mark
      // elements revealed too so no observer work happens at all.
      for (const el of elements) el.classList.add("is-revealed");
      return;
    }

    // One callback, shared by both observers below. It takes the observer to
    // unobserve from as its second argument — which IntersectionObserver
    // passes in — rather than closing over a variable, so the same function
    // serves two observers without either needing a reference to itself.
    const reveal: IntersectionObserverCallback = (entries, self) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          self.unobserve(entry.target); // reveal once, then stop watching
        }
      }
    };

    const ROOT_MARGIN = "0px 0px -8% 0px";
    const observer = new IntersectionObserver(reveal, { threshold: 0.12, rootMargin: ROOT_MARGIN });

    /**
     * The same reveal, for elements that are too tall for a 12% threshold to
     * be reachable.
     *
     * `threshold: 0.12` means "12% of THIS ELEMENT is inside the root", not
     * "12% of the root is covered" — so for an element more than ~8x the
     * viewport's height (a full price list, a long legal document) the
     * condition can never become true no matter how far it is scrolled, and
     * the element stays at opacity 0 forever. That is a content-invisible-to-
     * everyone bug, and one an author cannot reasonably be expected to
     * predict from markup, so it is handled here rather than by a rule about
     * which elements may carry `data-reveal`.
     *
     * These elements reveal the moment they touch the root instead. The
     * distinction is invisible in practice: something that tall is entering
     * the viewport for a long time either way.
     */
    const tallObserver = new IntersectionObserver(reveal, { threshold: 0, rootMargin: ROOT_MARGIN });

    // 0.92 mirrors the -8% bottom rootMargin: that is the effective height of
    // the observer's root, and therefore the largest intersection any element
    // can ever report.
    const reachableHeight = window.innerHeight * 0.92;
    for (const el of elements) {
      const needed = el.getBoundingClientRect().height * 0.12;
      (needed > reachableHeight ? tallObserver : observer).observe(el);
    }

    // Keyboard-only users can Tab to a focusable element inside a
    // [data-reveal] section before it has scrolled into the
    // IntersectionObserver's margin (e.g. Tab-ing quickly past a
    // just-barely-offscreen section). `focusin` bubbles, so one listener
    // catches every case: reveal the ancestor immediately rather than
    // ever leaving focused content sitting at opacity 0.
    function revealOnFocus(event: FocusEvent) {
      const target = event.target as HTMLElement | null;
      const revealTarget = target?.closest<HTMLElement>("[data-reveal]:not(.is-revealed)");
      if (revealTarget) {
        revealTarget.classList.add("is-revealed");
        observer.unobserve(revealTarget);
        tallObserver.unobserve(revealTarget);
      }
    }
    document.addEventListener("focusin", revealOnFocus);

    return () => {
      observer.disconnect();
      tallObserver.disconnect();
      document.removeEventListener("focusin", revealOnFocus);
    };
    // Re-scan on every route change — this component lives in the
    // persistent [locale] layout, so App Router navigations don't remount
    // it, but they do swap in new [data-reveal] elements underneath it.
  }, [pathname]);

  return null;
}
