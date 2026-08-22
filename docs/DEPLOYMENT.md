# Deployment

Release model, launch gate, redirect tables and cutover procedure.

**Nothing has been deployed and no DNS exists.** This describes how a release
works and what must be true before one happens; it does not authorize one.

---

## 1. Local

```bash
npm ci
cp .env.example .env.local     # fill in real values as they become available
npm run dev

npm run validate               # typecheck + lint + build
npm run start
npx playwright test
```

## 2. Release model — Blue/Green

Two permanent slots, **BLUE `127.0.0.1:3030`** and **GREEN `127.0.0.1:3031`**.
A release installs into the *inactive* slot and is started, health-checked and
identity-verified before anything points at it. The active slot serves
throughout, which is what makes rollback a switch rather than a rebuild.

No staging, no preview, no per-branch runtime. Both slots bind loopback only —
nginx is the only thing on this shared host that may face the internet.

Ports were audited free on 2026-08-22 against `ss -tlnp`, every nginx
`proxy_pass` target, and the PM2 process table, so ports held by stopped
services were included.

### Chain of custody

```
commit on main
  → CI green for that exact SHA
  → Deploy Production (manual, workflow_dispatch)
      · SHA is an ancestor of origin/main
      · CI passed for that SHA specifically — not "for the branch"
      · build, package, upload artifact + deploy script
      · install the deploy script FROM THIS COMMIT
      · run it once
  → deploy-blue-diamond (server, root)
      · validate the artifact as untrusted input
      · extract, grant ISR cache writes, swap `current`
      · start the inactive slot
      · health-gate it, then verify /api/version === release SHA
      · switch nginx (once a vhost exists), re-verify publicly
      · roll back automatically on any failure
```

The invariant the installer exists to hold:

```
CI-passed SHA == application release SHA == deployment-script source SHA
```

Without it the reviewed logic and the executed logic drift silently.

### Why `/api/version`

HTTP 200 proves *some* backend answered — not that the proxy serves the release
just deployed. A wiring mistake lets the previous slot keep answering 200 while
every deploy reports success. `/api/version` returns the exact `.release-sha`
on disk, so the deploy asserts content identity rather than liveness, and rolls
back on mismatch. It returns the SHA and nothing else: it is public and
unauthenticated, so every extra field would be public too.

### ISR prerender-cache grant

Base permissions leave a release `root:blue-diamond` at `u=rwX,g=rX,o=`. That
is right for code, but Next.js rewrites revalidated route output in place under
`.next/server/app` (`<route>.body` / `.meta`), so a revalidating route fails
with `EACCES` and can never persist its cache.

The grant is derived from the build output and is narrow: only directories that
already contain prerendered output become group-writable, only the
`.body`/`.meta` artifacts get the write bit, nothing becomes world-anything,
and compiled code stays read-only.

**On the current build it grants nothing** — there is no time-based ISR route
today. It exists because `src/lib/feelstack/client.ts` already issues
`fetch(..., { next: { revalidate, tags } })`: the moment
`FEELSTACK_CONTENT_MODE` moves off `static`, every page resolving through it
becomes a revalidating route and this failure becomes live. Adding the grant
afterwards would mean shipping the bug first.

### Pre-domain behaviour

With no `/etc/nginx/snippets/blue-diamond-backend.conf`, the deploy script
derives the serving slot from systemd plus a loopback probe, deploys and
verifies the inactive slot on loopback, and logs `TRAFFIC_SWITCH_SKIPPED`
instead of pretending a switch happened. The same script works unchanged after
launch.

### State

`/home/blue-diamond/deployments/active-release.env` records slot, port, SHA and
timestamp. It is **not** the authority: once nginx manages traffic the snippet
is, and the script **refuses to deploy** when the two disagree rather than
normalizing the state file. Silently "correcting" stale state is how a deploy
overwrites the slot that is actually serving.

Provisioning is not yet performed — see `ops/deploy/README.md` for the
trust-anchor install and `ops/nginx/README.md` for the launch procedure.

## 3. Pre-launch indexing guard

`siteConfig.url` is already the real launch domain, and every canonical,
hreflang, OG URL and sitemap entry is built from it. Those URLs must not churn
at launch — so indexability is gated by an explicit flag instead.

**`SITE_LAUNCHED` — server-only, opt-in, exact string `"true"`.** Anything else
(unset, empty, `"false"`, `"TRUE"`, `"true "`) means not launched. Fail-closed
is the point: the failure mode is silent, and by the time it is visible a
crawler has already acted.

Deliberately **not** `NEXT_PUBLIC_` — Next inlines those into the client
bundle, and a crawler-facing gate belongs on the server. Read at **request
time**, not build time, so a release artifact carries no indexability of its
own and no build can be promoted into a slot and quietly become public.

| Layer | File | Stops |
|---|---|---|
| `robots.txt` | `src/app/robots.ts` | crawling |
| `X-Robots-Tag` header | `src/proxy.ts` | indexing of anything already fetched |
| page `<meta robots>` | `src/lib/seo/metadata.ts` | indexing of a rendered page |

While unlaunched the sitemap also publishes no URL inventory at all.

"No DNS exists yet" is not a control: DNS can be pointed in a minute, a server
can be reached by IP or through a shared host's default vhost, and one inbound
link is enough for a crawler to try.

## 4. Before any real deployment

