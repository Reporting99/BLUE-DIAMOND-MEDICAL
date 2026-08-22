import type { FeelstackResolveResponse } from "./types";

/**
 * Local typed fallback content — brief §7 ("Create local typed content
 * fallbacks so development and testing do not fail when CMS access is
 * unavailable"). Currently the only entry, since no FeelStack site has
 * been provisioned for Blue Diamond Medical yet — every real page on this
 * site is still driven by src/content/*.ts and src/config/routes.ts, not
 * FeelStack. This fallback exists so the adapter itself (client.ts) is
 * exercised and testable ahead of a real CMS connection, per
 * docs/DEPLOYMENT_GUIDE.md.
 */
export const feelstackFallbackContent: Record<string, FeelstackResolveResponse> = {};

export function getFallbackContent(path: string, locale: "en" | "ar"): FeelstackResolveResponse | null {
  const key = `${locale}:${path}`;
  return feelstackFallbackContent[key] ?? null;
}
