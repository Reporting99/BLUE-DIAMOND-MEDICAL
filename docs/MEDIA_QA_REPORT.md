<!-- Generated 2026-08-24 by the ImageKit + FeelStack media import run. -->

# Media QA Report

**Outcome: the import stopped at the Phase 1 credential gate. No bytes were
uploaded to ImageKit, no FeelStack record was written, no application code was
changed, and the temporary import directory has been preserved.**

## Phase 1 — Credential and integration verification

Checked against Blue Diamond's real runtime configuration:
`/home/blue-diamond/shared/.env.production` (mode 0640, root:blue-diamond),
symlinked into each release as `.env`, plus both per-slot runtime files. Names only
were read; no value was printed, logged, or copied.

```
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: PRESENT
IMAGEKIT_PUBLIC_KEY:               MISSING
IMAGEKIT_PRIVATE_KEY:              MISSING
FEELSTACK_SITE_KEY:                PRESENT
FEELSTACK_API_URL:                 PRESENT
FEELSTACK_WEBHOOK_SECRET:          PRESENT  (configured as FEELSTACK_REVALIDATE_SECRET)
```

Naming note: this repo's variable for the ImageKit public key is
`NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` (`src/config/imagekit.ts`), and the webhook secret
is `FEELSTACK_REVALIDATE_SECRET` (`.env.example`). Both were checked under the repo's
own names as well as the brief's names. Neither ImageKit key exists under either name.

An ImageKit key pair for the *same* account (`oq92dh6zib`) does exist elsewhere on
this host, in the FeelStack tenant's own service environment. It was **not** used:
it belongs to a different tenant's service account, it is not part of Blue Diamond's
environment contract, and reading a stored secret in order to transmit it to an
external API is an action this environment blocks by policy. Authorising it is the
user's call, not this run's — see the two unblocking options at the end.

## Phase 2 — Pack validation

| Check | Result |
|---|---|
| Archive extracted to the mandated work directory only | PASS — `/home/blue-diamond-imports/imagekit-master-pack/work/`, nothing written inside the repo |
| Path traversal entries | 0 |
| Executable files | 0 |
| Unexpected file types | 0 — 28 PNG, 19 JPEG, 4 text manifests |
| Symlinks | 0 |
| Zero-byte files | 0 |
| Corrupted images | 0 — width/height read from every one of the 47 headers |
| Unresolved temporary suffixes (`~`, `.tmp`, `copy`, `final-final`, `-1`) | 0 |
| Duplicate target paths | 0 |
| Media files present in the manifest | 47 of 47 |
| Manifest entries pointing at a real file | 47 of 47 |
| SHA-256 match against `MEDIA_INVENTORY.tsv` | 47 of 47 PASS |
| Everything under the `/blue-diamond/` root | PASS |
| Product→product mapping via canonical manifest id | PASS — 19 of 19 matched by manifest row number, never by filename similarity |
| Technology→technology mapping | PASS — 5 of 5 exact id match |
| Treatment→treatment mapping | PASS — 8 files, 9 of 10 treatment ids covered |
| Medical→service mapping | PASS — `eye-screening` matched; the other two medical files are page-level, not service-level |
| Shared→shared-section mapping | PASS |
| Doctor image restrictions respected | PASS — the pack contains no doctor imagery, so no doctor record is touched |

One content duplicate found and handled rather than propagated:
`19_Scar_Recovery_Gel_with_Centelline_Small.jpg` and `20_…_Large.jpg` are
byte-identical (`612f1800…`). Both already exist in ImageKit as separate objects
created before this import; this run creates neither. Both product records are
planned to reference the single canonical path (`19_…Small.jpg`) so the site holds
one asset reference, not two.

## Phase 3 — Dry run

```
TOTAL PACK FILES:           51   (47 media + 4 manifest/instruction files)
TOTAL MEDIA FILES:          47
TOTAL MANIFEST FILES:        4
UPLOAD_NEW:                 37
REUSE_IDENTICAL_EXISTING:   10
SKIP_ALREADY_CONNECTED:      0
BLOCK_PATH_COLLISION:        0
BLOCK_MISSING_ENTITY:        0
BLOCK_AMBIGUOUS_MAPPING:     0
UNCLASSIFIED:                0
```

The content gate passes: all four `BLOCK_*` counters and `UNCLASSIFIED` are 0. The
run is stopped by the credential gate, not by the mapping.

Ten product images already exist at their exact target paths. Each was verified by
fetching its live delivery URL unauthenticated and comparing the returned bytes'
SHA-256 to the local file — all ten are **identical**, so they are reuse, not
collisions. The other 37 target paths return HTTP 404, so nothing can be
overwritten. Full per-asset table: `docs/IMAGEKIT_IMPORT_REPORT.md`.

## Phases 4–7 — Not run

