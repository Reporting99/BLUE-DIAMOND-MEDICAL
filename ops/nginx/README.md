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

### TLS

Certificates are obtained and renewed on the server; none is ever committed
here. A `.pem`, `.key` or fullchain file in git is a private key published to
every clone of the repository, and `.gitignore` refuses `*.pem` for that reason.

The host already runs other tenants behind this nginx, so the certificate is
issued with the webroot challenge rather than certbot's standalone mode --
standalone binds :80 itself and would take every other site on the box down for
the duration of the renewal:

```
certbot certonly --webroot -w /var/www/letsencrypt   -d bluediamondmedical.ca -d www.bluediamondmedical.ca
```

The canonical vhost then references `/etc/letsencrypt/live/bluediamondmedical.ca/`,
redirects `:80` to `:443` apart from `/.well-known/acme-challenge/`, and enables
HSTS only after the site has served correctly over HTTPS -- an HSTS header sent
during a broken first launch pins that breakage into every visitor's browser for
its `max-age`.

Renewal is certbot's own systemd timer. Its deploy hook must reload nginx, not
restart it: a restart drops in-flight connections, and a reload is enough for a
new certificate. Renewal is independent of Blue/Green -- the certificate belongs
to the host and the vhost, not to a release, so a slot switch never touches it.

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
