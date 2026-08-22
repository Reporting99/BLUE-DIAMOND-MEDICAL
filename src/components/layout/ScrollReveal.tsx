"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * One global scroll-reveal observer — docs/ARCHITECTURE.md-10.
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

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target); // reveal once, then stop watching
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    for (const el of elements) observer.observe(el);

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
      }
    }
    document.addEventListener("focusin", revealOnFocus);

    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", revealOnFocus);
    };
    // Re-scan on every route change — this component lives in the
    // persistent [locale] layout, so App Router navigations don't remount
    // it, but they do swap in new [data-reveal] elements underneath it.
  }, [pathname]);

  return null;
}
