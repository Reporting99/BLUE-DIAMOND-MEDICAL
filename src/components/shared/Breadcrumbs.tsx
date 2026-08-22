import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { buildBreadcrumbSchema, buildBreadcrumbTrail } from "@/lib/schema";
import type { BreadcrumbItem } from "@/lib/schema";
import type { Locale } from "@/i18n/config";
import { JsonLd } from "./schema/JsonLd";

/**
 * Visible breadcrumb trail + matching BreadcrumbList JSON-LD. The final item
 * (current page) is not a link and carries aria-current. The trail rendered
 * here and the trail described in the schema are the same array, so the two
 * cannot drift.
 */
export function Breadcrumbs({ locale, items }: { locale: Locale; items: BreadcrumbItem[] }) {
  const trail = buildBreadcrumbTrail(locale, items);

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
      <JsonLd data={buildBreadcrumbSchema(trail)} />
    </nav>
  );
}
