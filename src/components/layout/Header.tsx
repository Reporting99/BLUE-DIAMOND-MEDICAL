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
  primaryNavHref,
  primaryNavLinks,
  treatmentsHubRouteId,
  treatmentsMenuHref,
  treatmentsMenuItems,
} from "@/config/navigation";
import { getDictionary, type Locale } from "@/i18n/config";
import { getBookingUrl } from "@/config/booking";
import { cn } from "@/lib/utils";

/** Pixels of scroll before the homepage header switches from transparent-over-hero to the floating light state — brief §10's 40-60px range. */
const SCROLL_THRESHOLD = 48;

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
  const treatmentsHubHref = href(treatmentsHubRouteId, locale);

  const pathname = usePathname();
  const isHomepage = pathname === `/${locale}` || pathname === `/${locale}/`;
  const [scrolled, setScrolled] = useState(false);
  // Controls the Treatments dropdown explicitly — see the comment above the
  // NavigationMenu below for why this is needed instead of the primitive's
  // built-in open state.
  const [openMenuValue, setOpenMenuValue] = useState<string | null>(null);
  const treatmentsItemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    // A native listener on the real <li> DOM node, not a React onFocus
    // prop — confirmed by direct browser testing this pass that an
    // onFocus prop passed through NavigationMenuItem/NavigationMenuTrigger's
    // `render` composition does not reliably reach the underlying element
    // (Base UI's internal prop merging for this primitive doesn't forward
    // it), while ref forwarding is a guaranteed React contract. `focusin`
    // bubbles, so this fires for the trigger itself and, once open, for
    // every link inside the panel — keeping it open while tabbing through.
    const el = treatmentsItemRef.current;
    if (!el) return;
    const openTreatments = () => setOpenMenuValue("treatments");
    el.addEventListener("focusin", openTreatments);
    return () => el.removeEventListener("focusin", openTreatments);
  }, []);

  useEffect(() => {
    // Only the homepage has a full-bleed hero for the header to float
    // over — every other page keeps its existing always-solid sticky
    // header untouched, so no listener is needed off the homepage.
    if (!isHomepage) return;

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
  }, [isHomepage]);

  // Hero backgrounds on this site are light (soft white/blue radial
  // gradient + two light placeholder images), so the transparent state
  // uses the existing dark-on-light text/logo colors throughout — no
  // white-text/dark-hero variant is needed for the hero this site
  // actually has. If a future hero becomes dark, swap `tone="default"`
  // below for `tone="reversed"` only in the `floating` (unscrolled) state.
  const floating = isHomepage && !scrolled;

  return (
    <header
      className={cn(
        "z-50 h-[72px] transition-[background-color,box-shadow,border-color,height] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        isHomepage
          ? "fixed inset-x-0 top-0"
          : "sticky top-0 border-b border-border bg-background/95",
        // Internal pages (non-homepage) stay at the settled 72px height
        // permanently — no hero to float transparently over, so this is
        // the "accessible surface appropriate to the page hero" state
        // (brief §9) at all times, not just after scrolling.
        isHomepage && floating && "h-[92px] border-b border-transparent bg-transparent shadow-none",
        isHomepage && !floating &&
          "h-[72px] border-b border-[rgba(29,86,120,0.10)] bg-[rgba(255,255,255,0.84)] shadow-[0_1px_16px_rgba(29,86,120,0.08)] backdrop-blur-[16px]",
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:start-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-4 focus-visible:py-2 focus-visible:text-primary-foreground"
      >
        {dict.common.skipToContent}
      </a>

      <div
        className={cn(
          "mx-auto flex h-full items-center justify-between gap-4 transition-[max-width,padding-inline] duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          isHomepage && floating
            ? "max-w-none px-5 sm:px-8 lg:px-16"
            : "max-w-[1280px] px-4 lg:px-6",
        )}
      >
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
        <NavigationMenu
          className="hidden lg:flex"
          delay={80}
          closeDelay={150}
          value={openMenuValue}
          onValueChange={setOpenMenuValue}
        >
          <NavigationMenuList>
            {/* Home, Services */}
            {primaryNavLinks.slice(0, 2).map((link) => (
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
            ))}

            {/* Treatments — clicking or pressing Enter/Space on the label
                navigates to the Treatments hub (real <a href>, native
                anchor activation); hovering OR keyboard-focusing it reveals
                the dropdown of 10 procedures first (brief §6/§7), so a
                keyboard user sees every option before deciding whether to
                continue into the panel or activate the link. closeDelay
                above (150ms, inside the brief's 120-180ms range) keeps it
                open while the pointer travels from the label down into the
                panel. */}
            <NavigationMenuItem value="treatments" ref={treatmentsItemRef}>
              <NavigationMenuTrigger
                render={<Link href={treatmentsHubHref} />}
                nativeButton={false}
              >
                {dict.nav.treatments}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-0.5 p-2 sm:w-[560px] sm:grid-cols-2">
                  {treatmentsMenuItems.map((item) => (
                    <li key={item.id}>
                      <NavigationMenuLink
                        render={<Link href={treatmentsMenuHref(item, locale)} />}
                      >
                        {item.title[locale]}
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border p-2">
                  <NavigationMenuLink
                    render={<Link href={treatmentsHubHref} />}
                    className="font-medium text-primary hover:bg-transparent hover:underline"
                  >
                    {dict.nav.viewAllTreatments}
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Medical Aesthetics, Our Team, About, Contact — plain links,
                never a single-item dropdown (brief §8 explicitly forbids a
                dropdown whose only child duplicates the trigger label). */}
            {primaryNavLinks.slice(2).map((link) => (
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
            ))}
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
  );
}
