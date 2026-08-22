import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "./Logo";
import { FacebookGlyph, InstagramGlyph } from "./SocialIcons";
import { siteConfig } from "@/config/site";
import { href, getRoute } from "@/config/routes";
import { getDictionary, type Locale } from "@/i18n/config";
import { features } from "@/config/features";

/**
 * Dark premium footer — homepage surface rhythm §6 of the correction
 * brief. Every link below resolves through the route registry (real,
 * built pages only); legal links only render once `legalPagesEnabled`
 * is true, per the same gating rule that keeps them out of nav/sitemap.
 */
export function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: locale === "ar" ? "الرعاية الطبية" : "Medical Care",
      routeIds: ["medical-hub", "botox-hub", "doctors-index", "medical-uninsured-services"],
    },
    {
      heading: locale === "ar" ? "التجميل الطبي" : "Medical Aesthetics",
      routeIds: ["aesthetics-hub", "aesthetics-treatments-hub", "aesthetics-concerns-hub", "aesthetics-technologies-hub"],
    },
    {
      heading: locale === "ar" ? "بلو دايموند" : "Blue Diamond",
      routeIds: ["about", "careers", "contact", "book-appointment"],
    },
    {
      heading: locale === "ar" ? "موارد المرضى" : "Patient Resources",
      routeIds: ["patient-resources-hub", "health-hub", "shop-hub"],
    },
  ];

  const legalRoutes = ["legal-privacy-policy", "legal-terms", "legal-accessibility"];

  return (
    // Base color is still var(--surface-dark) (now the deep closing-blue,
    // not the old charcoal) — real fallback content is needed, "SEAMLESS
    // CLOSING SECTION AND FOOTER COLOR REDESIGN" §8's literal
    // `background: transparent` would just expose the plain white
    // <body> behind it on pages that don't render SiteClosingExperience
    // right before it, creating a *new* seam instead of removing one.
    // The subtle internal gradient overlay below (rgba fade-to-deeper,
    // per §8's own fallback snippet) is what actually satisfies "no flat
    // charcoal rectangle" — a soft continuation of the same tone, not a
    // second unrelated background.
    <footer className="relative isolate overflow-hidden bg-surface-dark" style={{ color: "var(--footer-text)" }}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "linear-gradient(180deg, rgba(16,47,66,0) 0%, rgba(16,47,66,0.34) 100%)" }}
      />
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr] lg:gap-8 lg:px-6 lg:py-20">
        <div className="flex flex-col gap-4">
          <Logo locale={locale} tone="reversed" />
          <p className="max-w-xs text-sm" style={{ color: "var(--footer-text-muted)" }}>{dict.footer.tagline}</p>
          <div>
            <p className="text-sm" style={{ color: "var(--footer-text-muted)" }}>
              {siteConfig.clinic.address.line1}, {siteConfig.clinic.address.city} {siteConfig.clinic.address.region}{" "}
              {siteConfig.clinic.address.postalCode}
            </p>
            <a
              className="ltr-run mt-1 inline-block text-sm font-medium hover:text-[color:var(--footer-link-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--footer-focus)]"
              style={{ color: "var(--footer-text)" }}
              href={`tel:${siteConfig.clinic.phone}`}
            >
              {siteConfig.clinic.phoneDisplay}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={siteConfig.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="rounded-full border border-surface-dark-border p-2 transition-colors hover:border-[color:var(--footer-focus)] hover:text-[color:var(--footer-focus)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--footer-focus)]"
              style={{ color: "var(--footer-text-muted)" }}
            >
              <FacebookGlyph className="size-4" />
            </a>
            <a
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-full border border-surface-dark-border p-2 transition-colors hover:border-[color:var(--footer-focus)] hover:text-[color:var(--footer-focus)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--footer-focus)]"
              style={{ color: "var(--footer-text-muted)" }}
            >
              <InstagramGlyph className="size-4" />
            </a>
          </div>
        </div>

        {columns.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <p className="text-xs font-semibold tracking-[0.1em] uppercase" style={{ color: "var(--footer-heading)" }}>{column.heading}</p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {column.routeIds
                .filter((id) => id !== "shop-hub" || features.shopEnabled)
                .map((id) => {
                  const route = getRoute(id);
                  if (!route) return null;
                  return (
                    <li key={id}>
                      <Link
                        href={`/${locale}${route.path[locale]}`}
                        className="text-sm hover:text-[color:var(--footer-link-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--footer-focus)]"
                        style={{ color: "var(--footer-text)" }}
                      >
                        {route.title[locale]}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-surface-dark-border px-4 py-6 lg:px-6">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 text-xs" style={{ color: "var(--footer-text-muted)" }}>
          <span>
            © {year} {siteConfig.clinic.name}. {dict.footer.rightsReserved}
          </span>
          {features.legalPagesEnabled ? (
            <div className="flex gap-5">
              {legalRoutes.map((id) => {
                const route = getRoute(id);
                if (!route) return null;
                return (
                  <Link key={id} href={`/${locale}${route.path[locale]}`} className="hover:text-[color:var(--footer-link-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--footer-focus)]">
                    {route.title[locale]}
                  </Link>
                );
              })}
            </div>
          ) : null}
          {/* Descriptive link text, not a generic "Learn more" — a real
              Lighthouse SEO finding (link-text audit) surfaced during the
              homepage redesign pass, fixed here since this footer link
              renders on every page. */}
          <Link
            href={href("contact", locale)}
            className="inline-flex items-center gap-1 font-medium hover:text-[color:var(--footer-link-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--footer-focus)]"
            style={{ color: "var(--footer-heading)" }}
          >
            {locale === "ar" ? "تواصلوا مع بلو دايموند الطبية" : "Contact Blue Diamond Medical"} <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
