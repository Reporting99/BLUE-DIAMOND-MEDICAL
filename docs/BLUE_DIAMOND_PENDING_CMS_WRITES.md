# Pending CMS Writes (round 2)

**Status: PREPARED, NOT EXECUTED.** The authorized 36-op corrective batch is complete and is not reopened here.

Project `d1a870a4-a514-4719-bf71-6cff26b18dcb` · 4 operations.

| # | Intent | Blocked? | Required permission |
|---|---|---|---|
| 1 | `PUBLISH_HOME_EN` | YES | page.publish OR content.publish |
| 2 | `PUBLISH_HOME_AR` | YES | page.publish OR content.publish |
| 3 | `ROUTE_HOME_AT_ROOT` | YES | n/a - upstream capability gap |
| 4 | `ASSIGN_AR_TREATMENT_HERO` | NO | media.upload + content.write (this credential HOLDS both) |

## Why each is pending

### 1. PUBLISH_HOME_EN

- **Operation** `POST /admin/v1/projects/{projectId}/revisions/publish (or the page publish route)`
- **Target** page `27da4e53-230c-4625-a7cd-bc11c8aba338` · locale `en`
- **Evidence** Page exists, status=draft, publishedAt=null, templateKey=home, parentId=null. Not created by this work.
- **Reason** Home must be published before / or /home resolves publicly.
- **Blocked** YES - bd-media-import holds media.read, media.upload, content.write only
- **Idempotency key** `8b744bb8e961…`

### 2. PUBLISH_HOME_AR

- **Operation** `POST /admin/v1/projects/{projectId}/revisions/publish (or the page publish route)`
- **Target** page `12e0c7ed-0a15-4ea2-abc2-409f98fa2f56` · locale `ar`
- **Evidence** AR sibling of the same translationGroupId. status=draft.
- **Reason** EN and AR Home must publish together or the AR root has no entity.
- **Blocked** YES - same as above
- **Idempotency key** `3af0cf2da944…`

### 3. ROUTE_HOME_AT_ROOT

- **Operation** `(NO API EXISTS) canonical root routing for Home`
- **Target** page `27da4e53-230c-4625-a7cd-bc11c8aba338` · locale `en+ar`
- **Evidence** fullPath is /home. joinRoutePath(null,"home") = "/home"; normalizeSlugSegment REJECTS an empty slug (^[a-z0-9]+(?:-[a-z0-9]+)*$), so the page model cannot express a root page.
- **Reason** Requires a FeelStack change (a home-page site setting, or resolver support for a root page). Not a data fix and deliberately not hacked around.
- **Blocked** YES - CMS structural limitation, see BLUE_DIAMOND_HOME_ENTITY.md
- **Idempotency key** `1dd4076690c6…`

### 4. ASSIGN_AR_TREATMENT_HERO

- **Operation** `POST /admin/v1/projects/{projectId}/media/assignments`
- **Target** content_entry `f2ab7ca1-14b8-429d-a82a-9955fdf239a6` · locale `ar` · slot `hero`
- **Evidence** The EN sibling entity carries this exact assignment on slot hero with the same approved asset. The AR entity has 0 assignments, which is why AR resolves correctly (resolvedLocale=ar, usedFallback=false) and still shows no image.
- **Reason** Mirrors an existing, content-reviewed EN assignment. PREPARED ONLY - creating assignments was not part of the authorized 36-op batch.
- **Blocked** NO - executable, but deliberately not executed without authorization
- **Idempotency key** `f5b502104c49…`

## Resume sequence

1. `GET /auth/me` — confirm scope and project, exit before writes if either is wrong.
2. Operations 1–2 need a credential holding `page.publish` or `content.publish`. `bd-media-import` does not.
3. Operation 3 is not executable by any credential — it needs a FeelStack change first.
4. Operation 4 is executable by the current credential and is held only for lack of authorization.
5. After any write: re-resolve the affected public routes and re-run the EN/AR matrix.

