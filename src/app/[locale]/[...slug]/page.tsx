import { notFound } from "next/navigation";

import { pathnameFrom, redirectOrNotFound, toSearchParams } from "@/lib/feelstack/redirect-or-404";
import { isLocale } from "@/i18n/config";

/**
 * Multi-segment catch-all: the last thing Next tries before the not-found
 * boundary.
 *
 * Every real page on this site is an explicit route, and Next matches static
 * segments before dynamic ones and dynamic before catch-all, so adding this
 * cannot shadow anything that already resolves. What it changes is what
 * happens to a path that resolves to NOTHING: previously an immediate 404,
 * now one FeelStack redirect lookup first, so a page renamed in the CMS keeps
 * its old URL working without anyone hand-editing a static alias map.
 *
 * Deliberately not prerendered. There is no generateStaticParams, so this
 * route is dynamic by construction and reading searchParams here cannot flip
 * a statically prerendered page to dynamic.
 */
export const dynamic = "force-dynamic";

export default async function CatchAll({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<never> {
  const { locale, slug } = await params;
  // An unknown locale is not a rename; it is a bad URL. Asking the CMS about
  // it would send a lookup per junk request.
  if (!isLocale(locale)) notFound();

  return redirectOrNotFound(
    pathnameFrom(locale, slug ?? []),
    locale,
    toSearchParams(await searchParams),
  );
}
