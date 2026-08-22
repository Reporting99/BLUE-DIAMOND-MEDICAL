# Pre-launch indexing guard

## The problem this closes

`siteConfig.url` is already the real launch domain, and every canonical,
hreflang, OG URL and sitemap entry is built from it. That is correct — those
URLs are stable and must not churn at launch — but before this change
`robots.ts` unconditionally emitted:

```
User-Agent: *
Allow: /
Sitemap: https://bluediamondmedical.ca/sitemap.xml
```

with no `noindex` anywhere in the application. The moment a build was served
somewhere reachable, it invited indexing of a site that is not ready.

"No DNS exists yet" is not a control. DNS can be pointed in a minute, a server
can be reached by IP or through a shared host's default vhost, and a single
inbound link is enough for a crawler to try. Indexability needs an explicit,
auditable flag.

## The flag

`SITE_LAUNCHED` — server-only, opt-in, **exact string `"true"`**.

Anything else (unset, empty, `"false"`, `"TRUE"`, `"true "`) means not
launched. Fail-closed is the whole point: the failure mode is silent, and by
the time it is visible a crawler has already acted on it.

It is deliberately **not** `NEXT_PUBLIC_` — Next inlines those into the client
bundle, and a crawler-facing gate belongs on the server.

It is read at **request time**, not build time. A release artifact therefore
carries no indexability of its own, and no build can be promoted into a slot
and quietly make it public.

## The three layers

| Layer | File | Stops |
|---|---|---|
| `robots.txt` | `src/app/robots.ts` | crawling |
| `X-Robots-Tag` header | `src/proxy.ts` | indexing of anything already fetched |
| page `<meta robots>` | `src/lib/seo/metadata.ts` | indexing of a rendered page |

They are not redundant. `robots.txt` only stops *crawling* — a URL that is
disallowed can still be indexed from an external link. The header and the meta
tag are what actually prevent indexing, and the header is authoritative because
it is the only one evaluated per request (page metadata is baked at build time
for statically-generated routes).

The sitemap returns empty while unlaunched: every entry is an absolute URL on
the launch domain, so a sitemap served before launch can only invite crawling
of a site that is not ready.

## What is deliberately NOT gated

Canonical, hreflang and OG URLs. They point at the real launch domain in both
states. That is correct — they are stable, they must not churn at launch, and
nothing anywhere in the application emits a temporary or runtime hostname, so
there is nothing to leak.

## Launching

1. Add `SITE_LAUNCHED=true` to **both** slot env files:
   `/home/blue-diamond/shared/blue-runtime.env` and `green-runtime.env`.
2. Restart both slots.
3. Verify: `curl -sS https://<domain>/robots.txt` shows `Allow: /` and a
   `Sitemap:` line; `curl -sSI https://<domain>/en` shows no `X-Robots-Tag`.

Both slots, always. Setting it on one would mean a routine Blue/Green switch
silently changed the site's indexability.

## Tests

`tests/unit/prelaunch-guard.spec.ts` asserts both branches directly.

The Playwright web server runs with `SITE_LAUNCHED=true`
(`playwright.config.ts`), so the existing `tests/seo` suite keeps validating
real launched behaviour — populated sitemap, `Sitemap:` in robots.txt,
indexable pages — unchanged.
