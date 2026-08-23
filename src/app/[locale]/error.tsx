"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";

/**
 * Route-segment error boundary — brief §5/§17 required structure
 * (`app/[locale]/error.tsx`). Catches thrown `FeelStackUnavailableError`s
 * from `src/lib/feelstack/page-resolver.ts` (CMS timeout / network
 * failure / 5xx / malformed response / locale mismatch) so a CMS outage
 * renders this controlled page instead of either a silent 404 or an
 * unhandled crash.
 *
 * Next.js App Router has no page-level API to set a precise HTTP status
 * for this boundary (verified against
 * node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md
 * for this Next 16.3.2 build — only `notFound()` controls status from a
 * Server Component); the framework serves error-boundary responses as
 * 500. The real classification (TIMEOUT/NETWORK_ERROR/UPSTREAM_ERROR/
 * INVALID_RESPONSE/LOCALE_MISMATCH/INVALID_SITE, HTTP status, request ID)
 * is logged server-side in `page-resolver.ts` before the throw, so it is
 * never lost even though this boundary's own copy stays generic and
 * bilingual — see docs/FEELSTACK.md.
 */
export default function LocaleErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Client-side visibility only — the authoritative structured log
    // already happened server-side (src/lib/feelstack/errors.ts
    // logFeelstackEvent). Never log secrets or raw upstream bodies here.
    console.error("[locale-error-boundary]", error.digest ?? error.message);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">
        503 <span className="text-text-secondary">·</span> 503
      </p>
      <h1 className="text-display-2 font-heading">
        Temporarily unavailable <span className="text-text-secondary">·</span> غير متاح مؤقتًا
      </h1>
      <p className="max-w-md text-body text-text-secondary">
        We couldn&rsquo;t load this page right now. Please try again in a moment.
        <br />
        تعذّر تحميل هذه الصفحة حاليًا. يرجى المحاولة مرة أخرى بعد قليل.
      </p>
      <div className="mt-4 flex gap-3">
        <Button onClick={() => reset()}>Try again · إعادة المحاولة</Button>
        <Button variant="outline" render={<Link href="/en" />}>
          English home
        </Button>
      </div>
    </Container>
  );
}
