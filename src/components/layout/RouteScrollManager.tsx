"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * One global, authoritative answer to "where does the page start after a
 * navigation?" — mandatory brief §2-§5, §23, §84, §85, §90.
 *
 * There are three distinct cases, and the whole point of doing this in one
 * place is that each one is handled deliberately instead of by scattering
 * `window.scrollTo()` calls through components:
 *
 * 1. FORWARD NAVIGATION TO A DIFFERENT URL (link, card, breadcrumb, footer,
 *    mobile menu, language switch). The destination must start at the top.
 *    Next.js already does this, but it does it *before* late layout work
 *    (fonts settling, CMS images resolving their intrinsic box, the
 *    `[data-reveal]` observer in ScrollReveal marking sections visible).
 *    Any of those can leave the viewport a few hundred pixels down. This
 *    re-asserts scroll 0 on the frame after commit, so the destination is
 *    at its top once, deterministically, with no second visible jump.
 *
 * 2. BACK / FORWARD (popstate). The browser's restored position is correct
 *    and expected UX — the brief's rule is about not preserving an
 *    *arbitrary* position on a normal navigation, not about breaking the
 *    Back button. `popstate` fires before React re-renders, so the flag it
 *    sets is always read by the very navigation it describes.
 *
 * 3. AN INTENTIONAL SAME-PAGE ANCHOR (`/page#faq`). Left completely alone —
 *    that is the one case where landing below the top is the correct answer.
 *
 * Plus the case Next.js has no opinion about at all: clicking a link that
 * resolves to the URL you are already on (HOME in the navbar while you are
 * deep on the homepage; the logo; the mobile menu's Home row). App Router
 * treats that as a no-op and never scrolls, which is exactly the reported
 * "click HOME, stay at the statistics section" defect. The capture-phase
 * click listener below turns it into a smooth return to the top (brief §4),
 * or an instant one under `prefers-reduced-motion`.
 */
export function RouteScrollManager() {
  const pathname = usePathname();
  const isHistoryNavigation = useRef(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const onPopState = () => {
      isHistoryNavigation.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Same-URL internal links — capture phase so this runs before Next's own
  // Link handler, and without preventDefault so App Router keeps whatever
  // behaviour it has for the anchor itself.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // A hash link is a deliberate in-page destination — never override it.
      if (url.hash) return;
      if (url.pathname !== window.location.pathname || url.search !== window.location.search) return;
      if (window.scrollY === 0) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "smooth" });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    // First render is the initial document load (or a reload). The browser
    // owns that position; re-asserting 0 here would break deep links and
    // fight native reload restoration.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isHistoryNavigation.current) {
      isHistoryNavigation.current = false;
      return;
    }
    if (window.location.hash) return;

    // One frame after the new page has committed — late enough that a
    // layout pass cannot leave us mid-page, early enough to be invisible.
    // `instant` (not `smooth`) so the arrival can never be a visible glide
    // through the destination's content, and can never be aborted halfway
    // by a wheel/touch event, which is what leaves a user stranded in the
    // middle of a page they just navigated to.
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
