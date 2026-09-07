/**
 * The one authoritative resolver for this deployment's public base URL, and
 * the one gate that decides whether the deployment may be indexed.
 *
 * Why this file exists
 * -------------------
 * `siteConfig.url` used to be the string literal "https://bluediamondmedical.ca",
 * and every canonical, hreflang, Open Graph, JSON-LD and sitemap URL in the app
 * was concatenated from it. That is a hard-coded production domain: the artifact
 * asserted a public identity that no operator had configured and that nothing
 * could verify. It also meant the *only* thing standing between an unlaunched
 * deployment and a fully-formed, crawlable URL inventory was a separate boolean.
 *
 * The base URL is now configuration, resolved here and nowhere else:
 *
 *   SITE_URL              authoritative. Absolute https origin, no path.
 *   NEXT_PUBLIC_SITE_URL  deprecated alias, honoured so the existing
 *                         production .env and scripts/feelstack-republish.mjs
 *                         keep working without an ops change. Only consulted
 *                         when SITE_URL is unset.
 *
 * There is deliberately no fallback constant. An unconfigured deployment has
 * NO base URL, and every consumer must degrade honestly rather than invent one
 * — see `absoluteUrl` below.
 */

/**
 * Hostnames that can never be a public canonical origin.
 *
 * This is the guard that keeps a preview or development hostname out of
 * metadata even when someone sets SITE_URL to one. It is a *validation* list,
 * not a blocklist of competitors: each entry is a host that either is not
 * globally resolvable (loopback, .local) or is a platform-assigned ephemeral
 * hostname whose lifetime is shorter than a search index's.
 *
 * `.invalid` is intentionally NOT here. It is the reserved TLD used to inject a
 * throwaway origin during validation runs (see tests/support/seo-test-origin.ts);
 * accepting it is what makes the launched code path testable without ever
 * naming a real domain. It cannot resolve, so it cannot be reached by a crawler.
 */
const EPHEMERAL_HOST_SUFFIXES = [
  ".pages.dev",
  ".workers.dev",
  ".vercel.app",
  ".netlify.app",
  ".onrender.com",
  ".fly.dev",
  ".herokuapp.com",
  ".github.io",
  ".amplifyapp.com",
  ".azurestaticapps.net",
  ".ngrok.io",
  ".ngrok-free.app",
  ".ngrok.app",
  ".trycloudflare.com",
  ".localhost",
  ".local",
  ".internal",
  ".test",
  ".example",
] as const;

const LOOPBACK_HOSTS = new Set(["localhost", "0.0.0.0", "[::1]", "[::]"]);

/** Bare IPv4, with or without a port already stripped by URL parsing. */
const IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;

/** URL.hostname wraps IPv6 literals in brackets. */
const IPV6 = /^\[[0-9a-f:]+\]$/i;

function isPubliclyAddressableHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (LOOPBACK_HOSTS.has(host)) return false;
  // An IP address is never a canonical identity: it is the server, not the
  // site, and it changes when the server does.
  if (IPV4.test(host) || IPV6.test(host)) return false;
  // A single-label host ("staging", "web") is not a public domain.
  if (!host.includes(".")) return false;
  if (host.startsWith(".") || host.endsWith(".")) return false;
  return !EPHEMERAL_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

/**
 * Parses and validates a candidate base URL.
 *
 * Returns the normalised ORIGIN (scheme + host, no trailing slash, no path,
 * query or fragment) or `null` when the value is absent or unusable. Every
 * rejection is silent by design: this runs during metadata generation for
 * every page, and a throw here would turn a configuration mistake into a build
 * crash rather than into the safe, non-indexable state the caller expects.
 *
 * Exported and taking its input as a parameter so both the configured and the
 * unconfigured branch are directly testable without mutating process.env.
 */
export function resolveSiteUrl(
  raw: string | undefined = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL,
): string | null {
  const value = raw?.trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  // HTTPS only. A canonical served over http: would advertise an insecure
  // origin for a medical site and invites an http->https redirect chain, which
  // this deployment explicitly does not have.
  if (url.protocol !== "https:") return null;
  // Credentials in a base URL would be copied into every canonical tag.
  if (url.username || url.password) return null;
  // A port means a non-standard endpoint — a dev server or a preview slot.
  if (url.port) return null;
  if (!isPubliclyAddressableHost(url.hostname)) return null;
  // A base URL is an origin. A path, query or fragment here would be silently
  // duplicated into every URL the app builds.
  if (url.pathname !== "/" || url.search || url.hash) return null;

  return url.origin;
}

/** True when this deployment has a valid public origin configured. */
export function siteUrlIsConfigured(raw?: string): boolean {
  return resolveSiteUrl(raw) !== null;
}

/**
 * The absolute URL for an app-relative path, or the path itself when no base
 * URL is configured.
 *
 * Returning the *relative* path rather than a fabricated absolute one is the
 * whole point. Callers that must not emit a relative value (canonical,
 * hreflang, Open Graph `url`, sitemap entries) check `siteUrlIsConfigured`
 * first and omit the field entirely; callers for which a root-relative
 * reference is valid and unambiguous (JSON-LD `@id` and `url`, which resolve
 * against the document's own base IRI) can use the result directly.
 *
 * Never emits localhost, an IP, or a placeholder host in either branch,
 * because there is no host to emit.
 */
export function absoluteUrl(path: string): string {
  const base = resolveSiteUrl();
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${suffix}` : suffix;
}
