# Release architecture audit — why a green commit could still fail to deploy

Written 2026-09-17, against `1d07c12`. Every line number below refers to the
state of the files **before** the change described in "What changed"; the
current files are the fixed version.

## 1. The flow as it was

```
commit ──► CI (ci.yml)                     ──► [nothing is kept]
           lint, typecheck, secret scan,
           build, Playwright

           …later, manually…

           Deploy Production (deploy-production.yml)
           validate SHA ──► verify CI passed ──► npm ci ──► npm run build ──►
           package ──► scp ──► deploy-blue-diamond ──► verify served SHA
```

CI built the commit and threw the build away. The deploy workflow then built it
again, and *that* second build was the one that shipped.

### The evidence, cited

**CI built and discarded.** `ci.yml:49-50` ran `npm run build`; `ci.yml:74-87`
asserted `.next/standalone/server.js` existed. No `upload-artifact` step in the
whole file kept it — the three `actions/upload-artifact` uses at `ci.yml:103`,
`ci.yml:112` and `ci.yml:120` were all `if: failure()` diagnostics (Playwright
log, HTML report, test-results).

**The deploy rebuilt the same SHA.** `deploy-production.yml`:

| Line | Step |
|---|---|
| 96-115 | `Verify CI passed for this SHA` — `gh api …/ci.yml/runs?head_sha=${RELEASE_SHA}`, refuses unless `conclusion == "success"` |
| 117-122 | `Set up Node.js` |
| 124-125 | `Install dependencies` → `npm ci` |
| 214-235 | `Build production application` → `npm run build` |
| 237-247 | `Package standalone release` → `scripts/package-standalone.sh` |

So lines 96-115 proved CI had built and tested this exact commit, and lines
124-235 then built it again from scratch. The artifact that reached production
was produced by a build **no test had ever run against**.

**The second build talked to the live CMS.** `deploy-production.yml:219` set
`FEELSTACK_CONTENT_MODE: hybrid` on that build step. The workflow's own comment
at lines 127-135 explains why that is necessary and what it means: most entity
pages are prerendered by `generateStaticParams`, and `getFeelstackContentMode()`
is read while they render, so the build **resolves live FeelStack content for
every prerendered page**.

CI's build (`ci.yml:49-65`) deliberately did not: it set only
`SITE_URL: https://seo-test.invalid` and `INDEXING_ENABLED: true`, with no
`FEELSTACK_*` at all, and its comment says so — "every ImageKit/FeelStack-
dependent code path is designed to fail closed to local fallback content when
these are unset."

### 2. What actually caused the transient failures

Put the two facts together and the failure mode is structural, not bad luck:

1. The only build that could fail on a CMS timeout was the deploy-time one,
   because it was the only build that contacted the CMS.
2. That build ran at manual-dispatch time — minutes, hours or days after CI
   went green — so it sampled a completely different moment of CMS availability
   than anything that had been verified.
3. `src/lib/feelstack/client.ts` had `MAX_RETRIES = 1` (client.ts:51) with **no
   backoff at all**: the retry loop `continue`d immediately (client.ts:152-155,
   160-163). Two back-to-back attempts against an upstream that is briefly
   unwell are close to one attempt.
4. A production build renders many pages concurrently, so a blip did not fail
   one page — it failed whichever page happened to be rendering, and one failed
   page fails `npm run build`, and a failed build fails the release.

The result: a commit that CI had proven green, whose content had not changed,
could fail to deploy because of a few seconds of upstream latency, with no
re-run path except "try the whole deploy again and hope".

Nothing recorded the timeouts specifically enough to count them here, so this
audit does not claim a number. What it does claim is verifiable from the files:
**the deployed bytes were never the tested bytes, and only the deployed build
could fail this way.**

### 3. Two smaller findings from the same reading

**The republish tool's revalidation could never have worked.**
`scripts/feelstack-republish.mjs` sent `x-feelstack-secret` with a
`{ projectId, path }` body. `src/app/api/feelstack/revalidate/route.ts` →
`processRevalidationRequest` has only ever accepted
`x-feelstack-signature: sha256=<hex>` over `${timestamp}.${rawBody}` plus the
canonical FeelStack envelope (`webhook-handler.ts:211-236`). Every such call
was rejected 401 before the body was parsed — and neither caller checked the
result, so the failure was invisible. Missing configuration additionally took a
`return { skipped: true }` branch that the callers treated as success.

**A hand-maintained count had drifted again.**
`content/feelstack/republish-operations.json` declared
`counts: { applicable: 66, excluded: 6 }` while holding **70** applicable
operations — commit `1d07c12` added four and did not edit the number. There was
already a test asserting the stored count equalled the derived one
(`tests/contracts/clinic-wide-attribution.spec.ts:144-161`); it did not prevent
the drift, it recorded it after the fact.

## What changed

