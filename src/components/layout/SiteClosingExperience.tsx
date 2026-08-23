import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "./Container";
import { Button } from "@/components/ui/button";
import { getRoute } from "@/lib/routing";
import { siteConfig } from "@/config/site";
import { getDictionary, type Locale } from "@/i18n/config";

export type ClosingVariant = "light" | "editorial" | "deep";

const copy = {
  en: { exploreBooking: "Explore Booking Options" },
  ar: { exploreBooking: "استعرض خيارات الحجز" },
};

/**
 * One continuous closing atmosphere — booking CTA fading into the
 * footer's own tone, replacing what was previously three flat rectangles
 * (white section → saturated `bg-blue-4` CTA → charcoal `bg-surface-dark`
 * footer) with a single multi-stop gradient. `Footer.tsx` has no
 * background of its own anymore (transparent, picking up whatever
 * precedes it); this component's final gradient stop
 * (`--footer-blue-bottom`) is the exact value `--surface-dark` now
 * resolves to, so the two connect with no visible seam even though
 * they're separate DOM siblings (this component is rendered as the last
 * element of each page's own content, immediately before the shared
 * root-layout `<Footer>`) — a deliberately lower-risk alternative to
 * physically nesting `<Footer>` inside this component, which would have
 * meant moving the footer out of the root layout into every page.
 *
 * `variant` sets only the *starting* color (what the preceding section's
 * own bottom tone was) — every variant converges on the same
 * `--footer-blue-bottom` by the end, so the footer is always identical
 * regardless of which page led into it.
 */
export function SiteClosingExperience({ locale, variant = "light" }: { locale: Locale; variant?: ClosingVariant }) {
  const dict = getDictionary(locale);
  const t = copy[locale];
  const bookingHub = getRoute("book-appointment")!;
  const bookingHref = `/${locale}${bookingHub.path[locale]}`;

  const startColor =
    variant === "deep" ? "var(--closing-blue-mid)" : variant === "editorial" ? "var(--closing-mist)" : "var(--closing-surface-start)";

  return (
    <section
      className="relative isolate overflow-hidden px-4 py-[clamp(2.75rem,5.5vw,4.75rem)] text-center lg:px-6"
      style={{
        background: `radial-gradient(ellipse at 18% 12%, rgba(136,185,215,0.26) 0%, rgba(136,185,215,0.09) 34%, transparent 62%),
          radial-gradient(ellipse at 84% 60%, rgba(89,153,191,0.18) 0%, transparent 55%),
          linear-gradient(180deg,
            ${startColor} 0%,
            var(--closing-mist) 10%,
            var(--closing-blue-soft) 26%,
            var(--closing-blue-mid) 45%,
            var(--closing-blue-deep) 62%,
            var(--footer-blue-top) 76%,
            var(--footer-blue-mid) 90%,
            var(--footer-blue-bottom) 100%
          )`,
      }}
    >
      {/* Restrained diamond-facet atmosphere — decorative only, capped at
          ~6% opacity, never competing with the content above it. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 end-[10%] size-72 rotate-45"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 65%)" }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-3rem] start-[6%] size-80 rotate-45"
        style={{ background: "linear-gradient(315deg, rgba(255,255,255,0.045) 0%, transparent 65%)" }}
      />

      <Container className="relative mx-auto max-w-[760px]">
        <h2 data-reveal="up" className="text-display-2 font-heading lg:text-display-2-lg" style={{ color: "var(--closing-text-primary)" }}>
          {dict.home.finalCtaTitle}
        </h2>
        <p data-reveal="up" className="mx-auto mt-3 max-w-xl text-body-lg" style={{ color: "var(--closing-text-secondary)" }}>
          {dict.home.finalCtaBody}
        </p>
        <div data-reveal="up" className="mt-7 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            className="border-transparent hover:opacity-90"
            style={{ background: "rgba(255,255,255,0.94)", color: "var(--footer-blue-top)" }}
            render={<Link href={bookingHref} />}
          >
            {dict.common.bookAppointment}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/45 text-white hover:bg-white/10 hover:text-white focus-visible:ring-white"
            render={<Link href={bookingHref} />}
          >
            {t.exploreBooking} <ArrowRight className="ms-1 size-4 rtl:rotate-180" />
          </Button>
        </div>
        <a
          href={`tel:${siteConfig.clinic.phone}`}
          className="ltr-run mt-5 inline-flex items-center gap-1 text-sm font-semibold hover:text-white"
          style={{ color: "var(--closing-text-muted)" }}
        >
          {siteConfig.clinic.phoneDisplay} <ArrowUpRight className="size-4" />
        </a>
      </Container>
    </section>
  );
}
