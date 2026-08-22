"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { otherLocale, type Locale } from "@/i18n/config";

/**
 * Opens the equivalent translated page for the current route, not just a
 * naive /en/ -> /ar/ prefix swap — docs/ARCHITECTURE.md / brief §6.
 * If no registered route matches the current path, falls back to the
 * other locale's homepage rather than guessing an unrelated page.
 */
export function LanguageSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const target = otherLocale(locale);

  const currentPath = pathname.replace(new RegExp(`^/${locale}`), "") || "/";
  const matched = routes.find((r) => r.path[locale] === currentPath);
  const targetHref = matched ? `/${target}${matched.path[target]}` : `/${target}`;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="font-medium"
      render={<Link href={targetHref} hrefLang={target} lang={target} />}
    >
      {target === "ar" ? "العربية" : "English"}
    </Button>
  );
}
