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
 * The accepted body is now the CANONICAL FeelStack envelope
 * `{ id, type, projectId, occurredAt, data }`, derived from the real
 * sender (`webhook.service.ts::deliver()`). The previous
 * `{ event, siteKey, ... }` shape was a forward-declared guess that no
 * genuine delivery could satisfy; it has been removed rather than kept as
 * a compatibility branch.
 *
 * All three of FEELSTACK_REVALIDATE_SECRET, FEELSTACK_PROJECT_ID and
 * FEELSTACK_SITE_KEY must be set. Any missing one 501s. In particular the
 * site key is passed explicitly rather than read through
 * `getFeelstackSiteKey()`, whose "blue-diamond-medical" fallback would
 * otherwise let a deployment accept events for a tenant nobody configured
 * — this path is gated only on the secret, not on assertFeelstackEnvValid().
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const result = await processRevalidationRequest(
    {
      secret: process.env.FEELSTACK_REVALIDATE_SECRET,
      projectId: process.env.FEELSTACK_PROJECT_ID,
      siteKey: process.env.FEELSTACK_SITE_KEY,
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
