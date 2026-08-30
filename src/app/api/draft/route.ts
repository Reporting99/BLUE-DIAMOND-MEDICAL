import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { draftMode } from "next/headers";
import {
  checkDraftPreviewRequest,
  resolveDraftPreview,
} from "@/lib/feelstack/draft-preview";
import { previewRoutes, previewResolve } from "@/lib/feelstack/preview-client";

/**
 * FeelStack draft preview entry. Thin HTTP adapter, matching
 * `api/feelstack/revalidate`: the decisions live in
 * `src/lib/feelstack/draft-preview.ts` and `preview-source.ts`, both testable
 * without a Next server.
 *
 * The secret is compared here and stops here — never forwarded, echoed or
 * logged. Draft mode is carried onward by Next's own httpOnly cookie, so
 * nothing secret needs to survive the redirect.
 *
 * The destination comes from FeelStack's route list for the configured
 * project, so it cannot be steered by the caller.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const input = {
    secret: searchParams.get("secret"),
    type: searchParams.get("type"),
    slug: searchParams.get("slug"),
    lang: searchParams.get("lang"),
    projectId: searchParams.get("projectId"),
    expectedSecret: process.env.FEELSTACK_PREVIEW_SECRET,
    expectedProjectId: process.env.FEELSTACK_PROJECT_ID,
  };

  // Credentials first: an unauthenticated caller must never cause an outbound
  // request to FeelStack, or this endpoint becomes an unauthenticated proxy
  // for load against the CMS.
  const checked = checkDraftPreviewRequest(input);
  if (!checked.ok) {
    return NextResponse.json({ error: checked.error }, { status: checked.status });
  }

  const routes = await previewRoutes(checked.locale);
  if (routes.length === 0) {
    return NextResponse.json(
      { error: "Preview routes are unavailable." },
      { status: 503 },
    );
  }

  let decision = resolveDraftPreview(input, routes);

  // A non-English preview needs the localized path, which FeelStack exposes
  // only as `route.alternates` on the resolve envelope: an Arabic route is a
  // real Arabic string, never a transliteration of the English slug.
  if (!decision.ok && "needsAlternates" in decision) {
    const envelope = (await previewResolve(decision.cmsPathEn, "en")) as
      | { route?: { alternates?: { locale: string; path: string }[] } }
      | null;
    decision = resolveDraftPreview(input, routes, envelope?.route?.alternates ?? []);
  }

  if (!decision.ok) {
    const status = "status" in decision ? decision.status : 404;
    const error = "error" in decision ? decision.error : "No previewable route for that locale.";
    return NextResponse.json({ error }, { status });
  }

  (await draftMode()).enable();

  const response = NextResponse.redirect(
    new URL(decision.redirectTo, request.url),
    307,
  );
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
