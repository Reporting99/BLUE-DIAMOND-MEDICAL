# Deployment

## Model

Two permanent slots, BLUE (`3030`) and GREEN (`3031`). A release is installed
into the **inactive** slot, started, health-checked and identity-verified
before anything points at it. The active slot keeps serving throughout, which
is what makes rollback a switch rather than a rebuild.

There is no staging, preview, or per-branch runtime.

## The chain of custody

```
commit on main
  → CI green for that exact SHA
  → Deploy Production (manual, workflow_dispatch)
      · verifies the SHA is an ancestor of origin/main
      · verifies CI passed for that SHA specifically
      · builds, packages, uploads artifact + deploy script
      · installs the deploy script FROM THIS COMMIT
      · runs it once
  → deploy-blue-diamond (server, root)
      · validates the artifact as untrusted input
      · extracts, grants ISR cache writes, swaps `current`
      · starts the inactive slot
      · health-gates it, then verifies /api/version === release SHA
      · switches nginx (once a vhost exists) and re-verifies publicly
      · rolls back automatically on any failure
```

The invariant the installer exists to hold:

```
CI-passed SHA == application release SHA == deployment-script source SHA
```

Without it the reviewed deployment logic and the executed deployment logic can
drift silently — which has already happened once on this host.

## Why `/api/version`

HTTP 200 proves *some* backend answered. It does not prove the proxy is serving
the release just deployed: a wiring mistake lets the previous slot keep
answering 200 while every deploy reports success. `/api/version` returns the
exact `.release-sha` on disk, so the deploy asserts content identity, not
liveness. A mismatch triggers the same automatic rollback as any other failure.

## Rollback

Automatic on any failure during a deploy: nginx snippet restored, target
service stopped, `current` symlink restored, staged and created release
directories removed, previous slot left untouched throughout.

Manual rollback after a successful deploy = redeploy the previous SHA, which
lands in the now-inactive slot holding the previous release. `KEEP_RELEASES=3`
per slot.

## Installing the trust anchor (once, by hand, as root)

```bash
visudo -cf ops/deploy/sudoers.d/zz-deploy-blue-diamond
install -m 0440 -o root -g root ops/deploy/sudoers.d/zz-deploy-blue-diamond \
  /etc/sudoers.d/zz-deploy-blue-diamond
install -m 0750 -o root -g root ops/deploy/install-blue-diamond-deploy-script \
  /usr/local/sbin/install-blue-diamond-deploy-script
```

`install-blue-diamond-deploy-script` is deliberately **not** self-updating. A
script that can rewrite its own validation logic on the say-so of the party it
validates is not a privilege boundary.

## Pre-domain behaviour

With no `/etc/nginx/sites-enabled/blue-diamond-active-slot.conf`, the deploy script:

- derives the serving slot from systemd plus a loopback probe;
- deploys and verifies the inactive slot on loopback;
- logs `TRAFFIC_SWITCH_SKIPPED` instead of pretending a switch happened;
- stops the previously-serving slot only after the new one is verified.

The same script works unchanged after launch. Nothing is edited on the day a
domain is pointed at it.

## State

`/home/blue-diamond/deployments/active-release.env` records the slot, port,
SHA and timestamp. It is **not** the authority: once nginx manages traffic, the
snippet is, and the script **refuses to deploy** when the two disagree rather
than normalizing the state file. A stale state file silently "corrected" is how
a deploy overwrites the slot that is actually serving.
