# Nginx

Blue Diamond has no public vhost yet, by design. Nothing here is installed on
the host until the canonical domain is connected.

## The canonical-domain vhost (launch)

Still to be written. Launch requires:

1. A vhost for the canonical domain whose `location /` proxies to
   `blue_diamond_app`, plus a `location = /api/feelstack/revalidate` so
   FeelStack can reach the application's revalidation endpoint. Both come from
   the same generated upstream, so a Blue/Green switch moves the site and its
   webhook together and the two can never disagree.
2. TLS for that domain.
3. `SITE_LAUNCHED=true` in **both** slot env files
   (`/home/blue-diamond/shared/{blue,green}-runtime.env`) and both slots
   restarted.

Step 3 is the switch that makes the site indexable. It is read at request time
(see `src/config/launch.ts`), so it is a property of the running environment
rather than of the artifact -- a release built before launch and one built after
are byte-identical in this respect, and no build can carry indexability into a
slot that was not meant to be public.

It must be set on BOTH slots. Setting it on one would mean a routine Blue/Green
switch silently changed the site's indexability.

Until step 3 lands, the application emits a site-wide robots.txt `Disallow`, a
`noindex` `X-Robots-Tag` on every response, `noindex` page metadata, and an empty
sitemap. Canonical, hreflang and OG URLs continue to point at the real launch
domain -- they are stable and correct, and nothing anywhere emits a temporary or
runtime hostname.

### There is no temporary webhook hostname

A `bd-hooks.dfeelings.com` vhost briefly existed here to give FeelStack somewhere
to deliver before launch. It has been removed: the real domain is close enough
that standing up a second public hostname, with its own certificate to obtain
and renew, buys nothing and leaves a name nobody intends to keep.

Until the canonical vhost exists, FeelStack has nowhere to deliver and cache
invalidation does not fire in production. That is a known, accepted
consequence of being pre-launch, not a defect: content is resolved fresh on
each ISR revalidation window regardless, and the application's
`/api/feelstack/revalidate` route is fully implemented and tested
(`tests/security/feelstack-webhook.spec.ts`) so it works the day a vhost routes
to it.

## The switch invariant

`blue-diamond-active-slot.conf` is the single authority on which slot serves
traffic. The deploy script reads it to determine the active slot rather than
trusting the stored state file, and refuses to deploy if the two disagree. That
refusal is deliberate: a stale state file silently "corrected" is how a deploy
overwrites the slot that is actually serving.

It is generated into `/etc/nginx/sites-enabled/`, not `/etc/nginx/snippets/`.
An `upstream` block is only valid at `http` level, and on this host
`nginx.conf` includes `sites-enabled/*.conf` there and nothing else --
`snippets/` is pulled in only by an explicit `include` inside a `location`,
which cannot hold an upstream. A generated file placed under `snippets/` would
be written on every switch and read by nothing, and any vhost referencing the
upstream would fail `nginx -t` on an undefined upstream. FeelStack's
`feelstack-active-slot.conf` follows the same convention on this host.

It declares an `upstream`, not a bare `proxy_pass http://127.0.0.1:PORT/;`. The
earlier form was written for a whole-site `location /`, where the trailing slash
is harmless. It cannot be reused for an exact-path route: with
`location = /api/feelstack/revalidate` a trailing-slash proxy_pass replaces the
matched URI with `/`, so the webhook would arrive at the application root and
404. The round trip between what the deploy script writes and what it later
parses is asserted by `tests/deploy/webhook-ingress.spec.ts`.
