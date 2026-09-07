# Domain + SEO activation runbook

The ordered procedure for taking Blue Diamond Medical from its current
**pre-domain, non-indexable** state to a live, indexed site on its final
domain.

This document is the authority on **sequencing**. `ops/nginx/DOMAIN_CUTOVER.md`
is the authority on **server facts** (DNS records, TLS paths, vhosts). Where
the two overlap, follow the order here and take the host specifics from there.

No domain is named anywhere in this document, in the application source, or in
`.env.example`. That is deliberate: the final domain is a decision, and until
it is made and approved there is nothing correct to write down.

---

## 0. Current state

| | |
|---|---|
| Final domain configured | **NO** |
| Indexing enabled | **NO** |
| `SITE_URL` | unset |
| `robots.txt` | `User-agent: *` / `Disallow: /`, no `Sitemap:` line |
| `sitemap.xml` | empty |
| `llms.txt` | 404 |
| Every response | `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex` |
| Every page | `<meta name="robots" content="noindex, nofollow">`, and **no** canonical, hreflang or `og:url` tag at all |

Everything below is ready in code. The only work remaining is supplying a real
HTTPS origin and turning indexing on.

---

## 1. The two variables

Indexing requires **both**. They are ANDed in `isIndexingEnabled()`
(`src/config/launch.ts`); neither alone changes anything.

| Variable | Meaning | Notes |
|---|---|---|
| `SITE_URL` | the one authoritative public origin | absolute, `https://`, origin only — no path, port, query, fragment or trailing slash. Validated by `resolveSiteUrl()` in `src/config/site-url.ts`; anything it rejects is treated as unset. |
| `INDEXING_ENABLED` | the explicit indexing switch | exact string `"true"`. Anything else — unset, empty, `"false"`, `"TRUE"`, `"true "` — means not indexable. |

`NEXT_PUBLIC_SITE_URL` and `SITE_LAUNCHED` are accepted as deprecated aliases
so existing slot env files keep working. `SITE_URL` and `INDEXING_ENABLED` win
when both are present. Prefer the new names; neither may ever carry a
`NEXT_PUBLIC_` prefix on the indexing switch.

`resolveSiteUrl()` rejects, and therefore keeps the site non-indexable on:
`http://`, `localhost`, any bare IPv4/IPv6 address, a single-label host, an
explicit port, credentials, a path/query/fragment, and the platform-ephemeral
suffixes `.pages.dev`, `.workers.dev`, `.vercel.app`, `.netlify.app`,
`.onrender.com`, `.fly.dev`, `.herokuapp.com`, `.github.io`, `.amplifyapp.net`,
`.azurestaticapps.net`, `.ngrok*`, `.trycloudflare.com`, `.local`, `.internal`,
`.test`, `.example`.

### The one thing that catches people

**Page metadata is baked at build time. Everything else is request time.**

| Layer | Source | Evaluated |
|---|---|---|
| `robots.txt` | `src/app/robots.ts` | request time |
| `sitemap.xml` | `src/app/sitemap.ts` | request time |
| `llms.txt` | `src/app/llms.txt/route.ts` | request time |
| `X-Robots-Tag` | `src/proxy.ts` | request time |
| `<meta robots>`, canonical, hreflang, `og:url` | `src/lib/seo/metadata.ts` | **BUILD TIME** |

So both variables must be present in the **build** environment *and* in the
**runtime** environment of both slots. Setting them only at runtime produces a
site whose `robots.txt` invites crawling while every page still says `noindex`
and carries no canonical — a launch that silently did not launch.

---

## 2. Procedure

Do these in order. Steps 4–11 are all externally observable: check them against
the deployed slot over the real domain, never against a local build.

### 1. Connect the final domain

DNS, vhost and TLS, per `ops/nginx/DOMAIN_CUTOVER.md`. Do not add www/non-www
or HTTP→HTTPS redirects as part of this task — that decision belongs with the
final domain choice and is out of scope here.

### 2. Configure the real HTTPS `SITE_URL`

Set it in **both** places:

- the build/deploy environment (CI variable), and
- the per-slot runtime env files, on **both** blue and green.

`ops/nginx/DOMAIN_CUTOVER.md` step 4 currently flips only the indexing flag in
the slot env files. It must also add `SITE_URL`, or the flag will have no
effect.

### 3. Keep `INDEXING_ENABLED=false`

Leave it unset. This step exists so the domain can be verified end-to-end
while the site is still invisible to crawlers. Rebuild and deploy with
`SITE_URL` set and the flag off.

At this point pages gain canonical, hreflang and `og:url` tags on the real
domain, and still carry `noindex`. `robots.txt` still says `Disallow: /` and
the sitemap is still empty — both are gated on the flag as well as the origin.

### 4. Verify HTTPS and that every page loads

