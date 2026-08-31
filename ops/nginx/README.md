# Nginx

Two things live here, and only one of them is for launch.

## 1. Webhook-only ingress (installed BEFORE launch)

`bd-hooks.dfeelings.com.conf` exposes exactly one route --
`POST /api/feelstack/revalidate` -- on a hostname that serves nothing else.
Every other path and method returns 404, the body is capped, and requests are
rate limited.

It exists because Blue Diamond must stay unreachable while FeelStack still needs
to reach its revalidation endpoint. Without it the CMS has nowhere to deliver,
which is the state that left 1301 events recorded as delivered with nothing
registered to receive them. Publishing this hostname cannot make the unlaunched
site crawlable: no page, asset, sitemap or other API route is reachable on it,
and every response carries `X-Robots-Tag: noindex`.

It is NOT the canonical domain and must never become it.

## 2. Canonical-domain vhost (launch only)

Still to be written. Launch additionally requires:

1. A vhost for the canonical domain whose `location /` proxies to
   `blue_diamond_app`.
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
be written on every switch and read by nothing, and `bd-hooks.dfeelings.com`
would fail `nginx -t` with an undefined upstream. FeelStack's
`feelstack-active-slot.conf` follows the same convention on this host.

It declares an `upstream`, not a bare `proxy_pass http://127.0.0.1:PORT/;`. The
earlier form was written for a whole-site `location /`, where the trailing slash
is harmless. It cannot be reused for an exact-path route: with
`location = /api/feelstack/revalidate` a trailing-slash proxy_pass replaces the
matched URI with `/`, so the webhook would arrive at the application root and
404. The round trip between what the deploy script writes and what it later
parses is asserted by `tests/deploy/webhook-ingress.spec.ts`.
