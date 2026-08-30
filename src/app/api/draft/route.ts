import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { draftMode } from "next/headers";
import { resolveDraftPreview } from "@/lib/feelstack/draft-preview";

/**
 * FeelStack draft preview entry. Thin HTTP adapter, matching the shape of
 * `api/feelstack/revalidate`: every decision lives in
 * `src/lib/feelstack/draft-preview.ts`, which is unit-testable without a
 * Next.js server — see tests/security/feelstack-draft-preview.spec.ts.
 *
 * The secret is read from the query string because that is the contract the CMS
 * dashboard builds against, but it stops here: it is compared in constant time
 * and never forwarded, echoed or logged. Draft mode is carried onward by
 * Next's own httpOnly cookie, so nothing secret needs to survive the redirect.
 *
 * The redirect is always a relative, registry-resolved path, so this route
 * cannot be used as an open redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const decision = resolveDraftPreview({
    secret: searchParams.get("secret"),
    type: searchParams.get("type"),
    slug: searchParams.get("slug"),
    lang: searchParams.get("lang"),
    projectId: searchParams.get("projectId"),
    expectedSecret: process.env.FEELSTACK_PREVIEW_SECRET,
    expectedProjectId: process.env.FEELSTACK_PROJECT_ID,
  });

  if (!decision.ok) {
    return NextResponse.json({ error: decision.error }, { status: decision.status });
  }

  (await draftMode()).enable();

  // 307: the browser must not cache a preview entry, and any shared cache in
  // front of this deployment must not serve one visitor's draft entry to
  // another.
  const response = NextResponse.redirect(new URL(decision.redirectTo, request.url), 307);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
