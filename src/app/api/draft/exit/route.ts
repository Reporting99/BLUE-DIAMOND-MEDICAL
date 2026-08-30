import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { draftMode } from "next/headers";
import { isLocale, defaultLocale } from "@/i18n/config";

/**
 * Leave draft preview. Needs no secret: disabling draft mode only ever removes
 * access, so requiring a credential here would strand a reviewer in preview
 * rather than protect anything.
 *
 * The destination is rebuilt from a validated locale rather than taken from the
 * caller, so this cannot be turned into an open redirect either.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get("lang");
  const locale = requested && isLocale(requested) ? requested : defaultLocale;

  (await draftMode()).disable();

  const response = NextResponse.redirect(new URL(`/${locale}`, request.url), 307);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