1. **Provision ImageKit** — set `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`,
   `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`. Upload the
   photography listed in `CONTENT_MODEL.md` §6, then flip each asset's
   `status` to `"approved"` in `src/content/media/image-manifest.ts`.
2. **Provision FeelStack** — see `FEELSTACK.md` §7. The adapter builds and
   typechecks without these set.
3. **Wire a contact-form delivery provider** — set `CONTACT_DELIVERY_PROVIDER`
   and implement the branch in `src/lib/forms/contact-delivery.ts`. Until then
   every submission fails closed with a "please call us" fallback, by design —
   it never shows a false success.
4. **Replace the recreated logo SVG** (`src/components/layout/Logo.tsx`) with
   the master vector file.
5. **Run the full suite green**: `npm run validate` and `npx playwright test`.
6. **Get sign-off** on content provenance and the Arabic review status
   (`CONTENT_MODEL.md` §2–3). No page goes live with unreviewed medical claims
   or unreviewed Arabic copy.
7. **Set `SITE_LAUNCHED=true`** as a deliberate, separate step (§3).
8. **DNS cutover** (§5) — requires explicit approval.

## 5. DNS and the legacy domains

Source of truth for redirects: `src/lib/seo/legacy-redirects.ts`, consumed by
`src/proxy.ts`. All are direct (no chains), exact-match, and return 301.

- **`bluediamondmedical.ca`** — becomes canonical. `src/proxy.ts` handles its
  own legacy-URL 301s natively, including the bare-path locale prefix
  (`/` → `/en/`, a genuine 301 because `defaultLocale` is a static constant, not
  Accept-Language negotiation).
- **`bluediamondmedicalaesthetics.ca`** — a separate legacy domain. This app
  cannot redirect requests it never receives, so retiring it needs either:
  1. pointing it at the same hosting and adding a host-aware branch to the
     proxy plus the table below in `legacyRedirects`; or
  2. configuring redirects at the DNS/host/CDN level straight to
     `https://bluediamondmedical.ca/en/...` per the table below.

  Option 2 is simpler to operate and keeps the proxy host-agnostic. Pursue
  option 1 only if one deploy must serve both domains directly.

### bluediamondmedicalaesthetics.ca → bluediamondmedical.ca

This table is **not** in code — it exists only here and must be configured at
the host or CDN.

| Old path | New path |
|---|---|
| `/` | `/en/aesthetics` |
| `/treatments` | `/en/aesthetics/treatments` |
| `/area-concern` | `/en/aesthetics/concerns` |
| `/our-technologies` | `/en/aesthetics/technologies` |
| `/our-team` | `/en/doctors` |
| `/laser-hair-removal` | `/en/aesthetics/treatments/laser-hair-removal` |
| `/laser-treatment-1` | `/en/aesthetics/treatments/laser-skin-treatments` |
| `/radio-frequency` | `/en/aesthetics/treatments/radio-frequency` |
| `/rf-micro-needeling` | `/en/aesthetics/treatments/rf-microneedling` |
| `/ultra-treatment` | `/en/aesthetics/treatments/ultra` |
| `/vitalia` | `/en/aesthetics/treatments/tempsure-vitalia` |
| `/prp-therapy` | `/en/aesthetics/treatments/prp-skin-rejuvenation` |
| `/acne-scar-removal` | `/en/aesthetics/concerns/acne-scars` |
| `/rosacea-abatement` | `/en/aesthetics/concerns/rosacea-redness` |
| `/dry-skin-remediation` | `/en/aesthetics/concerns/dry-skin` |
| `/fineline-and-wrinkle` | `/en/aesthetics/concerns/fine-lines-wrinkles` |
| `/non-invasive-skin` | `/en/aesthetics/concerns/skin-laxity` |
| `/spider-vein` | `/en/aesthetics/concerns/spider-veins` |
| `/sun-damage` | `/en/aesthetics/concerns/sun-damage-pigmentation` |
| `/skin-revitalization` | `/en/aesthetics/concerns/skin-revitalization` |
| `/razor-bumps` | `/en/aesthetics/concerns/razor-bumps` |
| `/terms-and-conditions` | `/en/terms` |
| `/privacy-policy` | `/en/privacy-policy` |
| `/ols/products` | `/en/shop` |

Notes: the legacy PRP page covered both hair and skin in one page and was split
in two — this path lands on the skin-rejuvenation half, closer to the original's
framing. `/vitalia` and `/ols/products` were found by a live sitemap crawl, not
the source document; `/ols/products` is GoDaddy platform boilerplate with no
unique editorial content. The two legal targets resolve to a 404 boundary until
`legalPagesEnabled` is on — correct and deliberate, not a regression. Every
other target is a live 200 page.

### Cutover order

1. Confirm the hosting target.
2. Point `bluediamondmedical.ca` DNS at the host.
3. Either configure the aesthetics domain's redirects, or leave it live until
   they are verified, to avoid a dead window.
4. Verify every row above and every row in `legacy-redirects.ts` with a real
   `curl -I` before decommissioning the old sites.
5. Update Search Console / Bing Webmaster Tools with the canonical domain and
   submit `https://bluediamondmedical.ca/sitemap.xml`.

No DNS change happens without explicit approval.

## 6. CI

`.github/workflows/ci.yml`: `npm ci`, typecheck, lint, build, install
Playwright browsers, run the full suite. Any red step fails the pipeline. It
never deploys. `.github/workflows/deploy-production.yml` is
`workflow_dispatch`-only and is the sole deployment path (§2).