- **CI is the only builder.** `ci.yml` gained a `release-artifact` job
  (`needs: validate`, push-to-main only, `environment: production`) that builds
  with the production configuration, packages with the same
  `scripts/package-standalone.sh`, and uploads `release-<sha>.tar.gz` plus a
  `.sha256` sidecar.
- **The deploy downloads.** `deploy-production.yml` no longer contains
  `npm ci`, `npm run build`, or `actions/setup-node`. It locates the CI run for
  the SHA, `gh run download`s that run's `release-<sha>` artifact, verifies the
  checksum with `sha256sum -c`, and verifies the `.release-sha` **inside** the
  tarball before anything is uploaded.
- **It cannot come back.** `scripts/assert-no-app-build.sh` runs as its own job
  in `workflow-lint.yml`.
- **Transient and integrity failures are now different things.**
  `src/lib/feelstack/retry.ts`.

### Why the release build is a separate build from the test build

It has to be. `validate` builds against the reserved `https://seo-test.invalid`
origin because the Playwright suite requires it
(`tests/support/seo-test-origin.ts`), and metadata, canonical tags and the
sitemap's first ISR snapshot are all baked at build time — a test build is not a
shippable build and never can be. What is shared is the packaging script (one
copy) and the gate: `needs: validate` means no artifact can exist for a commit
whose lint, typecheck, secret scan, build and full Playwright suite did not all
pass.

## Was a "validated snapshot" step worth adding? — evaluated, declined

The idea: fetch and validate all CMS content to a snapshot file, then have the
build read only the snapshot.

Declined, for three reasons specific to this codebase:

1. **The pattern already exists and is already used.**
   `scripts/capture-cms-content.mjs` captures published CMS text to
   `tests/fixtures/feelstack/cms-content-inventory.json`, and
   `tests/contracts/cms-content-drift.spec.ts` compares it against approved repo
   copy. Adding a second, differently-shaped snapshot would create two
   recordings of the same CMS that can disagree — a new drift class, invented to
   close an old one.
2. **The original problem is timing, not validation.** The build failed because
   it ran hours after the evidence, at deploy time. Moving the build into CI
   removes the gap; a snapshot would only have hidden it.
3. **A snapshot would weaken locale integrity.** Rendering from a file rather
   than from the CMS means `checkLocaleIntegrity` runs against a recording. For
   a bilingual medical site, the freshness of the "did the CMS actually resolve
   Arabic?" answer is load-bearing.

What was added instead is bounded, jittered retry in the build's own content
acquisition (`FEELSTACK_RETRY_ATTEMPTS=3` in the release job) plus the
`content-drift-gate` — freshness kept, flakiness bounded, no second copy.

## Verified against the live CMS

Run from this branch on 2026-09-17 against
`https://feelstack.dfeelings.com/api`, site key `blue-diamond-medical`, all
read-only and unauthenticated:

- `node scripts/feelstack-republish.mjs --mode=dry-run` →
  `CONFLICT=12 READY=2 ALREADY_APPLIED=56`, 70 applicable / 6 excluded.
- `node scripts/content-drift-gate.mjs` → 18 DRIFT, 50 CLEAN, 2 UNCHECKED
  before the acknowledgement baseline; 0 new drift after it.
- `node scripts/feelstack-refresh-fixtures.mjs --check` → 9 of 12 recorded
  envelopes have drifted from the live API.
- `node scripts/content-sync.mjs --mode=dry-run` → the step sequence runs and
  stops closed at the first real failure.

Three of those findings are worth naming, because they are real and currently
open:

1. **14 declared corrections are still not live in the CMS.** They are the
   documented `content.publish` backlog (`docs/CMS_CONTENT_AUTHORITY.md`).
2. **4 corrections ARE live but the capture is stale.** `OP-EN-REMEDIATION-01`
   to `-04` match the live CMS exactly; only
   `tests/fixtures/feelstack/cms-content-inventory.json` still holds the old
   values — which means the four matching `KNOWN_CMS_DRIFT` entries in
   `tests/contracts/cms-content-drift.spec.ts` are stale too. One re-run of
   `node scripts/capture-cms-content.mjs` clears both. Not done here: it is a
   content-baseline change, not a release-architecture one.
3. **Three Arabic fixtures record a route the CMS has since moved.**
   `technology-resolve-ar`, `concern-resolve-ar` and `treatment-resolve-ar` were
   recorded when Arabic was served under the English path; the CMS now publishes
   those under Arabic paths and answers the English path with
   `usedFallback: true`. The refresher follows `alternates` to the correct path
   rather than recording a fallback.

## Still requires a human

- Triggering `deploy-production.yml`. Blocked in-session as a production deploy.
- Any `--mode=apply` CMS write. No `bd-content-publisher` credential exists on
  this host.
- Confirming the `production` GitHub environment has no required reviewers. If
  it does, `release-artifact` will wait for approval on every push to main,
  which is a configuration decision, not a code one.