```
curl -sI https://<domain>/            # 200, not 3xx
curl -sI https://<domain>/en          # 200
curl -sI https://<domain>/ar          # 200
```

`/` is served by an internal rewrite and must answer **200**, not a redirect.

### 5. Verify canonical URLs

```
curl -s https://<domain>/en/medical | grep -o '<link rel="canonical"[^>]*>'
```

Each page must self-reference on the real origin. No canonical may contain
`localhost`, an IP, a preview host, or the old domain.

### 6. Verify hreflang

Every indexable page must carry reciprocal `en-CA` / `ar-CA` and an
`x-default` pointing at the English URL. EN must point at its AR counterpart
and vice versa. No hreflang URL may redirect or 404.

### 7. Generate and validate the sitemap

Still empty at this stage (the flag is off) — that is correct. Validate it
after step 12.

### 8. Verify robots.txt

Still `Disallow: /` at this stage. Correct.

### 9. Confirm no redirects

```
curl -sI -o /dev/null -w '%{http_code} %{redirect_url}\n' https://<domain>/<path>
```

across the route inventory (`evidence/seo-route-inventory.json`). Every
approved URL must be a bare 200. Legacy third-party URLs from the two old
sites are the deliberate exception: they 301 once, by design, and must keep
doing so.

### 10. Verify structured data

Paste a rendered page into Google's Rich Results Test and Schema.org's
validator. Every `@id` and `url` must now be absolute on the real origin.

### 11. Verify Open Graph previews

Check a real page through a link-preview debugger. `og:url` must be absolute
and match the canonical.

### 12. Set `INDEXING_ENABLED=true`

In the **build** environment and in **both** slot runtime env files. This is a
deliberate, separate, approved step — never bundled into an unrelated deploy.

### 13. Rebuild and deploy

A runtime-only change is not a launch. Rebuild, then deploy through the
Blue/Green orchestrator.

Then re-verify, in this order:

- `<meta name="robots">` is `index, follow` on an indexable page
- `X-Robots-Tag` no longer sends `noindex`
- `robots.txt` allows crawling and advertises `https://<domain>/sitemap.xml`
- `sitemap.xml` returns the full inventory, all absolute HTTPS, no duplicates,
  no query strings, no redirecting URLs
- `llms.txt` returns 200

### 14. Submit the sitemap

- **Google Search Console** — add the property, verify ownership, submit
  `https://<domain>/sitemap.xml`.
- **Bing Webmaster Tools** — same.

### 15. Monitor

Watch Search Console Coverage and Enhancements for the first four weeks:
indexed vs excluded counts, `noindex` reported on a page that should be
indexable, hreflang errors ("no return tag" is the usual one), sitemap fetch
errors, and structured-data warnings.

---

## 3. Rollback

**The previous non-indexable release must remain deployable throughout.**

An artifact built with `INDEXING_ENABLED=true` cannot be made non-indexable by
changing the environment — its pages carry `index, follow` in their HTML
permanently, and only the `X-Robots-Tag` header holds them back. The only way
back to a `noindex` page is to serve a different build.

If any verification in step 13 fails, roll back to the previous release rather
than fixing forward on a live, indexable site.
`ops/deploy/deploy-blue-diamond` retains previous releases for exactly this
(`KEEP_RELEASES=3`; see the release-safety tests in
`tests/unit/deployment-ops.spec.ts`).

---

## 4. What is deliberately NOT in this task

- **No domain redirects.** No www/non-www, no HTTP→HTTPS, no old-domain
  forwarding. Each depends on the final domain decision.
- **No guessed domain** anywhere in source, `.env.example`, CI or metadata.
- **Retiring `bluediamondmedicalaesthetics.ca`** — a separate legacy domain
  this app never receives requests for. See `docs/DEPLOYMENT.md` §5.
- **Cloudflare** — not used, not introduced.

## 5. Verification harness

The launched code path is exercised in CI against a reserved
`https://seo-test.invalid` origin (`tests/support/seo-test-origin.ts`), which
by RFC 2606 can never resolve. That is why the suite can validate absolute
canonicals, hreflang reciprocity, a populated sitemap and an open `robots.txt`
without any real domain existing.

Relevant suites:

| Suite | Covers |
|---|---|
| `tests/seo/site-url-config.spec.ts` | origin validation, missing-domain behaviour, no hard-coded domain in `src/`, CI or `.env.example` |
| `tests/unit/prelaunch-guard.spec.ts` | the gate: flag alone, origin alone, both, and rejected origins |
| `tests/seo/crawl-inventory.spec.ts` | full route crawl — 200s, zero redirects, one H1, unique titles/descriptions, canonical, hreflang reciprocity, JSON-LD, internal links; writes `evidence/seo-route-inventory.{json,csv}` |
| `tests/seo/sitemap-robots.spec.ts` | sitemap XML validity, exclusions, count, determinism; robots in launched shape; 404 behaviour |
