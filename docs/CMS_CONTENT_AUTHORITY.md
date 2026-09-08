# Which copy actually ships: FeelStack vs this repository

**Rule: for a CMS-backed entity, FeelStack owns the words on the page. This
repository's `src/features/<family>/data.ts` is the offline fallback.**

Editing repo copy and deploying does **not** change what a patient reads.

## Why

`.github/workflows/deploy-production.yml` builds with
`FEELSTACK_CONTENT_MODE=hybrid` and fails closed if `FEELSTACK_API_URL` /
`FEELSTACK_SITE_KEY` are missing. Entity pages are prerendered by
`generateStaticParams` **during that build**, so their HTML is rendered from the
CMS. The runtime slot env deliberately carries no `FEELSTACK_*`, so requests are
served in `static` mode — but the HTML was already baked from the CMS.

```
CMS entry ──(build, hybrid)──> prerendered HTML ──> what the patient reads
repo data ──(fallback only)──> used when the CMS has no entry
```

## What this broke, once

The 2026-09-07 English audit rewrote 19 strings to remove unqualified medical
claims and correct Canadian spelling. It was merged and deployed. On
2026-09-08, 15 of those strings were still live across 13 pages — including
`No downtime is associated with this treatment.` on
`/en/aesthetics/treatments/skin-laxity`, which the audit had deliberately
replaced with hedged wording.

Every gate was green: CI passed, the deploy succeeded, `/api/version` reported
the new SHA. Nothing compared the two sources, so nothing could fail. A second
deploy (`915c990`, 2026-09-08) reproduced it exactly: non-CMS chrome shipped,
every CMS-backed page was unchanged.

## The path trap

A concern is **published** at `/aesthetics/concerns/<slug>` and **served** at
`/aesthetics/treatments/<slug>`. See `CONCERN_CMS_PREFIX` in
`src/features/concerns/cms-contract.ts`.

```
resolve?path=/aesthetics/treatments/skin-laxity  -> 404   ← looks repo-owned
resolve?path=/aesthetics/concerns/skin-laxity    -> 200   ← the real record
```

Two people independently concluded "not CMS-backed" from that 404 on the day
the drift was found. **Never infer ownership from a 404 at the public path.**
Resolve through `cmsPathForLocale` / the family's CMS prefix, or match on the
entry's own `*_id` field as `tests/contracts/cms-content-drift.spec.ts` does.

## How to verify a copy change actually shipped

Not by `/api/version`, not by a green CI run, not by a CMS API read-back.

```bash
curl -s https://bluediamondmedical.ca/<public-path> | grep -c "<a string the change ADDED>"   # must be >= 1
curl -s https://bluediamondmedical.ca/<public-path> | grep -c "<a string the change REMOVED>" # must be 0
```

## Changing CMS-backed copy

1. Edit the repository copy (keeps the fallback and review history correct).
2. Publish the same change to FeelStack —
   `PATCH /admin/v1/projects/:projectId/content/entries/:id` with
   `{ data, status: "published" }`. Requires `content.publish`.
   `scripts/feelstack-republish.mjs` drives this from a tracked operations file.
3. Re-capture: `FEELSTACK_API_URL=... FEELSTACK_SITE_KEY=... node scripts/capture-cms-content.mjs`
4. Deploy. The build re-prerenders from the corrected CMS.
5. Verify with the `curl` pair above.

Skipping step 2 is the failure this document exists to prevent.

## Drift protection

`tests/contracts/cms-content-drift.spec.ts` compares approved repo copy against
the captured CMS inventory and fails as `CMS_CONTENT_DRIFT`. It follows the same
capture-and-compare pattern as `localized-route-parity.spec.ts`: hermetic, so a
red run means "fix the content", never "the CMS had a bad afternoon".

`KNOWN_CMS_DRIFT` in that spec enumerates records already known to be drifted so
that **new** drift fails immediately. It is not a mute: a companion test fails
when a listed record stops drifting, forcing the entry to be deleted, so the
list can only shrink.

### Current backlog — BLOCKED

**22 records** drift as of 2026-09-08. Correcting them needs `content.publish`
on the `blue-diamond-medical` project. The `bd-media-import` identity does not
hold it:

```
PATCH /admin/v1/projects/.../content/entries/<id>  {"status":"…"}
  -> 403 {"message":"Missing content.publish permission."}
```

The guard runs before validation, so that probe mutates nothing. This is a
publisher-identity job, not a code change.

Note the count: a production crawl for strings the audit *removed* found only
13. The other 9 are drift the crawl structurally cannot see — a field whose old
text was never a distinctive published phrase, or a correction that has not
shipped yet. That gap is the argument for the test.
