import "server-only";
import { getFeelstackApiUrl, getFeelstackSiteKey } from "./content-mode";
import type { PreviewRoute } from "./preview-source";

/**
 * Server-to-server reader for FeelStack's draft preview surface.
 *
 * `import "server-only"` is the enforcement, not a convention: Next fails the
 * build if any client component reaches this module, so FEELSTACK_PREVIEW_SECRET
 * cannot be bundled into client JavaScript even by accident. Nothing here
 * returns the secret, embeds it in a URL, or logs it — it exists only as an
 * `Authorization: Preview` header on an outbound request.
 *
 * Every response is fetched `cache: "no-store"`. Draft content must not enter
 * Next's data cache, where a later published request could be served from it.
 */

const REQUEST_TIMEOUT_MS = 10_000;

function previewSecret(): string | undefined {
  const value = process.env.FEELSTACK_PREVIEW_SECRET;
  return value && value.length > 0 ? value : undefined;
}

export function isPreviewConfigured(): boolean {
  return Boolean(
    previewSecret() &&
      process.env.FEELSTACK_API_URL &&
      process.env.FEELSTACK_SITE_KEY,
  );
}

async function previewFetch(url: string): Promise<unknown | null> {
  const secret = previewSecret();
  if (!secret) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        // The only place the secret appears. Never a query parameter: those
        // reach access logs, browser history and Referer headers.
        Authorization: `Preview ${secret}`,
      },
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as unknown;
  } catch {
    // A preview outage must not take a published page down; callers treat null
    // as "no draft available" and continue on their normal path.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function base(): string {
  return `${getFeelstackApiUrl()}/public/v1/sites/${getFeelstackSiteKey()}/preview`;
}

/** Every route FeelStack lists for this project in this locale, drafts included. */
export async function previewRoutes(locale: string): Promise<PreviewRoute[]> {
  const out: PreviewRoute[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const payload = (await previewFetch(
      `${base()}/routes?locale=${encodeURIComponent(locale)}&page=${page}&limit=200`,
    )) as { items?: PreviewRoute[]; hasMore?: boolean } | null;
    if (!payload?.items?.length) break;
    out.push(...payload.items);
    if (!payload.hasMore) break;
  }
  return out;
}

/** The draft-or-published envelope for one path, including media assignments. */
export async function previewResolve(
  path: string,
  locale: string,
): Promise<Record<string, unknown> | null> {
  const payload = await previewFetch(
    `${base()}/resolve?path=${encodeURIComponent(path)}&locale=${encodeURIComponent(locale)}`,
  );
  return (payload as Record<string, unknown> | null) ?? null;
}
