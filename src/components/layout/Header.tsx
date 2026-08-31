"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { href } from "@/lib/routing";
import {
  navMenuLinkHref,
  navMenuLinkLabel,
  primaryNavHref,
  primaryNavLinks,
} from "@/config/navigation";
import { getDictionary, type Locale } from "@/i18n/config";
import { getBookingUrl } from "@/config/booking";
import { cn } from "@/lib/utils";

/** Pixels of scroll before the header settles from its resting state into
 * its compact scrolled state. */
const SCROLL_THRESHOLD = 48;

/** Resting header height (px) — a little more breathing room, per the
 * navbar-motion brief §15. */
const HEADER_HEIGHT_REST = 84;
/** Settled/scrolled header height (px). The delta is deliberately 12px:
 * enough to read as "the header tightened up", small enough that nothing
 * visibly snaps (brief §15's "subtle, continuous, non-distracting"). */
const HEADER_HEIGHT_SCROLLED = 72;

/**
 * Single authoritative global navigation — "FINAL MANDATORY NAVIGATION"
 * brief. Used on every public page (brief §9): homepage gets the
 * transparent-over-hero -> scrolled-translucent treatment; every other
 * page reuses the same component in its settled/translucent state, which
 * is the "accessible surface appropriate to the page hero" the brief asks
 * for on internal pages (none of which have a full-bleed hero to float
 * transparently over). One component, one nav hierarchy, never two.
 */
