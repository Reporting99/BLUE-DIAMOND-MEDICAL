# Nginx (launch-time only)

Nothing in this directory is installed during the integration phase. Blue
Diamond has no public domain and must not be reachable from the internet
until launch is authorised.

## What launch requires

1. A vhost for the canonical domain that `include`s
   `snippets/blue-diamond-backend.conf` for its `location /` proxy pass.
2. `blue-diamond-backend.conf` installed with the port of whichever slot is
   currently serving (see `/home/blue-diamond/deployments/active-release.env`).
3. TLS for the domain.
4. `SITE_LAUNCHED=true` added to **both** slot env files
   (`/home/blue-diamond/shared/{blue,green}-runtime.env`) and both slots
   restarted.

Step 4 is the switch that makes the site indexable. It is read at request time
(see `src/config/launch.ts`), so it is a property of the running environment
rather than of the artifact -- a release built before launch and a release
built after it are byte-identical in this respect, and no build can carry
indexability into a slot that was not meant to be public.

It must be set on BOTH slots. Setting it on one would mean a routine
Blue/Green switch silently changed the site's indexability.

Until step 4 lands, the application emits a site-wide robots.txt `Disallow`,
a `noindex` `X-Robots-Tag` on every response, `noindex` page metadata, and an
empty sitemap. Canonical, hreflang and OG URLs continue to point at the real
launch domain -- they are stable and correct, and nothing anywhere emits a
temporary or runtime hostname.

## The switch invariant

`blue-diamond-backend.conf` is the single authority on which slot serves
traffic. Once it exists, the deploy script reads it to determine the active
slot rather than trusting the stored state file, and refuses to deploy if the
two disagree. That refusal is deliberate: a stale state file silently
"corrected" is how a deploy overwrites the slot that is actually serving.
