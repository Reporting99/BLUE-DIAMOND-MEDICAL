"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { href } from "@/lib/routing";
import {
  navMenuLinkHref,
  navMenuLinkLabel,
  primaryNavHref,
  primaryNavLinks,
} from "@/config/navigation";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { getDictionary, type Locale } from "@/i18n/config";
import { getBookingUrl } from "@/config/booking";

/**
 * Mobile navigation — brief §20, §60, §91.
 *
 * Mirrors the desktop hierarchy exactly (one navigation definition,
 * src/config/navigation.ts, rendered two ways): Home, then MEDICAL and
 * AESTHETICS as collapsible groups, then Our Team, About, Contact.
 *
 * The two care areas are kept visibly separate and each group's contents
 * are sub-grouped by the same headings the desktop mega menu uses
 * (Treatments / Concerns / Technologies under Aesthetics; services and
 * Uninsured Services under Medical), so a phone user is never handed one
 * undifferentiated list of ~30 links — §20's "keep Medical and Aesthetics
 * separated, group Treatments / Concerns / Technologies", and §54's
 * "avoid giant menus".
 *
 * Booking and the language switch sit ABOVE the accordions and are never
 * inside one, so both are reachable without expanding anything (§20:
 * "show Booking clearly, show language switching clearly"). Every row is
 * min-h-11 (44px) — the WCAG 2.5.8 target size — and the whole panel is a
 * single scroll container, so a long group scrolls inside the sheet rather
 * than overflowing the screen or trapping the page behind it.
 *
 * Each group's hub is reachable directly from the group itself (the
 * "View all …" row), so the collapsible never becomes a dead end for
 * someone who just wants the Medical or Aesthetics landing page.
 */
export function MobileNav({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const dict = getDictionary(locale);
  const booking = getBookingUrl("family-doctor");

  const rowClass =
    "flex min-h-11 items-center rounded-md px-2 text-base font-medium !no-underline hover:bg-surface";
  const subRowClass =
    "flex min-h-11 items-center rounded-md px-2 text-sm text-text-secondary !no-underline hover:bg-surface";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-11 lg:hidden"
            aria-label={dict.nav.openMenu}
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent
        side={locale === "ar" ? "left" : "right"}
        className="flex w-full max-w-sm flex-col"
        showCloseButton={false}
      >
        <SheetHeader className="flex-row items-center justify-between space-y-0">
          <SheetTitle>{locale === "ar" ? "القائمة" : "Menu"}</SheetTitle>
          <SheetClose
            render={<Button variant="ghost" size="icon" className="size-11" aria-label={dict.nav.closeMenu} />}
          >
            <X className="size-5" />
          </SheetClose>
        </SheetHeader>

        {/* The one scroll container. Everything below the header scrolls
            here, so a long Aesthetics group can never push Booking or the
            close control off-screen. */}
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pb-6">
          <div className="flex items-center gap-2">
            <Button
              size="lg"
              className="min-h-11 flex-1"
              render={<a href={booking.href} target="_blank" rel="noopener noreferrer" />}
            >
              {dict.common.bookAppointment}
            </Button>
            {/* min-h-11 / min-w-11: inside the drawer this is a primary
                one-handed control, and the header's compact `size="sm"`
                button measured 28px tall here — under the 44px WCAG 2.5.8
                target size (measured, not assumed). */}
            <SheetClose render={<div />}>
              <LanguageSwitch locale={locale} className="min-h-11 min-w-11 px-4" />
            </SheetClose>
          </div>

          <nav className="flex flex-col gap-1" aria-label={locale === "ar" ? "القائمة الرئيسية" : "Primary"}>
            {primaryNavLinks.map((link) =>
              link.columns ? (
                <Accordion key={link.id} className="w-full">
                  <AccordionItem value={link.id}>
                    <AccordionTrigger className="min-h-11 text-base">{dict.nav[link.labelKey]}</AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col gap-3">
                        {/* The group's own hub, first — never a dead end. */}
                        <SheetClose
                          render={
                            <Link
                              href={primaryNavHref(link, locale)}
                              className="flex min-h-11 items-center rounded-md px-2 text-sm font-semibold text-primary !no-underline hover:bg-surface"
                            />
                          }
                        >
                          {dict.nav[link.labelKey]}
                        </SheetClose>

                        {link.columns.map((column) => (
                          <div key={column.id} className="flex flex-col gap-0.5">
                            <p className="px-2 pt-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-text-muted">
                              {dict.nav[column.headingKey]}
                            </p>
                            {column.links.map((item) => (
                              <SheetClose
                                key={item.id}
                                render={<Link href={navMenuLinkHref(item, locale)} className={subRowClass} />}
                              >
                                {navMenuLinkLabel(item, locale)}
                              </SheetClose>
                            ))}
                            {column.viewAll ? (
                              <SheetClose
                                render={
                                  <Link
                                    href={href(column.viewAll.routeId, locale)}
                                    className="flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-primary !no-underline hover:bg-surface"
                                  />
                                }
                              >
                                {dict.nav[column.viewAll.labelKey]}
                              </SheetClose>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <SheetClose
                  key={link.id}
                  render={<Link href={primaryNavHref(link, locale)} className={rowClass} />}
                >
                  {dict.nav[link.labelKey]}
                </SheetClose>
              ),
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
