# DNS & Legacy Domain Guide

No DNS or hosting changes have been made — this is documentation only, per the brief's explicit instruction not to touch production infrastructure without approval.

## Domains involved

- **`bluediamondmedical.ca`** — becomes the canonical domain for this Next.js app. `src/proxy.ts` handles all of its own legacy-URL 301s natively (see `docs/REDIRECT_MAP.md`).
- **`bluediamondmedicalaesthetics.ca`** — a separate legacy domain. This app cannot redirect requests it never receives, so retiring this domain requires one of:
  1. **Point the domain at the same hosting** as `bluediamondmedical.ca` and let `src/proxy.ts` handle it — would require adding a host-aware branch to the proxy (currently it assumes a single canonical host) and registering the aesthetics-domain redirect table (already drafted in `docs/REDIRECT_MAP.md`) inside `legacyRedirects`.
  2. **Configure redirects at the DNS/host level** (e.g. a redirect rule at the registrar, or a lightweight edge redirect at the CDN/hosting provider) mapping each old path straight to `https://bluediamondmedical.ca/en/...` per `docs/REDIRECT_MAP.md`'s second table. This keeps `bluediamondmedicalaesthetics.ca` as a thin redirect-only domain rather than folding it into the app.

Recommendation: option 2 is simpler to operate and keeps this app's proxy logic host-agnostic; only pursue option 1 if the business wants a single deploy to serve both domains directly.

## Before cutting over

1. Confirm final hosting provider/target (not yet chosen in this build — see `docs/DEPLOYMENT_GUIDE.md`).
2. Set DNS A/CNAME records for `bluediamondmedical.ca` to the new host.
3. Either configure `bluediamondmedicalaesthetics.ca`'s DNS to redirect per the table above, or leave it live until the redirect is verified working, to avoid a dead window.
4. Verify every row in `docs/REDIRECT_MAP.md` with a real HTTP request (`curl -I`) before decommissioning the old sites.
5. Update Google Search Console / Bing Webmaster Tools with the new canonical domain and submit the new sitemap (`https://bluediamondmedical.ca/sitemap.xml`).

No DNS changes will be made without explicit approval, per the master brief.
