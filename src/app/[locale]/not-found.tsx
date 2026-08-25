import Link from "next/link";
import { headers } from "next/headers";
import { permanentRedirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { resolveFeelstackRedirect } from "@/lib/feelstack/redirect-resolver";
import { REQUEST_PATH_HEADER, REQUEST_QUERY_HEADER } from "@/proxy";

/**
 * Locale-aware 404. Next.js can't pass the [locale] param into not-found.tsx
 * directly, so this renders bilingually rather than guessing the wrong
 * language — a safe default when the failing route's own locale is unknown.
 */
export default async function NotFound() {
  // GAP-4 ladder rung 4: this boundary is reached only after the canonical
  // code route, the CMS resolver and the approved legacy map have all failed,
  // so consulting FeelStack's redirect history here can never shadow a live
  // route. A gated or unpublished route that deliberately 404s stays a 404,
  // because no redirect exists for it.
  //
  // The path comes from a header stamped by proxy.ts: not-found.tsx receives
  // no params, and an Arabic pretty-slug request has already been rewritten to
  // its English-slug folder by the time this renders, so the rendered route no
  // longer reflects the URL the visitor actually asked for.
  const headerList = await headers();
  const requestPath = headerList.get(REQUEST_PATH_HEADER);
  if (requestPath) {
    const rawQuery = headerList.get(REQUEST_QUERY_HEADER) ?? undefined;
    const moved = await resolveFeelstackRedirect(
      requestPath,
      rawQuery ? new URLSearchParams(rawQuery) : undefined,
    );
    // permanentRedirect throws, so nothing below runs when a redirect exists.
    if (moved) permanentRedirect(moved.destination);
  }

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">404</p>
      <h1 className="text-display-2 font-heading">
        Page not found <span className="text-text-secondary">·</span> الصفحة غير موجودة
      </h1>
      <p className="max-w-md text-body text-text-secondary">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
        <br />
        الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <div className="mt-4 flex gap-3">
        <Button render={<Link href="/en" />}>English home</Button>
        <Button variant="outline" render={<Link href="/ar" />}>
          الصفحة الرئيسية
        </Button>
      </div>
    </Container>
  );
}
