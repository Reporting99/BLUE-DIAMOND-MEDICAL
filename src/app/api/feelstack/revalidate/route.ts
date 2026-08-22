import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { processRevalidationRequest } from "@/lib/feelstack/webhook-handler";

/**
 * FeelStack CMS revalidation webhook — brief §9. Thin HTTP adapter; all
 * business logic (signature verification, timestamp/replay check,
 * content-type/size limits, three-pass path decoding, allowlisting, event
 * -> cache-tag resolution) lives in
 * `src/lib/feelstack/webhook-handler.ts`, which is unit-testable without a
 * Next.js server — see tests/security/feelstack-webhook.spec.ts.
 *
 * No FEELSTACK_REVALIDATE_SECRET is configured for this build — the
 * handler exists and is fully wired, but every request 501s until a real
 * secret is provisioned, rather than silently accepting unverified
 * requests. See docs/DEPLOYMENT_GUIDE.md and docs/WEBHOOK_SECURITY_REPORT.md
 * (the structured `{event, siteKey, locale, entityId, path}` body is a
 * forward-declared, unverified contract — no live FeelStack webhook sender
 * was available this session to confirm its real payload shape; the
 * legacy `{path}`-only body this deployment already shipped is still
 * accepted).
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const result = await processRevalidationRequest(
    {
      secret: process.env.FEELSTACK_REVALIDATE_SECRET,
      contentType: request.headers.get("content-type"),
      contentLength: Number(request.headers.get("content-length") ?? "0") || null,
      signature: request.headers.get("x-feelstack-signature"),
      timestamp: request.headers.get("x-feelstack-timestamp"),
      rawBody,
    },
    {
      // { expire: 0 } — immediate expiration, not the `profile="max"`
      // stale-while-revalidate default. Verified against
      // node_modules/next/dist/docs/.../revalidateTag.md for this Next
      // 16.3.2 build (`revalidateTag` now requires a second argument):
      // "For webhooks or third-party services that need immediate
      // expiration, ... pass `{ expire: 0 }`" — exactly this handler's
      // use case.
      revalidateTag: (tag) => revalidateTag(tag, { expire: 0 }),
      revalidatePath: (path) => revalidatePath(path),
    },
  );

  return NextResponse.json(result.body, { status: result.status });
}
