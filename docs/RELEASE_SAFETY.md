# Release safety — the SHA chain, and the fourteen properties

Companion to `docs/RELEASE_ARCHITECTURE_AUDIT.md`, which explains what was
wrong. This document states what must now be true.

## The SHA chain

One commit identity has to survive, unchanged, through six hands. A break
anywhere means something other than the reviewed commit is serving traffic.

```
1. origin/main               the commit is an ancestor of main
2. CI run head_sha           CI passed for THIS sha, not for the branch
3. artifact filename         blue-diamond-<sha>.tar.gz, from that run
4. artifact checksum         .sha256 sidecar, written by the producer
5. .release-sha in tarball   what /api/version will report
6. deployed + served SHA     what the running slot answers
```

Where each link is enforced:

| Link | Enforced by |
|---|---|
| 1 | `deploy-production.yml`, `Verify the SHA is on main` — `git merge-base --is-ancestor` |
| 2 | `deploy-production.yml`, `Verify CI passed for this SHA and locate its run` — `head_sha=${RELEASE_SHA}`, `conclusion == success` |
| 2→3 | `gh run download --name "release-${RELEASE_SHA}"` — a wrong-commit artifact does not answer to this name |
| 3→4 | `sha256sum -c` against the sidecar, before anything is uploaded |
| 4→5 | `tar -xzO ./.release-sha` compared to `RELEASE_SHA`, before anything is uploaded |
| 5 | `scripts/package-standalone.sh` writes `.release-sha` and re-reads it |
| 5→6 | `ops/deploy/deploy-blue-diamond`, `verify_served_sha()`, rolls back on mismatch |
| 6 | `deploy-production.yml`, `Verify the serving slot reports this SHA`, independently from outside |

Links 3 and 4 are the new ones. Previously the deploy verified only
*deployed-vs-requested* — which could not detect a wrong artifact, because the
deploy produced the artifact itself and it was correct by construction. Now that
the artifact arrives from elsewhere, its identity has to be checked on arrival.

**If any link cannot be established, the deploy refuses.** There is no
`--force`, and adding one would defeat the entire chain.

## The fourteen properties

| # | Property | How it is proven |
|---|---|---|
| 1 | The deploy workflow never builds the application | `tests/deploy/release-architecture.spec.ts`; `scripts/assert-no-app-build.sh` executed against synthetic workflows, and as a CI job |
| 2 | CI produces exactly one deployable artifact per merged SHA | `release-architecture.spec.ts` — job exists, `needs: validate`, push-to-main only, SHA-named |
| 3 | The artifact carries a verifiable checksum | `release-architecture.spec.ts`; `package-standalone.sh` self-verifies with `sha256sum -c` |
| 4 | Transient CMS failures are retried with bounded, jittered backoff | `tests/unit/feelstack-retry.spec.ts` — injected clock and RNG |
| 5 | Integrity failures are never retried and never fall back | `feelstack-retry.spec.ts` — a second attempt is asserted NOT to happen |
| 6 | The retry budget cannot become unbounded | `feelstack-retry.spec.ts` — clamped 1..5 |
| 7 | The deploy consumes the CI artifact for the exact SHA | `release-architecture.spec.ts` |
| 8 | Checksum and embedded `.release-sha` are verified before upload | `release-architecture.spec.ts`, including step ordering |
| 9 | `content:sync` runs thirteen steps in a fixed order | `tests/contracts/content-sync-orchestration.spec.ts` — injected executor |
| 10 | A failed or conflicted step stops everything after it | `content-sync-orchestration.spec.ts` |
| 11 | A write that cannot be revalidated does not run, and revalidation is verified | `tests/contracts/revalidation-required.spec.ts` — the tool is executed, and its signing scheme is verified against the app's own `verifyHmacSignature` |
| 12 | The artifact's shape still matches what the orchestrator asserts | `release-architecture.spec.ts` |
| 13 | `/api/version` reports the deployed release's own identity | **Mechanism-tested.** `release-architecture.spec.ts` proves the route reads `.release-sha` from the running release, that packaging writes it, and that the deploy re-checks it. That the *running production process* answers correctly needs a live deploy. |
| 14 | Content drift fails CI before the E2E suite | `release-architecture.spec.ts` — step ordering, and the exit-code split between "unreachable" and "wrong" |

Derived counts (Phase 5) are covered separately by
`tests/contracts/republish-manifest-counts.spec.ts`; fixture provenance and
drift verdicts by `tests/contracts/content-drift-gate.spec.ts`.

### What is mechanism-tested rather than fully closed

Only **#13**, and only its last hop. Everything from the commit to the verified
tarball is provable from files. "The process that is currently serving requests
answers `/api/version` with the SHA that was deployed" is a statement about a
running production system, and the only honest way to close it is to deploy and
look. The test therefore asserts the mechanism is wired to the right source —
the `.release-sha` the packaging script put in the artifact — rather than
skipping, because a wrong wiring (a build-time constant, an env var) is exactly
the mistake that would make the deploy's own verification pass on nothing.

## Operating rules

- **Never hand-build and upload an artifact.** The server-side script accepts
  only `/home/deploy-blue-diamond/uploads/blue-diamond-<sha>.tar.gz`, but it
  cannot tell who built it. The CI artifact is the release.
- **Never add a build step to `deploy-production.yml`**, including "just to
  install a tool". `npm install -g <tool>` and `npx <tool>` are allowed by the
  guard; the application's own build is not. If an exemption is genuinely
  needed, the marker `# allow-build-command: <reason>` forces it to be written
  down and reviewed.
- **A red content drift gate is not re-run.** Exit 1 means a field disagrees;
  exit 3 means the CMS was unreachable and no verdict was reached. Only the
  second is worth retrying.
- **`content/feelstack/drift-gate-acknowledged.json` is a backlog, not a pass.**
  The gate fails when an acknowledged field stops drifting, so the list can only
  shrink.
