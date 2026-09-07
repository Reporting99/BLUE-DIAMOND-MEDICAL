import { resolveSiteUrl } from "./site-url";

/**
 * Pre-launch indexing gate.
 *
 * Blue Diamond has no public domain yet. The base URL every canonical,
 * hreflang, OG URL and sitemap entry is built from is therefore configuration,
 * resolved by src/config/site-url.ts, and is absent by default — so an
 * unconfigured deployment has no public identity to advertise at all.
 *
 * A configured origin is still not consent to be indexed. "No DNS exists yet"
 * is not a control either. DNS can be pointed in a minute, a
 * server can be reached by IP or through a shared host's default vhost, and a
 * single inbound link is enough for a crawler to try. Indexability therefore
 * needs an explicit, auditable flag rather than an implicit property of the
 * environment.
 *
 * SITE_LAUNCHED is that flag. It is deliberately:
 *
 *   - opt-IN. Anything other than the exact string "true" means not launched,
 *     so an unset, empty, typo'd or half-configured environment fails closed.
 *   - server-only (no NEXT_PUBLIC_ prefix). It gates crawler-facing output,
 *     which is decided server-side; exposing it to the browser would add a
 *     public signal with no purpose.
 *   - read at REQUEST time by robots.txt, sitemap.xml and the proxy, so a
 *     running server always reflects its current configuration and a build
 *     cannot be promoted into a slot and quietly start advertising itself.
 *
 * It is NOT request-time everywhere. Page `<meta robots>` comes from
 * src/lib/seo/metadata.ts, which runs during static generation, so that tag is
 * fixed in the build artifact. Launching therefore requires setting the flag
 * in the BUILD environment and rebuilding — a config change plus a restart
 * flips robots.txt, the sitemap and the header, but leaves every page still
 * carrying `noindex` in its HTML. See docs/DEPLOYMENT.md §3 for the layer
 * table and the launch procedure.
 */


/**
 * The raw value of the indexing switch, from whichever name is set.
 *
 * `INDEXING_ENABLED` is the authoritative name. `SITE_LAUNCHED` is the
 * original name and is still honoured, because it is the variable the
 * deployment runbook, both slot env files and ops/nginx/DOMAIN_CUTOVER.md
 * refer to; renaming it in the code without renaming it in the operator's
 * procedure is how a launch step silently stops working.
 *
 * They are not competing switches: this is one resolution path with a
 * documented precedence, and both must carry the exact string "true".
 */
export function indexingFlagValue(env: NodeJS.ProcessEnv = process.env): string | undefined {
  return env.INDEXING_ENABLED ?? env.SITE_LAUNCHED;
}

/**
 * Pure resolver, exported so both states are directly testable without
 * mutating the real environment.
 *
 * Takes the raw value rather than an environment object: the gate depends on
 * exactly one variable, and saying so in the signature is both simpler to
 * test and impossible to misread.
 *
 * This is the FLAG ONLY. It is deliberately not the whole gate — see
 * `isIndexingEnabled`, which is what crawler-facing code must call.
 */
export function isSiteLaunched(
  value: string | undefined = indexingFlagValue(),
): boolean {
  return value === "true";
}

/**
 * The real indexing gate: the flag AND a valid public origin.
 *
 * Both halves are required. A hostname existing is not consent to be indexed,
 * and consent without a configured canonical origin would publish a sitemap
 * and canonical tags that either point nowhere or — worse, if some future
 * caller supplied a fallback — point at whatever host answered the request.
 * Requiring `resolveSiteUrl()` to succeed makes "indexable" and "has a
 * verified https identity" the same condition, so neither can drift.
 *
 * Every robots, sitemap, meta-robots and X-Robots-Tag decision reads THIS.
 */
export function isIndexingEnabled(
  flag: string | undefined = indexingFlagValue(),
  siteUrl: string | null = resolveSiteUrl(),
): boolean {
  return flag === "true" && siteUrl !== null;
}

/** Robots directives applied site-wide while the site is not launched. */
export const PRE_LAUNCH_ROBOTS_HEADER =
  "noindex, nofollow, noarchive, nosnippet, noimageindex";
