"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routing";
import { localizedEntityRoutes } from "@/config/localized-entity-routes.generated";
import { otherLocale, type Locale } from "@/i18n/config";

/**
 * Opens the equivalent translated page for the current route, not just a
 * naive /en/ -> /ar/ prefix swap — docs/UI_UX_FOUNDATION.md, brief §69.
 *
 * Two registries have to be consulted, not one. `routes` is the
 * hand-maintained registry; `localizedEntityRoutes` is generated from the
 * CMS's own authored route alternates and is the ONLY place some entity
 * pages' Arabic slugs exist. Consulting `routes` alone (which is what this
 * did before) silently dropped every CMS-only entity page to the homepage
 * on language switch — the exact "do not send users unnecessarily back to
 * Home" failure §69 names. Falling back to the other locale's homepage is
 * still the last resort for a genuinely unregistered path, which is better
 * than guessing an unrelated page.
 */
export function LanguageSwitch({ locale, className }: { locale: Locale; className?: string }) {
  const pathname = usePathname();
  const target = otherLocale(locale);

  // usePathname() returns the percent-encoded path for non-ASCII slugs;
  // both registries store them decoded, so decode before comparing or the
  // Arabic side never matches and every Arabic page falls back to Home.
  const raw = pathname.replace(new RegExp(`^/${locale}`), "") || "/";
  let currentPath = raw;
  try {
    currentPath = decodeURIComponent(raw);
  } catch {
    // Malformed escape sequence in the URL — keep the raw value.
  }

  const matched = routes.find((r) => r.path[locale] === currentPath);
  const matchedEntity = matched
    ? undefined
    : localizedEntityRoutes.find((r) => r[locale] === currentPath);

  const targetHref = matched
    ? `/${target}${matched.path[target]}`
    : matchedEntity
      ? `/${target}${matchedEntity[target]}`
      : `/${target}`;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("font-medium", className)}
      render={<Link href={targetHref} hrefLang={target} lang={target} />}
    >
      {target === "ar" ? "العربية" : "English"}
    </Button>
  );
}
