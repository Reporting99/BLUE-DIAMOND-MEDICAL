# Production deployment

## Model

Two permanent slots, **BLUE `127.0.0.1:3030`** and **GREEN `127.0.0.1:3031`**.
A release is installed into the *inactive* slot, started, health-checked and
identity-verified before anything points at it. The active slot keeps serving
throughout, which is what makes rollback a switch rather than a rebuild.

No staging, no preview, no per-branch runtime. Both slots bind loopback only —
Nginx is the only thing on this shared host that may face the internet.

Ports audited free on 2026-08-22 against `ss -tlnp`, every nginx `proxy_pass`
target, and the PM2 process table (so ports held by stopped services were
included).

## Chain of custody

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

Without it the reviewed deployment logic and the executed logic drift silently.

## Why `/api/version`

HTTP 200 proves *some* backend answered — not that the proxy is serving the
release just deployed. A wiring mistake lets the previous slot keep answering
200 while every deploy reports success. `/api/version` returns the exact
`.release-sha` on disk, so the deploy asserts content identity, not liveness,
and rolls back on mismatch.

## ISR prerender-cache grant

The base permissions leave a release `root:blue-diamond` at `u=rwX,g=rX,o=`.
That is correct for code, but Next.js rewrites revalidated route output in
place under `.next/server/app` (`<route>.body` / `.meta`), so a revalidating
route fails with `EACCES` and its cache can never be persisted.

The grant is derived from the build output, and is narrow: only directories
that already contain prerendered output become group-writable, only the
`.body`/`.meta` artifacts themselves get the write bit, nothing becomes
world-anything, and compiled code stays read-only.

**On the current build it grants nothing** — there is no time-based ISR route
today. It is included because `src/lib/feelstack/client.ts` already issues
`fetch(..., { next: { revalidate } })`: the moment `FEELSTACK_CONTENT_MODE`
moves from `static` to `hybrid`/`cms`, every page resolving through it becomes
a revalidating route and this failure becomes live. Adding the grant afterwards
would mean shipping the bug first.

## Pre-domain behaviour

With no `/etc/nginx/snippets/blue-diamond-backend.conf`, the deploy script
derives the serving slot from systemd plus a loopback probe, deploys and
verifies the inactive slot on loopback, and logs `TRAFFIC_SWITCH_SKIPPED`
instead of pretending a switch happened. The same script works unchanged after
launch.

## State

`/home/blue-diamond/deployments/active-release.env` records slot, port, SHA and
timestamp. It is **not** the authority: once nginx manages traffic the snippet
is, and the script **refuses to deploy** when the two disagree rather than
normalizing the state file. Silently "correcting" stale state is how a deploy
overwrites the slot that is actually serving.

## Provisioning

Not yet performed. See `ops/deploy/README.md` for the trust-anchor install and
`ops/nginx/README.md` for the launch procedure.
