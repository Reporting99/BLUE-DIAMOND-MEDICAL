# Pending CMS Writes

**Status: PREPARED, NOT EXECUTED.** The outbound write was denied by local execution policy; no CMS mutation was attempted.

Project `d1a870a4-a514-4719-bf71-6cff26b18dcb` · 36 operations · target end state **4 approved / 34 pending** of 38.

Every operation is idempotent (`register-existing` keys on `path`, never touches provider identity) and carries an `idempotencyKey`. Required permission for all: `media.upload`. No credential or token is stored in this file.

## Resume sequence

1. `GET /auth/me` — confirm the user is `bd-media-import`, `isRoot: false`.
2. Confirm the returned `projects[]` contains **only** `d1a870a4-a514-4719-bf71-6cff26b18dcb`.
3. Load `BLUE_DIAMOND_PENDING_CMS_WRITES.json`.
4. Dry-run: assert 36 ops — 33 revert, 3 retain+alt.
5. Execute each `POST /admin/v1/projects/{projectId}/media/register-existing` with the given `body`.
6. Re-read `GET /media?limit=500`; assert **4 approved / 34 pending**.
7. Assert the 3 retained assets carry non-empty `alt.en` and `alt.ar`.
8. Re-resolve the public routes; assert unsafe assignments no longer carry media.
9. Only then unblock PR #32.

If step 1 or 2 fails, **exit before any write**.

## Operations

| # | intent | assetPath | approvalStatus | alt set | idempotencyKey |
|---|---|---|---|---|---|
| 1 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/c9dc18b80a88-AMP_4265_Social_TempSure-Vitalia-2021-Winter-A.jpg` | `pending` | — | `206a9861f68f…` |
| 2 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/85de6a3890f3-2193658276.jpg` | `pending` | — | `d42948125602…` |
| 3 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/032e5ff1a72f-marketing_materials_BA-Elite-C-Nanni-Pigment-P.jpg` | `pending` | — | `c6048293465e…` |
| 4 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/4401e594af45-marketing_materials_BA-Elite-C-Arroyo-Pigment-.jpg` | `pending` | — | `650f8063a5d1…` |
| 5 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/32a08f5eef7e-marketing_materials_BA-Elite-C-Arroyo-LegVeins.jpg` | `pending` | — | `704d37e1b94d…` |
| 6 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/b4ae0ca49cbd-Artboard-30-80-ece906b.jpg` | `pending` | — | `86078643dfed…` |
| 7 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/b9d162361abd-blob-0f3264e.jpg` | `pending` | — | `4280e829beb6…` |
| 8 | RETAIN_APPROVAL_AND_SET_ALT | `/blue-diamond/shared/legacy/b285b18977bb-CynoSure_3260_22881-edit-fusion-1-1-.jpg` | `approved` | yes | `21edccfbf342…` |
| 9 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/0552cfcc2ee8-Potenza-BA9-1--e554e12.jpg` | `pending` | — | `2cca08900b81…` |
| 10 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/b9caaf08bff8-TempSure.jpg` | `pending` | — | `7667c79b0850…` |
| 11 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/1f77e327caf9-2195655978.jpg` | `pending` | — | `a7c953d1871b…` |
| 12 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/c8c1c334d638-blob-3ecd52a.png` | `pending` | — | `0dfe77d56d28…` |
| 13 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/74eee19ab829-rs-w_388-h_388-cg_true.jpg` | `pending` | — | `9aac5edac136…` |
| 14 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/9afdb22eae69-blob-69cf67a.png` | `pending` | — | `ce6172ba09af…` |
| 15 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/5fc56004407b-rs-w_388-h_388-cg_true-m.jpg` | `pending` | — | `d950a28e5bbc…` |
| 16 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/a9428b86f341-PRD-1408-Ultra-Skin-Solutions-BNAs-Format-AMPS.jpg` | `pending` | — | `ec0c42503b43…` |
| 17 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/34ef04b9084d-loose-skin.jpg` | `pending` | — | `d4be708fe598…` |
| 18 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/497e5e99856f-Laser.jpg` | `pending` | — | `5decfc9fd7af…` |
| 19 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/668422217736-blob-7fba277.png` | `pending` | — | `dd045d99dac6…` |
| 20 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/449d1f7553e2-blob-557c03e.jpg` | `pending` | — | `d2facea4f78d…` |
| 21 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/f9ed951bc99f-blob-37f774f.jpg` | `pending` | — | `e8b5502953be…` |
| 22 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/3c02744d3973-blob-51390b6.jpg` | `pending` | — | `c162b55f449a…` |
| 23 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/f93e1ce7d2a1-blob-d49e23c.jpg` | `pending` | — | `42c02636d952…` |
| 24 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/942071178e88-blob-3a0205c.jpg` | `pending` | — | `d7f4f2246489…` |
| 25 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/ba25b0e06455-blob-7cc2b3d.png` | `pending` | — | `f37c91004d79…` |
| 26 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/5e943a11fef2-WhatsApp-Image-2024-12-30-at-17.06.09.jpg` | `pending` | — | `5d7d42c43b9d…` |
| 27 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/f7da3cc5523f-3P0A4127.JPG` | `pending` | — | `a9c7b75daccb…` |
| 28 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/909b70250b4d-blob-0846d7f.jpg` | `pending` | — | `0150f7723a12…` |
| 29 | RETAIN_APPROVAL_AND_SET_ALT | `/blue-diamond/shared/legacy/094975f21717-Dr.Farhat.jpg` | `approved` | yes | `fa0fdb77b8da…` |
| 30 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/8fa9d90bed96-Laser-Treatment.jpg` | `pending` | — | `b9110c753933…` |
| 31 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/79540590d219-TempSure-Envi-Static-Social-Asset-4.jpg` | `pending` | — | `2256157e98f8…` |
| 32 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/1b1eeffe8030-CynoSure_3260_22881-edit-fusion-1-1-.jpg` | `pending` | — | `83af82804f0f…` |
| 33 | RETAIN_APPROVAL_AND_SET_ALT | `/blue-diamond/shared/legacy/93525704bb66-BNG8ZRE.jpg` | `approved` | yes | `e86ba6858e79…` |
| 34 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/76caba2a8de2-3P0A4130.JPG` | `pending` | — | `41e94e6d22e4…` |
| 35 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/c9c0df29294d-blob-c70c5e7.png` | `pending` | — | `a1476efefaf6…` |
| 36 | REVERT_BULK_APPROVAL | `/blue-diamond/shared/legacy/7082f5625e91-blob-856535b.jpg` | `pending` | — | `8880c15f7ae7…` |

## Not included

No assignment create/disable, no entity create, no publish, no delete. Those remain review-gated in `BLUE_DIAMOND_MEDIA_APPROVAL_REVIEW.md` and `BLUE_DIAMOND_MEDIA_ASSIGNMENT_GAPS.md`.

