# Domain cutover runbook — bluediamondmedical.ca

**Prepared 2026-09-07.** Every value below was read off this server or from
public DNS. Nothing here is assumed, and no IP address is invented.

## 1. Where the site runs today

| | |
|---|---|
| Host | `srv694286`, public IPv4 **82.180.155.32**, public IPv6 **2a02:4780:d:1016::1** |
| Reverse proxy | nginx 1.30.3, CloudPanel-managed (`/etc/nginx/sites-enabled/*.conf`) |
| App | systemd `blue-diamond@{blue,green}.service`, Node 20.19.5, bound to **127.0.0.1 only** |
| Ports | blue **3030**, green **3031** |
| Active slot | read from `/etc/nginx/sites-enabled/blue-diamond-active-slot.conf`, never assumed |
| TLS store | CloudPanel: `/etc/nginx/ssl-certificates/<domain>.{crt,key}` |
| TLS client | **certbot is NOT installed.** CloudPanel issues Let's Encrypt certs itself |
| Cloudflare | none. No tracked wrangler/Pages/Workers file, no Cloudflare reference in `package.json`, `next.config.ts`, `.github/`, `ops/` or `src/` |

There is **no Blue Diamond vhost installed yet**, by design.

## 2. DNS — what must change

Both domains are on **GoDaddy** nameservers (`ns35/ns36.domaincontrol.com` and
`ns49/ns50.domaincontrol.com`) and today both point at AWS
(`13.248.243.5`, `76.223.105.230`) — not at this server.

Change **only** these four records:

| Domain | Type | Name | Current | New |
|---|---|---|---|---|
| bluediamondmedical.ca | A | `@` | 13.248.243.5, 76.223.105.230 | **82.180.155.32** |
| bluediamondmedical.ca | A | `www` | 13.248.243.5, 76.223.105.230 | **82.180.155.32** |
| bluediamondmedicalaesthetics.ca | A | `@` | 13.248.243.5, 76.223.105.230 | **82.180.155.32** |
| bluediamondmedicalaesthetics.ca | A | `www` | 13.248.243.5, 76.223.105.230 | **82.180.155.32** |

Remove the duplicate A records so each name resolves to the single new address.
AAAA is optional; add `2a02:4780:d:1016::1` only if you want IPv6, and only for
all four names together.

Lower TTL to 300s a day ahead, cut over, then restore.

## 3. DNS — what must NOT change

**Live email runs on these domains. Touching any record below breaks it.**

| Domain | Record | Value |
|---|---|---|
| bluediamondmedical.ca | MX | `mx1/mx2/mx3-usg2.ppe-hosted.com` (Proofpoint → Microsoft 365) |
| bluediamondmedical.ca | TXT SPF | `v=spf1 include:_spf-usg2.ppe-hosted.com include:secureserver.net ~all` |
| bluediamondmedical.ca | TXT | `NETORG10134018.onmicrosoft.com` (M365 domain verification) |
| bluediamondmedicalaesthetics.ca | MX | `bluediamondmedicalaesthetics-ca.mail.protection.outlook.com` |
| bluediamondmedicalaesthetics.ca | TXT SPF | `v=spf1 include:secureserver.net -all` |
| bluediamondmedicalaesthetics.ca | TXT | `NETORG17738669.onmicrosoft.com` |

Also leave every DKIM selector CNAME alone. Neither domain publishes DMARC
today; adding one is a separate decision and is **not** part of this cutover.

Only A records for `@` and `www` change. Nothing else.

## 4. Cutover order

DNS first, TLS second, vhost third. The certificate cannot be issued before
DNS resolves here, and the vhost cannot load before the certificate exists —
an `ssl_certificate` pointing at a missing file fails `nginx -t`, and on this
shared host that blocks the reload for **every other tenant**.

```bash
# 1. Point the four A records at 82.180.155.32 and wait for propagation.
dig +short bluediamondmedical.ca            # expect 82.180.155.32
dig +short www.bluediamondmedical.ca
dig +short bluediamondmedicalaesthetics.ca
dig +short www.bluediamondmedicalaesthetics.ca

# 2. Issue certificates (CloudPanel is the TLS owner on this host).
clpctl lets-encrypt:install:certificate --domainName=bluediamondmedical.ca \
  --subjectAlternativeName=www.bluediamondmedical.ca
clpctl lets-encrypt:install:certificate --domainName=bluediamondmedicalaesthetics.ca \
  --subjectAlternativeName=www.bluediamondmedicalaesthetics.ca
ls -l /etc/nginx/ssl-certificates/bluediamondmedical*.crt   # must exist before step 3

# 3. Install the vhosts, and the generated upstream they depend on.
install -m 0644 ops/nginx/blue-diamond-active-slot.conf        /etc/nginx/sites-enabled/
install -m 0644 ops/nginx/bluediamondmedical.ca.conf           /etc/nginx/sites-enabled/
install -m 0644 ops/nginx/bluediamondmedicalaesthetics.ca.conf /etc/nginx/sites-enabled/
mkdir -p /var/www/letsencrypt /home/blue-diamond/logs/nginx
chown -R blue-diamond:blue-diamond /home/blue-diamond/logs
nginx -t && systemctl reload nginx      # reload, never restart

# 4. Make the site indexable — the single auditable switch, on BOTH slots.
#    Until this, robots.txt is `Disallow: /`, the sitemap is empty and every
#    response carries a noindex X-Robots-Tag.
sed -i 's/^# SITE_LAUNCHED=true/SITE_LAUNCHED=true/' \
  /home/blue-diamond/shared/blue-runtime.env /home/blue-diamond/shared/green-runtime.env
systemctl restart blue-diamond@blue blue-diamond@green

# 5. Only after HTTPS has served correctly, enable HSTS by uncommenting the
#    Strict-Transport-Security line in bluediamondmedical.ca.conf and reloading.
```

## 5. Already verified, before any DNS change

Run against a throwaway nginx on ports 8081/8444 using the real vhost files and
Host headers, so no live config and no DNS was touched:

- `http://bluediamondmedical.ca/` → 301 `https://bluediamondmedical.ca/`
- `https://www.bluediamondmedical.ca/` → 301 apex
- `http://bluediamondmedicalaesthetics.ca/prp-therapy` → 301 `https://bluediamondmedical.ca/prp-therapy`
- `https://www.bluediamondmedicalaesthetics.ca/treatments` → 301 `https://bluediamondmedical.ca/treatments`
- `/en`, `/en/medical`, `/en/our-team`, `/en/shop`, `/en/contact`, `/en/aesthetics`,
  `/robots.txt`, `/sitemap.xml` all **200** through the canonical vhost
- `POST /api/feelstack/revalidate` reaches the route handler (415), proving the
  exact-path proxy_pass does not rewrite the URI to `/`
- `/_next/static/*` serves `Cache-Control: public, max-age=31536000, immutable`, once
- Canonical and `og:url` already emit `https://bluediamondmedical.ca` — no staging,
  Cloudflare or legacy-aesthetics host anywhere in the markup
- Security headers present: `X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options`, `Permissions-Policy`. HSTS deliberately absent until step 5.

No redirect chain longer than two hops, and no loop: the aesthetics host and
the canonical host are different vhosts, and the second hop is the
application's own already-tested legacy path map.

## 6. Rollback

Revert the four A records to `13.248.243.5` / `76.223.105.230`. Nothing on this
server needs undoing — the vhosts serve only these two hostnames, so removing
them affects no other tenant. Application rollback is unchanged and independent:
the standby slot still holds the previous release.
