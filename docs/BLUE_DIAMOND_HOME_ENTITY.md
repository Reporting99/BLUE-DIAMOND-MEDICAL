# Home CMS Entity

**No Home entity was created. One already exists, with the correct identity, and creating another would have been the duplicate this work was told to avoid.**

## What is already there

| | EN | AR |
|---|---|---|
| id | `27da4e53-230c-4625-a7cd-bc11c8aba338` | `12e0c7ed-0a15-4ea2-abc2-409f98fa2f56` |
| title | Home | الرئيسية |
| slugSegment | `home` | `home` |
| fullPath | `/home` | `/home` |
| templateKey | `home` | `home` |
| parentId | null | null |
| status | **draft** | **draft** |
| publishedAt | null | null |
| media assignments | **0** | **0** |

**translationGroupId — shared and identical: `1753b518-0047-588b-b3cd-f01f649d3a76`** ✅

No duplicate root entity exists: `home` is the only `slugSegment` of its kind across all 34 pages, and the pair is already linked.

## What is verified

- ✅ EN Home exists, exact durable identity, not adopted fuzzily
- ✅ AR Home exists and is linked by a shared `translationGroupId`
- ✅ **Media assignments = 0 on both** — no invented homepage imagery, as required
- ✅ No stale homepage media 404s — all four dead hardcoded paths were removed; the homepage emits **zero** ImageKit requests
- ❌ Neither is published, so `/` and `/home` both return `CONTENT_NOT_FOUND`
- ❌ Canonical root routing is not configured, and **cannot currently be expressed**

## Two blockers, of different kinds

### 1. Publication — a permissions gap

Both rows are `draft`. Publishing needs `page.publish` or `content.publish`; `bd-media-import` holds `media.read`, `media.upload`, `content.write`. Prepared as operations 1–2 in `BLUE_DIAMOND_PENDING_CMS_WRITES.json`.

### 2. Root routing — an upstream capability gap

A page's path is derived, not set:

```ts
joinRoutePath(parent?.fullPath ?? null, normalizeSlugSegment(dto.slugSegment))
```

and `normalizeSlugSegment` **rejects an empty slug**:

```ts
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(...)
```

So the shortest path any page can have is `/<slug>`. **The page model cannot express a root page at all.** `CreatePageDto` has the same constraint, so this is not a data problem and no request can fix it.

Resolving it needs a FeelStack change — a `homePageId` site setting the resolver honours for `/`, or explicit root-page support in the page model. Recorded as operation 3, marked not executable by any credential. **Deliberately not hacked around**: registering a second entity at `/` to fake it would create exactly the duplicate root this document exists to prevent.

## Frontend impact today: none

The homepage renders text-and-placeholder by design. That is the decided behaviour — there is no defensible legacy homepage imagery, so none was invented. The four dead paths are gone and the components consume `ResolvedMedia` through the central adapter, so once Home is published and routed at `/`, homepage media flows automatically with **no further code change**.