export function Header({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const booking = getBookingUrl("family-doctor");

  const pathname = usePathname();
  const isHomepage = pathname === `/${locale}` || pathname === `/${locale}/`;
  const [scrolled, setScrolled] = useState(false);
  // Controls which mega menu is open explicitly — see the comment above the
  // NavigationMenu below for why this is needed instead of the primitive's
  // built-in open state.
  const [openMenuValue, setOpenMenuValue] = useState<string | null>(null);
  const menuItemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    // A native listener on the real <li> DOM node, not a React onFocus
    // prop — confirmed by direct browser testing that an onFocus prop
    // passed through NavigationMenuItem/NavigationMenuTrigger's `render`
    // composition does not reliably reach the underlying element (Base
    // UI's internal prop merging for this primitive doesn't forward it),
    // while ref forwarding is a guaranteed React contract. `focusin`
    // bubbles, so this fires for the trigger itself and, once open, for
    // every link inside the panel — keeping it open while tabbing through.
    // Now registered for BOTH mega menus (Medical and Aesthetics), not
    // just the one dropdown this used to be.
    const cleanups: Array<() => void> = [];
    for (const link of primaryNavLinks) {
      if (!link.columns) continue;
      const el = menuItemRefs.current[link.id];
      if (!el) continue;
      const open = () => setOpenMenuValue(link.id);
      el.addEventListener("focusin", open);
      cleanups.push(() => el.removeEventListener("focusin", open));
    }
    return () => {
      for (const c of cleanups) c();
    };
  }, []);

  useEffect(() => {
    // Runs on EVERY page, not just the homepage — brief §16: the same
    // global header motion has to be verifiable on Medical, Aesthetics,
    // treatment/concern/technology, team, product, about, resources,
    // contact and legal pages, not fixed on Home alone.
    let ticking = false;
    const updateScrolled = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateScrolled);
    };
    // Correct on mount too — e.g. a reload landing mid-scroll, or
    // back/forward cache restoring a scrolled position.
    updateScrolled();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hero backgrounds on this site are light (soft white/blue radial
  // gradient + two light placeholder images), so the transparent state
  // uses the existing dark-on-light text/logo colors throughout — no
  // white-text/dark-hero variant is needed for the hero this site
  // actually has. If a future hero becomes dark, swap `tone="default"`
  // below for `tone="reversed"` only in the `atRest` state.
  //
  // NAVBAR MOTION (brief §14-§17). What changed, and why:
  //
  //  * The header is `fixed` on EVERY page now (it used to be `fixed` only
  //    on the homepage and `sticky` everywhere else). `fixed` is what makes
  //    an animated height safe: an out-of-flow header can shrink without
  //    moving a single pixel of page content. The static spacer rendered
  //    below reserves the resting height on non-homepage routes, so there
  //    is no layout shift when the scrolled state engages — §15's "no
  //    content shifting when sticky state activates", enforced by
  //    construction rather than by tuning.
  //
  //  * The inner row's geometry is now IDENTICAL in both states —
  //    `max-w-[1280px]` and the same inline padding, always. Previously the
  //    resting state was full-bleed (`max-w-none` + `lg:px-16`) and the
  //    scrolled state was a centred 1280px container, so scrolling dragged
  //    the logo and the booking button horizontally across the viewport.
  //    Measured against the previous release: 69px at 1440, 184px at 1728,
  //    280px at 1920. That horizontal travel is the "navbar feels far away
  //    and then approaches the content" effect the brief describes. It now
  //    measures 0px at all three widths — nothing translates any more.
  //
  //  * Only four things still animate, all of them non-positional:
  //    background colour, border colour, shadow, and 12px of height.
  const atRest = !scrolled;

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color,height] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        atRest
          ? [
              "border-b",
              // Only the homepage has a full-bleed hero worth floating a
              // transparent header over. Every other page rests on an
              // opaque surface instead — same motion, same geometry, same
              // timing; only the resting fill differs, because floating
              // transparently over ordinary page copy would make the nav
              // links unreadable rather than premium.
              isHomepage
                ? "border-transparent bg-transparent shadow-none"
                : "border-transparent bg-background shadow-none",
            ]
          : "border-b border-[rgba(29,86,120,0.10)] bg-[rgba(255,255,255,0.84)] shadow-[0_1px_16px_rgba(29,86,120,0.08)] backdrop-blur-[16px]",
      )}
      style={{ height: atRest ? HEADER_HEIGHT_REST : HEADER_HEIGHT_SCROLLED }}
    >
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:start-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-primary-foreground"
      >
        {dict.common.skipToContent}
      </a>

      {/* No `transition-[max-width,padding-inline]` and no state-dependent
          classes here on purpose — see the note above. The row's horizontal
          geometry is fixed so nothing inside it ever slides sideways. */}
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-4 px-4 lg:px-6">
        {/* Logo — far inline-start in LTR, far inline-end in RTL (handled
            automatically by dir + justify-between, no manual left/right). */}
        <Logo locale={locale} />

        {/* Primary navigation — centered, hidden below lg to avoid the
            desktop links ever wrapping (brief §12: Arabic labels are wider,
            so this breakpoint is content-driven, not device-driven — lg
            was verified as the point Arabic no longer wraps, see
            tests/e2e/navigation.spec.ts).
            `value`/`onValueChange` control the Treatments panel explicitly:
            Base UI's built-in trigger only opens on hover/click by default
            (confirmed by direct browser testing this pass — plain Tab-focus
            left `aria-expanded="false"`), which doesn't satisfy brief §6's
            "keyboard focus opens the menu." The Treatments item's onFocus
            below opens it the moment focus lands anywhere inside it (the
            trigger or, once open, any of its 10 links), a real gap fixed
            this pass rather than assumed to already work from the
            primitive alone. */}
        {/* Primary navigation — hidden below lg to avoid the desktop links
            ever wrapping (Arabic labels are wider, so this breakpoint is
            content-driven, not device-driven — see tests/e2e/navigation.spec.ts).

            `value`/`onValueChange` control the mega-menu panels explicitly:
            Base UI's built-in trigger only opens on hover/click by default
            (verified by direct browser testing — plain Tab-focus left
            `aria-expanded="false"`), which doesn't satisfy the keyboard
            requirement. The focusin listener registered above opens a panel
            the moment focus lands anywhere inside it (the trigger, or once
            open any link in it), so a keyboard user sees every option before
            deciding whether to continue into the panel or activate the label
            itself. closeDelay (150ms) keeps a panel open while the pointer
            travels from the label down into it. */}
        <NavigationMenu
          className="hidden lg:flex"
          delay={80}
          closeDelay={150}
          value={openMenuValue}
          onValueChange={setOpenMenuValue}
        >
          <NavigationMenuList>
            {primaryNavLinks.map((link) =>
              link.columns ? (
                // MEDICAL / AESTHETICS — the label itself is a real <a href>
                // to the hub (native anchor activation on click and on
                // Enter), and hovering or focusing it opens the mega menu
                // first, so "I know exactly what I want" and "show me what
                // there is" are both one interaction.
                <NavigationMenuItem
                  key={link.id}
                  value={link.id}
                  ref={(node: HTMLLIElement | null) => {
                    menuItemRefs.current[link.id] = node;
                  }}
                >
                  <NavigationMenuTrigger
                    render={<Link href={primaryNavHref(link, locale)} />}
                    nativeButton={false}
                  >
                    {dict.nav[link.labelKey]}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div
                      className={cn(
                        "grid w-[320px] gap-x-6 gap-y-1 p-3 sm:w-max sm:max-w-[min(92vw,860px)]",
                        link.columns.length === 3
                          ? "sm:grid-cols-3"
                          : "sm:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]",
                      )}
                    >
                      {link.columns.map((column) => (
                        <div key={column.id} className="min-w-[190px]">
                          <p className="px-2 pb-1.5 pt-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-text-muted">
                            {dict.nav[column.headingKey]}
                          </p>
                          <ul className="flex flex-col gap-0.5">
                            {column.links.map((item) => (
                              <li key={item.id}>
                                <NavigationMenuLink render={<Link href={navMenuLinkHref(item, locale)} />}>
                                  {navMenuLinkLabel(item, locale)}
                                </NavigationMenuLink>
                              </li>
                            ))}
                            {column.viewAll ? (
                              <li className="mt-1 border-t border-border pt-1">
                                <NavigationMenuLink
                                  render={<Link href={href(column.viewAll.routeId, locale)} />}
                                  className="font-medium text-primary hover:bg-transparent hover:underline"
                                >
                                  {dict.nav[column.viewAll.labelKey]}
                                </NavigationMenuLink>
                              </li>
                            ) : null}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ) : (
                // HOME, OUR TEAM, ABOUT, CONTACT — plain links, never a
                // single-item dropdown whose only child duplicates its label.
                <NavigationMenuItem key={link.id}>
                  <NavigationMenuLink
                    render={
                      <Link
                        href={primaryNavHref(link, locale)}
                        className="group inline-flex h-9 w-max items-center justify-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted hover:text-primary"
                      />
                    }
                  >
                    {dict.nav[link.labelKey]}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ),
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Language + Book Appointment — far inline-end in LTR, far
            inline-start in RTL. */}
        <div className="flex items-center gap-2">
          <LanguageSwitch locale={locale} />
          <Button
            className="hidden sm:inline-flex"
            render={<a href={booking.href} target="_blank" rel="noopener noreferrer" />}
          >
            {dict.common.bookAppointment}
          </Button>
          <MobileNav locale={locale} />
        </div>
      </div>
    </header>

    {/* Flow spacer for the fixed header on every non-homepage route. Its
        height is the RESTING height, so content sits directly beneath the
        header at scrollY 0 and nothing moves when the header later shrinks
        to its scrolled height — the header animates out of flow, the
        reserved space never changes. The homepage deliberately has no
        spacer: its hero is designed to extend up behind the transparent
        resting header, and carries its own top padding instead. */}
    {isHomepage ? null : <div aria-hidden="true" style={{ height: HEADER_HEIGHT_REST }} />}
    </>
  );
}
