import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * Visible breadcrumb trail + matching BreadcrumbList JSON-LD — brief §29/§32.
 * The final item (current page) is not a link and carries aria-current.
 */
export function Breadcrumbs({ locale, items }: { locale: Locale; items: BreadcrumbItem[] }) {
  const home = { label: locale === "ar" ? "الرئيسية" : "Home", href: `/${locale}` };
  const trail = [home, ...items];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${siteConfig.url}${item.href}` } : {}),
    })),
  };

  return (
    <nav aria-label={locale === "ar" ? "مسار التصفح" : "Breadcrumb"}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-text-secondary">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {index > 0 ? <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" /> : null}
              {isLast || !item.href ? (
                <span aria-current={isLast ? "page" : undefined} className={isLast ? "text-text-primary" : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </nav>
  );
}
