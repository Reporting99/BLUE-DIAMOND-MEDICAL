/**
 * Pre-launch indexing gate.
 *
 * Blue Diamond has no public domain yet, but `siteConfig.url` is already the
 * real launch domain (bluediamondmedical.ca) and every canonical, hreflang,
 * OG URL and sitemap entry is built from it. That is correct — those URLs are
 * stable and should not churn at launch — but it means the moment this build
 * is served anywhere reachable, it invites indexing of a site that is not
 * ready.
 *
 * "No DNS exists yet" is not a control. DNS can be pointed in a minute, a
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
 *   - read at REQUEST time by robots.txt, sitemap.xml and the proxy, so
 *     launching is a config change plus a restart rather than a rebuild —
 *     and, more importantly, so a build artifact can never carry
 *     indexability baked into it and be promoted to a slot that was not
 *     meant to be public.
 *
 * See docs/DEPLOYMENT.md for the launch procedure.
 */

/**
 * Pure resolver, exported so both states are directly testable without
 * mutating the real environment.
 *
 * Takes the raw value rather than an environment object: the gate depends on
 * exactly one variable, and saying so in the signature is both simpler to
 * test and impossible to misread.
 */
export function isSiteLaunched(
  value: string | undefined = process.env.SITE_LAUNCHED,
): boolean {
  return value === "true";
}

/** Robots directives applied site-wide while the site is not launched. */
export const PRE_LAUNCH_ROBOTS_HEADER =
  "noindex, nofollow, noarchive, nosnippet, noimageindex";
