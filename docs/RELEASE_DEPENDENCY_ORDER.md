# Release Dependency Order

**Nothing here has been merged or deployed. No branch may be self-merged.**

## Graph

```
FeelStack PR #61  ── fix/register-existing-approval-invariant ──▶ FeelStack main
   (root cause: registration can no longer change approvalStatus)
   independent of the frontend chain — ship it first or in parallel

Blue Diamond:

  feat/feelstack-media-contract        (media.ts, AdapterInput.media, envelope `media`)
            │  NOT ON MAIN — everything below fails tsc without it
            ▼
  hotfix/media-assignment-consumer     PR #32   (consumer + dead-path removal)
            │
            ▼
  fix/ar-locale-cms-path               PR #33   (AR routing, localized-route artifact,
                                                 parity suite, listing media)
```

## Exact merge order

| # | Branch / PR | Merges into | Gate |
|---|---|---|---|
| 1 | **FeelStack PR #61** | FeelStack `main` | independent; prevents recurrence of the bulk-approval incident |
| 2 | `feat/feelstack-media-contract` | BD `main` | must land first — supplies `media.ts` / `AdapterInput.media` |
| 3 | **PR #32** `hotfix/media-assignment-consumer` | BD `main` (retarget after 2) | media safety already satisfied: unsafe publicly-resolvable = 0 |
| 4 | **PR #33** `fix/ar-locale-cms-path` | BD `main` (retarget after 3) | contains 2 and 3; do not merge before them |

## Why the order cannot be changed

`src/lib/feelstack/media-slots.ts` imports `primaryForSlot` and `ResolvedMedia` from `src/lib/feelstack/media.ts`, which exists **only** on `feat/feelstack-media-contract`. Confirmed: `git cat-file -e origin/main:src/lib/feelstack/media.ts` fails.

Retargeting PR #32 or #33 straight at `main` fails `tsc --noEmit` before any test runs. Merging #33 before #32 would carry #32's commits in anyway but review them out of order.

FeelStack PR #61 is **not** a build dependency of the frontend chain — the frontend never calls the write API. It is a **release** dependency: without it, any importer re-run can re-promote the 34 assets the corrective batch just reverted, silently undoing the fix.

## Do not

- Retarget PR #32 or #33 to `main` before `feat/feelstack-media-contract` lands.
- Merge any branch automatically.
- Deploy. Production slots 3030/3031 were untouched throughout and the active release SHA is unchanged.
