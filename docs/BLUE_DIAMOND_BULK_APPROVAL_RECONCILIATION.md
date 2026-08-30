# Bulk Approval Reconciliation

**Status: reconciliation computed. The corrective write was BLOCKED by local execution policy and has NOT been applied.**

Machine-readable: `BLUE_DIAMOND_BULK_APPROVAL_RECONCILIATION.json` ·
Executable batch: `BLUE_DIAMOND_PENDING_CMS_WRITES.json`

## What happened

| | Before | After bulk event | Target |
|---|---|---|---|
| `approved` | 1 | 37 | **4** |
| `pending` | 37 | 1 | **34** |

- **Bulk window:** `2026-08-30T20:56:55Z` → `2026-08-30T20:57:02Z` (35 rows in 7 s, plus one at the boundary — 36 total).
- **Assets flipped:** 36.
- **Pre-event approved (preserved):** 1 — `/blue-diamond/medical/eye-screening-hero.png` (`55245148…`).

**Pre-event state is evidenced, not inferred.** A census taken at 20:35Z recorded per-asset
`approvalStatus` for every asset backing an assignment: exactly one `approved`, everything else
`pending`. That snapshot predates the bulk window.

## Root cause

`POST /admin/v1/projects/:projectId/media/register-existing` carrying `approvalStatus: "approved"`.

`project-media-import.service.ts` → `applyMetadata()`:

```ts
if (dto.approvalStatus) asset.approvalStatus = dto.approvalStatus;
```

`register-existing` is the idempotent re-registration path. Re-running the importer over
already-registered paths with that field set rewrites approval on every row it touches. It is not
a bug in the resolver or in the frontend — it is the import contract doing exactly what it was
asked to do.

Note `PATCH /media/:id` **cannot** cause this: `UpdateMediaAssetDto` has no `approvalStatus` field.
`register-existing` (or `media/import`) is the only route that can.

## Actor

**Undeterminable from this credential.** `PlatformAuditInterceptor` is applied to the controller,
so the call is recorded server-side, but no audit read route is exposed to a non-root
project-scoped role — `audit`, `audit-logs`, `audit/events`, `platform-audit` and `activity` all
return 404 for `bd-media-import`.

Retrieving the actor needs a root-scoped credential or direct database access. **Recommended
follow-up**, since an unexplained automated approval of 36 medical assets is a process failure
regardless of the corrective action.

## The corrective batch

The rule applied is *revert exactly what the bulk event introduced* — never "set everything to
pending".

| Action | Count | Rule |
|---|---|---|
| `NO_CHANGE` | 2 | pre-event approved asset; and the one still-`pending` logo |
| `RETAIN_APPROVED_CONTENT_REVIEWED` | 3 | independently content-reviewed `APPROVE`; retained, with factual bilingual alt text attached |
| `REVERT_TO_PENDING` | 33 | approval came solely from the bulk event and the asset is not content-reviewed |

**Target end state: 4 approved, 34 pending.**

The three retained:

| Asset | Path | Placement |
|---|---|---|
| `39c34d76…` | `…/094975f21717-Dr.Farhat.jpg` | `doctorPortrait` — Dr. Mohamed Farhat (EN + AR) |
| `f3337d42…` | `…/93525704bb66-BNG8ZRE.jpg` | `hero` — `/medical/eye-screening` |
| `fa9f759a…` | `…/b285b18977bb-CynoSure_…jpg` | `hero` — `/aesthetics/treatments/rf-microneedling` |

> `fa9f759a…` is Cynosure manufacturer stock. It passed **content** review (no claims text, no
> before/after, no identifiable patient in distress) but its **licensing remains
> REVIEW_REQUIRED** — appearing on the legacy site is not evidence of a transferable licence.

## Not touched

- No assignment disabled, created or deleted.
- No ImageKit asset moved, renamed or deleted.
- No `disabled` / `photoDeclined` record touched — Dr. Omaima Saeed remains `photoDeclined: true`,
  `disabled`, zero assignments.
- `metadata` is omitted from every operation, so `altTextApproved`, `importNamespace` and source
  provenance are preserved.

## Execution

Blocked locally: the outbound write was denied by execution policy, so **no CMS mutation was
attempted**. All 36 operations are prepared in `BLUE_DIAMOND_PENDING_CMS_WRITES.json`, each with an
`idempotencyKey`, and are safe to re-run — `register-existing` is idempotent by path and never
touches provider identity (`fileId` / `url` / `path`).

Until it runs, **33 unsafe assets remain publicly resolvable**, which is why PR #32 stays blocked.
