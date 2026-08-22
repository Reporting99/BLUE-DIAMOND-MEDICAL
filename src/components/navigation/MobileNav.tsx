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
import { href } from "@/config/routes";
import {
  primaryNavHref,
  primaryNavLinks,
  treatmentsHubRouteId,
  treatmentsMenuHref,
  treatmentsMenuItems,
} from "@/config/navigation";
import { getDictionary, type Locale } from "@/i18n/config";
import { getBookingUrl } from "@/config/booking";

/**
 * Full-screen drawer opening from the trailing edge, focus-trapped and
 * Escape-closable via shadcn Sheet (Base UI Dialog underneath) —
 * docs/ARCHITECTURE.md Mirrors the desktop order exactly (brief
 * §3/§12): Home, Services, Treatments (accordion), Medical Aesthetics, Our
 * Team, About, Contact. "Book Appointment" stays outside the collapsible
 * groups as a persistent, prominent action, never buried in an accordion.
 */
export function MobileNav({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const dict = getDictionary(locale);
  const booking = getBookingUrl("family-doctor");
  const treatmentsHubHref = href(treatmentsHubRouteId, locale);

  const [home, services] = primaryNavLinks;
  const rest = primaryNavLinks.slice(2);

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
      <SheetContent side={locale === "ar" ? "left" : "right"} className="w-full max-w-sm" showCloseButton={false}>
        <SheetHeader className="flex-row items-center justify-between space-y-0">
          <SheetTitle>{locale === "ar" ? "القائمة" : "Menu"}</SheetTitle>
          <SheetClose
            render={<Button variant="ghost" size="icon" className="size-11" aria-label={dict.nav.closeMenu} />}
          >
            <X className="size-5" />
          </SheetClose>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">
          <Button size="lg" className="min-h-11" render={<a href={booking.href} target="_blank" rel="noopener noreferrer" />}>
            {dict.common.bookAppointment}
          </Button>

          <nav className="flex flex-col gap-1" aria-label={locale === "ar" ? "القائمة الرئيسية" : "Primary"}>
            {/* Home, Services — direct links, always visible, no accordion. */}
            {[home, services].map((link) => (
              <SheetClose
                key={link.id}
                render={
                  <Link
                    href={primaryNavHref(link, locale)}
                    className="flex min-h-11 items-center rounded-md px-2 text-base font-medium hover:bg-surface"
                  />
                }
              >
                {dict.nav[link.labelKey]}
              </SheetClose>
            ))}

            {/* Treatments — accessible accordion (brief §6). First tap
                expands the 10-item list; "View all treatments" always
                opens the Treatments hub directly. */}
            <Accordion className="w-full">
              <AccordionItem value="treatments">
                <AccordionTrigger className="min-h-11 text-base">{dict.nav.treatments}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-0.5">
                    {treatmentsMenuItems.map((item) => (
                      <SheetClose
                        key={item.id}
                        render={
                          <Link
                            href={treatmentsMenuHref(item, locale)}
                            // AccordionContent's shared `[&_a]:underline`
                            // (correct for FAQ-style prose accordions
                            // elsewhere) is a descendant selector, which
                            // outranks a plain `no-underline` utility on
                            // specificity — the `!` important-modifier is
                            // needed to actually win here, not source order.
                            className="flex min-h-11 items-center rounded-md px-2 text-sm text-text-secondary !no-underline hover:bg-surface"
                          />
                        }
                      >
                        {item.title[locale]}
                      </SheetClose>
                    ))}
                    <SheetClose
                      render={
                        <Link
                          href={treatmentsHubHref}
                          className="flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-primary !no-underline hover:bg-surface"
                        />
                      }
                    >
                      {dict.nav.viewAllTreatments}
                    </SheetClose>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Medical Aesthetics, Our Team, About, Contact — direct links. */}
            {rest.map((link) => (
              <SheetClose
                key={link.id}
                render={
                  <Link
                    href={primaryNavHref(link, locale)}
                    className="flex min-h-11 items-center rounded-md px-2 text-base font-medium hover:bg-surface"
                  />
                }
              >
                {dict.nav[link.labelKey]}
              </SheetClose>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