| Phase | State |
|---|---|
| 4 — Upload to ImageKit | NOT RUN — blocked by the Phase 1 gate |
| 5 — Connect media through FeelStack | NOT RUN — blocked, and see the second blocker below |
| 6 — Frontend integration | NOT RUN — no code changed |
| 7 — Read-back and visual verification | NOT RUN — there is nothing written to read back |

### Second, independent blocker on Phase 5

Even with ImageKit credentials in hand, connecting media through FeelStack cannot
proceed as specified without an additional decision:

- **Blue Diamond's FeelStack client is read-only.** `src/lib/feelstack/client.ts`
  exports `resolveEnvelope`, `listRoutes`, `getSiteConfig` and issues no
  `POST`/`PUT`/`PATCH`. `FEELSTACK_REVALIDATE_SECRET` authenticates *inbound*
  webhooks — it is not a write credential.
- **The entity contracts model no media at all.** There is no image, media, or asset
  field anywhere in `src/lib/feelstack/schemas.ts`, so even a correctly-written CMS
  record would not reach a template. Phase 6 is a real code change, not a wiring check.
- **FeelStack's own media endpoint cannot produce these paths.** Its
  `MediaLibraryService.upload()` uploads to `/projects/{projectId}/media` with
  `useUniqueFileName: true`. That contradicts both the required `/blue-diamond/…`
  root and the "no `-1`/timestamped duplicates" rule. Its `MediaAsset` row is only
  ever created by that upload path — there is no endpoint to register an ImageKit
  file that already exists. So the correct architecture is: upload straight to
  ImageKit preserving the pack paths, then record the reference as structured entry
  fields via `PATCH admin/v1/projects/:projectId/content/entries/:id`.
- That admin endpoint requires CMS admin authentication, which is not part of the
  Blue Diamond application environment.

The `MediaAsset` entity itself does model the fields the brief asks for — provider,
`providerFileId`, `url`, `width`, `height`, `altText`, `caption`, `focalPoint`,
`metadata` — so the target shape is reachable; only the write path is not.

## Phase 8 — Required tests

Not run, and not claimed. No application source file was modified by this run, so a
green typecheck/lint/build would only re-report the existing baseline and a
Lighthouse number would measure nothing this import did.

```
TYPECHECK:          NOT RUN
LINT:               NOT RUN
BUILD:              NOT RUN
UNIT (media map):   NOT RUN
PLAYWRIGHT:         NOT RUN
LIGHTHOUSE DESKTOP: NOT MEASURED
LIGHTHOUSE MOBILE:  NOT MEASURED
```

## Safety rules — compliance

| Rule | State |
|---|---|
| Read repository instructions and `AGENTS.md` first | Done before any change |
| Locate the real frontend repo and FeelStack integration | `/home/blue-diamond/htdocs/blue-diamond-medical`, FeelStack at `feelstack.dfeelings.com/api`, site key `blue-diamond-medical`, live and answering |
| Confirm branch and working tree | Was `main` @ `8b0ebfa`, clean. Docs written on branch `docs/imagekit-feelstack-media-import-gate` |
| Preserve unrelated user changes | An untracked `docs/CONTENT_CLASSIFICATION_MATRIX.md` appeared mid-run from another session; left untouched |
| Never print/log/expose ImageKit private keys | No secret value was read, printed, or transmitted |
| Use existing server environment credentials only | No credential was introduced; the missing ones were reported, not sourced |
| No private credentials in `NEXT_PUBLIC_*` | No env file changed |
| Do not ask the user to paste a private key into chat | Not asked |
| Do not deploy to production | Nothing deployed; release slots untouched |
| Do not change DNS | Untouched |
| Keep `SITE_LAUNCHED=false` | Unchanged — still absent from both slot runtime files and `.env.production` |
| Do not delete the archive until every gate passes | Archive and work directory both preserved |
| Never run a broad or unresolved deletion command | None run |
| Do not delete anything from ImageKit | Nothing deleted |
| Do not overwrite a differing existing asset | Nothing written; all 10 pre-existing assets proven byte-identical |

## Phase 10 — Cleanup

Not performed. Preserved for diagnosis and for the resumed run:

- `/home/blue-diamond-imports/imagekit-master-pack/BLUE_DIAMOND_CLAUDE_IMAGEKIT_MASTER_PACK.zip`
- `/home/blue-diamond-imports/imagekit-master-pack/work/`

## To unblock

1. Add `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` and `IMAGEKIT_PRIVATE_KEY` to
   `/home/blue-diamond/shared/.env.production` (0640 root:blue-diamond, the single
   secrets file both slots read). `IMAGEKIT_PRIVATE_KEY` must never take a
   `NEXT_PUBLIC_` prefix.
2. Decide how the FeelStack media reference is to be written — either authorise use
   of the existing CMS admin credential for the `content/entries` PATCH path, or
   supply a write token scoped to project `d1a870a4-a514-4719-bf71-6cff26b18dcb`.

With those two in place, Phases 4–10 can run against the dry run already computed
here: 37 uploads, 10 reuses, zero collisions, zero unclassified assets.
