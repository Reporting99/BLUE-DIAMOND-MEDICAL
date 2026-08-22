# Server provisioning (not yet performed)

**Nothing in this document has been executed.** The host already runs several
unrelated production tenants; creating users, systemd units and sudoers rules
is a change to that shared host and needs explicit authorisation. This is the
exact procedure, written so it can be reviewed before it is run.

`docs/DEPLOYMENT.md` describes how a *release* works once the host is
provisioned. This describes the one-time host setup that has to happen first.

## Port assignment

Audited 2026-08-22 (`ss -tlnp`, all nginx `proxy_pass` targets, and the PM2
process table, so ports reserved by currently-stopped services are included),
and re-verified free since:

```
in use: 3000 3001 3002 3003 3005 3006 3008 3009 3010 3011 3012 3020
        4005 4006 5050 5432 5678 6379 11211
```

| Slot | Port |
|---|---|
| BLUE | `3030` |
| GREEN | `3031` |

Both verified free, and clear of the densely-used 3000–3020 band so a future
tenant is unlikely to collide. Both bind **127.0.0.1 only** (`HOSTNAME` in the
slot env file). The application must never bind a public interface: on this
shared host that would expose it to every other tenant, not merely to the
internet.

## Accounts

| User | Purpose | Shell |
|---|---|---|
| `blue-diamond` | runs both slots | nologin |
| `deploy-blue-diamond` | CI's SSH target | restricted |

The deploy user's entire root authority is the two sudoers lines in
`ops/deploy/sudoers.d/zz-deploy-blue-diamond`. It cannot write files as root by
any other route.

## Directory layout

```
/home/blue-diamond/
  apps/blue/releases/<sha>/        release directories
  apps/blue/current -> releases/…  atomically swapped symlink
  apps/green/…                     same
  shared/.env.production           0640 root:blue-diamond — the ONLY secrets on disk
  shared/blue-runtime.env          PORT=3030, HOSTNAME=127.0.0.1
  shared/green-runtime.env         PORT=3031, HOSTNAME=127.0.0.1
  deployments/active-release.env   slot state
  deployments/deployments.log      append-only deploy log

/home/deploy-blue-diamond/uploads/ artifact + deploy-script landing zone

/home/blue-diamond-src/repo        source workspace (already created)
```

Source code never lives inside a release directory, and secrets never live
inside a release artifact — each release symlinks `.env` to the shared file, so
a rollback restores old code without restoring old configuration.

## Commands

```bash
# 1. accounts
adduser --system --group --home /home/blue-diamond --shell /usr/sbin/nologin blue-diamond
adduser --disabled-password --gecos "" --home /home/deploy-blue-diamond deploy-blue-diamond

# 2. layout
install -d -o blue-diamond -g blue-diamond -m 750 \
  /home/blue-diamond/apps/blue /home/blue-diamond/apps/green \
  /home/blue-diamond/deployments
install -d -o root -g blue-diamond -m 750 /home/blue-diamond/shared
install -d -o deploy-blue-diamond -g deploy-blue-diamond -m 750 \
  /home/deploy-blue-diamond/uploads

# 3. runtime env (per slot; no secrets here)
install -m 640 -o root -g blue-diamond ops/systemd/blue-runtime.env.example \
  /home/blue-diamond/shared/blue-runtime.env
install -m 640 -o root -g blue-diamond ops/systemd/green-runtime.env.example \
  /home/blue-diamond/shared/green-runtime.env

# 4. application secrets — hand-written from .env.example, never committed
install -m 640 -o root -g blue-diamond /dev/null /home/blue-diamond/shared/.env.production
# then edit it in place

# 5. systemd
install -m 644 -o root -g root ops/systemd/blue-diamond@.service \
  /etc/systemd/system/blue-diamond@.service
systemctl daemon-reload

# 6. sudoers — validate BEFORE installing; a malformed sudoers file can lock
#    every account out of sudo on this shared host
visudo -cf ops/deploy/sudoers.d/zz-deploy-blue-diamond
install -m 0440 -o root -g root ops/deploy/sudoers.d/zz-deploy-blue-diamond \
  /etc/sudoers.d/zz-deploy-blue-diamond

# 7. the installer — the trust anchor, placed once by hand, never by CI
install -m 0750 -o root -g root ops/deploy/install-blue-diamond-deploy-script \
  /usr/local/sbin/install-blue-diamond-deploy-script

# 8. CI's SSH key
install -d -m 700 -o deploy-blue-diamond -g deploy-blue-diamond \
  /home/deploy-blue-diamond/.ssh
# append the CI public key to authorized_keys
```

Note step 7: the deploy script itself is **not** installed by hand. CI installs
it from the commit being deployed, through the installer, so the reviewed
script and the executed script are the same file.

## What is NOT provisioned

- No nginx vhost, no TLS, no DNS. The application is loopback-only and
  unreachable from the internet.
- No staging, preview, or per-branch runtime. Two permanent slots, both
  production.
- No cron, no timers.

## First release

1. Provision the above.
2. Set the GitHub repository variables and secrets that
   `.github/workflows/deploy-production.yml` actually reads:

   | Kind | Name |
   |---|---|
   | variable | `DEPLOY_TAILSCALE_HOST`, `DEPLOY_PORT`, `DEPLOY_USER`, `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` |
   | secret | `DEPLOY_SSH_PRIVATE_KEY`, `DEPLOY_KNOWN_HOSTS`, `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET` |

   Plus a `tag:blue-diamond-deploy` entry in the Tailscale ACL.
3. Run **Deploy Production** manually with a green-CI SHA from `main`.
4. With no nginx snippet present, the script deploys to blue, health-gates it
   on `127.0.0.1:3030/api/version`, verifies the served SHA, logs
   `TRAFFIC_SWITCH_SKIPPED`, and records state. Nothing is public.
5. Only after a manual release has proven the whole path should the automatic
   `workflow_run` trigger be considered.

---

Salvaged from the abandoned `feat/feelstack-production-foundation` branch
(`9c3b1b1`), which was never merged and whose application architecture was
superseded. This procedure and `scripts/validate-no-secrets.mjs` were the only
two artefacts on that branch with no equivalent on `main`. Every path, unit and
sudoers file it references was verified to exist in `ops/` before this was
carried across.
